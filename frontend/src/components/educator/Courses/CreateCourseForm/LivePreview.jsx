import React from 'react';
import { Star, Users, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LivePreview = ({ courseData, finalPrice }) => {
  const { 
    title, 
    category, 
    level, 
    price, 
    discount, 
    thumbnailPreview, 
    totalDuration, 
    durationUnit,
    description
  } = courseData;

  const displayTitle = title || "Course Title Preview";
  const displayCategory = category || "Category";
  const displayDescription = description || "Your course description will appear here. Start typing to see it in action...";
  const displayDuration = totalDuration ? `${totalDuration} ${durationUnit}` : "0h";

  return (
    <div className="sticky top-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
          <span className="w-8 h-px bg-gray-200 mr-3"></span>
          Live Card Preview
        </h3>
        <div className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded uppercase">
          Real-time
        </div>
      </div>

      <motion.div
        layout
        className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-[340px] mx-auto group"
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-emerald-50 to-sky-100">
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-emerald-300">
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-2">
                <Star className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-tight">Upload Thumbnail</p>
            </div>
          )}
          
          {discount > 0 && price > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-lg">
              -{discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold">5.0</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 min-h-[40px]">
              {displayTitle}
            </h3>
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-y border-gray-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                <Users className="h-3 w-3 text-sky-500" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                <Clock className="h-3 w-3 text-aqua-500" />
                <span>{displayDuration}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Level: {level}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              {discount > 0 && price > 0 && (
                <span className="text-[10px] text-gray-400 line-through font-bold">₹{price}</span>
              )}
              <span className="text-xl font-black text-emerald-600">
                {price === 0 ? 'FREE' : `₹${finalPrice()}`}
              </span>
            </div>

            <button className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-[11px] font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 uppercase tracking-wider">
              Enrolls
            </button>
          </div>
        </div>
      </motion.div>
      
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
        <div className="mt-1">
          <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="text-[10px] text-amber-700 leading-normal font-medium">
          This is exactly how students will see your course in the directory. 
          Make sure your title and thumbnail are eye-catching!
        </p>
      </div>
    </div>
  );
};

export default LivePreview;
