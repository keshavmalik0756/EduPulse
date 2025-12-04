import { motion } from 'framer-motion';

const SectionTitle = ({ children, className = "" }) => (
  <motion.h2 
    initial={{ opacity: 1, y: 0 }}
    className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-8 sm:mb-10 relative ${className}`}
  >
    <span className="relative z-10">
      {children}
    </span>
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full" />
    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-green-400 rounded-full" />
  </motion.h2>
);

export default SectionTitle;