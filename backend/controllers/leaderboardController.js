import LeaderboardEntry from "../models/leaderboardModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";

// Get overall course leaderboard
export const getCourseLeaderboard = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    let leaderboardData;
    
    if (category) {
      // Get leaderboard for specific category
      leaderboardData = await LeaderboardEntry.getLeaderboardByCategory(category, parseInt(limit));
      // Filter out entries where course population failed
      leaderboardData = leaderboardData.filter(entry => entry.course);
    } else {
      // Get overall leaderboard
      leaderboardData = await LeaderboardEntry.getLeaderboard(parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      data: leaderboardData,
      count: leaderboardData.length,
      category: category || 'all'
    });
  } catch (error) {
    console.error("Error fetching course leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course leaderboard",
      error: error.message
    });
  }
};

// Get leaderboard entry for a specific course
export const getCourseLeaderboardEntry = async (req, res) => {
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
    
    // Get leaderboard entry
    const leaderboardEntry = await LeaderboardEntry.findOne({ course: courseId })
      .populate({
        path: 'course',
        select: 'title category thumbnail averageRating totalEnrolled views revenue'
      });
    
    if (!leaderboardEntry) {
      return res.status(404).json({
        success: false,
        message: "Leaderboard entry not found for this course"
      });
    }
    
    res.status(200).json({
      success: true,
      data: leaderboardEntry
    });
  } catch (error) {
    console.error("Error fetching course leaderboard entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course leaderboard entry",
      error: error.message
    });
  }
};

// Recalculate entire leaderboard
export const recalculateLeaderboard = async (req, res) => {
  try {
    // Only allow admin to recalculate leaderboard
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can recalculate leaderboard."
      });
    }
    
    const entries = await LeaderboardEntry.recalculateLeaderboard();
    
    res.status(200).json({
      success: true,
      message: "Leaderboard recalculated successfully",
      data: entries,
      count: entries.length
    });
  } catch (error) {
    console.error("Error recalculating leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recalculate leaderboard",
      error: error.message
    });
  }
};

// Update leaderboard entry for a course
export const updateCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { revenue, rating, views, enrollments } = req.body;
    
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
    
    // Prepare metrics object
    const metrics = {};
    if (revenue !== undefined) metrics.revenue = revenue;
    if (rating !== undefined) metrics.rating = rating;
    if (views !== undefined) metrics.views = views;
    if (enrollments !== undefined) metrics.enrollments = enrollments;
    
    // Update leaderboard entry
    const leaderboardEntry = await LeaderboardEntry.updateCourseLeaderboard(courseId, metrics);
    
    // Recalculate scores
    const allEntries = await LeaderboardEntry.find();
    if (allEntries.length > 0) {
      const maxValues = {
        maxRevenue: Math.max(...allEntries.map(e => e.revenue)),
        maxRating: Math.max(...allEntries.map(e => e.rating)),
        maxViews: Math.max(...allEntries.map(e => e.views)),
        maxEnrollments: Math.max(...allEntries.map(e => e.enrollments))
      };
      
      leaderboardEntry.calculateCompositeScore(maxValues);
      await leaderboardEntry.save();
      
      // Recalculate ranks for all entries
      const sortedEntries = await LeaderboardEntry.find().sort({ compositeScore: -1 });
      for (let i = 0; i < sortedEntries.length; i++) {
        sortedEntries[i].rank = i + 1;
        await sortedEntries[i].save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Leaderboard entry updated successfully",
      data: leaderboardEntry
    });
  } catch (error) {
    console.error("Error updating course leaderboard entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course leaderboard entry",
      error: error.message
    });
  }
};

// Get top performing courses by metric
export const getTopPerformingByMetric = async (req, res) => {
  try {
    const { metric, limit = 10 } = req.query;
    
    // Validate metric
    const validMetrics = ['revenue', 'rating', 'views', 'enrollments'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: "Invalid metric. Must be one of: revenue, rating, views, enrollments"
      });
    }
    
    const leaderboardData = await LeaderboardEntry.find()
      .populate({
        path: 'course',
        select: 'title category thumbnail averageRating totalEnrolled views revenue'
      })
      .sort({ [metric]: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: leaderboardData,
      metric: metric,
      count: leaderboardData.length
    });
  } catch (error) {
    console.error("Error fetching top performing courses by metric:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top performing courses by metric",
      error: error.message
    });
  }
};