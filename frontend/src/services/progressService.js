// services/progressService.js
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import { FrontendErrorHandler } from "../utils/errorHandler.js";

const progressService = {
  // ========================================================================== 
  // 📈 GET COURSE PROGRESS
  // ==========================================================================
  async getCourseProgress(courseId) {
    try {
      const response = await apiClient.get(`/progress/${courseId}`);
      return {
        success: true,
        progress: response.data?.progress || {},
        message: response.data?.message || "Progress fetched successfully"
      };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching course progress:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        progress: {},
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  },

  // ========================================================================== 
  // 📈 UPDATE COURSE PROGRESS
  // ==========================================================================
  async updateCourseProgress(courseId, progressData) {
    return apiWrapper(
      apiClient.post(`/progress/${courseId}`, progressData),
      "Failed to update course progress"
    ).then((response) => {
      const data = response.data || response;
      toast.success("Progress updated successfully!");
      return { 
        success: true, 
        progress: data?.progress || data,
        message: data?.message || "Progress updated successfully!"
      };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      const errorMessage = errorInfo.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    });
  },

  // ========================================================================== 
  // 📈 GET ALL COURSE PROGRESS
  // ==========================================================================
  async getAllCourseProgress() {
    try {
      const response = await apiClient.get(`/progress`);
      return {
        success: true,
        progress: response.data?.progress || [],
        message: response.data?.message || "All progress fetched successfully"
      };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching all course progress:", error);
      toast.error(errorInfo.message);
      return {
        success: false,
        progress: [],
        message: errorInfo.message,
        code: errorInfo.code
      };
    }
  }
};

export default progressService;