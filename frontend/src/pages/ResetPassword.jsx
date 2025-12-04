import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Eye, EyeOff } from 'lucide-react';
import { resetPassword as resetPasswordAction } from "../redux/authSlice";

const ResetPassword = () => {
  // State management
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Hooks
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const { isLoading } = useSelector(state => state.auth);

  // Password strength checker
  const checkPasswordStrength = useCallback((password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, []);

  // Handle password change
  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    checkPasswordStrength(newPassword);
  }, [checkPasswordStrength]);

  // Handle confirm password change
  const handleConfirmPasswordChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
  }, []);

  // Check if password is valid
  const isPasswordValid = useCallback(() => {
    return Object.values(passwordStrength).every(Boolean);
  }, [passwordStrength]);

  // Check if passwords match
  const doPasswordsMatch = useCallback(() => {
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return formData.password && 
           formData.confirmPassword && 
           isPasswordValid() && 
           doPasswordsMatch();
  }, [formData.password, formData.confirmPassword, isPasswordValid, doPasswordsMatch]);

  // Handle form submission
  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password does not meet security requirements!");
      return;
    }

    if (!doPasswordsMatch()) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const result = await dispatch(resetPasswordAction({password: formData.password, confirmPassword: formData.confirmPassword}, token));
      
      if (resetPasswordAction.fulfilled.match(result)) {
        toast.success("✅ Password reset successfully! You can now log in.");
        setTimeout(() => {
          navigateTo("/login");
        }, 2000);
      } else {
        toast.error(result.payload || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
    }
  }, [formData, isPasswordValid, doPasswordsMatch, token, dispatch, navigateTo]);

  // Handle show/hide password
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Redirect if no token
  if (!token) {
    return <Navigate to={"/forgot-password"} replace />;
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-black">Resetting your password...</p>
            <p className="text-sm text-black mt-2">
              Please wait while we reset your password
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left Section - Branding */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-blue-900 to-green-900 text-white p-8 rounded-tr-[80px] rounded-br-[80px] relative">
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
              className="text-white mv-12 max-w-[320px] mx-auto text-3xl font-medium leading-10"
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

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
          {/* Back Button */}
          <Link
            to={"/forgot-password"}
            className="border-2 border-blue-500 rounded-3xl font-bold w-52 py-2 px-4 fixed top-10 -left-28 hover:bg-blue-500 hover:text-white transition duration-300 text-end"
            aria-label="Go back to forgot password page"
          >
            Back
          </Link>

          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <div className="rounded-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 w-24 h-24 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">E</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-medium text-center mb-5 overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-800 text-center mb-12">
              Please enter your new password
            </p>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter new password"
                    disabled={isLoading}
                    className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-describedby="password-strength"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div id="password-strength" className="mt-2 text-xs" role="status" aria-live="polite">
                    <div className="mb-2 text-gray-700 font-medium">Password strength:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2" aria-hidden="true">{passwordStrength.length ? '✓' : '✗'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2" aria-hidden="true">{passwordStrength.uppercase ? '✓' : '✗'}</span>
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2" aria-hidden="true">{passwordStrength.lowercase ? '✓' : '✗'}</span>
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center ${passwordStrength.number ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2" aria-hidden="true">{passwordStrength.number ? '✓' : '✗'}</span>
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center ${passwordStrength.special ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2" aria-hidden="true">{passwordStrength.special ? '✓' : '✗'}</span>
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-describedby="password-match"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div id="password-match" className="mt-1 text-xs" role="status" aria-live="polite">
                    {!doPasswordsMatch() ? (
                      <p className="text-red-600">Passwords do not match</p>
                    ) : (
                      <p className="text-green-600">Passwords match</p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-5 w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                disabled={isLoading || !isFormValid()}
                aria-describedby={!isFormValid() ? "form-validation" : undefined}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>

              {/* Form Validation Message */}
              {!isFormValid() && formData.password && (
                <div id="form-validation" className="text-xs text-red-600 text-center" role="alert">
                  Please ensure all requirements are met before submitting
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition duration-200"
                  aria-label="Go to login page"
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

export default ResetPassword;