import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, X, BookOpen, 
  AlertCircle, CheckCircle,
  ArrowLeft, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import sectionService from '../../../services/sectionService';

const CreateSection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState({
    title: '',
    description: '',
    order: 1
  });
  const [errors, setErrors] = useState({});

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
    const { name, value } = e.target;
    setSection(prev => ({
      ...prev,
      [name]: value
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
        order: parseInt(section.order, 10)
      };
      
      // Validate that we have a valid courseId
      if (!courseId) {
        throw new Error('Course ID is missing. Please navigate back and try again.');
      }
      
      const response = await sectionService.createSection(courseId, sectionData);
      
      if (response.success) {
        toast.success('Section created successfully!');
        // Navigate back to the course view
        navigate(`/educator/courses/view/${courseId}`, { 
          state: { sectionCreated: true } 
        });
      } else {
        throw new Error(response.message || 'Failed to create section');
      }
    } catch (err) {
      console.error('Error creating section:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to create section. Please try again.');
      }
    } finally {
      setSaving(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Create New Section</h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new section to organize your course content
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
              Provide the basic information for your new section
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
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                    Create Section
                  </>
                )}
              </button>
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
              <h3 className="text-sm font-medium text-blue-800">Tips for creating sections</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use clear, descriptive titles that reflect the content of the section</li>
                  <li>Organize sections in a logical sequence for better learning flow</li>
                  <li>Each section can contain multiple lectures and resources</li>
                  <li>You can reorder sections later using drag and drop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;