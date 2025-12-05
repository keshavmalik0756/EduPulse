import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    BookOpen,
    Award,
    TrendingUp,
    Play,
    Star
} from "lucide-react";

function CardPage() {
    const navigate = useNavigate();
    const courseData = useSelector(state => state?.course?.courseData);

    // Memoize the course data to prevent unnecessary re-renders
    const memoizedCourseData = useMemo(() => {
        return Array.isArray(courseData) ? courseData : [];
    }, [courseData]);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Fetch courses from API
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                // Try to get published courses from API
                const apiUrl = `${import.meta.env.VITE_API_URL}/courses/getpublished`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response:', data); // Debug log
                    
                    // Handle different response structures
                    let coursesData = [];
                    
                    // Check if it's a cached response (nested structure)
                    if (data?.data && data?.fromCache) {
                        console.log('Cached response detected');
                        // Extract courses from nested cached response
                        if (data.data?.courses && Array.isArray(data.data.courses)) {
                            coursesData = data.data.courses;
                        } else if (Array.isArray(data.data)) {
                            coursesData = data.data;
                        }
                    } 
                    // Check if it's a direct response with courses property
                    else if (data?.courses && Array.isArray(data.courses)) {
                        coursesData = data.courses;
                    }
                    // Check if it's a direct response with data property
                    else if (data?.data && Array.isArray(data.data)) {
                        coursesData = data.data;
                    }
                    // Check if response.data itself is an array
                    else if (Array.isArray(data)) {
                        coursesData = data;
                    }
                    
                    console.log('Extracted courses:', coursesData); // Debug log
                    setCourses(coursesData);
                    setLoading(false);
                    return; // Exit early if API succeeds
                }
                throw new Error('API response was not successful');
            } catch (error) {
                console.error('Error fetching courses from API:', error);

                // Fallback to Redux data if API fails
                if (memoizedCourseData.length > 0) {
                    setCourses(memoizedCourseData);
                } else {
                    setCourses([]); // Set empty array if no data
                }
                setLoading(false);
            }
        };

        fetchCourses();
    }, []); // Remove courseData dependency to prevent infinite loop

    // Handle Redux data updates separately
    useEffect(() => {
        if (courses.length === 0 && memoizedCourseData.length > 0) {
            setCourses(memoizedCourseData);
            setLoading(false);
        }
    }, [memoizedCourseData, courses.length]);

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const formatPrice = (price, discount = 0) => {
        if (!price || price === 0) return "Free";
        const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
        return `₹${Math.round(finalPrice)}`;
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const CourseCard = ({ course, index }) => {
        const isHovered = hoveredCard === course._id;

        return (
            <div
                key={course._id || index}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 ${isHovered ? 'scale-[1.02]' : ''
                    }`}
                onMouseEnter={() => setHoveredCard(course._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCourseClick(course._id)}
            >
                {/* Course Image */}
                <div className="relative overflow-hidden h-48">
                    <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Course Level Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                            (course.level || '').toLowerCase() === 'beginner' ? 'bg-green-500/90 text-white' :
                            (course.level || '').toLowerCase() === 'intermediate' ? 'bg-yellow-500/90 text-white' :
                            (course.level || '').toLowerCase() === 'advanced' ? 'bg-red-500/90 text-white' :
                            'bg-blue-500/90 text-white'
                        }`}>
                            {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase() : 'All Levels'}
                        </span>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="bg-white/90 text-blue-600 p-4 rounded-full hover:bg-white transition-colors shadow-lg">
                            <Play className="w-6 h-6 ml-1" />
                        </button>
                    </div>

                    {/* Featured Badge */}
                    {course.isFeatured && (
                        <div className="absolute bottom-3 left-3">
                            <div className="flex items-center bg-yellow-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                <Award className="w-3 h-3 mr-1" />
                                Featured
                            </div>
                        </div>
                    )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                    {/* Category */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            {course.category}
                        </span>
                        {course.isPublished && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                Published
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {course.description || course.subTitle || course.summary}
                    </p>

                    {/* Course Stats - Duration, Rating and Lessons */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{course.durationWithUnit || formatDuration(course.totalDurationMinutes || course.duration)}</span>
                            </div>
                            <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                <span>{(course.averageRating || course.rating || 0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                <span>{course.totalLectures || course.lessons || 0} lessons</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Only */}
                    <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(course.price || course.finalPrice, course.discount || course.discountPercentage)}
                                </span>
                                {(course.discount > 0 || course.discountPercentage > 0) && course.price > 0 && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ₹{course.price || course.originalPrice}
                                    </span>
                                )}
                            </div>
                            {(course.discount > 0 || course.discountPercentage > 0) && course.price > 0 && (
                                <span className="text-sm text-green-600 font-medium">
                                    {course.discount || course.discountPercentage}% off
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading amazing courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section - Simplified */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-black">
                            Our Popular Courses
                        </h1>
                    </div>
                    <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
                        Explore top-rated courses designed to boost your skills, enhance careers, and unlock opportunities in tech, AI, business, and beyond.
                    </p>
                </div>

                {/* Courses Grid */}
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {courses.map((course, index) => (
                            <CourseCard key={course._id || index} course={course} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                            <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No courses found</h3>
                            <p className="text-gray-500 mb-6">
                                No courses are available at the moment. Check back soon!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardPage;