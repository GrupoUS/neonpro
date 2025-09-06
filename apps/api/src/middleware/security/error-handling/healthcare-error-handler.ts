/**
 * 🚨 Healthcare Error Handling Middleware - NeonPro API
 * ====================================================
 *
 * Production-ready error handling for Brazilian healthcare applications:
 * - LGPD-compliant error responses (no sensitive data leakage)
 * - Medical error context preservation for audit
 * - Emergency access error handling
 * - Professional accountability error tracking
 * - ANVISA/CFM regulatory compliance
 * - Structured error reporting for monitoring
 * - Healthcare-specific error classification
 */

import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

// Healthcare-specific error types
export enum HealthcareErrorType {
  MEDICAL_DATA_ACCESS = "medical_data_access",
  PATIENT_PRIVACY_VIOLATION = "patient_privacy_violation",
  PROFESSIONAL_LICENSE_ERROR = "professional_license_error",
  LGPD_COMPLIANCE_ERROR = "lgpd_compliance_error",
  EMERGENCY_ACCESS_ERROR = "emergency_access_error",
  SYSTEM_INTEGRATION_ERROR = "system_integration_error",
  AUTHENTICATION_ERROR = "authentication_error",
  AUTHORIZATION_ERROR = "authorization_error",
  VALIDATION_ERROR = "validation_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  INTERNAL_SYSTEM_ERROR = "internal_system_error",
  DATABASE_ERROR = "database_error",
  EXTERNAL_API_ERROR = "external_api_error",
  AUDIT_LOGGING_ERROR = "audit_logging_error",
}

// Error severity levels for healthcare
export enum HealthcareErrorSeverity {
  LOW = "low", // Non-critical operational errors
  MEDIUM = "medium", // Service degradation
  HIGH = "high", // Service interruption affecting patient care
  CRITICAL = "critical", // Life-threatening system failure
  EMERGENCY = "emergency", // Immediate intervention required
}

// Error classification for regulatory compliance
export enum RegulatoryImpact {
  NONE = "none",
  LGPD_REPORTABLE = "lgpd_reportable", // Must be reported under LGPD
  ANVISA_REPORTABLE = "anvisa_reportable", // Must be reported to ANVISA
  CFM_REPORTABLE = "cfm_reportable", // Must be reported to CFM
  PATIENT_NOTIFICATION = "patient_notification", // Patient must be notified
  PROVIDER_NOTIFICATION = "provider_notification", // Healthcare provider must be notified
}

// Structured healthcare error interface
interface HealthcareError {
  // Basic error information
  id: string;
  timestamp: string;
  type: HealthcareErrorType;
  severity: HealthcareErrorSeverity;
  regulatoryImpact: RegulatoryImpact;

  // Request context
  requestId: string;
  userId?: string;
  patientId?: string; // When applicable
  providerId?: string; // Healthcare provider involved
  sessionId?: string;

  // Error details (sanitized for response)
  message: string;
  code: string;
  statusCode: number;

  // Internal context (for logging only)
  internal: {
    originalError?: Error;
    stackTrace?: string;
    databaseQuery?: string; // Sanitized
    apiEndpoint?: string;
    parameters?: Record<string, unknown>; // Sanitized
    systemState?: Record<string, unknown>;
  };

  // Healthcare context
  medical: {
    emergencyContext?: boolean;
    patientDataInvolved?: boolean;
    medicalRecordAccess?: boolean;
    prescriptionInvolved?: boolean;
    diagnosticDataInvolved?: boolean;
  };

  // Compliance and audit
  compliance: {
    lgpdSensitive: boolean;
    auditRequired: boolean;
    reportingRequired: boolean;
    patientNotificationRequired: boolean;
    retentionPeriod: number; // days
  };

  // Recovery information
  recovery: {
    retryable: boolean;
    retryAfterSeconds?: number;
    alternativeEndpoints?: string[];
    emergencyProcedure?: string;
  };
}

