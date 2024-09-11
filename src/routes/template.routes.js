import { Router } from "express";
import { optionalVerifyJWT, verifyjwt } from "../middleware/auth.middleware.js";
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

export default router;
