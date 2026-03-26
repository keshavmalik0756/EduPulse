import Section from "../models/sectionModel.js";
import Course from "../models/courseModel.js";
// Removed logActivity import
import mongoose from "mongoose";

// ===============================
// 🔹 Helper: Format Duration Short
// ===============================
const formatDurationShort = (totalMinutes) => {
  if (!totalMinutes || totalMinutes === 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let formattedDuration = "";
  if (hours > 0) formattedDuration += `${hours}h `;
  if (minutes > 0 || hours === 0) formattedDuration += `${minutes}m`;
  return formattedDuration.trim();
};

// ===============================
// 🔹 Helper: Handle Duplicate Order
// ===============================
const handleDuplicateOrder = async (courseId, order, excludeId = null, session = null) => {
  const query = { course: courseId, order };
  if (excludeId) query._id = { $ne: excludeId };
  
  const existing = await Section.findOne(query).session(session || undefined);
  return !!existing;
};

// Note: Course metrics are now handled by Section and Lecture model hooks ($inc)

// ===============================
// 🔹 CREATE SECTION (Idempotent)
// ===============================
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    // Validate required fields
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Course ID is required.",
      });
    }
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Section title is required.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // ✅ Use atomic upsert to avoid duplicates & conflicts
    const section = await Section.findOneAndUpdate(
      { course: new mongoose.Types.ObjectId(courseId), title: title.trim() },
      { 
        $setOnInsert: { 
          course: new mongoose.Types.ObjectId(courseId), // Explicitly set the course field as ObjectId
          title: title.trim(), 
          description: description?.trim() || `${title.trim()} section`, 
          order: order || 1,
          ...(req.user?._id && { creator: req.user._id }) // Only set creator if available
        } 
      },
      { new: true, upsert: true, collation: { locale: "en", strength: 2 } }
    );

    // Course metrics and section linking are now handled by Section.post("save") hook

    // Removed logActivity call

    return res.status(201).json({
      success: true,
      message: "✅ Section ensured successfully.",
      section,
    });
  } catch (error) {
    // ✅ Handle duplicate key errors
    if (error.code === 11000) {
      console.warn("⚠️ Duplicate key error detected. Checking existing section...");
      try {
        const { courseId } = req.params;
        const { title } = req.body;
        
        // Try to find and return the existing section
        const existingSection = await Section.findOne({
          course: new mongoose.Types.ObjectId(courseId),
          title: title.trim()
        });
        
        if (existingSection) {
          console.log("✅ Section already exists, returning existing section");
          return res.status(201).json({
            success: true,
            message: "✅ Section already exists.",
            section: existingSection,
          });
        }
        
        // If we can't find it, it's a different duplicate key error
        throw error;
      } catch (retryError) {
        console.error("Error handling duplicate key:", retryError);
        return res.status(400).json({
          success: false,
          message: "A section with this title already exists in this course.",
        });
      }
    }

    // ✅ Handle write conflicts gracefully
    if (error.codeName === "WriteConflict") {
      console.warn("⚠️ Write conflict detected. Retrying once...");
      try {
        const { courseId } = req.params;
        const { title, description, order } = req.body;
        
        // Validate required fields again for retry
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
          return res.status(400).json({
            success: false,
            message: "Valid Course ID is required.",
          });
        }
        
        if (!title || !title.trim()) {
          return res.status(400).json({
            success: false,
            message: "Section title is required.",
          });
        }
        
        const section = await Section.findOneAndUpdate(
          { course: new mongoose.Types.ObjectId(courseId), title: title.trim() },
          { 
            $setOnInsert: { 
              course: new mongoose.Types.ObjectId(courseId), 
              title: title.trim(), 
              description: description?.trim() || `${title.trim()} section`, 
              order: order || 1,
              creator: req.user?._id || null
            } 
          },
          { new: true, upsert: true, collation: { locale: "en", strength: 2 } }
        );

        // Ensure the section is added to the course's sections array
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { sections: section._id }
        });

        return res.status(201).json({ success: true, section });
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        return res.status(500).json({
          success: false,
          message: "Failed to resolve write conflict. Please retry.",
        });
      }
    }

    console.error("❌ Error creating section:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create section.",
    });
  }
};

