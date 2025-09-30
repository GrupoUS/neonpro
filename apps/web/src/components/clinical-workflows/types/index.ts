/**
 * Clinical Workflow Data Types
 * 
 * Types específicos para fluxos de trabalho clínicos em clínicas estéticas brasileiras
 * 
 * @module ClinicalWorkflowTypes
 */

import { PatientData, TreatmentSession, HealthcareContext } from '@/types/healthcare'

// Staff Role Types
export type StaffRole = 
  | 'medico' 
  | 'enfermeiro' 
  | 'tecnico_enfermagem' 
  | 'esteticista' 
  | 'coordenador_clinico' 
  | 'recepcao' 
  | 'administrativo'

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  specializations?: string[]
  crm?: string // Conselho Regional de Medicina
  coren?: string // Conselho Regional de Enfermagem
  phone: string
  email: string
  active: boolean
  avatar?: string
  workingHours: WorkingHours
}

export interface WorkingHours {
  monday: TimeRange[]
  tuesday: TimeRange[]
  wednesday: TimeRange[]
  thursday: TimeRange[]
  friday: TimeRange[]
  saturday: TimeRange[]
  sunday: TimeRange[]
}

export interface TimeRange {
  start: string
  end: string
}

// Clinical Workflow Types
export interface ClinicalTask {
  id: string
  title: string
  description: string
  assignedTo: string // StaffMember ID
  assignedBy: string // StaffMember ID
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: string
  patientId?: string
  treatmentSessionId?: string
  category: 'patient_care' | 'administrative' | 'clinical' | 'emergency'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PatientIntakeStep {
  id: string
  title: string
  description: string
  order: number
  required: boolean
  estimatedDuration: number // em minutos
  formFields: string[]
  assignedRole?: StaffRole
}

export interface PatientIntakeFlow {
  id: string
  patientId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  currentStep: number
  steps: PatientIntakeStep[]
  assignedStaff: string[]
  estimatedTotalDuration: number
  actualDuration?: number
  startedAt?: string
  completedAt?: string
  data: Partial<PatientData>
}

// Clinical Documentation Types
export interface ClinicalNote {
  id: string
  patientId: string
  authorId: string // StaffMember ID
  authorRole: StaffRole
  type: 'initial_assessment' | 'progress_note' | 'treatment_note' | 'follow_up' | 'discharge_summary'
  content: string
  attachments?: DocumentAttachment[]
  tags: string[]
  isConfidential: boolean
  createdAt: string
  updatedAt: string
}

export interface DocumentAttachment {
  id: string
  filename: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface TreatmentProgress {
  id: string
  treatmentSessionId: string
  patientId: string
  professionalId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'complications' | 'cancelled'
  progressPercentage: number
  notes: string
  photos?: string[]
  measurements?: TreatmentMeasurements[]
  nextSessionDate?: string
  createdAt: string
  updatedAt: string
}

export interface TreatmentMeasurements {
  area: string
  beforeValue: number
  afterValue?: number
  unit: string
  date: string
}

// Emergency Response Types
export interface EmergencyAlert {
  id: string
  type: 'medical_emergency' | 'severe_reaction' | 'equipment_failure' | 'security_incident'
  severity: 'low' | 'medium' | 'high' | 'critical'
  patientId?: string
  location: string
  description: string
  reportedBy: string // StaffMember ID
  reportedAt: string
  status: 'active' | 'responding' | 'resolved' | 'false_alarm'
  responseTeam: string[]
  resolutionNotes?: string
  resolvedAt?: string
}

export interface EmergencyProtocol {
  id: string
  name: string
  description: string
  triggers: string[]
  steps: EmergencyStep[]
  requiredRoles: StaffRole[]
  estimatedResponseTime: number // em minutos
  lastUpdated: string
  version: string
}

export interface EmergencyStep {
  order: number
  title: string
  description: string
  assignedRole: StaffRole
  estimatedDuration: number
  critical: boolean
}

// Mobile Clinical Interface Types
export interface MobileClinicalSession {
  id: string
  staffId: string
  patientId?: string
  deviceInfo: DeviceInfo
  startTime: string
  endTime?: string
  activities: ClinicalActivity[]
  offlineMode: boolean
  syncStatus: 'synced' | 'pending' | 'failed'
}

export interface DeviceInfo {
  deviceType: 'tablet' | 'smartphone' | 'desktop'
  os: string
  browser?: string
  screenResolution: string
  isOnline: boolean
}

export interface ClinicalActivity {
  id: string
  type: 'patient_intake' | 'treatment' | 'documentation' | 'consultation' | 'emergency'
  timestamp: string
  data: any
  synced: boolean
}

// Real-time Communication Types
export interface ClinicalMessage {
  id: string
  senderId: string
  recipientId?: string // undefined for broadcast
  recipientRole?: StaffRole // undefined for specific person
  content: string
  type: 'general' | 'urgent' | 'patient_update' | 'emergency' | 'task_assignment'
  priority: 'low' | 'medium' | 'high'
  read: boolean
  readAt?: string
  attachments?: DocumentAttachment[]
  createdAt: string
}

export interface VideoConsultation {
  id: string
  patientId: string
  professionalId: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  meetingLink?: string
  notes?: string
  recordingUrl?: string
}

// Brazilian Healthcare Compliance Types
export interface ANVISAReport {
  id: string
  treatmentSessionId: string
  patientId: string
  professionalId: string
  procedureType: string
  materialsUsed: MedicalMaterial[]
  complications?: string
  patientOutcome: string
  followUpRequired: boolean
  followUpDate?: string
  reportedAt: string
  reportedBy: string
}

export interface MedicalMaterial {
  id: string
  name: string
  batchNumber: string
  expirationDate: string
  quantity: number
  manufacturer: string
  anvisaRegistration?: string
}

// Dashboard and Analytics Types
export interface ClinicalDashboard {
  todayStats: DailyClinicalStats
  staffPerformance: StaffPerformance[]
  patientFlow: PatientFlowData
  emergencyStatus: EmergencyStatus
  alerts: AlertItem[]
}

export interface DailyClinicalStats {
  totalPatients: number
  newPatients: number
  completedTreatments: number
  scheduledTreatments: number
  emergencyCases: number
  staffUtilization: number
  averageWaitTime: number
}

export interface StaffPerformance {
  staffId: string
  name: string
  role: StaffRole
  patientsAttended: number
  treatmentsCompleted: number
  averageSessionTime: number
  satisfactionScore?: number
  efficiency: number
}

export interface PatientFlowData {
  hourlyPatientCount: { hour: number; count: number }[]
  averageWaitTimeByHour: { hour: number; waitTime: number }[]
  treatmentTypeDistribution: { type: string; count: number }[]
}

export interface EmergencyStatus {
  activeAlerts: number
  averageResponseTime: number
  resolvedToday: number
  criticalAlerts: number
}

export interface AlertItem {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  actionRequired: boolean
  actionUrl?: string
}

// Component Props Interfaces
export interface ClinicalWorkflowComponentProps {
  patientId?: string
  staffId: string
  healthcareContext: HealthcareContext
  className?: string
  onEmergencyAlert?: (alert: EmergencyAlert) => void
  onTaskUpdate?: (task: ClinicalTask) => void
  onPatientUpdate?: (patient: PatientData) => void
}

export interface MobileClinicalProps {
  session: MobileClinicalSession
  offlineCapable: boolean
  onSyncComplete?: (success: boolean) => void
  onEmergency?: (alert: EmergencyAlert) => void
}

export interface StaffCoordinationProps {
  staffMembers: StaffMember[]
  tasks: ClinicalTask[]
  messages: ClinicalMessage[]
  onTaskAssignment?: (taskId: string, staffId: string) => void
  onSendMessage?: (message: Omit<ClinicalMessage, 'id' | 'createdAt' | 'read'>) => void
  onTaskUpdate?: (task: ClinicalTask) => void
}

// Validation Types
export interface ClinicalWorkflowValidation {
  isValid: boolean
  errors: WorkflowValidationError[]
  warnings: WorkflowValidationWarning[]
}

export interface WorkflowValidationError {
  field: string
  message: string
  severity: 'error'
  code: string
}

export interface WorkflowValidationWarning {
  field: string
  message: string
  severity: 'warning'
  code: string
}

// Export all types
export type {
  StaffMember,
  WorkingHours,
  TimeRange,
  ClinicalTask,
  PatientIntakeStep,
  PatientIntakeFlow,
  ClinicalNote,
  DocumentAttachment,
  TreatmentProgress,
  TreatmentMeasurements,
  EmergencyAlert,
  EmergencyProtocol,
  EmergencyStep,
  MobileClinicalSession,
  DeviceInfo,
  ClinicalActivity,
  ClinicalMessage,
  VideoConsultation,
  ANVISAReport,
  MedicalMaterial,
  ClinicalDashboard,
  DailyClinicalStats,
  StaffPerformance,
  PatientFlowData,
  EmergencyStatus,
  AlertItem,
  ClinicalWorkflowComponentProps,
  MobileClinicalProps,
  StaffCoordinationProps,
  ClinicalWorkflowValidation,
  WorkflowValidationError,
  WorkflowValidationWarning
}