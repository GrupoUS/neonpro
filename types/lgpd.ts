import { z } from 'zod';

// ============================================================================
// LGPD COMPLIANCE TYPES & SCHEMAS
// ============================================================================

// LGPD Data Types
export type LGPDDataType = 
  | 'authentication' 
  | 'biometric' 
  | 'session' 
  | 'audit' 
  | 'communication' 
  | 'financial' 
  | 'medical' 
  | 'personal';

export type LGPDPurpose = 
  | 'authentication' 
  | 'security' 
  | 'communication' 
  | 'analytics' 
  | 'legal_compliance' 
  | 'service_provision' 
  | 'fraud_prevention';

export type LGPDLegalBasis = 
  | 'consent' 
  | 'contract' 
  | 'legal_obligation' 
  | 'vital_interests' 
  | 'public_task' 
  | 'legitimate_interests';

export type DataSubjectRequestType = 
  | 'access' 
  | 'rectification' 
  | 'deletion' 
  | 'portability' 
  | 'restriction' 
  | 'objection';

export type DataSubjectRequestStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'fulfilled' 
  | 'rejected' 
  | 'expired';

export type BreachSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review';

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  data_type: z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal']),
  purpose: z.enum(['authentication', 'security', 'communication', 'analytics', 'legal_compliance', 'service_provision', 'fraud_prevention']),
  consent_given: z.boolean(),
  consent_text: z.string(),
  version: z.string(),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  granted_at: z.date(),
  expires_at: z.date().optional(),
  withdrawn_at: z.date().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

export const ConsentRequestSchema = z.object({
  data_type: z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal']),
  purpose: z.enum(['authentication', 'security', 'communication', 'analytics', 'legal_compliance', 'service_provision', 'fraud_prevention']),
  consent_given: z.boolean(),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']).optional()
});

export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;

// ============================================================================
// DATA SUBJECT RIGHTS
// ============================================================================

export const DataSubjectRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  request_type: z.enum(['access', 'rectification', 'deletion', 'portability', 'restriction', 'objection']),
  status: z.enum(['pending', 'in_progress', 'fulfilled', 'rejected', 'expired']),
  description: z.string().optional(),
  requested_data: z.array(z.string()).optional(),
  legal_basis: z.string().optional(),
  deadline: z.date(),
  fulfilled_at: z.date().optional(),
  rejection_reason: z.string().optional(),
  verification_method: z.string().optional(),
  verification_completed: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

export type DataSubjectRequest = z.infer<typeof DataSubjectRequestSchema>;

export const CreateDataSubjectRequestSchema = z.object({
  request_type: z.enum(['access', 'rectification', 'deletion', 'portability', 'restriction', 'objection']),
  description: z.string().optional(),
  requested_data: z.array(z.string()).optional()
});

export type CreateDataSubjectRequest = z.infer<typeof CreateDataSubjectRequestSchema>;

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  action: z.string(),
  resource: z.string(),
  data_affected: z.record(z.any()).optional(),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  timestamp: z.date(),
  hash: z.string(), // Cryptographic hash for integrity
  previous_hash: z.string().optional(),
  created_at: z.date()
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const CreateAuditLogSchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string(),
  resource: z.string(),
  data_affected: z.record(z.any()).optional(),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  session_id: z.string().optional()
});

export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;

// ============================================================================
// DATA RETENTION POLICIES
// ============================================================================

