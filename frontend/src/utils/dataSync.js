// ============================================================================
// 🔄 DATA SYNCHRONIZATION UTILITY (EduPulse)
// Ensures consistent data representation and timing between frontend and backend
// ============================================================================

import { getCache, setCache, invalidateCache } from "./cacheManager.js";
import { FrontendErrorHandler } from "./errorHandler.js";

// ========================== SYNC CONFIGURATION ================================
// Configuration for data synchronization
export const SYNC_CONFIG = {
  // Default synchronization intervals (in milliseconds)
  DEFAULT_SYNC_INTERVAL: 30000, // 30 seconds
  REALTIME_SYNC_INTERVAL: 5000, // 5 seconds for critical data
  BACKGROUND_SYNC_INTERVAL: 60000, // 1 minute for non-critical data
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
  
  // Conflict resolution strategies
  CONFLICT_RESOLUTION: {
    LAST_WRITE_WINS: "last_write_wins",
    MERGE: "merge",
    SERVER_WINS: "server_wins",
    CLIENT_WINS: "client_wins"
  },
  
  // Data freshness thresholds
  FRESHNESS_THRESHOLDS: {
    CRITICAL: 5000, // 5 seconds
    IMPORTANT: 30000, // 30 seconds
    NORMAL: 60000, // 1 minute
    BACKGROUND: 300000 // 5 minutes
  }
};

// ========================== DATA SYNC MANAGER ================================
class DataSyncManager {
  constructor() {
    this.syncTasks = new Map();
    this.conflictHandlers = new Map();
    this.dataVersions = new Map();
  }

  /**
   * Register a conflict handler for a specific data type
   * @param {string} dataType - Type of data (e.g., 'productivity', 'health')
   * @param {Function} handler - Conflict resolution function
   */
  registerConflictHandler(dataType, handler) {
    this.conflictHandlers.set(dataType, handler);
  }

  /**
   * Resolve data conflicts using registered handlers
   * @param {string} dataType - Type of data
   * @param {any} localData - Local data
   * @param {any} serverData - Server data
   * @param {string} strategy - Conflict resolution strategy
   * @returns {any} Resolved data
   */
  resolveConflict(dataType, localData, serverData, strategy = SYNC_CONFIG.CONFLICT_RESOLUTION.SERVER_WINS) {
    // Check for registered conflict handler
    const handler = this.conflictHandlers.get(dataType);
    if (handler) {
      return handler(localData, serverData, strategy);
    }

    // Default conflict resolution
    switch (strategy) {
      case SYNC_CONFIG.CONFLICT_RESOLUTION.LAST_WRITE_WINS:
        return this.getLastModifiedData(localData, serverData);
      case SYNC_CONFIG.CONFLICT_RESOLUTION.MERGE:
        return this.mergeData(localData, serverData);
      case SYNC_CONFIG.CONFLICT_RESOLUTION.CLIENT_WINS:
        return localData;
      case SYNC_CONFIG.CONFLICT_RESOLUTION.SERVER_WINS:
      default:
        return serverData;
    }
  }

  /**
   * Get the last modified data based on timestamps
   * @param {any} data1 - First data object
   * @param {any} data2 - Second data object
   * @returns {any} Last modified data
   */
  getLastModifiedData(data1, data2) {
    const timestamp1 = data1?.updatedAt || data1?.timestamp || 0;
    const timestamp2 = data2?.updatedAt || data2?.timestamp || 0;
    return timestamp1 > timestamp2 ? data1 : data2;
  }

  /**
   * Merge two data objects
   * @param {any} data1 - First data object
   * @param {any} data2 - Second data object
   * @returns {any} Merged data
   */
  mergeData(data1, data2) {
    if (typeof data1 === 'object' && typeof data2 === 'object' && data1 !== null && data2 !== null) {
      return { ...data1, ...data2 };
    }
    // For non-objects, prefer server data
    return data2;
  }

  /**
   * Check if data is fresh based on timestamp
   * @param {any} data - Data to check
   * @param {number} threshold - Freshness threshold in milliseconds
   * @returns {boolean} True if data is fresh
   */
  isDataFresh(data, threshold = SYNC_CONFIG.FRESHNESS_THRESHOLDS.NORMAL) {
    if (!data) return false;
    
    const lastUpdated = data?.updatedAt || data?.timestamp || data?.lastSynced;
    if (!lastUpdated) return false;
    
    const now = Date.now();
    const dataAge = now - new Date(lastUpdated).getTime();
    
    return dataAge <= threshold;
  }

