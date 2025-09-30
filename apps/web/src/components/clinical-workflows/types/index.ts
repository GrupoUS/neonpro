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

// Aesthetic Treatment Coordination Types
/**
 * Alertas específicos para coordenamento de tratamentos estéticos
 * Conformidade com LGPD, ANVISA e CFM para clínicas estéticas brasileiras
 */
export interface AestheticTreatmentAlert {
  id: string
  /** Tipo de alerta específico para tratamentos estéticos */
  type: 
    | 'consultation_request'      // Solicitação de consulta
    | 'treatment_coordination'    // Coordenação de tratamento
    | 'patient_concern'           // Preocupação do paciente
    | 'product_availability'      // Disponibilidade de produtos
    | 'equipment_support'         // Suporte técnico de equipamento
    | 'mild_reaction'             // Reação leve ao tratamento
    | 'post_treatment_follow'     // Acompanhamento pós-tratamento
    | 'scheduling_conflict'       // Conflito de agendamento
    | 'payment_issue'             // Issue de pagamento
    | 'professional_consultation' // Consulta profissional
  
  /** Prioridade baseada em impacto no paciente e fluxo clínico */
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  /** Identificação do paciente (quando aplicável) */
  patientId?: string
  
  /** Localização na clínica (sala, equipamento, etc.) */
  location: string
  
  /** Descrição detalhada do alerta */
  description: string
  
  /** ID do profissional que registrou o alerta */
  reportedBy: string // StaffMember ID
  
  /** Data e hora de registro em formato ISO */
  reportedAt: string
  
  /** Status atual do alerta */
  status: 
    | 'pending'       // Aguardando ação
    | 'in_progress'   // Em andamento
    | 'coordinated'   // Coordenado
    | 'resolved'      // Resolvido
    | 'cancelled'     // Cancelado
  
  /** IDs dos profissionais responsáveis pelo atendimento */
  assignedStaff: string[]
  
  /** Categoria do tratamento estético */
  treatmentCategory?: 
    | 'facial_treatments'
    | 'body_treatments' 
    | 'injectables'
    | 'laser_treatments'
    | 'peelings'
    | 'preventive_care'
    | 'recovery'
  
  /** Notas sobre a resolução do alerta */
  resolutionNotes?: string
  
  /** Data e hora da resolução */
  resolvedAt?: string
  
  /** ID do protocolo ativado (quando aplicável) */
  protocolId?: string
  
  /** Nível de urgência baseado em impacto no paciente */
  urgencyLevel: 'routine' | 'priority' | 'urgent'
  
  /** Indica se requer intervenção médica */
  requiresMedicalReview: boolean
  
  /** Conformidade LGPD - consentimento do paciente */
  patientConsent?: boolean
}

/**
 * Protocolos específicos para tratamentos estéticos e procedimentos clínicos
 * Alinhado com padrões ANVISA e melhores práticas clínicas
 */
export interface AestheticTreatmentProtocol {
  id: string
  /** Nome do protocolo de tratamento */
  name: string
  
  /** Descrição detalhada do procedimento */
  description: string
  
  /** Gatilhos que ativam este protocolo */
  triggers: string[]
  
  /** Etapas do procedimento em ordem sequencial */
  steps: AestheticTreatmentStep[]
  
  /** Papéis profissionais necessários para o protocolo */
  requiredRoles: StaffRole[]
  
  /** Tempo estimado para conclusão (em minutos) */
  estimatedDuration: number
  
  /** Categoria do tratamento estético */
  category:
    | 'consultation'           // Consulta inicial
    | 'treatment_preparation' // Preparo do tratamento
    | 'treatment_execution'   // Execução do tratamento
    | 'post_treatment_care'   // Cuidados pós-tratamento
    | 'emergency_response'    // Resposta a emergências
    | 'equipment_maintenance' // Manutenção de equipamentos
    | 'patient_coordination'  // Coordenação de paciente
  
  /** Nível de complexidade do protocolo */
  complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'specialized'
  
  /** Materiais e produtos necessários */
  requiredMaterials?: string[]
  
  /** Equipamentos necessários */
  requiredEquipment?: string[]
  
  /** Contraindicações e cuidados especiais */
  contraindications?: string[]
  
  /** Tempo de recuperação estimado */
  recoveryTime?: number // em horas
  
  /** Necessidade de acompanhamento pós-procedimento */
  requiresFollowUp: boolean
  
  /** Intervalo recomendado entre sessões */
  sessionInterval?: number // em dias
  
  /** Última atualização do protocolo */
  lastUpdated: string
  
  /** Versão do protocolo */
  version: string
  
  /** Responsável técnico pelo protocolo */
  technicalResponsible: string // StaffMember ID
  
  /** Conformidade com regulamentações */
  complianceStandards: {
    anvisa: boolean
    lgpd: boolean
    cfm: boolean
  }
  
  /** Documentação obrigatória */
  requiredDocumentation?: string[]
  
  /** Protocolo de segurança do paciente */
  patientSafetyProtocol?: string[]
}

/**
 * Etapa específica de tratamento estético
 */
export interface AestheticTreatmentStep {
  order: number
  title: string
  description: string
  assignedRole: StaffRole
  estimatedDuration: number // em minutos
  critical: boolean
  /** Detalhes adicionais da etapa */
  instructions?: string[]
  /** Materiais específicos para esta etapa */
  materials?: string[]
  /** Checklists de verificação */
  checklist?: string[]
  /** Pontos de atenção crítica */
  criticalPoints?: string[]
  /** Documentação necessária para a etapa */
  documentation?: string[]
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

