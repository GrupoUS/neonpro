// Healthcare Provider Types
export interface HealthcareProvider {
  id: string
  userId: string
  providerType: 'DOCTOR' | 'NURSE' | 'TECHNICIAN'
  specialization: string[]
  licenseState?: string
  boardCertified: boolean
  workingHours?: WorkingHours
  consultationDuration?: number
  averageRating?: number
  totalPatients: number
  totalAppointments: number
  createdAt: string
  updatedAt: string
}

export interface WorkingHours {
  [day: string]: {
    start: string
    end: string
    break?: {
      start: string
      end: string
    }
  }
}

export interface ProviderSchedule {
  id: string
  providerId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
  breakStart?: string
  breakEnd?: string
}

export interface ProviderAvailability {
  providerId: string
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}

// Provider Performance Types
export interface ProviderMetrics {
  providerId: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  averageRating: number
  totalRevenue: number
  patientRetentionRate: number
  averageConsultationTime: number
}

export interface ProviderSpecialty {
  id: string
  name: string
  description?: string
  requiresCertification: boolean
  procedures: string[]
}

// License and Certification Types
export interface ProfessionalLicense {
  id: string
  providerId: string
  licenseType: string // CRM, COREN, etc.
  licenseNumber: string
  issuingBody: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'pending'
}

export interface Certification {
  id: string
  providerId: string
  certificationName: string
  certifyingBody: string
  issueDate: string
  expiryDate?: string
  status: 'active' | 'expired' | 'pending'
}