// Patient Communication Center Types
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// Comprehensive type definitions for modern healthcare communication platform

import { z } from 'zod';

// ============================================================================
// CORE COMMUNICATION TYPES
// ============================================================================

export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type CommunicationChannel =
  | 'sms'
  | 'email'
  | 'portal'
  | 'whatsapp'
  | 'internal';
export type MessageType =
  | 'text'
  | 'appointment'
  | 'reminder'
  | 'alert'
  | 'document'
  | 'image'
  | 'form';
export type ConversationStatus = 'active' | 'archived' | 'blocked';

// ============================================================================
// MESSAGE THREAD & CONVERSATION SYSTEM
// ============================================================================

export interface MessageThread {
  id: string;
  patient_id: string;
  subject: string;
  status: ConversationStatus;
  priority: MessagePriority;
  last_message_at: string;
  participants: ThreadParticipant[];
  tags: string[];
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archived_by?: string;
}

export interface ThreadParticipant {
  user_id: string;
  role: 'patient' | 'doctor' | 'nurse' | 'receptionist' | 'admin';
  name: string;
  avatar?: string;
  joined_at: string;
  last_read_at?: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: 'patient' | 'staff';
  recipient_ids: string[];
  type: MessageType;
  channel: CommunicationChannel;
  subject?: string;
  content: string;
  formatted_content?: string; // Rich text/HTML version
  status: MessageStatus;
  priority: MessagePriority;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
  attachments: MessageAttachment[];
  metadata: MessageMetadata;
  automation_id?: string; // If sent via automated campaign
  template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  url: string;
  secure_url: string;
  thumbnail_url?: string;
  is_image: boolean;
  is_document: boolean;
  encryption_key?: string;
  uploaded_at: string;
  downloaded_at?: string;
}

export interface MessageMetadata {
  ip_address?: string;
  user_agent?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  delivery_attempts?: number;
  last_delivery_attempt?: string;
  read_receipt_requested?: boolean;
  auto_response?: boolean;
  external_message_id?: string; // For SMS/email providers
}

// ============================================================================
// HIPAA COMPLIANCE & CONSENT MANAGEMENT
// ============================================================================

