import joi from 'joi';

const createAssetValidation = joi.object({
    assetId: joi.string().required(),
    ceCd: joi.string().required(),
    partCd: joi.string().required(),
    tagCd: joi.string().required(),
    value: joi.string().required(),
})

const updateAssetValidation = joi.object({
    id: joi.string().required(),
    assetId: joi.string().required(),
    ceCd: joi.string().required(),
    partCd: joi.string().required(),
    tagCd: joi.string().required(),
    value: joi.string().required(),
})

export { createAssetValidation, updateAssetValidation }
