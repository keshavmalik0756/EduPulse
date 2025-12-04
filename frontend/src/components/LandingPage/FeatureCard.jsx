import { motion } from 'framer-motion';
import { platformTheme } from './theme';
import * as LucideIcons from 'lucide-react';

const cardStyles = {
  gradient: "bg-gradient-to-br",
  interactive: "cursor-pointer transform transition-all duration-300",
  borderGlow: "border-2 border-white/20 hover:border-white/40"
};

const FeatureCard = ({ icon, title, description, color, delay, index }) => {
  let IconComponent = null;
  if (typeof icon === 'string' && LucideIcons[icon]) {
    IconComponent = LucideIcons[icon];
  }
  
  return (
    <motion.div 
      initial={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
      }}
      whileTap={{ scale: 0.98 }}
      className={`${cardStyles.gradient} ${color} p-4 sm:p-6 rounded-xl shadow-xl text-white relative overflow-hidden ${cardStyles.interactive} ${cardStyles.borderGlow}`}
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10 blur-xl"
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          delay: delay || index * 0.2
        }}
      />
      <motion.div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-xl"
        animate={{ 
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: (delay || index * 0.2) + 1
        }}
      />
      
      <div className="relative z-10">
        <motion.div 
          className="mb-3"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {IconComponent ? <IconComponent size={40} /> : icon}
        </motion.div>
        <motion.h3 
          className="text-lg sm:text-xl font-bold mb-3"
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-white/90 text-sm leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
      
      {/* Decorative border animation */}
      <div className="absolute inset-0 rounded-xl border-2 border-white/20 pointer-events-none" />
    </motion.div>
  );
};

export default FeatureCard;