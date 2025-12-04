import Productivity from "../models/productivityModel.js";
import User from "../models/userModel.js";
import moment from "moment-timezone";

/**
 * Educator Productivity Service
 * Provides methods for calculating and managing educator productivity metrics
 */

class ProductivityService {
  /**
   * Calculate productivity data for an educator for a specific week
   * @param {string} educatorId - The ID of the educator
   * @param {Date} weekStartDate - The start date of the week
   * @returns {Promise<Object>} Calculated productivity data
   */
  async calculateEducatorProductivity(educatorId, weekStartDate) {
    try {
      // Validate educator
      const educator = await User.findById(educatorId);
      if (!educator) {
        throw new Error("Educator not found");
      }

      // Calculate week end date
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

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

      // Create or update productivity record
      let productivityRecord = await Productivity.getEducatorProductivity(educatorId, weekStartDate);
      
      if (!productivityRecord) {
        productivityRecord = new Productivity({
          educator: educatorId,
          weekStartDate: weekStartDate
        });
      }

      // Update metrics with real data
      productivityRecord.coursesCreated = coursesCreated;
      productivityRecord.lecturesUploaded = lecturesUploaded;
      productivityRecord.notesUploaded = notesUploaded;
      productivityRecord.assignmentsCreated = assignmentsCreated;
      productivityRecord.quizzesAdded = quizzesAdded;

      // Recalculate productivity score and category
      productivityRecord.calculateProductivityScore();
      productivityRecord.determineProductivityCategory();
      productivityRecord.updatedAt = Date.now();

      await productivityRecord.save();

      return productivityRecord;
    } catch (error) {
      throw new Error(`Failed to calculate educator productivity: ${error.message}`);
    }
  }

  /**
   * Get productivity history for an educator
   * @param {string} educatorId - The ID of the educator
   * @param {number} limit - Number of weeks to retrieve (default: 12)
   * @returns {Promise<Array>} Array of productivity records
   */
  async getEducatorProductivityHistory(educatorId, limit = 12) {
    try {
      // Validate educator
      const educator = await User.findById(educatorId);
      if (!educator) {
        throw new Error("Educator not found");
      }

      // Get productivity history
      const history = await Productivity.getProductivityHistory(educatorId, limit);
      return history;
    } catch (error) {
      throw new Error(`Failed to get educator productivity history: ${error.message}`);
    }
  }

  /**
   * Update productivity data for an educator with specific metrics
   * @param {string} educatorId - The ID of the educator
   * @param {Date} weekStartDate - The start date of the week
   * @param {Object} metrics - The metrics to update
   * @returns {Promise<Object>} Updated productivity record
   */
  async updateEducatorProductivity(educatorId, weekStartDate, metrics) {
    try {
      // Validate educator
      const educator = await User.findById(educatorId);
      if (!educator) {
        throw new Error("Educator not found");
      }

      // Update productivity record
      const productivityRecord = await Productivity.updateEducatorProductivity(educatorId, weekStartDate, metrics);

      return productivityRecord;
    } catch (error) {
      throw new Error(`Failed to update educator productivity: ${error.message}`);
    }
  }

  /**
   * Get productivity summary for an educator
   * @param {string} educatorId - The ID of the educator
   * @param {number} weeks - Number of weeks to analyze (default: 12)
   * @returns {Promise<Object>} Productivity summary statistics
   */
  async getEducatorProductivitySummary(educatorId, weeks = 12) {
    try {
      // Validate educator
      const educator = await User.findById(educatorId);
      if (!educator) {
        throw new Error("Educator not found");
      }

      // Get productivity summary
      const summary = await Productivity.getProductivitySummary(educatorId, weeks);
      
      if (!summary.length) {
        return {
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalCourses: 0,
          totalLectures: 0,
          totalNotes: 0,
          totalAssignments: 0,
          totalQuizzes: 0
        };
      }
      
      return summary[0];
    } catch (error) {
      throw new Error(`Failed to get educator productivity summary: ${error.message}`);
    }
  }

  /**
   * Get current week productivity data for an educator
   * @param {string} educatorId - The ID of the educator
   * @returns {Promise<Object>} Current week productivity data
   */
  async getCurrentWeekProductivity(educatorId) {
    try {
      // Validate educator
      const educator = await User.findById(educatorId);
      if (!educator) {
        throw new Error("Educator not found");
      }

      // Calculate the start of the current week (Monday) with timezone awareness
      // Use UTC timezone as default, but this could be customized per user
      const userTimezone = 'UTC'; // In a real implementation, this would come from user settings
      const today = moment().tz(userTimezone);
      const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days to subtract to get to Monday
      // If today is Sunday (0), we need to go back 6 days to get to previous Monday
      // For other days, we go back (dayOfWeek - 1) days to get to Monday
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const weekStartMoment = today.clone().subtract(daysToSubtract, 'days').startOf('day');
      const weekStartDate = weekStartMoment.toDate();

      // Get productivity data for the current week
      let productivityData = await Productivity.getEducatorProductivity(educatorId, weekStartDate);

      // If no data exists, create a new record with default values
      if (!productivityData) {
        productivityData = new Productivity({
          educator: educatorId,
          weekStartDate: weekStartDate,
          coursesCreated: 0,
          lecturesUploaded: 0,
          notesUploaded: 0,
          assignmentsCreated: 0,
          quizzesAdded: 0
        });
        // Calculate initial productivity score and category
        productivityData.calculateProductivityScore();
        productivityData.determineProductivityCategory();
        await productivityData.save();
      }

      return productivityData;
    } catch (error) {
      throw new Error(`Failed to get current week productivity: ${error.message}`);
    }
  }

  /**
   * Generate productivity recommendations for improving educator productivity
   * @param {string} educatorId - The ID of the educator
   * @returns {Promise<Array>} List of recommendations
   */
  async generateRecommendations(educatorId) {
    try {
      // Get productivity summary
      const summary = await this.getEducatorProductivitySummary(educatorId);
      
      const recommendations = [];

      // Low overall productivity
      if (summary.averageScore < 50) {
        recommendations.push({
          type: "productivity",
          priority: "high",
          message: "Overall productivity is low",
          action: "Focus on consistent content creation and engagement with students"
        });
      }

      // Low course creation
      if (summary.totalCourses < 2) {
        recommendations.push({
          type: "content",
          priority: "medium",
          message: "Low course creation rate",
          action: "Set weekly goals for new course development"
        });
      }

      // Low lecture uploads
      if (summary.totalLectures < 5) {
        recommendations.push({
          type: "content",
          priority: "medium",
          message: "Low lecture upload rate",
          action: "Schedule regular lecture recording sessions"
        });
      }

      return recommendations;
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }
}

export default new ProductivityService();