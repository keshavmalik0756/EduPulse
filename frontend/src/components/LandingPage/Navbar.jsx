import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { BrainCircuit, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navLinks } from './constants';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Assuming false for unauthenticated state based on prompt
  const isAuthenticated = false;

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled threshold
      setScrolled(currentScrollY > 20);

      // Visibility (Hide on scroll down, show on up)
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Active Section Tracking
      const sections = ['educators', 'features', 'curriculum', 'success'];
      let current = '';
      for (let s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Adjust threshold for when section is considered "active"
          if (rect.top <= 150 && rect.bottom >= 150) {
             current = s;
             break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (href.startsWith('#')) {
      if (location.pathname === '/' || location.pathname === '') {
        const id = href.substring(1);
        // Handle jump to top gracefully
        if (id === '') {
           window.scrollTo({ top: 0, behavior: 'smooth' });
           return;
        }
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100, // Offset for navbar
            behavior: 'smooth'
          });
        }
      } else {
        navigate(`/${href}`);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-emerald-400 via-teal-500 to-slate-800 origin-left"
        style={{ scaleX }}
      />

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 w-full ${
          scrolled ? 'py-3' : 'py-6 px-4'
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 w-full ${
            scrolled 
              ? 'max-w-5xl mx-auto rounded-full bg-white/80 backdrop-blur-2xl shadow-xl shadow-emerald-500/5 border border-white/40 px-6 py-3' 
              : 'max-w-7xl mx-auto bg-transparent border-transparent px-4 py-2'
          }`}
        >
          {/* Left: Logo */}
          <Link to="/" onClick={(e) => handleNavClick(e, '#')} className="flex-shrink-0 flex items-center gap-3 cursor-pointer group z-20">
            <div className={`p-2 rounded-xl transition-all duration-300 shadow-sm ${scrolled ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : 'bg-slate-900 shadow-lg group-hover:bg-emerald-500'}`}>
              <BrainCircuit className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className={`text-2xl font-black tracking-tight transition-all duration-300 ${
              scrolled 
                ? 'bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-800 bg-clip-text text-transparent'
            }`}>
               EduPulse
            </span>
          </Link>

          {/* Center: Absolute Links Container */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10">
            <div className={`flex items-center gap-1 p-1.5 rounded-full transition-all duration-500 ${
              scrolled ? 'bg-slate-100/50 border border-slate-200/50' : 'bg-white/40 backdrop-blur-md border border-white/20'
            }`}>
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-5 py-2 text-sm font-black transition-all duration-300 rounded-full group ${
                    scrolled 
                      ? isActive ? 'text-emerald-700 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm' 
                      : isActive ? 'text-emerald-600 bg-emerald-50/50 shadow-[0_2px_10px_rgba(16,185,129,0.1)]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </a>
              )})}
            </div>
          </div>

          {/* Right: Auth Actions */}
          <div className="hidden lg:flex items-center gap-4 z-20">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`font-bold text-sm transition-colors px-4 py-2 rounded-full ${scrolled ? 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50' : 'text-white hover:text-emerald-300 hover:bg-white/10'}`}>
                  Dashboard
                </Link>
                <div className={`h-4 w-px mx-1 ${scrolled ? 'bg-slate-200' : 'bg-white/30'}`}></div>
                <button className={`px-6 py-2.5 font-bold text-sm text-white bg-slate-800 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-slate-800/20 hover:shadow-slate-800/40`}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`font-black text-sm transition-colors px-4 py-2 rounded-full ${scrolled ? 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50'}`}>
                  Sign In
                </Link>
                <div className={`h-4 w-px mx-1 ${scrolled ? 'bg-slate-200' : 'bg-slate-200'}`}></div>
                <Link to="/signup" className="px-6 py-2.5 font-black text-sm text-white bg-slate-900 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-600/20">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center z-20">
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className={`p-2 rounded-xl transition-all duration-300 shadow-sm ${
                 scrolled 
                   ? 'text-slate-900 bg-slate-100 hover:bg-slate-200' 
                   : 'text-slate-900 bg-white/80 border border-slate-200/50 hover:bg-white backdrop-blur-md'
               }`}
             >
               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full px-4 mt-4 lg:hidden z-40"
            >
               <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200/60 flex flex-col gap-3">
                {navLinks.map((link) => {
                   const isActive = activeSection === link.id;
                   return (
                   <a 
                     key={link.name} 
                     href={link.href}
                     onClick={(e) => handleNavClick(e, link.href)}
                     className={`flex items-center gap-4 p-3 rounded-2xl border transition-all group ${
                       isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'
                     }`}
                   >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                       isActive ? 'bg-emerald-100' : 'bg-emerald-50'
                     }`}>
                       <link.icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-emerald-600'}`} />
                     </div>
                     <span className={`font-black transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-600'}`}>{link.name}</span>
                   </a>
                 )})}
                 
                 <div className="h-px bg-slate-100 my-2"></div>
                 
                 <div className="grid grid-cols-2 gap-3 p-1">
                   {isAuthenticated ? (
                     <>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                          Dashboard
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-white bg-slate-800 shadow-lg shadow-slate-800/20 hover:-translate-y-0.5 transition-all">
                          Sign Out
                        </button>
                     </>
                   ) : (
                     <>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                          Sign In
                        </Link>
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-white bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">
                          Get Started
                        </Link>
                     </>
                   )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
