import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Sparkles, Brain, BookOpen, BarChart as BarChartIcon, Mail, X, Menu, Users, Library } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#hero', icon: <Sparkles size={20} /> },
    { label: 'Features', href: '#features', icon: <Brain size={20} /> },
    { label: 'Tools', href: '#tools', icon: <BookOpen size={20} /> },
    { label: 'Categories', href: '#categories', icon: <Library size={20} /> },
    { label: 'Overview', href: '#overview', icon: <BarChartIcon size={20} /> },
    { label: 'Testimonials', href: '#testimonials', icon: <Users size={20} /> },
    { label: 'Contact', href: '#contact', icon: <Mail size={20} /> }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavItemClick = (e, href) => {
    // If we're on the landing page, scroll to section
    if (location.pathname === '/' && href.startsWith('#')) {
      scrollToSection(e, href);
    } else {
      // Otherwise, navigate to the section on the landing page
      if (href.startsWith('#')) {
        navigate(`/${href}`);
      } else {
        navigate(href);
      }
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const menuVariants = {
    closed: { x: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    open: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }
  };
  const itemVariants = { closed: { opacity: 0, x: 20 }, open: { opacity: 1, x: 0 } };
  const overlayVariants = { closed: { opacity: 0 }, open: { opacity: 1 } };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gradient-to-r from-blue-900/90 to-green-900/90 backdrop-blur-md py-3 shadow-xl' : 'bg-transparent py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-blue-400" size={28} />
            </motion.div>
            <span className="text-white text-xl font-bold bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
              EduPulse
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                onClick={(e) => handleNavItemClick(e, item.href)}
                className="text-white/80 hover:text-white text-sm font-medium relative group px-3 py-2 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                    {item.icon}
                  </motion.div>
                  <span>{item.label}</span>
                </div>
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" 
                  initial={false} 
                />
              </motion.a>
            ))}
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <motion.button 
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg transition-all duration-300"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }} 
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginClick}
            >
              Login
            </motion.button>
            <motion.button 
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 shadow-lg"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
              }} 
              whileTap={{ scale: 0.95 }}
              onClick={handleSignupClick}
            >
              Sign Up
            </motion.button>
          </div>
          
          <motion.button 
            className="md:hidden relative w-10 h-10 flex items-center justify-center z-50 rounded-lg bg-white/10 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" 
                variants={overlayVariants} 
                initial="closed" 
                animate="open" 
                exit="closed" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <motion.div 
                className="fixed top-0 right-0 h-screen w-64 bg-gradient-to-b from-blue-900/95 to-green-900/95 backdrop-blur-lg z-50 border-l border-white/10"
                variants={menuVariants} 
                initial="closed" 
                animate="open" 
                exit="closed"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-blue-400" size={24} />
                      <span className="text-white text-lg font-semibold">EduPulse</span>
                    </div>
                    <motion.button 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }} 
                      className="text-white p-2 rounded-lg hover:bg-white/10"
                    >
                      <X size={24} />
                    </motion.button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col space-y-2">
                      {navItems.map((item, index) => (
                        <motion.a
                          key={index}
                          href={item.href}
                          onClick={(e) => handleNavItemClick(e, item.href)}
                          className="flex items-center gap-3 text-white/80 hover:text-white text-sm font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                          whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                          transition={{ delay: index * 0.1 }}
                        >
                          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                            {item.icon}
                          </motion.div>
                          {item.label}
                        </motion.a>
                      ))}
                    </div>
                    <div className="flex flex-col space-y-3 pt-6 mt-6 border-t border-white/10">
                      <motion.button 
                        className="w-full px-4 py-3 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.2)" }} 
                        whileTap={{ scale: 0.98 }} 
                        variants={itemVariants} 
                        initial="closed" 
                        animate="open" 
                        transition={{ delay: navItems.length * 0.1 }}
                        onClick={handleLoginClick}
                      >
                        Login
                      </motion.button>
                      <motion.button 
                        className="w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 shadow-lg"
                        whileHover={{ 
                          scale: 1.02, 
                          boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
                        }} 
                        whileTap={{ scale: 0.98 }} 
                        variants={itemVariants} 
                        initial="closed" 
                        animate="open" 
                        transition={{ delay: navItems.length * 0.1 + 0.1 }}
                        onClick={handleSignupClick}
                      >
                        Sign Up
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-4 text-center text-white/50 text-xs">
                    © 2024 EduPulse
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;