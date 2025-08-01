// LGPD Compliance System - TypeScript Interfaces
// Story 1.5: LGPD Compliance Automation
// Comprehensive type definitions for LGPD compliance automation

/**
 * LGPD Data Subject Rights Types
 * Based on LGPD Article 18
 */
export type LGPDDataSubjectRightType = 
  | 'access'        // Art. 18, I - confirmation and access
  | 'rectification' // Art. 18, III - correction of incomplete/inaccurate data
  | 'deletion'      // Art. 18, VI - deletion of data
  | 'portability'   // Art. 18, V - data portability
  | 'restriction'   // Art. 18, IV - blocking or elimination
  | 'objection'     // Art. 18, § 2 - objection to processing
  | 'consent_withdrawal'; // Art. 18, IX - withdrawal of consent

/**
 * LGPD Legal Basis Types
 * Based on LGPD Article 7
 */
export type LGPDLegalBasis = 
  | 'consent'           // Art. 7, I - consent
  | 'legal_obligation' // Art. 7, II - legal obligation
  | 'public_interest'  // Art. 7, III - public administration
  | 'vital_interests'  // Art. 7, IV - vital interests
  | 'legitimate_interest' // Art. 7, IX - legitimate interest
  | 'contract_performance' // Art. 7, V - contract performance
  | 'pre_contract'     // Art. 7, VI - pre-contractual procedures
  | 'research'         // Art. 7, VII - studies and research
  | 'credit_protection'; // Art. 7, X - credit protection

/**
 * LGPD Data Categories
 * Classification of personal data types
 */
export type LGPDDataCategory = 
  | 'identification'    // Name, CPF, RG, etc.
  | 'contact'          // Email, phone, address
  | 'biometric'        // Fingerprints, facial recognition
  | 'health'           // Medical data, treatments
  | 'financial'        // Payment data, billing
  | 'behavioral'       // Usage patterns, preferences
  | 'location'         // Geographic data
  | 'authentication'   // Login data, sessions
  | 'device'           // Device information
  | 'sensitive';       // Special categories (Art. 11)

/**
 * LGPD Consent Record Interface
 * Tracks user consent for data processing
 */
