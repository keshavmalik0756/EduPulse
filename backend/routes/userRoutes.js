// routes/userRouter.js
import express from "express";
import {
  getUserProfile,
  getUserProfileComplete,
  getProfileRequirements,
  updateUserProfile,
  updateUserAvatar,
  removeUserAvatar,
  updateUserDescription,
  updateUserPhotoUrl,
  getUserSettings,
  updateUserSettings,
  exportUserData,
  deleteUserAccount,
  getAllUsers,
  getUserStats,
  getUserById,
  registerNewAdmin,
  registerNewEducator,
  updateUserRole,
  verifyUserAccount,
  deleteUser,
} from "../controllers/userController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../middleware/multer.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * =========================================
 * 👤 USER PROFILE ROUTES
 * =========================================
 */
router.get("/profile", isAuthenticated, cacheMiddleware(60), getUserProfile);
router.get("/profile/complete", isAuthenticated, cacheMiddleware(120), getUserProfileComplete);
router.get("/profile/requirements", isAuthenticated, cacheMiddleware(300), getProfileRequirements);

router.put("/profile", isAuthenticated, uploadAvatar, updateUserProfile);
router.put("/profile/description", isAuthenticated, updateUserDescription);
router.put("/profile/photo-url", isAuthenticated, updateUserPhotoUrl);

router.put("/avatar", isAuthenticated, uploadAvatar, updateUserAvatar);
router.delete("/avatar", isAuthenticated, removeUserAvatar);

/**
 * =========================================
 * ⚙️ USER SETTINGS & DATA MANAGEMENT
 * =========================================
 */
router.get("/settings", isAuthenticated, cacheMiddleware(120), getUserSettings);
router.put("/settings", isAuthenticated, updateUserSettings);
router.get("/export-data", isAuthenticated, exportUserData);
router.delete("/delete-account", isAuthenticated, deleteUserAccount);

/**
 * =========================================
 * 🛡️ ADMIN-ONLY ROUTES
 * =========================================
 */
router.get("/all", isAuthenticated, isAuthorized("admin"), cacheMiddleware(120), getAllUsers);
router.get("/stats", isAuthenticated, isAuthorized("admin"), cacheMiddleware(300), getUserStats);
router.get("/:userId", isAuthenticated, isAuthorized("admin"), getUserById);

router.post("/admin/register", isAuthenticated, isAuthorized("admin"), uploadAvatar, registerNewAdmin);
router.post("/educator/register", isAuthenticated, isAuthorized("admin"), uploadAvatar, registerNewEducator);

router.put("/:userId/role", isAuthenticated, isAuthorized("admin"), updateUserRole);
router.put("/:userId/verify", isAuthenticated, isAuthorized("admin"), verifyUserAccount);
router.delete("/:userId", isAuthenticated, isAuthorized("admin"), deleteUser);

export default router;
