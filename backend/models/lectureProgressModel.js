import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    watchedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    lastWatched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a specific user's progress on a specific lecture
lectureProgressSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

// Index for getting all progress for a user in a course (for progress bars)
lectureProgressSchema.index({ userId: 1, courseId: 1 });

const LectureProgress = mongoose.model("LectureProgress", lectureProgressSchema);

export default LectureProgress;
