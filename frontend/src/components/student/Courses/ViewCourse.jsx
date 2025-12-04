import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Layout,
  Book,
  GraduationCap,
  MessageSquare,
  BarChart,
  Search,
  Bookmark,
  BookMarked,
  ChevronLeft,
  Send,
  MessageCircle,
  ThumbsUp,
  Loader2,
  RefreshCw,
  Download,
  TrendingUp,
  Award,
  Eye,
  ExternalLink,
  Grid, List, Filter, Target, BarChart3,
  X, SlidersHorizontal, Upload,
  Video, BookA, CreditCard, UserCheck,
  MoreHorizontal, Pause, Archive, Copy, Share2,
  Zap, AwardIcon, Globe, Lock, Unlock, Settings,
  FileQuestion, StickyNote, ShoppingCart,
  // Additional imports for enhanced curriculum section
  BookOpenIcon, FileQuestionIcon, BarChartIcon,
  Tag, // Added missing Tag import
  // Removed Plus, Edit, Trash2 imports as requested
} from 'lucide-react';
import courseService from '../../../services/courseService';
import lectureService from '../../../services/lectureService';
import sectionService from '../../../services/sectionService';
import noteService from '../../../services/noteService';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Notes from '../../student/Notes/Notes';

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

// Course Header Component

const CourseHeader = ({ course }) => {

  const navigate = useNavigate();



  return (

    <motion.div

      className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-800 to-black"

      initial={{ opacity: 0, y: 40 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.6, ease: "easeOut" }}

    >

      {/* Back Button */}

      <button

        onClick={() => navigate("/courses")}

        className="absolute top-3 left-3 z-20 bg-white/60 rounded-full p-2.5 sm:p-3 shadow-md hover:bg-white/90 hover:scale-105 transition-all duration-300 active:scale-95"

        aria-label="Go back to courses"

      >

        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />

      </button>



      {/* Banner */}

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

// About Course Section

const AboutCourseSection = ({ course, userEnrolled, onEnroll, enrolling, handleUnenroll }) => {

  const [expanded, setExpanded] = useState(false);

  const [lectureStats, setLectureStats] = useState(null);

  const [loadingLectureStats, setLoadingLectureStats] = useState(false);



  const toggleExpand = () => setExpanded(!expanded);



  // Fetch lecture statistics

  useEffect(() => {

    const fetchLectureStats = async () => {

      if (!course || !course._id) return;



      try {

        setLoadingLectureStats(true);

        const response = await lectureService.getLectureStatistics(course._id);

        // Add safety check for response

        if (response && response.success && response.stats) {

          setLectureStats(response.stats);

        } else {

          // Handle case where response is not successful or doesn't contain stats

          console.warn("Lecture statistics response is not in expected format:", response);

          setLectureStats(null);

        }

      } catch (err) {

        console.error("Error fetching lecture statistics:", err);

        // Set lectureStats to null on error to show appropriate UI

        setLectureStats(null);

      } finally {

        setLoadingLectureStats(false);

      }

    };



    fetchLectureStats();

  }, [course]);



  // Format duration in seconds to human readable format

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



  // Calculate pricing information

  const originalPrice = course.originalPrice || course.price || 0;

  const finalPrice = course.finalPrice || course.price || 0;

  const discountPercentage = course.discountPercentage ||

    (originalPrice > 0 && originalPrice > finalPrice ?

      Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);



  const hasDiscount = discountPercentage > 0 && originalPrice > finalPrice;



  return (

    <motion.div

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.5 }}

      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-8"

    >

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT — Course Info */}

        <motion.div

          initial={{ opacity: 0, x: -20 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ duration: 0.6 }}

          className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6"

        >

          {/* Category & Meta */}

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



          {/* Instructor + Stats */}

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



          {/* Enrollment Section - Fully Responsive */}

          <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 md:p-5 mb-5 border-2 border-blue-200">

            <h3 className="text-xs sm:text-sm md:text-base font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center">
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Enrollment Status
            </h3>

            {userEnrolled ? (

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 sm:space-y-3"
              >

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-green-100 rounded-lg border border-green-300">

                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm md:text-base text-green-900">✅ Enrolled</p>
                    <p className="text-xs sm:text-sm text-green-700">You have access to all course content</p>
                  </div>

                </div>

                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUnenroll}
                    disabled={enrolling}
                    className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                        <span className="hidden sm:inline">Unenrolling...</span>
                        <span className="sm:hidden">Unenroll...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Unenroll</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/course/${course._id}/curriculum`)}
                    className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Continue Learning</span>
                    <span className="sm:hidden">Learn</span>
                  </motion.button>

                </div>

              </motion.div>

            ) : (

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4"
              >

                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 p-2 sm:p-3 md:p-4 bg-white rounded-lg border border-gray-200">

                  <div className="min-w-0">

                    {hasDiscount ? (

                      <div className="flex flex-col xs:flex-row xs:items-baseline gap-1 xs:gap-2">

                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">₹{finalPrice}</span>

                        <span className="text-xs sm:text-sm text-gray-500 line-through">₹{originalPrice}</span>

                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded w-fit">Save {discountPercentage}%</span>

                      </div>

                    ) : (

                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600 block">

                        {originalPrice === 0 ? '🎁 Free' : `₹${originalPrice}`}

                      </span>

                    )}

                  </div>

                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap ${course.enrollmentStatus === 'open'

                      ? 'bg-green-100 text-green-800'

                      : 'bg-red-100 text-red-800'

                      }`}

                  >

                    {course.enrollmentStatus === 'open' ? '✅ Open' : '🔒 Closed'}

                  </motion.span>

                </div>

                <motion.button
                  whileHover={{ scale: course.enrollmentStatus === 'open' ? 1.02 : 1 }}
                  whileTap={{ scale: course.enrollmentStatus === 'open' ? 0.98 : 1 }}
                  onClick={onEnroll}
                  disabled={enrolling || course.enrollmentStatus !== 'open'}
                  className={`w-full py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 rounded-lg font-bold text-white text-xs sm:text-sm md:text-base transition-all flex items-center justify-center gap-1 sm:gap-2 ${course.enrollmentStatus === 'open'

                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'

                      : 'bg-gray-400 cursor-not-allowed opacity-60'

                      }`}

                >

                  {enrolling ? (

                    <>

                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />

                      <span className="hidden sm:inline">Enrolling...</span>
                      <span className="sm:hidden">Enroll...</span>

                    </>

                  ) : course.enrollmentStatus === 'open' ? (

                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">Enroll Now</span>
                      <span className="sm:hidden">Enroll</span>
                    </>

                  ) : (

                    <>
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">Enrollment {course.enrollmentStatus}</span>
                      <span className="sm:hidden">{course.enrollmentStatus}</span>
                    </>

                  )}

                </motion.button>

              </motion.div>

            )}

          </motion.div>



          {/* 🎬 Lecture Duration Statistics */}

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

        </motion.div>



        {/* RIGHT — About + Prerequisites + Learning Outcomes */}

        <motion.div

          initial={{ opacity: 0, x: 20 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ duration: 0.6 }}

          className="flex-1"

        >

          <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>



          {/* Tags */}

          {course.tags?.length > 0 && (

            <div className="flex flex-wrap gap-2 mb-4">

              {course.tags.map((tag, i) => (

                <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">

                  {tag}

                </span>

              ))}

            </div>

          )}



          {/* Description */}

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



          {/* Prerequisites */}

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



          {/* Learning Outcomes */}

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

}

