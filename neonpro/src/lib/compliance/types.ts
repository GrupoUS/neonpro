// 🔒 LGPD Compliance Framework - Core Types & Interfaces
// NeonPro - Sistema de Automação de Compliance LGPD
// Quality Standard: ≥9.5/10 (BMad Enhanced)

/**
 * Core LGPD Compliance Types
 * Provides comprehensive TypeScript definitions for LGPD automation
 */

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'requires_action';
export type ConsentStatus = 'granted' | 'withdrawn' | 'expired' | 'pending_renewal';
export type PrivacyRightType = 'access' | 'correction' | 'deletion' | 'portability' | 'objection' | 'restriction';
export type ProcessingPurpose = 'medical_care' | 'appointment_scheduling' | 'billing' | 'marketing' | 'analytics' | 'research' | 'legal_obligation';
export type DataCategory = 'personal' | 'sensitive' | 'medical' | 'financial' | 'biometric' | 'behavioral';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * LGPD Consent Management Interfaces
 */
export interface LGPDConsent {
  id: string;
  patientId: string;
  consentType: ProcessingPurpose;
  status: ConsentStatus;
  grantedDate: Date;
  withdrawnDate?: Date;
  expirationDate?: Date;
  granularPermissions: Record<DataCategory, boolean>;
  version: number;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    method: 'explicit' | 'implicit' | 'inferred';
    context: string;
  };
}

export interface ConsentRequest {
  patientId: string;
  purposes: ProcessingPurpose[];
  dataCategories: DataCategory[];
  context: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source: string;
  };
}

/**
 * Privacy Rights Management
 */
export interface PrivacyRightsRequest {
  id: string;
  patientId: string;
  requestType: PrivacyRightType;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'partially_completed';
  submissionDate: Date;
  completionDate?: Date;
  responseData?: any;
  automated: boolean;
  processingNotes?: string;
  verificationMethod: 'email' | 'phone' | 'in_person' | 'digital_signature';
}

export interface DataAccessResult {
  patientId: string;
  requestId: string;
  data: {
    personal: Record<string, any>;
    medical: Record<string, any>;
    appointments: any[];
    billing: any[];
    communications: any[];
  };
  processingActivities: DataProcessingActivity[];
  consentHistory: LGPDConsent[];
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Data Processing Tracking
 */
export interface DataProcessingActivity {
  id: string;
  patientId: string;
  processingType: 'create' | 'read' | 'update' | 'delete' | 'export' | 'share';
  purpose: ProcessingPurpose;
  dataCategories: DataCategory[];
  timestamp: Date;
  userId: string;
  systemComponent: string;
  dataFields: string[];
  legalBasis: 'consent' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest' | 'public_task' | 'contract';
  retentionPeriod?: number; // in days
  thirdPartySharing?: {
    recipient: string;
    purpose: string;
    consentRequired: boolean;
  };
}

/**
 * Compliance Monitoring & Scoring
 */
export interface ComplianceResult {
  overall: ComplianceStatus;
  score: number; // 0-100
  timestamp: Date;
  details: {
    consentCompliance: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
    dataProcessingCompliance: {
      score: number;
      violations: DataProcessingViolation[];
      recommendations: string[];
    };
    rightsProcessingCompliance: {
      score: number;
      pendingRequests: number;
      averageResponseTime: number; // in hours
      recommendations: string[];
    };
    auditTrailCompliance: {
      score: number;
      coverage: number; // percentage
      gaps: string[];
    };
  };
  riskLevel: RiskLevel;
  nextReviewDate: Date;
}

export interface DataProcessingViolation {
  id: string;
  type: 'missing_consent' | 'expired_consent' | 'unauthorized_access' | 'data_breach' | 'retention_violation' | 'purpose_limitation_breach';
  severity: RiskLevel;
  detectedAt: Date;
  description: string;
  affectedPatients: string[];
  affectedDataCategories: DataCategory[];
  automaticRemediation: boolean;
  remediationActions: string[];
  status: 'detected' | 'investigating' | 'remediated' | 'false_positive';
}

/**
 * Data Retention & Lifecycle Management
 */
export interface DataRetentionPolicy {
  id: string;
  dataCategory: DataCategory;
  purpose: ProcessingPurpose;
  retentionPeriod: number; // in days
  disposalMethod: 'delete' | 'anonymize' | 'archive';
  automaticEnforcement: boolean;
  exceptions: string[];
  legalBasis: string;
  reviewPeriod: number; // in days
}

export interface DataLifecycleEvent {
  id: string;
  patientId: string;
  dataCategory: DataCategory;
  eventType: 'retention_check' | 'disposal_triggered' | 'anonymization_completed' | 'deletion_completed' | 'archive_completed';
  timestamp: Date;
  policyId: string;
  automated: boolean;
  result: 'success' | 'failure' | 'partial';
  details: string;
}

/**
 * Audit Trail & Reporting
 */
export interface AuditReport {
  id: string;
  type: 'compliance_overview' | 'privacy_rights_summary' | 'data_processing_report' | 'violation_report' | 'training_report';
  generatedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedBy: 'system' | 'user';
  userId?: string;
  format: 'json' | 'pdf' | 'csv' | 'excel';
  confidential: boolean;
}

/**
 * Staff Training & Certification
 */
export interface StaffComplianceTraining {
  id: string;
  userId: string;
  trainingType: 'lgpd_basics' | 'data_handling' | 'privacy_rights' | 'incident_response' | 'annual_refresh';
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'failed';
  startDate?: Date;
  completionDate?: Date;
  expirationDate?: Date;
  score?: number;
  certificateIssued: boolean;
  mandatoryRefreshDate?: Date;
}

/**
 * LGPD Manager Core Interface
 */
export interface LGPDManager {
  // Compliance Validation
  validateCompliance(patientId?: string): Promise<ComplianceResult>;
  calculateComplianceScore(): Promise<number>;
  
