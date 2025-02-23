import joi from 'joi';

const updateCycleValidation = joi.object({
    ohc: joi.number().valid(1, 2, 3, 4, 5, 6).required(),
    tagCd: joi.string().required(),
    value: joi.string().required(),
})

export { updateCycleValidation }
