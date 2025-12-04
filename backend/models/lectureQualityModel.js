import mongoose from "mongoose";

const lectureQualitySchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  // Quality metrics
  watchDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Calculated quality scores
  watchDurationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  engagementScoreNormalized: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  likeDislikeScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Overall quality score (0-100)
  qualityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Quality category
  qualityCategory: {
    type: String,
    enum: ["excellent", "good", "fair", "poor"],
    required: true
  },
  // Heat score for visualization
  heatScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  heatColor: {
    type: String,
    enum: ["green", "yellow", "orange", "red"],
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
lectureQualitySchema.index({ lecture: 1, qualityScore: -1 });
lectureQualitySchema.index({ course: 1, heatScore: -1 });
lectureQualitySchema.index({ qualityCategory: 1 });

// Calculate watch duration score (0-100)
lectureQualitySchema.methods.calculateWatchDurationScore = function() {
  if (this.totalDuration === 0) {
    this.watchDurationScore = 0;
    return 0;
  }
  
  // Calculate percentage of lecture watched
  const watchPercentage = Math.min((this.watchDuration / this.totalDuration) * 100, 100);
  
  // Convert to score (higher percentage = higher score)
  this.watchDurationScore = Math.round(watchPercentage);
  return this.watchDurationScore;
};

// Calculate like/dislike score (0-100)
lectureQualitySchema.methods.calculateLikeDislikeScore = function() {
  const totalInteractions = this.likes + this.dislikes;
  
  if (totalInteractions === 0) {
    this.likeDislikeScore = 50; // Neutral score when no interactions
    return 50;
  }
  
  // Calculate like ratio (0-100)
  const likeRatio = (this.likes / totalInteractions) * 100;
  this.likeDislikeScore = Math.round(likeRatio);
  return this.likeDislikeScore;
};

// Calculate engagement score (0-100)
lectureQualitySchema.methods.calculateEngagementScore = function() {
  // Engagement score is already provided, but we normalize it to 0-100
  this.engagementScoreNormalized = Math.min(Math.max(this.engagementScore, 0), 100);
  return this.engagementScoreNormalized;
};

// Calculate overall quality score based on weighted metrics
lectureQualitySchema.methods.calculateQualityScore = function() {
  // Calculate individual scores
  this.calculateWatchDurationScore();
  this.calculateLikeDislikeScore();
  this.calculateEngagementScore();
  
  // Weighted formula for quality score
  // Watch duration (40%), Engagement (30%), Likes/Dislikes (30%)
  const watchWeight = 0.4;
  const engagementWeight = 0.3;
  const likeDislikeWeight = 0.3;
  
  this.qualityScore = Math.min(Math.round(
    (this.watchDurationScore * watchWeight) +
    (this.engagementScoreNormalized * engagementWeight) +
    (this.likeDislikeScore * likeDislikeWeight)
  ), 100);
  
  return this.qualityScore;
};

// Determine quality category based on score
lectureQualitySchema.methods.determineQualityCategory = function() {
  if (this.qualityScore >= 85) {
    this.qualityCategory = "excellent";
  } else if (this.qualityScore >= 70) {
    this.qualityCategory = "good";
  } else if (this.qualityScore >= 50) {
    this.qualityCategory = "fair";
  } else {
    this.qualityCategory = "poor";
  }
  
  return this.qualityCategory;
};

// Calculate heat score and color for visualization
lectureQualitySchema.methods.calculateHeatScore = function() {
  // Heat score is the same as quality score for visualization
  this.heatScore = this.qualityScore;
  
  // Determine heat color based on score
  if (this.qualityScore >= 85) {
    this.heatColor = "green";
  } else if (this.qualityScore >= 70) {
    this.heatColor = "yellow";
  } else if (this.qualityScore >= 50) {
    this.heatColor = "orange";
  } else {
    this.heatColor = "red";
  }
  
  return this.heatScore;
};

// Pre-save hook to calculate scores and categories
lectureQualitySchema.pre("save", function(next) {
  if (this.isModified("watchDuration") || 
      this.isModified("totalDuration") || 
      this.isModified("likes") || 
      this.isModified("dislikes") || 
      this.isModified("engagementScore")) {
    this.calculateQualityScore();
    this.determineQualityCategory();
    this.calculateHeatScore();
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to get quality data for a lecture
lectureQualitySchema.statics.getLectureQuality = async function(lectureId) {
  return this.findOne({ lecture: lectureId });
};

// Static method to get quality data for all lectures in a course
lectureQualitySchema.statics.getCourseLectureQuality = async function(courseId) {
  return this.find({ course: courseId })
    .populate({
      path: 'lecture',
      select: 'title duration views'
    })
    .sort({ qualityScore: -1 });
};

// Static method to update lecture quality data
lectureQualitySchema.statics.updateLectureQuality = async function(lectureId, courseId, metrics) {
  let qualityRecord = await this.findOne({ lecture: lectureId });
  
  if (!qualityRecord) {
    qualityRecord = new this({
      lecture: lectureId,
      course: courseId,
      ...metrics
    });
  } else {
    Object.assign(qualityRecord, metrics);
  }
  
  qualityRecord.updatedAt = Date.now();
  await qualityRecord.save();
  return qualityRecord;
};

// Static method to get lectures by quality category
lectureQualitySchema.statics.getLecturesByQualityCategory = async function(courseId, category) {
  return this.find({ course: courseId, qualityCategory: category })
    .populate({
      path: 'lecture',
      select: 'title duration views'
    })
    .sort({ qualityScore: -1 });
};

const LectureQuality = mongoose.model("LectureQuality", lectureQualitySchema);
export default LectureQuality;