import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, TrendingUp, Award } from 'lucide-react';
import { formatPrice } from '../../../../../utils/formatters';

const CourseStats = ({ course }) => {
  const calculateRevenue = () => {
    if (!course) return 0;
    const finalPrice = course.finalPrice || course.price || 0;
    const totalEnrolled = course.totalEnrolled || 0;
    return finalPrice > 0 && totalEnrolled > 0 ? finalPrice * totalEnrolled : 0;
  };

  const revenue = calculateRevenue();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6"
    >
      <StatCard 
        icon={<Users className="w-6 h-6 text-blue-600" />} 
        value={course.totalEnrolled || 0} 
        label="Enrolled" 
        color="blue" 
      />
      <StatCard 
        icon={<BarChart3 className="w-6 h-6 text-green-600" />} 
        value={course.averageRating?.toFixed(1) || 'N/A'} 
        label="Rating" 
        color="green" 
      />
      <StatCard 
        icon={<TrendingUp className="w-6 h-6 text-purple-600" />} 
        value={course.totalReviews || 0} 
        label="Reviews" 
        color="purple" 
      />
      <StatCard 
        icon={<Award className="w-6 h-6 text-yellow-600" />} 
        value={formatPrice(revenue)} 
        label="Revenue" 
        color="yellow" 
      />
    </motion.div>
  );
};

const StatCard = ({ icon, value, label, color }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-400 bg-blue-100',
    green: 'from-green-500 to-green-400 bg-green-100',
    purple: 'from-purple-500 to-purple-400 bg-purple-100',
    yellow: 'from-yellow-500 to-yellow-400 bg-yellow-100'
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorMap[color].split(' ').slice(0, 2).join(' ')}`}></div>
      <div className="flex justify-center mb-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color].split(' ').pop()}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  );
};

export default CourseStats;