// Error response format for clients (LGPD-compliant)
interface HealthcareErrorResponse {
  success: false;
  error: {
    id: string;
    type: HealthcareErrorType;
    code: string;
    message: string;
    timestamp: string;
    statusCode: number;
  };
  metadata: {
    requestId: string;
    retryable: boolean;
    retryAfterSeconds?: number;
    emergencyContact?: string;
    supportReference?: string;
  };
  compliance: {
    lgpdCompliant: boolean;
    auditLogged: boolean;
    patientRights?: {
      dataAccess: string;
      dataCorrection: string;
      dataPortability: string;
      dataErasure: string;
    };
  };
}

/**
 * Healthcare Error Handler Class
 */
export class HealthcareErrorHandler {
  private auditLogger: unknown;
  private monitoringSystem: unknown;
  private emergencyNotificationSystem: unknown;

  constructor(options: {
    auditLogger?: unknown;
    monitoringSystem?: unknown;
    emergencyNotificationSystem?: unknown;
  } = {}) {
    this.auditLogger = options.auditLogger;
    this.monitoringSystem = options.monitoringSystem;
    this.emergencyNotificationSystem = options.emergencyNotificationSystem;
  }

  /**
   * Process and handle healthcare errors
   */
  async handleError(
    error: Error | HTTPException,
    context: Context,
    additionalContext?: {
      userId?: string;
      patientId?: string;
      providerId?: string;
      emergencyContext?: boolean;
    },
  ): Promise<HealthcareErrorResponse> {
    // Generate unique error ID
    const errorId = this.generateErrorId();
    const requestId = context.get("requestId") || this.generateRequestId();

    // Classify the error
    const classification = this.classifyError(error, context);

    // Create structured healthcare error
    const healthcareError: HealthcareError = {
      id: errorId,
      timestamp: new Date().toISOString(),
      type: classification.type,
      severity: classification.severity,
      regulatoryImpact: classification.regulatoryImpact,
      requestId,
      userId: additionalContext?.userId,
      patientId: additionalContext?.patientId,
      providerId: additionalContext?.providerId,
      sessionId: context.get("sessionId"),
      message: this.sanitizeErrorMessage(error.message, classification.type),
      code: this.getErrorCode(error),
      statusCode: this.getStatusCode(error),
      internal: {
        originalError: error,
        stackTrace: error.stack,
        apiEndpoint: `${context.req.method} ${context.req.path}`,
        parameters: this.sanitizeParameters(context),
        systemState: this.getSystemState(context),
      },
      medical: {
        emergencyContext: additionalContext?.emergencyContext || false,
        patientDataInvolved: this.detectPatientDataInvolvement(context, error),
        medicalRecordAccess: this.detectMedicalRecordAccess(context),
        prescriptionInvolved: this.detectPrescriptionInvolvement(context),
        diagnosticDataInvolved: this.detectDiagnosticDataInvolvement(context),
      },
      compliance: {
        lgpdSensitive: this.isLGPDSensitive(classification.type, context),
        auditRequired: this.isAuditRequired(classification),
        reportingRequired: this.isReportingRequired(classification),
        patientNotificationRequired: this.isPatientNotificationRequired(classification),
        retentionPeriod: this.getRetentionPeriod(classification),
      },
      recovery: {
        retryable: this.isRetryable(error),
        retryAfterSeconds: this.getRetryAfterSeconds(classification.type),
        alternativeEndpoints: this.getAlternativeEndpoints(context.req.path),
        emergencyProcedure: this.getEmergencyProcedure(classification.type),
      },
    };

    // Process the error (logging, monitoring, notifications)
    await this.processHealthcareError(healthcareError);

    // Return sanitized response
    return this.createErrorResponse(healthcareError);
  }

