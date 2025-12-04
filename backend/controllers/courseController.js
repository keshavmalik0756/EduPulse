import Course from "../models/courseModel.js";
import Section from "../models/sectionModel.js";
import Review from "../models/reviewModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
// Removed logActivity import
import mongoose from "mongoose";

// ========== Helper Function: Safely parse JSON strings from FormData ==========
const parseJSON = (value) => {
  try {
    // Return the parsed value or an empty array/object based on common use cases
    return value ? JSON.parse(value) : [];
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return [];
  }
};

// ========== Helper Function to sanitize array items (e.g., for prerequisites) ==========
const sanitizeArrayItems = (array, maxLength = 500) => {
  if (!Array.isArray(array)) return [];
  return array.map(item => {
    if (typeof item === 'string') {
      // Trim whitespace and slice to the maximum length defined in the schema
      return item.trim().slice(0, maxLength);
    }
    return item;
  }).filter(item => item && (typeof item !== 'string' || item.length > 0)); // Filter out nulls, empties, and items that aren't strings or truthy
};

// ========== Helper Function to sanitize and trim text fields ==========
const sanitizeText = (text, maxLength) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
};

// ========== Helper Function to sanitize level field ==========
const sanitizeLevel = (level) => {
  if (typeof level !== 'string') return 'beginner';
  // Convert to lowercase to match the enum values in the schema
  const lowerLevel = level.toLowerCase().trim();
  // Validate against allowed enum values
  const validLevels = ["beginner", "intermediate", "advanced", "all-levels"];
  return validLevels.includes(lowerLevel) ? lowerLevel : 'beginner';
};

// ========== Helper Function to calculate pricing information ==========
const calculatePricing = (course) => {
  const originalPrice = course.price || 0;
  const discount = course.discount || 0;
  const finalPrice = course.finalPrice || (originalPrice === 0 ? 0 :
    (discount > 0 ? Math.round(originalPrice - (originalPrice * discount) / 100) : originalPrice));
  const savings = discount > 0 ? originalPrice - finalPrice : 0;

  return {
    originalPrice,
    discountPercentage: discount,
    finalPrice,
    savings,
    isFree: finalPrice === 0,
    hasDiscount: discount > 0,
    discountAmount: savings
  };
};

