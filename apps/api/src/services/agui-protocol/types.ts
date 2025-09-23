/**
 * AG-UI Protocol Types and Interfaces
 *
 * Defines the communication protocol between frontend and backend agents
 * using WebSocket-based real-time messaging.
 */

export interface AguiMessage {
  id: string;
  type: AguiMessageType;
  timestamp: string;
  sessionId: string;
  _payload: Record<string, any>;
  metadata?: AguiMessageMetadata;
}

export type AguiMessageType =
  | "hello"
  | "query"
  | "response"
  | "error"
  | "status"
  | "ping"
  | "pong"
  | "session_update"
  | "feedback"
  | "context_update"
  | "streaming_start"
  | "streaming_chunk"
  | "streaming_end"
  // Client-specific message types
  | "client_registration"
  | "client_profile_update"
  | "client_search"
  | "client_analytics"
  | "client_retention_prediction"
  | "client_communication"
  | "document_ocr"
  | "consent_management"
  | "client_validation";

export interface AguiMessageMetadata {
  _userId: string;
  patientId?: string;
  requestId?: string;
  version: string;
  compression?: "gzip" | "none";
  encryption?: boolean;
}

export interface AguiHelloMessage {
  version: string;
  capabilities: AguiCapability[];
  authentication?: AguiAuthentication;
}

export interface AguiCapability {
  name: string;
  version: string;
  features: string[];
}

export interface AguiAuthentication {
  token: string;
  type: "jwt" | "bearer";
}

export interface AguiQueryMessage {
  _query: string;
  _context?: AguiQueryContext;
  options?: AguiQueryOptions;
}

export interface AguiQueryContext {
  patientId?: string;
  _userId: string;
  sessionHistory?: AguiSessionMessage[];
  userPreferences?: Record<string, any>;
  previousTopics?: string[];
}

export interface AguiQueryOptions {
  maxResults?: number;
  timeout?: number;
  includeSources?: boolean;
  streaming?: boolean;
  temperature?: number;
  model?: string;
}

export interface AguiResponseMessage {
  content: string;
  type: "text" | "structured" | "error";
  sources?: AguiSource[];
  confidence?: number;
  usage?: AguiUsageStats;
  actions?: AguiAction[];
}

export interface AguiSource {
  id: string;
  type:
    | "patient_data"
    | "medical_knowledge"
    | "appointment"
    | "financial"
    | "document"
    | "client_profile"
    | "consent_record"
    | "treatment_history"
    | "communication_log"
    | "analytics_data";
  title: string;
  snippet?: string;
  relevanceScore?: number;
  metadata?: Record<string, any>;
}

export interface AguiUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  processingTimeMs: number;
  databaseQueryTimeMs?: number;
  vectorSearchTimeMs?: number;
}

export interface AguiAction {
  id: string;
  type:
    | "schedule_appointment"
    | "view_patient"
    | "generate_report"
    | "update_record";
  label: string;
  description?: string;
  _payload: Record<string, any>;
  requiresConfirmation?: boolean;
}

export interface AguiErrorMessage {
  code: AguiErrorCode;
  message: string;
  details?: Record<string, any>;
  retryable?: boolean;
}

export type AguiErrorCode =
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "INVALID_MESSAGE"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SESSION_EXPIRED"
  | "PATIENT_NOT_FOUND"
  | "DATABASE_ERROR"
  | "AI_SERVICE_ERROR";

export interface AguiStatusMessage {
  status: "ready" | "busy" | "error" | "maintenance";
  uptime: number;
  activeSessions: number;
  queueSize?: number;
  performance?: AguiPerformanceMetrics;
}

export interface AguiPerformanceMetrics {
  averageResponseTimeMs: number;
  requestsPerSecond: number;
  errorRate: number;
  databaseConnections: number;
  memoryUsageMb: number;
}

export interface AguiSessionUpdate {
  sessionId: string;
  updates: {
    title?: string;
    _context?: Record<string, any>;
    expiresAt?: string;
    metadata?: Record<string, any>;
  };
}

export interface AguiFeedbackMessage {
  messageId: string;
  rating: number; // 1-5
  feedback?: string;
  category?: "accuracy" | "helpfulness" | "clarity" | "completeness";
}

export interface AguiContextUpdate {
  sessionId: string;
  _context: Record<string, any>;
  source: "user" | "system" | "ai";
}

export interface AguiStreamingChunk {
  chunkId: string;
  content: string;
  isFinal?: boolean;
  sources?: AguiSource[];
  confidence?: number;
}

// Session management types
export interface AguiSession {
  id: string;
  _userId: string;
  title?: string;
  _context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  messageCount: number;
  lastActivity: string;
}

export interface AguiSessionMessage {
  id: string;
  _role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Health check types
export interface AguiHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  components: {
    database: "healthy" | "unhealthy";
    ai_service: "healthy" | "degraded" | "unhealthy";
    vector_store: "healthy" | "unhealthy";
    websocket_server: "healthy" | "unhealthy";
  };
  metrics: AguiPerformanceMetrics;
  lastCheck: string;
}

