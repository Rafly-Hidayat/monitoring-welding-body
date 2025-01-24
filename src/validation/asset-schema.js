import joi from 'joi';

const createAssetValidation = joi.object({
    assetId: joi.string().required(),
    ceCd: joi.string().required(),
    partCd: joi.string().required(),
    tagCd: joi.string().required(),
    type: joi.string().required(),
    comment: joi.string().allow(null, ''),
    value: joi.string().required(),
})

const updateAssetValidation = joi.object({
    ceCd: joi.string().required(),
    partCd: joi.string().required(),
    tagCd: joi.string().required(),
    type: joi.string().required(),
    comment: joi.string().allow(null, ''),
    value: joi.string().required(),
})

export { createAssetValidation, updateAssetValidation }
