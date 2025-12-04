import mongoose from "mongoose";

// ============================================================
// 📘 COURSE SCHEMA (EduPulse Platform – 2025 Optimized Edition)
// ============================================================
const courseSchema = new mongoose.Schema(
  {
    // 🔹 BASIC DETAILS
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    subTitle: {
      type: String,
      trim: true,
      maxlength: [250, "Subtitle cannot exceed 250 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // 🔹 CATEGORIZATION
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
      index: true,
    },
    subCategory: { type: String, trim: true },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, "Tag cannot exceed 100 characters"],
      },
    ],

    // 🔹 DIFFICULTY LEVEL
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all-levels"],
      default: "beginner",
      index: true, // Add index for better query performance
    },

    // 🔹 PRICING & DISCOUNT
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: [0, "Final price cannot be negative"],
    },

    // 🔹 MEDIA (Cloudinary-ready)
    thumbnail: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1723000000/default_course_thumbnail.webp",
    },
    banner: { type: String, default: "" },
    previewVideo: { type: String, default: "" },

    // 🔹 STRUCTURE (Relations)
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],

    // 🔹 METRICS
    totalLectures: { type: Number, default: 0 },
    totalDurationMinutes: { type: Number, default: 0, min: 0 },
    totalEnrolled: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    totalRatingSum: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },

    // 🔹 FEATURES
    hasCertificate: { type: Boolean, default: true },
    language: { type: String, default: "English", trim: true },

    // 🔹 RELATIONAL DATA
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course must have a creator"],
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    // 🔹 LEARNING INFO
    prerequisites: [
      { type: String, trim: true, maxlength: [500, "Too long prerequisite"] },
    ],
    learningOutcomes: [
      { type: String, trim: true, maxlength: [500, "Too long learning outcome"] },
    ],
    requirements: [
      { type: String, trim: true, maxlength: [500, "Too long requirement"] },
    ],

    // 🔹 STATUS
    isPublished: { type: Boolean, default: false, index: true }, // Add index for better query performance
    publishedDate: { type: Date },
    enrollmentStatus: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    isFeatured: { type: Boolean, default: false },

    // 🔹 ANALYTICS & FINANCE
    revenue: { type: Number, default: 0 },

    // 🔹 SEO META
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },

    // 🔹 SOFT DELETE SUPPORT
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
// ⚙️ PRE-SAVE HOOKS
// ============================================================

// 🔹 Auto-generate unique slug from title
courseSchema.pre("save", async function (next) {
  if ((!this.slug && this.title) || this.isModified("title")) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.models.Course.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // 🔹 Auto-calculate finalPrice before save
  if (this.price === 0) {
    this.finalPrice = 0;
  } else if (this.discount > 0) {
    this.finalPrice = Math.round(
      this.price - (this.price * this.discount) / 100
    );
  } else {
    this.finalPrice = this.price;
  }

  // 🔹 Auto-populate SEO fields
  if (!this.metaTitle) this.metaTitle = this.title;
  if (!this.metaDescription)
    this.metaDescription = this.shortDescription || this.description?.slice(0, 160);

  next();
});

// 🔹 Auto-calculate finalPrice on update
courseSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.price !== undefined || update.discount !== undefined) {
    const price = update.price ?? this.getUpdate().$set?.price ?? 0;
    const discount = update.discount ?? this.getUpdate().$set?.discount ?? 0;

    if (price === 0) {
      update.finalPrice = 0;
    } else if (discount > 0) {
      update.finalPrice = Math.round(price - (price * discount) / 100);
    } else {
      update.finalPrice = price;
    }

    this.setUpdate(update);
  }
  next();
});

// 🔹 Auto-exclude deleted courses from queries
courseSchema.pre(/^find/, function (next) {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// 🔹 Ensure enrolledStudents references are populated correctly
courseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'creator',
    select: 'name email avatar'
  });
  next();
});

// 🔹 Shortened description
courseSchema.virtual("shortDescription").get(function () {
  if (!this.description) return "";
  return this.description.length > 150
    ? this.description.substring(0, 147) + "..."
    : this.description;
});

// 🔹 Total sections count
courseSchema.virtual("totalSections").get(function () {
  return this.sections?.length || 0;
});

// 🔹 Enrollment count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledStudents?.length || 0;
});

// 🔹 Duration (formatted)
courseSchema.virtual("durationFormatted").get(function () {
  const totalMinutes = this.totalDurationMinutes || 0;
  if (totalMinutes === 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`.trim();
});

// 🔹 Friendly duration with unit (changed to always show hours and minutes)
courseSchema.virtual("durationWithUnit").get(function () {
  const totalMinutes = this.totalDurationMinutes || 0;
  if (totalMinutes === 0) return "0 minutes";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hours ${minutes} minutes`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else {
    return `${minutes} minutes`;
  }
});

// ============================================================
// 📊 METHODS (Instance Functions)
// ============================================================

// 🔹 Recalculate average rating dynamically
courseSchema.methods.recalculateRating = async function () {
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ course: this._id });

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);

  this.reviewsCount = total;
  this.totalRatingSum = sum;
  this.averageRating = total ? sum / total : 0;

  await this.save();
};

// 🔹 Recalculate duration and lectures count
courseSchema.methods.recalculateDurationAndLectures = async function () {
  const Lecture = mongoose.model("Lecture");
  const lectures = await Lecture.find({ courseId: this._id });
  
  this.totalLectures = lectures.length;
  this.totalDurationMinutes = Math.round(
    lectures.reduce((acc, l) => acc + (l.duration || 0), 0) / 60
  );
  await this.save();
};

// 🔹 Enroll user in course
courseSchema.methods.enrollUser = async function (userId) {
  if (!this.enrolledStudents.includes(userId)) {
    this.enrolledStudents.push(userId);
    this.totalEnrolled = this.enrolledStudents.length;
    await this.save();
  }
};

// ============================================================
// 📈 INDEXES (Performance + Search Optimization)
// ============================================================
courseSchema.index({
  title: "text",
  category: "text",
  tags: "text",
  description: "text",
});
courseSchema.index({ creator: 1, isPublished: 1, views: -1 });
courseSchema.index({ isDeleted: 1 });
courseSchema.index({ category: 1, subCategory: 1, level: 1 });

// ============================================================
// 📦 EXPORT MODEL
// ============================================================
const Course = mongoose.model("Course", courseSchema);
export default Course;


