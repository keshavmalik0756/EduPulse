import mongoose from "mongoose";
import LectureProgress from "./lectureProgressModel.js";

const lectureSchema = new mongoose.Schema(
  {
    // 🎓 Basic Info
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Lecture description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // 🧩 Type & Difficulty
    type: {
      type: String,
      enum: ["video", "pdf", "document", "quiz", "link"],
      default: "video",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // 🎞️ Media Information (Video Upload)
    videoUrl: {
      type: String,
      validate: {
        validator: (v) => !v || /\.(mp4|mov|mkv|webm)$/i.test(v),
        message: "Invalid video format (allowed: MP4, MOV, MKV, WEBM)",
      },
    },
    videoSize: {
      type: Number,
      min: [1, "Video size must be greater than 0"],
      max: [5368709120, "Video size cannot exceed 5GB"],
    },
    originalVideoName: { type: String, trim: true },
    thumbnail: {
      type: String,
      validate: {
        validator: (v) => !v || /\.(jpg|jpeg|png|webp)$/i.test(v),
        message: "Thumbnail must be a valid image format",
      },
      default: null,
    },

    // 🧠 Lecture Metadata
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 second"],
      max: [86400, "Duration cannot exceed 24 hours"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [10000, "Notes cannot exceed 10,000 characters"],
    },
    isPreviewFree: { type: Boolean, default: false },

    // 📎 Resources (Educator-uploaded materials)
    resources: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: (v) =>
              /^https?:\/\/.+/i.test(v) &&
              /\.(pdf|docx?|pptx?|zip|rar|txt|mp4|mov|webm)$/i.test(v),
            message: "Invalid or unsupported resource file type",
          },
        },
        type: {
          type: String,
          enum: ["pdf", "document", "link", "video", "other"],
          required: true,
        },
        size: {
          type: Number, // bytes
          min: 0,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        // Educator-only notes PDFs remain private inside the app
        isPrivate: {
          type: Boolean,
          default: true,
          index: true,
        },
      },
    ],

    // 🏷️ Relations
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },

    // 🧩 Prerequisites (plain text list)
    prerequisites: {
      type: [String],
      default: [],
      trim: true,
    },

    // 📊 Tracking
    order: {
      type: Number,
      required: true,
      min: [1, "Order must be ≥ 1"],
    },
    viewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
// 📈 Indexes
//
lectureSchema.index({ courseId: 1, sectionId: 1, order: 1 }, { unique: true });
lectureSchema.index({ courseId: 1, isActive: 1 });
lectureSchema.index({ courseId: 1, difficulty: 1 });
lectureSchema.index({ createdAt: -1 });
lectureSchema.index({ title: "text", description: "text" });

//
// 🎯 Virtual Fields
//
lectureSchema.virtual("formattedDuration").get(function () {
  const h = Math.floor(this.duration / 3600);
  const m = Math.floor((this.duration % 3600) / 60);
  const s = this.duration % 60;
  return h
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
});

lectureSchema.virtual("formattedVideoSize").get(function () {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (!this.videoSize) return "0 Bytes";
  const i = Math.floor(Math.log(this.videoSize) / Math.log(1024));
  return `${(this.videoSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

lectureSchema.virtual("completionRate").get(async function () {
  const count = await LectureProgress.countDocuments({ lectureId: this._id });
  if (count === 0) return 0;
  const completed = await LectureProgress.countDocuments({ lectureId: this._id, isCompleted: true });
  return Math.round((completed / count) * 100);
});

//
// ⚙️ Middleware
//
lectureSchema.pre("save", async function (next) {
  if (this.isModified("order") || this.isModified("courseId") || this.isModified("sectionId")) {
    const exists = await this.constructor.findOne({
      courseId: this.courseId,
      sectionId: this.sectionId,
      order: this.order,
      _id: { $ne: this._id },
    });
    if (exists) return next(new Error("Order must be unique within the section"));
  }
  next();
});

//
// 🧮 Instance Methods
//
lectureSchema.methods.getCompletionPercentage = async function (userId) {
  const progress = await LectureProgress.findOne({ 
    lectureId: this._id, 
    userId: userId.toString() 
  });
  if (!progress) return 0;
  return Math.min(Math.round((progress.watchedDuration / this.duration) * 100), 100);
};

lectureSchema.methods.isCompletedBy = async function (userId) {
  const progress = await LectureProgress.findOne({ 
    lectureId: this._id, 
    userId: userId.toString() 
  });
  return progress ? progress.isCompleted : false;
};

lectureSchema.methods.updateProgress = async function (userId, watchedDuration) {
  const completed = watchedDuration >= this.duration * 0.9;
  
  return await LectureProgress.findOneAndUpdate(
    { userId, lectureId: this._id },
    { 
      $set: { 
        watchedDuration: Math.min(watchedDuration, this.duration),
        isCompleted: completed,
        lastWatched: new Date(),
        courseId: this.courseId 
      }
    },
    { upsert: true, new: true }
  );
};

lectureSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

//
// 📊 Static Methods
//
lectureSchema.statics.getByCourse = async function (courseId, sectionId = null, userId = null, page = 1, limit = 10) {
  const query = { courseId, isActive: true };
  if (sectionId) query.sectionId = sectionId;

  const lectures = await this.find(query)
    .sort({ order: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  if (!userId) return lectures;

  // Fetch progress for all these lectures in one go to avoid N+1
  const progressItems = await LectureProgress.find({
    userId,
    lectureId: { $in: lectures.map((l) => l._id) }
  }).lean();

  const progressMap = new Map(progressItems.map(p => [p.lectureId.toString(), p]));

  return lectures.map((l) => {
    const prog = progressMap.get(l._id.toString());
    return {
      ...l,
      completionPercentage: prog
        ? Math.min(Math.round((prog.watchedDuration / l.duration) * 100), 100)
        : 0,
      isCompleted: prog ? prog.isCompleted : false
    };
  });
};

lectureSchema.statics.getStatistics = function (courseId) {
  return this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId), isActive: true } },
    {
      $group: {
        _id: null,
        totalLectures: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        totalSize: { $sum: "$videoSize" },
        avgViewCount: { $avg: "$viewCount" },
        difficulties: { $push: "$difficulty" },
      },
    },
  ]);
};

//
// 🔗 Auto-link Lecture to Course & Section
//
lectureSchema.post("save", async function (doc, next) {
  try {
    const Section = mongoose.model("Section");

    // Incremental update of section duration and lesson count
    // Note: We only increment if it's a new lecture or duration changed
    
    // Check if it's a new document
    const isNew = doc.isNew || (doc.$__ ? doc.$__.wasNew : false);
    
    if (isNew) {
      await Section.findByIdAndUpdate(doc.sectionId, {
        $inc: { 
          totalDuration: Math.round(doc.duration / 60),
          totalLessons: 1 
        }
      });
    }

    next();
  } catch (err) {
    console.error("Error updating section metrics:", err);
    next();
  }
});

lectureSchema.post("findOneAndDelete", async function (doc, next) {
  try {
    if (doc) {
      const Section = mongoose.model("Section");
      await Section.findByIdAndUpdate(doc.sectionId, {
        $inc: { 
          totalDuration: -Math.round(doc.duration / 60),
          totalLessons: -1 
        }
      });
    }
    next();
  } catch (err) {
    console.error("Error updating section metrics on delete:", err);
    next();
  }
});

//
// 🧱 Model Export
//
const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
