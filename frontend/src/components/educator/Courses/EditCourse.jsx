import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen, Upload, Plus, X, ArrowLeft, Save, Eye, EyeOff,
  Trash2, AlertTriangle, CheckCircle, Clock, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import courseService from '../../../services/courseService';

function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [courseData, setCourseData] = useState({
    title: '',
    subTitle: '',
    description: '',
    category: '',
    subCategory: '',
    level: 'beginner',
    price: '',
    discount: '',
    thumbnail: null,
    thumbnailPreview: null,
    banner: null,
    bannerPreview: null,
    previewVideo: '',
    hasCertificate: true,
    language: 'English',
    prerequisites: [''],
    learningOutcomes: [''],
    requirements: [''],
    enrollmentStatus: 'open',
    isFeatured: false,
    isPublished: false,
    publishedDate: null,
    totalEnrolled: 0,
    views: 0,
    averageRating: 0,
    revenue: 0,
    metaTitle: '',
    metaDescription: '',
    tags: ['']
  });
  // Store the actual MongoDB ObjectId for API calls
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const categories = [
    'Web Development', 'Mobile Development', 'Data Science', 'Artificial Intelligence',
    'Business', 'Design', 'Marketing', 'Music', 'Photography', 'Lifestyle',
    'Health & Fitness', 'Academics', 'Language Learning', 'Personal Development',
    'Finance', 'Gaming', 'Cybersecurity', 'Other'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' }
  ];

  const enrollmentStatuses = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourseById(id);
        if (response.success && response.course) {
          const course = response.course;
          // Store the actual MongoDB ObjectId for API calls
          setCourseId(course._id);
          // Ensure level is in lowercase to match backend enum
          const level = course.level ? course.level.toLowerCase() : 'beginner';
          
          setCourseData({
            title: course.title || '',
            subTitle: course.subTitle || '',
            description: course.description || '',
            category: course.category || '',
            subCategory: course.subCategory || '',
            level: level,
            price: course.price || '',
            discount: course.discount || '',
            thumbnail: null,
            thumbnailPreview: course.thumbnail || null,
            banner: null,
            bannerPreview: course.banner || null,
            previewVideo: course.previewVideo || '',
            hasCertificate: course.hasCertificate || true,
            language: course.language || 'English',
            prerequisites: course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites : [''],
            learningOutcomes: course.learningOutcomes && course.learningOutcomes.length > 0 ? course.learningOutcomes : [''],
            requirements: course.requirements && course.requirements.length > 0 ? course.requirements : [''],
            enrollmentStatus: course.enrollmentStatus || 'open',
            isFeatured: course.isFeatured || false,
            isPublished: course.isPublished || false,
            publishedDate: course.publishedDate || null,
            totalEnrolled: course.totalEnrolled || 0,
            views: course.views || 0,
            averageRating: course.averageRating || 0,
            revenue: course.revenue || 0,
            metaTitle: course.metaTitle || '',
            metaDescription: course.metaDescription || '',
            tags: course.tags && course.tags.length > 0 ? course.tags : ['']
          });
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInputChange = (index, value, field) => {
    setCourseData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    if (courseData[field].length > 1) {
      setCourseData(prev => {
        const newArray = [...prev[field]];
        newArray.splice(index, 1);
        return {
          ...prev,
          [field]: newArray
        };
      });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData(prev => ({
          ...prev,
          banner: file,
          bannerPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setCourseData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null
    }));
  };

  const removeBanner = () => {
    setCourseData(prev => ({
      ...prev,
      banner: null,
      bannerPreview: null
    }));
  };

  // Refresh course statistics and course data
  const refreshCourseStatistics = async () => {
    try {
      // Emit a custom event to notify other components to refresh their statistics
      window.dispatchEvent(new CustomEvent('courseUpdated', { detail: { courseId: id } }));
      
      // Also refresh the course data in this component
      const response = await courseService.getCourseById(id);
      if (response.success && response.course) {
        const course = response.course;
        setCourseData(prev => ({
          ...prev,
          isPublished: course.isPublished || false,
          publishedDate: course.publishedDate || null,
          totalEnrolled: course.totalEnrolled || 0,
          views: course.views || 0,
          averageRating: course.averageRating || 0,
          revenue: course.revenue || 0
        }));
      }
    } catch (err) {
      console.error('Error refreshing course statistics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append all course data to FormData
      Object.keys(courseData).forEach(key => {
        if (key === 'prerequisites' || key === 'learningOutcomes' || key === 'requirements' || key === 'tags') {
          // Convert arrays to JSON strings
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (key === 'thumbnail' || key === 'banner') {
          // Handle file uploads
          if (courseData[key] instanceof File) {
            formData.append(key, courseData[key]);
          }
        } else {
          // Handle regular fields
          formData.append(key, courseData[key]);
        }
      });

      // Use the actual MongoDB ObjectId for API calls
      const response = await courseService.updateCourse(courseId || id, formData);
      if (response.success) {
        toast.success('Course updated successfully!');
        // Refresh statistics after update
        await refreshCourseStatistics();
        // Update the course data with the actual response
        if (response.course) {
          setCourseData(prev => ({
            ...prev,
            isPublished: response.course.isPublished || false,
            publishedDate: response.course.publishedDate || null
          }));
        }
        // Don't navigate away, stay on edit page
      } else {
        toast.error(response.message || 'Failed to update course');
      }
    } catch (err) {
      console.error('Error updating course:', err);
      toast.error(err.message || 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append all course data to FormData
      Object.keys(courseData).forEach(key => {
        if (key === 'prerequisites' || key === 'learningOutcomes' || key === 'requirements' || key === 'tags') {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (key === 'thumbnail' || key === 'banner') {
          if (courseData[key] instanceof File) {
            formData.append(key, courseData[key]);
          }
        } else {
          formData.append(key, courseData[key]);
        }
      });

      // Preserve the current publish status
      formData.append('isPublished', courseData.isPublished);

      // Use the actual MongoDB ObjectId for API calls
      const response = await courseService.updateCourse(courseId || id, formData);
      if (response.success) {
        // Don't change the publish status when saving as draft
        // The publish status is preserved in the formData
        // Update the course data with the actual response
        if (response.course) {
          setCourseData(prev => ({
            ...prev,
            isPublished: response.course.isPublished || false,
            publishedDate: response.course.publishedDate || null
          }));
        }
        // Refresh statistics after save
        await refreshCourseStatistics();
        toast.success('Course saved as draft successfully!');
      } else {
        toast.error(response.message || 'Failed to save course as draft');
      }
    } catch (err) {
      console.error('Error saving course as draft:', err);
      toast.error(err.message || 'Failed to save course as draft');
    } finally {
      setSaving(false);
    }
  };

  // Publish/Unpublish course
  const handlePublishToggle = async () => {
    // If unpublishing, show confirmation
    if (courseData.isPublished) {
      setShowPublishModal(true);
      return;
    }

    // If publishing, proceed directly
    await performPublishToggle();
  };

  const performPublishToggle = async () => {
    setPublishing(true);
    setError(null);
    setShowPublishModal(false);

    try {
      const newPublishStatus = !courseData.isPublished;
      const formData = new FormData();
      formData.append('isPublished', newPublishStatus);
      if (newPublishStatus) {
        formData.append('publishedDate', new Date().toISOString());
      }

      // Use the actual MongoDB ObjectId for API calls
      const response = await courseService.togglePublishStatus(courseId || id);
      if (response.success) {
        setCourseData(prev => ({
          ...prev,
          isPublished: response.course.isPublished,
          publishedDate: response.course.isPublished ? response.course.publishedDate : null
        }));
        
        // Refresh statistics after publish/unpublish
        await refreshCourseStatistics();
        
        toast.success(newPublishStatus ? 'Course published successfully!' : 'Course unpublished successfully!');
      } else {
        toast.error(response.message || 'Failed to update course status');
      }
    } catch (err) {
      console.error('Error updating course status:', err);
      toast.error(err.message || 'Failed to update course status');
    } finally {
      setPublishing(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    setDeleting(true);
    setError(null);

    try {
      // Use the actual MongoDB ObjectId for API calls
      const response = await courseService.deleteCourse(courseId || id);
      if (response.success) {
        toast.success('Course deleted successfully!');
        // Refresh statistics after delete
        await refreshCourseStatistics();
        navigate('/educator/courses');
      } else {
        toast.error(response.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/educator/courses');
    }
  };

  const handleBack = () => {
    navigate('/educator/courses');
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this course? This action cannot be undone.
          All course content, student enrollments, and progress will be permanently lost.
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
            onClick={handleDeleteCourse}
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
                Delete Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Publish Confirmation Modal
  const PublishConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <EyeOff className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Unpublish Course</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to unpublish this course? It will no longer be visible to students
          and they won't be able to enroll. Existing students will still have access to their enrolled content.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowPublishModal(false)}
            disabled={publishing}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={performPublishToggle}
            disabled={publishing}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 flex items-center"
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Unpublishing...
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/educator/courses')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showDeleteModal && <DeleteConfirmationModal />}
      {showPublishModal && <PublishConfirmationModal />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Courses</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${courseData.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {courseData.isPublished ? (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Published
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Draft
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600">Update your course details and content</p>
              {courseData.publishedDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Published on {new Date(courseData.publishedDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Publish/Unpublish Button */}
              <button
                onClick={handlePublishToggle}
                disabled={publishing}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center ${courseData.isPublished
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50 transition-colors`}
              >
                {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {courseData.isPublished ? 'Unpublishing...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    {courseData.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Course Statistics */}
        {courseData.isPublished && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Course Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{courseData.totalEnrolled || 0}</div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{courseData.views || 0}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{courseData.averageRating || 0}/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₹{courseData.revenue || 0}</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course title"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="subTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subTitle"
                  name="subTitle"
                  value={courseData.subTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course subtitle"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <input
                  type="text"
                  id="subCategory"
                  name="subCategory"
                  value={courseData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sub category"
                />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={courseData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course language"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={courseData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter discount percentage"
                />
                {/* Price Preview */}
                {courseData.price && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Original Price:</span>
                        <span>₹{courseData.price}</span>
                      </div>
                      {courseData.discount > 0 && (
                        <>
                          <div className="flex items-center justify-between text-red-600">
                            <span>Discount ({courseData.discount}%):</span>
                            <span>-₹{Math.round((courseData.price * courseData.discount) / 100)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold text-green-600 border-t pt-2 mt-2">
                            <span>Final Price:</span>
                            <span>₹{Math.round(courseData.price - (courseData.price * courseData.discount) / 100)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Students save ₹{Math.round((courseData.price * courseData.discount) / 100)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter course description"
              />
            </div>
          </div>

          {/* Media Assets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Assets</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {courseData.thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={courseData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center">
                      <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Choose File
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                      <span className="ml-3 text-sm text-gray-500">
                        {courseData.thumbnail ? courseData.thumbnail.name : 'No file chosen'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Banner
                </label>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {courseData.bannerPreview ? (
                      <div className="relative">
                        <img
                          src={courseData.bannerPreview}
                          alt="Banner preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeBanner}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center">
                      <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Choose File
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleBannerChange}
                        />
                      </label>
                      <span className="ml-3 text-sm text-gray-500">
                        {courseData.banner ? courseData.banner.name : 'No file chosen'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Video */}
              <div className="md:col-span-2">
                <label htmlFor="previewVideo" className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Video URL
                </label>
                <input
                  type="text"
                  id="previewVideo"
                  name="previewVideo"
                  value={courseData.previewVideo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter preview video URL"
                />
              </div>
            </div>
          </div>

          {/* Learning Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Information</h2>

            {/* Prerequisites */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prerequisites
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('prerequisites')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Prerequisite
                </button>
              </div>
              {courseData.prerequisites.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'prerequisites')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter prerequisite"
                  />
                  {courseData.prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'prerequisites')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Learning Outcomes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Learning Outcomes
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('learningOutcomes')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Outcome
                </button>
              </div>
              {courseData.learningOutcomes.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'learningOutcomes')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter learning outcome"
                  />
                  {courseData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'learningOutcomes')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Requirement
                </button>
              </div>
              {courseData.requirements.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter requirement"
                  />
                  {courseData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SEO Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={courseData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter meta title"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={courseData.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter meta description"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-blue-100 rounded-full px-3 py-1">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayInputChange(index, e.target.value, 'tags')}
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm"
                      placeholder="Enter tag"
                    />
                    {courseData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'tags')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="enrollmentStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Status
                </label>
                <select
                  id="enrollmentStatus"
                  name="enrollmentStatus"
                  value={courseData.enrollmentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {enrollmentStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasCertificate"
                  name="hasCertificate"
                  checked={courseData.hasCertificate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-700">
                  Has Certificate
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={courseData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                  Featured Course
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Changes are automatically saved
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Saving Draft...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center transition-colors"
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
}

export default EditCourse;