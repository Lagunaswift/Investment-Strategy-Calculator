// utils/apiUtils.js

/**
 * Simple throttle implementation
 * @param {Function} fn - The function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Throttle options
 * @returns {Function} - Throttled function
 */
export const createThrottledFunction = (fn, wait = 1000, options = {}) => {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  let result;

  const shouldCall = () => {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      return true;
    }
    if (!timeoutId && options.leading === false) {
      return false;
    }
    return true;
  };

  const callFunction = () => {
    lastCallTime = Date.now();
    result = fn.apply(lastThis, lastArgs);
    timeoutId = null;
    return result;
  };

  const throttled = (...args) => {
    lastThis = this;
    lastArgs = args;

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        if (options.trailing !== false) {
          callFunction();
        }
      }, wait);
    }

    if (shouldCall()) {
      return callFunction();
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
};

/**
 * Error types for API errors
 */
export const API_ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  INVALID_DATA: 'INVALID_DATA_ERROR',
  API_ERROR: 'API_ERROR'
};

/**
 * Retry options configuration
 */
export const RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffFactor: 2 // Exponential backoff
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  callsPerMinute: 5, // Alpha Vantage free tier limit
  windowMs: 60 * 1000, // 1 minute
  maxBurst: 3 // Maximum number of calls that can be made in quick succession
};

/**
 * Creates a throttled function for rate limiting
 * @param {Function} fn - The function to throttle
 * @returns {Function} - Throttled function
 */
export const createRateLimitedFunction = (fn) => {
  return createThrottledFunction(fn, RATE_LIMIT.windowMs / RATE_LIMIT.callsPerMinute, {
    leading: true,
    trailing: false
  });
};

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, options = RETRY_OPTIONS) => {
  const { maxRetries, initialDelay, backoffFactor } = options;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff
      delay = Math.min(delay * backoffFactor, options.maxDelay);
      
      // Add some randomness to prevent thundering herd
      const jitter = Math.random() * 0.2 * delay;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
};

/**
 * Parse API errors and return appropriate error type
 * @param {Error} error - The error to parse
 * @returns {Object} - Parsed error with type and message
 */
export const parseApiError = (error) => {
  if (!error.response) {
    return {
      type: API_ERROR_TYPES.NETWORK,
      message: 'Network error occurred'
    };
  }

  const statusCode = error.response.status;
  const data = error.response.data || {};

  if (statusCode === 429) {
    return {
      type: API_ERROR_TYPES.RATE_LIMIT,
      message: 'Rate limit exceeded'
    };
  }

  if (statusCode >= 500) {
    return {
      type: API_ERROR_TYPES.API_ERROR,
      message: 'API server error'
    };
  }

  if (data.error || data.message) {
    return {
      type: API_ERROR_TYPES.INVALID_DATA,
      message: data.error || data.message
    };
  }

  return {
    type: API_ERROR_TYPES.API_ERROR,
    message: error.message
  };
};

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache duration for different types of data
  durations: {
    performance: 60 * 60 * 1000, // 1 hour
    quotes: 5 * 60 * 1000, // 5 minutes
    news: 15 * 60 * 1000 // 15 minutes
  },
  
  // Cache invalidation rules
  invalidation: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 1000,
    cleanupInterval: 24 * 60 * 60 * 1000 // 24 hours
  }
};

/**
 * Cache manager
 */
export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cleanupInterval = setInterval(this.cleanup.bind(this), CACHE_CONFIG.invalidation.cleanupInterval);
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Object} - Cached data or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = CACHE_CONFIG.durations.performance) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Enforce max entries
    if (this.cache.size > CACHE_CONFIG.invalidation.maxEntries) {
      const oldestEntry = Array.from(this.cache.entries()).reduce((oldest, entry) => {
        return entry[1].timestamp < oldest[1].timestamp ? entry : oldest;
      }, ['', {}]);
      this.cache.delete(oldestEntry[0]);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   * @returns {number} - Number of entries in cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
  }
}

// Export a singleton instance of CacheManager
export const cacheManager = new CacheManager();
