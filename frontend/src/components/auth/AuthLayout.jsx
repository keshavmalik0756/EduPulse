import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, image, imageAlt, reverse = false }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`min-h-screen w-full flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} bg-white overflow-hidden font-sans selection:bg-sky-500/20`}>
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1] pointer-events-none"></div>

      {/* Side: Form Content */}
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex-1 min-h-[100dvh] md:min-h-0 md:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 z-10 relative"
      >
        <div className="w-full max-w-sm lg:max-w-md space-y-5">
          <div className="space-y-1.5 text-center md:text-left text-wrap">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl font-black tracking-tight leading-none"
            >
              <span className="bg-gradient-to-r from-sky-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                {title}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-slate-500 text-base md:text-lg font-medium leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="bg-white p-5 sm:p-7 rounded-[1.75rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100 relative group"
          >
            {/* Minimal background glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-emerald-400 rounded-[2.5rem] blur opacity-[0.03] group-hover:opacity-[0.08] transition duration-700"></div>
            
            <div className="relative">
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Side: Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-900 to-green-900 items-center justify-center overflow-hidden ${reverse ? 'rounded-tr-[100px] rounded-br-[100px]' : 'rounded-tl-[100px] rounded-bl-[100px]'}`}
      >
        {/* Animated Background Shapes */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 p-12 text-center space-y-8 max-w-xl">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src={image} 
              alt={imageAlt} 
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(59,130,246,0.5)] max-h-[500px] object-contain"
            />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Elevate Your Learning with AI
            </h2>
            <p className="text-blue-100/70 text-lg leading-relaxed">
              Experience the next generation of education with personalized AI assistance, 
              interactive modules, and a global community of learners.
            </p>
          </div>
          
          <div className="pt-8">
            <div className="flex items-center justify-center space-x-4 transition duration-500">
              {/* Educational Trust Badges - Premium Glassmorphism style */}
              <div className="h-9 px-4 bg-white/15 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black tracking-[0.15em] uppercase text-white shadow-xl backdrop-blur-md hover:bg-white/25 transition-all">
                Trusted
              </div>
              <div className="h-9 px-4 bg-white/15 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black tracking-[0.15em] uppercase text-white shadow-xl backdrop-blur-md hover:bg-white/25 transition-all">
                Certified
              </div>
              <div className="h-9 px-4 bg-white/15 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black tracking-[0.15em] uppercase text-white shadow-xl backdrop-blur-md hover:bg-white/25 transition-all">
                AI-Powered
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner grid */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
