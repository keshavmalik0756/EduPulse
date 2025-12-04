import express from "express";
import {
  getCourseLeaderboard,
  getCourseLeaderboardEntry,
  recalculateLeaderboard,
  updateCourseLeaderboard,
  getTopPerformingByMetric
} from "../controllers/leaderboardController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 🏆 COURSE LEADERBOARD ROUTES
 * =========================================
 */

// Get overall course leaderboard
router.get(
  "/",
  cacheMiddleware(300), // Cache for 5 minutes
  getCourseLeaderboard
);

// Get leaderboard entry for a specific course
router.get(
  "/course/:courseId",
  cacheMiddleware(120), // Cache for 2 minutes
  getCourseLeaderboardEntry
);

// Get top performing courses by specific metric
router.get(
  "/top/:metric",
  cacheMiddleware(300), // Cache for 5 minutes
  getTopPerformingByMetric
);

/**
 * =========================================
 * 👨‍💼 ADMIN ROUTES
 * =========================================
 */

// Recalculate entire leaderboard (admin only)
router.post(
  "/recalculate",
  isAuthenticated,
  authorizeRoles("admin"),
  rateLimiter(5, 60 * 60 * 1000), // 5 requests per hour
  recalculateLeaderboard
);

/**
 * =========================================
 * 🎓 EDUCATOR ROUTES
 * =========================================
 */

// Update leaderboard entry for a course (educator/admin)
router.put(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  updateCourseLeaderboard
);

export default router;