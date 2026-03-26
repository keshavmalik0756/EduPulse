import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Star, BookOpen, Clock, FileText, 
  ChevronDown, MoreHorizontal, Edit, Trash2, 
  ExternalLink, BarChart, Play, Pause,
  Unlock, Lock
} from 'lucide-react';
import { 
  getStatusBadge as getStatusBadgeInfo, 
  getLevelBadge as getLevelBadgeInfo, 
  formatDuration 
} from '../utils/courseUtils';

const CourseCard = ({ 
  course, 
  onView, 
  onEdit, 
  onDelete, 
  onTogglePublish, 
  onAnalytics, 
  isSelected,
  onSelect,
  formatCurrency,
  getFinalPrice
}) => {
  const statusInfo = getStatusBadgeInfo(course.status);
  const levelInfo = getLevelBadgeInfo(course.level);

  const StatusIcon = course.status === 'published' ? Play : Pause;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`group bg-white rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'} overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
    >
      {/* Card Header / Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop';
          }}
        />
        
        {/* Selection Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(course.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm transition-transform hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 scale-90 origin-top-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.className}`}>
            {course.status === 'published' ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
            {statusInfo.text}
          </span>
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-sm border border-gray-100 flex items-center">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
            {course.rating.toFixed(1)}
          </div>
        </div>

        {/* View Details Overlay */}
        <div 
          onClick={() => onView(course)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Course
          </motion.button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-grow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2 inline-block">
              {course.category}
            </span>
            <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors" title={course.title}>
              {course.title}
            </h3>
          </div>
          <div className="relative dropdown-container">
            <button
              className="p-1 px-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                // Find and close other dropdowns, toggle this one
                const currentDropdown = e.currentTarget.nextElementSibling;
                const allDropdowns = document.querySelectorAll('.course-dropdown');
                allDropdowns.forEach(d => {
                  if (d !== currentDropdown) d.classList.add('hidden');
                });
                currentDropdown.classList.toggle('hidden');
              }}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 hidden course-dropdown ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(course.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="p-1.5 rounded-lg bg-blue-50 group-hover/item:bg-blue-100 transition-colors text-blue-600">
                  <Edit className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Edit Content</span>
                  <span className="text-[10px] text-gray-400">Update curriculum & info</span>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onTogglePublish(course.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className={`p-1.5 rounded-lg ${course.status === 'published' ? 'bg-orange-50 text-orange-600 group-hover/item:bg-orange-100' : 'bg-green-50 text-green-600 group-hover/item:bg-green-100'} transition-colors`}>
                  {course.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{course.status === 'published' ? 'Unpublish' : 'Publish Now'}</span>
                  <span className="text-[10px] text-gray-400">{course.status === 'published' ? 'Make it a draft' : 'Make it visible'}</span>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onAnalytics(course.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="p-1.5 rounded-lg bg-purple-50 group-hover/item:bg-purple-100 transition-colors text-purple-600">
                  <BarChart className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Analytics</span>
                  <span className="text-[10px] text-gray-400">Performance & revenue</span>
                </div>
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2" />
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(course.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="p-1.5 rounded-lg bg-red-50 group-hover/item:bg-red-100 transition-colors text-red-600">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Delete Permanently</span>
                  <span className="text-[10px] text-red-400">This action is irreversible</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-gray-50/80 group-hover:bg-blue-50/50 transition-colors">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" /> Students
            </span>
            <span className="text-sm font-bold text-gray-900">{course.students.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-gray-50/80 group-hover:bg-green-50/50 transition-colors">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" /> Revenue
            </span>
            <span className="text-sm font-bold text-green-600">{formatCurrency(course.revenue)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 gap-1.5">
              <div className="p-1 rounded-md bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-3 h-3 text-gray-600 group-hover:text-blue-600" />
              </div>
              <span>{course.modules} Sections</span>
            </div>
            <div className="flex items-center text-gray-500 gap-1.5">
              <div className="p-1 rounded-md bg-gray-100 group-hover:bg-purple-100 transition-colors">
                <Clock className="w-3 h-3 text-gray-600 group-hover:text-purple-600" />
              </div>
              <span className="truncate max-w-[80px]">{formatDuration(course.duration)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 gap-1.5">
              <div className="p-1 rounded-md bg-gray-100 group-hover:bg-orange-100 transition-colors">
                <FileText className="w-3 h-3 text-gray-600 group-hover:text-orange-600" />
              </div>
              <span>{course.notesCount || 0} Notes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${levelInfo.className}`}>
                {levelInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Current Price</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">
              {course.originalPrice === 0 ? 'FREE' : formatCurrency(getFinalPrice(course))}
            </span>
            {course.discountPercentage > 0 && (
              <span className="text-xs text-gray-400 line-through decoration-red-400/50">
                {formatCurrency(course.originalPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Last Active</span>
          <span className="text-xs font-semibold text-gray-700">{course.lastUpdated}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
