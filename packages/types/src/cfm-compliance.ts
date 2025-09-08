/**
 * CFM (Conselho Federal de Medicina) Compliance Types
 * Modern TypeScript types for Brazilian medical professional licensing
 */

export interface MedicalProfessional {
  id: string
  cfm_license: string
  crm_state: BrazilianState
  full_name: string
  specializations: MedicalSpecialty[]
  license_status: CFMLicenseStatus
  license_expiry: string // ISO date string
  digital_signature_cert?: string
  telemedicine_certified: boolean
  continuing_education_hours: number
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

export interface DigitalSignature {
  id: string
  professional_id: string
  document_hash: string
  signature_hash: string
  certificate_thumbprint: string
  timestamp: string // ISO date string
  document_type: CFMDocumentType
  document_reference: string
  is_valid: boolean
  validation_timestamp?: string // ISO date string
}

export interface TelemedicineSession {
  id: string
  professional_id: string
  patient_id: string
  session_type: TelemedicineSessionType
  start_time: string // ISO date string
  end_time?: string // ISO date string
  platform_used: string
  recording_consent: boolean
  recording_stored: boolean
  consultation_notes: string
  cfm_compliance_validated: boolean
  created_at: string // ISO date string
}

export interface ContinuingEducation {
  id: string
  professional_id: string
  course_name: string
  provider: string
  hours: number
  completion_date: string // ISO date string
  certificate_number: string
  cfm_recognized: boolean
  category: CFMEducationCategory
}

export interface CFMComplianceReport {
  period: {
    start: string // ISO date string
    end: string // ISO date string
  }
  professionals: {
    total: number
    active: number
    telemedicine_certified: number
    digital_signature_enabled: number
    licenses_expiring: number
  }
  digital_signatures: {
    total: number
    valid: number
    by_document_type: Record<CFMDocumentType, number>
  }
  telemedicine: {
    total_sessions: number
    compliant_sessions: number
    by_session_type: Record<TelemedicineSessionType, number>
  }
  continuing_education: {
    total_courses: number
    total_hours: number
    cfm_recognized: number
  }
  compliance_score: number
}

// Enums and Union Types
export type CFMLicenseStatus = 'active' | 'suspended' | 'revoked' | 'expired'

export type CFMDocumentType =
  | 'prescription'
  | 'medical_certificate'
  | 'treatment_plan'
  | 'consultation_report'

export type TelemedicineSessionType =
  | 'consultation'
  | 'follow_up'
  | 'second_opinion'
  | 'emergency'

export type CFMEducationCategory =
  | 'ethics'
  | 'clinical'
  | 'research'
  | 'technology'
  | 'management'

export type BrazilianState =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO'

export type MedicalSpecialty =
  | 'dermatology'
  | 'plastic_surgery'
  | 'aesthetic_medicine'
  | 'general_practice'
  | 'internal_medicine'
  | 'emergency_medicine'
  | string // Allow custom specialties

// Response types
export interface CFMValidationResult {
  success: boolean
  data?: MedicalProfessional | null
  error?: string
}

export interface CFMOperationResult<T = unknown,> {
  success: boolean
  data?: T
  error?: string
}

// Database response types for Supabase
export interface DatabaseResponse<T,> {
  data: T | null
  error: {
    message: string
    code?: string
  } | null
}

export interface DatabaseArrayResponse<T,> {
  data: T[] | null
  error: {
    message: string
    code?: string
  } | null
}

// Validation schemas
export interface CFMLicenseValidation {
  license: string
  state: BrazilianState
  isValid: boolean
  errors: string[]
}

export interface TelemedicineRequirements {
  hasInformedConsent: boolean
  usesCertifiedPlatform: boolean
  professionalQualified: boolean
  hasProperDocumentation: boolean
}

// Compliance log entry
export interface CFMComplianceLog {
  id: string
  action: string
  description: string
  reference_id: string
  module: 'cfm'
  timestamp: string // ISO date string
  user_id?: string
  metadata?: Record<string, unknown>
}
