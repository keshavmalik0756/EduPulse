// ============================================================================
// 🌐 ERROR HANDLING UTILITY (EduPulse)
// Unified error handling for consistent error messages and codes across frontend and backend
// ============================================================================

// ========================== ERROR CODES ================================
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

// ========================== ERROR MESSAGES ================================
export const ERROR_MESSAGES = {
  // Authentication errors
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.ACCOUNT_NOT_VERIFIED]: 'Please verify your account before logging in',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
  
  // Validation errors
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format provided',
  
  // Resource errors
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Resource conflict detected',
  
  // Rate limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
  
  // System errors
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection'
};

// ========================== FRONTEND ERROR HANDLER ================================
export class FrontendErrorHandler {
  static handleApiError(error) {
    // Handle network errors
    if (!error.response) {
      if (!navigator.onLine) {
        return {
          code: ERROR_CODES.NETWORK_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
          isNetworkError: true
        };
      }
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        isNetworkError: true
      };
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return {
          code: data?.code || ERROR_CODES.VALIDATION_ERROR,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          details: data?.details
        };
      
      case 401:
        return {
          code: data?.code || ERROR_CODES.TOKEN_INVALID,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.TOKEN_INVALID]
        };
      
      case 403:
        return {
          code: data?.code || ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSIONS]
        };
      
      case 404:
        return {
          code: data?.code || ERROR_CODES.RESOURCE_NOT_FOUND,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND]
        };
      
      case 409:
        return {
          code: data?.code || ERROR_CODES.RESOURCE_CONFLICT,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.RESOURCE_CONFLICT]
        };
      
      case 429:
        return {
          code: data?.code || ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
          retryAfter: data?.retryAfter
        };
      
      case 500:
        return {
          code: data?.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: data?.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR]
        };
      
      default:
        return {
          code: data?.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: data?.message || `HTTP Error ${status}`,
          status
        };
    }
  }

  static createError(code, message, details = null) {
    return {
      code: code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
      details
    };
  }
}

// ========================== BACKEND ERROR HANDLER ================================
export class BackendErrorHandler extends Error {
  constructor(message, code = ERROR_CODES.INTERNAL_SERVER_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackendErrorHandler);
    }
  }

  toJSON() {
    return {
      success: false,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  static createValidationError(message, details = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
      ERROR_CODES.VALIDATION_ERROR,
      400,
      details
    );
  }

  static createNotFoundError(message, details = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND],
      ERROR_CODES.RESOURCE_NOT_FOUND,
      404,
      details
    );
  }

  static createUnauthorizedError(message, details = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.TOKEN_INVALID],
      ERROR_CODES.TOKEN_INVALID,
      401,
      details
    );
  }

  static createForbiddenError(message, details = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSIONS],
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      403,
      details
    );
  }

  static createConflictError(message, details = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.RESOURCE_CONFLICT],
      ERROR_CODES.RESOURCE_CONFLICT,
      409,
      details
    );
  }

  static createRateLimitError(message, retryAfter = null) {
    return new BackendErrorHandler(
      message || ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      429,
      { retryAfter }
    );
  }
}

// ========================== EXPORT ================================
export default {
  ERROR_CODES,
  ERROR_MESSAGES,
  FrontendErrorHandler,
  BackendErrorHandler
};