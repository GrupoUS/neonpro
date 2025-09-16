/**
 * Error Tracking Service
 * 
 * Healthcare-compliant error tracking and monitoring service with:
 * - Automatic PII redaction for LGPD compliance
 * - Healthcare impact assessment and categorization
 * - Real-time error alerting for patient safety
 * - Structured error data collection and analysis
 * - Integration with observability infrastructure
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Error event schema based on data-model.md specification
 * Compliant with LGPD Article 7 and healthcare data protection requirements
 */
export const ErrorEventSchema = z.object({
  id: z.string().describe('Unique error identifier'),
  timestamp: z.string().datetime().describe('ISO 8601 error occurrence timestamp'),
  errorType: z.enum([
    'javascript',
    'network', 
    'validation',
    'authentication',
    'authorization',
    'medical_data'
  ]).describe('Error categorization for healthcare workflows'),

  // Core error details
  message: z.string().max(1000).describe('Error message (automatically redacted)'),
  stack: z.string().optional().describe('Stack trace (automatically redacted)'),
  source: z.string().describe('Error source file or component'),
  lineNumber: z.number().optional().describe('Source line number'),
  columnNumber: z.number().optional().describe('Source column number'),

  // Healthcare impact assessment
  healthcareImpact: z.object({
    severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Healthcare severity level'),
    patientSafetyRisk: z.boolean().describe('Potential risk to patient safety'),
    dataIntegrityRisk: z.boolean().describe('Risk of data corruption or loss'),
    complianceRisk: z.boolean().describe('Risk of regulatory compliance violation'),
    workflowDisruption: z.enum(['none', 'minor', 'major', 'critical']).describe('Impact on clinical workflows')
  }).describe('Healthcare-specific impact assessment'),

  // User context (LGPD-compliant anonymization)
  userContext: z.object({
    anonymizedUserId: z.string().describe('LGPD-compliant anonymized user ID'),
    role: z.string().describe('User role in healthcare system'),
    currentWorkflow: z.string().optional().describe('Active healthcare workflow'),
    deviceType: z.string().describe('Device type and browser info')
  }).describe('Anonymized user context for debugging'),

  // Technical context for debugging
  technicalContext: z.object({
    url: z.string().describe('Page URL where error occurred'),
    httpMethod: z.string().optional().describe('HTTP method if API error'),
    statusCode: z.number().optional().describe('HTTP status code if applicable'),
    requestId: z.string().optional().describe('Request correlation ID'),
    apiEndpoint: z.string().optional().describe('API endpoint if applicable')
  }).describe('Technical debugging information'),

  // Resolution tracking for error management
  resolution: z.object({
    status: z.enum(['open', 'investigating', 'resolved', 'deferred']).describe('Resolution status'),
    assignedTo: z.string().optional().describe('Team member assigned to investigate'),
    resolvedAt: z.string().datetime().optional().describe('Resolution timestamp'),
    resolutionNotes: z.string().optional().describe('Resolution details and actions taken')
  }).optional().describe('Error resolution tracking')
});

export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

/**
 * Error tracking configuration schema
 */
export const ErrorTrackingConfigSchema = z.object({
  // Rate limiting and sampling
  maxErrorsPerMinute: z.number().default(100).describe('Maximum errors to process per minute'),
  samplingRate: z.number().min(0).max(1).default(1).describe('Error sampling rate (0-1)'),
  
  // Healthcare-specific settings
  criticalErrorAlertThreshold: z.number().default(1).describe('Critical errors before immediate alert'),
  patientSafetyErrorsEnabled: z.boolean().default(true).describe('Enable patient safety error tracking'),
  
  // LGPD compliance settings
  piiRedactionEnabled: z.boolean().default(true).describe('Enable automatic PII redaction'),
  dataRetentionDays: z.number().default(365).describe('Error data retention period in days'),
  anonymizationEnabled: z.boolean().default(true).describe('Enable user data anonymization'),
  
  // Integration settings
  enableSlackAlerts: z.boolean().default(false).describe('Send critical errors to Slack'),
  enableEmailAlerts: z.boolean().default(true).describe('Send critical errors via email'),
  enableSupabaseStorage: z.boolean().default(true).describe('Store errors in Supabase'),
  
  // Alert thresholds
  alertThresholds: z.object({
    criticalErrorsPerHour: z.number().default(5),
    highSeverityErrorsPerHour: z.number().default(20),
    networkErrorsPerMinute: z.number().default(10),
    authenticationErrorsPerMinute: z.number().default(15)
  }).describe('Error rate thresholds for alerting')
});

