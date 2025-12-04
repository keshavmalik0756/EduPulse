import express from "express";
import {
  getLectureQuality,
  getCourseLectureQuality,
  updateLectureQuality,
  getLecturesByQualityCategory,
  getQualityHeatmap
} from "../controllers/lectureQualityController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 🎯 LECTURE QUALITY ROUTES
 * =========================================
 */

// Get quality data for a specific lecture
router.get(
  "/lecture/:lectureId",
  cacheMiddleware(120), // Cache for 2 minutes
  getLectureQuality
);

// Get quality data for all lectures in a course
router.get(
  "/course/:courseId",
  cacheMiddleware(300), // Cache for 5 minutes
  getCourseLectureQuality
);

// Get quality heatmap data for a course
router.get(
  "/heatmap/:courseId",
  cacheMiddleware(300), // Cache for 5 minutes
  getQualityHeatmap
);

// Get lectures by quality category
router.get(
  "/course/:courseId/category/:category",
  cacheMiddleware(300), // Cache for 5 minutes
  getLecturesByQualityCategory
);

/**
 * =========================================
 * 🎓 EDUCATOR ROUTES
 * =========================================
 */

// Update quality data for a lecture (educator/admin)
router.put(
  "/lecture/:lectureId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  updateLectureQuality
);

export default router;