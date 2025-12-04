import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Mail, Shield, Book, BookText, Sparkles, Facebook, Twitter, Instagram, Linkedin, Github, Youtube, LogIn, UserPlus, GraduationCap, Users } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleQuickLink = (linkText) => {
    // Handle different quick links
    switch (linkText) {
      case 'FAQ':
        // Scroll to FAQ section or navigate to FAQ page
        console.log('Navigate to FAQ');
        break;
      case 'Contact Us':
        // Scroll to contact section
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'Privacy Policy':
        console.log('Navigate to Privacy Policy');
        break;
      case 'Terms of Service':
        console.log('Navigate to Terms of Service');
        break;
      case 'Blog':
        console.log('Navigate to Blog');
        break;
      default:
        console.log('Link not implemented yet');
    }
  };

  const handleSocialLink = (platform) => {
    // Handle social media links
    const socialUrls = {
      Facebook: 'https://facebook.com/edupulse',
      Twitter: 'https://twitter.com/edupulse',
      Instagram: 'https://instagram.com/edupulse',
      Linkedin: 'https://linkedin.com/company/edupulse',
      Github: 'https://github.com/edupulse',
      Youtube: 'https://youtube.com/edupulse'
    };

    const url = socialUrls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="py-16 bg-gradient-to-br from-blue-900/50 to-green-900/50 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(29, 78, 216, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
          backgroundSize: '200% 200%',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} className="text-blue-400" />
              </motion.div>
              About EduPulse
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Empowering students to become smarter learners through AI-powered education and gamified learning experiences.
            </p>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-blue-400"
              >
                <Sparkles size={20} />
              </motion.div>
              <span className="text-white/80 text-sm">
                AI-Powered Learning
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { icon: <HelpCircle size={16} />, text: "FAQ" },
                { icon: <Mail size={16} />, text: "Contact Us" },
                { icon: <Shield size={16} />, text: "Privacy Policy" },
                { icon: <Book size={16} />, text: "Terms of Service" },
                { icon: <BookText size={16} />, text: "Blog" },
                { icon: <GraduationCap size={16} />, text: "Careers" },
                { icon: <Users size={16} />, text: "Community" }
              ].map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleQuickLink(link.text)}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-2 transition-colors duration-200"
                  >
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.icon}
                    </motion.div>
                    {link.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Connect With Us
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: Facebook, name: 'Facebook' },
                { Icon: Twitter, name: 'Twitter' },
                { Icon: Instagram, name: 'Instagram' },
                { Icon: Linkedin, name: 'Linkedin' },
                { Icon: Github, name: 'Github' },
                { Icon: Youtube, name: 'Youtube' }
              ].map(({ Icon, name }, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSocialLink(name)}
                  className="text-white/80 hover:text-white bg-white/5 p-3 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/15 transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={24} />
                  </motion.div>
                </button>
              ))}
            </div>
          </div>

          {/* Login/Signup Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Get Started
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Join our community of learners and start your educational journey today.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full transition-all duration-300 active:scale-95"
              >
                <LogIn size={20} />
                Login
              </button>
              <button
                onClick={handleSignup}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full transition-all duration-300 active:scale-95"
              >
                <UserPlus size={20} />
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <button 
              onClick={() => handleQuickLink('Privacy Policy')}
              className="text-white/60 hover:text-white text-xs transition-colors duration-200"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => handleQuickLink('Terms of Service')}
              className="text-white/60 hover:text-white text-xs transition-colors duration-200"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => handleQuickLink('FAQ')}
              className="text-white/60 hover:text-white text-xs transition-colors duration-200"
            >
              FAQ
            </button>
            <button 
              onClick={() => handleSocialLink('Github')}
              className="text-white/60 hover:text-white text-xs transition-colors duration-200"
            >
              GitHub
            </button>
          </div>
          <p className="text-white/60 text-sm">
            © 2024 EduPulse. All rights reserved.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Transforming education through technology and innovation
          </p>
          <p className="text-white/30 text-xs mt-2">
            Made with ❤️ for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;