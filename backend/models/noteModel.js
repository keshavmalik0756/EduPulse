import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // 📝 Basic Info
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Note title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // 📎 File Info (Educator uploads PDFs or Docs)
    fileUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          // Only validate if fileUrl is provided
          if (!v) return true;
          return /^https?:\/\/.+\.(pdf)$/i.test(v);
        },
        message: "File must be a valid PDF URL",
      },
    },
    fileSize: {
      type: Number,
      min: [1, "File size must be greater than 0"],
      max: [52428800, "File cannot exceed 50MB"],
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx"],
    },

    // 🔗 Relations
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      // Lecture is optional to allow course-level notes
      required: false,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔒 Visibility
    isPublic: { type: Boolean, default: false, index: true },

    // 🗑️ Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 📘 Auto-sync course from lecture
noteSchema.pre("save", async function (next) {
  if (this.isModified("lecture") || this.isNew) {
    const Lecture = mongoose.model("Lecture");
    const lecture = await Lecture.findById(this.lecture);
    if (lecture) this.course = lecture.courseId;
  }
  next();
});

// 🔹 Post-save: increment notesCount in course
noteSchema.post("save", async function (doc, next) {
  try {
    const Course = mongoose.model("Course");
    const isNew = doc.isNew || (doc.$__ ? doc.$__.wasNew : false);
    
    if (isNew && doc.course) {
      await Course.findByIdAndUpdate(doc.course, {
        $inc: { notesCount: 1 }
      });
    }
  } catch (err) {
    console.error("Error updating course notesCount:", err);
  }
  next();
});

// 🔹 Post-delete: decrement notesCount in course
noteSchema.post("findOneAndDelete", async function (doc, next) {
  try {
    if (doc && doc.course) {
      const Course = mongoose.model("Course");
      await Course.findByIdAndUpdate(doc.course, {
        $inc: { notesCount: -1 }
      });
    }
  } catch (err) {
    console.error("Error decrementing course notesCount:", err);
  }
  next();
});

// 🧠 Indexes
noteSchema.index({ lecture: 1, creator: 1 });
noteSchema.index({ title: "text", description: "text" });

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;


