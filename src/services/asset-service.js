import prisma from "../database.js"
import moment from 'moment-timezone';
import { ResponseError } from "../err/err-response.js"
import { createAssetValidation, resetCycleValidation, updateAssetValidation } from "../validation/asset-schema.js"
import { validation } from "../validation/validation.js"
import ohcService from "./ohc-service.js";
import 'moment/locale/id.js';
import dataHelper from "../helper/data-helper.js";

moment.tz.setDefault("Asia/Jakarta");

const createAsset = async (request) => {
    const data = validation(createAssetValidation, request)

    const asset = await prisma.asset.findFirst({
        where: { assetId: data.assetId }
    })

    if (asset) {
        throw new ResponseError(409, "Asset id already in use")
    }

    return prisma.asset.create({ data })
}

const getAllAssets = async () => {
    return prisma.asset.findMany({})
}

const getAssetById = async (ulid) => {
    const asset = await prisma.asset.findUnique({
        where: { ulid }
    })

    if (!asset) {
        throw new ResponseError(404, "Asset not found")
    }

    return asset
}

const updateAsset = async (request) => {
    const data = validation(updateAssetValidation, request)

    const asset = await prisma.asset.findFirst({
        where: { tagCd: data.tagCd }
    })

    if (!asset) {
        throw new ResponseError(404, "Asset not found")
    }

    const oldValue = asset.value;
    const newValue = data.value;
    const valueChanges = []

    delete data.id

    const updateAsset = await prisma.asset.update({
        where: { id: asset.id },
        data
    })

    const sp = await prisma.sp.findFirst({
        where: { assetTagCd: updateAsset.tagCd }
    });

    if (sp) {
        const ohc = await prisma.ohc.findFirst({
            where: { name: `OHC ${updateAsset.value}` }
        });
        const ohcId = ohc?.id || null;
        await prisma.sp.update({
            where: { id: sp.id },
            data: { ohcId }
        })
    }
    await createWarningRecords()

    valueChanges.push({
        groupName: '',
        tagCd: data.tagCd,
        oldValue,
        newValue,
        changed: oldValue !== newValue
    });

    await processConditionUpdates(valueChanges, dataHelper.sensorConditionMapping);
    if (dataHelper.cycleAsset.includes(data.tagCd)) {
        await processCycleUpdates(valueChanges, dataHelper.sensorCycleMapping);
    }

    return updateAsset;
}

const createWarningRecords = async () => {
    const { MOTOR_CURRENT, MOTOR_TEMP } = ohcService.MONITORING_CONFIG.THRESHOLDS;
    const ohcs = await prisma.ohc.findMany({
        orderBy: { name: 'asc' },
        include: {
            asset: true,
            sp: true,
            cycle: { include: { cycleDescription: true } },
            ohcConditions: true,
            currentMotorLifterAsset: { select: { value: true } },
            currentMotorTransferAsset: { select: { value: true } },
            tempMotorLifterAsset: { select: { value: true } },
            tempMotorTransferAsset: { select: { value: true } },
        }
    });

    const currentDate = moment();
    const warningRecords = [];

    for (const ohc of ohcs) {
        let type = null
        if (Number(ohc.currentMotorLifterAsset.value) > MOTOR_CURRENT.MAX) {
            type = 'High Current Motor Lifter';
        }
        if (Number(ohc.currentMotorTransferAsset.value) > MOTOR_CURRENT.MAX) {
            type = 'High Current Motor Transfer';
        }
        if (Number(ohc.tempMotorLifterAsset.value) > MOTOR_TEMP.MAX) {
            type = 'High Temp Motor Lifter';
        }
        if (Number(ohc.tempMotorTransferAsset.value) > MOTOR_TEMP.MAX) {
            type = 'High Temp Motor Transfer'
        }
        if (type) {
            const warningRecord = {
                date: currentDate.format('DD'),
                month: currentDate.format('MMMM'),
                year: currentDate.format('YYYY'),
                type,
                detail: ohc.name,
            };
            warningRecords.push(warningRecord);
        }
    }

    if (warningRecords.length > 0) {
        await prisma.warningRecord.createMany({
            data: warningRecords,
        });
    }
};

const deleteAsset = async (ulid) => {
    const asset = await prisma.asset.findUnique({
        where: { ulid }
    })

    if (!asset) {
        throw new ResponseError(404, "Asset not found")
    }

    return prisma.asset.delete({
        where: { id: asset.id }
    })
}

const getRandomIntInclusive = (min, max) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

const getRandomVariation = (base, range) => {
    return Math.floor(base + (Math.random() * range * 2 - range));
};

