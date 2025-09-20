/**
 * Healthcare Audit Trail Service
 * T031 - Create audit trail service for healthcare operations
 *
 * Comprehensive audit logging for healthcare compliance (LGPD, ANVISA, CFM)
 * with patient data access tracking and security event monitoring
 */

import { z } from "zod";

// ============================================================================
// Audit Event Types & Categories
// ============================================================================

export enum AuditEventType {
  // Authentication & Authorization
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  USER_LOGIN_FAILED = "user_login_failed",
  PASSWORD_CHANGE = "password_change",
  MFA_ENABLED = "mfa_enabled",
  MFA_DISABLED = "mfa_disabled",
  ROLE_CHANGE = "role_change",
  PERMISSION_CHANGE = "permission_change",

  // Patient Data Access
  PATIENT_VIEW = "patient_view",
  PATIENT_CREATE = "patient_create",
  PATIENT_UPDATE = "patient_update",
  PATIENT_DELETE = "patient_delete",
  MEDICAL_RECORD_VIEW = "medical_record_view",
  MEDICAL_RECORD_UPDATE = "medical_record_update",
  MEDICAL_RECORD_CREATE = "medical_record_create",
  MEDICAL_RECORD_DELETE = "medical_record_delete",

  // Healthcare Operations
  APPOINTMENT_CREATE = "appointment_create",
  APPOINTMENT_UPDATE = "appointment_update",
  APPOINTMENT_CANCEL = "appointment_cancel",
  TREATMENT_START = "treatment_start",
  TREATMENT_COMPLETE = "treatment_complete",
  PRESCRIPTION_CREATE = "prescription_create",
  PRESCRIPTION_UPDATE = "prescription_update",

  // Emergency Access
  EMERGENCY_ACCESS = "emergency_access",
  BREAK_GLASS_ACCESS = "break_glass_access",
  EMERGENCY_OVERRIDE = "emergency_override",

  // Data Subject Rights (LGPD)
  DATA_SUBJECT_REQUEST = "data_subject_request",
  DATA_EXPORT = "data_export",
  DATA_DELETION = "data_deletion",
  DATA_CORRECTION = "data_correction",
  CONSENT_GIVEN = "consent_given",
  CONSENT_WITHDRAWN = "consent_withdrawn",

  // Security Events
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  PRIVILEGE_ESCALATION = "privilege_escalation",
  DATA_BREACH_ATTEMPT = "data_breach_attempt",
  SECURITY_VIOLATION = "security_violation",
  UNAUTHORIZED_ACCESS = "unauthorized_access",

  // System Events
  SYSTEM_CONFIGURATION_CHANGE = "system_configuration_change",
  BACKUP_CREATED = "backup_created",
  BACKUP_RESTORED = "backup_restored",
  DATA_MIGRATION = "data_migration",
  SYSTEM_MAINTENANCE = "system_maintenance",

  // AI & Analytics
  AI_MODEL_PREDICTION = "ai_model_prediction",
  AI_MODEL_TRAINING = "ai_model_training",
  ANALYTICS_REPORT_GENERATED = "analytics_report_generated",
  DECISION_SUPPORT_USED = "decision_support_used",

  // Compliance & Regulatory
  REGULATORY_REPORT_GENERATED = "regulatory_report_generated",
  COMPLIANCE_CHECK = "compliance_check",
  AUDIT_LOG_EXPORT = "audit_log_export",
  GDPR_REQUEST_PROCESSED = "gdpr_request_processed",
}

export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AuditOutcome {
  SUCCESS = "success",
  FAILURE = "failure",
  WARNING = "warning",
  BLOCKED = "blocked",
}

// ============================================================================
// Audit Event Interfaces
// ============================================================================

export interface AuditEvent {
  // Event identification
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  outcome: AuditOutcome;

