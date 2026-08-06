import express from "express";
const router = express.Router();
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  sendOTP,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-otp", sendOTP);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
