import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, AlertTriangle, RefreshCw,
  Activity, Flame, TrendingDown, Brain
} from 'lucide-react';
import ConfusionDetector from './ConfusionDetector';
import MomentumGraph from './MomentumGraph';
import PredictiveDropoff from './PredictiveDropoff';
import courseService from '../../../services/courseService';
import confusionService from '../../../services/confusionService';
import momentumService from '../../../services/momentumService';
import dropoutService from '../../../services/dropoutService';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { id: 'confusion', name: 'Confusion Analysis', icon: Brain, color: 'from-purple-500 to-purple-600' },
    { id: 'momentum', name: 'Momentum Tracker', icon: Flame, color: 'from-orange-500 to-orange-600' },
    { id: 'dropoff', name: 'Risk Zones', icon: AlertTriangle, color: 'from-red-500 to-red-600' }
  ];

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getCreatorCourses();
        if (response.success) {
          setCourses(response.courses);
          if (response.courses.length > 0) {
            setSelectedCourse(response.courses[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedCourse) return;
      
      try {
        const [confusionRes, momentumRes, dropoutRes] = await Promise.all([
          confusionService.getCourseConfusionSummary(selectedCourse),
          momentumService.getMomentumSummary(selectedCourse, 30),
          dropoutService.getDropoutSummary(selectedCourse)
        ]);
        
        setDashboardData({
          confusion: confusionRes.data || {},
          momentum: momentumRes.data || {},
          dropout: dropoutRes.data || {}
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    
    fetchDashboardData();
  }, [selectedCourse]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 lg:gap-8">
            {/* Title Section */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                📊 Analytics Dashboard
              </h1>
              <p className="mt-1 sm:mt-2 lg:mt-3 text-sm sm:text-base lg:text-lg text-gray-600">
                Real-time insights into your course performance
              </p>
            </div>
            
            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Course Dropdown */}
              <div className="relative flex-1 sm:flex-none sm:min-w-0">
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value || null)}
                  className="w-full sm:w-48 lg:w-56 appearance-none bg-white border-2 border-indigo-200 text-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300 transition-all font-medium cursor-pointer shadow-sm pr-8 sm:pr-9 truncate overflow-hidden"
                >
                  <option value="">📚 Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title.length > 40 ? course.title.substring(0, 37) + '...' : course.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 text-indigo-600 flex-shrink-0">
                  <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md text-sm sm:text-base font-medium whitespace-nowrap flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden text-xs">{tab.name.split(' ')[0]}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* KPI Cards */}
              {dashboardData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      title: 'Confusion Level',
                      value: Math.round(dashboardData.confusion?.stats?.averageConfusionScore || 0),
                      icon: Brain,
                      color: 'purple',
                      subtitle: `${dashboardData.confusion?.stats?.totalConfusionPoints || 0} points detected`
                    },
                    {
                      title: 'Momentum',
                      value: Math.round(dashboardData.momentum?.averageMomentum || 0),
                      icon: Flame,
                      color: 'orange',
                      subtitle: `${dashboardData.momentum?.totalEnrollments || 0} new enrollments`
                    },
                    {
                      title: 'Engagement',
                      value: Math.round(dashboardData.momentum?.averageEngagement || 0),
                      icon: Activity,
                      color: 'emerald',
                      subtitle: `${dashboardData.momentum?.totalCompletions || 0} completions`
                    },
                    {
                      title: 'Drop-off Risk',
                      value: Math.round(dashboardData.dropout?.averageDropoffProbability || 0),
                      icon: TrendingDown,
                      color: 'red',
                      subtitle: `${dashboardData.dropout?.highRiskCount || 0} high-risk zones`
                    }
                  ].map((card, idx) => {
                    const colorMap = {
                      purple: 'from-purple-100 to-purple-50 border-purple-200 text-purple-700 text-purple-900 bg-purple-200 text-purple-600',
                      orange: 'from-orange-100 to-orange-50 border-orange-200 text-orange-700 text-orange-900 bg-orange-200 text-orange-600',
                      emerald: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700 text-emerald-900 bg-emerald-200 text-emerald-600',
                      red: 'from-red-100 to-red-50 border-red-200 text-red-700 text-red-900 bg-red-200 text-red-600'
                    };
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        className={`bg-gradient-to-br ${colorMap[card.color]} rounded-xl p-4 sm:p-6 border-2 shadow-md hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm font-medium ${colorMap[card.color].split(' ')[3]}`}>{card.title}</p>
                            <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${colorMap[card.color].split(' ')[4]}`}>
                              {card.value}%
                            </p>
                          </div>
                          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorMap[card.color].split(' ')[5]}`}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                        </div>
                        <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${colorMap[card.color].split(' ')[3]}`}>
                          <p className={`text-xs ${colorMap[card.color].split(' ')[5]}`}>
                            {card.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Insights Grid */}
              {dashboardData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Top Issues */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Top Issues
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {dashboardData.confusion?.topConfusionPoints?.slice(0, 3).map((point, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                                {point.lecture?.title || `Lecture ${idx + 1}`}
                              </p>
                              <p className="text-xs text-gray-600">Confusion: {Math.round(point.confusionScore)}%</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-bold text-indigo-600">{point.replayCount + point.skipCount}</p>
                            <p className="text-xs text-gray-600">interactions</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-pink-500" />
                      Quick Tips
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {dashboardData.confusion?.stats?.averageConfusionScore > 60 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 sm:p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500 hover:bg-purple-100 transition-all"
                        >
                          <p className="text-purple-900 font-medium text-xs sm:text-sm">🧠 High Confusion Detected</p>
                          <p className="text-xs text-purple-700 mt-1">Break down complex topics into smaller segments</p>
                        </motion.div>
                      )}
                      {dashboardData.dropout?.averageDropoffProbability > 50 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 sm:p-3 bg-red-50 rounded-lg border-l-4 border-red-500 hover:bg-red-100 transition-all"
                        >
                          <p className="text-red-900 font-medium text-xs sm:text-sm">⚠️ High Drop-off Risk</p>
                          <p className="text-xs text-red-700 mt-1">Implement interventions at critical points</p>
                        </motion.div>
                      )}
                      {dashboardData.momentum?.averageMomentum < 40 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 sm:p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500 hover:bg-orange-100 transition-all"
                        >
                          <p className="text-orange-900 font-medium text-xs sm:text-sm">🔥 Low Momentum</p>
                          <p className="text-xs text-orange-700 mt-1">Boost engagement with interactive content</p>
                        </motion.div>
                      )}
                      {dashboardData.confusion?.stats?.averageConfusionScore < 30 && dashboardData.momentum?.averageMomentum > 70 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 sm:p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500 hover:bg-emerald-100 transition-all"
                        >
                          <p className="text-emerald-900 font-medium text-xs sm:text-sm">✨ Excellent Performance</p>
                          <p className="text-xs text-emerald-700 mt-1">Your course is performing exceptionally well!</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'confusion' && <ConfusionDetector courseId={selectedCourse} />}
          {activeTab === 'momentum' && <MomentumGraph courseId={selectedCourse} />}
          {activeTab === 'dropoff' && <PredictiveDropoff courseId={selectedCourse} />}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
