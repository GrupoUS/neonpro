/**
 * Universal AI Chat System Types
 * Complete TypeScript definitions for Brazilian healthcare chat system
 * LGPD compliant, AI-enhanced, real-time communication
 */

// ============================================================================
// CORE CHAT TYPES
// ============================================================================

export type MessageType =
  | "text"
  | "image"
  | "file"
  | "voice"
  | "medical_record"
  | "prescription"
  | "emergency_alert";
export type SenderType =
  | "patient"
  | "doctor"
  | "nurse"
  | "staff"
  | "ai_assistant"
  | "system";
export type ConversationType =
  | "patient_support"
  | "pre_consultation"
  | "post_procedure"
  | "emergency"
  | "ai_assistant"
  | "staff_coordination";
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";
export type PresenceStatus =
  | "online"
  | "offline"
  | "busy"
  | "away"
  | "emergency";
export type LGPDConsentLevel = "minimal" | "functional" | "analytics" | "full";

// ============================================================================
// MESSAGE INTERFACES
// ============================================================================

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  recipient_id?: string;
  message_type: MessageType;
  content: MessageContent;
  metadata: MessageMetadata;
  status: MessageStatus;
  ai_processed: boolean;
  ai_confidence?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  lgpd_compliant: boolean;
}

export interface MessageContent {
  text?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  medical_data?: MedicalMessageData;
  emergency_data?: EmergencyMessageData;
  voice_duration?: number;
  voice_transcript?: string;
  ai_response?: AIResponseData;
}

export interface MessageMetadata {
  reply_to?: string;
  mentions?: string[];
  hashtags?: string[];
  location?: GeoLocation;
  device_info?: DeviceInfo;
  encryption_key?: string;
  priority: "low" | "normal" | "high" | "critical";
  healthcare_context?: HealthcareContext;
  patient_consent?: PatientConsentData;
}

// ============================================================================
// HEALTHCARE SPECIFIC TYPES
// ============================================================================

export interface MedicalMessageData {
  patient_id: string;
  medical_record_type:
    | "consultation"
    | "prescription"
    | "exam_result"
    | "image"
    | "report";
  cfm_validation?: string;
  anvisa_compliance?: boolean;
  medical_specialty?: BrazilianMedicalSpecialty;
  urgency_level: "routine" | "urgent" | "critical" | "emergency";
  hipaa_protected?: boolean;
  lgpd_category: "health_data" | "sensitive_personal" | "biometric" | "genetic";
}

export interface EmergencyMessageData {
  emergency_type: "medical" | "psychiatric" | "accident" | "allergic_reaction";
  severity_level: "green" | "yellow" | "orange" | "red";
  location: GeoLocation;
  samu_notified?: boolean;
  auto_escalation?: boolean;
  emergency_contact_ids?: string[];
  protocols_activated?: string[];
}

export interface HealthcareContext {
  patient_id?: string;
  appointment_id?: string;
  treatment_id?: string;
  clinic_id: string;
  department?: string;
  medical_specialty?: BrazilianMedicalSpecialty;
  consultation_type?:
    | "primeira_consulta"
    | "retorno"
    | "emergencia"
    | "procedimento";
  sus_integration?: SUSIntegrationData;
}

export type BrazilianMedicalSpecialty =
  | "dermatologia"
  | "cirurgia_plastica"
  | "medicina_estetica"
  | "dermatologia_estetica"
  | "cirurgia_geral"
  | "anestesiologia"
  | "clinica_medica"
  | "emergencia";

// ============================================================================
// CONVERSATION INTERFACES
// ============================================================================

export interface ChatConversation {
  id: string;
  type: ConversationType;
  title?: string;
  participants: ConversationParticipant[];
  last_message?: ChatMessage;
  last_activity: string;
  created_at: string;
  archived_at?: string;
  healthcare_context?: HealthcareContext;
  lgpd_consent_level: LGPDConsentLevel;
  privacy_settings: ConversationPrivacySettings;
  ai_enabled: boolean;
  emergency_escalation?: EmergencyEscalation;
}

export interface ConversationParticipant {
  user_id: string;
  user_type: SenderType;
  display_name: string;
  avatar_url?: string;
  professional_info?: ProfessionalInfo;
  presence_status: PresenceStatus;
  last_seen: string;
  permissions: ParticipantPermissions;
  lgpd_consent: LGPDConsentData;
}

export interface ProfessionalInfo {
  cfm_number?: string;
  coren_number?: string;
  specialty: BrazilianMedicalSpecialty;
  institution: string;
  department?: string;
  emergency_contact: boolean;
  on_call_schedule?: OnCallSchedule;
}

