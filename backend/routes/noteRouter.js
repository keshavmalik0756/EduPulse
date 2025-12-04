// routes/noteRouter.js
import express from "express";
import {
  createNote,
  getNotesByLecture,
  getNotesByCourse,
  getUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} from "../controllers/noteController.js";

import {
  isAuthenticated,
  authorizeRoles,
  attachOptionalUser,
} from "../middleware/authMiddleware.js";

import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";
import { handleMulterError } from "../middleware/multer.js";
import multer from "multer";

// ============================================================================
// 📂 NOTE FILE UPLOAD CONFIGURATION
// Supports PDF & DOCX uploads through Cloudinary using memoryStorage
// ============================================================================
const uploadNoteFile = multer({
  storage: multer.memoryStorage(), // No disk storage → direct Cloudinary buffer
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB per note file
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      // OPTIONAL: Uncomment to allow .doc files
      // "application/msword"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only PDF or DOCX files are allowed for note uploads.")
    );
  },
}).single("file");

const router = express.Router();

// ============================================================================
// 📘 PUBLIC ROUTES (Cached + Optional User)
// ============================================================================
router.get(
  "/lecture/:lectureId",
  attachOptionalUser,
  cacheMiddleware(120),
  getNotesByLecture
);

router.get(
  "/course/:courseId",
  attachOptionalUser,
  cacheMiddleware(120),
  getNotesByCourse
);

router.get(
  "/search",
  attachOptionalUser,
  cacheMiddleware(60),
  searchNotes
);

// ============================================================================
// 🔐 AUTHENTICATED USER ROUTES
// ============================================================================
router.get("/user", isAuthenticated, getUserNotes);
router.get("/:id", isAuthenticated, getNoteById);

// ============================================================================
// 👨‍🏫 EDUCATOR & STUDENT ACTION ROUTES
// ============================================================================

// CREATE NOTE (supports PDF/DOCX upload)
router.post(
  "/",
  isAuthenticated,
  rateLimiter(50, 15 * 60 * 1000), // 50 notes per 15 min
  uploadNoteFile, // In-memory file upload
  handleMulterError,
  createNote
);

// UPDATE NOTE
router.put(
  "/:id",
  isAuthenticated,
  rateLimiter(100, 15 * 60 * 1000), // 100 updates per 15 min
  updateNote
);

// DELETE NOTE
router.delete(
  "/:id",
  isAuthenticated,
  rateLimiter(50, 15 * 60 * 1000), // 50 deletes per 15 min
  deleteNote
);

// ============================================================================
// 📦 EXPORT ROUTER
// ============================================================================
export default router;
