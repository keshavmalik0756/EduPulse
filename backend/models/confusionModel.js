import mongoose from "mongoose";

const confusionSchema = new mongoose.Schema({
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
  // Timestamp where confusion occurs (in seconds)
  timestamp: {
    type: Number,
    required: true,
    min: 0
  },
  // Confusion metrics
  replayCount: {
    type: Number,
    default: 0,
    min: 0
  },
  skipCount: {
    type: Number,
    default: 0,
    min: 0
  },
  pauseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  averageWatchTime: {
    type: Number,
    default: 0,
    min: 0
  },
  // Fields for atomic average calculation
  watchTimeSum: {
    type: Number,
    default: 0,
    min: 0
  },
  watchTimeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Calculated confusion score (0-100)
  confusionScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Student interactions that contributed to this confusion point
  studentInteractions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // Type of interaction that indicated confusion
    interactionType: {
      type: String,
      enum: ["replay", "skip", "pause", "rewind"],
      required: true
    },
    // When the interaction occurred
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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
confusionSchema.index({ lecture: 1, timestamp: 1 });
confusionSchema.index({ course: 1, confusionScore: -1 });
confusionSchema.index({ lecture: 1, timestamp: 1, confusionScore: -1 }); // Added compound index for better performance

// Calculate confusion score based on metrics
confusionSchema.methods.calculateConfusionScore = function() {
  // Weighted formula for confusion score
  // Higher replay, skip, and pause counts increase confusion
  // Lower average watch time increases confusion
  const replayWeight = 0.3;
  const skipWeight = 0.25;
  const pauseWeight = 0.2;
  const watchTimeWeight = 0.25;
  
  // Normalize metrics (assuming reasonable max values)
  const normalizedReplay = Math.min(this.replayCount / 10, 1); // Max 10 replays
  const normalizedSkip = Math.min(this.skipCount / 5, 1); // Max 5 skips
  const normalizedPause = Math.min(this.pauseCount / 8, 1); // Max 8 pauses
  const normalizedWatchTime = Math.max(1 - (this.averageWatchTime / 60), 0); // Less than 60s avg watch time
  
  // Calculate weighted score
  const score = (
    (normalizedReplay * replayWeight) +
    (normalizedSkip * skipWeight) +
    (normalizedPause * pauseWeight) +
    (normalizedWatchTime * watchTimeWeight)
  ) * 100;
  
  this.confusionScore = Math.min(Math.max(Math.round(score), 0), 100);
  return this.confusionScore;
};

// Pre-save hook to calculate confusion score
confusionSchema.pre("save", function(next) {
  if (this.isModified("replayCount") || 
      this.isModified("skipCount") || 
      this.isModified("pauseCount") || 
      this.isModified("averageWatchTime")) {
    this.calculateConfusionScore();
  }
  this.updatedAt = Date.now();
  next();
});

const Confusion = mongoose.model("Confusion", confusionSchema);
export default Confusion;