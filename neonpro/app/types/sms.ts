// SMS Integration Types for NeonPro
// Comprehensive type system for SMS communication with Brazilian providers

import { z } from 'zod';

// ==================== PROVIDER TYPES ====================

export type SMSProvider = 'twilio' | 'sms_dev' | 'zenvia' | 'movile' | 'custom';

export interface SMSProviderConfig {
  id: string;
  name: string;
  provider: SMSProvider;
  enabled: boolean;
  config: TwilioConfig | SMSDevConfig | ZenviaConfig | MovileConfig | CustomConfig;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

// Twilio Brasil Configuration
export interface TwilioConfig {
  account_sid: string;
  auth_token: string;
  from_number: string; // Número Twilio autorizado no Brasil
  webhook_url?: string;
  status_callback?: string;
}

// SMS Dev (ZENVIA) Configuration
export interface SMSDevConfig {
  api_key: string;
  sender_id: string; // Identificador do remetente
  webhook_url?: string;
  callback_option?: boolean;
}

// ZENVIA Configuration
export interface ZenviaConfig {
  api_token: string;
  account_id: string;
  from: string; // Canal de envio
  webhook_url?: string;
}

// Movile Configuration
export interface MovileConfig {
  username: string;
  auth_token: string;
  sender_id: string;
  webhook_url?: string;
}

// Custom Provider Configuration
export interface CustomConfig {
  api_url: string;
  api_key: string;
  headers?: Record<string, string>;
  auth_type: 'bearer' | 'basic' | 'api_key' | 'custom';
  webhook_url?: string;
}

// ==================== MESSAGE TYPES ====================

export interface SMSMessage {
  id: string;
  provider_id: string;
  provider: SMSProvider;
  to: string; // Número de destino (formato brasileiro: +5511999999999)
  from: string; // Número/ID do remetente
  body: string;
  status: SMSStatus;
  provider_message_id?: string;
  cost?: number;
  parts?: number; // Número de partes da mensagem
  direction: 'outbound' | 'inbound';
  error_code?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type SMSStatus = 
  | 'queued' 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'undelivered' 
  | 'failed' 
  | 'rejected'
  | 'read'
  | 'received'; // Para mensagens recebidas

// ==================== BULK MESSAGING ====================

export interface BulkSMSRequest {
  provider_id: string;
  messages: {
    to: string;
    body: string;
    variables?: Record<string, string>; // Para personalização
  }[];
  template_id?: string;
  scheduled_at?: string;
  batch_size?: number; // Tamanho do lote para rate limiting
  priority?: 'low' | 'normal' | 'high';
}

export interface BulkSMSResponse {
  batch_id: string;
  total_messages: number;
  queued_messages: number;
  failed_messages: number;
  estimated_cost: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  errors?: Array<{
    phone: string;
    error: string;
  }>;
}

// ==================== TEMPLATE SYSTEM ====================

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[]; // Lista de variáveis {{variable}}
  category: 'marketing' | 'transactional' | 'otp' | 'notification';
  status: 'active' | 'inactive' | 'pending_approval';
  provider_template_id?: string; // ID no provedor
  language: string;
  created_at: string;
  updated_at: string;
}

// ==================== WEBHOOK TYPES ====================

export interface SMSWebhookEvent {
  provider: SMSProvider;
  event_type: 'message_status' | 'message_received' | 'delivery_report';
  message_id: string;
  provider_message_id: string;
  status?: SMSStatus;
  timestamp: string;
  raw_data: Record<string, any>;
}

// Twilio Webhook
export interface TwilioWebhook {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  From: string;
  Body?: string;
  NumSegments?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

// SMS Dev Webhook
export interface SMSDevWebhook {
  id: string;
  status: string;
  phone: string;
  message: string;
  date: string;
  cost?: number;
}

// ==================== ANALYTICS & REPORTING ====================

export interface SMSAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  metrics: {
    total_sent: number;
    total_delivered: number;
    total_failed: number;
    delivery_rate: number;
    total_cost: number;
    average_cost_per_message: number;
    messages_by_provider: Record<SMSProvider, number>;
    messages_by_status: Record<SMSStatus, number>;
  };
}

export interface SMSCampaignReport {
  campaign_id: string;
  campaign_name: string;
  total_recipients: number;
  messages_sent: number;
  messages_delivered: number;
  messages_failed: number;
  delivery_rate: number;
  total_cost: number;
  cost_per_delivered: number;
  started_at: string;
  completed_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
}

// ==================== COMPLIANCE & OPT-IN ====================

export interface SMSOptIn {
  id: string;
  phone_number: string;
  patient_id?: string;
  status: 'opted_in' | 'opted_out' | 'pending';
  opt_in_date?: string;
  opt_out_date?: string;
  source: 'manual' | 'web_form' | 'sms_keyword' | 'api';
  consent_text?: string; // Texto do consentimento LGPD
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

// ==================== VALIDATION SCHEMAS ====================

const PhoneNumberSchema = z.string()
  .regex(/^\+55\d{10,11}$/, 'Número deve estar no formato +55XXXXXXXXXXX')
  .describe('Número de telefone brasileiro no formato internacional');

const SMSMessageBodySchema = z.string()
  .min(1, 'Mensagem não pode estar vazia')
  .max(1600, 'Mensagem muito longa (máximo 1600 caracteres)')
  .describe('Corpo da mensagem SMS');

const SMSTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  body: z.string().min(1, 'Corpo da template é obrigatório').max(1600),
  category: z.enum(['marketing', 'transactional', 'otp', 'notification']),
  language: z.string().default('pt-BR'),
  variables: z.array(z.string()).default([])
});

