export interface ProfessionalSchedule {
  id: string
  professionalId: string
  professionalName: string
  specialty: string
  workingHours: WorkingHours[]
  availability: TimeSlot[]
  maxAppointmentsPerDay: number
  consultationDuration: number
  breakDuration: number
}

export interface WorkingHours {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
  appointmentId?: string
}

export interface Treatment {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  requiresCertification: boolean
  certificationLevel?: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: Date
  medicalHistory?: MedicalHistory[]
  preferences?: PatientPreferences
  complianceStatus: ComplianceStatus
}

export interface MedicalHistory {
  id: string
  date: Date
  type: string
  description: string
  professionalId: string
  treatmentId?: string
  documents?: string[]
}

export interface PatientPreferences {
  preferredProfessionalIds: string[]
  preferredTimeSlots: string[]
  notificationPreferences: NotificationPreferences
  accessibilityRequirements?: AccessibilityRequirements
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  whatsapp: boolean
  reminderTime: number // hours before appointment
}

export interface AccessibilityRequirements {
  mobilityAssistance: boolean
  visualImpairment: boolean
  hearingImpairment: boolean
  other: string[]
}

export type ComplianceStatus = 'pending' | 'verified' | 'requires_attention' | 'non_compliant'

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  treatmentId: string
  scheduledDate: Date
  duration: number
  status: AppointmentStatus
  notes?: string
  followUpRequired: boolean
  followUpDate?: Date
  compliance: AppointmentCompliance
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface AppointmentCompliance {
  lgpdCompliant: boolean
  dataProcessingConsent: boolean
  imageUsageConsent: boolean
  treatmentConsent: boolean
  verifiedAt?: Date
}

export interface CertificationValidator {
  professionalId: string
  certifications: ProfessionalCertification[]
  warnings: ComplianceWarning[]
  recommendations: ComplianceRecommendation[]
  status: CertificationStatus
  lastUpdated: Date
}

export interface ProfessionalCertification {
  id: string
  type: string
  number: string
  issuedDate: Date
  expiryDate: Date
  issuingAuthority: string
  status: 'active' | 'expired' | 'suspended'
  documentUrl?: string
}

export interface ComplianceWarning {
  id: string
  type: 'certification_expiry' | 'missing_document' | 'compliance_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  requiresAction: boolean
  dueDate?: Date
}

export interface ComplianceRecommendation {
  id: string
  type: 'training' | 'documentation' | 'certification' | 'process_improvement'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  estimatedTime?: number
  resources?: string[]
}

export type CertificationStatus = 'compliant' | 'warning' | 'non_compliant' | 'under_review'

export interface MultiSessionConfig {
  sessions: number
  interval: number // days between sessions
  totalDuration: number
  progressTracking: ProgressTracking[]
}

export interface ProgressTracking {
  sessionId: string
  date: Date
  notes: string
  photos?: string[]
  metrics?: TreatmentMetrics
  professionalAssessment: string
}

export interface TreatmentMetrics {
  area?: string
  improvement?: number
  satisfaction?: number
  sideEffects?: string[]
}

// Schema exports
export const MultiSessionSchedulingSchema = {
  validate: (data: any) => {
    // Stub validation
    return { success: true, data }
  }
}

// Missing types that are being imported
export interface AestheticProcedure {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  requiresCertification: boolean
  certificationLevel?: string
  contraindications?: string[]
  sideEffects?: string[]
  recoveryTime?: number
}

export interface AestheticSchedulingResponse {
  success: boolean
  appointmentId?: string
  sessionId?: string
  message?: string
  errors?: string[]
  compliance?: {
    lgpdCompliant: boolean
    dataProcessingConsent: boolean
    treatmentConsent: boolean
  }
}

export type PregnancyStatus = 'not_pregnant' | 'pregnant' | 'breastfeeding' | 'unknown'

export interface CertificationValidation {
  id: string
  professionalId: string
  procedureId: string
  isValid: boolean
  expiryDate?: Date
  warnings: string[]
  recommendations: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  missingCertifications?: string[]
  professional?: string
  complianceStatus?: 'compliant' | 'warning' | 'non_compliant' | 'under_review'
}