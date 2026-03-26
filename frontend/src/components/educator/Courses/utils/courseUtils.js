/**
 * 🛠️ Course Utility Functions
 * Helper functions for data transformation and formatting in the Courses dashboard.
 */

/**
 * Transforms backend course data into the format expected by the frontend.
 * @param {Array} coursesData - Raw course data from the API
 * @returns {Array} - Transformed course objects
 */
export const transformCourses = (coursesData = []) => {
  if (!Array.isArray(coursesData)) {
    if (coursesData && typeof coursesData === 'object' && coursesData.courses && Array.isArray(coursesData.courses)) {
      coursesData = coursesData.courses;
    } else if (coursesData && typeof coursesData === 'object' && coursesData.data && Array.isArray(coursesData.data)) {
      coursesData = coursesData.data;
    } else {
      console.warn('Unexpected courses data format:', coursesData);
      return [];
    }
  }
  
  return coursesData.map(course => {
    if (!course || typeof course !== 'object') {
      console.warn('Invalid course data:', course);
      return {};
    }
    
    return {
      id: course._id || course.id || '',
      title: course.title || 'Untitled Course',
      subTitle: course.subTitle || '',
      description: course.description || '',
      students: course.totalEnrolled || 0,
      status: course.isPublished ? 'published' : 'draft',
      lastUpdated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown',
      lastUpdatedRaw: course.updatedAt || new Date().toISOString(),
      thumbnail: course.thumbnail || '',
      banner: course.banner || '',
      previewVideo: course.previewVideo || '',
      price: course.price || 0,
      finalPrice: course.finalPrice !== undefined ? course.finalPrice : (course.price || 0),
      originalPrice: course.originalPrice || course.price || 0,
      discount: course.discount || 0,
      discountPercentage: course.discountPercentage || course.discount || 0,
      savings: course.savings || (course.discount > 0 ? (course.price || 0) - (course.finalPrice || 0) : 0),
      rating: course.averageRating || 0,
      reviewsCount: course.reviewsCount || 0,
      category: course.category || 'Uncategorized',
      subCategory: course.subCategory || '',
      tags: Array.isArray(course.tags) ? course.tags : [],
      duration: course.durationWithUnit ?? course.durationFormatted ?? `${course.totalDurationMinutes || 0} minutes`,
      totalDurationMinutes: course.totalDurationMinutes || 0,
      level: course.level || 'beginner',
      views: course.views || 0,
      completionRate: course.completionRate || 0,
      revenue: course.revenue || 0,
      modules: (course.sections?.length || course.totalSections || 0),
      lectures: course.totalLectures || (Array.isArray(course.lectures) ? course.lectures.length : 0) || 0,
      sections: Array.isArray(course.sections) ? course.sections : [],
      quizzes: 0,
      assignments: 0,
      certificate: course.hasCertificate || false,
      hasCertificate: course.hasCertificate || false,
      publishedDate: course.publishedDate ? new Date(course.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : null,
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt || new Date().toISOString(),
      instructor: (course.creator && course.creator.name) || 'Unknown Instructor',
      creatorId: (course.creator && course.creator._id) || (course.creator || ''),
      language: course.language || 'English',
      isFeatured: course.isFeatured || false,
      enrollmentStatus: course.enrollmentStatus || 'open',
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
      learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
      requirements: Array.isArray(course.requirements) ? course.requirements : [],
      slug: course.slug || '',
      metaTitle: course.metaTitle || '',
      metaDescription: course.metaDescription || '',
      notesCount: course.notesCount || 0
    };
  });
};

/**
 * Formats a number as INR currency.
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats a date string.
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not published';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a percentage value.
 * @param {number} value 
 * @returns {string}
 */
export const formatPercentage = (value) => {
  return `${value}%`;
};

/**
 * Gets the final price of a course with fallback logic.
 * @param {Object} course 
 * @returns {number}
 */
export const getFinalPrice = (course) => {
  if (course.finalPrice !== undefined) {
    return course.finalPrice;
  }
  if (course.discountPercentage > 0 && course.price > 0) {
    return Math.round(course.price - (course.price * course.discountPercentage) / 100);
  }
  return course.price || 0;
};

/**
 * Formats a duration in minutes/hours.
 * @param {number|string} duration 
 * @returns {string}
 */
export const formatDuration = (duration) => {
  if (typeof duration === 'string' && duration.includes(' ')) return duration;
  const mins = parseInt(duration);
  if (isNaN(mins)) return '0 min';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

/**
 * Gets a status badge color and text.
 */
export const getStatusBadge = (status) => {
  const styles = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-800"
  };
  return {
    text: status === 'published' ? 'Live' : status.charAt(0).toUpperCase() + status.slice(1),
    className: styles[status] || styles.draft
  };
};

/**
 * Gets a difficulty level badge color.
 */
export const getLevelBadge = (level) => {
  const styles = {
    beginner: "bg-blue-100 text-blue-800",
    intermediate: "bg-purple-100 text-purple-800",
    advanced: "bg-red-100 text-red-800",
    "all-levels": "bg-indigo-100 text-indigo-800"
  };
  const normalized = (level || 'beginner').toLowerCase();
  return {
    text: normalized.charAt(0).toUpperCase() + normalized.slice(1).replace('-', ' '),
    className: styles[normalized] || styles.beginner
  };
};

/**
 * Gets an enrollment status badge.
 */
export const getEnrollmentStatusBadge = (status) => {
  const styles = {
    open: "bg-emerald-100 text-emerald-800",
    closed: "bg-rose-100 text-rose-800",
    "invite-only": "bg-amber-100 text-amber-800"
  };
  return {
    text: (status || 'open').charAt(0).toUpperCase() + (status || 'open').slice(1).replace('-', ' '),
    className: styles[status] || styles.open
  };
};
