import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Edit, Trash2, Eye, Users, Calendar, TrendingUp,
  Grid, List, Search, Filter, BarChart3, Target, Clock,
  CheckCircle, AlertCircle, Star, Award, GraduationCap,
  ChevronDown, X, SlidersHorizontal, Download, Upload,
  RefreshCw, FileText, Video, BookA, CreditCard, UserCheck,
  MoreHorizontal, Play, Pause, Archive, Copy, Share2,
  ExternalLink, BookMarked, MessageSquare, BarChart,
  Zap, AwardIcon, Globe, Lock, Unlock, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Nav from '../../../Layout/Nav';
import noteService from '../../../services/noteService';
import courseService from '../../../services/courseService';

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'free', 'paid'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popularity', 'alphabetical'
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    paid: 0,
    students: 0,
    avgRating: 0,
    totalViews: 0,
    topPerforming: null,
    categories: 0,
    open: 0,
    closed: 0,
    archived: 0
  });
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all');

  // Fetch all published courses and calculate statistics
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        // Fetch published courses with enhanced error handling
        const response = await courseService.getPublishedCourses().catch(async (error) => {
          // Fallback to alternative endpoint if primary fails
          console.warn('Primary courses endpoint failed, trying alternative:', error);
          try {
            const fallbackResponse = await courseService.getAllCourses();
            return fallbackResponse;
          } catch (fallbackError) {
            console.error('Both course endpoints failed:', error, fallbackError);
            throw error;
          }
        });

        if (!isMounted) return;

        // Handle different response structures
        let coursesData = [];

        // Check if it's a successful response from courseService
        if (response.success && Array.isArray(response.courses)) {
          coursesData = response.courses;
        }
        // Check if response.data is an array (direct axios response)
        else if (Array.isArray(response.data)) {
          coursesData = response.data;
        }
        // Check if response itself is an array
        else if (Array.isArray(response)) {
          coursesData = response;
        }

        if (!isMounted) return;

        // Transform courses data to match frontend expectations with enhanced data mapping
        const transformedCourses = await Promise.all(coursesData.map(async (course, index) => {
          // Ensure we have a valid course object
          if (!course || typeof course !== 'object') {
            console.warn('Invalid course object:', course);
            return null;
          }

          // Enhanced data mapping with more fallbacks and better normalization
          const courseId = course._id || course.id || `course_${index}`;
          
          // Validate and sanitize data
          const sanitizedCourse = typeof course === 'object' ? course : {};
          
          // Fetch notes count for this course
          let notesCount = 0;
          try {
            const notesResponse = await noteService.getNotesByCourse(courseId);
            if (notesResponse.success) {
              notesCount = notesResponse.count || notesResponse.notes?.length || 0;
            }
          } catch (error) {
            console.warn(`Failed to fetch notes for course ${courseId}:`, error);
          }
          
          // Fetch lecture statistics for accurate lesson count
          let lecturesCount = 0;
          let sectionsCount = 0;
          let quizzesCount = 0;
          try {
            // Fetch detailed course information to get accurate counts
            const courseDetailsResponse = await courseService.getCourseById(courseId);
            if (courseDetailsResponse.success && courseDetailsResponse.course) {
              const detailedCourse = courseDetailsResponse.course;
              
              // Get sections and lectures from detailed course data
              if (detailedCourse.sections && Array.isArray(detailedCourse.sections)) {
                sectionsCount = detailedCourse.sections.length;
                // Count total lectures across all sections
                lecturesCount = detailedCourse.sections.reduce((total, section) => {
                  return total + (section.lessons ? section.lessons.length : 0);
                }, 0);
              }
              
              // For quizzes, we'll use a reasonable estimate or fetch from backend if available
              // In a real implementation, you might have a separate quizzes endpoint
              quizzesCount = Math.max(0, Math.floor(lecturesCount / 4)); // Estimate: 1 quiz per 4 lectures
            } else {
              // Fallback to original method if detailed course fetch fails
              lecturesCount = parseInt(sanitizedCourse.totalLectures) || parseInt(sanitizedCourse.lecturesCount) || parseInt(sanitizedCourse.videoCount) || parseInt(sanitizedCourse.courseLessons) || parseInt(sanitizedCourse.lessons) || 0;
              sectionsCount = parseInt(sanitizedCourse.totalSections) || parseInt(sanitizedCourse.sections?.length) || parseInt(sanitizedCourse.courseModules) || 0;
              quizzesCount = parseInt(sanitizedCourse.quizzes) || parseInt(sanitizedCourse.quizCount) || parseInt(sanitizedCourse.courseQuizzes) || 0;
            }
          } catch (error) {
            console.warn(`Failed to fetch detailed course data for ${courseId}:`, error);
            // Fallback to original method if any error occurs
            lecturesCount = parseInt(sanitizedCourse.totalLectures) || parseInt(sanitizedCourse.lecturesCount) || parseInt(sanitizedCourse.videoCount) || parseInt(sanitizedCourse.courseLessons) || parseInt(sanitizedCourse.lessons) || 0;
            sectionsCount = parseInt(sanitizedCourse.totalSections) || parseInt(sanitizedCourse.sections?.length) || parseInt(sanitizedCourse.courseModules) || 0;
            quizzesCount = parseInt(sanitizedCourse.quizzes) || parseInt(sanitizedCourse.quizCount) || parseInt(sanitizedCourse.courseQuizzes) || 0;
          }
          
          return {
            id: courseId,
            title: sanitizedCourse.title || sanitizedCourse.name || sanitizedCourse.courseTitle || 'Untitled Course',
            description: sanitizedCourse.description || sanitizedCourse.shortDescription || sanitizedCourse.summary || sanitizedCourse.subTitle || sanitizedCourse.courseDescription || '',
            students: parseInt(sanitizedCourse.totalEnrolled) || parseInt(sanitizedCourse.enrollmentCount) || parseInt(sanitizedCourse.students) || parseInt(sanitizedCourse.enrolledStudents) || 0,
            status: sanitizedCourse.status || sanitizedCourse.courseStatus || 'published',
            lastUpdated: formatDate(sanitizedCourse.updatedAt || sanitizedCourse.lastUpdated || sanitizedCourse.updated || sanitizedCourse.lastModified || new Date().toISOString()),
            thumbnail: sanitizedCourse.thumbnail || sanitizedCourse.image || sanitizedCourse.thumbnailUrl || sanitizedCourse.courseImage || null,
            price: parseFloat(sanitizedCourse.finalPrice) || parseFloat(sanitizedCourse.price) || parseFloat(sanitizedCourse.cost) || parseFloat(sanitizedCourse.coursePrice) || 0,
            originalPrice: parseFloat(sanitizedCourse.originalPrice) || parseFloat(sanitizedCourse.price) || parseFloat(sanitizedCourse.cost) || parseFloat(sanitizedCourse.coursePrice) || 0,
            discount: parseFloat(sanitizedCourse.discount) || parseFloat(sanitizedCourse.discountPercentage) || parseFloat(sanitizedCourse.courseDiscount) || 0,
            hasDiscount: (sanitizedCourse.hasDiscount !== undefined) ? sanitizedCourse.hasDiscount :
              (parseFloat(sanitizedCourse.discount) > 0 || parseFloat(sanitizedCourse.discountPercentage) > 0 || parseFloat(sanitizedCourse.courseDiscount) > 0 ||
                ((parseFloat(sanitizedCourse.originalPrice) > 0 && parseFloat(sanitizedCourse.finalPrice) > 0) ? (parseFloat(sanitizedCourse.originalPrice) > parseFloat(sanitizedCourse.finalPrice)) : false)) || false,
            rating: parseFloat(sanitizedCourse.averageRating) || parseFloat(sanitizedCourse.rating) || parseFloat(sanitizedCourse.avgRating) || parseFloat(sanitizedCourse.courseRating) || 0,
            category: sanitizedCourse.category || sanitizedCourse.courseCategory || sanitizedCourse.subject || 'Uncategorized',
            duration: sanitizedCourse.duration || sanitizedCourse.durationWithUnit || sanitizedCourse.durationFormatted || sanitizedCourse.totalDuration || sanitizedCourse.courseDuration || 'N/A',
            level: sanitizedCourse.level || sanitizedCourse.difficulty || sanitizedCourse.courseLevel || sanitizedCourse.skillLevel || 'beginner',
            views: parseInt(sanitizedCourse.views) || parseInt(sanitizedCourse.viewCount) || parseInt(sanitizedCourse.courseViews) || 0,
            completionRate: parseFloat(sanitizedCourse.completionRate) || parseFloat(sanitizedCourse.completionPercentage) || parseFloat(sanitizedCourse.courseCompletionRate) || 0,
            revenue: parseFloat(sanitizedCourse.revenue) || parseFloat(sanitizedCourse.totalRevenue) || parseFloat(sanitizedCourse.courseRevenue) || 0,
            modules: sectionsCount, // Use accurate sections count
            lessons: lecturesCount, // Use accurate lectures count
            quizzes: quizzesCount, // Use accurate or estimated quizzes count,
            assignments: parseInt(sanitizedCourse.assignments) || parseInt(sanitizedCourse.assignmentCount) || parseInt(sanitizedCourse.courseAssignments) || 0,
            certificate: sanitizedCourse.hasCertificate || sanitizedCourse.certificate || sanitizedCourse.courseCertificate || false,
            publishedDate: formatDate(sanitizedCourse.publishedDate || sanitizedCourse.publishedAt || sanitizedCourse.datePublished || null),
            instructor: (sanitizedCourse.creator?.name || sanitizedCourse.creator?.email || sanitizedCourse.instructor || sanitizedCourse.author || sanitizedCourse.teacher || sanitizedCourse.courseInstructor || 'Unknown Instructor'),
            language: sanitizedCourse.language || sanitizedCourse.lang || sanitizedCourse.courseLanguage || 'English',
            hasCertificate: sanitizedCourse.hasCertificate || sanitizedCourse.certificate || sanitizedCourse.courseCertificate || false,
            isFeatured: sanitizedCourse.isFeatured || sanitizedCourse.featured || sanitizedCourse.courseFeatured || false,
            enrollmentStatus: sanitizedCourse.enrollmentStatus || sanitizedCourse.status || sanitizedCourse.courseEnrollmentStatus || 'open',
            prerequisites: Array.isArray(sanitizedCourse.prerequisites) ? sanitizedCourse.prerequisites : (Array.isArray(sanitizedCourse.coursePrerequisites) ? sanitizedCourse.coursePrerequisites : []),
            tags: Array.isArray(sanitizedCourse.tags) ? sanitizedCourse.tags : (Array.isArray(sanitizedCourse.courseTags) ? sanitizedCourse.courseTags : []),
            requirements: Array.isArray(sanitizedCourse.requirements) ? sanitizedCourse.requirements : (Array.isArray(sanitizedCourse.courseRequirements) ? sanitizedCourse.courseRequirements : []),
            notesCount: notesCount // Add notes count to the course data
          };
        })).then(courses => courses.filter(course => course !== null)); // Remove any null courses

        if (!isMounted) return;

        setCourses(transformedCourses);

        // Calculate statistics
        const totalCourses = transformedCourses.length;
        const freeCourses = transformedCourses.filter(course => course.price === 0).length;
        const paidCourses = totalCourses - freeCourses;
        const totalStudents = transformedCourses.reduce((sum, course) => sum + (course.students || 0), 0);
        const totalViews = transformedCourses.reduce((sum, course) => sum + (course.views || 0), 0);
        const avgRating = totalCourses > 0
          ? transformedCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / totalCourses
          : 0;

        // Find top performing course
        const topPerforming = transformedCourses.reduce((top, course) =>
          (course.students > (top?.students || 0)) ? course : top, null
        );

        // Count unique categories
        const uniqueCategories = [...new Set(transformedCourses.map(course => course.category).filter(Boolean))];
        setCategories(uniqueCategories);

        // Count by enrollment status
        const openCourses = transformedCourses.filter(course => course.enrollmentStatus === 'open').length;
        const closedCourses = transformedCourses.filter(course => course.enrollmentStatus === 'closed').length;
        const archivedCourses = transformedCourses.filter(course => course.enrollmentStatus === 'archived').length;

        if (!isMounted) return;

        setStats({
          total: totalCourses,
          free: freeCourses,
          paid: paidCourses,
          students: totalStudents,
          avgRating: avgRating.toFixed(1),
          totalViews,
          topPerforming,
          categories: uniqueCategories.length,
          open: openCourses,
          closed: closedCourses,
          archived: archivedCourses
        });

        setLastUpdated(new Date());
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching courses:', error);
        
        // Enhanced error handling with more specific messages
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          toast.error('Cannot connect to server. Please check your internet connection.');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
          // Redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          toast.error('Access denied. You do not have permission to view courses.');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(`Failed to load courses: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewCourse = (courseId, enrollmentStatus) => {
    // For archived courses, just show a message
    if (enrollmentStatus === 'archived') {
      toast.info('This course is archived and no longer available.');
      return;
    }

    navigate(`/course/${courseId}`);
  };

  // Add a new function to handle enrollment
  const handleEnrollCourse = async (courseId, enrollmentStatus) => {
    // Only allow enrollment in courses with "open" enrollment status
    if (enrollmentStatus !== 'open') {
      toast.error('Enrollment is not currently open for this course.');
      return;
    }

    // Navigate to course page where enrollment can happen
    navigate(`/course/${courseId}`);
  };

  // Format date to show only date without time
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format duration
  const formatDuration = (duration) => {
    return duration;
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };

  // Debounce function for search
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setFilter("all");
    setEnrollmentStatusFilter("all");
    setSortBy("newest");
  };

  // Get level badge
  const getLevelBadge = (level) => {
    // Normalize the level value to match the switch cases
    const normalizedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : '';

    switch (normalizedLevel) {
      case 'Beginner':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Beginner
          </span>
        );
      case 'Intermediate':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Intermediate
          </span>
        );
      case 'Advanced':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Advanced
          </span>
        );
      case 'All-levels':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            All Levels
          </span>
        );
      default:
        // Handle case where level might be in a different format
        if (level) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {normalizedLevel}
            </span>
          );
        }
        return null;
    }
  };

  // Get enrollment status badge
  const getEnrollmentStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Unlock className="mr-1 h-3 w-3" />
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Lock className="mr-1 h-3 w-3" />
            Closed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Archive className="mr-1 h-3 w-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    // Handle case where courses might be undefined or null
    if (!courses || !Array.isArray(courses)) {
      return [];
    }

    let result = [...courses];

    // Apply search filter with enhanced logic
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase().trim();
      if (term.length > 0) {
        result = result.filter(course => {
          // Ensure course is a valid object
          if (!course || typeof course !== 'object') {
            return false;
          }

          // Search in multiple fields with more comprehensive matching
          const searchableFields = [
            course.title,
            course.description,
            course.category,
            course.instructor,
            course.level,
            course.language,
            course.subTitle,
            course.summary
          ];

          // Check if any field contains the search term
          return searchableFields.some(field => {
            if (field && typeof field === 'string') {
              return field.toLowerCase().includes(term);
            }
            return false;
          });
        });
      }
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(course => {
        if (!course || typeof course !== 'object') {
          return false;
        }
        return course.category === categoryFilter;
      });
    }

    // Apply price filter
    if (filter && filter !== 'all') {
      result = result.filter(course => {
        if (!course || typeof course !== 'object') {
          return false;
        }

        if (filter === 'free') {
          return (course.price === 0 || course.price === undefined);
        } else if (filter === 'paid') {
          return course.price > 0;
        }
        return true;
      });
    }

    // Apply enrollment status filter
    if (enrollmentStatusFilter && enrollmentStatusFilter !== 'all') {
      result = result.filter(course => {
        if (!course || typeof course !== 'object') {
          return false;
        }
        return course.enrollmentStatus === enrollmentStatusFilter;
      });
    }

    // Apply sorting
    try {
      switch (sortBy) {
        case 'newest':
          result.sort((a, b) => {
            const dateA = new Date(a.lastUpdated);
            const dateB = new Date(b.lastUpdated);
            return isNaN(dateA) || isNaN(dateB) ? 0 : dateB - dateA;
          });
          break;
        case 'oldest':
          result.sort((a, b) => {
            const dateA = new Date(a.lastUpdated);
            const dateB = new Date(b.lastUpdated);
            return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB;
          });
          break;
        case 'popularity':
          result.sort((a, b) => {
            const studentsA = parseInt(a.students) || 0;
            const studentsB = parseInt(b.students) || 0;
            return studentsB - studentsA;
          });
          break;
        case 'alphabetical':
          result.sort((a, b) => {
            const titleA = (a.title || '').toString();
            const titleB = (b.title || '').toString();
            return titleA.localeCompare(titleB);
          });
          break;
        case 'price-low-high':
          result.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceA - priceB;
          });
          break;
        case 'price-high-low':
          result.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceB - priceA;
          });
          break;
        case 'rating':
          result.sort((a, b) => {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            return ratingB - ratingA;
          });
          break;
        default:
          result.sort((a, b) => {
            const dateA = new Date(a.lastUpdated);
            const dateB = new Date(b.lastUpdated);
            return isNaN(dateA) || isNaN(dateB) ? 0 : dateB - dateA;
          });
      }
    } catch (error) {
      console.warn('Error during sorting:', error);
      // If sorting fails, return unsorted result
    }

    return result;
  }, [courses, debouncedSearchTerm, categoryFilter, filter, enrollmentStatusFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Nav />

      {/* Custom scrollbar styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto pt-20">
        {/* Student-Focused Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
          {/* Learning Opportunities Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full opacity-3 transform -translate-x-4 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.total}</div>
                  <div className="text-blue-100 text-sm">Courses Available</div>
                </div>
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-2">Learning Opportunities</h3>
                <div className="flex items-center justify-between text-sm text-blue-100">
                  <span>{stats.free} Free Courses</span>
                  <span>{stats.categories} Categories</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enrollment Status Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full opacity-3 transform -translate-x-4 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all duration-300">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.open}</div>
                  <div className="text-purple-100 text-sm">Open Enrollment</div>
                </div>
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-2">Enrollment Status</h3>
                <div className="flex items-center justify-between text-sm text-purple-100">
                  <span>{stats.closed} Closed</span>
                  <span>{stats.archived} Archived</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Learning Community Card */}
          <motion.div
            className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full opacity-3 transform -translate-x-4 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.students.toLocaleString()}</div>
                  <div className="text-green-100 text-sm">Fellow Learners</div>
                </div>
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-2">Learning Community</h3>
                <div className="flex items-center justify-between text-sm text-green-100">
                  <span>Join the Community</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                    Active Now
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quality Assurance Card */}
          <motion.div
            className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full opacity-3 transform -translate-x-4 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.avgRating}</div>
                  <div className="text-amber-100 text-sm">Average Rating</div>
                </div>
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <div className="flex items-center justify-between text-sm text-amber-100">
                  <span>High-Quality Content</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(stats.avgRating) ? 'text-yellow-300 fill-current' : 'text-amber-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Learning Progress Card */}
          <motion.div
            className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full opacity-3 transform -translate-x-4 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-orange-100 text-sm">Course Views</div>
                </div>
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-2">Popular Content</h3>
                <div className="flex items-center justify-between text-sm text-orange-100">
                  <span>Trending Courses</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sub Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
            <p className="text-gray-600 mt-1">
              {searchTerm || categoryFilter !== 'all' || filter !== 'all' || enrollmentStatusFilter !== 'all'
                ? `Showing ${filteredCourses.length} of ${courses.length} courses`
                : `Discover and enroll in amazing courses`}
            </p>
          </div>
        </div>

        {/* Enrollment Status Legend */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-blue-800">Enrollment Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Open - You can enroll in these courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Closed - Enrollment is currently closed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Archived - These courses are no longer available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="p-1 bg-blue-100 bg-opacity-60 rounded">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              </div>
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-500" />
                      Price
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Courses</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                      Enrollment Status
                    </label>
                    <select
                      value={enrollmentStatusFilter}
                      onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-orange-500" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popularity">Popularity</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="p-1 bg-blue-100 bg-opacity-60 rounded">
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      </div>
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' || filter !== 'all' || enrollmentStatusFilter !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'No courses are available at the moment. Please check back later.'}
            </p>
            {(searchTerm || categoryFilter !== 'all' || filter !== 'all' || enrollmentStatusFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                <div className="p-1 bg-white bg-opacity-20 rounded">
                  <RefreshCw className="w-4 h-4" />
                </div>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              // Grid View - Optimized for better card sizing without collapsing
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow min-h-[600px] flex flex-col"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-48 lg:h-44 xl:h-48 object-cover rounded-md mb-3 transition-all duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-48 lg:h-44 xl:h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md mb-3 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                              <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                                <BookOpen className="h-10 w-10 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-blue-600" />
                              </div>
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-grow">{course.title}</span>
                              {getEnrollmentStatusBadge(course.enrollmentStatus)}
                            </div>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                        </div>
                      </div>

                      {/* Instructor name */}
                      <div className="text-xs text-gray-500 mb-3">
                        by {course.instructor}
                      </div>

                      {/* Course stats */}
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.students} students</span>
                        <span className="mx-2">•</span>
                        <span>
                          {course.hasDiscount ? (
                            <>
                              <span className="line-through text-gray-400 mr-1">
                                {formatCurrency(course.originalPrice)}
                              </span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(course.price)}
                              </span>
                            </>
                          ) : (
                            <span>{formatCurrency(course.price)}</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDuration(course.duration)}</span>
                        <span className="mx-2">•</span>
                        {getLevelBadge(course.level)}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                        {getEnrollmentStatusBadge(course.enrollmentStatus)}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {course.rating > 0 ? (
                            <>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium text-gray-900">{course.rating}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No ratings</span>
                          )}
                          <span className="text-xs text-gray-500 ml-2">Updated {course.lastUpdated}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <BookA className="w-4 h-4 mr-1" />
                          <span>{course.modules} modules</span>
                        </div>
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          <span>{course.lessons} lessons</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          <span>{course.quizzes} quizzes</span>
                        </div>
                      </div>
                      
                      {/* Notes count */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course.notesCount} notes</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          <span>{course.language}</span>
                        </div>
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          <span>{formatPercentage(course.completionRate)}</span>
                        </div>
                      </div>

                      {/* Creative Action Button */}
                      <div className="mt-auto pt-6 space-y-3">
                        <motion.button
                          onClick={() => handleViewCourse(course.id, course.enrollmentStatus)}
                          className={`group relative overflow-hidden text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${course.enrollmentStatus === 'archived'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                            }`}
                          whileHover={course.enrollmentStatus !== 'archived' ? { scale: 1.05 } : {}}
                          whileTap={course.enrollmentStatus !== 'archived' ? { scale: 0.95 } : {}}
                          title={course.enrollmentStatus === 'archived' ? 'Course is archived' : 'View Course'}
                          disabled={course.enrollmentStatus === 'archived'}
                        >
                          {/* Animated background for non-archived courses */}
                          {course.enrollmentStatus !== 'archived' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-90 transition-opacity duration-300"></div>
                          )}

                          {/* Button content */}
                          <div className="relative flex items-center gap-2">
                            {course.enrollmentStatus === 'archived' ? (
                              <Archive className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                            )}
                            <span className="font-medium text-sm">
                              {course.enrollmentStatus === 'archived' ? 'Archived' :
                                course.enrollmentStatus === 'closed' ? 'View' : 'View'}
                            </span>
                            {course.enrollmentStatus !== 'archived' && (
                              <div className="w-1 h-1 bg-white rounded-full group-hover:animate-ping"></div>
                            )}
                          </div>

                          {/* Shine effect for non-archived courses */}
                          {course.enrollmentStatus !== 'archived' && (
                            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                          )}
                        </motion.button>

                        {/* Quick Info Bar */}
                        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                          <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${course.enrollmentStatus === 'open' ? 'bg-green-400' :
                                course.enrollmentStatus === 'closed' ? 'bg-red-400' : 'bg-gray-400'
                              }`}></div>
                            {course.enrollmentStatus === 'open' ? 'Available now' :
                              course.enrollmentStatus === 'closed' ? 'Enrollment closed' : 'Archived'}
                          </span>
                          <span>{course.students} students enrolled</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View - Enhanced table view
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Content
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredCourses.map((course, index) => (
                        <motion.tr
                          key={course.id}
                          className="hover:bg-blue-50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="flex-shrink-0 h-16 w-24 lg:h-20 lg:w-32 xl:h-16 xl:w-28 object-cover rounded-md transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex-shrink-0 h-16 w-24 lg:h-20 lg:w-32 xl:h-16 xl:w-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md flex items-center justify-center hover:from-blue-200 hover:to-indigo-200 transition-all duration-300">
                                  <div className="p-2 bg-white bg-opacity-60 rounded-lg">
                                    <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 xl:h-6 xl:w-6 text-blue-600" />
                                  </div>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                                <div className="text-xs text-gray-400 mt-1">by {course.instructor} • {course.language}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.category}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              {getLevelBadge(course.level)}
                              {getEnrollmentStatusBadge(course.enrollmentStatus)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {course.students}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center">
                              <UserCheck className="w-3 h-3 mr-1" />
                              {formatPercentage(course.completionRate)} completion
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.hasDiscount ? (
                              <div className="flex items-center">
                                <span className="line-through text-gray-400 mr-2">
                                  {formatCurrency(course.originalPrice)}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(course.price)}
                                </span>
                              </div>
                            ) : (
                              <span>{formatCurrency(course.price)}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.rating > 0 ? (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span>{course.rating}</span>
                                <span className="text-gray-400 mx-1">•</span>
                                <span>{course.views} views</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No ratings</span>
                            )}
                            <div className="text-xs text-gray-400 mt-1">Updated: {course.lastUpdated}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-xs">
                                <BookA className="w-3 h-3 mr-1" />
                                {course.modules}
                              </div>
                              <div className="flex items-center text-xs">
                                <Video className="w-3 h-3 mr-1" />
                                {course.lessons}
                              </div>
                              <div className="flex items-center text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {course.quizzes}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{formatDuration(course.duration)}</div>
                            
                            {/* Notes count in list view */}
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <BookOpen className="w-3 h-3 mr-1" />
                              <span>{course.notesCount} notes</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <motion.button
                              onClick={() => handleViewCourse(course.id, course.enrollmentStatus)}
                              className={`group relative overflow-hidden text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${course.enrollmentStatus === 'archived'
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                }`}
                              whileHover={course.enrollmentStatus !== 'archived' ? { scale: 1.05 } : {}}
                              whileTap={course.enrollmentStatus !== 'archived' ? { scale: 0.95 } : {}}
                              title={course.enrollmentStatus === 'archived' ? 'Course is archived' : 'View Course'}
                              disabled={course.enrollmentStatus === 'archived'}
                            >
                              {/* Animated background for non-archived courses */}
                              {course.enrollmentStatus !== 'archived' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-90 transition-opacity duration-300"></div>
                              )}

                              {/* Button content */}
                              <div className="relative flex items-center gap-2">
                                {course.enrollmentStatus === 'archived' ? (
                                  <Archive className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                )}
                                <span className="font-medium text-sm">
                                  {course.enrollmentStatus === 'archived' ? 'Archived' :
                                    course.enrollmentStatus === 'closed' ? 'View' : 'View'}
                                </span>
                                {course.enrollmentStatus !== 'archived' && (
                                  <div className="w-1 h-1 bg-white rounded-full group-hover:animate-ping"></div>
                                )}
                              </div>

                              {/* Shine effect for non-archived courses */}
                              {course.enrollmentStatus !== 'archived' && (
                                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                              )}
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Courses;