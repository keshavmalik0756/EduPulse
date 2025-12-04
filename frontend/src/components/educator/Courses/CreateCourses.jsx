import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BookOpen, Upload, Plus, X, Save, ArrowLeft,
  Tag, Clock, Users, Award, Globe,
  Video, CreditCard, Lock, Unlock,
  ChevronDown, ChevronUp, Trash2, Image,
  AlertCircle, Zap, TrendingUp, Target
} from 'lucide-react';

import courseService from '../../../services/courseService';

// ====================== CONSTANTS ======================
const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all-levels', label: 'All Levels' }
];

const ENROLLMENT_OPTIONS = [
  { value: 'open', label: 'Open Enrollment', icon: '🔓', desc: 'Students can enroll anytime' },
  { value: 'closed', label: 'Closed Enrollment', icon: '🔒', desc: 'Enrollment is currently closed' }
];

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Artificial Intelligence',
  'Business', 'Design', 'Marketing', 'Music', 'Photography', 'Lifestyle',
  'Health & Fitness', 'Academics', 'Language Learning', 'Personal Development',
  'Finance', 'Gaming', 'Cybersecurity', 'Other'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Korean', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Other'
];

// Duration units for course length
const DURATION_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

// ====================== HELPER FUNCTIONS ======================
// Helper function for URL validation
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Rupee Icon Component
const RupeeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.66 7H16v2h-2.34c-.59 1.69-2.07 3-3.66 3s-3.07-1.31-3.66-3H4V7h2.34C6.93 5.31 8.41 4 10 4s3.07 1.31 3.66 3zM10 10c.83 0 1.5-.67 1.5-1.5S10.83 7 10 7s-1.5.67-1.5 1.5S9.17 10 10 10z" />
    <path d="M7 13h6l-4 7h-2l4-7z" />
  </svg>
);

