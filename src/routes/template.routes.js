import { Router } from "express";
import { optionalVerifyJWT } from "../middleware/auth.middleware.js";
import { Blog } from "../models/blog.model.js";

const router = Router();

// User routes
router.route("/home").get(optionalVerifyJWT, async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("home", {
    message: "Request Processed",
    user: req.user || null,
    blogs: allBlogs,
  });
});

router.route("/user/signup").get((req, res) => {
  return res.render("signup");
});

router.route("/user/login").get((req, res) => {
  return res.render("login");
});

export default router;
