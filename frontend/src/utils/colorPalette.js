// Centralized color palette for EduPulse application
// This file defines the color scheme used throughout the application for consistency

export const colorPalette = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary colors
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Accent colors
  accent: {
    teal: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  
  // Status colors
  status: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  
  // Neutral colors (light gray theme)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Background gradients (using greenish/bluish themes)
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    // Light gray gradients
    light: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    medium: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    dark: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    // New greenish/bluish gradient for login/signup pages
    greenishBlue: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
    ocean: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
    sky: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
    // Enhanced greenish/blue gradients
    emerald: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    tealSky: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
    oceanic: 'linear-gradient(135deg, #0891b2 0%, #059669 100%)',
  },
  
  // Glassmorphism effects (using light gray themes)
  glass: {
    light: 'rgba(241, 245, 249, 0.7)', // light gray
    medium: 'rgba(226, 232, 240, 0.7)', // medium gray
    dark: 'rgba(203, 213, 225, 0.7)', // dark gray
    border: 'rgba(203, 213, 225, 0.5)', // gray border
  },
  
  // Text colors (using dark gray instead of white)
  text: {
    primary: '#1e293b', // dark gray instead of white
    secondary: 'rgba(30, 41, 59, 0.8)', // dark gray with opacity
    tertiary: 'rgba(30, 41, 59, 0.6)', // lighter dark gray
    disabled: 'rgba(30, 41, 59, 0.4)', // even lighter dark gray
    placeholder: 'rgba(30, 41, 59, 0.5)', // placeholder text
  },
};

// Utility functions for color manipulation
export const getColor = (colorPath) => {
  return colorPath.split('.').reduce((obj, key) => obj?.[key], colorPalette);
};

export const getGradient = (gradientName) => {
  return colorPalette.gradients[gradientName] || colorPalette.gradients.primary;
};

export const getGlassEffect = (effectName) => {
  return colorPalette.glass[effectName] || colorPalette.glass.medium;
};

// Theme configuration
export const theme = {
  colors: colorPalette,
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Poppins', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
};

export default colorPalette;