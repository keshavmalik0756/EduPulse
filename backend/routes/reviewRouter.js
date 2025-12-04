import express from "express";
import {
  createReview,
  getReviewsByCourse,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  toggleReviewApproval,
  getCourseRatingSummary,
} from "../controllers/reviewController.js";

import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:courseId", isAuthenticated, createReview);
router.get("/course/:courseId", getReviewsByCourse);
router.get("/user", isAuthenticated, getUserReviews);
router.put("/:reviewId", isAuthenticated, updateReview);
router.delete("/:reviewId", isAuthenticated, deleteReview);
router.patch("/helpful/:reviewId", isAuthenticated, markReviewHelpful);
router.patch("/approve/:reviewId", isAuthenticated, authorizeRoles("admin"), toggleReviewApproval);
router.get("/summary/:courseId", getCourseRatingSummary);

export default router;
