import mongoose from "mongoose";

const dropoutSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
    index: true
  },
  // Position in the course (lecture order)
  position: {
    type: Number,
    required: true,
    min: 0
  },
  // Historical completion rates at this point
  historicalCompletionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Predicted drop-off probability (0-100)
  dropoffProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Confidence level in the prediction (0-100)
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Factors contributing to drop-off risk
  riskFactors: [{
    factor: {
      type: String,
      enum: [
        "length", 
        "complexity", 
        "prerequisites", 
        "engagement", 
        "assessments",
        "content_density",
        "pacing"
      ]
    },
    weight: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  // Recommended interventions
  interventions: [{
    type: String,
    enum: [
      "break_down_content",
      "add_examples",
      "include_interactive_elements",
      "provide_additional_resources",
      "adjust_pacing",
      "add_assessment_checkpoint",
      "offer_peer_support"
    ]
  }],
  // Prediction method used
  predictionMethod: {
    type: String,
    enum: ["polynomial_regression", "moving_average", "hybrid"],
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
dropoutSchema.index({ course: 1, position: 1 });
dropoutSchema.index({ course: 1, dropoffProbability: -1 });

// Calculate drop-off probability based on factors
dropoutSchema.methods.calculateDropoffProbability = function() {
  // If no riskFactors, use historical completion fallback
  if (!this.riskFactors || this.riskFactors.length === 0) {
    this.dropoffProbability = Math.max(0, Math.min(100, 100 - this.historicalCompletionRate));
    return this.dropoffProbability;
  }

  const weightedSum = this.riskFactors.reduce((sum, f) => sum + (f.weight || 0) * 1.0, 0);
  const maxPossible = this.riskFactors.length * 100;
  const raw = Math.min(1, weightedSum / maxPossible); // 0..1

  // incorporate historicalCompletionRate as negative signal
  const historyPenalty = (100 - (this.historicalCompletionRate || 0)) / 100; // 0..1
  const combined = raw * 0.7 + historyPenalty * 0.3; // tunable

  this.dropoffProbability = Math.round(Math.min(Math.max(combined * 100, 0), 100));
  return this.dropoffProbability;
};

// Calculate confidence based on historical data and prediction method
dropoutSchema.methods.calculateConfidence = function() {
  // Confidence is higher with more historical data and certain prediction methods
  const historyFactor = Math.min(1, (this.historicalCompletionRate || 0) / 100); // 0-1
  const methodFactor = this.predictionMethod === "polynomial_regression" ? 0.85 : 
                      this.predictionMethod === "moving_average" ? 0.65 : 0.75;
  
  this.confidence = Math.round((0.6 * historyFactor + 0.4 * methodFactor) * 100);
  return this.confidence;
};

// Pre-save hook to calculate scores
dropoutSchema.pre("save", function(next) {
  if (this.isModified("riskFactors") || this.isModified("historicalCompletionRate")) {
    this.calculateDropoffProbability();
    this.calculateConfidence();
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to get drop-off predictions for a course
dropoutSchema.statics.getCourseDropouts = async function(courseId, threshold = 50) {
  return this.find({
    course: courseId,
    dropoffProbability: { $gte: threshold }
  })
  .sort({ position: 1 })
  .populate("lecture", "title order");
};

// Static method to get high-risk drop-off points
dropoutSchema.statics.getHighRiskDropouts = async function(courseId) {
  return this.find({
    course: courseId,
    dropoffProbability: { $gte: 70 }
  })
  .sort({ dropoffProbability: -1 })
  .populate("lecture", "title order");
};

const Dropout = mongoose.model("Dropout", dropoutSchema);
export default Dropout;