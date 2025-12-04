import express from "express";
import {
  getStudentEngagement,
  getStudentsByCategory,
  getEngagementDistribution,
  getAtRiskStudents,
  updateStudentEngagement,
  getEngagementSummary
} from "../controllers/engagementController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 👨‍🏫 EDUCATOR ROUTES
 * =========================================
 */

// Get engagement data for a specific student in a course
router.get(
  "/student/:courseId/:studentId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(120), // Cache for 2 minutes
  getStudentEngagement
);

// Get all students in a course by engagement category
router.get(
  "/category/:courseId/:category",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getStudentsByCategory
);

// Get engagement distribution for a course
router.get(
  "/distribution/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getEngagementDistribution
);

// Get at-risk students for a course
router.get(
  "/at-risk/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getAtRiskStudents
);

// Update engagement data for a student
router.put(
  "/student/:courseId/:studentId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  updateStudentEngagement
);

// Get engagement summary for a course
router.get(
  "/summary/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(600), // Cache for 10 minutes
  getEngagementSummary
);

export default router;