export const RetentionPolicySchema = z.object({
  id: z.string().uuid(),
  data_type: z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal']),
  retention_period_months: z.number().positive(),
  deletion_method: z.enum(['soft_delete', 'hard_delete', 'anonymization', 'archival']),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  auto_delete: z.boolean().default(true),
  notification_before_days: z.number().optional(),
  exceptions: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;

// ============================================================================
// BREACH INCIDENTS
// ============================================================================

export const BreachIncidentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affected_users: z.array(z.string().uuid()),
  affected_data_types: z.array(z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal'])),
  detected_at: z.date(),
  reported_to_authority: z.boolean().default(false),
  authority_notified_at: z.date().optional(),
  users_notified_at: z.date().optional(),
  resolved_at: z.date().optional(),
  resolution_notes: z.string().optional(),
  impact_assessment: z.string().optional(),
  mitigation_actions: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type BreachIncident = z.infer<typeof BreachIncidentSchema>;

export const CreateBreachIncidentSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affected_users: z.array(z.string().uuid()),
  affected_data_types: z.array(z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal'])),
  impact_assessment: z.string().optional()
});

export type CreateBreachIncident = z.infer<typeof CreateBreachIncidentSchema>;

// ============================================================================
// COMPLIANCE ASSESSMENTS
// ============================================================================

export const ComplianceAssessmentSchema = z.object({
  id: z.string().uuid(),
  assessment_date: z.date(),
  overall_score: z.number().min(0).max(100),
  consent_management_score: z.number().min(0).max(100),
  data_subject_rights_score: z.number().min(0).max(100),
  audit_trail_score: z.number().min(0).max(100),
  retention_policy_score: z.number().min(0).max(100),
  breach_response_score: z.number().min(0).max(100),
  gaps_identified: z.array(z.string()),
  recommendations: z.array(z.string()),
  next_assessment_date: z.date(),
  assessor: z.string(),
  status: z.enum(['compliant', 'non_compliant', 'pending_review']),
  created_at: z.date(),
  updated_at: z.date()
});

export type ComplianceAssessment = z.infer<typeof ComplianceAssessmentSchema>;

// ============================================================================
// COMPLIANCE MONITORING
// ============================================================================

export const ComplianceViolationSchema = z.object({
  id: z.string().uuid(),
  violation_type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  affected_users: z.array(z.string().uuid()).optional(),
  data_types_affected: z.array(z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal'])).optional(),
  detected_at: z.date(),
  resolved_at: z.date().optional(),
  resolution_notes: z.string().optional(),
  auto_resolved: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

export type ComplianceViolation = z.infer<typeof ComplianceViolationSchema>;

// ============================================================================
// LEGAL DOCUMENTATION
// ============================================================================

export const LegalDocumentSchema = z.object({
  id: z.string().uuid(),
  document_type: z.enum(['privacy_policy', 'terms_of_service', 'consent_form', 'data_processing_agreement', 'breach_notification']),
  title: z.string(),
  content: z.string(),
  version: z.string(),
  language: z.string().default('pt-BR'),
  effective_date: z.date(),
  expiry_date: z.date().optional(),
  approved_by: z.string(),
  approved_at: z.date(),
  status: z.enum(['draft', 'approved', 'active', 'archived']),
  created_at: z.date(),
  updated_at: z.date()
});

export type LegalDocument = z.infer<typeof LegalDocumentSchema>;

// ============================================================================
// THIRD-PARTY DATA SHARING
// ============================================================================

export const DataSharingAgreementSchema = z.object({
  id: z.string().uuid(),
  third_party_name: z.string(),
  third_party_type: z.enum(['sso_provider', 'analytics', 'payment_processor', 'communication', 'storage']),
  data_types_shared: z.array(z.enum(['authentication', 'biometric', 'session', 'audit', 'communication', 'financial', 'medical', 'personal'])),
  purpose: z.enum(['authentication', 'security', 'communication', 'analytics', 'legal_compliance', 'service_provision', 'fraud_prevention']),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  agreement_date: z.date(),
  expiry_date: z.date().optional(),
  data_protection_clauses: z.array(z.string()),
  breach_notification_required: z.boolean().default(true),
  user_consent_required: z.boolean().default(true),
  status: z.enum(['active', 'suspended', 'terminated']),
  created_at: z.date(),
  updated_at: z.date()
});

export type DataSharingAgreement = z.infer<typeof DataSharingAgreementSchema>;

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface LGPDDashboardMetrics {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingDataSubjectRequests: number;
  fulfilledDataSubjectRequests: number;
  complianceScore: number;
  recentViolations: number;
  breachIncidents: number;
  auditLogEntries: number;
  retentionPolicyCompliance: number;
}

export interface ComplianceMetrics {
  consentManagement: {
    totalConsents: number;
    consentRate: number;
    withdrawalRate: number;
    averageConsentDuration: number;
  };
  dataSubjectRights: {
    totalRequests: number;
    averageResponseTime: number;
    fulfillmentRate: number;
    requestsByType: Record<DataSubjectRequestType, number>;
  };
  auditTrail: {
    totalLogs: number;
    integrityScore: number;
    averageLogSize: number;
    logsByAction: Record<string, number>;
  };
  retentionCompliance: {
    totalPolicies: number;
    complianceRate: number;
    dataToBeDeleted: number;
    overdueRetentions: number;
  };
  breachResponse: {
    totalIncidents: number;
    averageResponseTime: number;
    notificationCompliance: number;
    incidentsBySeverity: Record<BreachSeverity, number>;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface LGPDApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  compliance_status: ComplianceStatus;
  audit_logged: boolean;
}

export interface DataExportResponse {
  user_id: string;
  export_date: string;
  data_types: LGPDDataType[];
  format: 'json' | 'csv' | 'xml';
  file_url?: string;
  file_size?: number;
  expires_at: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface LGPDConfiguration {
  dpo_email: string;
  authority_endpoint: string;
  breach_notification_api: string;
  default_retention_period_months: number;
  audit_log_retention_years: number;
  consent_record_retention_years: number;
  compliance_webhook: string;
  assessment_schedule: 'weekly' | 'monthly' | 'quarterly';
  auto_delete_enabled: boolean;
  breach_notification_enabled: boolean;
  compliance_monitoring_enabled: boolean;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseLGPDConsentReturn {
  consents: ConsentRecord[];
  loading: boolean;
  error: string | null;
  grantConsent: (request: ConsentRequest) => Promise<void>;
  withdrawConsent: (consentId: string) => Promise<void>;
  getConsentByType: (dataType: LGPDDataType) => ConsentRecord | null;
  refreshConsents: () => Promise<void>;
}

export interface UseLGPDDataSubjectRightsReturn {
  requests: DataSubjectRequest[];
  loading: boolean;
  error: string | null;
  createRequest: (request: CreateDataSubjectRequest) => Promise<void>;
  getRequestStatus: (requestId: string) => DataSubjectRequestStatus | null;
  refreshRequests: () => Promise<void>;
}

export interface UseLGPDComplianceReturn {
  metrics: LGPDDashboardMetrics | null;
  violations: ComplianceViolation[];
  assessments: ComplianceAssessment[];
  loading: boolean;
  error: string | null;
  runAssessment: () => Promise<void>;
  resolveViolation: (violationId: string, notes: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LGPDEventType = 
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'data_subject_request_created'
  | 'data_subject_request_fulfilled'
  | 'breach_detected'
  | 'compliance_violation'
  | 'audit_log_created'
  | 'retention_policy_executed';

export interface LGPDEvent {
  type: LGPDEventType;
  user_id?: string;
  data: Record<string, any>;
  timestamp: Date;
  compliance_impact: 'none' | 'low' | 'medium' | 'high';
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const validateLGPDCompliance = {
  consent: (consent: unknown): consent is ConsentRecord => {
    return ConsentRecordSchema.safeParse(consent).success;
  },
  dataSubjectRequest: (request: unknown): request is DataSubjectRequest => {
    return DataSubjectRequestSchema.safeParse(request).success;
  },
  auditLog: (log: unknown): log is AuditLog => {
    return AuditLogSchema.safeParse(log).success;
  },
  breachIncident: (incident: unknown): incident is BreachIncident => {
    return BreachIncidentSchema.safeParse(incident).success;
  }
};
