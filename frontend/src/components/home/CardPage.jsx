import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import PropTypes from 'prop-types';
import {
  BookOpen,
  Play,
  Star,
  ArrowRight,
} from "lucide-react";
import { CARD_PAGE_CONTENT, CARD_PAGE_ORBS, HOME_STATIC_ASSETS } from "../../constants/homeData";
import FloatingOrb from "./FloatingOrb";

const CourseCard = React.memo(({ course, onNavigate, formatPrice }) => {
// ... existing CourseCard component code ...
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 120, damping: 15 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 15 });

  const rotateX = useTransform(smoothY, [-50, 50], [6, -6]);
  const rotateY = useTransform(smoothX, [-50, 50], [-6, 6]);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.03, y: -10 }}
      transition={{ duration: 0.4 }}
      onClick={() => onNavigate(`/course/${course._id}`)}
      className="group relative rounded-[2.5rem] overflow-hidden cursor-pointer
      bg-white/70 backdrop-blur-2xl border border-white/60
      shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-sky-500/10 blur-2xl" />

      <div className="relative h-60 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />

        <motion.div
          whileHover={{ scale: 1.1 }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
            <Play className="text-blue-600" />
          </div>
        </motion.div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {course.category || "Skill"}
          </span>

          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            {(course.averageRating || 4.5).toFixed(1)}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-emerald-500">
          {course.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2">
          {course.description}
        </p>

        <div className="flex justify-between items-center pt-4">
          <span className="text-2xl font-black">
            {formatPrice(course.price, course.discount)}
          </span>

          <button className="group/btn flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:scale-105 transition">
            Enroll
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired
};

CourseCard.displayName = 'CourseCard';

function CardPage() {
  const navigate = useNavigate();
  const courseData = useSelector((state) => state?.course?.courseData);

  const memoizedCourseData = useMemo(() => {
    return Array.isArray(courseData) ? courseData : [];
  }, [courseData]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/courses/getpublished`);
        const data = await res.json();
        setCourses(data?.courses || data?.data || []);
      } catch {
        setCourses(memoizedCourseData);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [memoizedCourseData]);

  const formatPrice = (price, discount = 0) => {
    if (!price || price === 0) return "Free";
    const final = discount ? price - (price * discount) / 100 : price;
    return `₹${Math.round(final)}`;
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative py-32 px-6 bg-white overflow-hidden">
      {/* 🔥 Advanced Background System */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply z-10 pointer-events-none"
        style={{ backgroundImage: HOME_STATIC_ASSETS.NOISE_BG }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-emerald-50/20 pointer-events-none"></div>

      {CARD_PAGE_ORBS.map((orb, index) => (
        <FloatingOrb key={index} {...orb} />
      ))}

      <div className="max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-6">
            <CARD_PAGE_CONTENT.badge.icon className="w-3 h-3" />
            {CARD_PAGE_CONTENT.badge.text}
          </div>

          <h2 className="text-5xl font-black mb-6">
            {CARD_PAGE_CONTENT.title}
            <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent">
              {CARD_PAGE_CONTENT.highlightedTitle}
            </span>
          </h2>

          <p className="text-slate-500 max-w-xl mx-auto">
            {CARD_PAGE_CONTENT.description}
          </p>
        </div>

        {courses.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c, i) => (
              <CourseCard key={c._id || i} course={c} onNavigate={navigate} formatPrice={formatPrice} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="mx-auto mb-4 text-slate-300" />
            <p>No courses available</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CardPage;
