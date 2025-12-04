import mongoose from "mongoose";

const productivitySchema = new mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  // Weekly metrics
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  },
  coursesCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  lecturesUploaded: {
    type: Number,
    default: 0,
    min: 0
  },
  notesUploaded: {
    type: Number,
    default: 0,
    min: 0
  },
  assignmentsCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  quizzesAdded: {
    type: Number,
    default: 0,
    min: 0
  },
  // Calculated productivity score (0-100)
  productivityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Productivity category
  productivityCategory: {
    type: String,
    enum: ["exceptional", "high", "moderate", "low", "needs_improvement"],
    required: true
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
productivitySchema.index({ educator: 1, weekStartDate: 1 }, { unique: true });
productivitySchema.index({ educator: 1, productivityScore: -1 });

// Calculate productivity score based on metrics
productivitySchema.methods.calculateProductivityScore = function() {
  // Weighted formula for productivity score
  // Adjusted weights since we only have courses, lectures, and notes
  const courseWeight = 0.3;
  const lectureWeight = 0.4;
  const noteWeight = 0.3;
  
  // Normalize metrics (assuming reasonable weekly targets)
  const normalizedCourses = Math.min(this.coursesCreated / 2, 1); // Max 2 courses/week
  const normalizedLectures = Math.min(this.lecturesUploaded / 10, 1); // Max 10 lectures/week
  const normalizedNotes = Math.min(this.notesUploaded / 15, 1); // Max 15 notes/week
  
  // Calculate weighted score
  const score = (
    (normalizedCourses * courseWeight) +
    (normalizedLectures * lectureWeight) +
    (normalizedNotes * noteWeight)
  ) * 100;
  
  this.productivityScore = Math.min(Math.max(Math.round(score), 0), 100);
  return this.productivityScore;
};

// Determine productivity category based on score
productivitySchema.methods.determineProductivityCategory = function() {
  if (this.productivityScore >= 90) {
    this.productivityCategory = "exceptional";
  } else if (this.productivityScore >= 75) {
    this.productivityCategory = "high";
  } else if (this.productivityScore >= 60) {
    this.productivityCategory = "moderate";
  } else if (this.productivityScore >= 40) {
    this.productivityCategory = "low";
  } else {
    this.productivityCategory = "needs_improvement";
  }
  
  return this.productivityCategory;
};

// Pre-save hook to calculate scores and categories
productivitySchema.pre("save", function(next) {
  if (this.isModified("coursesCreated") || 
      this.isModified("lecturesUploaded") || 
      this.isModified("notesUploaded") || 
      this.isModified("assignmentsCreated") || 
      this.isModified("quizzesAdded")) {
    this.calculateProductivityScore();
    this.determineProductivityCategory();
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to get productivity data for an educator for a specific week
productivitySchema.statics.getEducatorProductivity = async function(educatorId, weekStartDate) {
  return this.findOne({ educator: educatorId, weekStartDate: weekStartDate });
};

// Static method to get productivity history for an educator
productivitySchema.statics.getProductivityHistory = async function(educatorId, limit = 12) {
  return this.find({ educator: educatorId })
    .sort({ weekStartDate: -1 })
    .limit(limit);
};

// Static method to get productivity summary for an educator
productivitySchema.statics.getProductivitySummary = async function(educatorId, weeks = 12) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  return this.aggregate([
    {
      $match: {
        educator: new mongoose.Types.ObjectId(educatorId),
        weekStartDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$productivityScore" },
        highestScore: { $max: "$productivityScore" },
        lowestScore: { $min: "$productivityScore" },
        totalCourses: { $sum: "$coursesCreated" },
        totalLectures: { $sum: "$lecturesUploaded" },
        totalNotes: { $sum: "$notesUploaded" },
        totalAssignments: { $sum: "$assignmentsCreated" },
        totalQuizzes: { $sum: "$quizzesAdded" }
      }
    }
  ]);
};

// Static method to update productivity data for an educator
productivitySchema.statics.updateEducatorProductivity = async function(educatorId, weekStartDate, metrics) {
  // Use findOneAndUpdate with upsert to prevent race conditions
  const updatedRecord = await this.findOneAndUpdate(
    { educator: educatorId, weekStartDate: weekStartDate },
    { 
      $set: { 
        ...metrics,
        updatedAt: new Date()
      },
      $setOnInsert: {
        educator: educatorId,
        weekStartDate: weekStartDate,
        coursesCreated: metrics.coursesCreated || 0,
        lecturesUploaded: metrics.lecturesUploaded || 0,
        notesUploaded: metrics.notesUploaded || 0,
        assignmentsCreated: metrics.assignmentsCreated || 0,
        quizzesAdded: metrics.quizzesAdded || 0,
        productivityScore: 0, // Will be calculated in pre-save hook
        productivityCategory: 'needs_improvement' // Will be calculated in pre-save hook
      }
    },
    { 
      new: true, 
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
  
  return updatedRecord;
};

const Productivity = mongoose.model("Productivity", productivitySchema);
export default Productivity;