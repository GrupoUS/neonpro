// Professionals domain types for aesthetic clinic specialists
import { z } from 'zod'
import { BaseEntity } from '../../common/types'

export interface Professional extends BaseEntity {
  clinic_id: string
  name: string
  email: string
  phone: string
  cpf: string
  professional_license: string
  specialty: ProfessionalSpecialty
  bio?: string
  photo_url?: string
  availability: AvailabilitySlot[]
  commission_rate: number
  is_active: boolean
  languages: string[]
  certifications: Certification[]
}

export enum ProfessionalSpecialty {
  DERMATOLOGIST = 'dermatologist',
  PLASTIC_SURGEON = 'plastic_surgeon',
  AESTHETIC_PHYSICIAN = 'aesthetic_physician',
  BEAUTY_THERAPIST = 'beauty_therapist',
  NURSE_AESTHETICIAN = 'nurse_aesthetician',
  MAKEUP_ARTIST = 'makeup_artist'
}

export interface AvailabilitySlot {
  id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string // HH:MM
  end_time: string // HH:MM
  is_available: boolean
  room_preference?: string
}

export interface Certification {
  id: string
  name: string
  issuing_institution: string
  issue_date: Date
  expiry_date?: Date
  certificate_number: string
  document_url?: string
}

export interface ProfessionalRating extends BaseEntity {
  professional_id: string
  patient_id: string
  rating: number // 1-5
  comment?: string
  date: Date
  appointment_id?: string
}

// Validation schemas
export const professionalSchema = z.object({
  name: z.string().min(1, 'Nome do profissional é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  professional_license: z.string().min(1, 'Registro profissional é obrigatório'),
  specialty: z.nativeEnum(ProfessionalSpecialty),
  commission_rate: z.number().min(0).max(1, 'Taxa de comissão deve ser entre 0 e 1')
})