import { UserRole } from './ai-agent';
import { ChatMessage } from './ai-chat';

// Types Package Index Exports
// This file exports all types from the packages/types directory

// Core AI types
// AI Agent types (avoiding conflicts with ai-chat)
export type {
  QueryEntities, ResponseData, ChartMetadata, ActionParameters, UserPreferences,
  CachedData, MessageData, MessageMetadata, ActionPayload, UserQuery, QueryIntent,
  QueryParameters, DateRange, QueryStatus, ResponseMetadata, AgentResponse, ResponseType,
  ResponseContent, TableColumn, ChartConfig, ChartDataPoint, ChartAxis, InteractiveAction,
  ChatSession as AgentChatSession, ChatMessage as AgentChatMessage, SessionStatus,
  SessionContext, UserRole, PermissionContext, Permission, DataScope, AgentQueryRequest,
  AgentAction
} from './ai-agent';

// AI Chat types (avoiding conflicts with ai-agent)
export type {
  ChatSessionMetadata, ChatRole, ChatSessionStatus, ChatSession, ChatMessage,
  AuditOutcome, ConsentStatus, AuditEvent
} from './ai-chat';

// AI Enhanced types (conflicting types handled selectively)
export type {
  AIEnhancedMetadata, EnhancedAIModel, MedicalSpecialty, SubscriptionTier,
  CFMComplianceLevel, SubscriptionPlan, PlanFeatures, AIUsageRecord, QuotaStatus,
  BillingMetrics, AuditTrail, EnhancedAIRequest, EnhancedAIResponse, UserSubscription,
  Plan, PlanData, UsageCounter, UsageCounterData, UsageAggregation, Recommendation,
  RecommendationType, RecommendationCategory, RecommendationPriority, RecommendationStatus,
  ImplementationEffort, ComplianceImpact, CostImpact, DomainDescriptor, DataSensitivityLevel,
  PerformanceBenchmarks, AIAnalyzeRequest, AICrudRequest, AIUsageRequest, AIRecommendationsRequest,
  AIAnalyzeResponse, AICrudResponse, AIUsageResponse, AIRecommendationsResponse, AIModelsResponse,
  AIEnhancedError, AIEnhancedErrorCode
} from './ai-enhanced';

// AI Provider types
export * from './ai-provider';

// Database and governance types
export * from './database-records';
export * from './governance.types';
export * from './healthcare-governance.types';
export * from './healthcare';

// Healthcare validation schemas
export * from './appointment.valibot';
export * from './lgpd.valibot';
export * from './patient.valibot';
export * from './prescription.valibot';

// Utility types
export * from './aesthetic-data';

// Enhanced AI types (exporting all since ai-enhanced handles the conflicts)
export * from './enhanced-ai';
export * from './webrtc';

// API contracts
export * from './api/contracts';

// Re-export commonly used types for convenience
export interface Patient {
  id: string;
  clinicId: string;
  medicalRecordNumber: string;
  externalIds?: ExternalIds;
  givenNames: string[];
  familyName: string;
  fullName: string;
  preferredName?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  isActive?: boolean;
  deceasedIndicator?: boolean;
  deceasedDate?: string;
  dataConsentStatus?: string;
  dataConsentDate?: string;
  dataRetentionUntil?: string;
  dataSource?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  photoUrl?: string;
  cpf?: string;
  rg?: string;
  passportNumber?: string;
  preferredContactMethod?: string;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  insuranceProvider?: string;
  insuranceNumber?: string;
  insurancePlan?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  lgpdConsentGiven: boolean;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  serviceTypeId?: string;
  status?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  internalNotes?: string;
  reminderSentAt?: string;
  confirmationSentAt?: string;
  whatsappReminderSent?: boolean;
  smsReminderSent?: boolean;
  roomId?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  // Calendar-specific properties
  title?: string;
  start?: Date | string;
  end?: Date | string;
  color?: string;
  description?: string;
}

// Database types - properly typed with generics for healthcare compliance
export interface Database<TRow = Record<string, any>, TInsert = TRow, TUpdate = Partial<TInsert>> {
  public: {
    Tables: {
      [key: string]: {
        Row: TRow;
        Insert: TInsert;
        Update: TUpdate;
      };
    };
    Views: {
      [key: string]: {
        Row: TRow;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
}

// Base database types with healthcare constraints
export interface DatabaseRow {
  id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface DatabaseInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface DatabaseUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

// Healthcare-specific external ID types
export interface ExternalIds {
  integration_id?: string;
  legacy_id?: string;
  external_system_id?: string;
  insurance_id?: string;
  medical_record_system_id?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// AI Feedback types
export interface FeedbackRequest {
  sessionId: string;
  messageId?: string;
  rating: number; // 1-5
  comment?: string;
  userRole: UserRole;
  timestamp: string;
}

export interface FeedbackResponse {
  id: string;
  sessionId: string;
  rating: number;
  comment?: string;
  processed: boolean;
  createdAt: string;
}

// AI Session types
export interface SessionResponse {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'archived';
  messages: ChatMessage[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}