// =======================================
// 📝 NOTE CONTROLLER (EduPulse Platform)
// =======================================

import mongoose from "mongoose";
import Note from "../models/noteModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

// =======================================
// 📌 CREATE NOTE (Educator/Enrolled Students Only)
// =======================================
export const createNote = async (req, res) => {
  try {
    const { title, content, lectureId, courseId, isPublic, tags } = req.body;
    const userId = req.user._id;
    const file = req.file || null;

    // Basic Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required.",
      });
    }

    // Require at least one context: lectureId or courseId
    if (!lectureId && !courseId) {
      return res.status(400).json({
        success: false,
        message: "Either lectureId or courseId is required.",
      });
    }

    let course = null;
    let lecture = null;

    if (lectureId) {
      // Validate lecture
      lecture = await Lecture.findById(lectureId);
      if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found." });

      // Validate course from lecture and populate creator
      course = await Course.findById(lecture.courseId).populate('creator', '_id');
      if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    } else if (courseId) {
      // Course-level note (no lecture) - populate creator
      course = await Course.findById(courseId).populate('creator', '_id');
      if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Role-based permission check
    // Educators (course creators) and admins can create notes without enrollment
    const isCreator = course.creator._id 
      ? course.creator._id.toString() === userId.toString()
      : course.creator.toString() === userId.toString();
    const isEducator = req.user.role === "educator" && isCreator;
    const isAdmin = req.user.role === "admin";
    const isEnrolled = course.enrolledStudents?.some(
      (id) => id.toString() === userId.toString()
    );
    
    if (!isEducator && !isAdmin && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to create notes.",
      });
    }

    // 🏷️ Process tags
    const processedTags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];

    // 📄 Upload PDF to Cloudinary
    let fileUrl = null,
      fileSize = null,
      fileType = null;

    if (file) {
      try {
        // Force PDF uploads to use raw resource type to prevent 401 errors
        const uploadResult = await uploadOnCloudinary(
          file.buffer,
          "EduPulse/EduPulse/Notes",
          file.originalname,
          { resource_type: "raw", format: "pdf" }
        );
        if (uploadResult?.url) {
          fileUrl = uploadResult.url;
          fileSize = file.size;
          fileType = "pdf"; // explicitly set to pdf
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to upload file to Cloudinary.",
        });
      }
    } else {
      // If no file provided, it's a text-only note
      console.warn("No file provided for note creation - creating text-only note");
    }

    // Validate that fileUrl is provided if this is a file-based note
    if (file && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required for notes.",
      });
    }

    // 💾 Create Note
    const noteData = {
      title: title.trim(),
      description: req.body.description?.trim() || "",
      content: content.trim(),
      // Link lecture only if provided
      lecture: lectureId || undefined,
      course: lecture ? lecture.courseId : course._id,
      creator: userId,
      isPublic: Boolean(isPublic),
      tags: processedTags,
    };

    // Only add file-related fields if a file was uploaded
    if (fileUrl) {
      noteData.fileUrl = fileUrl;
      noteData.fileSize = fileSize;
      noteData.fileType = fileType;
    }

    const note = await Note.create(noteData);

    res.status(201).json({
      success: true,
      message: "✅ Note created successfully.",
      data: note,
    });
  } catch (error) {
    console.error("❌ Create Note Error:", error);
    res.status(500).json({ success: false, message: "Failed to create note." });
  }
};

// =======================================
// 📚 GET NOTES BY LECTURE (Secure/Internal)
// =======================================
export const getNotesByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture ID." });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found." });

    // 🔒 Only public or own notes (unless admin)
    const query = { lecture: lectureId, isDeleted: false };
    if (userRole !== "admin") {
      query.$or = [{ creator: userId }, { isPublic: true }];
    }

    const notes = await Note.find(query)
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("❌ Get Notes by Lecture Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lecture notes." });
  }
};

// =======================================
// 📘 GET NOTES BY COURSE
// =======================================
export const getNotesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const query = { course: courseId, isDeleted: false };
    if (userRole !== "admin") {
      query.$or = [{ creator: userId }, { isPublic: true }];
    }

    const notes = await Note.find(query)
      .populate("creator", "name email avatar")
      .populate("lecture", "title order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("❌ Get Notes by Course Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch course notes." });
  }
};

// =======================================
// 🙋‍♂️ GET USER NOTES
// =======================================
export const getUserNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lectureId } = req.query;

    const query = { creator: userId, isDeleted: false };
    if (courseId) query.course = courseId;
    if (lectureId) query.lecture = lectureId;

    const notes = await Note.find(query)
      .populate("lecture", "title order")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("❌ Get User Notes Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user notes." });
  }
};

// =======================================
// 🔍 GET NOTE BY ID (Access Control Enforced)
// =======================================
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID." });
    }

    const note = await Note.findById(id)
      .populate("creator", "name email avatar")
      .populate("lecture", "title order courseId")
      .populate("course", "title creator");

    if (!note || note.isDeleted) {
      return res.status(404).json({ success: false, message: "Note not found." });
    }

    // 🔒 Permission check
    const isOwner = note.creator._id.toString() === userId?.toString();
    const isCourseCreator = note.course?.creator?.toString() === userId?.toString();
    if (!note.isPublic && !isOwner && !isCourseCreator && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied to this note." });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error("❌ Get Note Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch note details." });
  }
};

// =======================================
// ✏️ UPDATE NOTE (Owner/Admin Only)
// =======================================
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID." });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    // Permissions
    if (note.creator.toString() !== userId.toString() && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot update this note." });
    }

    // Process tags
    if (updates.tags) {
      const tags = Array.isArray(updates.tags)
        ? updates.tags
        : updates.tags.split(",");
      updates.tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    // Prevent overwriting core fields
    ["creator", "course", "lecture"].forEach((key) => delete updates[key]);

    const updated = await Note.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "✅ Note updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Update Note Error:", error);
    res.status(500).json({ success: false, message: "Failed to update note." });
  }
};

// =======================================
// 🗑️ DELETE NOTE (Hard Delete)
// =======================================
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID." });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    if (note.creator.toString() !== userId.toString() && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot delete this note." });
    }

    if (note.fileUrl) {
      try {
        await deleteFromCloudinary(note.fileUrl);
      } catch (err) {
        console.warn("Cloudinary deletion failed for:", note.fileUrl);
      }
    }

    await Note.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "🗑️ Note deleted successfully." });
  } catch (error) {
    console.error("❌ Delete Note Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete note." });
  }
};

// =======================================
// 🔎 SEARCH NOTES
// =======================================
export const searchNotes = async (req, res) => {
  try {
    const { query, courseId, lectureId } = req.query;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!query) return res.status(400).json({ success: false, message: "Search query required." });

    const searchQuery = {
      $text: { $search: query },
      isDeleted: false,
    };
    if (courseId) searchQuery.course = courseId;
    if (lectureId) searchQuery.lecture = lectureId;

    if (userRole !== "admin") {
      searchQuery.$or = [{ creator: userId }, { isPublic: true }];
    }

    const notes = await Note.find(searchQuery)
      .populate("creator", "name email avatar")
      .populate("lecture", "title order")
      .populate("course", "title")
      .sort({ score: { $meta: "textScore" } });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("❌ Search Notes Error:", error);
    res.status(500).json({ success: false, message: "Failed to search notes." });
  }
};