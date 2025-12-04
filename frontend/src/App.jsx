import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// ==================== PUBLIC PAGES ====================
import LandingPage from "./Layout/LandingPage";
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OTP = lazy(() => import("./pages/OTP"));
import Unauthorized from "./pages/Unauthorized";

// ==================== SHARED COMPONENTS ====================
import HomePage from "./components/home/HomePage";
import Profile from "./components/Profile";
import ProfileSettings from "./components/ProfileSettings";
import TestNavigation from "./components/TestNavigation";

// ==================== AUTH & STATE ====================
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeAuth } from "./redux/authSlice";

// ==================== ROLE-SPECIFIC DASHBOARDS ====================
const StudentDashboard = lazy(() => import("./components/student/Dashboard/StudentDashboard"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

// ==================== STUDENT COMPONENTS ====================
const Courses = lazy(() => import("./components/student/Courses/Courses"));
const ViewCourse = lazy(() => import("./components/student/Courses/ViewCourse"));
const ViewLecture = lazy(() => import("./components/student/lectures/ViewLecture"));
const ViewNotes = lazy(() => import("./components/student/Notes/ViewNotes"));

// ==================== EDUCATOR COMPONENTS ====================
const EducatorLayout = lazy(() => import("./components/educator/UI Components/EducatorLayout"));
const Notes = lazy(() => import("./components/educator/Notes/Notes"));

// ==================== STYLING & UTILITIES ====================
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const dispatch = useDispatch();

  // Initialize authentication on app start
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <div>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-otp/:email" element={<OTP />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ==================== GENERAL PROTECTED ROUTES ==================== */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["student", "educator", "admin"]}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student", "educator", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/settings"
            element={
              <ProtectedRoute allowedRoles={["student", "educator", "admin"]}>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          {/* ==================== STUDENT ROUTES ==================== */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ViewCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId/lecture/:lectureId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ViewLecture />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notes/view/:noteId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ViewNotes />
              </ProtectedRoute>
            }
          />

          {/* ==================== EDUCATOR ROUTES ==================== */}
          <Route
            path="/educator/*"
            element={
              <ProtectedRoute allowedRoles={["educator"]}>
                <EducatorLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/educator"
            element={
              <ProtectedRoute allowedRoles={["educator"]}>
                <Navigate to="/educator/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== TESTING ROUTES ==================== */}
          <Route
            path="/test-courses"
            element={
              <ProtectedRoute allowedRoles={["student", "educator", "admin"]}>
                <TestNavigation />
              </ProtectedRoute>
            }
          />
          </Routes>
        </Suspense>

        {/* ==================== NOTIFICATIONS ==================== */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-16"
        />
      </div>
    </Router>
  );
}

export default App;