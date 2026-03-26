import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Basic Info', description: 'Title, category & tags' },
  { id: 2, name: 'Media Assets', description: 'Thumbnail & preview' },
  { id: 3, name: 'Course Content', description: 'Outcomes & requirements' },
  { id: 4, name: 'Pricing', description: 'Price & enrollment' }
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="py-4 lg:py-6 px-3 lg:px-4 mb-6 lg:mb-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative flex flex-col items-center flex-1">
              {stepIdx !== steps.length - 1 && (
                <div 
                  className="absolute top-5 left-[50%] right-[-50%] h-0.5 w-full bg-gray-200" 
                  aria-hidden="true" 
                />
              )}
              
              <div className="group relative flex flex-col items-center">
                <motion.span 
                  initial={false}
                  animate={{
                    backgroundColor: step.id < currentStep ? '#10b981' : step.id === currentStep ? '#0ea5e9' : '#ffffff',
                    borderColor: step.id <= currentStep ? 'transparent' : '#d1d5db',
                    scale: step.id === currentStep ? 1.1 : 1
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold z-10 shadow-sm transition-colors duration-300"
                >
                  {step.id < currentStep ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span className={step.id === currentStep ? 'text-white' : 'text-gray-500'}>
                      {step.id}
                    </span>
                  )}
                </motion.span>
                
                <div className="mt-3 text-center">
                    <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${
                    step.id === currentStep ? 'text-sky-600' : step.id < currentStep ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {/* Compact names for mobile */}
                    <span className="sm:hidden">{step.name.split(' ')[0]}</span>
                    <span className="hidden sm:inline">{step.name}</span>
                  </span>
                  <p className="hidden sm:block text-[10px] text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Progress filling line */}
              {stepIdx !== steps.length - 1 && (
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: step.id < currentStep ? '100%' : '0%' 
                  }}
                  className="absolute top-5 left-[50%] h-0.5 bg-emerald-500 z-10" 
                  transition={{ duration: 0.5 }}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default StepIndicator;
