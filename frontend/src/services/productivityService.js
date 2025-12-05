// ============================================================================
// 🌐 PRODUCTIVITY SERVICE API (EduPulse)
// Handles all educator operations for productivity tracking
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
import { dataSyncManager, SYNC_CONFIG } from "../utils/dataSync.js";

// ========================== Generic Normalizer ================================
const extractData = (response) => {
  // Handle both direct data and nested data structures
  if (!response) return null;
  
  // If response has a data property, use that
  if (response.data !== undefined) {
    // If response.data has a data property, use that
    if (response.data.data !== undefined) {
      return response.data.data;
    }
    // Otherwise use response.data directly
    return response.data;
  }
  
  // If no data property, return the whole response
  return response;
};

// ========================== Enhanced Data Extractor ================================
const extractProductivityData = (response) => {
  // Handle various response formats
  if (!response || !response.data) return null;
  
  // If response has a data property with nested data
  if (response.data.data !== undefined) {
    return response.data.data;
  }
  
  // If response has a direct data object
  if (response.data && typeof response.data === 'object') {
    // Check if it's a productivity object by looking for key fields
    if ('productivityScore' in response.data || 'weekStartDate' in response.data) {
      return response.data;
    }
  }
  
  // Return null if we can't identify the productivity data
  return null;
};

// ========================== Cache Helpers ==============================
const CACHE_KEYS = {
  productivity: (weekStartDate) => `productivity_${weekStartDate}`,
  history: 'productivity_history',
  summary: 'productivity_summary',
  current: 'productivity_current'
};

// ========================== Retry Wrapper (Transient Failures) ================
const withRetry = async (fn, retries = 2, delay = 800) => {
  try {
    return await fn();
  } catch (error) {
    // If it's a CORS error, don't retry as it won't help
    if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
      console.error('CORS error detected, not retrying:', error.message);
      throw error;
    }
    
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

// ========================== Synced Fetchers ==============================
// Create synchronized fetchers for productivity data
const syncedGetCurrentWeekProductivity = dataSyncManager.createSyncedFetcher(
  CACHE_KEYS.current,
  async () => {
    const response = await apiClient.get(`/productivity/current`);
    return {
      success: response?.data?.success ?? true,
      data: extractProductivityData(response),
      educator: response?.data?.educator,
      message: response?.data?.message,
      lastSynced: new Date().toISOString()
    };
  },
  {
    ttl: CACHE_TTL.MEDIUM,
    freshnessThreshold: SYNC_CONFIG.FRESHNESS_THRESHOLDS.IMPORTANT,
    dataType: 'productivity'
  }
);

const syncedGetProductivityHistory = dataSyncManager.createSyncedFetcher(
  CACHE_KEYS.history,
  async () => {
    const response = await apiClient.get(`/productivity/history?limit=12`);
    return {
      success: response?.data?.success ?? true,
      data: extractData(response) || [],
      educator: response?.data?.educator,
      message: response?.data?.message,
      lastSynced: new Date().toISOString()
    };
  },
  {
    ttl: CACHE_TTL.LONG,
    freshnessThreshold: SYNC_CONFIG.FRESHNESS_THRESHOLDS.NORMAL,
    dataType: 'productivity_history'
  }
);

const syncedGetProductivitySummary = dataSyncManager.createSyncedFetcher(
  CACHE_KEYS.summary,
  async () => {
    const response = await apiClient.get(`/productivity/summary?weeks=12`);
    return {
      success: response?.data?.success ?? true,
      data: extractProductivityData(response),
      educator: response?.data?.educator,
      message: response?.data?.message,
      lastSynced: new Date().toISOString()
    };
  },
  {
    ttl: CACHE_TTL.LONG,
    freshnessThreshold: SYNC_CONFIG.FRESHNESS_THRESHOLDS.NORMAL,
    dataType: 'productivity_summary'
  }
);

// ============================================================================
// 📈 PRODUCTIVITY SERVICE
// ============================================================================
const productivityService = {
  // ========================================================================
  // 📅 GET EDUCATOR PRODUCTIVITY FOR WEEK
  // ========================================================================
  async getEducatorProductivity(weekStartDate) {
    const cacheKey = CACHE_KEYS.productivity(weekStartDate);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached && dataSyncManager.isDataFresh(cached)) {
      return cached;
    }
    
    // Validate required parameter
    if (!weekStartDate) {
      return {
        success: false,
        data: null,
        educator: null,
        message: "Week start date is required"
      };
    }

    try {
      const result = await withRetry(async () => {
        const response = await apiClient.get(`/productivity/week/${weekStartDate}`);
        
        return {
          success: response?.data?.success ?? true,
          data: extractProductivityData(response),
          educator: response?.data?.educator,
          message: response?.data?.message,
          lastSynced: new Date().toISOString()
        };
      });
      
      // Cache the result with appropriate TTL (5 minutes for productivity data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        educator: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📚 GET PRODUCTIVITY HISTORY
  // ========================================================================
  async getProductivityHistory(limit = 12) {
    const cacheKey = `${CACHE_KEYS.history}_${limit}`;
    
    // Use synchronized fetcher for better data consistency
    try {
      const result = await syncedGetProductivityHistory();
      // Update cache with limit-specific key
      setCache(cacheKey, result, CACHE_TTL.LONG);
      return result;
    } catch (error) {
      // If it's a CORS error, provide a more specific message
      if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
        console.error('CORS error fetching productivity history:', error.message);
        toast.error('Network connectivity issue. Please check your internet connection and try again.');
        // Fallback to cache if available
        const cached = getCache(cacheKey);
        if (cached) {
          return cached;
        }
        return {
          success: false,
          data: [],
          educator: null,
          message: 'Network connectivity issue. Please check your internet connection and try again.',
          code: 'CORS_ERROR'
        };
      }
      
      // Fallback to cache if available
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
      
      // If no cache, handle error normally
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching productivity history:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        educator: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📊 GET PRODUCTIVITY SUMMARY
  // ========================================================================
  async getProductivitySummary(weeks = 12) {
    const cacheKey = `${CACHE_KEYS.summary}_${weeks}`;
    
    // Use synchronized fetcher for better data consistency
    try {
      const result = await syncedGetProductivitySummary();
      // Update cache with weeks-specific key
      setCache(cacheKey, result, CACHE_TTL.LONG);
      return result;
    } catch (error) {
      // If it's a CORS error, provide a more specific message
      if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
        console.error('CORS error fetching productivity summary:', error.message);
        toast.error('Network connectivity issue. Please check your internet connection and try again.');
        // Fallback to cache if available
        const cached = getCache(cacheKey);
        if (cached) {
          return cached;
        }
        return {
          success: false,
          data: null,
          educator: null,
          message: 'Network connectivity issue. Please check your internet connection and try again.',
          code: 'CORS_ERROR'
        };
      }
      
      // Fallback to cache if available
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
      
      // If no cache, handle error normally
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching productivity summary:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        educator: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 🔄 UPDATE EDUCATOR PRODUCTIVITY
  // ========================================================================
  async updateEducatorProductivity(weekStartDate, metrics) {
    // Validate required parameter
    if (!weekStartDate) {
      throw new Error("Week start date is required");
    }

    return apiWrapper(
      apiClient.put(`/productivity/week/${weekStartDate}`, metrics),
      "Failed to update educator productivity data"
    ).then((response) => {
      toast.success("📈 Productivity data updated!");
      // Invalidate related cache entries
      invalidateCache(CACHE_KEYS.productivity(weekStartDate));
      invalidateCache(CACHE_KEYS.history);
      invalidateCache(CACHE_KEYS.summary);
      invalidateCache(CACHE_KEYS.current);
      return { 
        success: true, 
        data: extractProductivityData(response),
        message: response?.data?.message || "Productivity data updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🕒 GET CURRENT WEEK PRODUCTIVITY
  // ========================================================================
  async getCurrentWeekProductivity() {
    // Use synchronized fetcher for better data consistency
    try {
      const result = await syncedGetCurrentWeekProductivity();
      return result;
    } catch (error) {
      // If it's a CORS error, provide a more specific message
      if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
        console.error('CORS error fetching current week productivity:', error.message);
        toast.error('Network connectivity issue. Please check your internet connection and try again.');
        return {
          success: false,
          data: null,
          educator: null,
          message: 'Network connectivity issue. Please check your internet connection and try again.',
          code: 'CORS_ERROR'
        };
      }
      
      // Fallback to cache if available
      const cached = getCache(CACHE_KEYS.current);
      if (cached) {
        return cached;
      }
      
      // If no cache, handle error normally
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching current week productivity:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        educator: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },
  
  // ========================================================================
  // 🔄 FORCE REFRESH ALL PRODUCTIVITY DATA
  // ========================================================================
  async forceRefreshAll() {
    try {
      // Invalidate all productivity cache entries
      invalidateCache(CACHE_KEYS.current);
      invalidateCache(CACHE_KEYS.history);
      invalidateCache(CACHE_KEYS.summary);
      
      // Force refresh current week data
      const currentResult = await dataSyncManager.forceSync(
        'productivity_current',
        syncedGetCurrentWeekProductivity
      );
      
      // Force refresh history data
      const historyResult = await dataSyncManager.forceSync(
        'productivity_history',
        syncedGetProductivityHistory
      );
      
      // Force refresh summary data
      const summaryResult = await dataSyncManager.forceSync(
        'productivity_summary',
        syncedGetProductivitySummary
      );
      
      toast.success("📊 All productivity data refreshed!");
      
      return {
        current: currentResult,
        history: historyResult,
        summary: summaryResult
      };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error force refreshing productivity data:", error);
      toast.error(errorInfo.message);
      throw new Error(errorInfo.message);
    }
  }
};

export default productivityService;