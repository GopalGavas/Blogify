import { Router } from "express";
import {
  registerUser,
  updatePassword,
  updateUserCoverImage,
  userLogin,
  userLogout,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

// SignUp routes
router.route("/signup").post(upload.single("coverImage"), registerUser);
router.route("/signup").get((req, res) => {
  return res.render("signup"); // EJS template for singup
});

// Login routes
router.route("/login").post(userLogin);
router.route("/login").get((req, res) => {
  return res.render("login"); // EJS template for login
});

// Logout routes
router.route("/logout").get(verifyjwt, userLogout);

// Update CoveImage routes
router
  .route("/update-coverImage")
  .post(verifyjwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/update-coverImage").get(verifyjwt, (req, res) => {
  return res.render("updateCoverImage", { user: req.user }); // EJS template for update-coverImage
});

// Update Password
router.route("/update-password").post(verifyjwt, updatePassword);
router.route("/update-password").get(verifyjwt, (req, res) => {
  return res.render("updatePassword", { user: req.user });
});

export default router;
