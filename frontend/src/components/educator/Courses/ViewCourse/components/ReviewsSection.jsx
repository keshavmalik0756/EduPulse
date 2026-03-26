import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Send, User, Loader2 
} from 'lucide-react';
import courseService from '../../../../../services/courseService';
import { formatDate } from '../../../../../utils/formatters';

const ReviewsSection = ({ course }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!course?._id) return;
      try {
        setLoading(true);
        const response = await courseService.getCourseReviews(course._id);
        if (response.success && response.data?.reviews?.length > 0) {
          setReviews(response.data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("❌ Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [course?._id]);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => (dist[r.rating] = (dist[r.rating] || 0) + 1));
    return dist;
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    if (filter !== "all") result = result.filter((r) => r.rating == filter);
    switch (sortOrder) {
      case "recent": result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case "top-rated": result.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return result;
  }, [reviews, filter, sortOrder]);

  const getSentiment = (rating) => {
    if (rating >= 4) return { text: "Positive", emoji: "😊" };
    if (rating === 3) return { text: "Neutral", emoji: "😐" };
    return { text: "Negative", emoji: "😞" };
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-display">Course Reviews</h2>
        <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 shadow-sm">
          <Star className="w-5 h-5 text-yellow-500 fill-current mr-2" />
          <span className="text-2xl font-bold text-yellow-700">{course.averageRating?.toFixed(1) || "N/A"}</span>
          <span className="text-yellow-600/70 ml-2 font-medium">({course.totalReviews || 0} reviews)</span>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-500 w-3">{rating}</span>
                <div className="flex-grow h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(ratingDistribution[rating] / (reviews.length || 1)) * 100}%` }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
                </div>
                <span className="text-xs font-bold text-gray-400 w-8">{ratingDistribution[rating] || 0}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center items-center text-center p-4 border-l border-gray-200">
            <p className="text-gray-500 text-sm mb-2 font-medium">Overall Sentiment</p>
            <div className="text-4xl mb-2">{getSentiment(Math.round(course.averageRating || 0)).emoji}</div>
            <p className="text-lg font-bold text-gray-800">{getSentiment(Math.round(course.averageRating || 0)).text}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
            <option value="recent">Most Recent</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-200">
          <Send className="w-4 h-4 mr-2" /> Reply to Reviews
        </button>
      </div>

      {filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-medium italic">No reviews match your filter selection</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review, index) => (
            <motion.div key={review._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-100 flex-shrink-0">{review.user?.name?.charAt(0) || "A"}</div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{review.user?.name || "Anonymous User"}</h4>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{formatDate(review.createdAt || review.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />)}
                    <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">{getSentiment(review.rating).text}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm italic">"{review.comment}"</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 hover:underline transition-all"><Send className="w-3 h-3" /> Reply</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ReviewsSection;
