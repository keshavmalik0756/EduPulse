// ============================================================================
// 🌐 QUIZ SERVICE API (EduPulse)
// Handles all educator operations for quizzes
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

const CACHE_KEYS = {
  courseQuizzes: (courseId) => `quizzes_course_${courseId}`,
  quiz: (quizId) => `quiz_${quizId}`,
};

const quizService = {
  // ========================================================================
  // 📝 GET QUIZZES BY COURSE
  // ========================================================================
  async getQuizzesByCourse(courseId) {
    const cacheKey = CACHE_KEYS.courseQuizzes(courseId);
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await apiClient.get(`/quizzes/course/${courseId}`);
      const quizzes = processApiResponse(data)?.quizzes || [];
      
      const result = {
        success: true,
        quizzes,
        count: quizzes.length
      };

      setCache(cacheKey, result, CACHE_TTL.SHORT_MEDIUM);
      return result;
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      console.error("Error fetching quizzes:", error);
      return {
        success: false,
        quizzes: [],
        message: errorInfo.message
      };
    }
  },

  // ========================================================================
  // ➕ CREATE NEW QUIZ
  // ========================================================================
  async createQuiz(quizData) {
    return apiWrapper(
      apiClient.post("/quizzes", quizData),
      "Failed to create quiz"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("🎯 Quiz created successfully!");
      
      const quiz = data?.quiz || data?.data?.quiz || data;
      
      // Invalidate cache
      if (quizData.courseId) {
        invalidateCache(CACHE_KEYS.courseQuizzes(quizData.courseId));
      }
      
      return { success: true, quiz };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      toast.error(errorInfo.message);
      throw new Error(errorInfo.message);
    });
  },

  // ========================================================================
  // ✏️ UPDATE QUIZ
  // ========================================================================
  async updateQuiz(quizId, quizData) {
    return apiWrapper(
      apiClient.put(`/quizzes/${quizId}`, quizData),
      "Failed to update quiz"
    ).then((response) => {
      const data = processApiResponse(response) || response;
      toast.success("✅ Quiz updated successfully!");
      
      const quiz = data?.quiz || data?.data?.quiz || data;
      
      // Invalidate cache
      invalidateCache(CACHE_KEYS.quiz(quizId));
      if (quiz.courseId) {
        invalidateCache(CACHE_KEYS.courseQuizzes(quiz.courseId));
      }
      
      return { success: true, quiz };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      toast.error(errorInfo.message);
      throw new Error(errorInfo.message);
    });
  },

  // ========================================================================
  // 🗑️ DELETE QUIZ
  // ========================================================================
  async deleteQuiz(quizId, courseId) {
    return apiWrapper(
      apiClient.delete(`/quizzes/${quizId}`),
      "Failed to delete quiz"
    ).then(() => {
      toast.success("🗑️ Quiz deleted successfully!");
      
      // Invalidate cache
      invalidateCache(CACHE_KEYS.quiz(quizId));
      if (courseId) {
        invalidateCache(CACHE_KEYS.courseQuizzes(courseId));
      }
      
      return { success: true };
    }).catch(error => {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      toast.error(errorInfo.message);
      throw new Error(errorInfo.message);
    });
  },

  // ========================================================================
  // 📊 GET QUIZ RESULTS (Educator)
  // ========================================================================
  async getQuizResults(quizId) {
    try {
      const { data } = await apiClient.get(`/quizzes/${quizId}/results`);
      return {
        success: true,
        results: processApiResponse(data)?.results || []
      };
    } catch (error) {
      const errorInfo = FrontendErrorHandler.handleApiError(error);
      return { success: false, message: errorInfo.message };
    }
  }
};

export default quizService;