export interface ParticipantPermissions {
  can_send_messages: boolean;
  can_send_files: boolean;
  can_access_medical_records: boolean;
  can_prescribe: boolean;
  can_escalate_emergency: boolean;
  can_export_conversation: boolean;
  can_delete_messages: boolean;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AIResponseData {
  ai_model: "gpt-4-healthcare" | "claude-medical" | "neonpro-assistant";
  confidence_score: number;
  response_type: AIResponseType;
  medical_accuracy_validated: boolean;
  source_references?: MedicalReference[];
  suggested_actions?: SuggestedAction[];
  escalation_recommendation?: EscalationRecommendation;
  brazilian_context?: BrazilianHealthcareContext;
}

export type AIResponseType =
  | "information"
  | "recommendation"
  | "triage"
  | "emergency_detection"
  | "prescription_assistance"
  | "appointment_scheduling"
  | "symptoms_analysis"
  | "post_care_guidance";

export interface MedicalReference {
  source:
    | "cfm_guidelines"
    | "anvisa_protocols"
    | "sus_guidelines"
    | "medical_literature"
    | "institutional_protocol";
  reference_id: string;
  title: string;
  url?: string;
  relevance_score: number;
  last_updated: string;
}

export interface SuggestedAction {
  action_type:
    | "schedule_appointment"
    | "emergency_call"
    | "escalate_to_human"
    | "request_exam"
    | "medication_reminder"
    | "follow_up_care";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  parameters?: Record<string, unknown>;
  estimated_time?: number;
  cost_estimate?: MonetaryAmount;
}

export interface EscalationRecommendation {
  should_escalate: boolean;
  escalation_type:
    | "medical_professional"
    | "emergency_services"
    | "specialist"
    | "supervisor";
  urgency_level: "routine" | "priority" | "urgent" | "immediate";
  reasoning: string;
  target_professional?: string;
  max_wait_time?: number;
}

// ============================================================================
// REAL-TIME & PRESENCE TYPES
// ============================================================================

export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  user_name: string;
  is_typing: boolean;
  last_activity: string;
}

export interface PresenceUpdate {
  user_id: string;
  status: PresenceStatus;
  last_seen: string;
  device_info?: DeviceInfo;
  location?: GeoLocation;
  availability_message?: string;
  emergency_available?: boolean;
}

export interface DeviceInfo {
  device_type: "mobile" | "tablet" | "desktop" | "kiosk";
  platform: "ios" | "android" | "windows" | "macos" | "linux" | "web";
  app_version: string;
  browser?: string;
  offline_capable: boolean;
}

// ============================================================================
// LGPD COMPLIANCE TYPES
// ============================================================================

export interface LGPDConsentData {
  consent_id: string;
  patient_id: string;
  consent_level: LGPDConsentLevel;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  purposes: LGPDPurpose[];
  data_categories: LGPDDataCategory[];
  third_party_sharing: boolean;
  right_to_portability: boolean;
  right_to_erasure: boolean;
}

export type LGPDPurpose =
  | "medical_treatment"
  | "emergency_care"
  | "appointment_management"
  | "medical_research"
  | "quality_improvement"
  | "legal_compliance"
  | "billing_insurance";

export type LGPDDataCategory =
  | "health_data"
  | "personal_identification"
  | "contact_information"
  | "financial_data"
  | "biometric_data"
  | "genetic_data"
  | "location_data"
  | "communication_content";

export interface PatientConsentData {
  conversation_consent: boolean;
  medical_data_sharing: boolean;
  ai_analysis_consent: boolean;
  emergency_override: boolean;
  data_retention_period: number;
  export_rights_acknowledged: boolean;
  deletion_rights_acknowledged: boolean;
}

export interface ConversationPrivacySettings {
  end_to_end_encryption: boolean;
  message_retention_days: number;
  auto_delete_enabled: boolean;
  screenshot_prevention: boolean;
  watermark_enabled: boolean;
  audit_trail_enabled: boolean;
  anonymization_level: "none" | "partial" | "full";
}

// ============================================================================
// BRAZILIAN HEALTHCARE SYSTEM TYPES
// ============================================================================

export interface SUSIntegrationData {
  sus_card_number?: string;
  health_unit_code?: string;
  referral_code?: string;
  priority_code?: string;
  insurance_type: "sus" | "private" | "mixed";
  coverage_level: "basic" | "intermediate" | "premium";
}