  /**
   * Classify error type and determine handling strategy
   */
  private classifyError(
    error: Error | HTTPException,
    context: Context,
  ): {
    type: HealthcareErrorType;
    severity: HealthcareErrorSeverity;
    regulatoryImpact: RegulatoryImpact;
  } {
    // HTTP Exception classification
    if (error instanceof HTTPException) {
      return this.classifyHTTPException(error, context);
    }

    // Database errors
    if (this.isDatabaseError(error)) {
      return {
        type: HealthcareErrorType.DATABASE_ERROR,
        severity: HealthcareErrorSeverity.HIGH,
        regulatoryImpact: this.isPatientDataEndpoint(context)
          ? RegulatoryImpact.PATIENT_NOTIFICATION
          : RegulatoryImpact.NONE,
      };
    }

    // Authentication/Authorization errors
    if (this.isAuthError(error)) {
      return {
        type: HealthcareErrorType.AUTHENTICATION_ERROR,
        severity: HealthcareErrorSeverity.MEDIUM,
        regulatoryImpact: RegulatoryImpact.LGPD_REPORTABLE,
      };
    }

    // External API errors
    if (this.isExternalAPIError(error)) {
      return {
        type: HealthcareErrorType.EXTERNAL_API_ERROR,
        severity: HealthcareErrorSeverity.MEDIUM,
        regulatoryImpact: RegulatoryImpact.NONE,
      };
    }

    // Default to internal system error
    return {
      type: HealthcareErrorType.INTERNAL_SYSTEM_ERROR,
      severity: HealthcareErrorSeverity.HIGH,
      regulatoryImpact: this.isPatientDataEndpoint(context)
        ? RegulatoryImpact.PATIENT_NOTIFICATION
        : RegulatoryImpact.NONE,
    };
  }

