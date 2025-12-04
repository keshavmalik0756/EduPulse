import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice';
import authSlice from './authSlice';
// import courseSlice from './courseSlice'; // Removed course slice

export const store = configureStore({
  reducer: {
    user: userSlice,
    auth: authSlice,
    // courses: courseSlice, // Removed course reducer
  }
});

export default store;