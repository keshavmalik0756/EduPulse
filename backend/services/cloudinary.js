// services/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mime from "mime-types";

/* ============================================================
   ☁️ CLOUDINARY CONFIGURATION
   Required env:
     CLOUDINARY_CLOUD_NAME
     CLOUDINARY_API_KEY
     CLOUDINARY_API_SECRET
============================================================ */
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️ Cloudinary environment variables are missing!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* ============================================================
   ROOT FOLDERS (allowed / recommended)
============================================================ */
const ROOT_FOLDERS = [
  "EduPulse/EduPulse",
  "EduPulse/Edupulse",
  "EduPulse/EduPulse/Lectures",
  "EduPulse/EduPulse/Lectures/Videos",
  "EduPulse/EduPulse/Lectures/Thumbnails",
  "EduPulse_Educator_Avatars",
  "CourseBanners",
  "CourseThumbnails",
];

const normalizeFolder = (folder = "Uploads") => {
  const clean = String(folder).replace(/^\/+|\/+$/g, "");
  if (!clean) return "EduPulse/EduPulse";
  // If folder is exactly one of the roots
  if (ROOT_FOLDERS.includes(clean)) return clean;
  // If folder already inside one of the roots, return as-is
  if (ROOT_FOLDERS.some((root) => clean.startsWith(root))) return clean;
  // Otherwise put inside canonical root
  return `EduPulse/EduPulse/${clean}`;
};

/* ============================================================
   CONSTANTS & HELPERS
============================================================ */
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB safety limit

const safeUnlink = async (filePath) => {
  try {
    if (!filePath) return;
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      // console.debug(`🧹 Deleted local file: ${filePath}`);
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete local file:", err.message);
  }
};

const retry = async (fn, retries = 3, delay = 800) => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, Math.round(delay * 1.5));
  }
};

const formatCloudinaryResponse = (res) => {
  if (!res) return { success: false, message: "No response from Cloudinary" };
  return {
    success: true,
    url: res.secure_url || res.url || null,
    public_id: res.public_id || res.publicId || null,
    folder: res.folder || null,
    format: res.format || null,
    type: res.resource_type || res.type || null,
    bytes: res.bytes || res.size || null,
    raw: res,
  };
};

/* ============================================================
   EXTRACT PUBLIC ID (from URL or public_id)
   - returns `folder/.../public_id` (without extension)
============================================================ */
const extractPublicId = (urlOrId) => {
  if (!urlOrId) return null;
  const str = String(urlOrId);

  // If it doesn't look like a Cloudinary URL, assume user passed a public_id already
  if (!str.includes("cloudinary.com")) {
    // strip extension if present
    return str.replace(/\.[^/.]+$/, "");
  }

  try {
    const u = new URL(str);
    const parts = u.pathname.split("/").filter(Boolean); // e.g. ['image','upload','v123', 'folder','file.pdf']
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;
    const after = parts.slice(uploadIdx + 1);
    // remove version token if first segment after upload is v<number>
    if (after[0] && /^v\d+$/i.test(after[0])) after.shift();
    const joined = after.join("/");
    // remove extension if present
    return joined.replace(/\.[^/.]+$/, "");
  } catch (err) {
    // fallback: try a regex approach (best-effort)
    try {
      const match = str.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
      if (match && match[1]) return match[1];
    } catch {}
    return null;
  }
};