export interface CommunicationConsent {
  id: string;
  patient_id: string;
  channel: CommunicationChannel;
  consent_given: boolean;
  consent_date: string;
  consent_method: 'verbal' | 'written' | 'electronic';
  phi_sharing_allowed: boolean;
  marketing_allowed: boolean;
  appointment_reminders: boolean;
  test_results: boolean;
  general_health_info: boolean;
  emergency_contact: boolean;
  expiry_date?: string;
  withdrawn_date?: string;
  withdrawal_reason?: string;
  witness_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EncryptionInfo {
  algorithm: string;
  key_id: string;
  iv?: string;
  salt?: string;
  encrypted_at: string;
  expires_at?: string;
}

// ============================================================================
// COMMUNICATION TEMPLATES & AUTOMATION
// ============================================================================

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  type: MessageType;
  channel: CommunicationChannel[];
  subject_template: string;
  content_template: string;
  variables: TemplateVariable[];
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  last_used_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory =
  | 'appointment'
  | 'reminder'
  | 'follow_up'
  | 'confirmation'
  | 'cancellation'
  | 'test_results'
  | 'medication'
  | 'billing'
  | 'marketing'
  | 'emergency'
  | 'general';

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  required: boolean;
  default_value?: string;
  validation_pattern?: string;
  options?: string[]; // For list type
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  schedule?: AutomationSchedule;
  max_executions?: number;
  execution_count: number;
  last_executed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationTrigger {
  type:
    | 'appointment_created'
    | 'appointment_reminder'
    | 'treatment_completed'
    | 'no_show'
    | 'birthday'
    | 'manual'
    | 'time_based';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: string | number | boolean | string[];
}

export interface AutomationAction {
  type:
    | 'send_message'
    | 'create_task'
    | 'update_patient'
    | 'send_email'
    | 'send_sms'
    | 'create_appointment';
  template_id?: string;
  channel?: CommunicationChannel;
  delay_minutes?: number;
  config: Record<string, any>;
}

export interface AutomationSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  days_of_week?: number[];
  day_of_month?: number;
  time?: string;
  timezone?: string;
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

export interface CommunicationCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  target_audience: CampaignAudience;
  message_template_id: string;
  channel: CommunicationChannel;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  response_count: number;
  unsubscribe_count: number;
  metrics: CampaignMetrics;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type CampaignType = 'one_time' | 'recurring' | 'triggered' | 'drip';
export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'cancelled'
  | 'paused';

export interface CampaignAudience {
  include_criteria: AudienceCriteria[];
  exclude_criteria: AudienceCriteria[];
  patient_ids?: string[];
  estimated_size?: number;
}

export interface AudienceCriteria {
  field: string;
  operator: string;
  value: any;
}

export interface CampaignMetrics {
  open_rate?: number;
  click_rate?: number;
  response_rate?: number;
  conversion_rate?: number;
  unsubscribe_rate?: number;
  bounce_rate?: number;
  cost_per_message?: number;
  roi?: number;
}

// ============================================================================
// QUICK RESPONSES & CANNED MESSAGES
// ============================================================================

export interface QuickResponse {
  id: string;
  name: string;
  shortcut: string; // e.g., "/appointment", "/thanks"
  content: string;
  category: string;
  channel: CommunicationChannel[];
  is_personal: boolean; // Personal vs team-wide
  user_id?: string; // If personal
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMMUNICATION ANALYTICS & REPORTING
// ============================================================================

export interface CommunicationStats {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  total_messages: number;
  messages_by_channel: Record<CommunicationChannel, number>;
  messages_by_type: Record<MessageType, number>;
  average_response_time: number; // in minutes
  patient_satisfaction_score?: number;
  automation_success_rate: number;
  top_templates: TemplateUsage[];
  peak_hours: HourlyUsage[];
  staff_performance: StaffCommunicationStats[];
}

export interface TemplateUsage {
  template_id: string;
  template_name: string;
  usage_count: number;
  success_rate: number;
}

export interface HourlyUsage {
  hour: number;
  message_count: number;
  response_rate: number;
}

export interface StaffCommunicationStats {
  user_id: string;
  user_name: string;
  messages_sent: number;
  average_response_time: number;
  patient_satisfaction: number;
  templates_used: number;
}

// ============================================================================
// COMMUNICATION PREFERENCES
// ============================================================================

export interface CommunicationPreferences {
  id: string;
  patient_id: string;
  preferred_channel: CommunicationChannel;
  preferred_time_start: string; // HH:MM
  preferred_time_end: string; // HH:MM
  timezone: string;
  language: string;
  quiet_hours_enabled: boolean;
  weekend_communication: boolean;
  emergency_contact_override: boolean;
  marketing_opt_in: boolean;
  appointment_reminders: {
    enabled: boolean;
    advance_days: number[];
    channels: CommunicationChannel[];
  };
  follow_up_preferences: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    max_attempts: number;
  };
  custom_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EXTERNAL INTEGRATIONS
// ============================================================================

export interface ExternalProvider {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'voice';
  provider: string; // e.g., 'twilio', 'sendgrid', 'mailgun'
  is_active: boolean;
  configuration: ProviderConfiguration;
  rate_limits: RateLimit;
  cost_per_message: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderConfiguration {
  api_key?: string;
  api_secret?: string;
  sender_id?: string;
  webhook_url?: string;
  custom_settings: Record<string, any>;
}

export interface RateLimit {
  messages_per_minute: number;
  messages_per_hour: number;
  messages_per_day: number;
  burst_limit: number;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const MessageSchema = z.object({
  thread_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  sender_type: z.enum(['patient', 'staff']),
  recipient_ids: z.array(z.string().uuid()),
  type: z.enum([
    'text',
    'appointment',
    'reminder',
    'alert',
    'document',
    'image',
    'form',
  ]),
  channel: z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  template_id: z.string().uuid().optional(),
  automation_id: z.string().uuid().optional(),
});

export const MessageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.enum([
    'appointment',
    'reminder',
    'follow_up',
    'confirmation',
    'cancellation',
    'test_results',
    'medication',
    'billing',
    'marketing',
    'emergency',
    'general',
  ]),
  type: z.enum([
    'text',
    'appointment',
    'reminder',
    'alert',
    'document',
    'image',
    'form',
  ]),
  channel: z.array(z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])),
  subject_template: z.string().min(1, 'Subject template is required'),
  content_template: z.string().min(1, 'Content template is required'),
  variables: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      type: z.enum(['text', 'number', 'date', 'boolean', 'list']),
      required: z.boolean(),
      default_value: z.string().optional(),
      validation_pattern: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
  ),
  is_active: z.boolean().default(true),
});

