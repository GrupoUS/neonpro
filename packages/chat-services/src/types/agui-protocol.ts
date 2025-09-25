/**
 * AG-UI Protocol Integration Types
 * @package @neonpro/chat-services
 */

/**
 * AG-UI protocol connection types
 */
export interface AguiConnectionConfig {
  url: string
  timeout?: number
  retries?: number
  heartbeatInterval?: number
  autoReconnect?: boolean
  connectionTimeout?: number
  messageQueueSize?: number
  enableCompression?: boolean
  enableEncryption?: boolean
}

export interface AguiConnectionStatus {
  connected: boolean
  connecting: boolean
  reconnecting: boolean
  lastConnectedAt?: Date
  connectionAttempts: number
  lastError?: string
  uptime: number
  latency: number
  messageQueue: number
}

/**
 * AG-UI message types and structures
 */
export interface AguiMessage {
  id: string
  type: AguiMessageType
  timestamp: Date
  sessionId: string
  clientId: string
  payload: AguiMessagePayload
  metadata?: AguiMessageMetadata
  priority?: AguiMessagePriority
  requiresAck?: boolean
}

export type AguiMessageType = 
  | 'chat_message'
  | 'session_update'
  | 'client_presence'
  | 'typing_indicator'
  | 'read_receipt'
  | 'delivery_receipt'
  | 'session_join'
  | 'session_leave'
  | 'session_transfer'
  | 'emergency_alert'
  | 'system_notification'
  | 'file_share'
  | 'image_analysis_request'
  | 'medical_data_request'
  | 'compliance_check'
  | 'audit_log'
  | 'heartbeat'
  | 'error'
  | 'acknowledgment'

export interface AguiMessagePayload {
  content?: any
  action?: string
  data?: any
  sessionId?: string
  userId?: string
  professionalId?: string
  patientId?: string
  messageType?: string
  urgent?: boolean
  encrypted?: boolean
}

export interface AguiMessageMetadata {
  source: string
  destination: string
  correlationId?: string
  traceId?: string
  spanId?: string
  userId?: string
  sessionId?: string
  tags?: string[]
  customHeaders?: Record<string, string>
}

export type AguiMessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency'

/**
 * AG-UI session management types
 */
export interface AguiSession {
  id: string
  type: AguiSessionType
  status: AguiSessionStatus
  participants: AguiParticipant[]
  createdAt: Date
  updatedAt: Date
  endedAt?: Date
  metadata: AguiSessionMetadata
  settings: AguiSessionSettings
  compliance: AguiSessionCompliance
}

export type AguiSessionType = 
  | 'clinical_consultation'
  | 'aesthetic_consultation'
  | 'patient_education'
  | 'emergency_response'
  | 'general_support'
  | 'team_collaboration'
  | 'training_session'
  | 'quality_assurance'

export type AguiSessionStatus = 
  | 'initializing'
  | 'active'
  | 'on_hold'
  | 'transferring'
  | 'ending'
  | 'completed'
  | 'cancelled'
  | 'error'

export interface AguiParticipant {
  id: string
  type: AguiParticipantType
  role: AguiParticipantRole
  status: AguiParticipantStatus
  joinedAt: Date
  leftAt?: Date
  metadata: AguiParticipantMetadata
  capabilities: AguiParticipantCapabilities
}

export type AguiParticipantType = 'user' | 'professional' | 'system' | 'ai_agent' | 'external_service'

export type AguiParticipantRole = 
  | 'host'
  | 'moderator'
  | 'participant'
  | 'observer'
  | 'translator'
  | 'supervisor'
  | 'quality_assurance'

export type AguiParticipantStatus = 'active' | 'away' | 'busy' | 'offline' | 'disconnecting'

export interface AguiParticipantMetadata {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  department?: string
  specialization?: string
  license?: string
  location?: string
  timezone?: string
  language?: string
  customFields?: Record<string, any>
}

export interface AguiParticipantCapabilities {
  canSendMessage: boolean
  canSendFiles: boolean
  canShareScreen: boolean
  canRecord: boolean
  canModerate: boolean
  canTransfer: boolean
  canInvite: boolean
  canEndSession: boolean
}

export interface AguiSessionMetadata {
  title?: string
  description?: string
  category?: string
  priority?: AguiMessagePriority
  estimatedDuration?: number
  actualDuration?: number
  tags?: string[]
  customFields?: Record<string, any>
}

