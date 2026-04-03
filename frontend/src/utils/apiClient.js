import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";

// ====================== CONFIG ======================
const BASE_URL = import.meta.env.VITE_API_URL || "https://edupulse-ko2w.onrender.com/api";
let isRefreshing = false;
let isRedirecting = false; // 🔒 Guard against multiple concurrent redirects
let failedQueue = [];

// ====================== AXIOS INSTANCE ======================
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // ⏳ Supports uploads
  withCredentials: true,
});

// ====================== UTIL HELPERS ======================
const handleAuthFailure = (message = "Session expired. Please log in again.") => {
  if (isRedirecting) return; // Already handling a redirect
  isRedirecting = true;

  // 1. Clear all auth state
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("refreshToken");

  // 2. Notify user exactly once
  toast.error(message);

  // 3. Redirect to unified auth page
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth";
  }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getToken = () => localStorage.getItem("token");
const getRefreshToken = () => localStorage.getItem("refreshToken");
const setToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

// ====================== REQUEST INTERCEPTOR ======================
apiClient.interceptors.request.use(
  (config) => {
    // 🔐 Attach Authorization
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // 🧠 Request ID for tracing
    config.headers["X-Request-ID"] = uuidv4();

    // 🔹 Manage Content-Type
    if (config.data && typeof config.data.append === 'function') {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // 🧩 Remove Cache-Control header that's causing CORS issues
    delete config.headers["Cache-Control"];

    return config;
  },
  (error) => Promise.reject(error)
);

// ====================== RESPONSE INTERCEPTOR ======================
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // --------------------------
    // 🚨 Handle Network Errors
    // --------------------------
    if (!error.response) {
      if (!navigator.onLine) {
        toast.error("You're offline. Retrying when back online...");
        return new Promise((resolve) => {
          window.addEventListener(
            "online",
            () => resolve(apiClient(originalRequest)),
            { once: true }
          );
        });
      }
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // --------------------------
    // 🔄 Handle Token Expiration (401)
    // --------------------------
    if (status === 401 && !originalRequest._retry) {
      if (isRedirecting) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { token: refreshToken },
            { withCredentials: true }
          );

          const newToken = refreshResponse?.data?.token;
          if (newToken) {
            setToken(newToken);
            apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error("No refresh token returned.");
          }
        } else {
          throw new Error("No refresh token available.");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleAuthFailure("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --------------------------
    // 🚫 Unauthorized or Forbidden (403)
    // --------------------------
    if (status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/educator') || currentPath.includes('educator')) {
        toast.error(data?.message || "Access denied. Educator permission required.");
      } else {
        handleAuthFailure("Access denied. Please re-login.");
      }
    }

    return Promise.reject(error);
  }
);

// Token utilities
export const authUtils = {
  getToken,
  setToken,
  clearToken: () => localStorage.removeItem("token"),
};

// ====================== API WRAPPER ======================
export const apiWrapper = async (promise, fallbackMessage = "Request failed") => {
  try {
    const res = await promise;
    return res?.data;
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || fallbackMessage;
    toast.error(`❌ ${message}`);
    throw err;
  }
};

export default apiClient;