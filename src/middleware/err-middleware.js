import { ResponseError } from "../err/err-response.js"

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next()
        return
    }
    console.log("Error: ", err)

    if (err instanceof ResponseError) {
        res.status(err.status).json({
            errors: err.message
        }).end()
    } else {
        res.status(500).json({
            errors: err.message
        }).end()
    }
}

export { errorMiddleware }

