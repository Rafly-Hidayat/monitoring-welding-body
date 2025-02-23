import joi from 'joi';

const updateCycleValidation = joi.object({
    isOhc: joi.boolean().required(),
    ohc: joi.number().valid(1, 2, 3, 4, 5, 6).when('isOhc', {
        is: true,
        then: joi.required(),
        otherwise: joi.optional(),
    }),
    tagCd: joi.string().required(),
    value: joi.string().required(),
});

export { updateCycleValidation }
