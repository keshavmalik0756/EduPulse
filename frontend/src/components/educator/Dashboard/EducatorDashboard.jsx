import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  BarChart2,
  Plus,
  RefreshCw,
  Star,
  CheckCircle,
  Video,
  IndianRupee,
  BarChart3,
  Clock,
  Award,
  Zap,
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import apiClient from "../../../utils/apiClient";
import Header from "../UI Components/Header";
import courseService from "../../../services/courseService";
import productivityService from "../../../services/productivityService";
import leaderboardService from "../../../services/leaderboardService";
import EducatorProductivityTracker from "./EducatorProductivityTracker";
import CourseLeaderboard from "./CourseLeaderboard";

// Color palette for consistent styling
const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  gray: '#6B7280',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  orange: '#F97316',
  lime: '#84CC16'
};

// Gradient colors for charts
const GRADIENT_COLORS = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  tertiary: ['#4facfe', '#00f2fe'],
  quaternary: ['#43e97b', '#38f9d7']
};

const EducatorDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Advanced Analytics State
  const [productivityData, setProductivityData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  // Check if user is educator - redirect if not
  useEffect(() => {
    // Check if user has educator role
    const currentUser = user || authUser;
    
    // Only perform role check if we have user data
    if (currentUser) {
      // Handle different possible user data structures
      const userRole = currentUser.role || 
                      (currentUser.user && currentUser.user.role) ||
                      (currentUser.data && currentUser.data.role);
      
      // Check if user has educator role (case insensitive)
      if (userRole && userRole.toLowerCase() === 'educator') {
        // User is authorized, no action needed
      } else {
        // Check if this is a development environment where we might want to bypass this check
        const isDevEnvironment = window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1' || 
                                process.env.NODE_ENV === 'development';
        
        // Only redirect in production or if explicitly in unauthorized state
        if (!isDevEnvironment || window.location.pathname === '/unauthorized') {
          // User doesn't have educator role
          toast.error("Access denied. Educator role required.");
          navigate("/unauthorized");
          return;
        }
      }
    }
    // If no user data, let the dashboard load and let other components handle authentication
  }, [user, authUser, navigate]);

  const handleLogout = useCallback(() => {
    try {
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  }, [dispatch, navigate]);

  // Fetch advanced analytics data - parallel requests for better performance
  const fetchAdvancedAnalytics = useCallback(async (coursesData) => {
    setAnalyticsLoading(true);
    
    try {
      // Make all requests in parallel
      // Productivity data is fetched regardless of courses
      const promises = [
        productivityService.getCurrentWeekProductivity().catch(() => null),
        leaderboardService.getLeaderboard(10).catch(() => null)
      ];

      const [productivityResponse, leaderboardResponse] = await Promise.all(promises);

      // Update state with successful responses
      if (productivityResponse?.success) {
        setProductivityData(productivityResponse.data);
      }
      if (leaderboardResponse?.success) {
        setLeaderboardData(leaderboardResponse.data);
      }
    } catch (error) {
      // Error fetching advanced analytics
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Fetch user profile using apiClient
      const userResponse = await apiClient.get("/auth/me");
      setUser(userResponse.data.user);

      // Fetch courses and statistics in parallel
      const [coursesResponse, statsResponse] = await Promise.all([
        courseService.getCreatorCourses().catch(() => ({ success: false, courses: [] })),
        courseService.getCourseStatistics().catch(() => ({ success: false, stats: null }))
      ]);

      // Handle courses response
      if (coursesResponse.success) {
        setCourses(coursesResponse.courses || []);
      } else {
        setCourses([]);
      }

      // Always fetch advanced analytics (productivity data is independent of courses)
      fetchAdvancedAnalytics(coursesResponse.success ? coursesResponse.courses : []);

      // Handle statistics response
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        setStats(null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      // Silently handle errors without showing user-facing messages
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAdvancedAnalytics, navigate]);

  // Helper function to format time ago
  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Recently';
    
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  }, []);

  // Refresh data handler with analytics
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    
    // Force refresh all analytics data
    if (courses && courses.length > 0) {
      await fetchAdvancedAnalytics(courses);
    }
    
    setIsRefreshing(false);
    toast.success("Dashboard refreshed with latest analytics!");
  }, [fetchDashboardData, fetchAdvancedAnalytics, courses]);

  // Listen for course updates
  useEffect(() => {
    const handleCourseUpdate = async () => {
      // Refresh statistics when a course is updated
      try {
        const statsResponse = await courseService.getCourseStatistics();
        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }
        
        // Refresh courses and activities
        const coursesResponse = await courseService.getCreatorCourses();
        if (coursesResponse.success) {
          setCourses(coursesResponse.courses || []);
        }
      } catch (error) {
        // Error refreshing data
      }
    };

    // Add event listener for course updates
    window.addEventListener('courseUpdated', handleCourseUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('courseUpdated', handleCourseUpdate);
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate stats from courses data
  const calculatedStats = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        avgRating: 0,
        completionRate: 0,
        totalViews: 0
      };
    }

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const draftCourses = courses.filter(c => !c.isPublished).length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.totalEnrolled || 0), 0);
    const totalRevenue = courses.reduce((sum, course) => sum + (course.revenue || 0), 0);
    const avgRating = courses.length > 0 ?
      courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length : 0;
    const completionRate = courses.length > 0 ?
      courses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / courses.length : 0;
    const totalViews = courses.reduce((sum, course) => sum + (course.views || 0), 0);

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalRevenue,
      avgRating: Math.round(avgRating * 10) / 10,
      completionRate: Math.round(completionRate),
      totalViews
    };
  }, [courses]);

  // Enhanced display stats that combines API stats with calculated stats for completeness
  const displayStats = useMemo(() => {
    // Always use calculated stats as they are derived from real course data
    // Only fall back to API stats if courses data is not available
    return calculatedStats;
  }, [calculatedStats]);

  // Chart data for course performance
  const coursePerformanceData = useMemo(() => {
    if (!courses || courses.length === 0) {
      return [];
    }
    
    return courses.slice(0, 5).map(course => ({
      name: course.title?.substring(0, 15) + '...' || 'Untitled',
      enrollments: course.totalEnrolled || 0,
      rating: course.averageRating || 0
    }));
  }, [courses]);

  // Course status distribution
  const courseStatusData = useMemo(() => {
    const published = courses.filter(c => c.isPublished).length;
    const draft = courses.filter(c => !c.isPublished).length;
    const archived = courses.filter(c => c.enrollmentStatus === 'archived').length;
    
    return [
      { 
        name: 'Published', 
        value: published, 
        color: COLORS.green,
        icon: '📘',
        description: 'Live and available for students'
      },
      { 
        name: 'Draft', 
        value: draft, 
        color: COLORS.yellow,
        icon: '📝',
        description: 'In development'
      },
      { 
        name: 'Archived', 
        value: archived, 
        color: COLORS.red,
        icon: '📦',
        description: 'Inactive courses'
      }
    ].filter(item => item.value > 0);
  }, [courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="relative flex-1 p-3 sm:p-4 md:p-5 pt-16 sm:pt-20 md:pt-24 bg-gray-50 min-h-screen overflow-x-hidden">
        {/* Enhanced Header Section - Fully Responsive */}
        <motion.header
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-2xl p-4 md:p-5 lg:p-6 shadow-md mb-4 md:mb-5 lg:mb-6 border-l-4 border-blue-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-grow min-w-0"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Welcome back, {user?.name || authUser?.name}!
              <span className="text-blue-600 ml-2 text-base md:text-lg lg:text-xl font-medium block sm:inline mt-1 sm:mt-0">
                {user?.role === 'pro' ? '⭐ Pro Instructor' : 'Educator'}
              </span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base lg:text-lg">Manage your courses and track student progress</p>
            
            {/* Performance Summary - Fully Responsive */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-600 font-medium">
                  {courses.filter(c => c.isPublished).length} Published
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-600 font-medium">
                  {courses.reduce((sum, course) => sum + (course.totalEnrolled || 0), 0)} Students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-600 font-medium">
                  ₹{courses.reduce((sum, course) => sum + (course.revenue || 0), 0).toLocaleString()} Revenue
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/educator/notifications')}
              className="relative p-2.5 md:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-300 shadow-sm hover:shadow"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 text-sm md:text-base font-medium"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-3 py-2 md:px-4 md:py-2.5 rounded-lg whitespace-nowrap font-medium">
              Updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </motion.div>
        </motion.header>

        {/* Main Content Grid - Restructured for better organization and responsiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Main Analytics (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Course Performance Chart - Fully Responsive */}
            <motion.div
              className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border-l-4 border-blue-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-3">
                  <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  Course Performance
                </h3>
                <button 
                  onClick={() => navigate('/educator/analytics')}
                  className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                >
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="h-64 md:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke="#3B82F6" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `${value}`}
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      width={50}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#10B981" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      domain={[0, 5]}
                      tickFormatter={(value) => `${value}★`}
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        border: '2px solid #E5E7EB',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 600
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '14px', fontWeight: 600, paddingTop: '10px' }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="enrollments" 
                      fill={COLORS.blue} 
                      name="Enrollments" 
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                    <Line 
                      yAxisId="right" 
                      dataKey="rating" 
                      stroke={COLORS.green} 
                      name="Rating" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: COLORS.green, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, stroke: COLORS.green, strokeWidth: 2, fill: '#fff' }}
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Detailed Analytics Button - Made responsive */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button
                onClick={() => navigate('/educator/analytics')}
                className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow hover:shadow-md font-medium text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="truncate">View Analytics</span>
              </button>
            </motion.div>
            {/* Profile/Access Card - Fully Responsive */}
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 md:p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg md:text-xl truncate">{user?.name || authUser?.name}</h4>
                  <p className="text-sm md:text-base text-gray-300 truncate">{user?.email || authUser?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Fully Responsive */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl text-center hover:bg-gray-750 transition-colors">
                  <div className="text-xl md:text-2xl font-extrabold">{displayStats?.totalCourses ?? 0}</div>
                  <div className="text-xs md:text-sm text-gray-300 mt-1 font-medium">Courses</div>
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl text-center hover:bg-gray-750 transition-colors">
                  <div className="text-xl md:text-2xl font-extrabold">{displayStats?.totalStudents ?? 0}</div>
                  <div className="text-xs md:text-sm text-gray-300 mt-1 font-medium">Students</div>
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl text-center hover:bg-gray-750 transition-colors">
                  <div className="text-base md:text-lg font-extrabold">₹{(displayStats?.totalRevenue ?? 0).toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-300 mt-1 font-medium">Revenue</div>
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl text-center hover:bg-gray-750 transition-colors">
                  <div className="text-xl md:text-2xl font-extrabold">{displayStats?.avgRating ? (displayStats?.avgRating).toFixed(1) : 0}</div>
                  <div className="text-xs md:text-sm text-gray-300 mt-1 font-medium">Rating</div>
                </div>
              </div>

              {/* Action Buttons - Fully Responsive */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/educator/profile')}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 md:py-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all hover:scale-105 text-sm md:text-base font-medium"
                >
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => navigate('/educator/settings')}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 md:py-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all hover:scale-105 text-sm md:text-base font-medium"
                >
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 md:py-4 bg-red-600 hover:bg-red-700 rounded-xl transition-all hover:scale-105 text-sm md:text-base font-medium"
                >
                  <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Supporting Widgets (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
          
          {/* Course Distribution - Fully Responsive */}
          <motion.div
            className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                Course Distribution
              </h3>
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-sm md:text-base text-indigo-700 font-semibold">Live</span>
              </div>
            </div>

            {courseStatusData.length > 0 ? (
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        {courseStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="white"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Courses']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '0.75rem', 
                          border: '2px solid #E5E7EB',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: 600
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
                      {courses.length}
                    </span>
                    <span className="text-sm md:text-base text-gray-500 font-semibold mt-1">Total</span>
                  </div>
                </div>
                
                <div className="w-full space-y-3 md:space-y-4">
                  {courseStatusData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      className="flex items-center justify-between p-4 md:p-5 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-md"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                        <div 
                          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0 shadow-md"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-base md:text-lg">{item.name}</div>
                          <div className="text-sm md:text-base text-gray-500 mt-1 font-medium">{item.description}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="font-extrabold text-gray-900 text-xl md:text-2xl">{item.value}</div>
                        <div className="text-sm md:text-base text-gray-500 font-semibold mt-1">
                          {courses.length > 0 
                            ? `${Math.round((item.value / courses.length) * 100)}%` 
                            : '0%'
                          }
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 md:py-12 lg:py-16">
                <div className="text-5xl md:text-6xl mb-5">📚</div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">No courses yet</h4>
                <p className="text-sm md:text-base text-gray-500 mb-6 px-4 max-w-md mx-auto">Create your first course to get started and begin tracking your analytics</p>
                <button
                  onClick={() => navigate('/educator/create-course')}
                  className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl text-base md:text-lg font-semibold"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Create Course</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Educator Productivity Tracker - Improved responsive design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="min-h-[280px]"
          >
            <EducatorProductivityTracker />
          </motion.div>

          {/* Course Leaderboard - Improved responsive design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="min-h-[280px]"
          >
            <CourseLeaderboard />
          </motion.div>

        </div>
      </div>
    </main>
    </div>
  );
};

export default EducatorDashboard;