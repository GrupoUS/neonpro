// =============================================================================
// 📅 APPOINTMENT TYPES - HEALTHCARE SCHEDULING
// =============================================================================

export interface Appointment {
  id: string
  patientId: string
  providerId?: string
  createdById: string
  
  // Appointment Details
  appointmentDate: string
  durationMinutes: number
  appointmentType: AppointmentType
  status: AppointmentStatus
  
  // Clinical Information
  chiefComplaint?: string
  notes?: string
  diagnosis: string[]
  treatmentPlan?: string
  
  // Administrative
  insuranceAuthorized: boolean
  copayAmount?: number
  totalCost?: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  completedAt?: string
  
  // Relations
  patient: Patient
  provider?: HealthcareProvider
  medicalRecords?: MedicalRecord[]
  billing?: Billing[]
  feedback?: AppointmentFeedback
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  TELEMEDICINE = 'TELEMEDICINE'
}

export interface AppointmentCreateInput {
  patientId: string
  providerId?: string
  appointmentDate: string
  durationMinutes?: number
  appointmentType: AppointmentType
  chiefComplaint?: string
  notes?: string
  insuranceAuthorized?: boolean
  copayAmount?: number
  totalCost?: number
}

export interface AppointmentUpdateInput {
  appointmentDate?: string
  durationMinutes?: number
  appointmentType?: AppointmentType
  status?: AppointmentStatus
  chiefComplaint?: string
  notes?: string
  diagnosis?: string[]
  treatmentPlan?: string
  insuranceAuthorized?: boolean
  copayAmount?: number
  totalCost?: number
}

export interface AppointmentSearchFilters {
  patientId?: string
  providerId?: string
  date?: string
  dateFrom?: string
  dateTo?: string
  status?: AppointmentStatus
  type?: AppointmentType
  search?: string
}

export interface AppointmentFeedback {
  id: string
  appointmentId: string
  patientId: string
  
  // Ratings (1-5 scale)
  overallRating: number
  providerRating: number
  facilityRating: number
  schedulingRating: number
  
  // Feedback
  positiveFeedback?: string
  improvementAreas?: string
  wouldRecommend?: boolean
  
  // Net Promoter Score
  npsScore?: number
  
  // Timestamps
  submittedAt: string
  
  // Relations
  appointment: Appointment
  patient: Patient
}

// TimeSlot interface moved to healthcare-provider.types.ts to avoid duplication

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  status: AppointmentStatus
  type: AppointmentType
  patientName: string
  providerName?: string
  color?: string
}

export interface SchedulingConflict {
  type: 'DOUBLE_BOOKING' | 'PROVIDER_UNAVAILABLE' | 'OUTSIDE_HOURS'
  message: string
  conflictingAppointment?: Appointment
}

export interface AppointmentStatistics {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  noShows: number
  averageDuration: number
  completionRate: number
  cancellationRate: number
  noShowRate: number
}

// ProviderSchedule interface moved to healthcare-provider.types.ts to avoid duplication

export interface AppointmentReminder {
  id: string
  appointmentId: string
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH'
  scheduledFor: string
  sent: boolean
  sentAt?: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
}

// Forward declarations
interface Patient {
  id: string
  // ... other properties
}

interface HealthcareProvider {
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