export const CommunicationConsentSchema = z.object({
  patient_id: z.string().uuid(),
  channel: z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
  consent_given: z.boolean(),
  consent_method: z.enum(['verbal', 'written', 'electronic']),
  phi_sharing_allowed: z.boolean(),
  marketing_allowed: z.boolean(),
  appointment_reminders: z.boolean(),
  test_results: z.boolean(),
  general_health_info: z.boolean(),
  emergency_contact: z.boolean(),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
});

export const CommunicationCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  type: z.enum(['one_time', 'recurring', 'triggered', 'drip']),
  message_template_id: z.string().uuid(),
  channel: z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
  scheduled_at: z.string().optional(),
  target_audience: z.object({
    include_criteria: z.array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
      })
    ),
    exclude_criteria: z.array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
      })
    ),
    patient_ids: z.array(z.string().uuid()).optional(),
  }),
});

export const QuickResponseSchema = z.object({
  name: z.string().min(1, 'Quick response name is required'),
  shortcut: z
    .string()
    .min(1, 'Shortcut is required')
    .regex(
      /^\/\w+$/,
      'Shortcut must start with / and contain only letters, numbers, and underscores'
    ),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  channel: z.array(z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])),
  is_personal: z.boolean().default(false),
});

export const CommunicationPreferencesSchema = z.object({
  patient_id: z.string().uuid(),
  preferred_channel: z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
  preferred_time_start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  preferred_time_end: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  timezone: z.string(),
  language: z.string(),
  quiet_hours_enabled: z.boolean(),
  weekend_communication: z.boolean(),
  emergency_contact_override: z.boolean(),
  marketing_opt_in: z.boolean(),
  appointment_reminders: z.object({
    enabled: z.boolean(),
    advance_days: z.array(z.number().min(0).max(30)),
    channels: z.array(
      z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])
    ),
  }),
  follow_up_preferences: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['immediate', 'daily', 'weekly']),
    max_attempts: z.number().min(1).max(10),
  }),
});

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface SendMessageRequest {
  thread_id?: string; // Optional for new conversations
  patient_id: string;
  type: MessageType;
  channel: CommunicationChannel;
  subject?: string;
  content: string;
  priority?: MessagePriority;
  template_id?: string;
  template_variables?: Record<string, any>;
  attachments?: File[];
  scheduled_at?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  thread_id?: string;
  status: MessageStatus;
  scheduled_at?: string;
  estimated_delivery?: string;
  cost?: number;
  error?: string;
}

export interface GetMessagesRequest {
  thread_id?: string;
  patient_id?: string;
  channel?: CommunicationChannel;
  status?: MessageStatus;
  type?: MessageType;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'sent_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

export interface GetMessagesResponse {
  messages: Message[];
  threads?: MessageThread[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CampaignExecutionRequest {
  campaign_id: string;
  test_mode?: boolean;
  test_recipients?: string[];
}

export interface CampaignExecutionResponse {
  success: boolean;
  execution_id: string;
  estimated_recipients: number;
  estimated_cost: number;
  scheduled_at?: string;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type MessageThreadWithLastMessage = MessageThread & {
  last_message: Message;
  unread_count: number;
};

export type PatientCommunicationSummary = {
  patient_id: string;
  total_messages: number;
  last_contact: string;
  preferred_channel: CommunicationChannel;
  response_rate: number;
  satisfaction_score?: number;
  active_threads: number;
  pending_responses: number;
};

export type CommunicationDashboardData = {
  stats: CommunicationStats;
  recent_messages: Message[];
  active_campaigns: CommunicationCampaign[];
  pending_approvals: Message[];
  failed_messages: Message[];
  top_performers: StaffCommunicationStats[];
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface CommunicationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retry_after?: number;
  permanent?: boolean;
}

export type CommunicationErrorCode =
  | 'INVALID_RECIPIENT'
  | 'CONSENT_REQUIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PROVIDER_ERROR'
  | 'TEMPLATE_NOT_FOUND'
  | 'ENCRYPTION_FAILED'
  | 'DELIVERY_FAILED'
  | 'CONTENT_BLOCKED'
  | 'INSUFFICIENT_CREDITS';