  /**
   * Classify HTTP exceptions
   */
  private classifyHTTPException(
    error: HTTPException,
    context: Context,
  ): {
    type: HealthcareErrorType;
    severity: HealthcareErrorSeverity;
    regulatoryImpact: RegulatoryImpact;
  } {
    switch (error.status) {
      case 400: // Bad Request
        return {
          type: HealthcareErrorType.VALIDATION_ERROR,
          severity: HealthcareErrorSeverity.LOW,
          regulatoryImpact: RegulatoryImpact.NONE,
        };

      case 401: // Unauthorized
        return {
          type: HealthcareErrorType.AUTHENTICATION_ERROR,
          severity: HealthcareErrorSeverity.MEDIUM,
          regulatoryImpact: RegulatoryImpact.LGPD_REPORTABLE,
        };

      case 403: // Forbidden
        return {
          type: HealthcareErrorType.AUTHORIZATION_ERROR,
          severity: this.isPatientDataEndpoint(context)
            ? HealthcareErrorSeverity.HIGH
            : HealthcareErrorSeverity.MEDIUM,
          regulatoryImpact: RegulatoryImpact.LGPD_REPORTABLE,
        };

      case 429: // Too Many Requests
        return {
          type: HealthcareErrorType.RATE_LIMIT_ERROR,
          severity: context.req.header("X-Emergency-Access")
            ? HealthcareErrorSeverity.CRITICAL
            : HealthcareErrorSeverity.LOW,
          regulatoryImpact: RegulatoryImpact.NONE,
        };

      case 500: // Internal Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        return {
          type: HealthcareErrorType.INTERNAL_SYSTEM_ERROR,
          severity: HealthcareErrorSeverity.HIGH,
          regulatoryImpact: this.isPatientDataEndpoint(context)
            ? RegulatoryImpact.PATIENT_NOTIFICATION
            : RegulatoryImpact.NONE,
        };

      default:
        return {
          type: HealthcareErrorType.INTERNAL_SYSTEM_ERROR,
          severity: HealthcareErrorSeverity.MEDIUM,
          regulatoryImpact: RegulatoryImpact.NONE,
        };
    }
  }

  /**
   * Process healthcare error (logging, monitoring, notifications)
   */
  private async processHealthcareError(error: HealthcareError): Promise<void> {
    try {
      // Log error for audit if required
      if (error.compliance.auditRequired) {
        await this.auditLog(error);
      }

      // Send to monitoring system
      await this.sendToMonitoring(error);

      // Handle emergency notifications
      if (
        error.severity === HealthcareErrorSeverity.CRITICAL
        || error.severity === HealthcareErrorSeverity.EMERGENCY
      ) {
        await this.sendEmergencyNotification(error);
      }

      // Handle regulatory reporting
      if (error.compliance.reportingRequired) {
        await this.scheduleRegulatoryReporting(error);
      }

      // Handle patient notifications
      if (error.compliance.patientNotificationRequired && error.patientId) {
        await this.schedulePatientNotification(error);
      }
    } catch (processingError) {
      console.error("Error processing healthcare error:", processingError);
      // Continue execution - don't let error processing break the main flow
    }
  }

  /**
   * Create sanitized error response for client
   */
  private createErrorResponse(error: HealthcareError): HealthcareErrorResponse {
    return {
      success: false,
      error: {
        id: error.id,
        type: error.type,
        code: error.code,
        message: error.message, // Already sanitized
        timestamp: error.timestamp,
        statusCode: error.statusCode,
      },
      metadata: {
        requestId: error.requestId,
        retryable: error.recovery.retryable,
        retryAfterSeconds: error.recovery.retryAfterSeconds,
        emergencyContact: this.getEmergencyContact(error.severity),
        supportReference: this.getSupportReference(error.id),
      },
      compliance: {
        lgpdCompliant: true,
        auditLogged: error.compliance.auditRequired,
        patientRights: error.compliance.lgpdSensitive
          ? {
            dataAccess: "https://neonpro.health/lgpd/data-access",
            dataCorrection: "https://neonpro.health/lgpd/data-correction",
            dataPortability: "https://neonpro.health/lgpd/data-portability",
            dataErasure: "https://neonpro.health/lgpd/data-erasure",
          }
          : undefined,
      },
    };
  }

  /**
   * Sanitize error message to remove sensitive information
   */
  private sanitizeErrorMessage(message: string, errorType: HealthcareErrorType): string {
    // Remove potentially sensitive information
    let sanitized = message
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "CPF-***") // CPF numbers
      .replace(/\b\d{15}\b/g, "CNS-***") // CNS numbers
      .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, "email-***") // Email addresses
      .replace(/\b\d{10,11}\b/g, "phone-***") // Phone numbers
      .replace(/\bpassword[^=\s]*[=:]\s*[^\s]+/gi, "password=***") // Passwords
      .replace(/\btoken[^=\s]*[=:]\s*[^\s]+/gi, "token=***"); // Tokens

    // Healthcare-specific message mapping
    const messageMap: Record<HealthcareErrorType, string> = {
      [HealthcareErrorType.MEDICAL_DATA_ACCESS]: "Unable to access medical data at this time",
      [HealthcareErrorType.PATIENT_PRIVACY_VIOLATION]:
        "Access restricted to protect patient privacy",
      [HealthcareErrorType.PROFESSIONAL_LICENSE_ERROR]:
        "Healthcare professional license verification failed",
      [HealthcareErrorType.LGPD_COMPLIANCE_ERROR]:
        "Request does not comply with data protection regulations",
      [HealthcareErrorType.EMERGENCY_ACCESS_ERROR]:
        "Emergency access procedures could not be completed",
      [HealthcareErrorType.SYSTEM_INTEGRATION_ERROR]:
        "Healthcare system integration is currently unavailable",
      [HealthcareErrorType.AUTHENTICATION_ERROR]:
        "Authentication failed - please verify your credentials",
      [HealthcareErrorType.AUTHORIZATION_ERROR]:
        "You do not have permission to access this resource",
      [HealthcareErrorType.VALIDATION_ERROR]: "The provided information is invalid",
      [HealthcareErrorType.RATE_LIMIT_ERROR]: "Too many requests - please try again later",
      [HealthcareErrorType.INTERNAL_SYSTEM_ERROR]:
        "A system error occurred - our technical team has been notified",
      [HealthcareErrorType.DATABASE_ERROR]: "Data service is temporarily unavailable",
      [HealthcareErrorType.EXTERNAL_API_ERROR]:
        "External healthcare service is currently unavailable",
      [HealthcareErrorType.AUDIT_LOGGING_ERROR]: "Audit system error - please contact support",
    };

    return messageMap[errorType] || sanitized || "An unexpected error occurred";
  }

  /**
   * Utility methods for error classification
   */
  private isDatabaseError(error: Error): boolean {
    const dbErrorKeywords = ["connection", "database", "query", "constraint", "relation", "column"];
    return dbErrorKeywords.some(keyword =>
      error.message.toLowerCase().includes(keyword)
      || error.name.toLowerCase().includes(keyword)
    );
  }

  private isAuthError(error: Error): boolean {
    const authErrorKeywords = ["auth", "token", "unauthorized", "forbidden", "permission"];
    return authErrorKeywords.some(keyword => error.message.toLowerCase().includes(keyword));
  }

  private isExternalAPIError(error: Error): boolean {
    const apiErrorKeywords = ["fetch", "network", "timeout", "upstream", "external"];
    return apiErrorKeywords.some(keyword => error.message.toLowerCase().includes(keyword));
  }

  private isPatientDataEndpoint(context: Context): boolean {
    const patientDataPaths = ["/patients", "/medical-records", "/prescriptions", "/diagnostics"];
    return patientDataPaths.some(path => context.req.path.includes(path));
  }

  private detectPatientDataInvolvement(context: Context, error: Error): boolean {
    return this.isPatientDataEndpoint(context)
      || context.get("patientId") !== undefined
      || error.message.toLowerCase().includes("patient");
  }

  private detectMedicalRecordAccess(context: Context): boolean {
    return context.req.path.includes("/medical-records")
      || context.req.path.includes("/health-records");
  }

  private detectPrescriptionInvolvement(context: Context): boolean {
    return context.req.path.includes("/prescription")
      || context.req.path.includes("/medication");
  }

  private detectDiagnosticDataInvolvement(context: Context): boolean {
    return context.req.path.includes("/diagnostic")
      || context.req.path.includes("/lab-result")
      || context.req.path.includes("/exam");
  }

  private isLGPDSensitive(type: HealthcareErrorType, context: Context): boolean {
    const lgpdSensitiveTypes = [
      HealthcareErrorType.MEDICAL_DATA_ACCESS,
      HealthcareErrorType.PATIENT_PRIVACY_VIOLATION,
      HealthcareErrorType.LGPD_COMPLIANCE_ERROR,
    ];
    return lgpdSensitiveTypes.includes(type) || this.isPatientDataEndpoint(context);
  }

  private isAuditRequired(classification: {
    type: HealthcareErrorType;
    severity: HealthcareErrorSeverity;
    regulatoryImpact: RegulatoryImpact;
  }): boolean {
    return classification.severity === HealthcareErrorSeverity.HIGH
      || classification.severity === HealthcareErrorSeverity.CRITICAL
      || classification.severity === HealthcareErrorSeverity.EMERGENCY
      || classification.regulatoryImpact !== RegulatoryImpact.NONE;
  }

  private isReportingRequired(classification: {
    regulatoryImpact: RegulatoryImpact;
  }): boolean {
    return [
      RegulatoryImpact.LGPD_REPORTABLE,
      RegulatoryImpact.ANVISA_REPORTABLE,
      RegulatoryImpact.CFM_REPORTABLE,
    ].includes(classification.regulatoryImpact);
  }

  private isPatientNotificationRequired(classification: {
    regulatoryImpact: RegulatoryImpact;
  }): boolean {
    return classification.regulatoryImpact === RegulatoryImpact.PATIENT_NOTIFICATION;
  }

  private getRetentionPeriod(classification: {
    type: HealthcareErrorType;
    severity: HealthcareErrorSeverity;
  }): number {
    // Brazilian healthcare data retention requirements
    if (
      classification.severity === HealthcareErrorSeverity.CRITICAL
      || classification.severity === HealthcareErrorSeverity.EMERGENCY
    ) {
      return 2555; // 7 years for critical medical errors
    }
    return 1825; // 5 years for standard errors
  }

  private isRetryable(error: Error | HTTPException): boolean {
    if (error instanceof HTTPException) {
      // Retryable HTTP status codes
      const retryableCodes = [429, 500, 502, 503, 504];
      return retryableCodes.includes(error.status);
    }

    // Network or temporary errors are retryable
    const retryableKeywords = ["timeout", "network", "connection", "temporary"];
    return retryableKeywords.some(keyword => error.message.toLowerCase().includes(keyword));
  }

  private getRetryAfterSeconds(type: HealthcareErrorType): number | undefined {
    const retryConfig: Record<HealthcareErrorType, number | undefined> = {
      [HealthcareErrorType.RATE_LIMIT_ERROR]: 60,
      [HealthcareErrorType.EXTERNAL_API_ERROR]: 30,
      [HealthcareErrorType.DATABASE_ERROR]: 15,
      [HealthcareErrorType.SYSTEM_INTEGRATION_ERROR]: 45,
      [HealthcareErrorType.INTERNAL_SYSTEM_ERROR]: 10,
      [HealthcareErrorType.MEDICAL_DATA_ACCESS]: undefined,
      [HealthcareErrorType.PATIENT_PRIVACY_VIOLATION]: undefined,
      [HealthcareErrorType.PROFESSIONAL_LICENSE_ERROR]: undefined,
      [HealthcareErrorType.LGPD_COMPLIANCE_ERROR]: undefined,
      [HealthcareErrorType.EMERGENCY_ACCESS_ERROR]: 5,
      [HealthcareErrorType.AUTHENTICATION_ERROR]: undefined,
      [HealthcareErrorType.AUTHORIZATION_ERROR]: undefined,
      [HealthcareErrorType.VALIDATION_ERROR]: undefined,
      [HealthcareErrorType.AUDIT_LOGGING_ERROR]: 30,
    };
    return retryConfig[type];
  }

  private getAlternativeEndpoints(currentPath: string): string[] {
    // Map endpoints to alternatives (if available)
    const alternativeMap: Record<string, string[]> = {
      "/api/v1/patients": ["/api/v1/patients/search"],
      "/api/v1/medical-records": ["/api/v1/medical-records/summary"],
      "/api/v1/appointments": ["/api/v1/appointments/availability"],
    };

    for (const [path, alternatives] of Object.entries(alternativeMap)) {
      if (currentPath.includes(path)) {
        return alternatives;
      }
    }

    return [];
  }

  private getEmergencyProcedure(type: HealthcareErrorType): string | undefined {
    const emergencyProcedures: Record<HealthcareErrorType, string | undefined> = {
      [HealthcareErrorType.MEDICAL_DATA_ACCESS]: "Contact medical records department immediately",
      [HealthcareErrorType.EMERGENCY_ACCESS_ERROR]:
        "Use emergency access protocol - contact on-call administrator",
      [HealthcareErrorType.SYSTEM_INTEGRATION_ERROR]: "Fallback to manual procedures per protocol",
      [HealthcareErrorType.INTERNAL_SYSTEM_ERROR]: "Contact IT emergency support",
      [HealthcareErrorType.DATABASE_ERROR]: "Initiate database recovery procedure",
      [HealthcareErrorType.EXTERNAL_API_ERROR]: "Check external system status page",
      [HealthcareErrorType.PATIENT_PRIVACY_VIOLATION]: undefined,
      [HealthcareErrorType.PROFESSIONAL_LICENSE_ERROR]: undefined,
      [HealthcareErrorType.LGPD_COMPLIANCE_ERROR]: undefined,
      [HealthcareErrorType.AUTHENTICATION_ERROR]: undefined,
      [HealthcareErrorType.AUTHORIZATION_ERROR]: undefined,
      [HealthcareErrorType.VALIDATION_ERROR]: undefined,
      [HealthcareErrorType.RATE_LIMIT_ERROR]: undefined,
      [HealthcareErrorType.AUDIT_LOGGING_ERROR]: undefined,
    };
    return emergencyProcedures[type];
  }

  private getEmergencyContact(severity: HealthcareErrorSeverity): string | undefined {
    const emergencyContacts: Record<HealthcareErrorSeverity, string | undefined> = {
      [HealthcareErrorSeverity.LOW]: undefined,
      [HealthcareErrorSeverity.MEDIUM]: undefined,
      [HealthcareErrorSeverity.HIGH]: "+55 11 9999-9999 (Technical Support)",
      [HealthcareErrorSeverity.CRITICAL]: "+55 11 8888-8888 (Emergency IT)",
      [HealthcareErrorSeverity.EMERGENCY]: "+55 11 7777-7777 (Emergency Medical IT)",
    };
    return emergencyContacts[severity];
  }

  private getSupportReference(errorId: string): string {
    return `REF-${errorId.slice(0, 8).toUpperCase()}`;
  }

  private getErrorCode(error: Error | HTTPException): string {
    if (error instanceof HTTPException) {
      return `HTTP_${error.status}`;
    }
    return error.name || "UNKNOWN_ERROR";
  }

  private getStatusCode(error: Error | HTTPException): number {
    if (error instanceof HTTPException) {
      return error.status;
    }
    return 500; // Default to Internal Server Error
  }

  private sanitizeParameters(context: Context): Record<string, unknown> {
    // Remove sensitive parameters from logging
    const sensitiveKeys = ["password", "token", "cpf", "rg", "cns", "email", "phone"];
    const params = context.get("requestParams") || {};
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = "***";
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private getSystemState(context: Context): Record<string, unknown> {
    return {
      timestamp: Date.now(),
      userAgent: context.req.header("User-Agent"),
      ipAddress: context.req.header("X-Forwarded-For") || "unknown",
      requestMethod: context.req.method,
      requestPath: context.req.path,
      emergencyMode: !!context.req.header("X-Emergency-Access"),
    };
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Placeholder methods for external integrations
  private async auditLog(error: HealthcareError): Promise<void> {
    const auditLogEntry = {
      ...error,
      internal: {
        ...error.internal,
        originalError: error.internal.originalError?.message,
        stackTrace: error.internal.stackTrace?.slice(0, 500), // Truncate stack trace
      },
    };

    console.log("🏥 Healthcare Error Audit Log:", JSON.stringify(auditLogEntry, null, 2));

    if (this.auditLogger) {
      await this.auditLogger.log(auditLogEntry);
    }
  }

  private async sendToMonitoring(error: HealthcareError): Promise<void> {
    const monitoringPayload = {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      timestamp: error.timestamp,
      statusCode: error.statusCode,
      endpoint: error.internal.apiEndpoint,
      userId: error.userId,
      patientDataInvolved: error.medical.patientDataInvolved,
    };

    console.log("📊 Healthcare Error Monitoring:", JSON.stringify(monitoringPayload, null, 2));

    if (this.monitoringSystem) {
      await this.monitoringSystem.sendMetric(monitoringPayload);
    }
  }

  private async sendEmergencyNotification(error: HealthcareError): Promise<void> {
    const emergencyPayload = {
      errorId: error.id,
      severity: error.severity,
      type: error.type,
      timestamp: error.timestamp,
      emergencyProcedure: error.recovery.emergencyProcedure,
      patientId: error.patientId,
      providerId: error.providerId,
    };

    console.error(
      "🚨 Healthcare Emergency Notification:",
      JSON.stringify(emergencyPayload, null, 2),
    );

    if (this.emergencyNotificationSystem) {
      await this.emergencyNotificationSystem.sendAlert(emergencyPayload);
    }
  }

  private async scheduleRegulatoryReporting(error: HealthcareError): Promise<void> {
    // Schedule reporting to relevant regulatory bodies
    console.warn("📋 Regulatory Reporting Scheduled:", {
      errorId: error.id,
      regulatoryImpact: error.regulatoryImpact,
      severity: error.severity,
    });

    // Regulatory reporting placeholder - implement when required by specific regulations
  }

  private async schedulePatientNotification(error: HealthcareError): Promise<void> {
    // Schedule patient notification for privacy breaches or data access issues
    console.warn("📧 Patient Notification Scheduled:", {
      errorId: error.id,
      patientId: error.patientId,
      type: error.type,
    });

    // Patient notification placeholder - implement when notification requirements are defined
  }
}

/**
 * Create Healthcare Error Handling Middleware
 */
export function createHealthcareErrorHandler(
  options: {
    auditLogger?: unknown;
    monitoringSystem?: unknown;
    emergencyNotificationSystem?: unknown;
  } = {},
): MiddlewareHandler {
  const errorHandler = new HealthcareErrorHandler(options);

  return async (c: Context, next) => {
    try {
      await next();
    } catch (error) {
      console.error("Healthcare error caught:", error);

      // Extract context information
      const user = c.get("user");
      const additionalContext = {
        userId: user?.id,
        patientId: c.get("patientId"),
        providerId: c.get("providerId"),
        emergencyContext: !!c.req.header("X-Emergency-Access"),
      };

      // Handle the error
      const errorResponse = await errorHandler.handleError(error, c, additionalContext);

      // Return structured error response
      return c.json(errorResponse, errorResponse.error.statusCode as any);
    }
  };
}
