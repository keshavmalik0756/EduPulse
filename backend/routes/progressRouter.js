// routes/progressRouter.js
import express from "express";
import {
  getCourseProgress,
  updateCourseProgress,
  getAllCourseProgress
} from "../controllers/progressController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/* =========================================
 📈 PROGRESS ROUTES
========================================= */

// Get progress for a specific course
router.get(
  "/:courseId",
  isAuthenticated,
  rateLimiter(100, 15 * 60 * 1000), // max 100 requests per 15 minutes
  cacheMiddleware(60), // Cache for 1 minute
  getCourseProgress
);

// Update progress for a specific course
router.post(
  "/:courseId",
  isAuthenticated,
  rateLimiter(100, 15 * 60 * 1000), // max 100 requests per 15 minutes
  updateCourseProgress
);

// Get progress for all courses
router.get(
  "/",
  isAuthenticated,
  rateLimiter(50, 15 * 60 * 1000), // max 50 requests per 15 minutes
  cacheMiddleware(120), // Cache for 2 minutes
  getAllCourseProgress
);

export default router;