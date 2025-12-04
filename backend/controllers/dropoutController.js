import Dropout from "../models/dropoutModel.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import mongoose from "mongoose";

// Simple polynomial regression implementation
function polynomialRegression(x, y, degree = 2) {
  const n = x.length;
  if (n !== y.length || n < degree + 1) return null;

  // Create Vandermonde matrix
  const X = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j <= degree; j++) {
      row.push(Math.pow(x[i], j));
    }
    X.push(row);
  }

  // Transpose X
  const XT = X[0].map((_, i) => X.map(row => row[i]));

  // Calculate XT * X
  const XTX = XT.map(row => XT[0].map((_, j) => 
    row.reduce((sum, val, k) => sum + val * X[k][j], 0)
  ));

  // Calculate XT * y
  const XTy = XT.map(row => 
    row.reduce((sum, val, i) => sum + val * y[i], 0)
  );

  // Solve linear system XTX * coeffs = XTy using Gaussian elimination
  const augmented = XTX.map((row, i) => [...row, XTy[i]]);
  
  // Forward elimination
  for (let i = 0; i < augmented.length; i++) {
    // Find pivot
    let maxRow = i;
    for (let j = i + 1; j < augmented.length; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = j;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Eliminate column
    for (let j = i + 1; j < augmented.length; j++) {
      const factor = augmented[j][i] / augmented[i][i];
      for (let k = i; k < augmented[0].length; k++) {
        augmented[j][k] -= factor * augmented[i][k];
      }
    }
  }
  
  // Back substitution
  const coeffs = new Array(augmented.length);
  for (let i = augmented.length - 1; i >= 0; i--) {
    let sum = augmented[i][augmented[0].length - 1];
    for (let j = i + 1; j < augmented.length; j++) {
      sum -= augmented[i][j] * coeffs[j];
    }
    coeffs[i] = sum / augmented[i][i];
  }
  
  return coeffs;
}

// Simple moving average implementation
function movingAverage(data, windowSize) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const end = i + 1;
    const window = data.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  return result;
}

// Get dropout predictions for a course
export const getCourseDropouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { threshold = 50 } = req.query;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get dropout predictions
    const dropoutData = await Dropout.getCourseDropouts(courseId, parseInt(threshold));
    
    res.status(200).json({
      success: true,
      data: dropoutData,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching dropout predictions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dropout predictions",
      error: error.message
    });
  }
};

// Get high-risk dropout points
export const getHighRiskDropouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get high-risk dropout points
    const highRiskData = await Dropout.getHighRiskDropouts(courseId);
    
    res.status(200).json({
      success: true,
      data: highRiskData,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching high-risk dropouts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch high-risk dropout points",
      error: error.message
    });
  }
};