export type ErrorTrackingConfig = z.infer<typeof ErrorTrackingConfigSchema>;

/**
 * Error telemetry request schema (from OpenAPI contract)
 */
export const ErrorTelemetryRequestSchema = z.object({
  sessionId: z.string().regex(/^sess_[a-zA-Z0-9]{8,}$/).describe('Anonymized session identifier'),
  userId: z.string().regex(/^usr_(anon_)?[a-zA-Z0-9]{8,}$/).optional().describe('Anonymized user identifier'),
  
  error: z.object({
    message: z.string().max(1000).describe('Error message (automatically redacted)'),
    stack: z.string().max(10000).optional().describe('Stack trace (automatically redacted)'),
    type: z.enum([
      'javascript_error',
      'unhandled_promise_rejection', 
      'network_error',
      'validation_error',
      'authentication_error',
      'authorization_error'
    ]).describe('Error type classification'),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium').describe('Error severity level'),
    timestamp: z.string().datetime().describe('Error occurrence timestamp'),
    fingerprint: z.string().max(64).optional().describe('Error fingerprint for grouping'),
    tags: z.record(z.string()).optional().describe('Additional error tags (no PII)')
  }).describe('Error details'),
  
  context: z.object({
    userAgent: z.string().max(500).optional().describe('Browser user agent string'),
    viewport: z.string().regex(/^\d+x\d+$/).optional().describe('Browser viewport size'),
    connection: z.enum(['slow-2g', '2g', '3g', '4g', '5g', 'wifi', 'unknown']).optional().describe('Connection type'),
    timezone: z.string().optional().describe('User timezone'),
    locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/).optional().describe('User locale'),
    page: z.object({
      url: z.string().max(500).optional().describe('Page URL (without query parameters)'),
      title: z.string().max(200).optional().describe('Page title'),
      referrer: z.string().max(100).optional().describe('Referrer URL (domain only)')
    }).optional().describe('Page context')
  }).optional().describe('Request context'),
  
  lgpdConsent: z.object({
    hasConsent: z.boolean().describe('Whether user has given consent for data processing'),
    legalBasis: z.enum([
      'consent',
      'contract', 
      'legal_obligation',
      'vital_interests',
      'public_interest',
      'legitimate_interests'
    ]).describe('LGPD legal basis for data processing'),
    consentTimestamp: z.string().datetime().optional().describe('When consent was given'),
    purposes: z.array(z.enum([
      'performance_monitoring',
      'error_tracking',
      'security_monitoring', 
      'service_improvement'
    ])).optional().describe('Specific purposes for data processing')
  }).optional().describe('LGPD compliance data')
});

export type ErrorTelemetryRequest = z.infer<typeof ErrorTelemetryRequestSchema>;

// ============================================================================
// ERROR TRACKING SERVICE
// ============================================================================

/**
 * Healthcare-compliant error tracking service
 * Provides comprehensive error monitoring with automatic PII redaction
 */
