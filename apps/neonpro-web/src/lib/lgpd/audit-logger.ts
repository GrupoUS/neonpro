import type { z } from "zod";

/**
 * LGPD Audit Trail System
 * Comprehensive logging system for data processing activities as required by LGPD Article 37
 */

// Data processing activities that must be logged
export enum DataProcessingActivity {
  // Patient data operations
  PATIENT_CREATE = "patient_create",
  PATIENT_READ = "patient_read",
  PATIENT_UPDATE = "patient_update",
  PATIENT_DELETE = "patient_delete",
  PATIENT_EXPORT = "patient_export",
  PATIENT_ANONYMIZE = "patient_anonymize",

  // Medical records
  MEDICAL_RECORD_CREATE = "medical_record_create",
  MEDICAL_RECORD_READ = "medical_record_read",
  MEDICAL_RECORD_UPDATE = "medical_record_update",
  MEDICAL_RECORD_DELETE = "medical_record_delete",
  MEDICAL_RECORD_SHARE = "medical_record_share",

  // Appointment operations
  APPOINTMENT_CREATE = "appointment_create",
  APPOINTMENT_READ = "appointment_read",
  APPOINTMENT_UPDATE = "appointment_update",
  APPOINTMENT_CANCEL = "appointment_cancel",
  APPOINTMENT_EXPORT = "appointment_export",

  // Financial data
  FINANCIAL_CREATE = "financial_create",
  FINANCIAL_READ = "financial_read",
  FINANCIAL_UPDATE = "financial_update",
  FINANCIAL_EXPORT = "financial_export",

  // System operations
  LOGIN = "login",
  LOGOUT = "logout",
  PASSWORD_CHANGE = "password_change",
  DATA_BREACH = "data_breach",
  CONSENT_CHANGE = "consent_change",
  DATA_PORTABILITY = "data_portability",
  RIGHT_TO_BE_FORGOTTEN = "right_to_be_forgotten",

  // Third party sharing
  THIRD_PARTY_SHARE = "third_party_share",
  THIRD_PARTY_ACCESS = "third_party_access",

  // System administration
  BACKUP_CREATE = "backup_create",
  BACKUP_RESTORE = "backup_restore",
  DATA_MIGRATION = "data_migration",
  SYSTEM_MAINTENANCE = "system_maintenance",
}