  // Consent Management
  collectConsent(request: ConsentRequest): Promise<LGPDConsent>;
  withdrawConsent(patientId: string, purposes: ProcessingPurpose[]): Promise<void>;
  validateConsent(patientId: string, purpose: ProcessingPurpose): Promise<boolean>;
  renewConsent(patientId: string): Promise<LGPDConsent[]>;
  
  // Privacy Rights Processing
  processPrivacyRights(request: PrivacyRightsRequest): Promise<void>;
  processAccessRequest(patientId: string): Promise<DataAccessResult>;
  processDataCorrection(patientId: string, corrections: any): Promise<void>;
  processDataDeletion(patientId: string): Promise<void>;
  processDataPortability(patientId: string): Promise<any>;
  
  // Data Processing Monitoring
  logDataProcessing(activity: Omit<DataProcessingActivity, 'id' | 'timestamp'>): Promise<void>;
  detectViolations(): Promise<DataProcessingViolation[]>;
  monitorDataAccess(patientId: string): Promise<DataProcessingActivity[]>;
  
  // Audit & Reporting
  generateAuditReport(type: AuditReport['type'], timeframe: { start: Date; end: Date }): Promise<AuditReport>;
  exportAuditTrail(patientId?: string, timeframe?: { start: Date; end: Date }): Promise<any>;
  
  // Data Retention
  enforceDataRetention(): Promise<DataLifecycleEvent[]>;
  scheduleDataDisposal(patientId: string, dataCategory: DataCategory): Promise<void>;
  
  // Training & Certification
  trackStaffTraining(userId: string, trainingType: StaffComplianceTraining['trainingType']): Promise<StaffComplianceTraining>;
  validateStaffCompliance(userId: string): Promise<boolean>;
}

/**
 * Configuration Types
 */
export interface LGPDConfiguration {
  compliance: {
    targetScore: number; // default: 99
    alertThreshold: number; // default: 85
    reviewFrequency: number; // in days, default: 30
  };
  consent: {
    defaultExpirationDays: number; // default: 365
    renewalReminderDays: number; // default: 30
    granularTracking: boolean; // default: true
  };
  privacyRights: {
    maxResponseHours: number; // default: 24
    automaticProcessing: boolean; // default: true
    verificationRequired: boolean; // default: true
  };
  dataRetention: {
    automaticEnforcement: boolean; // default: true
    defaultRetentionDays: number; // default: 1825 (5 years)
    gracePeriodDays: number; // default: 30
  };
  monitoring: {
    realTimeAlerts: boolean; // default: true
    violationDetectionFrequency: number; // in minutes, default: 15
    auditLogRetention: number; // in days, default: 2555 (7 years)
  };
  training: {
    mandatoryRefreshMonths: number; // default: 12
    trackingEnabled: boolean; // default: true
    certificateValidity: number; // in months, default: 24
  };
}

/**
 * Error Types
 */
export class LGPDComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LGPDComplianceError';
  }
}

export class ConsentValidationError extends LGPDComplianceError {
  constructor(message: string, details?: any) {
    super(message, 'CONSENT_VALIDATION_ERROR', details);
  }
}

export class PrivacyRightsError extends LGPDComplianceError {
  constructor(message: string, details?: any) {
    super(message, 'PRIVACY_RIGHTS_ERROR', details);
  }
}

export class DataProcessingViolationError extends LGPDComplianceError {
  constructor(message: string, details?: any) {
    super(message, 'DATA_PROCESSING_VIOLATION', details);
  }
}

/**
 * Utility Types for Enhanced Type Safety
 */
export type ConsentMatrix = Record<ProcessingPurpose, Record<DataCategory, boolean>>;
export type ComplianceMetrics = Record<string, number>;
export type ViolationStats = Record<DataProcessingViolation['type'], number>;

/**
 * Event Types for Real-time Monitoring
 */
export interface LGPDEvent {
  type: 'consent_granted' | 'consent_withdrawn' | 'privacy_right_requested' | 'violation_detected' | 'compliance_check' | 'training_completed';
  timestamp: Date;
  patientId?: string;
  userId?: string;
  data: any;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export type LGPDEventHandler = (event: LGPDEvent) => Promise<void>;

/**
 * Database Schema Interfaces (for ORM integration)
 */
export interface LGPDConsentRecord {
  id: string;
  patient_id: string;
  consent_type: string;
  granted_date: Date;
  withdrawn_date?: Date;
  granular_permissions: Record<string, any>;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface DataProcessingLogRecord {
  id: string;
  patient_id: string;
  processing_type: string;
  purpose: string;
  timestamp: Date;
  user_id: string;
  system_component: string;
  data_fields: string[];
  legal_basis: string;
  metadata: Record<string, any>;
}

export interface PrivacyRightsRequestRecord {
  id: string;
  patient_id: string;
  request_type: string;
  status: string;
  submission_date: Date;
  completion_date?: Date;
  response_data?: Record<string, any>;
  automated: boolean;
  verification_method: string;
  processing_notes?: string;
}