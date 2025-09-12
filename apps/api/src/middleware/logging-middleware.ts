/**
 * Logging middleware for Hono
 * Provides structured request/response logging with healthcare compliance
 */

import type { Context, Next } from 'hono';
import { logger, logUtils } from '../lib/logger';
import { errorTracker } from '../lib/error-tracking';
import { randomUUID } from 'crypto';

/**
 * Request logging middleware
 * Logs all incoming requests and responses with structured format
 */
export function loggingMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = randomUUID();
    
    // Set request ID for downstream use
    c.set('requestId', requestId);
    
    // Extract request context
    const requestContext = logUtils.getRequestContext(c);
    requestContext.requestId = requestId;
    
    // Log incoming request
    logger.info('Request started', {
      ...requestContext,
      body: c.req.method !== 'GET' ? await getRequestBody(c) : undefined,
    });

    try {
      await next();
      
      const duration = Date.now() - startTime;
      const statusCode = c.res.status;
      
      // Log successful response
      logger.requestLog(
        c.req.method,
        c.req.path,
        statusCode,
        duration,
        requestContext
      );
      
      // Performance warning for slow requests
      if (duration > 5000) {
        logger.warn('Slow request detected', {
          ...requestContext,
          duration,
          threshold: 5000,
        });
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error response
      logger.error('Request failed', {
        ...requestContext,
        duration,
        statusCode: 500,
      }, error as Error);
      
      throw error;
    }
  };
}

/**
 * Healthcare audit logging middleware
 * Logs healthcare-specific operations for compliance
 */
export function healthcareAuditMiddleware() {
  return async (c: Context, next: Next) => {
    const requestContext = logUtils.getRequestContext(c);
    
    // Extract healthcare context from request
    const patientId = c.req.param('patientId') || c.req.query('patientId');
    const clinicId = c.req.param('clinicId') || c.req.query('clinicId');
    const userId = c.get('userId');
    
    if (patientId || clinicId) {
      const healthcareContext = logUtils.getHealthcareContext(patientId, clinicId);
      
      // Log healthcare operation
      logger.auditLog(`Healthcare operation: ${c.req.method} ${c.req.path}`, {
        ...requestContext,
        ...healthcareContext,
        userId,
      });
    }
    
    await next();
  };
}

/**
 * Error logging middleware
 * Catches and logs all unhandled errors
 */
export function errorLoggingMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const requestContext = logUtils.getRequestContext(c);
      const errorContext = logUtils.getErrorContext(error as Error);
      
      logger.error('Unhandled error', {
        ...requestContext,
        ...errorContext,
      }, error as Error);
      
      // Re-throw to let other error handlers process it
      throw error;
    }
  };
}

/**
 * Security logging middleware
 * Logs security-related events
 */
export function securityLoggingMiddleware() {
  return async (c: Context, next: Next) => {
    const requestContext = logUtils.getRequestContext(c);
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,  // Path traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /drop.*table/i,  // SQL injection
    ];
    
    const path = c.req.path;
    const query = c.req.url.split('?')[1] || '';
    const userAgent = c.req.header('user-agent') || '';
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(path) || pattern.test(query) || pattern.test(userAgent)) {
        logger.securityLog('Suspicious request pattern detected', {
          ...requestContext,
          pattern: pattern.toString(),
          suspiciousContent: { path, query, userAgent },
        });
        break;
      }
    }
    
    // Log authentication attempts
    if (path.includes('/auth/') || path.includes('/login')) {
      logger.securityLog('Authentication attempt', requestContext);
    }
    
    await next();
  };
}

/**
 * Performance logging middleware
 * Logs performance metrics for monitoring
 */
export function performanceLoggingMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    await next();
    
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    const requestContext = logUtils.getRequestContext(c);
    
    logger.performanceLog(`${c.req.method} ${c.req.path}`, duration, {
      ...requestContext,
      memory: {
        heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
        heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
        externalDelta: endMemory.external - startMemory.external,
      },
    });
  };
}

/**
 * Helper function to safely extract request body for logging
 */
async function getRequestBody(c: Context): Promise<any> {
  try {
    const contentType = c.req.header('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Clone the request to avoid consuming the body
      const clonedRequest = c.req.raw.clone();
      const body = await clonedRequest.json();
      
      // Sanitize sensitive fields
      return sanitizeLogData(body);
    }
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const clonedRequest = c.req.raw.clone();
      const formData = await clonedRequest.formData();
      const body: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
      
      return sanitizeLogData(body);
    }
    
    return { contentType, size: c.req.header('content-length') };
  } catch (error) {
    return { error: 'Failed to parse request body' };
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'ssn',
    'cpf',
    'rg',
    'credit_card',
    'card_number',
  ];
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}