// ====================== CREATE COURSE ======================
export const createCourse = async (req, res) => {
  try {
    let {
      title,
      subTitle,
      description,
      category,
      subCategory,
      level,
      price,
      discount,
      tags,
      // NOTE: 'lessons' replaced by 'sections' (array of ObjectId)
      sections,
      // NOTE: 'duration' (string) replaced by 'totalDurationMinutes' (number)
      totalDurationMinutes,
      hasCertificate,
      language,
      prerequisites,
      learningOutcomes,
      requirements,
      enrollmentStatus,
      isFeatured,
      metaTitle,
      metaDescription,
      previewVideo, // URL from req.body
    } = req.body;

    // 1. Sanitize text fields based on schema constraints
    title = sanitizeText(title, 120);
    subTitle = sanitizeText(subTitle, 250);
    description = sanitizeText(description, 5000);
    metaTitle = sanitizeText(metaTitle, 60);
    metaDescription = sanitizeText(metaDescription, 160);
    previewVideo = sanitizeText(previewVideo, 2000); // URL length
    level = sanitizeLevel(level); // Sanitize level field

    // 2. Basic Required Field Validation (pre-database check)
    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and description are required fields.",
      });
    }

    // 3. Parse JSON arrays from FormData and Sanitize Array contents
    const parsedTags = sanitizeArrayItems(parseJSON(tags), 100).map(tag => String(tag).toLowerCase()); // Apply lowercase for tags
    const parsedSections = parseJSON(sections);
    const parsedPrerequisites = sanitizeArrayItems(parseJSON(prerequisites), 500);
    const parsedLearningOutcomes = sanitizeArrayItems(parseJSON(learningOutcomes), 500);
    const parsedRequirements = sanitizeArrayItems(parseJSON(requirements), 500);

    // 4. Validate Price, Discount and Duration (based on updated schema)
    const finalPrice = Number(price) || 0;
    const finalDiscount = Number(discount) || 0;
    const finalDuration = Number(totalDurationMinutes) || 0;

    if (finalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    if (finalDiscount < 0 || finalDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100%.",
      });
    }

    if (finalDuration < 0) {
      return res.status(400).json({
        success: false,
        message: "Course duration cannot be negative.",
      });
    }

    // 5. Upload files (thumbnail, banner, previewVideo)
    let thumbnail = "";
    let banner = "";
    let previewVideoUrl = previewVideo; // Use URL from body if provided

    if (req.files) {
      // Thumbnail upload
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const uploaded = await uploadOnCloudinary(
          req.files.thumbnail[0].path,
          "EduPulse/CourseThumbnails"
        );
        thumbnail = uploaded?.url || "";
      }

      // Banner upload
      if (req.files.banner && req.files.banner[0]) {
        const uploaded = await uploadOnCloudinary(
          req.files.banner[0].path,
          "EduPulse/CourseBanners"
        );
        banner = uploaded?.url || "";
      }

      // Preview video file upload (overrides URL from body if file provided)
      if (req.files.previewVideo && req.files.previewVideo[0]) {
        const uploaded = await uploadOnCloudinary(
          req.files.previewVideo[0].path,
          "EduPulse/CoursePreviewVideos"
        );
        previewVideoUrl = uploaded?.url || "";
      }
    }

    // 6. Auto-fill meta data if missing
    const metaTitleFinal = metaTitle || title;
    const metaDescriptionFinal =
      metaDescription || description?.substring(0, 150);

    // 7. Create Course
    const newCourse = await Course.create({
      title,
      subTitle,
      description,
      category,
      subCategory,
      level,
      price: finalPrice,
      discount: finalDiscount,
      tags: parsedTags,
      thumbnail,
      banner,
      previewVideo: previewVideoUrl,
      creator: req.user._id,
      sections: parsedSections, // Updated from lessons
      totalDurationMinutes: finalDuration, // Updated from duration
      hasCertificate,
      language,
      prerequisites: parsedPrerequisites,
      learningOutcomes: parsedLearningOutcomes,
      requirements: parsedRequirements,
      enrollmentStatus,
      isFeatured,
      metaTitle: metaTitleFinal,
      metaDescription: metaDescriptionFinal,
    });

    // Removed logActivity call

    res.status(201).json({
      success: true,
      message: "✅ Course created successfully!",
      course: {
        ...newCourse.toObject(),
        // Use new virtuals in response
        totalSections: newCourse.totalSections,
        durationFormatted: newCourse.durationFormatted,
        durationWithUnit: newCourse.durationWithUnit,
        finalPrice: newCourse.finalPrice,
        computedFinalPrice: newCourse.computedFinalPrice,
      },
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);

    // Check for MongoDB validation errors (runValidators: true)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(', ')}`,
      });
    }

    // Check for MongoDB duplicate key errors (for unique fields like slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A course with this title already exists or another unique constraint was violated.",
      });
    }

    res.status(500).json({
      success: false,
      message: `Error creating course: ${error.message}`,
    });
  }
};

// ====================== GET ALL PUBLISHED COURSES ======================
export const getPublishedCourses = async (req, res) => {
  try {
    // Show all published courses regardless of enrollment status
    // Students can view all published courses, but can only enroll in "open" ones
    const courseDocs = await Course.find({ isPublished: true })
      .populate("creator", "name email avatar")
      .populate({
        path: "sections",
        populate: {
          path: "lessons"
        }
      })
      .sort({ createdAt: -1 });

    if (!courseDocs?.length) {
      return res.status(404).json({
        success: false,
        message: "No published courses found.",
      });
    }

    // Convert to objects with virtuals
    const courses = courseDocs.map(doc => doc.toObject({ virtuals: true }));

    // Add virtual properties to each course
    const coursesWithVirtuals = courses.map(course => ({
      ...course,
      totalSections: course.sections?.length || 0,
      durationFormatted: course.durationFormatted || `${Math.floor((course.totalDurationMinutes || 0) / 60)}h ${Math.floor((course.totalDurationMinutes || 0) % 60)}m` || "0m",
      durationWithUnit: course.durationWithUnit || (course.totalDurationMinutes ? 
        (() => {
          const totalMinutes = course.totalDurationMinutes || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          
          if (hours > 0 && minutes > 0) {
            return `${hours} hours ${minutes} minutes`;
          } else if (hours > 0) {
            return `${hours} hours`;
          } else {
            return `${minutes} minutes`;
          }
        })() : "0 minutes"),
      ...calculatePricing(course),
      // Add isEnrolled property if user is authenticated
      isEnrolled: req.user ? (course.enrolledStudents && course.enrolledStudents.some(studentId => 
        studentId.toString() === req.user._id.toString())) : false,
    }));

    res.status(200).json({
      success: true,
      count: coursesWithVirtuals.length,
      courses: coursesWithVirtuals,
    });
  } catch (error) {
    console.error("Error fetching published courses:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch published courses: ${error.message}`,
    });
  }
};

