/**
 * @fileoverview Audit Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Types
 *
 * Quality Standard: ≥9.9/10
 */
import { z } from 'zod';
import { type ComplianceScore, HealthcareRegulation } from '../types';
/**
 * Audit Event Types for Healthcare Operations
 */
export declare enum AuditEventType {
    PATIENT_DATA_ACCESS = "PATIENT_DATA_ACCESS",
    PATIENT_DATA_MODIFICATION = "PATIENT_DATA_MODIFICATION",
    PATIENT_DATA_DELETION = "PATIENT_DATA_DELETION",
    PATIENT_DATA_EXPORT = "PATIENT_DATA_EXPORT",
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT",
    FAILED_LOGIN_ATTEMPT = "FAILED_LOGIN_ATTEMPT",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    SYSTEM_CONFIGURATION_CHANGE = "SYSTEM_CONFIGURATION_CHANGE",
    BACKUP_CREATED = "BACKUP_CREATED",
    BACKUP_RESTORED = "BACKUP_RESTORED",
    CONSENT_GRANTED = "CONSENT_GRANTED",
    CONSENT_REVOKED = "CONSENT_REVOKED",
    DATA_BREACH_DETECTED = "DATA_BREACH_DETECTED",
    COMPLIANCE_VIOLATION = "COMPLIANCE_VIOLATION",
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED",
    MEDICAL_RECORD_ACCESSED = "MEDICAL_RECORD_ACCESSED",
    TREATMENT_SCHEDULED = "TREATMENT_SCHEDULED",
    TELEMEDICINE_SESSION = "TELEMEDICINE_SESSION"
}
/**
 * Audit Severity Levels
 */
export declare enum AuditSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
/**
 * Audit Log Entry
 */
export type AuditLog = {
    id: string;
    tenantId: string;
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId?: string;
    patientId?: string;
    resourceId?: string;
    resourceType?: string;
    action: string;
    description: string;
    metadata: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    regulation: HealthcareRegulation;
    complianceScore: ComplianceScore;
};
/**
 * Audit Event for Real-time Processing
 */
export type AuditEvent = {
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId?: string;
    patientId?: string;
    resourceId?: string;
    resourceType?: string;
    action: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    regulation: HealthcareRegulation;
};
/**
 * Audit Filters for Querying
 */
export type AuditFilters = {
    tenantId?: string;
    eventTypes?: AuditEventType[];
    severities?: AuditSeverity[];
    userId?: string;
    patientId?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    regulation?: HealthcareRegulation;
    minComplianceScore?: number;
    limit?: number;
    offset?: number;
};
/**
 * Audit Configuration
 */
export type AuditConfig = {
    tenantId: string;
    retentionPeriodDays: number;
    enableRealTimeMonitoring: boolean;
    alertThresholds: {
        criticalEvents: number;
        highSeverityEvents: number;
        failedLogins: number;
        complianceViolations: number;
    };
    regulations: HealthcareRegulation[];
    autoArchiveEnabled: boolean;
    encryptionEnabled: boolean;
};
/**
 * Compliance Audit Report
 */
export type ComplianceAuditReport = {
    id: string;
    tenantId: string;
    auditDate: Date;
    lastAuditDate?: Date;
    auditorId: string;
    regulation: HealthcareRegulation;
    overallScore: ComplianceScore;
    findings: ComplianceAuditFinding[];
    recommendations: string[];
    actionItems: ComplianceActionItem[];
    nextAuditDue: Date;
    status: 'DRAFT' | 'FINAL' | 'APPROVED';
    metadata: Record<string, any>;
};
/**
 * Compliance Audit Finding
 */
export type ComplianceAuditFinding = {
    id: string;
    category: string;
    severity: AuditSeverity;
    description: string;
    evidence: string[];
    regulation: HealthcareRegulation;
    complianceScore: ComplianceScore;
    remediation?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';
};
/**
 * Compliance Action Item
 */
