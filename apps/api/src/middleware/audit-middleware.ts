/**
 * Comprehensive Audit Middleware
 * Provides automatic audit logging with tamper-proof storage and compliance monitoring
 */

import { Context, Next } from 'hono';
import { type AuditEventContext, comprehensiveAuditService } from '../services/audit-service.js';

export interface AuditMiddlewareOptions {
  eventType?: string;
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
  captureRequest?: boolean;
  captureResponse?: boolean;
  captureHeaders?: boolean;
  sensitiveData?: boolean;
  requireJustification?: boolean;
  emergencyAccess?: boolean;
  complianceValidation?: boolean;
  performanceThreshold?: number; // milliseconds
}

export interface AuditContext {
  startTime: number;
  requestId: string;
  eventType: string;
  auditLevel: string;
  capturedData: any;
  complianceFlags: any;
}

/**
 * Comprehensive audit middleware for healthcare operations
 */
export function auditMiddleware(options: AuditMiddlewareOptions) {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      // Build audit context
      const auditContext = await buildAuditContext(c, options, requestId);

      // Validate emergency access if required
      if (options.emergencyAccess && options.requireJustification) {
        const justification = c.req.header('x-emergency-justification')
          || c.req.query('justification');

        if (!justification) {
          await logAuditEvent(
            'EMERGENCY_ACCESS_DENIED',
            {
              reason: 'Missing justification',
              requestId,
              path: c.req.path,
              method: c.req.method,
            },
            auditContext,
          );

          return c.json(
            {
              error: 'Emergency access requires justification',
              code: 'JUSTIFICATION_REQUIRED',
            },
            400,
          );
        }
      }

      // Store audit context in request
      c.set('auditContext', auditContext);

      // Log request start
      if (options.auditLevel !== 'basic') {
        await logAuditEvent(
          'REQUEST_START',
          {
            method: c.req.method,
            path: c.req.path,
            requestId,
            requestData: options.captureRequest
              ? await captureRequestData(c)
              : undefined,
          },
          auditContext,
        );
      }

      // Execute the route handler
      await next();

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Check performance threshold
      if (
        options.performanceThreshold
        && responseTime > options.performanceThreshold
      ) {
        await logAuditEvent(
          'PERFORMANCE_THRESHOLD_EXCEEDED',
          {
            responseTime,
            threshold: options.performanceThreshold,
            path: c.req.path,
            method: c.req.method,
            requestId,
          },
          auditContext,
        );
      }

      // Log successful completion
      await logAuditEvent(
        options.eventType || 'REQUEST_COMPLETED',
        {
          method: c.req.method,
          path: c.req.path,
          responseTime,
          statusCode: c.res.status,
          requestId,
          responseData: options.captureResponse
            ? await captureResponseData(c)
            : undefined,
        },
        auditContext,
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log error with full context
      await logAuditEvent(
        'REQUEST_ERROR',
        {
          method: c.req.method,
          path: c.req.path,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          responseTime,
          requestId,
        },
        await buildAuditContext(c, options, requestId),
      );

      throw error; // Re-throw to maintain error handling flow
    }
  };
}

/**
 * Healthcare-specific audit middleware configurations
 */
