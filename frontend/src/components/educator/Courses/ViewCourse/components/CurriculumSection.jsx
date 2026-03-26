import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Video, FileText, BookOpen, RefreshCw, Plus, Search, Grid, List, 
  SlidersHorizontal, ChevronDown, Clock, Users, BarChart3, Eye, Edit, Trash2, 
  AlertCircle, ChevronUp, Lock, Globe, CheckCircle, Play, Pause, Archive, Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import sectionService from '../../../../../services/sectionService';
import lectureService from '../../../../../services/lectureService';
import { 
  formatDate, 
  formatDuration, 
  formatDurationSeconds 
} from '../../../../../utils/formatters';
import NotesSection from './NotesSection';
import QuizSection from './QuizSection';
import CourseAnalytics from './CourseAnalytics';

// Helper to transform lecture data for the educator view
const transformLectures = (lectures = []) => {
  return lectures.map(lecture => ({
    id: lecture._id || lecture.id || '',
    title: lecture.title || 'Untitled Lecture',
    description: lecture.description || 'No description provided',
    duration: lecture.duration || 0,
    durationFormatted: formatDurationSeconds(lecture.duration || 0),
    type: lecture.type || (lecture.videoUrl ? 'video' : 'text'),
    views: lecture.viewCount || 0,
    lastUpdated: (lecture.updatedAt || lecture.createdAt) ? new Date(lecture.updatedAt || lecture.createdAt).toLocaleDateString() : 'Unknown',
    lastUpdatedRaw: lecture.updatedAt || lecture.createdAt,
    sectionId: lecture.sectionId?._id || lecture.sectionId || '',
    sectionTitle: (lecture.sectionId?.title) || 'Unassigned',
    thumbnail: lecture.thumbnail || lecture.thumbnailUrl || null,
    isPublic: !lecture.isLocked
  }));
};

