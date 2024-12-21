import express from "express";
import cors from "cors";
import router from "./router/router.js";
import authRouter from "./router/auth-router.js";
import { errorMiddleware } from "./middleware/err-middleware.js";
import { verifyToken } from "./middleware/auth-middleware.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
};
app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/api", verifyToken, router);

app.use(errorMiddleware)
app.use("*", function (req, res) {
    res.status(404).send("PAGE NOT FOUND");
});

app.listen(port, () => console.log(`App listening on ${port}`));
