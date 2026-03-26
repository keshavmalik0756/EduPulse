import React from 'react';
import { CreditCard, Tag, Percent, Info, Lock, Unlock, Zap, CheckCircle, Globe } from 'lucide-react';

const ENROLLMENT_OPTIONS = [
  { value: 'open', label: 'Open Enrollment', icon: <Unlock className="w-5 h-5 text-emerald-500" />, desc: 'Students can enroll anytime' },
  { value: 'closed', label: 'Closed Enrollment', icon: <Lock className="w-5 h-5 text-red-500" />, desc: 'Enrollment is currently closed' }
];

const PricingEnrollment = ({ courseData, handleInputChange, errors, finalPrice, calculateSavings }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Price & Discount Card */}
      <div className="p-8 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/50 rounded-3xl border border-emerald-100/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CreditCard className="w-32 h-32 text-emerald-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="price" className="block text-sm font-bold text-gray-700 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-emerald-500" />
                Base Price (₹)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <span className="font-bold text-lg">₹</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`block w-full pl-10 pr-4 py-4 bg-white border rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-xl ${
                    errors.price ? 'border-red-300 ring-red-50' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.price && <p className="text-xs text-red-600 font-medium px-1">{errors.price}</p>}
            </div>

            <div className="space-y-3">
              <label htmlFor="discount" className="block text-sm font-bold text-gray-700 flex items-center">
                <Percent className="w-4 h-4 mr-2 text-sky-500" />
                Discount Percentage (%)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={courseData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`block w-full pr-12 py-4 bg-white border rounded-2xl shadow-sm focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-lg ${
                    errors.discount ? 'border-red-300 ring-red-50' : 'border-gray-200 hover:border-sky-300'
                  }`}
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold group-focus-within:text-sky-500 transition-colors">
                  %
                </div>
              </div>
              {errors.discount && <p className="text-xs text-red-600 font-medium px-1">{errors.discount}</p>}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-emerald-100 group transition-all duration-300 hover:border-emerald-300 hover:shadow-lg">
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Final Student Price</p>
              <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                <span className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                  {courseData.price === 0 ? 'FREE' : `₹${finalPrice()}`}
                </span>
                {courseData.discount > 0 && courseData.price > 0 && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 line-through">₹{courseData.price}</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center">
                      <Zap className="w-3 h-3 mr-1 fill-emerald-500" />
                      Save ₹{calculateSavings()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-sky-50/50 rounded-xl border border-sky-100">
              <Info className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-sky-700 leading-normal">
                Course prices ending in 9 (e.g., ₹499) often perform better. 
                Discounts between 20-50% are most effective for new courses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment & Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">Enrollment Window</label>
          <div className="grid grid-cols-1 gap-4">
            {ENROLLMENT_OPTIONS.map((option) => (
              <label 
                key={option.value} 
                className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  courseData.enrollmentStatus === option.value
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-xl mr-4 ${
                      courseData.enrollmentStatus === option.value ? 'bg-white shadow-sm' : 'bg-gray-50'
                    }`}>
                      {option.icon}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${
                        courseData.enrollmentStatus === option.value ? 'text-emerald-900' : 'text-gray-700'
                      }`}>{option.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="enrollmentStatus"
                    value={option.value}
                    checked={courseData.enrollmentStatus === option.value}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 transition-all cursor-pointer"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-bold text-gray-700">Course Visibility & Promotion</label>
          <div className={`p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 ${
            courseData.isFeatured 
              ? 'border-amber-400 bg-amber-50/30' 
              : 'border-gray-100 bg-white hover:border-amber-200'
          }`}>
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              checked={courseData.isFeatured}
              onChange={handleInputChange}
              className="mt-1 h-6 w-6 text-amber-500 focus:ring-amber-500 border-gray-300 rounded-lg cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="isFeatured" className="block text-sm font-extrabold text-gray-800 cursor-pointer flex items-center">
                Feature on Homepage
                {courseData.isFeatured && <CheckCircle className="w-3 h-3 ml-2 text-amber-500 fill-amber-500" />}
              </label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Featured courses get up to 3x more visibility. Your course will be highlighted in the "Top Rated" 
                and "Recommended" sections for new students.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Zap className="w-5 h-5 text-sky-500 fill-sky-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-900">AI Boost Enabled</p>
              <p className="text-[10px] text-sky-700">Your pricing will be optimized via our algorithm.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="pt-8 border-t border-gray-100">
        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
          <Globe className="w-4 h-4 mr-2" />
          Search Engine Optimization (SEO)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="metaTitle" className="block text-xs font-bold text-gray-700">Meta Title</label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              value={courseData.metaTitle}
              onChange={handleInputChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all text-sm"
              placeholder="Appears in Google search chips..."
            />
            <p className="text-[10px] text-gray-400 text-right">{courseData.metaTitle.length}/60</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="metaDescription" className="block text-xs font-bold text-gray-700">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={courseData.metaDescription}
              onChange={handleInputChange}
              rows={2}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all text-sm"
              placeholder="Brief summary for search engines..."
            />
            <p className="text-[10px] text-gray-400 text-right">{courseData.metaDescription.length}/160</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingEnrollment;

