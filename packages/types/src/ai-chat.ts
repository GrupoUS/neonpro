/**
 * Universal AI Chat Types for NeonPro Healthcare Platform
 * Dual Interface: External Client + Internal Staff
 * Portuguese Healthcare Optimization with LGPD/ANVISA/CFM Compliance
 */

export type ChatRole = "user" | "assistant" | "system";
export type ChatInterface = "external" | "internal";
export type MessageType =
  | "text"
  | "image"
  | "document"
  | "voice"
  | "appointment_request"
  | "medical_query";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";
export type ChatStatus = "active" | "waiting" | "ended" | "escalated";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  metadata?: ChatMessageMetadata;
  streaming?: boolean;
}

export interface ChatMessageMetadata {
  confidence?: number;
  intent?: string;
  entities?: Record<string, unknown>;
  language?: "pt-BR" | "en";
  medical_context?: MedicalContext;
  appointment_context?: AppointmentContext;
  patient_context?: PatientContext;
  compliance_flags?: ComplianceFlags;
}

export interface MedicalContext {
  specialty?: string;
  urgency_level?: "low" | "medium" | "high" | "emergency";
  medical_terms?: string[];
  symptoms?: string[];
  diagnosis_suggestions?: string[];
  requires_doctor?: boolean;
}

export interface AppointmentContext {
  requested_date?: string;
  preferred_time?: string;
  appointment_type?: string;
  doctor_preference?: string;
  insurance_info?: string;
  no_show_risk?: number;
}

export interface PatientContext {
  patient_id?: string;
  age_group?: "child" | "adult" | "elderly";
  medical_history_summary?: string;
  current_medications?: string[];
  allergies?: string[];
  emergency_contact?: boolean;
}

export interface ComplianceFlags {
  lgpd_consent?: boolean;
  medical_data_involved?: boolean;
  privacy_level?: "public" | "confidential" | "restricted";
  audit_required?: boolean;
  encryption_level?: "standard" | "medical" | "emergency";
}

export interface ChatSession {
  id: string;
  interface_type: ChatInterface;
  status: ChatStatus;
  user_id?: string;
  patient_id?: string;
  clinic_id?: string;
  messages: ChatMessage[];
  context: ChatSessionContext;
  created_at: Date;
  updated_at: Date;
  ended_at?: Date;
  escalated_to?: string;
  ai_insights?: ChatAIInsights;
}

export interface ChatSessionContext {
  interface_type: ChatInterface;
  user_type: "patient" | "staff" | "doctor" | "admin";
  language: "pt-BR" | "en";
  medical_specialty?: string;
  clinic_context?: ClinicContext;
  patient_context?: PatientContext;
  staff_context?: StaffContext;
  session_metadata?: Record<string, unknown>;
}

export interface ClinicContext {
  clinic_id: string;
  clinic_name: string;
  specialties: string[];
  operating_hours: string;
  contact_info: string;
  available_services: string[];
  current_capacity?: number;
}

export interface StaffContext {
  staff_id: string;
  role: "nurse" | "doctor" | "admin" | "receptionist";
  permissions: string[];
  specialties?: string[];
  current_shift?: boolean;
  access_level: "basic" | "advanced" | "admin";
}

export interface ChatAIInsights {
  intent_analysis: IntentAnalysis;
  sentiment_analysis: SentimentAnalysis;
  medical_analysis?: MedicalAnalysis;
  recommendation_engine: RecommendationEngine;
  performance_metrics: PerformanceMetrics;
}

export interface IntentAnalysis {
  primary_intent: string;
  confidence: number;
  secondary_intents: { intent: string; confidence: number }[];
  intent_category:
    | "appointment"
    | "medical_query"
    | "information"
    | "emergency"
    | "administrative";
  requires_human?: boolean;
}

export interface SentimentAnalysis {
  sentiment: "positive" | "neutral" | "negative" | "urgent";
  confidence: number;
  emotion_indicators: string[];
  stress_level?: "low" | "medium" | "high";
  satisfaction_score?: number;
}

export interface MedicalAnalysis {
  medical_terms_detected: string[];
  symptom_analysis: {
    symptom: string;
    severity: "mild" | "moderate" | "severe";
  }[];
  urgency_assessment: "routine" | "urgent" | "emergency";
  specialty_recommendation?: string;
  triage_level?: 1 | 2 | 3 | 4 | 5;
  requires_immediate_attention?: boolean;
}

export interface RecommendationEngine {
  suggested_responses: {
    text: string;
    confidence: number;
    priority: number;
  }[];
  next_actions: { action: string; priority: "low" | "medium" | "high" }[];
  appointment_recommendations?: AppointmentRecommendation[];
  escalation_suggestions?: EscalationSuggestion[];
  follow_up_actions?: FollowUpAction[];
}

export interface AppointmentRecommendation {
  appointment_type: string;
  recommended_specialty: string;
  urgency_level: "routine" | "urgent" | "emergency";
  estimated_duration: number;
  preferred_time_slots: string[];
  doctor_recommendations?: string[];
}

