import joi from 'joi';

const someValidation = joi.object({
    someValue: joi.string().required(),
})

export { someValidation }
