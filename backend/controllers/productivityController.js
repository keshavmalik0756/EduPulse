import Productivity from "../models/productivityModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import moment from "moment-timezone";

// Get productivity data for an educator for a specific week
export const getEducatorProductivity = async (req, res) => {
  try {
    const { weekStartDate } = req.params;
    const educatorId = req.user._id;
    
    // Validate date
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }
    
    // Get productivity data
    const productivityData = await Productivity.getEducatorProductivity(educatorId, date);
    
    if (!productivityData) {
      return res.status(404).json({
        success: false,
        message: "No productivity data found for this week"
      });
    }
    
    res.status(200).json({
      success: true,
      data: productivityData,
      educator: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch educator productivity data",
      error: error.message
    });
  }
};

// Get productivity history for an educator
export const getProductivityHistory = async (req, res) => {
  try {
    const educatorId = req.user._id;
    const { limit = 12 } = req.query;
    
    // Get productivity history
    const history = await Productivity.getProductivityHistory(educatorId, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: history,
      educator: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch productivity history",
      error: error.message
    });
  }
};

// Get productivity summary for an educator
export const getProductivitySummary = async (req, res) => {
  try {
    const educatorId = req.user._id;
    const { weeks = 12 } = req.query;
    
    // Get productivity summary
    const summary = await Productivity.getProductivitySummary(educatorId, parseInt(weeks));
    
    if (!summary.length) {
      return res.status(200).json({
        success: true,
        data: {
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalCourses: 0,
          totalLectures: 0,
          totalNotes: 0,
          totalAssignments: 0,
          totalQuizzes: 0
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: summary[0],
      educator: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch productivity summary",
      error: error.message
    });
  }
};

// Update productivity data for an educator
export const updateEducatorProductivity = async (req, res) => {
  try {
    const { weekStartDate } = req.params;
    const metrics = req.body;
    const educatorId = req.user._id;
    
    // Validate date
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }
    
    // Update productivity data
    const productivityRecord = await Productivity.updateEducatorProductivity(educatorId, date, metrics);
    
    res.status(200).json({
      success: true,
      message: "Productivity data updated successfully",
      data: productivityRecord,
      educator: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update educator productivity data",
      error: error.message
    });
  }
};

// Get current week productivity data
export const getCurrentWeekProductivity = async (req, res) => {
  try {
    console.log("GET CURRENT WEEK PRODUCTIVITY endpoint called");
    console.log("User in request:", req.user);
    
    const educatorId = req.user._id;
    
    // Validate user
    if (!req.user || !req.user._id) {
      console.log("User not authenticated for productivity");
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    // Calculate the start of the current week (Monday) with timezone awareness
    // Use UTC timezone as default, but this could be customized per user
    const userTimezone = req.user?.timezone || 'UTC';
    const today = moment().tz(userTimezone);
    const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to subtract to get to Monday
    // If today is Sunday (0), we need to go back 6 days to get to previous Monday
    // For other days, we go back (dayOfWeek - 1) days to get to Monday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStartMoment = today.clone().subtract(daysToSubtract, 'days').startOf('day');
    const weekStartDate = weekStartMoment.toDate();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    console.log(`Calculating productivity for educator ${educatorId} from ${weekStartDate} to ${weekEndDate}`);
    
    // Import models dynamically to avoid circular dependencies
    const Course = (await import("../models/courseModel.js")).default;
    const Lecture = (await import("../models/lectureModel.js")).default;
    const Note = (await import("../models/noteModel.js")).default;
    
    // Calculate real metrics from actual data
    const coursesCreated = await Course.countDocuments({
      creator: educatorId,
      createdAt: { $gte: weekStartDate, $lt: weekEndDate }
    });

    // Get all courses created by this educator to find lectures in them
    const educatorCourses = await Course.find({
      creator: educatorId
    }).select('_id');

    const courseIds = educatorCourses.map(course => course._id);

    // Count lectures in educator's courses created during the week
    const lecturesUploaded = await Lecture.countDocuments({
      courseId: { $in: courseIds },
      createdAt: { $gte: weekStartDate, $lt: weekEndDate }
    });

    const notesUploaded = await Note.countDocuments({
      creator: educatorId,
      createdAt: { $gte: weekStartDate, $lt: weekEndDate }
    });

    // Placeholder values for assignments and quizzes (models don't exist yet)
    const assignmentsCreated = 0;
    const quizzesAdded = 0;
    
    // Get or create productivity data for the current week
    let productivityData = await Productivity.getEducatorProductivity(educatorId, weekStartDate);
    
    // If no data exists, create a new record with calculated values
    if (!productivityData) {
      console.log("Creating new productivity data");
      productivityData = new Productivity({
        educator: educatorId,
        weekStartDate: weekStartDate,
        coursesCreated,
        lecturesUploaded,
        notesUploaded,
        assignmentsCreated,
        quizzesAdded
      });
      // Calculate initial productivity score and category
      productivityData.calculateProductivityScore();
      productivityData.determineProductivityCategory();
      await productivityData.save();
    } else {
      console.log("Updating existing productivity data");
      // Update existing record with latest metrics
      productivityData.coursesCreated = coursesCreated;
      productivityData.lecturesUploaded = lecturesUploaded;
      productivityData.notesUploaded = notesUploaded;
      productivityData.assignmentsCreated = assignmentsCreated;
      productivityData.quizzesAdded = quizzesAdded;
      productivityData.calculateProductivityScore();
      productivityData.determineProductivityCategory();
      await productivityData.save();
    }
    
    // Calculate score breakdown for API response
    const normalizedCourses = Math.min(coursesCreated / 2, 1);
    const normalizedLectures = Math.min(lecturesUploaded / 10, 1);
    const normalizedNotes = Math.min(notesUploaded / 15, 1);
    const scoreBreakdown = (
      (normalizedCourses * 0.3) +
      (normalizedLectures * 0.4) +
      (normalizedNotes * 0.3)
    ) * 100;
    
    res.status(200).json({
      success: true,
      data: productivityData,
      educator: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      debug: {
        weekStartDate: weekStartDate.toISOString(),
        weekEndDate: weekEndDate.toISOString(),
        coursesCreated,
        lecturesUploaded,
        notesUploaded,
        normalizedCourses: normalizedCourses.toFixed(2),
        normalizedLectures: normalizedLectures.toFixed(2),
        normalizedNotes: normalizedNotes.toFixed(2),
        scoreCalculation: scoreBreakdown.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching current week productivity data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current week productivity data",
      error: error.message
    });
  }
};