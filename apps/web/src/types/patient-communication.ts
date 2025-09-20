/**
 * Patient Communication Types
 * Types for SMS/Email notifications, appointment confirmations, reminders, and cancellations
 */

export type CommunicationType = "sms" | "email" | "whatsapp" | "push";

export type MessageType =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "appointment_cancellation"
  | "appointment_rescheduled"
  | "payment_reminder"
  | "follow_up"
  | "birthday_greeting"
  | "promotional"
  | "survey_request"
  | "treatment_instructions"
  | "custom";

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "cancelled";

export interface CommunicationTemplate {
  id: string;
  clinic_id: string;
  name: string;
  message_type: MessageType;
  communication_type: CommunicationType;

  // Template content
  subject?: string; // For email
  content: string; // Template with variables like {{patient_name}}, {{appointment_date}}

  // Template variables
  variables: {
    name: string;
    description: string;
    required: boolean;
    default_value?: string;
  }[];

  // Scheduling
  send_timing: {
    type: "immediate" | "scheduled" | "relative";
    // For scheduled: specific date/time
    scheduled_at?: string;
    // For relative: time before/after appointment
    relative_to?:
      | "appointment_date"
      | "appointment_created"
      | "appointment_completed";
    relative_amount?: number; // in minutes
    relative_unit?: "minutes" | "hours" | "days";
  };

  // Conditions for sending
  conditions?: {
    appointment_status?: string[];
    service_types?: string[];
    professional_ids?: string[];
    patient_tags?: string[];
    first_time_patient?: boolean;
  };

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationMessage {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string;
  template_id?: string;

  // Message details
  message_type: MessageType;
  communication_type: CommunicationType;
  subject?: string;
  content: string;

  // Recipient info
  recipient_name: string;
  recipient_phone?: string;
  recipient_email?: string;

  // Scheduling
  scheduled_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;

  // Status tracking
  status: MessageStatus;
  error_message?: string;
  retry_count: number;
  max_retries: number;

  // Provider details
  provider: string; // 'twilio', 'sendgrid', 'whatsapp_business', etc.
  provider_message_id?: string;
  provider_status?: string;

  // Cost tracking
  cost?: number;
  currency?: string;

  created_at: string;
  updated_at: string;
}

export interface CommunicationSettings {
  clinic_id: string;

  // Provider configurations
  sms_provider: {
    enabled: boolean;
    provider: "twilio" | "aws_sns" | "custom";
    api_key?: string;
    sender_id?: string;
    webhook_url?: string;
  };

  email_provider: {
    enabled: boolean;
    provider: "sendgrid" | "aws_ses" | "smtp" | "custom";
    api_key?: string;
    sender_email?: string;
    sender_name?: string;
    smtp_config?: {
      host: string;
      port: number;
      username: string;
      password: string;
      secure: boolean;
    };
  };

  whatsapp_provider: {
    enabled: boolean;
    provider: "whatsapp_business" | "twilio" | "custom";
    api_key?: string;
    phone_number?: string;
    webhook_url?: string;
  };

  // Default settings
  default_reminder_time: number; // minutes before appointment
  max_retry_attempts: number;
  retry_interval: number; // minutes between retries

  // Compliance settings
  opt_out_keywords: string[]; // Keywords that trigger opt-out
  business_hours: {
    enabled: boolean;
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    days: number[]; // 0-6, Sunday = 0
  };

  // Rate limiting
  rate_limits: {
    sms_per_hour: number;
    email_per_hour: number;
    whatsapp_per_hour: number;
  };

  updated_at: string;
}

export interface CommunicationLog {
  id: string;
  clinic_id: string;
  patient_id: string;
  message_id: string;

  event_type:
    | "sent"
    | "delivered"
    | "read"
    | "failed"
    | "bounced"
    | "complained"
    | "unsubscribed";
  event_data: Record<string, any>;
  provider_data?: Record<string, any>;

  created_at: string;
}

export interface PatientCommunicationPreferences {
  patient_id: string;

  // Channel preferences
  preferred_channels: CommunicationType[];

  // Opt-out settings
  sms_opt_out: boolean;
  email_opt_out: boolean;
  whatsapp_opt_out: boolean;
  marketing_opt_out: boolean;

  // Timing preferences
  preferred_time_start?: string; // HH:MM
  preferred_time_end?: string; // HH:MM
  timezone?: string;

