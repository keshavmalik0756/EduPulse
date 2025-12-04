import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, TrendingUp, Users, Award, Calendar, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import momentumService from '../../../services/momentumService';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

const MomentumGraph = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [momentumData, setMomentumData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState(null);

  // Fetch momentum data
  useEffect(() => {
    const fetchMomentumData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const [momentumRes, summaryRes] = await Promise.all([
          momentumService.getCourseMomentum(courseId, timeRange),
          momentumService.getMomentumSummary(courseId, timeRange)
        ]);
        
        setMomentumData(momentumRes.data || []);
        setSummaryData(summaryRes.data || {});
      } catch (err) {
        setError('Failed to fetch momentum data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMomentumData();
  }, [courseId, timeRange]);

  const chartData = useMemo(() => {
    if (!momentumData || !Array.isArray(momentumData)) return [];
    return momentumData.map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      momentum: record.momentumScore,
      engagement: record.engagementRate,
      enrollments: record.enrollments,
      completions: record.completions,
      reviews: record.reviews,
      questions: record.questions
    }));
  }, [momentumData]);

  const metricsData = useMemo(() => {
    if (!summaryData) return [];
    return [
      { name: 'Enrollments', value: summaryData.totalEnrollments || 0, color: '#3B82F6' },
      { name: 'Completions', value: summaryData.totalCompletions || 0, color: '#10B981' },
      { name: 'Reviews', value: summaryData.totalReviews || 0, color: '#F59E0B' },
      { name: 'Questions', value: summaryData.totalQuestions || 0, color: '#8B5CF6' }
    ];
  }, [summaryData]);

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <span className="text-gray-700 font-medium text-sm sm:text-base">Time Range:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[7, 14, 30, 90].map(days => (
            <motion.button
              key={days}
              whileHover={{ scale: 1.05 }}
              onClick={() => setTimeRange(days)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                timeRange === days
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {days}d
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: 'Momentum', value: `${Math.round(summaryData.averageMomentum || 0)}%`, icon: Flame, color: 'orange' },
            { title: 'Engagement', value: `${Math.round(summaryData.averageEngagement || 0)}%`, icon: TrendingUp, color: 'emerald' },
            { title: 'Enrollments', value: summaryData.totalEnrollments || 0, icon: Users, color: 'indigo' },
            { title: 'Completions', value: summaryData.totalCompletions || 0, icon: Award, color: 'purple' }
          ].map((card, idx) => {
            const Icon = card.icon;
            const colorClasses = {
              orange: 'from-orange-100 to-orange-50 border-orange-200 text-orange-700 text-orange-900 bg-orange-200 text-orange-600',
              emerald: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700 text-emerald-900 bg-emerald-200 text-emerald-600',
              indigo: 'from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-700 text-indigo-900 bg-indigo-200 text-indigo-600',
              purple: 'from-purple-100 to-purple-50 border-purple-200 text-purple-700 text-purple-900 bg-purple-200 text-purple-600'
            };
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                className={`bg-gradient-to-br ${colorClasses[card.color]} rounded-xl p-4 sm:p-6 border-2 shadow-md hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-medium ${colorClasses[card.color].split(' ')[3]}`}>{card.title}</p>
                    <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${colorClasses[card.color].split(' ')[4]}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses[card.color].split(' ')[5]}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Momentum Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Momentum Trend</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
                <Area type="monotone" dataKey="momentum" stroke="#F97316" fillOpacity={1} fill="url(#colorMomentum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Metrics Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Metrics Distribution</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Daily Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Daily Metrics</h3>
        <div className="h-56 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
              <Legend />
              <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completions" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reviews" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="questions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Engagement vs Momentum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Engagement vs Momentum</h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
              <Legend />
              <Line type="monotone" dataKey="momentum" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default MomentumGraph;
