// Appointments domain types for aesthetic clinic scheduling
import { z } from 'zod'
import { BaseEntity } from '../../common/types'

export interface Appointment extends BaseEntity {
  patient_id: string
  professional_id: string
  treatment_id: string
  clinic_id: string
  scheduled_start: Date
  scheduled_end: Date
  actual_start?: Date
  actual_end?: Date
  status: AppointmentStatus
  notes?: string
  room?: string
  price: number
  payment_status: PaymentStatus
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface AppointmentSlot {
  professional_id: string
  start_time: Date
  end_time: Date
  is_available: boolean
  room?: string
}

// Validation schemas
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  professional_id: z.string().uuid('ID do profissional inválido'),
  treatment_id: z.string().uuid('ID do tratamento inválido'),
  scheduled_start: z.date(),
  scheduled_end: z.date(),
  notes: z.string().optional(),
  room: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo'),
})