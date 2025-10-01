// Re-export healthcare types from packages/types
export type { 
  Appointment, 
  AppointmentType 
} from '../../../../types/src/healthcare.js'

// Create enums for AppointmentStatus and PaymentStatus
// to maintain backward compatibility with existing code
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
  PARTIAL = 'partially_paid',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}