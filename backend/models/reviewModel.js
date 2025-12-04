import mongoose from "mongoose";

// =======================================
// 📘 REVIEW SCHEMA (EDUPULSE PLATFORM)
// =======================================
const reviewSchema = new mongoose.Schema(
    {
        // 🔹 Basic Information
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [1000, "Review comment cannot exceed 1000 characters"],
        },
        title: {
            type: String,
            trim: true,
            maxlength: [120, "Review title cannot exceed 120 characters"],
        },

        // 🔹 Relations
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must have a user"],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Review must be for a course"],
        },

        // 🔹 Review Status
        isApproved: {
            type: Boolean,
            default: true,
        },
        isHelpful: {
            type: Number,
            default: 0, // Number of users who found this review helpful
        },

        // 🔹 Metadata
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// =====================================================
// ⚙️ INDEXES AND CONSTRAINTS
// =====================================================

// 🔹 Ensure one review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// 🔹 Index for efficient queries
reviewSchema.index({ course: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// =====================================================
// 📦 MODEL EXPORT
// =====================================================
const Review = mongoose.model("Review", reviewSchema);
export default Review;