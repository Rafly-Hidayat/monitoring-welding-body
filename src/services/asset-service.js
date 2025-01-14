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

    delete data.id

    return prisma.asset.update({
        where: { id: asset.id },
        data
    })
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

const updateAssetInterval = async () => {
    const sps = [
        'EM1001',
        'EM1004',
        'EM1007',
        'EM100B',
        'EM100F',
        'EM1011',
        'EM1015',
        'EM101C',
        'EM1021',
    ];

    const updateSps = async () => {
        // Update each SP asset with a random value
        const updatePromises = sps.map(tagCd =>
            prisma.asset.update({
                where: {
                    tagCd: tagCd
                },
                data: {
                    value: getRandomIntInclusive(0, 6).toString()
                }
            })
        );

        // Execute all updates in parallel
        const results = await Promise.all(updatePromises);
        return results;
    }

    const allSensors = {
        sp1: ['X700', 'X701', 'X702', 'X703'],
        sp7: ['X740', 'X741', 'X742', 'X743', 'X750', 'X751', 'X752'],
        sp8: ['X7A8', 'X7A9', 'X7AA', 'X7AB', 'X7B1', 'X7B2'],
        ohc1: [
            'X020',
            'X021',
            'X022',
            'X023',
            'X024',
            'X025',
            'X026',
            'X027',
            'X028',
            'X029',
            'X02A',
            'X02B',
            'X02C',
            'X02D',
            'X02E',
            'X02F',
        ],
    }

    for (const [groupName, sensors] of Object.entries(allSensors)) {
        for (const tagCd of sensors) {
            await prisma.asset.update({
                where: { tagCd },
                data: {
                    value: getRandomIntInclusive(0, 1).toString()
                }
            });
        }
        console.log(`Updated ${groupName} sensors`);
    }
}

export default { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset }
