import mongoose from "mongoose";

const momentumSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Daily metrics
  enrollments: {
    type: Number,
    default: 0,
    min: 0
  },
  completions: {
    type: Number,
    default: 0,
    min: 0
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  questions: {
    type: Number,
    default: 0,
    min: 0
  },
  // Calculated momentum score (0-100)
  momentumScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Engagement rate (completions/enrollments)
  engagementRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
momentumSchema.index({ course: 1, date: 1 });
momentumSchema.index({ course: 1, momentumScore: -1 });

// Calculate momentum score based on metrics
momentumSchema.methods.calculateMomentumScore = function() {
  // Weighted formula for momentum score
  // Higher enrollments, completions, reviews, and questions increase momentum
  const enrollmentWeight = 0.3;
  const completionWeight = 0.3;
  const reviewWeight = 0.2;
  const questionWeight = 0.2;
  
  // Normalize metrics (assuming reasonable max values for a day)
  const normalizedEnrollments = Math.min(this.enrollments / 50, 1); // Max 50 enrollments/day
  const normalizedCompletions = Math.min(this.completions / 30, 1); // Max 30 completions/day
  const normalizedReviews = Math.min(this.reviews / 20, 1); // Max 20 reviews/day
  const normalizedQuestions = Math.min(this.questions / 25, 1); // Max 25 questions/day
  
  // Calculate weighted score
  const score = (
    (normalizedEnrollments * enrollmentWeight) +
    (normalizedCompletions * completionWeight) +
    (normalizedReviews * reviewWeight) +
    (normalizedQuestions * questionWeight)
  ) * 100;
  
  this.momentumScore = Math.min(Math.max(Math.round(score), 0), 100);
  return this.momentumScore;
};

// Calculate engagement rate
momentumSchema.methods.calculateEngagementRate = function() {
  if (this.enrollments === 0) {
    this.engagementRate = 0;
  } else {
    this.engagementRate = Math.min(Math.round((this.completions / this.enrollments) * 100), 100);
  }
  return this.engagementRate;
};

// Pre-save hook to calculate scores
momentumSchema.pre("save", function(next) {
  if (this.isModified("enrollments") || 
      this.isModified("completions") || 
      this.isModified("reviews") || 
      this.isModified("questions")) {
    this.calculateMomentumScore();
    this.calculateEngagementRate();
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to get momentum data for a course over a date range
momentumSchema.statics.getCourseMomentum = async function(courseId, startDate, endDate) {
  return this.find({
    course: courseId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ date: 1 });
};

// Static method to get aggregated momentum data
momentumSchema.statics.getAggregatedMomentum = async function(courseId, days = 30) {
  try {
    // Validate the courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid course ID format");
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Convert courseId to ObjectId if it's a string
    const courseObjectId = typeof courseId === 'string' ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    const result = await this.aggregate([
      {
        $match: {
          course: courseObjectId,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          averageMomentum: { $avg: "$momentumScore" },
          averageEngagement: { $avg: "$engagementRate" },
          totalEnrollments: { $sum: "$enrollments" },
          totalCompletions: { $sum: "$completions" },
          totalReviews: { $sum: "$reviews" },
          totalQuestions: { $sum: "$questions" }
        }
      }
    ]);
    
    return result;
  } catch (error) {
    console.error("Error in getAggregatedMomentum:", error);
    throw new Error(`Failed to get aggregated momentum data: ${error.message}`);
  }
};

// Static method to get momentum trend data for sparklines
momentumSchema.statics.getMomentumTrend = async function(courseId, days = 30) {
  try {
    // Validate the courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid course ID format");
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Convert courseId to ObjectId if it's a string
    const courseObjectId = typeof courseId === 'string' ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    const result = await this.find({
      course: courseObjectId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ date: 1 })
    .select('date momentumScore engagementRate')
    .lean();
    
    return result;
  } catch (error) {
    console.error("Error in getMomentumTrend:", error);
    throw new Error(`Failed to get momentum trend data: ${error.message}`);
  }
};

const Momentum = mongoose.model("Momentum", momentumSchema);
export default Momentum;