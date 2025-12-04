import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  BookOpen,
  Users,
  Upload,
  Edit,
  Eye,
  Plus,
  Save
} from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  headerIcon,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  const variantClasses = {
    default: 'bg-white',
    educational: 'bg-gradient-to-br from-blue-50 to-green-50',
    danger: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`
                relative w-full ${sizeClasses[size]} 
                ${variantClasses[variant]} 
                rounded-xl shadow-2xl border border-gray-200 
                ${className}
              `}
            >
              {/* Header */}
              {(title || headerIcon || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {headerIcon && (
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {headerIcon}
                      </div>
                    )}
                    {title && (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                      </h3>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}) => {
  const variantConfig = {
    default: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      confirmClass: 'bg-green-600 hover:bg-green-700 text-white'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
  };

  const config = variantConfig[variant] || variantConfig.default;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant={variant}
      headerIcon={config.icon}
      title={title}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${config.confirmClass}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

// Course Modal Component
export const CourseModal = ({
  isOpen,
  onClose,
  course,
  mode = 'view', // 'view', 'edit', 'create'
  onSave,
  isLoading = false
}) => {
  const modeConfig = {
    view: {
      title: course?.title || 'Course Details',
      icon: <Eye className="w-5 h-5 text-blue-600" />,
      readonly: true
    },
    edit: {
      title: `Edit ${course?.title || 'Course'}`,
      icon: <Edit className="w-5 h-5 text-green-600" />,
      readonly: false
    },
    create: {
      title: 'Create New Course',
      icon: <Plus className="w-5 h-5 text-purple-600" />,
      readonly: false
    }
  };

  const config = modeConfig[mode];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      variant="educational"
      headerIcon={config.icon}
      title={config.title}
      footer={
        mode !== 'view' && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Course Image */}
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          {course?.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Course Thumbnail</p>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title
            </label>
            <input
              type="text"
              defaultValue={course?.title || ''}
              readOnly={config.readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              defaultValue={course?.category || ''}
              disabled={config.readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            defaultValue={course?.description || ''}
            readOnly={config.readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter course description"
          />
        </div>

        {/* Course Stats (View mode only) */}
        {mode === 'view' && course && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
            <div className="text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents || 0}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{course.lessons || 0}</p>
              <p className="text-sm text-gray-500">Lessons</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{course.completionRate || 0}%</p>
              <p className="text-sm text-gray-500">Completion</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Upload Modal Component
export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  acceptedTypes = 'image/*,video/*,.pdf,.doc,.docx',
  maxSize = 10, // MB
  multiple = false,
  title = 'Upload Files'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      headerIcon={<Upload className="w-5 h-5 text-blue-600" />}
      title={title}
    >
      <div className="space-y-6">
        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </h4>
          <p className="text-gray-500 mb-4">
            Supports: Images, Videos, PDFs, Documents
          </p>
          <p className="text-sm text-gray-400">
            Maximum file size: {maxSize}MB
          </p>
          
          <input
            type="file"
            accept={acceptedTypes}
            multiple={multiple}
            className="hidden"
            onChange={(e) => onUpload?.(e.target.files)}
          />
          
          <button
            onClick={() => document.querySelector('input[type="file"]').click()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Choose Files
          </button>
        </div>

        {/* Upload Guidelines */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep file names descriptive and organized</li>
            <li>• Compress large video files before uploading</li>
            <li>• Use high-quality images for better engagement</li>
            <li>• PDFs should be text-searchable when possible</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;