const updateAssetInterval = async () => {
    // SP Location updates
    const sps = [
        'EM1001', 'EM1015', 'EM1021', 'EM1004', 'EM1007', 'EM100B', 'EM101E',
        'EM100F', 'EM1011', 'EM101C', 'EM101A'
    ];
    await updateOhcAssignments(sps);

    // Sensor updates for different locations
    const allSensors = {
        sp1: ['X700', 'X701', 'X702', 'X703'],
        sp7: ['X740', 'X741', 'X742', 'X743', 'X750', 'X751', 'X752'],
        sp8: ['X7A8', 'X7A9', 'X7AA', 'X7AB', 'X7B1', 'X7B2'],
        ohc1: [
            'X020', 'X021', 'X022', 'X023', 'X024', 'X025',
            'X026', 'X027', 'X028', 'X029', 'X02A', 'X02B',
            'X02C', 'X02D', 'X02E', 'X02F',
        ],
    };
    const changes = await processSensorUpdates(allSensors);

    await processCycleUpdates(changes, dataHelper.sensorCycleMapping);
};

async function updateOhcAssignments(sps) {
    const usedValues = new Set();
    const ohcs = await prisma.ohc.findMany({
        where: {
            name: {
                in: Array.from({ length: 6 }, (_, i) => `OHC ${i + 1}`)
            }
        }
    });

    const ohcMap = new Map(ohcs.map(ohc => [ohc.name, ohc]));

    for (const tagCd of sps) {
        try {
            // Generate a new unique value
            let newValue = 0;
            const availableValues = new Set([1, 2, 3, 4, 5, 6]);

            // Remove used values from available options
            for (const usedValue of usedValues) {
                availableValues.delete(usedValue);
            }

            // If there are available values, randomly select one
            if (availableValues.size > 0) {
                const availableArray = Array.from(availableValues);
                const randomIndex = Math.floor(Math.random() * availableArray.length);
                newValue = availableArray[randomIndex];
                usedValues.add(newValue);
            }
            // Otherwise, newValue remains 0

            const ohcName = `OHC ${newValue}`;
            const ohc = ohcMap.get(ohcName);
            if (!ohc) {
                console.warn(`OHC not found: ${ohcName}`);
            }
            const ohcId = ohc?.id || null;

            // Find the SP record
            const sp = await prisma.sp.findFirst({
                where: { assetTagCd: tagCd }
            });

            if (!sp) {
                console.warn(`SP not found for asset tag: ${tagCd}`);
                continue;
            }

            // Update OHC metrics with random variations
            if (ohcId) {
                await prisma.ohc.update({
                    where: { id: ohcId },
                    data: {
                        condition: 'No Body',
                        cycleTime: getRandomVariation(98, 5),
                        currentMotorLifter: getRandomVariation(230, 20),
                        currentMotorTransfer: getRandomVariation(150, 15),
                        tempMotorLifter: getRandomVariation(60, 5),
                        tempMotorTransfer: getRandomVariation(40, 5),
                        okCondition: Math.floor(getRandomVariation(843, 50)),
                        ngCondition: Math.floor(getRandomVariation(157, 20))
                    }
                });
            }

            // Update SP with new OHC assignment
            await prisma.sp.update({
                where: { id: sp.id },
                data: { ohcId }
            });

            // Update asset value
            await prisma.asset.update({
                where: { tagCd },
                data: { value: newValue.toString() }
            });
        } catch (error) {
            console.error(`Error updating assignments for asset ${tagCd}:`, error);
        }
    }
}

const processSensorUpdates = async (allSensors) => {
    const valueChanges = [];

    for (const [groupName, sensors] of Object.entries(allSensors)) {
        // Ambil data current untuk semua sensor dalam group
        const currentAssets = await prisma.asset.findMany({
            where: {
                tagCd: {
                    in: sensors
                }
            },
            select: {
                tagCd: true,
                value: true
            }
        });

        // Buat map untuk mempermudah akses nilai lama
        const currentValuesMap = new Map(
            currentAssets.map(asset => [asset.tagCd, asset.value])
        );

        // Lakukan update dan tracking perubahan
        for (const tagCd of sensors) {
            const oldValue = currentValuesMap.get(tagCd);
            const newValue = getRandomIntInclusive(0, 1).toString();

            // Simpan update ke database
            await prisma.asset.update({
                where: { tagCd },
                data: { value: newValue }
            });

            // Catat perubahan nilai
            valueChanges.push({
                groupName,
                tagCd,
                oldValue,
                newValue,
                changed: oldValue !== newValue
            });
        }
    }

    return valueChanges;
};