// ====================== GET CREATOR'S COURSES ======================
export const getCreatorCourses = async (req, res) => {
  try {
    // This query uses the Compound Index: { creator: 1, isPublished: 1, views: -1 }
    // Find courses by creator (including both published and draft)
    const courseDocs = await Course.find({ creator: req.user._id })
      .populate("creator", "name email avatar")
      .populate({
        path: "sections",
        populate: {
          path: "lessons"
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Always return success, even if no courses found
    if (!courseDocs?.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        courses: [],
      });
    }

    // Convert to objects with virtuals
    const courses = courseDocs.map(doc => doc.toObject({ virtuals: true }));

    // Add virtual properties to each course
    const coursesWithVirtuals = courses.map(course => ({
      ...course,
      totalSections: course.sections?.length || 0,
      durationFormatted: course.durationFormatted || `${Math.floor((course.totalDurationMinutes || 0) / 60)}h ${Math.floor((course.totalDurationMinutes || 0) % 60)}m` || "0m",
      durationWithUnit: course.durationWithUnit || (course.totalDurationMinutes ? 
        (() => {
          const totalMinutes = course.totalDurationMinutes || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          
          if (hours > 0 && minutes > 0) {
            return `${hours} hours ${minutes} minutes`;
          } else if (hours > 0) {
            return `${hours} hours`;
          } else {
            return `${minutes} minutes`;
          }
        })() : "0 minutes"),
      ...calculatePricing(course),
    }));

    res.status(200).json({
      success: true,
      count: coursesWithVirtuals.length,
      courses: coursesWithVirtuals,
    });
  } catch (error) {
    console.error("Error fetching creator courses:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch creator courses: ${error.message}`,
    });
  }
};

