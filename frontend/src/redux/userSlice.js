// client/src/store/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Remove duplicate axios interceptor setup since it's already handled in apiClient.js
// axios.defaults.baseURL = "https://edupulse-ko2w.onrender.com/api";

// Helper function for consistent error handling
const handleApiError = (error, defaultMsg) => {
  return Promise.reject(new Error(error.response?.data?.message || defaultMsg));
};

// Helper function for error normalization
const normalizeError = (error) => {
  return {
    error: error.response?.data?.message || error.message || "An error occurred"
  };
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    fetchLoading: false, // For fetching all users
    adminLoading: false, // For adding a new admin
    error: null,
  },
  reducers: {
    // --- Fetch all users ---
    fetchAllUsersRequest: (state) => {
      state.fetchLoading = true;
      state.error = null;
    },
    fetchAllUsersSuccess: (state, action) => {
      state.fetchLoading = false;
      state.users = action.payload;
    },
    fetchAllUsersFailed: (state, action) => {
      state.fetchLoading = false;
      state.error = action.payload;
    },

    // --- Add new admin ---
    addNewAdminRequest: (state) => {
      state.adminLoading = true;
      state.error = null;
    },
    addNewAdminSuccess: (state) => {
      state.adminLoading = false;
    },
    addNewAdminFailed: (state, action) => {
      state.adminLoading = false;
      state.error = action.payload;
    },

    // --- Reset slice ---
    resetUserSlice: (state) => {
      state.fetchLoading = false;
      state.adminLoading = false;
      state.error = null;
    },
  },
});

export const {
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailed,
  addNewAdminRequest,
  addNewAdminSuccess,
  addNewAdminFailed,
  resetUserSlice,
} = userSlice.actions;

// --- Thunks ---
// Fetch all users
export const fetchAllUsers = () => async (dispatch) => {
  dispatch(fetchAllUsersRequest());
  try {
    const res = await axios.get(`/users/all`);
    dispatch(fetchAllUsersSuccess(res.data.users));
  } catch (error) {
    // Handle cancelled requests silently
    if (error.cancelled || error.silent) {
      return;
    }
    const normalizedError = normalizeError(error);
    dispatch(fetchAllUsersFailed(normalizedError.error));
    return normalizedError;
  }
};

// Add a new admin
export const addNewAdmin = (adminData) => async (dispatch) => {
  dispatch(addNewAdminRequest());
  try {
    const res = await axios.post(`/users/add/new-admin`, adminData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(res.data.message || "Admin added successfully");
    dispatch(addNewAdminSuccess());
    dispatch(fetchAllUsers()); // refresh list after adding admin
    return { success: true, message: res.data.message };
  } catch (error) {
    const normalizedError = normalizeError(error);
    toast.error(normalizedError.error);
    dispatch(addNewAdminFailed(normalizedError.error));
    return normalizedError;
  }
};

export default userSlice.reducer;