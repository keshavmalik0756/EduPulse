import { createSlice } from "@reduxjs/toolkit";

// Lazy load apiClient to avoid circular dependency issues
let apiClient = null;
const getApiClient = async () => {
  if (!apiClient) {
    const module = await import("../utils/apiClient");
    apiClient = module.default;
  }
  return apiClient;
};

// Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add rate limiting tracking
let loginAttemptCount = 0;
let lastLoginAttemptTime = 0;
const MAX_LOGIN_ATTEMPTS_PER_MINUTE = 10; // Increased for better user experience

// Add rate limiting tracking for getUser requests
let getUserAttemptCount = 0;
let lastGetUserAttemptTime = 0;
const MAX_GETUSER_ATTEMPTS_PER_MINUTE = 20;

// Utility function to handle API errors consistently
const handleApiError = (error) => {
  // Handle 429 Too Many Requests specifically
  if (error.response?.status === 429) {
    return "Too many requests. Please wait a few minutes before trying again.";
  }
  
  // Extract error message from response
  const errorMessage = 
    error.response?.data?.message || 
    error.response?.data?.error || 
    error.message || 
    "An unexpected error occurred";
  
  console.error("API Error:", errorMessage);
  return errorMessage;
};

// Exponential backoff function for retrying requests
const retryWithBackoff = async (fn, retries = 3, baseDelay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.response?.status !== 429) {
      throw error;
    }
    
    // Calculate delay with exponential backoff and jitter
    const delay = baseDelay * Math.pow(2, 3 - retries) + Math.random() * 1000;
    
    console.log(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with decreased retries count
    return retryWithBackoff(fn, retries - 1, baseDelay);
  }
};

// Check if we can make a login request based on rate limiting
const canMakeLoginRequest = () => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000; // 1 minute ago
  
  // Reset count if more than a minute has passed
  if (lastLoginAttemptTime < oneMinuteAgo) {
    loginAttemptCount = 0;
  }
  
  // Check if we've exceeded the limit
  if (loginAttemptCount >= MAX_LOGIN_ATTEMPTS_PER_MINUTE) {
    return {
      allowed: false,
      message: "Too many login attempts. Please wait a moment before trying again."
    };
  }
  
  // Increment count and update time
  loginAttemptCount++;
  lastLoginAttemptTime = now;
  
  return { allowed: true };
};

// Check if we can make a getUser request based on rate limiting
const canMakeGetUserRequest = () => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000; // 1 minute ago
  
  // Reset count if more than a minute has passed
  if (lastGetUserAttemptTime < oneMinuteAgo) {
    getUserAttemptCount = 0;
  }
  
  // Check if we've exceeded the limit
  if (getUserAttemptCount >= MAX_GETUSER_ATTEMPTS_PER_MINUTE) {
    return {
      allowed: false,
      message: "Too many profile requests. Please wait a moment before trying again."
    };
  }
  
  // Increment count and update time
  getUserAttemptCount++;
  lastGetUserAttemptTime = now;
  
  return { allowed: true };
};

// Check if user is already authenticated on app start
const getInitialAuthState = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  let parsedUser = null;
  
  if (user && user !== "undefined") {
    try {
      parsedUser = JSON.parse(user);
    } catch (e) {
      console.warn("Failed to parse user data from localStorage", e);
      // Clear invalid user data
      localStorage.removeItem("user");
    }
  }
  
  return {
    user: parsedUser,
    isLoading: token ? true : false, // Set loading to true if token exists
    error: null,
    message: null,
    isAuthenticated: token ? true : false, // Set authenticated if token exists
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    initializeAuth(state) {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token) {
        state.isAuthenticated = true;
        state.isLoading = true; // Will fetch user data
        if (user && user !== "undefined") {
          try {
            state.user = JSON.parse(user);
          } catch (e) {
            console.warn("Failed to parse user data from localStorage in initializeAuth", e);
            state.user = null;
            // Clear invalid user data
            localStorage.removeItem("user");
          }
        }
      } else {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.user = null;
      }
    },
    registerRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    registerSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
    },
    registerFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    otpVerificationRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    otpVerificationSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
      // Store refresh token if provided
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      // Store user data in localStorage for persistence
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem("user");
      }
      // Store userId separately for easy access
      if (action.payload.user && action.payload.user._id) {
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    otpVerificationFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    loginRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
      // Store refresh token if provided
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      // Store user data in localStorage for persistence
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem("user");
      }
      // Store userId separately for easy access
      if (action.payload.user && action.payload.user._id) {
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    loginFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    logoutSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      // Remove tokens and user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // Remove userId from localStorage
      localStorage.removeItem("userId");
    },
    logoutFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getUserRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    getUserSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Update user data in localStorage
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem("user");
      }
      // Store userId separately for easy access
      if (action.payload.user && action.payload.user._id) {
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    getUserFailed(state, action) {
      state.isLoading = false;
      // Only set unauthenticated if it's a 401 error
      if (action.payload?.includes("401") || action.payload?.includes("Session expired")) {
        state.isAuthenticated = false;
        state.user = null;
        // Remove invalid token and user data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Remove userId from localStorage
        localStorage.removeItem("userId");
      }
    },
    forgotPasswordRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    forgotPasswordSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
    },
    forgotPasswordFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetPasswordRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    resetPasswordSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
      // Store refresh token if provided
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      // Store user data in localStorage for persistence
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem("user");
      }
      // Store userId separately for easy access
      if (action.payload.user && action.payload.user._id) {
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    resetPasswordFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updatePasswordRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    updatePasswordSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
    },
    updatePasswordFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateUserProfile(state, action) {
      // Update user profile data in state and localStorage
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      } else {
        localStorage.removeItem("user");
      }
    },
    resetAuthSlice(state) {
      state.isLoading = false;
      state.error = null;
      state.message = null;
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
    },
  },
});

