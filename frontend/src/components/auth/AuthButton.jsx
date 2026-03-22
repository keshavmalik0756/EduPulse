import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AuthButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  variant = 'primary', 
  type = 'button',
  onClick,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200',
    outline: 'bg-transparent hover:bg-slate-50 text-slate-600 border-2 border-slate-200 hover:text-emerald-500 hover:border-emerald-500'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300
        flex items-center justify-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <span>{children}</span>
      )}
    </motion.button>
  );
};

export default AuthButton;
