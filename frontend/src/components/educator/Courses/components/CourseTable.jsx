import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Star, BookOpen, Clock, FileText, 
  Eye, Edit, BarChart, UserCheck, 
  BookA, Video, Globe, CheckCircle, Unlock, Lock
} from 'lucide-react';
import { 
  getStatusBadge as getStatusBadgeInfo, 
  getLevelBadge as getLevelBadgeInfo,
  getEnrollmentStatusBadge as getEnrollmentStatusBadgeInfo
} from '../utils/courseUtils';

const CourseTable = ({ 
  courses, 
  selectedCourses, 
  onSelectCourse, 
  onSelectAll, 
  onView, 
  onEdit, 
  onAnalytics, 
  formatCurrency,
  formatPercentage,
  getFinalPrice,
  formatDuration
}) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-x-auto custom-scrollbar group/table">
        {/* Horizontal Scroll Indicator for Mobile */}
        <div className="md:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 group-hover/table:opacity-0 transition-opacity" />
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedCourses.size === courses.length && courses.length > 0}
                  onChange={onSelectAll}
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
            {courses.map((course, index) => (
              <motion.tr
                key={course.id}
                className="hover:bg-blue-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course.id)}
                    onChange={() => onSelectCourse(course.id)}
                    className="rounded text-blue-500 focus:ring-blue-400"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center min-w-[300px]">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="flex-shrink-0 h-16 w-24 object-cover rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="flex-shrink-0 h-16 w-24 bg-blue-100 rounded-md flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 line-clamp-1">
                        {course.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{course.description}</div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">by {course.instructor}</span>
                        <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> {course.language}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{course.category}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(() => {
                      const level = getLevelBadgeInfo(course.level);
                      const enrollment = getEnrollmentStatusBadgeInfo(course.enrollmentStatus);
                      return (
                        <>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${level.className}`}>
                            {level.text}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${enrollment.className}`}>
                            {enrollment.text}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center font-semibold text-gray-900">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                      {course.students.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center">
                      <UserCheck className="w-3 h-3 mr-1 text-green-500" />
                      {formatPercentage(course.completionRate)} Comp.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    {course.discountPercentage > 0 ? (
                      <>
                        <span className="font-bold text-gray-900">{formatCurrency(getFinalPrice(course))}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400 line-through">{formatCurrency(course.originalPrice)}</span>
                          <span className="text-[10px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-bold">
                            -{course.discountPercentage}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">
                        {course.originalPrice === 0 ? 'FREE' : formatCurrency(course.originalPrice)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const status = getStatusBadgeInfo(course.status);
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${status.className}`}>
                        {course.status === 'published' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {status.text}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    {course.rating > 0 ? (
                      <div className="flex items-center font-bold text-gray-900">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1.5" />
                        {course.rating.toFixed(1)}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No ratings</span>
                    )}
                    <div className="text-[10px] text-gray-400 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {course.views.toLocaleString()} views
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="flex items-center text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">
                      <BookA className="w-2.5 h-2.5 mr-1 text-blue-500" />
                      {course.modules} Sec
                    </div>
                    <div className="flex items-center text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">
                      <Video className="w-2.5 h-2.5 mr-1 text-purple-500" />
                      {course.lectures} Lec
                    </div>
                    <div className="flex items-center text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">
                      <FileText className="w-2.5 h-2.5 mr-1 text-orange-500" />
                      {course.notesCount || 0} Note
                    </div>
                    <div className="flex items-center text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">
                      <Clock className="w-2.5 h-2.5 mr-1 text-gray-500" />
                      {formatDuration(course.duration)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(course)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(course.id)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAnalytics(course.id)}
                      className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Analytics"
                    >
                      <BarChart className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CourseTable;
