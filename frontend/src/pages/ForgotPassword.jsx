import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { forgotPassword } from "../redux/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const { isLoading, message, error } = useSelector(state => state.auth);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Email validation
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      const result = await dispatch(forgotPassword(email.trim()));
      
      // Since forgotPassword is a regular thunk, check the result directly
      if (result && result.success) {
        toast.success(`✅ Password reset link sent to ${email}!`);
        toast.info("📧 Please check your email and click the link to reset your password.");
      }
    } catch (err) {
      toast.error(err.message || "Unable to connect to server. Please check your internet connection and try again.");
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left Section */}
        <div className="hidden w-full md:w-1/2 bg-gradient-to-r from-blue-900 to-green-900 text-white md:flex flex-col items-center justify-center p-8 rounded-tr-[80px] rounded-br-[80px]">
          <div className="text-center h-[450px]">
            <motion.div 
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="bg-gradient-to-r from-blue-400 to-green-400 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-5xl font-bold">E</span>
                </div>
                <h2 className="text-2xl font-bold mt-4">EduPulse</h2>
              </div>
            </motion.div>
            
            <motion.h3 
              className="text-gray-300 mv-12 max-w-[320px] mx-auto text-3xl font-medium leading-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              "Transform your learning experience with our AI-powered platform"
            </motion.h3>
            
            <motion.div 
              className="mt-8 grid grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-2xl">📚</div>
                <p className="text-sm mt-2">Interactive Courses</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-2xl">🧠</div>
                <p className="text-sm mt-2">AI-Powered Learning</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-2xl">📊</div>
                <p className="text-sm mt-2">Progress Tracking</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
          <Link
            to={"/login"}
            className="border-2 border-blue-500 rounded-3xl font-bold w-52 py-2 px-4 fixed top-10 -left-28 hover:bg-blue-500 hover:text-white transition duration-300 text-end"
          >
            Back
          </Link>
          
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-12">
              <div className="rounded-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 w-24 h-24 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">E</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-medium text-center mb-5 overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            
            <p className="text-gray-800 text-center mb-12">
              Enter your email address to reset your password.
            </p>
            
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{message}</p>
                <div className="mt-4 text-center">
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="mb-4">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <button
                type="submit"
                className="mt-5 w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;