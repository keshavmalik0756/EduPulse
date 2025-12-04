import mongoose from "mongoose";

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

    // 🧩 User Progress
    progress: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          watchedDuration: { type: Number, default: 0, min: 0 },
          isCompleted: { type: Boolean, default: false },
          lastWatched: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
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
lectureSchema.index({ "progress.userId": 1 });
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

lectureSchema.virtual("completionRate").get(function () {
  if (!this.progress?.length) return 0;
  const completed = this.progress.filter((p) => p.isCompleted).length;
  return Math.round((completed / this.progress.length) * 100);
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
lectureSchema.methods.getCompletionPercentage = function (userId) {
  if (!this.progress) return 0;
  const progress = this.progress.find((x) => x.userId.toString() === userId.toString());
  if (!progress) return 0;
  return Math.min(Math.round((progress.watchedDuration / this.duration) * 100), 100);
};

lectureSchema.methods.isCompletedBy = function (userId) {
  if (!this.progress) return false;
  const progress = this.progress.find((x) => x.userId.toString() === userId.toString());
  return progress ? progress.isCompleted : false;
};

lectureSchema.methods.updateProgress = async function (userId, watchedDuration) {
  if (!this.progress) this.progress = [];
  const index = this.progress.findIndex((p) => p.userId.toString() === userId.toString());
  const completed = watchedDuration >= this.duration * 0.9;

  if (index !== -1) {
    this.progress[index].watchedDuration = Math.min(
      Math.max(this.progress[index].watchedDuration, watchedDuration),
      this.duration
    );
    this.progress[index].isCompleted = completed;
    this.progress[index].lastWatched = new Date();
  } else {
    this.progress.push({
      userId,
      watchedDuration: Math.min(watchedDuration, this.duration),
      isCompleted: completed,
    });
  }

  return this.save();
};

lectureSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

//
// 📊 Static Methods
//
lectureSchema.statics.getByCourse = function (courseId, sectionId = null, userId = null, page = 1, limit = 10) {
  const query = { courseId, isActive: true };
  if (sectionId) query.sectionId = sectionId;

  return this.find(query)
    .sort({ order: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .then((lectures) => {
      if (!userId) return lectures;
      return lectures.map((l) => ({
        ...l,
        completionPercentage: l.progress
          ? Math.min(
              Math.round(
                ((l.progress.find((p) => p.userId.toString() === userId.toString())?.watchedDuration || 0) /
                  l.duration) *
                  100
              ),
              100
            )
          : 0,
      }));
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
    const Course = mongoose.model("Course");
    const Section = mongoose.model("Section");

    await Promise.all([
      Course.findByIdAndUpdate(doc.courseId, { $addToSet: { lectures: doc._id } }),
      Section.findByIdAndUpdate(doc.sectionId, { $addToSet: { lessons: doc._id } }),
    ]);

    // Update section duration in minutes
    const lectures = await this.constructor
      .find({ sectionId: doc.sectionId, isActive: true })
      .select("duration");

    const totalDurationSeconds = lectures.reduce((sum, l) => sum + (l.duration || 0), 0);
    await Section.findByIdAndUpdate(doc.sectionId, {
      totalDuration: Math.round(totalDurationSeconds / 60),
    });

    next();
  } catch (err) {
    console.error("Error linking lecture to course/section:", err);
    next();
  }
});

//
// 🧱 Model Export
//
const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