// ===============================
// 🔹 GET ALL SECTIONS BY COURSE
// ===============================
export const getSectionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Populate lessons with essential lecture data including formatted duration
    const sections = await Section.find({ course: courseId, isDeleted: false })
      .populate({
        path: "lessons",
        select: "title duration isPreview order videoUrl difficulty type",
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: sections.length,
      sections: sections.map((s) => ({
        ...s,
        durationFormatted: formatDurationShort(s.totalDuration),
        // Add individual lecture durations in a more readable format
        lessons: s.lessons?.map(lesson => ({
          ...lesson,
          durationFormatted: formatDurationShort(Math.round((lesson.duration || 0) / 60))
        })) || []
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch sections: ${error.message}`,
    });
  }
};

// ===============================
// 🔹 GET SINGLE SECTION BY ID
// ===============================
export const getSectionById = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    // Populate lessons with essential lecture data including formatted duration
    const section = await Section.findById(sectionId)
      .populate({
        path: "lessons",
        select: "title duration isPreview order videoUrl difficulty type",
        options: { sort: { order: 1 } }
      })
      .lean();

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    return res.status(200).json({
      success: true,
      section: {
        ...section,
        durationFormatted: formatDurationShort(section.totalDuration),
        // Add individual lecture durations in a more readable format
        lessons: section.lessons?.map(lesson => ({
          ...lesson,
          durationFormatted: formatDurationShort(Math.round((lesson.duration || 0) / 60))
        })) || []
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch section: ${error.message}`,
    });
  }
};

// ===============================
// 🔹 UPDATE SECTION
// ===============================
export const updateSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { sectionId } = req.params;
    const updateData = { ...req.body };

    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    // Check for duplicate order if order is being updated
    if (updateData.order && updateData.order !== section.order) {
      const isDuplicate = await handleDuplicateOrder(section.course, updateData.order, sectionId, session);
      if (isDuplicate) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "A section with this order already exists in this course.",
        });
      }
    }

    Object.assign(section, updateData);
    await section.save({ session });

    // Update parent course metrics in transaction
    await updateCourseMetrics(section.course, session);

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "✅ Section updated successfully!",
      section,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating section:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A section with this order already exists in this course.",
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to update section: ${error.message}`,
    });
  } finally {
    session.endSession();
  }
};

// ===============================
// 🔹 REORDER SECTIONS
// ===============================
export const reorderSections = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const { newOrder } = req.body; // [{ sectionId, order }, ...]

    if (!Array.isArray(newOrder) || !newOrder.length) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid section order array.",
      });
    }

    // Check for duplicate orders
    const orders = newOrder.map(item => item.order);
    if (orders.length !== new Set(orders).size) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Duplicate section orders provided.",
      });
    }

    // Check if any order already exists for other sections
    for (const { sectionId, order } of newOrder) {
      const isDuplicate = await handleDuplicateOrder(courseId, order, sectionId, session);
      if (isDuplicate) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `A section with order ${order} already exists in this course.`,
        });
      }
    }

    const bulkOps = newOrder.map(({ sectionId, order }) => ({
      updateOne: {
        filter: { _id: sectionId, course: courseId },
        update: { order },
      },
    }));

    await Section.bulkWrite(bulkOps, { session });
    
    // Update parent course metrics
    await updateCourseMetrics(courseId, session);

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "✅ Sections reordered successfully!",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      success: false,
      message: `Failed to reorder sections: ${error.message}`,
    });
  } finally {
    session.endSession();
  }
};

// ===============================
// 🔹 TOGGLE SECTION PUBLISH STATUS
// ===============================
export const toggleSectionStatus = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    section.isPublished = !section.isPublished;
    await section.save();

    return res.status(200).json({
      success: true,
      message: `Section ${
        section.isPublished ? "✅ published" : "❌ unpublished"
      } successfully.`,
      section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to toggle section status: ${error.message}`,
    });
  }
};

// ===============================
// 🔹 DELETE SECTION (Soft Delete)
// ===============================
export const deleteSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    // Soft delete instead of hard delete
    section.isDeleted = true;
    section.deletedAt = new Date();
    await section.save({ session });

    // Remove section from course's sections array
    await Course.findByIdAndUpdate(section.course, {
      $pull: { sections: sectionId }
    }, { session });

    // Update parent course metrics in transaction
    await updateCourseMetrics(section.course, session);

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "🗑️ Section deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      success: false,
      message: `Failed to delete section: ${error.message}`,
    });
  } finally {
    session.endSession();
  }
};

// ===============================
// 🔹 GET SECTION STATISTICS
// ===============================
export const getSectionStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const sections = await Section.find({ course: courseId, isDeleted: false }).lean();
    if (!sections?.length) {
      return res.status(404).json({
        success: false,
        message: "No sections found for this course.",
      });
    }

    const totalSections = sections.length;
    const totalLessons = sections.reduce(
      (sum, s) => sum + (s.totalLessons || 0),
      0
    );
    const totalDuration = sections.reduce(
      (sum, s) => sum + (s.totalDuration || 0),
      0
    );
    const publishedSections = sections.filter((s) => s.isPublished).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalSections,
        publishedSections,
        totalLessons,
        totalDurationFormatted: formatDurationShort(totalDuration),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch section statistics: ${error.message}`,
    });
  }
};

