export interface EscalationSuggestion {
  reason: string;
  escalation_type:
    | "human_agent"
    | "medical_professional"
    | "emergency_services";
  urgency: "low" | "medium" | "high" | "critical";
  estimated_wait_time?: number;
  escalation_context?: Record<string, unknown>;
}

export interface FollowUpAction {
  action_type:
    | "schedule_appointment"
    | "send_information"
    | "medical_follow_up"
    | "reminder";
  scheduled_time?: Date;
  description: string;
  responsible_party: "ai" | "staff" | "patient";
  priority: "low" | "medium" | "high";
}

export interface PerformanceMetrics {
  response_time: number;
  confidence_score: number;
  user_satisfaction?: number;
  resolution_rate?: number;
  escalation_rate?: number;
  no_show_prevention_effectiveness?: number;
}

// Chat Configuration Types
export interface ChatConfig {
  interface_type: ChatInterface;
  ai_model: "gpt-4" | "gpt-3.5-turbo" | "claude-3" | "custom-medical";
  language: "pt-BR" | "en";
  streaming_enabled: boolean;
  max_response_time: number; // milliseconds
  compliance_level: "standard" | "medical" | "emergency";
  features: ChatFeatures;
}

export interface ChatFeatures {
  real_time_streaming: boolean;
  voice_support: boolean;
  image_analysis: boolean;
  document_processing: boolean;
  appointment_scheduling: boolean;
  medical_knowledge_base: boolean;
  emergency_detection: boolean;
  no_show_prevention: boolean;
  multi_language_support: boolean;
  human_handoff: boolean;
}

// State Management Types
export interface ChatState {
  sessions: Record<string, ChatSession>;
  active_session_id?: string;
  is_loading: boolean;
  is_streaming: boolean;
  error?: string;
  connection_status: "connected" | "connecting" | "disconnected" | "error";
  config: ChatConfig;
  insights: ChatAIInsights | null;
  performance_metrics: PerformanceMetrics | null;
}

export type ChatAction =
  | { type: "START_SESSION"; payload: { session: ChatSession } }
  | { type: "END_SESSION"; payload: { session_id: string } }
  | {
      type: "SEND_MESSAGE";
      payload: { session_id: string; message: ChatMessage };
    }
  | {
      type: "RECEIVE_MESSAGE";
      payload: { session_id: string; message: ChatMessage };
    }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        session_id: string;
        message_id: string;
        updates: Partial<ChatMessage>;
      };
    }
  | {
      type: "START_STREAMING";
      payload: { session_id: string; message_id: string };
    }
  | {
      type: "STREAM_CHUNK";
      payload: { session_id: string; message_id: string; chunk: string };
    }
  | {
      type: "END_STREAMING";
      payload: { session_id: string; message_id: string };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "UPDATE_CONNECTION_STATUS";
      payload: "connected" | "connecting" | "disconnected" | "error";
    }
  | { type: "UPDATE_CONFIG"; payload: Partial<ChatConfig> }
  | { type: "UPDATE_INSIGHTS"; payload: ChatAIInsights }
  | { type: "UPDATE_METRICS"; payload: PerformanceMetrics }
  | {
      type: "ESCALATE_SESSION";
      payload: { session_id: string; escalation: EscalationSuggestion };
    };

// API Types
export interface ChatAPI {
  sendMessage: (sessionId: string, message: ChatMessage) => Promise<void>;
  streamMessage: (
    sessionId: string,
    message: ChatMessage,
  ) => AsyncIterable<string>;
  createSession: (config: Partial<ChatConfig>) => Promise<ChatSession>;
  endSession: (sessionId: string) => Promise<void>;
  getSessionHistory: (sessionId: string) => Promise<ChatMessage[]>;
  escalateToHuman: (sessionId: string, reason: string) => Promise<void>;
  updateSessionContext: (
    sessionId: string,
    context: Partial<ChatSessionContext>,
  ) => Promise<void>;
}

// External Client Interface Types (24/7 Public Support)
export interface ExternalChatInterface {
  faq_handling: boolean;
  appointment_scheduling: boolean;
  no_show_prevention: boolean;
  digital_anamnesis: boolean;
  emergency_routing: boolean;
  multilingual_support: boolean;
}

// Internal Staff Interface Types (Professional Tools)
export interface InternalChatInterface {
  natural_language_queries: boolean;
  inventory_status_checks: boolean;
  performance_insights: boolean;
  operational_recommendations: boolean;
  patient_data_access: boolean;
  administrative_commands: boolean;
}

// Portuguese Healthcare Specific Types
export interface PortugueseHealthcareContext {
  medical_terminology: "portuguese" | "brazilian" | "international";
  regulatory_compliance: ("LGPD" | "ANVISA" | "CFM" | "SUS")[];
  cultural_considerations: {
    formal_address: boolean;
    medical_hierarchy_respect: boolean;
    family_involvement: boolean;
    religious_considerations: boolean;
  };
  sus_integration?: {
    enabled: boolean;
    patient_number?: string;
    sus_card_validation?: boolean;
  };
}

export default ChatMessage;
