import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    Bell,
    Search,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    ChevronDown,
    MessageSquare,
    BookOpen,
    Home,
    Users,
    BarChart3,
    Calendar,
    Award,
    Shield,
    GraduationCap,
    UserCheck,
    Plus,
    FileText,
    Clock,
    Star,
    Bookmark,
    Download,
    Upload,
    Zap,
    Archive,
    Trash2
} from 'lucide-react';
import logo from "../assets/logo.png";
import { logout } from "../redux/authSlice";

function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const [searchQuery, setSearchQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState([
        "React Components", "JavaScript ES6", "CSS Grid"
    ]);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    // Get appropriate dashboard path based on user role
    const userRole = user?.role?.toLowerCase();
    const dashboardPath = userRole === 'admin' ? '/dashboard/admin' :
        userRole === 'educator' ? '/educator/dashboard' :
            '/dashboard/student';

    // Clean navigation items without badges
    const getNavigationItems = () => {
        const baseItems = [
            {
                name: 'Dashboard',
                icon: BarChart3,
                path: dashboardPath,
                shortcut: '⌘1'
            }
        ];

        const roleSpecificItems = {
            student: [
                {
                    name: 'My Courses',
                    icon: BookOpen,
                    path: '/courses',
                    shortcut: '⌘2'
                },
                {
                    name: 'Schedule',
                    icon: Calendar,
                    path: '/schedule',
                    shortcut: '⌘3'
                },
                {
                    name: 'Assignments',
                    icon: FileText,
                    path: '/assignments'
                },
                {
                    name: 'Achievements',
                    icon: Award,
                    path: '/achievements'
                },
                {
                    name: 'Messages',
                    icon: MessageSquare,
                    path: '/messages'
                },
                {
                    name: 'Bookmarks',
                    icon: Bookmark,
                    path: '/bookmarks'
                }
            ],
            educator: [
                {
                    name: 'My Courses',
                    icon: BookOpen,
                    path: '/courses',
                    shortcut: '⌘2'
                },
                {
                    name: 'Students',
                    icon: Users,
                    path: '/students'
                },
                {
                    name: 'Schedule',
                    icon: Calendar,
                    path: '/schedule',
                    shortcut: '⌘3'
                },
                {
                    name: 'Grading',
                    icon: GraduationCap,
                    path: '/grading'
                },
                {
                    name: 'Analytics',
                    icon: BarChart3,
                    path: '/analytics'
                },
                {
                    name: 'Messages',
                    icon: MessageSquare,
                    path: '/messages'
                },
                {
                    name: 'Resources',
                    icon: Archive,
                    path: '/resources'
                }
            ],
            admin: [
                {
                    name: 'Users',
                    icon: Users,
                    path: '/admin/users',
                    shortcut: '⌘2'
                },
                {
                    name: 'Courses',
                    icon: BookOpen,
                    path: '/admin/courses'
                },
                {
                    name: 'Analytics',
                    icon: BarChart3,
                    path: '/admin/analytics'
                },
                {
                    name: 'Settings',
                    icon: Settings,
                    path: '/admin/settings'
                },
                {
                    name: 'Security',
                    icon: Shield,
                    path: '/admin/security'
                },
                {
                    name: 'Reports',
                    icon: FileText,
                    path: '/admin/reports'
                }
            ]
        };

        return [...baseItems, ...(roleSpecificItems[userRole] || roleSpecificItems.student)];
    };

    // Quick actions based on user role
    const getQuickActions = () => {
        const quickActions = {
            student: [
                { name: 'Join Class', icon: Plus, action: () => navigate('/join-class') },
                { name: 'Submit Assignment', icon: Upload, action: () => navigate('/submit') },
                { name: 'Study Timer', icon: Clock, action: () => toast.success('⏰ Study timer started!') },
                { name: 'Download Resources', icon: Download, action: () => navigate('/downloads') }
            ],
            educator: [
                { name: 'Create Course', icon: Plus, action: () => navigate('/create-course') },
                { name: 'Quick Grade', icon: Star, action: () => navigate('/quick-grade') },
                { name: 'Upload Material', icon: Upload, action: () => navigate('/upload') },
                { name: 'Class Analytics', icon: BarChart3, action: () => navigate('/class-analytics') }
            ],
            admin: [
                { name: 'Add User', icon: Plus, action: () => navigate('/admin/add-user') },
                { name: 'System Backup', icon: Archive, action: () => toast.success('🔄 Backup initiated!') },
                { name: 'Generate Report', icon: FileText, action: () => navigate('/admin/generate-report') },
                { name: 'Security Scan', icon: Shield, action: () => toast.success('� SBecurity scan started!') }
            ]
        };

        return quickActions[userRole] || quickActions.student;
    };

    const navItems = getNavigationItems();

    // Close dropdowns when clicking outside and handle keyboard shortcuts
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setIsProfileOpen(false);
                setIsQuickActionsOpen(false);
                setIsMoreMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            // Keyboard shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'k':
                        event.preventDefault();
                        document.querySelector('input[placeholder*="Search"]')?.focus();
                        break;
                    case '1':
                        event.preventDefault();
                        navigate(dashboardPath);
                        break;
                    case '2':
                        event.preventDefault();
                        navigate('/courses');
                        break;
                    case '3':
                        event.preventDefault();
                        navigate('/schedule');
                        break;
                    case ',':
                        event.preventDefault();
                        navigate('/settings');
                        break;
                }
            }

            // Escape key to close dropdowns
            if (event.key === 'Escape') {
                setIsProfileOpen(false);
                setIsQuickActionsOpen(false);
                setIsMoreMenuOpen(false);
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate, dashboardPath]);

    const handleLogout = async () => {
        try {
            await dispatch(logout());
            toast.success("Logged out successfully!");
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    // Simple search placeholder based on user role
    const getSearchPlaceholder = () => {
        switch (userRole) {
            case 'admin':
                return 'Search users and courses...';
            case 'educator':
                return 'Search students and courses...';
            case 'student':
            default:
                return 'Search courses and materials...';
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Add to recent searches
            setRecentSearches(prev => {
                const newSearches = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
                return newSearches;
            });

            let searchContext = 'general';
            if (location.pathname.includes('/courses')) {
                searchContext = 'courses';
            } else if (location.pathname.includes('/students')) {
                searchContext = 'students';
            } else if (location.pathname.includes('/messages')) {
                searchContext = 'messages';
            } else if (location.pathname.includes('/admin')) {
                searchContext = 'admin';
            } else if (location.pathname.includes('/analytics')) {
                searchContext = 'analytics';
            } else if (location.pathname.includes('/schedule')) {
                searchContext = 'schedule';
            }

            toast.success(`🔍 Searching ${searchContext} for: "${searchQuery}"`);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}&context=${searchContext}&role=${userRole}&timestamp=${Date.now()}`);
            setSearchQuery('');
        }
    };

    // Enhanced search with suggestions
    const handleSearchSelect = (query) => {
        setSearchQuery(query);
        navigate(`/search?q=${encodeURIComponent(query)}&role=${userRole}`);
        setSearchQuery('');
    };

    // Smart logo click navigation
    const handleLogoClick = () => {
        navigate(dashboardPath);
    };

    // Enhanced notification handling
    const handleNotificationClick = () => {
        setNotifications(0);
        toast.success('📬 Opening notifications...');
        navigate('/notifications');
    };

    // Simulate real-time notifications
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                setNotifications(prev => Math.min(prev + 1, 9));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">

                    {/* Logo Section */}
                    <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="flex-shrink-0 flex items-center group cursor-pointer" onClick={handleLogoClick}>
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="EduPulse Logo"
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-gray-200 shadow-sm group-hover:scale-110 transition-all duration-300 group-hover:border-blue-300"
                                />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div className="ml-1.5 sm:ml-2 hidden sm:block lg:block">
                                <h1 className="text-base lg:text-lg font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent tracking-tight">
                                    EduPulse
                                </h1>
                                <p className="text-xs text-gray-500 -mt-0.5 capitalize">
                                    {user?.role || 'Student'} Portal
                                </p>
                            </div>
                        </div>

                        {/* Navigation Items - Desktop */}
                        <div className="hidden lg:flex items-center space-x-1 ml-2 lg:ml-4 xl:ml-6">
                            {navItems.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path ||
                                    (item.path !== dashboardPath && location.pathname.includes(item.path));
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        title={item.shortcut ? `${item.name} (${item.shortcut})` : item.name}
                                        className={`relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="hidden lg:inline xl:inline">{item.name}</span>
                                    </button>
                                );
                            })}

                            {/* More Menu for additional items */}
                            {navItems.length > 4 && (
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                        className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${isMoreMenuOpen
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Menu className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="hidden lg:inline">More</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown for additional items */}
                                    {isMoreMenuOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More Options</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Additional navigation items</p>
                                            </div>
                                            {navItems.slice(4).map((item) => {
                                                const Icon = item.icon;
                                                const isActive = location.pathname === item.path ||
                                                    (item.path !== dashboardPath && location.pathname.includes(item.path));
                                                return (
                                                    <button
                                                        key={item.name}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setIsMoreMenuOpen(false);
                                                        }}
                                                        title={item.shortcut ? `${item.name} (${item.shortcut})` : item.name}
                                                        className={`flex items-center space-x-3 w-full px-4 py-3 text-sm transition-colors duration-150 ${isActive
                                                            ? 'bg-gradient-to-r from-blue-50 to-green-50 text-blue-600 border-r-2 border-blue-500'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <div className="text-left flex-1">
                                                            <div className="font-medium">{item.name}</div>
                                                            {item.shortcut && (
                                                                <div className="text-xs text-gray-400">{item.shortcut}</div>
                                                            )}
                                                        </div>
                                                        {isActive && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2 lg:mx-4 xl:mx-6">
                        <form onSubmit={handleSearch} className="w-full relative group">
                            <div className="relative">
                                {/* Search Icon */}
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                                    <Search className="w-4 h-4" />
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={getSearchPlaceholder()}
                                    className="w-full pl-8 lg:pl-10 pr-12 lg:pr-16 py-2 lg:py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md font-medium text-xs lg:text-sm"
                                />

                                {/* Keyboard Shortcut Badge */}
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                    <div className="flex items-center space-x-0.5 bg-gray-100 rounded px-1.5 py-0.5 border border-gray-200">
                                        <kbd className="text-xs font-semibold text-gray-600 font-mono">⌘</kbd>
                                        <kbd className="text-xs font-semibold text-gray-600 font-mono">K</kbd>
                                    </div>
                                </div>

                                {/* Search Button (appears on focus) */}
                                {searchQuery && (
                                    <button
                                        type="submit"
                                        className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-2 py-1 rounded text-xs font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-sm"
                                    >
                                        Go
                                    </button>
                                )}

                                {/* Recent Searches Dropdown */}
                                {!searchQuery && recentSearches.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-focus-within:pointer-events-auto z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</p>
                                        </div>
                                        {recentSearches.map((search, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSearchSelect(search)}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{search}</span>
                                            </button>
                                        ))}
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={() => setRecentSearches([])}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Clear Recent Searches</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-1 sm:space-x-2">

                        {/* Quick Actions Dropdown - Hidden on mobile, shown in mobile menu */}
                        <div className="relative dropdown-container hidden lg:block">
                            <button
                                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                                className="flex items-center space-x-1 p-1.5 lg:p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                            >
                                <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                                <span className="hidden xl:block text-sm font-medium">Quick</span>
                            </button>

                            {/* Quick Actions Dropdown */}
                            {isQuickActionsOpen && (
                                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
                                        <p className="text-xs text-gray-500">Fast access to common tasks</p>
                                    </div>
                                    <div className="py-1">
                                        {getQuickActions().map((action, index) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        action.action();
                                                        setIsQuickActionsOpen(false);
                                                    }}
                                                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{action.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={handleNotificationClick}
                            className="relative p-1.5 lg:p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                        >
                            <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                            {notifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-bounce">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center space-x-1 lg:space-x-2 p-1.5 lg:p-2 rounded-lg transition-all duration-200 ${isProfileOpen
                                    ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-semibold text-xs lg:text-sm shadow-lg ring-2 ring-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    {/* Online Status Indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="hidden lg:block xl:block">
                                    <div className="text-left">
                                        <p className="text-xs lg:text-sm font-medium truncate max-w-16 lg:max-w-20">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 -mt-0.5 capitalize">{user?.role || 'Student'}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 lg:w-4 lg:h-4 transition-transform duration-200 flex-shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User Name'}</p>
                                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                                        <p className="text-xs bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-medium mt-1 capitalize">{user?.role || 'Student'}</p>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setIsProfileOpen(false);
                                            }}
                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>My Profile</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigate('/profile/settings');
                                                setIsProfileOpen(false);
                                            }}
                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Profile Settings</span>
                                        </button>

                                        {/* Role-specific quick actions */}
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => {
                                                    navigate('/admin/system-status');
                                                    setIsProfileOpen(false);
                                                }}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <Shield className="w-4 h-4" />
                                                <span>System Status</span>
                                            </button>
                                        )}

                                        {user?.role === 'educator' && (
                                            <button
                                                onClick={() => {
                                                    navigate('/educator/quick-grade');
                                                    setIsProfileOpen(false);
                                                }}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <GraduationCap className="w-4 h-4" />
                                                <span>Quick Grade</span>
                                            </button>
                                        )}

                                        {user?.role === 'student' && (
                                            <button
                                                onClick={() => {
                                                    navigate('/student/progress');
                                                    setIsProfileOpen(false);
                                                }}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                <span>My Progress</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 py-1">
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsProfileOpen(false);
                                            }}
                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                        >
                            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>



                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-4">
                        {/* Mobile Search */}
                        <div className="px-3 pb-4">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={getSearchPlaceholder()}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm font-medium text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-sm"
                                        >
                                            Go
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Mobile Navigation Items */}
                        <div className="space-y-1 px-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path ||
                                    (item.path !== dashboardPath && location.pathname.includes(item.path));
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mobile Quick Actions */}
                        <div className="border-t border-gray-200 mt-4 pt-4 px-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {getQuickActions().map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                action.action();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex flex-col items-center space-y-1 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-xs font-medium text-center">{action.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Additional Mobile Actions */}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Nav;