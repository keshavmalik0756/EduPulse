// ============================================================================
// 🌐 NOTE SERVICE API (EduPulse)
// Handles all educator & student operations for course notes
// ============================================================================

import apiClient, { apiWrapper } from "../utils/apiClient.js";
import { toast } from "react-hot-toast";
import { FrontendErrorHandler } from "../utils/errorHandler.js";

// ============================================================================
// 📦 CLEAN DATA EXTRACTOR (WORKS WITH ALL BACKEND FORMATS)
// ============================================================================
const normalize = (payload) => {
  if (!payload) return null;
  return payload?.data ?? payload?.note ?? payload;
};

// ============================================================================
// 🔁 RETRY WRAPPER FOR NETWORK FAILURES
// ============================================================================
const withRetry = async (fn, retries = 2, delay = 800) => {
  try {
    return await fn();
  } catch (error) {
    const transient =
      error?.response?.status >= 500 ||
      error?.code === "ECONNABORTED" ||
      error?.message?.includes("Network") ||
      error?.message?.includes("timeout");

    if (!transient || retries <= 0) throw error;

    if (import.meta.env.DEV) {
      console.warn(`🔄 Retrying... (${retries} left)`, error.message);
    }

    await new Promise((r) =>
      setTimeout(r, delay + Math.random() * 200)
    );

    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

// ============================================================================
// 📝 NOTE SERVICE (EduPulse)
// ============================================================================
const noteService = {
  // ------------------------------------------------------------------------
  // 📌 CREATE NOTE (Text or File)
  // ------------------------------------------------------------------------
  async createNote(noteData) {
    const isFormData = noteData instanceof FormData;

    return apiWrapper(
      apiClient.post("/notes", noteData, {
        ...(isFormData && { headers: undefined }), // Let Axios auto-set multipart boundaries
      }),
      "Failed to create note"
    )
      .then((res) => {
        const note = normalize(res);
        toast.success("📝 Note created successfully!");
        return { success: true, note };
      })
      .catch((error) => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ------------------------------------------------------------------------
  // ✏️ UPDATE NOTE
  // ------------------------------------------------------------------------
  async updateNote(noteId, noteData) {
    return apiWrapper(
      apiClient.put(`/notes/${noteId}`, noteData),
      "Failed to update note"
    )
      .then((res) => {
        const note = normalize(res);
        toast.success("✏️ Note updated successfully!");
        return { success: true, note };
      })
      .catch((error) => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ------------------------------------------------------------------------
  // 🗑 DELETE NOTE
  // ------------------------------------------------------------------------
  async deleteNote(noteId) {
    return apiWrapper(
      apiClient.delete(`/notes/${noteId}`),
      "Failed to delete note"
    )
      .then((res) => {
        toast.success("🗑️ Note deleted successfully");
        return { success: true, data: res.data };
      })
      .catch((error) => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ------------------------------------------------------------------------
  // 📚 GET NOTES BY LECTURE
  // ------------------------------------------------------------------------
  async getNotesByLecture(lectureId) {
    return withRetry(async () => {
      const { data } = await apiClient.get(`/notes/lecture/${lectureId}`);

      return {
        success: true,
        notes: data?.data || data?.notes || [],
        count: data?.count ?? (data?.data?.length || 0),
      };
    }).catch((error) => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching lecture notes:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        notes: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ------------------------------------------------------------------------
  // 📘 GET NOTES BY COURSE
  // ------------------------------------------------------------------------
  async getNotesByCourse(courseId) {
    return withRetry(async () => {
      const { data } = await apiClient.get(`/notes/course/${courseId}`);

      return {
        success: true,
        notes: data?.data || data?.notes || [],
        count: data?.count ?? (data?.data?.length || 0),
      };
    }).catch((error) => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course notes:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        notes: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ------------------------------------------------------------------------
  // 👤 GET USER NOTES
  // ------------------------------------------------------------------------
  async getUserNotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/notes/user${query ? `?${query}` : ""}`;

    return withRetry(async () => {
      const { data } = await apiClient.get(url);

      return {
        success: true,
        notes: data?.data || data?.notes || [],
        count: data?.count ?? (data?.data?.length || 0),
      };
    }).catch((error) => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching user notes:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        notes: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ------------------------------------------------------------------------
  // 🎯 GET SINGLE NOTE
  // ------------------------------------------------------------------------
  async getNoteById(noteId) {
    return apiWrapper(
      withRetry(async () => {
        const { data } = await apiClient.get(`/notes/${noteId}`);
        return { success: true, data: normalize(data) };
      }),
      "Failed to fetch note details"
    )
      .then((res) => {
        return { success: true, data: normalize(res) };
      })
      .catch((error) => {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        const errorMessage = errorInfo.message;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      });
  },

  // ------------------------------------------------------------------------
  // 🔍 SEARCH NOTES
  // ------------------------------------------------------------------------
  async searchNotes(query, filters = {}) {
    if (!query) {
      return {
        success: false,
        notes: [],
        count: 0,
        message: "Search query is required",
      };
    }

    const params = new URLSearchParams({ query, ...filters }).toString();
    const url = `/notes/search?${params}`;

    return withRetry(async () => {
      const { data } = await apiClient.get(url);

      return {
        success: true,
        notes: data?.data || data?.notes || [],
        count: data?.count ?? (data?.data?.length || 0),
      };
    }).catch((error) => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error searching notes:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        notes: [],
        count: 0,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },
};

export default noteService;