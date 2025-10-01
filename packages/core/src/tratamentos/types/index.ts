// Treatments domain types for aesthetic procedures catalog
import { z } from 'zod'
import { BaseEntity } from '../../common/types'
import type { ProfessionalSpecialty } from '../../profissionais/types'

export interface Treatment extends BaseEntity {
  clinic_id: string
  name: string
  description: string
  category: TreatmentCategory
  duration_minutes: number
  base_price: number
  active: boolean
  requires_preparation: boolean
  recovery_days?: number
  contraindications?: string[]
  benefits?: string[]
  session_count: number
  interval_days: number
  photos: TreatmentPhoto[]
  professional_specialties: ProfessionalSpecialty[]
}

export enum TreatmentCategory {
  FACIAL_TREATMENTS = 'facial_treatments',
  BODY_TREATMENTS = 'body_treatments',
  INJECTABLES = 'injectables',
  LASER_TREATMENTS = 'laser_treatments',
  PEELINGS = 'peelings',
  THREAD_LIFT = 'thread_lift',
  HAIR_TREATMENTS = 'hair_treatments',
  WELLNESS = 'wellness'
}

export interface TreatmentPhoto {
  id: string
  url: string
  alt_text: string
  is_before_after: boolean
  order: number
}

export interface TreatmentPackage extends BaseEntity {
  clinic_id: string
  name: string
  description: string
  treatments: PackageTreatment[]
  total_price: number
  discount_percentage: number
  session_count: number
  validity_days: number
  active: boolean
}

export interface PackageTreatment {
  treatment_id: string
  quantity: number
  custom_price?: number
}

// Validation schemas
export const treatmentSchema = z.object({
  name: z.string().min(1, 'Nome do tratamento é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.nativeEnum(TreatmentCategory),
  duration_minutes: z.number().positive('Duração deve ser positiva'),
  base_price: z.number().min(0, 'Preço base deve ser positivo'),
  session_count: z.number().positive('Número de sessões deve ser positivo'),
  interval_days: z.number().nonnegative('Intervalo deve ser não negativo')
})