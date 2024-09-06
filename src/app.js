import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";

app.use("/user", userRouter);

export { app };
