/**
 * @fileoverview Audit Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Types
 *
 * Quality Standard: ≥9.9/10
 */
import { z } from 'zod';
import { HealthcareRegulation } from '../types';
// =============================================================================
// AUDIT LOG TYPES
// =============================================================================
/**
 * Audit Event Types for Healthcare Operations
 */
export var AuditEventType;
(function (AuditEventType) {
    // Patient Data Events
    AuditEventType["PATIENT_DATA_ACCESS"] = "PATIENT_DATA_ACCESS";
    AuditEventType["PATIENT_DATA_MODIFICATION"] = "PATIENT_DATA_MODIFICATION";
    AuditEventType["PATIENT_DATA_DELETION"] = "PATIENT_DATA_DELETION";
    AuditEventType["PATIENT_DATA_EXPORT"] = "PATIENT_DATA_EXPORT";
    // Authentication Events
    AuditEventType["USER_LOGIN"] = "USER_LOGIN";
    AuditEventType["USER_LOGOUT"] = "USER_LOGOUT";
    AuditEventType["FAILED_LOGIN_ATTEMPT"] = "FAILED_LOGIN_ATTEMPT";
    AuditEventType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    // System Events
    AuditEventType["SYSTEM_CONFIGURATION_CHANGE"] = "SYSTEM_CONFIGURATION_CHANGE";
    AuditEventType["BACKUP_CREATED"] = "BACKUP_CREATED";
    AuditEventType["BACKUP_RESTORED"] = "BACKUP_RESTORED";
    // Compliance Events
    AuditEventType["CONSENT_GRANTED"] = "CONSENT_GRANTED";
    AuditEventType["CONSENT_REVOKED"] = "CONSENT_REVOKED";
    AuditEventType["DATA_BREACH_DETECTED"] = "DATA_BREACH_DETECTED";
    AuditEventType["COMPLIANCE_VIOLATION"] = "COMPLIANCE_VIOLATION";
    // Medical Events
    AuditEventType["PRESCRIPTION_CREATED"] = "PRESCRIPTION_CREATED";
    AuditEventType["MEDICAL_RECORD_ACCESSED"] = "MEDICAL_RECORD_ACCESSED";
    AuditEventType["TREATMENT_SCHEDULED"] = "TREATMENT_SCHEDULED";
    AuditEventType["TELEMEDICINE_SESSION"] = "TELEMEDICINE_SESSION";
})(AuditEventType || (AuditEventType = {}));
/**
 * Audit Severity Levels
 */
export var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["LOW"] = "LOW";
    AuditSeverity["MEDIUM"] = "MEDIUM";
    AuditSeverity["HIGH"] = "HIGH";
    AuditSeverity["CRITICAL"] = "CRITICAL";
})(AuditSeverity || (AuditSeverity = {}));
// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================
export const AuditEventSchema = z.object({
    eventType: z.nativeEnum(AuditEventType),
    severity: z.nativeEnum(AuditSeverity),
    userId: z.string().optional(),
    patientId: z.string().optional(),
    resourceId: z.string().optional(),
    resourceType: z.string().optional(),
    action: z.string().min(1),
    description: z.string().min(1),
    metadata: z.record(z.any()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    regulation: z.nativeEnum(HealthcareRegulation),
});
export const AuditFiltersSchema = z.object({
    tenantId: z.string().optional(),
    eventTypes: z.array(z.nativeEnum(AuditEventType)).optional(),
    severities: z.array(z.nativeEnum(AuditSeverity)).optional(),
    userId: z.string().optional(),
    patientId: z.string().optional(),
    resourceType: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    regulation: z.nativeEnum(HealthcareRegulation).optional(),
    minComplianceScore: z.number().min(0).max(10).optional(),
    limit: z.number().min(1).max(1000).optional(),
    offset: z.number().min(0).optional(),
});
export const AuditConfigSchema = z.object({
    tenantId: z.string().min(1),
    retentionPeriodDays: z.number().min(30).max(2555), // 7 years max
    enableRealTimeMonitoring: z.boolean(),
    alertThresholds: z.object({
        criticalEvents: z.number().min(1),
        highSeverityEvents: z.number().min(1),
        failedLogins: z.number().min(1),
        complianceViolations: z.number().min(1),
    }),
    regulations: z.array(z.nativeEnum(HealthcareRegulation)),
    autoArchiveEnabled: z.boolean(),
    encryptionEnabled: z.boolean(),
});