const processCycleUpdates = async (changes, sensorCycleMapping) => {
    const cycleCache = new Map();
    const updateLog = [];

    for (const change of changes) {
        if (!change.changed) continue;

        const mapping = sensorCycleMapping[change.tagCd];
        if (!mapping) continue;

        // Cek kondisi perubahan
        const { condition } = mapping;
        if (change.oldValue !== condition.from || change.newValue !== condition.to) {
            continue;
        }

        try {
            const { cycleName, descriptionName } = mapping;

            // Get cycle from cache or database
            let cycle = cycleCache.get(cycleName);
            if (!cycle) {
                cycle = await prisma.cycle.findFirst({
                    where: { name: cycleName },
                    include: { cycleDescription: true }
                });

                if (!cycle) {
                    throw new Error(`Cycle ${cycleName} not found`);
                }

                cycleCache.set(cycleName, cycle);
            }

            const description = cycle.cycleDescription.find(item => item.name === descriptionName);
            if (!description) {
                throw new Error(`Description ${descriptionName} not found in cycle ${cycleName}`);
            }

            // Update description
            const updatedDescription = await prisma.cycleDescription.update({
                where: { id: description.id },
                data: { actualValue: description.actualValue + 1 }
            });

            updateLog.push({
                tagCd: change.tagCd,
                cycleName,
                descriptionName,
                oldValue: description.actualValue,
                newValue: updatedDescription.actualValue,
                timestamp: new Date()
            });

        } catch (error) {
            console.error(`Error processing change for ${change.tagCd}:`, error);
        }
    }

    return updateLog;
};

const processConditionUpdates = async (changes, sensorConditionMapping) => {
    const conditionCache = new Map();

    for (const change of changes) {
        if (!change.changed) continue;

        const mapping = sensorConditionMapping[change.tagCd];
        if (!mapping) continue;

        // Cek kondisi perubahan
        const { condition } = mapping;
        if (change.oldValue !== condition.from || change.newValue !== condition.to) {
            continue;
        }

        try {
            const { conditionName, descriptionName } = mapping;

            // Get condition from cache or database
            let condition = conditionCache.get(conditionName);
            if (dataHelper.spConditionAsset.includes(change.tagCd)) {
                if (!condition) {
                    condition = await prisma.spCondition.findFirst({
                        where: { name: descriptionName },
                    });

                    if (!condition) {
                        throw new Error(`condition ${conditionName} not found`);
                    }

                    conditionCache.set(conditionName, condition);
                }

                // Update description
                await prisma.spCondition.update({
                    where: { id: condition.id },
                    data: { actualValue: condition.actualValue + 1 }
                });
            } else if (dataHelper.ohcConditionAsset.includes(change.tagCd)) {
                if (!condition) {
                    condition = await prisma.ohcCondition.findFirst({
                        where: { name: descriptionName },
                    });

                    if (!condition) {
                        throw new Error(`condition ${conditionName} not found`);
                    }

                    conditionCache.set(conditionName, condition);
                }

                // Update description
                await prisma.ohcCondition.update({
                    where: { id: condition.id },
                    data: { actualValue: condition.actualValue + 1 }
                });
            }
        } catch (error) {
            console.error(`Error processing change for ${change.tagCd}:`, error);
        }
    }
};

const resetCycle = async (request) => {
    const data = validation(resetCycleValidation, request)

    const cycle = await prisma.cycleDescription.findUnique({
        where: { id: data.id }
    })

    if (!cycle) {
        throw new ResponseError(404, "Cycle not found")
    }

    return prisma.cycleDescription.update({
        where: { id: data.id },
        data: { actualValue: 0 }
    })
}

const resetOhcCondition = async (request) => {
    const data = validation(resetCycleValidation, request)

    const ohcCondition = await prisma.ohcCondition.findUnique({
        where: { id: data.id }
    })

    if (!ohcCondition) {
        throw new ResponseError(404, "ohc Condition not found")
    }

    return prisma.ohcCondition.update({
        where: { id: data.id },
        data: { actualValue: 0 }
    })
}

const resetSpCondition = async (request) => {
    const data = validation(resetCycleValidation, request)

    const spCondition = await prisma.spCondition.findUnique({
        where: { id: data.id }
    })

    if (!spCondition) {
        throw new ResponseError(404, "sp Condition not found")
    }

    return prisma.spCondition.update({
        where: { id: data.id },
        data: { actualValue: 0 }
    })
}

export default { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset, updateAssetInterval, resetCycle, processCycleUpdates, processConditionUpdates, resetOhcCondition, resetSpCondition }