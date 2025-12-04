import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Star, Eye, Users, CreditCard, Filter, BookOpen, BarChart3, Zap, ArrowUp, ArrowDown, ChevronDown, X } from 'lucide-react';
import courseService from '../../../services/courseService';

const CourseLeaderboard = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [sortBy, setSortBy] = useState('enrollment');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await courseService.getCreatorCourses();
        
        if (coursesResponse.success) {
          setCoursesData(coursesResponse.courses || []);
        } else {
          setError(coursesResponse.message || 'Failed to fetch courses data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRankBadge = (rank) => {
    const badges = {
      1: { emoji: '🥇', bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
      2: { emoji: '🥈', bg: 'bg-gradient-to-r from-gray-300 to-gray-500' },
      3: { emoji: '🥉', bg: 'bg-gradient-to-r from-amber-700 to-amber-900' }
    };
    
    const badge = badges[rank];
    if (badge) {
      return (
        <div className={`w-8 h-8 rounded-full ${badge.bg} flex items-center justify-center text-white font-bold text-sm`}>
          {badge.emoji}
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
        {rank}
      </div>
    );
  };

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const grouped = {};
    
    coursesData.forEach((course) => {
      const category = course.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(course);
    });
    
    return grouped;
  }, [coursesData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Object.keys(coursesByCategory).sort();
    return ['all', ...cats];
  }, [coursesByCategory]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [];
    
    if (selectedCategory === 'all') {
      filtered = [...coursesData];
    } else {
      filtered = coursesByCategory[selectedCategory] || [];
    }
    
    // Sort courses based on selected criteria
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'enrollment':
          aValue = a.totalEnrolled || 0;
          bValue = b.totalEnrolled || 0;
          break;
        case 'revenue':
          aValue = a.revenue || 0;
          bValue = b.revenue || 0;
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        default:
          aValue = a.totalEnrolled || 0;
          bValue = b.totalEnrolled || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    // Add rank to each course
    return filtered.map((course, index) => ({
      ...course,
      rank: index + 1
    }));
  }, [selectedCategory, coursesData, coursesByCategory, sortBy, sortOrder]);

  // Handle sorting change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same sort option
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort criteria and reset to descending order
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Course Leaderboard
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-red-600" />
            Course Leaderboard
          </h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Error loading leaderboard</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-5 border-l-4 border-yellow-500 space-y-4 lg:space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg lg:text-2xl font-bold flex items-center gap-2 min-w-0">
          <Trophy className="w-5 lg:w-7 h-5 lg:h-7 text-yellow-600 flex-shrink-0" />
          <span className="truncate">Leaderboard</span>
        </h3>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showMobileFilters ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Filter className="w-5 h-5 text-yellow-600" />
          )}
        </button>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden space-y-3 pb-3 border-b border-gray-200"
          >
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-yellow-50 border border-yellow-300 rounded-lg py-2 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-yellow-600 absolute right-2 top-3 pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Category Filter */}
      <div className="hidden lg:flex gap-2">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-yellow-50 border border-yellow-300 rounded-lg py-2 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-yellow-600 absolute right-2 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 lg:pb-0">
        <button
          onClick={() => handleSortChange('enrollment')}
          className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
            sortBy === 'enrollment'
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          <span className="hidden sm:inline">Enrollment</span>
          <span className="sm:hidden">Enroll</span>
          {sortBy === 'enrollment' && (
            sortOrder === 'asc' ? <ArrowUp className="w-3 lg:w-4 h-3 lg:h-4" /> : <ArrowDown className="w-3 lg:w-4 h-3 lg:h-4" />
          )}
        </button>
        <button
          onClick={() => handleSortChange('revenue')}
          className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
            sortBy === 'revenue'
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          <span className="hidden sm:inline">Revenue</span>
          <span className="sm:hidden">Rev</span>
          {sortBy === 'revenue' && (
            sortOrder === 'asc' ? <ArrowUp className="w-3 lg:w-4 h-3 lg:h-4" /> : <ArrowDown className="w-3 lg:w-4 h-3 lg:h-4" />
          )}
        </button>
        <button
          onClick={() => handleSortChange('views')}
          className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
            sortBy === 'views'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Views
          {sortBy === 'views' && (
            sortOrder === 'asc' ? <ArrowUp className="w-3 lg:w-4 h-3 lg:h-4" /> : <ArrowDown className="w-3 lg:w-4 h-3 lg:h-4" />
          )}
        </button>
      </div>

      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-8 lg:py-12">
          <Trophy className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
          <p className="text-gray-500 text-base lg:text-lg">No courses found</p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {filteredAndSortedCourses.map((course, index) => {
            const isExpanded = expandedCourse === course._id;
            
            return (
              <motion.div
                key={course._id}
                className="border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedCourse(isExpanded ? null : course._id)}
                  className="p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-yellow-50 hover:to-yellow-50 transition-colors active:bg-yellow-50"
                >
                  <div className="flex items-center gap-2 lg:gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {getRankBadge(course.rank)}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 lg:gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-gray-900 truncate text-sm lg:text-lg">{course.title}</h4>
                        {course.isPublished && (
                          <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                            Live
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                        <span className="inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate">
                          {course.category}
                        </span>
                        <div className="flex items-center text-xs text-gray-600 gap-0.5 lg:gap-1">
                          <Star className="w-3 lg:w-3.5 h-3 lg:h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{course.averageRating?.toFixed(1) || '0.0'}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats - Responsive */}
                    <div className="hidden sm:flex items-center gap-3 lg:gap-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs lg:text-sm font-bold text-gray-900">
                          <Eye className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-blue-600" />
                          {(course.views || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs lg:text-sm font-bold text-gray-900">
                          <Users className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-green-600" />
                          {(course.totalEnrolled || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Enrolled</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs lg:text-sm font-bold text-gray-900">
                          <CreditCard className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-purple-600" />
                          ₹{(course.revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>

                    {/* Mobile Stats - Compact */}
                    <div className="sm:hidden flex items-center gap-2 flex-shrink-0 text-xs">
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{(course.totalEnrolled || 0).toLocaleString()}</div>
                        <div className="text-gray-500">Enrolled</div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 bg-gray-50 p-3 lg:p-4"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                        {/* Completion Rate */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <BarChart3 className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-indigo-600" />
                            <span className="text-xs font-medium text-gray-600">Completion</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">{course.completionRate || 0}%</p>
                        </div>

                        {/* Total Lectures */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <BookOpen className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-orange-600" />
                            <span className="text-xs font-medium text-gray-600">Lectures</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">{course.totalLectures || 0}</p>
                        </div>

                        {/* Duration */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <Zap className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-yellow-600" />
                            <span className="text-xs font-medium text-gray-600">Duration</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">{course.totalDurationMinutes || 0} min</p>
                        </div>

                        {/* Price */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <CreditCard className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-600">Price</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">₹{course.finalPrice || 0}</p>
                        </div>

                        {/* Level */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <TrendingUp className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-600">Level</span>
                          </div>
                          <p className="text-sm lg:text-base font-bold text-gray-900 capitalize truncate">
                            {course.level || 'N/A'}
                          </p>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <Star className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-yellow-600" />
                            <span className="text-xs font-medium text-gray-600">Reviews</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">{course.reviewsCount || 0}</p>
                        </div>

                        {/* Discount */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <Zap className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-red-600" />
                            <span className="text-xs font-medium text-gray-600">Discount</span>
                          </div>
                          <p className="text-base lg:text-lg font-bold text-gray-900">{course.discount || 0}%</p>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg p-2 lg:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1">
                            <BookOpen className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-purple-600" />
                            <span className="text-xs font-medium text-gray-600">Status</span>
                          </div>
                          <p className="text-sm lg:text-base font-bold text-gray-900 capitalize">
                            {course.isPublished ? '✓ Live' : 'Draft'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="pt-3 lg:pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 lg:gap-4">
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">Total Courses</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{filteredAndSortedCourses.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">Category</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{selectedCategory === 'all' ? 'All' : selectedCategory}</p>
          </div>
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">Sorted By</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900 capitalize">{sortBy}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseLeaderboard;