import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { syncUserWithBackend } from "../../redux/authSlice";
import { BsRobot, BsShieldLock } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import {
  IoSparkles,
  IoLibrary,
  IoFlash,
  IoAnalytics,
  IoCloseCircle,
  IoRocketOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

/* ─── Constants & Themes ─────────────────────────────────────────────── */
const currentTheme = {
  primary: "#10b981",
  secondary: "#3b82f6",
  accent: "#22c55e",
  sky: "#0ea5e9",
  glow: "0 20px 50px rgba(16,185,129,0.3)",
  grad: "linear-gradient(135deg, #10b981, #3b82f6, #0ea5e9)",
  mesh: "radial-gradient(at 0% 0%, #10b981 0, transparent 50%), radial-gradient(at 50% 0%, #3b82f6 0, transparent 50%), radial-gradient(at 100% 0%, #0ea5e9 0, transparent 50%)",
};

const HEADLINES = [
  "Your AI-Powered Learning Brain.",
  "From Beginner → Expert Automatically.",
  "Learn Smarter. Not Harder.",
  "Your Personal AI Mentor Starts Here."
];


const LOADING_MESSAGES = [
  "Connecting to Google...",
  "Authenticating identity...",
  "Setting up your account...",
];

const FEATURES = [
  { id: 1, icon: IoFlash, label: "Adaptive AI Neural Paths", desc: "Personalized speed & depth based on your learning trajectory." },
  { id: 2, icon: IoSparkles, label: "Generative Course Engine", desc: "Instant high-fidelity content for any complex subject." },
  { id: 3, icon: IoAnalytics, label: "Predictive Analytics", desc: "Deep insights into your future learning velocity." },
];

const TESTIMONIALS = [
  { id: 1, name: "Sarah Chen", role: "Full-Stack Dev", avatar: "SC", text: "EduPulse didn't just teach me coding; it rewired how I approach problem-solving. The AI is uncanny." },
  { id: 2, name: "Dr. Marcus Vault", role: "Physics Professor", avatar: "MV", text: "As an educator, the generative tools have freed me to focus on mentorship rather than curriculum grunt work." },
  { id: 3, name: "James Wilson", role: "Biology Student", avatar: "JW", text: "The adaptive paths feel like a private tutor who knows exactly where I'm struggling before I do." },
];

/* ─── Sub-Components ──────────────────────────────────────── */
const StardustParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: Math.random() * 0.3, scale: Math.random() * 2 }}
        animate={{ y: ["-10%", "110%"], x: [Math.random() * 100 + "%", Math.random() * 100 + "%"], opacity: [0, 0.4, 0], scale: [0.5, 1.5, 0.5] }}
        transition={{ duration: 15 + Math.random() * 25, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 20 }}
        style={{ width: Math.random() * 4 + 2 + "px", height: Math.random() * 4 + 2 + "px", background: `rgba(255, 255, 255, ${Math.random() * 0.5})`, filter: "blur(1px)" }}
      />
    ))}
  </div>
);

const DynamicHeadline = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % HEADLINES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[120px] mb-2 relative">
      <AnimatePresence mode="wait">
        <motion.h2
          key={index}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={{ duration: 0.5 }}
          className="text-[2.75rem] font-black text-slate-900 leading-[1.1] tracking-tight absolute inset-0"
        >
          {HEADLINES[index].split(' ').map((word, i, arr) => (
             i === arr.length - 1 || i === arr.length - 2 ? (
               <span key={i} className="text-transparent bg-clip-text mr-3 inline-block" style={{ backgroundImage: currentTheme.grad }}>
                  {word}
               </span>
             ) : (
               <span key={i} className="mr-3 inline-block">{word}</span>
             )
          ))}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
};


