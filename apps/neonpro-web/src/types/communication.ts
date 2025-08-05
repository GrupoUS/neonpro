// NeonPro Communication System Types
// Support for patient communication hub and internal staff communication

export interface CommunicationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "file" | "template" | "system";
  metadata: Record<string, any>;
  read_at?: Date;
  delivered_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

  // Computed fields
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

export interface CommunicationConversation {
  id: string;
  type: "internal" | "patient_chat" | "broadcast" | "emergency";
  title?: string;
  participants: string[]; // Array of user IDs
  patient_id?: string;
  clinic_id: string;
  metadata: Record<string, any>;
  is_active: boolean;
  archived_at?: Date;
  created_at: Date;
  updated_at: Date;

  // Computed fields
  last_message?: CommunicationMessage;
  unread_count?: number;
  patient?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CommunicationTemplate {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  template_type: "email" | "sms" | "push" | "chat" | "whatsapp";
  category: "appointment_reminder" | "treatment_followup" | "promotional" | "emergency" | "general";
  subject?: string;
  content: string;
  variables: string[]; // Available template variables like {{patient_name}}, {{appointment_date}}
  triggers: string[]; // Events that can activate this template
  active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommunicationNotification {
  id: string;
  recipient_id: string;
  type: "push" | "email" | "sms" | "in_app";
  channel: "firebase" | "sendgrid" | "twilio" | "internal";
  title?: string;
  content: string;
  data: Record<string, any>;
  scheduled_for: Date;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  failed_at?: Date;
  error_message?: string;
  clinic_id: string;
  created_at: Date;

  // Computed fields
  status: "pending" | "sent" | "delivered" | "read" | "failed";
}

export interface CommunicationConsent {
  id: string;
  patient_id: string;
  consent_type: "email" | "sms" | "push" | "marketing" | "emergency" | "appointment_reminders";
  consented: boolean;
  consented_at?: Date;
  revoked_at?: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;

  // LGPD compliance fields
  legal_basis: "consent" | "legitimate_interest" | "vital_interest" | "legal_obligation";
  purpose: string;
  retention_period_days?: number;
}

export interface CommunicationAuditLog {
  id: string;
  action:
    | "message_sent"
    | "message_read"
    | "consent_granted"
    | "consent_revoked"
    | "conversation_created"
    | "data_exported"
    | "data_deleted";
  entity_type: "message" | "conversation" | "consent" | "notification" | "template";
  entity_id: string;
  user_id?: string;
  patient_id?: string;
  clinic_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// API Request/Response Types
export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  message_type?: "text" | "image" | "file" | "template";
  metadata?: Record<string, any>;
  template_id?: string;
  template_variables?: Record<string, string>;
}

export interface CreateConversationRequest {
  type: "internal" | "patient_chat" | "broadcast";
  title?: string;
  participants: string[];
  patient_id?: string;
  metadata?: Record<string, any>;
}

export interface SendNotificationRequest {
  recipient_ids: string[];
  type: "push" | "email" | "sms";
  title?: string;
  content: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  scheduled_for?: Date;
  data?: Record<string, any>;
}

export interface UpdateConsentRequest {
  consent_type: "email" | "sms" | "push" | "marketing" | "emergency" | "appointment_reminders";
  consented: boolean;
  legal_basis?: "consent" | "legitimate_interest" | "vital_interest" | "legal_obligation";
  purpose?: string;
}

// Real-time Events
export interface RealtimeMessageEvent {
  type: "new_message" | "message_read" | "user_typing" | "user_online" | "user_offline";
  conversation_id: string;
  user_id: string;
  data: any;
}

// Search and Filter Types
export interface ConversationFilters {
  type?: "internal" | "patient_chat" | "broadcast";
  patient_id?: string;
  clinic_id?: string;
  active_only?: boolean;
  archived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MessageFilters {
  conversation_id: string;
  message_type?: "text" | "image" | "file" | "template" | "system";
  sender_id?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

// Communication Statistics
export interface CommunicationStats {
  clinic_id: string;
  period: "day" | "week" | "month" | "year";
  messages_sent: number;
  messages_received: number;
  conversations_active: number;
  response_time_avg_hours: number;
  patient_satisfaction_score?: number;
  notification_delivery_rate: number;
  template_usage: Array<{
    template_id: string;
    template_name: string;
    usage_count: number;
  }>;
}

// Error Types
export interface CommunicationError {
  code:
    | "UNAUTHORIZED"
    | "CONVERSATION_NOT_FOUND"
    | "MESSAGE_SEND_FAILED"
    | "CONSENT_REQUIRED"
    | "TEMPLATE_NOT_FOUND"
    | "RATE_LIMIT_EXCEEDED";
  message: string;
  details?: Record<string, any>;
}

// Webhook Types for External Services
export interface EmailWebhookEvent {
  id: string;
  event: "delivered" | "opened" | "clicked" | "bounced" | "spam";
  notification_id: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface SMSWebhookEvent {
  id: string;
  event: "delivered" | "failed" | "clicked";
  notification_id: string;
  timestamp: Date;
  data: Record<string, any>;
}
