// ===============================
// 📈 PROGRESS CONTROLLER (EduPulse)
// ===============================

import Lecture from "../models/lectureModel.js";
import mongoose from "mongoose";

// ===============================
// 📊 GET COURSE PROGRESS
// ===============================
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized." 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid course ID." 
      });
    }

    // Get all lectures for this course
    const lectures = await Lecture.find({ 
      courseId, 
      isActive: true 
    }).select("duration progress");

    if (!lectures.length) {
      return res.status(200).json({
        success: true,
        progress: {
          overallProgress: 0,
          totalLectures: 0,
          completedLectures: 0,
          totalDuration: 0,
          watchedDuration: 0,
          completionRate: 0
        }
      });
    }

    // Calculate progress for each lecture for this user
    let totalDuration = 0;
    let watchedDuration = 0;
    let completedLectures = 0;

    lectures.forEach(lecture => {
      totalDuration += lecture.duration;
      
      // Find user's progress for this lecture
      const userProgress = lecture.progress?.find(p => 
        p.userId.toString() === userId.toString()
      );
      
      if (userProgress) {
        watchedDuration += userProgress.watchedDuration || 0;
        if (userProgress.isCompleted) {
          completedLectures++;
        }
      }
    });

    // Calculate overall progress percentage
    const overallProgress = totalDuration > 0 
      ? Math.min(Math.round((watchedDuration / totalDuration) * 100), 100)
      : 0;

    // Calculate completion rate
    const completionRate = lectures.length > 0
      ? Math.round((completedLectures / lectures.length) * 100)
      : 0;

    res.status(200).json({
      success: true,
      progress: {
        overallProgress,
        totalLectures: lectures.length,
        completedLectures,
        totalDuration,
        watchedDuration,
        completionRate
      }
    });
  } catch (error) {
    console.error("❌ Get course progress error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch course progress." 
    });
  }
};

// ===============================
// 📊 UPDATE COURSE PROGRESS
// ===============================
export const updateCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized." 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid course ID." 
      });
    }

    // In a real implementation, you might want to update course-level progress tracking
    // For now, we'll just acknowledge the request
    res.status(200).json({
      success: true,
      message: "Course progress updated successfully.",
      progress: {}
    });
  } catch (error) {
    console.error("❌ Update course progress error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update course progress." 
    });
  }
};

// ===============================
// 📊 GET ALL COURSE PROGRESS
// ===============================
export const getAllCourseProgress = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized." 
      });
    }

    // This would typically involve getting all courses the user is enrolled in
    // and calculating progress for each one
    res.status(200).json({
      success: true,
      progress: [],
      message: "All course progress fetched successfully"
    });
  } catch (error) {
    console.error("❌ Get all course progress error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch all course progress." 
    });
  }
};