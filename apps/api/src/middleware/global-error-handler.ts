/**
 * 🚨 GLOBAL ERROR HANDLER - Centralized Error Management
 *
 * Features:
 * - LGPD-compliant error responses
 * - Structured error logging
 * - Security-aware error sanitization
 * - Performance monitoring
 * - Audit trail integration
 */

import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/secure-logger';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: any;
  userId?: string;
  patientId?: string;
  endpoint?: string;
}

interface ErrorContext {
  userId?: string;
  patientId?: string;
  endpoint: string;
  method: string;
  ip: string;
  userAgent: string;
  correlationId: string;
  timestamp: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
    correlationId: string;
    details?: any;
  };
}

class GlobalErrorHandler {
  private static readonly ERROR_CODES = {
    // Authentication & Authorization
    UNAUTHORIZED: { status: 401, message: 'Authentication required' },
    FORBIDDEN: { status: 403, message: 'Access denied' },
    INVALID_TOKEN: { status: 401, message: 'Invalid or expired token' },

    // Validation Errors
    VALIDATION_ERROR: { status: 400, message: 'Invalid input data' },
    MISSING_REQUIRED_FIELD: { status: 400, message: 'Required field missing' },
    INVALID_FORMAT: { status: 400, message: 'Invalid data format' },

    // Business Logic Errors
    PATIENT_NOT_FOUND: { status: 404, message: 'Patient not found' },
    APPOINTMENT_NOT_FOUND: { status: 404, message: 'Appointment not found' },
    DUPLICATE_RECORD: { status: 409, message: 'Record already exists' },

    // LGPD Compliance Errors
    CONSENT_REQUIRED: { status: 403, message: 'Patient consent required for this operation' },
    DATA_ACCESS_DENIED: { status: 403, message: 'Access to this data is not permitted' },
    RETENTION_PERIOD_EXPIRED: { status: 410, message: 'Data retention period has expired' },

    // System Errors
    DATABASE_ERROR: { status: 500, message: 'Database operation failed' },
    EXTERNAL_SERVICE_ERROR: { status: 502, message: 'External service unavailable' },
    RATE_LIMIT_EXCEEDED: { status: 429, message: 'Rate limit exceeded' },

    // Security Errors
    SQL_INJECTION_DETECTED: { status: 400, message: 'Invalid query detected' },
    SUSPICIOUS_ACTIVITY: { status: 403, message: 'Suspicious activity detected' },

    // Generic
    INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
    NOT_FOUND: { status: 404, message: 'Resource not found' },
    BAD_REQUEST: { status: 400, message: 'Bad request' },
  };

  private static readonly SENSITIVE_ERROR_PATTERNS = [
    /password/gi,
    /token/gi,
    /secret/gi,
    /key/gi,
    /cpf/gi,
    /cnpj/gi,
    /rg/gi,
    /medical.record/gi,
    /diagnosis/gi,
  ];

  /**
   * Main error handling middleware
   */
  static handle(error: AppError, req: Request, res: Response, next: NextFunction): void {
    const context = this.buildErrorContext(req);
    const sanitizedError = this.sanitizeError(error);
    const errorResponse = this.buildErrorResponse(sanitizedError, context);

    // Log the error
    this.logError(sanitizedError, context);

    // Audit security-related errors
    if (this.isSecurityError(sanitizedError)) {
      this.auditSecurityError(sanitizedError, context);
    }

    // Send response
    res.status(sanitizedError.statusCode || 500).json(errorResponse);
  }

  /**
   * Express async error wrapper
   */
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create standardized application errors
   */
  static createError(
    code: keyof typeof GlobalErrorHandler.ERROR_CODES,
    details?: any,
    userId?: string,
    patientId?: string,
  ): AppError {
    const errorConfig = this.ERROR_CODES[code];

    const error = new Error(errorConfig.message) as AppError;
    error.statusCode = errorConfig.status;
    error.code = code;
    error.isOperational = true;
    error.details = details;
    error.userId = userId;
    error.patientId = patientId;

    return error;
  }

  private static buildErrorContext(req: Request): ErrorContext {
    return {
      userId: req.user?.id,
      patientId: req.params?.patientId || req.body?.patientId,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      correlationId: req.headers['x-correlation-id'] as string || this.generateCorrelationId(),
      timestamp: new Date().toISOString(),
    };
  }

