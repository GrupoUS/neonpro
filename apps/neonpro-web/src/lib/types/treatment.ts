/**
 * Treatment & Procedure Documentation Types
 * Based on HL7 FHIR R4 standards for healthcare interoperability
 * Compliant with LGPD for Brazilian healthcare data protection
 * 
 * Resources: CarePlan, Procedure, DocumentReference/Observation
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

import { FHIRCodeableConcept, FHIRMeta, FHIRNarrative, FHIRReference, FHIRPeriod } from './fhir';

// ===============================================
// TREATMENT PLAN TYPES (FHIR CarePlan Resource)
// ===============================================

export type TreatmentPlanStatus = 
  | 'draft' 
  | 'active' 
  | 'on-hold' 
  | 'revoked' 
  | 'completed' 
  | 'entered-in-error' 
  | 'unknown';

export type TreatmentPlanIntent = 
  | 'proposal' 
  | 'plan' 
  | 'order' 
  | 'option' 
  | 'directive';

export interface TreatmentPlanActivity {
  id?: string;
  reference?: FHIRReference; // Reference to Procedure, MedicationRequest, etc.
  detail?: {
    category?: FHIRCodeableConcept;
    code?: FHIRCodeableConcept;
    status?: 'not-started' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'stopped' | 'unknown';
    statusReason?: FHIRCodeableConcept;
    doNotPerform?: boolean;
    scheduled?: {
      timing?: string;
      period?: FHIRPeriod;
      string?: string;
    };
    location?: FHIRReference;
    performer?: FHIRReference[];
    product?: FHIRCodeableConcept | FHIRReference;
    dailyAmount?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    quantity?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    description?: string;
  };
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  provider_id: string;
  
  // FHIR CarePlan Core Fields
  fhir_id: string;
  status: TreatmentPlanStatus;
  intent: TreatmentPlanIntent;
  category: FHIRCodeableConcept[];
  title: string;
  description?: string;
  
  // Clinical Context
  subject_reference: string; // Reference to Patient
  encounter_reference?: string; // Reference to Encounter
  period_start?: string; // ISO 8601 datetime
  period_end?: string; // ISO 8601 datetime
  
  // Care Team & Goals
  care_team: FHIRReference[]; // Array of care team members
  goals: FHIRReference[]; // Array of goal references
  activities: TreatmentPlanActivity[]; // Array of planned activities
  
  // Supporting Information
  supporting_info: FHIRReference[]; // Supporting documentation
  addresses: FHIRReference[]; // Conditions addressed
  
  // FHIR Metadata
  fhir_meta: FHIRMeta;
  fhir_text: FHIRNarrative;
  
  // LGPD Compliance
  data_consent_given: boolean;
  data_consent_date?: string;
  data_retention_until?: string;
  
  // Audit & Versioning
  version: number;
  replaces?: string; // Previous version UUID
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// ===============================================
// PROCEDURE TYPES (FHIR Procedure Resource)
// ===============================================

export type ProcedureStatus = 
  | 'preparation' 
  | 'in-progress' 
  | 'not-done' 
  | 'on-hold' 
  | 'stopped' 
  | 'completed' 
  | 'entered-in-error' 
  | 'unknown';

export interface ProcedurePerformer {
  function?: FHIRCodeableConcept; // Role in the procedure
  actor: FHIRReference; // Who performed the procedure
  onBehalfOf?: FHIRReference; // Organization on whose behalf
}

export interface Procedure {
  id: string;
  patient_id: string;
  provider_id: string;
  treatment_plan_id?: string;
  
  // FHIR Procedure Core Fields
  fhir_id: string;
  status: ProcedureStatus;
  status_reason?: FHIRCodeableConcept;
  
  // Procedure Classification
  category?: FHIRCodeableConcept; // Classification of procedure
  code: FHIRCodeableConcept; // What was done
  
  // Clinical Context
  subject_reference: string; // Reference to Patient
  encounter_reference?: string; // Reference to Encounter
  performed_datetime?: string; // ISO 8601 datetime
  performed_period_start?: string; // ISO 8601 datetime
  performed_period_end?: string; // ISO 8601 datetime
  
  // Procedure Details
  recorder_reference?: string; // Who recorded the procedure
  asserter_reference?: string; // Who asserted the procedure
  performers: ProcedurePerformer[]; // Array of performers
  location_reference?: string; // Where procedure was performed
  reason_code: FHIRCodeableConcept[]; // Coded reason
  reason_reference: FHIRReference[]; // Reference to condition/observation
  body_site: FHIRCodeableConcept[]; // Target body sites
  outcome?: FHIRCodeableConcept; // Procedure outcome
  report: FHIRReference[]; // Any reports generated
  complications: FHIRCodeableConcept[]; // Complications during procedure
  follow_up: FHIRCodeableConcept[]; // Follow-up instructions
  
  // Supporting Documentation
  notes?: string;
  used_reference: FHIRReference[]; // Items used during procedure
  used_code: FHIRCodeableConcept[]; // Coded items used
  
  // FHIR Metadata
  fhir_meta: FHIRMeta;
  fhir_text: FHIRNarrative;
  
  // LGPD Compliance
  data_consent_given: boolean;
  data_consent_date?: string;
  data_retention_until?: string;
  
  // Audit & Versioning
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// ===============================================
// CLINICAL NOTES TYPES (FHIR DocumentReference/Observation)
// ===============================================

export type ClinicalNoteStatus = 'current' | 'superseded' | 'entered-in-error';

export type ConfidentialityLevel = 
  | 'U' // Unrestricted
  | 'L' // Low
  | 'M' // Moderate  
  | 'N' // Normal
  | 'R' // Restricted
  | 'V'; // Very Restricted

export interface ClinicalNoteRelatesTo {
  code: 'replaces' | 'transforms' | 'signs' | 'appends';
  target: FHIRReference;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  provider_id: string;
  treatment_plan_id?: string;
  procedure_id?: string;
  
  // FHIR DocumentReference/Observation Fields
  fhir_id: string;
  status: ClinicalNoteStatus;
  
  // Note Classification
  category?: FHIRCodeableConcept; // Type of note (progress, assessment, plan, etc.)
  type: FHIRCodeableConcept; // Specific note type
  subject_reference: string; // Reference to Patient
  encounter_reference?: string; // Reference to Encounter
  
  // Note Content
  title: string;
  content: string;
  content_type: string; // MIME type (text/plain, text/html, etc.)
  
  // Clinical Context
  authored_time: string; // ISO 8601 datetime
  author_reference: string; // Reference to Provider
  authenticator_reference?: string; // Reference to authenticating provider
  
  // Related Information
  relates_to: ClinicalNoteRelatesTo[]; // Related documents/notes
  context_reference?: string; // Context encounter
  
  // Security & Access
  security_label: FHIRCodeableConcept[]; // Security classifications
  confidentiality: ConfidentialityLevel;
  
  // FHIR Metadata
  fhir_meta: FHIRMeta;
  fhir_text: FHIRNarrative;
  
  // LGPD Compliance
  data_consent_given: boolean;
  data_consent_date?: string;
  data_retention_until?: string;
  
  // Audit & Versioning
  version: number;
  replaces?: string; // Previous version UUID
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// ===============================================
// FORM DATA TYPES (for React components)
// ===============================================

export interface TreatmentPlanFormData {
  title: string;
  description?: string;
  patient_id: string;
  status: TreatmentPlanStatus;
  intent: TreatmentPlanIntent;
  category: string[]; // Simplified for form - converted to FHIRCodeableConcept
  period_start?: string;
  period_end?: string;
  goals: string[];
  addresses: string[]; // Condition IDs
  data_consent_given: boolean;
}

export interface ProcedureFormData {
  code: string; // Procedure code
  code_display: string; // Human readable procedure name
  patient_id: string;
  treatment_plan_id?: string;
  status: ProcedureStatus;
  category?: string;
  performed_datetime?: string;
  performed_period_start?: string;
  performed_period_end?: string;
  body_site: string[];
  reason_code: string[];
  notes?: string;
  outcome?: string;
  data_consent_given: boolean;
}

export interface ClinicalNoteFormData {
  title: string;
  content: string;
  content_type: string;
  patient_id: string;
  treatment_plan_id?: string;
  procedure_id?: string;
  type: string; // Note type code
  type_display: string; // Human readable note type
  category?: string;
  confidentiality: ConfidentialityLevel;
  data_consent_given: boolean;
}

// ===============================================
// API RESPONSE TYPES
// ===============================================

export interface TreatmentPlanListResponse {
  treatment_plans: TreatmentPlan[];
  total_count: number;
  page: number;
  per_page: number;
}

export interface ProcedureListResponse {
  procedures: Procedure[];
  total_count: number;
  page: number;
  per_page: number;
}

export interface ClinicalNoteListResponse {
  clinical_notes: ClinicalNote[];
  total_count: number;
  page: number;
  per_page: number;
}

// ===============================================
// SEARCH AND FILTER TYPES
// ===============================================

export interface TreatmentPlanSearchFilters {
  patient_id?: string;
  provider_id?: string;
  status?: TreatmentPlanStatus[];
  intent?: TreatmentPlanIntent[];
  period_start?: string;
  period_end?: string;
  search_text?: string;
}

export interface ProcedureSearchFilters {
  patient_id?: string;
  provider_id?: string;
  treatment_plan_id?: string;
  status?: ProcedureStatus[];
  procedure_code?: string[];
  performed_start?: string;
  performed_end?: string;
  search_text?: string;
}

export interface ClinicalNoteSearchFilters {
  patient_id?: string;
  provider_id?: string;
  treatment_plan_id?: string;
  procedure_id?: string;
  status?: ClinicalNoteStatus[];
  note_type?: string[];
  authored_start?: string;
  authored_end?: string;
  confidentiality?: ConfidentialityLevel[];
  search_text?: string;
}

// ===============================================
// STATISTICS AND DASHBOARD TYPES
// ===============================================

export interface TreatmentStatistics {
  total_treatment_plans: number;
  active_treatment_plans: number;
  completed_treatment_plans: number;
  total_procedures: number;
  procedures_this_month: number;
  average_treatment_duration_days: number;
  most_common_procedures: {
    code: string;
    display: string;
    count: number;
  }[];
  treatment_outcomes: {
    successful: number;
    partial: number;
    unsuccessful: number;
  };
}

export interface ProviderTreatmentMetrics {
  provider_id: string;
  provider_name: string;
  total_treatments: number;
  success_rate: number;
  average_duration: number;
  patient_satisfaction: number;
  specialties: string[];
}
