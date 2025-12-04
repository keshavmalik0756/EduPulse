// ============================================================================
// 🌐 DROPOUT PREDICTION SERVICE API (EduPulse)
// Handles all educator operations for predicting student drop-off zones
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
  course: (courseId, threshold) => `dropout_course_${courseId}_${threshold}`,
  highrisk: (courseId) => `dropout_highrisk_${courseId}`,
  summary: (courseId) => `dropout_summary_${courseId}`
};

// ============================================================================
// 📉 DROPOUT PREDICTION SERVICE
// ============================================================================
const dropoutService = {
  // ========================================================================
  // 📊 GET COURSE DROPOUT PREDICTIONS
  // ========================================================================
  async getCourseDropouts(courseId, threshold = 50) {
    const cacheKey = CACHE_KEYS.course(courseId, threshold);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/dropout/course/${courseId}?threshold=${threshold}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for dropout predictions)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course dropout predictions:", error);
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
  // ⚠️ GET HIGH-RISK DROPOUT POINTS
  // ========================================================================
  async getHighRiskDropouts(courseId) {
    const cacheKey = CACHE_KEYS.highrisk(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/dropout/course/${courseId}/high-risk`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for high-risk data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching high-risk dropouts:", error);
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
  // 📈 CALCULATE POLYNOMIAL DROPOUT PREDICTIONS
  // ========================================================================
  async calculatePolynomialDropouts(courseId) {
    return apiWrapper(
      apiClient.post(`/dropout/course/${courseId}/polynomial`),
      "Failed to calculate polynomial dropout predictions"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("📉 Polynomial dropout predictions calculated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.course(courseId, '*'));
      invalidateCache(CACHE_KEYS.highrisk(courseId));
      invalidateCache(CACHE_KEYS.summary(courseId));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Dropout predictions calculated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📈 CALCULATE MOVING AVERAGE DROPOUT PREDICTIONS
  // ========================================================================
  async calculateMovingAverageDropouts(courseId, windowSize = 3) {
    return apiWrapper(
      apiClient.post(`/dropout/course/${courseId}/moving-average?windowSize=${windowSize}`),
      "Failed to calculate moving average dropout predictions"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("📉 Moving average dropout predictions calculated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.course(courseId, '*'));
      invalidateCache(CACHE_KEYS.highrisk(courseId));
      invalidateCache(CACHE_KEYS.summary(courseId));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Dropout predictions calculated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📊 GET DROPOUT PREDICTION SUMMARY
  // ========================================================================
  async getDropoutSummary(courseId) {
    const cacheKey = CACHE_KEYS.summary(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/dropout/course/${courseId}/summary`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          course: data?.course
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for summary data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching dropout summary:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        course: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  }
};

export default dropoutService;