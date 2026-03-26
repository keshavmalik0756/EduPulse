import React from 'react';
import CreateCourseForm from './CreateCourseForm';

/**
 * CreateCourses Component
 * 
 * This component serves as the main entry point for the course creation flow.
 * It has been refactored into a modular, multi-step wizard found in the 
 * /CreateCourseForm directory for better maintainability and UX.
 */
const CreateCourses = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-emerald-900 via-sky-900 to-emerald-900 bg-clip-text text-transparent tracking-tight">
              Craft Your Course
            </h1>
            <p className="text-gray-500 font-medium text-base lg:text-lg max-w-2xl">
              Turn your expertise into a world-class learning experience. 
              Follow our guided process to launch your curriculum.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">
              4 Steps to Launch
            </span>
          </div>
        </div>

        <CreateCourseForm />
      </div>
    </div>
  );
};

export default CreateCourses;