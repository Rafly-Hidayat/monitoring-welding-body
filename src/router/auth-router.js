import express from "express";
import userController from "../controller/user-controller.js";

const authRouter = express.Router();

authRouter.post("/login", userController.login);

export default authRouter;