export interface BrazilianHealthcareContext {
  state: BrazilianState;
  municipality?: string;
  regional_health_council?: string;
  health_district?: string;
  emergency_protocols?: EmergencyProtocol[];
  cultural_considerations?: CulturalConsideration[];
}

export type BrazilianState =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

export interface EmergencyProtocol {
  protocol_id: string;
  name: string;
  description: string;
  activation_criteria: string[];
  steps: ProtocolStep[];
  emergency_contacts: EmergencyContact[];
  samu_integration: boolean;
  estimated_response_time: number;
}

export interface ProtocolStep {
  step_number: number;
  title: string;
  description: string;
  required_actions: string[];
  decision_points?: string[];
  next_steps?: string[];
  timeout?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: BrazilianState;
  postal_code?: string;
  country: "BR";
  hospital_proximity?: HospitalProximity[];
}

export interface HospitalProximity {
  hospital_name: string;
  distance_km: number;
  emergency_capable: boolean;
  specialty_services: BrazilianMedicalSpecialty[];
  travel_time_minutes: number;
}

export interface MonetaryAmount {
  amount: number;
  currency: "BRL";
  formatted: string;
}

export interface EmergencyContact {
  contact_id: string;
  name: string;
  phone: string;
  relationship:
    | "family"
    | "friend"
    | "emergency_service"
    | "medical_professional";
  priority_order: number;
  available_24h: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
}

export interface OnCallSchedule {
  schedule_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  emergency_only: boolean;
  specialties_covered: BrazilianMedicalSpecialty[];
  contact_methods: ("phone" | "sms" | "whatsapp" | "chat")[];
}

export interface CulturalConsideration {
  consideration_type:
    | "language"
    | "religious"
    | "dietary"
    | "social"
    | "accessibility";
  description: string;
  impact_on_treatment: string;
  recommended_approach: string;
  resources?: string[];
}

export interface EmergencyEscalation {
  auto_escalation_enabled: boolean;
  escalation_triggers: string[];
  escalation_chain: EscalationLevel[];
  max_response_time_minutes: number;
  emergency_override_enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  role_type: SenderType;
  response_time_minutes: number;
  contact_methods: ("chat" | "phone" | "sms" | "push_notification")[];
  backup_contacts?: string[];
}

// ============================================================================
// CHAT SYSTEM CONFIGURATION
// ============================================================================

export interface ChatSystemConfig {
  features: ChatFeatureConfig;
  ai_assistant: AIAssistantConfig;
  privacy: PrivacyConfig;
  performance: PerformanceConfig;
  integrations: IntegrationConfig;
  brazilian_compliance: BrazilianComplianceConfig;
}

export interface ChatFeatureConfig {
  real_time_enabled: boolean;
  voice_messages_enabled: boolean;
  file_sharing_enabled: boolean;
  video_calls_enabled: boolean;
  screen_sharing_enabled: boolean;
  translation_enabled: boolean;
  emoji_reactions_enabled: boolean;
  message_threading_enabled: boolean;
  emergency_mode_enabled: boolean;
}

export interface AIAssistantConfig {
  ai_enabled: boolean;
  model_preference: string;
  confidence_threshold: number;
  auto_response_enabled: boolean;
  medical_validation_required: boolean;
  escalation_threshold: number;
  learning_enabled: boolean;
  brazilian_portuguese_optimized: boolean;
}

export interface PrivacyConfig {
  encryption_algorithm: "AES-256" | "ChaCha20";
  key_rotation_days: number;
  message_retention_days: number;
  auto_deletion_enabled: boolean;
  anonymization_enabled: boolean;
  audit_logging_enabled: boolean;
  lgpd_compliance_mode: boolean;
}

export interface PerformanceConfig {
  max_message_length: number;
  max_file_size_mb: number;
  message_cache_size: number;
  typing_indicator_delay_ms: number;
  presence_update_interval_ms: number;
  reconnection_attempts: number;
  offline_queue_size: number;
}

export interface IntegrationConfig {
  supabase_real_time: boolean;
  whatsapp_business_api: boolean;
  sms_gateway: "twilio" | "aws_sns" | "zenvia";
  email_notifications: boolean;
  push_notifications: boolean;
  calendar_integration: boolean;
  emr_integration: boolean;
  samu_integration: boolean;
}

export interface BrazilianComplianceConfig {
  cfm_validation: boolean;
  anvisa_compliance: boolean;
  lgpd_compliance: boolean;
  sus_integration: boolean;
  brazilian_emergency_protocols: boolean;
  portuguese_language_priority: boolean;
  regional_customization: boolean;
  cultural_sensitivity_mode: boolean;
}
