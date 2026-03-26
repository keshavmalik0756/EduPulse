import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Edit, Play, CheckCircle, User, Users, Star, Calendar, ChevronDown, ChevronUp 
} from 'lucide-react';
import { formatDate } from '../../../../../utils/formatters';

const AboutCourseSection = ({ course, onEditCourse }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);


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

          <CourseMetaInfo course={course} />


          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEditCourse}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white text-sm sm:text-base flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-4"
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
                <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Show more <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </button>
          )}

          <CoursePrerequisites prerequisites={course.prerequisites} />
          <CourseLearningOutcomes outcomes={course.learningOutcomes} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Sub-sub components for better readability
const CourseMetaInfo = ({ course }) => (
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
      <span>{course.averageRating?.toFixed(1) || "No ratings"} ({course.totalReviews || 0})</span>
    </div>
    <div className="flex items-center">
      <Calendar className="w-4 h-4 mr-1" />
      <span>Updated {formatDate(course.lastUpdated || course.updatedAt || course.createdAt)}</span>
    </div>
  </div>
);



const CoursePrerequisites = ({ prerequisites }) => (
  prerequisites?.length > 0 && (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Prerequisites</h3>
      <ul className="space-y-2">
        {prerequisites.map((prereq, i) => (
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
  )
);

const CourseLearningOutcomes = ({ outcomes }) => (
  outcomes?.length > 0 && (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-3">What you'll learn</h3>
      <ul className="space-y-2">
        {outcomes.map((outcome, i) => (
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
  )
);


export default AboutCourseSection;
