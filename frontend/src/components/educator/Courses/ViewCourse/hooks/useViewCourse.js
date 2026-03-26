import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import courseService from '../../../../../services/courseService';

export const useViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getCourseById(courseId);
      if (response.success) {
        setCourse(response.course);
      } else {
        setError(response.message || 'Failed to load course details');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse, location]);

  const handleRetry = () => fetchCourse();
  
  const handleEditCourse = () => {
    if (course?._id) {
      navigate(`/educator/courses/edit/${course._id}`);
    }
  };

  return {
    course,
    loading,
    error,
    activeTab,
    setActiveTab,
    handleRetry,
    handleEditCourse,
    courseId,
    navigate
  };
};
