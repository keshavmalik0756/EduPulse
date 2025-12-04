import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { store } from "../redux/store"; // Import the Redux store
import { getUserSuccess } from "../redux/authSlice"; // Import the action

// ====================== CONFIG ======================
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
let isRefreshing = false;
let failedQueue = [];

// ====================== AXIOS INSTANCE ======================
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // ⏳ Supports uploads
  withCredentials: true,
});

// ====================== UTIL HELPERS ======================
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

    // 🧩 Cache busting for GET
    if (config.method?.toLowerCase() === "get") {
      config.headers["Cache-Control"] = "no-cache";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ====================== RESPONSE INTERCEPTOR ======================
apiClient.interceptors.response.use(
  (response) => response,
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
      if (isRefreshing) {
        // Queue requests while refreshing
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
        // Get refresh token from localStorage
        const refreshToken = getRefreshToken(); // This gets the refresh token from localStorage
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { token: refreshToken }, // Send refresh token in the body
            { withCredentials: true }
          );

          const newToken = refreshResponse?.data?.token;
          const refreshedUser = refreshResponse?.data?.user;
          
          if (newToken) {
            setToken(newToken);
            apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Update user data in localStorage if provided
            if (refreshedUser) {
              localStorage.setItem("user", JSON.stringify(refreshedUser));
              // Also update Redux store with refreshed user data
              store.dispatch(getUserSuccess({ user: refreshedUser }));
            }
            
            return apiClient(originalRequest);
          } else {
            throw new Error("No refresh token returned.");
          }
        } else {
          throw new Error("No refresh token available.");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setToken(null);
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --------------------------
    // 🚫 Unauthorized or Forbidden (403)
    // --------------------------
    if (status === 403) {
      // Check if user is trying to access a route they don't have permission for
      const currentPath = window.location.pathname;
      
      // If this is an educator trying to access educator routes, don't redirect to login
      if (currentPath.startsWith('/educator') || currentPath.includes('educator')) {
        console.log('Educator access denied - staying on current page');
        toast.error(data?.message || "Access denied. You don't have permission to access this resource.");
      } else {
        toast.error("Access denied. Please re-login.");
        setToken(null);
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // --------------------------
    // ⚠️ Client Errors (400–499)
    // --------------------------
    if (status >= 400 && status < 500 && status !== 401) {
      console.warn(`⚠️ Client Error ${status}:`, {
        message: data?.message,
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        fullError: data
      });
      toast.error(data?.message || "Something went wrong.");
    }

    // --------------------------
    // 💥 Server Errors (500+)
    // --------------------------
    if (status >= 500) {
      console.error("💥 Server Error:", data?.message);
      toast.error("Server error occurred. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// ====================== TOKEN UTILITIES ======================
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

// ====================== EXPORT ======================
export default apiClient;