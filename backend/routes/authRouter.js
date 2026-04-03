import express from "express";
import {
  syncUser,
  logout,
  getUser,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * ===================================
 * 🔐 FIREBASE AUTHENTICATION ROUTER
 * ===================================
 */
router.post("/sync", rateLimiter(50, 15 * 60 * 1000), syncUser);

router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);

// Keep an empty refresh endpoint in case frontend still hits it during transition
router.post("/refresh", (req, res) => res.json({ success: true, message: "Token refresh migrated to Firebase." }));

// Dummy password routes to prevent frontend 404s before the frontend updates completely deploy
router.post("/password/forgot", (req, res) => res.status(200).json({ success: true, message: "Please reset your password using the Firebase Auth UI."}));
router.put("/password/reset/:token", (req, res) => res.status(200).json({ success: true, message: "Please use Firebase Auth to reset password."}));
router.put("/password/update", isAuthenticated, (req, res) => res.status(200).json({ success: true, message: "Please use Firebase Auth to update password."}));

export default router;
