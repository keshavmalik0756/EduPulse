import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { LogOut } from 'lucide-react';
import { getUser, logout } from "../redux/authSlice";
import HomePage from "../components/home/HomePage";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isAuthenticated } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Fetch user data from backend
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user && !isLoading) {
      dispatch(getUser());
    }

    // Only redirect if we're on the exact "/dashboard" path (not "/home")
    if (user && window.location.pathname === "/dashboard") {
      // Redirect to role-specific dashboard
      setTimeout(() => {
        if (user.role === "student") {
          navigate("/dashboard/student");
        } else if (user.role === "educator") {
          navigate("/educator/dashboard");
        } else if (user.role === "admin") {
          navigate("/dashboard/admin");
        }
      }, 1000);
    }
  }, [isAuthenticated, user, isLoading, dispatch, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we're on a dashboard route, don't show the home page content
  if (window.location.pathname !== "/home" && window.location.pathname !== "/dashboard") {
    return null; // Let the ProtectedRoute handle the dashboard content
  }

  // If we're on the /home route, render the HomePage component
  if (window.location.pathname === "/home") {
    return <HomePage />;
  }

  // Only show the redirect loading for /dashboard route
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 w-8 h-8 rounded-lg"></div>
                <span className="ml-2 text-xl font-bold text-gray-900">EduPulse</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to EduPulse, {user?.name}!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Redirecting to your dashboard...
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;