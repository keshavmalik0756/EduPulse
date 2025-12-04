import mongoose from "mongoose";

// ============================================================
// 💬 Discussion Model (EduPulse Platform – 2025 Optimized)
// Supports course-specific Q&A with nested answers & reactions
// ============================================================
const discussionSchema = new mongoose.Schema(
  {
    // 🔹 Question Content
    content: {
      type: String,
      required: [true, "Question content is required"],
      trim: true,
      maxlength: [1000, "Question cannot exceed 1000 characters"],
    },

    // 🔹 Relationships
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Question must belong to a course"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Question must have an author"],
    },

    // 🔹 Status & Moderation
    isResolved: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔹 Metadata
    totalAnswers: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ============================================================
// 🧵 Subdocument for Answers
// ============================================================
const answerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: {
      type: String,
      required: [true, "Answer content is required"],
      trim: true,
      maxlength: [1000, "Answer cannot exceed 1000 characters"],
    },
    likes: { type: Number, default: 0 },
    isBestAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Attach answers as subdocument array
discussionSchema.add({
  answers: [answerSchema],
});

// ============================================================
// ⚙️ METHODS
// ============================================================
discussionSchema.methods.addAnswer = async function (answerData) {
  this.answers.push(answerData);
  this.totalAnswers = this.answers.length;
  await this.save();
  return this;
};

discussionSchema.methods.toggleResolved = async function () {
  this.isResolved = !this.isResolved;
  await this.save();
  return this.isResolved;
};

discussionSchema.methods.markBestAnswer = async function (answerId) {
  this.answers = this.answers.map((ans) => ({
    ...ans.toObject(),
    isBestAnswer: ans._id.toString() === answerId.toString(),
  }));
  await this.save();
  return this;
};

// ============================================================
// 📊 INDEXES
// ============================================================
discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ isResolved: 1, isPinned: 1 });

// ============================================================
// 📦 MODEL EXPORT
// ============================================================
const Discussion = mongoose.model("Discussion", discussionSchema);
export default Discussion;