const CurriculumSection = ({ course }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [expandedSections, setExpandedSections] = useState({});
  
  // Lecture states for educator view
  const [lectures, setLectures] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    avgDuration: 0,
    topPerforming: null,
    lowViewCount: 0
  });

  const fetchCurriculum = useCallback(async () => {
    if (!course?._id) return;
    try {
      setLoading(true);
      const response = await sectionService.getSectionsByCourse(course._id);
      if (response.success) {
        setSections(response.sections || []);
        const initialExpanded = {};
        (response.sections || []).forEach(section => {
          initialExpanded[section._id] = true;
        });
        setExpandedSections(initialExpanded);
      } else {
        throw new Error(response.message || "Failed to fetch curriculum");
      }
    } catch (err) {
      console.error("❌ Curriculum load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [course?._id]);

  const fetchLectures = useCallback(async () => {
    if (!course?._id) return;
    try {
      const response = await lectureService.getLecturesByCourse(course._id);
      const transformed = transformLectures(response.lectures || []);
      setLectures(transformed);
      
      const total = transformed.length;
      const views = transformed.reduce((sum, l) => sum + (l.views || 0), 0);
      const totalDuration = transformed.reduce((sum, l) => sum + (l.duration || 0), 0);
      
      setStats({
        total,
        views,
        avgDuration: total > 0 ? Math.round(totalDuration / total) : 0,
        lowViewCount: transformed.filter(l => (l.views || 0) < 10).length
      });
    } catch (err) {
      console.error("Error fetching lectures:", err);
    }
  }, [course?._id]);

  useEffect(() => {
    if (course?._id) {
      fetchCurriculum();
      fetchLectures();
    }
  }, [course?._id, fetchCurriculum, fetchLectures]);

  const curriculumStats = useMemo(() => {
    let totalLectures = 0, totalDuration = 0;
    sections.forEach((sec) => {
      totalLectures += sec.lessons?.length || 0;
      totalDuration += sec.lessons?.reduce((sum, lec) => sum + (lec.duration || 0), 0);
    });
    return { totalLectures, totalDuration };
  }, [sections]);


  const filteredLectures = useMemo(() => {
    // Enrich lectures with current section titles
    let result = (lectures || []).map(lecture => {
      const section = sections.find(s => {
        const sid = s._id?.toString() || s._id;
        const lidStr = lecture.sectionId?.toString() || lecture.sectionId;
        return sid === lidStr;
      });
      return {
        ...lecture,
        sectionTitle: section ? section.title : lecture.sectionTitle
      };
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lecture =>
        lecture.title.toLowerCase().includes(term) ||
        lecture.description.toLowerCase().includes(term) ||
        lecture.sectionTitle.toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.lastUpdatedRaw) - new Date(b.lastUpdatedRaw));
        break;
      case 'duration':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => new Date(b.lastUpdatedRaw) - new Date(a.lastUpdatedRaw));
    }

    return result;
  }, [lectures, searchTerm, sortBy]);

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      const response = await lectureService.deleteLecture(lectureId);
      if (response.success) {
        toast.success("Lecture deleted successfully");
        fetchLectures();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Failed to delete lecture:", err);
      toast.error("Failed to delete lecture");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section? Lectures will remain available.")) return;
    try {
      const response = await sectionService.deleteSection(sectionId);
      if (response.success) {
        toast.success("Section deleted successfully");
        fetchCurriculum();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete section");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-600" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
      case 'text': return <BookOpen className="w-4 h-4 text-green-600" />;
      default: return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          {activeTab === "lectures" && (
            <p className="text-sm text-gray-600">
              {curriculumStats.totalLectures} Lectures • {formatDurationSeconds(curriculumStats.totalDuration)}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { fetchCurriculum(); fetchLectures(); }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center"
            title="Refresh curriculum"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </motion.button>

          {activeTab === "lectures" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/educator/courses/${course._id}/lectures/create`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Lecture
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        {["lectures", "sections", "notes", "quiz", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium text-sm transition-colors whitespace-nowrap capitalize ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading content...
          </motion.div>
        ) : error ? (
          <motion.div key="error" className="p-8 text-center text-red-600">
            <AlertCircle className="w-10 h-10 mx-auto mb-4" />
            <p>{error}</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "lectures" && (
              <LecturesTabContent 
                stats={stats} 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                filteredLectures={filteredLectures}
                onDelete={handleDeleteLecture}
                courseId={course._id}
                getTypeIcon={getTypeIcon}
                sortBy={sortBy}
                setSortBy={setSortBy}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            )}
            {activeTab === "sections" && (
              <SectionsTabContent 
                sections={sections} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                onAddLecture={(sid, sname) => navigate(`/educator/courses/${course._id}/lectures/create`, { state: { sectionId: sid, sectionName: sname } })}
                onEditSection={(sid) => navigate(`/educator/courses/${course._id}/sections/edit/${sid}`)}
                onDeleteSection={handleDeleteSection}
                onEditLecture={(lid) => navigate(`/educator/courses/${course._id}/lectures/edit/${lid}`)}
                onDeleteLecture={handleDeleteLecture}
                onAddSection={() => navigate(`/educator/courses/${course._id}/sections/create`)}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                getTypeIcon={getTypeIcon}
              />
            )}
            {activeTab === "notes" && <NotesSection course={course} />}
            {activeTab === "quiz" && <QuizSection course={course} />}
            {activeTab === "analytics" && <CourseAnalytics course={course} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Sub-components (Restored Premium UI) ---

const LecturesTabContent = ({ 
  stats, viewMode, setViewMode, searchTerm, setSearchTerm, filteredLectures, 
  onDelete, courseId, getTypeIcon, sortBy, setSortBy, showFilters, setShowFilters 
}) => {
  const navigate = useNavigate();
  return (
    <div className="mt-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <PremiumStatCard label="Total Lectures" value={stats.total} icon={<Video />} color="blue" />
        <PremiumStatCard 
          label="Total Views" 
          value={stats.views.toLocaleString()} 
          icon={<Users />} 
          color="green" 
          badge={stats.lowViewCount > 0 ? `${stats.lowViewCount} low count` : 'Good engagement'}
          badgeColor={stats.lowViewCount > 0 ? 'orange' : 'green'}
        />
        <PremiumStatCard label="Avg. Duration" value={formatDurationSeconds(stats.avgDuration)} icon={<Clock />} color="yellow" subLabel="Per lecture" />
        <PremiumStatCard label="Performance" value={`${stats.total} items`} icon={<BarChart3 />} color="purple" />
      </div>

      {/* Filters and Search */}
      <motion.div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lectures..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}><Grid className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}><List className="w-5 h-5" /></button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="block w-full pl-3 pr-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="duration">Duration</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setSearchTerm(''); setSortBy('newest'); }} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 transition-colors">Reset Filters</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lectures List */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lecture, index) => (
                <PremiumLectureCard key={lecture.id} lecture={lecture} index={index} courseId={courseId} onDelete={onDelete} getTypeIcon={getTypeIcon} />
              ))}
            </div>
          ) : (
            <PremiumLectureList lectures={filteredLectures} courseId={courseId} onDelete={onDelete} getTypeIcon={getTypeIcon} />
          )}
        </>
      )}
    </div>
  );
};

const PremiumStatCard = ({ label, value, icon, color, badge, badgeColor, subLabel }) => {
  const bgColors = { blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500' };
  const lightBgs = { blue: 'bg-blue-100', green: 'bg-green-100', yellow: 'bg-yellow-100', purple: 'bg-purple-100' };
  const borderColors = { blue: 'border-blue-500', green: 'border-green-500', yellow: 'border-yellow-500', purple: 'border-purple-500' };
  const textColors = { blue: 'text-blue-600', green: 'text-green-600', yellow: 'text-yellow-600', purple: 'text-purple-600' };

  return (
    <motion.div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${borderColors[color]} relative overflow-hidden min-h-[160px] md:min-h-[200px]`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColors[color]} rounded-full opacity-10 transform translate-x-10 -translate-y-10`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {badge && (
            <div className="mt-2">
              <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${badgeColor === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${badgeColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                {badge}
              </span>
            </div>
          )}
          {subLabel && (
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" /> {subLabel}
            </div>
          )}
        </div>
        <div className={`rounded-full ${lightBgs[color]} p-3 shadow-inner`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${textColors[color]}` })}
        </div>
      </div>
    </motion.div>
  );
};

const PremiumLectureCard = ({ lecture, index, courseId, onDelete, getTypeIcon }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          {lecture.thumbnail ? (
            <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-40 object-cover rounded-md mb-3" />
          ) : (
            <div className="w-full h-40 bg-blue-50 rounded-md mb-3 flex items-center justify-center">
              <Video className="h-12 w-12 text-blue-200" />
            </div>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">{lecture.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lecture.description}</p>
        </div>

        <div className="text-xs text-gray-400 mb-3 bg-gray-50 px-2 py-1 rounded inline-block w-fit">
          Section: {lecture.sectionTitle}
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4 gap-3">
          <div className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gray-400" />{lecture.durationFormatted}</div>
          <div className="flex items-center capitalize">{getTypeIcon(lecture.type)}<span className="ml-1">{lecture.type}</span></div>
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1 text-blue-400" />
            <span>{lecture.views} views</span>
          </div>
          <div className="text-xs text-gray-400">
            Updated {lecture.lastUpdated}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-auto">
          <ActionButtonCard icon={<Eye />} label="View" onClick={() => navigate(`/educator/courses/${courseId}/lectures/view/${lecture.id}`)} />
          <ActionButtonCard icon={<Edit />} label="Edit" onClick={() => navigate(`/educator/courses/${courseId}/lectures/edit/${lecture.id}`)} />
          <ActionButtonCard icon={<Trash2 />} label="Del" onClick={() => onDelete(lecture.id)} color="red" />
        </div>
      </div>
    </motion.div>
  );
};

const ActionButtonCard = ({ icon, label, onClick, color = 'blue' }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-50 transition-colors group"
  >
    {React.cloneElement(icon, { className: `w-4 h-4 ${color === 'red' ? 'text-red-500' : 'text-gray-500 group-hover:text-blue-500'}` })}
    <span className={`text-[10px] sm:text-xs mt-1 font-medium ${color === 'red' ? 'text-red-500' : 'text-gray-600'}`}>{label}</span>
  </button>
);

const PremiumLectureList = ({ lectures, courseId, onDelete, getTypeIcon }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {lectures.map(lecture => (
              <tr key={lecture.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-16 flex-shrink-0 bg-blue-50 rounded flex items-center justify-center mr-4">
                      {lecture.thumbnail ? <img src={lecture.thumbnail} className="h-full w-full object-cover rounded" alt="" /> : <Video className="h-5 w-5 text-blue-300" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{lecture.title}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        {getTypeIcon(lecture.type)} <span className="ml-1 capitalize">{lecture.type} • {lecture.durationFormatted}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{lecture.sectionTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  <div className="flex items-center"><Users className="w-3 h-3 mr-1 text-gray-400" />{lecture.views}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/educator/courses/${courseId}/lectures/view/${lecture.id}`)} className="p-1 px-2 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium">View</button>
                    <button onClick={() => navigate(`/educator/courses/${courseId}/lectures/edit/${lecture.id}`)} className="p-1 px-2 text-gray-600 hover:bg-gray-200 rounded text-xs font-medium">Edit</button>
                    <button onClick={() => onDelete(lecture.id)} className="p-1 px-2 text-red-600 hover:bg-red-50 rounded text-xs font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SectionsTabContent = ({ 
  sections, searchTerm, setSearchTerm, onAddLecture, onEditSection, onDeleteSection, 
  onEditLecture, onDeleteLecture, onAddSection, expandedSections, toggleSection, getTypeIcon 
}) => {
  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sections..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={onAddSection}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" /> New Section
        </button>
      </div>

      {filteredSections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sections found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((section, idx) => (
            <motion.div
              key={section._id}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${expandedSections[section._id] ? 'bg-gray-50/50' : ''}`} onClick={() => toggleSection(section._id)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${expandedSections[section._id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{section.title}</h3>
                    <p className="text-xs text-gray-500">{section.lessons?.length || 0} Lectures</p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onAddLecture(section._id, section.title)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Add lecture"><Plus className="w-5 h-5" /></button>
                  <button onClick={() => onEditSection(section._id)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => onDeleteSection(section._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => toggleSection(section._id)} className="p-2 text-gray-400 hover:text-gray-600 transition-transform">
                    {expandedSections[section._id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections[section._id] && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
                    <div className="p-4 bg-white space-y-2">
                       {section.lessons?.map((lecture) => (
                        <div key={lecture._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(lecture.videoUrl ? 'video' : (lecture.pdfUrl ? 'pdf' : 'text'))}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{lecture.title}</p>
                              <div className="flex items-center text-[10px] text-gray-400">
                                <Clock className="w-3 h-3 mr-1" /> {formatDurationSeconds(lecture.duration || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => onEditLecture(lecture._id)} className="p-1 px-2 text-xs text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors">Edit</button>
                            <button onClick={() => onDeleteLecture(lecture._id)} className="p-1 px-2 text-xs text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors">Delete</button>
                          </div>
                        </div>
                      ))}
                      {!section.lessons?.length && (
                        <div className="text-center py-6 text-gray-400 text-xs italic">
                          No lectures in this section yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurriculumSection;
