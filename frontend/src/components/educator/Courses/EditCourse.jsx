import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, EyeOff, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import courseService from '../../../services/courseService';
import CreateCourseForm from './CreateCourseForm/index';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourseById(id);
        if (response.success && response.course) {
          const course = response.course;
          
          // Transform duration back to unit
          let totalDuration = course.totalDurationMinutes || 0;
          let durationUnit = 'minutes';
          
          if (totalDuration > 0) {
            if (totalDuration % (30 * 24 * 60) === 0) {
              totalDuration /= (30 * 24 * 60);
              durationUnit = 'months';
            } else if (totalDuration % (7 * 24 * 60) === 0) {
              totalDuration /= (7 * 24 * 60);
              durationUnit = 'weeks';
            } else if (totalDuration % 60 === 0) {
              totalDuration /= 60;
              durationUnit = 'hours';
            }
          }

          setCourseData({
            ...course,
            totalDuration,
            durationUnit,
            thumbnailPreview: course.thumbnail || null,
            bannerPreview: course.banner || null,
            thumbnail: null,
            banner: null,
            // Ensure arrays
            prerequisites: course.prerequisites?.length ? course.prerequisites : [''],
            learningOutcomes: course.learningOutcomes?.length ? course.learningOutcomes : [''],
            requirements: course.requirements?.length ? course.requirements : [''],
            tags: course.tags || []
          });
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  const handlePublishToggle = async () => {
    if (courseData.isPublished) {
      setShowPublishModal(true);
      return;
    }
    await performPublishToggle();
  };

  const performPublishToggle = async () => {
    setPublishing(true);
    setShowPublishModal(false);
    try {
      const response = await courseService.togglePublishStatus(courseData._id);
      if (response.success) {
        setCourseData(prev => ({
          ...prev,
          isPublished: response.course.isPublished,
          publishedDate: response.course.publishedDate
        }));
        toast.success(response.course.isPublished ? 'Course published! 🚀' : 'Course unpublished 🛑');
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await courseService.deleteCourse(courseData._id);
      if (response.success) {
        toast.success('Course deleted');
        navigate('/educator/courses');
      }
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      
      {/* Modals */}
      {showDeleteModal && (
        <Modal 
          title="Delete Course" 
          desc="This action is permanent. All course content and student progress will be wiped." 
          confirmText="Yes, Delete"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={deleting}
          variant="danger"
        />
      )}
      
      {showPublishModal && (
        <Modal 
          title="Unpublish Course" 
          desc="Students won't be able to find or enroll in this course anymore." 
          confirmText="Yes, Unpublish"
          onCancel={() => setShowPublishModal(false)}
          onConfirm={performPublishToggle}
          loading={publishing}
          variant="warning"
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/educator/courses')}
            className="group flex items-center text-gray-500 hover:text-emerald-600 transition-colors text-sm font-bold mb-4 uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 lg:gap-4">
            Edit Course
            <span className={`text-[10px] lg:text-xs px-3 py-1 rounded-full border ${
              courseData.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {courseData.isPublished ? 'Live' : 'Draft'}
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 lg:py-3 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all ${
              courseData.isPublished 
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            } disabled:opacity-50`}
          >
            {courseData.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {courseData.isPublished ? 'Unpublish' : 'Publish Now'}
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 lg:py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Shared Modular Wizard */}
      <CreateCourseForm 
        mode="edit" 
        courseId={id} 
        initialData={courseData} 
      />

    </div>
  );
};

const Modal = ({ title, desc, confirmText, onCancel, onConfirm, loading, variant }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6">
      <div className="flex items-center gap-4 text-red-600">
        <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-gray-900">{title}</h3>
      </div>
      
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
      
      <div className="flex gap-4 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all"
        >
          Nevermind
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default EditCourse;
 EditCourse;