// ============================================================================
// 🌐 SECTION SERVICE API (EduPulse)
// Handles all section-level operations within a course
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

// ========================== Cache Helpers ==============================
const CACHE_KEYS = {
  sections: (courseId) => `sections_${courseId}`,
  statistics: (courseId) => `sections_stats_${courseId}`
};

const invalidateCourseCache = (courseId) => {
  invalidateCache(CACHE_KEYS.sections(courseId));
  invalidateCache(CACHE_KEYS.statistics(courseId));
};

// ========================== Retry Wrapper (Transient Failures) ================
const withRetry = async (fn, retries = 3, delay = 500) => {
  try {
    return await fn();
  } catch (error) {
    const isTransientError =
      error?.response?.status >= 500 ||
      error?.code === "ECONNABORTED" ||
      (error?.message && error.message.includes("WriteConflict")) ||
      error?.response?.data?.codeName === "WriteConflict";

    if (!isTransientError || retries <= 0) throw error;

    if (import.meta.env.DEV) console.warn(`🔄 Retrying request... (${retries} left)`, error);
    const jitter = Math.random() * 300;
    await new Promise((res) => setTimeout(res, delay + jitter));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

// ============================================================================  
// 📚 SECTION SERVICE
// ============================================================================
const sectionService = {
  // ========================================================================
  // 📘 GET ALL SECTIONS BY COURSE
  // ========================================================================
  async getSectionsByCourse(courseId, { forceRefresh = false } = {}) {
    const cacheKey = CACHE_KEYS.sections(courseId);
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const result = await withRetry(async () => {
        const { data } = await apiClient.get(`/sections/course/${courseId}`);
        const sections = processApiResponse(data)?.sections || [];
        return { success: true, sections };
      });
      
      // Cache the result with appropriate TTL (5 minutes for section data)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching sections by course:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        sections: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 🆕 CREATE NEW SECTION
  // ========================================================================
  async createSection(courseId, sectionData) {
    try {
      // Validate inputs before sending request
      if (!courseId) {
        throw new Error("Course ID is required");
      }
      
      if (!sectionData || !sectionData.title || !sectionData.title.trim()) {
        throw new Error("Section title is required");
      }

      const body = await apiWrapper(
        apiClient.post(`/sections/course/${courseId}`, sectionData),
        "Failed to create section"
      );
      toast.success("📘 Section created successfully!");
      // Invalidate cache for this course
      invalidateCourseCache(courseId);
      return { success: true, section: processApiResponse(body)?.section || processApiResponse(body) };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      
      // Provide more specific error messages for common issues
      if (error?.response?.status === 400) {
        toast.error(`Validation Error: ${errorMessage}`);
      } else if (error?.response?.status === 404) {
        toast.error("Course not found. Please refresh and try again.");
      } else {
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
  },

  // ========================================================================
  // ✏️ UPDATE SECTION
  // ========================================================================
  async updateSection(sectionId, sectionData) {
    try {
      const body = await apiWrapper(
        apiClient.put(`/sections/${sectionId}`, sectionData),
        "Failed to update section"
      );
      toast.success("✏️ Section updated successfully!");
      // Invalidate all caches since we don't know which course this section belongs to
      // In a production app, you might want to pass courseId to this function
      // to invalidate more specifically
      invalidateCache(CACHE_KEYS.sections('*'));
      invalidateCache(CACHE_KEYS.statistics('*'));
      return { success: true, section: processApiResponse(body)?.section || processApiResponse(body) };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // ========================================================================
  // 🔁 REORDER SECTIONS (Drag & Drop)
  // ========================================================================
  async reorderSections(courseId, newOrder) {
    try {
      const body = await apiWrapper(
        apiClient.patch(`/sections/course/${courseId}/reorder`, { newOrder }),
        "Failed to reorder sections"
      );
      toast.success("🔀 Sections reordered successfully!");
      // Invalidate cache for this course
      invalidateCourseCache(courseId);
      return { success: true, data: processApiResponse(body) };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // ========================================================================
  // 🚦 TOGGLE PUBLISH STATUS
  // ========================================================================
  async toggleSectionStatus(sectionId) {
    try {
      const body = await apiWrapper(
        apiClient.patch(`/sections/${sectionId}/toggle`),
        "Failed to toggle section status"
      );
      const isPublished = processApiResponse(body)?.section?.isPublished;
      toast.success(
        isPublished ? "✅ Section published!" : "❌ Section unpublished!"
      );
      // Invalidate all caches since we don't know which course this section belongs to
      invalidateCache(CACHE_KEYS.sections('*'));
      invalidateCache(CACHE_KEYS.statistics('*'));
      return { success: true, section: processApiResponse(body)?.section || processApiResponse(body)?.section };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // ========================================================================
  // 🗑️ DELETE SECTION (Soft Delete)
  // ========================================================================
  async deleteSection(sectionId) {
    try {
      await apiWrapper(
        apiClient.delete(`/sections/${sectionId}`),
        "Failed to delete section"
      );
      toast.success("🗑️ Section deleted successfully!");
      // Invalidate all caches since we don't know which course this section belongs to
      invalidateCache(CACHE_KEYS.sections('*'));
      invalidateCache(CACHE_KEYS.statistics('*'));
      return { success: true };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // ========================================================================
  // 📊 GET SECTION STATISTICS
  // ========================================================================
  async getSectionStatistics(courseId) {
    const cacheKey = CACHE_KEYS.statistics(courseId);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const result = await withRetry(async () => {
        const { data } = await apiClient.get(`/sections/course/${courseId}/statistics`);
        return {
          success: true,
          stats: processApiResponse(data)?.stats,
        };
      });
      
      // Cache the result with appropriate TTL (10 minutes for statistics)
      setCache(cacheKey, result, CACHE_TTL.MEDIUM_LONG);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching section statistics:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        stats: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================
  // 📙 GET SINGLE SECTION
  // ========================================================================
  async getSectionById(sectionId) {
    try {
      const result = await withRetry(async () => {
        const { data } = await apiClient.get(`/sections/${sectionId}`);
        return {
          success: true,
          section: processApiResponse(data)?.section,
        };
      });
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching section by ID:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        section: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },
};

export default sectionService;