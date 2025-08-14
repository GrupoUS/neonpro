/**
 * Communication System Types
 * Story 2.3: Automated Communication System
 */

export type CommunicationChannel = 'sms' | 'email' | 'whatsapp';
export type MessageType = 'reminder' | 'confirmation' | 'followup' | 'waitlist' | 'cancellation';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';
export type ReminderTiming = 24 | 2 | 0.5; // hours before appointment

/**
 * Communication Log - tracks all communication attempts
 */
export interface CommunicationLog {
  id: string;
  appointment_id: string;
  patient_id: string;
  clinic_id: string;
  channel: CommunicationChannel;
  message_type: MessageType;
  template_id: string;
  status: MessageStatus;
  content: string;
  sent_at: Date;
  delivered_at?: Date;
  response?: string;
  cost?: number;
  error_message?: string;
  retry_count: number;
  external_id?: string; // Provider message ID
  created_at: Date;
  updated_at: Date;
}

/**
 * Message Template - reusable communication templates
 */
export interface MessageTemplate {
  id: string;
  clinic_id: string;
  name: string;
  channel: CommunicationChannel;
  type: MessageType;
  subject?: string; // For email
  content: string;
  variables: string[]; // Available template variables
  active: boolean;
  language: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Patient Communication Preferences
 */
export interface PatientCommPreferences {
  id: string;
  patient_id: string;
  clinic_id: string;
  preferred_channel: CommunicationChannel;
  backup_channel?: CommunicationChannel;
  reminder_enabled: boolean;
  reminder_timing: ReminderTiming[]; // Multiple reminder times
  confirmation_enabled: boolean;
  waitlist_notifications: boolean;
  language: string;
  phone_number?: string;
  email?: string;
  whatsapp_number?: string;
  consent_given: boolean;
  consent_date: Date;
  consent_ip?: string;
  opt_out_date?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * No-Show Prediction Model Data
 */
export interface NoShowPrediction {
  id: string;
  appointment_id: string;
  patient_id: string;
  risk_score: number; // 0-1, higher = more likely to no-show
  factors: {
    historical_no_shows: number;
    appointment_time: string;
    advance_booking_days: number;
    previous_cancellations: number;
    communication_response_rate: number;
    appointment_type: string;
    weather_factor?: number;
    day_of_week: string;
  };
  prediction_confidence: number;
  recommended_actions: string[];
  created_at: Date;
}

/**
 * Waitlist Entry
 */
export interface WaitlistEntry {
  id: string;
  patient_id: string;
  clinic_id: string;
  professional_id?: string;
  service_id: string;
  preferred_date_start: Date;
  preferred_date_end: Date;
  preferred_times: string[]; // ['morning', 'afternoon', 'evening']
  priority_score: number;
  notification_sent: boolean;
  last_notification_at?: Date;
  expires_at: Date;
  status: 'active' | 'notified' | 'booked' | 'expired' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

/**
 * Communication Campaign - for bulk communications
 */
export interface CommunicationCampaign {
  id: string;
  clinic_id: string;
  name: string;
  description: string;
  template_id: string;
  target_criteria: {
    patient_tags?: string[];
    appointment_types?: string[];
    date_range?: {
      start: Date;
      end: Date;
    };
    no_show_risk?: {
      min: number;
      max: number;
    };
  };
  scheduled_at: Date;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  response_count: number;
  total_cost: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Communication Analytics
 */
export interface CommunicationAnalytics {
  clinic_id: string;
  period_start: Date;
  period_end: Date;
  metrics: {
    total_messages_sent: number;
    delivery_rate: number;
    response_rate: number;
    no_show_reduction: number;
    cost_per_message: number;
    roi: number;
    channel_performance: {
      [key in CommunicationChannel]: {
        sent: number;
        delivered: number;
        responded: number;
        cost: number;
      };
    };
    template_performance: {
      template_id: string;
      name: string;
      sent: number;
      response_rate: number;
      effectiveness_score: number;
    }[];
  };
}

/**
 * Template Variables - dynamic content for messages
 */
export interface TemplateVariables {
  patient_name: string;
  patient_first_name: string;
  clinic_name: string;
  appointment_date: string;
  appointment_time: string;
  professional_name: string;
  service_name: string;
  confirmation_link?: string;
  reschedule_link?: string;
  cancel_link?: string;
  clinic_phone: string;
  clinic_address: string;
  custom_message?: string;
}

/**
 * Communication Provider Configuration
 */
export interface ProviderConfig {
  whatsapp: {
    account_sid: string;
    auth_token: string;
    phone_number: string;
    webhook_url: string;
  };
  sms: {
    account_sid: string;
    auth_token: string;
    phone_number: string;
  };
  email: {
    api_key: string;
    from_email: string;
    from_name: string;
    webhook_url: string;
  };
}

/**
 * Communication Queue Job
 */
export interface CommunicationJob {
  id: string;
  type: 'send_reminder' | 'send_confirmation' | 'send_followup' | 'process_campaign';
  data: {
    appointment_id?: string;
    patient_id: string;
    template_id: string;
    channel: CommunicationChannel;
    scheduled_at: Date;
    variables: TemplateVariables;
    retry_count?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  processed_at?: Date;
  error?: string;
}
