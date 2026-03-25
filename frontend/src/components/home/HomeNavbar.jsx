"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Search,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Crown,
  GraduationCap
} from "lucide-react";

function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const dropdownRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    dispatch({ type: "auth/logout" });
    navigate("/login");
  };

  // 🧠 Intelligent Role-Based Configuration
  const getDashboardConfig = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return {
          label: "Admin Console",
          path: "/dashboard/admin",
          icon: <Crown className="w-4 h-4" />,
          mobileIcon: <Crown />,
          color: "from-purple-500 to-pink-500",
          glow: "shadow-purple-500/20",
          text: "purple"
        };
      case 'educator':
        return {
          label: "Teaching Hub",
          path: "/educator/dashboard",
          icon: <GraduationCap className="w-4 h-4" />,
          mobileIcon: <GraduationCap />,
          color: "from-blue-500 to-indigo-600",
          glow: "shadow-blue-500/20",
          text: "blue"
        };
      default:
        return {
          label: "Learning Deck",
          path: "/dashboard/student",
          icon: <LayoutDashboard className="w-4 h-4" />,
          mobileIcon: <LayoutDashboard />,
          color: "from-emerald-500 to-sky-500",
          glow: "shadow-emerald-500/20",
          text: "emerald"
        };
    }
  };

  const dashConfig = getDashboardConfig();


  return (
    <>
      {/* 💎 Scroll Progress System (Ultra-Elite Thin) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[70] origin-left bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        style={{ scaleX }}
      />

      {/* 💎 Main Navbar Adaptive Layout */}
      <nav
        className={`fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isScrolled
            ? "top-0 left-0 right-0 bg-white/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(16,185,129,0.06)] border-b border-emerald-500/5 py-3"
            : "top-6 left-1/2 -translate-x-1/2 max-w-[850px] w-[92%] bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2.5"
        }`}
      >
        <div className="flex items-center justify-between px-6">
          
          {/* Logo Section with Gradient Text */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform duration-500">
              <span className="text-white font-black text-xl italic leading-none">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
              EduPulse
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            
            {/* Search Bar (Glass UI) */}
            <div className="relative group/search">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within/search:text-emerald-500 transition-colors duration-300" />
               </div>
               <input 
                  type="text" 
                  placeholder="Ask AI anything..."
                  className="bg-slate-100/50 border border-slate-200/50 rounded-full py-1.5 pl-10 pr-4 text-sm w-44 focus:w-60 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all duration-500 placeholder:text-slate-400"
               />
            </div>

            {/* Premium Role-Based Dashboard CTA */}
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(dashConfig.path)}
              className={`relative px-5 py-2 overflow-hidden group rounded-full shadow-lg ${dashConfig.glow}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${dashConfig.color} transition-all duration-500 group-hover:hue-rotate-15`} />
              <div className="relative flex items-center gap-2 text-white font-bold text-sm">
                {dashConfig.icon}
                <span>{dashConfig.label}</span>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </motion.button>

            {/* Profile Dropdown with Conic Avatar */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-full hover:bg-slate-100/50 transition-all duration-300 group/profile"
              >
                {/* Conic Avatar System */}
                <div className="relative w-9 h-9 rounded-full flex items-center justify-center p-[2px] overflow-hidden">
                  <div className="absolute inset-[-100%] rounded-full animate-conic-spin bg-[conic-gradient(from_0deg,#10b981,#38bdf8,#14b8a6,#10b981)] opacity-70 group-hover/profile:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-900 font-black text-sm">{user?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  {/* Subtle Glow */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_8px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${openProfile ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden z-[60] p-2"
                  >
                    {/* Mini Profile Card */}
                    <div className="p-4 bg-emerald-50/50 rounded-2xl mb-1.5 border border-emerald-100/50">
                       <div className="flex items-center gap-3">
                         <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                            {user?.name?.charAt(0) || "U"}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <h4 className="font-bold text-slate-900 truncate tracking-tight">{user?.name || "Explorer"}</h4>
                            <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-0.5">
                      <button onClick={() => { navigate("/profile"); setOpenProfile(false); }} 
                        className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 font-bold text-sm group/item"
                      >
                        <User className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                        Profile
                      </button>
                      
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 font-bold text-sm group/logout"
                      >
                        <LogOut className="w-4 h-4 group-hover/logout:translate-x-1 transition-transform" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 📱 Mobile Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </nav>

      {/* 🚀 Mobile Full-Screen Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="fixed inset-x-0 top-0 bg-white z-[90] p-8 rounded-b-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
                   <h1 className="font-bold text-xl tracking-tight">Navigation</h1>
                </div>
                <motion.button 
                  whileTap={{ rotate: 90 }}
                  onClick={() => setMobileOpen(false)}
                  className="p-2 bg-slate-50 rounded-full"
                >
                  <X className="w-6 h-6 text-slate-900" />
                </motion.button>
              </div>

              {/* Drawer Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                  }
                }}
                className="space-y-4"
              >
                {[
                  { label: "Explorer", path: "/", icon: <BookOpen />, color: "emerald" },
                  { label: dashConfig.label, path: dashConfig.path, icon: dashConfig.mobileIcon, color: dashConfig.text },
                  { label: "Profile Settings", path: "/profile", icon: <User />, color: "blue" },
                  { label: "Sign Out", action: handleLogout, icon: <LogOut />, color: "red" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <button
                      onClick={() => { if(item.action) item.action(); else navigate(item.path); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] font-bold text-lg text-slate-800 active:scale-95 active:bg-slate-100 transition-all`}
                    >
                      <div className={`p-2.5 rounded-xl bg-white shadow-sm text-${item.color}-500`}>
                        {item.icon}
                      </div>
                      {item.label}
                    </button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Drawer Footer (Mini Profile) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-2xl">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-lg truncate">{user?.name || "Explorer"}</p>
                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                   <ChevronDown className="-rotate-90 w-5 h-5" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🔮 Ultra-Premium Styles */}
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            animation: gradient-x 6s ease infinite;
          }
          @keyframes conic-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-conic-spin {
            animation: conic-spin 4s linear infinite;
          }
        `}
      </style>
    </>
  );
}

export default HomeNavbar;
 HomeNavbar;