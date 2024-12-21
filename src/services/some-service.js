import prisma from "../database.js"
import { ResponseError } from "../err/err-response.js"
import { someValidation } from "../validation/some-schema.js"
import { validation } from "../validation/validation.js"

const someService = async (request) => {
    const data = validation(someValidation, request)
}

export default { someService }
