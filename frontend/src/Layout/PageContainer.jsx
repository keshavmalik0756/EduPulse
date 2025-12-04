import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageContainer wraps main content, adding margin for Sidebar and Navbar.
 * - Responsive: adjusts for Sidebar width (expanded/collapsed) and Navbar height.
 * - Animates content entrance.
 * - Use as outermost wrapper in main pages.
 */
const PageContainer = ({ children }) => {
  // Sidebar width: 260px (expanded), 72px (collapsed) on md+
  // Navbar height: 64px (approx, adjust if needed)
  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 80 }}
      className="with-navbar with-sidebar smooth-transition min-h-screen px-2 sm:px-4 md:px-8 pb-8 bg-white dark:bg-slate-900 w-full text-base md:text-lg"
      // On mobile, Sidebar overlays, so no left margin. On md+, Sidebar is fixed, so add margin.
      // If you want to support dynamic collapsed state, you can add a prop or context.
    >
      {children}
    </motion.main>
  );
};

export default PageContainer; 