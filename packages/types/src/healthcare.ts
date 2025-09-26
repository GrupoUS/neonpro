import type { BaseEntity, DataRetentionPolicy, LGPDConsent, Status } from './common.js'

// Patient types (LGPD compliant)
export interface Patient extends BaseEntity {
  // Personal information
  cpf: string // Brazilian tax ID
  name: string
  email?: string
  phone?: string
  birthDate: Date
  gender?: 'M' | 'F' | 'O' // Male, Female, Other

  // Address
  address?: Address

  // LGPD compliance
  consent: LGPDConsent
  dataRetention: DataRetentionPolicy

  // Medical information
  allergies?: string[]
  medications?: string[]
  emergencyContact?: EmergencyContact

  // Status
  status: Status
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string // Brazilian CEP
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

// Healthcare professional types
export interface HealthcareProfessional extends BaseEntity {
  // Personal
  name: string
  email: string
  phone: string

  // Professional
  crm?: string // Brazilian medical license
  coren?: string // Brazilian nursing license
  specialty?: string
  department?: string

  // LGPD compliance
  consent: LGPDConsent
  dataRetention: DataRetentionPolicy

  // Status
  status: Status
  isActive: boolean
}

// Appointment types
export interface Appointment extends BaseEntity {
  patientId: string
  professionalId: string
  datetime: Date
  duration: number // minutes
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  diagnosis?: string
  treatment?: string

  // ANVISA compliance for medical procedures
  anvisaCode?: string
  cfmCompliance: boolean
}

export type AppointmentType = 'consultation' | 'exam' | 'procedure' | 'follow_up' | 'emergency'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

// Medical record types (highly regulated)
export interface MedicalRecord extends BaseEntity {
  patientId: string
  professionalId: string
  appointmentId?: string

  // Content
  symptoms: string[]
  diagnosis: string
  treatment: string
  medications: Medication[]

  // Compliance
  anvisaCompliant: boolean
  cfmCompliant: boolean
  lgpdConsent: LGPDConsent

  // Audit trail
  accessLog: AccessLog[]
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  anvisaCode?: string
}

export interface AccessLog {
  userId: string
  action: 'view' | 'edit' | 'delete' | 'export'
  timestamp: Date
  ipAddress: string
  justification?: string
}
