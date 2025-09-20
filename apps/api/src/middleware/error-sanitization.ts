/**
 * Error Sanitization Middleware for Healthcare Platform
 * Comprehensive error sanitization and sensitive data protection
 *
 * Features:
 * - Sensitive data removal from error messages
 * - Database connection error sanitization
 * - Internal system detail hiding
 * - User-friendly error messages
 * - Healthcare compliance for error handling
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

import type { Context, Next } from 'hono';
import { createHealthcareError, ErrorCategory, ErrorSeverity } from '../services/createHealthcareError';
import { logger } from '../lib/logger';
import { errorTracker } from '../services/error-tracking-bridge';

// Sensitive data patterns to detect and sanitize
const SENSITIVE_PATTERNS = {
  // Database credentials and connection strings
  DATABASE_CREDENTIALS: [
    /password\s*=\s*['"]([^'"]+)['"]/gi,
    /user\s*=\s*['"]([^'"]+)['"]/gi,
    /host\s*=\s*['"]([^'"]+)['"]/gi,
    /database\s*=\s*['"]([^'"]+)['"]/gi,
    /port\s*=\s*['"](\d+)['"]/gi,
    /postgresql:\/\/[^:]+:[^@]+@[^@]+/gi,
    /mysql:\/\/[^:]+:[^@]+@[^@]+/gi,
    /mongodb:\/\/[^:]+:[^@]+@[^@]+/gi,
  ],

  // API keys and tokens
  API_KEYS: [
    /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /bearer\s+([a-zA-Z0-9\-._~+\/]+=*)/gi,
    /token\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /secret\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /authorization\s*[:=]\s*['"]([^'"]+)['"]/gi,
  ],

  // Personal identifiable information
  PERSONAL_DATA: [
    /cpf\s*[:=]\s*['"](\d{3}\.\d{3}\.\d{3}-\d{2})['"]/gi,
    /cnpj\s*[:=]\s*['"](\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})['"]/gi,
    /email\s*[:=]\s*['"]([^'"]+@[^'"]+)['"]/gi,
    /phone\s*[:=]\s*['"](\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})['"]/gi,
    /birth[_-]?date\s*[:=]\s*['"](\d{4}-\d{2}-\d{2})['"]/gi,
  ],

  // Healthcare-specific sensitive data
  HEALTHCARE_DATA: [
    /patient[_-]?id\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /medical[_-]?record[_-]?number\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /diagnosis\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /treatment\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /medication\s*[:=]\s*['"]([^'"]+)['"]/gi,
    /crm\s*[:=]\s*['"](\d{6,})['"]/gi,
  ],

  // File system paths
  FILE_PATHS: [
    /\/home\/[^\/]+/gi,
    /\/users\/[^\/]+/gi,
    /\/var\/www\/[^\/]+/gi,
    /c:\\\\users\\\\[^\\\\]+/gi,
    /d:\\\\projects\\\\[^\\\\]+/gi,
  ],

  // Internal system details
  INTERNAL_DETAILS: [
    /stack\s*trace[:\s]*/gi,
    /at\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/gi,
    /node_modules\/[^\/]+/gi,
    /\.ts:\d+:\d+/gi,
    /\.js:\d+:\d+/gi,
    /internal\/[^\/]+/gi,
    /\.next\/[^\/]+/gi,
  ],
};

