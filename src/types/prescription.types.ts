// Prescription and Medication Types
export type PrescriptionStatus = 'DRAFT' | 'ACTIVE' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED'

export interface Prescription {
  id: string
  patientId: string
  providerId: string
  medicalRecordId?: string
  prescriptionNumber: string
  status: PrescriptionStatus
  diagnosis: string
  notes?: string
  digitalSignature?: any // ICP-Brasil signature data
  signedAt?: string
  validUntil: string
  refillsAllowed: number
  refillsUsed: number
  createdAt: string
  updatedAt: string
}

export interface PrescriptionItem {
  id: string
  prescriptionId: string
  medicationName: string
  dosage: string // "50mg"
  frequency: string // "2x ao dia"
  duration: string // "7 dias"
  quantity: string // "14 comprimidos"
  instructions: string // "Tomar com alimentos"
  controlledSubstance: boolean
  controlList?: string // "A1", "B1", etc.
  createdAt: string
}

export interface Medication {
  id: string
  name: string
  genericName: string
  brand?: string
  strength: string
  dosageForm: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'other'
  activeIngredients: string[]
  controlledSubstance: boolean
  controlSchedule?: string
  anvisaCode?: string
  therapeutic_class: string
  sideEffects: string[]
  contraindications: string[]
  interactions: string[]
}

export interface DigitalSignature {
  prescriptionId: string
  providerId: string
  signatureData: string // Base64 encoded signature
  certificateData: string // ICP-Brasil certificate
  timestamp: string
  verified: boolean
  verificationDate?: string
}

export interface PrescriptionTemplate {
  id: string
  providerId: string
  name: string
  diagnosis: string
  medications: {
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }[]
  isPublic: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface MedicationHistory {
  id: string
  patientId: string
  prescriptionId: string
  medicationName: string
  startDate: string
  endDate?: string
  adherence?: number // 0-100%
  effectiveness?: number // 0-10 scale
  sideEffectsReported: string[]
  discontinuedReason?: string
}