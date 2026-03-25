import React from 'react';
import { BrainCircuit, Twitter, Github, Linkedin, Mail, Send, ShieldCheck, Users, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200/60 font-sans relative overflow-hidden">
      
      {/* 🚀 Final Conversion Zone */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-slate-200/60">
        <div className="grid lg:grid-cols-2 items-center gap-16">
          <div className="text-center lg:text-left">
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter">
              Ready to start <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">learning smarter?</span>
            </h3>
            <button className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-emerald-500/20">
              <span className="relative z-10">Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full blur-2xl"></div>
            <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Stay in the loop</h4>
            <p className="text-slate-500 text-sm font-medium mb-8">Join 50,000+ educators and learners getting our weekly AI insights.</p>
            
            <div className="relative flex items-center lg:max-w-md">
              <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full pl-12 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900" 
              />
              <button className="absolute right-2 p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6 cursor-pointer group">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl shadow-lg transition-transform group-hover:scale-110">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">EduPulse</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-bold max-w-sm">
              Learn smarter with AI-powered education. Personalized paths, real-time insights, and world-class mentors — all in one platform.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  aria-label="Social Link"
                  className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 transform"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Product</h4>
            <ul className="space-y-4">
              {['AI Tutors', 'Live Classrooms', 'Smart Flashcards', 'Performance Analytics', 'Pricing'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-emerald-600 font-bold text-sm transition-all hover:translate-x-1 inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-700 font-black text-sm uppercase tracking-widest mb-8">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Success Stories', 'Blog', 'Contact'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-emerald-600 font-bold text-sm transition-all hover:translate-x-1 inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-600 font-black text-sm uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-emerald-600 font-bold text-sm transition-all hover:translate-x-1 inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200/60 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">© {new Date().getFullYear()} EduPulse Inc.</p>
            <p className="text-slate-500 text-[10px] font-black tracking-tighter uppercase flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> ISO 27001 Certified | Secure Platform
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white pr-4 pl-2 py-1.5 rounded-full border border-slate-100 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               Built for the next generation of learners.
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Users className="w-4 h-4" /> 10,000+ Active Learners
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