export const resetAuthSlice = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

// Initialize authentication on app start
export const initializeAuth = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    dispatch(authSlice.actions.initializeAuth());
    // Automatically fetch user data if token exists
    try {
      await dispatch(getUser());
    } catch (error) {
      // If token is invalid, clear it and reset auth state
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      dispatch(authSlice.actions.logoutSuccess("Session expired"));
    }
  } else {
    dispatch(authSlice.actions.initializeAuth());
  }
};

// --- Thunks ---
export const register = (Data) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.registerRequest());
  try {
    const res = await client.post("/auth/register", Data, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(authSlice.actions.registerSuccess(res.data));
    return res.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.registerFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const otpVerification = (email, otp) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.otpVerificationRequest());
  try {
    const res = await client.post("/auth/verify-otp", { email, otp }, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(authSlice.actions.otpVerificationSuccess(res.data));
    return res.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.otpVerificationFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const login = (data) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.loginRequest());
  
  // Check rate limiting
  const rateLimitCheck = canMakeLoginRequest();
  if (!rateLimitCheck.allowed) {
    const errorMessage = rateLimitCheck.message;
    dispatch(authSlice.actions.loginFailed(errorMessage));
    throw new Error(errorMessage);
  }
  
  try {
    // Use retry with backoff for login requests
    const res = await retryWithBackoff(async () => {
      return await client.post("/auth/login", data, {
        headers: { "Content-Type": "application/json" },
      });
    }, 3, 1000); // 3 retries with exponential backoff starting at 1 second
    
    dispatch(authSlice.actions.loginSuccess(res.data));
    // Reset attempt count on successful login
    loginAttemptCount = 0;
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.loginFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.loginFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const logout = () => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.logoutRequest());
  try {
    const res = await client.get("/auth/logout");
    dispatch(authSlice.actions.logoutSuccess(res.data.message));
    dispatch(authSlice.actions.resetAuthSlice());
    return res.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.logoutFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const getUser = () => async (dispatch) => {
  const client = await getApiClient();
  // Check rate limiting
  const rateLimitCheck = canMakeGetUserRequest();
  if (!rateLimitCheck.allowed) {
    const errorMessage = rateLimitCheck.message;
    dispatch(authSlice.actions.getUserFailed(errorMessage));
    throw new Error(errorMessage);
  }
  
  // Check if token exists before making request
  const token = localStorage.getItem("token");
  if (!token) {
    dispatch(authSlice.actions.getUserFailed("No token found"));
    return;
  }

  dispatch(authSlice.actions.getUserRequest());
  try {
    // Use retry with backoff for user requests
    const res = await retryWithBackoff(async () => {
      return await client.get("/auth/me"); // This should be correct
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    dispatch(authSlice.actions.getUserSuccess(res.data));
    // Reset attempt count on successful request
    getUserAttemptCount = 0;
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.getUserFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    // Handle cancelled requests silently
    if (error.cancelled || error.silent) {
      dispatch(authSlice.actions.getUserFailed("Request cancelled"));
      return;
    }
    
    // If token is invalid (401), clear it and reset auth state
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      dispatch(authSlice.actions.logoutSuccess("Session expired"));
      return;
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.getUserFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.forgotPasswordRequest());
  try {
    // Use retry with backoff for forgot password requests
    const res = await retryWithBackoff(async () => {
      return await client.post("/auth/password/forgot", { email }, {
        headers: { "Content-Type": "application/json" },
      });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    dispatch(authSlice.actions.forgotPasswordSuccess(res.data));
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.forgotPasswordFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.forgotPasswordFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const resetPassword = (passwords, token) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.resetPasswordRequest());
  try {
    // Use retry with backoff for reset password requests
    const res = await retryWithBackoff(async () => {
      return await client.put(`/auth/password/reset/${token}`, passwords, {
        headers: { "Content-Type": "application/json" },
      });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    dispatch(authSlice.actions.resetPasswordSuccess(res.data));
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.resetPasswordFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.resetPasswordFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const updatePassword = (passwords) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.updatePasswordRequest());
  try {
    // Use retry with backoff for update password requests
    const res = await retryWithBackoff(async () => {
      return await client.put("/auth/password/update", passwords, {
        headers: { "Content-Type": "application/json" },
      });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    dispatch(authSlice.actions.updatePasswordSuccess(res.data));
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.updatePasswordFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.updatePasswordFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const resendOTP = (email) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(authSlice.actions.registerRequest());
  try {
    // Use retry with backoff for resend OTP requests
    const res = await retryWithBackoff(async () => {
      return await client.post("/auth/resend-otp", { email }, {
        headers: { "Content-Type": "application/json" },
      });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    dispatch(authSlice.actions.registerSuccess(res.data));
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.registerFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    const errorMessage = handleApiError(error);
    dispatch(authSlice.actions.registerFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

// Refresh token function
export const refreshToken = () => async (dispatch) => {
  const client = await getApiClient();
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) {
      throw new Error("No refresh token available");
    }
    
    // Use retry with backoff for refresh token requests
    const res = await retryWithBackoff(async () => {
      return await client.post("/auth/refresh", { token: refreshTokenValue });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    const { token: newToken, user: refreshedUser } = res.data;
    
    // Store new token
    localStorage.setItem("token", newToken);
    
    // Update Authorization header
    client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Update user data if provided
    if (refreshedUser) {
      dispatch(authSlice.actions.getUserSuccess({ user: refreshedUser }));
      // Store userId separately for easy access
      if (refreshedUser._id) {
        localStorage.setItem("userId", refreshedUser._id);
      }
    } else {
      localStorage.removeItem("user");
      // Fetch updated user data if not provided in refresh response
      await dispatch(getUser());
    }
    
    return res.data;
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      const errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      dispatch(authSlice.actions.logoutFailed(errorMessage));
      throw new Error(errorMessage);
    }
    
    // Refresh failed, logout user
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    dispatch(authSlice.actions.logoutSuccess("Session expired. Please log in again."));
    throw new Error("Failed to refresh token");
  }
};

// Update user profile function
export const updateUserProfileData = (profileData) => async (dispatch) => {
  const client = await getApiClient();
  try {
    // Use retry with backoff for update profile requests
    const res = await retryWithBackoff(async () => {
      return await client.put("/users/profile", profileData, {
        headers: { "Content-Type": "application/json" },
      });
    }, 2, 1500); // 2 retries with exponential backoff starting at 1.5 seconds
    
    if (res.data.success) {
      dispatch(authSlice.actions.updateUserProfile(res.data.user));
      // Store userId separately for easy access
      if (res.data.user && res.data.user._id) {
        localStorage.setItem("userId", res.data.user._id);
      }
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to update profile");
    }
  } catch (error) {
    // Handle 429 errors specifically
    if (error.response?.status === 429) {
      throw new Error("Too many requests. Please wait a few minutes before trying again.");
    }
    
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};

export const {
  initializeAuth: initializeAuthAction,
  registerRequest,
  registerSuccess,
  registerFailed,
  otpVerificationRequest,
  otpVerificationSuccess,
  otpVerificationFailed,
  loginRequest,
  loginSuccess,
  loginFailed,
  logoutRequest,
  logoutSuccess,
  logoutFailed,
  getUserRequest,
  getUserSuccess,
  getUserFailed,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailed,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailed,
  updatePasswordRequest,
  updatePasswordSuccess,
  updatePasswordFailed,
  updateUserProfile,
  resetAuthSlice: resetAuthSliceAction,
} = authSlice.actions;

export default authSlice.reducer;