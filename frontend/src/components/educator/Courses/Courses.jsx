import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import courseService from '../../../services/courseService.js';
import noteService from '../../../services/noteService.js'; // Add this import
import CreateCourses from './CreateCourses';
import EditCourse from './EditCourse';
import ViewCourse from './ViewCourse';
import Lectures from '../Lectures/Lectures.jsx';
import CreateSection from '../Sections/CreateSection'; // Add this import
import EditSection from '../Sections/EditSection'; // Add this import

// Helper function to transform courses data
const transformCourses = (coursesData = []) => {
  // Ensure coursesData is an array
  if (!Array.isArray(coursesData)) {
    // Try to extract courses from the object if it's not an array
    if (coursesData && typeof coursesData === 'object' && coursesData.courses && Array.isArray(coursesData.courses)) {
      coursesData = coursesData.courses;
    } else if (coursesData && typeof coursesData === 'object' && coursesData.data && Array.isArray(coursesData.data)) {
      coursesData = coursesData.data;
    } else {
      return [];
    }
  }
  
  return coursesData.map(course => ({
    id: course._id,
    title: course.title,
    subTitle: course.subTitle,
    description: course.description,
    students: course.totalEnrolled || 0,
    status: course.isPublished ? 'published' : 'draft',
    lastUpdated: new Date(course.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    lastUpdatedRaw: course.updatedAt, // For accurate sorting
    thumbnail: course.thumbnail,
    banner: course.banner,
    previewVideo: course.previewVideo,
    price: course.price,
    finalPrice: course.finalPrice,
    originalPrice: course.originalPrice || course.price,
    discount: course.discount,
    discountPercentage: course.discountPercentage || course.discount,
    savings: course.savings || (course.discount > 0 ? course.price - course.finalPrice : 0),
    rating: course.averageRating || 0,
    reviewsCount: course.reviewsCount || 0,
    category: course.category,
    subCategory: course.subCategory,
    tags: course.tags || [],
    duration: course.durationWithUnit ?? course.durationFormatted ?? `${course.totalDurationMinutes || 0} minutes`,
    totalDurationMinutes: course.totalDurationMinutes || 0,
    level: course.level || 'beginner', // Default to beginner if not provided
    views: course.views || 0,
    completionRate: course.completionRate || 0,
    revenue: course.revenue || 0,
    modules: course.totalSections || course.sections?.length || 0,
    lessons: course.totalLectures || course.lectures?.length || 0,
    lectures: course.totalLectures || course.lectures?.length || 0,
    sections: course.sections || [],
    quizzes: 0, // Not in current model
    assignments: 0, // Not in current model
    certificate: course.hasCertificate,
    hasCertificate: course.hasCertificate,
    publishedDate: course.publishedDate ? new Date(course.publishedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : null,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    instructor: course.creator?.name || 'Unknown',
    creatorId: course.creator?._id || course.creator,
    language: course.language || 'English',
    isFeatured: course.isFeatured || false,
    enrollmentStatus: course.enrollmentStatus || 'open',
    prerequisites: course.prerequisites || [],
    learningOutcomes: course.learningOutcomes || [],
    requirements: course.requirements || [],
    slug: course.slug,
    metaTitle: course.metaTitle,
    metaDescription: course.metaDescription,
    notesCount: course.notesCount || 0 // Add notes count to the course data
  }));
};

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popularity', 'alphabetical'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    students: 0,
    revenue: 0,
    avgRating: 0,
    completionRate: 0,
    totalViews: 0,
    topPerforming: null,
    lowEnrollment: 0
  });

  // Fetch courses and statistics
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch courses and statistics in parallel
      const [coursesResponse, statsResponse] = await Promise.all([
        courseService.getCreatorCourses(),
        courseService.getCourseStatistics()
      ]);

      // Transform courses data to match frontend expectations
      // Ensure we have a valid array before transforming
      const coursesData = coursesResponse?.courses || [];
      
      // Enhance courses with notes count
      const enhancedCoursesData = await Promise.all(coursesData.map(async (course) => {
        // Fetch notes count for this course
        let notesCount = 0;
        try {
          const notesResponse = await noteService.getNotesByCourse(course._id);
          if (notesResponse.success) {
            notesCount = notesResponse.count || notesResponse.notes?.length || 0;
          }
        } catch (error) {
          console.warn(`Failed to fetch notes for course ${course._id}:`, error);
        }
        
        return {
          ...course,
          notesCount: notesCount
        };
      }));
      
      const transformedCourses = transformCourses(enhancedCoursesData);

      setCourses(transformedCourses);
      
      // Ensure stats have default values
      const statsData = {
        total: 0,
        published: 0,
        draft: 0,
        students: 0,
        revenue: 0,
        avgRating: 0,
        completionRate: 0,
        totalViews: 0,
        topPerforming: null,
        lowEnrollment: 0,
        ...(statsResponse?.stats || {})
      };
      
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set empty courses if API calls fail
      setCourses([]);
      setStats({
        total: 0,
        published: 0,
        draft: 0,
        students: 0,
        revenue: 0,
        avgRating: 0,
        completionRate: 0,
        totalViews: 0,
        topPerforming: null,
        lowEnrollment: 0
      });

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Please log in to view your courses.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You need educator permissions to view this page.');
      } else {
        toast.error('Failed to load courses. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDataWrapper = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    fetchDataWrapper();
    
    return () => { 
      isMounted = false; 
    };
  }, [fetchData]);

  // Listen for course updates
  useEffect(() => {
    const handleCourseUpdate = async (event) => {
      // Refresh data when a course is updated
      console.log("Course updated, refreshing data:", event.detail);
      await fetchData();
    };

    // Add event listener for course updates
    window.addEventListener('courseUpdated', handleCourseUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('courseUpdated', handleCourseUpdate);
    };
  }, [fetchData]);

  // Listen for lecture updates
  useEffect(() => {
    const handleLectureUpdate = async (event) => {
      // Refresh data when a lecture is updated
      console.log("Lecture updated, refreshing course data:", event.detail);
      await fetchData();
    };

    // Add event listener for lecture updates
    window.addEventListener('lectureUpdated', handleLectureUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('lectureUpdated', handleLectureUpdate);
    };
  }, [fetchData]);

  const handleCreateCourse = () => {
    navigate('/educator/courses/create');
  };

  const handleEditCourse = (courseId) => {
    navigate(`/educator/courses/edit/${courseId}`);
  };

  const handleViewCourse = (course) => {
    // Use slug if available, otherwise use id
    const courseIdentifier = course.slug || course.id;
    navigate(`/educator/courses/view/${courseIdentifier}`);
  };

  const handleViewAnalytics = (courseId) => {
    navigate(`/educator/courses/analytics/${courseId}`);
  };

  const handleSettingsCourse = (courseId) => {
    navigate(`/educator/courses/settings/${courseId}`);
  };

  const handleTogglePublish = async (courseId) => {
    try {
      // Call the service to toggle publish status
      const response = await courseService.togglePublishStatus(courseId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update course status');
      }
      
      // Get the updated course data from the response
      const updatedCourse = response.course;
      
      // Update the course status in the local state with actual backend data
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { 
                ...course, 
                status: updatedCourse?.isPublished ? 'published' : 'draft',
                // Update any other fields that might have changed
                ...transformCourses([updatedCourse])[0]
              }
            : course
        )
      );

      // Also update the stats
      await fetchData();

      toast.success(`Course ${updatedCourse?.isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error(error.message || 'Failed to update course status');
    }
  };

  // Delete flow
  const handleDeleteCourse = (courseId) => {
    setCourseToDelete(courseId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await courseService.deleteCourse(courseToDelete);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete course');
      }
      
      setCourses(courses.filter(course => course.id !== courseToDelete));
      setShowDeleteConfirm(false);
      toast.success(`Course deleted successfully`);

      // Refresh statistics
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete course. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Bulk select / delete
  const handleSelectCourse = (courseId) => {
    setSelectedCourses((prev) => {
      const n = new Set(prev);
      if (n.has(courseId)) n.delete(courseId);
      else n.add(courseId);
      return n;
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length)
      setSelectedCourses(new Set());
    else setSelectedCourses(new Set(filteredCourses.map((c) => c.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.size === 0)
      return toast.warning("Please select at least one course to delete");

    const count = selectedCourses.size;
    if (!window.confirm(`Are you sure you want to delete ${count} course(s)?`))
      return;

    try {
      // Delete all selected courses
      const deletePromises = Array.from(selectedCourses).map(courseId =>
        courseService.deleteCourse(courseId)
      );
      
      const responses = await Promise.all(deletePromises);
      
      // Check if all deletions were successful
      const allSuccessful = responses.every(response => response.success);
      
      if (!allSuccessful) {
        throw new Error('Some courses failed to delete');
      }

      setCourses(courses.filter(course => !selectedCourses.has(course.id)));
      toast.success(`${count} course(s) deleted successfully`);
      setSelectedCourses(new Set());

      // Refresh statistics
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete some courses. Please try again.');
    }
  };

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        course.instructor.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(course => course.status === filter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.lastUpdatedRaw) - new Date(b.lastUpdatedRaw));
        break;
      case 'popularity':
        result.sort((a, b) => b.students - a.students);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'revenue':
        result.sort((a, b) => b.revenue - a.revenue);
        break;
      default:
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
    }

    return result;
  }, [courses, searchTerm, filter, sortBy]);

  // Get status badge for a course
  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </span>
        );
      default:
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
      default:
        return null;
    }
  };

  // Get level badge
  const getLevelBadge = (level) => {
    // Normalize the level value to match the switch cases
    const normalizedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : 'Beginner';
    
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
        // Show the actual level value if it doesn't match any case
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {normalizedLevel}
          </span>
        );
    }
  };

  // Get featured badge (removed functionality)
  const getFeaturedBadge = (isFeatured) => {
    // Removed featured badge functionality
    return null;
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);

      // Fetch courses and statistics in parallel
      const [coursesResponse, statsResponse] = await Promise.all([
        courseService.getCreatorCourses(),
        courseService.getCourseStatistics()
      ]);

      // Transform courses data to match frontend expectations
      // Ensure we have a valid array before transforming
      const coursesData = coursesResponse?.courses || [];
      const transformedCourses = transformCourses(coursesData);

      setCourses(transformedCourses);
      setStats(statsResponse?.stats || {
        total: 0,
        published: 0,
        draft: 0,
        students: 0,
        revenue: 0,
        avgRating: 0,
        completionRate: 0,
        totalViews: 0,
        topPerforming: null,
        lowEnrollment: 0
      });
      setLastUpdated(new Date());
      toast.info("Courses data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Set empty courses if API calls fail
      setCourses([]);
      setStats({
        total: 0,
        published: 0,
        draft: 0,
        students: 0,
        revenue: 0,
        avgRating: 0,
        completionRate: 0,
        totalViews: 0,
        topPerforming: null,
        lowEnrollment: 0
      });

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Please log in to refresh courses.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You need educator permissions to access this data.');
      } else {
        toast.error('Failed to refresh courses. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilter("all");
    setSortBy("newest");
    setShowFilters(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };

  // Format duration
  const formatDuration = (duration) => {
    return duration;
  };

  // Get final price (with fallback calculation)
  const getFinalPrice = (course) => {
    if (course.finalPrice !== undefined) {
      return course.finalPrice;
    }
    // Fallback calculation if finalPrice is not provided by backend
    if (course.discountPercentage > 0 && course.price > 0) {
      return Math.round(course.price - (course.price * course.discountPercentage) / 100);
    }
    return course.price || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="p-6">
          {/* Custom scrollbar styles */}
          <style>{`
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
          `}</style>

          <div className="max-w-7xl mx-auto">
            {/* Proactive Notifications */}
            {stats.lowEnrollment > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-md flex items-center justify-between border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <span className="text-yellow-700 font-medium">
                    ⚠️ Low Enrollment Alert: {stats.lowEnrollment} course{stats.lowEnrollment !== 1 ? 's' : ''} with fewer than 50 students
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFilter("published");
                    setSortBy("popularity");
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                >
                  Review
                </button>
              </div>
            )}

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              {/* Total Courses Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                    <div className="flex items-center mt-2 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {stats.published} published, {stats.draft} drafts
                      </span>
                      <button
                        onClick={handleRefresh}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-xs transition-transform hover:rotate-90"
                        title="Refresh data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 shadow-inner">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Updated</span>
                    <span className="font-medium text-gray-700">
                      {lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Students Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.students}</p>
                    <div className="mt-2">
                      {stats.lowEnrollment > 0 ? (
                        <span className="inline-flex items-center text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          {stats.lowEnrollment} low enrollment
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Enrollment levels good
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 shadow-inner">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg. per Course</span>
                    <span className="font-medium text-gray-700">
                      {stats.published > 0 ? Math.round(stats.students / stats.published) : 0}
                    </span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Top Course</span>
                      <span
                        className="font-medium text-gray-700 break-words max-w-[120px]"
                        title={stats.topPerforming.title}
                      >
                        {stats.topPerforming.title}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Revenue Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.revenue)}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% this month
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3 shadow-inner">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg. per Course</span>
                    <span className="font-medium text-gray-700">
                      {stats.published > 0 ? formatCurrency(Math.round(stats.revenue / stats.published)) : formatCurrency(0)}
                    </span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Top Earner</span>
                      <span
                        className="font-medium text-gray-700 break-words max-w-[120px]"
                        title={stats.topPerforming.title}
                      >
                        {formatCurrency(stats.topPerforming.revenue)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Performance Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Performance</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.avgRating}/5</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded-full">
                        <UserCheck className="w-3 h-3 mr-1" />
                        {stats.completionRate}% completion
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3 shadow-inner">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Views</span>
                    <span className="font-medium text-gray-700">{stats.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Avg. Rating</span>
                    <span className="font-medium text-gray-700">{stats.avgRating}</span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Top Rated</span>
                      <span
                        className="font-medium text-gray-700 break-words max-w-[120px]"
                        title={stats.topPerforming.title}
                      >
                        {stats.topPerforming.rating}/5
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sub Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600 mt-1">Manage your courses and track student progress</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button
                  onClick={handleCreateCourse}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Course</span>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCourses.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                <span className="text-blue-700">
                  {selectedCourses.size} course{selectedCourses.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="all">All Courses</option>
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="popularity">Popularity</option>
                          <option value="revenue">Revenue</option>
                          <option value="alphabetical">Alphabetical</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={clearAllFilters}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-blue-50"
                        >
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
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your filters or search term'
                    : 'Get started by creating your first course'}
                </p>
                <button
                  onClick={handleCreateCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-40 object-cover rounded-md mb-3"
                                />
                              ) : (
                                <div className="w-full h-40 bg-blue-100 rounded-md mb-3 flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-blue-600" />
                                </div>
                              )}
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              {getStatusBadge(course.status)}
                              {/* Removed featured badge */}
                            </div>
                          </div>

                          {/* Added instructor name below the title and description */}
                          <div className="text-xs text-gray-500 mb-3">
                            by {course.instructor}
                          </div>

                          {/* Rest of the grid item content remains the same */}
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{course.students} students</span>
                            <span className="mx-2">•</span>
                            <span className="font-medium text-gray-900">{formatCurrency(getFinalPrice(course))}</span>
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

                          <div className="grid grid-cols-5 gap-1">
                            <button
                              onClick={() => handleViewCourse(course)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="View Course"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">View</span>
                            </button>
                            <button
                              onClick={() => handleViewAnalytics(course.id)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="View Analytics"
                            >
                              <BarChart className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">Analytics</span>
                            </button>
                            <button
                              onClick={() => handleEditCourse(course.id)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">Edit</span>
                            </button>
                            <button
                              onClick={() => handleTogglePublish(course.id)}
                              className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${course.status === 'published'
                                  ? 'bg-green-50 hover:bg-green-100'
                                  : 'bg-yellow-50 hover:bg-yellow-100'
                                }`}
                              title={course.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
                            >
                              {course.status === 'published' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-yellow-600" />
                              )}
                              <span className={`text-xs mt-1 ${course.status === 'published' ? 'text-green-700' : 'text-yellow-700'
                                }`}>
                                {course.status === 'published' ? 'Live' : 'Draft'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleSettingsCourse(course.id)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="Course Settings"
                            >
                              <Settings className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">Settings</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Enhanced List View (Table)
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                              <input
                                type="checkbox"
                                checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                                onChange={handleSelectAll}
                                className="rounded text-blue-500 focus:ring-blue-400"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredCourses.map((course, index) => (
                            <motion.tr
                              key={course.id}
                              className="hover:bg-blue-50"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedCourses.has(course.id)}
                                  onChange={() => handleSelectCourse(course.id)}
                                  className="rounded text-blue-500 focus:ring-blue-400"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {course.thumbnail ? (
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="flex-shrink-0 h-16 w-24 object-cover rounded-md"
                                    />
                                  ) : (
                                    <div className="flex-shrink-0 h-16 w-24 bg-blue-100 rounded-md flex items-center justify-center">
                                      <BookOpen className="h-8 w-8 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {course.title}
                                    </div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      by {course.instructor} • {course.language}
                                    </div>
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
                                <div className="flex flex-col">
                                  {course.discountPercentage > 0 ? (
                                    <>
                                      <span className="font-semibold text-green-600">{formatCurrency(course.finalPrice)}</span>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-400 line-through">{formatCurrency(course.originalPrice)}</span>
                                        <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                          {course.discountPercentage}% OFF
                                        </span>
                                      </div>
                                      <span className="text-xs text-green-600 mt-1">
                                        Save {formatCurrency(course.savings)}
                                      </span>
                                    </>
                                  ) : (
                                    <span>{formatCurrency(course.finalPrice || course.price)}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-y-1 flex-col">
                                  {getStatusBadge(course.status)}
                                </div>
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
                                <div className="text-xs text-gray-400 mt-1">
                                  Updated: {course.lastUpdated}
                                </div>
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
                                <div className="text-xs text-gray-400 mt-1">
                                  {formatDuration(course.duration)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {course.assignments} assignments
                                </div>
                                
                                {/* Notes count in list view */}
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  <span>{course.notesCount} notes</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleViewCourse(course)}
                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                                    title="View Course"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleViewAnalytics(course.id)}
                                    className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md"
                                    title="View Analytics"
                                  >
                                    <BarChart className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditCourse(course.id)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-blue-50 rounded-md"
                                    title="Edit Course"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSettingsCourse(course.id)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-blue-50 rounded-md"
                                    title="Course Settings"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                </div>
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
      } />

      <Route path="/create" element={<CreateCourses />} />
      <Route path="/edit/:id" element={<EditCourse />} />
      <Route path="/view/:courseId" element={<ViewCourse />} />
      
      {/* Section routes */}
      <Route path="/:courseId/sections/create" element={<CreateSection />} />
      <Route path="/:courseId/sections/edit/:sectionId" element={<EditSection />} />
      
      {/* Course-specific lectures routes */}
      <Route path="/:courseId/lectures/*" element={<Lectures />} />
      
      {/* Catch all - redirect to courses list */}
      <Route path="*" element={<Navigate to="/educator/courses" replace />} />
    </Routes>
  );
}

export default Courses;