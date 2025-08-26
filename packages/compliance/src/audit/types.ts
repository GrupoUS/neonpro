/**
 * @fileoverview Audit Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Types
 *
 * Quality Standard: ≥9.9/10
 */

import { z } from 'zod';
import { HealthcareRegulation } from '../types';
import type { ComplianceScore } from '../types';

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================

/**
 * Audit Event Types for Healthcare Operations
 */
export enum AuditEventType {
  // Patient Data Events
  PATIENT_DATA_ACCESS = 'PATIENT_DATA_ACCESS',
  PATIENT_DATA_MODIFICATION = 'PATIENT_DATA_MODIFICATION',
  PATIENT_DATA_DELETION = 'PATIENT_DATA_DELETION',
  PATIENT_DATA_EXPORT = 'PATIENT_DATA_EXPORT',

  // Authentication Events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',

  // System Events
  SYSTEM_CONFIGURATION_CHANGE = 'SYSTEM_CONFIGURATION_CHANGE',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',

  // Compliance Events
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',
  DATA_BREACH_DETECTED = 'DATA_BREACH_DETECTED',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',

  // Medical Events
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  MEDICAL_RECORD_ACCESSED = 'MEDICAL_RECORD_ACCESSED',
  TREATMENT_SCHEDULED = 'TREATMENT_SCHEDULED',
  TELEMEDICINE_SESSION = 'TELEMEDICINE_SESSION',
}

/**
 * Audit Severity Levels
 */
export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Audit Log Entry
 */
export interface AuditLog {
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
}

/**
 * Audit Event for Real-time Processing
 */
export interface AuditEvent {
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
}

/**
 * Audit Filters for Querying
 */
export interface AuditFilters {
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
}

/**
 * Audit Configuration
 */
export interface AuditConfig {
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
}

// =============================================================================
// COMPLIANCE AUDIT TYPES
// =============================================================================

/**
 * Compliance Audit Report
 */
export interface ComplianceAuditReport {
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
}

/**
 * Compliance Audit Finding
 */
export interface ComplianceAuditFinding {
  id: string;
  category: string;
  severity: AuditSeverity;
  description: string;
  evidence: string[];
  regulation: HealthcareRegulation;
  complianceScore: ComplianceScore;
  remediation?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';
}

/**
 * Compliance Action Item
 */
export interface ComplianceActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo?: string;
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  regulation: HealthcareRegulation;
  relatedFindingId?: string;
}

/**
 * Audit Trail Validation Result
 */
export interface AuditTrailValidation {
  isComplete: boolean;
  missingEvents: string[];
  integrityScore: ComplianceScore;
  lastValidation: Date;
  violations: string[];
  recommendations: string[];
}

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
