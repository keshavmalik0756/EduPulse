import React, { Suspense, lazy } from 'react';
import { ArrowRight, Zap } from 'lucide-react';

// Lazy Load Sections for Performance
const Navbar = lazy(() => import('../components/LandingPage/Navbar'));
const HeroSection = lazy(() => import('../components/LandingPage/HeroSection'));
const TopEducators = lazy(() => import('../components/LandingPage/TopEducators'));
const FeaturesSection = lazy(() => import('../components/LandingPage/FeaturesSection'));
const CourseDiscovery = lazy(() => import('../components/LandingPage/CourseDiscovery'));
const GamificationSection = lazy(() => import('../components/LandingPage/GamificationSection'));
const Footer = lazy(() => import('../components/LandingPage/Footer'));

// Premium CTA Component
const CTASection = ({ title, subtitle, buttonText }) => (
  <div className="relative py-24 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-sky-500/5 blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
        {title}
      </h2>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
        {subtitle}
      </p>
      <button className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl hover:shadow-emerald-500/20">
        {buttonText}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
      </button>
    </div>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">EduPulse Loading...</p>
    </div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white font-sans selection:bg-sky-500/20 selection:text-sky-900">
      <Suspense fallback={<LoadingFallback />}>
        <Navbar />
        <HeroSection />
        
        <TopEducators />
        
        <CTASection 
          title="Ready to Accelerate Your Career?"
          subtitle="Join 10,000+ students already mastering AI, Design, and Architecture with our personalized learning engine."
          buttonText="Start Learning for Free"
        />

        <FeaturesSection />
        <CourseDiscovery />

        <CTASection 
          title="Your Knowledge Universe Awaits."
          subtitle="Don't just watch videos. Engage with live classrooms, AI mentors, and a community of high-performers."
          buttonText="Explore the Curriculum"
        />

        <GamificationSection />
        
        <div className="pt-20">
           <Footer />
        </div>
      </Suspense>
    </div>
  );
};

export default LandingPage;