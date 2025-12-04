import Engagement from "../models/engagementModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

/**
 * Student Engagement Service
 * Provides methods for calculating and managing student engagement metrics
 */

class EngagementService {
  /**
   * Calculate engagement data for a student in a course
   * @param {string} studentId - The ID of the student
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Object>} Calculated engagement data
   */
  async calculateStudentEngagement(studentId, courseId) {
    try {
      // Validate student and course
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // For demonstration purposes, we'll simulate the data
      // In a real implementation, this would come from actual metrics
      
      // Simulate engagement metrics
      const completionPercentage = Math.floor(Math.random() * 100);
      const timeSpent = Math.floor(Math.random() * 600); // 0-600 minutes
      const lecturesWatched = Math.floor(Math.random() * 50);
      const quizzesAttempted = Math.floor(Math.random() * 20);
      const averageQuizScore = Math.floor(Math.random() * 100);
      const assignmentsSubmitted = Math.floor(Math.random() * 10);
      const questionsAsked = Math.floor(Math.random() * 5);
      const discussionsParticipated = Math.floor(Math.random() * 10);

      // Create or update engagement record
      let engagementRecord = await Engagement.getStudentEngagement(studentId, courseId);
      
      if (!engagementRecord) {
        engagementRecord = new Engagement({
          student: studentId,
          course: courseId
        });
      }

      // Update metrics
      engagementRecord.completionPercentage = completionPercentage;
      engagementRecord.timeSpent = timeSpent;
      engagementRecord.lecturesWatched = lecturesWatched;
      engagementRecord.quizzesAttempted = quizzesAttempted;
      engagementRecord.averageQuizScore = averageQuizScore;
      engagementRecord.assignmentsSubmitted = assignmentsSubmitted;
      engagementRecord.questionsAsked = questionsAsked;
      engagementRecord.discussionsParticipated = discussionsParticipated;

      // Recalculate engagement score and category
      engagementRecord.calculateEngagementScore();
      engagementRecord.determineEngagementCategory();
      engagementRecord.lastUpdated = Date.now();

      await engagementRecord.save();

      return engagementRecord;
    } catch (error) {
      throw new Error(`Failed to calculate student engagement: ${error.message}`);
    }
  }

  /**
   * Get engagement data for all students in a course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Array>} Array of engagement records
   */
  async getAllStudentsEngagement(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get all engagement data for this course
      const engagementData = await Engagement.find({ course: courseId })
        .populate("student", "name email");

      return engagementData;
    } catch (error) {
      throw new Error(`Failed to get all students engagement: ${error.message}`);
    }
  }

  /**
   * Update engagement data for a student with specific metrics
   * @param {string} studentId - The ID of the student
   * @param {string} courseId - The ID of the course
   * @param {Object} metrics - The metrics to update
   * @returns {Promise<Object>} Updated engagement record
   */
  async updateStudentEngagement(studentId, courseId, metrics) {
    try {
      // Validate student and course
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Update engagement record
      const engagementRecord = await Engagement.updateStudentEngagement(studentId, courseId, metrics);

      return engagementRecord;
    } catch (error) {
      throw new Error(`Failed to update student engagement: ${error.message}`);
    }
  }

  /**
   * Get students by engagement category
   * @param {string} courseId - The ID of the course
   * @param {string} category - The engagement category
   * @returns {Promise<Array>} Array of students in the category
   */
  async getStudentsByCategory(courseId, category) {
    try {
      // Validate category
      const validCategories = ["highly_engaged", "moderately_engaged", "low_engaged", "at_risk"];
      if (!validCategories.includes(category)) {
        throw new Error("Invalid engagement category");
      }

      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get students by category
      const students = await Engagement.getStudentsByCategory(courseId, category);
      return students;
    } catch (error) {
      throw new Error(`Failed to get students by category: ${error.message}`);
    }
  }

  /**
   * Get engagement distribution for a course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Object>} Engagement distribution data
   */
  async getEngagementDistribution(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get engagement distribution
      const distribution = await Engagement.getEngagementDistribution(courseId);
      
      // Format the response
      const formattedDistribution = {};
      distribution.forEach(item => {
        formattedDistribution[item._id] = {
          count: item.count,
          averageScore: Math.round(item.averageScore * 100) / 100
        };
      });
      
      return formattedDistribution;
    } catch (error) {
      throw new Error(`Failed to get engagement distribution: ${error.message}`);
    }
  }

  /**
   * Get at-risk students for a course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Array>} Array of at-risk students
   */
  async getAtRiskStudents(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get at-risk students
      const atRiskStudents = await Engagement.getAtRiskStudents(courseId);
      return atRiskStudents;
    } catch (error) {
      throw new Error(`Failed to get at-risk students: ${error.message}`);
    }
  }

  /**
   * Get engagement summary statistics
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Object>} Engagement summary statistics
   */
  async getEngagementSummary(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get all engagement data for the course
      const allEngagementData = await Engagement.find({ course: courseId });
      
      if (!allEngagementData.length) {
        return {
          totalStudents: 0,
          averageEngagementScore: 0,
          engagementDistribution: {
            highly_engaged: 0,
            moderately_engaged: 0,
            low_engaged: 0,
            at_risk: 0
          },
          atRiskStudents: 0
        };
      }
      
      // Calculate summary statistics
      const totalStudents = allEngagementData.length;
      const averageEngagementScore = allEngagementData.reduce((sum, engagement) => 
        sum + engagement.engagementScore, 0) / totalStudents;
      
      // Count by engagement category
      const engagementDistribution = {
        highly_engaged: allEngagementData.filter(e => e.engagementCategory === "highly_engaged").length,
        moderately_engaged: allEngagementData.filter(e => e.engagementCategory === "moderately_engaged").length,
        low_engaged: allEngagementData.filter(e => e.engagementCategory === "low_engaged").length,
        at_risk: allEngagementData.filter(e => e.engagementCategory === "at_risk").length
      };
      
      // Count at-risk students
      const atRiskStudents = engagementDistribution.at_risk;
      
      return {
        totalStudents,
        averageEngagementScore: Math.round(averageEngagementScore * 100) / 100,
        engagementDistribution,
        atRiskStudents
      };
    } catch (error) {
      throw new Error(`Failed to get engagement summary: ${error.message}`);
    }
  }

  /**
   * Generate engagement recommendations for improving student engagement
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Array>} List of recommendations
   */
  async generateRecommendations(courseId) {
    try {
      // Get engagement summary
      const summary = await this.getEngagementSummary(courseId);
      
      const recommendations = [];

      // High number of at-risk students
      if (summary.atRiskStudents > summary.totalStudents * 0.3) {
        recommendations.push({
          type: "intervention",
          priority: "high",
          message: "High number of at-risk students detected",
          action: "Implement targeted interventions for at-risk students"
        });
      }

      // Low overall engagement
      if (summary.averageEngagementScore < 50) {
        recommendations.push({
          type: "content",
          priority: "high",
          message: "Overall engagement is low",
          action: "Review course content and add more interactive elements"
        });
      }

      // Low number of highly engaged students
      if (summary.engagementDistribution.highly_engaged < summary.totalStudents * 0.1) {
        recommendations.push({
          type: "engagement",
          priority: "medium",
          message: "Few highly engaged students",
          action: "Add gamification elements and rewards for top performers"
        });
      }

      return recommendations;
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }
}

export default new EngagementService();