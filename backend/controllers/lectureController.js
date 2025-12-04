// ===============================
// 🎓 LECTURE CONTROLLER (EduPulse)
// ===============================

import Lecture from "../models/lectureModel.js";
import mongoose from "mongoose";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
// Removed logActivity import

// ===============================
// 📌 CREATE LECTURE
// ===============================
export const createLecture = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      courseId,
      sectionId,
      order,
      difficulty,
      notes,
      isPreviewFree,
      prerequisites,
      type,
    } = req.body;

    // Basic validation
    if (!title || !description || !courseId || !sectionId || !duration || !order) {
      return res.status(400).json({
        success: false,
        message: "Title, description, courseId, sectionId, duration, and order are required.",
      });
    }

    // Check for order duplication within section (not full course)
    const existingOrder = await Lecture.findOne({ courseId, sectionId, order });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "A lecture with this order already exists in this section.",
      });
    }

    // ========== 📤 Upload Files to Cloudinary ==========
    let videoUrl = "";
    let thumbnailUrl = "";
    let originalVideoName = "";
    let videoSize = 0;
    let uploadedResources = [];

    if (req.files) {
      // normalize file fields (allow both 'video' and 'lessonVideo' and 'thumbnail' and 'resource')
      const videoFieldArray = req.files?.video || req.files?.lessonVideo || [];
      const thumbnailFieldArray = req.files?.thumbnail || req.files?.resource || [];
      const resourceFieldArray = req.files?.lectureResource || [];

      const videoFile = videoFieldArray[0] || null;
      const thumbFile = thumbnailFieldArray[0] || null;

      if (videoFile) {
        const uploaded = await uploadOnCloudinary(videoFile.path, "EduPulse/Lectures/Videos");
        videoUrl = uploaded?.url || "";
        originalVideoName = videoFile.originalname;
        videoSize = videoFile.size;
      }

      if (thumbFile) {
        const thumb = await uploadOnCloudinary(thumbFile.path, "EduPulse/Lectures/Thumbnails");
        thumbnailUrl = thumb?.url || "";
      }

      // Handle lecture resource uploads
      if (resourceFieldArray.length > 0) {
        for (const resourceFile of resourceFieldArray) {
          const uploaded = await uploadOnCloudinary(resourceFile.path, "EduPulse/Lectures/Resources");
          if (uploaded?.url) {
            uploadedResources.push({
              title: resourceFile.originalname,
              url: uploaded.url,
              type: getResourceType(resourceFile.originalname),
              size: resourceFile.size,
            });
          }
        }
      }
    }

    // Parse resources from request body (in addition to uploaded files)
    let allResources = [...uploadedResources];
    if (req.body.resources) {
      try {
        const bodyResources = Array.isArray(req.body.resources) 
          ? req.body.resources 
          : JSON.parse(req.body.resources);
          
        // Validate resources format
        const parsedResources = bodyResources.map(resource => ({
          title: resource.title?.trim() || 'Untitled Resource',
          url: resource.url,
          type: resource.type || 'document',
          size: resource.size || 0,
        })).filter(resource => resource.url); // Filter out resources without URLs
        
        // Merge with uploaded resources
        allResources = [...allResources, ...parsedResources];
      } catch (e) {
        console.warn("Invalid resources format:", e.message);
      }
    }

    // Parse prerequisites safely - now as strings instead of ObjectIds
    let prereq = [];
    if (prerequisites) {
      if (Array.isArray(prerequisites)) {
        // Filter out any non-string values and trim whitespace
        prereq = prerequisites.filter(item => typeof item === 'string').map(item => item.trim());
      } else {
        try { 
          const parsed = JSON.parse(prerequisites);
          if (Array.isArray(parsed)) {
            prereq = parsed.filter(item => typeof item === 'string').map(item => item.trim());
          }
        } catch(e) { 
          // If it's not a parseable array, treat it as a single string prerequisite
          if (typeof prerequisites === 'string') {
            prereq = [prerequisites.trim()];
          }
        }
      }
    }

    // ========== 💾 Create Lecture ==========
    const lecture = await Lecture.create({
      title,
      description,
      type: type || "video",
      videoUrl,
      videoSize,
      originalVideoName,
      isPreviewFree: isPreviewFree || false,
      duration,
      courseId,
      sectionId,
      order,
      thumbnail: thumbnailUrl || null,
      notes: notes || "",
      difficulty: difficulty || "beginner",
      prerequisites: prereq,
      resources: allResources, // Use allResources instead of resources
    });

    res.status(201).json({
      success: true,
      message: "✅ Lecture created successfully",
      data: lecture,
    });
  } catch (error) {
    console.error("❌ Create lecture error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A lecture with this order already exists in this section.",
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create lecture.",
    });
  }
};

