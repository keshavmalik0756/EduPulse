import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  ChevronLeft,
  SkipBack,
  SkipForward,
  Edit,
  Clock,
  BookOpen,
  Eye,
  Users,
  TrendingUp,
  Download,
  Share2,
  Maximize,
  Minimize,
  Plus,
  Edit3,
  Trash2,
  Search,
  Lock,
  Tag,
  Upload,
  FileText,
  X,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import lectureService from "../../../services/lectureService";
import noteService from "../../../services/noteService";
import Notes from "../Notes/Notes";
import forward from "../../../assets/forward.svg";
import backward from "../../../assets/backward.svg";

const ViewLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);

  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
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

  // ======================== Fetch Lecture ========================
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const res = await lectureService.getLectureById(lectureId);
        if (res.success && res.data) {
          setLecture(res.data);

          // Load saved progress
          const savedTime = localStorage.getItem(`lecture-${lectureId}-progress`);
          if (savedTime) {
            setCurrentTime(parseFloat(savedTime));
          }
        } else {
          throw new Error("Lecture not found");
        }
      } catch (err) {
        console.error("Error fetching lecture:", err);
        toast.error("Failed to load lecture");
        navigate(`/educator/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    if (lectureId) fetchLecture();

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [lectureId, courseId, navigate]);

  // ======================== Video Controls ========================
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);

      // Set saved time if available
      const savedTime = localStorage.getItem(`lecture-${lectureId}-progress`);
      if (savedTime) {
        videoRef.current.currentTime = parseFloat(savedTime);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(0));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const handleSeek = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = duration * progress;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePreview = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const previewTime = duration * progress;

    setPreviewTime(previewTime);
    setShowPreview(true);
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

  const toggleFullscreen = () => {
    const player = videoRef.current?.parentElement;
    if (!player) return;
    
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
        toast.error("Failed to enter fullscreen mode");
      });
    } else {
      document.exitFullscreen();
    }
  };

  // ======================== Keyboard Shortcuts ========================
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      clearTimeout(controlsTimeoutRef.current);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ======================== Save Progress ========================
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

  // ======================== Format Time ========================
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

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center bg-gray-50">
        <motion.div
          className="h-14 w-14 border-b-4 border-blue-600 rounded-full animate-spin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </div>
    );

  // ======================== Layout ========================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
        <button
          onClick={() => navigate(`/educator/courses/${courseId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <h1 className="text-lg font-semibold truncate text-gray-800 max-w-md md:max-w-xl lg:max-w-3xl">{lecture?.title}</h1>
        <button
          onClick={() =>
            navigate(`/educator/courses/${courseId}/lectures/edit/${lectureId}`)
          }
          className="flex items-center bg-blue-600 px-3 py-1.5 rounded-lg text-white hover:bg-blue-700 transition"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </button>
      </div>

      {/* ======================== Video Player ======================== */}
      <div
        className="relative flex-1 bg-gray-900 flex justify-center items-center"
        onMouseMove={handleUserActivity}
        onClick={handleUserActivity}
      >
        <video
          ref={videoRef}
          src={lecture?.videoUrl}
          className="w-full max-w-6xl"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onError={(e) => {
            const mediaError = e?.target?.error;
            const code = mediaError?.code;
            console.error('Educator video playback error:', { code, error: mediaError, src: lecture?.videoUrl });
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            // Optional: Auto-play next lecture
          }}
        />

        {/* Overlay Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* All controls at the bottom */}
              <div className="space-y-3">

                {/* Transport Controls */}
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
                        onClick={handleSeek}
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
                          className="h-full bg-blue-600 rounded-full relative"
                          style={{
                            width: `${(currentTime / duration) * 100 || 0}%`,
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
                    
                    {/* Sound feature - without percentage hover */}
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
                      
                      {/* Volume slider - without percentage display */}
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
                              onChange={handleVolume}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playback Speed Settings - Positioned at bottom */}
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
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = speed;
                      setPlaybackRate(speed);
                      setShowSettings(false);

                      // Save playback rate preference
                      localStorage.setItem(`lecture-playback-rate`, speed.toString());
                    }
                  }}
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

      {/* ======================== Lecture Content ======================== */}
      <div className="max-w-7xl mx-auto w-full flex-1 p-6">
        <div className="space-y-6">
          {/* Lecture Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-2 text-gray-900">{lecture?.title}</h1>
            <div className="flex items-center text-gray-600 text-sm mb-6">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(duration)} •{" "}
              {lecture?.difficulty?.charAt(0).toUpperCase() +
                lecture?.difficulty?.slice(1) || "Beginner"}
            </div>

            {lecture?.description && (
              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
                <p className="text-gray-700">{lecture.description}</p>
              </div>
            )}
          </div>

          {/* Lecture Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Views Stat Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Views</p>
                  <h3 className="text-2xl font-bold mt-1">{lecture?.viewCount || 0}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center text-blue-100 text-sm">
                  <span>+12% from last week</span>
                </div>
              </div>
            </div>

            {/* Completion Rate Stat Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completion Rate</p>
                  <h3 className="text-2xl font-bold mt-1">{lecture?.completionRate || 0}%</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center text-green-100 text-sm">
                  <span>+5% from last week</span>
                </div>
              </div>
            </div>

            {/* Avg. Watch Time Stat Card */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg. Watch Time</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatTime(
                      (lecture?.duration || 0) * (lecture?.completionRate || 0) / 100
                    )}
                  </h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center text-purple-100 text-sm">
                  <span>
                    {Math.round((lecture?.completionRate || 0) / 100 * (lecture?.duration || 0) / 60 || 0)} min
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Stat Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Current Progress</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {Math.round((currentTime / duration) * 100 || 0)}%
                  </h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Resources Section */}
          {lecture?.resources && lecture.resources.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Resources</h3>
              <div className="space-y-3">
                {lecture.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-600">
                        {resource.type?.toUpperCase()}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-gray-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lecture Notes Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Notes lectureId={lectureId} courseId={courseId} lectureTitle={lecture?.title} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLecture;