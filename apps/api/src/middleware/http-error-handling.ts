/**
 * HTTP Error Handling Middleware for Healthcare Platform
 * Comprehensive HTTP error handling with proper status codes, rate limiting, and DDoS protection
 *
 * Features:
 * - Proper HTTP status codes for different error types
 * - Consistent error response format
 * - Rate limiting for error endpoints
 * - DDoS protection for error scenarios
 * - Healthcare compliance for error responses
 * - Security headers integration (via healthcareSecurityHeadersMiddleware)
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

import type { Context, Next } from 'hono';
import { createHealthcareError, ErrorCategory, ErrorSeverity } from '../services/createHealthcareError';
import { logger } from '../lib/logger';
import { errorTracker } from '../services/error-tracking-bridge';

// HTTP status code mapping
const HTTP_STATUS_CODES = {
  // Client Errors (4xx)
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // Server Errors (5xx)
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
} as const;

// Error type to HTTP status code mapping
const ERROR_TYPE_TO_STATUS = {
  VALIDATION_ERROR: 400,
  INVALID_REQUEST: 400,
  MISSING_REQUIRED_FIELDS: 400,
  TYPE_VALIDATION_FAILED: 400,
  SCHEMA_VALIDATION_FAILED: 422,

  AUTHENTICATION_ERROR: 401,
  UNAUTHORIZED: 401,
  INVALID_TOKEN: 401,
  TOKEN_EXPIRED: 401,
  SESSION_EXPIRED: 401,

  AUTHORIZATION_ERROR: 403,
  FORBIDDEN: 403,
  INSUFFICIENT_PRIVILEGES: 403,
  ACCESS_DENIED: 403,

  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  ENTITY_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,

  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  GONE: 410,

  RATE_LIMIT_EXCEEDED: 429,
  TOO_MANY_REQUESTS: 429,
  QUOTA_EXCEEDED: 429,

  TIMEOUT_ERROR: 408,
  REQUEST_TIMEOUT: 408,

  DATABASE_ERROR: 503,
  SERVICE_UNAVAILABLE: 503,
  EXTERNAL_SERVICE_ERROR: 502,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,

  INTERNAL_ERROR: 500,
  SERVER_ERROR: 500,
  UNEXPECTED_ERROR: 500,
} as const;

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // General rate limiting
  general: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.',
  },

  // Error endpoint rate limiting (stricter)
  errorEndpoints: {
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    message: 'Too many error requests. Please contact support if issues persist.',
  },

  // Authentication failure rate limiting
  authFailures: {
    windowMs: 900000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication failures. Account temporarily locked.',
  },

  // Sensitive operations rate limiting
  sensitiveOperations: {
    windowMs: 300000, // 5 minutes
    maxRequests: 3,
    message: 'Too many sensitive operations. Please wait before trying again.',
  },
};

// DDoS protection configuration
const DDOS_PROTECTION_CONFIG = {
  // IP-based blocking thresholds
  ipThresholds: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },

  // User-based blocking thresholds
  userThresholds: {
    requestsPerMinute: 50,
    requestsPerHour: 500,
    requestsPerDay: 5000,
  },

  // Endpoint-specific thresholds
  endpointThresholds: {
    '/api/v1/auth/login': { requestsPerMinute: 10 },
    '/api/v1/auth/register': { requestsPerMinute: 5 },
    '/api/v1/patients': { requestsPerMinute: 30 },
    '/api/v1/medical-records': { requestsPerMinute: 20 },
  },

  // Block duration
  blockDuration: {
    temporary: 300000, // 5 minutes
    permanent: 86400000, // 24 hours
  },
};

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockedUntil?: number;
}>();

/**
 * HTTP Error Response interface
 */
export interface HTTPErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    userMessage?: string;
    suggestion?: string;
  };
  compliance?: {
    lgpdCompliant: boolean;
    dataSanitized: boolean;
    auditTrail: boolean;
  };
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  reason?: string;
}

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  config: typeof RATE_LIMIT_CONFIG.general,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const resetTime = now + config.windowMs;

  let record = rateLimitStore.get(key);

  // Clean up expired records
  if (record && record.resetTime < now) {
    rateLimitStore.delete(key);
    record = undefined;
  }

  // Create new record if none exists
  if (!record) {
    record = {
      count: 1,
      resetTime,
      blocked: false,
    };
    rateLimitStore.set(key, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
      blocked: false,
    };
  }

  // Check if blocked
  if (record.blocked && record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      blocked: true,
      reason: 'Rate limit exceeded - temporarily blocked',
    };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    // Block temporarily
    record.blocked = true;
    record.blockedUntil = now + DDOS_PROTECTION_CONFIG.blockDuration.temporary;
    
    logger.warn('Rate limit exceeded - IP temporarily blocked', {
      key,
      count: record.count,
      maxRequests: config.maxRequests,
      blockedUntil: record.blockedUntil,
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      blocked: true,
      reason: 'Rate limit exceeded',
    };
  }

  // Increment count
  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime,
    blocked: false,
  };
}

