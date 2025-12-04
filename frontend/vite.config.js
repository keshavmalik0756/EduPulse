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
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Ensure React core is in its own chunk and loaded first
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react-core';
            }
            
            // Redux must come after React
            if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/redux')) {
              return 'vendor-redux';
            }
            if (id.includes('node_modules/react-redux')) {
              return 'vendor-redux';
            }
            
            // Router after Redux
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }
            
            // Animation
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-framer';
            }
            
            // Charts
            if (id.includes('node_modules/recharts') || id.includes('node_modules/react-chartjs-2')) {
              return 'vendor-recharts';
            }
            
            // PDF
            if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/react-pdf')) {
              return 'vendor-pdf';
            }
            
            // HTTP
            if (id.includes('node_modules/axios')) {
              return 'vendor-http';
            }
            
            // Icons - split into smaller chunks
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('node_modules/react-icons')) {
              return 'vendor-react-icons';
            }
            
            // Utilities
            if (id.includes('node_modules/uuid') || id.includes('node_modules/lodash')) {
              return 'vendor-utils';
            }
            
            // Toast notifications
            if (id.includes('node_modules/react-hot-toast') || id.includes('node_modules/react-toastify')) {
              return 'vendor-toast';
            }
            
            // Spinners
            if (id.includes('node_modules/react-spinners')) {
              return 'vendor-spinners';
            }
            
            // Countup
            if (id.includes('node_modules/react-countup')) {
              return 'vendor-countup';
            }
            
            return undefined;
          }
        }
      }
    }
  }
})