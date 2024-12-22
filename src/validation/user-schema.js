import joi from 'joi';

const createUserValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    username: joi.string().required(),
    password: joi.string().required(),
    role: joi.string().valid("admin", "operation").default("operation").optional(),
})

const updateUserValidation = joi.object({
    id: joi.string().required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    username: joi.string().required(),
    password: joi.string().required(),
})

const loginUserValidation = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
})

export { createUserValidation, updateUserValidation, loginUserValidation }
