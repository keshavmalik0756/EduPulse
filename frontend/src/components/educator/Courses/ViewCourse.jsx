import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Play,
  FileText,
  Users,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Edit,
  Eye,
  BarChart3,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  TrendingUp,
  Award,
  ExternalLink,
  ChevronLeft,
  Send,
  MessageCircle,
  ThumbsUp,
  Loader2,
  RefreshCw,
  Layout,
  Book,
  GraduationCap,
  MessageSquare,
  BarChart,
  Search,
  Bookmark,
  BookMarked,
  Grid,
  List,
  Video,
  SlidersHorizontal,
  X,
  FileQuestion,
  StickyNote,
  Tag
} from 'lucide-react';

import courseService from '../../../services/courseService';
import sectionService from '../../../services/sectionService';
import lectureService from '../../../services/lectureService';
import noteService from '../../../services/noteService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// Helper functions
const formatDuration = (minutes) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatPrice = (price) => {
  if (!price || price === 0) return "Free";
  return `₹${price.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'N/A';
  }
};

const formatDurationSeconds = (seconds) => {
  if (!seconds) return "0m";
  
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

  return lecturesData.map(lecture => {
    const sectionTitle = lecture.section?.title || 'Untitled Section';
    const lastUpdated = formatDate(lecture.updatedAt || lecture.createdAt);
    const durationFormatted = formatDurationSeconds(lecture.duration || 0);
    
    return {
      id: lecture._id,
      title: lecture.title || 'Untitled Lecture',
      description: lecture.description || '',
      type: lecture.type || 'video',
      duration: lecture.duration || 0,
      durationFormatted,
      thumbnail: lecture.thumbnail || null,
      views: lecture.views || 0,
      sectionId: lecture.section?._id || null,
      sectionTitle,
      lastUpdated,
      lastUpdatedRaw: lecture.updatedAt || lecture.createdAt || new Date().toISOString(),
      isPreviewFree: lecture.isPreviewFree || false,
    };
  });
};

// Course Header Component
const CourseHeader = ({ course, onEditCourse }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>

      <button
        onClick={() => navigate("/educator/courses")}
        className="absolute top-3 left-3 z-20 bg-white/60 rounded-full p-2.5 sm:p-3 shadow-md hover:bg-white/90 hover:scale-105 transition-all duration-300 active:scale-95"
        aria-label="Go back to courses"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
      </button>

      <button
        onClick={onEditCourse}
        className="absolute top-3 right-3 z-20 bg-blue-600/80 hover:bg-blue-700 rounded-full p-2.5 sm:p-3 shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
        aria-label="Edit course"
      >
        <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <div className="relative w-full h-48 sm:h-60 md:h-72 lg:h-80 overflow-hidden">
        {course.banner ? (
          <motion.img
            src={course.banner}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
            <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 text-white opacity-90" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Course Stats Component
const CourseStats = ({ course }) => {
  const calculateRevenue = () => {
    if (!course) return 0;

    const finalPrice = course.finalPrice || course.price || 0;
    const totalEnrolled = course.totalEnrolled || 0;

    if (finalPrice > 0 && totalEnrolled > 0) {
      return finalPrice * totalEnrolled;
    }

    return 0;
  };

  const revenue = calculateRevenue();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6"
    >
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{course.totalEnrolled || 0}</p>
        <p className="text-sm text-gray-600">Enrolled</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-400"></div>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{course.averageRating?.toFixed(1) || 'N/A'}</p>
        <p className="text-sm text-gray-600">Rating</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-400"></div>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{course.totalReviews || 0}</p>
        <p className="text-sm text-gray-600">Reviews</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatPrice(revenue)}</p>
        <p className="text-sm text-gray-600">Revenue</p>
      </motion.div>
    </motion.div>
  );
};

// About Course Section
const AboutCourseSection = ({ course, onEditCourse }) => {
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState(null);
  const [lectureStats, setLectureStats] = useState(null);
  const [loadingLectureStats, setLoadingLectureStats] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!course || !course._id) return;

      try {
        setLoadingAnalytics(true);
        setError(null);
        const response = await courseService.getCourseAnalytics(course._id);
        if (response.success && response.data) {
          setAnalytics(response.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [course]);

  useEffect(() => {
    const fetchLectureStats = async () => {
      if (!course || !course._id) return;

      try {
        setLoadingLectureStats(true);
        const response = await lectureService.getLectureStatistics(course._id);
        if (response && response.success && response.stats) {
          setLectureStats(response.stats);
        } else {
          console.warn("Lecture statistics response is not in expected format:", response);
          setLectureStats(null);
        }
      } catch (err) {
        console.error("Error fetching lecture statistics:", err);
        setLectureStats(null);
      } finally {
        setLoadingLectureStats(false);
      }
    };

    fetchLectureStats();
  }, [course]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6"
        >
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {course.category && (
                <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
                </span>
              )}
              {course.isFeatured && (
                <span className="bg-yellow-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
                  <Play className="w-3 h-3 mr-1" /> Featured
                </span>
              )}
              {course.enrollmentStatus && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.enrollmentStatus === "open"
                      ? "bg-green-500 text-white"
                      : course.enrollmentStatus === "closed"
                        ? "bg-red-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                >
                  {course.enrollmentStatus.charAt(0).toUpperCase() +
                    course.enrollmentStatus.slice(1)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            {course.subTitle && (
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                {course.subTitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-5">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{course.instructor?.name || course.creator?.name || "Unknown Instructor"}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{course.totalEnrolled?.toLocaleString() || 0} students</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span>
                {course.averageRating?.toFixed(1) || "No ratings"} ({course.totalReviews || 0})
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Updated {formatDate(course.lastUpdated || course.updatedAt || course.createdAt)}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-5">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Course Analytics</h3>

            {loadingAnalytics ? (
              <div className="flex items-center space-x-3 text-sm text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading analytics...</span>
              </div>
            ) : error ? (
              <p className="text-red-600 text-sm">Failed to load analytics: {error}</p>
            ) : analytics ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-blue-600">Completion Rate</p>
                  <p className="font-semibold text-blue-900">
                    {analytics.completionRate ? `${analytics.completionRate}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Total Watch Time</p>
                  <p className="font-semibold text-blue-900">
                    {Math.floor((analytics.totalWatchTime || 0) / 60)}h{" "}
                    {(analytics.totalWatchTime || 0) % 60}m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Avg Time / Student</p>
                  <p className="font-semibold text-blue-900">
                    {analytics.avgTimePerStudent
                      ? `${analytics.avgTimePerStudent}m`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Last Update</p>
                  <p className="font-semibold text-blue-900">
                    {formatDate(analytics.lastUpdate)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No analytics available yet.</p>
            )}
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-5">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Content Statistics</h3>

            {loadingLectureStats ? (
              <div className="flex items-center space-x-3 text-sm text-purple-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>Loading content stats...</span>
              </div>
            ) : lectureStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-purple-600">Total Lectures</p>
                  <p className="font-semibold text-purple-900">
                    {lectureStats.totalLectures || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600">Total Duration</p>
                  <p className="font-semibold text-purple-900">
                    {formatDuration(lectureStats.totalDuration || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600">Total Size</p>
                  <p className="font-semibold text-purple-900">
                    {lectureStats.totalSize 
                      ? `${(lectureStats.totalSize / (1024 * 1024)).toFixed(1)} MB` 
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600">Avg Views</p>
                  <p className="font-semibold text-purple-900">
                    {Math.round(lectureStats.avgViewCount || 0)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No content statistics available yet.</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEditCourse}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white text-sm sm:text-base flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Course
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>

          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags.map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <motion.div
            animate={{ height: expanded ? "auto" : 80 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mb-4 text-gray-700 whitespace-pre-line"
          >
            {course.description || "No description available for this course."}
          </motion.div>

          {course.description?.length > 120 && (
            <button
              onClick={toggleExpand}
              className="text-blue-600 font-medium flex items-center hover:text-blue-700 mb-4"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          )}

          {course.prerequisites?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Prerequisites</h3>
              <ul className="space-y-2">
                {course.prerequisites.map((prereq, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{prereq}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {course.learningOutcomes?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What you'll learn</h3>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Notes Section Component 
const NotesSection = ({ course }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, lecture, course
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        // Fetch all notes for this course (both lecture notes and course notes)
        const response = await noteService.getNotesByCourse(course._id);
        if (response.success) {
          setNotes(response.notes || []);
        } else {
          setNotes([]);
          toast.error(response.message || "Failed to fetch notes.");
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error(error.message || "Error loading notes.");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    if (course && course._id) {
      fetchNotes();
    }
  }, [course]);

  const filteredNotes = useMemo(() => {
    let result = notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Filter by note type (all, lecture, course)
    if (filterBy !== 'all') {
      if (filterBy === 'lecture') {
        result = result.filter(note => note.lecture);
      } else if (filterBy === 'course') {
        result = result.filter(note => !note.lecture);
      }
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [notes, searchTerm, filterBy, sortBy]);

  const handleEditNote = (note) => {
    // Navigate to edit note page with context
    navigate(`/educator/notes/edit/${note._id}`, { state: { from: 'course' } });
  };

  const handleDeleteNote = async (note) => {
    if (!window.confirm("Delete this note permanently?")) return;
    
    try {
      const res = await noteService.deleteNote(note._id);
      if (res.success) {
        toast.success("Note deleted successfully");
        // Remove note from state immediately
        setNotes(prev => prev.filter(n => n._id !== note._id));
      } else {
        toast.error(res.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(error.message || "Error deleting note");
    }
  };

  const handleViewNote = (note) => {
    // Navigate to view note page with context
    navigate(`/educator/notes/view/${note._id}`, { state: { from: 'course' } });
  };

  const handleAddNote = () => {
    // Navigate to create note page with course context
    navigate('/educator/notes/create', { state: { courseId: course._id, courseTitle: course.title, noteType: 'course' } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Notes Header - Responsive */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Notes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {notes.length} notes • Organized by sections
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNote}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-teal-700 flex items-center shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </motion.button>
      </div>

      {/* Filters and Search - Responsive with adjusted filter sizes */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Notes</option>
            <option value="lecture">Lecture Notes</option>
            <option value="course">Course Notes</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Notes Grid - Responsive with Icons */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first note'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleViewNote(note)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View Note"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditNote(note)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Note"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <BookOpen className="w-3 h-3 mr-1" />
                  <span>{note.lecture ? `Lecture: ${note.lecture.title}` : 'Course Note'}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Tag className="w-3 h-3 mr-1" />
                  <span>{note.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags && note.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Quiz Section Component
const QuizSection = ({ course }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // TODO: Implement quizService when backend API is available
  // Currently using mock data as placeholder
  const mockQuizzes = [
    {
      id: 1,
      title: "React Hooks Quiz",
      description: "Test your knowledge of React Hooks fundamentals",
      questions: 10,
      duration: 15,
      attempts: 24,
      averageScore: 78,
      status: "published",
      section: "Getting Started"
    },
    {
      id: 2,
      title: "State Management Quiz",
      description: "Assess your understanding of state management concepts",
      questions: 8,
      duration: 20,
      attempts: 18,
      averageScore: 82,
      status: "published",
      section: "Advanced Concepts"
    },
    {
      id: 3,
      title: "Performance Optimization",
      description: "Check your knowledge of React performance optimization techniques",
      questions: 12,
      duration: 25,
      attempts: 9,
      averageScore: 65,
      status: "draft",
      section: "Advanced Concepts"
    }
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual quiz service when available
        // For now, we'll use mock data as placeholder
        setQuizzes(mockQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        // Fallback to mock data on error
        setQuizzes(mockQuizzes);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [course]);

  const handleCreateQuiz = () => {
    setShowCreateModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setShowCreateModal(true);
  };

  const handleViewResults = (quiz) => {
    // TODO: Implement view results functionality
    console.log("View results for quiz:", quiz);
  };

  const handleDeleteQuiz = (quiz) => {
    // TODO: Implement delete functionality
    console.log("Delete quiz:", quiz);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Quiz Header - Responsive */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {quizzes.length} quizzes • Track student progress
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateQuiz}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 flex items-center shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Quiz
        </motion.button>
      </div>

      {/* Quiz Statistics - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <FileQuestion className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Quizzes</p>
              <p className="text-2xl font-bold text-blue-600">{quizzes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Total Attempts</p>
              <p className="text-2xl font-bold text-green-600">
                {quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">Avg Score</p>
              <p className="text-2xl font-bold text-yellow-600">
                {quizzes.length > 0 ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.averageScore, 0) / quizzes.length) : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Published</p>
              <p className="text-2xl font-bold text-purple-600">
                {quizzes.filter(q => q.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List - Responsive with Icons */}
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes created yet</h3>
          <p className="text-gray-500 mb-4">Create your first quiz to assess student learning</p>
          <button
            onClick={handleCreateQuiz}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quiz.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileQuestion className="w-4 h-4 mr-1" />
                      <span>{quiz.questions} questions</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{quiz.duration} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{quiz.attempts} attempts</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Avg: {quiz.averageScore}%</span>
                    </div>
                    <div className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-1" />
                      <span>{quiz.section}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons with Icons - Responsive */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditQuiz(quiz)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    title="Edit Quiz"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewResults(quiz)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                    title="View Results"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Results</span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Quiz Modal - Responsive */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {activeQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setActiveQuiz(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Quiz Form - Responsive */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz description"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Getting Started</option>
                    <option>Advanced Concepts</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setActiveQuiz(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {activeQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Curriculum Section - Updated with Notes and Quiz tabs
const CurriculumSection = ({ course, refreshParent }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [expandedSections, setExpandedSections] = useState({});
  
  // Lecture states for educator view
  const [lectures, setLectures] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    avgDuration: 0,
    topPerforming: null,
    lowViewCount: 0
  });

  // Fetch sections data
  const fetchCurriculum = async () => {
    if (!course?._id) return setError("Invalid Course ID");
    try {
      setLoading(true);
      const response = await sectionService.getSectionsByCourse(course._id);
      if (response.success) {
        setSections(response.sections || []);
        const initialExpanded = {};
        (response.sections || []).forEach(section => {
          initialExpanded[section._id] = true;
        });
        setExpandedSections(initialExpanded);
      } else {
        throw new Error(response.message || "Failed to fetch curriculum");
      }
    } catch (err) {
      console.error("❌ Curriculum load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lectures for educator view
  const fetchLectures = useCallback(async () => {
    if (!course?._id) return;
    
    try {
      const response = await lectureService.getLecturesByCourse(course._id);
      const transformedLectures = transformLectures(response.lectures || []);
      
      setLectures(transformedLectures);
      
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
    } catch (err) {
      console.error("Error fetching lectures:", err);
    }
  }, [course?._id]);

  useEffect(() => {
    if (course?._id) {
      fetchCurriculum();
      fetchLectures();
    }
  }, [course, fetchLectures]);

  const curriculumStats = useMemo(() => {
    if (!sections.length) return { totalLectures: 0, totalDuration: 0 };
    let totalLectures = 0,
      totalDuration = 0;
    sections.forEach((sec) => {
      totalLectures += sec.lessons?.length || 0;
      totalDuration += sec.lessons?.reduce(
        (sum, lec) => sum + (lec.duration || 0),
        0
      );
    });
    return { totalLectures, totalDuration };
  }, [sections]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    
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

  const refreshCurriculum = () => {
    fetchCurriculum();
    fetchLectures();
  };

  const handleCreateLecture = () => {
    if (!course?._id) {
      return;
    }
    navigate(`/educator/courses/${course._id}/lectures/create`);
  };

  const handleCreateLectureInSection = (sectionId) => {
    if (!course?._id || !sectionId) {
      return;
    }
    // Find the section to get its name
    const section = sections.find(s => s._id === sectionId);
    const sectionName = section ? section.title : '';
    
    navigate(`/educator/courses/${course._id}/lectures/create`, { 
      state: { 
        courseId: course._id,
        sectionId: sectionId,
        sectionName: sectionName
      } 
    });
  };

  const handleCreateSection = () => {
    if (!course?._id) {
      return;
    }
    navigate(`/educator/courses/${course._id}/sections/create`);
  };

  const handleEditSection = (sectionId) => {
    if (!course?._id || !sectionId) {
      return;
    }
    navigate(`/educator/courses/${course._id}/sections/edit/${sectionId}`);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!sectionId) return;
    
    if (!window.confirm("Are you sure you want to delete this section? This will not delete the lectures within it.")) {
      return;
    }
    
    try {
      const response = await sectionService.deleteSection(sectionId);
      if (response.success) {
        toast.success("Section deleted successfully!");
        refreshCurriculum();
      } else {
        throw new Error(response.message || "Failed to delete section");
      }
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error(err.message || "Failed to delete section");
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return;
    }
    
    try {
      const response = await lectureService.deleteLecture(lectureId);
      if (response.success) {
        fetchLectures();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Failed to delete lecture:", err);
    }
  };

  const filteredLectures = useMemo(() => {
    let result = [...lectures];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lecture =>
        lecture.title.toLowerCase().includes(term) ||
        lecture.description.toLowerCase().includes(term) ||
        lecture.sectionTitle.toLowerCase().includes(term)
      );
    }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          {activeTab === "lectures" && (
            <p className="text-sm text-gray-600">
              {curriculumStats.totalLectures} Lectures •{" "}
              {formatDuration(curriculumStats.totalDuration)}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshCurriculum}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center"
            title="Refresh curriculum"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </motion.button>

          {activeTab === "lectures" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateLecture}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Lecture
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab Navigation - Updated with Notes and Quiz tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {["lectures", "sections", "notes", "quiz", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Loading content...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-8 text-center text-red-600">
          <AlertCircle className="w-10 h-10 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      )}

      {/* Lectures Tab Content */}
      {!loading && !error && activeTab === "lectures" && (
        <div className="mt-4">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
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
                </div>
                <div className="rounded-full bg-blue-100 p-3 shadow-inner">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.views.toLocaleString()}</p>
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
            </motion.div>

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
            </motion.div>

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
            </motion.div>
          </div>

          {/* Filters and Search */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
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
              </div>
            )}
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
                onClick={handleCreateLecture}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Your First Lecture
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
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

                        <div className="text-xs text-gray-500 mb-3">
                          Section: {lecture.sectionTitle}
                        </div>

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
                            onClick={() => navigate(`/educator/courses/${course._id}/lectures/view/${lecture.id}`)}
                            className="flex flex-col items-center justify-center p-2 bg-white rounded-md hover:bg-blue-50 transition-colors"
                            title="View Lecture"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                            <span className="text-xs text-gray-700 mt-1">View</span>
                          </button>
                          <button
                            onClick={() => navigate(`/educator/courses/${course._id}/lectures/edit/${lecture.id}`)}
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
                <motion.div
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
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
                                  onClick={() => navigate(`/educator/courses/${course._id}/lectures/view/${lecture.id}`)}
                                  className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                                  title="View Lecture"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => navigate(`/educator/courses/${course._id}/lectures/edit/${lecture.id}`)}
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
      )}

      {/* Sections Tab Content */}
      {!loading && !error && activeTab === "sections" && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search sections..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateSection}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Section
              </motion.button>
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No sections yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first section to organize your course content.
              </p>
              <button
                onClick={handleCreateSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Create Section
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sections
                .filter(section => 
                  section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  section.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((section) => (
                  <motion.div
                    key={section._id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateLectureInSection(section._id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                          title="Create lecture in this section"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Lecture
                        </button>
                        <button
                          onClick={() => handleEditSection(section._id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Section Content */}
                    <div className="p-4">
                      {section.lessons && section.lessons.length > 0 ? (
                        <div className="space-y-3">
                          {section.lessons.map((lecture) => (
                            <div key={lecture._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
                              <div className="flex items-center">
                                {lecture.thumbnail ? (
                                  <img
                                    src={lecture.thumbnail}
                                    alt={lecture.title}
                                    className="flex-shrink-0 h-12 w-16 object-cover rounded-md mr-3"
                                  />
                                ) : (
                                  <div className="flex-shrink-0 h-12 w-16 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                                    <Video className="h-6 w-6 text-blue-600" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-900">{lecture.title}</h4>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{formatDuration(lecture.duration)}</span>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center">
                                      {getTypeIcon(lecture.type)}
                                      <span className="ml-1 capitalize">{lecture.type}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/educator/courses/${course._id}/lectures/edit/${lecture._id}`)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                  title="Edit lecture"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLecture(lecture._id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                                  title="Delete lecture"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-3">No lectures in this section yet</p>
                          <button
                            onClick={() => handleCreateLectureInSection(section._id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center mx-auto"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create First Lecture
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab Content */}
      {!loading && !error && activeTab === "notes" && (
        <NotesSection course={course} />
      )}

      {/* Quiz Tab Content */}
      {!loading && !error && activeTab === "quiz" && (
        <QuizSection course={course} />
      )}

      {/* Analytics Tab Content */}
      {!loading && !error && activeTab === "analytics" && (
        <div className="mt-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Course Analytics
            </h3>
            <p className="text-gray-500 mb-4">
              Detailed analytics and insights about your course performance will appear here.
            </p>
            <p className="text-gray-400 text-sm">
              Track student progress, engagement, and completion rates.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 text-center text-gray-600">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshCurriculum}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// Students Section Component
const StudentsSection = ({ course }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const courseId = course?._id;

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const response = await courseService.getEnrolledStudents(courseId);
      const studentsData =
        response?.data?.students ||
        response?.students ||
        response?.data ||
        [];

      const validStudents = Array.isArray(studentsData) ? studentsData : [];
      setStudents(validStudents);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("❌ Error fetching enrolled students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let timeout;
    if (courseId) {
      timeout = setTimeout(fetchStudents, 250);
    }
    return () => clearTimeout(timeout);
  }, [courseId, fetchStudents]);

  const filteredAndSortedStudents = useMemo(() => {
    const array = Array.isArray(students) ? [...students] : [];
    let result = array;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
      );
    }

    if (filter === "high-progress") {
      result = result.filter((s) => (s.progress ?? 0) >= 70);
    } else if (filter === "low-progress") {
      result = result.filter((s) => (s.progress ?? 0) <= 30);
    }

    switch (sortOrder) {
      case "name":
        result.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case "progress":
        result.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
        break;
      case "date":
        result.sort(
          (a, b) => new Date(b.enrolledDate) - new Date(a.enrolledDate)
        );
        break;
      default:
        break;
    }

    return result;
  }, [students, searchQuery, filter, sortOrder]);

  const getProgressColor = (p = 0) => {
    if (p >= 80) return "bg-green-600";
    if (p >= 50) return "bg-blue-600";
    if (p >= 30) return "bg-yellow-500";
    return "bg-red-600";
  };

  const handleViewStudent = (student) => {
    // TODO: Implement view student functionality
    console.log("View student:", student);
  };

  const handleMessageStudent = (student) => {
    // TODO: Implement message student functionality
    console.log("Message student:", student);
  };

  const handleExportCSV = () => {
    // TODO: Implement export CSV functionality
    console.log("Export CSV");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10"
    >
      {/* Students Header - Responsive */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Enrolled Students
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {students.length || 0}
          </span>
        </h2>
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3">
          <span>
            {course.totalEnrolled?.toLocaleString() || 0} total enrollments
          </span>
          {lastRefreshed && (
            <span className="text-xs text-gray-400">
              Last updated: {lastRefreshed.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Students Filters - Responsive with managed search bar and button sizes */}
      <div className="flex flex-col lg:flex-row flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Students</option>
              <option value="high-progress">High Progress (70%+)</option>
              <option value="low-progress">Low Progress (≤30%)</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="date">Sort by Enroll Date</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStudents}
            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> 
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
            title="Export CSV"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Export CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
            title="Message All"
          >
            <Send className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Message All</span>
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-600" />
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <User className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-lg font-medium">No enrolled students found.</p>
          <p className="text-sm text-gray-400">
            Once students enroll, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-6 text-center text-gray-500 italic"
                  >
                    No students match your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((s) => (
                  <motion.tr
                    key={s._id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {s.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {s.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(
                              s.progress
                            )}`}
                            style={{ width: `${s.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {s.progress ?? 0}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.enrolledDate
                        ? new Date(s.enrolledDate).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewStudent(s)}
                          className="flex items-center text-blue-600 hover:text-blue-900"
                          title="View Student"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button 
                          onClick={() => handleMessageStudent(s)}
                          className="flex items-center text-gray-600 hover:text-gray-900"
                          title="Message Student"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Message</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

// Reviews Section Component
const ReviewsSection = ({ course }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourseReviews(course._id);
        if (response.success && response.data?.reviews?.length > 0) {
          setReviews(response.data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("❌ Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (course && course._id) fetchReviews();
  }, [course]);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => (dist[r.rating] = (dist[r.rating] || 0) + 1));
    return dist;
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    if (filter !== "all") result = result.filter((r) => r.rating == filter);

    switch (sortOrder) {
      case "recent":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "top-rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return result;
  }, [reviews, filter, sortOrder]);

  const getSentiment = (rating) => {
    if (rating >= 4) return "Positive";
    if (rating === 3) return "Neutral";
    return "Negative";
  };

  const getSentimentEmoji = (rating) => {
    if (rating >= 4) return "😊";
    if (rating === 3) return "😐";
    return "😞";
  };

  const handleReplyToReview = (review) => {
    // TODO: Implement reply functionality
    console.log("Reply to review:", review);
  };

  const handleReplyToAll = () => {
    // TODO: Implement reply to all functionality
    console.log("Reply to all reviews");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10"
    >
      {/* Reviews Header - Responsive */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Reviews</h2>
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
          <span className="text-xl font-bold text-gray-900">
            {course.averageRating?.toFixed(1) || "N/A"}
          </span>
          <span className="text-gray-600 ml-1">
            ({course.totalReviews || 0} reviews)
          </span>
        </div>
      </div>

      {/* Rating Distribution - Responsive */}
      {reviews.length > 0 && (
        <div className="mb-6">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600 w-4">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current mx-1" />
              <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: `${(ratingDistribution[rating] /
                        (course.totalReviews || 1)) *
                      100
                      }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8 text-right ml-2">
                {ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Filters - Responsive */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReplyToAll}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          title="Reply to Reviews"
        >
          <Send className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Reply to Reviews</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-600" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            No reviews yet for this course.
          </p>
          <p className="text-gray-400 text-sm">
            Encourage students to leave feedback after completing lessons.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {filter !== "all"
              ? `Showing ${filter}-star Reviews`
              : "All Recent Reviews"}
          </h3>

          <div className="space-y-5">
            {filteredAndSortedReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#f9fafb",
                }}
                className="p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.name || "Anonymous"}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {getSentimentEmoji(review.rating)}{" "}
                        {getSentiment(review.rating)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>

                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => handleReplyToReview(review)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    title="Reply to Review"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Discussion Section Component
const DiscussionSection = ({ course }) => {
  const { user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        const res = await courseService.getCourseDiscussions(course._id);
        if (res.success) {
          const questionsData = res.data?.questions || res.questions || res.data || [];
          setQuestions(Array.isArray(questionsData) ? questionsData : []);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching discussions:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    if (course?._id) fetchDiscussions();
  }, [course?._id]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      const res = await courseService.createDiscussionQuestion(course._id, {
        content: newQuestion,
      });
      if (res.success) {
        setQuestions(prevQuestions => {
          const newQuestionData = res.data?.question || res.data || {};
          return [newQuestionData, ...(Array.isArray(prevQuestions) ? prevQuestions : [])];
        });
        setNewQuestion("");
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnswer = async (questionId) => {
    const answerText = newAnswers[questionId];
    if (!answerText?.trim()) return;
    setSubmitting(true);
    try {
      const res = await courseService.addDiscussionAnswer(questionId, {
        content: answerText,
      });
      if (res.success) {
        setQuestions((prev) =>
          Array.isArray(prev) ? prev.map((q) =>
            q._id === questionId
              ? { ...q, answers: [...(q.answers || []), res.data] }
              : q
          ) : []
        );
        setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleLikeAnswer = (answer) => {
    // TODO: Implement like functionality
    console.log("Like answer:", answer);
  };

  const displayed = useMemo(() => {
    const questionsArray = Array.isArray(questions) ? questions : [];
    let data = [...questionsArray];
    if (filter === "resolved") data = data.filter((q) => q.isResolved);
    if (filter === "unresolved") data = data.filter((q) => !q.isResolved);
    if (search)
      data = data.filter((q) =>
        q.content?.toLowerCase().includes(search.toLowerCase())
      );
    if (sortBy === "popular")
      data.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
    if (sortBy === "newest")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return data;
  }, [questions, filter, sortBy, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mt-6"
    >
      {/* Discussion Header - Responsive */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">💬 Course Discussion</h2>
        <div className="text-gray-500 text-sm">
          {questions.length} Questions •{" "}
          {questions.reduce((a, q) => a + (q.answers?.length || 0), 0)} Answers
        </div>
      </div>

      {/* Discussion Filters - Responsive */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 border rounded-lg p-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="resolved">Resolved</option>
          <option value="unresolved">Unresolved</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Answers</option>
        </select>
      </div>

      {/* Ask Question Form - Responsive */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Ask a Question
        </h3>
        <form onSubmit={handleSubmitQuestion}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask something about this course..."
            maxLength={500}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <p className="text-sm text-gray-500">{newQuestion.length}/500</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Send className="w-4 h-4 mr-1" />
              {submitting ? "Posting..." : "Post Question"}
            </motion.button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin border-b-2 border-blue-600 rounded-full h-8 w-8" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <MessageCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
          No discussions found.
        </div>
      ) : (
        <div className="space-y-6">
          {displayed.map((q) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {q.user?.name || "Anonymous"}
                  </h4>
                  <p className="text-gray-700 mt-2">{q.content}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span>{formatDate(q.createdAt)}</span>
                    <span>{q.answers?.length || 0} Answers</span>
                    {q.isResolved ? (
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Resolved
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> Unresolved
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleExpand(q._id)}
                className="text-blue-600 text-sm mt-3 hover:underline flex items-center"
              >
                {expanded[q._id] ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Hide Answers
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> View Answers (
                    {q.answers?.length || 0})
                  </>
                )}
              </button>

              {expanded[q._id] && (
                <div className="mt-4 space-y-3 border-t pt-3">
                  {(!q.answers || q.answers.length === 0) ? (
                    <p className="text-gray-500 text-sm italic">No answers yet.</p>
                  ) : (
                    q.answers.map((ans) => (
                      <div
                        key={ans._id}
                        className={`p-3 border rounded-md ${ans.isBestAnswer
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        {ans.isBestAnswer && (
                          <div className="flex items-center text-green-700 text-xs font-semibold mb-1">
                            <Award className="w-3 h-3 mr-1" /> Best Answer
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {ans.user?.name || "Anonymous"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(ans.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{ans.content}</p>
                        <div className="flex justify-between mt-2 text-sm">
                          <button 
                            onClick={() => handleLikeAnswer(ans)}
                            className="flex items-center text-gray-600 hover:text-blue-600"
                            title="Like Answer"
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Like ({ans.likes || 0})
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Main ViewCourse Component
function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        setCourse(null);

        const response = await courseService.getCourseById(courseId);
        if (response.success) {
          setCourse(response.course);
        } else {
          setError(response.message || 'Failed to load course details');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, location]);

  const handleEditCourse = () => {
    navigate(`/educator/courses/edit/${course._id}`);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setCourse(null);

    const fetchCourse = async () => {
      try {
        const response = await courseService.getCourseById(courseId);
        if (response.success) {
          setCourse(response.course);
        } else {
          setError(response.message || 'Failed to load course details');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/educator/courses')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Back to Courses
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/educator/courses')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Back to Courses
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseHeader
          course={course}
          onEditCourse={handleEditCourse}
        />

        <CourseStats course={course} />

        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Layout className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'curriculum'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Book className="w-4 h-4 mr-2" />
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Students
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('qna')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'qna'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Q&A
            </button>
          </nav>
        </div>

        <div className="space-y-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AboutCourseSection
                course={course}
                onEditCourse={handleEditCourse}
              />
            </motion.div>
          )}

          {activeTab === 'curriculum' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CurriculumSection
                course={course}
                refreshParent={() => {}}
              />
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StudentsSection course={course} />
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewsSection course={course} />
            </motion.div>
          )}

          {activeTab === 'qna' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DiscussionSection course={course} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;