import LectureQuality from "../models/lectureQualityModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";

// Get quality data for a specific lecture
export const getLectureQuality = async (req, res) => {
  try {
    const { lectureId } = req.params;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Get quality data
    const qualityData = await LectureQuality.getLectureQuality(lectureId);
    
    if (!qualityData) {
      return res.status(404).json({
        success: false,
        message: "Quality data not found for this lecture"
      });
    }
    
    res.status(200).json({
      success: true,
      data: qualityData,
      lecture: {
        id: lecture._id,
        title: lecture.title,
        duration: lecture.duration
      }
    });
  } catch (error) {
    console.error("Error fetching lecture quality data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lecture quality data",
      error: error.message
    });
  }
};

// Get quality data for all lectures in a course
export const getCourseLectureQuality = async (req, res) => {
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
    
    // Get quality data for all lectures in the course
    const qualityData = await LectureQuality.getCourseLectureQuality(courseId);
    
    res.status(200).json({
      success: true,
      data: qualityData,
      course: {
        id: course._id,
        title: course.title
      },
      count: qualityData.length
    });
  } catch (error) {
    console.error("Error fetching course lecture quality data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course lecture quality data",
      error: error.message
    });
  }
};

// Update quality data for a lecture
export const updateLectureQuality = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { watchDuration, totalDuration, likes, dislikes, engagementScore } = req.body;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Get course ID from lecture
    const courseId = lecture.courseId;
    
    // Prepare metrics object
    const metrics = {};
    if (watchDuration !== undefined) metrics.watchDuration = watchDuration;
    if (totalDuration !== undefined) metrics.totalDuration = totalDuration;
    if (likes !== undefined) metrics.likes = likes;
    if (dislikes !== undefined) metrics.dislikes = dislikes;
    if (engagementScore !== undefined) metrics.engagementScore = engagementScore;
    
    // Update quality data
    const qualityRecord = await LectureQuality.updateLectureQuality(lectureId, courseId, metrics);
    
    res.status(200).json({
      success: true,
      message: "Lecture quality data updated successfully",
      data: qualityRecord,
      lecture: {
        id: lecture._id,
        title: lecture.title
      }
    });
  } catch (error) {
    console.error("Error updating lecture quality data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lecture quality data",
      error: error.message
    });
  }
};

// Get lectures by quality category
export const getLecturesByQualityCategory = async (req, res) => {
  try {
    const { courseId, category } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Validate category
    const validCategories = ["excellent", "good", "fair", "poor"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: excellent, good, fair, poor"
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
    
    // Get lectures by quality category
    const qualityData = await LectureQuality.getLecturesByQualityCategory(courseId, category);
    
    res.status(200).json({
      success: true,
      data: qualityData,
      course: {
        id: course._id,
        title: course.title
      },
      category: category,
      count: qualityData.length
    });
  } catch (error) {
    console.error("Error fetching lectures by quality category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lectures by quality category",
      error: error.message
    });
  }
};

// Get quality heatmap data for a course
export const getQualityHeatmap = async (req, res) => {
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
    
    res.status(200).json({
      success: true,
      data: heatmapData,
      course: {
        id: course._id,
        title: course.title
      },
      count: heatmapData.length
    });
  } catch (error) {
    console.error("Error fetching quality heatmap data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quality heatmap data",
      error: error.message
    });
  }
};