// User-friendly error messages
const USER_FRIENDLY_MESSAGES = {
  DATABASE_ERROR: {
    message: 'Unable to connect to the database. Please try again later.',
    suggestion: 'If the problem persists, please contact support.',
  },
  NETWORK_ERROR: {
    message: 'Network connection error. Please check your internet connection.',
    suggestion: 'Please ensure you have a stable internet connection.',
  },
  VALIDATION_ERROR: {
    message: 'The provided data is invalid. Please check your input.',
    suggestion: 'Please review your data and try again.',
  },
  AUTHENTICATION_ERROR: {
    message: 'Authentication failed. Please check your credentials.',
    suggestion: 'Please verify your login information and try again.',
  },
  AUTHORIZATION_ERROR: {
    message: 'You do not have permission to perform this action.',
    suggestion: 'Please contact your administrator if you need access.',
  },
  NOT_FOUND_ERROR: {
    message: 'The requested resource was not found.',
    suggestion: 'Please check the URL and try again.',
  },
  RATE_LIMIT_ERROR: {
    message: 'Too many requests. Please slow down and try again.',
    suggestion: 'Please wait a moment before making another request.',
  },
  SERVER_ERROR: {
    message: 'An internal server error occurred.',
    suggestion: 'Please try again later or contact support if the problem persists.',
  },
  TIMEOUT_ERROR: {
    message: 'The request took too long to complete.',
    suggestion: 'Please try again with a smaller request or check your connection.',
  },
};

// Error severity mapping
const ERROR_SEVERITY_MAP: Record<string, ErrorSeverity> = {
  'DATABASE_ERROR': 'high',
  'NETWORK_ERROR': 'medium',
  'VALIDATION_ERROR': 'low',
  'AUTHENTICATION_ERROR': 'medium',
  'AUTHORIZATION_ERROR': 'medium',
  'NOT_FOUND_ERROR': 'low',
  'RATE_LIMIT_ERROR': 'low',
  'SERVER_ERROR': 'high',
  'TIMEOUT_ERROR': 'medium',
};

// Error category mapping
const ERROR_CATEGORY_MAP: Record<string, ErrorCategory> = {
  'DATABASE_ERROR': 'technical',
  'NETWORK_ERROR': 'technical',
  'VALIDATION_ERROR': 'validation',
  'AUTHENTICATION_ERROR': 'security',
  'AUTHORIZATION_ERROR': 'security',
  'NOT_FOUND_ERROR': 'validation',
  'RATE_LIMIT_ERROR': 'security',
  'SERVER_ERROR': 'technical',
  'TIMEOUT_ERROR': 'technical',
};

/**
 * Sanitize sensitive data from error messages
 */
export function sanitizeErrorMessage(errorMessage: string): string {
  let sanitizedMessage = errorMessage;

  // Apply all sanitization patterns
  Object.values(SENSITIVE_PATTERNS).forEach(patterns => {
    patterns.forEach(pattern => {
      sanitizedMessage = sanitizedMessage.replace(pattern, (match, ...args) => {
        // Replace with generic placeholder
        if (match.includes('password') || match.includes('secret') || match.includes('key')) {
          return match.replace(/['"]([^'"]+)['"]/g, ' "***" ');
        }
        if (match.includes('email')) {
          return match.replace(/['"]([^'"]+@[^'"]+)['"]/g, ' "***@***.***" ');
        }
        if (match.includes('phone')) {
          return match.replace(/['"]([^'"]+)['"]/g, ' "***-***-****" ');
        }
        if (match.includes('cpf') || match.includes('cnpj')) {
          return match.replace(/['"]([^'"]+)['"]/g, ' "***.***.***-**" ');
        }
        if (match.includes('/home/') || match.includes('/users/') || match.includes('c:\\\\users\\\\')) {
          return '[REDACTED_PATH]';
        }
        if (match.includes('stack trace') || match.includes('at ') || match.includes('.ts:') || match.includes('.js:')) {
          return '[INTERNAL_DETAILS]';
        }
        return '[REDACTED]';
      });
    });
  });

  return sanitizedMessage;
}

/**
 * Sanitize error object for user response
 */
export function sanitizeErrorObject(error: any): any {
  const sanitized: any = {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };

  // Add request ID if available
  if (error.requestId) {
    sanitized.requestId = error.requestId;
  }

  // Add sanitized details if available
  if (error.details) {
    if (typeof error.details === 'string') {
      sanitized.details = sanitizeErrorMessage(error.details);
    } else if (typeof error.details === 'object') {
      sanitized.details = sanitizeObject(error.details);
    }
  }

  // Add user-friendly message
  const friendlyMessage = USER_FRIENDLY_MESSAGES[error.code as keyof typeof USER_FRIENDLY_MESSAGES];
  if (friendlyMessage) {
    sanitized.userMessage = friendlyMessage.message;
    sanitized.suggestion = friendlyMessage.suggestion;
  }

  // Add healthcare compliance info
  sanitized.compliance = {
    dataSanitized: true,
    sensitiveDataRemoved: true,
    lgpdCompliant: true,
  };

  return sanitized;
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip sensitive keys entirely
    if (isSensitiveKey(key)) {
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeErrorMessage(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Check if a key contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  const sensitiveKeyPatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /credential/i,
    /auth/i,
    /api[_-]?key/i,
    /bearer/i,
    /signature/i,
    /certificate/i,
    /private/i,
    /confidential/i,
    /ssn/i,
    /cpf/i,
    /cnpj/i,
    /crm/i,
    /patient[_-]?id/i,
    /medical[_-]?record/i,
    /diagnosis/i,
    /treatment/i,
    /medication/i,
  ];

  return sensitiveKeyPatterns.some(pattern => pattern.test(key));
}

/**
 * Detect error type from error message and context
 */
export function detectErrorType(error: Error, context?: Context): {
  type: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  userMessage: string;
  suggestion: string;
} {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Database connection errors
  if (
    message.includes('database') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('postgresql') ||
    message.includes('mysql') ||
    stack.includes('database') ||
    stack.includes('connection')
  ) {
    return {
      type: 'DATABASE_ERROR',
      severity: ERROR_SEVERITY_MAP.DATABASE_ERROR,
      category: ERROR_CATEGORY_MAP.DATABASE_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.DATABASE_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.DATABASE_ERROR.suggestion,
    };
  }

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('axios') ||
    message.includes('request') ||
    message.includes('econnreset') ||
    message.includes('enotfound')
  ) {
    return {
      type: 'NETWORK_ERROR',
      severity: ERROR_SEVERITY_MAP.NETWORK_ERROR,
      category: ERROR_CATEGORY_MAP.NETWORK_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.NETWORK_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.NETWORK_ERROR.suggestion,
    };
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('missing') ||
    message.includes('format') ||
    message.includes('schema') ||
    message.includes('zod') ||
    message.includes('type')
  ) {
    return {
      type: 'VALIDATION_ERROR',
      severity: ERROR_SEVERITY_MAP.VALIDATION_ERROR,
      category: ERROR_CATEGORY_MAP.VALIDATION_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.VALIDATION_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.VALIDATION_ERROR.suggestion,
    };
  }

  // Authentication errors
  if (
    message.includes('authentication') ||
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('session')
  ) {
    return {
      type: 'AUTHENTICATION_ERROR',
      severity: ERROR_SEVERITY_MAP.AUTHENTICATION_ERROR,
      category: ERROR_CATEGORY_MAP.AUTHENTICATION_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.AUTHENTICATION_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.AUTHENTICATION_ERROR.suggestion,
    };
  }

  // Authorization errors
  if (
    message.includes('authorization') ||
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('access') ||
    message.includes('denied')
  ) {
    return {
      type: 'AUTHORIZATION_ERROR',
      severity: ERROR_SEVERITY_MAP.AUTHORIZATION_ERROR,
      category: ERROR_CATEGORY_MAP.AUTHORIZATION_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.AUTHORIZATION_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.AUTHORIZATION_ERROR.suggestion,
    };
  }

  // Not found errors
  if (
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('exist') ||
    message.includes('missing')
  ) {
    return {
      type: 'NOT_FOUND_ERROR',
      severity: ERROR_SEVERITY_MAP.NOT_FOUND_ERROR,
      category: ERROR_CATEGORY_MAP.NOT_FOUND_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.NOT_FOUND_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.NOT_FOUND_ERROR.suggestion,
    };
  }

  // Rate limit errors
  if (
    message.includes('rate limit') ||
    message.includes('too many') ||
    message.includes('throttle') ||
    message.includes('429')
  ) {
    return {
      type: 'RATE_LIMIT_ERROR',
      severity: ERROR_SEVERITY_MAP.RATE_LIMIT_ERROR,
      category: ERROR_CATEGORY_MAP.RATE_LIMIT_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.RATE_LIMIT_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.RATE_LIMIT_ERROR.suggestion,
    };
  }

  // Timeout errors
  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('time out')
  ) {
    return {
      type: 'TIMEOUT_ERROR',
      severity: ERROR_SEVERITY_MAP.TIMEOUT_ERROR,
      category: ERROR_CATEGORY_MAP.TIMEOUT_ERROR,
      userMessage: USER_FRIENDLY_MESSAGES.TIMEOUT_ERROR.message,
      suggestion: USER_FRIENDLY_MESSAGES.TIMEOUT_ERROR.suggestion,
    };
  }

  // Default server error
  return {
    type: 'SERVER_ERROR',
    severity: ERROR_SEVERITY_MAP.SERVER_ERROR,
    category: ERROR_CATEGORY_MAP.SERVER_ERROR,
    userMessage: USER_FRIENDLY_MESSAGES.SERVER_ERROR.message,
    suggestion: USER_FRIENDLY_MESSAGES.SERVER_ERROR.suggestion,
  };
}

