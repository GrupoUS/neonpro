// Patients domain types for aesthetic clinic client management
import { z } from 'zod'
import { BaseEntity, Address } from '../../common/types'

export interface Patient extends BaseEntity {
  clinic_id: string
  name: string
  email?: string
  phone: string
  cpf: string
  birth_date: Date
  gender?: Gender
  address?: Address
  medical_history?: MedicalHistory
  preferences?: PatientPreferences
  vip_status: boolean
  consent_data: ConsentData
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface MedicalHistory {
  allergies?: string[]
  medications?: string[]
  skin_conditions?: string[]
  previous_treatments?: string[]
  contraindications?: string[]
  notes?: string
}

export interface PatientPreferences {
  preferred_contact_method: 'phone' | 'email' | 'whatsapp'
  appointment_reminders: boolean
  marketing_consent: boolean
  preferred_days?: string[]
  preferred_times?: string[]
}

export interface ConsentData {
  lgpd_consent: boolean
  treatment_consent: boolean
  photo_consent: boolean
  data_processing_consent: boolean
  consent_date: Date
  consent_version: string
}

// Validation schemas
export const patientSchema = z.object({
  name: z.string().min(1, 'Nome do paciente é obrigatório'),
  email: z.string().email('E-mail inválido').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  birth_date: z.date(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
})