import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Star, Users, CheckCircle2, Navigation, Flame, Target, Activity, Zap, Sparkles, BookOpen, Command } from 'lucide-react';
import { courses } from './constants';

const tagColorMap = {
  emerald: "text-emerald-600",
  sky: "text-sky-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  rose: "text-rose-600"
};

const CourseDiscovery = () => {
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

  const itemVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <section 
      id="curriculum" 
      ref={containerRef}
      className="relative py-16 sm:py-24 md:py-32 bg-slate-50 overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] md:rounded-t-[4rem] -mt-6 sm:-mt-8 md:-mt-10 z-30"
    >
      
      {/* Advanced Texture System */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </motion.div>

      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-sky-200/50 rounded-full blur-[80px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200/50 rounded-full blur-[80px] mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section - Refactored to match FeaturesSection */}
        <div className="text-center mb-16 sm:mb-20 md:mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4 sm:mb-6">
            <Command className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-600 uppercase">Curriculum</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter leading-none">
            Explore Your <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-emerald-500 to-teal-400">Knowledge Universe</span>
              <svg className="absolute -bottom-2 left-0 w-full h-2 sm:h-3 text-emerald-300 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 15, 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed px-2 mb-8">
            Dive into a meticulously curated universe of courses designed for the next generation of digital pioneers.
          </p>
          
          {/* Quick-Scan Bullets */}
          <ul className="text-xs sm:text-sm text-slate-400 flex flex-wrap gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 justify-center font-bold tracking-tight uppercase">
            <li className="flex items-center gap-1.5 sm:gap-2"><BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" /> 500+ Expert Courses</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> AI Recommendations</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Real-time Classes</li>
          </ul>
        </div>

        {/* 3D Perspective Courses Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 z-10 relative"
        >
          {courses.map((course, idx) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                y: -10
              }}
              key={course.id} 
              className="group relative bg-white border border-slate-100/50 rounded-[2rem] sm:rounded-[2.5rem] p-3 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

              {/* Thumbnail Area */}
              <div className="relative h-48 sm:h-56 md:h-60 w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden mb-6 sm:mb-8 shadow-inner pt-2 sm:pt-4 z-10">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent mix-blend-multiply opacity-80"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-500 hover:bg-emerald-500 hover:border-emerald-400">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5 sm:ml-1" fill="currentColor" />
                  </div>
                </div>

                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                  <span className={`px-3 sm:px-4 py-1 sm:py-1.5 bg-white/95 backdrop-blur-md ${tagColorMap[course.color] || 'text-slate-600'} text-[10px] sm:text-[11px] font-black tracking-widest uppercase rounded-full shadow-lg`}>
                    {course.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-3 sm:px-5 pb-4 sm:pb-5 relative z-10">
                <h3 className="text-slate-900 font-extrabold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">{course.title}</h3>
                
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-sky-100 transition-colors">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-100 to-emerald-50 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${idx + 21}`} alt={course.educator} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instructor</p>
                    <p className="text-slate-700 font-bold text-xs sm:text-sm tracking-tight">{course.educator}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100/80">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                    <span className="text-slate-900 font-black text-base sm:text-lg tracking-tighter">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-slate-500 font-medium bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-bold">{course.students}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Ultra-Advanced Live Classroom Teaser */}
        <div className="mt-24 md:mt-32 lg:mt-40 relative w-full perspective-[1200px] z-10">
          
          <motion.div 
            initial={{ rotateX: 20, y: 100, opacity: 0 }}
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 transform-style-3d group"
          >
            {/* Background Texture inside dark block */}
            <div className="absolute inset-0 opacity-[0.15]">
               <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-sky-500 opacity-20 blur-[80px] rounded-full pointer-events-none z-0"></div>
               <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 opacity-20 blur-[80px] rounded-full pointer-events-none z-0"></div>
               <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-20 z-0"></div>
            </div>
            
            <div className="relative p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24 flex flex-col xl:flex-row items-center justify-between gap-10 lg:gap-16 overflow-hidden z-10">
               
               <div className="max-w-2xl relative z-20 w-full">
                 <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl mb-6 sm:mb-10 shadow-inner">
                   <div className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-red-500"></span>
                   </div>
                   <span className="text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Live Hyper-Stream Network</span>
                 </div>
                 
                 <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 md:mb-8 leading-[1.1] tracking-tighter">
                    Interactive Classrooms. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 drop-shadow-sm">Zero Latency.</span>
                 </h3>
                 <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 md:mb-12 leading-relaxed font-medium">
                    Participate in real-time polls, climb the live leaderboard, and ask questions verbally to expert educators with our sub-200ms backend.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   {[
                     { icon: Flame, title: 'Live Polls & Quizzes' },
                     { icon: Target, title: 'Peer Leaderboards' },
                     { icon: Users, title: 'Audio Doubt Forums' },
                     { icon: Activity, title: 'Real-time Analytics' }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md group/item">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-slate-800 group-hover/item:bg-emerald-500/20 flex items-center justify-center shadow-lg border border-slate-700 transition-colors">
                         <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 group-hover/item:text-emerald-400 transition-colors" />
                       </div>
                       <span className="text-white font-bold text-xs sm:text-sm md:text-base tracking-tight">{item.title}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Hyper-Realistic UI Mockup for Live Class - Fully Responsive */}
               <motion.div 
                 whileHover={{ rotateY: window.innerWidth > 1024 ? -10 : 0, rotateX: window.innerWidth > 1024 ? 5 : 0, scale: 1.02 }}
                 className="relative w-full max-w-lg xl:w-[600px] h-[280px] sm:h-[380px] lg:h-[450px] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] bg-[#020617] border border-slate-700/50 shadow-2xl flex-shrink-0 transition-all duration-700 transform-style-3d z-30 group/mockup"
               >
                  {/* Floating Frame Header */}
                  <div className="absolute top-0 w-full h-12 sm:h-14 bg-black/40 backdrop-blur-md rounded-t-[1.5rem] sm:rounded-t-[2rem] lg:rounded-t-[2.5rem] flex items-center justify-between px-4 sm:px-6 border-b border-white/5 z-30">
                    <div className="flex gap-1.5 sm:gap-2">
                       <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-700/80 group-hover/mockup:bg-emerald-500/80 transition-colors"></div>
                       <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-700/80 group-hover/mockup:bg-sky-400/80 transition-colors delay-75"></div>
                       <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-700/80 group-hover/mockup:bg-cyan-400/80 transition-colors delay-100"></div>
                    </div>
                    <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                      <span className="text-slate-300 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">Live</span>
                      <span className="text-slate-500 text-[8px] sm:text-[10px] ml-1 sm:ml-2 font-mono">01:24:05</span>
                    </div>
                  </div>

                  <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=800" alt="Educator" className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] opacity-60 mix-blend-luminosity group-hover/mockup:mix-blend-normal transition-all duration-500 z-10" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] opacity-90 z-20"></div>

                  {/* Interaction Layers */}
                  <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-3 sm:left-4 md:left-6 lg:left-8 right-3 sm:right-4 md:right-6 lg:right-8 flex flex-col gap-2 sm:gap-3 md:gap-4 transform translate-y-4 sm:translate-y-6 group-hover/mockup:translate-y-0 transition-transform duration-700 ease-out z-30">
                    
                    {/* Chat Toast Mockup */}
                    <div className="self-start px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-slate-900/80 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/10 shadow-xl flex items-center gap-1.5 sm:gap-2 opacity-80 group-hover/mockup:opacity-100 transition-opacity">
                       <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400"></div>
                       <span className="text-sky-400 font-bold text-[9px] sm:text-xs">Alex M.</span>
                       <span className="text-slate-300 text-[9px] sm:text-xs font-medium border-l border-slate-700 pl-1.5 sm:pl-2 ml-0.5 sm:ml-1 truncate">Wait, pivot logic?</span>
                    </div>

                    {/* Live Poll Mockup */}
                    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.6)] group-hover/mockup:border-emerald-500/30 transition-colors z-40">
                      <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 flex-wrap gap-2">
                        <p className="text-white text-xs sm:text-sm font-black tracking-wide">Q. QuickSort Worst Case?</p>
                        <span className="text-[8px] sm:text-[10px] text-cyan-400 font-black tracking-widest uppercase bg-cyan-400/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-cyan-400/20">Poll Active</span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                         <div className="w-full bg-slate-800/50 rounded-lg sm:rounded-xl h-9 sm:h-10 md:h-12 relative overflow-hidden flex items-center px-2 sm:px-3 md:px-4 border border-rose-500/30">
                           <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-rose-500/20"></div>
                           <span className="relative z-10 text-[9px] sm:text-xs text-white font-bold tracking-widest flex justify-between w-full gap-2"><span>A. O(n log n)</span> <span className="text-rose-400">15%</span></span>
                         </div>
                         <div className="w-full bg-slate-800/50 rounded-lg sm:rounded-xl h-9 sm:h-10 md:h-12 relative overflow-hidden flex items-center px-2 sm:px-3 md:px-4 border shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500">
                           <motion.div 
                             animate={{ width: ["80%", "85%", "82%", "85%"] }}
                             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                             className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-sky-400"
                           ></motion.div>
                           <span className="relative z-10 text-[9px] sm:text-xs text-white font-black tracking-widest flex justify-between w-full gap-2 drop-shadow-md"><span>B. O(n²)</span> <span>85%</span></span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-12 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 lg:right-8 bg-slate-950/80 backdrop-blur-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 md:gap-3 border border-slate-800 shadow-xl z-30">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest">3,492</span>
                  </div>
               </motion.div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default CourseDiscovery;