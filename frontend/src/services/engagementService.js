// ============================================================================
// 🌐 ENGAGEMENT SERVICE API (EduPulse)
// Handles all educator operations for student engagement tracking
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
  student: (courseId, studentId) => `engagement_student_${courseId}_${studentId}`,
  category: (courseId, category) => `engagement_category_${courseId}_${category}`,
  distribution: (courseId) => `engagement_distribution_${courseId}`,
  atrisk: (courseId) => `engagement_atrisk_${courseId}`,
  summary: (courseId) => `engagement_summary_${courseId}`
};

// ============================================================================
// 🎯 ENGAGEMENT SERVICE
// ============================================================================
const engagementService = {
  // ========================================================================
  // 👤 GET STUDENT ENGAGEMENT DATA
  // ========================================================================
  async getStudentEngagement(courseId, studentId) {
    const cacheKey = CACHE_KEYS.student(courseId, studentId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameters
    if (!courseId) {
      return {
        success: false,
        data: null,
        student: null,
        course: null,
        message: "Course ID is required"
      };
    }
    
    if (!studentId) {
      return {
        success: false,
        data: null,
        student: null,
        course: null,
        message: "Student ID is required"
      };
    }
    
    // Validate ID formats
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: null,
        student: null,
        course: null,
        message: "Invalid course ID format"
      };
    }
    
    if (typeof studentId !== 'string' || studentId.length < 24) {
      return {
        success: false,
        data: null,
        student: null,
        course: null,
        message: "Invalid student ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/engagement/student/${courseId}/${studentId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          student: data?.student,
          course: data?.course,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (2 minutes for student engagement data)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching student engagement data:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        student: null,
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 👥 GET STUDENTS BY ENGAGEMENT CATEGORY
  // ========================================================================
  async getStudentsByCategory(courseId, category) {
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
        message: "Course ID is required"
      };
    }
    
    if (!category) {
      return {
        success: false,
        data: [],
        category: null,
        course: null,
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
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/engagement/category/${courseId}/${category}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          category: data?.category,
          course: data?.course,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for category data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching students by category:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        category: null,
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📊 GET ENGAGEMENT DISTRIBUTION
  // ========================================================================
  async getEngagementDistribution(courseId) {
    const cacheKey = CACHE_KEYS.distribution(courseId);
    
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
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: [],
        course: null,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/engagement/distribution/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for distribution data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching engagement distribution:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // ⚠️ GET AT-RISK STUDENTS
  // ========================================================================
  async getAtRiskStudents(courseId) {
    const cacheKey = CACHE_KEYS.atrisk(courseId);
    
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
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: [],
        course: null,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/engagement/at-risk/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for at-risk data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching at-risk students:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📊 GET ENGAGEMENT SUMMARY
  // ========================================================================
  async getEngagementSummary(courseId) {
    const cacheKey = CACHE_KEYS.summary(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameter
    if (!courseId) {
      return {
        success: false,
        data: null,
        course: null,
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: null,
        course: null,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/engagement/summary/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for summary data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching engagement summary:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📈 UPDATE STUDENT ENGAGEMENT SCORE
  // ========================================================================
  async updateStudentEngagementScore(studentId, scoreData) {
    return apiWrapper(
      apiClient.patch(`/engagement/student/${studentId}/score`, scoreData),
      "Failed to update student engagement score"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🎯 Engagement score updated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.student('*', studentId));
      invalidateCache(CACHE_KEYS.category('*', '*'));
      invalidateCache(CACHE_KEYS.distribution('*'));
      invalidateCache(CACHE_KEYS.atrisk('*'));
      invalidateCache(CACHE_KEYS.summary('*'));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Engagement score updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📝 ADD ENGAGEMENT ACTIVITY
  // ========================================================================
  async addEngagementActivity(activityData) {
    return apiWrapper(
      apiClient.post("/engagement/activity", activityData),
      "Failed to add engagement activity"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🎯 Engagement activity recorded!");
      
      // Invalidate related cache entries
      if (activityData.courseId && activityData.studentId) {
        invalidateCache(CACHE_KEYS.student(activityData.courseId, activityData.studentId));
      }
      invalidateCache(CACHE_KEYS.category(activityData.courseId, '*'));
      invalidateCache(CACHE_KEYS.distribution(activityData.courseId));
      invalidateCache(CACHE_KEYS.atrisk(activityData.courseId));
      invalidateCache(CACHE_KEYS.summary(activityData.courseId));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Engagement activity recorded successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  }
};

export default engagementService;