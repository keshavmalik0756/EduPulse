import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, Eye, Lock, Tag, Clock,
  Upload, FileText, X, Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import noteService from "../../../services/noteService";

// ===========================================================
// 🎓 EDUCATOR NOTES COMPONENT (EduPulse – 2025 Edition)
// ===========================================================
const Notes = ({ lectureId, courseId, lectureTitle, user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch Notes
  const fetchNotes = useCallback(async () => {
    if (!lectureId) return;
    try {
      setLoading(true);
      const res = await noteService.getNotesByLecture(lectureId);
      if (res.success) setNotes(res.notes || []);
      else toast.error(res.message || "Failed to fetch notes.");
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error(error.message || "Error loading notes.");
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => { 
    fetchNotes(); 
  }, [fetchNotes]);

  // ✅ Filter notes dynamically
  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  // ✅ Delete Note
  const handleDelete = async (id) => {
    // Find the note being deleted to pass to tracking
    const noteToDelete = notes.find(n => n._id === id);
    
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const res = await noteService.deleteNote(id);
      if (res.success) {
        toast.success("Note deleted.");
        setNotes(prev => prev.filter(n => n._id !== id));
        
        // Removed RecentActivity tracking
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  // ✅ UI format date
  const formatDate = (d) => new Date(d).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short"
  });

  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Lecture Notes</h2>
          <motion.span
            className="text-sm bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full ml-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {notes.length} total
          </motion.span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/educator/notes/create', { state: { lectureId, courseId, lectureTitle, noteType: 'lecture' } })}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700"
          >
            <Upload className="w-4 h-4" />
            Upload Note
          </motion.button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState onUpload={() => navigate('/educator/notes/create', { state: { lectureId, courseId, lectureTitle, noteType: 'lecture' } })} />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-red-500 w-5 h-5" />
                    <h4 className="font-semibold text-gray-800 text-base line-clamp-1">
                      {note.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {note.isPublic ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Private</span>
                      </>
                    )}
                  </div>
                </div>
 
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {note.content || note.description || "No description provided"}
                </p>

                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(note.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {note.tags?.length || 0} tags
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate(`/educator/notes/view/${note._id}`, { state: { from: 'lecture' } })}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate(`/educator/notes/edit/${note._id}`, { state: { from: 'lecture' } })}
                      className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(note._id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// ===========================================================
// 🪶 EMPTY STATE COMPONENT
// ===========================================================
const EmptyState = ({ onUpload }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
    <motion.div
      className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full mb-4"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
    >
      <BookOpen className="w-8 h-8 text-blue-600" />
    </motion.div>
    <h3 className="font-semibold text-lg text-gray-800 mb-2">No Notes Yet</h3>
    <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">
      Upload your first lecture note or PDF summary.
    </p>
    <motion.button
      onClick={onUpload}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 font-semibold"
    >
      <Plus className="w-4 h-4 inline-block mr-2" />
      Upload Note
    </motion.button>
  </div>
);

export default Notes;