import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  onRefresh, 
  lastUpdated,
  extra 
}) => {
  const borderColors = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
    orange: "border-orange-500",
    indigo: "border-indigo-500",
  };

  const bgColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    indigo: "bg-indigo-500",
  };

  const iconColors = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    indigo: "text-indigo-600 bg-indigo-100",
  };

  return (
    <motion.div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${borderColors[color] || "border-gray-500"} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[200px]`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColors[color] || "bg-gray-500"} rounded-full opacity-10 transform translate-x-10 -translate-y-10`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          <div className="flex items-center mt-2 flex-wrap">
            <span className="text-xs text-gray-400">
              {subtitle}
            </span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`ml-2 ${color === 'blue' ? 'text-blue-500 hover:text-blue-700' : 'text-gray-500 hover:text-gray-700'} text-xs transition-transform hover:rotate-90`}
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
          {extra && <div className="mt-2">{extra}</div>}
        </div>
        <div className={`rounded-full ${iconColors[color] || "bg-gray-100 text-gray-600"} p-3 shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 relative z-10">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{lastUpdated ? "Updated" : ""}</span>
          <span className="font-medium text-gray-700">
            {lastUpdated || ""}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
