import Engagement from "../models/engagementModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Get engagement data for a specific student in a course
export const getStudentEngagement = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
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
    
    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Get engagement data
    const engagementData = await Engagement.getStudentEngagement(studentId, courseId);
    
    if (!engagementData) {
      return res.status(404).json({
        success: false,
        message: "No engagement data found for this student in this course"
      });
    }
    
    res.status(200).json({
      success: true,
      data: engagementData,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching student engagement data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student engagement data",
      error: error.message
    });
  }
};

// Get all students in a course by engagement category
export const getStudentsByCategory = async (req, res) => {
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
    const validCategories = ["highly_engaged", "moderately_engaged", "low_engaged", "at_risk"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid engagement category"
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
    
    // Get students by category
    const students = await Engagement.getStudentsByCategory(courseId, category);
    
    res.status(200).json({
      success: true,
      data: students,
      category,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching students by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students by category",
      error: error.message
    });
  }
};

// Get engagement distribution for a course
export const getEngagementDistribution = async (req, res) => {
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
    
    res.status(200).json({
      success: true,
      data: formattedDistribution,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching engagement distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch engagement distribution",
      error: error.message
    });
  }
};

// Get at-risk students for a course
export const getAtRiskStudents = async (req, res) => {
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
    
    // Get at-risk students
    const atRiskStudents = await Engagement.getAtRiskStudents(courseId);
    
    res.status(200).json({
      success: true,
      data: atRiskStudents,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching at-risk students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch at-risk students",
      error: error.message
    });
  }
};

// Update engagement data for a student
export const updateStudentEngagement = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const metrics = req.body;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
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
    
    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Update engagement data
    const engagementRecord = await Engagement.updateStudentEngagement(studentId, courseId, metrics);
    
    res.status(200).json({
      success: true,
      message: "Student engagement data updated successfully",
      data: engagementRecord,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error updating student engagement data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student engagement data",
      error: error.message
    });
  }
};

// Get engagement summary for a course
export const getEngagementSummary = async (req, res) => {
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
    
    // Get all engagement data for the course
    const allEngagementData = await Engagement.find({ course: courseId });
    
    if (!allEngagementData.length) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          averageEngagementScore: 0,
          engagementDistribution: {
            highly_engaged: 0,
            moderately_engaged: 0,
            low_engaged: 0,
            at_risk: 0
          },
          atRiskStudents: 0
        }
      });
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
    
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        averageEngagementScore: Math.round(averageEngagementScore * 100) / 100,
        engagementDistribution,
        atRiskStudents
      },
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching engagement summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch engagement summary",
      error: error.message
    });
  }
};