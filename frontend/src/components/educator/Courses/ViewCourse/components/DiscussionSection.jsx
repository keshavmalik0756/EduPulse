import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  Send, User, CheckCircle, AlertCircle, MessageCircle, Award, ThumbsUp, ChevronDown, ChevronUp, Loader2 
} from 'lucide-react';
import courseService from '../../../../../services/courseService';
import { formatDate } from '../../../../../utils/formatters';

const DiscussionSection = ({ course }) => {
  const { user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!course?._id) return;
      try {
        setLoading(true);
        const res = await courseService.getCourseDiscussions(course._id);
        if (res.success) {
          const questionsData = res.data?.questions || res.questions || res.data || [];
          setQuestions(Array.isArray(questionsData) ? questionsData : []);
        }
      } catch (err) {
        console.error("Error fetching discussions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, [course?._id]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      const res = await courseService.createDiscussionQuestion(course._id, { content: newQuestion });
      if (res.success) {
        const newQ = res.data?.question || res.data || {};
        setQuestions(prev => [newQ, ...prev]);
        setNewQuestion("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnswer = async (questionId) => {
    const text = newAnswers[questionId];
    if (!text?.trim()) return;
    setSubmitting(true);
    try {
      const res = await courseService.addDiscussionAnswer(questionId, { content: text });
      if (res.success) {
        setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, answers: [...(q.answers || []), res.data] } : q));
        setNewAnswers(prev => ({ ...prev, [questionId]: "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const displayed = useMemo(() => {
    let data = [...questions];
    if (filter === "resolved") data = data.filter(q => q.isResolved);
    if (filter === "unresolved") data = data.filter(q => !q.isResolved);
    if (search) data = data.filter(q => q.content?.toLowerCase().includes(search.toLowerCase()));
    
    switch (sortBy) {
      case "popular": data.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0)); break;
      case "oldest": data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      default: data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return data;
  }, [questions, filter, sortBy, search]);

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">💬 <span className="font-display">Course Discussions</span></h2>
        <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest">{questions.length} Questions • {questions.reduce((a, q) => a + (q.answers?.length || 0), 0)} Answers</div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 border rounded-2xl mb-8 border-gray-100">
        <div className="flex-1 min-w-[300px] relative">
          <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for discussions..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none"><option value="all">All Status</option><option value="resolved">Resolved</option><option value="unresolved">Unresolved</option></select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none"><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="popular">Most Active</option></select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-10 shadow-sm shadow-blue-50">
        <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2"><Send className="w-4 h-4" /> Start a conversation</h3>
        <form onSubmit={handleSubmitQuestion}>
          <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="What's your question about this course?" className="w-full p-4 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[120px] shadow-inner bg-white" />
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs font-bold text-gray-400">{newQuestion.length}/500 chars</span>
            <button type="submit" disabled={submitting || !newQuestion.trim()} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold text-sm shadow-lg shadow-blue-200 transition-all">Post Question</button>
          </div>
        </form>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 opacity-30 italic font-medium"><MessageCircle className="mx-auto w-12 h-12 mb-2" /><p>No discussions found matching your criteria</p></div>
      ) : (
        <div className="space-y-6">
          {displayed.map(q => (
            <QuestionItem 
              key={q._id} 
              question={q} 
              isExpanded={expanded[q._id]} 
              onToggle={() => setExpanded(p => ({ ...p, [q._id]: !p[q._id] }))} 
              onReply={(text) => handleAddAnswer(q._id, text)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const QuestionItem = ({ question, isExpanded, onToggle, onReply }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 border border-gray-100 rounded-2xl hover:border-blue-100 transition-all hover:shadow-xl hover:shadow-gray-100 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 shadow-inner">{question.user?.name?.charAt(0) || "A"}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{question.user?.name || "Anonymous"}</h4>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{formatDate(question.createdAt)}</span>
        </div>
        <p className="text-gray-700 font-medium leading-relaxed leading-relaxed mb-4">{question.content}</p>
        <div className="flex items-center gap-4 text-xs font-bold">
          <button onClick={onToggle} className="text-blue-600 flex items-center gap-1 hover:underline">{isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} {question.answers?.length || 0} Answers</button>
          {question.isResolved ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</span> : <span className="text-yellow-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Unresolved</span>}
        </div>
      </div>
    </div>
    {isExpanded && (
      <div className="mt-6 pl-14 space-y-4 border-l-2 border-dashed border-gray-100">
        {question.answers?.map(ans => (
          <div key={ans._id} className={`p-4 rounded-xl border ${ans.isBestAnswer ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
            {ans.isBestAnswer && <div className="text-[10px] uppercase font-black text-green-600 flex items-center gap-1 mb-2"><Award className="w-3 h-3" /> Best Answer</div>}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">{ans.user?.name || "Anonymous"}</span>
              <span className="text-[10px] font-bold text-gray-400">{formatDate(ans.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">{ans.content}</p>
            <div className="mt-3 flex gap-4">
              <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Like ({ans.likes || 0})</button>
            </div>
          </div>
        ))}
        {!question.answers?.length && <p className="text-xs text-gray-400 italic">Be the first to respond!</p>}
      </div>
    )}
  </motion.div>
);

export default DiscussionSection;
