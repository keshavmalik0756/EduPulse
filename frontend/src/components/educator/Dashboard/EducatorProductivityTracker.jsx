import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Video, FileText, Clipboard, HelpCircle, Calendar, RefreshCw } from 'lucide-react';
import productivityService from '../../../services/productivityService';

const EducatorProductivityTracker = () => {
  const [productivityData, setProductivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProductivityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productivityService.getCurrentWeekProductivity();
      
      if (response.success && response.data) {
        // Ensure all fields have default values if missing
        const enrichedData = {
          productivityScore: response.data.productivityScore || 0,
          weekStartDate: response.data.weekStartDate || new Date(),
          coursesCreated: response.data.coursesCreated || 0,
          lecturesUploaded: response.data.lecturesUploaded || 0,
          notesUploaded: response.data.notesUploaded || 0,
          assignmentsCreated: response.data.assignmentsCreated || 0,
          quizzesAdded: response.data.quizzesAdded || 0,
          productivityCategory: response.data.productivityCategory || 'needs_improvement',
          lastSynced: response.lastSynced || new Date().toISOString(),
          debug: response.debug || null
        };
        setProductivityData(enrichedData);
      } else {
        setError(response.message || 'Failed to fetch productivity data');
      }
    } catch (err) {
      setError('Failed to load productivity data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data handler
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await productivityService.forceRefreshAll();
      await fetchProductivityData();
      // Show success message
    } catch (err) {
      console.error('Error refreshing productivity data:', err);
      // Error message already shown by service
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchProductivityData]);

  useEffect(() => {
    fetchProductivityData();
  }, [fetchProductivityData]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Format week range (Monday to Sunday)
  const formatWeekRange = (weekStartDate) => {
    if (!weekStartDate) return 'Unknown';
    try {
      const startDate = new Date(weekStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Add 6 days to get Sunday
      
      const startFormatted = startDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      const endFormatted = endDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${startFormatted} - ${endFormatted}`;
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Calculate progress percentage for radial chart
  const getProgressPercentage = (score) => {
    if (typeof score !== 'number' || score < 0) return 0;
    if (score > 100) return 100;
    return score;
  };

  // Get productivity category based on score
  const getProductivityCategory = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Average', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-500', bg: 'bg-red-100' };
  };

  if (loading && !productivityData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <HelpCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Unable to load data</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={fetchProductivityData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!productivityData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No productivity data</h3>
          <p className="mt-1 text-sm text-gray-500">No productivity data available for this week.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(productivityData.productivityScore);
  const category = getProductivityCategory(progressPercentage);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Productivity Tracker</h3>
            <p className="text-sm text-gray-500">Weekly performance metrics</p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className={`p-2 rounded-lg ${isRefreshing ? 'bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          aria-label="Refresh data"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={progressPercentage >= 80 ? "#10b981" : progressPercentage >= 60 ? "#3b82f6" : progressPercentage >= 40 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
            <span className={`text-xs font-medium ${category.color}`}>{category.label}</span>
          </div>
        </div>
      </div>

      {/* Week Info */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            {productivityData.weekStartDate ? formatWeekRange(productivityData.weekStartDate) : 'Current Week'}
          </span>
        </div>
        {productivityData.lastSynced && (
          <div className="text-xs text-gray-500">
            Last updated: {new Date(productivityData.lastSynced).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Courses</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {productivityData.coursesCreated || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Target: 2/week</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Video className="h-5 w-5 text-indigo-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Lectures</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {productivityData.lecturesUploaded || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Target: 10/week</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Notes</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {productivityData.notesUploaded || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Target: 15/week</div>
        </div>
      </div>

      {/* Score Calculation Breakdown */}
      {productivityData.debug && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">📐 Score Calculation Breakdown</h4>
          <div className="space-y-2 text-xs text-blue-800">
            <div className="flex justify-between items-center">
              <span>Courses: {productivityData.debug.coursesCreated}/2 × 30% weight</span>
              <span className="font-mono font-bold">{(productivityData.debug.normalizedCourses * 0.3 * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lectures: {productivityData.debug.lecturesUploaded}/10 × 40% weight</span>
              <span className="font-mono font-bold">{(productivityData.debug.normalizedLectures * 0.4 * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Notes: {productivityData.debug.notesUploaded}/15 × 30% weight</span>
              <span className="font-mono font-bold">{(productivityData.debug.normalizedNotes * 0.3 * 100).toFixed(1)}%</span>
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between items-center font-semibold">
              <span>Total Score</span>
              <span className="font-mono">{productivityData.debug.scoreCalculation}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations & Insights */}
      <div className={`mt-6 p-4 rounded-lg ${category.bg} border-l-4 ${
        progressPercentage >= 80 ? 'border-green-500' : 
        progressPercentage >= 60 ? 'border-blue-500' : 
        progressPercentage >= 40 ? 'border-yellow-500' : 
        'border-red-500'
      }`}>
        <div className="flex items-start">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {progressPercentage >= 80 && '🎉 Excellent Performance'}
              {progressPercentage >= 60 && progressPercentage < 80 && '👍 Good Progress'}
              {progressPercentage >= 40 && progressPercentage < 60 && '⚠️ Room for Improvement'}
              {progressPercentage < 40 && '🚀 Time to Boost Productivity'}
            </h4>
            
            <p className="text-sm text-gray-700 mb-3">
              {progressPercentage >= 80 && `Fantastic work! You've created ${productivityData.coursesCreated} course(s), uploaded ${productivityData.lecturesUploaded} lecture(s), and added ${productivityData.notesUploaded} note(s) this week. Keep maintaining this excellent momentum!`}
              
              {progressPercentage >= 60 && progressPercentage < 80 && `Good effort! You've created ${productivityData.coursesCreated} course(s), uploaded ${productivityData.lecturesUploaded} lecture(s), and added ${productivityData.notesUploaded} note(s). Consider adding more content to reach excellence.`}
              
              {progressPercentage >= 40 && progressPercentage < 60 && `You've made progress with ${productivityData.coursesCreated} course(s), ${productivityData.lecturesUploaded} lecture(s), and ${productivityData.notesUploaded} note(s). Try to increase your weekly output to improve engagement.`}
              
              {progressPercentage < 40 && `You've created ${productivityData.coursesCreated} course(s), uploaded ${productivityData.lecturesUploaded} lecture(s), and added ${productivityData.notesUploaded} note(s) so far. Let's boost your productivity this week!`}
            </p>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Action Items:</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                {progressPercentage < 40 && (
                  <>
                    <li>✓ Set a goal to create at least 1 course this week</li>
                    <li>✓ Upload 5+ lectures to engage your students</li>
                    <li>✓ Add study notes to support your lectures</li>
                    <li>✓ Schedule dedicated content creation time daily</li>
                  </>
                )}
                {progressPercentage >= 40 && progressPercentage < 60 && (
                  <>
                    <li>✓ Increase lecture uploads to 10+ per week</li>
                    <li>✓ Add more comprehensive study notes</li>
                    <li>✓ Create supplementary materials for better learning</li>
                    <li>✓ Engage more actively with student feedback</li>
                  </>
                )}
                {progressPercentage >= 60 && progressPercentage < 80 && (
                  <>
                    <li>✓ Aim for 2+ courses per week</li>
                    <li>✓ Enhance lecture quality with detailed notes</li>
                    <li>✓ Add interactive elements to your content</li>
                    <li>✓ Maintain consistency in your uploads</li>
                  </>
                )}
                {progressPercentage >= 80 && (
                  <>
                    <li>✓ Continue your excellent content creation pace</li>
                    <li>✓ Explore innovative teaching methods</li>
                    <li>✓ Gather student feedback for improvements</li>
                    <li>✓ Share best practices with other educators</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EducatorProductivityTracker;