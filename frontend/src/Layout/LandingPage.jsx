/**
 * EduPulse - Modern Educational Platform Landing Page
 * 
 * This file contains the main landing page component with various sections:
 * 1. Hero Section
 * 2. Key Features
 * 3. Study Tools
 * 4. Gamification
 * 5. Platform Overview
 * 6. Newsletter
 * 7. Footer
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Navbar from '../components/LandingPage/Navbar';
import HeroSection from '../components/LandingPage/HeroSection';
import FeaturesSection from '../components/LandingPage/FeaturesSection';
import ToolsSection from '../components/LandingPage/ToolsSection';
import GamificationSection from '../components/LandingPage/GamificationSection';
import PlatformOverviewSection from '../components/LandingPage/PlatformOverviewSection';
import CourseCategoriesSection from '../components/LandingPage/CourseCategoriesSection';
import TestimonialsSection from '../components/LandingPage/TestimonialsSection';
import NewsletterSection from '../components/LandingPage/NewsletterSection';
import Footer from '../components/LandingPage/Footer';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
        const href = target.getAttribute('href');
        const targetElement = document.querySelector(href);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for navbar height
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-green-900 overflow-hidden" role="main" aria-label="Loading EduPulse">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-12"
            aria-hidden="true"
          >
            <Sparkles size={56} className="text-blue-400" />
          </motion.div>
          EduPulse
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 overflow-x-hidden" role="main">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ToolsSection />
      <GamificationSection />
      <PlatformOverviewSection />
      <CourseCategoriesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default LandingPage;