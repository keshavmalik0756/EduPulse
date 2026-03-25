import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Sparkles, ChevronRight, Users, Zap, Command } from "lucide-react";
import { EDUCATORS } from "./constants";

// --- SUB-COMPONENTS ---

const EducatorCard = ({ educator, idx }) => (
  <motion.div
    initial={{ y: 40, opacity: 0, scale: 0.95 }}
    whileInView={{ y: 0, opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6, 
      delay: idx * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 20
    }}
    whileHover={{ scale: 1.03, y: -10 }}
    style={{ transformStyle: "preserve-3d" }}
    className="group relative bg-white border border-slate-100/50 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
  >
    {/* Background Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

    {/* Header / Image Area */}
    <div className="relative mb-6 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] aspect-square z-10">
      <img
        src={educator.image}
        alt={educator.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
      />
      
      {/* Overlay Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
        {educator.tags.map((tag, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg">
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg z-20 border border-slate-100">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-[11px] font-black text-slate-900">{educator.rating}</span>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 mix-blend-multiply" />
    </div>

    {/* Content */}
    <div className="space-y-4 relative z-10">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors duration-300">
          {educator.name}
        </h3>
        <p className="text-[10px] font-bold text-sky-500 tracking-widest uppercase mt-1">
          {educator.role}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center justify-between py-4 border-t border-slate-50">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            <Users className="w-3 h-3 text-emerald-400" /> Students
          </p>
          <p className="text-base font-black text-slate-900 tracking-tight">{educator.students}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Courses <Zap className="w-3 h-3 text-amber-400" />
          </p>
          <p className="text-base font-black text-slate-900 tracking-tight">{educator.courses}</p>
        </div>
      </div>

      {/* Micro-Interaction CTA */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors pb-1 pt-1">
        View Portfolio <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </div>
  </motion.div>
);

// --- MAIN COMPONENT ---

const TopEducators = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <section 
      id="educators" 
      ref={containerRef}
      className="relative py-16 sm:py-24 md:py-32 bg-slate-50 overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] md:rounded-t-[4rem] -mt-6 sm:-mt-8 md:-mt-10 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]"
    >
      
      {/* Advanced Texture System */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </motion.div>

      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-sky-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section - Centered to match Platform/Features */}
        <div className="text-center mb-16 sm:mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4 sm:mb-6">
            <Command className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-600 uppercase">Global Faculty</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Learn from the <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500">Top 1% Mentors</span>
              <svg className="absolute -bottom-2 left-0 w-full h-2 sm:h-3 text-sky-300 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 15, 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed px-2 mb-10">
            A hand-picked collective of industry titans and expert educators. Get mentorship that transforms potential into professional excellence.
          </p>
        </div>

        {/* Educators Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {EDUCATORS.map((educator, idx) => (
            <EducatorCard key={idx} educator={educator} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TopEducators;