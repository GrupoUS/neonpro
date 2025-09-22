/**
 * Error Tracking Service with Healthcare Data Redaction
 *
 * Provides comprehensive error tracking and logging while ensuring
 * healthcare data privacy and LGPD compliance.
 *
 * Features:
 * - Automatic PHI (Protected Health Information) redaction
 * - Context-aware error classification
 * - Integration with Sentry and OpenTelemetry
 * - Healthcare compliance logging
 * - Performance impact monitoring
 */

import { SpanStatusCode, trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
// Healthcare data patterns for redaction
const HEALTHCARE_PATTERNS = {
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  phone:
    /\b(?:\+55\s?)?\(?(?:11|12|13|14|15|16|17|18|19|21|22|24|27|28|31|32|33|34|35|37|38|41|42|43|44|45|46|47|48|49|51|53|54|55|61|62|63|64|65|66|67|68|69|71|73|74|75|77|79|81|82|83|84|85|86|87|88|89|91|92|93|94|95|96|97|98|99)\)?\s?\d{4,5}-?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  rg: /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dX]\b/g,
  cns: /\b\d{3}\s?\d{4}\s?\d{4}\s?\d{4}\b/g,
  creditCard:
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
  medicalRecord: /\b(?:MR|PRON|PRONTUARIO)[:\-\s]*\d+\b/gi,
  procedure: /\b(?:CID|CIAP|TUSS)[:\-\s]*[A-Z0-9]+\b/gi,
} as const;

// Error severity levels
const ErrorSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;

// Error context schema
const ErrorContextSchema = z.object({
  _userId: z.string().optional(),
  patientId: z.string().optional(),
  clinicId: z.string().optional(),
  operationType: z
    .enum(['create', 'read', 'update', 'delete', 'export'])
    .optional(),
  endpoint: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  requestId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.unknown()).optional(),
});

type ErrorContext = z.infer<typeof ErrorContextSchema>;

// Healthcare error classification
const HealthcareErrorTypeSchema = z.enum([
  'data_access_violation',
  'lgpd_compliance_issue',
  'patient_data_exposure',
  'unauthorized_access',
  'data_integrity_violation',
  'performance_degradation',
  'service_unavailable',
  'validation_error',
  'business_logic_error',
  'external_service_error',
  'database_error',
  'authentication_error',
  'authorization_error',
  'rate_limit_exceeded',
  'configuration_error',
]);

type HealthcareErrorType = z.infer<typeof HealthcareErrorTypeSchema>;

interface RedactedError {
  message: string;
  originalMessage: string;
  redactedFields: string[];
  severity: ErrorSeverity;
  type: HealthcareErrorType;
  _context: ErrorContext;
  stack?: string;
  cause?: Error;
}

interface ErrorMetrics {
  totalErrors: number; // Changed from errorCount
  errorCount: number; // Keep for backwards compatibility
  errorRate: number;
  avgResponseTime: number;
  errorsByType: Record<HealthcareErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  lastError: Date | null; // Added for test compatibility
  lastUpdated: Date;
}

class HealthcareErrorTracker {
  private static instance: HealthcareErrorTracker;
  private tracer = trace.getTracer('healthcare-error-tracker');
  private errorMetrics: ErrorMetrics = {
    totalErrors: 0,
    errorCount: 0,
    errorRate: 0,
    avgResponseTime: 0,
    errorsByType: {} as Record<HealthcareErrorType, number>,
    errorsBySeverity: {} as Record<ErrorSeverity, number>,
    lastError: null,
    lastUpdated: new Date(),
  };

  private constructor() {
    // Initialize error type counters
    Object.values(HealthcareErrorTypeSchema.enum).forEach(type => {
      this.errorMetrics.errorsByType[type] = 0;
    });

    // Initialize severity counters
    Object.values(ErrorSeveritySchema.enum).forEach(severity => {
      this.errorMetrics.errorsBySeverity[severity] = 0;
    });
  }