// ====================== REUSABLE COMPONENTS ======================
// --- 1. Enhanced Accordion Section Component ---
const AccordionSection = ({ title, icon: Icon, color, isOpen, toggle, children, description }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-50 to-blue-100', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    green: { bg: 'from-green-50 to-green-100', icon: 'bg-green-100 text-green-600', border: 'border-green-200' },
    purple: { bg: 'from-purple-50 to-purple-100', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
    amber: { bg: 'from-amber-50 to-amber-100', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
    teal: { bg: 'from-teal-50 to-teal-100', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200' },
    rose: { bg: 'from-rose-50 to-rose-100', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-200' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-2xl shadow-xl border-2 ${colors.border} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]`}>
      <div
        className={`flex justify-between items-center p-6 cursor-pointer bg-gradient-to-r ${colors.bg} hover:from-${color}-100 hover:to-${color}-200 transition-all duration-200`}
        onClick={toggle}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${colors.icon} rounded-xl shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        <div className={`p-2 rounded-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      {isOpen && (
        <div className="p-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// --- 2. Simple Text/Number Input Field ---
const InputField = ({ label, name, value, onChange, placeholder, maxLength, type = 'text', hint, error, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      maxLength={maxLength}
      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
  </div>
);

// --- 3. File Drop Zone Component ---
const FileDropZone = ({ title, fieldName, preview, fileRef, dragActive, handleDrag, handleDrop, handleFileChange, removeFile, color }) => {
  const isImage = fieldName.includes('thumbnail') || fieldName.includes('banner');

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col justify-center ${dragActive ? `border-${color}-500 bg-${color}-50` : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && fileRef.current.click()}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={`${fieldName} preview`}
              className="mx-auto max-h-48 rounded-lg object-cover w-full"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <div className="flex flex-col text-sm text-gray-600">
              <span className={`font-medium text-${color}-600`}>Click to upload</span>
              <span>or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">{isImage ? 'PNG, JPG, GIF' : 'MP4, MOV'} up to {title.match(/\((\d+)/)?.[1] || '5'}MB</p>
          </div>
        )}
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept={isImage ? "image/*" : "video/*"}
          onChange={(e) => handleFileChange(e, fieldName)}
          required={fieldName === 'thumbnail' && !preview}
        />
      </div>
    </div>
  );
};

// --- 4. List Array Input Component (Prerequisites, Outcomes, Requirements) ---
const ListInputField = ({ field, label, Icon, data, onAdd, onRemove, onChange, errors, placeholder }) => (
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button" onClick={() => onAdd(field)}
        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Item
      </button>
    </div>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" value={item}
              onChange={(e) => onChange(field, index, e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={placeholder}
              maxLength={500} // Frontend check for Mongoose validation
            />
          </div>
          {data.length > 1 && (
            <button
              type="button" onClick={() => onRemove(field, index)}
              className="p-3 text-red-600 hover:text-red-800 bg-red-50 rounded-lg hover:bg-red-100 transition-colors w-full sm:w-auto"
            >
              <Trash2 className="w-5 h-5 mx-auto sm:mx-0" />
            </button>
          )}
        </div>
      ))}
    </div>
    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
    <p className="mt-1 text-sm text-gray-500">Each item is limited to 500 characters.</p>
  </div>
);

// --- 5. Stats Preview Card ---
const StatsPreviewCard = ({ icon: Icon, title, value, color, truncate = false }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
    <div className="flex items-center">
      <div className={`p-2 bg-${color}-100 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="ml-3 overflow-hidden">
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`font-medium text-gray-900 ${truncate ? 'truncate max-w-[120px]' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

// ====================== MAIN COMPONENT ======================
function CreateCourses() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // ====================== STATE ======================
  const [courseData, setCourseData] = useState({
    title: '', subTitle: '', description: '',
    category: '', subCategory: '', level: 'beginner',
    price: 0, discount: 0,
    tags: [],
    thumbnail: null, thumbnailPreview: null,
    banner: null, bannerPreview: null,
    previewVideo: '',
    totalDuration: 0, // Changed from totalDurationMinutes to totalDuration
    durationUnit: 'hours', // Added duration unit
    hasCertificate: true,
    language: 'English',
    prerequisites: [''], learningOutcomes: [''], requirements: [''],
    enrollmentStatus: 'open',
    isFeatured: false,
    metaTitle: '', metaDescription: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const [expandedSections, setExpandedSections] = useState({
    basic: true, media: true, content: true,
    pricing: true, seo: false, advanced: false
  });

  const [dragActive, setDragActive] = useState(false);
  const [bannerDragActive, setBannerDragActive] = useState(false);

  // ====================== INPUT HANDLERS ======================
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    // Auto-trim and ensure numeric type for specific fields
    if (type === 'number') {
      processedValue = Number(value);
    } else if (typeof processedValue === 'string') {
      // Apply max length filtering immediately for better UX
      const maxLengths = {
        title: 120, subTitle: 250, description: 5000,
        metaTitle: 60, metaDescription: 160, previewVideo: 2000
      };
      processedValue = value.slice(0, maxLengths[name] || value.length);
    }

    setCourseData(prev => ({ ...prev, [name]: processedValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Generic handler for list items (prerequisites, outcomes, requirements)
  const handleListItemChange = useCallback((field, index, value) => {
    // Trim item but allow up to 500 chars (per Mongoose schema)
    const trimmedValue = value.slice(0, 500);
    const newArray = [...courseData[field]];
    newArray[index] = trimmedValue;
    setCourseData(prev => ({ ...prev, [field]: newArray }));
  }, [courseData]);

  const addListItem = useCallback((field) => {
    setCourseData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  }, []);

  const removeListItem = useCallback((field, index) => {
    const newArray = [...courseData[field]];
    if (newArray.length > 1) {
      newArray.splice(index, 1);
      setCourseData(prev => ({ ...prev, [field]: newArray }));
    } else if (newArray.length === 1) {
      setCourseData(prev => ({ ...prev, [field]: [''] })); // Keep one empty field
    }
  }, [courseData]);

  const handleTagInput = (e) => setTagInput(e.target.value);

  const addTag = () => {
    if (tagInput.trim() && !courseData.tags.includes(tagInput.trim())) {
      setCourseData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().slice(0, 100)] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Generic file handler with drag & drop support via event delegation
  const handleFileChange = useCallback((e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const file = files[0];

    if (!file) return;

    // Reset drag state
    if (fieldName === 'thumbnail') setDragActive(false);
    if (fieldName === 'banner') setBannerDragActive(false);

    // File validation logic
    if (!file.type.startsWith('image/')) {
      toast.error(`Please select an image file for ${fieldName}.`);
      return;
    }

    const maxSizeMB = fieldName === 'thumbnail' ? 5 : 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`${fieldName} size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCourseData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Preview`]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Generic drag/drop visual handlers
  const handleDrag = useCallback((e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (fieldName === 'thumbnail') setDragActive(true);
      if (fieldName === 'banner') setBannerDragActive(true);
    } else if (e.type === "dragleave") {
      if (fieldName === 'thumbnail') setDragActive(false);
      if (fieldName === 'banner') setBannerDragActive(false);
    }
  }, []);

  const removeFile = (fieldName) => {
    setCourseData(prev => ({
      ...prev,
      [fieldName]: null,
      [`${fieldName}Preview`]: null
    }));
    // Also reset file input reference value for cleanliness
    if (fieldName === 'thumbnail' && fileInputRef.current) fileInputRef.current.value = '';
    if (fieldName === 'banner' && bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // ====================== VALIDATION & SUBMISSION ======================
  const validateForm = () => {
    const newErrors = {};

    const trimmedTitle = courseData.title.trim();
    if (!trimmedTitle) newErrors.title = 'Course title is required';

    if (!courseData.category) newErrors.category = 'Category is required';

    const trimmedDescription = courseData.description.trim();
    if (!trimmedDescription) newErrors.description = 'Description is required';

    if (courseData.price < 0) newErrors.price = 'Price cannot be negative';

    if (courseData.discount < 0 || courseData.discount > 100) newErrors.discount = 'Discount must be between 0 and 100%';

    // Price check: if discount is applied, price must be > 0
    if (courseData.discount > 0 && courseData.price <= 0) {
      newErrors.price = 'Cannot apply a discount to a free course (set price > 0 first).';
    }

    if (courseData.previewVideo && !isValidUrl(courseData.previewVideo.trim())) {
      newErrors.previewVideo = 'Please enter a valid URL for the preview video';
    }

    if (courseData.totalDuration < 0) {
      newErrors.totalDuration = 'Duration cannot be negative';
    }

    // No need to validate field lengths here, as they are handled by input maxLength and the backend schema.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/educator/courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the highlighted errors before submitting.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Convert duration to minutes for backend compatibility
      let totalDurationMinutes = courseData.totalDuration;
      if (courseData.durationUnit === 'hours') {
        totalDurationMinutes = courseData.totalDuration * 60;
      } else if (courseData.durationUnit === 'weeks') {
        totalDurationMinutes = courseData.totalDuration * 7 * 24 * 60;
      } else if (courseData.durationUnit === 'months') {
        totalDurationMinutes = courseData.totalDuration * 30 * 24 * 60;
      }

      // 1. Append Text/Numeric Data
      Object.entries(courseData).forEach(([key, value]) => {
        // Skip files, arrays, preview fields, and duration unit (we'll send converted minutes)
        if (['thumbnail', 'banner', 'tags', 'prerequisites', 'learningOutcomes', 'requirements', 'thumbnailPreview', 'bannerPreview', 'durationUnit'].includes(key)) {
          return;
        }

        // Send the converted duration in minutes
        if (key === 'totalDuration') {
          formData.append('totalDurationMinutes', Number(totalDurationMinutes));
          return;
        }

        if (typeof value === 'boolean') {
          formData.append(key, value);
        } else if (key === 'price' || key === 'discount') {
          formData.append(key, Number(value));
        } else if (typeof value === 'string') {
          formData.append(key, value.trim()); // Trim strings before sending
        }
      });

      // 2. Append JSON Stringified Arrays (Required by backend controller)
      const arrayFields = ['tags', 'prerequisites', 'learningOutcomes', 'requirements'];
      arrayFields.forEach(field => {
        // Filter out empty strings and map to trimmed/sliced values before stringifying
        const cleanArray = courseData[field]
          .filter(item => item.trim().length > 0)
          .map(item => item.trim().slice(0, field === 'tags' ? 100 : 500));

        formData.append(field, JSON.stringify(cleanArray));
      });

      // 3. Append File Data
      if (courseData.thumbnail) formData.append('thumbnail', courseData.thumbnail);
      if (courseData.banner) formData.append('banner', courseData.banner);
      // NOTE: previewVideo is sent as a URL string in the standard loop above.

      // 4. Send Request
      const response = await courseService.createCourse(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      if (response.success) {
        toast.success(response.message || 'Course created successfully!');
        // Emit event to notify other components to refresh their data
        window.dispatchEvent(new CustomEvent('courseUpdated', { detail: { courseId: response.course?._id } }));
        // Ideally navigate to the new course edit page or educator dashboard
        navigate('/educator/courses');
      } else {
        toast.error(response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create course';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ====================== CALCULATION HELPERS ======================
  // Calculate final price for preview
  const finalPrice = () => {
    if (courseData.price === 0) return 0;
    if (courseData.discount > 0) {
      const discountAmount = (courseData.price * courseData.discount) / 100;
      return Math.max(0, Math.round(courseData.price - discountAmount));
    }
    return courseData.price || 0;
  };

  const calculateSavings = () => {
    if (courseData.price === 0 || courseData.discount === 0) return 0;
    return Math.round((courseData.price * courseData.discount) / 100);
  };

  // ====================== RENDER ======================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex-1">
                <button
                  onClick={() => navigate('/educator/courses')}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-all duration-200 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Create New Course
                </h1>
                <p className="text-gray-600 text-lg">Design your curriculum and share your expertise with students worldwide.</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-amber-700">Draft Mode</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Course Creation Progress</span>
                <span>Step 1 of 4</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Enhanced Stats Preview */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Course Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsPreviewCard icon={BookOpen} title="Title" value={courseData.title || 'Not set'} color="blue" truncate={true} />
              <StatsPreviewCard icon={Tag} title="Category" value={courseData.category || 'Not set'} color="green" />
              <StatsPreviewCard icon={Users} title="Level" value={courseData.level} color="purple" />
              <StatsPreviewCard icon={RupeeIcon} title="Price" value={courseData.price === 0 ? 'Free' : `₹${finalPrice()}`} color="amber" />
            </div>
          </div>

          {/* Basic Information Section */}
          <AccordionSection
            title="Basic Information"
            description="Course title, description, and categorization"
            icon={BookOpen}
            color="blue"
            isOpen={expandedSections.basic}
            toggle={() => toggleSection('basic')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title & Subtitle */}
              <InputField
                label="Course Title *"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                required
                maxLength={120}
                error={errors.title}
                hint={`${courseData.title.length}/120 characters`}
              />
              <InputField
                label="Subtitle"
                name="subTitle"
                value={courseData.subTitle}
                onChange={handleInputChange}
                maxLength={250}
                error={errors.subTitle}
                hint={`${courseData.subTitle.length}/250 characters. Brief, compelling summary.`}
              />
              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  id="description" name="description" value={courseData.description} onChange={handleInputChange}
                  required rows={5} maxLength={5000}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Describe what students will learn in this course..."
                />
                <div className="flex flex-wrap justify-between mt-1 gap-2">
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{courseData.description.length}/5000 characters</p>
                </div>
              </div>

              {/* Category & Sub Category */}
              <div className="relative">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  id="category" name="category" value={courseData.category} onChange={handleInputChange} required
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (<option key={category} value={category}>{category}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-1.5 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
              <InputField
                label="Sub Category"
                name="subCategory"
                value={courseData.subCategory}
                onChange={handleInputChange}
                placeholder="e.g., React, Python, UI/UX"
              />

              {/* Level & Language */}
              <div className="relative">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  id="level" name="level" value={courseData.level} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {LEVELS.map((level) => (<option key={level.value} value={level.value}>{level.label}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-1.5 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <p className="mt-1 text-sm text-gray-500">Select the appropriate difficulty level</p>
              </div>
              <div className="relative">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  id="language" name="language" value={courseData.language} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {LANGUAGES.map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-1.5 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tags Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {courseData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text" value={tagInput} onChange={handleTagInput}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add relevant tags and press Enter"
                />
                <button
                  type="button" onClick={addTag}
                  className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Tags help students find your course (Max 100 chars per tag)</p>
            </div>
          </AccordionSection>

          {/* Media Assets Section */}
          <AccordionSection
            title="Media Assets"
            description="Upload thumbnails, banners, and preview videos"
            icon={Image}
            color="green"
            isOpen={expandedSections.media}
            toggle={() => toggleSection('media')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thumbnail Upload */}
              <FileDropZone
                title="Course Thumbnail (5MB Max)"
                fieldName="thumbnail"
                preview={courseData.thumbnailPreview}
                fileRef={fileInputRef}
                dragActive={dragActive}
                handleDrag={(e) => handleDrag(e, 'thumbnail')}
                handleDrop={(e) => handleFileChange(e, 'thumbnail')}
                handleFileChange={(e) => handleFileChange(e, 'thumbnail')}
                removeFile={() => removeFile('thumbnail')}
                color="blue"
              />

              {/* Banner Upload */}
              <FileDropZone
                title="Course Banner (10MB Max, Optional)"
                fieldName="banner"
                preview={courseData.bannerPreview}
                fileRef={bannerInputRef}
                dragActive={bannerDragActive}
                handleDrag={(e) => handleDrag(e, 'banner')}
                handleDrop={(e) => handleFileChange(e, 'banner')}
                handleFileChange={(e) => handleFileChange(e, 'banner')}
                removeFile={() => removeFile('banner')}
                color="purple"
              />

              {/* Preview Video URL */}
              <div className="md:col-span-2">
                <label htmlFor="previewVideo" className="block text-sm font-medium text-gray-700 mb-2">Preview Video URL</label>
                <div className="flex flex-col sm:flex-row rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-t-md sm:rounded-l-md sm:rounded-t-none border border-b-0 sm:border-b sm:border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Video className="h-5 w-5" />
                  </span>
                  <input
                    type="text" id="previewVideo" name="previewVideo" value={courseData.previewVideo} onChange={handleInputChange}
                    className={`flex-1 min-w-0 block w-full px-4 py-3 rounded-b-md sm:rounded-r-md sm:rounded-b-none border ${errors.previewVideo ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="https://youtube.com/watch?v=..." maxLength="2000"
                  />
                </div>
                {errors.previewVideo && <p className="mt-1 text-sm text-red-600">{errors.previewVideo}</p>}
                <p className="mt-1 text-sm text-gray-500">Provide an external URL for the course preview video (Max 2000 chars)</p>
              </div>
            </div>
          </AccordionSection>

          {/* Course Content Section */}
          <AccordionSection
            title="Course Content & Structure"
            description="Learning outcomes, prerequisites, and course structure"
            icon={Zap}
            color="amber"
            isOpen={expandedSections.content}
            toggle={() => toggleSection('content')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration with Unit Selection */}
                <div>
                  <label htmlFor="totalDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Duration
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number" id="totalDuration" name="totalDuration" value={courseData.totalDuration} onChange={handleInputChange}
                        min="0"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.totalDuration ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div className="relative">
                      <select
                        id="durationUnit" name="durationUnit" value={courseData.durationUnit} onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {DURATION_UNITS.map((unit) => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 mt-1.5 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {errors.totalDuration && <p className="mt-1 text-sm text-red-600">{errors.totalDuration}</p>}
                  <p className="mt-1 text-sm text-gray-500">Estimated time to complete the course</p>
                </div>

                {/* Certificate */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                  <input
                    id="hasCertificate" name="hasCertificate" type="checkbox" checked={courseData.hasCertificate} onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="hasCertificate" className="block text-sm font-medium text-gray-700">Provide Certificate upon Completion</label>
                    <p className="text-sm text-gray-500">Students will receive a digital certificate when they finish the course.</p>
                  </div>
                  <Award className="w-6 h-6 text-blue-500 ml-auto sm:ml-0" />
                </div>
              </div>

              {/* Prerequisites */}
              <ListInputField
                field="prerequisites"
                label="Prerequisites"
                Icon={Target}
                data={courseData.prerequisites}
                onAdd={addListItem}
                onRemove={removeListItem}
                onChange={handleListItemChange}
                errors={errors}
                placeholder="Basic HTML knowledge"
              />
              {/* Learning Outcomes */}
              <ListInputField
                field="learningOutcomes"
                label="Learning Outcomes"
                Icon={TrendingUp}
                data={courseData.learningOutcomes}
                onAdd={addListItem}
                onRemove={removeListItem}
                onChange={handleListItemChange}
                errors={errors}
                placeholder="Build responsive websites"
              />
              {/* Requirements */}
              <ListInputField
                field="requirements"
                label="Requirements / Target Audience"
                Icon={Zap}
                data={courseData.requirements}
                onAdd={addListItem}
                onRemove={removeListItem}
                onChange={handleListItemChange}
                errors={errors}
                placeholder="Computer with internet access"
              />
            </div>
          </AccordionSection>

          {/* Pricing Section */}
          <AccordionSection
            title="Pricing & Enrollment"
            description="Set course pricing, discounts, and enrollment options"
            icon={CreditCard}
            color="purple"
            isOpen={expandedSections.pricing}
            toggle={() => toggleSection('pricing')}
          >
            <div className="p-4 sm:p-6 border-t border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number" id="price" name="price" value={courseData.price} onChange={handleInputChange} min="0" step="1"
                      className={`block w-full pl-8 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  <p className="mt-1 text-sm text-gray-500">Set to 0 for a free course.</p>
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number" id="discount" name="discount" value={courseData.discount} onChange={handleInputChange} min="0" max="100"
                      className={`block w-full pr-12 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${errors.discount ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
                  <p className="mt-1 text-sm text-gray-500">Applied to the base price.</p>
                </div>

                {/* Final Price Preview */}
                <div className="mt-2 md:mt-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Final Price</label>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg h-full flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xl font-bold text-gray-800">
                        {courseData.price === 0 ? 'FREE' : `₹${finalPrice()}`}
                      </span>
                      {courseData.discount > 0 && courseData.price > 0 && (
                        <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                          Save ₹{calculateSavings()} ({courseData.discount}%)
                        </span>
                      )}
                    </div>
                    {courseData.discount > 0 && courseData.price > 0 && (
                      <span className="text-xs text-gray-500 line-through">Original: ₹{courseData.price}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enrollment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Enrollment Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ENROLLMENT_OPTIONS.map((option) => (
                    <label key={option.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${courseData.enrollmentStatus === option.value
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}>
                      <input
                        type="radio" name="enrollmentStatus" value={option.value} checked={courseData.enrollmentStatus === option.value}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{option.icon}</span>
                          <span className="block text-sm font-medium text-gray-700">{option.label}</span>
                        </div>
                        <span className="block text-xs text-gray-500 mt-1">{option.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Featured Course */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 gap-4">
                <div className="flex items-center">
                  <input
                    id="isFeatured" name="isFeatured" type="checkbox" checked={courseData.isFeatured} onChange={handleInputChange}
                    className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                  />
                  <div className="ml-3">
                    <label htmlFor="isFeatured" className="block text-sm font-medium text-gray-700">Feature this course</label>
                    <p className="text-sm text-gray-500">Will appear in featured sections on the home page.</p>
                  </div>
                </div>
                <Award className="w-6 h-6 text-amber-500 ml-auto sm:ml-0" />
              </div>
            </div>
          </AccordionSection>

          {/* SEO Section */}
          <AccordionSection
            title="SEO Settings"
            description="Optimize your course for search engines"
            icon={Globe}
            color="teal"
            isOpen={expandedSections.seo}
            toggle={() => toggleSection('seo')}
          >
            <div className="p-4 sm:p-6 border-t border-gray-200 space-y-6">
              <InputField
                label="Meta Title (Max 60)"
                name="metaTitle"
                value={courseData.metaTitle}
                onChange={handleInputChange}
                maxLength={60}
                error={errors.metaTitle}
                hint={`${courseData.metaTitle.length}/60 characters. Appears in search results title.`}
              />
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">Meta Description (Max 160)</label>
                <textarea
                  id="metaDescription" name="metaDescription" value={courseData.metaDescription} onChange={handleInputChange}
                  rows={3} maxLength={160}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${errors.metaDescription ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter meta description for search results"
                />
                <div className="flex flex-wrap justify-between mt-1 gap-2">
                  {errors.metaDescription && <p className="text-sm text-red-600">{errors.metaDescription}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{courseData.metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Enhanced Action Bar */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky bottom-4 z-20">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {loading && uploadProgress > 0 && (
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between mb-2 text-sm font-medium text-blue-700">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-between w-full">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white rounded-xl shadow-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Creating Course...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourses;