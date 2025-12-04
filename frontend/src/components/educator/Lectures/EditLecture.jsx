import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Play, BookOpen, Clock, AlertCircle, CheckCircle, Trash2, Book, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import lectureService from '../../../services/lectureService';

// --- Toggle Switch Component ---
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
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Toggle Visual Indicator */}
        <div className="flex-shrink-0 relative">
          <div className={`relative w-20 h-10 rounded-full transition-all duration-300 ease-in-out ${
            checked 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg' 
              : 'bg-gray-300 shadow-inner'
          }`}>
            <div className={`absolute top-1 w-8 h-8 rounded-full bg-white transition-all duration-300 ease-in-out shadow-md flex items-center justify-center ${
              checked ? 'left-11 transform scale-110' : 'left-1 scale-100'
            }`}>
              {checked ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
            checked 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-gray-500 text-white shadow'
          }`}>
            {checked ? 'FREE' : 'PAID'}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <Book className="w-5 h-5 mr-2 text-blue-600" />
            <label htmlFor={name} className="block text-lg font-bold text-gray-800">
              {label}
            </label>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {/* Interactive Status Indicator */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
            checked 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
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
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
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
        <div className="mt-4 flex items-center">
          <div className="flex-grow h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full overflow-hidden">
            <div className="h-full bg-white opacity-30 animate-pulse"></div>
          </div>
          <span className="ml-2 text-xs font-bold text-green-600">UNLOCKED</span>
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

const EditLecture = () => {
  // Extract both courseId and lectureId from route parameters
  // In embedded mode: /educator/courses/:courseId/lectures/edit/:lectureId
  // In standalone mode: /educator/lectures/edit/:lectureId
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('EditLecture component - Route params:', { courseId, lectureId });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lecture, setLecture] = useState({
    title: '',
    description: '',
    duration: 0, // Store as seconds
    order: 1,
    difficulty: 'beginner',
    isPreviewFree: false,
    prerequisites: [],
    videoUrl: '',
    thumbnail: ''
  });
  
  // State for hours and minutes input fields
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch lecture data
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        // Debug logging
        console.log('EditLecture: Fetching lecture with ID:', lectureId);
        
        if (!lectureId) {
          throw new Error('Lecture ID is missing');
        }
        
        setLoading(true);
        const response = await lectureService.getLectureById(lectureId);
        console.log('EditLecture: Lecture fetch response:', response);
        
        // Check if response exists and has lecture data
        if (response && response.success && response.data) {
          const lectureData = response.data;
          console.log('EditLecture: Extracted lecture data:', lectureData);
          
          // Convert duration from seconds to hours/minutes for display
          const { hours, minutes } = secondsToHM(lectureData.duration || 0);
          
          // Ensure prerequisites is always an array
          let prerequisites = [];
          if (Array.isArray(lectureData.prerequisites)) {
            prerequisites = lectureData.prerequisites;
          } else if (typeof lectureData.prerequisites === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(lectureData.prerequisites);
              if (Array.isArray(parsed)) {
                prerequisites = parsed;
              }
            } catch (e) {
              // If parsing fails, treat as empty array
              prerequisites = [];
            }
          }
          
          setLecture({
            title: lectureData.title || '',
            description: lectureData.description || '',
            duration: lectureData.duration || 0, // Store as seconds
            order: lectureData.order || 1,
            difficulty: lectureData.difficulty || 'beginner',
            isPreviewFree: lectureData.isPreviewFree || false,
            prerequisites: prerequisites,
            videoUrl: lectureData.videoUrl || '',
            thumbnail: lectureData.thumbnail || ''
          });
          
          setDurationHours(hours);
          setDurationMinutes(minutes);
        } else {
          throw new Error(response?.message || 'Failed to fetch lecture');
        }
      } catch (err) {
        console.error('EditLecture: Error fetching lecture:', err);
        // Provide more specific error messages
        if (!lectureId) {
          toast.error('Lecture ID is missing');
        } else if (err.response?.status === 404) {
          toast.error('Lecture not found');
        } else if (err.response?.status === 403) {
          toast.error('Access denied to this lecture');
        } else if (err.response?.status === 401) {
          toast.error('Please log in to edit lectures');
        } else {
          toast.error(err.message || 'Failed to load lecture');
        }
        // Check if we're in a course context (embedded mode)
        // In embedded mode, we'll have courseId from route params
        // In standalone mode, we won't have courseId
        if (courseId) {
          navigate(`/educator/courses/${courseId}`);
        } else {
          navigate('/educator/lectures');
        }
      } finally {
        setLoading(false);
      }
    };

    if (lectureId) {
      fetchLecture();
    } else {
      console.error('EditLecture: No lectureId provided to component');
      toast.error('Lecture ID is missing');
      // Navigate back to lectures list
      if (courseId) {
        navigate(`/educator/courses/${courseId}`);
      } else {
        navigate('/educator/lectures');
      }
    }
  }, [lectureId, courseId, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle duration inputs separately
    if (name === 'durationHours') {
      const hours = parseInt(value) || 0;
      setDurationHours(hours);
      // Update the lecture duration in seconds
      setLecture(prev => ({
        ...prev,
        duration: hmToSeconds(hours, durationMinutes)
      }));
    } else if (name === 'durationMinutes') {
      const minutes = parseInt(value) || 0;
      setDurationMinutes(minutes);
      // Update the lecture duration in seconds
      setLecture(prev => ({
        ...prev,
        duration: hmToSeconds(durationHours, minutes)
      }));
    } else {
      setLecture(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!lecture.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!lecture.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate duration - must be greater than 0
    if (lecture.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if (lecture.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare form data
      const formData = new FormData();
      Object.keys(lecture).forEach(key => {
        if (key !== 'prerequisites' && key !== 'videoUrl' && key !== 'thumbnail') {
          formData.append(key, lecture[key]);
        }
      });
      
      // Add prerequisites properly as individual clean string values
      // Filter out any empty or whitespace-only prerequisites
      const validPrerequisites = lecture.prerequisites
        .map(req => typeof req === 'string' ? req.trim() : String(req).trim())
        .filter(req => req.length > 0);
      
      // Add each prerequisite as a separate field
      validPrerequisites.forEach(prerequisite => {
        formData.append('prerequisites', prerequisite);
      });
      
      // Add files if selected
      if (videoFile) {
        formData.append('lessonVideo', videoFile);
      }
      
      if (thumbnailFile) {
        formData.append('resource', thumbnailFile);
      }
      
      const response = await lectureService.updateLecture(lectureId, formData);
      
      if (response.success) {
        toast.success('Lecture updated successfully!');
        // Check if we're in a course context (embedded mode)
        if (courseId) {
          navigate(`/educator/courses/${courseId}`);
        } else {
          navigate('/educator/lectures');
        }
      } else {
        throw new Error(response.message || 'Failed to update lecture');
      }
    } catch (err) {
      console.error('Error updating lecture:', err);
      toast.error(err.message || 'Failed to update lecture');
    } finally {
      setSaving(false);
    }
  };

  // Delete lecture
  const handleDeleteLecture = async () => {
    setDeleting(true);
    try {
      const response = await lectureService.deleteLecture(lectureId);
      if (response.success) {
        toast.success('Lecture deleted successfully!');
        // Navigate back to the course or lectures list
        if (courseId) {
          navigate(`/educator/courses/${courseId}`);
        } else {
          navigate('/educator/lectures');
        }
      } else {
        throw new Error(response.message || 'Failed to delete lecture');
      }
    } catch (err) {
      console.error('Error deleting lecture:', err);
      toast.error(err.message || 'Failed to delete lecture');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <Trash2 className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Lecture</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this lecture? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteLecture}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lecture
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showDeleteModal && <DeleteConfirmationModal />}
      <style>{`
        .hide-spinner::-webkit-outer-spin-button,
        .hide-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Back to View Course Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              // Navigate to the specific course view URL
              navigate(`/educator/courses/view/${courseId}`);
            }}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to View Course
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Lecture</h1>
              <p className="text-gray-600">Update your lecture content and settings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Lecture
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Form Content */}
            <div className="p-6 space-y-8">
              {/* Basic Information Section */}
              <section className="border-b border-gray-200 pb-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lecture Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={lecture.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter lecture title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order *
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={lecture.order}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hide-spinner transition-colors ${
                        errors.order ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.order && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.order}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={lecture.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter lecture description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </section>

              {/* Media Section */}
              <section className="border-b border-gray-200 pb-8">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4">
                    <Play className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Media</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Video Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Video
                    </label>
                    {lecture.videoUrl ? (
                      <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <video 
                            src={lecture.videoUrl} 
                            className="w-full h-full object-cover"
                            controls
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-600 truncate">
                          {lecture.videoUrl.split('/').pop()}
                        </p>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Current Thumbnail Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Thumbnail
                    </label>
                    {lecture.thumbnail ? (
                      <div className="relative">
                        <img 
                          src={lecture.thumbnail} 
                          alt="Lecture thumbnail" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Book className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Video File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replace Video File
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">MP4, MOV, MKV up to 5GB</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="video/*"
                          onChange={(e) => handleFileChange(e, setVideoFile)}
                        />
                      </label>
                    </div>
                    {videoFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {videoFile.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replace Thumbnail
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 10MB</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setThumbnailFile)}
                        />
                      </label>
                    </div>
                    {thumbnailFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {thumbnailFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Settings Section */}
              <section className="border-b border-gray-200 pb-8">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hours</label>
                        <input
                          type="number"
                          name="durationHours"
                          value={durationHours}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hide-spinner transition-colors ${
                            errors.duration ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                        <input
                          type="number"
                          name="durationMinutes"
                          value={durationMinutes}
                          onChange={handleInputChange}
                          min="0"
                          max="59"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hide-spinner transition-colors ${
                            errors.duration ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Formatted: {formatDuration(lecture.duration)}
                    </div>
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.duration}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={lecture.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="beginner">Beginner - For new learners</option>
                      <option value="intermediate">Intermediate - For learners with some experience</option>
                      <option value="advanced">Advanced - For experienced learners</option>
                    </select>
                    <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        {lecture.difficulty === 'beginner' && 'Beginner - For new learners'}
                        {lecture.difficulty === 'intermediate' && 'Intermediate - For learners with some experience'}
                        {lecture.difficulty === 'advanced' && 'Advanced - For experienced learners'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Prerequisites */}
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-4">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-4">
                        <Book className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Prerequisites</h3>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">
                        Add any prerequisites that students should complete before taking this lecture.
                      </p>
                      
                      {/* Prerequisites List */}
                      <div className="space-y-3 mb-4">
                        {lecture.prerequisites.map((prerequisite, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={prerequisite}
                              onChange={(e) => {
                                const newPrerequisites = [...lecture.prerequisites];
                                newPrerequisites[index] = e.target.value;
                                setLecture(prev => ({
                                  ...prev,
                                  prerequisites: newPrerequisites
                                }));
                              }}
                              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter prerequisite"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newPrerequisites = [...lecture.prerequisites];
                                newPrerequisites.splice(index, 1);
                                setLecture(prev => ({
                                  ...prev,
                                  prerequisites: newPrerequisites
                                }));
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Prerequisite Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setLecture(prev => ({
                            ...prev,
                            prerequisites: [...prev.prerequisites, '']
                          }));
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Prerequisite
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <ToggleSwitch
                      label="Enable free preview for this lecture"
                      name="isPreviewFree"
                      checked={lecture.isPreviewFree}
                      onChange={handleInputChange}
                      description="Students can watch this lecture without enrolling in the course"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (courseId) {
                      navigate(`/educator/courses/${courseId}`);
                    } else {
                      navigate('/educator/lectures');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 font-medium text-center shadow-sm hover:shadow-md"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
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
};

export default EditLecture;