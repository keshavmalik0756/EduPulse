import React from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { LOGOS_FEATURES } from "../../constants/homeData";

const FeatureItem = ({ feature }) => (
  <motion.div
    whileHover={{
      scale: 1.06,
      y: -6,
    }}
    className="group relative flex flex-none items-center gap-4 px-8 py-4 rounded-[28px]
    bg-white/50 backdrop-blur-2xl border border-white/60
    shadow-[0_10px_40px_rgba(0,0,0,0.05)]
    transition-all duration-500 overflow-hidden cursor-pointer"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 
      bg-gradient-to-br ${feature.glow}`}
    />

    <div className="absolute inset-0 rounded-[28px] border border-transparent group-hover:border-white/80 transition-all duration-500" />

    <motion.div
      whileHover={{ rotate: 6, scale: 1.15 }}
      className="p-3 rounded-2xl bg-white/70 border border-slate-200 shadow-sm transition-all duration-500"
    >
      <feature.icon className={`w-6 h-6 ${feature.color}`} />
    </motion.div>

    <span className="text-slate-900 font-bold text-sm tracking-tight relative z-10">
      {feature.text}
    </span>

    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1, opacity: 1 }}
      className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow"
    />
  </motion.div>
);

FeatureItem.propTypes = {
  feature: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    glow: PropTypes.string.isRequired
  }).isRequired
};

function Logos() {
  const marqueeItems = [...LOGOS_FEATURES, ...LOGOS_FEATURES, ...LOGOS_FEATURES];

  return (
    <div className="relative w-full py-14 overflow-hidden">

      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/10 blur-[140px] pointer-events-none" />

      <div className="flex select-none">
        <motion.div
          animate={{ x: [0, "-33.333%"] }}
          transition={{
            repeat: Infinity,
            duration: 28,
            ease: "linear",
          }}
          className="flex flex-nowrap gap-6 px-4"
        >
          {marqueeItems.map((feature, index) => (
            <FeatureItem key={index} feature={feature} />
          ))}
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
}

export default Logos;