// ============================================================================
// 🌐 COURSE SERVICE API (EduPulse)
// Handles only course-related operations
// ============================================================================
import apiClient, { apiWrapper } from "../utils/apiClient.js";
import { toast } from "react-hot-toast";
import { FrontendErrorHandler } from "../utils/errorHandler.js";
import { 
  setCache, 
  getCache, 
  invalidateCache, 
  CACHE_TTL,
  processApiResponse
} from "../utils/cacheManager.js";

// ========================== Default Course Stats Template ======================
const defaultStats = {
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
};

// ========================== Generic Normalizer ================================
const extractData = (resp, path = "") => {
  // resp is the body (res.data) or undefined
  if (!resp) return undefined;
  // if path provided, prefer resp[path], then resp.data[path]
  if (path) {
    if (resp[path] !== undefined) return resp[path];
    if (resp.data && resp.data[path] !== undefined) return resp.data[path];
    return undefined;
  }
  // prefer resp.data if exists, otherwise resp
  return resp.data !== undefined ? resp.data : resp;
};

// ========================== Cache Helpers ==============================
const CACHE_KEYS = {
  creatorCourses: 'courses_creator',
  publishedCourses: 'courses_published',
  stats: 'courses_stats',
  course: (courseIdOrSlug) => `course_${courseIdOrSlug}`,
  analytics: (courseId) => `course_analytics_${courseId}`,
  students: (courseId) => `course_students_${courseId}`,
  reviews: (courseId) => `course_reviews_${courseId}`,
  discussions: (courseId) => `course_discussions_${courseId}`,
  enrollments: 'courses_enrollments'
};

