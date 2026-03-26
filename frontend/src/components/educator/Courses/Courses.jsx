import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Trash2, Users, TrendingUp,
  Grid, List, Search, BarChart3, Clock,
  CheckCircle, SlidersHorizontal, RefreshCw, 
  CreditCard, UserCheck, BarChart, 
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import courseService from '../../../services/courseService.js';
import CreateCourses from './CreateCourses';
import EditCourse from './EditCourse';
import ViewCourse from './ViewCourse/ViewCourse';
import Lectures from '../Lectures/Lectures.jsx';
import CreateSection from '../Sections/CreateSection';
import EditSection from '../Sections/EditSection';

// Modular Components
import StatCard from './components/StatCard';
import CourseCard from './components/CourseCard';
import CourseTable from './components/CourseTable';
import CoursesFilters from './components/CoursesFilters';
import CoursesHeader from './components/CoursesHeader';
import DeleteConfirmModal from './components/DeleteConfirmModal';

// Utilities
import { 
  transformCourses, 
  formatCurrency, 
  formatPercentage, 
  getFinalPrice,
  formatDuration
} from './utils/courseUtils';

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

      // Check if the responses are valid
      if (!coursesResponse || !statsResponse) {
        throw new Error('Invalid response from server');
      }

      // Transform courses data to match frontend expectations
      const coursesData = coursesResponse?.courses || [];
      const transformedCourses = transformCourses(coursesData);

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
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please check your configuration.');
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
  const handleDeleteClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (!courseToDelete) return;
      
      const response = await courseService.deleteCourse(courseToDelete.id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete course');
      }
      
      
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
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
        <div className="p-3 sm:p-4 md:p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard
                title="Total Courses"
                value={stats.total}
                icon={BookOpen}
                color="blue"
                subtitle={`${stats.published} published, ${stats.draft} drafts`}
                onRefresh={handleRefresh}
                lastUpdated={lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              />

              <StatCard
                title="Total Students"
                value={stats.students.toLocaleString()}
                icon={Users}
                color="green"
                subtitle={stats.lowEnrollment > 0 ? `${stats.lowEnrollment} low enrollment alert` : "Enrollment levels healthy"}
                extra={stats.lowEnrollment > 0 ? (
                  <span className="inline-flex items-center text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Action Needed
                  </span>
                ) : null}
              />

              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.revenue)}
                icon={CreditCard}
                color="orange"
                subtitle={`Avg ${stats.published > 0 ? formatCurrency(Math.round(stats.revenue / stats.published)) : '₹0'} per course`}
                extra={
                  <span className="inline-flex items-center text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    <TrendingUp className="w-2.5 h-2.5 mr-1" /> +12% growth
                  </span>
                }
              />

              <StatCard
                title="Performance"
                value={`${stats.avgRating}/5`}
                icon={BarChart3}
                color="purple"
                subtitle={`${stats.completionRate}% avg. completion`}
                extra={
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      Views: {stats.totalViews.toLocaleString()}
                    </span>
                  </div>
                }
              />
            </div>

            {/* Sub Header */}
            <CoursesHeader 
              onCreateCourse={handleCreateCourse} 
            />

            {/* Bulk Actions */}
            {selectedCourses.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between shadow-sm border border-blue-100">
                <span className="text-blue-700 font-medium flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  {selectedCourses.size} course{selectedCourses.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center transition-all shadow-sm active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <CoursesFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              clearAllFilters={clearAllFilters}
            />

            {/* Courses List */}
            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'We couldn\'t find any courses matching your current filters. Try adjusting them.'
                    : 'Your dashboard is empty. Start your journey by creating your first premium course.'}
                </p>
                <button
                  onClick={handleCreateCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                  >
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onView={handleViewCourse}
                        onEdit={handleEditCourse}
                        onDelete={handleDeleteClick}
                        onTogglePublish={handleTogglePublish}
                        onAnalytics={handleViewAnalytics}
                        isSelected={selectedCourses.has(course.id)}
                        onSelect={handleSelectCourse}
                        formatCurrency={formatCurrency}
                        getFinalPrice={getFinalPrice}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CourseTable
                      courses={filteredCourses}
                      selectedCourses={selectedCourses}
                      onSelectCourse={handleSelectCourse}
                      onSelectAll={handleSelectAll}
                      onView={handleViewCourse}
                      onEdit={handleEditCourse}
                      onAnalytics={handleViewAnalytics}
                      formatCurrency={formatCurrency}
                      formatPercentage={formatPercentage}
                      getFinalPrice={getFinalPrice}
                      formatDuration={formatDuration}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={confirmDelete}
              courseTitle={courseToDelete?.title}
              isBulk={Array.isArray(courseToDelete)}
              count={Array.isArray(courseToDelete) ? courseToDelete.length : 1}
            />
          </div>
        </div>
      } />

      <Route path="/create" element={<CreateCourses />} />
      <Route path="/edit/:id" element={<EditCourse />} />
      <Route path="/view/:courseId" element={<ViewCourse />} />
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