  /**
   * Execute a sync function with retry logic
   * @param {Function} syncFunction - Function to execute
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay between retries
   * @returns {Promise} Resolves with the result of the sync function
   */
  async syncWithRetry(syncFunction, maxRetries = SYNC_CONFIG.MAX_RETRIES, baseDelay = SYNC_CONFIG.RETRY_DELAY) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await syncFunction();
        return result;
      } catch (error) {
        lastError = error;
        
        // If it's a CORS error, don't retry as it won't help
        if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
          console.error('CORS error detected, not retrying:', error.message);
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(SYNC_CONFIG.EXPONENTIAL_BACKOFF_MULTIPLIER, attempt);
        const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
        
        console.warn(`🔄 Sync attempt ${attempt + 1} failed. Retrying in ${delay + jitter}ms...`, error.message);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
    
    throw lastError;
  }

  /**
   * Create a synchronized data fetcher
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch data
   * @param {Object} options - Sync options
   * @returns {Function} Synchronized fetch function
   */
  createSyncedFetcher(key, fetchFunction, options = {}) {
    const {
      ttl = 300000, // 5 minutes default
      freshnessThreshold = SYNC_CONFIG.FRESHNESS_THRESHOLDS.NORMAL,
      conflictStrategy = SYNC_CONFIG.CONFLICT_RESOLUTION.SERVER_WINS,
      dataType = 'generic'
    } = options;

    return async () => {
      try {
        // Check cache first
        const cached = getCache(key);
        if (cached && this.isDataFresh(cached, freshnessThreshold)) {
          return cached;
        }

        // Fetch fresh data with retry
        const freshData = await this.syncWithRetry(fetchFunction);
      
        // Resolve any conflicts with cached data
        const resolvedData = cached 
          ? this.resolveConflict(dataType, cached, freshData, conflictStrategy)
          : freshData;

        // Update cache
        setCache(key, resolvedData, ttl);
      
        // Update data version tracking
        this.dataVersions.set(key, {
          version: resolvedData?.version || Date.now(),
          timestamp: Date.now()
        });

        return resolvedData;
      } catch (error) {
        const errorInfo = FrontendErrorHandler.handleApiError(error);
        console.error(`Error synchronizing data for key ${key}:`, error);
        
        // If it's a CORS error, provide a more specific message
        if (error.message && (error.message.includes('CORS') || error.message.includes('blocked'))) {
          console.error('CORS error in data sync:', error.message);
        }
        
        // Return cached data if available, even if stale
        const cached = getCache(key);
        if (cached) {
          console.warn(`Returning stale cached data for key ${key}`);
          return cached;
        }
      
        // Re-throw if no cached data available
        throw error;
      }
    };
  }

  /**
   * Schedule periodic synchronization
   * @param {string} taskId - Unique task identifier
   * @param {Function} syncFunction - Function to synchronize
   * @param {number} interval - Sync interval in milliseconds
   * @param {boolean} immediate - Whether to run immediately
   */
  scheduleSync(taskId, syncFunction, interval = SYNC_CONFIG.DEFAULT_SYNC_INTERVAL, immediate = true) {
    // Clear existing task if it exists
    if (this.syncTasks.has(taskId)) {
      this.cancelSync(taskId);
    }

    // Run immediately if requested
    if (immediate) {
      syncFunction().catch(error => {
        console.error(`Immediate sync failed for task ${taskId}:`, error);
      });
    }

    // Schedule periodic sync
    const intervalId = setInterval(async () => {
      try {
        await syncFunction();
      } catch (error) {
        console.error(`Periodic sync failed for task ${taskId}:`, error);
      }
    }, interval);

    // Store task reference
    this.syncTasks.set(taskId, intervalId);
  }

  /**
   * Cancel scheduled synchronization
   * @param {string} taskId - Task identifier to cancel
   */
  cancelSync(taskId) {
    const intervalId = this.syncTasks.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.syncTasks.delete(taskId);
    }
  }

  /**
   * Force synchronization for a specific task
   * @param {string} taskId - Task identifier
   * @param {Function} syncFunction - Function to synchronize
   */
  async forceSync(taskId, syncFunction) {
    // Cancel existing scheduled sync
    this.cancelSync(taskId);
    
    // Execute sync immediately
    try {
      await syncFunction();
    } catch (error) {
      console.error(`Force sync failed for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get synchronization statistics
   * @returns {Object} Sync statistics
   */
  getSyncStats() {
    return {
      activeTasks: this.syncTasks.size,
      registeredConflictHandlers: this.conflictHandlers.size,
      trackedDataVersions: this.dataVersions.size
    };
  }
}

// ========================== EXPORT ================================
// Create singleton instance
export const dataSyncManager = new DataSyncManager();

// Export utility functions
export default {
  SYNC_CONFIG,
  dataSyncManager,
  createSyncedFetcher: dataSyncManager.createSyncedFetcher.bind(dataSyncManager),
  scheduleSync: dataSyncManager.scheduleSync.bind(dataSyncManager),
  cancelSync: dataSyncManager.cancelSync.bind(dataSyncManager),
  forceSync: dataSyncManager.forceSync.bind(dataSyncManager)
};