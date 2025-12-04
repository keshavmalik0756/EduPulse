import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, AlertTriangle, Lightbulb, Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import confusionService from '../../../services/confusionService';
import lectureService from '../../../services/lectureService';

const ConfusionDetector = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [confusionData, setConfusionData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Fetch lectures
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await lectureService.getLecturesByCourse(courseId);
        if (response.success) {
          setLectures(response.lectures || []);
          if (response.lectures?.length > 0) {
            setSelectedLecture(response.lectures[0]);
          }
        }
      } catch (err) {
        setError('Failed to fetch lectures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchLectures();
  }, [courseId]);

  // Fetch confusion data for selected lecture
  useEffect(() => {
    const fetchConfusionData = async () => {
      if (!selectedLecture) return;
      
      try {
        setLoading(true);
        const [dataRes, analysisRes, recRes] = await Promise.all([
          confusionService.getLectureConfusionData(selectedLecture._id),
          confusionService.getLectureConfusionAnalysis(selectedLecture._id),
          confusionService.getRecommendations(selectedLecture._id)
        ]);
        
        setConfusionData(dataRes.data || []);
        setAnalysisData(analysisRes.data || {});
        setRecommendations(recRes.data || []);
      } catch (err) {
        setError('Failed to fetch confusion data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfusionData();
  }, [selectedLecture]);

  const chartData = useMemo(() => {
    if (!confusionData || !Array.isArray(confusionData)) return [];
    return confusionData.map((point, idx) => ({
      name: `${Math.floor(point.timestamp / 60)}:${String(point.timestamp % 60).padStart(2, '0')}`,
      confusion: point.confusionScore,
      replays: point.replayCount,
      skips: point.skipCount,
      pauses: point.pauseCount
    }));
  }, [confusionData]);

  const interactionData = useMemo(() => {
    if (!analysisData?.summary?.interactionBreakdown) return [];
    const breakdown = analysisData.summary.interactionBreakdown;
    return [
      { name: 'Replays', value: breakdown.replays, color: '#3B82F6' },
      { name: 'Skips', value: breakdown.skips, color: '#EF4444' },
      { name: 'Pauses', value: breakdown.pauses, color: '#F59E0B' }
    ];
  }, [analysisData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lecture Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Select Lecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {lectures.map((lecture, idx) => (
            <motion.button
              key={lecture._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              onClick={() => setSelectedLecture(lecture)}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left text-sm sm:text-base ${
                selectedLecture?._id === lecture._id
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md'
                  : 'border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <p className={`font-medium truncate ${selectedLecture?._id === lecture._id ? 'text-indigo-900' : 'text-gray-900'}`}>{lecture.title}</p>
              <p className="text-xs text-gray-600 mt-1">
                {Math.floor(lecture.duration / 60)}m {lecture.duration % 60}s
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {selectedLecture && analysisData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: 'Total Points', value: analysisData.summary?.totalPoints || 0, icon: Brain, color: 'indigo' },
              { title: 'Avg. Confusion', value: `${Math.round(analysisData.summary?.avgConfusionScore || 0)}%`, icon: AlertTriangle, color: 'purple' },
              { title: 'High Confusion', value: analysisData.summary?.highConfusionSegments || 0, icon: Zap, color: 'orange' }
            ].map((card, idx) => {
              const Icon = card.icon;
              const colorClasses = {
                indigo: 'from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-700 text-indigo-900 bg-indigo-200 text-indigo-600',
                purple: 'from-purple-100 to-purple-50 border-purple-200 text-purple-700 text-purple-900 bg-purple-200 text-purple-600',
                orange: 'from-orange-100 to-orange-50 border-orange-200 text-orange-700 text-orange-900 bg-orange-200 text-orange-600'
              };
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Confusion Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Confusion Timeline</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConfusion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
                    <Area type="monotone" dataKey="confusion" stroke="#EC4899" fillOpacity={1} fill="url(#colorConfusion)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Interaction Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Interaction Types</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={interactionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {interactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* High Confusion Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              High Confusion Points
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {analysisData.highConfusionPoints?.slice(0, 5).map((point, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg border border-pink-100 hover:border-pink-300 transition-all"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-xs sm:text-sm text-white font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 font-medium text-xs sm:text-sm">
                        {Math.floor(point.timestamp / 60)}:{String(point.timestamp % 60).padStart(2, '0')}
                      </p>
                      <div className="flex gap-2 sm:gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                        <span>🔄 {point.replayCount}</span>
                        <span>⏭️ {point.skipCount}</span>
                        <span>⏸️ {point.pauseCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg sm:text-2xl font-bold text-pink-600">{point.confusionScore}%</p>
                    <p className="text-xs text-gray-600">confusion</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-500'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-emerald-50 border-emerald-500'
                    }`}
                  >
                    <p className={`font-medium ${
                      rec.priority === 'high'
                        ? 'text-red-900'
                        : rec.priority === 'medium'
                        ? 'text-yellow-900'
                        : 'text-emerald-900'
                    }`}>{rec.message}</p>
                    <p className={`text-sm mt-1 ${
                      rec.priority === 'high'
                        ? 'text-red-700'
                        : rec.priority === 'medium'
                        ? 'text-yellow-700'
                        : 'text-emerald-700'
                    }`}>💡 {rec.action}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ConfusionDetector;
