// routes/authRouter.js
import express from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  refreshToken,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * ===================================
 * 🔐 AUTHENTICATION & USER SECURITY
 * ===================================
 */
router.post("/register", rateLimiter(10, 15 * 60 * 1000), register);
router.post("/verify-otp", rateLimiter(30, 15 * 60 * 1000), verifyOTP);
router.post("/resend-otp", rateLimiter(10, 15 * 60 * 1000), resendOTP);
router.post("/login", rateLimiter(50, 15 * 60 * 1000), login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);

// Password Management
router.post("/password/forgot", rateLimiter(10, 15 * 60 * 1000), forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);

// Refresh Access Token
router.post("/refresh", refreshToken);

export default router;
