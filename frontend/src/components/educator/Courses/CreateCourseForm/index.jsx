import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, ArrowRight, X, AlertCircle } from 'lucide-react';

import courseService from '../../../../services/courseService';
import StepIndicator from './StepIndicator';
import BasicInfo from './BasicInfo';
import MediaAssets from './MediaAssets';
import CourseContent from './CourseContent';
import PricingEnrollment from './PricingEnrollment';
import LivePreview from './LivePreview';

const CreateCourseForm = ({ initialData, mode = 'create', courseId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // ====================== STATE ======================
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const [courseData, setCourseData] = useState({
    title: '', subTitle: '', description: '',
    category: '', subCategory: '', level: 'beginner',
    price: 0, discount: 0,
    tags: [],
    thumbnail: null, thumbnailPreview: null,
    banner: null, bannerPreview: null,
    previewVideo: '',
    totalDuration: 0,
    durationUnit: 'hours',
    hasCertificate: true,
    language: 'English',
    prerequisites: [''], learningOutcomes: [''], requirements: [''],
    enrollmentStatus: 'open',
    isFeatured: false,
    isPublished: false,
    metaTitle: '', metaDescription: '',
    // Stats for edit mode
    totalEnrolled: 0,
    views: 0,
    averageRating: 0,
    revenue: 0
  });

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setCourseData(prev => ({
        ...prev,
        ...initialData,
        // Ensure arrays are initialized if missing
        prerequisites: initialData.prerequisites || [''],
        learningOutcomes: initialData.learningOutcomes || [''],
        requirements: initialData.requirements || [''],
        tags: initialData.tags || []
      }));
    }
  }, [initialData]);

  const [dragActive, setDragActive] = useState(false);
  const [bannerDragActive, setBannerDragActive] = useState(false);

  // ====================== INPUT HANDLERS ======================
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    if (type === 'number') {
      processedValue = Number(value);
    }

    setCourseData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleListItemChange = useCallback((field, index, value) => {
    const newArray = [...courseData[field]];
    newArray[index] = value;
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
    } else {
      newArray[0] = '';
      setCourseData(prev => ({ ...prev, [field]: newArray }));
    }
  }, [courseData]);

  const addTag = () => {
    if (tagInput.trim() && !courseData.tags.includes(tagInput.trim())) {
      setCourseData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tagInput.trim().slice(0, 50)] 
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = useCallback((e, fieldName) => {
    e.preventDefault();
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const file = files[0];

    if (!file) return;

    if (fieldName === 'thumbnail') setDragActive(false);
    if (fieldName === 'banner') setBannerDragActive(false);

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const maxSize = fieldName === 'thumbnail' ? 5 : 10;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
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

  const handleDrag = useCallback((e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (fieldName === 'thumbnail') setDragActive(true);
      if (fieldName === 'banner') setBannerDragActive(true);
    } else {
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
  };

  // ====================== CALCULATION HELPERS ======================
  const finalPrice = useCallback(() => {
    if (courseData.price === 0) return 0;
    if (courseData.discount > 0) {
      const discountAmount = (courseData.price * courseData.discount) / 100;
      return Math.max(0, Math.round(courseData.price - discountAmount));
    }
    return courseData.price || 0;
  }, [courseData.price, courseData.discount]);

  const calculateSavings = useCallback(() => {
    if (courseData.price === 0 || courseData.discount === 0) return 0;
    return Math.round((courseData.price * courseData.discount) / 100);
  }, [courseData.price, courseData.discount]);

  // ====================== VALIDATION ======================
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!courseData.title.trim()) newErrors.title = 'Title is required';
      if (!courseData.category) newErrors.category = 'Category is required';
      if (!courseData.description.trim()) newErrors.description = 'Description is required';
    } else if (step === 2) {
      if (!courseData.thumbnail && !courseData.thumbnailPreview) newErrors.thumbnail = 'Thumbnail is required';
    } else if (step === 4) {
      if (courseData.price < 0) newErrors.price = 'Price cannot be negative';
      if (courseData.discount < 0 || courseData.discount > 100) newErrors.discount = 'Invalid discount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====================== NAVIGATION ======================
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // ====================== SUBMISSION ======================
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Process duration
      let totalDurationMinutes = courseData.totalDuration;
      if (courseData.durationUnit === 'hours') totalDurationMinutes *= 60;
      if (courseData.durationUnit === 'weeks') totalDurationMinutes *= 7 * 24 * 60;
      if (courseData.durationUnit === 'months') totalDurationMinutes *= 30 * 24 * 60;

      // Filter and append basic fields
      Object.entries(courseData).forEach(([key, value]) => {
        if (['thumbnail', 'banner', 'tags', 'prerequisites', 'learningOutcomes', 'requirements', 'thumbnailPreview', 'bannerPreview', 'durationUnit'].includes(key)) return;
        
        if (key === 'totalDuration') {
          formData.append('totalDurationMinutes', Number(totalDurationMinutes));
        } else {
          formData.append(key, typeof value === 'boolean' ? value : value);
        }
      });

      // Append Arrays
      ['tags', 'prerequisites', 'learningOutcomes', 'requirements'].forEach(field => {
        const cleanArray = courseData[field].filter(i => i.trim().length > 0).map(i => i.trim());
        formData.append(field, JSON.stringify(cleanArray));
      });

      // Append Files
      if (courseData.thumbnail) formData.append('thumbnail', courseData.thumbnail);
      if (courseData.banner) formData.append('banner', courseData.banner);

      let response;
      if (mode === 'edit') {
        response = await courseService.updateCourse(courseId, formData);
      } else {
        response = await courseService.createCourse(formData, (p) => {
          setUploadProgress(Math.round((p.loaded * 100) / p.total));
        });
      }

      if (response.success) {
        toast.success(mode === 'edit' ? 'Course updated successfully! ✨' : 'Course created successfully! 🎉');
        // Emit event to notify other components to refresh their data
        window.dispatchEvent(new CustomEvent('courseUpdated', { detail: { courseId: response.course?._id || courseId } }));
        if (mode === 'create') navigate('/educator/courses');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 lg:pb-24">
      {/* Step Indicator - Top on mobile, sticky in sidebar on desktop? 
          Actually, top for both is cleaner for flow. */}
      <StepIndicator currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Wizard Area */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-emerald-100/50">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight">Step {currentStep}: {
                  currentStep === 1 ? 'Core Fundamentals' :
                  currentStep === 2 ? 'Visual Identity' :
                  currentStep === 3 ? 'Value Proposition' : 'Pricing Strategy'
                }</h2>
                {mode === 'edit' && (
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    courseData.isPublished 
                      ? 'bg-emerald-400/20 border-emerald-400 text-emerald-100' 
                      : 'bg-amber-400/20 border-amber-400 text-amber-100'
                  }`}>
                    {courseData.isPublished ? 'Published' : 'Draft'}
                  </div>
                )}
              </div>
              <p className="text-emerald-50 mt-1 font-medium opacity-90">
                {currentStep === 1 ? "Start with a strong foundation: name and categorize your expertise." :
                 currentStep === 2 ? "A picture is worth a thousand words. Make your course visually irresistible." :
                 currentStep === 3 ? "Define what students will gain and what they need to succeed." : 
                 "Set the right value for your knowledge and manage enrollment logic."}
              </p>
            </div>
          </div>

            <div className="p-5 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <BasicInfo 
                    courseData={courseData} 
                    handleInputChange={handleInputChange} 
                    errors={errors}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    addTag={addTag}
                    removeTag={removeTag}
                  />
                )}
                {currentStep === 2 && (
                  <MediaAssets 
                    courseData={courseData} 
                    handleFileChange={handleFileChange}
                    handleDrag={handleDrag}
                    removeFile={removeFile}
                    dragActive={dragActive}
                    bannerDragActive={bannerDragActive}
                    fileInputRef={fileInputRef}
                    bannerInputRef={bannerInputRef}
                    handleInputChange={handleInputChange}
                    errors={errors}
                  />
                )}
                {currentStep === 3 && (
                  <CourseContent 
                    courseData={courseData}
                    handleInputChange={handleInputChange}
                    handleListItemChange={handleListItemChange}
                    addListItem={addListItem}
                    removeListItem={removeListItem}
                    errors={errors}
                  />
                )}
                {currentStep === 4 && (
                  <PricingEnrollment 
                    courseData={courseData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    finalPrice={finalPrice}
                    calculateSavings={calculateSavings}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/educator/courses') : prevStep}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-wider group order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex w-full sm:w-auto gap-4 order-1 sm:order-2">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 lg:py-3 bg-sky-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-sky-700 transition-all hover:shadow-sky-200 active:scale-95 uppercase tracking-wider group"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-4 lg:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black text-sm shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all hover:shadow-emerald-200 active:scale-95 disabled:opacity-50 uppercase tracking-widest group"
                  >
                    {loading ? (
                       <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {mode === 'edit' ? 'Saving...' : 'Deploying...'}
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {mode === 'edit' ? 'Update Course' : 'Launch Course'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {loading && uploadProgress > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase">
                  <span>Uploading Content</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: Preview & Progress - order-1 on mobile if we want preview first, 
          but usually order-2 (bottom) is better on mobile */}
      <div className="lg:col-span-4 space-y-8 order-1 lg:order-2 lg:sticky lg:top-8">
        
        {/* Course Statistics - Only in Edit Mode */}
        {mode === 'edit' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">
              Performance Insights
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sky-50/50 p-3 rounded-2xl border border-sky-100/50">
                <p className="text-[10px] font-black text-sky-600 uppercase mb-1">Students</p>
                <p className="text-xl font-black text-gray-900">{courseData.totalEnrolled}</p>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Views</p>
                <p className="text-xl font-black text-gray-900">{courseData.views}</p>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Rating</p>
                <p className="text-xl font-black text-gray-900">{courseData.averageRating}</p>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
                <p className="text-[10px] font-black text-purple-600 uppercase mb-1">Revenue</p>
                <p className="text-lg font-black text-gray-900">₹{courseData.revenue}</p>
              </div>
            </div>
          </div>
        )}

        <LivePreview courseData={courseData} finalPrice={finalPrice} />
        
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Launch Checklist</h4>
          <ul className="space-y-3">
            {[
              { label: 'Basic Course Info', step: 1 },
              { label: 'Thumbnail & Banner', step: 2 },
              { label: 'Course Structure', step: 3 },
              { label: 'Price & Enrollment', step: 4 }
            ].map((item, idx) => (
              <li key={idx} className="flex items-center text-[11px] font-bold">
                <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center border-2 ${
                  currentStep > item.step ? 'bg-emerald-500 border-emerald-500 text-white' : 
                  currentStep === item.step ? 'border-sky-500 text-sky-500 animate-pulse' : 'border-gray-200 text-gray-300'
                }`}>
                  {currentStep > item.step ? (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                  ) : idx + 1}
                </div>
                <span className={currentStep >= item.step ? 'text-gray-700' : 'text-gray-300'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateCourseForm;
