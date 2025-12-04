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

const Navbar = React.lazy(() => import('../components/LandingPage/Navbar'));
const HeroSection = React.lazy(() => import('../components/LandingPage/HeroSection'));
const FeaturesSection = React.lazy(() => import('../components/LandingPage/FeaturesSection'));
const ToolsSection = React.lazy(() => import('../components/LandingPage/ToolsSection'));
const GamificationSection = React.lazy(() => import('../components/LandingPage/GamificationSection'));
const PlatformOverviewSection = React.lazy(() => import('../components/LandingPage/PlatformOverviewSection'));
const CourseCategoriesSection = React.lazy(() => import('../components/LandingPage/CourseCategoriesSection'));
const TestimonialsSection = React.lazy(() => import('../components/LandingPage/TestimonialsSection'));
const NewsletterSection = React.lazy(() => import('../components/LandingPage/NewsletterSection'));
const Footer = React.lazy(() => import('../components/LandingPage/Footer'));

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
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mr-4"></div>
          <span className="text-4xl font-bold text-white">EduPulse</span>
        </div>
      </div>
    );
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 overflow-x-hidden" role="main">
      <React.Suspense fallback={<LoadingSpinner /> }>
        <Navbar />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <HeroSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <FeaturesSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <ToolsSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <GamificationSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <PlatformOverviewSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <CourseCategoriesSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <TestimonialsSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <NewsletterSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner /> }>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default LandingPage;