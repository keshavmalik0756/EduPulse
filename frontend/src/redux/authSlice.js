import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../utils/apiClient";

// ====================== HELPERS ======================
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
    isLoading: !!token,
    error: null,
    message: null,
    isAuthenticated: !!token,
  };
};

// ====================== ASYNC THUNKS ======================

// Sync Firebase Identity with Backend
export const syncUserWithBackend = createAsyncThunk(
  "auth/sync",
  async ({ idToken, role }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/sync", { idToken, role }, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Logout User
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/auth/logout");
      return res.data.message;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Get Authenticated User Profile
export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found");

    try {
      const res = await apiClient.get("/auth/me");
      return res.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update User Profile Data
export const updateUserProfileData = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await apiClient.put("/users/profile", profileData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.success) {
        return res.data.user;
      } else {
        return rejectWithValue(res.data.message || "Failed to update profile");
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// ====================== SLICE ======================

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    initializeAuthAction(state) {
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
    resetAuthSliceAction(state) {
      state.error = null;
      state.message = null;
    },
    updateUserProfile(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // SYNC
      .addCase(syncUserWithBackend.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(syncUserWithBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("userId", action.payload.user._id);
        }
      })
      .addCase(syncUserWithBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // GET USER
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("userId", action.payload.user._id);
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.includes("401") || action.payload?.includes("Session expired")) {
          state.isAuthenticated = false;
          state.user = null;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
        } else {
          state.error = action.payload;
        }
      })
      // UPDATE PROFILE
      .addCase(updateUserProfileData.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
        if (action.payload && action.payload._id) {
          localStorage.setItem("userId", action.payload._id);
        }
      });
  },
});

export const {
  initializeAuthAction,
  resetAuthSliceAction,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;

// Initialize authentication on app start (manual thunk to orchestrate)
export const initializeAuth = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    dispatch(initializeAuthAction());
    try {
      await dispatch(getUser()).unwrap();
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Fallback is handled by getUser.rejected
    }
  } else {
    dispatch(initializeAuthAction());
  }
};