import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  // Metrics for ranking
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  enrollments: {
    type: Number,
    default: 0,
    min: 0
  },
  // Calculated leaderboard scores
  revenueScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  ratingScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  viewsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  enrollmentsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Overall composite score
  compositeScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Ranking position
  rank: {
    type: Number,
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
leaderboardEntrySchema.index({ compositeScore: -1 });
leaderboardEntrySchema.index({ rank: 1 });
leaderboardEntrySchema.index({ course: 1, createdAt: -1 });

// Calculate individual metric scores (0-100)
leaderboardEntrySchema.methods.calculateMetricScore = function(value, maxValue, weight = 1) {
  if (maxValue === 0) return 0;
  const normalized = Math.min(value / maxValue, 1);
  return Math.round(normalized * 100 * weight);
};

// Calculate composite score based on weighted metrics
leaderboardEntrySchema.methods.calculateCompositeScore = function(maxValues) {
  // Calculate individual scores
  this.revenueScore = this.calculateMetricScore(this.revenue, maxValues.maxRevenue, 0.3);
  this.ratingScore = this.calculateMetricScore(this.rating, maxValues.maxRating, 0.2);
  this.viewsScore = this.calculateMetricScore(this.views, maxValues.maxViews, 0.2);
  this.enrollmentsScore = this.calculateMetricScore(this.enrollments, maxValues.maxEnrollments, 0.3);
  
  // Calculate weighted composite score
  this.compositeScore = Math.min(Math.round(
    this.revenueScore * 0.3 +
    this.ratingScore * 0.2 +
    this.viewsScore * 0.2 +
    this.enrollmentsScore * 0.3
  ), 100);
  
  return this.compositeScore;
};

// Pre-save hook to update timestamps
leaderboardEntrySchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get leaderboard entries
leaderboardEntrySchema.statics.getLeaderboard = async function(limit = 10) {
  return this.find()
    .populate({
      path: 'course',
      select: 'title category thumbnail averageRating totalEnrolled views revenue'
    })
    .sort({ compositeScore: -1, rank: 1 })
    .limit(limit);
};

// Static method to get leaderboard by category
leaderboardEntrySchema.statics.getLeaderboardByCategory = async function(category, limit = 10) {
  return this.find()
    .populate({
      path: 'course',
      match: { category: category },
      select: 'title category thumbnail averageRating totalEnrolled views revenue'
    })
    .sort({ compositeScore: -1, rank: 1 })
    .limit(limit);
};

// Static method to update leaderboard for a course
leaderboardEntrySchema.statics.updateCourseLeaderboard = async function(courseId, metrics) {
  // Find existing entry or create new one
  let entry = await this.findOne({ course: courseId });
  
  if (!entry) {
    entry = new this({
      course: courseId,
      ...metrics
    });
  } else {
    Object.assign(entry, metrics);
  }
  
  // Update timestamps
  entry.updatedAt = Date.now();
  
  await entry.save();
  return entry;
};

// Static method to recalculate all leaderboard entries
leaderboardEntrySchema.statics.recalculateLeaderboard = async function() {
  // Get all courses with their metrics
  const Course = mongoose.model('Course');
  const courses = await Course.find({
    isPublished: true,
    isDeleted: false
  }).select('title category thumbnail averageRating totalEnrolled views revenue');
  
  if (courses.length === 0) return [];
  
  // Find maximum values for normalization
  const maxValues = {
    maxRevenue: Math.max(...courses.map(c => c.revenue || 0)),
    maxRating: Math.max(...courses.map(c => c.averageRating || 0)),
    maxViews: Math.max(...courses.map(c => c.views || 0)),
    maxEnrollments: Math.max(...courses.map(c => c.totalEnrolled || 0))
  };
  
  // Update or create leaderboard entries for each course
  const entries = [];
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const metrics = {
      revenue: course.revenue || 0,
      rating: course.averageRating || 0,
      views: course.views || 0,
      enrollments: course.totalEnrolled || 0
    };
    
    // Find existing entry or create new one
    let entry = await this.findOne({ course: course._id });
    
    if (!entry) {
      entry = new this({
        course: course._id,
        ...metrics
      });
    } else {
      Object.assign(entry, metrics);
    }
    
    // Calculate scores
    entry.calculateCompositeScore(maxValues);
    
    // Save entry
    await entry.save();
    entries.push(entry);
  }
  
  // Sort entries by composite score and assign ranks
  entries.sort((a, b) => b.compositeScore - a.compositeScore);
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    await entries[i].save();
  }
  
  return entries;
};

const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);
export default LeaderboardEntry;
