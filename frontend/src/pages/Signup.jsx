import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Eye, EyeOff } from 'lucide-react';
import { register } from "../redux/authSlice";
import ImageSlideshow from "../components/ImageSlideshow";
import signupHero from "../assets/signup-hero.svg";
import educationHero1 from "../assets/education-hero-1.svg";
import educationHero2 from "../assets/education-hero-2.svg";
import collaborationHero from "../assets/collaboration-hero.svg";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("student"); // Add role state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, error, isAuthenticated, user } = useSelector(state => state.auth);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect to homepage after successful authentication
            navigate("/home");
        }
    }, [isAuthenticated, user, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (password.length > 16) {
            newErrors.password = "Password must be at most 16 characters";
        } else if (!/(?=.*[A-Z])/.test(password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*\d)/.test(password)) {
            newErrors.password = "Password must contain at least one number";
        } else if (!/(?=.*[@$!%*?&])/.test(password)) {
            newErrors.password = "Password must contain at least one special character (@$!%*?&)";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            Object.values(formErrors).forEach(error => toast.error(error));
            return;
        }

        try {
            const result = await dispatch(register({
                name,
                email,
                password,
                role // Use selected role
            }));

            // Since register is a regular thunk, check the result directly
            if (result && result.success) {
                toast.success("✅ Registration successful! Please check your email for the verification code.");
                // Redirect to OTP verification page
                navigate(`/verify-otp/${encodeURIComponent(email)}`);
            }
        } catch (error) {
            // This will catch any unhandled errors
            const errorMessage = error.message || "Signup failed. Please try again.";
            toast.error(errorMessage);
        }
    };

    // Show error messages from Redux store
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Slideshow images for signup
    const slideshowImages = [
        {
            src: signupHero,
            alt: "Start Your AI-Powered Learning Journey"
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
                        <p className="text-lg font-semibold">Creating your account...</p>
                        <p className="text-sm text-gray-600 mt-2">Please wait while we set up your account</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col justify-center md:flex-row h-screen">
                {/* Left Side - Image Carousel with text below */}
                <div className="hidden w-full md:w-1/2 bg-gradient-to-r from-blue-900/90 to-green-900/90 text-white md:flex flex-col items-center justify-center p-8 rounded-tr-[80px] rounded-br-[80px] animate-slide-in-left">
                    {/* Image Slideshow - Centered */}
                    <div className="flex items-center justify-center p-4 flex-grow w-full">
                        <div className="w-full max-w-lg h-96 lg:h-[450px] xl:h-[500px]">
                            <ImageSlideshow
                                images={slideshowImages}
                                autoSlide={true}
                                interval={7000}
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

                    {/* Sign In Link */}
                    <div className="w-full text-center pb-4">
                        <p className="text-white/80 mb-4">
                            Already have an account?
                        </p>
                        <Link
                            to="/login"
                            className="px-8 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
                        >
                            SIGN IN
                        </Link>
                    </div>
                </div>

                {/* Right Side - Form Only */}
                <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 animate-slide-in-right">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-center mb-8">
                            <h3 className="font-medium text-3xl lg:text-4xl text-center overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                                Create your account
                            </h3>
                        </div>

                        <p className="text-gray-800 text-center mb-8">
                            Please provide your information to sign up.
                        </p>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    placeholder="Email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex md:w-[50%] w-[70%] items-center justify-between mx-auto">
                                    <span
                                        className={`px-[10px] py-[5px] border-[2px] border-[#e7e6e6] rounded-xl cursor-pointer hover:border-black ${role === "student" ? "border-black" : ""
                                            }`}
                                        onClick={() => setRole("student")}
                                    >
                                        Student
                                    </span>
                                    <span
                                        className={`px-[10px] py-[5px] border-[2px] border-[#e7e6e6] rounded-xl cursor-pointer hover:border-black ${role === "educator" ? "border-black" : ""
                                            }`}
                                        onClick={() => setRole("educator")}
                                    >
                                        Educator
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 relative">
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

                            <div className="space-y-2 relative">
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                        }}
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
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
                                        Creating Account...
                                    </>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>

                            <div className="block md:hidden text-center mt-4">
                                <p className="text-gray-600 text-sm">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-blue-500 hover:underline font-medium">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Image Carousel - Improved design with larger size */}
            <div className="md:hidden w-full bg-gradient-to-r from-black to-gray-900 rounded-2xl overflow-hidden shadow-xl my-6">
                {/* Mobile Image Slideshow */}
                <div className="relative h-48 sm:h-56 md:h-64">
                    <ImageSlideshow
                        images={slideshowImages}
                        autoSlide={true}
                        interval={7000}
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

export default Signup;