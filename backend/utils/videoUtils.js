import fs from 'fs';
import path from 'path';

// Video file size limits and recommendations
export const VIDEO_LIMITS = {
    PREVIEW_VIDEO: {
        maxSize: 500 * 1024 * 1024, // 500MB
        recommendedSize: 100 * 1024 * 1024, // 100MB
        maxDuration: 300, // 5 minutes
        description: "Course preview/trailer"
    },
    LESSON_VIDEO: {
        maxSize: 2 * 1024 * 1024 * 1024, // 2GB
        recommendedSize: 500 * 1024 * 1024, // 500MB
        maxDuration: 7200, // 2 hours
        description: "Full lesson content"
    },
    DEMO_VIDEO: {
        maxSize: 1 * 1024 * 1024 * 1024, // 1GB
        recommendedSize: 200 * 1024 * 1024, // 200MB
        maxDuration: 1800, // 30 minutes
        description: "Demonstration/tutorial"
    }
};

// Video quality settings
export const VIDEO_QUALITY = {
    LOW: {
        resolution: '480p',
        bitrate: '500k',
        size: 'Small file size, basic quality'
    },
    MEDIUM: {
        resolution: '720p',
        bitrate: '1500k',
        size: 'Balanced quality and size'
    },
    HIGH: {
        resolution: '1080p',
        bitrate: '3000k',
        size: 'High quality, larger file'
    },
    ULTRA: {
        resolution: '1440p',
        bitrate: '6000k',
        size: 'Ultra HD, very large file'
    }
};

// Supported video formats
export const SUPPORTED_FORMATS = {
    INPUT: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
    OUTPUT: ['.mp4', '.webm'], // Optimized formats for web
    PREFERRED: '.mp4' // Most compatible format
};

// Video validation utility
export const validateVideo = (file) => {
    const errors = [];
    const warnings = [];

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SUPPORTED_FORMATS.INPUT.includes(ext)) {
        errors.push(`Unsupported video format: ${ext}. Supported: ${SUPPORTED_FORMATS.INPUT.join(', ')}`);
    }

    // Check file size based on type
    const videoType = determineVideoType(file.fieldname);
    const limits = VIDEO_LIMITS[videoType];

    if (file.size > limits.maxSize) {
        errors.push(`Video too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum: ${(limits.maxSize / (1024 * 1024)).toFixed(0)}MB`);
    }

    if (file.size > limits.recommendedSize) {
        warnings.push(`Video size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds recommended size (${(limits.recommendedSize / (1024 * 1024)).toFixed(0)}MB). Consider compression.`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        videoType,
        limits
    };
};

// Determine video type based on field name
export const determineVideoType = (fieldname) => {
    if (fieldname.includes('preview')) return 'PREVIEW_VIDEO';
    if (fieldname.includes('lesson')) return 'LESSON_VIDEO';
    if (fieldname.includes('demo')) return 'DEMO_VIDEO';
    return 'LESSON_VIDEO'; // Default
};

// Generate video metadata
export const generateVideoMetadata = (file, videoPath) => {
    const stats = fs.statSync(videoPath);

    return {
        filename: file.filename,
        originalName: file.originalname,
        size: {
            bytes: file.size,
            mb: (file.size / (1024 * 1024)).toFixed(2),
            formatted: formatFileSize(file.size)
        },
        format: path.extname(file.originalname).toLowerCase(),
        uploadedAt: new Date(),
        lastModified: stats.mtime,
        path: videoPath,
        url: `/uploads/courses/videos/${file.filename}`,
        type: determineVideoType(file.fieldname),
        status: 'uploaded'
    };
};

