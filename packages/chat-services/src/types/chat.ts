/**
 * Core Chat Types for Unified Chat Services
 */

import { v4 as uuidv4 } from 'uuid';

// Enhanced chat message types with healthcare compliance
export interface EnhancedChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  messageType: MessageType;
  attachments?: ChatAttachment[];
  metadata?: ChatMessageMetadata;
  redactionFlags?: string[];
  createdAt: string;
  updatedAt?: string;
  provider?: string;
  confidence?: number;
  requiresFollowUp?: boolean;
  priority?: MessagePriority;
  tags?: string[];
}

export interface ChatMessageMetadata {
  deviceType?: string;
  browser?: string;
  location?: string;
  sessionDuration?: number;
  messageCount?: number;
  healthcareContext?: HealthcareContext;
  complianceInfo?: ComplianceInfo;
  analytics?: AnalyticsMetadata;
  [key: string]: unknown;
}

export interface HealthcareContext {
  patientId?: string;
  consultationType?: ConsultationType;
  medicalSpecialty?: MedicalSpecialty;
  treatmentContext?: TreatmentContext;
  urgencyLevel?: UrgencyLevel;
  isEmergency?: boolean;
  requiresImmediateAttention?: boolean;
}

export interface ComplianceInfo {
  consentStatus: ConsentStatus;
  dataProcessingBasis: DataProcessingBasis;
  retentionPolicy: RetentionPolicy;
  auditRequired: boolean;
  encryptionStatus: EncryptionStatus;
}

export interface AnalyticsMetadata {
  sentiment?: SentimentScore;
  intent?: IntentClassification;
  topics?: TopicClassification[];
  responseTime?: number;
  satisfaction?: number;
}

// Chat session types with enhanced features
export interface EnhancedChatSession {
  id: string;
  clinicId: string;
  userId: string;
  patientId?: string;
  sessionType: SessionType;
  locale: 'pt-BR' | 'en-US';
  status: ChatSessionStatus;
  startedAt: string;
  lastActivityAt: string;
  endedAt?: string;
  metadata?: EnhancedChatSessionMetadata;
  participants: ChatParticipant[];
  settings: ChatSessionSettings;
  compliance: SessionCompliance;
  analytics: SessionAnalytics;
}

export interface EnhancedChatSessionMetadata {
  deviceType?: string;
  browser?: string;
  location?: string;
  sessionDuration?: number;
  messageCount?: number;
  healthcareWorkflow?: HealthcareWorkflow;
  integrationContext?: IntegrationContext;
  customFields?: Record<string, unknown>;
}

