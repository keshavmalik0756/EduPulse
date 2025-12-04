// routes/sectionRouter.js
import express from "express";
import {
  createSection,
  getSectionsByCourse,
  getSectionById,
  updateSection,
  deleteSection,
  reorderSections,
  toggleSectionStatus,
  getSectionStatistics,
} from "../controllers/sectionController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// Version header (optional)
router.use((req, res, next) => {
  res.setHeader("X-API-Version", "1.0");
  next();
});

/* =========================================
 📘 PUBLIC ROUTES
========================================= */
router.get(
  "/course/:courseId",
  cacheMiddleware(300),
  rateLimiter(200, 15 * 60 * 1000),
  getSectionsByCourse
);

/* =========================================
 📊 ANALYTICS (Educators Only)
========================================= */
router.get(
  "/course/:courseId/statistics",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(600),
  rateLimiter(50, 10 * 60 * 1000),
  getSectionStatistics
);

/* =========================================
 👨‍🏫 INSTRUCTOR ROUTES
========================================= */
router.post(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  createSection
);

router.put(
  "/:sectionId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  updateSection
);

router.delete(
  "/:sectionId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  deleteSection
);

router.patch(
  "/:sectionId/toggle",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  toggleSectionStatus
);

router.patch(
  "/course/:courseId/reorder",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  reorderSections
);

/* =========================================
 📗 SINGLE SECTION DETAILS (Public)
========================================= */
router.get("/:sectionId", cacheMiddleware(300), getSectionById);

export default router;
