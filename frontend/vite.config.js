import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('redux') || id.includes('@reduxjs')) return 'vendor-redux';
              if (id.includes('react-router')) return 'vendor-router';
              if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'vendor-pdf';
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('@react-three')) return 'vendor-three';
              if (id.includes('axios')) return 'vendor-http';
              return 'vendor-other';
            }
            
            // Feature chunks
            if (id.includes('student/Dashboard')) return 'student-dashboard';
            if (id.includes('student/Courses')) return 'student-courses';
            if (id.includes('student/lectures')) return 'student-lectures';
            if (id.includes('student/Notes')) return 'student-notes';
            
            if (id.includes('educator/Analytics')) return 'educator-analytics';
            if (id.includes('educator/Notes')) return 'educator-notes';
            if (id.includes('educator/UI')) return 'educator-layout';
            
            if (id.includes('admin')) return 'admin';
            
            if (id.includes('pages/')) return 'auth-pages';
            if (id.includes('components/home')) return 'home';
            if (id.includes('components/common')) return 'common';
          }
        }
      }
    }
  }
})