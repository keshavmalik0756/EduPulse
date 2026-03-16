import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap, BookOpen, Users, BarChart3, Sparkles } from 'lucide-react';

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

  if (variant === 'premium') {
    return (
      <div className={`${containerClasses} ${fullScreen ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-sm'}`}>
        <div className="flex flex-col items-center space-y-8">
          <div className="relative w-32 h-32">
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-l-purple-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle pulsating ring */}
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-blue-600/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner rotating ring (opposite direction) */}
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-transparent border-b-green-500 border-r-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Center Pulse Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 10px 20px rgba(37,99,235,0.3)",
                    "0 20px 40px rgba(168,85,247,0.4)",
                    "0 10px 20px rgba(37,99,235,0.3)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            {/* Orbiting particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  rotate: 360,
                }}
                style={{
                  top: '46%',
                  left: '46%',
                  originX: '150%',
                  originY: '150%',
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          <div className="text-center relative">
            <motion.h2
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              style={{ backgroundSize: '200% auto' }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              EduPulse
            </motion.h2>
            <motion.p
              className="text-blue-600/60 mt-2 font-semibold tracking-widest uppercase text-xs"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {text}
            </motion.p>
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

export const PremiumLoader = () => (
  <LoadingSpinner 
    variant="premium" 
    text="Initializing Pulse" 
    fullScreen={true} 
  />
);

export default LoadingSpinner;