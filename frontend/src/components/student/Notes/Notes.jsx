import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Search, FileText, Loader2, Tag
} from "lucide-react";
import { toast } from "react-hot-toast";
import noteService from "../../../services/noteService";

// ===========================================================
// 🎓 STUDENT NOTES COMPONENT (EduPulse – 2025 Edition)
// ===========================================================
const Notes = ({ lectureId, courseId, lectureTitle, user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch Notes - Student specific implementation
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      
      // If lectureId is provided, fetch lecture notes
      if (lectureId) {
        // Student can only access notes for their enrolled courses/lectures
        res = await noteService.getNotesByLecture(lectureId);
      } 
      // If courseId is provided (and no lectureId), fetch course notes
      else if (courseId) {
        res = await noteService.getNotesByCourse(courseId);
      } 
      // If neither is provided, return early
      else {
        setNotes([]);
        setLoading(false);
        return;
      }
      
      if (res.success) {
        // Filter to only show notes accessible to students (all notes in lecture are accessible to enrolled students)
        setNotes(res.notes || []);
      }
      else toast.error(res.message || "Failed to fetch notes.");
    } catch (error) {
      console.error(error);
      toast.error("Error loading notes.");
    } finally {
      setLoading(false);
    }
  }, [lectureId, courseId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ✅ Filter notes dynamically
  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

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
          <h2 className="text-2xl font-bold text-gray-900">
            {lectureId ? "My Lecture Notes" : "Course Notes"}
          </h2>
          <motion.span
            className="text-sm bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full ml-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {notes.length} notes
          </motion.span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search my notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState lectureId={lectureId} />
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
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600 w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg line-clamp-1">
                    {note.title}
                  </h4>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {note.content || note.description || "No description provided"}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/student/notes/view/${note._id}`, { 
                        state: { 
                          from: lectureId ? "lecture" : "course", 
                          lectureId, 
                          courseId 
                        } 
                      })}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium"
                    >
                      View Note
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
const EmptyState = ({ lectureId }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-dashed border-gray-300">
    <motion.div
      className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center rounded-full mb-4"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
    >
      <BookOpen className="w-8 h-8 text-white" />
    </motion.div>
    <h3 className="font-bold text-xl text-gray-800 mb-2">No Notes Available</h3>
    <p className="text-gray-600 text-center max-w-md px-4">
      {lectureId 
        ? "You don't have any notes for this lecture yet. Notes from your instructor will appear here when available."
        : "No course notes available yet. Your instructor will add notes here when available."}
    </p>
  </div>
);

export default Notes;