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

import LoadingSpinner, { PremiumLoader } from '../components/common/LoadingSpinner';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Slightly longer to appreciate the UI
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
    return <PremiumLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 overflow-x-hidden" role="main">
      <React.Suspense fallback={<LoadingSpinner variant="dots" size="lg" /> }>
        <Navbar />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="educational" /> }>
        <HeroSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="pulse" /> }>
        <FeaturesSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="educational" /> }>
        <ToolsSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="pulse" /> }>
        <GamificationSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="educational" /> }>
        <PlatformOverviewSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="pulse" /> }>
        <CourseCategoriesSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="dots" /> }>
        <TestimonialsSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="pulse" /> }>
        <NewsletterSection />
      </React.Suspense>
      <React.Suspense fallback={<LoadingSpinner variant="educational" /> }>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default LandingPage;