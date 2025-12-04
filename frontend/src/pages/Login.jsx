import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { login } from "../redux/authSlice";
import ImageSlideshow from "../components/ImageSlideshow";
import loginHero from "../assets/login-hero.svg";
import educationHero1 from "../assets/education-hero-1.svg";
import educationHero2 from "../assets/education-hero-2.svg";
import collaborationHero from "../assets/collaboration-hero.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [submitCooldown, setSubmitCooldown] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, user } = useSelector(state => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/home");
    }
  }, [isAuthenticated, user, navigate]);

  // Handle cooldown timer
  useEffect(() => {
    if (submitCooldown) {
      const timer = setTimeout(() => {
        setSubmitCooldown(false);
        setRateLimitError(false);
      }, 5000); // 5 second cooldown for better user experience
      
      return () => clearTimeout(timer);
    }
  }, [submitCooldown]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check cooldown
    const now = Date.now();
    if (now - lastSubmitTime < 1000) {
      toast.warn("Please wait before trying again");
      return;
    }
    
    setLastSubmitTime(now);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      Object.values(formErrors).forEach(error => toast.error(error));
      return;
    }

    try {
      const result = await dispatch(login({ email, password }));

      if (result && result.success) {
        toast.success("✅ Login successful!");
        navigate("/home");
      }
    } catch (error) {
      // Handle rate limiting error specifically
      if (error.message && error.message.includes("Too many")) {
        setSubmitCooldown(true);
        setRateLimitError(true);
        toast.error(
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Rate limit exceeded. Please wait 5 seconds before trying again.</span>
          </div>
        );
      } else if (error.message && error.message.includes("429")) {
        setSubmitCooldown(true);
        setRateLimitError(true);
        toast.error(
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Server busy. Please wait 5 seconds before trying again.</span>
          </div>
        );
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  // Slideshow images for login
  const slideshowImages = [
    {
      src: loginHero,
      alt: "Secure AI-Powered Learning Platform Login"
    },
    {
      src: educationHero1,
      alt: "Interactive Learning Experience"
    },
    {
      src: educationHero2,
      alt: "AI-Powered Learning Analytics"
    },
    {
      src: collaborationHero,
      alt: "Collaborative Learning Experience"
    }
  ];

  // Removed auto-slide effect since we're using a single hero image

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Signing you in...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we authenticate your account</p>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left Side - Form Only */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 animate-slide-in-left">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <h3 className="font-medium text-4xl overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                Welcome back
              </h3>
            </div>

            <p className="text-gray-800 text-center mb-8">
              Please sign in to continue your learning journey.
            </p>

            {/* Rate limit warning */}
            {rateLimitError && (
              <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <p className="font-medium">Rate Limit Exceeded</p>
                </div>
                <p className="text-sm mt-1">Please wait 5 seconds before trying again.</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="text-blue-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || submitCooldown}
                className="mt-5 w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : submitCooldown ? (
                  "Please wait..."
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="block md:hidden text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-500 hover:underline font-medium">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image Carousel with text below */}
        <div className="hidden w-full md:w-1/2 bg-gradient-to-r from-blue-900/90 to-green-900/90 text-white md:flex flex-col items-center justify-center p-8 rounded-tl-[80px] rounded-bl-[80px] animate-slide-in-right">
          {/* Image Slideshow - Centered */}
          <div className="flex items-center justify-center p-4 flex-grow w-full">
            <div className="w-full max-w-lg h-96 lg:h-[450px] xl:h-[500px]">
              <ImageSlideshow
                images={slideshowImages}
                autoSlide={true}
                interval={6000}
                className="w-full h-full"
                imageClassName="object-contain"
              />
            </div>
          </div>

          {/* Text Overlay - Positioned below the image */}
          <div className="w-full text-center mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 animate-fadeIn">Welcome to EduPulse</h2>
            <p className="text-sm md:text-base lg:text-lg opacity-90 animate-fadeIn delay-150">Transform your learning experience with our AI-powered platform</p>
          </div>

          {/* Sign Up Link */}
          <div className="w-full text-center pb-4">
            <p className="text-white/80 mb-4">
              Don't have an account?
            </p>
            <Link
              to="/signup"
              className="px-8 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Image Carousel - Improved design with larger size */}
      <div className="md:hidden w-full bg-gradient-to-r from-blue-900/90 to-green-900/90 rounded-2xl overflow-hidden shadow-xl my-6">
        {/* Mobile Image Slideshow */}
        <div className="relative h-48 sm:h-56 md:h-64">
          <ImageSlideshow
            images={slideshowImages}
            autoSlide={true}
            interval={6000}
            className="w-full h-full"
            imageClassName="object-contain"
          />
          
          {/* Mobile Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg pointer-events-none"></div>
        </div>

        {/* Mobile Content - Better organized */}
        <div className="p-4 bg-black/80 backdrop-blur-sm">

          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-white mb-1">Welcome to EduPulse</h2>
            <p className="text-sm text-gray-300">Transform your learning experience</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;