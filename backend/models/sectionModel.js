import mongoose from "mongoose";

// =======================================
// 📘 SECTION SCHEMA (EduPulse Platform – Optimized)
// =======================================
const sectionSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
      maxlength: [120, "Section title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Section description cannot exceed 1000 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    order: {
      type: Number,
      required: [true, "Section order is required"],
      min: [1, "Section order must be at least 1"],
    },

    // 🔹 Course Reference
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Section must belong to a course"],
      index: true,
    },

    // 🔹 Creator Reference
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Make it optional since it might not always be available
    },

    // 🔹 Lessons (queried via virtual, not stored)
    
    // 🔹 Section Status
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // 🔹 Metrics
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0, min: [0, "Total duration cannot be negative"] },
    
    // 🔹 Estimated completion time
    estimatedCompletionTime: { type: Number, default: 0 }, // in minutes
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true, // enable optimistic concurrency control
    versionKey: "__v",
  }
);

// =====================================================
// ⚙️ HOOKS & LOGIC
// =====================================================

// 🔹 Pre-validate: ensure course field is set
sectionSchema.pre("validate", function (next) {
  if (!this.course) {
    console.log("❌ Section validation error: course field is missing");
    next(new Error("Section must belong to a course"));
    return;
  }
  
  if (!this.title || !this.title.trim()) {
    console.log("❌ Section validation error: title field is missing or empty");
    next(new Error("Section title is required"));
    return;
  }
  
  next();
});

// 🔹 Pre-save: generate slug from title
sectionSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `section-${this.order}`;
  }
  next();
});

// 🔹 Post-save: Ensure section is linked to course and update metrics
sectionSchema.post("save", async function (doc, next) {
  try {
    const Course = mongoose.model("Course");
    
    // If new section, increment totalSections in course
    const isNew = doc.isNew || (doc.$__ ? doc.$__.wasNew : false);
    if (isNew) {
      await Course.findByIdAndUpdate(doc.course, {
        $inc: { totalSections: 1 },
        $addToSet: { sections: doc._id }
      });
    }
  } catch (err) {
    console.error("Error linking section to course:", err);
  }
  next();
});

// 🔹 Post-delete: auto-update parent course metrics when section is deleted
sectionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  try {
    const Course = mongoose.model("Course");
    
    // Incremental decrement of course metrics
    await Course.findByIdAndUpdate(doc.course, {
      $pull: { sections: doc._id },
      $inc: { 
        totalSections: -1,
        totalDurationMinutes: -(doc.totalDuration || 0),
        totalLectures: -(doc.totalLessons || 0)
      }
    });
  } catch (err) {
    console.error("Error updating course metrics after section deletion:", err);
  }
});

// =====================================================
// 🌐 VIRTUALS
// =====================================================

// Human-readable duration
sectionSchema.virtual("durationFormatted").get(function () {
  const totalMinutes = this.totalDuration || 0;
  if (totalMinutes === 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`.trim();
});

// Lesson count virtual (for UI)
sectionSchema.virtual("lessonCount").get(function () {
  return this.totalLessons || 0;
});

// Lessons virtual (query-based)
sectionSchema.virtual("lessons", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "sectionId",
});

// =====================================================
// 📈 INDEXES
// =====================================================

// Prevent duplicate section order in a single course
sectionSchema.index({ course: 1, order: 1 }, { unique: true });

// Prevent duplicate section names in same course (case-insensitive)
sectionSchema.index(
  { course: 1, title: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 } // strength 2 => case-insensitive
  }
);

sectionSchema.index({ isPublished: 1, course: 1 });
sectionSchema.index({ createdAt: -1 });
sectionSchema.index({ title: "text", description: "text" }); // for searching sections

// =====================================================
// 📦 EXPORT MODEL
// =====================================================
const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);
export default Section;










