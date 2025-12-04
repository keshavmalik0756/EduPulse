import express from "express";
import {
  getEducatorProductivity,
  getProductivityHistory,
  getProductivitySummary,
  updateEducatorProductivity,
  getCurrentWeekProductivity
} from "../controllers/productivityController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 👨‍🏫 EDUCATOR ROUTES
 * =========================================
 */

// Get productivity data for an educator for a specific week
router.get(
  "/week/:weekStartDate",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(300), // Cache for 5 minutes
  getEducatorProductivity
);

// Get productivity history for an educator
router.get(
  "/history",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(900), // Cache for 15 minutes
  getProductivityHistory
);

// Get productivity summary for an educator
router.get(
  "/summary",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(900), // Cache for 15 minutes
  getProductivitySummary
);

// Update productivity data for an educator
router.put(
  "/week/:weekStartDate",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  updateEducatorProductivity
);

// Get current week productivity data
router.get(
  "/current",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(300), // Cache for 5 minutes
  getCurrentWeekProductivity
);

export default router;