// ====================== GET COURSE BY ID OR SLUG ======================
export const getCourseByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const query = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    // First get the course with virtuals enabled (not using lean yet)
    const courseDoc = await Course.findOne(query)
      .populate("creator", "_id name email avatar")
      // IMPORTANT: Populate 'sections' now, not 'lessons'
      .populate({
        path: "sections",
        populate: {
          path: "lessons"
        }
      })
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name avatar"
        }
      });

    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Convert to object with virtuals
    const course = courseDoc.toObject({ virtuals: true });
    
    // Add isEnrolled property if user is authenticated
    if (req.user) {
      const userId = req.user._id.toString();
      course.isEnrolled = course.enrolledStudents && course.enrolledStudents.some(studentId => {
        // Ensure both IDs are strings for comparison
        const studentIdStr = studentId.toString ? studentId.toString() : String(studentId);
        return studentIdStr === userId;
      });
    } else {
      course.isEnrolled = false;
    }

    // Increment view count atomically to avoid concurrency issues
    await Course.findByIdAndUpdate(course._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      course: {
        ...course,
        // Include virtuals in response
        totalSections: course.sections?.length || 0,
        durationFormatted: course.durationFormatted || `${Math.floor((course.totalDurationMinutes || 0) / 60)}h ${Math.floor((course.totalDurationMinutes || 0) % 60)}m` || "0m",
        durationWithUnit: course.durationWithUnit || (course.totalDurationMinutes ? 
          (() => {
            const totalMinutes = course.totalDurationMinutes || 0;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            if (hours > 0 && minutes > 0) {
              return `${hours} hours ${minutes} minutes`;
            } else if (hours > 0) {
              return `${hours} hours`;
            } else {
              return `${minutes} minutes`;
            }
          })() : "0 minutes"),
        finalPrice: course.finalPrice || (course.price === 0 ? 0 :
          (course.discount > 0 ?
            Math.round(course.price - (course.price * course.discount) / 100) :
            course.price)),
        originalPrice: course.price,
        discountPercentage: course.discount,
        savings: course.discount > 0 ? course.price - (course.finalPrice || Math.round(course.price - (course.price * course.discount) / 100)) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch course: ${error.message}`,
    });
  }
};

// ====================== EDIT / UPDATE COURSE ======================
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = { ...req.body };

    // Prevent system-managed fields from being overwritten
    const restricted = [
      "slug", // Slug should ideally only be set once or updated carefully
      "creator",
      "views",
      "revenue",
      "totalEnrolled",
      "averageRating",
      "completionRate",
      "reviewsCount",
      "totalRatingSum", // Added new field to restricted list
    ];
    restricted.forEach((field) => delete updateData[field]);

    // Manually handle array updates (if they are sent as JSON strings via FormData)
    if (updateData.tags) updateData.tags = sanitizeArrayItems(parseJSON(updateData.tags), 100).map(tag => String(tag).toLowerCase());
    if (updateData.prerequisites) updateData.prerequisites = sanitizeArrayItems(parseJSON(updateData.prerequisites), 500);
    if (updateData.learningOutcomes) updateData.learningOutcomes = sanitizeArrayItems(parseJSON(updateData.learningOutcomes), 500);
    if (updateData.requirements) updateData.requirements = sanitizeArrayItems(parseJSON(updateData.requirements), 500);
    if (updateData.sections) updateData.sections = parseJSON(updateData.sections);
    if (updateData.totalDurationMinutes) updateData.totalDurationMinutes = Number(updateData.totalDurationMinutes);
    if (updateData.level) updateData.level = sanitizeLevel(updateData.level); // Sanitize level field
    
    // Sanitize text fields
    if (updateData.title) updateData.title = sanitizeText(updateData.title, 120);
    if (updateData.subTitle) updateData.subTitle = sanitizeText(updateData.subTitle, 250);
    if (updateData.description) updateData.description = sanitizeText(updateData.description, 5000);
    if (updateData.metaTitle) updateData.metaTitle = sanitizeText(updateData.metaTitle, 60);
    if (updateData.metaDescription) updateData.metaDescription = sanitizeText(updateData.metaDescription, 160);
    if (updateData.previewVideo) updateData.previewVideo = sanitizeText(updateData.previewVideo, 2000);

    // Validate price and discount if provided
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price) || 0;
      if (updateData.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative.",
        });
      }
    }

    if (updateData.discount !== undefined) {
      updateData.discount = Number(updateData.discount) || 0;
      if (updateData.discount < 0 || updateData.discount > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100%.",
        });
      }
    }

    // Upload new files (thumbnail, banner, previewVideo) if provided
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const uploaded = await uploadOnCloudinary(req.files.thumbnail[0].path, "EduPulse/CourseThumbnails");
        updateData.thumbnail = uploaded?.url || "";
      }
      if (req.files.banner && req.files.banner[0]) {
        const uploaded = await uploadOnCloudinary(req.files.banner[0].path, "EduPulse/CourseBanners");
        updateData.banner = uploaded?.url || "";
      }
      if (req.files.previewVideo && req.files.previewVideo[0]) {
        const uploaded = await uploadOnCloudinary(req.files.previewVideo[0].path, "EduPulse/CoursePreviewVideos");
        updateData.previewVideo = uploaded?.url || "";
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Course updated successfully!",
      course: {
        ...updatedCourse.toObject(),
        // Include virtuals in response
        totalSections: updatedCourse.totalSections,
        durationFormatted: updatedCourse.durationFormatted,
        durationWithUnit: updatedCourse.durationWithUnit,
        finalPrice: updatedCourse.finalPrice,
        computedFinalPrice: updatedCourse.computedFinalPrice,
        originalPrice: updatedCourse.price,
        discountPercentage: updatedCourse.discount,
        savings: updatedCourse.discount > 0 ? updatedCourse.price - updatedCourse.finalPrice : 0,
      },
    });
  } catch (error) {
    // Includes MongoDB validation and casting errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: `Validation error: ${messages.join(', ')}` });
    }
    res.status(500).json({
      success: false,
      message: `Failed to edit course: ${error.message}`,
    });
  }
};

// ====================== TOGGLE COURSE PUBLISH STATUS ======================
export const togglePublishStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });

    course.isPublished = !course.isPublished;
    if (course.isPublished && !course.publishedDate) {
      course.publishedDate = new Date();
    }

    await course.save();

    // Removed logActivity call

    // Populate the creator field to ensure we have the full user object
    await course.populate('creator', 'name email');

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? "✅ published" : "❌ unpublished"
        } successfully.`,
      course: {
        ...course.toObject({ virtuals: true }),
        // Include virtuals in response
        totalSections: course.totalSections,
        durationFormatted: course.durationFormatted,
        durationWithUnit: course.durationWithUnit,
        finalPrice: course.finalPrice,
        originalPrice: course.price,
        discountPercentage: course.discount,
        savings: course.discount > 0 ? course.price - course.finalPrice : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update publish status: ${error.message}`,
    });
  }
};

// ====================== DELETE COURSE ======================
export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    // Optional: remove assets from Cloudinary
    // NOTE: In a real app, you might want to delete related lessons, reviews, etc. here too.
    if (course.thumbnail) await deleteFromCloudinary(course.thumbnail);
    if (course.banner) await deleteFromCloudinary(course.banner);
    if (course.previewVideo) await deleteFromCloudinary(course.previewVideo);

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "🗑️ Course deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to remove course: ${error.message}`,
    });
  }
};

