import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { randomUUID } from "crypto";

// ==============================
// 📂 BASE CONFIGURATION
// ==============================
const BASE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "courses");

const FIELD_CONFIG = {
  thumbnail: { dir: "thumbnails", maxCount: 1, maxSize: 10 * 1024 * 1024 },
  banner: { dir: "banners", maxCount: 1, maxSize: 15 * 1024 * 1024 },
  previewVideo: { dir: "videos", maxCount: 1, maxSize: 500 * 1024 * 1024 },
  lessonVideo: { dir: "videos", maxCount: 1, maxSize: 2 * 1024 * 1024 * 1024 },
  courseMaterial: { dir: "materials", maxCount: 5, maxSize: 50 * 1024 * 1024 },
  resource: { dir: "materials", maxCount: 5, maxSize: 100 * 1024 * 1024 },
  gallery: { dir: "gallery", maxCount: 5, maxSize: 10 * 1024 * 1024 },
  avatar: { dir: "avatars", maxCount: 1, maxSize: 5 * 1024 * 1024 },
  lectureResource: { dir: "lectures/resources", maxCount: 5, maxSize: 100 * 1024 * 1024 },
};

const ALLOWED_EXTENSIONS = {
  images: [".jpeg", ".jpg", ".png", ".webp"],
  videos: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
  docs: [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".txt",
    ".zip",
    ".rar",
    ".xlsx",
    ".xls",
  ],
};

// ==============================
// 🧱 ENSURE DIRECTORIES EXIST
// ==============================
try {
  if (!fs.existsSync(BASE_UPLOAD_DIR))
    fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });

  Object.values(FIELD_CONFIG).forEach((cfg) => {
    const dirPath = path.join(BASE_UPLOAD_DIR, cfg.dir);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  });
} catch (err) {
  console.error("❌ Failed to ensure upload directories:", err);
  process.env.UPLOAD_READONLY = "true";
}

