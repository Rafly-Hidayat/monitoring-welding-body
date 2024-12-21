import someController from "../controller/some-controller.js";
import express from "express";

const router = express.Router();

router.post("/some-endpoint", someController.someController);

export default router;
