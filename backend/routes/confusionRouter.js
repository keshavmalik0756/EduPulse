import express from "express";
import {
  getLectureConfusionData,
  getCourseConfusionData,
  recordConfusionInteraction,
  getCourseConfusionSummary,
  updateConfusionData,
  getLectureConfusionTimeline,
  getLectureConfusionAnalysis,
  getConfusionTrend,
  getRecommendations
} from "../controllers/confusionController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 🎓 STUDENT ROUTES
 * =========================================
 */

// Record confusion interaction (student behavior indicating confusion)
router.post(
  "/interaction",
  isAuthenticated,
  rateLimiter(100, 15 * 60 * 1000), // 100 requests per 15 minutes
  recordConfusionInteraction
);

/**
 * =========================================
 * 👨‍🏫 EDUCATOR ROUTES
 * =========================================
 */

// Get confusion data for a specific lecture
router.get(
  "/lecture/:lectureId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(60), // Cache for 1 minute
  getLectureConfusionData
);

// Get detailed confusion analysis for a lecture
router.get(
  "/lecture/:lectureId/analysis",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(60), // Cache for 1 minute
  getLectureConfusionAnalysis
);

// Get confusion timeline for a lecture (for UI heatmap)
router.get(
  "/lecture/:lectureId/timeline",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(60), // Cache for 1 minute
  getLectureConfusionTimeline
);

// Get recommendations for improving confusing content
router.get(
  "/lecture/:lectureId/recommendations",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getRecommendations
);

// Get confusion data for a specific course
router.get(
  "/course/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(120), // Cache for 2 minutes
  getCourseConfusionData
);

// Get confusion summary for a course
router.get(
  "/course/:courseId/summary",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getCourseConfusionSummary
);

// Get confusion trend over time
router.get(
  "/course/:courseId/trend",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(300), // Cache for 5 minutes
  getConfusionTrend
);

// Update confusion data (manual adjustments)
router.put(
  "/:confusionId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  updateConfusionData
);

export default router;