import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import PropTypes from 'prop-types';
import { EXPLORE_CATEGORIES } from "../../constants/homeData";

function Card({ cat }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 150, damping: 15 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(smoothY, [-50, 50], [8, -8]);
  const rotateY = useTransform(smoothX, [-50, 50], [-8, 8]);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.08, y: -10 }}
      className="group relative cursor-pointer"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${cat.glow} blur-2xl`} />

      <div className={`relative aspect-square rounded-[2rem] bg-gradient-to-br ${cat.color} p-6 flex flex-col items-center justify-center gap-4 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.06)]`}>

        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="p-4 rounded-2xl bg-white/70 border border-slate-200"
        >
          <cat.icon className={`w-10 h-10 ${cat.textColor}`} />
        </motion.div>

        <span className="text-slate-900 font-bold text-sm text-center">
          {cat.name}
        </span>

        <motion.div
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"
        />
      </div>
    </motion.div>
  );
}

Card.propTypes = {
  cat: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    glow: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired
  }).isRequired
};

function ExploreCourses() {
  return (
    <section className="relative w-full py-28 px-6 overflow-hidden bg-white">

      <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] bg-blue-400/10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-400/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:w-1/3 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border text-blue-600 text-xs font-bold uppercase">
            <Sparkles className="w-3 h-3" />
            AI Powered Learning
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Explore <br />
            <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent">
              Expert Domains
            </span>
          </h2>

          <p className="text-slate-500 text-lg">
            Unlock intelligent learning paths powered by real-time insights and adaptive AI systems.
          </p>

          <button className="group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition shadow-xl">
            Explore Courses
            <ArrowRight className="group-hover:translate-x-1 transition" />
          </button>
        </motion.div>

        <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-6 perspective-[1200px]">
          {EXPLORE_CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card cat={cat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreCourses;