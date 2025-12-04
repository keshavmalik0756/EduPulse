import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingDown, Lightbulb, Target, Clock, BookOpen, Users, Zap,
  CheckCircle, Flame
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import dropoutService from '../../../services/dropoutService';

const PredictiveDropoff = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [dropoutData, setDropoutData] = useState(null);
  const [highRiskData, setHighRiskData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [predictionMethod, setPredictionMethod] = useState('polynomial');
  const [error, setError] = useState(null);

  // Fetch dropout data
  useEffect(() => {
    const fetchDropoutData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const [dropoutRes, highRiskRes, summaryRes] = await Promise.all([
          dropoutService.getCourseDropouts(courseId),
          dropoutService.getHighRiskDropouts(courseId),
          dropoutService.getDropoutSummary(courseId)
        ]);
        
        setDropoutData(dropoutRes.data || []);
        setHighRiskData(highRiskRes.data || []);
        setSummaryData(summaryRes.data || {});
      } catch (err) {
        setError('Failed to fetch dropout data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDropoutData();
  }, [courseId]);

  const chartData = useMemo(() => {
    if (!dropoutData || !Array.isArray(dropoutData)) return [];
    return dropoutData.map(record => ({
      position: record.position,
      lecture: record.lecture?.title || `Lecture ${record.position}`,
      probability: record.dropoffProbability,
      confidence: record.confidence
    }));
  }, [dropoutData]);

  const riskFactorsData = useMemo(() => {
    if (!dropoutData || !Array.isArray(dropoutData)) return [];
    
    const factorMap = {};
    dropoutData.forEach(record => {
      if (record.riskFactors && Array.isArray(record.riskFactors)) {
        record.riskFactors.forEach(factor => {
          if (!factorMap[factor.factor]) {
            factorMap[factor.factor] = 0;
          }
          factorMap[factor.factor] += factor.weight;
        });
      }
    });
    
    return Object.entries(factorMap)
      .map(([factor, weight]) => ({
        subject: factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        A: Math.min(100, Math.round(weight / dropoutData.length))
      }))
      .slice(0, 6);
  }, [dropoutData]);

  const getRiskColor = (probability) => {
    if (probability >= 80) return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300', label: 'Critical' };
    if (probability >= 60) return { bg: 'bg-orange-900', border: 'border-orange-700', text: 'text-orange-300', label: 'High' };
    if (probability >= 40) return { bg: 'bg-yellow-900', border: 'border-yellow-700', text: 'text-yellow-300', label: 'Medium' };
    return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300', label: 'Low' };
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
      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: 'Total Predictions', value: summaryData.totalPredictions || 0, icon: Target, color: 'indigo' },
            { title: 'High-Risk Points', value: summaryData.highRiskCount || 0, icon: AlertTriangle, color: 'red' },
            { title: 'Avg. Drop-off', value: `${Math.round(summaryData.averageDropoffProbability || 0)}%`, icon: TrendingDown, color: 'purple' },
            { title: 'Highest Risk', value: `${summaryData.highestRiskLecture?.dropoffProbability || 0}%`, icon: Flame, color: 'orange' }
          ].map((card, idx) => {
            const Icon = card.icon;
            const colorClasses = {
              indigo: 'from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-700 text-indigo-900 bg-indigo-200 text-indigo-600',
              red: 'from-red-100 to-red-50 border-red-200 text-red-700 text-red-900 bg-red-200 text-red-600',
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
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Drop-off Probability */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Drop-off Probability</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="position" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6B7280" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
                <Line type="monotone" dataKey="probability" stroke="#EF4444" strokeWidth={3} dot={{ r: 5, fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Factors Radar */}
        {riskFactorsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Risk Profile</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskFactorsData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <Radar name="Risk Level" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px', color: '#111827' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* High-Risk Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          High-Risk Drop-off Points
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {highRiskData && highRiskData.length > 0 ? (
            highRiskData.map((record, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 ${
                  record.dropoffProbability >= 80 ? 'bg-red-50 border-red-200 hover:border-red-300' :
                  record.dropoffProbability >= 60 ? 'bg-orange-50 border-orange-200 hover:border-orange-300' :
                  record.dropoffProbability >= 40 ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                  'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                } transition-all`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                    record.dropoffProbability >= 80 ? 'bg-red-500' :
                    record.dropoffProbability >= 60 ? 'bg-orange-500' :
                    record.dropoffProbability >= 40 ? 'bg-yellow-500' :
                    'bg-emerald-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                      {record.lecture?.title || `Lecture ${record.position}`}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Position: {record.position}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg sm:text-2xl font-bold ${
                    record.dropoffProbability >= 80 ? 'text-red-600' :
                    record.dropoffProbability >= 60 ? 'text-orange-600' :
                    record.dropoffProbability >= 40 ? 'text-yellow-600' :
                    'text-emerald-600'
                  }`}>
                    {record.dropoffProbability}%
                  </p>
                  <p className="text-xs text-gray-600">
                    Confidence: {record.confidence}%
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <CheckCircle className="h-10 h-10 sm:h-12 sm:w-12 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm sm:text-base">No high-risk drop-off points detected</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Interventions */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommended Interventions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dropoutData && dropoutData.slice(0, 6).map((record, idx) => (
            <div key={idx} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm">
                  {record.lecture?.title || `Lecture ${record.position}`}
                </h4>
                <span className="text-sm font-bold text-red-600">
                  {record.dropoffProbability}%
                </span>
              </div>
              
              {record.interventions && record.interventions.length > 0 ? (
                <ul className="space-y-2">
                  {record.interventions.map((intervention, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2">
                      <div className="mt-1 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs text-gray-700">
                        {intervention.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-600">No specific interventions</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Mitigation Strategies */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Mitigation Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <p className="font-medium text-indigo-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content Optimization
            </p>
            <p className="text-sm text-indigo-700 mt-2">
              Break down complex topics into smaller, digestible segments with clear learning objectives.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
            <p className="font-medium text-emerald-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Engagement Boosters
            </p>
            <p className="text-sm text-emerald-700 mt-2">
              Add interactive elements like quizzes, polls, and discussion prompts to maintain interest.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="font-medium text-purple-900 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Progress Tracking
            </p>
            <p className="text-sm text-purple-700 mt-2">
              Implement milestone celebrations and progress indicators to motivate students.
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <p className="font-medium text-orange-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pacing Adjustments
            </p>
            <p className="text-sm text-orange-700 mt-2">
              Offer flexible pacing options and provide additional resources for struggling students.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PredictiveDropoff;