export class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private errorCounts: Map<string, number> = new Map();
  private lastResetTime: Date = new Date();

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = ErrorTrackingConfigSchema.parse(config);
    this.initializeService();
  }

  /**
   * Initialize the error tracking service
   */
  private initializeService(): void {
    // Reset error counts every minute for rate limiting
    setInterval(() => {
      this.errorCounts.clear();
      this.lastResetTime = new Date();
    }, 60 * 1000);

    console.log('✅ Error Tracking Service initialized', {
      config: {
        maxErrorsPerMinute: this.config.maxErrorsPerMinute,
        samplingRate: this.config.samplingRate,
        piiRedactionEnabled: this.config.piiRedactionEnabled,
        patientSafetyErrorsEnabled: this.config.patientSafetyErrorsEnabled
      }
    });
  }

  /**
   * Track an error event with healthcare compliance
   */
  async trackError(request: ErrorTelemetryRequest): Promise<{
    success: boolean;
    errorId?: string;
    message: string;
  }> {
    try {
      // Validate request
      const validatedRequest = ErrorTelemetryRequestSchema.parse(request);
      
      // Check rate limits
      if (!this.checkRateLimit()) {
        return {
          success: false,
          message: 'Rate limit exceeded for error tracking'
        };
      }

      // Apply sampling if configured
      if (Math.random() > this.config.samplingRate) {
        return {
          success: true,
          message: 'Error sampled out based on sampling rate'
        };
      }

      // Create error event
      const errorEvent = this.createErrorEvent(validatedRequest);
      
      // Redact PII if enabled
      const sanitizedError = this.config.piiRedactionEnabled 
        ? this.redactPII(errorEvent)
        : errorEvent;

      // Assess healthcare impact
      const healthcareAssessment = this.assessHealthcareImpact(sanitizedError);
      sanitizedError.healthcareImpact = healthcareAssessment;

      // Store error (mock implementation)
      await this.storeError(sanitizedError);

      // Send alerts if critical
      if (healthcareAssessment.severity === 'critical' || healthcareAssessment.patientSafetyRisk) {
        await this.sendCriticalErrorAlert(sanitizedError);
      }

      // Track error metrics
      this.updateErrorMetrics(sanitizedError);

      return {
        success: true,
        errorId: sanitizedError.id,
        message: 'Error successfully tracked and analyzed'
      };

    } catch (error) {
      console.error('❌ Error in ErrorTrackingService.trackError:', error);
      return {
        success: false,
        message: 'Failed to track error due to internal service error'
      };
    }
  }

  /**
   * Create error event from telemetry request
   */
  private createErrorEvent(request: ErrorTelemetryRequest): ErrorEvent {
    const errorId = `err_${nanoid(12)}`;
    
    return {
      id: errorId,
      timestamp: request.error.timestamp,
      errorType: this.mapErrorType(request.error.type),
      
      // Core error details
      message: request.error.message,
      stack: request.error.stack,
      source: this.extractSourceFromStack(request.error.stack) || 'unknown',
      lineNumber: this.extractLineNumber(request.error.stack),
      columnNumber: this.extractColumnNumber(request.error.stack),

      // Healthcare impact (will be assessed separately)
      healthcareImpact: {
        severity: request.error.severity,
        patientSafetyRisk: false,
        dataIntegrityRisk: false,
        complianceRisk: false,
        workflowDisruption: 'none'
      },

      // User context (anonymized)
      userContext: {
        anonymizedUserId: request.userId || 'anonymous',
        role: this.extractUserRole(request.userId),
        currentWorkflow: this.detectWorkflowFromContext(request),
        deviceType: this.extractDeviceType(request.context?.userAgent)
      },

      // Technical context
      technicalContext: {
        url: request.context?.page?.url || 'unknown',
        httpMethod: this.extractHttpMethod(request.error.message),
        statusCode: this.extractStatusCode(request.error.message),
        requestId: this.generateRequestId(),
        apiEndpoint: this.extractApiEndpoint(request.context?.page?.url)
      }
    };
  }

  /**
   * Map telemetry error type to internal error type
   */
  private mapErrorType(type: string): ErrorEvent['errorType'] {
    const mapping: Record<string, ErrorEvent['errorType']> = {
      'javascript_error': 'javascript',
      'unhandled_promise_rejection': 'javascript',
      'network_error': 'network',
      'validation_error': 'validation',
      'authentication_error': 'authentication',
      'authorization_error': 'authorization'
    };
    
    return mapping[type] || 'javascript';
  }

  /**
   * Redact PII from error data for LGPD compliance
   */
  private redactPII(error: ErrorEvent): ErrorEvent {
    const redactedError = { ...error };
    
    // Redact PII patterns from error message
    redactedError.message = this.redactPIIFromText(redactedError.message);
    
    // Redact PII from stack trace
    if (redactedError.stack) {
      redactedError.stack = this.redactPIIFromText(redactedError.stack);
    }
    
    // Redact URL parameters that might contain PII
    redactedError.technicalContext.url = this.redactUrlParameters(redactedError.technicalContext.url);
    
    return redactedError;
  }

  /**
   * Redact PII patterns from text
   */
  private redactPIIFromText(text: string): string {
    // Common PII patterns for Brazilian healthcare
    const piiPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF format
      /\b\d{11}\b/g, // CPF without formatting
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, // Phone numbers
      /\bpassword[=:]\s*\S+/gi, // Passwords
      /\btoken[=:]\s*\S+/gi, // Tokens
      /\bauthentication[=:]\s*\S+/gi, // Auth data
    ];
    
    let redactedText = text;
    piiPatterns.forEach(pattern => {
      redactedText = redactedText.replace(pattern, '[REDACTED]');
    });
    
    return redactedText;
  }

  /**
   * Redact URL parameters that might contain PII
   */
  private redactUrlParameters(url: string): string {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['token', 'auth', 'password', 'email', 'cpf', 'phone'];
      
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      
      return urlObj.toString();
    } catch {
      return url; // Return original if URL parsing fails
    }
  }

  /**
   * Assess healthcare impact of error
   */
  private assessHealthcareImpact(error: ErrorEvent): ErrorEvent['healthcareImpact'] {
    const impact = { ...error.healthcareImpact };
    
    // Assess patient safety risk
    const patientSafetyKeywords = [
      'patient', 'medical', 'medication', 'allergy', 'emergency', 
      'diagnosis', 'treatment', 'prescription', 'vital', 'critical'
    ];
    
    const errorText = `${error.message} ${error.source}`.toLowerCase();
    impact.patientSafetyRisk = patientSafetyKeywords.some(keyword => 
      errorText.includes(keyword)
    );
    
    // Assess data integrity risk
    const dataIntegrityKeywords = [
      'database', 'save', 'update', 'delete', 'corrupt', 'lost', 
      'transaction', 'rollback', 'integrity', 'constraint'
    ];
    
    impact.dataIntegrityRisk = dataIntegrityKeywords.some(keyword => 
      errorText.includes(keyword)
    );
    
    // Assess compliance risk
    impact.complianceRisk = error.errorType === 'authorization' || 
                           error.errorType === 'authentication' ||
                           impact.patientSafetyRisk;
    
    // Determine workflow disruption level
    if (impact.patientSafetyRisk) {
      impact.workflowDisruption = 'critical';
      impact.severity = 'critical';
    } else if (impact.dataIntegrityRisk) {
      impact.workflowDisruption = 'major';
      impact.severity = impact.severity === 'low' ? 'medium' : impact.severity;
    } else if (error.errorType === 'network') {
      impact.workflowDisruption = 'minor';
    }
    
    return impact;
  }

  /**
   * Store error in database (mock implementation)
   */
  private async storeError(error: ErrorEvent): Promise<void> {
    // TODO: Implement actual Supabase storage
    console.log('📁 Storing error in database:', {
      id: error.id,
      type: error.errorType,
      severity: error.healthcareImpact.severity,
      patientSafetyRisk: error.healthcareImpact.patientSafetyRisk,
      timestamp: error.timestamp
    });
  }

  /**
   * Send critical error alerts
   */
  private async sendCriticalErrorAlert(error: ErrorEvent): Promise<void> {
    console.log('🚨 CRITICAL ERROR ALERT:', {
      errorId: error.id,
      severity: error.healthcareImpact.severity,
      patientSafetyRisk: error.healthcareImpact.patientSafetyRisk,
      message: error.message,
      workflowDisruption: error.healthcareImpact.workflowDisruption
    });
    
    // TODO: Implement actual alerting (Slack, email, etc.)
    if (this.config.enableEmailAlerts) {
      await this.sendEmailAlert(error);
    }
    
    if (this.config.enableSlackAlerts) {
      await this.sendSlackAlert(error);
    }
  }

  /**
   * Send email alert (mock implementation)
   */
  private async sendEmailAlert(error: ErrorEvent): Promise<void> {
    console.log('📧 Sending email alert for critical error:', error.id);
    // TODO: Implement email service integration
  }

  /**
   * Send Slack alert (mock implementation)
   */
  private async sendSlackAlert(error: ErrorEvent): Promise<void> {
    console.log('💬 Sending Slack alert for critical error:', error.id);
    // TODO: Implement Slack webhook integration
  }

  /**
   * Update error metrics for monitoring
   */
  private updateErrorMetrics(error: ErrorEvent): void {
    const metricKey = `${error.errorType}_${error.healthcareImpact.severity}`;
    const currentCount = this.errorCounts.get(metricKey) || 0;
    this.errorCounts.set(metricKey, currentCount + 1);
    
    // Check alert thresholds
    this.checkAlertThresholds();
  }

  /**
   * Check if alert thresholds are exceeded
   */
  private checkAlertThresholds(): void {
    const criticalErrors = this.errorCounts.get('javascript_critical') || 0;
    const authErrors = this.errorCounts.get('authentication_high') || 0;
    
    if (criticalErrors >= this.config.alertThresholds.criticalErrorsPerHour) {
      console.log('🚨 Critical error threshold exceeded:', criticalErrors);
    }
    
    if (authErrors >= this.config.alertThresholds.authenticationErrorsPerMinute) {
      console.log('🚨 Authentication error threshold exceeded:', authErrors);
    }
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(): boolean {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    return totalErrors < this.config.maxErrorsPerMinute;
  }

  /**
   * Extract source file from stack trace
   */
  private extractSourceFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    const sourceMatch = stack.match(/at .* \((.+?):\d+:\d+\)/);
    return sourceMatch ? sourceMatch[1] : undefined;
  }

  /**
   * Extract line number from stack trace
   */
  private extractLineNumber(stack?: string): number | undefined {
    if (!stack) return undefined;
    
    const lineMatch = stack.match(/:(\d+):\d+/);
    return lineMatch ? parseInt(lineMatch[1]) : undefined;
  }

  /**
   * Extract column number from stack trace
   */
  private extractColumnNumber(stack?: string): number | undefined {
    if (!stack) return undefined;
    
    const columnMatch = stack.match(/:(\d+)$/);
    return columnMatch ? parseInt(columnMatch[1]) : undefined;
  }

  /**
   * Extract user role from user ID
   */
  private extractUserRole(userId?: string): string {
    if (!userId) return 'anonymous';
    
    // Mock role extraction based on user ID pattern
    if (userId.includes('admin')) return 'administrator';
    if (userId.includes('doc')) return 'doctor';
    if (userId.includes('nurse')) return 'nurse';
    if (userId.includes('patient')) return 'patient';
    
    return 'user';
  }

  /**
   * Detect workflow from request context
   */
  private detectWorkflowFromContext(request: ErrorTelemetryRequest): string | undefined {
    const url = request.context?.page?.url || '';
    
    if (url.includes('/patient')) return 'patient_management';
    if (url.includes('/appointment')) return 'appointment_scheduling';
    if (url.includes('/medical-record')) return 'medical_records';
    if (url.includes('/prescription')) return 'prescription_management';
    if (url.includes('/emergency')) return 'emergency_response';
    
    return undefined;
  }

  /**
   * Extract device type from user agent
   */
  private extractDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      return /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Extract HTTP method from error message
   */
  private extractHttpMethod(message: string): string | undefined {
    const methodMatch = message.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i);
    return methodMatch ? methodMatch[1].toUpperCase() : undefined;
  }

  /**
   * Extract HTTP status code from error message
   */
  private extractStatusCode(message: string): number | undefined {
    const statusMatch = message.match(/\b(status|code|error)\s*:?\s*(\d{3})\b/i);
    return statusMatch ? parseInt(statusMatch[2]) : undefined;
  }

  /**
   * Generate request ID for correlation
   */
  private generateRequestId(): string {
    return `req_${nanoid(12)}`;
  }

  /**
   * Extract API endpoint from URL
   */
  private extractApiEndpoint(url?: string): string | undefined {
    if (!url) return undefined;
    
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/api/') ? urlObj.pathname : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get error tracking statistics
   */
  getStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    lastResetTime: Date;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    this.errorCounts.forEach((count, key) => {
      const [type, severity] = key.split('_');
      errorsByType[type] = (errorsByType[type] || 0) + count;
      errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + count;
    });
    
    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      lastResetTime: this.lastResetTime
    };
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

/**
 * Default error tracking service instance
 * Pre-configured with healthcare-optimized settings
 */
export const errorTrackingService = new ErrorTrackingService({
  maxErrorsPerMinute: 100,
  samplingRate: 1.0, // Track all errors in healthcare context
  criticalErrorAlertThreshold: 1,
  patientSafetyErrorsEnabled: true,
  piiRedactionEnabled: true,
  dataRetentionDays: 365, // 1 year for healthcare compliance
  anonymizationEnabled: true,
  enableEmailAlerts: true,
  enableSlackAlerts: false,
  enableSupabaseStorage: true,
  alertThresholds: {
    criticalErrorsPerHour: 3, // Very low threshold for healthcare
    highSeverityErrorsPerHour: 10,
    networkErrorsPerMinute: 5,
    authenticationErrorsPerMinute: 8
  }
});

/**
 * Export types for external use
 */
export type {
  ErrorEvent,
  ErrorTrackingConfig,
  ErrorTelemetryRequest
};