const TestimonialCarousel = ({ theme }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-slate-700 text-sm italic leading-relaxed mb-4 relative z-10">"{TESTIMONIALS[index].text}"</p>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: theme.grad }}>
              {TESTIMONIALS[index].avatar}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{TESTIMONIALS[index].name}</h4>
              <p className="text-slate-500 text-xs">{TESTIMONIALS[index].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════════════════ */
const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user: reduxUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState("");
  // steps: "auth" -> "onboarding" -> "done"
  const [step, setStep] = useState("auth"); 
  
  // Onboarding states
  const [onboardGoal, setOnboardGoal] = useState("");
  const [onboardLevel, setOnboardLevel] = useState("");

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    // Only auto-redirect if user already authenticated and we aren't overriding it with onboarding.
    if (isAuthenticated && reduxUser && step === "auth") {
      const routes = {
        admin: "/dashboard/admin",
        educator: "/dashboard/educator",
        student: "/home",
      };
      navigate(routes[reduxUser.role] || "/home");
    }
  }, [isAuthenticated, reduxUser, navigate, step]);

  const handleSync = async (userCredential) => {
    try {
      const idToken = await userCredential.user.getIdToken();
      // Remove .unwrap() to prevent raw Redux errors from throwing 
      const resultAction = await dispatch(syncUserWithBackend(idToken, "student"));
      
      if (syncUserWithBackend.fulfilled.match(resultAction)) {
        setLoading(false);
        setStep("onboarding");
      } else {
        const errorMsg = resultAction.error?.message || resultAction.payload || "Sync failed";
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Cloud synchronization failed.");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleSync(result);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const completeOnboarding = () => {
    if (!onboardGoal || !onboardLevel) return;
    setStep("done");
    setTimeout(() => {
      const routes = {
        admin: "/dashboard/admin",
        educator: "/dashboard/educator",
        student: "/home",
      };
      navigate(routes[reduxUser?.role] || "/home");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-[#f8fafc]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
          * { font-family: 'Outfit', sans-serif; }
        `}
      </style>

      <StardustParticles />
      <motion.div animate={{ background: currentTheme.mesh }} className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-1000" />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col lg:flex-row w-full max-w-[1050px] min-h-[640px] bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-white/20 relative z-10 overflow-hidden"
      >
        {/* ═══════════════════════════════════════════════════════════════
            LEFT PANEL
        ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-[0_0_48%] flex-col justify-between p-12 relative overflow-hidden bg-white/40 backdrop-blur-sm border-r border-white/50">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

          {/* Mini AI Visualization Orb */}
          <motion.div
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 w-24 h-24 rounded-full mix-blend-multiply opacity-50 blur-xl pointer-events-none"
            style={{ background: currentTheme.grad }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white relative shadow-lg" style={{ background: currentTheme.grad }}>
                <IoLibrary size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">EduPulse</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Neural Learn Gen-2</p>
              </div>
            </motion.div>

            <DynamicHeadline />

            {/* Real-Time Metrics Strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-4 mt-8 mb-8 text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1"><span className="text-emerald-500">⚡</span> 2.4M+ Lessons Generated</span>
              <span className="flex items-center gap-1"><span className="text-blue-500">🧠</span> 98% Accuracy</span>
              <span className="flex items-center gap-1"><span className="text-sky-500">🚀</span> 12K Active Users</span>
            </motion.div>

            <div className="space-y-3 mb-auto">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)" }}
                  className="flex flex-col p-3 pr-4 rounded-2xl bg-white/60 border border-white/80 border-b-slate-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group backdrop-blur-md cursor-default relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100/50 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      <feature.icon size={18} style={{ color: currentTheme.primary }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{feature.label}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">{feature.desc}</p>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8">
              <TestimonialCarousel theme={currentTheme} />
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT PANEL
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative bg-white lg:bg-transparent min-h-[640px]">
          <div className="w-full max-w-[380px] relative z-10 flex flex-col items-center justify-center h-full">
            <AnimatePresence mode="wait">
              
              {/* NORMAL AUTH STEP */}
              {step === "auth" && (
                <motion.div key="auth" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center w-full">
                  <div className="text-[10px] text-slate-400 mb-8 font-bold tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full">
                    Step 1 of 1 • Secure Authentication
                  </div>

                  <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="relative mb-6 group">
                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.4, repeat: Infinity }} className="absolute inset-0 rounded-full border-2 pointer-events-none" style={{ borderColor: currentTheme.primary }} />
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white shadow-xl relative transition-transform duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/30" style={{ background: currentTheme.grad }}>
                      <BsRobot size={32} />
                    </div>
                  </motion.div>

                  <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-3">Welcome to the future</h1>
                  <p className="text-slate-500 text-sm text-center mb-8 max-w-[280px]">Instant access to tailored neural paths & predictive course generation.</p>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-6 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 flex items-start gap-2 font-medium shadow-inner">
                      <IoCloseCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                      <div>{error}</div>
                    </motion.div>
                  )}

                  <div className="w-full max-w-[320px] mb-3">
                     <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 15px 35px ${currentTheme.primary}30` }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full h-16 bg-white border border-slate-200/80 rounded-[20px] flex items-center justify-center gap-4 text-slate-800 font-extrabold shadow-sm hover:border-emerald-300 transition-all relative overflow-hidden group"
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                             <AnimatePresence mode="wait">
                              <motion.span
                                key={loadingMsgIdx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-[14px] text-slate-600 font-bold tracking-wide whitespace-nowrap min-w-[180px] text-left"
                              >
                                {LOADING_MESSAGES[loadingMsgIdx]}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        ) : (
                          <>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: currentTheme.grad }} />
                            <FcGoogle size={28} className="relative z-10" />
                            <span className="text-[15px] relative z-10 tracking-wide text-slate-700 font-bold">Continue with Google</span>
                          </>
                        )}
                      </motion.button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center max-w-[260px] mb-2 leading-relaxed">
                    We use Google for fast & secure authentication. No passwords required.
                  </p>
                  
                  <p className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
                    ⚡ Takes less than 3 seconds to start learning
                  </p>

                  <div className="flex gap-4 justify-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><BsShieldLock size={12} className="text-slate-500" /> Secure</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><IoFlash size={12} className="text-emerald-500" /> Instant</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><IoSparkles size={12} className="text-blue-500" /> AI Powered</span>
                  </div>
                </motion.div>
              )}

              {/* ONBOARDING STEP */}
              {step === "onboarding" && (
                <motion.div key="onboarding" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col w-full h-full justify-center">
                  <div className="text-[10px] text-emerald-500 mb-6 font-bold tracking-widest uppercase flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AI Setup Initiated
                  </div>
                  
                  <h2 className="text-[2rem] font-black text-slate-900 mb-3 leading-tight tracking-tight">Configure Your<br/><span className="text-transparent bg-clip-text" style={{ backgroundImage: currentTheme.grad }}>Neural Profile</span></h2>
                  <p className="text-sm text-slate-500 mb-8 font-medium">Tell us what you want to achieve, and our AI will pre-calculate your optimal learning path.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-2 block">Primary Goal</label>
                      <select 
                        value={onboardGoal} 
                        onChange={(e) => setOnboardGoal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer hover:bg-white hover:border-emerald-200"
                      >
                        <option value="">Select a goal...</option>
                        <option value="career">Advance my career</option>
                        <option value="skill">Learn a new skill from scratch</option>
                        <option value="hobby">Explore a hobby / interest</option>
                        <option value="exam">Prepare for an exam / certification</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-2 block">Current Skill Level</label>
                      <div className="grid grid-cols-3 gap-2">
                         <button
                           onClick={() => setOnboardLevel("Beginner")}
                           className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${onboardLevel === "Beginner" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-500/10 scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                         >
                           <span className="text-sm">🌱</span> Beginner
                         </button>
                         <button
                           onClick={() => setOnboardLevel("Intermediate")}
                           className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${onboardLevel === "Intermediate" ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm shadow-blue-500/10 scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                         >
                           <span className="text-sm">🚀</span> Intermed.
                         </button>
                         <button
                           onClick={() => setOnboardLevel("Advanced")}
                           className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${onboardLevel === "Advanced" ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm shadow-sky-500/10 scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                         >
                           <span className="text-sm">⚡</span> Advanced
                         </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: `0 20px 40px ${currentTheme.primary}40` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={completeOnboarding}
                    disabled={!onboardGoal || !onboardLevel}
                    className="w-full mt-10 h-14 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-sm shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                    style={{ background: currentTheme.grad }}
                  >
                    <IoRocketOutline size={20} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    <span className="relative z-10">Generate Roadmap</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </motion.button>
                </motion.div>
              )}

              {/* DONE / SYNCING STEP */}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center w-full">
                   <div className="mb-8 relative inline-flex">
                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full" style={{ background: currentTheme.grad, filter: "blur(25px)" }} />
                    <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-xl relative border-4 border-white" style={{ background: currentTheme.grad }}>
                      <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path d="M20 6L9 17L4 12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.8 }} />
                      </motion.svg>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Path Generated</h2>
                  <p className="text-slate-400 font-bold mb-10 uppercase text-[10px] tracking-widest">Bridging consciousness to grid...</p>
                  
                  <div className="w-full max-w-[260px] space-y-4">
                    {["Initializing dashboard", "Preloading course suggestions", "Calculating success matrix"].map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.4 }} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm w-full">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                          <IoCheckmarkCircle size={14} />
                        </div>
                        {msg}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;