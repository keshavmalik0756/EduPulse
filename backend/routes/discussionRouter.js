// routes/discussionRouter.js

import express from "express";
import {
  createQuestion,
  getCourseQuestions,
  addAnswer,
  toggleResolved,
  markBestAnswer,
  likeAnswer,
} from "../controllers/discussionController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:courseId", isAuthenticated, createQuestion);
router.get("/course/:courseId", getCourseQuestions);
router.post("/:questionId/answers", isAuthenticated, addAnswer);
router.patch("/:questionId/resolve", isAuthenticated, toggleResolved);
router.patch("/:questionId/answers/:answerId/best", isAuthenticated, markBestAnswer);
router.patch("/:questionId/answers/:answerId/like", isAuthenticated, likeAnswer);

export default router;