// Calculate dropout predictions using polynomial regression
export const calculatePolynomialDropouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get lectures for the course with progress data
    const lectures = await Lecture.find({ courseId: courseId })
      .sort({ order: 1 })
      .populate('progress'); // Populate progress data
    
    if (lectures.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Need at least 3 lectures to calculate dropout predictions"
      });
    }
    
    // Calculate real completion rates from progress data
    const positions = lectures.map((_, index) => index + 1);
    const completionRates = lectures.map(lecture => {
      if (!lecture.progress || lecture.progress.length === 0) {
        return null; // No progress data available
      }
      
      // Calculate completion rate based on progress data
      const completedCount = lecture.progress.filter(p => p.isCompleted).length;
      return Math.round((completedCount / lecture.progress.length) * 100);
    });
    
    // Filter out lectures with no progress data
    const validData = positions.map((pos, index) => ({
      position: pos,
      completionRate: completionRates[index]
    })).filter(item => item.completionRate !== null);
    
    if (validData.length < 3) {
      // Fallback to momentum data or previous dropout records if insufficient progress data
      return res.status(200).json({
        success: true,
        message: "Insufficient progress data for polynomial regression. Using fallback method.",
        data: [],
        fallback: true
      });
    }
    
    // Extract positions and rates for regression
    const validPositions = validData.map(item => item.position);
    const validRates = validData.map(item => item.completionRate);
    
    // Apply moving average to smooth the data
    const smoothedRates = movingAverage(validRates, 3);
    
    // Calculate polynomial regression coefficients
    const coeffs = polynomialRegression(validPositions, smoothedRates, 2);
    
    if (!coeffs) {
      return res.status(500).json({
        success: false,
        message: "Failed to calculate polynomial regression"
      });
    }
    
    // Predict dropout probabilities for each lecture
    const dropoutPredictions = [];
    for (let i = 0; i < lectures.length; i++) {
      const position = positions[i];
      const actualRate = completionRates[i];
      
      // Skip lectures with no progress data
      if (actualRate === null) {
        continue;
      }
      
      const predictedRate = coeffs.reduce((sum, coeff, power) => 
        sum + coeff * Math.pow(position, power), 0
      );
      
      // Dropout probability is inversely related to completion rate
      const dropoffProbability = Math.max(0, Math.min(100, 100 - predictedRate));
      
      // Risk factors based on real data
      const riskFactors = [];
      if (lectures[i].duration > 1800) { // Longer than 30 minutes
        riskFactors.push({ factor: "length", weight: Math.min(80, lectures[i].duration / 60) }); // Scale weight by duration
      }
      if (dropoffProbability > 70) {
        riskFactors.push({ factor: "engagement", weight: 70 });
      }
      if (actualRate < 50) {
        riskFactors.push({ factor: "complexity", weight: Math.min(80, 100 - actualRate) });
      }
      
      // Interventions based on risk factors
      const interventions = [];
      if (riskFactors.some(f => f.factor === "length")) {
        interventions.push("break_down_content");
      }
      if (riskFactors.some(f => f.factor === "engagement")) {
        interventions.push("include_interactive_elements");
      }
      if (riskFactors.some(f => f.factor === "complexity")) {
        interventions.push("add_examples");
      }
      
      // Check if a dropout prediction already exists for this lecture
      let dropoutPrediction = await Dropout.findOne({
        course: courseId,
        lecture: lectures[i]._id
      });
      
      if (dropoutPrediction) {
        // Update existing prediction
        dropoutPrediction.position = position;
        dropoutPrediction.historicalCompletionRate = actualRate;
        dropoutPrediction.dropoffProbability = dropoffProbability;
        dropoutPrediction.riskFactors = riskFactors;
        dropoutPrediction.interventions = interventions;
        dropoutPrediction.predictionMethod = "polynomial_regression";
      } else {
        // Create new prediction
        dropoutPrediction = new Dropout({
          course: courseId,
          lecture: lectures[i]._id,
          position: position,
          historicalCompletionRate: actualRate,
          dropoffProbability: dropoffProbability,
          riskFactors: riskFactors,
          interventions: interventions,
          predictionMethod: "polynomial_regression"
        });
      }
      
      dropoutPrediction.calculateConfidence();
      await dropoutPrediction.save();
      dropoutPredictions.push(dropoutPrediction);
    }
    
    res.status(200).json({
      success: true,
      message: "Dropout predictions calculated using polynomial regression",
      data: dropoutPredictions,
      coefficients: coeffs
    });
  } catch (error) {
    console.error("Error calculating polynomial dropout predictions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate dropout predictions",
      error: error.message
    });
  }
};

