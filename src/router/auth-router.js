import someController from "../controller/some-controller.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/some-endpoint", someController.someController);

export default authRouter;
