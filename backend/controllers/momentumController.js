import Momentum from "../models/momentumModel.js";
import Course from "../models/courseModel.js";
import Review from "../models/reviewModel.js";
import momentumService from "../services/momentumService.js";
import mongoose from "mongoose";

// Get momentum data for a specific course
export const getCourseMomentum = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { days = 30 } = req.query;
    
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
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get momentum data for this course
    const momentumData = await Momentum.getCourseMomentum(courseId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: momentumData,
      course: {
        id: course._id,
        title: course.title
      },
      period: {
        startDate,
        endDate,
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error("Error fetching course momentum data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch momentum data",
      error: error.message
    });
  }
};

// Get aggregated momentum summary for a course
export const getMomentumSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { days = 30 } = req.query;
    
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
    
    // Get aggregated momentum data
    const aggregatedData = await Momentum.getAggregatedMomentum(courseId, parseInt(days));
    
    res.status(200).json({
      success: true,
      data: aggregatedData[0] || {},
      course: {
        id: course._id,
        title: course.title
      },
      period: {
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error("Error fetching momentum summary:", error);
    // Send more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch momentum summary",
        error: error.message,
        stack: error.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch momentum summary",
      error: error.message
    });
  }
};

// Get momentum trend data for sparklines
export const getMomentumTrend = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { days = 30 } = req.query;
    
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
    
    // Get momentum trend data
    const trendData = await Momentum.getMomentumTrend(courseId, parseInt(days));
    
    res.status(200).json({
      success: true,
      data: trendData,
      course: {
        id: course._id,
        title: course.title
      },
      period: {
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error("Error fetching momentum trend:", error);
    // Send more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch momentum trend",
        error: error.message,
        stack: error.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch momentum trend",
      error: error.message
    });
  }
};

// Update or create momentum data for a specific date
export const updateMomentumData = async (req, res) => {
  try {
    const { courseId, date } = req.params;
    const { enrollments, completions, reviews, questions } = req.body;
    
    // Validate inputs
    if (!courseId || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: courseId, date"
      });
    }
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Validate date
    const momentumDate = new Date(date);
    if (isNaN(momentumDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
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
    
    // Find existing momentum record or create new one
    let momentumRecord = await Momentum.findOne({
      course: courseId,
      date: {
        $gte: new Date(momentumDate.setHours(0, 0, 0, 0)),
        $lt: new Date(momentumDate.setHours(23, 59, 59, 999))
      }
    });
    
    if (momentumRecord) {
      // Update existing record
      if (enrollments !== undefined) momentumRecord.enrollments = enrollments;
      if (completions !== undefined) momentumRecord.completions = completions;
      if (reviews !== undefined) momentumRecord.reviews = reviews;
      if (questions !== undefined) momentumRecord.questions = questions;
      
      await momentumRecord.save();
    } else {
      // Create new record
      momentumRecord = new Momentum({
        course: courseId,
        date: momentumDate,
        enrollments: enrollments || 0,
        completions: completions || 0,
        reviews: reviews || 0,
        questions: questions || 0
      });
      
      momentumRecord.calculateMomentumScore();
      momentumRecord.calculateEngagementRate();
      await momentumRecord.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Momentum data updated successfully",
      data: momentumRecord
    });
  } catch (error) {
    console.error("Error updating momentum data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update momentum data",
      error: error.message
    });
  }
};

// Get comparative momentum data for multiple courses
export const getComparativeMomentum = async (req, res) => {
  try {
    const { courseIds } = req.query;
    const { days = 30 } = req.query;
    
    // Validate course IDs
    let ids = [];
    if (typeof courseIds === 'string') {
      ids = courseIds.split(',');
    } else if (Array.isArray(courseIds)) {
      ids = courseIds;
    }
    
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one course ID is required"
      });
    }
    
    // Validate each course ID
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid course ID: ${id}`
        });
      }
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get momentum data for all courses
    const momentumData = await Momentum.find({
      course: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) },
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate("course", "title");
    
    // Group by course
    const groupedData = {};
    momentumData.forEach(record => {
      const courseId = record.course._id.toString();
      if (!groupedData[courseId]) {
        groupedData[courseId] = {
          course: record.course,
          data: []
        };
      }
      groupedData[courseId].data.push(record);
    });
    
    res.status(200).json({
      success: true,
      data: groupedData,
      period: {
        startDate,
        endDate,
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error("Error fetching comparative momentum data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comparative momentum data",
      error: error.message
    });
  }
};

// Calculate and update momentum data based on actual course metrics
export const calculateMomentumFromMetrics = async (req, res) => {
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
    
    // Calculate and update momentum data using the service
    const momentumRecords = await momentumService.calculateAndUpdateMomentum(courseId);
    
    res.status(200).json({
      success: true,
      message: "Momentum data calculated and saved successfully",
      data: momentumRecords
    });
  } catch (error) {
    console.error("Error calculating momentum from metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate momentum data",
      error: error.message
    });
  }
};