/**
 * Get rate limit key from request context
 */
export function getRateLimitKey(c: Context, type: 'general' | 'auth' | 'sensitive' = 'general'): string {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const _userAgent = c.req.header('user-agent') || 'unknown';
  const userId = c.get('userId') || 'anonymous';
  const endpoint = c.req.path;

  switch (type) {
    case 'auth':
      return `auth:${ip}:${userAgent}`;
    case 'sensitive':
      return `sensitive:${userId}:${endpoint}`;
    default:
      return `general:${ip}:${endpoint}`;
  }
}

/**
 * Create HTTP error response
 */
export function createHTTPErrorResponse(
  code: string,
  message: string,
  status: number,
  context: Context,
  details?: any,
  userMessage?: string,
  suggestion?: string,
): HTTPErrorResponse {
  const requestId = context.get('requestId') || generateRequestId();

  const response: HTTPErrorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      ...(details && { details }),
      ...(userMessage && { userMessage }),
      ...(suggestion && { suggestion }),
    },
    compliance: {
      lgpdCompliant: true,
      dataSanitized: true,
      auditTrail: true,
    },
  };

  return response;
}

/**
 * Handle different error types with appropriate HTTP responses
 */
export async function handleHTTPError(
  error: any,
  context: Context,
): Promise<Response> {
  const requestId = context.get('requestId') || generateRequestId();
  
  // Determine error type and status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let userMessage = 'An internal server error occurred.';
  let suggestion = 'Please try again later or contact support if the problem persists.';

  // Map error to HTTP status code
  if (error.code && ERROR_TYPE_TO_STATUS[error.code as keyof typeof ERROR_TYPE_TO_STATUS]) {
    statusCode = ERROR_TYPE_TO_STATUS[error.code as keyof typeof ERROR_TYPE_TO_STATUS];
    errorCode = error.code;
  } else if (error.status && HTTP_STATUS_CODES[error.status as keyof typeof HTTP_STATUS_CODES]) {
    statusCode = error.status;
    errorCode = error.code || `HTTP_${statusCode}`;
  }

  // Set user-friendly messages based on status code
  switch (statusCode) {
    case 400:
      userMessage = 'The request contains invalid data.';
      suggestion = 'Please check your input and try again.';
      break;
    case 401:
      userMessage = 'Authentication is required to access this resource.';
      suggestion = 'Please provide valid authentication credentials.';
      break;
    case 403:
      userMessage = 'You do not have permission to access this resource.';
      suggestion = 'Please contact your administrator if you need access.';
      break;
    case 404:
      userMessage = 'The requested resource was not found.';
      suggestion = 'Please check the URL and try again.';
      break;
    case 408:
      userMessage = 'The request timed out.';
      suggestion = 'Please try again with a smaller request or check your connection.';
      break;
    case 429:
      userMessage = 'Too many requests were made.';
      suggestion = 'Please wait a moment before making another request.';
      break;
    case 500:
      userMessage = 'An internal server error occurred.';
      suggestion = 'Please try again later or contact support if the problem persists.';
      break;
    case 502:
      userMessage = 'Unable to connect to an external service.';
      suggestion = 'Please try again later.';
      break;
    case 503:
      userMessage = 'The service is temporarily unavailable.';
      suggestion = 'Please try again later.';
      break;
    case 504:
      userMessage = 'A gateway timeout occurred.';
      suggestion = 'Please try again later.';
      break;
  }

  // Create healthcare error for tracking
  const healthcareError = createHealthcareError(
    errorCode,
    error.message || userMessage,
    getSeverityFromStatus(statusCode),
    getCategoryFromStatus(statusCode),
    {
      originalError: error,
      requestId,
      endpoint: context.req.path,
      method: context.req.method,
      statusCode,
    },
  );

  // Create HTTP error response
  const errorResponse = createHTTPErrorResponse(
    errorCode,
    error.message || userMessage,
    statusCode,
    context,
    error.details,
    userMessage,
    suggestion,
  );

  // Log the error
  logger.error('HTTP error handled', {
    requestId,
    errorCode,
    statusCode,
    endpoint: context.req.path,
    method: context.req.method,
    userAgent: context.req.header('user-agent'),
    ip: context.req.header('x-forwarded-for') || context.req.header('x-real-ip'),
  }, {
    originalError: error.message,
    stack: error.stack,
    healthcareError: healthcareError.toJSON(),
  });

  // Capture error for tracking
  errorTracker.captureException(error, {
    requestId,
    endpoint: context.req.path,
    method: context.req.method,
    statusCode,
  }, {
    severity: healthcareError.severity,
    category: healthcareError.category,
    userMessage,
    suggestion,
  });

  // Return error response
  return context.json(errorResponse, statusCode);
}

