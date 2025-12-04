// ============================================================================
// 🌐 LECTURE SERVICE API (EduPulse)
// Handles all educator & student operations for lectures
// ============================================================================

import apiClient, { apiWrapper } from "../utils/apiClient.js";
import { toast } from "react-hot-toast";
import { FrontendErrorHandler } from "../utils/errorHandler.js";

// ========================== Generic Normalizer ================================
const extractData = (data, path = "") => {
  if (!data) return undefined;
  if (path) {
    if (data[path] !== undefined) return data[path];
    if (data.data && data.data[path] !== undefined) return data.data[path];
  }
  return data.data !== undefined ? data.data : data;
};

// Use the imported apiWrapper from apiClient.js

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

// ============================================================================
// 🎬 LECTURE SERVICE
// ============================================================================
const lectureService = {
  // ========================================================================
  // 🎥 CREATE NEW LECTURE (with video upload)
  // ========================================================================
  async createLecture(lectureData, onUploadProgress) {
    return apiWrapper(
      apiClient.post("/lectures", lectureData, {
        ...((lectureData && typeof lectureData.append === 'function') && onUploadProgress && {
          onUploadProgress,
        }),
      }),
      "Failed to create lecture"
    ).then((data) => {
      toast.success("🎥 Lecture created successfully!");
      const lecture = extractData(data, "lecture") || extractData(data, "data") || data;
      return { success: true, lecture };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // ✏️ UPDATE LECTURE
  // ========================================================================
  async updateLecture(lectureId, lectureData, onUploadProgress) {
    return apiWrapper(
      apiClient.put(`/lectures/${lectureId}`, lectureData, {
        ...((lectureData && typeof lectureData.append === 'function') && onUploadProgress && {
          onUploadProgress,
        }),
      }),
      "Failed to update lecture"
    ).then((data) => {
      toast.success("✏️ Lecture updated successfully!");
      const lecture = extractData(data, "lecture") || extractData(data, "data") || data;
      return { success: true, lecture };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🗑️ DELETE LECTURE
  // ========================================================================
  async deleteLecture(lectureId) {
    return apiWrapper(
      apiClient.delete(`/lectures/${lectureId}`),
      "Failed to delete lecture"
    ).then(() => {
      toast.success("🗑️ Lecture deleted successfully!");
      return { success: true };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🎓 GET LECTURES BY COURSE (Educator / Student View)
  // ========================================================================
  async getLecturesByCourse(courseId, page = 1, limit = 10) {
    return withRetry(async () => {
      const { data } = await apiClient.get(
        `/lectures/course/${courseId}?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        lectures: extractData(data, "lectures") || [],
        pagination: extractData(data, "pagination") || extractData(data, "data.pagination") || {},
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching lectures by course:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        lectures: [],
        pagination: {},
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ========================================================================
  // 📘 GET SINGLE LECTURE DETAILS
  // ========================================================================
  async getLectureById(lectureId) {
    return apiWrapper(
      withRetry(async () => {
        const { data } = await apiClient.get(`/lectures/${lectureId}`);
        const lecture = extractData(data, "lecture") || extractData(data, "data") || data;
        return { success: true, data: lecture };
      }),
      "Failed to fetch lecture details"
    ).then((data) => {
      // Re-wrap the response to maintain consistency with other service methods
      const lecture = extractData(data, "lecture") || extractData(data, "data") || data;
      return { success: true, data: lecture };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🔄 UPDATE WATCH PROGRESS (Student)
  // ========================================================================
  async updateLectureProgress(lectureId, watchedDuration, showToast = false) {
    return apiWrapper(
      apiClient.patch(`/lectures/${lectureId}/progress`, { watchedDuration }),
      "Failed to update lecture progress"
    ).then((data) => {
      if (showToast) toast.success("⏱️ Progress updated!");
      const progress = extractData(data, "data") || extractData(data, "progress") || data;
      return { success: true, progress };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🚦 TOGGLE LECTURE ACTIVE STATUS
  // ========================================================================
  async toggleLectureStatus(lectureId) {
    return apiWrapper(
      apiClient.patch(`/lectures/${lectureId}/toggle`),
      "Failed to toggle lecture status"
    ).then((data) => {
      const isActive = data?.data?.isActive;
      toast.success(
        isActive ? "✅ Lecture activated!" : "⛔ Lecture deactivated!"
      );
      return { success: true, isActive };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 🔀 REORDER LECTURES (Educator Drag & Drop)
  // ========================================================================
  async reorderLectures(courseId, lectureOrders) {
    return apiWrapper(
      apiClient.patch(`/lectures/course/${courseId}/reorder`, { lectureOrders }),
      "Failed to reorder lectures"
    ).then((data) => {
      toast.success("🔀 Lectures reordered successfully!");
      return { success: true, data: extractData(data, "data") };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📊 GET COURSE LECTURE STATISTICS
  // ========================================================================
  async getLectureStatistics(courseId) {
    return apiWrapper(
      withRetry(async () => {
        const { data } = await apiClient.get(
          `/lectures/course/${courseId}/statistics`
        );
        const stats = extractData(data, "stats") || extractData(data, "data") || data;
        return { success: true, stats };
      }),
      "Failed to fetch lecture statistics"
    ).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },
};

export default lectureService;