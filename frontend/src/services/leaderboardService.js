// ============================================================================
// 🏆 COURSE LEADERBOARD SERVICE API (EduPulse)
// Handles all operations for course leaderboard functionality
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
  leaderboard: (limit, category) => `leaderboard_${limit}_${category || 'all'}`,
  entry: (courseId) => `leaderboard_entry_${courseId}`,
  top: (metric, limit) => `leaderboard_top_${metric}_${limit}`
};

// ============================================================================
// 🏆 COURSE LEADERBOARD SERVICE
// ============================================================================
const leaderboardService = {
  // ========================================================================
  // 🏅 GET COURSE LEADERBOARD
  // ========================================================================
  async getCourseLeaderboard(limit = 10, category = null) {
    const cacheKey = CACHE_KEYS.leaderboard(limit, category);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate limit parameter
    if (limit && (typeof limit !== 'number' || limit < 1)) {
      return {
        success: false,
        data: [],
        count: 0,
        category: category || 'all',
        message: "Invalid limit parameter. Must be a positive number."
      };
    }

    try {
      const result = await withRetry(async () => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (category) params.append('category', category);
        
        const response = await apiClient.get(`/leaderboard?${params.toString()}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          count: data?.count,
          category: data?.category,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for leaderboard)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course leaderboard:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        count: 0,
        category: category || 'all',
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 🎯 GET COURSE LEADERBOARD ENTRY
  // ========================================================================
  async getCourseLeaderboardEntry(courseId) {
    const cacheKey = CACHE_KEYS.entry(courseId);
    
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
        message: "Course ID is required"
      };
    }
    
    // Validate ID format
    if (typeof courseId !== 'string' || courseId.length < 24) {
      return {
        success: false,
        data: null,
        message: "Invalid course ID format"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/leaderboard/course/${courseId}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (2 minutes for leaderboard entry)
      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course leaderboard entry:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📈 GET TOP PERFORMING BY METRIC
  // ========================================================================
  async getTopPerformingByMetric(metric, limit = 10) {
    const cacheKey = CACHE_KEYS.top(metric, limit);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Validate required parameter
    if (!metric) {
      return {
        success: false,
        data: [],
        metric: null,
        count: 0,
        message: "Metric is required"
      };
    }
    
    // Validate limit parameter
    if (limit && (typeof limit !== 'number' || limit < 1)) {
      return {
        success: false,
        data: [],
        metric: metric,
        count: 0,
        message: "Invalid limit parameter. Must be a positive number."
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/leaderboard/top/${metric}?limit=${limit}`);
        const { data } = response;
        
        return {
          success: data?.success ?? true,
          data: processApiResponse(data)?.data,
          metric: data?.metric,
          count: data?.count,
          message: data?.message
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for top performing data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching top performing courses by metric:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        metric: metric,
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 🏆 UPDATE LEADERBOARD ENTRY
  // ========================================================================
  async updateLeaderboardEntry(entryData) {
    return apiWrapper(
      apiClient.post("/leaderboard/update", entryData),
      "Failed to update leaderboard entry"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🏆 Leaderboard entry updated!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.leaderboard('*', '*'));
      invalidateCache(CACHE_KEYS.entry(entryData.courseId));
      invalidateCache(CACHE_KEYS.top('*', '*'));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Leaderboard entry updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🗑️ REMOVE FROM LEADERBOARD
  // ========================================================================
  async removeFromLeaderboard(courseId) {
    return apiWrapper(
      apiClient.delete(`/leaderboard/course/${courseId}`),
      "Failed to remove course from leaderboard"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🗑️ Course removed from leaderboard!");
      
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.leaderboard('*', '*'));
      invalidateCache(CACHE_KEYS.entry(courseId));
      invalidateCache(CACHE_KEYS.top('*', '*'));
      
      return { 
        success: true, 
        data: processApiResponse(data)?.data,
        message: data?.message || "Course removed from leaderboard successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  }
};

export default leaderboardService;