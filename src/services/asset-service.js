import prisma from "../database.js"
import { ResponseError } from "../err/err-response.js"
import { createAssetValidation, updateAssetValidation } from "../validation/asset-schema.js"
import { validation } from "../validation/validation.js"

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

    const asset = await prisma.asset.findUnique({
        where: { ulid: data.id }
    })

    if (!asset) {
        throw new ResponseError(404, "Asset not found")
    }
    const sensorCycleMapping = {
        // SP1
        'X700': {
            cycleName: 'Cycle SP1',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X702': {
            cycleName: 'Cycle SP1',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },

        // SP7
        'X740': {
            cycleName: 'Cycle SP7',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X742': {
            cycleName: 'Cycle SP7',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },
        'X751': {
            cycleName: 'Cycle SP7',
            descriptionName: 'Pusher',
            condition: { from: "0", to: "1" }
        },

        // SP8
        'X7A8': {
            cycleName: 'Cycle SP8',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X7AA': {
            cycleName: 'Cycle SP8',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },

        // OHC1
        'X021': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Lift Up',
            condition: { from: "0", to: "1" }
        },
        'X025': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Lift Down',
            condition: { from: "1", to: "0" }
        },
        'X022': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Collision',
            condition: { from: "0", to: "1" }
        },
        'X026': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger L Close',
            condition: { from: "1", to: "0" }
        },
        'X027': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger L Open',
            condition: { from: "0", to: "1" }
        },
        'X028': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger R Close',
            condition: { from: "1", to: "0" }
        },
        'X029': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger R Open',
            condition: { from: "0", to: "1" }
        },
        'X02A': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault FL',
            condition: { from: "0", to: "1" }
        },
        'X02B': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault FR',
            condition: { from: "0", to: "1" }
        },
        'X02C': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'HangChain Fault RL',
            condition: { from: "0", to: "1" }
        },
        'X02D': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault RR',
            condition: { from: "0", to: "1" }
        },
    };

    const oldValue = asset.value;
    const newValue = data.value;
    const valueChanges = []

    delete data.id

    const updateAsset = await prisma.asset.update({
        where: { id: asset.id },
        data
    })

    valueChanges.push({
        groupName: '',
        tagCd: data.tagCd,
        oldValue,
        newValue,
        changed: oldValue !== newValue
    });

    await processCycleUpdates(valueChanges, sensorCycleMapping);

    return updateAsset;
}

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
        'EM1001', 'EM1004', 'EM1007', 'EM100B',
        'EM100F', 'EM1011', 'EM1015', 'EM101C', 'EM1021',
    ];

    let oldValue = 0;
    // Update each SP asset with a random OHC assignment
    const updatePromises = sps.map(async (tagCd) => {
        let value = getRandomIntInclusive(0, 6);
        if (value >= 1 && value <= 6) oldValue++
        value = oldValue === 6 ? "0" : value.toString()
        // Find corresponding OHC
        const ohc = await prisma.ohc.findFirst({
            where: { name: `OHC${value}` }
        });

        if (ohc) {
            // Update OHC metrics - only updating the base values, not the calculations
            await prisma.ohc.update({
                where: { id: ohc.id },
                data: {
                    condition: 'No Body',
                    cycleTime: getRandomVariation(98, 5),
                    currentMotorLifter: getRandomVariation(230, 20),
                    currentMotorTransfer: getRandomVariation(150, 15),
                    tempMotorLifter: getRandomVariation(60, 5),
                    tempMotorTransfer: getRandomVariation(40, 5),
                    okCondition: Math.floor(getRandomVariation(843, 50)),
                    ngCondition: Math.floor(getRandomVariation(157, 20)),
                }
            });
        }

        return prisma.asset.update({
            where: { tagCd: tagCd },
            data: { value }
        });
    });

    // Execute SP updates
    await Promise.all(updatePromises);

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

    const sensorCycleMapping = {
        // SP1
        'X700': {
            cycleName: 'Cycle SP1',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X702': {
            cycleName: 'Cycle SP1',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },

        // SP7
        'X740': {
            cycleName: 'Cycle SP7',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X742': {
            cycleName: 'Cycle SP7',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },
        'X751': {
            cycleName: 'Cycle SP7',
            descriptionName: 'Pusher',
            condition: { from: "0", to: "1" }
        },

        // SP8
        'X7A8': {
            cycleName: 'Cycle SP8',
            descriptionName: 'STOPPER',
            condition: { from: "0", to: "1" }
        },
        'X7AA': {
            cycleName: 'Cycle SP8',
            descriptionName: 'POSITIONER',
            condition: { from: "0", to: "1" }
        },

        // OHC1
        'X021': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Lift Up',
            condition: { from: "0", to: "1" }
        },
        'X025': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Lift Down',
            condition: { from: "1", to: "0" }
        },
        'X022': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Collision',
            condition: { from: "0", to: "1" }
        },
        'X026': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger L Close',
            condition: { from: "1", to: "0" }
        },
        'X027': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger L Open',
            condition: { from: "0", to: "1" }
        },
        'X028': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger R Close',
            condition: { from: "1", to: "0" }
        },
        'X029': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Hanger R Open',
            condition: { from: "0", to: "1" }
        },
        'X02A': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault FL',
            condition: { from: "0", to: "1" }
        },
        'X02B': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault FR',
            condition: { from: "0", to: "1" }
        },
        'X02C': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'HangChain Fault RL',
            condition: { from: "0", to: "1" }
        },
        'X02D': {
            cycleName: 'Cycle OHC1',
            descriptionName: 'Chain Fault RR',
            condition: { from: "0", to: "1" }
        },
    };
    await processCycleUpdates(changes, sensorCycleMapping);
};

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

        // Log semua perubahan
        console.log(`${change.tagCd}: ${change.oldValue} -> ${change.newValue}`);

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

    console.log(updateLog)
    return updateLog;
};

export default { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset, updateAssetInterval }
