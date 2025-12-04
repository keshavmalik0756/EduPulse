import Confusion from "../models/confusionModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";

/**
 * Confusion Detection Service
 * Provides methods for analyzing student behavior and detecting confusion points
 */

class ConfusionService {
  /**
   * Analyze lecture for confusion points based on student interactions
   * @param {string} lectureId - The ID of the lecture to analyze
   * @returns {Promise<Object>} Analysis results with confusion points
   */
  async analyzeLecture(lectureId) {
    try {
      // Get the lecture
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        throw new Error("Lecture not found");
      }

      // Get all confusion data for this lecture
      const confusionData = await Confusion.find({ lecture: lectureId })
        .sort({ timestamp: 1 });

      // Calculate overall confusion metrics
      const totalConfusionPoints = confusionData.length;
      const averageConfusionScore = confusionData.reduce((sum, point) => 
        sum + point.confusionScore, 0) / (totalConfusionPoints || 1);

      // Identify high-confusion segments (segments with confusion score > 70)
      const highConfusionSegments = confusionData.filter(point => 
        point.confusionScore > 70);

      // Identify the most problematic timestamp
      const mostProblematicPoint = confusionData.reduce((max, point) => 
        point.confusionScore > max.confusionScore ? point : max, 
        { confusionScore: 0 });

      return {
        lecture: {
          id: lecture._id,
          title: lecture.title,
          duration: lecture.duration
        },
        analysis: {
          totalConfusionPoints,
          averageConfusionScore: Math.round(averageConfusionScore * 100) / 100,
          highConfusionSegments: highConfusionSegments.length,
          mostProblematicTimestamp: mostProblematicPoint.timestamp || null,
          mostProblematicScore: mostProblematicPoint.confusionScore || 0
        },
        confusionPoints: confusionData.map(point => ({
          timestamp: point.timestamp,
          confusionScore: point.confusionScore,
          replayCount: point.replayCount,
          skipCount: point.skipCount,
          pauseCount: point.pauseCount,
          averageWatchTime: point.averageWatchTime
        }))
      };
    } catch (error) {
      throw new Error(`Failed to analyze lecture: ${error.message}`);
    }
  }

  /**
   * Analyze course for confusion patterns across all lectures
   * @param {string} courseId - The ID of the course to analyze
   * @returns {Promise<Object>} Course-level confusion analysis
   */
  async analyzeCourse(courseId) {
    try {
      // Get the course
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Get all lectures for this course
      const lectures = await Lecture.find({ courseId: courseId });
      const lectureIds = lectures.map(lecture => lecture._id);

      // Get all confusion data for this course
      const confusionData = await Confusion.find({ 
        lecture: { $in: lectureIds } 
      }).populate("lecture", "title");

      // Group confusion data by lecture
      const confusionByLecture = {};
      confusionData.forEach(point => {
        const lectureId = point.lecture._id.toString();
        if (!confusionByLecture[lectureId]) {
          confusionByLecture[lectureId] = {
            lecture: point.lecture,
            points: []
          };
        }
        confusionByLecture[lectureId].points.push(point);
      });

      // Calculate lecture-level confusion scores
      const lectureAnalysis = Object.values(confusionByLecture).map(lectureData => {
        const points = lectureData.points;
        const totalPoints = points.length;
        const averageScore = points.reduce((sum, point) => 
          sum + point.confusionScore, 0) / (totalPoints || 1);
        
        return {
          lecture: lectureData.lecture,
          totalConfusionPoints: totalPoints,
          averageConfusionScore: Math.round(averageScore * 100) / 100,
          highConfusionPoints: points.filter(p => p.confusionScore > 70).length
        };
      });

      // Sort by average confusion score (highest first)
      lectureAnalysis.sort((a, b) => b.averageConfusionScore - a.averageConfusionScore);

      // Overall course metrics
      const totalConfusionPoints = confusionData.length;
      const averageCourseConfusion = confusionData.reduce((sum, point) => 
        sum + point.confusionScore, 0) / (totalConfusionPoints || 1);

      return {
        course: {
          id: course._id,
          title: course.title
        },
        analysis: {
          totalConfusionPoints,
          averageCourseConfusion: Math.round(averageCourseConfusion * 100) / 100,
          mostProblematicLectures: lectureAnalysis.slice(0, 5)
        },
        lectureBreakdown: lectureAnalysis
      };
    } catch (error) {
      throw new Error(`Failed to analyze course: ${error.message}`);
    }
  }

  /**
   * Get confusion trend over time for a course
   * @param {string} courseId - The ID of the course
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Promise<Array>} Daily confusion metrics
   */
  async getConfusionTrend(courseId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get lectures for this course
      const lectures = await Lecture.find({ courseId: courseId });
      const lectureIds = lectures.map(lecture => lecture._id);

      // Aggregate confusion data by day using MongoDB aggregation for better performance
      const confusionTrend = await Confusion.aggregate([
        {
          $match: {
            lecture: { $in: lectureIds.map(id => new mongoose.Types.ObjectId(id)) },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            confusionPoints: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      // Format the results to match the expected structure
      return confusionTrend.map(day => ({
        date: day._id,
        confusionPoints: day.confusionPoints
      }));
    } catch (error) {
      throw new Error(`Failed to get confusion trend: ${error.message}`);
    }
  }

  /**
   * Generate recommendations for improving confusing content
   * @param {string} lectureId - The ID of the lecture
   * @returns {Promise<Array>} List of recommendations
   */
  async generateRecommendations(lectureId) {
    try {
      const analysis = await this.analyzeLecture(lectureId);
      const recommendations = [];

      // High overall confusion
      if (analysis.analysis.averageConfusionScore > 60) {
        recommendations.push({
          type: "content",
          priority: "high",
          message: "This lecture has high overall confusion. Consider breaking it into smaller segments.",
          action: "Review lecture structure and simplify complex concepts"
        });
      }

      // High replay count indicates difficult content
      const highReplayPoints = analysis.confusionPoints.filter(p => p.replayCount > 5);
      if (highReplayPoints.length > 0) {
        recommendations.push({
          type: "content",
          priority: "medium",
          message: `Found ${highReplayPoints.length} sections with high replay counts.`,
          action: "Add supplementary examples or visual aids to these sections"
        });
      }

      // High skip rate indicates boring or irrelevant content
      const highSkipPoints = analysis.confusionPoints.filter(p => p.skipCount > 3);
      if (highSkipPoints.length > 0) {
        recommendations.push({
          type: "engagement",
          priority: "medium",
          message: `Found ${highSkipPoints.length} sections with high skip rates.`,
          action: "Review content relevance and add interactive elements"
        });
      }

      // High pause rate indicates difficult content
      const highPausePoints = analysis.confusionPoints.filter(p => p.pauseCount > 4);
      if (highPausePoints.length > 0) {
        recommendations.push({
          type: "content",
          priority: "medium",
          message: `Found ${highPausePoints.length} sections with high pause rates.`,
          action: "Add checkpoints or knowledge checks in these sections"
        });
      }

      return recommendations;
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }
}

export default new ConfusionService();