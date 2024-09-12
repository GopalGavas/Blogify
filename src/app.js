import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";

const app = express();

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set 'secure: true' in production when using HTTPS
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

// Routes
import userRouter from "./routes/user.routes.js";
import blogRouter from "./routes/blog.routes.js";
import commentRouter from "./routes/comment.routes.js";
import templateRouter from "./routes/template.routes.js";

app.use("/user", userRouter);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/", templateRouter);

export { app };
