import express from "express";
import userController from "../controller/user-controller.js";
import { hasPermission } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/users", hasPermission("user.read"), userController.getAllUsers);
router.get("/user/:id", hasPermission("user.show"), userController.getUserById);
router.post("/user", hasPermission("user.create"), userController.createUser);
router.put("/user", hasPermission("user.update"), userController.updateUser);
router.delete("/user/:id", hasPermission("user.delete"), userController.deleteUser);

export default router;