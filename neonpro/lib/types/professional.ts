// Professional Management Types - FHIR Compliant Healthcare System
// Based on HL7 FHIR R4 Practitioner and PractitionerRole resources
// Includes modern credentialing automation and performance management

import { z } from 'zod';

// ============================================
// ENUMS AND BASE TYPES
// ============================================

export type EmploymentStatus = 'full_time' | 'part_time' | 'contractor' | 'locum_tenens' | 'retired';
export type ProfessionalStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type CredentialType = 'license' | 'certification' | 'board_certification' | 'fellowship' | 'residency' | 'degree' | 'cme' | 'training';
export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'expired' | 'rejected' | 'requires_update';
export type MetricType = 'quality' | 'safety' | 'efficiency' | 'patient_satisfaction' | 'productivity' | 'compliance' | 'availability';
export type WorkflowStatus = 'pending' | 'in_progress' | 'requires_documents' | 'under_review' | 'approved' | 'rejected' | 'expired';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'expiration' | 'renewal_required' | 'compliance_check' | 'performance_review' | 'document_missing' | 'license_status';
export type ServiceType = 'consultation' | 'procedure' | 'surgery' | 'diagnostic' | 'therapy' | 'emergency' | 'telemedicine' | 'administrative';
export type SpecialtyCategory = 'primary_care' | 'specialty' | 'surgical' | 'emergency' | 'diagnostic' | 'mental_health' | 'perioperative' | 'administrative';

// ============================================
// CORE PROFESSIONAL ENTITY (FHIR Practitioner)
// ============================================

export interface Professional {
  id: string;
  created_at: string;
  updated_at: string;
  
  // FHIR Practitioner.identifier
  npi_number: string; // National Provider Identifier (required)
  fhir_practitioner_id: string; // External FHIR system reference
  
  // FHIR Practitioner.name
  first_name: string;
  middle_name?: string;
  last_name: string;
  professional_suffix?: string; // MD, DO, RN, PA, etc.
  
  // Primary licensing
  license_number: string;
  license_state: string;
  license_expiration?: string;
  
  // Professional identification
  primary_specialty: string;
  secondary_specialties?: string[];
  
  // Contact information (FHIR Practitioner.telecom)
  phone: string;
  email: string;
  emergency_contact?: string;
  
  // Employment details
  hire_date: string;
  termination_date?: string;
  employment_status: EmploymentStatus;
  department?: string;
  supervisor_id?: string;
  
  // System status
  status: ProfessionalStatus;
  status_reason?: string;
  last_verified_at?: string;
  
  // Metadata
  notes?: string;
  tags?: string[];
}

// ============================================
// MEDICAL SPECIALTIES
// ============================================

export interface MedicalSpecialty {
  id: string;
  created_at: string;
  updated_at: string;
  
  name: string;
  code: string; // Standard specialty codes (e.g., NUCC taxonomy)
  description?: string;
  category: SpecialtyCategory;
  parent_specialty_id?: string;
  is_active: boolean;
  
  // Certification requirements
  board_certification_required?: boolean;
  continuing_education_hours?: number;
  
  // Metadata
  external_codes?: Record<string, string>; // Additional coding systems
}

// Professional-Specialty Association
export interface ProfessionalSpecialty {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  specialty_id: string;
  
  is_primary: boolean;
  certification_date?: string;
  recertification_date?: string;
  board_certified: boolean;
  
  // References
  professional: Professional;
  specialty: MedicalSpecialty;
}

// ============================================
// CREDENTIALS MANAGEMENT (FHIR Practitioner.qualification)
// ============================================

export interface ProfessionalCredential {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  
  // Credential details
  credential_type: CredentialType;
  credential_name: string;
  credential_number?: string;
  issuing_organization: string;
  
  // Dates and validity
  issue_date: string;
  expiration_date?: string;
  renewal_date?: string;
  
  // Verification
  verification_status: VerificationStatus;
  verification_date?: string;
  verified_by?: string;
  verification_source?: string;
  
  // Automation
  auto_renewal: boolean;
  renewal_reminder_days?: number;
  
  // Documentation
  document_url?: string;
  document_hash?: string;
  notes?: string;
  
  // Compliance tracking
  compliance_checked_at?: string;
  next_compliance_check?: string;
  
  // References
  professional: Professional;
}

// ============================================
// PROFESSIONAL SERVICES (FHIR PractitionerRole)
// ============================================

export interface ProfessionalService {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  specialty_id?: string;
  
  // Service details
  service_name: string;
  service_type: ServiceType;
  service_code?: string; // CPT, HCPCS, or internal codes
  description?: string;
  
