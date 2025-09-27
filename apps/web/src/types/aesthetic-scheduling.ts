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
  professional?: string | ProfessionalDetails
  complianceStatus?: 'compliant' | 'warning' | 'non_compliant' | 'under_review'
}

export interface ProfessionalDetails {
  name: string
  specialty: string
  councilNumber: string
  id?: string
  fullName?: string
  licenseNumber?: string
  specializations?: string[]
  certifications?: any[]
}

// Recovery Planning Types
export interface RecoveryPhase {
  id: string
  name: string
  phase: string
  phaseNumber: number
  description: string
  startDay: number
  startDate?: Date // Added alternative to startDay
  endDay: number
  endDate?: Date // Added alternative to endDay
  duration?: number // Added missing property
  restrictions: string[]
  activities: string[]
  keyActivities?: string[] // Added alternative to activities
  symptoms: string[]
  tips: string[]
  milestones?: string[] // Added missing property
  warningSigns?: string[] // Added missing property
}

export interface RecoveryPlan {
  id: string
  patientId: string
  procedureId: string
  appointmentId?: string
  phases: RecoveryPhase[]
  totalDuration: number
  totalRecoveryTime: number
  specialInstructions: string[]
  instructions?: string[]
  followUpSchedule: FollowUpSchedule[]
  followUpAppointments?: FollowUpSchedule[] // Added alternative to followUpSchedule
  emergencyContacts: EmergencyContact[]
  customization?: RecoveryCustomization
  customNotes?: string
  careLevel?: string
  risks?: string[]
  warningSigns?: WarningSign[]
}

export interface FollowUpSchedule {
  id: string
  day: number
  type: 'consultation' | 'procedure' | 'assessment'
  duration: number
  notes?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  role: string
  availability: string
}

export interface RecoveryCustomization {
  skinType: string
  healingSpeed: 'slow' | 'normal' | 'fast'
  painTolerance: 'low' | 'medium' | 'high'
  lifestyle: string[]
}

export interface WarningSign {
  sign: string
  description: string
  severity: string
}

// Treatment Package Types
export interface TreatmentPackage {
  id: string
  name: string
  description: string
  procedures: TreatmentProcedure[]
  totalSessions: number
  sessionInterval: number
  totalPrice: number
  discountPercentage: number
  duration: number
  category: string
  requirements: string[]
  packageDiscount: number
  validityPeriod: number
  isActive: boolean
}

export interface TreatmentProcedure {
  id: string
  name: string
  description: string
  duration: number
  price: number
  sessions: number
  procedure: {
    name: string
    description: string
    category: string
    baseDuration: number
  }
  requirements?: string[]
}

export interface TreatmentPackageResponse {
  success: boolean
  packageId?: string
  message: string
  scheduledSessions?: ScheduledSession[]
}

export interface ScheduledSession {
  id: string
  procedureId: string
  date: Date
  professionalId: string
  roomId: string
}

// Room Allocation Types
export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  floor: number
  description: string
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved'
  equipment: string[]
}

export interface RoomSchedule {
  id: string
  roomId: string
  date: Date
  appointments: RoomAppointment[]
}

export interface RoomAppointment {
  id: string
  patientName: string
  procedureName: string
  startTime: string
  endTime: string
}

export interface OptimizationResult {
  efficiencyScore: number
  suggestions: string[]
}

export interface RoomAllocation {
  id: string
  roomId: string
  appointmentId: string
  startTime: Date
  endTime: Date
  status: 'reserved' | 'occupied' | 'cleaning' | 'maintenance'
}

export interface TimeSlot {
  start: Date
  end: Date
  id: string
}

export interface TimeSlotString {
  start: string
  end: string
  id: string
}