  private static sanitizeError(error: AppError): AppError {
    const sanitized = { ...error };

    // Sanitize error message
    if (sanitized.message) {
      sanitized.message = this.sanitizeSensitiveData(sanitized.message);
    }

    // Sanitize error details
    if (sanitized.details) {
      sanitized.details = this.sanitizeObject(sanitized.details);
    }

    // Remove stack trace in production
    if (process.env.NODE_ENV === 'production') {
      delete sanitized.stack;
    }

    return sanitized;
  }

  private static sanitizeSensitiveData(text: string): string {
    let sanitized = text;

    this.SENSITIVE_ERROR_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    // Remove potential SQL injection attempts from error messages
    sanitized = sanitized.replace(/(['"])(.*?)\1/g, (match, quote, content) => {
      if (content.length > 50 || /[;|&<>]/.test(content)) {
        return `${quote}[SANITIZED]${quote}`;
      }
      return match;
    });

    return sanitized;
  }

  private static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};

    Object.entries(obj).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive information
      const isSensitive = this.SENSITIVE_ERROR_PATTERNS.some(pattern => pattern.test(lowerKey));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeSensitiveData(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private static buildErrorResponse(error: AppError, context: ErrorContext): ErrorResponse {
    const response: ErrorResponse = {
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        timestamp: context.timestamp,
        correlationId: context.correlationId,
      },
    };

    // Include details only in development or for operational errors
    if (process.env.NODE_ENV === 'development' || error.isOperational) {
      if (error.details && Object.keys(error.details).length > 0) {
        response.error.details = error.details;
      }
    }

    return response;
  }

  private static logError(error: AppError, context: ErrorContext): void {
    const logContext = {
      ...context,
      errorCode: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    if (error.statusCode && error.statusCode >= 500) {
      logger.error('Server error occurred', error, logContext);
    } else if (error.statusCode && error.statusCode >= 400) {
      logger.warn('Client error occurred', logContext);
    } else {
      logger.info('Error handled', logContext);
    }
  }

  private static auditSecurityError(error: AppError, context: ErrorContext): void {
    logger.auditDataAccess({
      userId: context.userId || 'anonymous',
      operation: 'SECURITY_ERROR',
      dataType: 'security_event',
      endpoint: context.endpoint,
      ip: context.ip,
      userAgent: context.userAgent,
    });

    // Additional security logging
    logger.warn('Security error detected', {
      errorCode: error.code,
      endpoint: context.endpoint,
      method: context.method,
      ip: context.ip,
      userAgent: context.userAgent,
      userId: context.userId,
      correlationId: context.correlationId,
    });
  }

  private static isSecurityError(error: AppError): boolean {
    const securityCodes = [
      'UNAUTHORIZED',
      'FORBIDDEN',
      'INVALID_TOKEN',
      'SQL_INJECTION_DETECTED',
      'SUSPICIOUS_ACTIVITY',
      'CONSENT_REQUIRED',
      'DATA_ACCESS_DENIED',
    ];

    return securityCodes.includes(error.code || '');
  }

  private static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error('Unhandled Promise Rejection', new Error(reason), {
      type: 'unhandled_rejection',
      reason: reason?.toString(),
      promise: promise?.toString(),
    });

    // In production, you might want to gracefully shutdown
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(error: Error): void {
    logger.error('Uncaught Exception', error, {
      type: 'uncaught_exception',
    });

    // Graceful shutdown
    process.exit(1);
  }

  /**
   * 404 Not Found handler
   */
  static handleNotFound(req: Request, res: Response, next: NextFunction): void {
    const error = GlobalErrorHandler.createError('NOT_FOUND');
    next(error);
  }

  /**
   * LGPD-specific error handlers
   */
  static createConsentError(patientId: string, operation: string): AppError {
    return this.createError('CONSENT_REQUIRED', {
      patientId,
      operation,
      message: `Patient consent required for ${operation}`,
    });
  }

  static createDataAccessError(userId: string, dataType: string): AppError {
    return this.createError('DATA_ACCESS_DENIED', {
      userId,
      dataType,
      message: `Access denied to ${dataType} data`,
    });
  }
}

// Process-level error handlers
process.on('unhandledRejection', GlobalErrorHandler.handleUnhandledRejection);
process.on('uncaughtException', GlobalErrorHandler.handleUncaughtException);

export { type AppError, type ErrorContext, type ErrorResponse, GlobalErrorHandler };
