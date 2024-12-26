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

export default { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset }
