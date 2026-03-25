import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Sparkles, Play, ArrowRight, BrainCircuit, Activity, Shield, Zap, Users, Search } from "lucide-react";
import { LANDING_HERO_DATA } from "./constants";

// --- SUB-COMPONENTS ---

const GridBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.02]">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(circle at center, black, transparent 80%)"
      }}
    />
  </div>
);

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 20 + Math.random() * 10,
        size: Math.random() * 2 + 1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}%`,
            y: "110%",
            opacity: 0,
          }}
          animate={{
            y: "-10%",
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "linear",
          }}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "linear-gradient(to top, #38bdf8, #10b981)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
};

const LiveAnalytics = () => {
  const bars = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        height: 30 + Math.random() * 50,
        delay: i * 0.08,
      })),
    []
  );

  return (
    <div className="w-full h-24 mt-4 relative rounded-xl bg-white/60 backdrop-blur-xl border border-slate-100 p-3 shadow-sm">
      <div className="flex items-end h-full gap-1">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            initial={{ height: "20%" }}
            animate={{
              height: [`${bar.height}%`, `${bar.height - 10}%`, `${bar.height}%`],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
              delay: bar.delay,
              ease: "easeInOut",
            }}
            className="flex-1 rounded-t-sm"
            style={{
              background: "linear-gradient(to top, #3b82f6, #10b981)",
              opacity: 0.6,
            }}
          />
        ))}
      </div>
      <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 tracking-wide">
        <Activity className="w-3 h-3 text-emerald-500" />
        LIVE ANALYTICS
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-transparent" />
    </div>
  );
};

const SocialProof = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
    className="mt-8 flex items-center gap-6 border-t border-slate-100 pt-8"
  >
    <div className="flex -space-x-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
          <img 
            src={`https://i.pravatar.cc/100?img=${i + 15}`} 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
        +10k
      </div>
    </div>
    <div>
      <p className="text-sm font-bold text-slate-900">Join 10,000+ Students</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sparkles key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
        ))}
        <span className="text-[11px] text-slate-500 font-medium ml-1">4.9/5 Rating</span>
      </div>
    </div>
  </motion.div>
);

// --- MAIN COMPONENT ---

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // 🔥 Mouse 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [0, 600], [4, -4]), { damping: 40, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1200], [-4, 4]), { damping: 40, stiffness: 200 });

  // Glare Effect
  const glareX = useSpring(useTransform(mouseX, [0, 1200], [0, 100]), { damping: 30 });
  const glareY = useSpring(useTransform(mouseY, [0, 600], [0, 100]), { damping: 30 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      className="relative w-full min-h-screen flex items-center overflow-hidden bg-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-emerald-50" />
      <GridBackground />
      <FloatingParticles />

      {/* Dynamic Glow Layers */}
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatDelay: 1 }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-400/10 blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatDelay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/10 blur-[80px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-20 items-center pt-40 pb-20 lg:pt-0 lg:pb-0">

        {/* LEFT CONTENT */}
        <motion.div style={{ y, opacity }} className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50/60 border border-blue-100/60 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5 fill-blue-500" />
            {LANDING_HERO_DATA.badge.text}
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-6 tracking-tight">
            {LANDING_HERO_DATA.title[0]} <br />
            <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent">
              {LANDING_HERO_DATA.title[1]}
            </span>
          </h1>

          <p className="text-xl font-bold text-slate-800 mb-2">{LANDING_HERO_DATA.subtitle}</p>
          <p className="text-lg text-slate-500 max-w-lg mb-4 leading-relaxed font-medium">
            {LANDING_HERO_DATA.description}
          </p>
          <p className="text-xs text-slate-400 mb-10 font-semibold tracking-wide flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-500 rounded-full" /> Personalized courses 
            <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Real-time tracking 
            <span className="w-1 h-1 bg-sky-500 rounded-full" /> AI recommendations
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {LANDING_HERO_DATA.buttons.map((btn, idx) => (
              <button
                key={idx}
                className={`group cursor-pointer relative overflow-hidden px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2.5 shadow-sm ${
                  btn.primary 
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]" 
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {btn.label}
                  <btn.icon className={`w-4 h-4 transition-transform duration-300 ${btn.primary ? "group-hover:translate-x-1" : "group-hover:rotate-12"}`} />
                </span>
                {btn.primary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                )}
              </button>
            ))}
          </div>

          <SocialProof />
        </motion.div>

        {/* RIGHT CONTENT (🔥 GOD LEVEL 3D CARD) */}
        <motion.div
          style={{ rotateX, rotateY }}
          className="hidden lg:flex items-center justify-center perspective-[1800px]"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="relative w-[460px]"
          >
            {/* OUTER GLOW */}
            <div className="absolute inset-[-15px] rounded-[2.5rem] bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-sky-500/5 blur-2xl opacity-60 group-hover:opacity-100 transition duration-700" />

            {/* ORBIT TAGS */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-35px] pointer-events-none"
            >
              {[
                { label: "AI Paths", icon: BrainCircuit, pos: "top-0 left-1/4", featured: true },
                { label: "Secure", icon: Shield, pos: "bottom-0 right-1/4", featured: false },
              ].map((tag, i) => (
                <div key={i} className={`absolute ${tag.pos} px-4 py-2 rounded-full backdrop-blur-xl border flex items-center gap-2 transition-all duration-500 ${
                  tag.featured 
                    ? "bg-white/90 border-blue-100 shadow-[0_10px_20px_rgba(59,130,246,0.1)] scale-110" 
                    : "bg-white/70 border-white/50 opacity-60 scale-90"
                }`}>
                   <tag.icon className={`w-3 h-3 ${tag.featured ? "text-blue-500" : "text-slate-400"}`} />
                   <span className={`text-[10px] font-bold ${tag.featured ? "text-slate-800" : "text-slate-500"}`}>{tag.label}</span>
                </div>
              ))}
            </motion.div>

            {/* MAIN CARD */}
            <div className="relative bg-white/80 backdrop-blur-3xl border border-white/70 rounded-[2.5rem] shadow-2xl p-10 space-y-7 overflow-hidden transition-all duration-500 group-hover:border-white">
              
              {/* ENHANCED GLARE */}
              <motion.div 
                style={{ 
                  left: useTransform(glareX, [0, 100], ["-30%", "130%"]),
                  top: useTransform(glareY, [0, 100], ["-30%", "130%"]),
                }}
                className="absolute w-full h-full bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-20 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
              />

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-[2px] shadow-lg">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <BrainCircuit className="text-blue-600 w-8 h-8" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Engine</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">EduPulse Core</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">System Active</span>
              </div>

              <LiveAnalytics />

              <div className="space-y-4">
                {[
                  { label: "Processing", value: "94%", color: "bg-blue-500" },
                  { label: "Knowledge", value: "85%", color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                      <span>{item.label}</span>
                      <span className="text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.value }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition shadow-lg group-hover:bg-slate-800">
                Activate AI Learning
              </button>
            </div>

            {/* PERFORMANCE FLOAT */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute -bottom-8 -right-8 bg-white border border-slate-100 rounded-[1.8rem] shadow-xl p-5 flex items-center gap-3.5 z-10"
            >
              <Activity className="text-emerald-500 w-5 h-5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Performance</p>
                <p className="text-xl font-black text-slate-900 leading-none">+42%</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-slate-900 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;