/* ============================================================
   UPLOAD (supports Buffer or local file path)
   - autodetects resource_type using extension or mime
   - forces PDFs to raw (preserves multi-page PDF)
============================================================ */
export const uploadOnCloudinary = async (
  localFileOrBuffer,
  folder = "Uploads",
  fileName = "",
  opts = {}
) => {
  try {
    if (!localFileOrBuffer) throw new Error("No file or buffer provided");

    const folderPath = normalizeFolder(folder);

    const uploadOptions = {
      folder: folderPath,
      resource_type: "auto",
      ...opts,
    };

    // ---------------- BUFFER UPLOAD ----------------
    if (Buffer.isBuffer(localFileOrBuffer)) {
      if (fileName) {
        const ext = (fileName.split(".").pop() || "").toLowerCase();

        if (["mp4", "mov", "mkv", "webm", "avi"].includes(ext)) {
          uploadOptions.resource_type = "video";
        } else if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"].includes(ext)) {
          uploadOptions.resource_type = "image";
        } else if (ext === "pdf") {
          uploadOptions.resource_type = "raw";
          uploadOptions.format = "pdf";
        }
        // set public_id to the filename without extension (keeps it inside folder)
        uploadOptions.public_id = fileName.replace(/\.[^/.]+$/, "");
        uploadOptions.overwrite = true;
        uploadOptions.unique_filename = false;
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) =>
          err ? reject(err) : resolve(res)
        );
        stream.end(localFileOrBuffer);
      });

      return formatCloudinaryResponse(result);
    }

    // ---------------- LOCAL FILE PATH ----------------
    const localPath = String(localFileOrBuffer);
    if (!fs.existsSync(localPath)) throw new Error("Local file not found");

    const stats = fs.statSync(localPath);
    if (stats.size > MAX_FILE_BYTES) {
      throw new Error("File too large — limit is 2GB");
    }

    const mimeType = mime.lookup(localPath) || "";

    if (mimeType.startsWith("video/")) uploadOptions.resource_type = "video";
    else if (mimeType.startsWith("image/")) uploadOptions.resource_type = "image";
    else if (mimeType === "application/pdf") {
      uploadOptions.resource_type = "raw";
      uploadOptions.format = "pdf";
    }

    if (fileName) {
      uploadOptions.public_id = fileName.replace(/\.[^/.]+$/, "");
      uploadOptions.overwrite = true;
      uploadOptions.unique_filename = false;
    }

    const result = await retry(() => cloudinary.uploader.upload(localPath, uploadOptions), 3, 900);

    // try to remove local file after upload (best-effort)
    await safeUnlink(localPath);
    return formatCloudinaryResponse(result);
  } catch (err) {
    // if local path was provided, attempt safe unlink
    try {
      if (typeof localFileOrBuffer === "string") await safeUnlink(localFileOrBuffer);
    } catch {}
    return { success: false, message: err?.message || String(err) };
  }
};

/* ============================================================
   DELETE RESOURCE (auto resource_type detection)
   Accepts: public_id OR full Cloudinary URL
============================================================ */
export const deleteFromCloudinary = async (publicIdOrUrl) => {
  try {
    if (!publicIdOrUrl) throw new Error("publicIdOrUrl required");

    const public_id = extractPublicId(publicIdOrUrl);
    if (!public_id) throw new Error("Unable to extract public_id from input");

    // Try to fetch metadata to determine resource_type
    const types = ["image", "video", "raw"];
    let meta = null;

    for (const type of types) {
      try {
        meta = await cloudinary.api.resource(public_id, { resource_type: type });
        if (meta) break;
      } catch (e) {
        // ignore and try next type
      }
    }

    if (!meta) {
      // As a fallback try destroy with 'auto' (Cloudinary supports it but may fail)
      try {
        const fallback = await cloudinary.uploader.destroy(public_id, { resource_type: "auto" });
        return { success: true, result: fallback };
      } catch (e) {
        throw new Error("Resource not found on Cloudinary");
      }
    }

    const resourceType = meta.resource_type || "auto";

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });

    return { success: true, result };
  } catch (err) {
    return { success: false, message: err?.message || String(err) };
  }
};

/* ============================================================
   GET RESOURCE DETAILS
   - tries image -> video -> raw
============================================================ */
export const getResourceDetails = async (publicIdOrUrl) => {
  try {
    const public_id = extractPublicId(publicIdOrUrl);
    if (!public_id) throw new Error("Invalid public id or url");

    const types = ["image", "video", "raw"];
    for (const type of types) {
      try {
        const res = await cloudinary.api.resource(public_id, { resource_type: type });
        if (res) return { success: true, data: res };
      } catch (e) {
        // continue
      }
    }

    throw new Error("Resource not found");
  } catch (err) {
    return { success: false, message: err?.message || String(err) };
  }
};

/* ============================================================
   SIGNED UPLOAD SIGNATURE (for client direct uploads)
============================================================ */
export const generateUploadSignature = (options = {}) => {
  try {
    const folder = normalizeFolder(options.folder || "Uploads");
    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
      timestamp,
      folder,
      resource_type: options.resource_type || "auto",
    };
    if (options.public_id) params.public_id = options.public_id;

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
      success: true,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp,
      signature,
      folder,
      resource_type: params.resource_type,
    };
  } catch (err) {
    return { success: false, message: err?.message || String(err) };
  }
};

/* ============================================================
   EXPORTS
============================================================ */
export { cloudinary, normalizeFolder as normalizeFolder, extractPublicId as extractPublicId };
export default uploadOnCloudinary;