export const healthcareAuditMiddleware = {
  /**
   * For patient data access operations
   */
  patientDataAccess: auditMiddleware({
    eventType: 'PATIENT_DATA_ACCESS',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: false, // Don't log patient data in response
    captureHeaders: true,
    sensitiveData: true,
    complianceValidation: true,
    performanceThreshold: 2000,
  }),

  /**
   * For medical record operations
   */
  medicalRecords: auditMiddleware({
    eventType: 'MEDICAL_RECORD_ACCESS',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: false,
    captureHeaders: true,
    sensitiveData: true,
    emergencyAccess: true,
    requireJustification: true,
    complianceValidation: true,
    performanceThreshold: 3000,
  }),

  /**
   * For consent management operations
   */
  consentManagement: auditMiddleware({
    eventType: 'CONSENT_OPERATION',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: true,
    captureHeaders: true,
    sensitiveData: false,
    complianceValidation: true,
    performanceThreshold: 1000,
  }),

  /**
   * For appointment scheduling
   */
  appointments: auditMiddleware({
    eventType: 'APPOINTMENT_OPERATION',
    auditLevel: 'detailed',
    captureRequest: true,
    captureResponse: false,
    captureHeaders: false,
    sensitiveData: false,
    complianceValidation: true,
    performanceThreshold: 1500,
  }),

  /**
   * For billing and payment operations
   */
  billing: auditMiddleware({
    eventType: 'BILLING_OPERATION',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: false,
    captureHeaders: true,
    sensitiveData: true,
    complianceValidation: true,
    performanceThreshold: 2000,
  }),

  /**
   * For administrative operations
   */
  administrative: auditMiddleware({
    eventType: 'ADMIN_OPERATION',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: true,
    captureHeaders: true,
    sensitiveData: false,
    emergencyAccess: true,
    requireJustification: false,
    complianceValidation: true,
    performanceThreshold: 5000,
  }),

  /**
   * For authentication operations
   */
  authentication: auditMiddleware({
    eventType: 'AUTH_OPERATION',
    auditLevel: 'detailed',
    captureRequest: false, // Don't log credentials
    captureResponse: false,
    captureHeaders: true,
    sensitiveData: true,
    complianceValidation: true,
    performanceThreshold: 1000,
  }),

  /**
   * For data export operations (LGPD compliance)
   */
  dataExport: auditMiddleware({
    eventType: 'DATA_EXPORT_OPERATION',
    auditLevel: 'comprehensive',
    captureRequest: true,
    captureResponse: false, // Don't log exported data
    captureHeaders: true,
    sensitiveData: true,
    requireJustification: true,
    complianceValidation: true,
    performanceThreshold: 10000,
  }),
};

/**
 * Real-time compliance monitoring middleware
 */
export function complianceMonitoringMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Get security and audit contexts
      const securityContext = c.get('securityContext');
      const auditContext = c.get('auditContext');

      // Validate compliance before proceeding
      if (securityContext && !securityContext.accessGranted) {
        await logAuditEvent(
          'COMPLIANCE_VIOLATION',
          {
            violationType: 'ACCESS_DENIED',
            reason: 'RLS policy violation',
            path: c.req.path,
            method: c.req.method,
            userId: securityContext.rlsContext.userId,
            clinicId: securityContext.rlsContext.clinicId,
          },
          auditContext,
        );

        return c.json(
          {
            error: 'Compliance violation detected',
            code: 'COMPLIANCE_VIOLATION',
          },
          403,
        );
      }

      // Check for missing consent validation
      if (securityContext && !securityContext.consentValidated) {
        await logAuditEvent(
          'COMPLIANCE_WARNING',
          {
            warningType: 'MISSING_CONSENT_VALIDATION',
            path: c.req.path,
            method: c.req.method,
            userId: securityContext.rlsContext.userId,
            clinicId: securityContext.rlsContext.clinicId,
          },
          auditContext,
        );
      }

      await next();

      // Post-request compliance checks
      const responseStatus = c.res.status;
      if (responseStatus >= 400) {
        await logAuditEvent(
          'COMPLIANCE_ALERT',
          {
            alertType: 'ERROR_RESPONSE',
            statusCode: responseStatus,
            path: c.req.path,
            method: c.req.method,
          },
          auditContext,
        );
      }
    } catch (error) {
      // Log compliance monitoring errors
      await logAuditEvent(
        'COMPLIANCE_MONITORING_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: c.req.path,
          method: c.req.method,
        },
        c.get('auditContext'),
      );

      throw error;
    }
  };
}

/**
 * Anomaly detection middleware
 */
