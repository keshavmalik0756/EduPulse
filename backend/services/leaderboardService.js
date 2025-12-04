import LeaderboardEntry from "../models/leaderboardModel.js";
import Course from "../models/courseModel.js";

/**
 * Course Leaderboard Service
 * Provides methods for calculating and managing course leaderboard rankings
 */

class LeaderboardService {
  /**
   * Calculate leaderboard data for all published courses
   * @returns {Promise<Array>} Array of leaderboard entries
   */
  async calculateLeaderboard() {
    try {
      const entries = await LeaderboardEntry.recalculateLeaderboard();
      return entries;
    } catch (error) {
      throw new Error(`Failed to calculate leaderboard: ${error.message}`);
    }
  }

  /**
   * Get leaderboard entries
   * @param {number} limit - Number of entries to retrieve (default: 10)
   * @param {string} category - Category to filter by (optional)
   * @returns {Promise<Array>} Array of leaderboard entries
   */
  async getLeaderboard(limit = 10, category = null) {
    try {
      let leaderboardData;
      
      if (category) {
        leaderboardData = await LeaderboardEntry.getLeaderboardByCategory(category, limit);
        // Filter out entries where course population failed
        leaderboardData = leaderboardData.filter(entry => entry.course);
      } else {
        leaderboardData = await LeaderboardEntry.getLeaderboard(limit);
      }
      
      return leaderboardData;
    } catch (error) {
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }
  }

  /**
   * Get leaderboard entry for a specific course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Object>} Leaderboard entry
   */
  async getCourseLeaderboardEntry(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Get leaderboard entry
      const leaderboardEntry = await LeaderboardEntry.findOne({ course: courseId })
        .populate({
          path: 'course',
          select: 'title category thumbnail averageRating totalEnrolled views revenue'
        });
      
      return leaderboardEntry;
    } catch (error) {
      throw new Error(`Failed to get course leaderboard entry: ${error.message}`);
    }
  }

  /**
   * Update leaderboard entry for a course with new metrics
   * @param {string} courseId - The ID of the course
   * @param {Object} metrics - The metrics to update
   * @returns {Promise<Object>} Updated leaderboard entry
   */
  async updateCourseLeaderboard(courseId, metrics) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
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
      
      return leaderboardEntry;
    } catch (error) {
      throw new Error(`Failed to update course leaderboard: ${error.message}`);
    }
  }

  /**
   * Get top performing courses by specific metric
   * @param {string} metric - The metric to sort by (revenue, rating, views, enrollments)
   * @param {number} limit - Number of entries to retrieve (default: 10)
   * @returns {Promise<Array>} Array of leaderboard entries
   */
  async getTopPerformingByMetric(metric, limit = 10) {
    try {
      // Validate metric
      const validMetrics = ['revenue', 'rating', 'views', 'enrollments'];
      if (!validMetrics.includes(metric)) {
        throw new Error("Invalid metric. Must be one of: revenue, rating, views, enrollments");
      }
      
      const leaderboardData = await LeaderboardEntry.find()
        .populate({
          path: 'course',
          select: 'title category thumbnail averageRating totalEnrolled views revenue'
        })
        .sort({ [metric]: -1 })
        .limit(limit);
      
      return leaderboardData;
    } catch (error) {
      throw new Error(`Failed to get top performing courses by metric: ${error.message}`);
    }
  }

  /**
   * Initialize leaderboard for all existing courses
   * @returns {Promise<Array>} Array of created leaderboard entries
   */
  async initializeLeaderboard() {
    try {
      const entries = await LeaderboardEntry.recalculateLeaderboard();
      return entries;
    } catch (error) {
      throw new Error(`Failed to initialize leaderboard: ${error.message}`);
    }
  }
}

export default new LeaderboardService();