const SendSMSSchema = z.object({
  provider_id: z.string().uuid('ID do provedor inválido'),
  to: PhoneNumberSchema,
  body: SMSMessageBodySchema,
  template_id: z.string().uuid().optional(),
  variables: z.record(z.string()).optional(),
  scheduled_at: z.string().datetime().optional()
});

const BulkSMSSchema = z.object({
  provider_id: z.string().uuid('ID do provedor inválido'),
  messages: z.array(z.object({
    to: PhoneNumberSchema,
    body: SMSMessageBodySchema,
    variables: z.record(z.string()).optional()
  })).min(1, 'Lista de mensagens não pode estar vazia').max(1000, 'Máximo 1000 mensagens por lote'),
  template_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
  batch_size: z.number().min(1).max(100).default(10)
});

// ==================== API RESPONSE TYPES ====================

export interface SMSAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    request_id: string;
    timestamp: string;
    rate_limit?: {
      limit: number;
      remaining: number;
      reset_at: string;
    };
  };
}

export interface SendSMSResponse {
  message_id: string;
  provider_message_id?: string;
  to: string;
  status: SMSStatus;
  cost?: number;
  parts?: number;
  queued_at: string;
}

// ==================== ERROR TYPES ====================

export interface SMSError {
  code: string;
  message: string;
  provider: SMSProvider;
  http_status?: number;
  retryable: boolean;
  details?: Record<string, any>;
}

export const SMS_ERROR_CODES = {
  INVALID_PHONE: 'invalid_phone_number',
  INVALID_MESSAGE: 'invalid_message_content',
  PROVIDER_ERROR: 'provider_error',
  RATE_LIMIT: 'rate_limit_exceeded',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  UNAUTHORIZED: 'unauthorized_access',
  BLACKLISTED: 'number_blacklisted',
  OPT_OUT: 'recipient_opted_out',
  NETWORK_ERROR: 'network_error',
  WEBHOOK_ERROR: 'webhook_processing_error'
} as const;

export type SMSErrorCode = typeof SMS_ERROR_CODES[keyof typeof SMS_ERROR_CODES];

// ==================== FILTER & PAGINATION ====================

export interface SMSFilters {
  provider?: SMSProvider;
  status?: SMSStatus | SMSStatus[];
  direction?: 'outbound' | 'inbound';
  phone_number?: string;
  date_from?: string;
  date_to?: string;
  search?: string; // Busca no corpo da mensagem
}

export interface SMSListParams {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'sent_at' | 'delivered_at';
  order?: 'asc' | 'desc';
  filters?: SMSFilters;
}

export interface SMSListResponse {
  data: SMSMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary?: {
    total_sent: number;
    total_delivered: number;
    delivery_rate: number;
    total_cost: number;
  };
}

// ==================== CONFIGURATION UI TYPES ====================

export interface SMSProviderSetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  required: boolean;
  config_fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    description?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
}

export interface SMSProviderFeatures {
  supports_delivery_reports: boolean;
  supports_two_way: boolean;
  supports_bulk: boolean;
  supports_scheduling: boolean;
  supports_templates: boolean;
  max_message_length: number;
  max_bulk_size: number;
  rate_limit_per_second: number;
  supported_countries: string[];
}

// ==================== INTEGRATION TYPES ====================

export interface SMSIntegrationStatus {
  provider: SMSProvider;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  last_test: string;
  webhook_status: 'active' | 'inactive' | 'error';
  balance?: number;
  rate_limit?: {
    limit: number;
    remaining: number;
    reset_at: string;
  };
  features: SMSProviderFeatures;
}

// Export all validation schemas
export {
  PhoneNumberSchema,
  SMSMessageBodySchema,
  SMSTemplateSchema,
  SendSMSSchema,
  BulkSMSSchema
};