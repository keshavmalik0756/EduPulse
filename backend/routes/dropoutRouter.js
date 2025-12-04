import express from "express";
import {
  getCourseDropouts,
  getHighRiskDropouts,
  calculatePolynomialDropouts,
  calculateMovingAverageDropouts,
  getDropoutSummary
} from "../controllers/dropoutController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 👨‍🏫 EDUCATOR ROUTES
 * =========================================
 */

// Get dropout predictions for a specific course
router.get(
  "/course/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getCourseDropouts
);

// Get high-risk dropout points
router.get(
  "/course/:courseId/high-risk",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getHighRiskDropouts
);

// Calculate dropout predictions using polynomial regression
router.post(
  "/course/:courseId/polynomial",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  rateLimiter(5, 60 * 60 * 1000), // 5 requests per hour
  calculatePolynomialDropouts
);

// Calculate dropout predictions using moving average
router.post(
  "/course/:courseId/moving-average",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  rateLimiter(5, 60 * 60 * 1000), // 5 requests per hour
  calculateMovingAverageDropouts
);

// Get dropout prediction summary
router.get(
  "/course/:courseId/summary",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getDropoutSummary
);

export default router;