// Add these helper functions before the CurriculumSection component

const transformLecturesForCurriculum = (lecturesData = [], userEnrolled, course) => {

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

    ...lecture,

    id: lecture._id,

    durationFormatted: formatDurationForCurriculum(lecture.duration || 0),

    sectionTitle: lecture.section?.title || lecture.sectionTitle || 'Untitled Section',

    isCompleted: userEnrolled && course.userProgress?.completedLectures?.includes(lecture._id)

  }));

};

// Helper function to format duration for curriculum section

const formatDurationForCurriculum = (seconds) => {

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

const CurriculumSection = ({ course, userEnrolled }) => {

  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [expandedSections, setExpandedSections] = useState({}); // Track which sections are expanded

  const [lastAccessedLecture, setLastAccessedLecture] = useState(null);

  const [activeTab, setActiveTab] = useState("lectures");



  // Lecture states

  const [lectures, setLectures] = useState([]);
  const [sections, setSections] = useState([]);
  const [courseNotes, setCourseNotes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [searchTerm, setSearchTerm] = useState('');

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'duration', 'alphabetical'

  const [showFilters, setShowFilters] = useState(false);

  const [stats, setStats] = useState({

    total: 0,

    completed: 0,

    avgDuration: 0,

    progress: 0

  });



  // Fetch curriculum data (lectures, sections, notes)

  useEffect(() => {

    const fetchCurriculumData = async () => {

      if (!course?._id) return;



      try {

        setLoading(true);

        
        // Fetch lectures
        const lectureResponse = await lectureService.getLecturesByCourse(course._id);
        
        // Fetch sections
        const sectionResponse = await sectionService.getSectionsByCourse(course._id);
        
        // Fetch course notes
        const noteResponse = await noteService.getNotesByCourse(course._id);



        // Transform lectures data to match frontend expectations

        const transformedLectures = transformLecturesForCurriculum(lectureResponse.lectures || [], userEnrolled, course);



        setLectures(transformedLectures);
        setSections(sectionResponse.sections || []);
        setCourseNotes(noteResponse.notes || []);



        // Calculate statistics

        const total = transformedLectures.length;

        const completed = transformedLectures.filter(l => l.isCompleted).length;

        const totalDuration = transformedLectures.reduce((sum, l) => sum + (l.duration || 0), 0);

        const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;



        setStats({

          total,

          completed,

          totalDuration,

          avgDuration,

          progress

        });



        // Initialize all sections as expanded by default

        const initialExpanded = {};

        if (sectionResponse.sections) {

          sectionResponse.sections.forEach(section => {

            initialExpanded[section._id] = true;

          });

          setExpandedSections(initialExpanded);

        }



        // Find last accessed lecture

        if (userEnrolled && course.userProgress) {

          setLastAccessedLecture(course.userProgress.lastAccessedLecture);

        }

      } catch (err) {

        console.error("Error fetching curriculum data:", err);

        toast.error("Failed to load curriculum data");

      } finally {

        setLoading(false);

      }

    };



    fetchCurriculumData();

  }, [course, userEnrolled]);



  // Compute total lectures + duration

  const curriculumStats = useMemo(() => {

    if (!course?.sections?.length) return { totalLectures: 0, totalDuration: 0 };

    let totalLectures = 0,

      totalDuration = 0;

    course.sections.forEach((sec) => {

      totalLectures += sec.lessons?.length || 0;

      totalDuration += sec.lessons?.reduce(

        (sum, lec) => sum + (lec.duration || 0),

        0

      );

    });

    return { totalLectures, totalDuration };

  }, [course]);



  // Format duration in seconds to human readable format

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



  // Toggle section expand/collapse

  const toggleSection = (sectionId) => {

    setExpandedSections(prev => ({

      ...prev,

      [sectionId]: !prev[sectionId]

    }));

  };



  // Calculate section progress

  const calculateSectionProgress = (section) => {

    if (!userEnrolled || !section.lessons) return 0;

    const completedLessons = section.lessons.filter(lesson =>

      course.userProgress?.completedLectures?.includes(lesson._id)

    ).length;

    return Math.round((completedLessons / section.lessons.length) * 100);

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

        // Since we don't have date information in this context, we'll sort by title

        result.sort((a, b) => a.title.localeCompare(b.title));

        break;

      case 'oldest':

        // Since we don't have date information in this context, we'll sort by title reversed

        result.sort((a, b) => b.title.localeCompare(a.title));

        break;

      case 'duration':

        result.sort((a, b) => b.duration - a.duration);

        break;

      case 'alphabetical':

        result.sort((a, b) => a.title.localeCompare(b.title));

        break;

      case 'completed':

        result.sort((a, b) => (b.isCompleted ? 1 : 0) - (a.isCompleted ? 1 : 0));

        break;

      default:

        result.sort((a, b) => a.title.localeCompare(b.title));

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



  // Enhanced Grid Item Component - Fully Responsive

  const GridItem = ({ lecture, index }) => (

    <motion.div

      key={lecture.id}

      className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"

      whileHover={{ y: -5 }}

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}

    >

      <div className="relative">

        {lecture.thumbnail ? (

          <img

            src={lecture.thumbnail}

            alt={lecture.title}

            className="w-full h-32 sm:h-40 object-cover"

          />

        ) : (

          <div className="w-full h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">

            <Video className="h-8 sm:h-12 w-8 sm:w-12 text-white" />

          </div>

        )}

        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-black bg-opacity-50 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">

          {getTypeIcon(lecture.type)}

          <span className="capitalize hidden xs:inline">{lecture.type}</span>

        </div>

        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 bg-black bg-opacity-50 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">

          {lecture.durationFormatted}

        </div>

        {lecture.isCompleted && (

          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">

            <CheckCircle className="w-3 h-3" />

            <span className="hidden xs:inline">Completed</span>

          </div>

        )}

      </div>

      <div className="p-3 sm:p-4 md:p-5">

        <div className="flex justify-between items-start mb-2">

          <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{lecture.title}</h3>

        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{lecture.description}</p>

        <div className="flex items-center text-xs text-gray-500 mb-3 sm:mb-4">

          <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs truncate">{lecture.sectionTitle}</span>

        </div>

        <button

          onClick={() => navigate(`/course/${course._id}/lecture/${lecture.id}`)}

          className={`w-full py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${lecture.isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'

            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'

            }`}

        >

          {lecture.isCompleted ? (

            <>

              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />

              <span className="hidden sm:inline">Review Lecture</span>

              <span className="sm:hidden">Review</span>

            </>

          ) : (

            <>

              <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />

              <span className="hidden sm:inline">Start Lecture</span>

              <span className="sm:hidden">Start</span>

            </>

          )}

        </button>

      </div>

    </motion.div>

  );



  // Enhanced List Item Component - Tabular Format - Fully Responsive
  const ListItem = ({ lecture, index }) => (
    <motion.tr
      key={lecture.id}
      className="hover:bg-blue-50 transition-colors duration-200 border-b border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
    >
      {/* Lecture Title & Description */}
      <td className="px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {getTypeIcon(lecture.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
              {lecture.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 sm:mt-1 hidden xs:block">
              {lecture.description || "No description available"}
            </p>
          </div>
        </div>
      </td>

      {/* Section */}
      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate">
          {lecture.sectionTitle}
        </span>
      </td>

      {/* Duration */}
      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400 flex-shrink-0" />
          {lecture.durationFormatted}
        </div>
      </td>

      {/* Type */}
      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          {getTypeIcon(lecture.type)}
          <span className="ml-1 capitalize hidden xs:inline">{lecture.type}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden xs:table-cell">
        {lecture.isCompleted ? (
          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
            <CheckCircle className="w-3 h-3 mr-0.5 sm:mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
            <span className="hidden sm:inline">Not Started</span>
            <span className="sm:hidden">Pending</span>
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-2 sm:px-4 py-3 sm:py-4">
        <button
          onClick={() => navigate(`/course/${course._id}/lecture/${lecture.id}`)}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-0.5 sm:gap-1 whitespace-nowrap ${lecture.isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
            }`}
        >
          {lecture.isCompleted ? (
            <>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Review</span>
              <span className="sm:hidden">Rev</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Start</span>
              <span className="sm:hidden">Go</span>
            </>
          )}
        </button>
      </td>
    </motion.tr>
  );



  // Enhanced Table View Component

  const TableView = ({ lecture, index }) => (

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

            <div className="flex-shrink-0 h-16 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">

              <Video className="h-8 w-8 text-white" />

            </div>

          )}

          <div className="ml-4">

            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">

              {lecture.title}

            </div>

            <div className="text-sm text-gray-500 line-clamp-1">{lecture.description}</div>

          </div>

        </div>

      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{lecture.sectionTitle}</span>

      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full w-min">

          <Clock className="w-4 h-4 mr-1 text-gray-600" />

          {lecture.durationFormatted}

        </div>

      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full w-min">

          {getTypeIcon(lecture.type)}

          <span className="ml-1 capitalize">{lecture.type}</span>

        </div>

      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

        {lecture.isCompleted ? (

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">

            <CheckCircle className="w-3 h-3 mr-1" />

            Completed

          </span>

        ) : (

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">

            Not started

          </span>

        )}

      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

        <button

          onClick={() => navigate(`/course/${course._id}/lecture/${lecture.id}`)}

          className={`px-3 py-1.5 rounded-md text-white text-sm font-medium ${lecture.isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'

            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'

            }`}

        >

          {lecture.isCompleted ? 'Review' : 'Start'}

        </button>

      </td>

    </motion.tr>

  );



  return (

    <motion.div

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.4 }}

      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"

    >

      {/* Continue Learning Card */}

      {userEnrolled && lastAccessedLecture && (

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center">

            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">

              <Play className="w-5 h-5 text-blue-600" />

            </div>

            <div>

              <p className="font-medium text-gray-900">Continue from where you left</p>

              <p className="text-sm text-gray-600">{lastAccessedLecture.title}</p>

            </div>

          </div>

          <button

            onClick={() => navigate(`/course/${course._id}/lecture/${lastAccessedLecture._id}`)}

            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"

          >

            Resume

          </button>

        </div>

      )}



      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Content</h2>
          {activeTab === "lectures" && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {stats.total} Lectures • {formatDuration(stats.totalDuration)}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0"
          title="Refresh curriculum"
        >
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>



      {/* Tab Navigation - Fully Responsive */}

      <div className="flex overflow-x-auto border-b border-gray-200 mb-4 sm:mb-6 -mx-6 sm:mx-0 px-6 sm:px-0">

        {["lectures", "sections", "notes", "quiz", "analytics"].map((tab) => (

          <button

            key={tab}

            onClick={() => setActiveTab(tab)}

            className={`py-2 px-3 sm:px-4 md:px-5 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab

                ? "text-blue-600 border-blue-600"

                : "text-gray-500 hover:text-gray-700 border-transparent"

              }`}

          >

            {tab.charAt(0).toUpperCase() + tab.slice(1)}

          </button>

        ))}

      </div>



      {/* Sections Tab Content */}
      {activeTab === "sections" && (
        <div className="mt-6">
          {sections.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-4">This course doesn't have any sections organized yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <motion.div
                  key={section._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 sm:p-4 bg-gray-50 border-b border-gray-200 cursor-pointer gap-3 xs:gap-4"
                    onClick={() => toggleSection(section._id)}
                  >
                    <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{section.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {section.lessons?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 xs:gap-3 flex-shrink-0">
                      <div className="w-16 sm:w-20 md:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateSectionProgress(section)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 w-8 text-right">{calculateSectionProgress(section)}%</span>
                      {expandedSections[section._id] ?
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" /> :
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      }
                    </div>
                  </div>
                  
                  {expandedSections[section._id] && (
                    <div className="p-4">
                      {section.lessons && section.lessons.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          {section.lessons.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-800">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{lesson.title}</h4>
                                <p className="text-xs text-gray-500 truncate hidden xs:block">{lesson.description}</p>
                              </div>
                              <div className="flex items-center gap-2 xs:gap-3 flex-shrink-0">
                                <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                  {formatDurationForCurriculum(lesson.duration || 0)}
                                </div>
                                <button
                                  onClick={() => navigate(`/course/${course._id}/lecture/${lesson._id}`)}
                                  className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                                >
                                  {lesson.isCompleted ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                      <span className="hidden sm:inline">Review</span>
                                      <span className="sm:hidden">Rev</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 flex-shrink-0" />
                                      <span className="hidden sm:inline">Start</span>
                                      <span className="sm:hidden">Go</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4 text-xs sm:text-sm">No lectures in this section yet.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lectures Content */}

      {activeTab === "lectures" && (

        <>

          {/* Progress Bar */}

          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">

            <div className="flex justify-between mb-2">

              <span className="text-sm font-medium text-gray-700">Course Progress</span>

              <span className="text-sm font-medium text-gray-700">{stats.progress}%</span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">

              <div

                className="bg-blue-600 h-2.5 rounded-full"

                style={{ width: `${stats.progress}%` }}

              ></div>

            </div>

          </div>



          {/* Enhanced Statistics Cards */}

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">

            {/* Total Lectures Card */}

            <motion.div

              className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[160px] sm:min-h-[200px]"

              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}

              transition={{ duration: 0.2 }}

            >

              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>

              <div className="flex items-center justify-between relative z-10 gap-2">

                <div className="min-w-0">

                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Lectures</h3>

                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>

                  <p className="text-xs text-gray-500 mt-1">In this course</p>

                </div>

                <div className="rounded-full bg-blue-100 p-2 sm:p-3 shadow-inner flex-shrink-0">

                  <Video className="w-6 h-6 text-blue-600" />

                </div>

              </div>

            </motion.div>

            {/* Completed Card */}

            <motion.div

              className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[160px] sm:min-h-[200px]"

              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}

              transition={{ duration: 0.2 }}

            >

              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>

              <div className="flex items-center justify-between relative z-10 gap-2">

                <div className="min-w-0">

                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Completed</h3>

                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.completed}/{stats.total}</p>

                  <div className="mt-2">

                    <span className="inline-flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">

                      <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />

                      {stats.progress}% complete

                    </span>

                  </div>

                </div>

                <div className="rounded-full bg-green-100 p-2 sm:p-3 shadow-inner flex-shrink-0">

                  <CheckCircle className="w-6 h-6 text-green-600" />

                </div>

              </div>

            </motion.div>

            {/* Duration Card */}

            <motion.div

              className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[160px] sm:min-h-[200px]"

              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}

              transition={{ duration: 0.2 }}

            >

              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>

              <div className="flex items-center justify-between relative z-10 gap-2">

                <div className="min-w-0">

                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Duration</h3>

                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{formatDuration(stats.totalDuration)}</p>

                  <p className="text-xs text-gray-500 mt-1 truncate">Avg. {formatDuration(stats.avgDuration)}/lecture</p>

                </div>

                <div className="rounded-full bg-yellow-100 p-2 sm:p-3 shadow-inner flex-shrink-0">

                  <Clock className="w-6 h-6 text-yellow-600" />

                </div>

              </div>

            </motion.div>

            {/* Time to Complete Card */}

            <motion.div

              className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[160px] sm:min-h-[200px]"

              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}

              transition={{ duration: 0.2 }}

            >

              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>

              <div className="flex items-center justify-between relative z-10 gap-2">

                <div className="min-w-0">

                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Time to Complete</h3>

                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{formatDuration(stats.totalDuration * (100 - stats.progress) / 100)}</p>

                  <p className="text-xs text-gray-500 mt-1">Remaining</p>

                </div>

                <div className="rounded-full bg-purple-100 p-2 sm:p-3 shadow-inner flex-shrink-0">

                  <BarChart3 className="w-6 h-6 text-purple-600" />

                </div>

              </div>

            </motion.div>

          </div>



          {/* Filters and Search - Fully Responsive */}

          <motion.div

            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6"

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.3 }}

          >

            <div className="flex flex-col gap-3 sm:gap-4">

              {/* Search Bar */}

              <div className="relative w-full">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                  <Search className="h-5 w-5 text-gray-400" />

                </div>

                <input

                  type="text"

                  placeholder="Search lectures..."

                  className="block w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                />

              </div>

              {/* Controls Row */}

              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">

              {/* View Mode Toggle */}

              <div className="flex items-center space-x-1">

                <button

                  onClick={() => setViewMode('grid')}

                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}

                  title="Grid View"

                >

                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />

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

                        <option value="completed">Completion Status</option>

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

          </div>

          </motion.div>



          {/* Lectures List */}

          {loading ? (

            <div className="flex justify-center items-center h-32">

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>

            </div>

          ) : filteredLectures.length === 0 ? (

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">

              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">

                <Video className="w-8 h-8 text-blue-600" />

              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>

              <p className="text-gray-500 mb-4">

                {searchTerm

                  ? 'Try adjusting your search term'

                  : 'No lectures available for this course'}

              </p>

            </div>

          ) : (

            <>

              {viewMode === 'grid' ? (

                // Grid View - Fully Responsive

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">

                  {filteredLectures.map((lecture, index) => (

                    <GridItem key={lecture.id} lecture={lecture} index={index} />

                  ))}

                </div>

              ) : viewMode === 'list' ? (

                // List View - Tabular Format - Fully Responsive
                <motion.div
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecture</th>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Section</th>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell">Status</th>
                          <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLectures.map((lecture, index) => (
                          <ListItem key={lecture.id} lecture={lecture} index={index} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

              ) : (

                // Enhanced Table View

                <motion.div

                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.3 }}

                >

                  <div className="overflow-x-auto custom-scrollbar">

                    <table className="min-w-full divide-y divide-gray-200">

                      <thead className="bg-gray-50">

                        <tr>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecture</th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>

                        </tr>

                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">

                        {filteredLectures.map((lecture, index) => (

                          <TableView key={lecture.id} lecture={lecture} index={index} />

                        ))}

                      </tbody>

                    </table>

                  </div>

                </motion.div>

              )}

            </>

          )}
        </>
      )}
      {/* Notes Tab Content */}
      {activeTab === "notes" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-2">
            <NotesSection course={course} />
          </div>
        </motion.div>
      )}
      {/* Quiz Tab Content */}
      {activeTab === "quiz" && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Course Quizzes
          </h3>
          <p className="text-gray-500 mb-4">
            Quizzes for this course will appear here.
          </p>
        </div>
      )}

      {/* Analytics Tab Content */}
      {activeTab === "analytics" && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Course Analytics
          </h3>
          <p className="text-gray-500 mb-4">
            Your progress analytics for this course will appear here.
          </p>
        </div>
      )}
    </motion.div>

  );

};

// Notes Section Component - Updated to remove CRUD functionality
const NotesSection = ({ course }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, lecture, course
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
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

  const handleViewNote = (note) => {
    // Navigate to view note page with context
    navigate(`/student/notes/view/${note._id}`, { state: { from: 'course' } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
      {/* Notes Header - Responsive (Removed New Note button) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Notes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {notes.length} notes • Organized by sections
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters and Search - Responsive with adjusted filter sizes */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          >
            <option value="all">All Notes</option>
            <option value="lecture">Lecture Notes</option>
            <option value="course">Course Notes</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Notes Display - Grid or List View */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'No notes available for this course yet'}
          </p>
          {/* Create Your First Note button link removed as requested */}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{note.title}</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleViewNote(note)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                    title="View Note"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {/* Edit and Delete buttons removed as requested */}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <BookOpen className="w-3 h-3 mr-1" />
                  <span className="truncate">{note.lecture ? `Lecture: ${note.lecture.title}` : 'Course Note'}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Created {formatDate(note.createdAt)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Tag className="w-3 h-3 mr-1" />
                  <span>{note.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags && note.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotes.map((note, index) => (
                <motion.tr 
                  key={note._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{note.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{note.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{note.lecture ? 'Lecture' : 'Course'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {note.tags && note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {note.tags && note.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(note.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewNote(note)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Note"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Edit and Delete buttons removed as requested */}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

// Reviews Section

const ReviewsSection = ({ course }) => {

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all"); // all, 5, 4, 3, 2, 1

  const [sortOrder, setSortOrder] = useState("recent"); // recent, top-rated

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const [submitting, setSubmitting] = useState(false);

  const { user } = useSelector(state => state.auth);



  // ======================================================

  // 🧩 Fetch Real Course Reviews

  // ======================================================

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

        toast.error("Failed to load course reviews.");

      } finally {

        setLoading(false);

      }

    };



    if (course && course._id) fetchReviews();

  }, [course]);



  // ======================================================

  // 📊 Rating Distribution Calculation

  // ======================================================

  const ratingDistribution = useMemo(() => {

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => (dist[r.rating] = (dist[r.rating] || 0) + 1));

    return dist;

  }, [reviews]);



  // ======================================================

  // 🔍 Filter + Sort Logic

  // ======================================================

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



  // ======================================================

  // 😊 Sentiment Helpers

  // ======================================================

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



  // Handle review submission

  const handleSubmitReview = async (e) => {

    e.preventDefault();

    if (!newReview.comment.trim()) return toast.error("Please enter your review.");



    try {

      setSubmitting(true);

      const response = await courseService.createCourseReview(course._id, newReview);



      if (response.success) {

        const review = {

          _id: response.data.review._id,

          user: response.data.review.user,

          rating: response.data.review.rating,

          comment: response.data.review.comment,

          createdAt: response.data.review.createdAt,

          helpful: 0

        };



        setReviews([review, ...reviews]);

        setNewReview({ rating: 5, comment: '' });

        toast.success('Review submitted successfully!');

      }

    } catch (error) {

      console.error('Error submitting review:', error);

      toast.error('Failed to submit review');

    } finally {

      setSubmitting(false);

    }

  };



  // ======================================================

  // 🧠 Component Render

  // ======================================================

  return (

    <motion.div

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.6 }}

      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10"

    >

      {/* Header - Fully Responsive */}

      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 mb-6">

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Reviews</h2>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />

          <span className="text-lg sm:text-xl font-bold text-gray-900">

            {course.averageRating?.toFixed(1) || "N/A"}

          </span>

          <span className="text-xs sm:text-sm text-gray-600">

            ({course.totalReviews || 0})

          </span>

        </div>

      </div>



      {/* Rating Distribution */}

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



      {/* Controls - Fully Responsive */}

      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">

        <select

          value={filter}

          onChange={(e) => setFilter(e.target.value)}

          className="w-full xs:w-auto px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

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

          className="w-full xs:w-auto px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

        >

          <option value="recent">Most Recent</option>

          <option value="top-rated">Top Rated</option>

        </select>

      </div>



      {/* Review Submission Form - Fully Responsive */}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-8">

        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">

          Write a Review

        </h3>

        <form onSubmit={handleSubmitReview}>

          <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">

            {[1, 2, 3, 4, 5].map(star => (

              <button

                key={star}

                type="button"

                onClick={() => setNewReview({ ...newReview, rating: star })}

                className="text-xl sm:text-2xl focus:outline-none transition-transform hover:scale-110"

              >

                <Star

                  className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}

                />

              </button>

            ))}

          </div>



          <textarea

            value={newReview.comment}

            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}

            placeholder="Share your experience with this course..."

            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"

          />



          <div className="flex justify-end mt-3">

            <motion.button

              whileHover={{ scale: 1.02 }}

              whileTap={{ scale: 0.98 }}

              type="submit"

              disabled={submitting || !newReview.comment.trim()}

              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"

            >

              {submitting ? (

                <>

                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>

                  Submitting...

                </>

              ) : (

                'Submit Review'

              )}

            </motion.button>

          </div>

        </form>

      </div>



      {/* Content */}

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

            Be the first to share your experience!

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

                <div className="flex items-start mb-3">

                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">

                    <User className="w-5 h-5 text-blue-600" />

                  </div>

                  <div className="flex-grow">

                    <div className="flex flex-wrap items-center justify-between">

                      <h4 className="font-semibold text-gray-900">

                        {review.user?.name || "Anonymous"}

                      </h4>

                      <span className="text-sm text-gray-500">

                        {formatDate(review.createdAt)}

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

                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">

                    Helpful

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

// Discussion Section - Enhanced Version

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



  // Format date

  const formatDate = (date) =>

    new Date(date).toLocaleDateString("en-US", {

      month: "short",

      day: "numeric",

      year: "numeric",

    });



  // Fetch discussions from backend

  useEffect(() => {

    const fetchDiscussions = async () => {

      setLoading(true);

      try {

        const res = await courseService.getCourseDiscussions(course._id);

        if (res.success) {

          // Ensure we're setting an array to avoid "not iterable" error

          const questionsData = res.data?.questions || res.questions || res.data || [];

          // Make sure it's an array before setting state

          setQuestions(Array.isArray(questionsData) ? questionsData : []);

        } else {

          setQuestions([]); // Set empty array if no questions

          toast.error(res.message || "Failed to load discussions");

        }

      } catch (err) {

        console.error("Error fetching discussions:", err);

        setQuestions([]); // Set empty array on error

        toast.error("Unable to load discussions");

      } finally {

        setLoading(false);

      }

    };

    if (course?._id) fetchDiscussions();

  }, [course?._id]);



  // Handle new question

  const handleSubmitQuestion = async (e) => {

    e.preventDefault();

    if (!newQuestion.trim()) return toast.error("Please enter your question.");

    setSubmitting(true);

    try {

      const res = await courseService.createDiscussionQuestion(course._id, {

        content: newQuestion,

      });

      if (res.success) {

        // Add new question to the list

        // Ensure we're adding to an array to avoid "not iterable" error

        setQuestions(prevQuestions => {

          const newQuestionData = res.data?.question || res.data || {};

          return [newQuestionData, ...(Array.isArray(prevQuestions) ? prevQuestions : [])];

        });

        setNewQuestion("");

        toast.success("✅ Question added successfully!");

      }

    } catch {

      toast.error("Failed to add question.");

    } finally {

      setSubmitting(false);

    }

  };



  // Handle answer submission

  const handleAddAnswer = async (questionId) => {

    const answerText = newAnswers[questionId];

    if (!answerText?.trim()) return toast.error("Answer cannot be empty.");

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

        toast.success("💬 Answer added successfully!");

      }

    } catch {

      toast.error("Failed to add answer.");

    } finally {

      setSubmitting(false);

    }

  };



  // Toggle expand

  const toggleExpand = (id) =>

    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));



  // Filter + sort + search

  const displayed = useMemo(() => {

    // Ensure questions is always an array

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

      {/* Header */}

      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-6">

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">💬 Course Discussion</h2>

        <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">

          {questions.length} Questions •{" "}

          {questions.reduce((a, q) => a + (q.answers?.length || 0), 0)} Answers

        </div>

      </div>



      {/* Filters - Fully Responsive */}

      <div className="flex flex-col gap-3 bg-gray-50 border rounded-lg p-3 sm:p-4 mb-6">

        <input

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          placeholder="Search questions..."

          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

        />

        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">

          <select

            value={filter}

            onChange={(e) => setFilter(e.target.value)}

            className="w-full xs:w-auto px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

          >

            <option value="all">All</option>

            <option value="resolved">Resolved</option>

            <option value="unresolved">Unresolved</option>

          </select>

          <select

            value={sortBy}

            onChange={(e) => setSortBy(e.target.value)}

            className="w-full xs:w-auto px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

          >

            <option value="newest">Newest</option>

            <option value="oldest">Oldest</option>

            <option value="popular">Most Answers</option>

          </select>

        </div>

      </div>



      {/* Ask question */}

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

          <div className="flex justify-between items-center mt-3">

            <p className="text-sm text-gray-500">{newQuestion.length}/500</p>

            <motion.button

              whileHover={{ scale: 1.03 }}

              whileTap={{ scale: 0.97 }}

              type="submit"

              disabled={submitting}

              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"

            >

              {submitting ? "Posting..." : "Post Question"}

            </motion.button>

          </div>

        </form>

      </div>



      {/* Discussions List */}

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

              {/* Question */}

              <div className="flex justify-between items-start">

                <div>

                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">

                    <User className="w-4 h-4 text-blue-600" />

                    {q.user?.name || "Anonymous"}

                  </h4>

                  <p className="text-gray-700 mt-2">{q.content}</p>

                  <div className="flex gap-4 mt-2 text-sm text-gray-500">

                    <span>{formatDate(q.createdAt)}</span>

                    <span>{q.answers?.length || 0} Answers</span>

                    {q.isResolved ? (

                      <span className="text-green-600 font-medium">Resolved</span>

                    ) : (

                      <span className="text-yellow-600 font-medium">Unresolved</span>

                    )}

                  </div>

                </div>

              </div>



              {/* View Answers */}

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



              {/* Answers Section */}

              {expanded[q._id] && (

                <div className="mt-4 space-y-3 border-t pt-3">

                  {q.answers?.length === 0 ? (

                    <p className="text-gray-500 text-sm italic">No answers yet.</p>

                  ) : (

                    q.answers?.map((ans) => (

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

                        <div className="flex items-center justify-between mb-1">

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

                            onClick={() => handleLike(q._id, ans._id)}

                            className="flex items-center text-gray-600 hover:text-blue-600"

                          >

                            <ThumbsUp className="w-4 h-4 mr-1" />

                            Like ({ans.likes || 0})

                          </button>

                        </div>

                      </div>

                    ))

                  )}



                  {/* Add Answer Form */}

                  <div className="mt-4">

                    <textarea

                      value={newAnswers[q._id] || ""}

                      onChange={(e) => setNewAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}

                      placeholder="Write your answer..."

                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"

                    />

                    <div className="flex justify-end mt-2">

                      <motion.button

                        whileHover={{ scale: 1.03 }}

                        whileTap={{ scale: 0.97 }}

                        onClick={() => handleAddAnswer(q._id)}

                        disabled={submitting}

                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"

                      >

                        {submitting ? "Posting..." : "Post Answer"}

                      </motion.button>

                    </div>

                  </div>

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

  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [enrolling, setEnrolling] = useState(false);

  const [userEnrolled, setUserEnrolled] = useState(false);

  // State for active tab

  const [activeTab, setActiveTab] = useState('overview');



  // Fetch course data

  useEffect(() => {

    const fetchCourse = async () => {

      try {

        setLoading(true);

        setError(null);

        setCourse(null); // Clear previous course data

        setUserEnrolled(false); // Reset enrollment status



        const response = await courseService.getCourseById(courseId);

        if (response.success) {

          const courseData = response.course;
          setCourse(courseData);
          
          // Ensure isEnrolled is properly set - enhanced logic to check user enrollment
          let isEnrolled = courseData.isEnrolled === true;
          
          // Additional check: if isEnrolled is false but we have user data, double-check
          if (!isEnrolled && courseData.enrolledStudents && Array.isArray(courseData.enrolledStudents)) {
            // Get user ID from localStorage or auth context
            const userId = localStorage.getItem('userId');
            if (userId) {
              // Check if user ID exists in enrolledStudents array
              isEnrolled = courseData.enrolledStudents.some(student => {
                // Handle both string and object ID formats
                const studentId = typeof student === 'string' ? student : student?.toString();
                return studentId === userId;
              });
            }
          }
          
          setUserEnrolled(isEnrolled);
          
          console.log('Course loaded:', {
            courseId: courseData._id,
            isEnrolled: isEnrolled,
            enrolledStudents: courseData.enrolledStudents?.length || 0,
            userId: localStorage.getItem('userId')
          });

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

  }, [courseId]);



  const handleEnroll = async () => {
    if (!course) {
      toast.error('Course data not loaded');
      return;
    }

    // Double-check enrollment status
    if (userEnrolled === true) {
      toast.info('You are already enrolled in this course');
      return;
    }

    if (course.enrollmentStatus !== 'open') {
      toast.error(`Enrollment is currently ${course.enrollmentStatus}`);
      return;
    }

    try {
      setEnrolling(true);

      // Check if course is free or paid
      const isFree = course.finalPrice === 0 || course.price === 0;

      if (isFree) {
        // Free course - direct enrollment
        const response = await courseService.enrollCourse(courseId);
        if (response.success) {
          console.log('Free course enrollment successful');
          
          // Immediately update local state
          setUserEnrolled(true);

          // Update course object with new enrollment data
          setCourse(prevCourse => ({
            ...prevCourse,
            isEnrolled: true,
            totalEnrolled: (prevCourse.totalEnrolled || 0) + 1,
            enrolledStudents: [...(prevCourse.enrolledStudents || []), response.userId]
          }));

          toast.success('🎉 Successfully enrolled in the course!');

          // Refresh course data in background to ensure sync
          setTimeout(async () => {
            try {
              const refreshResponse = await courseService.getCourseById(courseId, true);
              if (refreshResponse.success) {
                const isEnrolled = refreshResponse.course.isEnrolled === true;
                setCourse(refreshResponse.course);
                setUserEnrolled(isEnrolled);
                console.log('Course data refreshed after enrollment:', { isEnrolled });
              }
            } catch (err) {
              console.error('Error refreshing course data:', err);
            }
          }, 500);
        }
      } else {
        // Paid course - show Razorpay modal
        const paymentService = (await import('../../../services/paymentService.js')).default;
        
        console.log('[ViewCourse] Starting paid course enrollment for:', { courseId, courseTitle: course.title, price: course.finalPrice });
        
        // Load Razorpay script
        const scriptLoaded = await paymentService.loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay. Please check your internet connection.');
        }
        
        console.log('[ViewCourse] Razorpay script loaded successfully');

        // Create order
        console.log('[ViewCourse] Calling paymentService.createOrder with courseId:', courseId);
        const orderResponse = await paymentService.createOrder(courseId);
        
        console.log('[ViewCourse] Order response:', orderResponse);
        
        if (!orderResponse || !orderResponse.success) {
          const errorMsg = orderResponse?.message || 'Failed to create payment order';
          console.error('[ViewCourse] Order creation failed:', errorMsg);
          throw new Error(errorMsg);
        }

        // Extract data correctly from the response
        const orderId = orderResponse.data?.orderId || orderResponse.orderId;
        const amount = orderResponse.data?.amount || orderResponse.amount;
        const keyId = orderResponse.data?.keyId || orderResponse.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        console.log('[ViewCourse] Extracted order details:', { orderId, amount, keyId });
        
        if (!orderId || !amount || !keyId) {
          console.error('[ViewCourse] Missing order data:', { orderId, amount, keyId });
          throw new Error('Invalid order data received from server');
        }

        // Prepare Razorpay options
        const userPhone = localStorage.getItem('userPhone');
        const userEmail = localStorage.getItem('userEmail');
        
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: 'EduPulse',
          description: `Enrollment for ${course.title}`,
          order_id: orderId,
          ...(userEmail && { email: userEmail }),
          ...(userPhone && { contact: userPhone }),
          handler: async (response) => {
            console.log('[ViewCourse] 💳 HANDLER STARTED - Payment handler triggered with response:', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature?.substring(0, 20) + '...'
            });
            
            try {
              setEnrolling(true);
              console.log('[ViewCourse] 🔄 Setting enrolling to true');
              
              console.log('[ViewCourse] 🔄 Calling verifyPayment...');
              
              // Verify payment
              const verifyResponse = await paymentService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              console.log('[ViewCourse] ✅ Verify response received:', {
                success: verifyResponse.success,
                message: verifyResponse.message,
                hasData: !!verifyResponse.data
              });

              if (verifyResponse.success) {
                console.log('[ViewCourse] ✅ Payment verified successfully:', {
                  paymentId: verifyResponse.data?.payment?._id,
                  userId: verifyResponse.data?.payment?.user,
                  courseId: verifyResponse.data?.course?._id,
                  courseTitle: verifyResponse.data?.course?.title,
                  isEnrolled: verifyResponse.data?.enrollment?.isEnrolled
                });
                
                // Update local state immediately
                console.log('[ViewCourse] 🔄 Updating local state...');
                setUserEnrolled(true);
                setCourse(prevCourse => ({
                  ...prevCourse,
                  isEnrolled: true,
                  totalEnrolled: (prevCourse.totalEnrolled || 0) + 1,
                }));

                console.log('[ViewCourse] ✅ Local state updated');

                // Refresh course data to ensure sync - IMPORTANT: bypass cache
                setTimeout(async () => {
                  try {
                    console.log('[ViewCourse] 🔄 Refreshing course data after payment...');
                    
                    // Force fresh data by bypassing cache (pass true as second parameter)
                    const refreshResponse = await courseService.getCourseById(courseId, true);
                    
                    if (refreshResponse.success && refreshResponse.course) {
                      const isEnrolled = refreshResponse.course.isEnrolled === true;
                      console.log('[ViewCourse] ✅ Course refreshed after payment:', { 
                        isEnrolled, 
                        courseId,
                        enrolledStudents: refreshResponse.course.enrolledStudents?.length 
                      });
                      
                      setCourse(refreshResponse.course);
                      setUserEnrolled(isEnrolled);
                      
                      if (!isEnrolled) {
                        console.warn('[ViewCourse] ⚠️ WARNING: Course data shows not enrolled after payment!');
                      }
                    } else {
                      console.error('[ViewCourse] ❌ Failed to refresh course data:', refreshResponse);
                    }
                  } catch (err) {
                    console.error('[ViewCourse] ❌ Error refreshing course data:', err);
                  }
                }, 1500);
              } else {
                console.error('[ViewCourse] ❌ Verification failed:', verifyResponse.message);
                throw new Error(verifyResponse.message);
              }
            } catch (error) {
              console.error('[ViewCourse] ❌ Payment handler error:', {
                message: error.message,
                error: error,
                stack: error.stack
              });
              try {
                await paymentService.handlePaymentFailure(response.razorpay_order_id);
              } catch (failureError) {
                console.error('[ViewCourse] ❌ Error handling payment failure:', failureError);
              }
              setUserEnrolled(false);
            } finally {
              console.log('[ViewCourse] 🏁 Handler finally block - setting enrolling to false');
              setEnrolling(false);
            }
          },
          prefill: {
            name: localStorage.getItem('userName') || '',
            ...(userEmail && { email: userEmail }),
            ...(userPhone && { contact: userPhone }),
          },
          theme: {
            color: '#6366F1',
          },
          modal: {
            ondismiss: async () => {
              toast.error('Payment cancelled');
              setEnrolling(false);
            },
          },
        };

        // Open Razorpay modal
        try {
          await paymentService.openRazorpayModal(options);
          // If we get here, payment was successful
          console.log('[ViewCourse] 🎉 Payment completed successfully');
          toast.success('🎉 Payment successful! You are now enrolled!');
        } catch (error) {
          console.error('[ViewCourse] ❌ Payment modal error:', error);
          toast.error(error.message || 'Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setUserEnrolled(false); // Reset on error
      if (error.response?.data?.enrollmentStatus) {
        toast.error(`Enrollment is currently ${error.response.data.enrollmentStatus}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to enroll in course');
      }
    } finally {
      setEnrolling(false);
    }
  };



  const handleUnenroll = async () => {
    if (!course) return;

    // Prevent double unenrollment
    if (!userEnrolled) {
      toast.info('You are not enrolled in this course');
      return;
    }

    try {
      setEnrolling(true);
      const response = await courseService.unenrollCourse(courseId);
      if (response.success) {
        // Immediately update local state
        setUserEnrolled(false);

        // Update course object with new enrollment data
        setCourse(prevCourse => ({
          ...prevCourse,
          isEnrolled: false,
          totalEnrolled: Math.max(0, (prevCourse.totalEnrolled || 1) - 1),
          enrolledStudents: (prevCourse.enrolledStudents || []).filter(id => id !== response.userId)
        }));

        toast.success('✅ Successfully unenrolled from the course');

        // Refresh course data in background
        setTimeout(async () => {
          try {
            const refreshResponse = await courseService.getCourseById(courseId);
            if (refreshResponse.success) {
              setCourse(refreshResponse.course);
              setUserEnrolled(refreshResponse.course.isEnrolled || false);
            }
          } catch (err) {
            console.error('Error refreshing course data:', err);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      setUserEnrolled(true); // Reset on error
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to unenroll from course');
      }
    } finally {
      setEnrolling(false);
    }
  };



  const handleRetry = () => {

    setError(null);

    setLoading(true);

    setCourse(null); // Clear previous course data



    const fetchCourse = async () => {

      try {

        const response = await courseService.getCourseById(courseId);

        if (response.success) {

          setCourse(response.course);

          setUserEnrolled(response.course.isEnrolled || false);

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



  // Loading state

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



  // Error state

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

              onClick={() => navigate('/courses')}

              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"

            >

              Back to Courses

            </motion.button>

          </div>

        </motion.div>

      </div>

    );

  }



  // Not found state

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

            onClick={() => navigate('/courses')}

            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"

          >

            Browse Courses

          </motion.button>

        </motion.div>

      </div>

    );

  }



  // Render the course details

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Course Header */}

        <CourseHeader

          course={course}

        />



        {/* Tab Navigation */}

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



        {/* Tab Content */}

        <div className="space-y-8">

          {activeTab === 'overview' && (

            <motion.div

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.3 }}

            >

              <AboutCourseSection

                course={course}

                userEnrolled={userEnrolled}

                onEnroll={handleEnroll}

                enrolling={enrolling}

                handleUnenroll={handleUnenroll}

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

                userEnrolled={userEnrolled}

              />

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