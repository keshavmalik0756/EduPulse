import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, BookOpen, TrendingUp, Zap, Command, CheckCircle2 } from 'lucide-react';

const FeaturesSection = () => {
  const containerRef = useRef(null);
  const [showReveal, setShowReveal] = useState(false);
  
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

  const itemVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <section id="features" ref={containerRef} className="relative py-16 sm:py-24 md:py-32 bg-slate-50 overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] md:rounded-t-[4rem] -mt-6 sm:-mt-8 md:-mt-10 z-30">
      
      {/* Advanced Texture System */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </motion.div>

      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-sky-200/50 rounded-full blur-[80px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200/50 rounded-full blur-[80px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 sm:mb-20 md:mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4 sm:mb-6">
            <Command className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-600 uppercase">Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter leading-none">
            The <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-emerald-500 to-teal-400">EduPulse Platform</span>
              <svg className="absolute -bottom-2 left-0 w-full h-2 sm:h-3 text-emerald-300 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 15, 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed px-2">
            A complete overhaul of traditional digital education. We combined neuroscience with bleeding-edge AI models to craft an interface that learns you as much as you learn from it.
          </p>
          
          {/* Quick-Scan Bullets */}
          <ul className="text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8 flex flex-wrap gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 justify-center font-bold tracking-tight uppercase">
            <li className="flex items-center gap-1.5 sm:gap-2"><Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" /> AI Personal Mentor</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> Learning Analytics</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Spaced Repetition</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /> Dynamic Syllabi</li>
          </ul>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 auto-rows-[auto] md:auto-rows-[300px]"
        >
          {/* Feature 1: Personal AI Mentor (Large Card spanning full width on mobile, 7 cols on md+) */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-7 row-span-1 md:row-span-2 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100/50 transition-all duration-500 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl shadow-inner border border-slate-200/60 transition-transform group-hover:scale-110 duration-500">
                    <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-sky-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Personal AI Mentor</h3>
                </div>
                <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                  Stuck at 2 AM? Our LLM identifies logic gaps instantly, providing Socratic hints instead of just answers.
                </p>
              </div>
              
              {/* Native macOS-style Chat Mockup - Responsive */}
              <div className="mt-6 sm:mt-8 md:mt-10 self-end w-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-t-2xl sm:rounded-t-3xl shadow-xl p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 md:gap-5 relative translate-y-4 sm:translate-y-6 group-hover:translate-y-2 transition-transform duration-700 ease-out">
                <div className="flex gap-1.5 sm:gap-2 mb-1 absolute top-3 left-3 sm:top-4 sm:left-4">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-200"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-200"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-200"></div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-7 md:mt-8">
                  <img src="https://i.pravatar.cc/100?img=12" alt="User" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full shadow-sm flex-shrink-0" />
                  <div className="bg-slate-50 border border-slate-100 shadow-sm p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl rounded-tl-sm text-xs sm:text-sm text-slate-700 font-medium w-3/4 leading-relaxed">
                    Explain the difference between abstract classes and interfaces in Java.
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-row-reverse">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border border-emerald-100 p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl rounded-tr-sm text-[11px] sm:text-xs md:text-[13px] text-slate-800 font-semibold w-3/4 shadow-sm leading-relaxed relative">
                    Think of an <strong className="text-emerald-700">Abstract Class</strong> as a partially built car. It has an engine but no doors...
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1 h-3 sm:w-1.5 sm:h-4 bg-emerald-500 ml-0.5 sm:ml-1 translate-y-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Deep Analytics (Spanning 5 cols) */}
          <motion.div 
            variants={itemVariants} 
            className="md:col-span-5 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100/50 hover:-translate-y-2 transition-transform duration-500 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-50 rounded-bl-full opacity-50 z-0 transition-transform group-hover:scale-110 duration-700"></div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                 <div className="p-2.5 sm:p-3 md:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100 text-emerald-500">
                   <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                 </div>
                 <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">Micro-Analytics</h3>
               </div>
               <p className="text-slate-500 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">Granular tracking of video rewinds and focus zones.</p>
             </div>
             
             {/* Complex Chart Graphic */}
             <div className="relative h-24 sm:h-28 md:h-32 w-full mt-auto mb-2 sm:mb-3 md:mb-4 border-b-2 border-slate-100 flex items-end gap-1 sm:gap-2 z-10">
                {[40, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                  <div key={i} className="relative flex-1 group/bar h-full flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: [0, h, h-10, h] }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 1.5, 
                        delay: i * 0.1, 
                        ease: "easeOut",
                        times: [0, 0.5, 0.8, 1] 
                      }}
                      className={`w-full rounded-t-sm ${i === 7 ? 'bg-gradient-to-t from-emerald-400 to-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-slate-100 group-hover/bar:bg-sky-200 transition-colors'}`}
                      style={{ height: `${h}%` }}
                    ></motion.div>
                  </div>
                ))}
             </div>
              <p className="z-10 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center mt-2 sm:mt-3 md:mt-4">Weekly Learning Efficiency</p>
          </motion.div>

          {/* Feature 3: Smart Flashcards (Spanning 5 cols) */}
          <motion.div 
            variants={itemVariants} 
            className="md:col-span-5 relative group bg-slate-900 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-800 hover:-translate-y-2 transition-transform duration-500 p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-emerald-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

             <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                 <div className="p-2.5 sm:p-3 md:p-4 bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 text-cyan-400 shadow-inner">
                   <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                 </div>
                 <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">Spaced Repetition</h3>
               </div>
               <p className="text-slate-400 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-auto">Auto-generated cards from video transcripts.</p>
               
               {/* Advanced Card Stack - Responsive */}
               <div className="relative h-28 sm:h-32 md:h-40 w-full mt-4 sm:mt-6 md:mt-8 flex justify-center perspective-[800px] sm:perspective-[1000px] md:perspective-[1200px] mb-2 sm:mb-3 md:mb-4">
                  <div style={{ transformStyle: "preserve-3d" }} className="w-full h-full relative flex justify-center">
                    <div className="absolute top-0 w-[85%] sm:w-[80%] h-24 sm:h-28 md:h-32 bg-slate-800/80 rounded-xl sm:rounded-2xl border border-slate-700 transform translate-y-2 sm:translate-y-3 md:translate-y-4 translate-z-[-30px] sm:translate-z-[-40px] md:translate-z-[-50px] rotate-x-12 opacity-50 backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-3 sm:group-hover:translate-y-4 md:group-hover:translate-y-6"></div>
                    <div className="absolute top-0 w-[92%] sm:w-[90%] h-24 sm:h-28 md:h-32 bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-600 transform translate-y-1 sm:translate-y-2 translate-z-[-15px] sm:translate-z-[-20px] rotate-x-6 opacity-80 backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-2 sm:group-hover:translate-y-3 md:group-hover:translate-y-4"></div>
                    <motion.div 
                      onClick={() => setShowReveal(!showReveal)}
                      className={`absolute top-0 w-full h-24 sm:h-28 md:h-36 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 transform transition-all duration-700 cursor-pointer shadow-2xl ${
                        showReveal 
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400 rotate-y-180' 
                          : 'bg-gradient-to-br from-emerald-400 to-sky-500 border-emerald-300'
                      } group-hover:-translate-y-1 sm:group-hover:-translate-y-2`}
                    >
                      <div className={`transition-all duration-500 text-center ${showReveal ? 'rotate-y-180 opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                        <p className="text-white font-bold text-xs sm:text-sm md:text-base leading-tight mb-2 sm:mb-3 md:mb-4">"Explain Big O in 1 sentence."</p>
                        <div className="px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 bg-black/20 text-white text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">Tap to Reveal</div>
                      </div>
                      
                      {showReveal && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rotate-y-180">
                          <p className="text-white text-center font-bold text-[11px] sm:text-xs md:text-sm leading-relaxed">It describes the upper bound of the complexity in the worst-case scenario.</p>
                          <div className="mt-2 sm:mt-3 md:mt-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 text-white text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase rounded-full">Got it!</div>
                        </div>
                      )}
                    </motion.div>
                  </div>
               </div>
             </div>
          </motion.div>

          {/* Adaptive Learning Paths (Full width bottom spanning 12 cols) */}
<motion.div 
  variants={itemVariants} 
  className="md:col-span-12 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-xl hover:shadow-2xl border border-slate-100/50 hover:border-sky-200 overflow-hidden pt-8 sm:pt-10 md:pt-12"
>
  <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

  {/* ✅ FIXED FLEX FOR TABLET */}
  <div className="px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-16 mb-8 sm:mb-10 md:mb-12 relative z-10">
    
    {/* LEFT */}
    <div className="w-full md:w-1/2 max-w-xl text-center md:text-left">
      <div className="flex items-center gap-3 md:gap-4 mb-4 sm:mb-6 justify-center md:justify-start">
        <div className="p-3 md:p-4 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl md:rounded-2xl border border-sky-200">
          <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Dynamic Syllabi
        </h3>
      </div>

      <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed">
        The engine automatically skips redundant modules and generates custom deep-dive videos areas you struggle with.
      </p>
    </div>

    {/* RIGHT GRAPH */}
    <div className="w-full md:w-1/2 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-200/60 p-4 sm:p-6 md:p-6 lg:p-10 relative shadow-inner overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

      {/* ✅ SCROLL ONLY ON MOBILE */}
      <div className="relative z-10 overflow-x-auto md:overflow-visible pb-4">
        
        <div className="flex items-center justify-between min-w-[600px] md:min-w-0 w-full relative py-6">
          
          {/* LINE */}
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "30%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400"
            />
          </div>

          {[
            { title: "Basics", status: "done" },
            { title: "Hooks", status: "skipped" },
            { title: "NextJS", status: "active" },
            { title: "Backend", status: "locked" }
          ].map((node, i) => (
            <div key={i} className="relative flex flex-col items-center z-10">
              
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ring-2 md:ring-4 ring-white shadow-lg ${
                node.status === 'done' ? 'bg-emerald-500 text-white' :
                node.status === 'skipped' ? 'bg-slate-200 text-slate-400 border-2 border-dashed border-slate-400' :
                node.status === 'active' ? 'bg-sky-500 text-white scale-110' :
                'bg-white border-2 border-slate-200 text-slate-300'
              }`}>
                
                {node.status === 'done' ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : 
                 node.status === 'skipped' ? <Zap className="w-4 h-4 md:w-5 md:h-5" /> :
                 node.status === 'active' ? <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 animate-pulse" /> : 
                 <span className="font-bold text-xs md:text-sm">{i+1}</span>}
              </div>

              <span className="mt-2 text-xs md:text-sm font-bold text-slate-500 whitespace-nowrap">
                {node.title}
              </span>

            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;