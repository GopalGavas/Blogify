import { Router } from "express";
import {
  registerUser,
  userLogin,
  userLogout,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signup").post(upload.single("coverImage"), registerUser);
router.route("/login").post(userLogin);
router.route("/logout").get(verifyjwt, userLogout);

export default router;
