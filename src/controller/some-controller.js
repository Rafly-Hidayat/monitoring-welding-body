import someService from "../services/some-service.js";

const someController = async (req, res, next) => {
    try {
        const result = await someService.someService(req.body)
        res.status(200).json({
            message: "some message",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export default { someController }