/**
 * ====================== ENROLLMENT ROUTES ======================
 */

/**
 * @route   GET /api/courses/enrollments/user
 * @desc    Get all courses enrolled by the current user
 * @access  Private
 */
export const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all courses where the user is in the enrolledStudents array
    const enrolledCourses = await Course.find({ enrolledStudents: userId })
      .populate({
        path: 'creator',
        select: 'name avatar'
      })
      .select('title description category level price thumbnail totalEnrolled averageRating totalDurationMinutes enrollmentStatus createdAt updatedAt');

    // Also ensure the user's enrolledCourses array is consistent
    const User = mongoose.model("User");
    // Use findByIdAndUpdate with $set to avoid version conflicts
    const enrolledCourseIds = enrolledCourses.map(course => course._id);
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { enrolledCourses: enrolledCourseIds } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      enrollments: enrolledCourses,
      count: enrolledCourses.length
    });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: error.message
    });
  }
};

/**
 * @route   POST /api/courses/:courseId/enroll
 * @desc    Enroll a user in a course
 * @access  Private
 */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Assuming user authentication middleware provides req.user._id
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found." });

    if (course.enrolledStudents.includes(userId))
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course." });

    // Check if course is open for enrollment
    if (course.enrollmentStatus !== "open")
      return res
        .status(400)
        .json({ 
          success: false, 
          message: `Enrollment is currently ${course.enrollmentStatus}.`,
          enrollmentStatus: course.enrollmentStatus
        });

    // Add student to course's enrolledStudents array
    course.enrolledStudents.push(userId);
    course.totalEnrolled += 1;
    
    // Also add course to user's enrolledCourses array using findByIdAndUpdate to avoid version conflicts
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } }, // $addToSet prevents duplicates
      { runValidators: true }
    );
    
    await course.save();

    res.status(200).json({
      success: true,
      message: "🎓 Enrolled successfully!",
      userId: userId.toString(),
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to enroll: ${error.message}`,
    });
  }
};

/**
 * @route   DELETE /api/courses/:courseId/unenroll
 * @desc    Unenroll a user from a course
 * @access  Private
 */
export const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Assuming user authentication middleware provides req.user._id
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found." });

    // Check if user is actually enrolled
    if (!course.enrolledStudents.includes(userId))
      return res
        .status(400)
        .json({ success: false, message: "Not enrolled in this course." });

    // Remove student from course's enrolledStudents array
    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== userId.toString()
    );
    course.totalEnrolled = Math.max(0, course.totalEnrolled - 1);
    
    // Also remove course from user's enrolledCourses array using findByIdAndUpdate to avoid version conflicts
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: courseId } }, // $pull removes the courseId from the array
      { runValidators: true }
    );
    
    await course.save();

    res.status(200).json({
      success: true,
      message: "👋 Unenrolled successfully!",
      userId: userId.toString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to unenroll: ${error.message}`,
    });
  }
};

