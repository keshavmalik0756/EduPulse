import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../redux/authSlice";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading, error } = useSelector(state => state.auth);
  const [redirectState, setRedirectState] = useState({ shouldRedirect: false, target: null, message: null });
  const [hasShownToast, setHasShownToast] = useState(false);

  // Handle auth errors
  useEffect(() => {
    if (error && !hasShownToast) {
      toast.error(error);
      setHasShownToast(true);
    }
  }, [error, hasShownToast]);

  // Handle redirect notifications
  useEffect(() => {
    if (redirectState.shouldRedirect && redirectState.message && !hasShownToast) {
      toast.error(redirectState.message);
      setHasShownToast(true);
    }
  }, [redirectState, hasShownToast]);

  // Fetch user data if authenticated but user data is not available
  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      dispatch(getUser());
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  // Reset toast state when location changes
  useEffect(() => {
    setHasShownToast(false);
  }, [location]);

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    if (!hasShownToast) {
      setHasShownToast(true);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user data is not loaded yet, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If allowedRoles is specified and user's role is not in allowedRoles, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const errorMessage = `Access denied. This page is only accessible to ${allowedRoles.join(", ")} users.`;
    
    if (!hasShownToast) {
      setHasShownToast(true);
    }
    
    // Redirect to user's own dashboard
    if (user.role === "student") {
      return <Navigate to="/dashboard/student" replace />;
    } else if (user.role === "educator") {
      return <Navigate to="/educator/dashboard" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // If everything is fine, render the children
  return children;
};

export default ProtectedRoute;