// Calculate dropout predictions using moving average
export const calculateMovingAverageDropouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { windowSize = 3 } = req.query;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get lectures for the course with progress data
    const lectures = await Lecture.find({ courseId: courseId })
      .sort({ order: 1 })
      .populate('progress');
    
    if (lectures.length < parseInt(windowSize)) {
      return res.status(400).json({
        success: false,
        message: `Need at least ${windowSize} lectures to calculate moving average`
      });
    }
    
    // Calculate real completion rates from progress data
    const completionRates = lectures.map(lecture => {
      if (!lecture.progress || lecture.progress.length === 0) {
        return null; // No progress data available
      }
      
      // Calculate completion rate based on progress data
      const completedCount = lecture.progress.filter(p => p.isCompleted).length;
      return Math.round((completedCount / lecture.progress.length) * 100);
    });
    
    // Filter out lectures with no progress data
    const validRates = completionRates.filter(rate => rate !== null);
    
    if (validRates.length === 0) {
      // Fallback to momentum data or previous dropout records if no progress data
      return res.status(200).json({
        success: true,
        message: "No progress data available. Using fallback method.",
        data: [],
        fallback: true
      });
    }
    
    // Calculate moving averages
    const movingAverages = movingAverage(validRates, parseInt(windowSize));
    
    // Predict dropout probabilities based on deviation from moving average
    const dropoutPredictions = [];
    let validIndex = 0; // Index for valid rates
    
    for (let i = 0; i < lectures.length; i++) {
      const actualRate = completionRates[i];
      
      // Skip lectures with no progress data
      if (actualRate === null) {
        continue;
      }
      
      const movingAvg = movingAverages[validIndex];
      validIndex++;
      
      // Dropout probability increases with negative deviation from moving average
      const deviation = movingAvg - actualRate;
      const dropoffProbability = Math.max(0, Math.min(100, deviation * 5)); // Scale factor
      
      // Risk factors based on real data
      const riskFactors = [];
      if (deviation > 10) {
        riskFactors.push({ factor: "engagement", weight: Math.min(80, deviation * 2) });
      }
      if (actualRate < 50) {
        riskFactors.push({ factor: "complexity", weight: Math.min(80, 100 - actualRate) });
      }
      if (lectures[i].duration > 1800) { // Longer than 30 minutes
        riskFactors.push({ factor: "length", weight: Math.min(80, lectures[i].duration / 60) });
      }
      
      // Interventions based on risk factors
      const interventions = [];
      if (riskFactors.some(f => f.factor === "engagement")) {
        interventions.push("include_interactive_elements");
      }
      if (riskFactors.some(f => f.factor === "complexity")) {
        interventions.push("add_examples");
      }
      if (riskFactors.some(f => f.factor === "length")) {
        interventions.push("break_down_content");
      }
      
      // Check if a dropout prediction already exists for this lecture
      let dropoutPrediction = await Dropout.findOne({
        course: courseId,
        lecture: lectures[i]._id
      });
      
      if (dropoutPrediction) {
        // Update existing prediction
        dropoutPrediction.position = i + 1;
        dropoutPrediction.historicalCompletionRate = actualRate;
        dropoutPrediction.dropoffProbability = dropoffProbability;
        dropoutPrediction.riskFactors = riskFactors;
        dropoutPrediction.interventions = interventions;
        dropoutPrediction.predictionMethod = "moving_average";
      } else {
        // Create new prediction
        dropoutPrediction = new Dropout({
          course: courseId,
          lecture: lectures[i]._id,
          position: i + 1,
          historicalCompletionRate: actualRate,
          dropoffProbability: dropoffProbability,
          riskFactors: riskFactors,
          interventions: interventions,
          predictionMethod: "moving_average"
        });
      }
      
      dropoutPrediction.calculateConfidence();
      await dropoutPrediction.save();
      dropoutPredictions.push(dropoutPrediction);
    }
    
    res.status(200).json({
      success: true,
      message: "Dropout predictions calculated using moving average",
      data: dropoutPredictions,
      windowSize: parseInt(windowSize)
    });
  } catch (error) {
    console.error("Error calculating moving average dropout predictions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate dropout predictions",
      error: error.message
    });
  }
};

// Get dropout prediction summary
export const getDropoutSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get all dropout predictions for the course
    const allDropouts = await Dropout.find({ course: courseId });
    
    if (allDropouts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalPredictions: 0,
          highRiskCount: 0,
          averageDropoffProbability: 0,
          highestRiskLecture: null
        },
        course: {
          id: course._id,
          title: course.title
        }
      });
    }
    
    // Calculate summary statistics
    const totalPredictions = allDropouts.length;
    const highRiskCount = allDropouts.filter(d => d.dropoffProbability >= 70).length;
    const averageDropoffProbability = allDropouts.reduce((sum, d) => 
      sum + d.dropoffProbability, 0) / totalPredictions;
    
    // Find highest risk lecture
    const highestRiskLecture = allDropouts.reduce((max, d) => 
      d.dropoffProbability > max.dropoffProbability ? d : max, allDropouts[0]);
    
    res.status(200).json({
      success: true,
      data: {
        totalPredictions,
        highRiskCount,
        averageDropoffProbability: Math.round(averageDropoffProbability * 100) / 100,
        highestRiskLecture: {
          lecture: highestRiskLecture.lecture,
          position: highestRiskLecture.position,
          dropoffProbability: highestRiskLecture.dropoffProbability,
          confidence: highestRiskLecture.confidence
        }
      },
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching dropout summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dropout summary",
      error: error.message
    });
  }
};