// Risk levels for audit events
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Audit log entry schema
export const auditLogSchema = z.object({
  id: z.string().uuid().optional(),

  // Event identification
  activity: z.nativeEnum(DataProcessingActivity),
  riskLevel: z.nativeEnum(RiskLevel),
  description: z.string().min(10, "Descrição deve ser específica"),

  // Data subject information
  dataSubjectId: z.string().uuid().optional(), // Patient ID if applicable
  dataSubjectType: z.enum(["patient", "employee", "visitor", "system"]).optional(),

  // Actor information (who performed the action)
  actorId: z.string().uuid(),
  actorType: z.enum(["user", "system", "api", "third_party"]),
  actorRole: z.string().optional(), // e.g., 'doctor', 'receptionist', 'admin'

  // Technical details
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "IP inválido"),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),

  // Data processing details
  dataCategories: z.array(z.string()),
  legalBasis: z.enum([
    "consent",
    "contract",
    "legal_obligation",
    "vital_interests",
    "public_interest",
    "legitimate_interests",
  ]),
  purpose: z.string().min(10, "Finalidade deve ser específica"),

  // Technical metadata
  timestamp: z.date().default(() => new Date()),
  source: z.enum(["web", "mobile", "api", "system", "clinic_terminal"]),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "SYSTEM"]).optional(),
  endpoint: z.string().optional(),

  // Result and impact
  success: z.boolean(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  recordsAffected: z.number().min(0).default(0),

  // Additional context
  metadata: z.record(z.any()).optional(),

  // Retention information
  retentionPeriod: z.number().optional(), // Days to retain this log

  createdAt: z.date().default(() => new Date()),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export class AuditLogger {
  /**
   * Log a data processing activity
   */
  static async log(params: {
    activity: DataProcessingActivity;
    description: string;
    actorId: string;
    actorType: "user" | "system" | "api" | "third_party";
    actorRole?: string;
    dataSubjectId?: string;
    dataSubjectType?: "patient" | "employee" | "visitor" | "system";
    dataCategories: string[];
    legalBasis:
      | "consent"
      | "contract"
      | "legal_obligation"
      | "vital_interests"
      | "public_interest"
      | "legitimate_interests";
    purpose: string;
    ipAddress: string;
    userAgent?: string;
    sessionId?: string;
    source: "web" | "mobile" | "api" | "system" | "clinic_terminal";
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "SYSTEM";
    endpoint?: string;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    recordsAffected?: number;
    metadata?: Record<string, any>;
    riskLevel?: RiskLevel;
  }): Promise<AuditLog> {
    const auditEntry: AuditLog = {
      id: crypto.randomUUID(),
      activity: params.activity,
      riskLevel: params.riskLevel || this.calculateRiskLevel(params.activity, params.success),
      description: params.description,
      dataSubjectId: params.dataSubjectId,
      dataSubjectType: params.dataSubjectType,
      actorId: params.actorId,
      actorType: params.actorType,
      actorRole: params.actorRole,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      dataCategories: params.dataCategories,
      legalBasis: params.legalBasis,
      purpose: params.purpose,
      timestamp: new Date(),
      source: params.source,
      method: params.method,
      endpoint: params.endpoint,
      success: params.success,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
      recordsAffected: params.recordsAffected || 0,
      metadata: params.metadata,
      retentionPeriod: this.getRetentionPeriod(params.activity),
      createdAt: new Date(),
    };

    // Validate the audit entry
    const validated = auditLogSchema.parse(auditEntry);

    // TODO: Store in secure audit database
    console.log("Audit log created:", validated);

    // Alert on high/critical risk activities
    if (validated.riskLevel === RiskLevel.HIGH || validated.riskLevel === RiskLevel.CRITICAL) {
      await this.alertSecurityTeam(validated);
    }

    return validated;
  }

  /**
   * Log patient data access (most common healthcare operation)
   */
  static async logPatientAccess(params: {
    patientId: string;
    actorId: string;
    actorRole: string;
    operation: "create" | "read" | "update" | "delete";
    purpose: string;
    ipAddress: string;
    userAgent?: string;
    sessionId?: string;
    source: "web" | "mobile" | "api" | "clinic_terminal";
    recordsAffected?: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<AuditLog> {
    const activityMap = {
      create: DataProcessingActivity.PATIENT_CREATE,
      read: DataProcessingActivity.PATIENT_READ,
      update: DataProcessingActivity.PATIENT_UPDATE,
      delete: DataProcessingActivity.PATIENT_DELETE,
    };

    return this.log({
      activity: activityMap[params.operation],
      description: `${params.operation.toUpperCase()} operation on patient data`,
      actorId: params.actorId,
      actorType: "user",
      actorRole: params.actorRole,
      dataSubjectId: params.patientId,
      dataSubjectType: "patient",
      dataCategories: ["identification", "contact", "health"],
      legalBasis: "consent",
      purpose: params.purpose,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      source: params.source,
      success: params.success,
      errorMessage: params.errorMessage,
      recordsAffected: params.recordsAffected,
    });
  }

  /**
   * Log consent changes (critical for LGPD compliance)
   */
  static async logConsentChange(params: {
    patientId: string;
    consentType: string;
    oldStatus: string;
    newStatus: string;
    actorId: string;
    ipAddress: string;
    userAgent: string;
    reason?: string;
  }): Promise<AuditLog> {
    return this.log({
      activity: DataProcessingActivity.CONSENT_CHANGE,
      description: `Consent ${params.consentType} changed from ${params.oldStatus} to ${params.newStatus}`,
      actorId: params.actorId,
      actorType: "user",
      dataSubjectId: params.patientId,
      dataSubjectType: "patient",
      dataCategories: ["consent", "legal_basis"],
      legalBasis: "legal_obligation",
      purpose: "Gestão de consentimentos conforme LGPD",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      source: "web",
      success: true,
      metadata: {
        consentType: params.consentType,
        oldStatus: params.oldStatus,
        newStatus: params.newStatus,
        reason: params.reason,
      },
      riskLevel: RiskLevel.MEDIUM,
    });
  }

  /**
   * Log data breach incidents (mandatory reporting under LGPD)
   */
  static async logDataBreach(params: {
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    affectedRecords: number;
    dataCategories: string[];
    actorId: string;
    ipAddress: string;
    incidentDetails: Record<string, any>;
  }): Promise<AuditLog> {
    return this.log({
      activity: DataProcessingActivity.DATA_BREACH,
      description: `Data breach incident: ${params.description}`,
      actorId: params.actorId,
      actorType: "system",
      dataCategories: params.dataCategories,
      legalBasis: "legal_obligation",
      purpose: "Registro de incidente de segurança para compliance LGPD",
      ipAddress: params.ipAddress,
      source: "system",
      success: false,
      recordsAffected: params.affectedRecords,
      metadata: params.incidentDetails,
      riskLevel:
        params.severity === "critical"
          ? RiskLevel.CRITICAL
          : params.severity === "high"
            ? RiskLevel.HIGH
            : params.severity === "medium"
              ? RiskLevel.MEDIUM
              : RiskLevel.LOW,
    });
  }

  /**
   * Generate audit report for compliance purposes
   */
  static async generateAuditReport(params: {
    startDate: Date;
    endDate: Date;
    actorId?: string;
    dataSubjectId?: string;
    activities?: DataProcessingActivity[];
    riskLevels?: RiskLevel[];
  }): Promise<{
    generatedAt: Date;
    period: { start: Date; end: Date };
    totalActivities: number;
    activitiesByType: Record<string, number>;
    riskDistribution: Record<string, number>;
    topActors: Array<{ actorId: string; actorRole: string; activities: number }>;
    breaches: number;
    complianceIssues: string[];
    recommendations: string[];
  }> {
    // TODO: Query audit database with filters
    // Placeholder implementation
    return {
      generatedAt: new Date(),
      period: { start: params.startDate, end: params.endDate },
      totalActivities: 0,
      activitiesByType: {},
      riskDistribution: {},
      topActors: [],
      breaches: 0,
      complianceIssues: [],
      recommendations: [
        "Implementar autenticação multifator para usuários administrativos",
        "Revisar políticas de retenção de dados",
        "Treinar equipe sobre boas práticas de proteção de dados",
      ],
    };
  }

  /**
   * Search audit logs for specific criteria
   */
  static async searchLogs(params: {
    dataSubjectId?: string;
    actorId?: string;
    activities?: DataProcessingActivity[];
    startDate?: Date;
    endDate?: Date;
    riskLevels?: RiskLevel[];
    success?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: AuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    // TODO: Implement database search
    // Placeholder implementation
    return {
      logs: [],
      total: 0,
      hasMore: false,
    };
  }

  // Private helper methods
  private static calculateRiskLevel(activity: DataProcessingActivity, success: boolean): RiskLevel {
    // High risk activities
    const highRiskActivities = [
      DataProcessingActivity.PATIENT_DELETE,
      DataProcessingActivity.MEDICAL_RECORD_DELETE,
      DataProcessingActivity.DATA_BREACH,
      DataProcessingActivity.THIRD_PARTY_SHARE,
    ];

    // Medium risk activities
    const mediumRiskActivities = [
      DataProcessingActivity.PATIENT_EXPORT,
      DataProcessingActivity.MEDICAL_RECORD_SHARE,
      DataProcessingActivity.FINANCIAL_EXPORT,
      DataProcessingActivity.DATA_PORTABILITY,
    ];

    if (!success && highRiskActivities.includes(activity)) {
      return RiskLevel.CRITICAL;
    }

    if (highRiskActivities.includes(activity)) {
      return RiskLevel.HIGH;
    }

    if (mediumRiskActivities.includes(activity)) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
  }

  private static getRetentionPeriod(activity: DataProcessingActivity): number {
    // Retention periods in days according to healthcare regulations
    const retentionPeriods = {
      [DataProcessingActivity.MEDICAL_RECORD_CREATE]: 3650, // 10 years
      [DataProcessingActivity.MEDICAL_RECORD_READ]: 1825, // 5 years
      [DataProcessingActivity.MEDICAL_RECORD_UPDATE]: 3650,
      [DataProcessingActivity.MEDICAL_RECORD_DELETE]: 3650,
      [DataProcessingActivity.DATA_BREACH]: 3650, // 10 years for security incidents
      [DataProcessingActivity.CONSENT_CHANGE]: 2555, // 7 years
      [DataProcessingActivity.FINANCIAL_CREATE]: 1825, // 5 years for financial data
      [DataProcessingActivity.LOGIN]: 365, // 1 year for access logs
      [DataProcessingActivity.LOGOUT]: 365,
    };

    return retentionPeriods[activity] || 1095; // Default 3 years
  }

  private static async alertSecurityTeam(auditEntry: AuditLog): Promise<void> {
    // TODO: Implement security alert system
    console.log("Security alert triggered:", {
      activity: auditEntry.activity,
      riskLevel: auditEntry.riskLevel,
      description: auditEntry.description,
      timestamp: auditEntry.timestamp,
    });
  }
}

/**
 * Standard data categories for healthcare audit logging
 */
export const AUDIT_DATA_CATEGORIES = {
  IDENTIFICATION: "identification",
  CONTACT: "contact",
  HEALTH: "health",
  FINANCIAL: "financial",
  BEHAVIORAL: "behavioral",
  BIOMETRIC: "biometric",
  CONSENT: "consent",
  LEGAL_BASIS: "legal_basis",
  LOCATION: "location",
  TECHNICAL: "technical",
};