// ====================== GET COURSE STATISTICS (Creator Dashboard) ======================
export const getCourseStatistics = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const courses = await Course.find({ creator: creatorId }).lean(); // Use lean() for better performance

    if (!courses?.length) {
      return res.status(200).json({
        success: true,
        stats: {
          total: 0,
          published: 0,
          draft: 0,
          students: 0,
          revenue: 0,
          avgRating: 0,
          completionRate: 0,
          totalViews: 0,
          topPerforming: null,
          lowEnrollment: 0,
        },
      });
    }

    const publishedCourses = courses.filter((c) => c.isPublished);

    // Aggregation logic using functional programming
    const stats = {
      total: courses.length,
      published: publishedCourses.length,
      draft: courses.length - publishedCourses.length,
      students: publishedCourses.reduce(
        (sum, c) => sum + (c.totalEnrolled || 0),
        0
      ),
      revenue: publishedCourses.reduce((sum, c) => sum + (c.revenue || 0), 0),
      avgRating:
        // Safely calculate average rating
        publishedCourses.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
        (publishedCourses.length || 1),
      completionRate:
        // Safely calculate average completion rate
        publishedCourses.reduce((sum, c) => sum + (c.completionRate || 0), 0) /
        (publishedCourses.length || 1),
      totalViews: publishedCourses.reduce((sum, c) => sum + (c.views || 0), 0),
    };

    // Find the course with the highest enrollment
    const topPerforming =
      publishedCourses.length > 0
        ? publishedCourses.reduce((prev, curr) =>
          (prev.totalEnrolled || 0) > (curr.totalEnrolled || 0) ? prev : curr
        )
        : null;

    stats.topPerforming = topPerforming
      ? {
        id: topPerforming._id,
        title: topPerforming.title,
        students: topPerforming.totalEnrolled,
        rating: topPerforming.averageRating,
        revenue: topPerforming.revenue,
      }
      : null;

    // Count courses with low enrollment (less than 50 students)
    stats.lowEnrollment = publishedCourses.filter(
      (c) => (c.totalEnrolled || 0) < 50
    ).length;

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        // Rounding for display
        avgRating: Math.round(stats.avgRating * 10) / 10,
        completionRate: Math.round(stats.completionRate),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch statistics: ${error.message}`,
    });
  }
};

// ====================== GET COURSE ANALYTICS ======================
export const getCourseAnalytics = async (req, res) => {
  try {
    // Use the course attached by the middleware (already authorized)
    const course = req.course || await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }
    
    // Calculate analytics data
    const analytics = {
      completionRate: course.completionRate || 0,
      totalEnrolled: course.totalEnrolled || 0,
      totalDurationMinutes: course.totalDurationMinutes || 0,
      totalWatchTime: (course.totalDurationMinutes || 0) * (course.totalEnrolled || 0),
      avgTimePerStudent: course.totalDurationMinutes || 0,
      views: course.views || 0,
      averageRating: course.averageRating || 0,
      revenue: course.revenue || 0,
      lastUpdate: course.updatedAt || course.createdAt || new Date()
    };
    
    res.status(200).json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error("Error fetching course analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course analytics."
    });
  }
};

// ====================== GET ENROLLED STUDENTS FOR A COURSE ======================
export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate({
        path: 'enrolledStudents',
        select: 'name email avatar createdAt'
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }
    
    // Transform the enrolled students data to match frontend expectations
    const transformedStudents = (course.enrolledStudents || []).map(student => ({
      _id: student._id,
      name: student.name || 'Unknown',
      email: student.email || 'No email provided',
      // For now, we'll provide default values for progress and enrolledDate
      // In a real implementation, these would come from actual student progress data
      progress: Math.floor(Math.random() * 100), // Random progress for demo
      enrolledDate: student.createdAt || new Date()
    }));

    // Return the enrolled students
    res.status(200).json({
      success: true,
      data: {
        students: transformedStudents,
        count: transformedStudents.length
      }
    });
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled students",
      error: error.message
    });
  }
};
