// ============================================================================
// 🌐 CACHE MANAGER UTILITY (EduPulse)
// Unified caching strategy for consistent cache handling across frontend services
// ============================================================================

// ========================== CACHE CONFIGURATION ================================
// Define consistent TTL values that align with backend cacheMiddleware
export const CACHE_TTL = {
  // Short-lived cache for frequently changing data
  SHORT: 60 * 1000,      // 1 minute (matches backend 60s)
  SHORT_MEDIUM: 120 * 1000, // 2 minutes (matches backend 120s)
  
  // Medium-lived cache for moderately changing data
  MEDIUM: 300 * 1000,    // 5 minutes (matches backend 300s)
  MEDIUM_LONG: 600 * 1000, // 10 minutes (matches backend 600s)
  
  // Long-lived cache for slowly changing data
  LONG: 900 * 1000,      // 15 minutes (matches backend 900s)
  
  // Default cache TTL
  DEFAULT: 300 * 1000    // 5 minutes
};

// ========================== CACHE STORAGE ================================
// Using Map for in-memory caching with expiration
const cacheStorage = new Map();

// ========================== CACHE HELPER FUNCTIONS ================================
/**
 * Generate a cache key from URL and optional user ID
 * @param {string} url - The request URL
 * @param {string} userId - Optional user ID for user-specific caching
 * @returns {string} Generated cache key
 */
export const generateCacheKey = (url, userId = null) => {
  return userId ? `${url}::user:${userId}` : url;
};

/**
 * Check if a cache entry is expired
 * @param {Object} entry - Cache entry with expireAt property
 * @returns {boolean} True if expired, false otherwise
 */
const isExpired = (entry) => {
  return Date.now() > entry.expireAt;
};

/**
 * Set a value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export const setCache = (key, value, ttl = CACHE_TTL.DEFAULT) => {
  cacheStorage.set(key, { 
    value, 
    expireAt: Date.now() + ttl,
    createdAt: Date.now()
  });
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined if not found/expired
 */
export const getCache = (key) => {
  const entry = cacheStorage.get(key);
  
  // If no entry found, return undefined
  if (!entry) return undefined;
  
  // If entry is expired, remove it and return undefined
  if (isExpired(entry)) {
    cacheStorage.delete(key);
    return undefined;
  }
  
  return entry.value;
};

/**
 * Invalidate a specific cache entry
 * @param {string} key - Cache key to invalidate
 */
export const invalidateCache = (key) => {
  cacheStorage.delete(key);
};

/**
 * Invalidate cache entries by pattern
 * @param {string} pattern - Pattern to match cache keys (e.g., 'sections_*')
 */
export const invalidateCachePattern = (pattern) => {
  const regex = new RegExp(pattern.replace('*', '.*'));
  for (const key of cacheStorage.keys()) {
    if (regex.test(key)) {
      cacheStorage.delete(key);
    }
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  cacheStorage.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  let expiredCount = 0;
  const now = Date.now();
  
  // Count expired entries
  for (const entry of cacheStorage.values()) {
    if (now > entry.expireAt) {
      expiredCount++;
    }
  }
  
  return {
    totalEntries: cacheStorage.size,
    expiredEntries: expiredCount,
    activeEntries: cacheStorage.size - expiredCount
  };
};

// ========================== RESPONSE HANDLER ================================
/**
 * Process API response and handle cached responses
 * @param {*} data - API response data
 * @returns {*} Processed data
 */
export const processApiResponse = (data) => {
  // Handle null or undefined data
  if (data === null || data === undefined) {
    return null;
  }
  
  // Handle cached responses from backend (marked with fromCache flag)
  if (data?.data && data?.fromCache) {
    // Return the actual data, removing the cache wrapper
    return data.data;
  }
  
  // Handle direct responses
  return data?.data ?? data;
};

// ========================== EXPORT ================================
export default {
  CACHE_TTL,
  generateCacheKey,
  setCache,
  getCache,
  invalidateCache,
  invalidateCachePattern,
  clearAllCache,
  getCacheStats,
  processApiResponse
};