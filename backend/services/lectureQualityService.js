import LectureQuality from "../models/lectureQualityModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";

/**
 * Lecture Quality Service
 * Provides methods for calculating and managing lecture quality metrics
 */

class LectureQualityService {
  /**
   * Calculate quality data for a lecture
   * @param {string} lectureId - The ID of the lecture
   * @param {string} courseId - The ID of the course
   * @param {Object} metrics - The metrics to calculate quality from
   * @returns {Promise<Object>} Calculated quality data
   */
  async calculateLectureQuality(lectureId, courseId, metrics) {
    try {
      // Validate lecture
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        throw new Error("Lecture not found");
      }
      
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Create or update quality record
      let qualityRecord = await LectureQuality.getLectureQuality(lectureId);
      
      if (!qualityRecord) {
        qualityRecord = new LectureQuality({
          lecture: lectureId,
          course: courseId,
          ...metrics
        });
      } else {
        Object.assign(qualityRecord, metrics);
      }
      
      // Calculate scores and categories
      qualityRecord.calculateQualityScore();
      qualityRecord.determineQualityCategory();
      qualityRecord.calculateHeatScore();
      qualityRecord.updatedAt = Date.now();
      
      await qualityRecord.save();
      
      return qualityRecord;
    } catch (error) {
      throw new Error(`Failed to calculate lecture quality: ${error.message}`);
    }
  }

  /**
   * Get quality data for a specific lecture
   * @param {string} lectureId - The ID of the lecture
   * @returns {Promise<Object>} Quality data
   */
  async getLectureQuality(lectureId) {
    try {
      // Validate lecture
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        throw new Error("Lecture not found");
      }
      
      // Get quality data
      const qualityData = await LectureQuality.getLectureQuality(lectureId);
      return qualityData;
    } catch (error) {
      throw new Error(`Failed to get lecture quality: ${error.message}`);
    }
  }

  /**
   * Get quality data for all lectures in a course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Array>} Array of quality data
   */
  async getCourseLectureQuality(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Get quality data for all lectures in the course
      const qualityData = await LectureQuality.getCourseLectureQuality(courseId);
      return qualityData;
    } catch (error) {
      throw new Error(`Failed to get course lecture quality: ${error.message}`);
    }
  }

  /**
   * Update quality data for a lecture with new metrics
   * @param {string} lectureId - The ID of the lecture
   * @param {string} courseId - The ID of the course
   * @param {Object} metrics - The metrics to update
   * @returns {Promise<Object>} Updated quality data
   */
  async updateLectureQuality(lectureId, courseId, metrics) {
    try {
      // Validate lecture
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        throw new Error("Lecture not found");
      }
      
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Update quality data
      const qualityRecord = await LectureQuality.updateLectureQuality(lectureId, courseId, metrics);
      return qualityRecord;
    } catch (error) {
      throw new Error(`Failed to update lecture quality: ${error.message}`);
    }
  }

  /**
   * Get lectures by quality category
   * @param {string} courseId - The ID of the course
   * @param {string} category - The quality category
   * @returns {Promise<Array>} Array of quality data
   */
  async getLecturesByQualityCategory(courseId, category) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Validate category
      const validCategories = ["excellent", "good", "fair", "poor"];
      if (!validCategories.includes(category)) {
        throw new Error("Invalid category. Must be one of: excellent, good, fair, poor");
      }
      
      // Get lectures by quality category
      const qualityData = await LectureQuality.getLecturesByQualityCategory(courseId, category);
      return qualityData;
    } catch (error) {
      throw new Error(`Failed to get lectures by quality category: ${error.message}`);
    }
  }

  /**
   * Get quality heatmap data for a course
   * @param {string} courseId - The ID of the course
   * @returns {Promise<Array>} Array of heatmap data
   */
  async getQualityHeatmap(courseId) {
    try {
      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Get quality data for all lectures in the course
      const qualityData = await LectureQuality.getCourseLectureQuality(courseId);
      
      // Transform data for heatmap visualization
      const heatmapData = qualityData.map(quality => ({
        lectureId: quality.lecture._id,
        lectureTitle: quality.lecture.title,
        qualityScore: quality.qualityScore,
        heatScore: quality.heatScore,
        heatColor: quality.heatColor,
        watchDuration: quality.watchDuration,
        totalDuration: quality.totalDuration,
        likes: quality.likes,
        dislikes: quality.dislikes,
        engagementScore: quality.engagementScore
      }));
      
      return heatmapData;
    } catch (error) {
      throw new Error(`Failed to get quality heatmap: ${error.message}`);
    }
  }
}

export default new LectureQualityService();