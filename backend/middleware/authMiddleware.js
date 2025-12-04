import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// ✅ Middleware to check if user is authenticated
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token = req.cookies.token;

  // Try Authorization header if no cookie token
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 401));
  }

  try {
    if (!process.env.JWT_SECRET) {
      return next(new ErrorHandler("Server configuration error.", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("_id name email role");

    if (!req.user) {
      return next(new ErrorHandler("User not found with this token.", 404));
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Session expired. Please log in again.", 401));
    }
    return next(new ErrorHandler("Invalid or expired token.", 401));
  }
});

// ✅ Optional authentication: attach user if a valid token is present
// Does NOT enforce authentication; simply populates req.user when possible
export const attachOptionalUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();
    if (!process.env.JWT_SECRET) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name email role");
    if (user) req.user = user;
  } catch (err) {
    // Silently ignore invalid tokens in optional attach
  }
  next();
};

// ✅ Middleware for single-role authorization (case-insensitive)
export const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated.", 401));
    }

    if (req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return next(
        new ErrorHandler(
          `Access Denied: (${req.user.role}) cannot access this resource.`,
          403
        )
      );
    }
    next();
  };
};

// ✅ Middleware for multi-role authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated.", 401));
    }

    const allowedRoles = roles.map((r) => r.toLowerCase());
    if (!allowedRoles.includes(req.user.role.toLowerCase())) {
      return next(
        new ErrorHandler(
          `Access Denied: ${req.user.role} role is not authorized.`,
          403
        )
      );
    }
    next();
  };
};

// ✅ Middleware to check if user is the course owner or admin
export const isCourseOwnerOrAdmin = catchAsyncErrors(async (req, res, next) => {
  let courseId = req.params.courseId || req.params.id;
  
  // If courseId not found, try to extract from lecture or section
  if (!courseId && req.params.lectureId) {
    const Lecture = (await import("../models/lectureModel.js")).default;
    const lecture = await Lecture.findById(req.params.lectureId);
    if (lecture) {
      courseId = lecture.courseId;
    }
  }
  
  if (!courseId && req.params.sectionId) {
    const Section = (await import("../models/sectionModel.js")).default;
    const section = await Section.findById(req.params.sectionId);
    if (section) {
      courseId = section.course;
    }
  }
  
  if (!courseId) {
    return next(new ErrorHandler("Course ID is required.", 400));
  }

  // Find the course and explicitly populate the creator field
  const course = await Course.findById(courseId).populate('creator', '_id email role');
  
  if (!course) {
    return next(new ErrorHandler("Course not found.", 404));
  }

  // Check if user is admin or the course creator
  const isAdmin = req.user.role === "admin";
  const isCreator = course.creator?._id?.toString() === req.user._id.toString();

  if (isAdmin || isCreator) {
    req.course = course; // Attach course to request for use in controllers
    next();
  } else {
    return next(new ErrorHandler("You are not authorized to access this course.", 403));
  }
});