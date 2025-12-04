import Momentum from "../models/momentumModel.js";
import Course from "../models/courseModel.js";
import Review from "../models/reviewModel.js";
import Discussion from "../models/discussionModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * Momentum Service
 * Provides methods for calculating and managing course momentum metrics
 */

class MomentumService {
  /**
   * Calculate momentum data for a course based on actual metrics
   * @param {string} courseId - The ID of the course
   * @param {Date} date - The date for which to calculate momentum
   * @returns {Promise<Object>} Calculated momentum data
   */
  async calculateMomentumForDate(courseId, date) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get start and end of the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Use Promise.all for concurrent database queries to improve performance
      const [dailyReviews, dailyQuestions, usersEnrolledToday, lectures] = await Promise.all([
        // Get reviews for the day
        Review.countDocuments({
          course: courseId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }),
        
        // Get questions/discussions for the day
        Discussion.countDocuments({
          course: courseId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }),
        
        // Get enrollments for the day
        User.find({
          enrolledCourses: courseId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }),
        
        // Get lectures for this course
        Lecture.find({ courseId: courseId })
      ]);

      const dailyEnrollments = usersEnrolledToday.length;

      // Calculate completions using aggregation for better performance
      const completionResult = await Lecture.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
        { $unwind: "$progress" },
        {
          $match: {
            "progress.isCompleted": true,
            "progress.lastWatched": {
              $gte: startOfDay,
              $lte: endOfDay
            }
          }
        },
        { $count: "completions" }
      ]);

      const dailyCompletions = completionResult.length > 0 ? completionResult[0].completions : 0;

      return {
        date,
        enrollments: dailyEnrollments,
        completions: dailyCompletions,
        reviews: dailyReviews,
        questions: dailyQuestions
      };
    } catch (error) {
      throw new Error(`Failed to calculate momentum for date: ${error.message}`);
    }
  }

  /**
   * Update or create momentum record for a specific date
   * @param {string} courseId - The ID of the course
   * @param {Date} date - The date for which to update momentum
   * @param {Object} metrics - The metrics to update
   * @returns {Promise<Object>} Updated momentum record
   */
  async updateMomentumRecord(courseId, date, metrics) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Find existing momentum record or create new one
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      let momentumRecord = await Momentum.findOne({
        course: courseId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      if (momentumRecord) {
        // Update existing record
        Object.assign(momentumRecord, metrics);
      } else {
        // Create new record
        momentumRecord = new Momentum({
          course: courseId,
          date: startOfDay,
          ...metrics
        });
      }
      
      momentumRecord.calculateMomentumScore();
      momentumRecord.calculateEngagementRate();
      await momentumRecord.save();
      
      return momentumRecord;
    } catch (error) {
      throw new Error(`Failed to update momentum record: ${error.message}`);
    }
  }

  /**
   * Get momentum data for a course over a date range
   * @param {string} courseId - The ID of the course
   * @param {Date} startDate - Start date of the range
   * @param {Date} endDate - End date of the range
   * @returns {Promise<Array>} Array of momentum records
   */
  async getMomentumData(courseId, startDate, endDate) {
    try {
      const momentumData = await Momentum.getCourseMomentum(courseId, startDate, endDate);
      return momentumData;
    } catch (error) {
      throw new Error(`Failed to get momentum data: ${error.message}`);
    }
  }

  /**
   * Get aggregated momentum summary for a course
   * @param {string} courseId - The ID of the course
   * @param {number} days - Number of days to aggregate (default: 30)
   * @returns {Promise<Object>} Aggregated momentum summary
   */
  async getMomentumSummary(courseId, days = 30) {
    try {
      const aggregatedData = await Momentum.getAggregatedMomentum(courseId, days);
      return aggregatedData[0] || {};
    } catch (error) {
      throw new Error(`Failed to get momentum summary: ${error.message}`);
    }
  }

  /**
   * Generate momentum trend data for charting
   * @param {string} courseId - The ID of the course
   * @param {number} days - Number of days of data to generate (default: 30)
   * @returns {Promise<Array>} Formatted data for momentum charts
   */
  async generateMomentumTrend(courseId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const momentumData = await this.getMomentumData(courseId, startDate, endDate);
      
      // Format data for charting
      return momentumData.map(record => ({
        date: record.date.toISOString().split('T')[0],
        momentumScore: record.momentumScore,
        engagementRate: record.engagementRate,
        enrollments: record.enrollments,
        completions: record.completions,
        reviews: record.reviews,
        questions: record.questions
      }));
    } catch (error) {
      throw new Error(`Failed to generate momentum trend: ${error.message}`);
    }
  }

  /**
   * Calculate and update momentum data for a course based on actual metrics
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Object>} Updated momentum records
   */
  async calculateAndUpdateMomentum(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Calculate momentum for the last 30 days using Promise.all for concurrency
      const days = 30;
      const dates = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date);
      }

      // Calculate momentum data for all dates concurrently
      const momentumPromises = dates.map(date => 
        this.calculateMomentumForDate(courseId, date)
      );
      
      const momentumResults = await Promise.all(momentumPromises);

      // Update or create momentum records concurrently
      const updatePromises = momentumResults.map(result => 
        this.updateMomentumRecord(courseId, result.date, result)
      );
      
      const momentumRecords = await Promise.all(updatePromises);

      return momentumRecords;
    } catch (error) {
      throw new Error(`Failed to calculate and update momentum: ${error.message}`);
    }
  }
}

export default new MomentumService();