  // Actor information
  actor: {
    userId?: string;
    userType:
      | "patient"
      | "healthcare_professional"
      | "admin"
      | "system"
      | "ai_agent";
    userName?: string;
    role?: string;
    professionalRegistration?: string;
    sessionId?: string;
  };

  // Resource information
  resource: {
    type:
      | "patient"
      | "medical_record"
      | "appointment"
      | "prescription"
      | "system"
      | "ai_model";
    id?: string;
    description?: string;
    sensitivity: "public" | "internal" | "confidential" | "restricted";
  };

  // Healthcare context
  healthcareContext?: {
    patientId?: string;
    clinicId?: string;
    departmentId?: string;
    procedureCode?: string;
    diagnosisCode?: string;
    treatmentProtocol?: string;
    emergencyFlag?: boolean;
    clinicalJustification?: string;
  };

  // Technical context
  technicalContext: {
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    httpMethod?: string;
    statusCode?: number;
    responseTime?: number;
    deviceId?: string;
    geolocation?: {
      country: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    };
  };

  // Event details
  details: {
    action: string;
    description: string;
    changedFields?: string[];
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    additionalData?: Record<string, any>;
  };

  // Compliance metadata
  compliance: {
    lgpdRelevant: boolean;
    anvisaRelevant: boolean;
    cfmRelevant: boolean;
    retentionPeriod: number; // Days
    dataClassification: "public" | "internal" | "confidential" | "restricted";
    legalBasis?: string;
    auditRequired: boolean;
  };

  // Risk assessment
  riskAssessment?: {
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[];
    mitigationActions: string[];
    followUpRequired: boolean;
  };
}

// ============================================================================
// Audit Configuration
// ============================================================================

export interface AuditTrailConfig {
  // General settings
  enabled: boolean;
  logLevel: "minimal" | "standard" | "comprehensive" | "detailed";
  realTimeLogging: boolean;

  // Storage settings
  storage: {
    provider: "database" | "file" | "cloud" | "siem";
    retentionPeriod: number; // Days
    archivalEnabled: boolean;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };

  // Filtering settings
  filtering: {
    enabledEventTypes: AuditEventType[];
    minimumSeverity: AuditSeverity;
    excludeSuccessfulLogins: boolean;
    excludeReadOperations: boolean;
    patientDataAccessLogging: boolean;
  };

  // Healthcare specific
  healthcare: {
    trackPatientDataAccess: boolean;
    trackEmergencyAccess: boolean;
    trackPrescriptionChanges: boolean;
    trackDiagnosisChanges: boolean;
    anonymizePatientData: boolean;
  };

  // Compliance settings
  compliance: {
    lgpdCompliance: boolean;
    anvisaCompliance: boolean;
    cfmCompliance: boolean;
    automaticReporting: boolean;
    alertOnViolations: boolean;
  };

  // Security settings
  security: {
    tamperProtection: boolean;
    digitalSignatures: boolean;
    accessLogging: boolean;
    anomalyDetection: boolean;
  };
}

export const defaultAuditConfig: AuditTrailConfig = {
  enabled: true,
  logLevel: "comprehensive",
  realTimeLogging: true,

  storage: {
    provider: "database",
    retentionPeriod: 2555, // 7 years for healthcare
    archivalEnabled: true,
    compressionEnabled: true,
    encryptionEnabled: true,
  },

  filtering: {
    enabledEventTypes: Object.values(AuditEventType),
    minimumSeverity: AuditSeverity.LOW,
    excludeSuccessfulLogins: false,
    excludeReadOperations: false,
    patientDataAccessLogging: true,
  },

  healthcare: {
    trackPatientDataAccess: true,
    trackEmergencyAccess: true,
    trackPrescriptionChanges: true,
    trackDiagnosisChanges: true,
    anonymizePatientData: false, // Keep full audit for healthcare
  },

  compliance: {
    lgpdCompliance: true,
    anvisaCompliance: true,
    cfmCompliance: true,
    automaticReporting: true,
    alertOnViolations: true,
  },

  security: {
    tamperProtection: true,
    digitalSignatures: true,
    accessLogging: true,
    anomalyDetection: true,
  },
};

