import React from 'react';
import { BookOpen, Tag, Users, Globe, ChevronDown, X } from 'lucide-react';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Artificial Intelligence',
  'Business', 'Design', 'Marketing', 'Music', 'Photography', 'Lifestyle',
  'Health & Fitness', 'Academics', 'Language Learning', 'Personal Development',
  'Finance', 'Gaming', 'Cybersecurity', 'Other'
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all-levels', label: 'All Levels' }
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Korean', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Other'
];

const BasicInfo = ({ courseData, handleInputChange, errors, tagInput, setTagInput, addTag, removeTag }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Course Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all ${
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="e.g. Advanced React Architecture 2024"
              maxLength={120}
            />
          </div>
          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-xs text-red-600 font-medium">{errors.title}</p>
            ) : (
              <p className="text-xs text-gray-400">Be clear and descriptive. (Max 120)</p>
            )}
            <span className="text-xs text-gray-400">{courseData.title.length}/120</span>
          </div>
        </div>

        {/* Subtitle */}
        <div className="md:col-span-2">
          <label htmlFor="subTitle" className="block text-sm font-semibold text-gray-700 mb-2">
            Subtitle / Short Description
          </label>
          <input
            type="text"
            id="subTitle"
            name="subTitle"
            value={courseData.subTitle}
            onChange={handleInputChange}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
            placeholder="A brief, compelling hook for your course..."
            maxLength={250}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Summarize the main benefit of your course. (Max 250)</p>
            <span className="text-xs text-gray-400">{courseData.subTitle.length}/250</span>
          </div>
        </div>

        {/* Category */}
        <div className="relative">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleInputChange}
              className={`block w-full pl-4 pr-10 py-3 border rounded-xl shadow-sm appearance-none focus:ring-2 focus:ring-sky-500 transition-all ${
                errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.category && <p className="mt-1 text-xs text-red-600 font-medium">{errors.category}</p>}
        </div>

        {/* Sub-Category */}
        <div>
          <label htmlFor="subCategory" className="block text-sm font-semibold text-gray-700 mb-2">
            Sub-Category
          </label>
          <input
            type="text"
            id="subCategory"
            name="subCategory"
            value={courseData.subCategory}
            onChange={handleInputChange}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
            placeholder="e.g. Frontend Development"
          />
        </div>

        {/* Level */}
        <div className="relative">
          <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
            Target Level
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="level"
              name="level"
              value={courseData.level}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm appearance-none focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Language */}
        <div className="relative">
          <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
            Primary Language
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="language"
              name="language"
              value={courseData.language}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm appearance-none focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Course Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            {courseData.tags.length > 0 ? (
              courseData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 transition-all hover:bg-emerald-200 animate-in zoom-in-50 duration-200"
                >
                  <Tag className="h-3 w-3 mr-1.5" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-emerald-900 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">No tags added yet...</span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all"
                placeholder="Type tag and press Enter..."
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Description Full */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            rows={6}
            className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all ${
              errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Deep dive into what this course offers..."
            maxLength={5000}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
            <span className="text-xs text-gray-400 ml-auto">{courseData.description.length}/5000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
