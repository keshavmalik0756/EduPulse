import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ 
  label, 
  id, 
  type = 'text', 
  error, 
  icon: Icon, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 w-full group">
      {label && (
        <label 
          htmlFor={id} 
          className="text-[12px] font-bold text-slate-700 ml-1 flex items-center gap-1.5 group-focus-within:text-emerald-600 transition-colors uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Icon size={17} />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-slate-50/50 border rounded-xl py-3 px-4 outline-none transition-all duration-300
            text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal text-sm
            ${Icon ? 'pl-11' : 'pl-4'}
            ${type === 'password' ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-red-200 focus:border-red-500 ring-4 ring-red-500/5' 
              : 'border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5'
            }
          `}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="text-xs font-medium text-red-400 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthInput;