  // Availability and capacity
  is_active: boolean;
  available_from?: string; // Time of day
  available_to?: string;   // Time of day
  days_of_week?: string[]; // ['monday', 'tuesday', ...]
  max_patients_per_day?: number;
  average_appointment_duration?: number; // minutes
  
  // Pricing and billing
  base_fee?: number;
  insurance_accepted?: string[];
  billing_code?: string;
  
  // Location and delivery
  location?: string;
  telemedicine_available?: boolean;
  emergency_service?: boolean;
  
  // Quality metrics
  patient_satisfaction_score?: number;
  wait_time_minutes?: number;
  success_rate?: number;
  
  // References
  professional: Professional;
  specialty?: MedicalSpecialty;
}

// ============================================
// PERFORMANCE METRICS & ANALYTICS
// ============================================

export interface PerformanceMetric {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  
  // Metric identification
  metric_type: MetricType;
  metric_name: string;
  metric_description?: string;
  
  // Values and benchmarks
  metric_value: number;
  metric_unit?: string;
  benchmark_value?: number;
  target_value?: number;
  
  // Time period
  measurement_period_start: string;
  measurement_period_end: string;
  measurement_frequency?: string; // 'daily', 'weekly', 'monthly', 'quarterly'
  
  // Context and metadata
  data_source?: string;
  calculation_method?: string;
  sample_size?: number;
  confidence_level?: number;
  
  // Trends and analysis
  previous_value?: number;
  trend_direction?: 'improving' | 'stable' | 'declining';
  percentile_rank?: number;
  
  // References
  professional: Professional;
}

// ============================================
// PROFESSIONAL DEVELOPMENT & TRAINING
// ============================================

export interface ProfessionalDevelopment {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  
  // Development activity
  activity_type: 'cme' | 'conference' | 'workshop' | 'certification' | 'course' | 'simulation' | 'research';
  activity_name: string;
  provider_organization?: string;
  activity_description?: string;
  
  // Dates and duration
  start_date: string;
  end_date?: string;
  duration_hours?: number;
  
  // Credits and certification
  cme_credits?: number;
  certification_earned?: string;
  completion_status: 'registered' | 'in_progress' | 'completed' | 'cancelled';
  completion_date?: string;
  
  // Verification
  certificate_url?: string;
  verification_code?: string;
  accreditation_body?: string;
  
  // Cost and approval
  cost?: number;
  approval_required: boolean;
  approved_by?: string;
  approval_date?: string;
  
  // Learning outcomes
  learning_objectives?: string[];
  competencies_gained?: string[];
  assessment_score?: number;
  
  // References
  professional: Professional;
}

// ============================================
// CREDENTIALING WORKFLOW AUTOMATION
// ============================================

export interface CredentialingWorkflow {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  
  // Workflow identification
  workflow_type: 'initial_credentialing' | 'recredentialing' | 'privilege_request' | 'status_change' | 'incident_review';
  workflow_name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Status and assignment
  status: WorkflowStatus;
  assigned_to?: string;
  reviewer_id?: string;
  committee_review_required?: boolean;
  
  // Timeline
  initiated_date: string;
  due_date?: string;
  completed_date?: string;
  estimated_completion_days?: number;
  
  // Requirements and checklist
  required_documents?: string[];
  submitted_documents?: string[];
  missing_documents?: string[];
  verification_checklist?: Record<string, boolean>;
  
  // Decision and outcome
  decision?: 'approved' | 'denied' | 'conditional' | 'deferred';
  decision_date?: string;
  decision_rationale?: string;
  conditions?: string[];
  
  // Communication
  last_contact_date?: string;
  next_followup_date?: string;
  communication_log?: Array<{
    date: string;
    type: 'email' | 'phone' | 'letter' | 'meeting';
    summary: string;
    sent_by: string;
  }>;
  
  // References
  professional: Professional;
}

// ============================================
// AUTOMATED ALERTS & NOTIFICATIONS
// ============================================

export interface CredentialingAlert {
  id: string;
  created_at: string;
  updated_at: string;
  
  professional_id: string;
  
  // Alert details
  alert_type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  
  // Timing
  due_date?: string;
  reminder_date?: string;
  escalation_date?: string;
  
  // Status and handling
  is_active: boolean;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  
  // Automation
  auto_generated: boolean;
  recurring: boolean;
  recurrence_pattern?: string;
  
  // Related records
  related_credential_id?: string;
  related_workflow_id?: string;
  
  // Actions and follow-up
  action_required: boolean;
  action_taken?: string;
  next_action_date?: string;
  
  // References
  professional: Professional;
  related_credential?: ProfessionalCredential;
  related_workflow?: CredentialingWorkflow;
}

export { z };