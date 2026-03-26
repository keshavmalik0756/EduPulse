import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, StickyNote, Eye, Edit, Trash2, BookOpen, Tag, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import noteService from '../../../../../services/noteService';

const NotesSection = ({ course }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, lecture, course
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!course?._id) return;
      try {
        setLoading(true);
        const response = await noteService.getNotesByCourse(course._id);
        if (response.success) {
          setNotes(response.notes || []);
        } else {
          setNotes([]);
          toast.error(response.message || "Failed to fetch notes.");
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error(error.message || "Error loading notes.");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [course?._id]);

  const filteredNotes = useMemo(() => {
    let result = notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (filterBy !== 'all') {
      if (filterBy === 'lecture') {
        result = result.filter(note => note.lecture);
      } else if (filterBy === 'course') {
        result = result.filter(note => !note.lecture);
      }
    }

    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'alphabetical': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return result;
  }, [notes, searchTerm, filterBy, sortBy]);

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const res = await noteService.deleteNote(noteId);
      if (res.success) {
        toast.success("Note deleted successfully");
        setNotes(prev => prev.filter(n => n._id !== noteId));
      } else {
        toast.error(res.message || "Failed to delete note");
      }
    } catch (error) {
      toast.error(error.message || "Error deleting note");
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
          <h2 className="text-2xl font-bold text-gray-900">Course Notes</h2>
          <p className="text-sm text-gray-600 mt-1">{notes.length} notes • Organized by sections</p>
        </div>
        
        <button
          onClick={() => navigate('/educator/notes/create', { state: { courseId: course._id, courseTitle: course.title, noteType: 'course' } })}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-teal-700 flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Note
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="px-2 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="all">All Notes</option>
            <option value="lecture">Lecture Notes</option>
            <option value="course">Course Notes</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <StickyNote className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No notes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard 
              key={note._id} 
              note={note} 
              onView={() => navigate(`/educator/notes/view/${note._id}`, { state: { from: 'course' } })}
              onEdit={() => navigate(`/educator/notes/edit/${note._id}`, { state: { from: 'course' } })}
              onDelete={() => handleDeleteNote(note._id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const NoteCard = ({ note, onView, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
      <div className="flex space-x-1">
        <button onClick={onView} className="p-1 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
    <div className="space-y-1">
      <div className="flex items-center text-xs text-gray-500">
        <BookOpen className="w-3 h-3 mr-1" />
        <span>{note.lecture ? `Lecture: ${note.lecture.title}` : 'Course Note'}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {note.tags?.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

export default NotesSection;