// Rate limiting types
export interface AguiRateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  currentUsage: {
    minute: number;
    hour: number;
  };
  resetTimes: {
    minute: string;
    hour: string;
  };
}

// Protocol version info
export interface AguiProtocolInfo {
  version: string;
  supportedVersions: string[];
  compatibility: "full" | "partial" | "none";
  features: string[];
}

// CopilotKit specific types for frontend integration
export interface CopilotRequest {
  id: string;
  type: "query" | "command" | "feedback";
  content: string;
  sessionId: string;
  _userId: string;
  metadata?: Record<string, any>;
}

export interface CopilotResponse {
  id: string;
  type: "response" | "error" | "status";
  content: string;
  sessionId: string;
  _userId: string;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    error?: string;
    [key: string]: any;
  };
}

// =====================================
// CLIENT-SPECIFIC MESSAGE TYPES
// =====================================

export interface AguiClientRegistrationMessage {
  clientData: ClientRegistrationData;
  documents?: ClientDocument[];
  ocrData?: OCRResult;
  consent?: ClientConsentData;
}

export interface ClientRegistrationData {
  fullName: string;
  cpf?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: ClientAddress;
  emergencyContact?: ClientEmergencyContact;
  medicalHistory?: ClientMedicalHistory;
  preferences?: ClientPreferences;
}

export interface ClientAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ClientEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ClientMedicalHistory {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  previousTreatments?: string[];
  notes?: string;
}

export interface ClientPreferences {
  communicationChannel: "whatsapp" | "sms" | "email";
  language: "pt-BR" | "en-US";
  timezone: string;
  notificationPreferences: {
    appointments: boolean;
    promotions: boolean;
    reminders: boolean;
  };
}

export interface ClientDocument {
  id: string;
  type:
    | "id_card"
    | "medical_record"
    | "consent_form"
    | "insurance_card"
    | "other";
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  extractedData?: Record<string, any>;
}

export interface OCRResult {
  documentId: string;
  extractedFields: Record<string, any>;
  confidence: number;
  processingTime: number;
  errors?: string[];
}