export type ComplianceActionItem = {
    id: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignedTo?: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    regulation: HealthcareRegulation;
    relatedFindingId?: string;
};
/**
 * Audit Trail Validation Result
 */
export type AuditTrailValidation = {
    isComplete: boolean;
    missingEvents: string[];
    integrityScore: ComplianceScore;
    lastValidation: Date;
    violations: string[];
    recommendations: string[];
};
export declare const AuditEventSchema: z.ZodObject<{
    eventType: z.ZodNativeEnum<typeof AuditEventType>;
    severity: z.ZodNativeEnum<typeof AuditSeverity>;
    userId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    resourceId: z.ZodOptional<z.ZodString>;
    resourceType: z.ZodOptional<z.ZodString>;
    action: z.ZodString;
    description: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    regulation: z.ZodNativeEnum<typeof HealthcareRegulation>;
}, "strip", z.ZodTypeAny, {
    eventType: AuditEventType;
    severity: AuditSeverity;
    action: string;
    description: string;
    regulation: HealthcareRegulation;
    userId?: string | undefined;
    patientId?: string | undefined;
    resourceId?: string | undefined;
    resourceType?: string | undefined;
    metadata?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    eventType: AuditEventType;
    severity: AuditSeverity;
    action: string;
    description: string;
    regulation: HealthcareRegulation;
    userId?: string | undefined;
    patientId?: string | undefined;
    resourceId?: string | undefined;
    resourceType?: string | undefined;
    metadata?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const AuditFiltersSchema: z.ZodObject<{
    tenantId: z.ZodOptional<z.ZodString>;
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditEventType>, "many">>;
    severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditSeverity>, "many">>;
    userId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    resourceType: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    regulation: z.ZodOptional<z.ZodNativeEnum<typeof HealthcareRegulation>>;
    minComplianceScore: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    patientId?: string | undefined;
    resourceType?: string | undefined;
    regulation?: HealthcareRegulation | undefined;
    tenantId?: string | undefined;
    eventTypes?: AuditEventType[] | undefined;
    severities?: AuditSeverity[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    minComplianceScore?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    userId?: string | undefined;
    patientId?: string | undefined;
    resourceType?: string | undefined;
    regulation?: HealthcareRegulation | undefined;
    tenantId?: string | undefined;
    eventTypes?: AuditEventType[] | undefined;
    severities?: AuditSeverity[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    minComplianceScore?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const AuditConfigSchema: z.ZodObject<{
    tenantId: z.ZodString;
    retentionPeriodDays: z.ZodNumber;
    enableRealTimeMonitoring: z.ZodBoolean;
    alertThresholds: z.ZodObject<{
        criticalEvents: z.ZodNumber;
        highSeverityEvents: z.ZodNumber;
        failedLogins: z.ZodNumber;
        complianceViolations: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        criticalEvents: number;
        highSeverityEvents: number;
        failedLogins: number;
        complianceViolations: number;
    }, {
        criticalEvents: number;
        highSeverityEvents: number;
        failedLogins: number;
        complianceViolations: number;
    }>;
    regulations: z.ZodArray<z.ZodNativeEnum<typeof HealthcareRegulation>, "many">;
    autoArchiveEnabled: z.ZodBoolean;
    encryptionEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    retentionPeriodDays: number;
    enableRealTimeMonitoring: boolean;
    alertThresholds: {
        criticalEvents: number;
        highSeverityEvents: number;
        failedLogins: number;
        complianceViolations: number;
    };
    regulations: HealthcareRegulation[];
    autoArchiveEnabled: boolean;
    encryptionEnabled: boolean;
}, {
    tenantId: string;
    retentionPeriodDays: number;
    enableRealTimeMonitoring: boolean;
    alertThresholds: {
        criticalEvents: number;
        highSeverityEvents: number;
        failedLogins: number;
        complianceViolations: number;
    };
    regulations: HealthcareRegulation[];
    autoArchiveEnabled: boolean;
    encryptionEnabled: boolean;
}>;
