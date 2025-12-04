// ============================================================================
// 💬 EduPulse Discussion Controller (2025 Optimized Edition)
// Handles Course Q&A, Answers, and Discussion Interactions
// ============================================================================

import Discussion from "../models/discussionModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";

// Helper: Format date
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ============================================================================
// 🧩 CREATE QUESTION
// ============================================================================
export const createQuestion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Question content cannot be empty." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const question = await Discussion.create({
      content,
      course: courseId,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "✅ Question posted successfully.",
      data: question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ success: false, message: "Failed to post question." });
  }
};

// ============================================================================
// 🧾 GET ALL QUESTIONS FOR A COURSE
// ============================================================================
export const getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const questions = await Discussion.find({ course: courseId })
      .populate("user", "name email avatar role")
      .populate("answers.user", "name email avatar role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch questions." });
  }
};

// ============================================================================
// 🧠 ADD ANSWER TO A QUESTION
// ============================================================================
export const addAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Answer content cannot be empty." });
    }

    const question = await Discussion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    await question.addAnswer({ user: req.user._id, content });
    const populated = await question.populate("answers.user", "name email role");

    res.status(201).json({
      success: true,
      message: "✅ Answer added successfully.",
      data: populated.answers.pop(), // return only new answer
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).json({ success: false, message: "Failed to add answer." });
  }
};

// ============================================================================
// 🔄 TOGGLE RESOLVED STATUS
// ============================================================================
export const toggleResolved = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Discussion.findById(questionId);

    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    // Allow only course creator or educators to resolve
    const course = await Course.findById(question.course);
    if (
      course.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "educator" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to resolve this question." });
    }

    const newStatus = await question.toggleResolved();
    res.status(200).json({
      success: true,
      message: `Question marked as ${newStatus ? "resolved ✅" : "unresolved ❌"}.`,
      data: { isResolved: newStatus },
    });
  } catch (error) {
    console.error("Error toggling resolution:", error);
    res.status(500).json({ success: false, message: "Failed to update question status." });
  }
};

// ============================================================================
// 🏅 MARK ANSWER AS BEST
// ============================================================================
export const markBestAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;

    const question = await Discussion.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    await question.markBestAnswer(answerId);

    res.status(200).json({
      success: true,
      message: "🏅 Answer marked as best successfully.",
      data: question,
    });
  } catch (error) {
    console.error("Error marking best answer:", error);
    res.status(500).json({ success: false, message: "Failed to mark answer as best." });
  }
};

// ============================================================================
// 👍 LIKE AN ANSWER
// ============================================================================
export const likeAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await Discussion.findById(questionId);

    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const answer = question.answers.id(answerId);
    if (!answer) return res.status(404).json({ success: false, message: "Answer not found." });

    answer.likes += 1;
    await question.save();

    res.status(200).json({ success: true, message: "👍 Liked successfully!", data: { likes: answer.likes } });
  } catch (error) {
    console.error("Error liking answer:", error);
    res.status(500).json({ success: false, message: "Failed to like answer." });
  }
};