export interface AguiSessionSettings {
  messageRetention: number
  enableRecording: boolean
  enableTranscription: boolean
  enableTranslation: boolean
  maxParticipants?: number
  allowedMessageTypes?: AguiMessageType[]
  moderationLevel: 'none' | 'low' | 'medium' | 'high'
  autoArchive: boolean
}

export interface AguiSessionCompliance {
  consentStatus: 'granted' | 'revoked' | 'pending' | 'expired'
  consentType: string[]
  consentGivenAt?: Date
  dataRetentionPolicy: string
  encryptionRequired: boolean
  auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive'
  complianceFramework: string[]
}

/**
 * AG-UI chat message specific types
 */
export interface AguiChatMessage extends AguiMessage {
  type: 'chat_message'
  payload: AguiChatMessagePayload
  messageType: AguiChatMessageType
  repliedTo?: string
  threadId?: string
  editedAt?: Date
  deletedAt?: Date
}

export interface AguiChatMessagePayload {
  content: string
  messageType: AguiChatMessageType
  attachments?: AguiAttachment[]
  mentions?: AguiMention[]
  reactions?: AguiReaction[]
  isEncrypted?: boolean
  isUrgent?: boolean
  requiresAcknowledgment?: boolean
}

export type AguiChatMessageType = 
  | 'text'
  | 'image'
  | 'file'
  | 'medical_image'
  | 'prescription'
  | 'lab_result'
  | 'vital_signs'
  | 'symptom_report'
  | 'treatment_plan'
  | 'diagnosis'
  | 'referral'
  | 'consent_form'
  | 'appointment_request'
  | 'emergency_alert'

export interface AguiAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnailUrl?: string
  metadata?: AguiAttachmentMetadata
  uploadedAt: Date
  encrypted?: boolean
  virusScanStatus: 'pending' | 'scanning' | 'clean' | 'infected' | 'failed'
}

export interface AguiAttachmentMetadata {
  mimeType: string
  dimensions?: { width: number; height: number }
  duration?: number
  pages?: number
  medicalDataType?: string
  patientId?: string
  encounterId?: string
  customFields?: Record<string, any>
}

export interface AguiMention {
  userId: string
  name: string
  type: AguiParticipantType
  role: AguiParticipantRole
  position: { start: number; end: number }
}

export interface AguiReaction {
  emoji: string
  userId: string
  timestamp: Date
}

/**
 * AG-UI real-time event types
 */
export interface AguiRealtimeEvent {
  id: string
  type: AguiEventType
  timestamp: Date
  sessionId: string
  userId?: string
  data: any
  metadata?: AguiEventMetadata
}

export type AguiEventType = 
  | 'user_joined'
  | 'user_left'
  | 'user_typing'
  | 'user_stopped_typing'
  | 'message_sent'
  | 'message_read'
  | 'message_delivered'
  | 'message_failed'
  | 'session_created'
  | 'session_updated'
  | 'session_ended'
  | 'connection_established'
  | 'connection_lost'
  | 'connection_restored'
  | 'emergency_triggered'
  | 'compliance_violation'
  | 'system_alert'

export interface AguiEventMetadata {
  source: string
  correlationId?: string
  traceId?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  tags?: string[]
  customFields?: Record<string, any>
}

/**
 * AG-UI file sharing and media types
 */
export interface AguiFileShareRequest {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
  sessionId: string
  recipientIds: string[]
  encrypted?: boolean
  password?: string
  expiryTime?: Date
  downloadLimit?: number
}

export interface AguiFileShareResponse {
  success: boolean
  shareId: string
  downloadUrl: string
  expiresAt: Date
  passwordRequired: boolean
}

export interface AguiMedicalImageAnalysisRequest {
  imageId: string
  imageType: string
  analysisType: AguiMedicalImageAnalysisType
  sessionId: string
  patientId?: string
  parameters?: Record<string, any>
  priority: AguiMessagePriority
}

export type AguiMedicalImageAnalysisType = 
  | 'skin_condition'
  | 'wound_assessment'
  | 'lesion_detection'
  | 'inflammation_analysis'
  | 'treatment_progress'
  | 'before_after_comparison'
  | 'aesthetic_outcome'
  | 'dermatological_analysis'

