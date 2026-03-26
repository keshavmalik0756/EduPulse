import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CheckCircle, BarChart3, Loader2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart as ReBarChart, Bar 
} from 'recharts';
import courseService from '../../../../../services/courseService';

const CourseAnalytics = ({ course }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseAnalytics(course._id);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (course?._id) fetchAnalytics();
  }, [course?._id]);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const chartData = [
    { name: 'Mon', enrollment: 4, completion: 2 },
    { name: 'Tue', enrollment: 7, completion: 3 },
    { name: 'Wed', enrollment: 5, completion: 4 },
    { name: 'Thu', enrollment: 12, completion: 8 },
    { name: 'Fri', enrollment: 8, completion: 6 },
    { name: 'Sat', enrollment: 15, completion: 10 },
    { name: 'Sun', enrollment: 10, completion: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" /> Enrollment Trends
            </h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">+15% this week</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="enrollment" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEnroll)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" /> Completion Rate
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Avg 68.4%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="completion" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-900 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-lg font-bold mb-2">Advanced Performance Insights</h4>
          <p className="text-gray-300 text-sm">Leverage AI to predict student drop-offs and optimize your curriculum for better engagement.</p>
        </div>
        <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Go to Deep Analytics
        </button>
      </div>
    </div>
  );
};

export default CourseAnalytics;
