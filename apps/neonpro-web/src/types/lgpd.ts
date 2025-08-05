/**
 * LGPD Types and Interfaces
 * Complete type definitions for LGPD compliance system
 */

// Enums for LGPD compliance
export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  FUNCTIONAL = 'functional',
  ESSENTIAL = 'essential',
  MEDICAL_DATA = 'medical_data',
  SENSITIVE_DATA = 'sensitive_data',
  THIRD_PARTY = 'third_party',
  LOCATION = 'location',
  BIOMETRIC = 'biometric'
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  REVOKED = 'revoked',
  PENDING = 'pending',
  EXPIRED = 'expired',
  PARTIAL = 'partial'
}

export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
  MEDICAL_CARE = 'medical_care',
  HEALTH_PROTECTION = 'health_protection'
}

export enum DataSubjectRight {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  RESTRICTION = 'restriction',
  OBJECTION = 'objection',
  WITHDRAW_CONSENT = 'withdraw_consent',
  REVIEW_AUTOMATED_DECISION = 'review_automated_decision'
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum AuditEventType {
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_REVOKED = 'consent_revoked',
  DATA_ACCESS = 'data_access',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_BREACHED = 'data_breached',
  REQUEST_SUBMITTED = 'request_submitted',
  REQUEST_PROCESSED = 'request_processed',
  SYSTEM_ACCESS = 'system_access',
  ENCRYPTION_APPLIED = 'encryption_applied',
  SECURITY_EVENT = 'security_event'
}

export enum SensitiveDataType {
  RACIAL_ETHNIC = 'racial_ethnic',
  POLITICAL_OPINION = 'political_opinion',
  RELIGIOUS_BELIEF = 'religious_belief',
  UNION_MEMBERSHIP = 'union_membership',
  GENETIC_DATA = 'genetic_data',
  BIOMETRIC_DATA = 'biometric_data',
  HEALTH_DATA = 'health_data',
  SEXUAL_ORIENTATION = 'sexual_orientation',
  CRIMINAL_CONVICTION = 'criminal_conviction'
}

export enum ComplianceReportType {
  CONSENT_SUMMARY = 'consent_summary',
  DATA_PROCESSING = 'data_processing',
  SUBJECT_REQUESTS = 'subject_requests',
  SECURITY_INCIDENTS = 'security_incidents',
  AUDIT_TRAIL = 'audit_trail',
  COMPLIANCE_STATUS = 'compliance_status',
  BREACH_REPORT = 'breach_report',
  RETENTION_REPORT = 'retention_report'
}

export enum DataSubjectRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  RESTRICTION = 'restriction',
  OBJECTION = 'objection'
}

export enum DataSubjectRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

// Core interfaces
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  legalBasis: LegalBasis;
  purpose: string;
  dataTypes: string[];
  grantedAt: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
  version: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: DataSubjectRight;
  status: RequestStatus;
  description: string;
  submittedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  response?: string;
  metadata: Record<string, any>;
}

export interface LGPDAuditLog {
  id: string;
  userId?: string;
  eventType: AuditEventType;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'error';
  details: Record<string, any>;
  retentionUntil: Date;
}

export interface EncryptedData {
  data: string;
  algorithm: string;
  keyId: string;
  iv: string;
  authTag: string;
  encryptedAt: Date;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  saltSize: number;
  iterations: number;
}

export interface LGPDContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  consentSnapshot: ConsentRecord[];
}

export interface ConsentCheckResult {
  hasConsent: boolean;
  consentType: ConsentType;
  legalBasis: LegalBasis;
  grantedAt?: Date;
  expiresAt?: Date;
  restrictions: string[];
}

export interface LGPDApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    timestamp: Date;
    requestId: string;
    auditId: string;
  };
}

// Legacy interfaces for compatibility
export interface LGPDConsent {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
}