/**
 * HTTP error handling middleware
 */
export async function httpErrorHandlingMiddleware(
  c: Context,
  next: Next,
): Promise<Response | void> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to context
  c.set('requestId', requestId);

  try {
    // Check rate limiting
    const rateLimitKey = getRateLimitKey(c, 'general');
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIG.general);

    if (!rateLimitResult.allowed) {
      const errorResponse = createHTTPErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests',
        429,
        c,
        {
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
        },
        RATE_LIMIT_CONFIG.general.message,
        'Please wait before making another request.',
      );

      logger.warn('Rate limit exceeded', {
        requestId,
        key: rateLimitKey,
        count: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
      });

      return c.json(errorResponse, 429);
    }

    // Add rate limit headers
    c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.general.maxRequests.toString());
    c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    c.header('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    // Check DDoS protection
    if (await checkDDoSProtection(c)) {
      const errorResponse = createHTTPErrorResponse(
        'DDOS_PROTECTION',
        'Access denied due to suspicious activity',
        403,
        c,
        undefined,
        'Access temporarily restricted for security reasons.',
        'Please contact support if you believe this is an error.',
      );

      logger.warn('DDoS protection triggered', {
        requestId,
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
      });

      return c.json(errorResponse, 403);
    }

    await next();

    const duration = Date.now() - startTime;

    // Log successful request
    logger.debug('Request completed successfully', {
      requestId,
      method: c.req.method,
      endpoint: c.req.path,
      statusCode: c.res.status,
      duration,
    });

  } catch (error: any) {
    const _duration = Date.now() - startTime;

    // Handle the error with appropriate HTTP response
    return handleHTTPError(error, c);
  }
}

/**
 * Check DDoS protection
 */
async function checkDDoSProtection(c: Context): Promise<boolean> {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const userAgent = c.req.header('user-agent') || 'unknown';
  const endpoint = c.req.path;
  const userId = c.get('userId') || 'anonymous';

  // Check IP-based thresholds
  const ipKey = `ddos:ip:${ip}`;
  const ipRateLimit = checkRateLimit(ipKey, {
    windowMs: 60000,
    maxRequests: DDOS_PROTECTION_CONFIG.ipThresholds.requestsPerMinute,
    message: 'IP rate limit exceeded',
  });

  if (!ipRateLimit.allowed) {
    return true;
  }

  // Check endpoint-specific thresholds
  const endpointConfig = DDOS_PROTECTION_CONFIG.endpointThresholds[endpoint as keyof typeof DDOS_PROTECTION_CONFIG.endpointThresholds];
  if (endpointConfig) {
    const endpointKey = `ddos:endpoint:${endpoint}:${ip}`;
    const endpointRateLimit = checkRateLimit(endpointKey, {
      windowMs: 60000,
      maxRequests: endpointConfig.requestsPerMinute,
      message: 'Endpoint rate limit exceeded',
    });

    if (!endpointRateLimit.allowed) {
      return true;
    }
  }

  // Check user-based thresholds (for authenticated users)
  if (userId !== 'anonymous') {
    const userKey = `ddos:user:${userId}`;
    const userRateLimit = checkRateLimit(userKey, {
      windowMs: 60000,
      maxRequests: DDOS_PROTECTION_CONFIG.userThresholds.requestsPerMinute,
      message: 'User rate limit exceeded',
    });

    if (!userRateLimit.allowed) {
      return true;
    }
  }

  return false;
}

/**
 * Get error severity from HTTP status code
 */
function getSeverityFromStatus(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return 'high';
  if (statusCode >= 400) return 'medium';
  return 'low';
}

/**
 * Get error category from HTTP status code
 */
function getCategoryFromStatus(statusCode: number): ErrorCategory {
  if (statusCode === 401 || statusCode === 403) return 'security';
  if (statusCode === 400 || statusCode === 422) return 'validation';
  if (statusCode === 404) return 'validation';
  if (statusCode === 429) return 'security';
  if (statusCode >= 500) return 'technical';
  return 'technical';
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now && (!record.blockedUntil || record.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up rate limit store every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 300000);
}

// Export utilities and types
export {
  HTTP_STATUS_CODES,
  ERROR_TYPE_TO_STATUS,
  RATE_LIMIT_CONFIG,
  DDOS_PROTECTION_CONFIG,
};
export type { HTTPErrorResponse, RateLimitResult };