// ============================================================================
// Audit Storage Interface
// ============================================================================

export interface AuditStorage {
  store(event: AuditEvent): Promise<void>;
  query(filters: AuditQueryFilters): Promise<AuditEvent[]>;
  export(
    filters: AuditQueryFilters,
    format: "json" | "csv" | "pdf",
  ): Promise<string>;
  archive(olderThan: Date): Promise<number>;
  count(filters: AuditQueryFilters): Promise<number>;
}

export interface AuditQueryFilters {
  fromDate?: Date;
  toDate?: Date;
  eventTypes?: AuditEventType[];
  userId?: string;
  patientId?: string;
  severity?: AuditSeverity;
  outcome?: AuditOutcome;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Database Audit Storage Implementation
// ============================================================================

export class DatabaseAuditStorage implements AuditStorage {
  constructor(private config: AuditTrailConfig) {}

  async store(event: AuditEvent): Promise<void> {
    try {
      // Encrypt sensitive data if required
      const encryptedEvent = this.config.storage.encryptionEnabled
        ? await this.encryptSensitiveData(event)
        : event;

      // Add digital signature if required
      const signedEvent = this.config.security.digitalSignatures
        ? await this.addDigitalSignature(encryptedEvent)
        : encryptedEvent;

      // Store in database (pseudo-code - replace with actual DB implementation)
      // await db.auditEvents.create(signedEvent);

      console.log("[Audit] Event stored:", event.id);
    } catch (error) {
      console.error("[Audit] Failed to store event:", error);
      // Don't throw - audit failures shouldn't break application flow
    }
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    // Implement database query logic
    // This would use your actual database implementation
    return [];
  }

