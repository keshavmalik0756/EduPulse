import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  LogOut,
  BarChart3,
  Sparkles,
  User,
  ChevronDown,
  Crown,
  GraduationCap,
  BookOpen,
  Library,
  Menu,
  X
} from 'lucide-react';
import logo from "../../assets/logo.png";
import { logout } from "../../redux/authSlice";

function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Get user role and dashboard path
  const userRole = user?.role?.toLowerCase() || 'student';
  const dashboardPath = userRole === 'admin' ? '/dashboard/admin' :
    userRole === 'educator' ? '/educator/dashboard' :
      '/dashboard/student';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      dispatch(logout());
      toast.success("👋 Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("❌ Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate(dashboardPath);
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    toast.success(`🚀 Navigating to ${userRole} dashboard...`);
    navigate(dashboardPath);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/profile');
    toast.success('📝 Opening profile...');
  };

  const handleCoursesClick = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/courses');
    toast.success('📚 Opening your courses...');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get role-specific colors and icons
  const getRoleConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          gradient: 'from-purple-500 to-pink-500',
          hoverGradient: 'from-purple-600 to-pink-600',
          icon: '👑',
          iconComponent: Crown,
          color: 'purple'
        };
      case 'educator':
        return {
          gradient: 'from-green-500 to-teal-500',
          hoverGradient: 'from-green-600 to-teal-600',
          icon: '🎓',
          iconComponent: GraduationCap,
          color: 'green'
        };
      default:
        return {
          gradient: 'from-blue-500 to-indigo-500',
          hoverGradient: 'from-blue-600 to-indigo-600',
          icon: '📚',
          iconComponent: BookOpen,
          color: 'blue'
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled
        ? 'bg-gray-900/95 backdrop-blur-xl shadow-xl border-b border-gray-700/50'
        : 'bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-18'
        }`}>
          
          {/* Logo Section */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="relative">
              <img
                src={logo}
                alt="EduPulse Logo"
                className={`rounded-xl border-2 border-gray-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg ${
                  isScrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'
                }`}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-gray-800 shadow-sm"></div>
              
              {/* Sparkle animation */}
              <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
              </div>
            </div>

            <div className="hidden xs:block">
              <h1 className={`font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight transition-all duration-300 ${
                isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              }`}>
                EduPulse
              </h1>
              <p className={`text-gray-300 -mt-1 capitalize transition-all duration-300 flex items-center space-x-1 ${
                isScrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}>
                <span className="text-base sm:text-lg">{roleConfig.icon}</span>
                <span className="hidden sm:inline">{user?.role || 'Student'} Portal</span>
                <span className="sm:hidden">{user?.role || 'Student'}</span>
              </p>
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {/* Profile Button */}
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                onMouseEnter={() => setIsProfileHovered(true)}
                onMouseLeave={() => setIsProfileHovered(false)}
              >
                <div className="relative">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Profile"
                      className={`rounded-full object-cover shadow-lg ring-2 ring-gray-600 transition-all duration-300 ${
                        isScrolled ? 'w-8 h-8 lg:w-10 lg:h-10' : 'w-10 h-10 lg:w-12 lg:h-12'
                      } ${isProfileHovered ? 'scale-110 shadow-xl ring-blue-400' : ''}`}
                    />
                  ) : (
                    <div className={`rounded-full bg-gradient-to-r ${roleConfig.gradient} flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-gray-600 transition-all duration-300 ${
                      isScrolled ? 'w-8 h-8 lg:w-10 lg:h-10 text-sm lg:text-base' : 'w-10 h-10 lg:w-12 lg:h-12 text-base lg:text-lg'
                    } ${isProfileHovered ? 'scale-110 shadow-xl ring-blue-400' : ''}`}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  {/* Online status */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                <div className="text-left">
                  <p className={`font-semibold text-white transition-all duration-300 ${
                    isScrolled ? 'text-sm lg:text-base' : 'text-base lg:text-lg'
                  }`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-gray-300 -mt-1 capitalize transition-all duration-300 ${
                    isScrolled ? 'text-xs lg:text-sm' : 'text-sm lg:text-base'
                  }`}>
                    {user?.role || 'Student'}
                  </p>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 py-2 z-[60] animate-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {user?.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-gray-600"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleConfig.gradient} flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-gray-600`}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{user?.name || 'User'}</p>
                        <p className="text-gray-300 text-sm truncate">{user?.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <roleConfig.iconComponent className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 capitalize">{user?.role || 'Student'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-left"
                    >
                      <span className="font-medium">View Profile</span>
                    </button>

                    <button
                      onClick={handleCoursesClick}
                      className="w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-left"
                    >
                      <span className="font-medium">My Courses</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 text-left"
                  >
                    <span className="font-medium">
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Dashboard Button */}
            <button
              onClick={handleDashboardClick}
              className={`group flex items-center space-x-2 bg-gradient-to-r ${roleConfig.gradient} hover:${roleConfig.hoverGradient} text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden ${
                isScrolled
                  ? 'px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm'
                  : 'px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base'
              }`}
            >
              <BarChart3 className={`transition-all duration-300 group-hover:rotate-12 ${
                isScrolled ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4 lg:w-5 lg:h-5'
              }`} />
              <span className="font-semibold">Dashboard</span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${
                isScrolled
                  ? 'px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm'
                  : 'px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base'
              }`}
            >
              {isLoading ? (
                <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
                  isScrolled ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4 lg:w-5 lg:h-5'
                }`}></div>
              ) : (
                <LogOut className={`transition-all duration-300 group-hover:-rotate-12 ${
                  isScrolled ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4 lg:w-5 lg:h-5'
                }`} />
              )}
              <span className="font-semibold">
                {isLoading ? 'Logging out...' : 'Logout'}
              </span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-gray-800/95 backdrop-blur-xl border-t border-gray-700/50 shadow-xl animate-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Profile Section */}
            <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl">
              <div className="relative">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-gray-600"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleConfig.gradient} flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-gray-600`}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-gray-300 text-sm truncate">{user?.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <roleConfig.iconComponent className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400 capitalize">{user?.role || 'Student'}</span>
                </div>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-2">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">View Profile</span>
              </button>

              <button
                onClick={handleCoursesClick}
                className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <Library className="w-5 h-5" />
                <span className="font-medium">My Courses</span>
              </button>

              <button
                onClick={handleDashboardClick}
                className={`w-full flex items-center space-x-3 p-3 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-xl font-medium transition-all duration-200 shadow-lg`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {isLoading ? 'Logging out...' : 'Logout'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar animation on scroll */}
      <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${roleConfig.gradient} transition-all duration-300 ${
        isScrolled ? 'w-full opacity-100' : 'w-0 opacity-0'
      }`}></div>
    </nav>
  );
}

export default HomeNavbar;