export function anomalyDetectionMiddleware() {
  const accessCounts = new Map<string, number>();
  const timeWindows = new Map<string, number>();

  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');
      const ipAddress = getClientIP(c);
      const currentTime = Date.now();

      // Track access patterns
      if (userId) {
        const userKey = `user:${userId}`;
        const currentCount = accessCounts.get(userKey) || 0;
        const lastAccess = timeWindows.get(userKey) || 0;

        // Reset counter if more than 1 hour has passed
        if (currentTime - lastAccess > 3600000) {
          accessCounts.set(userKey, 1);
        } else {
          accessCounts.set(userKey, currentCount + 1);
        }

        timeWindows.set(userKey, currentTime);

        // Check for excessive access
        if ((accessCounts.get(userKey) || 0) > 100) {
          // More than 100 requests per hour
          await logAuditEvent(
            'ANOMALY_DETECTED',
            {
              anomalyType: 'EXCESSIVE_USER_ACCESS',
              userId,
              accessCount: accessCounts.get(userKey),
              timeWindow: '1_hour',
              ipAddress,
            },
            c.get('auditContext'),
          );
        }
      }

      // Track IP-based access
      if (ipAddress && ipAddress !== 'unknown') {
        const ipKey = `ip:${ipAddress}`;
        const currentCount = accessCounts.get(ipKey) || 0;
        const lastAccess = timeWindows.get(ipKey) || 0;

        if (currentTime - lastAccess > 3600000) {
          accessCounts.set(ipKey, 1);
        } else {
          accessCounts.set(ipKey, currentCount + 1);
        }

        timeWindows.set(ipKey, currentTime);

        // Check for suspicious IP activity
        if ((accessCounts.get(ipKey) || 0) > 500) {
          // More than 500 requests per hour from same IP
          await logAuditEvent(
            'ANOMALY_DETECTED',
            {
              anomalyType: 'EXCESSIVE_IP_ACCESS',
              ipAddress,
              accessCount: accessCounts.get(ipKey),
              timeWindow: '1_hour',
              userId,
            },
            c.get('auditContext'),
          );
        }
      }

      await next();
    } catch (error) {
      await logAuditEvent(
        'ANOMALY_DETECTION_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        c.get('auditContext'),
      );

      throw error;
    }
  };
}

// Helper functions

async function buildAuditContext(
  c: Context,
  options: AuditMiddlewareOptions,
  requestId: string,
): Promise<AuditEventContext> {
  const securityContext = c.get('securityContext');
  const rlsContext = c.get('rlsContext');

  return {
    userId: c.get('userId') || rlsContext?.userId,
    clinicId: c.get('clinicId') || rlsContext?.clinicId,
    patientId: c.get('patientId') || c.get('validatedPatientId'),
    professionalId: c.get('professionalId') || rlsContext?.professionalId,
    sessionId: c.get('sessionId') || c.req.header('x-session-id'),
    ipAddress: getClientIP(c),
    userAgent: c.req.header('user-agent'),
    requestId,
    emergencyAccess: options.emergencyAccess || securityContext?.emergencyAccess,
    justification: c.req.header('x-emergency-justification') || c.req.query('justification'),
    complianceFlags: {
      lgpd_compliant: true,
      rls_enforced: securityContext?.accessGranted ?? true,
      consent_validated: securityContext?.consentValidated ?? false,
      emergency_access: options.emergencyAccess || securityContext?.emergencyAccess,
      data_minimization: !options.captureResponse || !options.sensitiveData,
      purpose_limitation: true,
    },
  };
}

async function captureRequestData(c: Context): Promise<any> {
  try {
    const contentType = c.req.header('content-type');

    if (contentType?.includes('application/json')) {
      const body = await c.req.json();
      return sanitizeData(body);
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await c.req.formData();
      const formObject: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      return sanitizeData(formObject);
    }

    return { query: Object.fromEntries(c.req.queries()) };
  } catch {
    return { error: 'Failed to capture request data' };
  }
}

async function captureResponseData(c: Context): Promise<any> {
  try {
    // Note: This is a simplified implementation
    // In practice, you'd need to intercept the response stream
    return { statusCode: c.res.status };
  } catch {
    return { error: 'Failed to capture response data' };
  }
}

function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'ssn',
    'cpf',
    'creditCard',
    'bankAccount',
    'pin',
    'cvv',
    'signature',
    'privateKey',
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
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}

async function logAuditEvent(
  eventType: string,
  eventData: any,
  context?: AuditEventContext,
): Promise<void> {
  try {
    await comprehensiveAuditService.logEvent(eventType, eventData, context);
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw here to avoid breaking the main request flow
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: Context): string {
  return (
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || c.req.header('X-Real-IP')
    || c.req.header('CF-Connecting-IP')
    || 'unknown'
  );
}

// Export types
export type { AuditContext, AuditMiddlewareOptions };
