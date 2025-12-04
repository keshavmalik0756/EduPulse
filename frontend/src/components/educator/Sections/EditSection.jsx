import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, X, BookOpen, 
  AlertCircle, CheckCircle,
  ArrowLeft, Plus, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import sectionService from '../../../services/sectionService';

const EditSection = () => {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [section, setSection] = useState({
    title: '',
    description: '',
    order: 1,
    isPublished: false
  });
  const [errors, setErrors] = useState({});

  // Fetch section data
  useEffect(() => {
    const fetchSection = async () => {
      try {
        setLoading(true);
        
        if (!sectionId) {
          throw new Error('Section ID is missing');
        }
        
        const response = await sectionService.getSectionById(sectionId);
        
        if (response.success && response.section) {
          setSection({
            title: response.section.title || '',
            description: response.section.description || '',
            order: response.section.order || 1,
            isPublished: response.section.isPublished || false
          });
        } else {
          throw new Error(response.message || 'Failed to fetch section');
        }
      } catch (err) {
        console.error('Error fetching section:', err);
        toast.error(err.message || 'Failed to load section');
        navigate(`/educator/courses/view/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSection();
  }, [sectionId, courseId]);

  // Validate form
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    
    if (!section.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!section.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    const orderValue = parseInt(section.order, 10);
    if (isNaN(orderValue) || orderValue < 1) {
      newErrors.order = 'Order must be at least 1';
      isValid = false;
    }
    
    setErrors(newErrors);
    return { isValid, newErrors };
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid } = validateForm();
    if (!isValid) {
      toast.error('Please fix the errors before saving.');
      return;
    }
    
    try {
      setSaving(true);
      
      const sectionData = {
        title: section.title.trim(),
        description: section.description.trim(),
        order: parseInt(section.order, 10),
        isPublished: section.isPublished
      };
      
      const response = await sectionService.updateSection(sectionId, sectionData);
      
      if (response.success) {
        toast.success('Section updated successfully!');
        // Navigate back to the course view
        navigate(`/educator/courses/view/${courseId}`, { 
          state: { sectionUpdated: true } 
        });
      } else {
        throw new Error(response.message || 'Failed to update section');
      }
    } catch (err) {
      console.error('Error updating section:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update section. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle section deletion
  const handleDeleteSection = async () => {
    try {
      setDeleting(true);
      
      const response = await sectionService.deleteSection(sectionId);
      
      if (response.success) {
        toast.success('Section deleted successfully!');
        // Navigate back to the course view
        navigate(`/educator/courses/view/${courseId}`, { 
          state: { sectionDeleted: true } 
        });
      } else {
        throw new Error(response.message || 'Failed to delete section');
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete section. Please try again.');
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (saving) {
      if (window.confirm('Save in progress. Are you sure you want to cancel?')) {
        navigate(`/educator/courses/view/${courseId}`);
      }
    } else {
      navigate(`/educator/courses/view/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Section</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update your section details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          className="bg-white shadow rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Section Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Edit the information for your section
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Section Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={section.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter section title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>
            
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={section.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter section description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
            
            {/* Order Field */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Section Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={section.order}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.order ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.order}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                The position of this section in the course curriculum
              </p>
            </div>
            
            {/* Publish Status */}
            <div className="flex items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={section.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                Publish this section
              </label>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Section
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
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
                      Update Section
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
        
        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Editing tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Changes to section order will affect how students navigate your course</li>
                  <li>Published sections are visible to students</li>
                  <li>You can add lectures to this section after saving</li>
                  <li>Deleting a section will not delete its lectures</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete Section
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this section? This action cannot be undone.
                  The lectures in this section will not be deleted.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteSection}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Section'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSection;
