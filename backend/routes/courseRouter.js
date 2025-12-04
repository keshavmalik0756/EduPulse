// routes/courseRouter.js
import express from "express";
import {
  createCourse,
  getPublishedCourses,
  getCourseByIdOrSlug,
  getCreatorCourses,
  editCourse,
  removeCourse,
  getCourseStatistics,
  togglePublishStatus,
  enrollCourse,
  unenrollCourse,
  getUserEnrollments,
  getCourseAnalytics,
  getEnrolledStudents,
} from "../controllers/courseController.js";
import { isAuthenticated, authorizeRoles, isCourseOwnerOrAdmin } from "../middleware/authMiddleware.js";
import {
  uploadCourseFiles,
  mapCourseFilesToBody,
  handleMulterError,
} from "../middleware/multer.js";
import { generateUploadSignature } from "../services/cloudinary.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 🧑‍🏫 COURSE MANAGEMENT
 * =========================================
 */
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  rateLimiter(10, 10 * 60 * 1000), // max 10 course creations per 10 mins
  uploadCourseFiles,
  mapCourseFilesToBody,
  handleMulterError,
  createCourse
);

router.get("/getpublished", cacheMiddleware(300), getPublishedCourses);
router.get(
  "/getcreatorcourses",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  cacheMiddleware(60), // Reduced cache time to 1 minute
  getCreatorCourses
);

// Public route for viewing courses
router.get("/get/:idOrSlug", cacheMiddleware(300), getCourseByIdOrSlug);
router.get("/slug/:slug", cacheMiddleware(300), getCourseByIdOrSlug);

/**
 * 🎓 STUDENT ENROLLMENT
 */
router.post("/enroll/:courseId", isAuthenticated, rateLimiter(50, 15 * 60 * 1000), enrollCourse);
router.delete("/unenroll/:courseId", isAuthenticated, rateLimiter(50, 15 * 60 * 1000), unenrollCourse);
router.get("/enrollments/user", isAuthenticated, getUserEnrollments);

/**
 * 👨‍🏫 EDUCATOR ROUTES - Protected with course owner middleware
 */
router.put(
  "/edit/:courseId",
  isAuthenticated,
  isCourseOwnerOrAdmin, // Changed from authorizeRoles to isCourseOwnerOrAdmin
  uploadCourseFiles,
  mapCourseFilesToBody,
  handleMulterError,
  editCourse
);

router.put("/toggle-publish/:courseId", isAuthenticated, isCourseOwnerOrAdmin, togglePublishStatus);
router.delete("/remove/:courseId", isAuthenticated, isCourseOwnerOrAdmin, removeCourse);

// Add course analytics route - moved to a more specific path to avoid conflicts
router.get(
  "/get/:courseId/analytics",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(60), // Cache for 1 minute
  getCourseAnalytics
);

// Add route for getting enrolled students
router.get(
  "/get/:courseId/students",
  isAuthenticated,
  isCourseOwnerOrAdmin,
  cacheMiddleware(60), // Cache for 1 minute
  getEnrolledStudents
);

router.get("/stats", isAuthenticated, authorizeRoles("educator", "admin"), cacheMiddleware(600), getCourseStatistics);

/**
 * ☁️ CLOUDINARY SIGNATURE
 */
router.post(
  "/upload/signature",
  isAuthenticated,
  authorizeRoles("educator", "admin"),
  (req, res) => {
    const sig = generateUploadSignature({ folder: "EduPulse/Courses" });
    if (!sig.success) return res.status(500).json(sig);
    res.json(sig);
  }
);

export default router;