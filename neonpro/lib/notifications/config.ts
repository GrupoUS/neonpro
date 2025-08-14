/**
 * NeonPro Notification System - Configuration
 * Story 1.7: Sistema de Notificações
 * 
 * Configurações centralizadas para o sistema de notificações
 * Suporte a diferentes ambientes e provedores
 */

import { NotificationChannel, NotificationPriority } from './types';

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO
// ============================================================================

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  webhookSecret?: string;
  templates?: {
    [key: string]: string; // template IDs do provedor
  };
}

export interface SMSConfig {
  provider: 'twilio' | 'vonage' | 'aws-sns';
  accountSid?: string; // Twilio
  authToken?: string; // Twilio
  apiKey?: string; // Vonage
  apiSecret?: string; // Vonage
  fromNumber: string;
  webhookSecret?: string;
}

export interface PushConfig {
  provider: 'fcm' | 'apns' | 'expo';
  projectId?: string; // FCM
  privateKey?: string; // FCM
  clientEmail?: string; // FCM
  keyId?: string; // APNS
  teamId?: string; // APNS
  bundleId?: string; // APNS
  accessToken?: string; // Expo
}

export interface InAppConfig {
  websocketEnabled: boolean;
  persistenceEnabled: boolean;
  maxNotifications: number;
  retentionDays: number;
}

export interface DatabaseConfig {
  url: string;
  apiKey: string;
  schema?: string;
}

export interface QueueConfig {
  provider: 'redis' | 'sqs' | 'memory';
  url?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxRetries: number;
  retryDelay: number;
}

export interface NotificationSystemConfig {
  // Configurações dos canais
  email: EmailConfig;
  sms: SMSConfig;
  push: PushConfig;
  inApp: InAppConfig;
  
  // Infraestrutura
  database: DatabaseConfig;
  queue: QueueConfig;
  
  // Configurações gerais
  defaultPriority: NotificationPriority;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  rateLimits: {
    [key in NotificationChannel]: {
      perMinute: number;
      perHour: number;
      perDay: number;
    };
  };
  
  // Recursos opcionais
  features: {
    analytics: boolean;
    automation: boolean;
    templates: boolean;
    scheduling: boolean;
    webhooks: boolean;
  };
  
  // Configurações de desenvolvimento
  development: {
    mockProviders: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableTestMode: boolean;
  };
}

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

export const DEFAULT_CONFIG: Partial<NotificationSystemConfig> = {
  defaultPriority: NotificationPriority.MEDIUM,
  maxRetries: 3,
  retryDelay: 5000, // 5 segundos
  batchSize: 100,
  
  rateLimits: {
    [NotificationChannel.EMAIL]: {
      perMinute: 100,
      perHour: 1000,
      perDay: 10000
    },
    [NotificationChannel.SMS]: {
      perMinute: 10,
      perHour: 100,
      perDay: 1000
    },
    [NotificationChannel.PUSH]: {
      perMinute: 200,
      perHour: 2000,
      perDay: 20000
    },
    [NotificationChannel.IN_APP]: {
      perMinute: 500,
      perHour: 5000,
      perDay: 50000
    }
  },
  
  features: {
    analytics: true,
    automation: true,
    templates: true,
    scheduling: true,
    webhooks: true
  },
  
  development: {
    mockProviders: process.env.NODE_ENV !== 'production',
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableTestMode: process.env.NODE_ENV === 'test'
  }
};

// ============================================================================
// CONFIGURAÇÃO POR AMBIENTE
// ============================================================================

export function createNotificationConfig(): NotificationSystemConfig {
  const config: NotificationSystemConfig = {
    ...DEFAULT_CONFIG,
    
    // Email Configuration
    email: {
      provider: (process.env.EMAIL_PROVIDER as any) || 'resend',
      apiKey: process.env.EMAIL_API_KEY || '',
      fromEmail: process.env.EMAIL_FROM || 'noreply@neonpro.com.br',
      fromName: process.env.EMAIL_FROM_NAME || 'NeonPro',
      replyTo: process.env.EMAIL_REPLY_TO,
      webhookSecret: process.env.EMAIL_WEBHOOK_SECRET
    },
    
    // SMS Configuration
    sms: {
      provider: (process.env.SMS_PROVIDER as any) || 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      fromNumber: process.env.SMS_FROM_NUMBER || '+5511999999999',
      webhookSecret: process.env.SMS_WEBHOOK_SECRET
    },
    
    // Push Configuration
    push: {
      provider: (process.env.PUSH_PROVIDER as any) || 'fcm',
      projectId: process.env.FCM_PROJECT_ID,
      privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FCM_CLIENT_EMAIL,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      bundleId: process.env.APNS_BUNDLE_ID,
      accessToken: process.env.EXPO_ACCESS_TOKEN
    },
    
    // In-App Configuration
    inApp: {
      websocketEnabled: process.env.WEBSOCKET_ENABLED !== 'false',
      persistenceEnabled: process.env.PERSISTENCE_ENABLED !== 'false',
      maxNotifications: parseInt(process.env.MAX_NOTIFICATIONS || '100'),
      retentionDays: parseInt(process.env.RETENTION_DAYS || '30')
    },
    
    // Database Configuration
    database: {
      url: process.env.SUPABASE_URL || '',
      apiKey: process.env.SUPABASE_ANON_KEY || '',
      schema: process.env.DB_SCHEMA || 'public'
    },
    
    // Queue Configuration
    queue: {
      provider: (process.env.QUEUE_PROVIDER as any) || 'memory',
      url: process.env.REDIS_URL || process.env.QUEUE_URL,
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000')
    }
  } as NotificationSystemConfig;
  
  // Validar configuração
  validateConfig(config);
  
  return config;
}

// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================================================

export function validateConfig(config: NotificationSystemConfig): void {
  const errors: string[] = [];
  
  // Validar configurações obrigatórias
  if (!config.database.url) {
    errors.push('SUPABASE_URL é obrigatório');
  }
  
  if (!config.database.apiKey) {
    errors.push('SUPABASE_ANON_KEY é obrigatório');
  }
  
  // Validar configurações de email se habilitado
  if (config.features.templates || config.features.automation) {
    if (!config.email.apiKey && !config.development.mockProviders) {
      errors.push('EMAIL_API_KEY é obrigatório para produção');
    }
  }
  
  // Validar configurações de SMS se habilitado
  if (config.sms.provider === 'twilio') {
    if (!config.sms.accountSid && !config.development.mockProviders) {
      errors.push('TWILIO_ACCOUNT_SID é obrigatório para Twilio');
    }
    if (!config.sms.authToken && !config.development.mockProviders) {
      errors.push('TWILIO_AUTH_TOKEN é obrigatório para Twilio');
    }
  }
  
  // Validar configurações de push se habilitado
  if (config.push.provider === 'fcm') {
    if (!config.push.projectId && !config.development.mockProviders) {
      errors.push('FCM_PROJECT_ID é obrigatório para FCM');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuração inválida:\n${errors.join('\n')}`);
  }
}

// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================

export function getChannelConfig(config: NotificationSystemConfig, channel: NotificationChannel) {
  switch (channel) {
    case NotificationChannel.EMAIL:
      return config.email;
    case NotificationChannel.SMS:
      return config.sms;
    case NotificationChannel.PUSH:
      return config.push;
    case NotificationChannel.IN_APP:
      return config.inApp;
    default:
      throw new Error(`Canal não suportado: ${channel}`);
  }
}

export function isChannelEnabled(config: NotificationSystemConfig, channel: NotificationChannel): boolean {
  const channelConfig = getChannelConfig(config, channel);
  
  switch (channel) {
    case NotificationChannel.EMAIL:
      return !!(channelConfig as EmailConfig).apiKey || config.development.mockProviders;
    case NotificationChannel.SMS:
      const smsConfig = channelConfig as SMSConfig;
      return (
        (smsConfig.provider === 'twilio' && !!(smsConfig.accountSid && smsConfig.authToken)) ||
        (smsConfig.provider === 'vonage' && !!(smsConfig.apiKey && smsConfig.apiSecret)) ||
        config.development.mockProviders
      );
    case NotificationChannel.PUSH:
      const pushConfig = channelConfig as PushConfig;
      return (
        (pushConfig.provider === 'fcm' && !!pushConfig.projectId) ||
        (pushConfig.provider === 'apns' && !!(pushConfig.keyId && pushConfig.teamId)) ||
        (pushConfig.provider === 'expo' && !!pushConfig.accessToken) ||
        config.development.mockProviders
      );
    case NotificationChannel.IN_APP:
      return true; // Sempre habilitado
    default:
      return false;
  }
}

export function getRateLimit(config: NotificationSystemConfig, channel: NotificationChannel, period: 'minute' | 'hour' | 'day'): number {
  const rateLimits = config.rateLimits[channel];
  
  switch (period) {
    case 'minute':
      return rateLimits.perMinute;
    case 'hour':
      return rateLimits.perHour;
    case 'day':
      return rateLimits.perDay;
    default:
      return 0;
  }
}

// ============================================================================
// CONFIGURAÇÕES DE TEMPLATE
// ============================================================================

export const TEMPLATE_DEFAULTS = {
  variables: {
    user: ['firstName', 'lastName', 'email', 'phone'],
    patient: ['firstName', 'lastName', 'email', 'phone', 'birthDate'],
    doctor: ['firstName', 'lastName', 'specialty', 'crm'],
    appointment: ['date', 'time', 'duration', 'type', 'location'],
    payment: ['amount', 'reference', 'date', 'method', 'status'],
    alert: ['title', 'message', 'severity', 'action', 'timestamp']
  },
  
  functions: {
    date: ['format', 'add', 'subtract', 'diff'],
    currency: ['format', 'symbol'],
    phone: ['format', 'mask'],
    string: ['upper', 'lower', 'title', 'truncate'],
    conditional: ['if', 'unless', 'switch']
  }
};

// ============================================================================
// CONFIGURAÇÕES DE WEBHOOK
// ============================================================================

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  retries: number;
  timeout: number;
}

export const WEBHOOK_EVENTS = {
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  NOTIFICATION_FAILED: 'notification.failed',
  NOTIFICATION_OPENED: 'notification.opened',
  NOTIFICATION_CLICKED: 'notification.clicked',
  AUTOMATION_TRIGGERED: 'automation.triggered',
  AUTOMATION_COMPLETED: 'automation.completed',
  AUTOMATION_FAILED: 'automation.failed'
} as const;

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  NotificationChannel,
  NotificationPriority
} from './types';

export const config = createNotificationConfig();
export default config;