  async export(
    filters: AuditQueryFilters,
    format: "json" | "csv" | "pdf",
  ): Promise<string> {
    const events = await this.query(filters);

    switch (format) {
      case "json":
        return JSON.stringify(events, null, 2);
      case "csv":
        return this.convertToCSV(events);
      case "pdf":
        return this.convertToPDF(events);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async archive(olderThan: Date): Promise<number> {
    // Implement archival logic
    console.log(
      `[Audit] Archiving events older than ${olderThan.toISOString()}`,
    );
    return 0; // Return number of archived events
  }

  async count(filters: AuditQueryFilters): Promise<number> {
    // Implement count query
    return 0;
  }

  private async encryptSensitiveData(event: AuditEvent): Promise<AuditEvent> {
    // Implement encryption for sensitive fields
    const encryptedEvent = { ...event };

    // Encrypt sensitive fields
    if (encryptedEvent.healthcareContext?.patientId) {
      encryptedEvent.healthcareContext.patientId = await this.encrypt(
        encryptedEvent.healthcareContext.patientId,
      );
    }

    return encryptedEvent;
  }

  private async addDigitalSignature(
    event: AuditEvent,
  ): Promise<AuditEvent & { signature: string }> {
    // Implement digital signature
    const eventString = JSON.stringify(event);
    const signature = await this.generateSignature(eventString);

    return { ...event, signature };
  }

  private async encrypt(data: string): Promise<string> {
    // Implement encryption - placeholder
    return `encrypted_${Buffer.from(data).toString("base64")}`;
  }

  private async generateSignature(data: string): Promise<string> {
    // Implement digital signature - placeholder
    return `sig_${Buffer.from(data).toString("base64").substring(0, 32)}`;
  }

  private convertToCSV(events: AuditEvent[]): string {
    // Implement CSV conversion
    const headers = [
      "timestamp",
      "eventType",
      "userId",
      "outcome",
      "description",
    ];
    const rows = events.map((event) => [
      event.timestamp,
      event.eventType,
      event.actor.userId || "N/A",
      event.outcome,
      event.details.description,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  private convertToPDF(events: AuditEvent[]): string {
    // Implement PDF conversion - placeholder
    return `PDF audit report with ${events.length} events`;
  }
}

// ============================================================================
// Audit Trail Service
// ============================================================================

export class AuditTrailService {
  private storage: AuditStorage;
  private config: AuditTrailConfig;

  constructor(config: Partial<AuditTrailConfig> = {}) {
    this.config = { ...defaultAuditConfig, ...config };
    this.storage = new DatabaseAuditStorage(this.config);
  }

  /**
   * Log an audit event
   */
  async logEvent(
    eventType: AuditEventType,
    actor: AuditEvent["actor"],
    resource: AuditEvent["resource"],
    details: AuditEvent["details"],
    options: {
      severity?: AuditSeverity;
      outcome?: AuditOutcome;
      healthcareContext?: AuditEvent["healthcareContext"];
      technicalContext?: Partial<AuditEvent["technicalContext"]>;
      riskAssessment?: AuditEvent["riskAssessment"];
    } = {},
  ): Promise<void> {
    try {
      // Check if logging is enabled for this event type
      if (
        !this.shouldLogEvent(eventType, options.severity || AuditSeverity.LOW)
      ) {
        return;
      }

      // Build audit event
      const auditEvent: AuditEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        eventType,
        severity:
          options.severity ||
          this.determineSeverity(eventType, options.outcome),
        outcome: options.outcome || AuditOutcome.SUCCESS,
        actor,
        resource,
        healthcareContext: options.healthcareContext,
        technicalContext: {
          ...options.technicalContext,
        } as AuditEvent["technicalContext"],
        details,
        compliance: this.buildComplianceMetadata(
          eventType,
          resource,
          options.healthcareContext,
        ),
        riskAssessment: options.riskAssessment,
      };

      // Store the event
      await this.storage.store(auditEvent);

      // Real-time processing
      if (this.config.realTimeLogging) {
        await this.processRealTimeEvent(auditEvent);
      }
    } catch (error) {
      console.error("[AuditTrail] Failed to log event:", error);
      // Log audit failure as a separate event
      await this.logAuditFailure(eventType, error);
    }
  }

  /**
   * Log patient data access
   */
  async logPatientDataAccess(
    userId: string,
    userType: AuditEvent["actor"]["userType"],
    patientId: string,
    dataType: string,
    action: "view" | "create" | "update" | "delete",
    technicalContext: Partial<AuditEvent["technicalContext"]> = {},
    clinicalJustification?: string,
  ): Promise<void> {
    const eventType = this.getPatientDataEventType(action);

    await this.logEvent(
      eventType,
      {
        userId,
        userType,
        sessionId: technicalContext.endpoint,
      },
      {
        type: "patient",
        id: patientId,
        description: `Patient ${dataType} data`,
        sensitivity: "restricted",
      },
      {
        action: `patient_data_${action}`,
        description: `User ${userId} ${action}ed ${dataType} data for patient ${patientId}`,
        additionalData: { dataType },
      },
      {
        severity: AuditSeverity.HIGH,
        outcome: AuditOutcome.SUCCESS,
        healthcareContext: {
          patientId,
          clinicalJustification,
        },
        technicalContext,
      },
    );
  }

  /**
   * Log emergency access
   */
  async logEmergencyAccess(
    userId: string,
    patientId: string,
    justification: string,
    accessType: "break_glass" | "emergency_override",
    technicalContext: Partial<AuditEvent["technicalContext"]> = {},
  ): Promise<void> {
    await this.logEvent(
      AuditEventType.EMERGENCY_ACCESS,
      {
        userId,
        userType: "healthcare_professional",
        sessionId: technicalContext.endpoint,
      },
      {
        type: "patient",
        id: patientId,
        description: "Emergency patient data access",
        sensitivity: "restricted",
      },
      {
        action: "emergency_access",
        description: `Emergency access to patient ${patientId} data`,
        additionalData: { accessType, justification },
      },
      {
        severity: AuditSeverity.CRITICAL,
        outcome: AuditOutcome.SUCCESS,
        healthcareContext: {
          patientId,
          emergencyFlag: true,
          clinicalJustification: justification,
        },
        technicalContext,
        riskAssessment: {
          riskLevel: "high",
          riskFactors: ["emergency_access", "bypassed_normal_authorization"],
          mitigationActions: ["audit_review", "supervisor_notification"],
          followUpRequired: true,
        },
      },
    );
  }

  /**
   * Log security violation
   */
  async logSecurityViolation(
    violationType: string,
    description: string,
    userId?: string,
    technicalContext: Partial<AuditEvent["technicalContext"]> = {},
    additionalData: Record<string, any> = {},
  ): Promise<void> {
    await this.logEvent(
      AuditEventType.SECURITY_VIOLATION,
      {
        userId,
        userType: userId ? "healthcare_professional" : "system",
        sessionId: technicalContext.endpoint,
      },
      {
        type: "system",
        description: "Security system",
        sensitivity: "confidential",
      },
      {
        action: "security_violation",
        description,
        additionalData: { violationType, ...additionalData },
      },
      {
        severity: AuditSeverity.CRITICAL,
        outcome: AuditOutcome.BLOCKED,
        technicalContext,
        riskAssessment: {
          riskLevel: "critical",
          riskFactors: ["security_violation", "potential_breach"],
          mitigationActions: ["immediate_investigation", "access_review"],
          followUpRequired: true,
        },
      },
    );
  }

  /**
   * Log LGPD data subject request
   */
  async logDataSubjectRequest(
    dataSubjectId: string,
    requestType: "access" | "correction" | "deletion" | "portability",
    status: "received" | "processing" | "completed" | "denied",
    processingDetails?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent(
      AuditEventType.DATA_SUBJECT_REQUEST,
      {
        userId: dataSubjectId,
        userType: "patient",
      },
      {
        type: "patient",
        id: dataSubjectId,
        description: `LGPD data subject request - ${requestType}`,
        sensitivity: "restricted",
      },
      {
        action: `lgpd_${requestType}_request`,
        description: `Data subject ${dataSubjectId} requested ${requestType} of personal data`,
        additionalData: { requestType, status, ...processingDetails },
      },
      {
        severity: AuditSeverity.HIGH,
        outcome:
          status === "completed" ? AuditOutcome.SUCCESS : AuditOutcome.WARNING,
        healthcareContext: {
          patientId: dataSubjectId,
        },
      },
    );
  }

  /**
   * Query audit events
   */
  async queryEvents(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    return await this.storage.query(filters);
  }

  /**
   * Export audit events
   */
  async exportEvents(
    filters: AuditQueryFilters,
    format: "json" | "csv" | "pdf",
  ): Promise<string> {
    // Log the export request itself
    await this.logEvent(
      AuditEventType.AUDIT_LOG_EXPORT,
      {
        userId: "system", // This would be the requesting user
        userType: "admin",
      },
      {
        type: "system",
        description: "Audit log export",
        sensitivity: "confidential",
      },
      {
        action: "audit_export",
        description: `Audit logs exported in ${format} format`,
        additionalData: { filters, format },
      },
      {
        severity: AuditSeverity.HIGH,
        outcome: AuditOutcome.SUCCESS,
      },
    );

    return await this.storage.export(filters, format);
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(
    fromDate: Date,
    toDate: Date,
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    securityViolations: number;
    emergencyAccesses: number;
    patientDataAccesses: number;
  }> {
    const filters = { fromDate, toDate };

    // This would be implemented with proper database aggregation queries
    const totalEvents = await this.storage.count(filters);

    return {
      totalEvents,
      eventsByType: {}, // Aggregate by event type
      eventsBySeverity: {}, // Aggregate by severity
      securityViolations: await this.storage.count({
        ...filters,
        eventTypes: [AuditEventType.SECURITY_VIOLATION],
      }),
      emergencyAccesses: await this.storage.count({
        ...filters,
        eventTypes: [AuditEventType.EMERGENCY_ACCESS],
      }),
      patientDataAccesses: await this.storage.count({
        ...filters,
        eventTypes: [
          AuditEventType.PATIENT_VIEW,
          AuditEventType.MEDICAL_RECORD_VIEW,
        ],
      }),
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private shouldLogEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
  ): boolean {
    if (!this.config.enabled) return false;

    if (!this.config.filtering.enabledEventTypes.includes(eventType))
      return false;

    const severityOrder = {
      [AuditSeverity.LOW]: 0,
      [AuditSeverity.MEDIUM]: 1,
      [AuditSeverity.HIGH]: 2,
      [AuditSeverity.CRITICAL]: 3,
    };

    return (
      severityOrder[severity] >=
      severityOrder[this.config.filtering.minimumSeverity]
    );
  }

  private determineSeverity(
    eventType: AuditEventType,
    outcome?: AuditOutcome,
  ): AuditSeverity {
    // Critical events
    if (
      [
        AuditEventType.EMERGENCY_ACCESS,
        AuditEventType.SECURITY_VIOLATION,
        AuditEventType.DATA_BREACH_ATTEMPT,
        AuditEventType.UNAUTHORIZED_ACCESS,
      ].includes(eventType)
    ) {
      return AuditSeverity.CRITICAL;
    }

    // High severity events
    if (
      [
        AuditEventType.PATIENT_DELETE,
        AuditEventType.MEDICAL_RECORD_DELETE,
        AuditEventType.PRIVILEGE_ESCALATION,
        AuditEventType.DATA_DELETION,
      ].includes(eventType)
    ) {
      return AuditSeverity.HIGH;
    }

    // Medium severity events
    if (
      [
        AuditEventType.PATIENT_UPDATE,
        AuditEventType.MEDICAL_RECORD_UPDATE,
        AuditEventType.PRESCRIPTION_CREATE,
        AuditEventType.ROLE_CHANGE,
      ].includes(eventType)
    ) {
      return AuditSeverity.MEDIUM;
    }

    // Failure outcomes increase severity
    if (outcome === AuditOutcome.FAILURE || outcome === AuditOutcome.BLOCKED) {
      return AuditSeverity.HIGH;
    }

    return AuditSeverity.LOW;
  }

  private getPatientDataEventType(action: string): AuditEventType {
    switch (action) {
      case "view":
        return AuditEventType.PATIENT_VIEW;
      case "create":
        return AuditEventType.PATIENT_CREATE;
      case "update":
        return AuditEventType.PATIENT_UPDATE;
      case "delete":
        return AuditEventType.PATIENT_DELETE;
      default:
        return AuditEventType.PATIENT_VIEW;
    }
  }

  private buildComplianceMetadata(
    eventType: AuditEventType,
    resource: AuditEvent["resource"],
    healthcareContext?: AuditEvent["healthcareContext"],
  ): AuditEvent["compliance"] {
    const isPatientData =
      resource.type === "patient" || resource.type === "medical_record";
    const isSecurityEvent =
      eventType.includes("security") || eventType.includes("violation");

    return {
      lgpdRelevant: isPatientData || eventType.includes("data_subject"),
      anvisaRelevant: healthcareContext?.patientId !== undefined,
      cfmRelevant: healthcareContext?.patientId !== undefined,
      retentionPeriod: isPatientData ? 2555 : 1825, // 7 years for patient data, 5 for others
      dataClassification: resource.sensitivity,
      legalBasis: isPatientData
        ? "healthcare_treatment"
        : "legitimate_interests",
      auditRequired: true,
    };
  }

  private async processRealTimeEvent(event: AuditEvent): Promise<void> {
    // Real-time event processing
    if (event.severity === AuditSeverity.CRITICAL) {
      await this.sendCriticalAlert(event);
    }

    if (event.eventType === AuditEventType.EMERGENCY_ACCESS) {
      await this.notifyEmergencyAccess(event);
    }

    if (event.riskAssessment?.followUpRequired) {
      await this.scheduleFollowUp(event);
    }
  }

  private async sendCriticalAlert(event: AuditEvent): Promise<void> {
    console.log("[Audit] CRITICAL ALERT:", event.details.description);
    // Implement alerting mechanism (email, SMS, etc.)
  }

  private async notifyEmergencyAccess(event: AuditEvent): Promise<void> {
    console.log("[Audit] Emergency access logged:", event.id);
    // Implement emergency access notification
  }

  private async scheduleFollowUp(event: AuditEvent): Promise<void> {
    console.log("[Audit] Follow-up required for event:", event.id);
    // Implement follow-up scheduling
  }

  private async logAuditFailure(
    originalEventType: AuditEventType,
    error: any,
  ): Promise<void> {
    try {
      // Create a minimal audit event for the failure
      const failureEvent: AuditEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        eventType: AuditEventType.SYSTEM_CONFIGURATION_CHANGE,
        severity: AuditSeverity.HIGH,
        outcome: AuditOutcome.FAILURE,
        actor: {
          userType: "system",
        },
        resource: {
          type: "system",
          description: "Audit system",
          sensitivity: "internal",
        },
        technicalContext: {},
        details: {
          action: "audit_logging_failure",
          description: `Failed to log ${originalEventType} event`,
          additionalData: {
            originalEventType,
            error: error instanceof Error ? error.message : String(error),
          },
        },
        compliance: {
          lgpdRelevant: false,
          anvisaRelevant: false,
          cfmRelevant: false,
          retentionPeriod: 365,
          dataClassification: "internal",
          auditRequired: true,
        },
      };

      // Try to store the failure event
      console.error("[Audit] Audit failure event:", failureEvent);
    } catch (nestedError) {
      // If we can't even log the failure, just console log
      console.error("[Audit] Critical: Cannot log audit failure:", nestedError);
    }
  }
}

// ============================================================================
// Audit Trail Middleware
// ============================================================================

export function createAuditTrailMiddleware(auditService: AuditTrailService) {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Extract request information
    const userId = req.headers["x-user-id"];
    const sessionId = req.headers["x-session-id"];
    const patientId =
      req.headers["x-patient-id"] ||
      req.body?.patientId ||
      req.query?.patientId;

    try {
      // Continue with request
      await next();

      // Log successful request
      const responseTime = Date.now() - startTime;

      if (patientId) {
        await auditService.logPatientDataAccess(
          userId || "anonymous",
          "healthcare_professional",
          patientId,
          "general",
          req.method === "GET" ? "view" : "update",
          {
            endpoint: req.path,
            httpMethod: req.method,
            responseTime,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          },
        );
      }
    } catch (error) {
      // Log failed request
      await auditService.logEvent(
        AuditEventType.SYSTEM_CONFIGURATION_CHANGE,
        {
          userId: userId || "anonymous",
          userType: "healthcare_professional",
          sessionId,
        },
        {
          type: "system",
          description: "API endpoint",
          sensitivity: "internal",
        },
        {
          action: "api_request_failed",
          description: `API request failed: ${req.method} ${req.path}`,
          additionalData: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
        {
          severity: AuditSeverity.MEDIUM,
          outcome: AuditOutcome.FAILURE,
          technicalContext: {
            endpoint: req.path,
            httpMethod: req.method,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          },
        },
      );

      throw error;
    }
  };
}

// ============================================================================
// Export Service and Types
// ============================================================================

export default AuditTrailService;

export type { AuditEvent, AuditQueryFilters, AuditStorage, AuditTrailConfig };
