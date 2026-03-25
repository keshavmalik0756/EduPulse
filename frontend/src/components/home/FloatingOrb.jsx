import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const FloatingOrb = ({ color, size, top, left, delay, duration }) => (
  <motion.div
    animate={{ 
      y: [0, -30, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{ 
      duration: duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay
    }}
    className={`absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-20 ${color} ${size} ${top} ${left} z-0 pointer-events-none`}
  />
);

FloatingOrb.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  top: PropTypes.string,
  left: PropTypes.string,
  delay: PropTypes.number,
  duration: PropTypes.number
};

FloatingOrb.defaultProps = {
  top: '',
  left: '',
  delay: 0,
  duration: 20
};

export default React.memo(FloatingOrb);
