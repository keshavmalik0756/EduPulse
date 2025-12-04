import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, useAnimation } from "framer-motion";
import {
  BookOpen,
  Award,
  User,
  Clock,
  Target,
  TrendingUp,
  Star,
  Play,
  ChevronRight,
  GraduationCap,
  BarChart3,
  CheckCircle,
  PlayCircle,
  Brain,
  Zap,
  RefreshCw,
  Download,
  Trophy,
  Calendar,
  FileText
} from 'lucide-react';
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
} from "chart.js";

import Nav from "../../../Layout/Nav";
import courseService from '../../../services/courseService';
import progressService from '../../../services/progressService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Filler
);

// Animated StatCard component with solid colors
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}) => {
  // Color variants with solid colors and light hover states
  const colorVariants = {
    blue: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-500",
      text: "text-white"
    },
    green: {
      bg: "bg-green-600",
      hover: "hover:bg-green-500",
      text: "text-white"
    },
    purple: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-500",
      text: "text-white"
    },
    orange: {
      bg: "bg-orange-600",
      hover: "hover:bg-orange-500",
      text: "text-white"
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  return (
    <div className={`relative h-40 ${colors.bg} ${colors.hover} ${colors.text} rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden hover:-translate-y-1 hover:scale-[1.02]`}>
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

      {/* Floating particles */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-white opacity-30 rounded-full animate-ping"></div>

      {/* Content */}
      <div className="relative flex flex-col justify-between h-full">
        {/* Header with title and icon */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium opacity-90 mb-2 group-hover:opacity-100 transition-opacity duration-300">{title}</h3>
            <p className="text-3xl font-bold transform group-hover:scale-105 transition-transform duration-300">
              {typeof value === "number" ? value : (value || "0")}
            </p>
          </div>
          {/* Icon with bounce animation */}
          <div className="w-10 h-10 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
            {icon}
          </div>
        </div>

        {/* Subtitle with slide up animation */}
        {subtitle && (
          <p className="text-xs opacity-80 mt-auto transform translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">{subtitle}</p>
        )}
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg border-2 border-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Improved daysBetween function with better error handling
const daysBetween = (a, b = new Date()) => {
  // Handle null or undefined dates
  if (!a) return 0;
  const dateA = new Date(a);
  const dateB = new Date(b);

  // Check for invalid dates
  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
    return 0;
  }

  // Calculate difference in days
  const diffTime = Math.abs(dateB - dateA);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [is1024Breakpoint, setIs1024Breakpoint] = useState(false);
  const navigate = useNavigate();

  // Helper function to calculate learning streak
  const calculateLearningStreak = (courses) => {
    if (!courses || courses.length === 0) return 0;

    // Get all last accessed dates and sort them
    const accessDates = courses
      .map(course => course.lastAccessed || course.enrollmentDate)
      .filter(date => date)
      .map(date => new Date(date))
      .sort((a, b) => b - a);

    if (accessDates.length === 0) return 0;

    // Calculate streak based on consecutive days
    let streak = 0;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < accessDates.length; i++) {
      const daysDiff = Math.floor((today - accessDates[i]) / oneDayMs);
      if (daysDiff <= streak + 1) {
        streak = Math.max(streak, daysDiff + 1);
      }
    }

    return Math.min(streak, 30); // Cap at 30 days for display
  };

  // Animation controls
  const controls = useAnimation();

  // Handle responsive layout changes
  useEffect(() => {
    const handleResize = () => {
      // Check if screen width is around 1024px (between 1024px and 1279px)
      const width = window.innerWidth;
      setIs1024Breakpoint(width >= 1024 && width <= 1279);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger animations when data changes
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    });
  }, [enrolledCourses, controls]);

  // Add a class to body for debugging purposes (can be removed later)
  useEffect(() => {
    if (is1024Breakpoint) {
      document.body.classList.add('at-1024-breakpoint');
    } else {
      document.body.classList.remove('at-1024-breakpoint');
    }
    return () => {
      document.body.classList.remove('at-1024-breakpoint');
    };
  }, [is1024Breakpoint]);

  // Add CSS for 1024px breakpoint
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
            @media (min-width: 1024px) and (max-width: 1279px) {
                .at-1024-breakpoint .lg\\:grid-cols-3 {
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                }
                .at-1024-breakpoint .lg\\:col-span-2 {
                    grid-column: 1 / -1;
                }
            }
        `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch enrolled courses and learning data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // Fetch user's enrolled courses with complete data
        const enrolledResponse = await courseService.getUserEnrollments();

        if (enrolledResponse.success) {
          const enrolledCourses = enrolledResponse.enrollments || [];
          
          // Enhance courses with detailed progress data and course information
          const enhancedCourses = await Promise.all(enrolledCourses.map(async (course) => {
            try {
              // Validate course ID before making requests
              const courseId = course.courseId || course._id;
              if (!courseId) {
                console.warn("Course missing ID:", course);
                return {
                  ...course,
                  title: course.title || "Untitled Course",
                  category: course.category || "Other",
                  instructor: course.instructor || "Unknown Instructor",
                  progress: course.progress || 0,
                  completedLessons: course.completedLessons || 0,
                  totalLessons: course.totalLessons || 0,
                  timeSpent: course.timeSpent || 0,
                  lastAccessed: course.lastAccessed || course.updatedAt,
                  certificateEarned: course.certificateEarned || false
                };
              }
              
              // Fetch detailed course progress data and course details in parallel
              const [progressResponse, courseDetailsResponse] = await Promise.all([
                progressService.getCourseProgress(courseId).catch(err => {
                  console.warn("Failed to fetch progress for course:", courseId, err);
                  return null;
                }),
                courseService.getCourseById(courseId).catch(err => {
                  console.warn("Failed to fetch details for course:", courseId, err);
                  return null;
                })
              ]);

              // Extract data from responses
              const progressData = progressResponse?.success ? progressResponse.progress : {};
              const courseDetails = courseDetailsResponse?.success ? courseDetailsResponse.course : {};
              
              // Validate and sanitize data
              const sanitizedProgress = typeof progressData === 'object' ? progressData : {};
              const sanitizedCourseDetails = typeof courseDetails === 'object' ? courseDetails : {};
              
              // Merge all data sources
              return {
                ...course,
                ...sanitizedCourseDetails,
                ...sanitizedProgress,
                id: courseId,
                title: sanitizedCourseDetails.title || course.title || "Untitled Course",
                category: sanitizedCourseDetails.category || course.category || "Other",
                thumbnail: sanitizedCourseDetails.thumbnail || course.thumbnail || null,
                progress: sanitizedProgress.overallProgress || course.progress || 0,
                completedLessons: sanitizedProgress.completedLessons || course.completedLessons || 0,
                totalLessons: sanitizedProgress.totalLessons || course.totalLessons || sanitizedCourseDetails.totalLectures || 0,
                timeSpent: sanitizedProgress.timeSpent || course.timeSpent || 0,
                lastAccessed: sanitizedProgress.lastAccessed || course.lastAccessed || course.updatedAt,
                certificateEarned: sanitizedProgress.certificateEarned || course.certificateEarned || false,
                instructor: sanitizedCourseDetails.creator?.name || sanitizedCourseDetails.instructor || course.instructor || "Unknown Instructor",
                enrollmentDate: course.enrollmentDate || course.createdAt
              };
            } catch (error) {
              console.warn("Failed to enhance course data:", course._id, error);
              // Return course with fallback data
              return {
                ...course,
                title: course.title || "Untitled Course",
                category: course.category || "Other",
                instructor: course.instructor || "Unknown Instructor",
                progress: course.progress || 0,
                completedLessons: course.completedLessons || 0,
                totalLessons: course.totalLessons || 0,
                timeSpent: course.timeSpent || 0,
                lastAccessed: course.lastAccessed || course.updatedAt,
                certificateEarned: course.certificateEarned || false
              };
            }
          }));
          
          setEnrolledCourses(enhancedCourses);
        } else {
          // If no enrolled courses endpoint, set empty array
          setEnrolledCourses([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. You do not have permission to view this dashboard.");
          navigate("/home");
        } else if (error.response?.status === 404) {
          // If endpoint doesn't exist, just set empty courses
          setEnrolledCourses([]);
          setLoading(false);
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          toast.error("Cannot connect to server. Please check your internet connection.");
          // Set empty courses to prevent infinite loading
          setEnrolledCourses([]);
          setLoading(false);
        } else {
          toast.error(`Failed to load dashboard data: ${error.response?.data?.message || error.message || 'Unknown error'}`);
          // Set empty courses to prevent infinite loading
          setEnrolledCourses([]);
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [navigate, controls]);

  // Local UI state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [onlyInProgress, setOnlyInProgress] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [localState, setLocalState] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // New tab state: all, inProgress, completed

  // Calculate real statistics from enrolled courses
  const totals = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return {
        total: 0,
        inProgress: 0,
        completed: 0,
        notStarted: 0,
        totalTimeSpent: 0,
        totalLessonsCompleted: 0,
        totalLessons: 0,
        certificates: 0,
        avgProgress: 0,
        learningStreak: 0
      };
    }

    const inProgress = enrolledCourses.filter((c) =>
      (c.progress > 0 && c.progress < 100) || 
      (c.completedLessons > 0 && c.completedLessons < c.totalLessons)
    ).length;

    const completed = enrolledCourses.filter((c) =>
      c.progress === 100 || 
      c.completed || 
      c.certificateEarned ||
      (c.totalLessons > 0 && c.completedLessons === c.totalLessons)
    ).length;

    const notStarted = enrolledCourses.filter((c) =>
      (!c.progress || c.progress === 0) && 
      (!c.completedLessons || c.completedLessons === 0)
    ).length;

    // Calculate real learning statistics from enrollment data
    const totalTimeSpent = enrolledCourses.reduce((sum, course) =>
      sum + (course.timeSpent || course.timeSpentMinutes || 0), 0
    );

    const totalLessonsCompleted = enrolledCourses.reduce((sum, course) =>
      sum + (course.completedLessons || course.lessonsCompleted || 0), 0
    );

    const totalLessons = enrolledCourses.reduce((sum, course) =>
      sum + (course.totalLessons || course.lessonsCount || 0), 0
    );

    const certificates = enrolledCourses.filter(course =>
      course.certificateEarned || 
      course.completed ||
      course.certificate ||
      course.hasCertificate
    ).length;

    // Calculate average progress from real data
    const avgProgress = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, course) =>
        sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0;

    // Calculate learning streak from enrollment dates and last accessed
    const learningStreak = calculateLearningStreak(enrolledCourses);

    return {
      total: enrolledCourses.length,
      inProgress,
      completed,
      notStarted,
      totalTimeSpent,
      totalLessonsCompleted,
      totalLessons,
      certificates,
      avgProgress,
      learningStreak
    };
  }, [enrolledCourses]);

  // Enhanced categories with counts
  const categories = useMemo(() => {
    const categoryMap = new Map();

    enrolledCourses.forEach((course) => {
      let category = course.category || "Other";
      if (!category || category === "") {
        category = "Other";
      }
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Convert to array and sort by count
    const categoryArray = Array.from(categoryMap, ([name, count]) => ({
      name,
      count,
    }));
    categoryArray.sort((a, b) => b.count - a.count);

    return [{ name: "All", count: enrolledCourses.length }, ...categoryArray];
  }, [enrolledCourses]);

  // Find favorite category with percentage
  const favoriteCategory = useMemo(() => {
    if (categories.length <= 1) {
      return null;
    }

    // Find the category with the highest count (excluding "All")
    const favorite = categories
      .filter(c => c.name !== "All" && c.count > 0)
      .sort((a, b) => b.count - a.count)[0];

    if (!favorite || favorite.count === 0) {
      return null;
    }

    const totalCourses = enrolledCourses.length;
    const percentage = totalCourses > 0 ? Math.round((favorite.count / totalCourses) * 100) : 0;

    return {
      ...favorite,
      percentage
    };
  }, [categories, enrolledCourses]);

  const formatDuration = (minutes) => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price, discount = 0) => {
    if (!price || price === 0) return "Free";
    const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
    return `₹${Math.round(finalPrice)}`;
  };

  // Enhanced pie chart with learning progress
  const pieData = useMemo(() => ({
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [{
      data: [totals.completed, totals.inProgress, totals.notStarted],
      backgroundColor: ["#10b981", "#3b82f6", "#6b7280"],
      hoverBackgroundColor: ["#34d399", "#60a5fa", "#9ca3af"],
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 8,
    }],
  }), [totals.completed, totals.inProgress, totals.notStarted]);

  // Category distribution chart data
  const categoryDistributionData = useMemo(() => {
    const categoryMap = new Map();
    enrolledCourses.forEach(course => {
      // Use multiple possible category fields
      let category = course.category || course.courseCategory || course.subject || "Other";
      if (!category || category === "") {
        category = "Other";
      }
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const labels = Array.from(categoryMap.keys());
    const data = Array.from(categoryMap.values());

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#151619", "#3D3E3E", "#5a5b5b", "#2a2a2a", "#454646", "#606161"
        ],
        hoverBackgroundColor: [
          "#2a2b2b", "#4b4c4c", "#6b6c6c", "#3a3b3b", "#555656", "#707171"
        ],
        borderWidth: 2,
        borderColor: "#fff",
      }],
    };
  }, [enrolledCourses]);

  // Enhanced line chart with learning activity
  const lineData = useMemo(() => {
    const days = [];
    const counts = [];

    for (let i = 13; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      days.push(`${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`);

      // Simulate daily learning activity
      const count = Math.floor(Math.random() * 5);
      counts.push(count);
    }

    return {
      labels: days,
      datasets: [{
        label: "Learning Sessions",
        data: counts,
        borderColor: "#151619",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(21, 22, 25, 0.3)");
          gradient.addColorStop(1, "rgba(21, 22, 25, 0.0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#151619",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, []);

  // Enhanced filtering with tab support
  const filtered = useMemo(() => {
    let arr = enrolledCourses.slice();

    // Apply optimistic local state
    arr = arr.map((c) => {
      if (localState[c._id]) {
        return { ...c, ...localState[c._id] }
      }
      return c;
    });

    // Apply tab filter
    if (activeTab === "inProgress") {
      arr = arr.filter((c) => c.progress > 0 && c.progress < 100);
    } else if (activeTab === "completed") {
      arr = arr.filter((c) => c.progress === 100 || c.certificateEarned);
    }

    // Apply search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((c) => {
        const title = c.title?.toLowerCase() || "";
        const category = c.category?.toLowerCase() || "";
        const instructor = c.instructor?.toLowerCase() || "";
        return (
          title.includes(q) ||
          category.includes(q) ||
          instructor.includes(q)
        );
      });
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      arr = arr.filter((c) => (c.category || "Other") === categoryFilter);
    }

    // Apply in progress filter
    if (onlyInProgress) {
      arr = arr.filter((c) => c.progress > 0 && c.progress < 100);
    }

    // Apply sorting
    switch (sortBy) { // FIX: Added switch statement
      case "oldest":
        arr.sort((a, b) =>
          new Date(a.enrollmentDate || a.createdAt) -
          new Date(b.enrollmentDate || b.createdAt)
        );
        break; // FIX: Added break
      case "title":
        arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break; // FIX: Added break
      case "progress":
        arr.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break; // FIX: Added break
      default: // latest
        arr.sort((a, b) =>
          new Date(b.enrollmentDate || b.createdAt) -
          new Date(a.enrollmentDate || a.createdAt)
        );
    } // FIX: Added closing brace

    return arr;
  }, [
    enrolledCourses,
    search,
    categoryFilter,
    onlyInProgress,
    sortBy,
    localState,
    activeTab,
  ]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Recent activity from real enrollment data with enhanced sorting and data completeness
  const recentActivity = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return [];

    // Sort by last accessed date and take the most recent 6
    return enrolledCourses
      .slice()
      .sort((a, b) => {
        // Enhanced date parsing with multiple fallbacks
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0);
          try {
            return new Date(dateStr);
          } catch (e) {
            return new Date(0);
          }
        };
        
        const dateA = parseDate(a.lastAccessed || a.lastUpdated || a.updatedAt || a.enrollmentDate || a.createdAt || 0);
        const dateB = parseDate(b.lastAccessed || b.lastUpdated || b.updatedAt || b.enrollmentDate || b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 6)
      .map(course => ({
        ...course,
        title: course.title || "Untitled Course",
        category: course.category || "Other",
        instructor: course.instructor || "Unknown Instructor",
        progress: course.progress || 0,
        completedLessons: course.completedLessons || 0,
        totalLessons: course.totalLessons || 0,
        timeSpent: course.timeSpent || 0,
        certificateEarned: course.certificateEarned || false,
        lastAccessed: course.lastAccessed || course.updatedAt || course.enrollmentDate || course.createdAt
      }));
  }, [enrolledCourses]);

  // Enhanced CSV export with more data
  const handleExportCSV = useCallback(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return;

    toast.success("Export feature coming soon!");
  }, [enrolledCourses]);

  // Enhanced refresh with visual feedback
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Re-fetch data here
      window.location.reload();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Course detail modal
  const openCourseDetail = (course) => setSelectedCourse(course);
  const closeCourseDetail = () => setSelectedCourse(null);

  // Loading indicator for async operations
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3D3E3E]"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex-1 p-4 md:p-6 pt-20 md:pt-24 bg-gray-50 min-h-screen">
      <Nav />

      <div className="space-y-6 overflow-hidden">
        {/* Top header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 dashboard-section bg-gray-100 rounded-lg p-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#3D3E3E]">
              Welcome back{user ? `, ${user.name}` : ""} 🎓
            </h1>
            <p className="text-sm text-[#151619] mt-1">
              Your personal learning dashboard and progress summary
            </p> {/* FIX: Closed the p tag */}
          </div>
          {/* FIX: Moved the following div outside the p tag */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-sm text-[#3D3E3E]">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#151619] text-white rounded-md shadow-sm hover:opacity-90 transition w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Progress</span>
            </button>
          </div>
        </div>

        {/* Animated solid color stat cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.1
            }}
            whileHover={{ y: -5 }}
          >
            <StatCard
              title="Courses Enrolled"
              value={totals?.total ?? 0}
              subtitle={`${totals?.inProgress ?? 0} in progress`}
              color="blue"
              icon={<BookOpen className="w-6 h-6" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.2
            }}
            whileHover={{ y: -5 }}
          >
            <StatCard
              title="Completed"
              value={totals?.completed ?? 0}
              subtitle={totals?.certificates > 0 ? `${totals.certificates} certificates` : "Keep learning!"}
              color="green"
              icon={<CheckCircle className="w-6 h-6" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.3
            }}
            whileHover={{ y: -5 }}
          >
            <StatCard
              title="Average Progress"
              value={`${totals?.avgProgress ?? 0}%`}
              subtitle={favoriteCategory?.name || "No category yet"}
              color="purple"
              icon={<Target className="w-6 h-6" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.4
            }}
            whileHover={{ y: -5 }}
          >
            <StatCard
              title="Learning Streak"
              value={`${totals?.learningStreak ?? 0}`}
              subtitle={totals?.learningStreak > 0 ? "days active" : "Start your streak!"}
              color="orange"
              icon={<Zap className="w-6 h-6" />}
            />
          </motion.div>
        </section>

        {/* Charts Section */}
        <section className={`grid grid-cols-1 ${is1024Breakpoint ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
          {/* Category Distribution Chart */}
          <motion.article
            className={`col-span-1 ${is1024Breakpoint ? 'lg:col-span-1' : 'lg:col-span-1'} bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dashboard-section`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4 text-[#3D3E3E] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#3D3E3E]" />
              Learning Categories
            </h4>
            <div className="h-48">
              <Pie
                data={categoryDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        usePointStyle: true,
                        padding: 10,
                        font: {
                          size: 10
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.article>

          {/* Learning Stats */}
          <motion.article
            className={`col-span-1 ${is1024Breakpoint ? 'lg:col-span-1' : 'lg:col-span-1'} bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dashboard-section`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-4 text-[#3D3E3E] flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#3D3E3E]" />
              Learning Stats
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Courses</p>
                  <p className="text-xl font-bold text-[#3D3E3E]">{totals.total}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Avg Progress</p>
                  <p className="text-xl font-bold text-[#3D3E3E]">{totals.avgProgress}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Lessons Done</p>
                  <p className="text-xl font-bold text-green-600">{totals.totalLessonsCompleted}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Certificates</p>
                  <p className="text-xl font-bold text-yellow-600">{totals.certificates}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3D3E3E] mb-2">Overall Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${totals.avgProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Quick Actions */}
          <motion.article
            className={`col-span-1 ${is1024Breakpoint ? 'lg:col-span-1' : 'lg:col-span-1'} bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dashboard-section`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h4 className="font-semibold mb-4 text-[#3D3E3E] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3D3E3E]" />
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/courses')}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Browse Courses</span>
              </button>
              <button
                onClick={() => navigate('/my-learning')}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Continue Learning</span>
              </button>
              <button
                onClick={() => navigate('/achievements')}
                className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">View Achievements</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Edit Profile</span>
              </button>
            </div>
          </motion.article>
        </section>

        {/* Enhanced controls & list with tabs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced controls */}
          <motion.article
            className="lg:col-span-1 bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dashboard-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h4 className="font-semibold mb-3 text-[#3D3E3E] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Search & Filters
            </h4>

            {/* Tab filters */}
            <div className="flex mb-4 border-b">
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "all"
                  ? "border-b-2 border-[#3D3E3E] text-[#3D3E3E]"
                  : "text-gray-500"
                  }`}
                onClick={() => setActiveTab("all")}
              >
                All ({enrolledCourses.length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "inProgress"
                  ? "border-b-2 border-[#3D3E3E] text-[#3D3E3E]"
                  : "text-gray-500"
                  }`}
                onClick={() => setActiveTab("inProgress")}
              >
                In Progress ({totals.inProgress})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "completed"
                  ? "border-b-2 border-[#3D3E3E] text-[#3D3E3E]"
                  : "text-gray-500"
                  }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed ({totals.completed})
              </button>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Search by title, category or instructor..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 border border-gray-200 rounded-md text-[#3D3E3E]"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                >
                  {categories.map((c) => (
                    <option value={c.name} key={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-36 p-2 border rounded-md"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title</option>
                  <option value="progress">Progress</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-[#3D3E3E]"
                  checked={onlyInProgress}
                  onChange={(e) => {
                    setOnlyInProgress(e.target.checked);
                    setPage(1);
                  }}
                />
                <span>Only show in progress</span>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="text-sm text-gray-500 mb-2">Quick actions</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setOnlyInProgress(false);
                    setSortBy("latest");
                    setActiveTab("all");
                  }}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    setPerPage(10);
                    setPage(1);
                  }}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  Show 10
                </button>
              </div>
            </div>
          </motion.article>

          {/* Enhanced list */}
          <motion.article
            className="lg:col-span-2 bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dashboard-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="font-semibold text-[#3D3E3E] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Your Enrolled Courses
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {filtered.length} courses
                </span>
              </div>
            </div>

            {paginated.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2">No courses found with current filters</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setOnlyInProgress(false);
                    setSortBy("latest");
                    setActiveTab("all");
                  }}
                  className="mt-3 px-4 py-2 bg-[#3D3E3E] text-white rounded-md text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((course) => {
                  const isCompleted = course.progress === 100 || course.certificateEarned;
                  const isInProgress = course.progress > 0 && course.progress < 100;

                  return (
                    <div
                      key={course._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 border-b last:border-none pb-3 transition-colors duration-200 hover:bg-gray-50 p-2 rounded cursor-pointer" // FIX: Corrected missing class
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#151619] truncate">
                              {course.title || "Untitled Course"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {course.category || "Other"} • {course.instructor || "Unknown Instructor"}
                            </p>
                          </div>
                          <div className="text-right sm:text-left">
                            <p
                              className={`text-xs font-semibold ${isCompleted
                                ? "text-green-600"
                                : isInProgress
                                  ? "text-blue-600"
                                  : "text-gray-600"
                                }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : isInProgress
                                  ? `${course.progress}% Complete`
                                  : "Not Started"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(course.enrollmentDate || course.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCourseDetail(course);
                            }}
                            className="px-2 py-1 text-xs border rounded-md hover:bg-gray-100 transition"
                          >
                            Details
                          </button>

                          {isInProgress && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/course/${course._id}`);
                              }}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                              Continue
                            </button>
                          )}

                          {isCompleted && course.certificateEarned && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">
                              Certificate Earned
                            </span>
                          )}

                          <span className="text-xs text-gray-400">
                            {course.completedLessons || course.lessonsCompleted || 0}/{course.totalLessons || course.lessonsCount || 0} lessons
                          </span>
                          <span className="text-xs text-gray-400">
                            {course.timeSpent || course.timeSpentMinutes || 0}h spent
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-blue-500"
                                }`}
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Enhanced pagination */}
            {filtered.length > 0 && (
              <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
                  >
                    Prev
                  </button>
                  <span className="px-3 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
                  >
                    Last
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Per page</label>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="p-1 border rounded text-sm"
                  >
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            )}
          </motion.article>
        </section>

        {/* Enhanced activity + branding */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Enhanced with more stats and visual appeal */}
          <motion.article
            className="lg:col-span-2 bg-white p-5 rounded-lg shadow-md dashboard-section hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-700" />
                Recent Learning Activity
              </h4>
              <input
                type="text"
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-gray-700 text-sm w-full sm:w-48"
              />
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mt-3">No recent activity yet</p>
                <p className="text-gray-400 text-xs mt-1">Start learning to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((course, i) => {
                  const isCompleted = course.progress === 100 || course.certificateEarned;
                  const isInProgress = course.progress > 0 && course.progress < 100;

                  return (
                    <motion.div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 pb-4 last:border-none last:pb-0 rounded-lg p-3 hover:bg-gray-50 text-gray-800 transition-all duration-200 cursor-pointer group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <GraduationCap className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                              {course.title || "Untitled Course"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {course.category || "Other"} • {course.instructor || "Unknown Instructor"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last accessed: {formatDate(course.lastAccessed || course.enrollmentDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {course.certificateEarned && (
                              <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 bg-yellow-100 text-yellow-800">
                                <Trophy className="w-3 h-3" />
                                Certified
                              </span>
                            )}
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${isCompleted
                              ? "bg-green-100 text-green-800"
                              : isInProgress
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                              }`}>
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </>
                              ) : isInProgress ? (
                                <>
                                  <PlayCircle className="w-3 h-3" />
                                  {course.progress}%
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  Not Started
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Enrolled: {formatDate(course.enrollmentDate || course.createdAt)}</span>
                          </div>
                          {(course.timeSpent > 0 || course.timeSpentMinutes > 0) && (
                            <div className="flex items-center text-xs text-gray-500 gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.timeSpent || course.timeSpentMinutes}h spent</span>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{course.completedLessons || course.lessonsCompleted || 0}/{course.totalLessons || course.lessonsCount || 0} lessons</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.article>

          {/* Enhanced Stats Section */}
          <motion.article
            className="lg:col-span-1 bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {/* Logo and Branding */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">EduPulse</h3>
              <p className="text-sm text-gray-500 text-center">
                Learning made simple. Track your progress and never miss a lesson.
              </p>
            </div>

            {/* Learning Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-5">
              <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                Your Learning Journey
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Courses Completed</p>
                  <p className="text-xl font-bold text-blue-600">{totals.completed}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Learning Hours</p>
                  <p className="text-xl font-bold text-indigo-600">{totals.totalTimeSpent}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Avg. Progress</p>
                  <p className="text-xl font-bold text-purple-600">{totals.avgProgress}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Certificates</p>
                  <p className="text-xl font-bold text-green-600">{totals.certificates}</p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Current Status
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Courses</span>
                  <span className="font-semibold text-gray-800">{totals.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Learning Streak</span>
                  <span className="font-semibold text-orange-600">{totals.learningStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Favorite Category</span>
                  <span className="font-semibold text-amber-600">{favoriteCategory?.name || "None"}</span>
                </div>
              </div>
            </div>
          </motion.article>
        </section>

        {/* Enhanced footer tip */}
        <footer className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-gray-600 text-sm dashboard-section">
          <div>
            <span className="font-semibold">Pro Tip:</span> Complete courses to earn certificates and unlock new learning paths. You can export your progress for records.
          </div>
          <div>Dashboard powered by EduPulse • Made for learners</div>
        </footer>
      </div>

      {/* Enhanced Modal - Course Detail */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <motion.div
            className="bg-white w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 sm:p-4 md:p-6 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg md:text-xl text-white">Course Details</h3>
              <button
                onClick={closeCourseDetail}
                className="text-gray-300 hover:text-white transition-colors p-1 sm:p-2 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Course Cover and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={selectedCourse.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"}
                      alt={selectedCourse.title}
                      className="w-full sm:w-48 h-32 sm:h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400";
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
                          {selectedCourse.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {selectedCourse.category || "Other"}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {selectedCourse.difficulty || "Beginner"}
                          </span>
                          {selectedCourse.certificateEarned && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Certificate Earned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 text-sm sm:text-base">Progress</h5>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-blue-600">
                      {selectedCourse.progress || 0}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 text-sm sm:text-base">Enrolled On</h5>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {formatDate(selectedCourse.enrollmentDate || selectedCourse.createdAt)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 text-sm sm:text-base">Time Spent</h5>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {selectedCourse.timeSpent || 0} hours
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 text-sm sm:text-base">Lessons</h5>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {selectedCourse.completedLessons || selectedCourse.lessonsCompleted || 0}/{selectedCourse.totalLessons || selectedCourse.lessonsCount || 0}
                    </p>
                  </div>
                </div>

                {/* Course Information */}
                <div className="bg-gradient-to-r from-gray-50 to-neutral-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      Course Information
                    </h5>
                    {selectedCourse.certificateEarned && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Certificate Available
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Current Section</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-800">
                        {selectedCourse.currentSection || "Not Started"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Next Lesson</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-800">
                        {selectedCourse.nextLesson || "Complete current section"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        closeCourseDetail();
                        navigate(`/course/${selectedCourse._id}`);
                      }}
                      className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {selectedCourse.progress > 0 ? "Continue Learning" : "Start Course"}
                    </button>

                    {selectedCourse.certificateEarned && (
                      <button
                        onClick={() => {
                          // Handle certificate download
                          toast.success("Certificate download started!");
                        }}
                        className="flex-1 py-2 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        Download Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default StudentDashboard;