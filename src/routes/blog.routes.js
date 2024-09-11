import { Router } from "express";
import { optionalVerifyJWT } from "../middleware/auth.middleware.js";
import { createBlog, getBlogById } from "../controllers/blog.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/add-new").get(optionalVerifyJWT, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router
  .route("/")
  .post(optionalVerifyJWT, upload.single("coverImage"), createBlog);

router.route("/:blogId").get(optionalVerifyJWT, getBlogById);

export default router;
