import React from 'react';
import { Plus } from 'lucide-react';

const CoursesHeader = ({ onCreateCourse }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">My Courses</h1>
        <p className="text-gray-500 mt-1 sm:mt-1.5 font-medium text-sm sm:text-base">Manage, track, and scale your educational content</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onCreateCourse}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 active:scale-95 group w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Create New Course</span>
        </button>
      </div>
    </div>
  );
};

export default CoursesHeader;