export interface ChatParticipant {
  id: string;
  type: ParticipantType;
  role: ParticipantRole;
  name?: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatSessionSettings {
  enableRealtime: boolean;
  enableAttachments: boolean;
  enableVoiceMessages: boolean;
  enableVideoCall: boolean;
  enableScreenShare: boolean;
  maxParticipants: number;
  recordingEnabled: boolean;
  autoTranslation: boolean;
  languagePreference: string;
  complianceMode: ComplianceMode;
}

export interface SessionCompliance {
  consentStatus: ConsentStatus;
  dataProcessingBasis: DataProcessingBasis;
  retentionPolicy: RetentionPolicy;
  auditTrail: ComplianceAuditEntry[];
  encryptionStatus: EncryptionStatus;
  lastComplianceCheck: string;
}

export interface SessionAnalytics {
  messageCount: number;
  participantCount: number;
  averageResponseTime: number;
  sentiment: SentimentScore;
  satisfaction?: number;
  topics: TopicClassification[];
  engagement: EngagementMetrics;
  conversion: ConversionMetrics;
}

// Enhanced chat service types
export interface ChatServiceConfig {
  providers: AIProviderConfig[];
  realtime: RealtimeConfig;
  compliance: ComplianceConfig;
  analytics: AnalyticsConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  features: ChatFeatures;
  integrations: IntegrationConfig;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  capabilities: ProviderCapabilities;
  config: Record<string, unknown>;
  priority: number;
  enabled: boolean;
}

export interface ProviderCapabilities {
  clinicalSupport: boolean;
  aestheticConsultation: boolean;
  emergencyResponse: boolean;
  patientEducation: boolean;
  documentAnalysis: boolean;
  imageAnalysis: boolean;
  multilingual: boolean;
  realtime: boolean;
}

export interface RealtimeConfig {
  enabled: boolean;
  protocol: 'websocket' | 'webrtc' | 'agui';
  endpoint: string;
  timeout: number;
  retries: number;
  heartbeat: HeartbeatConfig;
  messageQueue: MessageQueueConfig;
}

export interface ComplianceConfig {
  enabledFrameworks: ComplianceFramework[];
  validationLevel: ValidationLevel;
  auditLogging: boolean;
  anonymization: boolean;
  retention: RetentionConfig;
  consent: ConsentConfig;
  encryption: EncryptionConfig;
}

export interface AnalyticsConfig {
  enabled: boolean;
  tracking: AnalyticsTracking[];
  aggregation: AggregationConfig;
  reporting: ReportingConfig;
  realtime: RealtimeAnalyticsConfig;
}

export interface StorageConfig {
  provider: 'supabase' | 'local' | 's3';
  config: Record<string, unknown>;
  backup: BackupConfig;
  replication: ReplicationConfig;
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  rateLimit: RateLimitConfig;
  monitoring: SecurityMonitoringConfig;
}

export interface ChatFeatures {
  clinicalAssistant: boolean;
  aestheticAdvisor: boolean;
  patientEducation: boolean;
  emergencySupport: boolean;
  documentSharing: boolean;
  imageAnalysis: boolean;
  appointmentScheduling: boolean;
  prescriptionManagement: boolean;
  voiceMessages: boolean;
  videoCalls: boolean;
  screenSharing: boolean;
  realTimeTranslation: boolean;
  offlineSupport: boolean;
  multiDevice: boolean;
}

export interface IntegrationConfig {
  aguiProtocol: AGUIIntegrationConfig;
  copilotKit: CopilotKitConfig;
  clinicalDecisionSupport: ClinicalDecisionSupportConfig;
  electronicHealthRecord: EHRIntegrationConfig;
  appointmentSystem: AppointmentIntegrationConfig;
  billingSystem: BillingIntegrationConfig;
  notificationSystem: NotificationIntegrationConfig;
}

// Request and response types
export interface ChatRequest {
  sessionId?: string;
  message: string;
  messageType: MessageType;
  attachments?: ChatAttachment[];
  context?: RequestContext;
  options?: ChatOptions;
}

export interface ChatResponse {
  success: boolean;
  messageId: string;
  sessionId: string;
  response: EnhancedChatMessage;
  suggestions?: ChatSuggestion[];
  actions?: ChatAction[];
  metadata?: ResponseMetadata;
  compliance?: ComplianceValidationResult;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  type: SuggestionType;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ChatAction {
  id: string;
  type: ActionType;
  label: string;
  description?: string;
  parameters?: Record<string, unknown>;
  requiresConfirmation: boolean;
  priority: ActionPriority;
}

export interface RequestContext {
  patientId?: string;
  consultationType?: ConsultationType;
  medicalSpecialty?: MedicalSpecialty;
  urgencyLevel?: UrgencyLevel;
  location?: string;
  device?: string;
  language?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatOptions {
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  includeSources?: boolean;
  includeSuggestions?: boolean;
  complianceValidation?: boolean;
  analyticsTracking?: boolean;
}

export interface ResponseMetadata {
  processingTime: number;
  provider: string;
  model: string;
  confidence: number;
  tokensUsed?: TokenUsage;
  cost?: number;
  requestId: string;
  timestamp: string;
}

// Message and attachment types
export interface ChatAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  metadata?: AttachmentMetadata;
  uploadedAt: string;
}

export interface AttachmentMetadata {
  analysis?: DocumentAnalysisResult;
  extraction?: DataExtractionResult;
  validation?: ValidationResult;
  thumbnails?: string[];
  [key: string]: unknown;
}

// Enum and type definitions
export type ChatRole = 'user' | 'assistant' | 'system' | 'clinical' | 'aesthetic' | 'emergency';
export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'video' | 'system' | 'action';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
export type SessionType = 'general' | 'clinical' | 'aesthetic' | 'emergency' | 'education' | 'administrative';
export type ChatSessionStatus = 'active' | 'closed' | 'error' | 'archived' | 'suspended';
export type ParticipantType = 'user' | 'clinician' | 'assistant' | 'system' | 'external';
export type ParticipantRole = 'owner' | 'moderator' | 'participant' | 'observer';
export type ComplianceMode = 'basic' | 'strict' | 'healthcare' | 'emergency';
export type ValidationLevel = 'basic' | 'standard' | 'strict' | 'healthcare';
export type ConsentStatus = 'valid' | 'missing' | 'invalid' | 'expired' | 'revoked';
export type DataProcessingBasis = 'consent' | 'legitimate_interest' | 'vital_interest' | 'legal_obligation' | 'public_task';
export type RetentionPolicy = 'standard' | 'extended' | 'permanent' | 'custom';
export type EncryptionStatus = 'encrypted' | 'partial' | 'none';
export type ConsultationType = 'general' | 'specialist' | 'follow_up' | 'emergency' | 'aesthetic' | 'mental_health';
export type MedicalSpecialty = 'general_practice' | 'dermatology' | 'plastic_surgery' | 'cardiology' | 'psychiatry' | 'other';
export type TreatmentContext = 'consultation' | 'diagnosis' | 'treatment' | 'follow_up' | 'emergency';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type HealthcareWorkflow = 'triage' | 'consultation' | 'diagnosis' | 'treatment' | 'follow_up' | 'emergency';
export type ComplianceFramework = 'LGPD' | 'HIPAA' | 'GDPR' | 'ANVISA' | 'CFM' | 'ISO_27001';
export type SuggestionType = 'response' | 'action' | 'resource' | 'appointment' | 'referral';
export type ActionType = 'appointment' | 'prescription' | 'referral' | 'document' | 'payment' | 'emergency' | 'custom';
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';
export type AttachmentType = 'image' | 'document' | 'video' | 'audio' | 'medical_image' | 'prescription' | 'lab_result';

// Additional specialized types will be imported from other modules
export type SentimentScore = number; // -1 to 1
export type IntentClassification = string;
export type TopicClassification = { topic: string; confidence: number; subtopics?: string[] };
export type EngagementMetrics = { messagesPerMinute: number; responseRate: number; duration: number };
export type ConversionMetrics = { appointments: number; referrals: number; payments: number };
export type HeartbeatConfig = { interval: number; timeout: number };
export type MessageQueueConfig = { maxSize: number; retryAttempts: number; deliveryGuarantee: 'at_least_once' | 'exactly_once' };
export type RetentionConfig = { duration: number; autoDelete: boolean };
export type ConsentConfig = { requireExplicit: boolean; expiryDays: number; renewalReminder: boolean };
export type EncryptionConfig = { algorithm: string; keyRotationDays: number };
export type AnalyticsTracking[] = 'messages' | 'sentiment' | 'engagement' | 'conversion' | 'compliance';
export type AggregationConfig = { interval: string; granularity: string };
export type ReportingConfig = { enabled: boolean; frequency: string; format: string };
export type RealtimeAnalyticsConfig = { enabled: boolean; updateInterval: number };
export type BackupConfig = { enabled: boolean; frequency: string; retention: number };
export type ReplicationConfig = { enabled: boolean; regions: string[] };
export type AuthenticationConfig = { method: string; mfa: boolean };
export type AuthorizationConfig = { model: string; enforcement: boolean };
export type RateLimitConfig = { requests: number; window: number };
export type SecurityMonitoringConfig = { enabled: boolean; alerts: boolean };
export type AGUIIntegrationConfig = { enabled: boolean; endpoint: string; timeout: number };
export type CopilotKitConfig = { enabled: boolean; actions: string[]; uiIntegration: boolean };
export type ClinicalDecisionSupportConfig = { enabled: boolean; endpoint: string; timeout: number };
export type EHRIntegrationConfig = { enabled: boolean; system: string; version: string };
export type AppointmentIntegrationConfig = { enabled: boolean; system: string; syncEnabled: boolean };
export type BillingIntegrationConfig = { enabled: boolean; system: string; autoCharge: boolean };
export type NotificationIntegrationConfig = { enabled: boolean; channels: string[] };
export type TokenUsage = { prompt: number; completion: number; total: number };
export type DocumentAnalysisResult = { type: string; content: string; confidence: number };
export type DataExtractionResult = { fields: Record<string, unknown>; confidence: number };
export type ValidationResult = { valid: boolean; errors: string[]; warnings: string[] };
export type ComplianceValidationResult = { valid: boolean; violations: ComplianceViolation[]; score: number };
export type ComplianceViolation = { type: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string };
export type ComplianceAuditEntry = { timestamp: string; action: string; result: string; details?: string };
export type IntegrationContext = { agui?: unknown; copilotKit?: unknown; ehr?: unknown; [key: string]: unknown };