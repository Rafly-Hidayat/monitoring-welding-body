import express from "express";
import userController from "../controller/user-controller.js";
import assetController from "../controller/asset-controller.js";
import { hasPermission } from "../middleware/auth-middleware.js";
import ohcController from "../controller/ohc-controller.js";

const router = express.Router();

// User routes
router.get("/users", userController.getAllUsers);
router.get("/user/:id", userController.getUserById);
router.post("/user", userController.createUser);
router.put("/user", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);

// Asset routes
router.get("/assets", assetController.getAllAssets);
router.get("/asset/:id", assetController.getAssetById);
router.post("/asset", assetController.createAsset);
router.put("/asset", assetController.updateAsset);
router.delete("/asset/:id", assetController.deleteAsset);
router.post("/cycle/reset", assetController.resetCycle);

// OHC service
router.get("/monitoring", ohcController.getOHCMetrics);

export default router;