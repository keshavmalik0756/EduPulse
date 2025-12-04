import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  X,
  Zap,
  BookOpen,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  action,
  persistent = false,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(id), 300);
  };

  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      progressColor: 'bg-blue-500'
    },
    educational: {
      icon: BookOpen,
      bgColor: 'bg-gradient-to-r from-blue-50 to-green-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-gray-800',
      messageColor: 'text-gray-700',
      progressColor: 'bg-gradient-to-r from-blue-500 to-green-500'
    }
  };

  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}
        >
          <div className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg overflow-hidden`}>
            {/* Progress bar */}
            {!persistent && duration > 0 && (
              <div className="h-1 bg-gray-200">
                <motion.div
                  className={`h-full ${config.progressColor}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                      {title}
                    </h4>
                  )}
                  {message && (
                    <p className={`text-sm ${config.messageColor}`}>
                      {message}
                    </p>
                  )}
                  
                  {/* Action button */}
                  {action && (
                    <button
                      onClick={action.onClick}
                      className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline`}
                    >
                      {action.label}
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 80}px)`
          }}
        >
          <Toast
            {...toast}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

// Custom hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Preset toast functions
  const showSuccess = (title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const showError = (title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      persistent: true,
      ...options
    });
  };

  const showWarning = (title, message, options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  const showInfo = (title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  };

  const showEducational = (title, message, options = {}) => {
    return addToast({
      type: 'educational',
      title,
      message,
      ...options
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showEducational
  };
};

// Preset educational toasts
export const EducationalToasts = {
  courseCreated: (courseName) => ({
    type: 'educational',
    title: 'Course Created Successfully! 🎉',
    message: `"${courseName}" is now ready for students to enroll.`,
    action: {
      label: 'View Course',
      onClick: () => console.log('Navigate to course')
    }
  }),

  studentEnrolled: (studentName, courseName) => ({
    type: 'success',
    title: 'New Student Enrolled! 👨‍🎓',
    message: `${studentName} just enrolled in "${courseName}".`,
    action: {
      label: 'View Student',
      onClick: () => console.log('Navigate to student')
    }
  }),

  assignmentSubmitted: (studentName, assignmentName) => ({
    type: 'info',
    title: 'Assignment Submitted 📝',
    message: `${studentName} submitted "${assignmentName}".`,
    action: {
      label: 'Grade Now',
      onClick: () => console.log('Navigate to grading')
    }
  }),

  milestoneReached: (milestone, count) => ({
    type: 'educational',
    title: `Milestone Achieved! 🏆`,
    message: `You've reached ${count} ${milestone}. Keep up the great work!`,
    duration: 8000
  }),

  systemUpdate: (feature) => ({
    type: 'info',
    title: 'New Feature Available! ✨',
    message: `${feature} is now available in your educator dashboard.`,
    action: {
      label: 'Learn More',
      onClick: () => console.log('Navigate to feature')
    },
    persistent: true
  })
};

export default Toast;