  public static getInstance(): HealthcareErrorTracker {
    if (!HealthcareErrorTracker.instance) {
      HealthcareErrorTracker.instance = new HealthcareErrorTracker();
    }
    return HealthcareErrorTracker.instance;
  }

  /**
   * Redacts healthcare data from error messages and context
   */
  private redactHealthcareData(text: string): {
    redacted: string;
    fields: string[];
  } {
    let redactedText = text;
    const redactedFields: string[] = [];

    Object.entries(HEALTHCARE_PATTERNS).forEach(([field, _pattern]) => {
      if (pattern.test(redactedText)) {
        redactedFields.push(field);
        redactedText = redactedText.replace(
          pattern,
          `[REDACTED_${field.toUpperCase()}]`,
        );
      }
    });

    return { redacted: redactedText, fields: redactedFields };
  }

  /**
   * Classifies error type based on message and context
   */
  private classifyError(
    error: Error,
    _context: ErrorContext,
  ): HealthcareErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Patient data exposure detection
    if (
      message.includes('patient')
      && (message.includes('unauthorized') || message.includes('forbidden'))
    ) {
      return 'patient_data_exposure';
    }

    // LGPD compliance issues
    if (
      message.includes('lgpd')
      || message.includes('consent')
      || message.includes('privacy')
    ) {
      return 'lgpd_compliance_issue';
    }

    // Authentication errors
    if (
      message.includes('authentication')
      || message.includes('login')
      || message.includes('token')
    ) {
      return 'authentication_error';
    }

    // Authorization errors
    if (
      message.includes('authorization')
      || message.includes('permission')
      || message.includes('access denied')
    ) {
      return 'authorization_error';
    }

    // Database errors
    if (
      stack.includes('prisma')
      || stack.includes('supabase')
      || message.includes('database')
    ) {
      return 'database_error';
    }

    // Validation errors
    if (
      message.includes('validation')
      || message.includes('invalid')
      || stack.includes('zod')
    ) {
      return 'validation_error';
    }

    // Rate limiting
    if (
      message.includes('rate limit')
      || message.includes('too many requests')
    ) {
      return 'rate_limit_exceeded';
    }

    // Performance issues
    if (
      message.includes('timeout')
      || message.includes('slow')
      || message.includes('performance')
    ) {
      return 'performance_degradation';
    }

    // Service availability
    if (
      message.includes('unavailable')
      || message.includes('service down')
      || message.includes('connection')
    ) {
      return 'service_unavailable';
    }

    // External service errors
    if (
      context.endpoint?.includes('external')
      || message.includes('third party')
      || message.includes('api error')
    ) {
      return 'external_service_error';
    }

    // Default to business logic error
    return 'business_logic_error';
  }

  /**
   * Determines error severity based on type and context
   */
  private determineSeverity(
    errorType: HealthcareErrorType,
    _context: ErrorContext,
  ): ErrorSeverity {
    // Critical errors - immediate attention required
    if (
      errorType === 'patient_data_exposure'
      || errorType === 'data_access_violation'
      || errorType === 'lgpd_compliance_issue'
    ) {
      return 'critical';
    }

    // High severity - significant impact
    if (
      errorType === 'unauthorized_access'
      || errorType === 'data_integrity_violation'
      || errorType === 'service_unavailable'
    ) {
      return 'high';
    }

    // Medium severity - moderate impact
    if (
      errorType === 'performance_degradation'
      || errorType === 'database_error'
      || errorType === 'external_service_error'
    ) {
      return 'medium';
    }

    // Low severity - minimal impact
    return 'low';
  }

  /**
   * Redacts sensitive data from error context
   */
  private redactErrorContext(_context: ErrorContext): ErrorContext {
    const redactedContext = { ...context };

    // Redact IP address (keep only first two octets)
    if (redactedContext.ipAddress) {
      const ipParts = redactedContext.ipAddress.split('.');
      if (ipParts.length === 4) {
        redactedContext.ipAddress = `${ipParts[0]}.${ipParts[1]}.xxx.xxx`;
      }
    }

    // Redact user agent (keep only browser info)
    if (redactedContext.userAgent) {
      const browserMatch = redactedContext.userAgent.match(
        /(Chrome|Firefox|Safari|Edge)\/[\d.]+/,
      );
      redactedContext.userAgent = browserMatch
        ? browserMatch[0]
        : '[REDACTED_USER_AGENT]';
    }

    // Redact metadata recursively
    if (redactedContext.metadata) {
      redactedContext.metadata = this.redactMetadata(redactedContext.metadata);
    }

    return redactedContext;
  }

  /**
   * Redacts sensitive data from metadata objects
   */
  private redactMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, unknown> {
    const redacted: Record<string, unknown> = {};

    Object.entries(metadata).forEach(([key, _value]) => {
      if (typeof value === 'string') {
        const { redacted: redactedValue } = this.redactHealthcareData(value);
        redacted[key] = redactedValue;
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactMetadata(value as Record<string, unknown>);
      } else {
        redacted[key] = value;
      }
    });

    return redacted;
  }

  /**
   * Creates a redacted error suitable for logging and monitoring
   */
  public createRedactedError(
    error: Error,
    _context: Partial<ErrorContext> = {},
  ): RedactedError {
    // Validate and normalize context
    const validatedContext = ErrorContextSchema.parse(context);

    // Redact healthcare data from error message
    const { redacted: redactedMessage, fields: redactedFields } = this.redactHealthcareData(
      error.message,
    );

    // Classify error type and determine severity
    const errorType = this.classifyError(error, validatedContext);
    const severity = this.determineSeverity(errorType, validatedContext);

    // Redact context data
    const redactedContext = this.redactErrorContext(validatedContext);

    // Redact stack trace
    let redactedStack: string | undefined;
    if (error.stack) {
      const { redacted } = this.redactHealthcareData(error.stack);
      redactedStack = redacted;
    }

    return {
      message: redactedMessage,
      originalMessage: error.message, // Keep for internal debugging (not logged)
      redactedFields,
      severity,
      type: errorType,
      _context: redactedContext,
      stack: redactedStack,
      cause: (error as any).cause instanceof Error
        ? (error as any).cause
        : undefined,
    };
  }

  /**
   * Tracks error and sends to monitoring services
   */
  public async trackError(
    error: Error,
    _context: Partial<ErrorContext> = {},
  ): Promise<void> {
    return this.tracer.startActiveSpan(
      'track-healthcare-error',
      async span => {
        try {
          // Create redacted error
          const redactedError = this.createRedactedError(error, _context);

          // Update metrics
          this.updateMetrics(redactedError);

          // Set span attributes
          span.setAttributes({
            'error.type': redactedError.type,
            'error.severity': redactedError.severity,
            'error.redacted_fields': redactedError.redactedFields.join(','),
            'healthcare.patient_id': redactedError.context.patientId || 'none',
            'healthcare.clinic_id': redactedError.context.clinicId || 'none',
            'healthcare.operation': redactedError.context.operationType || 'unknown',
          });

          // Send to Sentry with redacted data
          Sentry.withScope(scope => {
            scope.setLevel(
              this.mapSeverityToSentryLevel(redactedError.severity),
            );
            scope.setTag('error.type', redactedError.type);
            scope.setTag('healthcare.compliant', 'true');

            // Add redacted context
            scope.setContext('healthcare_context', {
              clinicId: redactedError.context.clinicId,
              operationType: redactedError.context.operationType,
              endpoint: redactedError.context.endpoint,
              redactedFields: redactedError.redactedFields,
            });

            // Add performance context
            scope.setContext('performance', {
              requestId: redactedError.context.requestId,
              timestamp: redactedError.context.timestamp.toISOString(),
            });

            Sentry.captureException(new Error(redactedError.message));
          });

          // Log structured error
          this.logStructuredError(redactedError);

          span.setStatus({ code: SpanStatusCode.OK });
        } catch (trackingError) {
          span.recordException(trackingError as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: 'Failed to track error',
          });

          // Fallback logging
          console.error('Error tracking failed:', trackingError);
          console.error('Original error:', error.message);
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Maps error severity to Sentry severity level
   */
  private mapSeverityToSentryLevel(
    severity: ErrorSeverity,
  ): 'debug' | 'info' | 'warning' | 'error' | 'fatal' {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'fatal';
      default:
        return 'error';
    }
  }

  /**
   * Updates error metrics
   */
  private updateMetrics(redactedError: RedactedError): void {
    this.errorMetrics.totalErrors += 1; // Added for test compatibility
    this.errorMetrics.errorCount += 1;
    this.errorMetrics.errorsByType[redactedError.type] += 1;
    this.errorMetrics.errorsBySeverity[redactedError.severity] += 1;
    this.errorMetrics.lastError = new Date(); // Added for test compatibility
    this.errorMetrics.lastUpdated = new Date();

    // Calculate error rate (errors per minute over last hour)
    // This would typically use a more sophisticated time-window calculation
    const timeWindow = 60 * 60 * 1000; // 1 hour in milliseconds
    this.errorMetrics.errorRate = this.errorMetrics.errorCount / (timeWindow / (60 * 1000));
  }

  /**
   * Logs structured error data
   */
  private logStructuredError(redactedError: RedactedError): void {
    const logEntry = {
      level: redactedError.severity,
      message: redactedError.message,
      error_type: redactedError.type,
      redacted_fields: redactedError.redactedFields,
      _context: {
        clinic_id: redactedError.context.clinicId,
        operation_type: redactedError.context.operationType,
        endpoint: redactedError.context.endpoint,
        request_id: redactedError.context.requestId,
        timestamp: redactedError.context.timestamp.toISOString(),
      },
      healthcare_compliant: true,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Gets current error metrics
   */
  public getMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  /**
   * Resets error metrics (useful for testing)
   */
  public resetMetrics(): void {
    this.errorMetrics = {
      totalErrors: 0,
      errorCount: 0,
      errorRate: 0,
      avgResponseTime: 0,
      errorsByType: {} as Record<HealthcareErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      lastError: null,
      lastUpdated: new Date(),
    };

    // Reinitialize counters
    Object.values(HealthcareErrorTypeSchema.enum).forEach(type => {
      this.errorMetrics.errorsByType[type] = 0;
    });

    Object.values(ErrorSeveritySchema.enum).forEach(severity => {
      this.errorMetrics.errorsBySeverity[severity] = 0;
    });
  }

  /**
   * Creates an error tracking middleware for Hono
   */
  public createErrorMiddleware() {
    return async (error: Error, c: any) => {
      const _context: Partial<ErrorContext> = {
        endpoint: `${c.req.method} ${c.req.path}`,
        userAgent: c.req.header('user-agent'),
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        requestId: c.req.header('x-request-id'),
        _userId: c.get('userId'),
        clinicId: c.get('clinicId'),
      };

      await this.trackError(error, _context);

      // Don't expose internal error details to client
      const redactedError = this.createRedactedError(error, _context);

      return c.json(
        {
          error: {
            message: redactedError.severity === 'critical'
              ? 'Sistema temporariamente indisponível'
              : 'Erro interno do servidor',
            type: 'internal_error',
            requestId: context.requestId,
          },
        },
        500,
      );
    };
  }
}

// Export singleton instance
export const errorTracker = HealthcareErrorTracker.getInstance();

// Export types for external use
export type { ErrorContext, ErrorMetrics, ErrorSeverity, HealthcareErrorType, RedactedError };

// Export enums
export { ErrorSeveritySchema, HealthcareErrorTypeSchema };

// Export utility functions
export function trackError(
  error: Error,
  _context?: Partial<ErrorContext>,
): Promise<void> {
  return errorTracker.trackError(error, _context);
}

export function getErrorMetrics(): ErrorMetrics {
  return errorTracker.getMetrics();
}

export function createErrorMiddleware() {
  return errorTracker.createErrorMiddleware();
}

// Export factory function for backward compatibility
export function createHealthcareErrorTracker(): HealthcareErrorTracker {
  return HealthcareErrorTracker.getInstance();
}
