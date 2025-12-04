import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, X, Upload, Play, BookOpen, 
  Clock, AlertCircle, CheckCircle, Trash2,
  Book, ArrowLeft,
  ChevronDown, Video, File, Sparkles,
  Zap, Target, Award, Users, Eye, 
  Palette, Music, Globe, Heart,
  Star, TrendingUp, Lightbulb, Rocket
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import lectureService from '../../../services/lectureService';
import sectionService from '../../../services/sectionService';

// ====================== REUSABLE COMPONENTS ======================
// --- 1. Enhanced Accordion Section Component with Animation ---
const AccordionSection = ({ title, icon: Icon, color, isOpen, toggle, children, description }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-50 to-blue-100', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200', glow: 'shadow-blue-100' },
    green: { bg: 'from-green-50 to-green-100', icon: 'bg-green-100 text-green-600', border: 'border-green-200', glow: 'shadow-green-100' },
    purple: { bg: 'from-purple-50 to-purple-100', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200', glow: 'shadow-purple-100' },
    amber: { bg: 'from-amber-50 to-amber-100', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200', glow: 'shadow-amber-100' },
    teal: { bg: 'from-teal-50 to-teal-100', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200', glow: 'shadow-teal-100' },
    rose: { bg: 'from-rose-50 to-rose-100', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-200', glow: 'shadow-rose-100' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div 
      className={`bg-white rounded-2xl shadow-xl border-2 ${colors.border} overflow-hidden transition-all duration-300 hover:shadow-2xl`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div
        className={`flex justify-between items-center p-4 sm:p-6 cursor-pointer bg-gradient-to-r ${colors.bg} transition-all duration-200`}
        onClick={toggle}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 ${colors.icon} rounded-xl shadow-sm ${isOpen ? 'ring-2 ring-blue-300' : ''}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              {title}
              {isOpen && <Zap className="ml-2 text-amber-500 w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />}
            </h2>
            {description && <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        <motion.div 
          className={`p-1 sm:p-2 rounded-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- 2. Enhanced Input Field with Floating Label ---
const InputField = ({ label, name, value, onChange, placeholder, maxLength, type = 'text', hint, error, required = false, icon: Icon }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-blue-500" />}
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${Icon ? 'pl-9 sm:pl-10' : ''}`}
        placeholder={placeholder}
      />
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      )}
    </div>
    <div className="flex justify-between mt-1">
      {error && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {error}</p>}
      {hint && <p className="text-sm text-gray-500 ml-auto">{hint}</p>}
      {maxLength && (
        <p className={`text-sm ml-auto ${value?.length > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
          {value?.length || 0}/{maxLength}
        </p>
      )}
    </div>
  </div>
);

// --- 3. Enhanced Textarea with Character Counter ---
const TextAreaField = ({ label, name, value, onChange, placeholder, maxLength, hint, error, required = false, rows = 4 }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      maxLength={maxLength}
      className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
      placeholder={placeholder}
    />
    <div className="flex justify-between mt-1">
      {error && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {error}</p>}
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      <p className={`text-sm ml-auto ${value?.length > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
        {value?.length || 0}/{maxLength}
      </p>
    </div>
  </div>
);

// --- 4. Enhanced File Drop Zone with Preview and Progress ---
const FileDropZone = ({ title, fieldName, preview, fileRef, dragActive, handleDrag, handleDrop, handleFileChange, removeFile, color, accept, error }) => {
  const isImage = fieldName.includes('thumbnail');
  
  // Define color classes for styling
  const colorClasses = {
    blue: { border: 'border-blue-500', bg: 'bg-blue-50', glow: 'shadow-blue-100' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-50', glow: 'shadow-purple-100' }
  };
  
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="relative">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <Upload className="w-4 h-4 mr-2 text-blue-500" />
        {title}
      </label>
      <div
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all min-h-[150px] sm:min-h-[200px] flex flex-col justify-center relative overflow-hidden ${
          dragActive 
            ? `${colors.border} ${colors.bg} ${colors.glow} shadow-lg` 
            : error 
              ? 'border-red-500 bg-red-50 hover:border-red-600' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && fileRef.current?.click()}
        id={`${fieldName}-dropzone`}
        tabIndex={0}
        role="button"
        aria-label={`Upload ${title}`}
      >
        {preview ? (
          <div className="relative h-full flex flex-col">
            {isImage ? (
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={preview.preview || preview}
                  alt={`${fieldName} preview`}
                  className="max-h-32 sm:max-h-40 rounded-lg object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
                <Video className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-full">{preview.name}</p>
                <p className="text-xs text-gray-500 mt-1">{Math.round(preview.size / 1024)} KB</p>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              aria-label="Remove file"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <motion.div
              animate={{ 
                scale: dragActive ? 1.1 : 1,
                rotate: dragActive ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className={`mx-auto h-8 w-8 sm:h-10 sm:w-10 ${error ? 'text-red-500' : 'text-gray-400'}`} />
            </motion.div>
            <div className="flex flex-col text-xs sm:text-sm text-gray-600">
              <span className={`font-medium ${error ? 'text-red-600' : 'text-blue-600'}`}>
                Click to upload
              </span>
              <span>or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              {accept === 'video/*' ? 'MP4, WebM, OGG (Max 500MB)' : 'JPEG, PNG, GIF, WebP (Max 5MB)'}
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept={accept}
          onChange={(e) => handleFileChange(e, fieldName)}
          id={fieldName}
          aria-describedby={`${fieldName}-help`}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 font-medium text-center flex items-center justify-center"><AlertCircle className="w-4 h-4 mr-1" /> {error}</p>}
      <p id={`${fieldName}-help`} className="mt-2 text-xs text-gray-500 text-center">
        {accept === 'video/*' ? 'MP4, WebM, OGG (Max 500MB)' : 'JPEG, PNG, GIF, WebP (Max 5MB)'}
      </p>
    </div>
  );
};

// --- 5. Enhanced Stats Preview Card with Animation ---
const StatsPreviewCard = ({ icon: Icon, title, value, color, truncate = false, isLoading = false }) => (
  <motion.div 
    className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all"
    whileHover={{ y: -3 }}
    transition={{ type: "spring", stiffness: 400 }}
  >
    <div className="flex items-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div className="ml-2 sm:ml-3 overflow-hidden">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        {isLoading ? (
          <div className="h-3 sm:h-4 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className={`font-medium text-gray-900 text-sm sm:text-base ${truncate ? 'truncate max-w-[100px] sm:max-w-[120px]' : ''}`}>
            {value || 'Not set'}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

// --- 6. Difficulty Selector with Select Dropdown ---
const DifficultySelector = ({ value, onChange }) => {
  const difficulties = [
    {
      value: "beginner",
      label: "Beginner",
      description: "Lay your foundation strong",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Sharpen your growing edge",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Push limits, master excellence",
    },
  ];

  return (
    <div className="difficulty-selector-container space-y-3 sm:space-y-4">
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        <Star className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
        <span className="truncate">Difficulty Level</span>
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) =>
            onChange({ target: { name: "difficulty", value: e.target.value } })
          }
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     appearance-none bg-white text-sm sm:text-base"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label} – {difficulty.description}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 sm:px-3 text-gray-700">
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100 shadow-sm">
        <p className="text-xs sm:text-sm text-gray-700 leading-tight">
          <strong className="text-blue-600">
            {difficulties.find((d) => d.value === value)?.label}
          </strong>{" "}
          – {difficulties.find((d) => d.value === value)?.description}
        </p>
      </div>
    </div>
  );
};

// --- 7. Enhanced Toggle Switch with Prominent Visual Feedback ---
const ToggleSwitch = ({ label, name, checked, onChange, description }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a synthetic event object that matches what the parent component expects
    const syntheticEvent = {
      target: {
        name: name,
        value: !checked,
        type: 'checkbox',
        checked: !checked
      }
    };
    
    // Call the onChange handler with the synthetic event
    onChange(syntheticEvent);
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
        {/* Toggle Visual Indicator */}
        <div className="flex-shrink-0 relative">
          <div className={`relative w-16 h-8 sm:w-20 sm:h-10 rounded-full transition-all duration-300 ease-in-out ${
            checked 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg' 
              : 'bg-gray-300 shadow-inner'
          }`}>
            <div className={`absolute top-0.5 sm:top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white transition-all duration-300 ease-in-out shadow-md flex items-center justify-center ${
              checked ? 'left-9 sm:left-11 transform scale-110' : 'left-0.5 sm:left-1 scale-100'
            }`}>
              {checked ? (
                <svg className="h-3 w-3 sm:h-5 sm:w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
            checked 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-gray-500 text-white shadow'
          }`}>
            {checked ? 'FREE' : 'PAID'}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center mb-1 sm:mb-2">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600" />
            <label htmlFor={name} className="block text-base sm:text-lg font-bold text-gray-800">
              {label}
            </label>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{description}</p>
          
          {/* Interactive Status Indicator */}
          <div className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
            checked 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 animate-pulse ${
              checked ? 'bg-green-500' : 'bg-gray-500'
            }`}></span>
            {checked ? 'This lecture is FREE for all students' : 'This lecture is only for enrolled students'}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleClick}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
              checked
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow hover:shadow-md'
            }`}
            id={name}
            aria-labelledby={name}
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={false}
          >
            {checked ? 'Make Paid' : 'Make Free'}
          </button>
        </div>
      </div>
      
      {/* Animated Wave Effect when toggled */}
      {checked && (
        <div className="mt-3 sm:mt-4 flex items-center">
          <div className="flex-grow h-0.5 sm:h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full overflow-hidden">
            <div className="h-full bg-white opacity-30 animate-pulse"></div>
          </div>
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs font-bold text-green-600">UNLOCKED</span>
        </div>
      )}
    </div>
  );
};

// Helper function to format seconds to "x h y m" format
const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}m`;
  }
};

// Helper function to convert seconds to hours/minutes input format
const secondsToHM = (seconds) => {
  if (!seconds) return { hours: 0, minutes: 0 };
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return { hours, minutes: remainingMinutes };
};

// Helper function to convert hours/minutes to seconds
const hmToSeconds = (hours, minutes) => {
  return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60;
};

const CreateLecture = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get courseId from route params or URL search params
  const getCourseId = () => {
    // First priority: courseId from route parameters
    if (courseId) return courseId;
    
    // Second priority: courseId from URL search parameters
    const params = new URLSearchParams(location.search);
    return params.get('courseId');
  };
  
  const effectiveCourseId = getCourseId();

  const videoFileRef = useRef(null);
  const thumbnailFileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [lecture, setLecture] = useState({
    title: '',
    description: '',
    durationHours: 0,
    durationMinutes: 0,
    duration: 0, // Store as seconds
    order: '',
    difficulty: 'beginner',
    isPreviewFree: false,
    sectionName: ''
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});
  const isMounted = useRef(false);

  // Memoize expanded sections to prevent unnecessary re-renders
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true
  });

  const [dragActive, setDragActive] = useState(false);
  const [thumbnailDragActive, setThumbnailDragActive] = useState(false);

  // --- 📡 Data Fetching and Initial State Setup ---
  useEffect(() => {
    isMounted.current = true;
    
    // Initialize with location state if available
    if (location.state) {
      const { sectionId, sectionName } = location.state;
      if (sectionName) {
        setLecture(prev => ({
          ...prev,
          sectionName: sectionName
        }));
      }
    }
    
    // We no longer need to fetch course data since we removed the Content & Notes and Additional Resources sections
    // Just set loading to false immediately
    setLoading(false);
    
    return () => {
      isMounted.current = false;
    };
  }, [location.state]);
  
  // --- ⚙️ Handlers and Validation ---
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const validateForm = useCallback(() => {
    let newErrors = {};
    let isValid = true;
    
    if (!lecture.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!lecture.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    const durationSeconds = hmToSeconds(lecture.durationHours, lecture.durationMinutes);
    if (durationSeconds <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
      isValid = false;
    }
    
    const orderValue = parseInt(lecture.order, 10);
    if (isNaN(orderValue) || orderValue < 1) {
      newErrors.order = 'Order must be at least 1';
      isValid = false;
    }
    
    if (!lecture.sectionName?.trim()) {
      newErrors.sectionName = 'Section name is required.';
      isValid = false;
    }
    
    // Video file is now optional - educators can add it later
    // if (!videoFile) {
    //   newErrors.video = 'Video file is required';
    //   isValid = false;
    //   setExpandedSections(prev => ({ ...prev, media: true }));
    // }
    
    setErrors(newErrors);
    return { isValid, newErrors };
  }, [lecture]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle duration inputs separately
    if (name === 'durationHours') {
      const hours = parseInt(value) || 0;
      setLecture(prev => ({
        ...prev,
        durationHours: hours,
        duration: hmToSeconds(hours, prev.durationMinutes)
      }));
    } else if (name === 'durationMinutes') {
      const minutes = parseInt(value) || 0;
      setLecture(prev => ({
        ...prev,
        durationMinutes: minutes,
        duration: hmToSeconds(prev.durationHours, minutes)
      }));
    } else {
      setLecture(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateFile = useCallback((file, type) => {
    // File size and type validation logic remains here
    let maxSize, maxSizeText;
    if (type === 'video') {
      maxSize = 500 * 1024 * 1024; // 500MB
      maxSizeText = '500MB';
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB
      maxSizeText = '5MB';
    }
    
    if (file.size > maxSize) {
      toast.error(`${type} file is too large. Maximum size is ${maxSizeText}.`);
      return false;
    }
    
    // Additional check to ensure video files have a valid size
    if (type === 'video' && file.size <= 0) {
      toast.error('Video file is invalid or empty. Please select a valid video file.');
      return false;
    }
    
    const validTypes = type === 'video' 
      ? ['video/mp4', 'video/webm', 'video/ogg'] 
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
    if (!validTypes.includes(file.type)) {
      toast.error(`Please upload a valid ${type} file.`);
      return false;
    }
    
    return true;
  }, []);

  const handleFileChange = useCallback((e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const file = files[0];

    if (!file) return;

    if (fieldName === 'video') setDragActive(false);
    if (fieldName === 'thumbnail') setThumbnailDragActive(false);

    const fileType = fieldName === 'video' ? 'video' : 'image';
    if (validateFile(file, fileType)) {
      if (fieldName === 'video') {
        // Create a preview object for the video file with all necessary properties
        const videoPreview = {
          name: file.name,
          size: file.size,
          file: file // Store the actual file for submission
        };
        
        // Additional validation to ensure we have a valid video file
        if (file.size <= 0) {
          toast.error('Selected video file is empty. Please select a valid video file.');
          setErrors(prev => ({ ...prev, video: 'Selected video file is empty.' }));
          return;
        }
        
        setVideoFile(videoPreview);
        setErrors(prev => ({ ...prev, video: '' }));
      } else if (fieldName === 'thumbnail') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailFile({
            file: file,
            preview: reader.result
          });
          setErrors(prev => ({ ...prev, thumbnail: '' }));
        };
        reader.readAsDataURL(file);
      }
    }
  }, [validateFile]);

  const handleDrag = useCallback((e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (fieldName === 'video') setDragActive(true);
      if (fieldName === 'thumbnail') setThumbnailDragActive(true);
    } else if (e.type === "dragleave") {
      if (fieldName === 'video') setDragActive(false);
      if (fieldName === 'thumbnail') setThumbnailDragActive(false);
    }
  }, []);

  const removeFile = useCallback((fieldName) => {
    if (fieldName === 'video') {
      setVideoFile(null);
      if (videoFileRef.current) videoFileRef.current.value = '';
      setErrors(prev => ({ ...prev, video: '' }));
    } else if (fieldName === 'thumbnail') {
      setThumbnailFile(null);
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.thumbnail;
        return newErrors;
      });
    }
  }, []);

  // Memoize form data to prevent unnecessary re-renders
  const formData = useMemo(() => {
    const durationSeconds = hmToSeconds(lecture.durationHours, lecture.durationMinutes);
    
    return {
      title: lecture.title.trim(),
      description: lecture.description.trim(),
      duration: durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      order: parseInt(lecture.order, 10),
      difficulty: lecture.difficulty,
      isPreviewFree: lecture.isPreviewFree,
      sectionName: lecture.sectionName?.trim()
    };
  }, [lecture]);

  // --- 💾 Submission Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      toast.error('Please fix the errors before saving.');
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField && firstErrorField !== 'video') { 
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
        }
      }
      return;
    }
    
    // Validate video file if one is provided
    if (videoFile && (!videoFile.file || videoFile.file.size <= 0)) {
      toast.error('Please select a valid video file.');
      setErrors(prev => ({ ...prev, video: 'Please select a valid video file.' }));
      setExpandedSections(prev => ({ ...prev, media: true }));
      return;
    }
    
    try {
      setSaving(true);
      setUploadProgress(0);
      
      // Get or create section with retry logic
      let sectionId = null;
      if (lecture.sectionName) {
        try {
          // First, try to find an existing section with this name in the course
          const sectionsResponse = await sectionService.getSectionsByCourse(effectiveCourseId);
          if (sectionsResponse.success) {
            const existingSection = sectionsResponse.sections.find(
              section => section.title.toLowerCase() === lecture.sectionName.toLowerCase()
            );
          
            if (existingSection) {
              sectionId = existingSection._id;
            } else {
              // Create a new section if one doesn't exist
              const newSectionData = {
                title: lecture.sectionName,
                description: `${lecture.sectionName} section`,
                order: sectionsResponse.sections.length + 1 // Place at the end
              };
              
              // ✅ Clean frontend retry (keeps 3-attempt fallback for safety)
              let sectionId = null;
              let createAttempts = 0;
              const maxAttempts = 3;

              while (!sectionId && createAttempts < maxAttempts) {
                try {
                  const sectionResponse = await sectionService.createSection(effectiveCourseId, newSectionData);
                  if (sectionResponse.success && sectionResponse.section?._id) {
                    sectionId = sectionResponse.section._id;
                    break;
                  }
                } catch (err) {
                  if (createAttempts < maxAttempts - 1) {
                    await new Promise(r => setTimeout(r, 200 * Math.pow(2, createAttempts)));
                    createAttempts++;
                    continue;
                  } else {
                    throw err;
                  }
                }
              }
            }
          }
        } catch (sectionError) {
          console.error('Error handling section:', sectionError);
          toast.error(`Failed to process section: ${sectionError.message || 'Please try again.'}`);
          return;
        }
      }
    
    if (!sectionId) {
      toast.error('Section is required for creating a lecture.');
      return;
    }
    
    // Duration is already in seconds from hmToSeconds calculation
    const durationSeconds = lecture.duration;
    
    // Prepare FormData
    const submitData = new FormData();
    submitData.append('title', lecture.title);
    submitData.append('description', lecture.description);
    submitData.append('duration', durationSeconds);
    submitData.append('order', lecture.order);
    submitData.append('difficulty', lecture.difficulty);
    submitData.append('isPreviewFree', lecture.isPreviewFree);
    submitData.append('courseId', effectiveCourseId);
    submitData.append('sectionId', sectionId); // Add sectionId instead of sectionName
    
    // Add files
    if (videoFile && videoFile.file) {
      // send using backend expected key 'lessonVideo'
      submitData.append('lessonVideo', videoFile.file);
    }

    if (thumbnailFile && thumbnailFile.file) {
      // send using backend expected key 'resource'
      submitData.append('resource', thumbnailFile.file);
    }
    
    // Use lectureService.createLecture
    const response = await lectureService.createLecture(submitData, (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      }
    });
    
    if (response.success) {
      toast.success('Lecture created successfully!');
      // Navigate back to the course view with a success message
      navigate(`/educator/courses/${effectiveCourseId}`, { 
        state: { lectureCreated: true } 
      });
    } else {
      throw new Error(response.message || 'Failed to create lecture');
    }
  } catch (err) {
    console.error('Error creating lecture:', err);
    // Enhanced error handling with more specific messages
    if (err.response && err.response.data && err.response.data.message) {
      // Handle specific validation errors
      if (err.response.data.message.includes('videoSize')) {
        toast.error('The selected video file is invalid. Please select a valid video file with content.');
      } else {
        toast.error(`Error: ${err.response.data.message}`);
      }
    } else if (err.message) {
      toast.error(err.message);
    } else {
      toast.error('Failed to create lecture. Please check your file and try again.');
    }
  } finally {
    setSaving(false);
    setUploadProgress(0);
  }
};

  const handleCancel = () => {
    const targetPath = effectiveCourseId 
      ? `/educator/courses/${effectiveCourseId}`
      : '/educator/lectures';
      
    if (saving) {
      if (window.confirm('Upload in progress. Are you sure you want to cancel?')) {
        navigate(targetPath);
      }
    } else {
      navigate(targetPath);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600 text-base sm:text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .hide-spinner::-webkit-outer-spin-button,
        .hide-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-spinner {
          -moz-appearance: textfield;
        }
        
        /* Responsive adjustments for smaller screens */
        @media (max-width: 359px) {
          .accordion-section {
            padding: 0.75rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          /* Ensure form elements don't overflow on very small screens */
          .difficulty-selector-container {
            max-width: 100%;
            overflow-x: hidden;
          }
          
          .difficulty-selector-container select {
            font-size: 14px; /* Prevent zoom on iOS */
            padding: 0.5rem;
          }
        }
        
        @media (min-width: 360px) and (max-width: 640px) {
          .accordion-section {
            padding: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1025px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Enhanced Header with Animation */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div className="flex-1">
                <button
                  onClick={() => {
                    const targetPath = effectiveCourseId 
                      ? `/educator/courses/${effectiveCourseId}`
                      : '/educator/lectures';
                    navigate(targetPath);
                  }}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 transition-all duration-200 text-xs sm:text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {effectiveCourseId ? 'Back to Course' : 'Back to Lectures'}
                </button>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1.5 sm:mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-amber-500" />
                  Create New Lecture
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">Add a new lecture to your course curriculum</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-amber-200">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-amber-700">Draft Mode</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                <span className="flex items-center"><Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Lecture Creation Progress</span>
                <span>Step 1 of 3</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 sm:h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >
          {/* Enhanced Stats Preview */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Lecture Overview
            </h3>
            <div className="stats-grid grid gap-3 sm:gap-4">
              <StatsPreviewCard icon={Book} title="Title" value={formData.title || 'Not set'} color="blue" truncate={true} />
              <StatsPreviewCard icon={Clock} title="Duration" value={formData.duration ? `${formData.duration} min` : 'Not set'} color="green" />
              <StatsPreviewCard icon={BookOpen} title="Section" value={
                formData.sectionName || 'Not set'
              } color="purple" truncate={true} />
              <StatsPreviewCard icon={Video} title="Video" value={videoFile ? 'Uploaded' : 'Not set'} color="amber" />
            </div>
          </motion.div>

          {/* Basic Information Section */}
          <AccordionSection
            title="Basic Information"
            description="Lecture title, description, and organization"
            icon={BookOpen}
            color="blue"
            isOpen={expandedSections.basic}
            toggle={() => toggleSection('basic')}
          >
            <div className="form-grid grid gap-4 sm:gap-6 overflow-x-hidden">
              {/* Lecture Title */}
              <InputField
                label="Lecture Title *"
                name="title"
                value={lecture.title}
                onChange={handleInputChange}
                required
                maxLength={120}
                error={errors.title}
                hint={`${lecture.title.length}/120 characters`}
                placeholder="Enter lecture title"
              />
              
              {/* Section Name */}
              <div>
                <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Book className="w-4 h-4 mr-2 text-blue-500" />
                  Section Name *
                </label>
                <input
                  type="text"
                  id="sectionName"
                  name="sectionName"
                  value={lecture.sectionName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.sectionName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter section name"
                  maxLength={100}
                  required
                />
                {errors.sectionName && (
                  <p className="mt-1 text-sm text-red-600">{errors.sectionName}</p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500 flex items-center">
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-amber-500" />
                  Enter the name of the section for this lecture
                </p>
              </div>

              {/* Description */}
              <div className="form-grid md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={lecture.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  maxLength={1000}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter lecture description"
                  aria-describedby="description-help"
                />
                <div className="flex flex-wrap justify-between mt-1 gap-2">
                  {errors.description && <p className="text-sm text-red-600" id="description-error">{errors.description}</p>}
                  <p className="text-xs sm:text-sm text-gray-500 ml-auto" id="description-help">{lecture.description.length}/1000 characters</p>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Duration *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="number"
                      name="durationHours"
                      value={lecture.durationHours}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.duration ? 'border-red-500' : 'border-gray-300'} hide-spinner`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={lecture.durationMinutes}
                      onChange={handleInputChange}
                      min="0"
                      max="59"
                      className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.duration ? 'border-red-500' : 'border-gray-300'} hide-spinner`}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Formatted: {formatDuration(formData.duration)}
                </div>
                {errors.duration && (
                  <p id="duration-error" className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>

              {/* Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Order *
                </label>
                <input
                  id="order"
                  type="number"
                  name="order"
                  value={lecture.order}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.order ? 'border-red-500' : 'border-gray-300'} hide-spinner`}
                  placeholder="Enter order number"
                />
                {errors.order && (
                  <p id="order-error" className="mt-1 text-sm text-red-600">{errors.order}</p>
                )}
              </div>
              {/* Difficulty Selector */}
              <div className="form-grid md:col-span-2">
                <div className="difficulty-selector-container">
                  <DifficultySelector 
                    name="difficulty"
                    value={lecture.difficulty} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              {/* Preview Toggle */}
              <div className="form-grid md:col-span-2">
                <ToggleSwitch
                  label="Enable free preview for this lecture"
                  name="isPreviewFree"
                  checked={lecture.isPreviewFree}
                  onChange={handleInputChange}
                  description="Students can watch this lecture without enrolling in the course"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Media Assets Section */}
          <AccordionSection
            title="Media Assets"
            description="Upload video and thumbnail for your lecture"
            icon={Play}
            color="purple"
            isOpen={expandedSections.media}
            toggle={() => toggleSection('media')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Video Upload */}
              <FileDropZone
                title="Lecture Video (500MB Max) - Optional"
                fieldName="video"
                preview={videoFile}
                fileRef={videoFileRef}
                dragActive={dragActive}
                handleDrag={(e) => handleDrag(e, 'video')}
                handleDrop={(e) => handleFileChange(e, 'video')}
                handleFileChange={(e) => handleFileChange(e, 'video')}
                removeFile={() => removeFile('video')}
                color="blue"
                accept="video/*"
                error={errors.video}
              />

              {/* Thumbnail Upload */}
              <FileDropZone
                title="Lecture Thumbnail (5MB Max)"
                fieldName="thumbnail"
                preview={thumbnailFile}
                fileRef={thumbnailFileRef}
                dragActive={thumbnailDragActive}
                handleDrag={(e) => handleDrag(e, 'thumbnail')}
                handleDrop={(e) => handleFileChange(e, 'thumbnail')}
                handleFileChange={(e) => handleFileChange(e, 'thumbnail')}
                removeFile={() => removeFile('thumbnail')}
                color="purple"
                accept="image/*"
              />
            </div>
          </AccordionSection>

          {/* Upload Progress */}
          <AnimatePresence>
            {saving && uploadProgress > 0 && (
              <motion.div 
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full shadow-sm" 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Action Bar */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 sticky bottom-2 sm:bottom-4 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <AnimatePresence>
                {saving && uploadProgress > 0 && (
                  <motion.div 
                    className="flex-1 max-w-md w-full"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    <div className="flex justify-between mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-blue-700">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row justify-between w-full">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 flex items-center"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mt-3 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white rounded-xl shadow-lg text-xs sm:text-sm font-semibold disabled:opacity-50 flex items-center justify-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full mr-1.5 sm:mr-2"
                      ></motion.div>
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Creating Lecture...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Create Lecture
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateLecture;