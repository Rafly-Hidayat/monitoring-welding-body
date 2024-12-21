import { ResponseError } from "../err/err-response.js"

const validation = (schema, request) => {
    const result = schema.validate(request, {
        abortEarly: false,
        allowUnknown: false,
    })
    if (result.error) {
        throw new ResponseError(400, result.error.message)
    } else {
        return result.value
    }
}

export { validation }