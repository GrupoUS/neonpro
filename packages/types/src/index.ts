export * from "./aesthetic-data";

// AI Agent types (primary)
export type {
  UserQuery,
  QueryIntent,
  QueryParameters,
  DateRange,
  QueryStatus,
  ResponseMetadata,
  AgentResponse,
  ResponseType,
  ResponseContent,
  TableColumn,
  ChartConfig,
  ChartDataPoint,
  ChartAxis,
  InteractiveAction,
  SessionStatus,
  SessionContext,
  UserRole,
  PermissionContext,
  Permission,
  DataScope,
  AgentQueryRequest,
  AgentAction,
} from "./ai-agent.ts";

// AI Agent Chat types (with prefixes to avoid conflicts)
export type {
  ChatSession as AgentChatSession,
  ChatMessage as AgentChatMessage,
} from "./ai-agent";

// AI Chat types (legacy, with prefixes)
export type {
  ChatRole,
  ChatSessionStatus,
  ChatSession as LegacyChatSession,
  ChatMessage as LegacyChatMessage,
  // Direct exports for backward compatibility
  ChatSession,
  ChatMessage,
  AuditOutcome,
  ConsentStatus,
  AuditEvent,
} from "./ai-chat.ts";

export * from "./ai-provider.ts";
export * from "./api/contracts.ts";
export * from "./enhanced-ai.ts";
export * from "./governance.types.ts";
export * from "./healthcare-governance.types.ts";
export * from "./webrtc.ts";

// Export specific types from ai-enhanced to avoid conflicts
export type {
  AIAnalyzeRequest,
  AIAnalyzeResponse,
  AICrudRequest,
  AICrudResponse,
  AIEnhancedError,
  AIEnhancedErrorCode,
  AIModelsResponse,
  AIRecommendationsRequest,
  AIRecommendationsResponse,
  AIUsageRequest,
  AIUsageResponse,
  DataSensitivityLevel,
  DomainDescriptor,
  ImplementationEffort,
  PerformanceBenchmarks,
  Plan,
  PlanData,
  Recommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
  UsageAggregation,
  UsageCounter,
  UsageCounterData,
} from "./ai-enhanced";

// Valibot Validation Schemas for Brazilian Healthcare
export * from "./appointment.valibot.ts";
export * from "./lgpd.valibot.ts";
export * from "./patient.valibot.ts";
export * from "./prescription.valibot.ts";
// Healthcare types
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
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: DatabaseRow;
        Insert: DatabaseInsert;
        Update: DatabaseUpdate;
      };
    };
    Views: {
      [key: string]: {
        Row: DatabaseRow;
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
