import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 2000, // Increase limit to reduce warnings for necessary large chunks
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks - more granular splitting
            if (id.includes('node_modules')) {
              // React core libraries
              if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react-core';
              if (id.includes('react')) return 'vendor-react';
              
              // State management
              if (id.includes('@reduxjs') || id.includes('redux')) return 'vendor-redux';
              if (id.includes('react-redux')) return 'vendor-react-redux';
              
              // Routing
              if (id.includes('react-router-dom')) return 'vendor-router-dom';
              if (id.includes('react-router')) return 'vendor-router';
              
              // UI Libraries
              if (id.includes('framer-motion')) return 'vendor-framer-motion';
              if (id.includes('recharts')) return 'vendor-recharts';
              if (id.includes('@headlessui') || id.includes('@radix-ui')) return 'vendor-ui-components';
              
              // PDF handling
              if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
              if (id.includes('react-pdf')) return 'vendor-react-pdf';
              
              // HTTP clients
              if (id.includes('axios')) return 'vendor-axios';
              
              // Icons
              if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor-icons';
              
              // Utilities
              if (id.includes('lodash') || id.includes('ramda')) return 'vendor-utils';
              if (id.includes('date-fns') || id.includes('moment')) return 'vendor-date';
              
              // Other large libraries
              if (id.includes('chart.js')) return 'vendor-chartjs';
              if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
              
              return 'vendor-other';
            }
            
            // Feature chunks - more granular splitting
            if (id.includes('student/Dashboard')) return 'student-dashboard';
            if (id.includes('student/Courses')) return 'student-courses';
            if (id.includes('student/lectures')) return 'student-lectures';
            if (id.includes('student/Notes')) return 'student-notes';
            if (id.includes('student/Assignments')) return 'student-assignments';
            if (id.includes('student/Progress')) return 'student-progress';
            
            if (id.includes('educator/Analytics')) return 'educator-analytics';
            if (id.includes('educator/Notes')) return 'educator-notes';
            if (id.includes('educator/UI')) return 'educator-layout';
            if (id.includes('educator/Courses')) return 'educator-courses';
            if (id.includes('educator/Students')) return 'educator-students';
            
            if (id.includes('admin/Users')) return 'admin-users';
            if (id.includes('admin/Courses')) return 'admin-courses';
            if (id.includes('admin/Analytics')) return 'admin-analytics';
            if (id.includes('admin/Settings')) return 'admin-settings';
            
            if (id.includes('pages/')) return 'auth-pages';
            if (id.includes('components/home')) return 'home';
            if (id.includes('components/common')) return 'common-components';
            if (id.includes('components/LandingPage')) return 'landing-page';
            
            // Return undefined to let Rollup handle the rest
            return undefined;
          }
        }
      }
    }
  }
})