// ========================== Retry Wrapper (Transient Failures) ================
const withRetry = async (fn, retries = 2, delay = 800) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`🔄 Retrying request... (${retries} attempts left)`);
    await new Promise((res) => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

// ============================================================================
// 🌐 Course Service API (Core Only)
// ============================================================================
const courseService = {
  // ========================================================================== 
  // 🧩 GET EDUCATOR COURSES
  // ==========================================================================
  async getCreatorCourses() {
    const cacheKey = CACHE_KEYS.creatorCourses;
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('Returning cached creator courses');
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        console.log('Fetching creator courses from API');
        const response = await apiClient.get("/courses/getcreatorcourses");
        const { data } = response;
        
        // Validate response
        if (!data) {
          throw new Error('No data received from server');
        }
        
        // Ensure we always return a consistent structure
        const courses = processApiResponse(data)?.courses || [];
        console.log(`Received ${courses.length} courses from API`);
        
        return {
          success: data?.success ?? true,
          count: courses.length,
          courses,
        };
      });
      
      // Cache the result with appropriate TTL (1 minute for creator courses)
      setCache(cacheKey, result, CACHE_TTL.SHORT);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching creator courses:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        count: 0,
        courses: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 🌍 GET PUBLISHED COURSES
  // ==========================================================================
  async getPublishedCourses() {
    const cacheKey = CACHE_KEYS.publishedCourses;
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get("/courses/getpublished");
        const { data } = response;
        
        // Ensure we always return a consistent structure
        const courses = processApiResponse(data)?.courses || processApiResponse(data) || [];
        return {
          success: true,
          courses,
          count: courses.length,
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for published courses)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching published courses:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        courses: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 📊 GET COURSE STATISTICS
  // ==========================================================================
  async getCourseStatistics() {
    const cacheKey = CACHE_KEYS.stats;
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get("/courses/stats");
        const { data } = response;
        
        // Ensure we always return a consistent structure with defaults
        const stats = {
          ...defaultStats,
          ...(processApiResponse(data)?.stats || data?.stats || {})
        };
        
        return { 
          success: true, 
          stats 
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for course statistics)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course statistics:", error);
      toast.error(errorInfo.message);
      return { 
        success: false, 
        stats: { ...defaultStats },
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 🆕 CREATE NEW COURSE
  // ==========================================================================
  async createCourse(courseData, onUploadProgress) {
    return apiWrapper(
      apiClient.post("/courses/create", courseData, {
        ...(courseData instanceof FormData && onUploadProgress && { onUploadProgress }),
      }),
      "Failed to create course"
    ).then((response) => {
      const body = processApiResponse(response) || response;
      toast.success("🎉 Course created successfully!");
      
      // if backend returns { success:true, course: {...} }
      const course = body?.course ?? body?.data?.course ?? body;
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.creatorCourses);
      invalidateCache(CACHE_KEYS.publishedCourses);
      invalidateCache(CACHE_KEYS.stats);
      
      return { 
        success: true, 
        course,
        message: body?.message || "Course created successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // ✏️ UPDATE COURSE
  // ==========================================================================
  async updateCourse(courseId, courseData, onUploadProgress) {
    return apiWrapper(
      apiClient.put(`/courses/edit/${courseId}`, courseData, {
        ...(courseData instanceof FormData && onUploadProgress && { onUploadProgress }),
      }),
      "Failed to update course"
    ).then((response) => {
      const body = processApiResponse(response) || response;
      toast.success("✅ Course updated successfully!");
      
      // if backend returns { success:true, course: {...} }
      const course = body?.course ?? body?.data?.course ?? body;
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.creatorCourses);
      invalidateCache(CACHE_KEYS.publishedCourses);
      invalidateCache(CACHE_KEYS.course(courseId));
      invalidateCache(CACHE_KEYS.stats);
      
      return { 
        success: true, 
        course,
        message: body?.message || "Course updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 🗑️ DELETE COURSE
  // ==========================================================================
  async deleteCourse(courseId) {
    return apiWrapper(
      apiClient.delete(`/courses/remove/${courseId}`),
      "Failed to delete course"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🗑️ Course deleted successfully!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.creatorCourses);
      invalidateCache(CACHE_KEYS.publishedCourses);
      invalidateCache(CACHE_KEYS.course(courseId));
      invalidateCache(CACHE_KEYS.stats);
      
      return { 
        success: true, 
        message: data?.message || "Course deleted successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 🚀 TOGGLE PUBLISH STATUS
  // ==========================================================================
  async togglePublishStatus(courseId) {
    return apiWrapper(
      apiClient.put(`/courses/toggle-publish/${courseId}`),
      "Failed to update publish status"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("📢 Course publish status updated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.creatorCourses);
      invalidateCache(CACHE_KEYS.publishedCourses);
      invalidateCache(CACHE_KEYS.course(courseId));
      invalidateCache(CACHE_KEYS.stats); // Add this line to invalidate stats cache
      
      return { 
        success: true, 
        course: data?.course || data?.data?.course || data,
        message: data?.message || "Course publish status updated!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 🎓 ENROLL IN COURSE
  // ==========================================================================
  async enrollCourse(courseId) {
    return apiWrapper(apiClient.post(`/courses/enroll/${courseId}`), "Enrollment failed")
      .then((response) => {
        const body = processApiResponse(response) || response;
        toast.success("🎓 Successfully enrolled in course!");
        
        // Invalidate related cache entries
        invalidateCache(CACHE_KEYS.enrollments);
        invalidateCache(CACHE_KEYS.course(courseId));
        
        return { 
          success: true, 
          userId: body?.userId,
          enrollment: body,
          message: body?.message || "Successfully enrolled in course!"
        };
      }).catch(error => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ========================================================================== 
  // 🚶 UNENROLL FROM COURSE
  // ==========================================================================
  async unenrollCourse(courseId) {
    return apiWrapper(apiClient.delete(`/courses/unenroll/${courseId}`), "Unenrollment failed")
      .then((response) => {
        const body = processApiResponse(response) || response;
        toast.success("👋 Successfully unenrolled from course!");
        
        // Invalidate related cache entries
        invalidateCache(CACHE_KEYS.enrollments);
        invalidateCache(CACHE_KEYS.course(courseId));
        
        return { 
          success: true, 
          userId: body?.userId,
          unenrollment: body,
          message: body?.message || "Successfully unenrolled from course!"
        };
      }).catch(error => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ========================================================================== 
  // 📘 GET COURSE BY ID OR SLUG
  // ==========================================================================
  async getCourseById(courseIdOrSlug, bypassCache = false) {
    const cacheKey = CACHE_KEYS.course(courseIdOrSlug);
    
    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/courses/get/${courseIdOrSlug}`);
        const { data } = response;
        
        return {
          success: true,
          course: processApiResponse(data)?.course,
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for course data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 📊 COURSE ANALYTICS
  // ==========================================================================
  async getCourseAnalytics(courseId) {
    const cacheKey = CACHE_KEYS.analytics(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/courses/get/${courseId}/analytics`);
        const { data } = response;
        
        return {
          success: true,
          data: processApiResponse(data)?.analytics,
        };
      });
      
      // Cache the result with appropriate TTL (2 minutes for analytics data)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course analytics:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 👥 GET ENROLLED STUDENTS
  // ==========================================================================
  async getEnrolledStudents(courseId) {
    const cacheKey = CACHE_KEYS.students(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/courses/get/${courseId}/students`);
        const { data } = response;
        
        return {
          success: true,
          data: { students: processApiResponse(data)?.students },
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for student data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching enrolled students:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: { students: [] },
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 📝 COURSE REVIEWS
  // ==========================================================================
  async getCourseReviews(courseId) {
    const cacheKey = CACHE_KEYS.reviews(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const response = await apiClient.get(`/reviews/course/${courseId}`);
      const { data } = response;
      const result = {
        success: true,
        data: { reviews: processApiResponse(data)?.reviews },
      };
      
      // Cache the result with appropriate TTL (5 minutes for reviews)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course reviews:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: { reviews: [] },
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  async createCourseReview(courseId, reviewData) {
    return apiWrapper(
      apiClient.post(`/reviews/course/${courseId}`, reviewData),
      "Failed to submit review"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("⭐ Review submitted successfully!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.reviews(courseId));
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Review submitted successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async updateCourseReview(reviewId, reviewData) {
    return apiWrapper(
      apiClient.put(`/reviews/${reviewId}`, reviewData),
      "Failed to update review"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("✏️ Review updated!");
      
      // Invalidate all reviews cache since we don't know which course this review belongs to
      invalidateCache('course_reviews_*');
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Review updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async deleteCourseReview(reviewId) {
    return apiWrapper(
      apiClient.delete(`/reviews/${reviewId}`),
      "Failed to delete review"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🗑️ Review deleted successfully!");
      
      // Invalidate all reviews cache since we don't know which course this review belongs to
      invalidateCache('course_reviews_*');
      
      return {
        success: true,
        message: data?.message || "Review deleted successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 💬 COURSE DISCUSSIONS
  // ==========================================================================
  async getCourseDiscussions(courseId) {
    const cacheKey = CACHE_KEYS.discussions(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const response = await apiClient.get(`/discussions/course/${courseId}`);
      const { data } = response;
      const result = { 
        success: true, 
        data: processApiResponse(data)?.questions 
      };
      
      // Cache the result with appropriate TTL (2 minutes for discussions)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course discussions:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  async createDiscussionQuestion(courseId, questionData) {
    return apiWrapper(
      apiClient.post(`/discussions/${courseId}`, questionData),
      "Failed to create discussion question"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("💬 Question posted!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.discussions(courseId));
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Question posted successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async addDiscussionAnswer(questionId, answerData) {
    return apiWrapper(
      apiClient.post(`/discussions/${questionId}/answers`, answerData),
      "Failed to add answer"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("✅ Answer added successfully!");
      
      // Invalidate all discussions cache since we don't know which course this question belongs to
      invalidateCache('course_discussions_*');
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Answer added successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async toggleDiscussionResolved(questionId) {
    return apiWrapper(
      apiClient.patch(`/discussions/${questionId}/resolve`),
      "Failed to toggle question status"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🔄 Question status updated!");
      
      // Invalidate all discussions cache since we don't know which course this question belongs to
      invalidateCache('course_discussions_*');
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Question status updated!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async likeDiscussionAnswer(questionId, answerId) {
    return apiWrapper(
      apiClient.patch(`/discussions/${questionId}/answers/${answerId}/like`),
      "Failed to like answer"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Answer liked successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  async markDiscussionAnswerAsBest(questionId, answerId) {
    return apiWrapper(
      apiClient.patch(`/discussions/${questionId}/answers/${answerId}/best`),
      "Failed to mark answer as best"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🏆 Marked as best answer!");
      
      // Invalidate all discussions cache since we don't know which course this question belongs to
      invalidateCache('course_discussions_*');
      
      return { 
        success: true, 
        data: data?.data,
        message: data?.message || "Marked as best answer!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 🎓 GET USER ENROLLMENTS
  // ==========================================================================
  async getUserEnrollments() {
    const cacheKey = CACHE_KEYS.enrollments;
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get('/courses/enrollments/user');
        const { data } = response;
        
        return {
          success: true,
          enrollments: processApiResponse(data)?.enrollments,
          count: data?.count || 0
        };
      });
      
      // Cache the result with appropriate TTL (2 minutes for enrollments)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching user enrollments:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        enrollments: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

};

// ====================== EXPORT ======================
export default courseService;