// ==============================
// 🧩 STORAGE CONFIGURATION
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cfg = FIELD_CONFIG[file.fieldname];
    const dir = cfg ? cfg.dir : "misc";
    cb(null, path.join(BASE_UPLOAD_DIR, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${randomUUID()}${ext}`);
  },
});

// ==============================
// 🔒 VALIDATION HELPERS
// ==============================
const isImage = (ext) => ALLOWED_EXTENSIONS.images.includes(ext);
const isVideo = (ext) => ALLOWED_EXTENSIONS.videos.includes(ext);
const isDoc = (ext) => ALLOWED_EXTENSIONS.docs.includes(ext);

const getFileSizeLimit = (fieldname) =>
  FIELD_CONFIG[fieldname]?.maxSize || 100 * 1024 * 1024;

// ==============================
// 🔒 FILE FILTER (SECURITY)
// ==============================
const enhancedFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = (file.mimetype || "").toLowerCase();

  // Validate expected field
  if (!FIELD_CONFIG[file.fieldname]) {
    return cb(new Error(`Unexpected file field: ${file.fieldname}`));
  }

  // Validate image
  if (isImage(ext)) {
    if (!mimeType.startsWith("image/"))
      return cb(new Error("Invalid image MIME type"));
    return cb(null, true);
  }

  // Validate video
  if (isVideo(ext)) {
    if (!mimeType.startsWith("video/"))
      return cb(new Error("Invalid video MIME type"));
    return cb(null, true);
  }

  // Validate document
  if (isDoc(ext)) {
    if (!mimeType.startsWith("application") && !mimeType.startsWith("text"))
      return cb(new Error("Invalid document MIME type"));
    return cb(null, true);
  }

  // Block malicious files
  const maliciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.com$/i,
  ];

  if (maliciousPatterns.some((p) => p.test(file.originalname))) {
    return cb(new Error("Malicious file detected"));
  }

  return cb(new Error("Unsupported file type"));
};

// ==============================
// 🧠 MULTER INSTANCE FACTORY
// ==============================
const createUploadConfig = (fieldname) =>
  multer({
    storage,
    fileFilter: enhancedFileFilter,
    limits: {
      fileSize: getFileSizeLimit(fieldname),
      files: fieldname.toLowerCase().includes("video") ? 1 : 10,
    },
  });

// ==============================
// 🚀 UPLOAD CONFIGURATIONS
// ==============================
export const uploadCourseFiles = multer({
  storage,
  fileFilter: enhancedFileFilter,
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "previewVideo", maxCount: 1 },
  { name: "courseMaterial", maxCount: 5 },
]);

export const uploadThumbnail = createUploadConfig("thumbnail").single("thumbnail");
export const uploadBanner = createUploadConfig("banner").single("banner");
export const uploadAvatar = createUploadConfig("avatar").single("avatar");
export const uploadPreviewVideo = createUploadConfig("previewVideo").single("previewVideo");
export const uploadLessonVideo = createUploadConfig("lessonVideo").single("lessonVideo");
export const uploadCourseMaterials = createUploadConfig("courseMaterial").array("courseMaterial", 5);

export const uploadLessonFiles = multer({
  storage,
  fileFilter: enhancedFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024, files: 4 },
}).fields([
  { name: "lessonVideo", maxCount: 1 },
  { name: "resource", maxCount: 3 },
]);

export const uploadLectureResources = createUploadConfig("lectureResource").array(
  "lectureResource",
  5
);

export const uploadGallery = createUploadConfig("gallery").array("gallery", 5);

export const uploadLargeVideo = multer({
  storage,
  fileFilter: enhancedFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 * 1024, files: 1 },
}).single("video");

// ==============================
// 📊 PROGRESS TRACKER
// ==============================
export const trackVideoUpload = (req, res, next) => {
  if (req.is && req.is("multipart/form-data")) {
    let uploaded = 0;
    const total = parseInt(req.headers["content-length"] || "0", 10);
    req.on("data", (chunk) => {
      uploaded += chunk.length;
      const pct = total ? Math.round((uploaded / total) * 100) : null;
      if (pct !== null) console.log(`📦 Upload progress: ${pct}%`);
    });
  }
  next();
};

// ==============================
// ⚠️ ERROR HANDLING
// ==============================
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };
    return res.status(400).json({
      success: false,
      code: err.code,
      message: messages[err.code] || err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: "VALIDATION_ERROR",
    });
  }

  next();
};

// ==============================
// ATTACH UPLOAD INFO
// ==============================
export const attachUploadInfo = (req, res, next) => {
  if (req.files || req.file) {
    const allFiles = req.file ? [req.file] : Object.values(req.files).flat();
    req.uploadInfo = allFiles.map((f) => ({
      field: f.fieldname,
      original: f.originalname,
      size: f.size,
      mime: f.mimetype,
      path: f.path,
    }));
  }
  next();
};

// ==============================
// MAP FILES TO BODY
// ==============================
export const mapCourseFilesToBody = (req, res, next) => {
  if (req.uploadResults) {
    req.body.media = req.uploadResults.reduce((acc, f) => {
      acc[f.field] = f.url;
      return acc;
    }, {});
    return next();
  }

  if (!req.files) return next();
  if (!req.body.media) req.body.media = {};

  if (req.files.thumbnail?.[0])
    req.body.media.thumbnail = `/uploads/courses/thumbnails/${req.files.thumbnail[0].filename}`;
  if (req.files.banner?.[0])
    req.body.media.banner = `/uploads/courses/banners/${req.files.banner[0].filename}`;
  if (req.files.previewVideo?.[0])
    req.body.media.previewVideo = `/uploads/courses/videos/${req.files.previewVideo[0].filename}`;
  if (req.files.courseMaterial)
    req.body.media.materials = req.files.courseMaterial.map(
      (f) => `/uploads/courses/materials/${f.filename}`
    );

  next();
};

// ==============================
// MEMORY UPLOAD (FOR CLOUDINARY)
// ==============================
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: enhancedFileFilter,
});

// ==============================
// 🔚 DEFAULT UPLOAD
// ==============================
const upload = multer({
  storage,
  fileFilter: enhancedFileFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 10 },
});

export { storage, enhancedFileFilter };
export default upload;