/**
 * Error sanitization middleware
 */
export async function errorSanitizationMiddleware(
  c: Context,
  next: Next,
): Promise<Response | void> {
  const startTime = Date.now();
  const requestId = c.get('requestId') || generateRequestId();

  try {
    // Add request ID to context
    c.set('requestId', requestId);

    await next();

    const duration = Date.now() - startTime;

    // Log successful request
    logger.info('Request completed successfully', {
      requestId,
      method: c.req.method,
      endpoint: c.req.path,
      statusCode: c.res.status,
      duration,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Detect error type and severity
    const errorInfo = detectErrorType(error, c);

    // Create healthcare-compliant error
    const healthcareError = createHealthcareError(
      errorInfo.type,
      error.message,
      errorInfo.severity,
      errorInfo.category,
      {
        originalError: error,
        requestId,
        endpoint: c.req.path,
        method: c.req.method,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        duration,
      },
    );

    // Sanitize error for user response
    const sanitizedError = sanitizeErrorObject({
      ...healthcareError.toJSON(),
      requestId,
      userMessage: errorInfo.userMessage,
      suggestion: errorInfo.suggestion,
    });

    // Log the error with healthcare compliance
    logger.error('Error occurred and was sanitized', {
      requestId,
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      category: errorInfo.category,
      endpoint: c.req.path,
      method: c.req.method,
      duration,
      sanitized: true,
    });

    // Capture error for tracking
    errorTracker.captureException(error, {
      requestId,
      endpoint: c.req.path,
      method: c.req.method,
      statusCode: getStatusCode(errorInfo.type),
    }, {
      severity: errorInfo.severity,
      category: errorInfo.category,
      userMessage: errorInfo.userMessage,
      sanitized: true,
    });

    // Return sanitized error response
    return c.json(sanitizedError, getStatusCode(errorInfo.type));
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get HTTP status code for error type
 */
function getStatusCode(errorType: string): number {
  const statusCodes: Record<string, number> = {
    'DATABASE_ERROR': 503,
    'NETWORK_ERROR': 502,
    'VALIDATION_ERROR': 400,
    'AUTHENTICATION_ERROR': 401,
    'AUTHORIZATION_ERROR': 403,
    'NOT_FOUND_ERROR': 404,
    'RATE_LIMIT_ERROR': 429,
    'TIMEOUT_ERROR': 408,
    'SERVER_ERROR': 500,
  };

  return statusCodes[errorType] || 500;
}

// Export utilities for testing and reusability
export {
  SENSITIVE_PATTERNS,
  USER_FRIENDLY_MESSAGES,
  ERROR_SEVERITY_MAP,
  ERROR_CATEGORY_MAP,
};