// ===============================
// 📚 GET ALL LECTURES (Admin/Creator)
// ===============================
export const getAllLectures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      difficulty,
      isActive,
      search,
      sortBy = "order",
      sortOrder = "asc",
    } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (difficulty) query.difficulty = difficulty;
    if (isActive !== undefined) query.isActive = isActive === "true";

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [lectures, total] = await Promise.all([
      Lecture.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("courseId", "title")
        .lean(),
      Lecture.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        lectures,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalLectures: total,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get lectures error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lectures." });
  }
};

// ===============================
// 📘 GET LECTURES BY COURSE (with user progress)
// ===============================
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const lectures = await Lecture.getByCourse(courseId, null, userId, Number(page), Number(limit));
    const total = await Lecture.countDocuments({ courseId, isActive: true });

    // Add formatted duration to each lecture
    const lecturesWithFormattedDuration = lectures.map(lecture => ({
      ...lecture,
      durationFormatted: formatDuration(lecture.duration)
    }));

    res.status(200).json({
      success: true,
      data: {
        lectures: lecturesWithFormattedDuration,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalLectures: total,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get lectures by course error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch course lectures." });
  }
};

// Helper function to format duration in seconds to human readable format
const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}m`;
  }
};

// ===============================
// 🎬 GET SINGLE LECTURE DETAILS
// ===============================
export const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lecture ID." });
    }

    const lecture = await Lecture.findById(id)
      .populate("courseId", "title description");

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found." });
    }

    let response = lecture.toObject();
    if (userId) {
      response.userProgress = lecture.progress.find((p) => p.userId.toString() === userId.toString()) || null;
      response.completionPercentage = lecture.getCompletionPercentage(userId);
      response.isCompleted = lecture.isCompletedBy(userId);
    }

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("❌ Get lecture error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lecture details." });
  }
};

// ===============================
// 🛠️ UPDATE LECTURE
// ===============================
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lecture ID." });
    }

    // Validate lecture type if provided
    if (updates.type && !["video", "pdf", "document", "quiz", "link"].includes(updates.type)) {
      return res.status(400).json({ success: false, message: "Invalid lecture type." });
    }

    // Prevent duplicate order within section
    if (updates.order) {
      const lecture = await Lecture.findById(id);
      if (lecture && updates.order !== lecture.order) {
        const duplicate = await Lecture.findOne({
          courseId: lecture.courseId,
          sectionId: lecture.sectionId,
          order: updates.order,
          _id: { $ne: id },
        });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: "A lecture with this order already exists in this section.",
          });
        }
      }
    }

    // Handle file re-uploads (Cloudinary)
    if (req.files?.video && req.files.video[0]) {
      const uploaded = await uploadOnCloudinary(req.files.video[0].path, "EduPulse/Lectures/Videos");
      updates.videoUrl = uploaded?.url || "";
      updates.originalVideoName = req.files.video[0].originalname;
      updates.videoSize = req.files.video[0].size;
    }

    if (req.files?.thumbnail && req.files.thumbnail[0]) {
      const thumb = await uploadOnCloudinary(req.files.thumbnail[0].path, "EduPulse/Lectures/Thumbnails");
      updates.thumbnail = thumb?.url || "";
    }

    // Handle lecture resource uploads
    const resourceFieldArray = req.files?.lectureResource || [];
    if (resourceFieldArray.length > 0) {
      const newResources = [];
      for (const resourceFile of resourceFieldArray) {
        const uploaded = await uploadOnCloudinary(resourceFile.path, "EduPulse/Lectures/Resources");
        if (uploaded?.url) {
          newResources.push({
            title: resourceFile.originalname,
            url: uploaded.url,
            type: getResourceType(resourceFile.originalname),
            size: resourceFile.size,
          });
        }
      }
      
      // Merge new resources with existing ones
      if (updates.resources) {
        // If resources were provided in the request body, merge them
        try {
          const bodyResources = Array.isArray(updates.resources) 
            ? updates.resources 
            : JSON.parse(updates.resources);
            
          updates.resources = [...newResources, ...bodyResources];
        } catch (e) {
          updates.resources = newResources;
        }
      } else {
        // If no resources were provided in request body, use only uploaded resources
        updates.resources = newResources;
      }
    } else if (req.body.resources) {
      // Handle resources from request body only (no file uploads)
      try {
        updates.resources = Array.isArray(req.body.resources) 
          ? req.body.resources 
          : JSON.parse(req.body.resources);
          
        // Validate resources format
        updates.resources = updates.resources.map(resource => ({
          title: resource.title?.trim() || 'Untitled Resource',
          url: resource.url,
          type: resource.type || 'document',
          size: resource.size || 0,
        })).filter(resource => resource.url); // Filter out resources without URLs
      } catch (e) {
        console.warn("Invalid resources format:", e.message);
        delete updates.resources; // Remove invalid resources
      }
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedLecture) {
      return res.status(404).json({ success: false, message: "Lecture not found." });
    }

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully.",
      data: updatedLecture,
    });
  } catch (error) {
    console.error("❌ Update lecture error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A lecture with this order already exists in this section.",
      });
    }
    
    res.status(500).json({ success: false, message: error.message || "Failed to update lecture." });
  }
};

// ===============================
// 🗑️ DELETE LECTURE
// ===============================
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lecture ID." });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found." });

    // Delete from Cloudinary gracefully
    try {
      if (lecture.videoUrl) await deleteFromCloudinary(lecture.videoUrl);
    } catch (err) {
      console.warn("Video not found on Cloudinary:", err.message);
    }
    try {
      if (lecture.thumbnail) await deleteFromCloudinary(lecture.thumbnail);
    } catch (err) {
      console.warn("Thumbnail not found on Cloudinary:", err.message);
    }

    await Lecture.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Lecture deleted successfully." });
  } catch (error) {
    console.error("❌ Delete lecture error:", error);
    res.status(500).json({ success: false, message: "Failed to delete lecture." });
  }
};

// ===============================
// 🎯 UPDATE USER PROGRESS
// ===============================
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { watchedDuration } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid lecture ID." });

    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found." });

    await lecture.updateProgress(userId, watchedDuration);

    // Refetch to get updated values
    const updatedLecture = await Lecture.findById(id);
    const completionPercentage = updatedLecture.getCompletionPercentage(userId);
    const isCompleted = updatedLecture.isCompletedBy(userId);

    res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      data: {
        watchedDuration,
        completionPercentage,
        isCompleted,
        viewCount: updatedLecture.viewCount,
      },
    });
  } catch (error) {
    console.error("❌ Progress update error:", error);
    res.status(500).json({ success: false, message: "Failed to update progress." });
  }
};

// ===============================
// 📊 GET LECTURE STATISTICS
// ===============================
export const getLectureStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res.status(400).json({ success: false, message: "Invalid course ID." });

    const stats = await Lecture.getStatistics(courseId);
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalLectures: 0,
        totalDuration: 0,
        totalSize: 0,
        avgViewCount: 0,
        difficulties: [],
      },
    });
  } catch (error) {
    console.error("❌ Get statistics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch statistics." });
  }
};

// ===============================
// 🔄 REORDER LECTURES (Transaction-safe)
// ===============================
export const reorderLectures = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { courseId } = req.params;
    const { lectureOrders } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    if (!Array.isArray(lectureOrders) || !lectureOrders.length)
      return res.status(400).json({ success: false, message: "Valid lecture order array required." });

    session.startTransaction();

    for (const { lectureId, newOrder } of lectureOrders) {
      if (!mongoose.Types.ObjectId.isValid(lectureId))
        throw new Error("Invalid lecture ID in request.");

      const lecture = await Lecture.findById(lectureId).session(session);
      if (!lecture) throw new Error("Lecture not found.");
      
      // Check for duplicate order within the same section
      const duplicate = await Lecture.findOne({
        courseId,
        sectionId: lecture.sectionId,
        order: newOrder,
        _id: { $ne: lectureId },
      }).session(session);
      if (duplicate) throw new Error("Duplicate order within section");

      await Lecture.findByIdAndUpdate(
        lectureId,
        { order: newOrder },
        { session, runValidators: true }
      );
    }

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Lectures reordered successfully." });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Reorder error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to reorder lectures." });
  } finally {
    session.endSession();
  }
};

// ===============================
// 🚦 TOGGLE ACTIVE STATUS
// ===============================
export const toggleLectureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid lecture ID." });

    const lecture = await Lecture.findById(id);
    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found." });

    lecture.isActive = !lecture.isActive;
    await lecture.save();

    res.status(200).json({
      success: true,
      message: `Lecture ${lecture.isActive ? "activated" : "deactivated"} successfully.`,
      data: { isActive: lecture.isActive },
    });
  } catch (error) {
    console.error("❌ Toggle status error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle status." });
  }
};

const getResourceType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const pdfExtensions = ['pdf'];
  const documentExtensions = ['doc', 'docx', 'txt', 'rtf'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  
  if (pdfExtensions.includes(ext)) return 'pdf';
  if (documentExtensions.includes(ext)) return 'document';
  if (imageExtensions.includes(ext)) return 'image';
  if (videoExtensions.includes(ext)) return 'video';
  return 'other';
};