export interface ClientConsentData {
  treatmentConsent: boolean;
  dataSharingConsent: boolean;
  marketingConsent: boolean;
  emergencyContactConsent: boolean;
  consentDate: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AguiClientProfileUpdateMessage {
  clientId: string;
  updates: Partial<ClientRegistrationData>;
  validationResults?: ValidationResult[];
}

export interface AguiClientSearchMessage {
  searchCriteria: ClientSearchCriteria;
  filters?: ClientSearchFilters;
  pagination?: PaginationOptions;
}

export interface ClientSearchCriteria {
  query?: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  registrationDateRange?: {
    start: string;
    end: string;
  };
}

export interface ClientSearchFilters {
  hasActiveAppointments?: boolean;
  hasPastDuePayments?: boolean;
  highRetentionRisk?: boolean;
  treatmentTypes?: string[];
  consentStatus?: "active" | "expired" | "revoked";
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AguiClientAnalyticsMessage {
  clientId?: string;
  analyticsType:
    | "retention_risk"
    | "engagement"
    | "treatment_history"
    | "financial"
    | "communication";
  timeRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface AguiClientRetentionPredictionMessage {
  clientId: string;
  features?: RetentionFeatures;
  modelVersion?: string;
}

export interface RetentionFeatures {
  appointmentHistory: AppointmentHistory;
  communicationHistory: CommunicationHistory;
  paymentHistory: PaymentHistory;
  treatmentProgress: TreatmentProgress;
  demographicData: ClientDemographics;
}

export interface AppointmentHistory {
  totalAppointments: number;
  noShowCount: number;
  cancellationCount: number;
  rescheduleCount: number;
  averageTimeBetweenAppointments: number; // in days
  lastAppointmentDate?: string;
  nextAppointmentDate?: string;
}

export interface CommunicationHistory {
  totalMessages: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  preferredChannel: "whatsapp" | "sms" | "email";
  lastCommunicationDate?: string;
}

export interface PaymentHistory {
  totalPayments: number;
  missedPayments: number;
  averagePaymentAmount: number;
  lastPaymentDate?: string;
  outstandingBalance: number;
}

export interface TreatmentProgress {
  completedTreatments: number;
  scheduledTreatments: number;
  treatmentPlanAdherence: number; // percentage
  satisfactionScore?: number;
  lastTreatmentDate?: string;
}

export interface ClientDemographics {
  age?: number;
  gender?: string;
  location?: string;
  socioeconomicIndicator?: string;
}

export interface AguiClientCommunicationMessage {
  clientId: string;
  communicationType:
    | "appointment_reminder"
    | "follow_up"
    | "promotional"
    | "emergency"
    | "retention";
  channel: "whatsapp" | "sms" | "email";
  content: string;
  scheduledFor?: string;
  priority: "low" | "medium" | "high" | "urgent";
  personalization?: CommunicationPersonalization;
}

export interface CommunicationPersonalization {
  clientName: string;
  treatmentType?: string;
  appointmentDate?: string;
  professionalName?: string;
  customFields?: Record<string, string>;
}

export interface AguiDocumentOCRMessage {
  documentId: string;
  documentType:
    | "id_card"
    | "medical_record"
    | "consent_form"
    | "insurance_card"
    | "prescription";
  documentUrl: string;
  extractionFields?: string[];
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  type: "required" | "format" | "length" | "custom";
  rule: string;
  errorMessage: string;
}

export interface AguiConsentManagementMessage {
  clientId: string;
  consentAction: "grant" | "revoke" | "update" | "expire";
  consentType:
    | "treatment"
    | "data_sharing"
    | "marketing"
    | "emergency_contact"
    | "research";
  consentData?: ClientConsentData;
  reason?: string;
  effectiveDate?: string;
}

export interface AguiClientValidationMessage {
  clientId?: string;
  validationType: "registration" | "profile_update" | "document" | "consent";
  data: Record<string, any>;
  validationRules: ValidationRule[];
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  message?: string;
  severity: "error" | "warning" | "info";
  suggestedValue?: any;
}

// =====================================
// CLIENT-SPECIFIC RESPONSE TYPES
// =====================================

export interface AguiClientRegistrationResponse {
  clientId: string;
  status: "success" | "partial_success" | "failed";
  validationResults: ValidationResult[];
  createdDocuments?: ClientDocument[];
  consentRecords?: string[];
  aiSuggestions?: AISuggestion[];
  processingTime: number;
}

export interface AguiClientProfileUpdateResponse {
  clientId: string;
  updateResults: Record<
    string,
    {
      success: boolean;
      message?: string;
      newValue?: any;
    }
  >;
  validationResults: ValidationResult[];
  aiRecommendations?: AISuggestion[];
  processingTime: number;
}

export interface AguiClientSearchResponse {
  clients: ClientSearchResult[];
  totalResults: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ClientSearchFilters;
  searchTime: number;
  aiInsights?: string;
}

export interface ClientSearchResult {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  registrationDate: string;
  lastActivity: string;
  appointmentCount: number;
  retentionRisk?: "low" | "medium" | "high";
  status: "active" | "inactive" | "archived";
}

export interface AguiClientAnalyticsResponse {
  analyticsType: string;
  clientId?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  data: AnalyticsData;
  insights?: string[];
  recommendations?: AISuggestion[];
  processingTime: number;
}

export interface AnalyticsData {
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  comparisons?: Record<
    string,
    {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    }
  >;
}

export interface AguiClientRetentionPredictionResponse {
  clientId: string;
  prediction: {
    riskLevel: "low" | "medium" | "high";
    riskScore: number; // 0-1
    confidence: number; // 0-1
    factors: Array<{
      factor: string;
      impact: "positive" | "negative";
      weight: number;
      description: string;
    }>;
  };
  recommendations: RetentionRecommendation[];
  nextReviewDate: string;
  modelVersion: string;
  processingTime: number;
}

export interface RetentionRecommendation {
  id: string;
  type: "communication" | "incentive" | "intervention" | "follow_up";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  timeline: string;
}

export interface AguiClientCommunicationResponse {
  communicationId: string;
  clientId: string;
  status: "sent" | "delivered" | "read" | "failed" | "scheduled";
  channel: string;
  content: string;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  cost?: number;
}

export interface AguiDocumentOCRResponse {
  documentId: string;
  extractionResults: OCRResult;
  validationResults: ValidationResult[];
  processingTime: number;
  confidence: number;
  suggestions?: AISuggestion[];
}

export interface AguiConsentManagementResponse {
  consentId: string;
  clientId: string;
  action: string;
  consentType: string;
  status: "success" | "failed" | "pending";
  effectiveDate?: string;
  expiryDate?: string;
  confirmationNumber?: string;
  auditTrail?: ConsentAuditEntry[];
}

export interface ConsentAuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export interface AguiClientValidationResponse {
  validationId: string;
  validationType: string;
  overallValidity: boolean;
  results: ValidationResult[];
  processingTime: number;
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  type:
    | "data_correction"
    | "process_optimization"
    | "risk_mitigation"
    | "personalization";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high";
  action?: {
    field: string;
    value: any;
    reason: string;
  };
  estimatedImpact?: string;
}

// =====================================
// CLIENT-SPECIFIC ACTION TYPES
// =====================================

export interface AguiClientAction extends AguiAction {
  type:
    | "schedule_appointment"
    | "view_patient"
    | "generate_report"
    | "update_record"
    | "register_client"
    | "update_client_profile"
    | "send_communication"
    | "validate_documents"
    | "manage_consent"
    | "run_retention_analysis"
    | "create_treatment_plan"
    | "upload_document";
}
