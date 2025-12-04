// ============================================================================
// 🎯 LECTURE QUALITY SERVICE API (EduPulse)
// Handles all operations for lecture quality and heat score functionality
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

// ========================== Retry Wrapper (Transient Failures) ================
const withRetry = async (fn, retries = 2, delay = 800) => {
  try {
    return await fn();
  } catch (error) {
    const isTransient = 
      error?.response?.status >= 500 || 
      error?.code === "ECONNABORTED" ||
      error?.message?.includes("Network") ||
      error?.message?.includes("timeout");

    if (!isTransient || retries <= 0) throw error;

    if (import.meta.env.DEV)
      console.warn(`🔄 Retrying request... (${retries} left)`, error.message);
    
    await new Promise((res) => setTimeout(res, delay + Math.random() * 200));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

// ========================== Cache Helpers ==============================
const CACHE_KEYS = {
  lecture: (lectureId) => `quality_lecture_${lectureId}`,
  course: (courseId) => `quality_course_${courseId}`,
  heatmap: (courseId) => `quality_heatmap_${courseId}`,
  category: (courseId, category) => `quality_category_${courseId}_${category}`
};

// ============================================================================
// 🎯 LECTURE QUALITY SERVICE
// ============================================================================
const lectureQualityService = {
  // ========================================================================
  // 📊 GET LECTURE QUALITY
  // ========================================================================
  async getLectureQuality(lectureId) {
    const cacheKey = CACHE_KEYS.lecture(lectureId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameter
    if (!lectureId) {
      return {
        success: false,
        data: null,
        lecture: null,
        message: "Lecture ID is required"
      };
    }
    
    // Validate ID format
    if (typeof lectureId !== 'string' || lectureId.length < 24) {
      return {
        success: false,
        data: null,
        lecture: null,
        message: "Invalid lecture ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/quality/lecture/${lectureId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          lecture: data?.lecture,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (2 minutes for lecture quality)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching lecture quality:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        lecture: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📚 GET COURSE LECTURE QUALITY
  // ========================================================================
  async getCourseLectureQuality(courseId) {
    const cacheKey = CACHE_KEYS.course(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameter
    if (!courseId) {
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/quality/course/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course,
          count: data?.count,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for course lecture quality)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course lecture quality:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 🌡️ GET QUALITY HEATMAP
  // ========================================================================
  async getQualityHeatmap(courseId) {
    const cacheKey = CACHE_KEYS.heatmap(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameter
    if (!courseId) {
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/quality/heatmap/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course,
          count: data?.count,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for quality heatmap)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching quality heatmap:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        course: null,
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📈 GET QUALITY BY CATEGORY
  // ========================================================================
  async getQualityByCategory(courseId, category) {
    const cacheKey = CACHE_KEYS.category(courseId, category);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameters
    if (!courseId) {
      return {
        success: false,
        data: [],
        category: null,
        course: null,
        count: 0,
        message: "Course ID is required"
      };
    }
    
    if (!category) {
      return {
        success: false,
        data: [],
        category: null,
        course: null,
        count: 0,
        message: "Category is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: [],
        category: null,
        course: null,
        count: 0,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/quality/category/${courseId}/${category}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          category: data?.category,
          course: data?.course,
          count: data?.count,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for quality by category)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching quality by category:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        category: null,
        course: null,
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📝 UPDATE LECTURE QUALITY SCORE
  // ========================================================================
  async updateLectureQualityScore(lectureId, scoreData) {
    return apiWrapper(
      apiClient.patch(`/quality/lecture/${lectureId}/score`, scoreData),
      "Failed to update lecture quality score"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🎯 Lecture quality score updated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.lecture(lectureId));
      invalidateCache(CACHE_KEYS.course(scoreData.courseId));
      invalidateCache(CACHE_KEYS.heatmap(scoreData.courseId));
      invalidateCache(CACHE_KEYS.category(scoreData.courseId, '*'));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Lecture quality score updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📊 SUBMIT QUALITY FEEDBACK
  // ========================================================================
  async submitQualityFeedback(feedbackData) {
    return apiWrapper(
      apiClient.post("/quality/feedback", feedbackData),
      "Failed to submit quality feedback"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🎯 Quality feedback submitted!");
      
      // Invalidate related cache entries
      if (feedbackData.lectureId) {
        invalidateCache(CACHE_KEYS.lecture(feedbackData.lectureId));
      }
      if (feedbackData.courseId) {
        invalidateCache(CACHE_KEYS.course(feedbackData.courseId));
        invalidateCache(CACHE_KEYS.heatmap(feedbackData.courseId));
        invalidateCache(CACHE_KEYS.category(feedbackData.courseId, '*'));
      }
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Quality feedback submitted successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  }
};

export default lectureQualityService;