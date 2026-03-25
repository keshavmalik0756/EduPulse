import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { 
  Flame, Trophy, Star, CheckCircle2, TrendingUp, Zap, ArrowRight, 
  Award, Calendar, Users, Target, Medal, Crown, Sparkles, Command
} from 'lucide-react';
import { testimonials } from './constants';

// Format numbers (k-format)
const formatNumber = (num, decimals = 0) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(decimals);
};

// Enhanced Counter with comma formatting
const Counter = ({ value, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const increment = end / (duration * 60);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration]);

  return (
    <span>
      {prefix}{formatNumber(count, value % 1 !== 0 ? 1 : 0)}{suffix}
    </span>
  );
};

// Weekly Activity Item (fully responsive)
const WeekDay = ({ day, active, isToday, index }) => {
  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">{day}</span>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isToday
            ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20'
            : active
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        {active ? (
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        ) : (
          <span className="text-[11px] sm:text-xs md:text-sm font-bold">{index + 1}</span>
        )}
      </motion.div>
    </div>
  );
};

// Achievement Badge (fully responsive)
const AchievementBadge = ({ icon: Icon, label, earned, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl sm:rounded-2xl transition-all ${
      earned ? 'bg-white shadow-md border border-slate-100' : 'bg-slate-50 opacity-50'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${earned ? `bg-${color}-100 text-${color}-500` : 'bg-slate-200 text-slate-400'}`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
    <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase text-center leading-tight">{label}</span>
    {earned && (
      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />
    )}
  </motion.div>
);

// Testimonial Card
const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 transition-all duration-300 h-full flex flex-col justify-between"
  >
    <div>
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-100"
        />
        <div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{testimonial.name}</h4>
          <p className="text-[10px] sm:text-xs text-slate-500">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 italic">"{testimonial.content}"</p>
    </div>
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < (testimonial.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400">
        {testimonial.rank || "Student"}
      </span>
    </div>
  </motion.div>
);

const GamificationSection = () => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [streak, setStreak] = useState(124);
  const [xp, setXp] = useState(84200);
  const maxXP = 100000;
  const progress = (xp / maxXP) * 100;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Only apply parallax on larger screens for performance
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y = (shouldReduceMotion || !isLargeScreen) ? 0 : yParallax;

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

  const handleStart = () => {
    setStreak(prev => prev + 1);
    setXp(prev => Math.min(prev + 500, maxXP));
  };

  // Mock achievements
  const achievements = [
    { icon: Flame, label: '7-Day Streak', earned: true, color: 'orange' },
    { icon: Target, label: '1000 XP', earned: true, color: 'blue' },
    { icon: Medal, label: 'Top 10%', earned: false, color: 'amber' },
    { icon: Crown, label: 'Course Master', earned: false, color: 'purple' },
  ];

  return (
    <section id="gamification" ref={containerRef} className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-slate-50 overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] md:rounded-t-[4rem] -mt-6 sm:-mt-8 md:-mt-10 z-30">
      
      {/* Advanced Texture System */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </motion.div>

      {/* Subtle Glows - scaled for smaller screens */}
      <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-orange-200/50 rounded-full blur-[60px] sm:blur-[80px] mix-blend-multiply opacity-40 z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-rose-200/50 rounded-full blur-[60px] sm:blur-[80px] mix-blend-multiply opacity-40 z-0 pointer-events-none" />

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4 sm:mb-6">
            <Command className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-600 uppercase">Gamification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter leading-none">
            Learn. <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">Play. Conquer.</span>
              <svg className="absolute -bottom-2 left-0 w-full h-2 sm:h-3 text-orange-300 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 15, 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed px-2">
            Turn your learning into a game. Earn XP, maintain streaks, and climb the leaderboard. We've turned heavy education into a dopamine-fueled experience.
          </p>
          
          {/* Quick-Scan Bullets */}
          <ul className="text-[10px] sm:text-xs md:text-sm text-slate-400 mt-5 sm:mt-6 md:mt-8 flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-2 justify-center font-bold tracking-tight uppercase">
            <li className="flex items-center gap-1 sm:gap-1.5"><Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" /> Daily Streaks</li>
            <li className="flex items-center gap-1 sm:gap-1.5"><Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Global Leaderboards</li>
            <li className="flex items-center gap-1 sm:gap-1.5"><Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" /> Achievement Hub</li>
            <li className="flex items-center gap-1 sm:gap-1.5"><TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Skill XP Progression</li>
          </ul>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 auto-rows-auto"
        >
          {/* Feature 1: Streak & XP (Large Card) */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.01 }}
            className="col-span-1 md:col-span-7 row-span-1 md:row-span-2 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100/50 transition-all duration-500 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl shadow-inner border border-slate-200/60 transition-transform group-hover:scale-110 duration-500">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Active Learning Streak</h3>
                </div>
                <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                  Your consistency is your superpower. Maintain your streak to unlock exclusive multipliers and rare cosmetic rewards for your profile.
                </p>
              </div>

              {/* Progress UI Mockup */}
              <div className="mt-6 sm:mt-8 bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden group/dark">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                   <div className="text-center sm:text-left">
                      <span className="text-[9px] sm:text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 block">Current Burn</span>
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                        <Counter value={streak} />
                        <span className="text-base sm:text-lg md:text-xl text-slate-500">Days</span>
                      </div>
                   </div>

                   <div className="w-full sm:w-1/2">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-sky-400 uppercase tracking-widest">Level 42 Mastery</span>
                        <span className="text-[10px] sm:text-xs font-bold text-white">{Math.round(progress)}% to 43</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                         <span>{formatNumber(xp)} XP EARNED</span>
                         <span>{formatNumber(maxXP - xp)} XP TO RANK UP</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" />
                    ))}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-400">+1.2k</div>
                 </div>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleStart}
                   className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2"
                 >
                   Boost XP <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                 </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Weekly tracker (Spanning 5 cols) */}
          <motion.div 
            variants={itemVariants} 
            className="col-span-1 md:col-span-5 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100/50 hover:-translate-y-2 transition-transform duration-500 p-5 sm:p-6 md:p-8 flex flex-col justify-between overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-orange-50 rounded-bl-full opacity-50 z-0 transition-transform group-hover:scale-110 duration-700"></div>
             
             <div className="relative z-10 w-full">
               <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                 <div className="p-2 sm:p-2.5 md:p-3 bg-orange-50 rounded-xl sm:rounded-2xl border border-orange-100 text-orange-500">
                   <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                 </div>
                 <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">Active Roadmap</h3>
               </div>
               <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed mb-6">Your weekly learning velocity is up <span className="text-emerald-500 font-bold">14%</span> since Monday.</p>
               
               <div className="flex justify-between gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto pb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const active = i < (streak % 7);
                  const isToday = i === 5;
                  return (
                    <WeekDay
                      key={i}
                      day={day}
                      active={active}
                      isToday={isToday}
                      index={i}
                    />
                  );
                })}
              </div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Milestone</span>
                <span className="text-xs font-extrabold text-slate-900">7-Day Perfect Week</span>
             </div>
          </motion.div>

          {/* Feature 3: Achievements (Spanning 5 cols) */}
          <motion.div 
            variants={itemVariants} 
            className="col-span-1 md:col-span-5 relative group bg-slate-900 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-800 hover:-translate-y-2 transition-transform duration-500 p-5 sm:p-6 md:p-8 overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 to-rose-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

             <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                 <div className="p-2 sm:p-2.5 md:p-3 bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 text-orange-400 shadow-inner">
                   <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                 </div>
                 <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight">Hall of Fame</h3>
               </div>
               <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">Unlocked 12/48 legendary achievement badges.</p>
               
               <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
                {achievements.map((ach, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border transition-all ${
                      ach.earned 
                        ? 'bg-white/10 border-white/10 backdrop-blur-md' 
                        : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${ach.earned ? `bg-${ach.color}-500/20 text-${ach.color}-400` : 'bg-slate-700 text-slate-500'}`}>
                      <ach.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-tighter leading-none">{ach.label}</span>
                  </motion.div>
                ))}
              </div>
             </div>
          </motion.div>

          {/* Testimonials (Full width bottom spanning 12 cols) */}
          <motion.div 
            variants={itemVariants} 
            className="col-span-1 md:col-span-12 relative group bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-xl hover:shadow-2xl border border-slate-100/50 hover:border-orange-200 overflow-hidden py-8 sm:py-10 md:py-12 lg:py-16"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="px-5 sm:px-8 md:px-12 lg:px-16 flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 xl:gap-24 relative z-10">
              
              <div className="w-full lg:w-1/3 text-center lg:text-left">
                <div className="flex items-center gap-3 md:gap-4 mb-4 sm:mb-6 justify-center lg:justify-start">
                  <div className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl md:rounded-2xl border border-orange-200">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Power Players
                  </h3>
                </div>

                <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed mb-6 lg:mb-8">
                  Join 50,000+ learners who have escaped the "tutorial hell" and built real-world expertise through EduPulse.
                </p>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4 group/stat">
                      <div className="w-1.5 h-10 sm:h-12 bg-orange-500 rounded-full group-hover:h-14 transition-all"></div>
                      <div>
                         <div className="text-xl sm:text-2xl font-black text-slate-900">1.2M+</div>
                         <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solutions Submitted</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group/stat">
                      <div className="w-1.5 h-10 sm:h-12 bg-sky-500 rounded-full group-hover:h-14 transition-all"></div>
                      <div>
                         <div className="text-xl sm:text-2xl font-black text-slate-900">4.9/5</div>
                         <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Happiness</div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {testimonials.slice(0, 4).map((test, idx) => (
                  <TestimonialCard key={test.id} testimonial={test} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GamificationSection;