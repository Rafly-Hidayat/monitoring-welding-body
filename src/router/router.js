import express from "express";
import userController from "../controller/user-controller.js";
import assetController from "../controller/asset-controller.js";
import { hasPermission } from "../middleware/auth-middleware.js";
import ohcController from "../controller/ohc-controller.js";

const router = express.Router();

// User routes
router.get("/users", hasPermission("user.read"), userController.getAllUsers);
router.get("/user/:id", hasPermission("user.show"), userController.getUserById);
router.post("/user", hasPermission("user.create"), userController.createUser);
router.put("/user", hasPermission("user.update"), userController.updateUser);
router.delete("/user/:id", hasPermission("user.delete"), userController.deleteUser);

// Asset routes
router.get("/assets", hasPermission("asset.read"), assetController.getAllAssets);
router.get("/asset/:id", hasPermission("asset.show"), assetController.getAssetById);
router.post("/asset", hasPermission("asset.create"), assetController.createAsset);
router.put("/asset", hasPermission("asset.update"), assetController.updateAsset);
router.delete("/asset/:id", hasPermission("asset.delete"), assetController.deleteAsset);

// OHC service
router.get("/monitoring", ohcController.getOHCMetrics);

export default router;