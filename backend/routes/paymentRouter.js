import express from "express";
import {
  createOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentHistory,
  getCourseStats,
  getPaymentDetails,
} from "../controllers/paymentController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 💳 PAYMENT ROUTES
 * =========================================
 */

// Create Razorpay order
router.post("/create-order", isAuthenticated, createOrder);

// Verify payment and complete enrollment
router.post("/verify", isAuthenticated, verifyPayment);

// Handle payment failure
router.post("/handle-failure", isAuthenticated, handlePaymentFailure);

// Get user's payment history
router.get("/history", isAuthenticated, getPaymentHistory);

// Get payment details
router.get("/:paymentId", isAuthenticated, getPaymentDetails);

// Get course payment statistics (Educator/Admin only)
router.get(
  "/course/:courseId/stats",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  isCourseOwnerOrAdmin,
  getCourseStats
);

export default router;
