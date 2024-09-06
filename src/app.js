import cookieParser from "cookie-parser";
import express from "express";
import path from "path";

const app = express();

app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

// Routes
import userRouter from "./routes/user.routes.js";
import templateRouter from "./routes/template.routes.js";

app.use("/user", userRouter);
app.use("/", templateRouter);

export { app };
