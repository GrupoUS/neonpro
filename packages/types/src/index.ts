import { UserRole } from './ai-agent'
import { ChatMessage } from './ai-chat'

// Types Package Index Exports
// This file exports all types from the packages/types directory

// Enhanced Domain-Driven Design types
export * from './core/base'
export * from './core/primitives'
export * from './domain'

// Validation schemas and utilities
export * from './validation/validators'
export * from './validation/zod/patient'
export * from './validation/valibot/patient'
export * from './validation/valibot/appointment'

// Core AI types
// AI Agent types (avoiding conflicts with ai-chat)
export type {
  ActionParameters,
  ActionPayload,
  AgentAction,
  AgentQueryRequest,
  AgentResponse,
  CachedData,
  ChartAxis,
  ChartConfig,
  ChartDataPoint,
  ChartMetadata,
  ChatMessage as AgentChatMessage,
  ChatSession as AgentChatSession,
  DataScope,
  DateRange,
  InteractiveAction,
  MessageData,
  MessageMetadata,
  Permission,
  PermissionContext,
  QueryEntities,
  QueryIntent,
  QueryParameters,
  QueryStatus,
  ResponseContent,
  ResponseData,
  ResponseMetadata,
  ResponseType,
  SessionContext,
  SessionStatus,
  TableColumn,
  UserPreferences,
  UserQuery,
  UserRole,
} from './ai-agent'

// AI Chat types (avoiding conflicts with ai-agent)
export type {
  AuditEvent,
  AuditOutcome,
  ChatMessage,
  ChatRole,
  ChatSession,
  ChatSessionMetadata,
  ChatSessionStatus,
  ConsentStatus,
} from './ai-chat'

// AI Enhanced types (conflicting types handled selectively)
export type {
  AIAnalyzeRequest,
  AIAnalyzeResponse,
  AICrudRequest,
  AICrudResponse,
  AIEnhancedError,
  AIEnhancedErrorCode,
  AIEnhancedMetadata,
  AIModelsResponse,
  AIRecommendationsRequest,
  AIRecommendationsResponse,
  AIUsageRecord,
  AIUsageRequest,
  AIUsageResponse,
  AuditTrail,
  BillingMetrics,
  CFMComplianceLevel,
  ComplianceImpact,
  CostImpact,
  DataSensitivityLevel,
  DomainDescriptor,
  EnhancedAIModel,
  EnhancedAIRequest,
  EnhancedAIResponse,
  ImplementationEffort,
  MedicalSpecialty,
  PerformanceBenchmarks,
  Plan,
  PlanData,
  PlanFeatures,
  QuotaStatus,
  Recommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
  SubscriptionPlan,
  SubscriptionTier,
  UsageAggregation,
  UsageCounter,
  UsageCounterData,
  UserSubscription,
} from './ai-enhanced'

// AI Provider types
export * from './ai-provider'

// Database and governance types
export * from './database-records'
export * from './governance.types'
export * from './healthcare'
export * from './healthcare-governance.types'

// Healthcare validation schemas
export * from './appointment.valibot'
export * from './lgpd.valibot'
export * from './patient.valibot'
export * from './prescription.valibot'

// Utility types
export * from './aesthetic-data'

// Enhanced AI types (exporting all since ai-enhanced handles the conflicts)
export * from './enhanced-ai'
export * from './webrtc'

// API contracts
export * from './api/contracts'

// Re-export commonly used types for convenience
export interface Patient {
  id: string
  clinicId: string
  medicalRecordNumber: string
  externalIds?: ExternalIds
  givenNames: string[]
  familyName: string
  fullName: string
  preferredName?: string
  phonePrimary?: string
  phoneSecondary?: string
  email?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  birthDate?: string
  gender?: string
  maritalStatus?: string
  isActive?: boolean
  deceasedIndicator?: boolean
  deceasedDate?: string
  dataConsentStatus?: string
  dataConsentDate?: string
  dataRetentionUntil?: string
  dataSource?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  photoUrl?: string
  cpf?: string
  rg?: string
  passportNumber?: string
  preferredContactMethod?: string
  bloodType?: string
  allergies: string[]
  chronicConditions: string[]
  currentMedications: string[]
  insuranceProvider?: string
  insuranceNumber?: string
  insurancePlan?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  lgpdConsentGiven: boolean
}

export interface Appointment {
  id: string
  clinicId: string
  patientId: string
  professionalId: string
  serviceTypeId?: string
  status?: string
  startTime: string
  endTime: string
  notes?: string
  internalNotes?: string
  reminderSentAt?: string
  confirmationSentAt?: string
  whatsappReminderSent?: boolean
  smsReminderSent?: boolean
  roomId?: string
  priority?: number
  createdAt?: string
  updatedAt?: string
  createdBy: string
  updatedBy?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  // Calendar-specific properties
  title?: string
  start?: Date | string
  end?: Date | string
  color?: string
  description?: string
}

// Database types - properly typed with generics for healthcare compliance
export interface Database<TRow = Record<string, any>, TInsert = TRow, TUpdate = Partial<TInsert>> {
  public: {
    Tables: {
      [key: string]: {
        Row: TRow
        Insert: TInsert
        Update: TUpdate
      }
    }
    Views: {
      [key: string]: {
        Row: TRow
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}

// Base database types with healthcare constraints
export interface DatabaseRow {
  id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
  is_active?: boolean
  [key: string]: unknown
}

export interface DatabaseInsert {
  id?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
  is_active?: boolean
  [key: string]: unknown
}

export interface DatabaseUpdate {
  id?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
  is_active?: boolean
  [key: string]: unknown
}

// Healthcare-specific external ID types
export interface ExternalIds {
  integration_id?: string
  legacy_id?: string
  external_system_id?: string
  insurance_id?: string
  medical_record_system_id?: string
  [key: string]: string | number | boolean | null | undefined
}

// AI Feedback types
export interface FeedbackRequest {
  sessionId: string
  messageId?: string
  rating: number // 1-5
  comment?: string
  userRole: UserRole
  timestamp: string
}

export interface FeedbackResponse {
  id: string
  sessionId: string
  rating: number
  comment?: string
  processed: boolean
  createdAt: string
}

// AI Session types
export interface SessionResponse {
  id: string
  userId: string
  status: 'active' | 'completed' | 'archived'
  messages: ChatMessage[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}
