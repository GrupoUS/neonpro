/**
 * Common Type Definitions for Healthcare AI Agent
 * Provides comprehensive TypeScript interfaces to replace 'any' types
 * T061: Improve type safety and interface definitions
 */

// Entity Types
export interface Entity {
  id?: string
  type: 'patient' | 'professional' | 'clinic' | 'appointment' | 'medical_record'
  name: string
  confidence: number
  metadata?: Record<string, any>
}

// Intent Types
export interface Intent {
  category: 'help_request' | 'appointment_related' | 'patient_inquiry' | 'billing_inquiry' | 'general_inquiry' | 'medical_inquiry'
  confidence: number
  entities: Entity[]
  action?: string
  parameters?: Record<string, any>
}

// Tool Call Types
export interface ToolCall {
  id: string
  name: string
  parameters: Record<string, any>
  result?: any
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  error?: string
}

// Citation Types
export interface Citation {
  id: string
  type: 'policy' | 'medical_record' | 'appointment' | 'document' | 'knowledge_base'
  title: string
  url?: string
  content: string
  confidence: number
  metadata?: Record<string, any>
}

// Patient Context Types
export interface PatientContext {
  id: string
  name: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  conditions?: string[]
  medications?: string[]
  allergies?: string[]
  lastAppointment?: Date
  upcomingAppointments?: Date[]
  preferences?: Record<string, any>
}

// Professional Context Types
export interface ProfessionalContext {
  id: string
  name: string
  role: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'agent'
  specialization?: string
  department?: string
  availability?: {
    workingHours: {
      [key: string]: { start: string; end: string }
    }
    timezone: string
  }
}

// Clinic Context Types
export interface ClinicContext {
  id: string
  name: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  phone: string
  email: string
  timezone: string
  settings?: {
    workingHours: {
      [key: string]: { start: string; end: string }
    }
    appointmentSettings: {
      defaultDuration: number
      maxAdvanceBooking: number
      cancellationPolicy: string
    }
    features: string[]
  }
}

// RAG Agent Response Types
export interface RAGAgentResponse {
  message: string
  intent: Intent
  context: {
    patient?: PatientContext
    clinic?: ClinicContext
    professional?: ProfessionalContext
    conversation?: any
    [key: string]: any
  }
  confidence: number
  citations?: Citation[]
  tool_calls?: ToolCall[]
  patientContext?: PatientContext
  topic: string
  followUpQuestions?: string[]
  processingTime?: number
}

// Message Metadata Types
export interface MessageMetadata {
  tool_calls?: ToolCall[]
  citations?: Citation[]
  confidence?: number
  intent?: Intent
  entities?: Entity[]
  timestamp?: Date
  processing_time?: number
}

// Conversation Context Types
export interface ConversationContextData {
  currentIntent?: string
  patientContext?: PatientContext
  medicalHistory?: any
  preferences?: Record<string, any>
  lastTopic?: string
  followUpQuestions?: string[]
  sessionSummary?: string
  extractedEntities?: Entity[]
  aiState?: {
    lastResponseConfidence: number
    lastToolCalls?: ToolCall[]
    processingStats: {
      averageResponseTime: number
      totalInteractions: number
      errorCount: number
    }
  }
}

// Session Metadata Types
export interface SessionMetadata {
  userAgent?: string
  ipAddress?: string
  clientVersion?: string
  features?: string[]
  device?: {
    type: 'desktop' | 'mobile' | 'tablet'
    os?: string
    browser?: string
  }
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
}

// User Permissions Types
export interface UserPermissions {
  userId: string
  clinicId: string
  role: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'agent'
  permissions: {
    canAccessPatients: boolean
    canModifyPatients: boolean
    canAccessMedicalRecords: boolean
    canModifyMedicalRecords: boolean
    canAccessAppointments: boolean
    canModifyAppointments: boolean
    canAccessAuditLogs: boolean
    canAccessAIFeatures: boolean
    canManageSessions: boolean
  }
}

// Audit Log Types
export interface AuditLogDetails {
  action: string
  resource_type: string
  resource_id?: string
  result: 'granted' | 'denied' | 'error'
  reason?: string
  session_id?: string
  patient_id?: string
  metadata?: Record<string, any>
  processing_time?: number
  data_classification?: 'public' | 'sensitive' | 'confidential'
}

// Error Context Types
export interface ErrorContext {
  conversationId?: string
  userId?: string
  clinicId?: string
  sessionId?: string
  patientId?: string
  resource?: string
  action?: string
  metadata?: Record<string, any>
  timestamp?: string
  component?: string
}

// AI Interaction Metrics
export interface AIInteractionMetrics {
  queryLength: number
  responseLength: number
  processingTime: number
  confidence: number
  toolCallCount: number
  citationCount: number
  entityCount: number
  errorCount: number
}

// Search and Filter Types
export interface ConversationSearchFilters {
  patientId?: string
  dateFrom?: Date
  dateTo?: Date
  status?: 'active' | 'archived'
  intent?: string
  entityTypes?: string[]
  confidence?: {
    min: number
    max: number
  }
}

// Export common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>