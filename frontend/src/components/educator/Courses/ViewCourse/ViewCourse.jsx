import React from "react";
import { motion } from "framer-motion";
import { 
  AlertCircle, BookOpen, Layout, Book, GraduationCap, Star, MessageSquare 
} from 'lucide-react';

// Hooks
import { useViewCourse } from './hooks/useViewCourse';

// Components
import CourseHeader from './components/CourseHeader';
import CourseStats from './components/CourseStats';
import AboutCourseSection from './components/AboutCourseSection';
import CurriculumSection from './components/CurriculumSection';
import StudentsSection from './components/StudentsSection';
import ReviewsSection from './components/ReviewsSection';
import DiscussionSection from './components/DiscussionSection';

/**
 * ViewCourse Component - Refactored for scalability and performance.
 * This is the main container for the educator's view of a single course.
 */
function ViewCourse() {
  const { 
    course, loading, error, activeTab, setActiveTab, handleRetry, handleEditCourse, navigate 
  } = useViewCourse();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600 font-medium">Loading course workspace...</p>
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
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workspace Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/educator/courses')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Exit Workspace
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">?</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Disconnected</h2>
          <p className="text-gray-600 mb-6">We couldn't find the course you were looking for. It might have been relocated or deleted.</p>
          <button
            onClick={() => navigate('/educator/courses')}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'curriculum', label: 'Curriculum', icon: Book },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'qna', label: 'Q&A', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseHeader course={course} onEditCourse={handleEditCourse} />
        <CourseStats course={course} />

        <div className="mb-8 border-b border-gray-200 sticky top-0 bg-gray-50/80 backdrop-blur-md z-30 pt-4">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Course Management Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <AboutCourseSection course={course} onEditCourse={handleEditCourse} />}
            {activeTab === 'curriculum' && <CurriculumSection course={course} />}
            {activeTab === 'students' && <StudentsSection course={course} />}
            {activeTab === 'reviews' && <ReviewsSection course={course} />}
            {activeTab === 'qna' && <DiscussionSection course={course} />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;