  // Language preference
  language: string; // 'pt-BR', 'en-US', etc.

  updated_at: string;
}

export interface CreateCommunicationTemplateRequest {
  name: string;
  message_type: MessageType;
  communication_type: CommunicationType;
  subject?: string;
  content: string;
  variables: CommunicationTemplate["variables"];
  send_timing: CommunicationTemplate["send_timing"];
  conditions?: CommunicationTemplate["conditions"];
}

export interface UpdateCommunicationTemplateRequest
  extends Partial<CreateCommunicationTemplateRequest> {
  is_active?: boolean;
}

export interface SendMessageRequest {
  patient_id: string;
  appointment_id?: string;
  template_id?: string;
  message_type: MessageType;
  communication_type: CommunicationType;
  subject?: string;
  content: string;
  scheduled_at?: string; // If not provided, sends immediately
  variables?: Record<string, string>; // Template variable values
}

export interface CommunicationFilters {
  message_type?: MessageType;
  communication_type?: CommunicationType;
  status?: MessageStatus;
  patient_id?: string;
  appointment_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface CommunicationStats {
  clinic_id: string;
  period_start: string;
  period_end: string;

  // Overall stats
  total_messages: number;
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  messages_failed: number;

  // By type
  stats_by_type: {
    message_type: MessageType;
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    delivery_rate: number;
    read_rate: number;
  }[];

  // By channel
  stats_by_channel: {
    communication_type: CommunicationType;
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    delivery_rate: number;
    read_rate: number;
  }[];

  // Cost analysis
  total_cost: number;
  cost_by_channel: {
    communication_type: CommunicationType;
    cost: number;
    message_count: number;
    avg_cost_per_message: number;
  }[];

  // Performance metrics
  avg_delivery_time: number; // minutes
  avg_read_time: number; // minutes
  opt_out_rate: number; // percentage
}

// Predefined message templates
export const DEFAULT_TEMPLATES = {
  APPOINTMENT_CONFIRMATION: {
    sms: "Olá {{patient_name}}! Sua consulta está confirmada para {{appointment_date}} às {{appointment_time}} com {{professional_name}}. Clínica {{clinic_name}}.",
    email: {
      subject: "Consulta Confirmada - {{clinic_name}}",
      content: `
        <h2>Consulta Confirmada</h2>
        <p>Olá {{patient_name}},</p>
        <p>Sua consulta está confirmada:</p>
        <ul>
          <li><strong>Data:</strong> {{appointment_date}}</li>
          <li><strong>Horário:</strong> {{appointment_time}}</li>
          <li><strong>Profissional:</strong> {{professional_name}}</li>
          <li><strong>Serviço:</strong> {{service_name}}</li>
        </ul>
        <p>Endereço: {{clinic_address}}</p>
        <p>Em caso de dúvidas, entre em contato: {{clinic_phone}}</p>
      `,
    },
  },

  APPOINTMENT_REMINDER: {
    sms: "Lembrete: Você tem consulta amanhã às {{appointment_time}} com {{professional_name}}. Clínica {{clinic_name}}. Para cancelar, responda CANCELAR.",
    email: {
      subject: "Lembrete de Consulta - {{clinic_name}}",
      content: `
        <h2>Lembrete de Consulta</h2>
        <p>Olá {{patient_name}},</p>
        <p>Este é um lembrete da sua consulta:</p>
        <ul>
          <li><strong>Data:</strong> {{appointment_date}}</li>
          <li><strong>Horário:</strong> {{appointment_time}}</li>
          <li><strong>Profissional:</strong> {{professional_name}}</li>
        </ul>
        <p>Nos vemos em breve!</p>
      `,
    },
  },

  APPOINTMENT_CANCELLATION: {
    sms: "Sua consulta de {{appointment_date}} às {{appointment_time}} foi cancelada. Entre em contato para reagendar: {{clinic_phone}}",
    email: {
      subject: "Consulta Cancelada - {{clinic_name}}",
      content: `
        <h2>Consulta Cancelada</h2>
        <p>Olá {{patient_name}},</p>
        <p>Informamos que sua consulta foi cancelada:</p>
        <ul>
          <li><strong>Data:</strong> {{appointment_date}}</li>
          <li><strong>Horário:</strong> {{appointment_time}}</li>
        </ul>
        <p>Entre em contato para reagendar: {{clinic_phone}}</p>
      `,
    },
  },
} as const;
