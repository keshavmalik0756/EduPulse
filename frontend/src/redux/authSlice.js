import { createSlice } from "@reduxjs/toolkit";

let apiClient = null;
const getApiClient = async () => {
  if (!apiClient) {
    const module = await import("../utils/apiClient");
    apiClient = module.default;
  }
  return apiClient;
};

const handleApiError = (error) => {
  if (error.response?.status === 429) {
    return "Rate limit exceeded. Please wait a few moments.";
  }
  if (error.code === 'ECONNABORTED') {
    return "Connection timeout. Please check your internet.";
  }
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    (typeof error.response?.data === 'string' ? error.response.data : null) ||
    error.message ||
    "An unexpected error occurred";
  return errorMessage;
};

const getInitialAuthState = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  let parsedUser = null;

  if (user && user !== "undefined") {
    try {
      parsedUser = JSON.parse(user);
    } catch (e) {
      localStorage.removeItem("user");
    }
  }

  return {
    user: parsedUser,
    isLoading: token ? true : false,
    error: null,
    message: null,
    isAuthenticated: token ? true : false,
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
        state.isLoading = true;
        if (user && user !== "undefined") {
          try {
            state.user = JSON.parse(user);
          } catch (e) {
            state.user = null;
            localStorage.removeItem("user");
          }
        }
      } else {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.user = null;
      }
    },
    syncRequest(state) {
      state.isLoading = true;
      state.error = null;
      state.message = null;
    },
    syncSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    syncFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logoutRequest(state) {
      state.isLoading = true;
    },
    logoutSuccess(state, action) {
      state.isLoading = false;
      state.message = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    },
    logoutFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getUserRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    getUserSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("userId", action.payload.user._id);
      }
    },
    getUserFailed(state, action) {
      state.isLoading = false;
      if (action.payload?.includes("401") || action.payload?.includes("Session expired")) {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      }
    },
    updateUserProfile(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    resetAuthSlice(state) {
      state.error = null;
      state.message = null;
    },
  },
});

export const {
  initializeAuth: initializeAuthAction,
  syncRequest,
  syncSuccess,
  syncFailed,
  logoutRequest,
  logoutSuccess,
  logoutFailed,
  getUserRequest,
  getUserSuccess,
  getUserFailed,
  updateUserProfile,
  resetAuthSliceAction,
} = authSlice.actions;

export default authSlice.reducer;

// Initialize authentication on app start
export const initializeAuth = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    dispatch(authSlice.actions.initializeAuth());
    try {
      await dispatch(getUser());
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(authSlice.actions.logoutSuccess("Session expired"));
    }
  } else {
    dispatch(authSlice.actions.initializeAuth());
  }
};

// Sync Firebase Identity with Backend
export const syncUserWithBackend = (idToken, role) => async (dispatch) => {
  const client = await getApiClient();
  dispatch(syncRequest());

  try {
    const res = await client.post("/auth/sync", { idToken, role }, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(syncSuccess(res.data));
    return res.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    dispatch(syncFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const logout = () => async (dispatch) => {
  const client = await getApiClient();
  dispatch(logoutRequest());
  try {
    const res = await client.get("/auth/logout");
    dispatch(logoutSuccess(res.data.message));
    return res.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    dispatch(logoutFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const getUser = () => async (dispatch) => {
  const client = await getApiClient();
  const token = localStorage.getItem("token");
  if (!token) {
    dispatch(getUserFailed("No token found"));
    return;
  }

  dispatch(getUserRequest());
  try {
    const res = await client.get("/auth/me");
    dispatch(getUserSuccess(res.data));
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logoutSuccess("Session expired"));
      return;
    }
    const errorMessage = handleApiError(error);
    dispatch(getUserFailed(errorMessage));
    throw new Error(errorMessage);
  }
};

export const updateUserProfileData = (profileData) => async (dispatch) => {
  const client = await getApiClient();
  try {
    const res = await client.put("/users/profile", profileData, {
      headers: { "Content-Type": "application/json" },
    });
    if (res.data.success) {
      dispatch(updateUserProfile(res.data.user));
      if (res.data.user && res.data.user._id) {
        localStorage.setItem("userId", res.data.user._id);
      }
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to update profile");
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};