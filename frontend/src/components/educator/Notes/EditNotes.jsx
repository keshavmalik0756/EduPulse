import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit3,
  Tag,
  Lock,
  Unlock,
  Loader2,
  Sparkles,
  Book,
  BookOpen
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import noteService from "../../../services/noteService";

// ===============================================================
// 🎓 EDUCATOR NOTE EDITOR – EduPulse (2025)
// Polished for professional educator experience.
// Supports both Lecture Notes and Course Notes editing.
// ===============================================================
const EditNotes = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [note, setNote] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    isPublic: false,
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================================================
  // 🧠 FETCH NOTE
  // ===============================================================
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await noteService.getNoteById(noteId);
        if (res?.success && res?.data) {
          setNote(res.data);
          setForm({
            title: res.data.title || "",
            description: res.data.description || "",
            content: res.data.content || "",
            isPublic: !!res.data.isPublic,
            tags: Array.isArray(res.data.tags)
              ? res.data.tags.join(", ")
              : "",
          });
        } else {
          throw new Error(res?.message || "Note not found");
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        toast.error(err.message || "Failed to load note");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (noteId) fetchNote();
  }, [noteId, navigate]);

  // ===============================================================
  // 🏷️ FORM HANDLERS
  // ===============================================================
  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const tagsArray = useMemo(() => {
    return form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);
  }, [form.tags]);

  // ===============================================================
  // 💾 SAVE NOTE
  // ===============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, tags: tagsArray };
      const res = await noteService.updateNote(noteId, payload);
      if (res?.success) {
        toast.success("✅ Note updated successfully!");
        // Navigate back to the appropriate view based on note type
        if (from === 'lecture') {
          // Came from lecture view
          navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
        } else if (note?.course && !note?.lecture) {
          // This is a course note
          navigate(`/educator/courses/view/${note.course._id || note.course}`);
        } else if (note?.lecture) {
          // This is a lecture note
          navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
        } else {
          navigate(-1);
        }
      } else throw new Error(res?.message || "Update failed");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ===============================================================
  // 🗑️ DELETE NOTE
  // ===============================================================
  const handleDelete = async () => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const res = await noteService.deleteNote(noteId);
      if (res?.success) {
        toast.success("🗑️ Note deleted");
        
        // Removed RecentActivity tracking
        
        // Navigate back to the appropriate view based on note type
        if (from === 'lecture') {
          // Came from lecture view
          navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
        } else if (note?.course && !note?.lecture) {
          // This is a course note
          navigate(`/educator/courses/view/${note.course._id || note.course}`);
        } else if (note?.lecture) {
          // This is a lecture note
          navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
        } else {
          navigate(-1);
        }
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ===============================================================
  // 🎨 LOADING STATE
  // ===============================================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-500">Loading your note...</p>
      </div>
    );
  }

  // ===============================================================
  // 🧩 MAIN UI
  // ===============================================================
  // Determine note type for display
  const isCourseNote = note?.course && !note?.lecture;
  const noteType = isCourseNote ? "Course" : "Lecture";
  const contextTitle = isCourseNote 
    ? (note.course?.title || 'Untitled Course')
    : (note.lecture?.title || 'Untitled Lecture');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 sm:p-8 bg-white/80 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl"
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            // Navigate back to the appropriate view based on note type
            if (from === 'lecture') {
              // Came from lecture view
              navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
            } else if (isCourseNote) {
              navigate(`/educator/courses/view/${note.course._id || note.course}`);
            } else if (note?.lecture) {
              navigate(`/educator/lectures/view/${note.lecture._id || note.lecture}`);
            } else {
              navigate(-1);
            }
          }}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back to {noteType}</span>
        </button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDelete}
            className="flex items-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* NOTE HEADER INFO */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2">
          {isCourseNote ? (
            <Book className="w-5 h-5 text-blue-600" />
          ) : (
            <BookOpen className="w-5 h-5 text-blue-600" />
          )}
          <h2 className="text-lg font-semibold text-gray-800">
            Editing {noteType} Note
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {noteType}: {contextTitle}
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              placeholder={`Enter ${noteType.toLowerCase()} note title`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={`Enter a brief description of this ${noteType.toLowerCase()} note...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Note Content
            </label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder={`Write or paste your ${noteType.toLowerCase()} note content here...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <Tag className="w-4 h-4 mr-1 text-gray-500" /> Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder={`e.g., ${noteType.toLowerCase()}1, summary, important`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Public toggle */}
          <div className="flex items-center gap-2 border-t pt-4 mt-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                handleChange("isPublic", !form.isPublic)
              }
              className={`p-2 rounded-full border transition ${
                form.isPublic
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-gray-50 border-gray-300 text-gray-500"
              }`}
              title={form.isPublic ? "Public Note" : "Private Note"}
            >
              {form.isPublic ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </motion.button>
            <span className="text-sm text-gray-600 font-medium">
              {form.isPublic
                ? `This ${noteType.toLowerCase()} note is public to enrolled students`
                : `This ${noteType.toLowerCase()} note is private to you`}
            </span>
          </div>
        </div>

        {/* Floating Save Bar */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* LAST UPDATED */}
      {note?.updatedAt && (
        <p className="text-xs text-gray-400 mt-6 text-right">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </p>
      )}

      {/* Visual flair */}
      <motion.div
        className="absolute top-0 right-0 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default EditNotes;