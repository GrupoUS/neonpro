import * as React from 'react'

// Brazilian Healthcare Data Types
export interface BrazilianPersonalInfo {
  fullName: string
  cpf?: string
  dateOfBirth: string
  email?: string
  phone: string
  rg?: string
  gender?: 'masculino' | 'feminino' | 'outro' | 'nao_informado'
}

export interface BrazilianAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: BrazilianState
  zipCode: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface MedicalHistory {
  allergies?: string[]
  medications?: string[]
  conditions?: string[]
  previousTreatments?: string[]
  notes?: string
  bloodType?: string
  height?: number
  weight?: number
}

export interface LGPDConsent {
  treatmentConsent: boolean
  dataSharingConsent: boolean
  marketingConsent: boolean
  emergencyContactConsent: boolean
  dataRetentionPeriod?: '6m' | '1y' | '2y' | '5y' | '10y'
  consentDate: string
  consentVersion: string
}

export interface PatientData {
  personalInfo: BrazilianPersonalInfo
  address: BrazilianAddress
  emergencyContact: EmergencyContact
  medicalHistory: MedicalHistory
  consent: LGPDConsent
  createdAt: string
  updatedAt: string
}

// Brazilian State Types
export type BrazilianState = 
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' 
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' 
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO'

// Healthcare Context Types
export type HealthcareContext = 
  | 'patient' 
  | 'medical' 
  | 'administrative' 
  | 'emergency'
  | 'aesthetic'
  | 'scheduling'

export type HealthcareValidationLevel = 
  | 'none'
  | 'basic' 
  | 'strict' 
  | 'healthcare_critical'

// Form Validation Types
export interface FormFieldError {
  field: string
  message: string
  severity: 'warning' | 'error' | 'info'
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormFieldError[]
  warnings: FormFieldError[]
}

export interface HealthcareFormProps {
  onSubmit: (data: PatientData) => Promise<void>
  onCancel?: () => void
  className?: string
  validationLevel?: HealthcareValidationLevel
  healthcareContext?: HealthcareContext
}

// Healthcare-specific validation patterns
export interface HealthcareValidationPatterns {
  cpf: {
    pattern: string
    message: string
  }
  phone: {
    pattern: string
    message: string
  }
  dateOfBirth: {
    minAge?: number
    maxAge?: number
    message: string
  }
  zipCode: {
    pattern: string
    message: string
  }
}

// Accessibility Types
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  role?: string
}

export interface ScreenReaderAnnouncement {
  message: string
  politeness: 'polite' | 'assertive'
  timeout?: number
}

// Healthcare Component Props
export interface HealthcareComponentProps extends AccessibilityProps {
  healthcareContext?: HealthcareContext
  validationState?: 'none' | 'valid' | 'invalid' | 'warning'
  required?: boolean
  disabled?: boolean
  loading?: boolean
  error?: string
  helperText?: string
}

// Form Field Types
export type FormFieldType = 
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'

export interface FormFieldConfig {
  name: string
  type: FormFieldType
  label: string
  required: boolean
  validation?: HealthcareValidationPatterns
  healthcareContext?: HealthcareContext
  options?: Array<{ value: string; label: string }>
}

// Multi-step Form Types
export interface FormStep {
  id: string
  title: string
  description: string
  icon?: string
  fields: FormFieldConfig[]
  validation?: (data: Partial<PatientData>) => FormValidationResult
}

// LGPD Compliance Types
export interface LGPDDataAccess {
  userId: string
  dataType: string
  purpose: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface LGPDConsentRecord {
  id: string
  patientId: string
  consentType: string
  granted: boolean
  timestamp: string
  ipAddress: string
  consentVersion: string
}

// UI Component Types
export interface HealthcareInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'aria-invalid' | 'aria-required' | 'role'>, HealthcareComponentProps {
  label?: string
  error?: string
  helperText?: string
  healthcareContext?: HealthcareContext
  validationState?: 'none' | 'valid' | 'invalid' | 'warning'
}

export interface HealthcareSelectProps extends HealthcareComponentProps {
  options: Array<{ value: string; label: string }>
  placeholder?: string
  onValueChange: (value: string) => void
}

export interface HealthcareFormGroupProps extends HealthcareComponentProps {
  children: React.ReactNode
  label: string
  context?: HealthcareContext
}

// Treatment-specific Types
export interface AestheticTreatment {
  id: string
  name: string
  category: string
  duration: number
  price: number
  requiresCertification: boolean
  contraindications: string[]
  aftercareInstructions: string[]
}

export interface TreatmentSession {
  id: string
  treatmentId: string
  patientId: string
  scheduledDate: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  professionalId: string
  roomNumber?: string
  notes?: string
}

// Export validation constants
export const HEALTHCARE_VALIDATION_PATTERNS: HealthcareValidationPatterns = {
  cpf: {
    pattern: '^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$',
    message: 'CPF deve estar no formato 000.000.000-00'
  },
  phone: {
    pattern: '^\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}$',
    message: 'Telefone deve estar no formato (11) 99999-9999'
  },
  dateOfBirth: {
    minAge: 13,
    maxAge: 120,
    message: 'Idade deve estar entre 13 e 120 anos'
  },
  zipCode: {
    pattern: '^[0-9]{5}-[0-9]{3}$',
    message: 'CEP deve estar no formato 00000-000'
  }
}