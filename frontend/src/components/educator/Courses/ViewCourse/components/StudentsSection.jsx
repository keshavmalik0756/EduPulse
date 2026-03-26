import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, RefreshCw, User, Eye, Send, Download, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import courseService from '../../../../../services/courseService';

const StudentsSection = ({ course }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const courseId = course?._id;

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const response = await courseService.getEnrolledStudents(courseId);
      const studentsData = response?.data?.students || response?.students || response?.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("❌ Error fetching enrolled students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredAndSortedStudents = useMemo(() => {
    let result = Array.isArray(students) ? [...students] : [];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query));
    }
    if (filter === "high-progress") result = result.filter(s => (s.progress ?? 0) >= 70);
    else if (filter === "low-progress") result = result.filter(s => (s.progress ?? 0) <= 30);

    switch (sortOrder) {
      case "name": result.sort((a, b) => a.name?.localeCompare(b.name)); break;
      case "progress": result.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)); break;
      case "date": result.sort((a, b) => new Date(b.enrolledDate) - new Date(a.enrolledDate)); break;
      default: break;
    }
    return result;
  }, [students, searchQuery, filter, sortOrder]);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Progress", "Join Date"];
    const rows = students.map(s => [s.name || "N/A", s.email || "N/A", `${s.progress || 0}%`, s.enrolledDate ? new Date(s.enrolledDate).toLocaleDateString() : "N/A"]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `students_${course?._id || 'course'}.csv`;
    link.click();
    toast.success("📁 Students list exported to CSV!");
  };

  const getProgressColor = (p = 0) => {
    if (p >= 80) return "bg-green-600";
    if (p >= 50) return "bg-blue-600";
    if (p >= 30) return "bg-yellow-500";
    return "bg-red-600";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Enrolled Students <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{students.length}</span></h2>
        <div className="flex items-center text-sm text-gray-500 gap-3">
          <span>{course.totalEnrolled?.toLocaleString() || 0} total enrollments</span>
          {lastRefreshed && <span className="text-xs text-gray-400">Last updated: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex gap-3">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg"><option value="all">All Students</option><option value="high-progress">High Progress (70%+)</option><option value="low-progress">Low Progress (≤30%)</option></select>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg"><option value="name">Sort by Name</option><option value="progress">Sort by Progress</option><option value="date">Sort by Enroll Date</option></select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStudents} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => toast.success(`✉️ Message all features coming soon!`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2"><Send className="w-4 h-4" /> Message All</button>
        </div>
      </div>

      {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">{s.name?.charAt(0) || 'U'}</div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{s.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{s.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full ${getProgressColor(s.progress)} transition-all duration-500`} style={{ width: `${s.progress || 0}%` }}></div></div>
                      <span className="text-xs font-bold">{s.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600 font-mono">{s.enrolledDate ? new Date(s.enrolledDate).toLocaleDateString() : "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => toast(`Viewing ${s.name} profile`, { icon: '🧑‍🎓' })} className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => toast(`Message composer for ${s.name} opened`, { icon: '✉️' })} className="text-gray-400 hover:text-gray-600"><Send className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredAndSortedStudents.length && <div className="py-10 text-center text-gray-400 italic font-medium">No students match your criteria</div>}
        </div>
      )}
    </motion.div>
  );
};

export default StudentsSection;
