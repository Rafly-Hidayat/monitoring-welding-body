import moment from "moment";
import userService from "../services/user-service.js";

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body)
        res.status(200).json({
            message: "Successfully logged in",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const result = await userService.createUser(req.body)
        res.status(201).json({
            message: "Successfully created user",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers()
        res.status(200).json({
            message: "Successfully retrieved all users",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const getUserById = async (req, res, next) => {
    try {
        const result = await userService.getUserById(req.params.id)
        res.status(200).json({
            message: "Successfully retrieved user",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const result = await userService.updateUser(req.body)
        res.status(200).json({
            message: "Successfully updated user",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id)
        res.status(200).json({
            message: "Successfully deleted user",
            data: {
                id: req.params.id,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        })
    } catch (error) {
        next(error);
    }
}

export default { login, createUser, getAllUsers, getUserById, updateUser, deleteUser }