export interface LGPDConsentRecord {
  id: string;
  user_id: string;
  clinic_id: string;
  data_category: LGPDDataCategory;
  processing_purpose: string;
  legal_basis: LGPDLegalBasis;
  consent_given: boolean;
  consent_version: string;
  consent_text: string;
  consent_method: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  granted_at: Date;
  expires_at?: Date;
  withdrawn_at?: Date;
  withdrawal_reason?: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * LGPD Data Subject Request Interface
 * Manages data subject rights requests
 */
export interface LGPDDataSubjectRequest {
  id: string;
  user_id: string;
  clinic_id: string;
  request_type: LGPDDataSubjectRightType;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired';
  description: string;
  legal_deadline: Date; // 30 days from request
  submitted_at: Date;
  processed_at?: Date;
  completed_at?: Date;
  rejection_reason?: string;
  fulfillment_data?: any; // JSON data for the response
  verification_method: 'email' | 'document' | 'biometric' | 'in_person';
  verification_status: 'pending' | 'verified' | 'failed';
  processor_id?: string; // Staff member handling the request
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * LGPD Audit Log Interface
 * Immutable audit trail for all data processing activities
 */
export interface LGPDAuditLog {
  id: string;
  user_id?: string;
  clinic_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  data_affected: LGPDDataCategory[];
  legal_basis: LGPDLegalBasis;
  processing_purpose: string;
  data_before?: any; // JSON snapshot before change
  data_after?: any;  // JSON snapshot after change
  ip_address: string;
  user_agent: string;
  session_id?: string;
  actor_id: string; // Who performed the action
  actor_type: 'user' | 'staff' | 'system' | 'admin';
  timestamp: Date;
  hash: string; // Cryptographic hash for integrity
  previous_hash?: string; // Chain of integrity
  metadata?: Record<string, any>;
}

/**
 * LGPD Retention Policy Interface
 * Defines data retention rules per data category
 */
export interface LGPDRetentionPolicy {
  id: string;
  clinic_id: string;
  data_category: LGPDDataCategory;
  retention_period_months: number;
  legal_basis: LGPDLegalBasis;
  deletion_method: 'soft_delete' | 'hard_delete' | 'anonymization' | 'archival';
  auto_deletion_enabled: boolean;
  grace_period_days: number; // Additional time before deletion
  exceptions?: string[]; // Conditions that extend retention
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

/**
 * LGPD Breach Incident Interface
 * Tracks data breaches and notification requirements
 */
export interface LGPDBreachIncident {
  id: string;
  clinic_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  breach_type: 'unauthorized_access' | 'data_loss' | 'system_compromise' | 'human_error' | 'malicious_attack';
  affected_data_categories: LGPDDataCategory[];
  affected_users_count: number;
  affected_user_ids?: string[];
  description: string;
  root_cause?: string;
  detected_at: Date;
  reported_at?: Date;
  authority_notified_at?: Date; // ANPD notification (72h requirement)
  users_notified_at?: Date;
  resolved_at?: Date;
  resolution_description?: string;
  notification_required: boolean;
  authority_notification_sent: boolean;
  user_notification_sent: boolean;
  impact_assessment: string;
  mitigation_actions: string[];
  lessons_learned?: string;
  created_at: Date;
  updated_at: Date;
  reported_by: string;
}

/**
 * LGPD Compliance Assessment Interface
 * Automated compliance scoring and gap analysis
 */
export interface LGPDComplianceAssessment {
  id: string;
  clinic_id: string;
  assessment_date: Date;
  overall_score: number; // 0-100
  consent_management_score: number;
  data_subject_rights_score: number;
  audit_trail_score: number;
  retention_policy_score: number;
  breach_response_score: number;
  data_minimization_score: number;
  third_party_compliance_score: number;
  gaps_identified: LGPDComplianceGap[];
  recommendations: LGPDComplianceRecommendation[];
  next_assessment_due: Date;
  assessor_id: string;
  assessment_type: 'automated' | 'manual' | 'external_audit';
  created_at: Date;
}

/**
 * LGPD Compliance Gap Interface
 * Identifies specific compliance issues
 */
export interface LGPDComplianceGap {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  legal_reference: string; // LGPD article reference
  current_state: string;
  required_state: string;
  risk_level: number; // 1-10
  estimated_effort: 'low' | 'medium' | 'high';
  deadline?: Date;
}

/**
 * LGPD Compliance Recommendation Interface
 * Actionable recommendations for compliance improvement
 */
export interface LGPDComplianceRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  implementation_steps: string[];
  estimated_timeline: string;
  resources_required: string[];
  legal_benefit: string;
  business_benefit: string;
}

/**
 * LGPD Configuration Interface
 * System-wide LGPD compliance configuration
 */
export interface LGPDConfiguration {
  clinic_id: string;
  dpo_email: string; // Data Protection Officer
  dpo_name: string;
  authority_endpoint?: string; // ANPD API endpoint
  breach_notification_webhook?: string;
  default_retention_period_months: number;
  audit_log_retention_years: number;
  consent_record_retention_years: number;
  auto_assessment_enabled: boolean;
  assessment_frequency: 'weekly' | 'monthly' | 'quarterly';
  breach_detection_enabled: boolean;
  real_time_monitoring_enabled: boolean;
  compliance_alerts_enabled: boolean;
  data_minimization_enforcement: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * LGPD Consent Collection Context
 * Context information for consent collection
 */
export interface LGPDConsentContext {
  page_url: string;
  feature_name: string;
  data_categories: LGPDDataCategory[];
  processing_purposes: string[];
  legal_basis: LGPDLegalBasis;
  retention_period?: string;
  third_party_sharing?: boolean;
  third_parties?: string[];
  user_benefits: string[];
  consequences_of_refusal?: string;
}

/**
 * LGPD Data Export Format
 * Standardized format for data portability
 */
export interface LGPDDataExport {
  user_id: string;
  export_date: Date;
  data_categories: LGPDDataCategory[];
  format: 'json' | 'csv' | 'xml' | 'pdf';
  data: Record<string, any>;
  metadata: {
    total_records: number;
    export_version: string;
    legal_basis: LGPDLegalBasis;
    retention_info: Record<LGPDDataCategory, string>;
  };
}

/**
 * LGPD Monitoring Metrics
 * Real-time compliance monitoring metrics
 */
export interface LGPDMonitoringMetrics {
  clinic_id: string;
  timestamp: Date;
  active_consents: number;
  pending_requests: number;
  overdue_requests: number;
  compliance_score: number;
  recent_breaches: number;
  audit_log_integrity: boolean;
  data_retention_compliance: number; // percentage
  consent_renewal_rate: number; // percentage
  average_request_fulfillment_time: number; // hours
}

/**
 * LGPD Alert Interface
 * Compliance alerts and notifications
 */
export interface LGPDAlert {
  id: string;
  clinic_id: string;
  type: 'compliance_violation' | 'deadline_approaching' | 'breach_detected' | 'consent_expired' | 'audit_failure';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  affected_users?: string[];
  legal_deadline?: Date;
  recommended_actions: string[];
  auto_resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: Date;
}

/**
 * LGPD Third Party Data Sharing Agreement
 * Tracks data sharing with external providers
 */
export interface LGPDThirdPartyAgreement {
  id: string;
  clinic_id: string;
  provider_name: string;
  provider_type: 'sso_provider' | 'payment_processor' | 'analytics' | 'marketing' | 'cloud_storage' | 'other';
  data_categories_shared: LGPDDataCategory[];
  legal_basis: LGPDLegalBasis;
  processing_purposes: string[];
  data_location: string; // Country/region
  adequacy_decision: boolean; // ANPD adequacy decision
  safeguards_implemented: string[];
  agreement_date: Date;
  expiry_date?: Date;
  auto_renewal: boolean;
  contact_email: string;
  dpo_contact?: string;
  privacy_policy_url: string;
  data_retention_period: string;
  user_rights_supported: LGPDDataSubjectRightType[];
  breach_notification_sla: number; // hours
  compliance_certified: boolean;
  certification_details?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * LGPD Legal Document Interface
 * Automated legal documentation management
 */
export interface LGPDLegalDocument {
  id: string;
  clinic_id: string;
  document_type: 'privacy_policy' | 'consent_form' | 'data_processing_agreement' | 'breach_notification' | 'assessment_report';
  title: string;
  content: string;
  version: string;
  language: 'pt-BR' | 'en' | 'es';
  effective_date: Date;
  expiry_date?: Date;
  approval_status: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
  approved_by?: string;
  approved_at?: Date;
  legal_review_required: boolean;
  auto_generated: boolean;
  template_id?: string;
  variables_used?: Record<string, any>;
  distribution_channels: string[];
  notification_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export type LGPDEventType = 
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'data_access_request'
  | 'data_deletion_request'
  | 'data_rectification_request'
  | 'data_portability_request'
  | 'breach_detected'
  | 'compliance_violation'
  | 'audit_log_created'
  | 'retention_policy_applied'
  | 'third_party_data_shared'
  | 'assessment_completed'
  | 'legal_document_updated';

/**
 * LGPD Service Response Interface
 * Standardized response format for LGPD operations
 */
export interface LGPDServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  compliance_notes?: string[];
  legal_references?: string[];
  audit_logged: boolean;
  processing_time_ms: number;
}

/**
 * LGPD Bulk Operation Interface
 * For handling bulk compliance operations
 */
export interface LGPDBulkOperation {
  id: string;
  clinic_id: string;
  operation_type: 'bulk_consent_update' | 'bulk_deletion' | 'bulk_export' | 'bulk_notification';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total_records: number;
  processed_records: number;
  failed_records: number;
  error_details?: Record<string, string>;
  started_at: Date;
  completed_at?: Date;
  initiated_by: string;
  parameters: Record<string, any>;
}

// Export all types for easy importing
export type {
  LGPDDataSubjectRightType,
  LGPDLegalBasis,
  LGPDDataCategory,
  LGPDEventType
};
