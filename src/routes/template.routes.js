import { Router } from "express";

const router = Router();

router.route("/home").get((req, res) => {
  res.render("home");
});

router.route("/user/signup").get((req, res) => {
  res.render("signup");
});

router.route("/user/login").get((req, res) => {
  res.render("login");
});

export default router;
