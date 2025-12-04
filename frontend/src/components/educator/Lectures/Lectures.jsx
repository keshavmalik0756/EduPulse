import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { toast } from 'react-hot-toast';
import lectureService from '../../../services/lectureService.js';
import sectionService from '../../../services/sectionService.js';
import apiClient from '../../../utils/apiClient.js';
import CreateLecture from './CreateLecture';
import EditLecture from './EditLecture';
import ViewLecture from './ViewLecture';

// Helper function to transform lectures data
const transformLectures = (lecturesData = []) => {
  // Normalize nested response shapes
  if (!Array.isArray(lecturesData)) {
    if (lecturesData?.lectures && Array.isArray(lecturesData.lectures)) {
      lecturesData = lecturesData.lectures;
    } else if (lecturesData?.data?.lectures && Array.isArray(lecturesData.data.lectures)) {
      lecturesData = lecturesData.data.lectures;
    } else if (lecturesData?.data && Array.isArray(lecturesData.data)) {
      lecturesData = lecturesData.data;
    } else {
      console.warn("⚠️ transformLectures: invalid data shape", lecturesData);
      return [];
    }
  }
  
  return lecturesData.map(lecture => ({
    id: lecture._id,
    title: lecture.title,
    description: lecture.description,
    duration: lecture.duration || 0,
    durationFormatted: formatDuration(lecture.duration || 0),
    type: lecture.type || 'video',
    isPreview: lecture.isPreview || false,
    isUploaded: lecture.isUploaded || false,
    order: lecture.order || 0,
    sectionId: lecture.sectionId || lecture.section || (lecture.section && lecture.section._id) || null,
    sectionTitle: lecture.sectionTitle || lecture.section?.title || 'Untitled Section',
    courseId: lecture.courseId,
    videoUrl: lecture.videoUrl,
    thumbnail: lecture.thumbnail,
    createdAt: lecture.createdAt,
    updatedAt: lecture.updatedAt,
    views: lecture.views || lecture.viewCount || 0,
    completionRate: lecture.completionRate || 0,
    lastUpdated: lecture.updatedAt ? new Date(lecture.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : (lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '—'),
    lastUpdatedRaw: lecture.updatedAt || lecture.createdAt || null,
  }));
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}m`;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '—';
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

// Format time
const formatTime = (date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Lectures({ courseId: propCourseId, embedded = false }) {
  const navigate = useNavigate();
  const { courseId: routeCourseId, courseId } = useParams();
  const location = useLocation();
  
  // Get courseId from props, route params, or URL search params
  const getCourseId = () => {
    // First priority: courseId passed as prop
    if (propCourseId) return propCourseId;
    
    // Second priority: courseId from route parameters (both possible names)
    if (courseId) return courseId;
    if (routeCourseId) return routeCourseId;
    
    // Third priority: courseId from URL search parameters
    const params = new URLSearchParams(location.search);
    return params.get('courseId');
  };
  
  const courseIdValue = getCourseId();

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'duration', 'alphabetical'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLectures, setSelectedLectures] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    avgDuration: 0,
    topPerforming: null,
    lowViewCount: 0
  });

  // Fetch lectures
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Debug: Log the courseId to see if it's being passed correctly
      console.log('Lectures component - courseIdValue:', courseIdValue);
      console.log('Lectures component - embedded:', embedded);

      // Fetch lectures - using the real API with optional courseId filter
      let lecturesResponse;
      if (courseIdValue) {
        // Fetch lectures for a specific course
        console.log(`Fetching lectures for course: ${courseIdValue}`);
        lecturesResponse = await lectureService.getLecturesByCourse(courseIdValue);
        console.log('Lectures response for course:', lecturesResponse);
      } else {
        // Fetch all lectures for the educator (using getAllLectures endpoint)
        console.log('Fetching all lectures for educator');
        lecturesResponse = await apiClient.get('/lectures');
        lecturesResponse = {
          success: true,
          lectures: lecturesResponse.data?.data?.lectures || lecturesResponse.data?.lectures || []
        };
        console.log('All lectures response:', lecturesResponse);
      }
      
      // Transform lectures data to match frontend expectations
      const transformedLectures = transformLectures(lecturesResponse.lectures || []);
      console.log('Transformed lectures:', transformedLectures);
      
      setLectures(transformedLectures);
      
      // Calculate statistics
      const total = transformedLectures.length;
      const views = transformedLectures.reduce((sum, l) => sum + (l.views || 0), 0);
      const totalDuration = transformedLectures.reduce((sum, l) => sum + (l.duration || 0), 0);
      const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
      const topPerforming = transformedLectures.length > 0 ? 
        transformedLectures.reduce((top, current) => (current.views || 0) > (top.views || 0) ? current : top) : null;
      const lowViewCount = transformedLectures.filter(l => (l.views || 0) < 10).length;
      
      setStats({
        total,
        views,
        totalDuration,
        avgDuration,
        topPerforming,
        lowViewCount
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Lectures fetch error:', err);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  }, [courseIdValue, embedded]);

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

  const handleViewLecture = (lecture) => {
    // If we're in embedded mode (within a course), navigate to course-specific view route
    if (embedded && courseIdValue) {
      navigate(`/educator/courses/${courseIdValue}/lectures/view/${lecture.id}`);
    } else {
      // Otherwise, use the general view route
      navigate(`/educator/lectures/view/${lecture.id}`);
    }
  };

  const handleEditLecture = (lectureId) => {
    // If we're in embedded mode (within a course), navigate to course-specific edit route
    if (embedded && courseIdValue) {
      navigate(`/educator/courses/${courseIdValue}/lectures/edit/${lectureId}`);
    } else {
      // Otherwise, use the general edit route
      navigate(`/educator/lectures/edit/${lectureId}`);
    }
  };

  // Delete flow
  const handleDeleteLecture = (lectureId) => {
    setLectureToDelete(lectureId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await lectureService.deleteLecture(lectureToDelete);
      const updatedLectures = lectures.filter(lecture => lecture.id !== lectureToDelete);
      setLectures(updatedLectures);
      
      // Update statistics
      const total = updatedLectures.length;
      const views = updatedLectures.reduce((sum, l) => sum + (l.views || 0), 0);
      const avgDuration = total > 0 ? Math.round(updatedLectures.reduce((sum, l) => sum + (l.duration || 0), 0) / total) : 0;
      const topPerforming = updatedLectures.length > 0 ? 
        updatedLectures.reduce((top, current) => (current.views || 0) > (top.views || 0) ? current : top) : null;
      const lowViewCount = updatedLectures.filter(l => (l.views || 0) < 10).length;
      
      setStats({
        total,
        views,
        avgDuration,
        topPerforming,
        lowViewCount
      });
      
      setShowDeleteConfirm(false);
      toast.success(`Lecture deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete lecture. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Bulk select / delete
  const handleSelectLecture = (lectureId) => {
    setSelectedLectures((prev) => {
      const n = new Set(prev);
      if (n.has(lectureId)) n.delete(lectureId);
      else n.add(lectureId);
      return n;
    });
  };

  const handleSelectAll = () => {
    if (selectedLectures.size === filteredLectures.length)
      setSelectedLectures(new Set());
    else setSelectedLectures(new Set(filteredLectures.map((l) => l.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedLectures.size === 0)
      return toast.warning("Please select at least one lecture to delete");

    const count = selectedLectures.size;
    if (!window.confirm(`Are you sure you want to delete ${count} lecture(s)?`))
      return;

    try {
      // Delete all selected lectures
      await Promise.all(
        Array.from(selectedLectures).map(lectureId =>
          lectureService.deleteLecture(lectureId)
        )
      );

      const updatedLectures = lectures.filter(lecture => !selectedLectures.has(lecture.id));
      setLectures(updatedLectures);
      
      // Update statistics
      const total = updatedLectures.length;
      const views = updatedLectures.reduce((sum, l) => sum + (l.views || 0), 0);
      const avgDuration = total > 0 ? Math.round(updatedLectures.reduce((sum, l) => sum + (l.duration || 0), 0) / total) : 0;
      const topPerforming = updatedLectures.length > 0 ? 
        updatedLectures.reduce((top, current) => (current.views || 0) > (top.views || 0) ? current : top) : null;
      const lowViewCount = updatedLectures.filter(l => (l.views || 0) < 10).length;
      
      setStats({
        total,
        views,
        avgDuration,
        topPerforming,
        lowViewCount
      });
      
      toast.success(`${count} lecture(s) deleted successfully`);
      setSelectedLectures(new Set());
    } catch (error) {
      toast.error('Failed to delete some lectures. Please try again.');
    }
  };

  // Filter and search lectures
  const filteredLectures = useMemo(() => {
    let result = [...lectures];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lecture =>
        lecture.title.toLowerCase().includes(term) ||
        lecture.description.toLowerCase().includes(term) ||
        lecture.sectionTitle.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.lastUpdatedRaw) - new Date(b.lastUpdatedRaw));
        break;
      case 'duration':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
    }

    return result;
  }, [lectures, searchTerm, sortBy]);

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'text':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setShowFilters(false);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);

      // Fetch lectures - using the real API with optional courseId filter
      let lecturesResponse;
      if (courseIdValue) {
        // Fetch lectures for a specific course
        lecturesResponse = await lectureService.getLecturesByCourse(courseIdValue);
      } else {
        // Fetch all lectures for the educator (using getAllLectures endpoint)
        lecturesResponse = await apiClient.get('/lectures');
        lecturesResponse = {
          success: true,
          lectures: lecturesResponse.data?.data?.lectures || lecturesResponse.data?.lectures || []
        };
      }
      
      // Transform lectures data to match frontend expectations
      const transformedLectures = transformLectures(lecturesResponse.lectures || []);
      
      setLectures(transformedLectures);
      
      // Calculate statistics
      const total = transformedLectures.length;
      const views = transformedLectures.reduce((sum, l) => sum + (l.views || 0), 0);
      const avgDuration = total > 0 ? Math.round(transformedLectures.reduce((sum, l) => sum + (l.duration || 0), 0) / total) : 0;
      const topPerforming = transformedLectures.length > 0 ? 
        transformedLectures.reduce((top, current) => (current.views || 0) > (top.views || 0) ? current : top) : null;
      const lowViewCount = transformedLectures.filter(l => (l.views || 0) < 10).length;
      
      setStats({
        total,
        views,
        avgDuration,
        topPerforming,
        lowViewCount
      });
      
      setLastUpdated(new Date());
      toast.info("Lectures data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLectures([]);
      setStats({
        total: 0,
        views: 0,
        avgDuration: 0,
        topPerforming: null,
        lowViewCount: 0
      });

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Please log in to refresh lectures.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You need educator permissions to access this data.');
      } else {
        toast.error('Failed to refresh lectures. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // If embedded, show simple loading, otherwise show full loading UI
    if (embedded) {
      return (
        <div className="p-4">
          <div className="text-center py-6 text-gray-500">Loading lectures...</div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If embedded mode, render simplified lecture list
  if (embedded) {
    console.log('Rendering embedded mode - loading:', loading, 'lectures:', lectures, 'filteredLectures:', filteredLectures, 'courseIdValue:', courseIdValue);
    return (
      <div className="p-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading lectures...</div>
        ) : filteredLectures.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {courseIdValue ? "No lectures found" : "No lectures available"}
            </h3>
            <p className="text-gray-500 mb-4">
              {courseIdValue 
                ? "This course doesn't have any lectures yet." 
                : "You don't have any lectures yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <motion.div
                key={lecture.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                whileHover={{ y: -2 }}
              >
                <div className="p-4">
                  {lecture.thumbnail ? (
                    <img
                      src={lecture.thumbnail}
                      alt={lecture.title}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-100 rounded-md mb-3 flex items-center justify-center">
                      <Video className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{lecture.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {lecture.description}
                  </p>
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {lecture.durationFormatted}
                    </div>
                    <div className="flex items-center">
                      {getTypeIcon(lecture.type)}
                      <span className="ml-1 capitalize">{lecture.type}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-3">
                    <button
                      onClick={() => handleViewLecture(lecture)}
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                      title="View Lecture"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-700 mt-1">View</span>
                    </button>
                    <button
                      onClick={() => handleEditLecture(lecture.id)}
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                      title="Edit Lecture"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-700 mt-1">Edit</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Enhanced stats display
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Lectures</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-green-600">{formatDuration(stats.totalDuration)}</div>
        <div className="text-sm text-gray-600">Total Duration</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.avgDuration)}</div>
        <div className="text-sm text-gray-600">Avg Duration</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.views.toLocaleString()}</div>
        <div className="text-sm text-gray-600">Total Views</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.lowViewCount}</div>
        <div className="text-sm text-gray-600">Low View Lectures</div>
      </div>
    </div>
  );

  // If not embedded, render the full routes version
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
            {stats.lowViewCount > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-md flex items-center justify-between border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <span className="text-yellow-700 font-medium">
                    ⚠️ Low View Count Alert: {stats.lowViewCount} lecture{stats.lowViewCount !== 1 ? 's' : ''} with fewer than 10 views
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSortBy("newest");
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                >
                  Review
                </button>
              </div>
            )}

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              {/* Total Lectures Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Lectures</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                    <div className="flex items-center mt-2 flex-wrap">
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
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Updated</span>
                    <span className="font-medium text-gray-700">
                      {formatTime(lastUpdated)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Views Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.views}</p>
                    <div className="mt-2">
                      {stats.lowViewCount > 0 ? (
                        <span className="inline-flex items-center text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          {stats.lowViewCount} low view count
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          View levels good
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
                    <span className="text-gray-500">Avg. per Lecture</span>
                    <span className="font-medium text-gray-700">
                      {stats.total > 0 ? Math.round(stats.views / stats.total) : 0}
                    </span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Top Lecture</span>
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

              {/* Duration Card */}
              <motion.div
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Avg. Duration</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatDuration(stats.avgDuration)}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        Per lecture
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3 shadow-inner">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Duration</span>
                    <span className="font-medium text-gray-700">
                      {formatDuration(stats.avgDuration * stats.total)}
                    </span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Longest</span>
                      <span
                        className="font-medium text-gray-700 break-words max-w-[120px]"
                        title={stats.topPerforming.title}
                      >
                        {formatDuration(stats.topPerforming.duration)}
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
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded-full">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {stats.total} lectures
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3 shadow-inner">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Views</span>
                    <span className="font-medium text-gray-700">{stats.views}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Avg. Duration</span>
                    <span className="font-medium text-gray-700">{formatDuration(stats.avgDuration)}</span>
                  </div>
                  {stats.topPerforming && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Top Views</span>
                      <span
                        className="font-medium text-gray-700 break-words max-w-[120px]"
                        title={stats.topPerforming.title}
                      >
                        {stats.topPerforming.views} views
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sub Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Lectures</h1>
                <p className="text-gray-600 mt-1">Manage your course lectures and track student progress</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button
                  onClick={() => navigate('/educator/lectures/create')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Lecture</span>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedLectures.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                <span className="text-blue-700">
                  {selectedLectures.size} lecture{selectedLectures.size !== 1 ? "s" : ""} selected
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
                    placeholder="Search lectures..."
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="duration">Duration</option>
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

            {/* Lectures List */}
            {filteredLectures.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search term'
                    : 'Get started by creating your first lecture'}
                </p>
                <button
                  onClick={() => navigate('/educator/lectures/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Your First Lecture
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture, index) => (
                      <motion.div
                        key={lecture.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              {lecture.thumbnail ? (
                                <img
                                  src={lecture.thumbnail}
                                  alt={lecture.title}
                                  className="w-full h-40 object-cover rounded-md mb-3"
                                />
                              ) : (
                                <div className="w-full h-40 bg-blue-100 rounded-md mb-3 flex items-center justify-center">
                                  <Video className="h-12 w-12 text-blue-600" />
                                </div>
                              )}
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{lecture.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lecture.description}</p>
                            </div>
                          </div>

                          {/* Section info */}
                          <div className="text-xs text-gray-500 mb-3">
                            Section: {lecture.sectionTitle}
                          </div>

                          {/* Rest of the grid item content */}
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{lecture.durationFormatted}</span>
                            <span className="mx-2">•</span>
                            <div className="flex items-center">
                              {getTypeIcon(lecture.type)}
                              <span className="ml-1 capitalize">{lecture.type}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{lecture.views} views</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated {lecture.lastUpdated}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleViewLecture(lecture)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="View Lecture"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">View</span>
                            </button>
                            <button
                              onClick={() => handleEditLecture(lecture.id)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                              title="Edit Lecture"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 mt-1">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLecture(lecture.id)}
                              className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-red-50 transition-colors"
                              title="Delete Lecture"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                              <span className="text-xs text-red-700 mt-1">Delete</span>
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
                                checked={selectedLectures.size === filteredLectures.length && filteredLectures.length > 0}
                                onChange={handleSelectAll}
                                className="rounded text-blue-500 focus:ring-blue-400"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecture</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredLectures.map((lecture, index) => (
                            <motion.tr
                              key={lecture.id}
                              className="hover:bg-blue-50"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedLectures.has(lecture.id)}
                                  onChange={() => handleSelectLecture(lecture.id)}
                                  className="rounded text-blue-500 focus:ring-blue-400"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {lecture.thumbnail ? (
                                    <img
                                      src={lecture.thumbnail}
                                      alt={lecture.title}
                                      className="flex-shrink-0 h-16 w-24 object-cover rounded-md"
                                    />
                                  ) : (
                                    <div className="flex-shrink-0 h-16 w-24 bg-blue-100 rounded-md flex items-center justify-center">
                                      <Video className="h-8 w-8 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lecture.title}
                                    </div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{lecture.description}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Updated: {lecture.lastUpdated}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lecture.sectionTitle}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {lecture.durationFormatted}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  {getTypeIcon(lecture.type)}
                                  <span className="ml-1 capitalize">{lecture.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {lecture.views}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleViewLecture(lecture)}
                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                                    title="View Lecture"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditLecture(lecture.id)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-blue-50 rounded-md"
                                    title="Edit Lecture"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLecture(lecture.id)}
                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                                    title="Delete Lecture"
                                  >
                                    <Trash2 className="w-4 h-4" />
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

      <Route path="/create" element={<CreateLecture />} />
      <Route path="/edit/:lectureId" element={<EditLecture />} />
      <Route path="/view/:lectureId" element={<ViewLecture />} />
      
      {/* Embedded routes for when Lectures is used within a course context */}
      <Route path="/:courseId/lectures/create" element={<CreateLecture />} />
      <Route path="/:courseId/lectures/edit/:lectureId" element={<EditLecture />} />
      <Route path="/:courseId/lectures/view/:lectureId" element={<ViewLecture />} />

      {/* Catch all - redirect to lectures list */}
      <Route path="*" element={<Navigate to="/educator/lectures" replace />} />
    </Routes>
  );
}

export default Lectures;