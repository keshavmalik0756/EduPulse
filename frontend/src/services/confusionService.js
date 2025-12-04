// ============================================================================
// 🌐 CONFUSION SERVICE API (EduPulse)
// Handles all educator operations for student confusion detection
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
  lecture: (lectureId) => `confusion_lecture_${lectureId}`,
  lectureAnalysis: (lectureId) => `confusion_lecture_analysis_${lectureId}`,
  course: (courseId) => `confusion_course_${courseId}`,
  summary: (courseId) => `confusion_summary_${courseId}`,
  trend: (courseId, days) => `confusion_trend_${courseId}_${days}`,
  recommendations: (lectureId) => `confusion_recommendations_${lectureId}`
};

// ============================================================================
// 🤔 CONFUSION SERVICE
// ============================================================================
const confusionService = {
  // ========================================================================
  // 📊 GET LECTURE CONFUSION DATA
  // ========================================================================
  async getLectureConfusionData(lectureId) {
    const cacheKey = CACHE_KEYS.lecture(lectureId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/lecture/${lectureId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          lecture: data?.lecture
        };
      });
      
      // Cache the result with appropriate TTL (1 minute for lecture confusion data)
      setCache(cacheKey, result, CACHE_TTL.SHORT);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching lecture confusion data:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        lecture: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📊 GET LECTURE CONFUSION ANALYSIS
  // ========================================================================
  async getLectureConfusionAnalysis(lectureId) {
    const cacheKey = CACHE_KEYS.lectureAnalysis(lectureId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/lecture/${lectureId}/analysis`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          lecture: data?.lecture
        };
      });
      
      // Cache the result with appropriate TTL (1 minute for lecture confusion analysis)
      setCache(cacheKey, result, CACHE_TTL.SHORT);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching lecture confusion analysis:", error);
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
  // 📊 GET COURSE CONFUSION DATA
  // ========================================================================
  async getCourseConfusionData(courseId) {
    const cacheKey = CACHE_KEYS.course(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/course/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for course confusion data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course confusion data:", error);
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
  // 📊 GET COURSE CONFUSION SUMMARY
  // ========================================================================
  async getCourseConfusionSummary(courseId) {
    const cacheKey = CACHE_KEYS.summary(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/course/${courseId}/summary`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for confusion summary)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course confusion summary:", error);
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
  // 📈 GET CONFUSION TREND
  // ========================================================================
  async getConfusionTrend(courseId, days = 30) {
    const cacheKey = CACHE_KEYS.trend(courseId, days);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/course/${courseId}/trend?days=${days}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for confusion trend)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching confusion trend:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 💡 GET RECOMMENDATIONS
  // ========================================================================
  async getRecommendations(lectureId) {
    const cacheKey = CACHE_KEYS.recommendations(lectureId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/confusion/lecture/${lectureId}/recommendations`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for recommendations)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching recommendations:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📝 RECORD CONFUSION INTERACTION
  // ========================================================================
  async recordConfusionInteraction(interactionData) {
    return apiWrapper(
      apiClient.post("/confusion/interaction", interactionData),
      "Failed to record confusion interaction"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🤔 Confusion point recorded!");
      // Invalidate related cache entries
      if (interactionData.lectureId) {
        invalidateCache(CACHE_KEYS.lecture(interactionData.lectureId));
        invalidateCache(CACHE_KEYS.recommendations(interactionData.lectureId));
        invalidateCache(CACHE_KEYS.lectureAnalysis(interactionData.lectureId));
      }
      if (interactionData.courseId) {
        invalidateCache(CACHE_KEYS.course(interactionData.courseId));
        invalidateCache(CACHE_KEYS.summary(interactionData.courseId));
        invalidateCache(CACHE_KEYS.trend(interactionData.courseId, '*'));
      }
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Confusion point recorded successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // ✏️ UPDATE CONFUSION DATA
  // ========================================================================
  async updateConfusionData(confusionId, updateData) {
    return apiWrapper(
      apiClient.put(`/confusion/${confusionId}`, updateData),
      "Failed to update confusion data"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("✏️ Confusion data updated!");
      // Invalidate all confusion cache entries since we don't know which lecture/course
      invalidateCache('confusion_*');
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Confusion data updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  }
};

export default confusionService;