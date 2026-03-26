import React from 'react';
import { Upload, X, Video, Image as ImageIcon, AlertCircle } from 'lucide-react';

const MediaAssets = ({ 
  courseData, 
  handleFileChange, 
  handleDrag, 
  removeFile, 
  dragActive, 
  bannerDragActive,
  fileInputRef,
  bannerInputRef,
  handleInputChange,
  errors 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Thumbnail Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-sky-500" />
            Course Thumbnail <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] cursor-pointer ${
              dragActive 
                ? 'border-sky-500 bg-sky-50' 
                : 'border-gray-200 hover:border-sky-400 hover:bg-gray-50'
            }`}
            onDragEnter={(e) => handleDrag(e, 'thumbnail')}
            onDragLeave={(e) => handleDrag(e, 'thumbnail')}
            onDragOver={(e) => handleDrag(e, 'thumbnail')}
            onDrop={(e) => handleFileChange(e, 'thumbnail')}
            onClick={() => !courseData.thumbnailPreview && fileInputRef.current.click()}
          >
            {courseData.thumbnailPreview ? (
              <div className="w-full h-full relative group">
                <img
                  src={courseData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile('thumbnail'); }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg transform scale-90 group-hover:scale-100 duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-sky-50 rounded-full inline-flex group-hover:bg-sky-100 transition-colors duration-300">
                  <Upload className="w-8 h-8 text-sky-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Click or drag to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                  <p className="text-xs text-gray-400 mt-0.5">Recommended: 1280x720 (16:9)</p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnail')}
            />
          </div>
          {errors.thumbnail && (
            <div className="flex items-center text-xs text-red-600 font-medium mt-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.thumbnail}
            </div>
          )}
        </div>

        {/* Banner Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-aqua-500" />
            Course Banner <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <div
            className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] cursor-pointer ${
              bannerDragActive 
                ? 'border-aqua-500 bg-aqua-50' 
                : 'border-gray-200 hover:border-aqua-400 hover:bg-gray-50'
            }`}
            onDragEnter={(e) => handleDrag(e, 'banner')}
            onDragLeave={(e) => handleDrag(e, 'banner')}
            onDragOver={(e) => handleDrag(e, 'banner')}
            onDrop={(e) => handleFileChange(e, 'banner')}
            onClick={() => !courseData.bannerPreview && bannerInputRef.current.click()}
          >
            {courseData.bannerPreview ? (
              <div className="w-full h-full relative group">
                <img
                  src={courseData.bannerPreview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile('banner'); }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg transform scale-90 group-hover:scale-100 duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-aqua-50 rounded-full inline-flex group-hover:bg-aqua-100 transition-colors duration-300">
                  <Upload className="w-8 h-8 text-aqua-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Upload background banner</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP (Max 10MB)</p>
                  <p className="text-xs text-gray-400 mt-0.5">Wide format recommended for course header</p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
            />
          </div>
        </div>

        {/* Video Preview URL */}
        <div className="md:col-span-2 space-y-3">
          <label htmlFor="previewVideo" className="block text-sm font-bold text-gray-700 flex items-center">
            <Video className="w-4 h-4 mr-2 text-emerald-500" />
            Promo Video URL
          </label>
          <div className="flex flex-col sm:flex-row shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
            <span className="inline-flex items-center px-4 py-3 bg-gray-50 text-gray-500 border-b sm:border-b-0 sm:border-r border-gray-200">
              <span className="text-xs font-bold font-mono tracking-tight">HTTPS://</span>
            </span>
            <input
              type="text"
              id="previewVideo"
              name="previewVideo"
              value={courseData.previewVideo}
              onChange={handleInputChange}
              className="flex-1 block w-full px-4 py-3 bg-white text-gray-900 border-none focus:ring-0 placeholder-gray-400 transition-all"
              placeholder="youtube.com/watch?v=... or vimeo.com/..."
            />
          </div>
          {errors.previewVideo && (
            <p className="text-xs text-red-600 font-medium mt-1">{errors.previewVideo}</p>
          )}
          <div className="flex items-start bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <AlertCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-emerald-700 leading-normal">
              A high-quality promo video can increase your enrollment rate by up to 150%. 
              Paste a direct URL from YouTube or Vimeo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaAssets;
