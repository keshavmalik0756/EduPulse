import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { heroContent } from './data';
import { Search, Brain, Sparkles, Play, Users, BookOpen, TrendingUp } from 'lucide-react';
import { SiViaplay } from 'react-icons/si';

const HeroSection = () => {
  const navigate = useNavigate();

  // Custom AI Search Icon Component
  const AISearchIcon = () => (
    <div className="relative">
      <Search className="w-7 h-7" />
      <div className="absolute -top-1 -right-1">
        <Sparkles className="w-3 h-3 text-yellow-300" />
      </div>
      <div className="absolute -bottom-1 -left-1">
        <Brain className="w-3 h-3 text-blue-300" />
      </div>
    </div>
  );

  // Floating Elements for Animation
  const FloatingElements = () => (
    <>
      {/* Floating Book */}
      <motion.div 
        className="absolute top-1/4 left-10 text-blue-400"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <BookOpen size={32} />
      </motion.div>
      
      {/* Floating Users */}
      <motion.div 
        className="absolute top-1/3 right-20 text-green-400"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Users size={28} />
      </motion.div>
      
      {/* Floating Chart */}
      <motion.div 
        className="absolute bottom-1/4 left-20 text-amber-400"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <TrendingUp size={24} />
      </motion.div>
      
      {/* Floating Play Button */}
      <motion.div 
        className="absolute bottom-1/3 right-10 text-purple-400"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Play size={20} />
      </motion.div>
    </>
  );

  // Check if user is authenticated (you can replace this with your actual auth logic)
  const isAuthenticated = () => {
    // For now, assume user is not authenticated on landing page
    // You can replace this with actual auth state check
    return false;
  };

  const handleViewAllCourses = () => {
    if (isAuthenticated()) {
      navigate('/courses');
    } else {
      navigate('/login');
    }
  };

  const handleSearchWithAI = () => {
    if (isAuthenticated()) {
      navigate('/ai-search');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section id="hero">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-green-900/70" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-30" />
        <FloatingElements />
        <div className="container mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              {heroContent.title}
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 drop-shadow-md font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {heroContent.subtitle}
            </motion.p>
            <motion.p
              className="text-base sm:text-lg text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {heroContent.description}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleSearchWithAI}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                  backgroundColor: "#1E40AF"
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl shadow-xl transition-all w-full sm:w-auto text-lg font-semibold"
              >
                <AISearchIcon />
                Search with AI
              </motion.button>

              <motion.button
                onClick={handleViewAllCourses}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                  backgroundColor: "#047857"
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl shadow-xl transition-all w-full sm:w-auto text-lg font-semibold"
              >
                <SiViaplay size={28} /> View All Courses
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-blue-500/20 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-green-500/20 blur-xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;