// routes/lectureRouter.js
import express from "express";
import {
  createLecture,
  getAllLectures,
  getLecturesByCourse,
  getLectureById,
  updateLecture,
  deleteLecture,
  updateProgress,
  reorderLectures,
  toggleLectureStatus,
  getLectureStatistics,
} from "../controllers/lectureController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadLessonFiles, handleMulterError, uploadLectureResources } from "../middleware/multer.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/* =========================================
 🎓 PUBLIC ROUTES
========================================= */
router.get("/", cacheMiddleware(300), getAllLectures);
router.get("/course/:courseId", cacheMiddleware(300), getLecturesByCourse);
router.get("/course/:courseId/statistics", cacheMiddleware(600), getLectureStatistics);
router.get("/:id", cacheMiddleware(120), getLectureById);

/* =========================================
 👤 STUDENT ROUTES
========================================= */
router.patch(
  "/:id/progress",
  isAuthenticated,
  rateLimiter(1000, 15 * 60 * 1000),
  updateProgress
);

/* =========================================
 👨‍🏫 EDUCATOR ROUTES
========================================= */
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(50, 15 * 60 * 1000), // max 50 lectures per 15 minutes
  uploadLessonFiles, // This now handles video, thumbnail, and resource files
  handleMulterError,
  createLecture
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(100, 15 * 60 * 1000), // max 100 updates per 15 minutes
  uploadLessonFiles, // This now handles video, thumbnail, and resource files
  handleMulterError,
  updateLecture
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(50, 15 * 60 * 1000), // max 50 deletions per 15 minutes
  deleteLecture
);

router.patch(
  "/reorder/:courseId",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(100, 15 * 60 * 1000),
  reorderLectures
);

router.patch(
  "/toggle/:id",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(100, 15 * 60 * 1000),
  toggleLectureStatus
);

export default router;