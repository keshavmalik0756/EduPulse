import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  // Completion percentage (0-100)
  completionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Time spent on course (in minutes)
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  // Number of lectures watched
  lecturesWatched: {
    type: Number,
    default: 0,
    min: 0
  },
  // Number of quizzes attempted
  quizzesAttempted: {
    type: Number,
    default: 0,
    min: 0
  },
  // Average quiz score
  averageQuizScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Number of assignments submitted
  assignmentsSubmitted: {
    type: Number,
    default: 0,
    min: 0
  },
  // Number of questions asked
  questionsAsked: {
    type: Number,
    default: 0,
    min: 0
  },
  // Number of discussions participated in
  discussionsParticipated: {
    type: Number,
    default: 0,
    min: 0
  },
  // Engagement score (0-100) - calculated based on all metrics
  engagementScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Engagement category
  engagementCategory: {
    type: String,
    enum: ["highly_engaged", "moderately_engaged", "low_engaged", "at_risk"],
    required: true
  },
  // Last updated timestamp
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
engagementSchema.index({ course: 1, student: 1 }, { unique: true });
engagementSchema.index({ course: 1, engagementCategory: 1 });
engagementSchema.index({ engagementScore: -1 });

// Calculate engagement score based on all metrics
engagementSchema.methods.calculateEngagementScore = function() {
  // Weighted formula for engagement score
  const completionWeight = 0.3;
  const timeWeight = 0.2;
  const activityWeight = 0.3;
  const participationWeight = 0.2;
  
  // Normalize metrics (assuming reasonable max values)
  const normalizedCompletion = this.completionPercentage / 100;
  const normalizedTime = Math.min(this.timeSpent / 600, 1); // Max 600 minutes (10 hours)
  const normalizedActivity = Math.min(
    (this.lecturesWatched + this.quizzesAttempted + this.assignmentsSubmitted) / 50, 
    1
  ); // Max 50 activities
  const normalizedParticipation = Math.min(
    (this.questionsAsked + this.discussionsParticipated) / 20, 
    1
  ); // Max 20 participations
  
  // Calculate weighted score
  const score = (
    (normalizedCompletion * completionWeight) +
    (normalizedTime * timeWeight) +
    (normalizedActivity * activityWeight) +
    (normalizedParticipation * participationWeight)
  ) * 100;
  
  this.engagementScore = Math.min(Math.max(Math.round(score), 0), 100);
  return this.engagementScore;
};

// Determine engagement category based on score and other factors
engagementSchema.methods.determineEngagementCategory = function() {
  // Primary factor: engagement score
  if (this.engagementScore >= 85) {
    this.engagementCategory = "highly_engaged";
  } else if (this.engagementScore >= 60) {
    this.engagementCategory = "moderately_engaged";
  } else if (this.engagementScore >= 30) {
    this.engagementCategory = "low_engaged";
  } else {
    this.engagementCategory = "at_risk";
  }
  
  // Secondary factors that can override the category
  // If completion is very low despite good engagement, still at risk
  if (this.completionPercentage < 10 && this.engagementCategory !== "at_risk") {
    this.engagementCategory = "at_risk";
  }
  
  // If no activity at all, definitely at risk
  if ((this.lecturesWatched + this.quizzesAttempted + this.assignmentsSubmitted) === 0) {
    this.engagementCategory = "at_risk";
  }
  
  return this.engagementCategory;
};

// Pre-save hook to calculate scores and categories
engagementSchema.pre("save", function(next) {
  if (this.isModified("completionPercentage") || 
      this.isModified("timeSpent") || 
      this.isModified("lecturesWatched") || 
      this.isModified("quizzesAttempted") || 
      this.isModified("averageQuizScore") || 
      this.isModified("assignmentsSubmitted") || 
      this.isModified("questionsAsked") || 
      this.isModified("discussionsParticipated")) {
    this.calculateEngagementScore();
    this.determineEngagementCategory();
  }
  this.lastUpdated = Date.now();
  next();
});

// Static method to get engagement data for a student in a course
engagementSchema.statics.getStudentEngagement = async function(studentId, courseId) {
  return this.findOne({ student: studentId, course: courseId });
};

// Static method to get all students in a course by engagement category
engagementSchema.statics.getStudentsByCategory = async function(courseId, category) {
  return this.find({ course: courseId, engagementCategory: category })
    .populate("student", "name email");
};

// Static method to get engagement distribution for a course
engagementSchema.statics.getEngagementDistribution = async function(courseId) {
  return this.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $group: {
        _id: "$engagementCategory",
        count: { $sum: 1 },
        averageScore: { $avg: "$engagementScore" }
      }
    }
  ]);
};

// Static method to get at-risk students
engagementSchema.statics.getAtRiskStudents = async function(courseId) {
  return this.find({ 
    course: courseId, 
    engagementCategory: "at_risk" 
  })
  .populate("student", "name email")
  .sort({ engagementScore: 1 });
};

// Static method to update engagement data for a student
engagementSchema.statics.updateStudentEngagement = async function(studentId, courseId, metrics) {
  let engagementRecord = await this.findOne({ student: studentId, course: courseId });
  
  if (!engagementRecord) {
    engagementRecord = new this({
      student: studentId,
      course: courseId,
      ...metrics
    });
  } else {
    Object.assign(engagementRecord, metrics);
  }
  
  engagementRecord.calculateEngagementScore();
  engagementRecord.determineEngagementCategory();
  engagementRecord.lastUpdated = Date.now();
  
  await engagementRecord.save();
  return engagementRecord;
};

const Engagement = mongoose.model("Engagement", engagementSchema);
export default Engagement;
