import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Clock, ShoppingCart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EnrollmentModal from './EnrollmentModal';

const CourseCard = ({ course, isEnrolled = false, onEnrollSuccess }) => {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/course/${course.slug || course._id}`);
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    setShowEnrollModal(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ translateY: -8 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer h-full flex flex-col"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          {course.discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{course.discount}%
            </div>
          )}
          {isEnrolled && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Enrolled
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              {course.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{course.averageRating?.toFixed(1) || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{course.totalEnrolled || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>{course.durationFormatted || '0h'}</span>
            </div>
          </div>

          {/* Level */}
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-600 capitalize">
              Level: {course.level}
            </span>
          </div>

          {/* Price & Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {course.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{course.price}
                </span>
              )}
              <span className="text-xl font-bold text-indigo-600">
                ₹{course.finalPrice || course.price}
              </span>
            </div>

            {isEnrolled ? (
              <button
                onClick={handleCardClick}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-all"
              >
                View Course
              </button>
            ) : course.price === 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnrollClick}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Enroll Free
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnrollClick}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Enroll
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        course={course}
        onSuccess={() => {
          onEnrollSuccess?.();
          setShowEnrollModal(false);
        }}
      />
    </>
  );
};

export default CourseCard;
