import express from "express";
import {
  getCourseMomentum,
  getMomentumSummary,
  updateMomentumData,
  getComparativeMomentum,
  calculateMomentumFromMetrics,
  getMomentumTrend
} from "../controllers/momentumController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 👨‍🏫 EDUCATOR ROUTES
 * =========================================
 */

// Get momentum data for a specific course
router.get(
  "/course/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getCourseMomentum
);

// Get momentum summary for a course
router.get(
  "/course/:courseId/summary",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getMomentumSummary
);

// Get momentum trend data for sparklines
router.get(
  "/course/:courseId/trend",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getMomentumTrend
);

// Update momentum data for a specific date
router.put(
  "/course/:courseId/date/:date",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  updateMomentumData
);

// Get comparative momentum data for multiple courses
router.get(
  "/compare",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getComparativeMomentum
);

// Calculate and update momentum data based on actual metrics
router.post(
  "/course/:courseId/calculate",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  rateLimiter(10, 60 * 60 * 1000), // 10 requests per hour
  calculateMomentumFromMetrics
);

export default router;