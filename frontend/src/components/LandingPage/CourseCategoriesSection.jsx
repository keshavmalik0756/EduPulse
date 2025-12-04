import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import courseService from '../../services/courseService';

// Hardcoded course data based on the provided courses
const featuredCourses = [
  {
    _id: "690d256edb10dac80d0fe2ef",
    title: "Prompt Engineering: Master Generative AI for Work and Business",
    category: "Artificial Intelligence",
    thumbnail: "https://res.cloudinary.com/duceefwa0/image/upload/v1762469228/EduPulse/EduPulse/CourseThumbnails/gscbhldmtn2lmypftlkl.png",
    totalEnrolled: 1,
    views: 179
  },
  {
    _id: "6912e3cf9416395e766ae7ea",
    title: "The Absolute Beginner's Guide to Cybersecurity",
    category: "Cybersecurity",
    thumbnail: "https://res.cloudinary.com/duceefwa0/image/upload/v1762845632/EduPulse/EduPulse/CourseThumbnails/kvl0fgcyc4n5dgrst8ux.png",
    totalEnrolled: 0,
    views: 68
  },
  {
    _id: "692bf85923c75388aa1007e1",
    title: "AI Art & Creative Storytelling: From Concept to Canvas with Generative AI",
    category: "Design",
    thumbnail: "https://res.cloudinary.com/duceefwa0/image/upload/v1764489281/EduPulse/EduPulse/EduPulse/CourseThumbnails/brodwgprcrqgpt6wz6vm.png",
    totalEnrolled: 0,
    views: 8
  }
];

// Category-specific colors
const CATEGORY_COLORS = {
  'Artificial Intelligence': '#EC4899', // pink-500
  'Cybersecurity': '#06B6D4', // cyan-500
  'Design': '#EF4444', // red-500
  'Uncategorized': '#6B7280' // gray-500
};

const CategoryCard = ({ course, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group"
  >
    <div 
      className="h-48 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${course.thumbnail})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-xl font-bold">{course.title}</h3>
        <p className="text-white/80 text-sm">{course.category}</p>
      </div>
    </div>
    <div 
      className="h-2 w-full"
      style={{ backgroundColor: CATEGORY_COLORS[course.category] || CATEGORY_COLORS['Uncategorized'] }}
    ></div>
    <div 
      className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ backgroundColor: `${CATEGORY_COLORS[course.category] || CATEGORY_COLORS['Uncategorized']}20` }}
    ></div>
  </motion.div>
);

const CourseCategoriesSection = () => {
  const [courses, setCourses] = useState(featuredCourses);
  const [loading, setLoading] = useState(false);

  // Since we're using hardcoded data, we don't need to fetch from API
  // But we'll keep the useEffect for consistency and potential future enhancement

  return (
    <section id="categories" className="py-16 bg-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle>Featured Courses</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <CategoryCard key={course._id} course={course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCategoriesSection;