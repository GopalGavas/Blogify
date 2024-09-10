import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/:blogId").post(verifyjwt, createComment);

export default router;
