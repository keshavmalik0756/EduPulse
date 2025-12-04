// ============================================================================
// ⭐ EduPulse Review Controller (2025 Optimized & Scalable Edition)
// Handles course reviews, ratings, helpful votes & moderation
// ============================================================================

import Review from "../models/reviewModel.js";
import Course from "../models/courseModel.js";
// Removed logActivity import
import mongoose from "mongoose";

// ===============================
// 📦 Helper Functions
// ===============================

// Format date for frontend readability
const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Safely extract message
const safeMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ===============================
// 🎯 CREATE REVIEW
// ===============================
export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user._id;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Ensure course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Prevent duplicate reviews by same user
    const existingReview = await Review.findOne({ user: userId, course: courseId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You’ve already reviewed this course.",
      });
    }

    // Create review
    const review = await Review.create({
      rating,
      comment,
      title,
      user: userId,
      course: courseId,
      isVerifiedPurchase: course.enrolledStudents.includes(userId),
    });

    // Update course rating metrics
    await course.recalculateRating();

    res.status(201).json({
      success: true,
      message: "✅ Review submitted successfully!",
      review: {
        ...review.toObject(),
        formattedDate: formatDate(review.createdAt),
      },
    });
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({
      success: false,
      message: safeMessage(error, "Failed to submit review."),
    });
  }
};

// ===============================
// 🧾 GET REVIEWS FOR A COURSE
// ===============================
export const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId, isApproved: true })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    if (!reviews.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
        message: "No reviews yet for this course.",
      });
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews: reviews.map((r) => ({
        ...r,
        formattedDate: formatDate(r.createdAt),
        sentiment:
          r.rating >= 4
            ? "positive"
            : r.rating >= 3
            ? "neutral"
            : "negative",
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course reviews.",
    });
  }
};

// ===============================
// 🧍‍♂️ GET USER'S OWN REVIEWS
// ===============================
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const reviews = await Review.find({ user: userId })
      .populate("course", "title thumbnail category averageRating")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews: reviews.map((r) => ({
        ...r,
        formattedDate: formatDate(r.createdAt),
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews.",
    });
  }
};

// ===============================
// ✏️ UPDATE REVIEW
// ===============================
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Only the review author or admin can edit
    if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this review." });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (title) review.title = title;

    await review.save();

    // Recalculate course rating
    await Course.findById(review.course).then((c) => c?.recalculateRating());

    res.status(200).json({
      success: true,
      message: "✅ Review updated successfully.",
      review,
    });
  } catch (error) {
    console.error("❌ Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review.",
    });
  }
};

// ===============================
// 🗑️ DELETE REVIEW
// ===============================
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Authorization
    if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this review." });
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate course rating
    await Course.findById(review.course).then((c) => c?.recalculateRating());

    res.status(200).json({
      success: true,
      message: "🗑️ Review deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
};

// ===============================
// 👍 MARK REVIEW AS HELPFUL
// ===============================
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { isHelpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "👍 Review marked as helpful!",
      helpfulCount: review.isHelpful,
    });
  } catch (error) {
    console.error("❌ Error marking helpful:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark review as helpful.",
    });
  }
};

// ===============================
// 🧠 ADMIN: APPROVE OR REJECT REVIEW
// ===============================
export const toggleReviewApproval = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { approve } = req.body; // true or false

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    review.isApproved = !!approve;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${approve ? "approved ✅" : "rejected ❌"} successfully.`,
      review,
    });
  } catch (error) {
    console.error("❌ Error approving review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review approval.",
    });
  }
};

// ===============================
// 📊 GET COURSE RATING SUMMARY
// ===============================
export const getCourseRatingSummary = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await Review.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId), isApproved: true } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReviews = stats.reduce((acc, s) => acc + s.count, 0);
    const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: stats.find((s) => s._id === r)?.count || 0,
      percentage:
        totalReviews > 0
          ? Math.round(
              ((stats.find((s) => s._id === r)?.count || 0) / totalReviews) * 100
            )
          : 0,
    }));

    const avgRating =
      totalReviews > 0
        ? (
            stats.reduce((sum, s) => sum + s._id * s.count, 0) / totalReviews
          ).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalReviews,
        avgRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("❌ Error calculating rating summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course rating summary.",
    });
  }
};