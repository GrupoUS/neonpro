// =============================================================================
// 👤 PATIENT TYPES - FHIR R4 COMPLIANT
// =============================================================================

export interface Patient {
  id: string
  userId: string
  medicalRecordNumber: string
  patientId: string
  
  // Contact Information
  address?: Address
  emergencyContact?: EmergencyContact
  
  // Medical Information
  allergies: string[]
  medications: string[]
  medicalConditions: string[]
  insuranceNumber?: string
  insuranceProvider?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Relations
  user: User
  appointments?: Appointment[]
  medicalRecords?: MedicalRecord[]
  billingRecords?: Billing[]
  prescriptions?: Prescription[]
  feedback?: AppointmentFeedback[]
}

export interface Address {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
}

export interface EmergencyContact {
  name?: string
  phone?: string
  relationship?: string
}

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  cpf?: string
  birthDate?: string
  gender?: string
  role: UserRole
  status: UserStatus
  professionalId?: string
  specialty?: string
  licenseNumber?: string
  licenseExpiry?: string
  emailVerified: boolean
  phoneVerified: boolean
  lgpdConsentDate?: string
  lgpdConsentVersion?: string
  emergencyContact?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEDICAL_DIRECTOR = 'MEDICAL_DIRECTOR',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  TECHNICIAN = 'TECHNICIAN',
  RECEPTIONIST = 'RECEPTIONIST',
  BILLING = 'BILLING',
  AUDITOR = 'AUDITOR',
  PATIENT = 'PATIENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface PatientCreateInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  cpf?: string
  birthDate?: string
  gender?: string
  address?: Address
  emergencyContact?: EmergencyContact
  allergies?: string[]
  medications?: string[]
  medicalConditions?: string[]
  insuranceNumber?: string
  insuranceProvider?: string
  lgpdConsent: boolean
}

export interface PatientUpdateInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: Address
  emergencyContact?: EmergencyContact
  allergies?: string[]
  medications?: string[]
  medicalConditions?: string[]
  insuranceNumber?: string
  insuranceProvider?: string
}

export interface PatientSearchFilters {
  search?: string
  status?: UserStatus
  birthDateFrom?: string
  birthDateTo?: string
  hasInsurance?: boolean
  city?: string
  state?: string
}

export interface PatientListResponse {
  patients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// LGPD Compliance Types
export interface PatientDataExport {
  personalData: {
    identification: Partial<User>
    medical: Partial<Patient>
    contact: Address & EmergencyContact
  }
  medicalHistory: MedicalRecord[]
  appointments: Appointment[]
  billing: Billing[]
  communications: any[]
  consents: ConsentRecord[]
}

// DataSubjectRequest interface moved to compliance.types.ts to avoid duplication

// Clinical Types
export interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  bmi?: number
  oxygenSaturation?: number
  respiratoryRate?: number
  notes?: string
}

export interface ClinicalHistory {
  chiefComplaint?: string
  historyOfPresentIllness?: string
  pastMedicalHistory?: string
  familyHistory?: string
  socialHistory?: string
  reviewOfSystems?: string
}

// Forward declarations for circular dependencies
interface Appointment {
  id: string
  // ... other properties
}

interface MedicalRecord {
  id: string
  // ... other properties
}

interface Billing {
  id: string
  // ... other properties
}

interface Prescription {
  id: string
  // ... other properties
}

interface AppointmentFeedback {
  id: string
  // ... other properties
}

interface ConsentRecord {
  id: string
  // ... other properties
}