import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize,
  ChevronLeft, ChevronRight, BookOpen, FileText, 
  Download, Share2, Flag, CheckCircle, Clock,
  AlertCircle, Loader, Eye, Users, Settings, SkipBack, SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import lectureService from '../../../services/lectureService';
import courseService from '../../../services/courseService';
import forward from '../../../assets/forward.svg';
import backward from '../../../assets/backward.svg';
import Notes from '../Notes/Notes';


const ViewLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);
  
  const [lecture, setLecture] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Additional states
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextLecture, setNextLecture] = useState(null);
  const [prevLecture, setPrevLecture] = useState(null);

  // Fetch lecture and course data
  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        
        // Fetch lecture details
        const lectureResponse = await lectureService.getLectureById(lectureId);
        if (!lectureResponse.success) {
          throw new Error(lectureResponse.message || 'Failed to fetch lecture');
        }
        
        // Set lecture data with proper null checking
        setLecture(lectureResponse.data || lectureResponse.lecture);
        
        // Safely check for completion status
        const lectureData = lectureResponse.data || lectureResponse.lecture;
        setIsCompleted(lectureData?.isCompleted || false);
        
        // Fetch course details
        if (courseId) {
          const courseResponse = await courseService.getCourseById(courseId);
          if (courseResponse.success) {
            setCourse(courseResponse.data || courseResponse.course);
            
            // Find next and previous lectures
            const courseData = courseResponse.data || courseResponse.course;
            const allLectures = courseData?.sections?.flatMap(section => section.lessons) || [];
            const currentIndex = allLectures.findIndex(l => l?._id === lectureId);
            
            if (currentIndex > 0) {
              setPrevLecture(allLectures[currentIndex - 1]);
            }
            
            if (currentIndex < allLectures.length - 1 && currentIndex >= 0) {
              setNextLecture(allLectures[currentIndex + 1]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching lecture data:', err);
        setError(err.message || 'Failed to load lecture');
        toast.error('Failed to load lecture');
      } finally {
        setLoading(false);
      }
    };
    
    if (lectureId) {
      fetchLectureData();
    }
  }, [lectureId, courseId]);

  // Video player functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressChange = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = duration * progressPercent;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(progressPercent * 100);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const toggleFullscreen = () => {
    const player = videoRef.current?.parentElement;
    if (!player) return;
    
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
        toast.error("Failed to enter fullscreen mode");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === null) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;
      
      setCurrentTime(currentTime);
      setProgress(progressPercent);
      setDuration(duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(0));
    }
  };

  const handleVideoError = (e) => {
    const mediaError = e?.target?.error;
    const code = mediaError?.code;
    const messageMap = {
      1: 'Video fetching aborted by browser.',
      2: 'Network error while fetching the video.',
      3: 'Decoding error: unsupported or corrupted video.',
      4: 'Resource not supported or not found.'
    };
    const msg = messageMap[code] || 'An unknown video error occurred.';
    console.error('Video playback error:', { code, error: mediaError, src: lecture?.videoUrl });
    toast.error(msg);
  };

  const skip = (sec) => {
    if (videoRef.current) {
      const newTime = Math.min(
        duration,
        Math.max(0, videoRef.current.currentTime + sec)
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handleUserActivity = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handlePreview = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const previewTime = duration * progressPercent;

    setPreviewTime(previewTime);
    setShowPreview(true);
  };

  const markAsCompleted = async () => {
    try {
      // Use updateLectureProgress to mark as completed (90%+ watched)
      const watchedDuration = duration * 0.95; // Mark as completed when 95% watched
      const response = await lectureService.updateLectureProgress(lectureId, watchedDuration, true);
      if (response.success) {
        setIsCompleted(true);
        toast.success('Lecture marked as completed!');
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error marking lecture as completed:', err);
      toast.error('Failed to mark lecture as completed');
    }
  };

  const saveNotes = async () => {
    try {
      // In a real app, this would save to a backend service
      localStorage.setItem(`lecture_notes_${lectureId}`, notes);
      toast.success('Notes saved successfully!');
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes');
    }
  };

  // Load saved notes on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`lecture_notes_${lectureId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [lectureId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeys = (e) => {
      // Prevent default behavior for spacebar only when not in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          handleUserActivity();
          break;
        case "ArrowRight":
          skip(10);
          handleUserActivity();
          break;
        case "ArrowLeft":
          skip(-10);
          handleUserActivity();
          break;
        case "KeyM":
          toggleMute();
          handleUserActivity();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [isPlaying]);

  // Save progress
  useEffect(() => {
    const saveProgress = () => {
      if (videoRef.current && lectureId) {
        localStorage.setItem(`lecture-${lectureId}-progress`, videoRef.current.currentTime.toString());
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("pause", saveProgress);
      video.addEventListener("timeupdate", saveProgress);
      return () => {
        video.removeEventListener("pause", saveProgress);
        video.removeEventListener("timeupdate", saveProgress);
      };
    }
  }, [lectureId]);

  // Cleanup video element on unmount to prevent aborted network requests
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          // Clear src to abort any pending fetch cleanly
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch (err) {
          // noop
        }
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Error Loading Lecture</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Lecture Not Found</h3>
          <p className="text-gray-600 mt-2">The requested lecture could not be found.</p>
          <button
            onClick={() => navigate(`/course/${courseId}/lectures`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Lectures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{lecture.title}</h1>
          {course && (
            <p className="text-gray-600">{course.title}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Video Player */}
        <div className="lg:col-span-2">
          <div 
            className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg"
            onMouseMove={handleUserActivity}
            onClick={handleUserActivity}
          >
            {/* Video Player */}
            {lecture.type === 'video' && lecture.videoUrl ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={lecture.videoUrl}
                  className="w-full aspect-video"
                  preload="metadata"
                  playsInline
                  crossOrigin="anonymous"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onProgress={handleProgress}
                  onError={handleVideoError}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    markAsCompleted();
                  }}
                />
                
                {/* Video Controls */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => skip(-10)}
                            className="text-white hover:text-gray-200 transition"
                            title="Skip backward 10 seconds"
                          >
                            <img src={backward} alt="" className="w-5 h-5" />
                          </button>
                          
                          {/* Play/Pause button between skip buttons */}
                          <button
                            onClick={togglePlay}
                            className="text-white hover:text-gray-200 transition"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6 ml-0.5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => skip(10)}
                            className="text-white hover:text-gray-200 transition"
                            title="Skip forward 10 seconds"
                          >
                            <img src={forward} alt="" className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Progress Bar with Preview - Full width with proper spacing */}
                        <div className="flex-grow mx-6">
                          <div className="relative">
                            <div
                              ref={progressRef}
                              className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer group relative"
                              onClick={handleProgressChange}
                              onMouseMove={handlePreview}
                              onMouseLeave={() => setShowPreview(false)}
                            >
                              {/* Buffered progress */}
                              <div
                                className="absolute top-0 left-0 h-full bg-gray-500/50 rounded-full"
                                style={{ width: `${(buffered / duration) * 100 || 0}%` }}
                              ></div>
                              
                              {/* Progress fill */}
                              <motion.div
                                className="h-full bg-white rounded-full relative"
                                style={{
                                  width: `${progress || 0}%`,
                                }}
                                layout
                                transition={{ ease: "easeOut", duration: 0.2 }}
                              >
                                <div className="absolute -top-1 right-0 w-3 h-3 bg-white rounded-full group-hover:scale-125 transition-transform"></div>
                              </motion.div>
                            </div>
                            
                            {/* Time Preview */}
                            <AnimatePresence>
                              {showPreview && (
                                <motion.div
                                  className="absolute bottom-4 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded"
                                  style={{ left: `${(previewTime / duration) * 100 || 0}%` }}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                >
                                  {formatTime(previewTime)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-300">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                          
                          {/* Sound feature */}
                          <div 
                            className="flex items-center"
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                          >
                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-gray-200 transition flex items-center justify-center"
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {/* Dynamic volume icon based on volume level */}
                              {isMuted || volume === 0 ? (
                                <VolumeX className="w-5 h-5" />
                              ) : volume > 0.5 ? (
                                <Volume2 className="w-5 h-5" />
                              ) : (
                                <Volume1 className="w-5 h-5" />
                              )}
                            </button>
                            
                            {/* Volume slider */}
                            <AnimatePresence>
                              {showVolumeSlider && (
                                <motion.div
                                  className="ml-2 flex items-center justify-center"
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="accent-blue-600 w-20"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {/* Settings button */}
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-1 text-white hover:bg-white/20 rounded-full"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          
                          {/* Fullscreen button */}
                          <button
                            onClick={toggleFullscreen}
                            className="p-1 text-white hover:bg-white/20 rounded-full"
                          >
                            {isFullscreen ? (
                              <Minimize className="w-5 h-5" />
                            ) : (
                              <Maximize className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Playback Speed Settings */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      className="absolute bottom-20 right-8 bg-white rounded-lg shadow-lg p-3 text-sm w-44 border border-gray-200"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gray-900 font-medium mb-2">Playback Speed</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handlePlaybackRateChange(speed)}
                          className={`block w-full text-left px-3 py-2 rounded mb-1 ${playbackRate === speed
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : lecture.type === 'pdf' && lecture.pdfUrl ? (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">PDF Document</p>
                  <a 
                    href={lecture.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">Unsupported lecture type</p>
                </div>
              </div>
            )}
          </div>

          {/* Lecture Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lecture Details</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700">{lecture.description || 'No description available.'}</p>
            </div>
            
          </div>
          
          {/* Notes Section */}
          <div className="mt-8">
            <Notes lectureId={lectureId} courseId={courseId} user={null} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lecture Navigation</h3>
            
            <div className="space-y-3">
              {prevLecture && (
                <button
                  onClick={() => navigate(`/course/${courseId}/lecture/${prevLecture._id}`)}
                  className="w-full flex items-center p-3 text-left rounded-md hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Previous</p>
                    <p className="text-gray-600 text-xs truncate">{prevLecture.title}</p>
                  </div>
                </button>
              )}
              
              {nextLecture && (
                <button
                  onClick={() => navigate(`/course/${courseId}/lecture/${nextLecture._id}`)}
                  className="w-full flex items-center justify-between p-3 text-left rounded-md hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Next</p>
                    <p className="text-gray-600 text-xs truncate">{nextLecture.title}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </button>
              )}
              
              {!nextLecture && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  You've completed all lectures in this course!
                </div>
              )}
            </div>
            
            {/* Complete Lecture List */}
            {course && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">All Lectures</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {course.lectures && course.lectures.length > 0 ? (
                    course.lectures.map((lesson, index) => {
                      // If lesson is just an ID, we need to fetch the full lecture data
                      const lessonId = lesson._id || lesson;
                      const isCurrent = lessonId === lectureId;
                      
                      return (
                        <button
                          key={lessonId}
                          onClick={() => navigate(`/course/${courseId}/lecture/${lessonId}`)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors duration-200 ${
                            isCurrent 
                              ? 'bg-blue-100 text-blue-800 font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {index + 1}
                            </span>
                            <span className="truncate">
                              {lesson.title || `Lecture ${index + 1}`}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : course.sections && course.sections.length > 0 ? (
                    course.sections.flatMap((section, sectionIndex) => 
                      section.lessons?.map((lesson, lessonIndex) => (
                        <button
                          key={lesson._id}
                          onClick={() => navigate(`/course/${courseId}/lecture/${lesson._id}`)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors duration-200 ${
                            lesson._id === lectureId 
                              ? 'bg-blue-100 text-blue-800 font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {sectionIndex + 1}.{lessonIndex + 1}
                            </span>
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        </button>
                      )) || []
                    )
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No lectures available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLecture;