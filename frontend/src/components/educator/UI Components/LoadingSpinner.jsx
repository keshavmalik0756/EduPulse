import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  variant = 'default',
  fullScreen = false,
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-4';

  if (variant === 'pulse') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <motion.p
            className="text-gray-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                animate={{
                  y: [-10, 0, -10],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'educational') {
    const icons = [BookOpen, Users, BarChart3, GraduationCap];
    
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-20 h-20">
            {icons.map((Icon, index) => (
              <motion.div
                key={index}
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotate: 360,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "linear"
                }}
              >
                <Icon className="w-8 h-8 text-blue-600" />
              </motion.div>
            ))}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <motion.div
              className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-green-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center">
            <motion.p
              className="text-lg font-semibold text-gray-800"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {text}
            </motion.p>
            <p className="text-sm text-gray-500 mt-1">
              Preparing your educational experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {showIcon && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className={`${sizeClasses[size]} text-blue-600`} />
            </motion.div>
          )}
          <motion.div
            className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-r-green-500 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {text && (
          <motion.p
            className={`text-gray-600 font-medium ${textSizeClasses[size]}`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Preset loading components for common use cases
export const PageLoader = () => (
  <LoadingSpinner 
    variant="educational" 
    text="Loading Dashboard" 
    fullScreen={true} 
  />
);

export const CourseLoader = () => (
  <LoadingSpinner 
    variant="pulse" 
    text="Loading Courses" 
    size="lg" 
  />
);

export const DataLoader = () => (
  <LoadingSpinner 
    variant="dots" 
    text="Processing Data" 
    size="md" 
  />
);

export const ButtonLoader = () => (
  <LoadingSpinner 
    size="sm" 
    text="" 
    showIcon={false} 
  />
);

export default LoadingSpinner;