import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  AlertCircle,
  Loader2,
  Book,
  BookOpen,
  Edit3,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  FileText,
  User,
  Tag,
  Calendar,
  FileType,
  Eye,
  Lock,
  MousePointer,
  // Grid3X3,  // Removed thumbnail icon
  ChevronDown,
  Minimize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import noteService from "../../../services/noteService";
import { generateDownloadUrl } from "../../../utils/cloudinaryUtils";

// 🚀 ✅ CORRECT PDF.js imports for Vite/React (LEGACY build recommended for compatibility)
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// Note: Use ?url for Vite worker loading with PDF.js
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ---------------------------
// Helper: format bytes -> MB
// ---------------------------
const formatMB = (bytes) =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : "—";

// ---------------------------
// Main Component
// ---------------------------
const ViewNotes = ({ notesList = [], user = null }) => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced states
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  // Default fit mode to 'width' for all screens
  const [fitMode, setFitMode] = useState("width"); 
  const [searchTerm, setSearchTerm] = useState("");
  // const [thumbnailsOpen, setThumbnailsOpen] = useState(false); // Removed thumbnail state
  const [rendering, setRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  // Removed canvasSize state as we calculate sizing inside renderPage/effect

  const canvasRef = useRef(null);
  // 🔥 IMPORTANT: Use document.documentElement for fullscreen
  const containerRef = useRef(null); 
  const controlsTimeoutRef = useRef(null);
  const viewerWrapperRef = useRef(null); // New ref for the content wrapper for fullscreen

  const currentIndex = useMemo(
    () => notesList.findIndex((n) => String(n._id) === String(noteId)),
    [notesList, noteId]
  );
  const isValidNotesList = Array.isArray(notesList) && notesList.length > 0;

  // Enhanced role helpers
  const role = user?.role || "guest";
  const isEducator = role === "educator" || role === "admin";
  const isAdmin = role === "admin";
  const canEdit = isEducator || isAdmin;

  const rawUrl = useMemo(() => note?.fileUrl || "", [note]);

  // --- Utility Hooks & Functions ---

  // Mouse movement detection for controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      // Only hide controls if not in fullscreen to avoid issues
      if (!isFullscreen) setShowControls(false); 
    }, 3000);
  }, [isFullscreen]);
  
  // Clean up controls timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Global resize observer to re-render on container size change
  // This is crucial for 'auto' and 'width' fit modes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
        // Debounce or only trigger if fitMode is auto/width/height
        // In this case, we'll let the renderPage dependency array handle re-render
    });

    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [containerRef]); 


  // Fetch Note (Kept as is)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await noteService.getNoteById(noteId);
        if (res?.success && res?.data) {
          if (mounted) setNote(res.data);
        } else {
          throw new Error(res?.message || "Failed to load note");
        }
      } catch (err) {
        console.error("ViewNotes fetch error", err);
        if (mounted) {
          setError(err.message || "Failed to load note");
          toast.error(err.message || "Failed to load note");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (noteId) load();
    return () => (mounted = false);
  }, [noteId]);

  // Enhanced PDF loading with error recovery (Kept as is, using correct imports)
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      if (!rawUrl) return;
      try {
        setRendering(true);
        const loadingTask = pdfjsLib.getDocument({
          url: rawUrl,
          // Add these options to handle rendering issues better
          verbosity: pdfjsLib.VerbosityLevel.ERRORS, // Reduce verbose logging
          cMapUrl: 'cmaps/', // Use local cmaps if available
          cMapPacked: true,
          // Disable range requests which can cause issues with some servers
          disableRange: true,
          // Disable streaming which can cause issues with some PDFs
          disableStream: true,
          // Disable auto fetch which can cause issues
          disableAutoFetch: true,
        });
        const doc = await loadingTask.promise;
        if (cancelled) {
          try {
            doc.destroy();
          } catch (e) {}
          return;
        }
        setPdfDoc(doc);
        setTotalPages(doc.numPages || 0);
        setPageNum(1);
      } catch (err) {
        console.error("PDF load error:", err);
        setError("Unable to load PDF. The file might be corrupted or inaccessible.");
        toast.error("Failed to load PDF document");
      } finally {
        setRendering(false);
      }
    };
    loadPdf();
    return () => {
      cancelled = true;
      if (pdfDoc && typeof pdfDoc.destroy === "function") pdfDoc.destroy();
    };
  }, [rawUrl]);

  // Enhanced render function with adaptive sizing
  const renderPage = useCallback(
    async (num) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
      setRendering(true);
      
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Calculate container dimensions dynamically
      // Subtract some padding/margin for optimal fit
      const containerPadding = isFullscreen ? 0 : 40; 
      // Use clientHeight for the overall wrapper, which is 100% of the viewport in fullscreen
      const containerWidth = container.clientWidth - containerPadding; 
      const containerHeight = container.clientHeight - containerPadding;

      try {
        const page = await pdfDoc.getPage(num);
        let scale = 1.0;

        // Calculate optimal scale based on container and fit mode
        const viewport1x = page.getViewport({ scale: 1, rotation: 0 }); // Base viewport

        if (fitMode === "width") {
          scale = containerWidth / viewport1x.width;
        } else if (fitMode === "height") {
          scale = containerHeight / viewport1x.height;
        } else if (fitMode === "auto") {
          const widthScale = containerWidth / viewport1x.width;
          const heightScale = containerHeight / viewport1x.height;
          scale = Math.min(widthScale, heightScale, 3.0); // Limit max scale to 3.0
        }
      
      scale *= zoom; // Apply user zoom

      const viewport = page.getViewport({ scale, rotation });
      
      // High DPI rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      const outputScale = Math.min(devicePixelRatio, 2); // Cap at 2x for performance
      
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: [outputScale, 0, 0, outputScale, 0, 0],
        enableWebGL: false, // Disable WebGL to avoid potential issues
      };

      // Render with error handling
      try {
        await page.render(renderContext).promise;
      } catch (renderError) {
        console.warn("PDF rendering warning (non-fatal):", renderError.message);
        // Continue with a blank canvas if rendering fails
        context.fillStyle = "#f0f0f0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#666";
        context.font = "16px sans-serif";
        context.textAlign = "center";
        context.fillText("Unable to render page completely", canvas.width/2, canvas.height/2);
      }
      
      // toast.success(`Page ${num} rendered`); // Removed to avoid spamming toasts
    } catch (err) {
      console.error("Render page error:", err);
      toast.error(`Failed to render page ${num}`);
      
      // Show error on canvas
      if (context) {
        context.fillStyle = "#f0f0f0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#666";
        context.font = "16px sans-serif";
        context.textAlign = "center";
        context.fillText("Error rendering page", canvas.width/2, canvas.height/2);
      }
    } finally {
      setRendering(false);
      // Ensure container can scroll to all parts of the rendered page
      if (container) {
        container.style.overflow = 'auto';
      }
    }
  },
  [pdfDoc, zoom, rotation, fitMode, isFullscreen]
);

  // Render page when dependencies change AND on container resize (using useLayoutEffect for immediate sizing)
  const [containerKey, setContainerKey] = useState(0); // Key to force re-render on resize
  
  useEffect(() => {
    if (pdfDoc && pageNum) {
        renderPage(pageNum);
    }
    
    // Add event listener for screen resize to handle reflow in non-fullscreen mode
    const handleResize = () => {
      // Re-render the page when the container size changes, especially for fit modes
      setContainerKey(prev => prev + 1); // Force effect to re-run
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, pageNum, zoom, rotation, fitMode, renderPage, containerKey]);


  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!viewerWrapperRef.current) return;

    if (!document.fullscreenElement) {
      viewerWrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Force re-render after entering fullscreen for correct sizing
        setContainerKey(prev => prev + 1); 
      }).catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        // Force re-render after exiting fullscreen
        setContainerKey(prev => prev + 1);
      });
    }
  }, []);

  // Sync isFullscreen state when user uses ESC key to exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setContainerKey(prev => prev + 1);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Navigation (Kept as is)
  const goToPrev = useCallback(() => {
    if (isValidNotesList && currentIndex > 0) {
      const prev = notesList[currentIndex - 1];
      navigate(`/educator/notes/view/${prev._id}`);
    }
  }, [currentIndex, notesList, navigate, isValidNotesList]);

  const goToNext = useCallback(() => {
    if (isValidNotesList && currentIndex < notesList.length - 1) {
      const next = notesList[currentIndex + 1];
      navigate(`/educator/notes/view/${next._id}`);
    }
  }, [currentIndex, notesList, navigate, isValidNotesList]);

  const handleBack = useCallback(() => {
    if (location.state?.from === "lecture") {
      navigate(`/educator/lectures/view/${note?.lecture?._id || note?.lecture}`);
    } else if (note?.course && !note?.lecture) {
      navigate(`/educator/courses/view/${note?.course?._id || note?.course}`);
    } else if (note?.lecture) {
      navigate(`/educator/lectures/view/${note?.lecture?._id || note?.lecture}`);
    } else if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/educator/lectures");
    }
  }, [location, navigate, note]);

  // Enhanced actions (Kept as is)
  const handleEdit = () => {
    if (!canEdit) return toast.error("You don't have edit permissions.");
    navigate(`/educator/notes/edit/${noteId}`, { state: { from: "viewer" } });
  };

  const handleDelete = async () => {
    if (!canEdit) return toast.error("You don't have delete permissions.");
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const res = await noteService.deleteNote(noteId);
      if (res?.success) {
        toast.success("Note deleted successfully");
        
        // Removed RecentActivity tracking
        
        handleBack();
      }
    } catch (err) {
      console.error("Delete note error", err);
      toast.error("Delete failed");
    }
  };

  const handleDownload = async () => {
    if (!rawUrl) return;
    try {
      let downloadUrl = rawUrl;
      try {
        const candidate = generateDownloadUrl(rawUrl, `${note?.title || "note"}.pdf`);
        if (candidate) downloadUrl = candidate;
      } catch (e) {}
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${note?.title || "note"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (err) {
      console.error("Download error", err);
      toast.error("Download failed");
    }
  };

  const handleOpenExternal = () => {
    if (!rawUrl) return;
    window.open(rawUrl, "_blank", "noopener,noreferrer");
  };

  // Enhanced viewer controls
  const zoomIn = () => {
    const newZoom = Math.min(5, +(zoom + 0.25).toFixed(2));
    setZoom(newZoom);
    // Scroll to center the view after zooming
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.25, +(zoom - 0.25).toFixed(2));
    setZoom(newZoom);
    // Scroll to center the view after zooming
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const rotate = () => setRotation(r => (r + 90) % 360);
  const cycleFitMode = () => {
    const modes = ["auto", "width", "height"];
    const currentIndex = modes.indexOf(fitMode);
    setFitMode(modes[(currentIndex + 1) % modes.length]);
  };
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setFitMode("width"); // Reset to width fit mode
    // Scroll to top when resetting view
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  };

  // Enhanced keyboard navigation (Kept as is)
  useEffect(() => {
    const onKey = (e) => {
      // Ignore keypress if an input is focused (e.g., search box)
      if (document.activeElement.tagName === 'INPUT') return; 

      if (e.key === "ArrowLeft" && !e.ctrlKey) goToPrev();
      if (e.key === "ArrowRight" && !e.ctrlKey) goToNext();
      if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "ArrowLeft")) setPageNum(p => Math.max(1, p - 1));
      if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "ArrowRight")) setPageNum(p => Math.min(totalPages, p + 1));
      if (e.key === "+" || (e.ctrlKey && e.key === "=")) { e.preventDefault(); zoomIn(); }
      if (e.key === "-" || (e.ctrlKey && e.key === "_")) { e.preventDefault(); zoomOut(); }
      if (e.key === "r" || e.key === "R") rotate();
      if (e.key === "0") resetView();
      if (e.key === "f" || e.key === "F") cycleFitMode();
      if (e.key === "Escape") {
        // setThumbnailsOpen(false); // Removed thumbnail close
        if (isFullscreen) toggleFullscreen(); // Handle fullscreen exit with ESC
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages, goToNext, goToPrev, isFullscreen, toggleFullscreen]);

  // Thumbnail generation - REMOVED COMPLETELY
  // const [thumbnails, setThumbnails] = useState([]);
  // useEffect for thumbnail generation removed

  // --- Render Functions (Simplified for clarity) ---

  // Loading state (Kept as is)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center"
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Your Note</h3>
          <p className="text-gray-600">Preparing the ultimate viewing experience...</p>
        </motion.div>
      </div>
    );
  }

  // Error state (Kept as is)
  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-3">Unable to Load Note</h3>
            <p className="text-gray-600 mb-6">{error || "The requested note could not be found or accessed."}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    // 🎨 Conditional styling for Fullscreen
    <div 
      ref={viewerWrapperRef}
      className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-black/95' : 'min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4 md:p-6'} relative overflow-hidden`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background elements (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Main Container - Conditional Margin/Padding for Fullscreen */}
      <div className={`mx-auto relative z-10 ${isFullscreen ? 'w-full h-full' : 'max-w-[1800px]'}`}>
        
        {/* Header (Hidden in Fullscreen) */}
        {!isFullscreen && (
            <motion.header
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-8"
            >
                {/* ... (Header content is unchanged) ... */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-4xl blur-3xl transform -skew-y-2" />
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Navigation and Title */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <motion.button
                                whileHover={{ scale: 1.05, x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBack}
                                className="p-3 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </motion.button>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {note.course && !note.lecture ? (
                                        <Book className="w-7 h-7 text-purple-600" />
                                    ) : (
                                        <BookOpen className="w-7 h-7 text-cyan-600" />
                                    )}
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
                                        {note.title || "Untitled Note"}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-gray-200">
                                        <FileType className="w-4 h-4" />
                                        {note.course && !note.lecture ? "Course Note" : "Lecture Note"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {(note.course?.title || note.lecture?.title) || "—"}
                                    </span>
                                    <span className="text-gray-500">
                                        Created {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {/* Visibility Badge */}
                            <div className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2 border backdrop-blur-sm ${
                                note.isPublic 
                                    ? 'bg-green-100/80 border-green-200 text-green-700' 
                                    : 'bg-gray-100/80 border-gray-200 text-gray-600'
                            }`}>
                                {note.isPublic ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                {note.isPublic ? "Public" : "Private"}
                            </div>

                            {/* Action Buttons */}
                            {canEdit && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 font-semibold"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleOpenExternal}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 font-semibold"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open
                            </motion.button>

                            {canEdit && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>
        )}

        {/* Main Content Grid - Conditional layout for Fullscreen */}
        <div className={isFullscreen ? 'h-[95%]' : 'grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8'}>
          {/* PDF Viewer Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative ${isFullscreen ? 'h-full' : ''}`}
          >
            <div 
              // 🔥 IMPORTANT: Set h-full for viewer in Fullscreen mode
              ref={containerRef}
              className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-auto relative transition-all duration-300 ${isFullscreen ? 'h-full rounded-none bg-black/70 border-none' : 'h-[75vh]'}`}
              style={{
                // Ensure proper scrolling behavior
                overflow: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #f1f1f1'
              }}
            >
              
              {/* Enhanced Floating Controls */}
              <AnimatePresence>
                {(showControls || isFullscreen) && ( // Show controls in fullscreen always
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-4 left-4 right-4 z-20"
                  >
                    <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-4 text-white">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Left Controls */}
                        <div className="flex items-center gap-3">
                          {/* Zoom Controls (Kept as is) */}
                          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={zoomOut}
                              className="p-2 rounded-lg transition-all"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </motion.button>
                            <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
                              {Math.round(zoom * 100)}%
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={zoomIn}
                              className="p-2 rounded-lg transition-all"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Page Navigation (Kept as is) */}
                          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPageNum(p => Math.max(1, p - 1))}
                              className="p-2 rounded-lg transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </motion.button>
                            <div className="px-3 py-1 text-sm font-medium min-w-[80px] text-center">
                              {pageNum} / {totalPages}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPageNum(p => Math.min(totalPages, p + 1))}
                              className="p-2 rounded-lg transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Quick Actions (Kept as is) */}
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={rotate}
                            className="p-2 bg-white/10 rounded-lg transition-all"
                            title="Rotate"
                          >
                            <RotateCw className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={cycleFitMode}
                            className="p-2 bg-white/10 rounded-lg transition-all"
                            title="Fit Mode (F)"
                          >
                            {fitMode === "auto" ? <MousePointer className="w-4 h-4" /> : 
                              fitMode === "width" ? <Maximize2 className="w-4 h-4" /> : 
                              <Minimize2 className="w-4 h-4" />}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={resetView}
                            className="px-3 py-2 bg-white/20 rounded-lg text-sm font-medium transition-all"
                          >
                            Reset
                          </motion.button>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                          {/* Search (Kept as is) */}
                          <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                            <input
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search in PDF..."
                              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 w-48"
                            />
                          </div>

                          {/* 🔥 Fullscreen Toggle */}
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleFullscreen}
                            className="p-2 bg-white/10 rounded-lg transition-all"
                            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen"}
                          >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PDF Canvas Container */}
              {/* 🔥 IMPORTANT: Adjust padding/margin for full canvas view. 
                   Height is already h-full or h-[75vh] on the parent div. */}
              <div className={`w-full h-full flex items-center justify-center p-0 relative ${isFullscreen ? 'bg-black/95' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                {!rawUrl || !pdfDoc ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8"
                  >
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No PDF Available</h3>
                    <p className="text-gray-500">This note doesn't have a PDF attached or the file is inaccessible.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full h-full"
                  >
                    {/* 🔥 Canvas Wrapper: Ensure the canvas is centered and has premium styling */}
                    <div className={`flex-grow w-full overflow-auto ${isFullscreen ? '' : ''}`}>
                      <div 
                        className="flex justify-center items-center min-h-full min-w-full p-8"
                        style={{
                          // This ensures we can scroll to all parts of the zoomed canvas
                          minWidth: '100%',
                          minHeight: '100%',
                        }}
                      >
                        <div 
                          className={`shadow-2xl bg-white rounded-2xl transform-gpu border border-gray-200 transition-all duration-300 ${isFullscreen ? 'shadow-none border-none' : ''}`}
                          style={{
                            // This container will grow with the zoomed content
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <div className="flex justify-center">
                            <canvas 
                              ref={canvasRef} 
                              className="rounded-lg shadow-inner max-w-full h-auto"
                              // IMPORTANT: Remove fixed height/width styles, let canvas rendering handle dimensions
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                transition: 'transform 0.3s ease', // Smooth transition for rotation
                                transform: `rotate(${rotation}deg)`,
                                // Add these styles to improve rendering
                                imageRendering: 'optimizeQuality',
                                shapeRendering: 'geometricPrecision',
                                textRendering: 'optimizeLegibility'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {rendering && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 px-4 py-2 bg-black/70 text-white rounded-full text-sm backdrop-blur-sm flex items-center gap-2"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Rendering page {pageNum}...
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Enhanced Sidebar (Hidden in Fullscreen) */}
          {!isFullscreen && (
              <motion.aside
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
              >
                  {/* ... (Sidebar content is unchanged) ... */}
                  {/* Note Information Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Note Information
                      </h3>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="text-sm font-medium text-gray-600">Title</label>
                              <p className="text-gray-900 font-semibold mt-1">{note.title || "Untitled"}</p>
                          </div>

                          <div>
                              <label className="text-sm font-medium text-gray-600">Creator</label>
                              <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50/50 rounded-xl">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                      <div className="font-semibold text-gray-900">
                                          {note.creator?.name || note.creator?.email || "Unknown"}
                                      </div>
                                      <div className="text-xs text-gray-500">{note.creator?.email || ""}</div>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-sm font-medium text-gray-600">File Type</label>
                                  <div className="mt-1 px-3 py-2 bg-gray-50/50 rounded-lg">
                                      <div className="font-medium text-gray-900">{note.fileType?.toUpperCase() || "PDF"}</div>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-sm font-medium text-gray-600">File Size</label>
                                  <div className="mt-1 px-3 py-2 bg-gray-50/50 rounded-lg">
                                      <div className="font-medium text-gray-900">{formatMB(note.fileSize)}</div>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <label className="text-sm font-medium text-gray-600">Tags</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {note.tags && note.tags.length > 0 ? (
                                      note.tags.map((tag, index) => (
                                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                              {tag}
                                          </span>
                                      ))
                                  ) : (
                                      <span className="text-gray-500 text-sm">No tags</span>
                                  )}
                              </div>
                          </div>

                          <div>
                              <label className="text-sm font-medium text-gray-600">Visibility</label>
                              <div className="mt-1">
                                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${
                                      note.isPublic 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-600'
                                  }`}>
                                      {note.isPublic ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                      {note.isPublic ? "Public (Enrolled students)" : "Private (Only you)"}
                                  </span>
                              </div>
                          </div>

                          <div>
                              <label className="text-sm font-medium text-gray-600">Created</label>
                              <div className="mt-1 px-3 py-2 bg-gray-50/50 rounded-lg">
                                  <div className="font-medium text-gray-900">{new Date(note.createdAt).toLocaleString()}</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNotes;