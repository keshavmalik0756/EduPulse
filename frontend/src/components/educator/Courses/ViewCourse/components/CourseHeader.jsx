import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, BookOpen } from 'lucide-react';

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

export default CourseHeader;
