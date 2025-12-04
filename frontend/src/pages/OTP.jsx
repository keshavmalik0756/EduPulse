import React, { useState, useRef, useEffect } from "react";
import { Navigate, useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { otpVerification, resendOTP } from "../redux/authSlice";

const OTP = () => {
  const { email } = useParams();
  const [otp, setOtp] = useState(Array(5).fill(""));
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const { isLoading, isAuthenticated, user } = useSelector(state => state.auth);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    // Allow only numeric values
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (value !== "" && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 5);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = Array(5).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the last filled input or the first empty one
      const lastIndex = pastedData.length < 5 ? pastedData.length : 4;
      inputRefs.current[lastIndex].focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    
    if (otpString.length !== 5) {
      toast.error("Please enter all 5 digits of the OTP");
      return;
    }

    try {
      const result = await dispatch(otpVerification(email, otpString));

      // Since otpVerification is a regular thunk, check the result directly
      if (result && result.success) {
        toast.success("✅ Account verified successfully! Welcome to EduPulse!");

        // Redirect to homepage after successful verification
        setTimeout(() => {
          navigateTo("/home");
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      const result = await dispatch(resendOTP(email));
      if (result && result.success) {
        toast.success("🔄 New verification code sent to your email!");
        // Clear previous OTP
        setOtp(Array(5).fill(""));
        // Focus on first input
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isAuthenticated) {
    // Redirect to homepage after successful authentication
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Verifying your account...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we verify your OTP</p>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
          <div className="absolute top-4 left-4">
            <Link
              to="/signup"
              className="flex items-center text-blue-500 hover:text-blue-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Signup
            </Link>
          </div>
          <div className="max-w-sm w-full">
            <div className="flex justify-center mb-12">
              <div className="rounded-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 w-24 h-24 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">E</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-medium text-center mb-12 overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              Check your Mailbox
            </h1>
            <p className="text-gray-800 text-center mb-12">
              Please enter the OTP to proceed
            </p>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-blue-600">✅</span>
                <span className="text-blue-800 text-sm font-medium">
                  Verification code sent to {email}
                </span>
              </div>
            </div>
            <form onSubmit={handleOtpVerification}>
              <div className="mb-4">
                {/* Block-wise OTP input - 5 digits */}
                <div className="flex justify-center space-x-3 md:space-x-4" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  "VERIFY"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                <button
                  className="text-blue-500 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResendOTP}
                  disabled={isResending || isLoading}
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden w-full md:w-1/2 bg-gradient-to-r from-blue-900 to-green-900 text-white md:flex flex-col items-center justify-center p-8 rounded-tl-[80px] rounded-bl-[80px]">
          <div className="text-center h-[400px]">
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

            <motion.p
              className="text-gray-300 mb-12 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Transform your learning experience with our AI-powered platform
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                to="/signup"
                className="px-8 py-3 text-lg font-semibold bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition duration-300 border border-white/30"
              >
                SIGN UP
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
      </div>
    </>
  );
};

export default OTP;