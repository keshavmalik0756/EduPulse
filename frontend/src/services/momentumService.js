// ============================================================================
// 🌐 MOMENTUM SERVICE API (EduPulse)
// Handles all educator operations for lecture momentum tracking
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
// 📈 MOMENTUM SERVICE
// ============================================================================
const momentumService = {
  // ========================================================================
  // 📊 GET COURSE MOMENTUM DATA
  // ========================================================================
  async getCourseMomentum(courseId, days = 30) {
    return withRetry(async () => {
      const response = await apiClient.get(`/momentum/course/${courseId}?days=${days}`);
      const { data } = response;
      
      return {
        success: data?.success ?? true,
        data: extractData(data, "data"),
        course: data?.course,
        period: data?.period
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course momentum data:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: [],
        course: null,
        period: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ========================================================================
  // 📊 GET MOMENTUM SUMMARY
  // ========================================================================
  async getMomentumSummary(courseId, days = 30) {
    return withRetry(async () => {
      const response = await apiClient.get(`/momentum/course/${courseId}/summary?days=${days}`);
      const { data } = response;
      
      return {
        success: data?.success ?? true,
        data: extractData(data, "data"),
        course: data?.course,
        period: data?.period
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching momentum summary:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: null,
        course: null,
        period: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ========================================================================
  // 🔄 UPDATE MOMENTUM DATA
  // ========================================================================
  async updateMomentumData(courseId, date, metrics) {
    return apiWrapper(
      apiClient.put(`/momentum/course/${courseId}/date/${date}`, metrics),
      "Failed to update momentum data"
    ).then((response) => {
      const data = response.data || response;
      toast.success("📈 Momentum data updated!");
      return { 
        success: true, 
        data: extractData(data, "data"),
        message: data?.message || "Momentum data updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================
  // 📊 GET COMPARATIVE MOMENTUM
  // ========================================================================
  async getComparativeMomentum(courseIds, days = 30) {
    const idsParam = Array.isArray(courseIds) ? courseIds.join(',') : courseIds;
    return withRetry(async () => {
      const response = await apiClient.get(`/momentum/compare?courseIds=${idsParam}&days=${days}`);
      const { data } = response;
      
      return {
        success: data?.success ?? true,
        data: extractData(data, "data"),
        period: data?.period
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching comparative momentum data:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        data: {},
        period: null,
        message: errorInfo.message,
        code: errorInfo.code
      };
    });
  },

  // ========================================================================
  // 🧮 CALCULATE MOMENTUM FROM METRICS
  // ========================================================================
  async calculateMomentumFromMetrics(courseId) {
    return apiWrapper(
      apiClient.post(`/momentum/course/${courseId}/calculate`),
      "Failed to calculate momentum data"
    ).then((response) => {
      const data = response.data || response;
      toast.success("🧮 Momentum data calculated!");
      return { 
        success: true, 
        data: extractData(data, "data"),
        message: data?.message || "Momentum data calculated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  }
};

export default momentumService;