export interface AguiMedicalImageAnalysisResponse {
  requestId: string
  imageId: string
  analysisType: AguiMedicalImageAnalysisType
  results: AguiMedicalImageAnalysisResult
  confidence: number
  recommendations?: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  processedAt: Date
}

export interface AguiMedicalImageAnalysisResult {
  findings: AguiMedicalImageFinding[]
  measurements?: AguiMedicalImageMeasurement[]
  classification?: string
  severity?: string
  description: string
  metadata?: Record<string, any>
}

export interface AguiMedicalImageFinding {
  type: string
  location: string
  description: string
  confidence: number
  severity?: string
  coordinates?: { x: number; y: number; width?: number; height?: number }
}

export interface AguiMedicalImageMeasurement {
  type: string
  value: number
  unit: string
  location?: string
  accuracy?: number
}

/**
 * AG-UI emergency and alert types
 */
export interface AguiEmergencyAlert {
  id: string
  sessionId: string
  type: AguiEmergencyType
  severity: AguiEmergencySeverity
  patientId?: string
  triggeredBy: string
  triggeredAt: Date
  message: string
  vitals?: AguiVitalSigns
  symptoms?: AguiSymptomReport[]
  actionsRequired: string[]
  escalationLevel: number
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolvedAt?: Date
  resolution?: string
}

export type AguiEmergencyType = 
  | 'medical_emergency'
  | 'allergic_reaction'
  | 'adverse_event'
  | 'system_failure'
  | 'security_breach'
  | 'data_breach'
  | 'compliance_violation'
  | 'patient_safety'

export type AguiEmergencySeverity = 'low' | 'medium' | 'high' | 'critical' | 'life_threatening'

export interface AguiVitalSigns {
  bloodPressure?: { systolic: number; diastolic: number }
  heartRate?: number
  oxygenSaturation?: number
  temperature?: number
  respiratoryRate?: number
  bloodGlucose?: number
  painLevel?: number
  consciousnessLevel?: string
}

export interface AguiSymptomReport {
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  onset: Date
  description?: string
  location?: string
  triggers?: string[]
}

/**
 * AG-UI compliance and audit types
 */
export interface AguiComplianceCheck {
  id: string
  sessionId: string
  type: AguiComplianceCheckType
  status: AguiComplianceCheckStatus
  checkedAt: Date
  checkedBy: string
  result: AguiComplianceCheckResult
  violations?: AguiComplianceViolation[]
  recommendations?: string[]
  metadata?: Record<string, any>
}

export type AguiComplianceCheckType = 
  | 'data_privacy'
  | 'consent_verification'
  | 'encryption_validation'
  | 'access_control'
  | 'retention_policy'
  | 'audit_trail'
  | 'professional_conduct'
  | 'patient_safety'
  | 'emergency_response'

export type AguiComplianceCheckStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_attention'

export interface AguiComplianceCheckResult {
  passed: boolean
  score: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  details: Record<string, any>
}

export interface AguiComplianceViolation {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  rule: string
  timestamp: Date
  affectedResources: string[]
  resolution?: string
  resolvedAt?: Date
  resolvedBy?: string
}

/**
 * AG-UI integration interface types
 */
export interface AguiIntegration {
  id: string
  name: string
  type: AguiIntegrationType
  status: AguiIntegrationStatus
  config: AguiIntegrationConfig
  capabilities: string[]
  endpoints: AguiIntegrationEndpoint[]
  health: AguiIntegrationHealth
  metadata?: Record<string, any>
}

export type AguiIntegrationType = 
  | 'ehr_system'
  | 'practice_management'
  | 'imaging_system'
  | 'laboratory_system'
  | 'pharmacy_system'
  | 'billing_system'
  | 'scheduling_system'
  | 'ai_service'
  | 'external_service'
  | 'custom_integration'

export type AguiIntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'maintenance'

export interface AguiIntegrationConfig {
  baseUrl: string
  apiKey?: string
  credentials?: Record<string, string>
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  webhookUrl?: string
  settings?: Record<string, any>
}

export interface AguiIntegrationEndpoint {
  path: string
  method: string
  description: string
  parameters?: Record<string, any>
  responseSchema?: any
  rateLimit?: number
  authentication: string
}

export interface AguiIntegrationHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: Date
  responseTime: number
  uptime: number
  errorRate: number
  issues?: string[]
}