// Format file size for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Video optimization recommendations
export const getOptimizationRecommendations = (videoMetadata) => {
    const recommendations = [];
    const sizeInMB = parseFloat(videoMetadata.size.mb);
    const videoType = videoMetadata.type;
    const limits = VIDEO_LIMITS[videoType];

    // Size recommendations
    if (sizeInMB > (limits.recommendedSize / (1024 * 1024))) {
        recommendations.push({
            type: 'compression',
            priority: 'high',
            message: `Consider compressing video. Current: ${videoMetadata.size.formatted}, Recommended: ${formatFileSize(limits.recommendedSize)}`,
            action: 'compress'
        });
    }

    // Format recommendations
    if (videoMetadata.format !== '.mp4') {
        recommendations.push({
            type: 'format',
            priority: 'medium',
            message: `Convert to MP4 for better compatibility. Current format: ${videoMetadata.format}`,
            action: 'convert'
        });
    }

    // Quality recommendations based on size
    let recommendedQuality = 'MEDIUM';
    if (sizeInMB < 100) recommendedQuality = 'LOW';
    else if (sizeInMB > 500) recommendedQuality = 'HIGH';
    else if (sizeInMB > 1000) recommendedQuality = 'ULTRA';

    recommendations.push({
        type: 'quality',
        priority: 'info',
        message: `Recommended quality setting: ${recommendedQuality} (${VIDEO_QUALITY[recommendedQuality].resolution})`,
        action: 'optimize',
        quality: recommendedQuality
    });

    return recommendations;
};

// Video processing status tracker
export const VIDEO_STATUS = {
    UPLOADING: 'uploading',
    UPLOADED: 'uploaded',
    PROCESSING: 'processing',
    OPTIMIZED: 'optimized',
    READY: 'ready',
    ERROR: 'error'
};

// Create video processing job (placeholder for future implementation)
export const createVideoProcessingJob = (videoMetadata, options = {}) => {
    const job = {
        id: generateJobId(),
        videoId: videoMetadata.filename,
        status: VIDEO_STATUS.UPLOADED,
        options: {
            quality: options.quality || 'MEDIUM',
            format: options.format || 'mp4',
            compress: options.compress || false,
            generateThumbnail: options.generateThumbnail !== false
        },
        createdAt: new Date(),
        estimatedDuration: estimateProcessingTime(videoMetadata.size.bytes),
        progress: 0
    };

    return job;
};

// Generate unique job ID
const generateJobId = () => {
    return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Estimate processing time based on file size
const estimateProcessingTime = (sizeInBytes) => {
    const sizeInMB = sizeInBytes / (1024 * 1024);

    // Rough estimation: 1MB = 2-5 seconds processing time
    const baseTime = sizeInMB * 3; // 3 seconds per MB
    const minTime = Math.max(30, baseTime * 0.5); // Minimum 30 seconds
    const maxTime = baseTime * 2;

    return {
        min: Math.round(minTime),
        max: Math.round(maxTime),
        average: Math.round((minTime + maxTime) / 2),
        formatted: `${Math.round(minTime / 60)}-${Math.round(maxTime / 60)} minutes`
    };
};

// Video storage management
export const getVideoStorageInfo = () => {
    const videoDir = path.join(process.cwd(), 'public', 'uploads', 'courses', 'videos');

    if (!fs.existsSync(videoDir)) {
        return {
            totalFiles: 0,
            totalSize: 0,
            formattedSize: '0 Bytes',
            directory: videoDir
        };
    }

    const files = fs.readdirSync(videoDir);
    let totalSize = 0;

    files.forEach(file => {
        const filePath = path.join(videoDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
    });

    return {
        totalFiles: files.length,
        totalSize,
        formattedSize: formatFileSize(totalSize),
        directory: videoDir,
        averageSize: files.length > 0 ? formatFileSize(totalSize / files.length) : '0 Bytes'
    };
};

// Clean up old or unused videos
export const cleanupVideos = (olderThanDays = 30) => {
    const videoDir = path.join(process.cwd(), 'public', 'uploads', 'courses', 'videos');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    if (!fs.existsSync(videoDir)) {
        return { cleaned: 0, errors: [] };
    }

    const files = fs.readdirSync(videoDir);
    let cleaned = 0;
    const errors = [];

    files.forEach(file => {
        try {
            const filePath = path.join(videoDir, file);
            const stats = fs.statSync(filePath);

            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                cleaned++;
            }
        } catch (error) {
            errors.push({ file, error: error.message });
        }
    });

    return { cleaned, errors };
};

export default {
    VIDEO_LIMITS,
    VIDEO_QUALITY,
    SUPPORTED_FORMATS,
    validateVideo,
    generateVideoMetadata,
    getOptimizationRecommendations,
    createVideoProcessingJob,
    getVideoStorageInfo,
    cleanupVideos,
    formatFileSize
};