import { Router } from "express";
import { optionalVerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/home").get(optionalVerifyJWT, (req, res) => {
  res.render("home", {
    message: "Request Processed",
    user: req.user || null,
  });
});

router.route("/user/signup").get((req, res) => {
  res.render("signup");
});

router.route("/user/login").get((req, res) => {
  res.render("login");
});

export default router;
