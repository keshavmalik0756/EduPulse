import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Upload, FileText, X, Loader2, CheckCircle2, BookOpen, AlertCircle, Book
} from "lucide-react";
import { toast } from "react-hot-toast";
import noteService from "../../../services/noteService";

// ===========================================================
// 📤 CREATE NOTES COMPONENT (Lecture & Course Notes)
// ===========================================================
const CreateNotes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get lectureId, courseId, noteType, lectureTitle, and courseTitle from location state
  const { lectureId, courseId, noteType, lectureTitle, courseTitle } = location.state || {};
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Determine if this is for course notes or lecture notes
  const isCourseNote = noteType === 'course' && courseId;
  const contextTitle = isCourseNote ? (courseTitle || 'Untitled Course') : (lectureTitle || 'Untitled Lecture');
  const contextType = isCourseNote ? 'Course' : 'Lecture';

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      toast.error("Only PDF or DOCX allowed.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB).");
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  // Create lecture note
  const createLectureNote = async () => {
    if (!lectureId) return toast.error("Lecture ID is required to create a lecture note.");
    
    const data = new FormData();
    data.append("file", file);
    data.append("title", title);
    data.append("content", `Uploaded ${file.type.includes("pdf") ? "PDF" : "DOCX"} summary: ${title}`);
    data.append("lectureId", lectureId);
    data.append("isPublic", isPublic);
    data.append("tags", "lecture,note");
    
    const res = await noteService.createNote(data);
    if (res.success) {
      toast.success("Lecture note uploaded successfully!");
      // Navigate back to the lecture view page
      navigate(`/educator/lectures/view/${lectureId}`);
    }
    return res;
  };

  // Create course note
  const createCourseNote = async () => {
    if (!courseId) return toast.error("Course ID is required to create a course note.");
    
    const data = new FormData();
    data.append("file", file);
    data.append("title", title);
    data.append("content", `Uploaded ${file.type.includes("pdf") ? "PDF" : "DOCX"} summary: ${title}`);
    data.append("courseId", courseId);
    data.append("isPublic", isPublic);
    data.append("tags", "course,note");
    
    const res = await noteService.createNote(data);
    if (res.success) {
      toast.success("Course note uploaded successfully!");
      // Navigate back to the course view page
      navigate(`/educator/courses/view/${courseId}`);
    }
    return res;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || !title) return toast.error("File and title required.");
    
    setIsUploading(true);
    try {
      if (noteType === 'course' && courseId) {
        await createCourseNote();
      } else if ((noteType === 'lecture' || !noteType) && lectureId) {
        await createLectureNote();
      } else {
        toast.error("Invalid note type or missing context.");
      }
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back based on note type
    if (noteType === 'course' && courseId) {
      navigate(`/educator/courses/view/${courseId}`);
    } else if ((noteType === 'lecture' || !noteType) && lectureId) {
      navigate(`/educator/lectures/view/${lectureId}`);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  // Show error if no valid context
  if (!lectureId && !courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Context Required</h2>
          <p className="text-gray-600 mb-6">
            This form is for creating notes only. Please access this form from a specific lecture or course.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {isCourseNote ? (
                    <Book className="w-6 h-6 text-blue-600" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create {contextType} Note
                  </h1>
                  <p className="text-gray-600">
                    Upload a PDF or DOCX file for this {contextType.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-blue-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  id="file-input"
                  onChange={handleFile}
                />
                <label htmlFor="file-input" className="text-center cursor-pointer w-full">
                  <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {file ? `File Ready: ${file.name}` : "Upload PDF or DOCX"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {file ? "Click to change file" : "Click or drag to upload"}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Max file size: 10MB</p>
                    <p className="mt-1">
                      For {contextType.toLowerCase()}: {contextTitle}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Note Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  placeholder={`e.g., ${contextTitle} Summary`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Visibility
                </label>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                      />
                      <div className={`block w-14 h-8 rounded-full ${isPublic ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {isPublic ? 'Public' : 'Private'}
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 ml-2">
                    {isPublic 
                      ? 'Visible to all enrolled students' 
                      : 'Only visible to you'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!file || isUploading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg shadow-md ${
                    isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Create {contextType} Note
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateNotes;