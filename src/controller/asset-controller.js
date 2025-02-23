import moment from "moment";
import assetService from "../services/asset-service.js";

const createAsset = async (req, res, next) => {
    try {
        const result = await assetService.createAsset(req.body)
        res.status(201).json({
            message: "Successfully created asset",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const getAllAssets = async (req, res, next) => {
    try {
        const result = await assetService.getAllAssets()
        res.status(200).json({
            message: "Successfully retrieved all assets",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const getAssetById = async (req, res, next) => {
    try {
        const result = await assetService.getAssetById(req.params.id)
        res.status(200).json({
            message: "Successfully retrieved asset",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const updateAsset = async (req, res, next) => {
    try {
        const result = await assetService.updateAsset(req.body)
        res.status(200).json({
            message: "Successfully updated asset",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const deleteAsset = async (req, res, next) => {
    try {
        await assetService.deleteAsset(req.params.id)
        res.status(200).json({
            message: "Successfully deleted asset",
            data: {
                id: req.params.id,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        })
    } catch (error) {
        next(error);
    }
}

const resetCycle = async (req, res, next) => {
    try {
        const result = await assetService.resetCycle(req.body)
        res.status(200).json({
            message: "Successfully reset cycle",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const resetOhcCondition = async (req, res, next) => {
    try {
        const result = await assetService.resetOhcCondition(req.body)
        res.status(200).json({
            message: "Successfully reset Ohc Condition",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

const resetSpCondition = async (req, res, next) => {
    try {
        const result = await assetService.resetSpCondition(req.body)
        res.status(200).json({
            message: "Successfully reset Sp Condition",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export default { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset, resetCycle, resetOhcCondition, resetSpCondition }