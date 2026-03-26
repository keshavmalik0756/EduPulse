import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, FileQuestion, Users, TrendingUp, Award, Edit, BarChart3, Trash2, X, Clock, Bookmark 
} from 'lucide-react';
import quizService from '../../../../../services/quizService';

const QuizSection = ({ course }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!course?._id) return;
      try {
        setLoading(true);
        const response = await quizService.getQuizzesByCourse(course._id);
        if (response.success) {
          setQuizzes(response.quizzes || []);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [course?._id]);

  const handleCreateQuiz = () => {
    setActiveQuiz(null);
    setShowCreateModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setShowCreateModal(true);
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      let response;
      if (activeQuiz && (activeQuiz._id || activeQuiz.id)) {
        response = await quizService.updateQuiz(activeQuiz._id || activeQuiz.id, {
          ...quizData,
          courseId: course._id
        });
      } else {
        response = await quizService.createQuiz({
          ...quizData,
          courseId: course._id
        });
      }

      if (response.success) {
        setShowCreateModal(false);
        setActiveQuiz(null);
        // Re-fetch
        const updated = await quizService.getQuizzesByCourse(course._id);
        setQuizzes(updated.quizzes || []);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const response = await quizService.deleteQuiz(quiz._id || quiz.id, course._id);
      if (response.success) {
        setQuizzes(prev => prev.filter(q => (q._id || q.id) !== (quiz._id || quiz.id)));
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">{quizzes.length} quizzes • Track student progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateQuiz}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Create Quiz
        </motion.button>
      </div>

      <QuizStatsGrid quizzes={quizzes} />

      {quizzes.length === 0 ? (
        <EmptyQuizzes onAction={handleCreateQuiz} />
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <QuizCard 
              key={quiz._id || quiz.id} 
              quiz={quiz} 
              index={index} 
              onEdit={() => handleEditQuiz(quiz)} 
              onDelete={() => handleDeleteQuiz(quiz)} 
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <QuizModal 
          activeQuiz={activeQuiz} 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleSaveQuiz} 
        />
      )}
    </motion.div>
  );
};

// Sub-components
const QuizStatsGrid = ({ quizzes }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <StatBox icon={<FileQuestion className="text-blue-600" />} label="Total Quizzes" value={quizzes.length} color="blue" />
    <StatBox icon={<Users className="text-green-600" />} label="Total Attempts" value={quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0)} color="green" />
    <StatBox icon={<TrendingUp className="text-yellow-600" />} label="Avg Score" value={`${quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + (q.averageScore || 0), 0) / quizzes.length) : 0}%`} color="yellow" />
    <StatBox icon={<Award className="text-purple-600" />} label="Published" value={quizzes.filter(q => q.status === 'published').length} color="purple" />
  </div>
);

const StatBox = ({ icon, label, value, color }) => {
  const bgColors = { blue: 'bg-blue-50', green: 'bg-green-50', yellow: 'bg-yellow-50', purple: 'bg-purple-50' };
  return (
    <div className={`${bgColors[color]} rounded-lg p-4`}>
      <div className="flex items-center">
        <div className="w-8 h-8">{icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium text-${color}-900`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

const QuizCard = ({ quiz, index, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${quiz.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {quiz.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <IconLabel icon={<FileQuestion />} label={`${quiz.questions || 0} questions`} />
          <IconLabel icon={<Clock />} label={`${quiz.duration || 0} minutes`} />
          <IconLabel icon={<Users />} label={`${quiz.attempts || 0} attempts`} />
          <IconLabel icon={<Bookmark />} label={quiz.section || 'Unassigned'} />
        </div>
      </div>
      <div className="flex gap-2">
        <ActionButton icon={<Edit />} label="Edit" onClick={onEdit} color="blue" />
        <ActionButton icon={<Trash2 />} label="Delete" onClick={onDelete} color="red" />
      </div>
    </div>
  </motion.div>
);

const IconLabel = ({ icon, label }) => (
  <div className="flex items-center">
    <div className="w-4 h-4 mr-1 opacity-60">{icon}</div>
    <span>{label}</span>
  </div>
);

const ActionButton = ({ icon, label, onClick, color }) => {
  const styles = {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  };
  return (
    <button onClick={onClick} className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${styles[color]}`}>
      <div className="w-4 h-4 mr-1">{icon}</div>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const QuizModal = ({ activeQuiz, onClose, onSave }) => {
  const [formData, setFormData] = useState(activeQuiz || { title: '', description: '', duration: 15 });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{activeQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4">
          <InputGroup label="Quiz Title" value={formData.title} onChange={v => setFormData({ ...formData, title: v })} />
          <InputGroup label="Description" value={formData.description} isTextArea onChange={v => setFormData({ ...formData, description: v })} />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Duration (min)" type="number" value={formData.duration} onChange={v => setFormData({ ...formData, duration: v })} />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Save Quiz</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, isTextArea, type = "text" }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {isTextArea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
    )}
  </div>
);

const EmptyQuizzes = ({ onAction }) => (
  <div className="text-center py-12">
    <FileQuestion className="w-16 h-16 text-gray-200 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes created yet</h3>
    <p className="text-gray-500 mb-6">Create your first quiz to assess student learning</p>
    <button onClick={onAction} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">Create Your First Quiz</button>
  </div>
);

const Loader2 = ({ className }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default QuizSection;
