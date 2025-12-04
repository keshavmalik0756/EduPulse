/**
 * ============================================================
 * 🌐 CLOUDINARY URL UTILITIES (EduPulse Frontend)
 * ============================================================
 *
 * SAFE VERSION — WORKS WITH RAW PDFs, DOCX, IMAGES, VIDEOS
 * Does NOT rewrite resource_type or break RAW delivery.
 * Supports secure forced downloads.
 */

/* ============================================================
   🔧 Helper: Clean & Sanitize URL
============================================================ */
const cleanUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/`/g, "").replace(/\s+/g, "");
};

/* ============================================================
   🌐 Normalize Cloudinary URL (SAFE VERSION)
============================================================ */
/**
 * Normalize Cloudinary URLs without altering resource_type.
 * - DOES NOT convert raw → image (which breaks PDFs)
 * - Keeps RAW, IMAGE, VIDEO intact
 * - Adds automatic quality for images only
 *
 * @param {string} url - Original Cloudinary URL
 * @returns {string} Normalized URL (safe)
 */
export const normalizeCloudinaryUrl = (url) => {
  if (!url) return "";
  let normalizedUrl = cleanUrl(url);

  // If not Cloudinary → return as-is
  if (!normalizedUrl.includes("cloudinary.com")) return normalizedUrl;

  // ⚠️ DO NOT MODIFY RAW FILES (PDF, DOCX, ZIP, etc.)
  if (normalizedUrl.includes("/raw/upload/")) {
    return normalizedUrl; // Always keep RAW intact
  }

  // 🖼 Apply safe optimization ONLY for image files
  if (normalizedUrl.includes("/image/upload/")) {
    // Add auto quality & format
    normalizedUrl = normalizedUrl.replace(
      "/image/upload/",
      "/image/upload/q_auto,f_auto/"
    );
  }

  // 🎥 Video preview enhancement (optional)
  if (normalizedUrl.includes("/video/upload/")) {
    normalizedUrl = normalizedUrl.replace(
      "/video/upload/",
      "/video/upload/"
    );
  }

  return normalizedUrl;
};

/* ============================================================
   💾 Generate Download URL (SAFE)
============================================================ */
/**
 * Generate a safe downloadable Cloudinary link using fl_attachment.
 * Compatible with RAW, IMAGE, and VIDEO resources.
 *
 * @param {string} fileUrl
 * @param {string} filename
 * @returns {string} Cloudinary forced-download URL
 */
export const generateDownloadUrl = (fileUrl, filename = "") => {
  if (!fileUrl) return "";

  const clean = cleanUrl(fileUrl);
  const safeName = encodeURIComponent(filename || "file");

  // RAW (PDF, DOCX, ZIP etc.)
  if (clean.includes("/raw/upload/")) {
    return clean.replace(
      "/raw/upload/",
      `/raw/upload/fl_attachment:${safeName}/`
    );
  }

  // IMAGE
  if (clean.includes("/image/upload/")) {
    return clean.replace(
      "/image/upload/",
      `/image/upload/fl_attachment:${safeName}/`
    );
  }

  // VIDEO
  if (clean.includes("/video/upload/")) {
    return clean.replace(
      "/video/upload/",
      `/video/upload/fl_attachment:${safeName}/`
    );
  }

  // Non-Cloudinary fallback
  return clean;
};

/* ============================================================
   🧠 Detect File Type from URL
============================================================ */
/**
 * @param {string} url
 * @returns {string} pdf | docx | video | image | other
 */
export const detectCloudinaryFileType = (url = "") => {
  const u = url.toLowerCase();

  if (u.endsWith(".pdf") || u.includes("pdf")) return "pdf";
  if (u.endsWith(".docx") || u.includes("docx")) return "docx";
  if (u.includes("/video/") || u.match(/\.(mp4|mov|mkv|webm)$/))
    return "video";
  if (u.includes("/image/") || u.match(/\.(jpg|jpeg|png|webp|gif)$/))
    return "image";

  return "other";
};

/* ============================================================
   📦 EXPORTS
============================================================ */
export default {
  normalizeCloudinaryUrl,
  generateDownloadUrl,
  detectCloudinaryFileType,
};