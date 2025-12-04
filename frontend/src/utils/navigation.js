// Navigation utility functions for the EduPulse application

/**
 * Get the appropriate dashboard path based on user role
 * @param {string} role - User role (admin, educator, student)
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return '/dashboard/admin';
        case 'educator':
            return '/dashboard/educator';
        case 'student':
        default:
            return '/dashboard/student';
    }
};

/**
 * Get role-specific navigation items
 * @param {string} role - User role
 * @returns {Array} Navigation items array
 */
export const getNavigationItems = (role) => {
    const baseItems = [
        { name: 'Dashboard', path: getDashboardPath(role) },
        { name: 'Profile', path: '/profile' },
        { name: 'Settings', path: '/profile/settings' }
    ];

    const roleSpecificItems = {
        student: [
            { name: 'My Courses', path: '/courses' },
            { name: 'Schedule', path: '/schedule' },
            { name: 'Assignments', path: '/assignments' }
        ],
        educator: [
            { name: 'My Courses', path: '/courses' },
            { name: 'Students', path: '/students' },
            { name: 'Grading', path: '/grading' }
        ],
        admin: [
            { name: 'Users', path: '/admin/users' },
            { name: 'Courses', path: '/admin/courses' },
            { name: 'Analytics', path: '/admin/analytics' }
        ]
    };

    return [...baseItems, ...(roleSpecificItems[role?.toLowerCase()] || roleSpecificItems.student)];
};

/**
 * Check if a path is active based on current location
 * @param {string} path - Path to check
 * @param {string} currentPath - Current location pathname
 * @returns {boolean} Whether the path is active
 */
export const isPathActive = (path, currentPath) => {
    if (path === currentPath) return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
};

/**
 * Get role-specific colors and styling
 * @param {string} role - User role
 * @returns {Object} Role configuration object
 */
export const getRoleConfig = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return {
                gradient: 'from-purple-500 to-pink-500',
                hoverGradient: 'from-purple-600 to-pink-600',
                bgGradient: 'from-purple-900/20 to-pink-900/20',
                color: 'purple',
                icon: '👑',
                title: 'Administrator',
                badge: 'ADMIN'
            };
        case 'educator':
            return {
                gradient: 'from-green-500 to-teal-500',
                hoverGradient: 'from-green-600 to-teal-600',
                bgGradient: 'from-green-900/20 to-teal-900/20',
                color: 'green',
                icon: '🎓',
                title: 'Educator',
                badge: 'EDUCATOR'
            };
        case 'student':
        default:
            return {
                gradient: 'from-blue-500 to-indigo-500',
                hoverGradient: 'from-blue-600 to-indigo-600',
                bgGradient: 'from-blue-900/20 to-indigo-900/20',
                color: 'blue',
                icon: '📚',
                title: 'Student',
                badge: 'STUDENT'
            };
    }
};