// Types for compliance and documentation features
// Generated from Supabase schema

export interface ConsentForm {
  id: string;
  clinic_id: string;
  form_name: string;
  form_version: string;
  consent_type: 'data_processing' | 'medical_treatment' | 'marketing' | 'research' | 
                'data_sharing' | 'telehealth' | 'photography' | 'communication';
  form_template: string;
  html_template?: string;
  legal_basis?: 'consent' | 'legitimate_interest' | 'vital_interests' | 
               'legal_obligation' | 'public_task' | 'contract';
  required_fields: string[];
  optional_fields: string[];
  retention_period_days?: number;
  auto_expire: boolean;
  is_active: boolean;
  regulatory_requirements: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PatientConsent {
  id: string;
  patient_id: string;
  clinic_id: string;
  consent_form_id: string;
  consent_given: boolean;
  consent_type: string;
  purpose: string;
  signed_at?: string;
  expires_at?: string;
  consent_data: Record<string, any>;
  signature_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  withdrawal_date?: string;
  withdrawal_reason?: string;
  legal_basis?: string;
  processing_categories: string[];
  retention_period_days?: number;
  status: 'active' | 'withdrawn' | 'expired' | 'pending';
  created_at: string;
  updated_at: string;
  // Relations
  consent_form?: ConsentForm;
  patient?: any; // From existing patient type
}

export interface LegalDocument {
  id: string;
  clinic_id: string;
  document_type: 'privacy_policy' | 'terms_of_service' | 'consent_template' | 
                 'data_processing_agreement' | 'regulatory_compliance' | 
                 'patient_rights' | 'incident_response_plan' | 'audit_report';
  title: string;
  version: string;
  document_content: string;
  content_type: string;
  file_url?: string;
  effective_date: string;
  expiry_date?: string;
  approval_status: 'draft' | 'under_review' | 'approved' | 'published' | 'archived' | 'expired';
  approved_by?: string;
  approved_at?: string;
  regulatory_body?: string;
  compliance_framework?: string;
  tags: string[];
  access_level: 'public' | 'internal' | 'restricted' | 'confidential';
  digital_signature?: Record<string, any>;
  checksum?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ComplianceMetric {
  id: string;
  clinic_id: string;
  metric_name: string;
  metric_type: 'consent_rate' | 'data_retention_compliance' | 'breach_incidents' | 
               'audit_score' | 'training_completion' | 'policy_adherence' |
               'data_subject_requests' | 'incident_response_time';
  metric_value: number;
  metric_unit?: string;
  target_value?: number;
  threshold_min?: number;
  threshold_max?: number;
  measurement_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  measurement_date: string;
  data_source?: string;
  calculation_method?: string;
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ComplianceTraining {
  id: string;
  clinic_id: string;
  training_name: string;
  training_type: 'data_protection' | 'patient_privacy' | 'security_awareness' | 
                 'lgpd_compliance' | 'hipaa_compliance' | 'clinical_documentation' |
                 'incident_response' | 'ethics' | 'regulatory_updates';
  description?: string;
  content_url?: string;
  training_material: Record<string, any>;
  duration_minutes?: number;
  mandatory: boolean;
  recurring: boolean;
  recurrence_period_days?: number;
  certification_required: boolean;
  passing_score?: number;
  regulatory_requirement?: string;
  target_roles: string[];
  prerequisites: string[];
  learning_objectives: string[];
  assessment_questions: Record<string, any>[];
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TrainingCompletion {
  id: string;
  training_id: string;
  profile_id: string;
  clinic_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  time_spent_minutes?: number;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  certification_issued: boolean;
  certification_number?: string;
  certification_expiry?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  training?: ComplianceTraining;
  profile?: any; // From existing profile type
}

export interface AuditEvent {
  id: string;
  clinic_id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  user_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_impact: boolean;
  created_at: string;
}

// Forms and validation schemas
export interface ConsentFormData {
  patient_name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  consent_type: string;
  purpose: string;
  processing_categories: string[];
  signature: string;
  date: string;
  ip_address?: string;
  user_agent?: string;
}

export interface DigitalSignature {
  signature_type: 'drawn' | 'typed' | 'uploaded';
  signature_data: string; // Base64 or SVG data
  timestamp: string;
  ip_address: string;
  user_agent: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  device_info?: Record<string, any>;
}

// API Response types
export interface ComplianceStats {
  consent_rate: number;
  active_consents: number;
  expired_consents: number;
  pending_consents: number;
  withdrawn_consents: number;
  compliance_score: number;
  last_audit_date?: string;
  next_audit_date?: string;
}

export interface ComplianceDashboard {
  clinic_id: string;
  stats: ComplianceStats;
  recent_activities: AuditEvent[];
  pending_trainings: ComplianceTraining[];
  expiring_documents: LegalDocument[];
  metrics: ComplianceMetric[];
}