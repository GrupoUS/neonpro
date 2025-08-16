/**
 * NeonPro Notification System - Core Types
 * Story 1.7: Sistema de Notificações
 *
 * Sistema completo de notificações para clínicas estéticas
 * Suporte a múltiplos canais, templates e automação
 */

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

/**
 * Tipos de notificação disponíveis no sistema
 */
export enum NotificationType {
  // Notificações de Agendamento
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',

  // Notificações de Paciente
  PATIENT_REGISTERED = 'patient_registered',
  PATIENT_UPDATED = 'patient_updated',
  PATIENT_BIRTHDAY = 'patient_birthday',
  PATIENT_FOLLOW_UP = 'patient_follow_up',

  // Notificações de Sistema
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  SYSTEM_ALERT = 'system_alert',
  SECURITY_ALERT = 'security_alert',

  // Notificações de Pagamento
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REMINDER = 'payment_reminder',
  INVOICE_GENERATED = 'invoice_generated',

  // Notificações de Marketing
  PROMOTIONAL_OFFER = 'promotional_offer',
  NEWSLETTER = 'newsletter',
  CAMPAIGN_MESSAGE = 'campaign_message',

  // Notificações de Staff
  STAFF_SCHEDULE_CHANGE = 'staff_schedule_change',
  STAFF_TASK_ASSIGNED = 'staff_task_assigned',
  STAFF_PERFORMANCE_REPORT = 'staff_performance_report',
}

/**
 * Canais de entrega de notificação
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WHATSAPP = 'whatsapp',
  WEBHOOK = 'webhook',
}

/**
 * Prioridades de notificação
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

/**
 * Status de entrega da notificação
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Categorias de notificação para organização
 */
export enum NotificationCategory {
  APPOINTMENT = 'appointment',
  PATIENT = 'patient',
  SYSTEM = 'system',
  PAYMENT = 'payment',
  MARKETING = 'marketing',
  STAFF = 'staff',
  SECURITY = 'security',
}

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

/**
 * Interface base para notificação
 */
export type BaseNotification = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  metadata?: NotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Metadados da notificação
 */
export type NotificationMetadata = {
  source: string;
  version: string;
  tags?: string[];
  correlationId?: string;
  parentNotificationId?: string;
  expiresAt?: Date;
  retryCount?: number;
  maxRetries?: number;
};

/**
 * Destinatário da notificação
 */
export type NotificationRecipient = {
  id: string;
  type: 'user' | 'patient' | 'staff' | 'admin';
  email?: string;
  phone?: string;
  pushToken?: string;
  preferences: NotificationPreferences;
  timezone?: string;
  language?: string;
};

/**
 * Preferências de notificação do usuário
 */
export type NotificationPreferences = {
  channels: {
    [key in NotificationChannel]: boolean;
  };
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      channels: NotificationChannel[];
      quietHours?: {
        start: string; // HH:mm
        end: string; // HH:mm
      };
    };
  };
  frequency: {
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    reminders: boolean;
    marketing: boolean;
  };
};

/**
 * Template de notificação
 */
export type NotificationTemplate = {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string; // Para email
  title: string;
  body: string;
  variables: string[]; // Variáveis disponíveis no template
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Configuração de canal de notificação
 */
export type ChannelConfig = {
  channel: NotificationChannel;
  isEnabled: boolean;
  config: {
    // Email
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };

    // SMS
    sms?: {
      provider: 'twilio' | 'aws-sns' | 'custom';
      apiKey: string;
      apiSecret: string;
      from: string;
    };

    // Push
    push?: {
      provider: 'firebase' | 'apns' | 'custom';
      serverKey: string;
      bundleId?: string;
    };

    // WhatsApp
    whatsapp?: {
      provider: 'twilio' | 'meta' | 'custom';
      apiKey: string;
      phoneNumberId: string;
    };

    // Webhook
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      retryPolicy?: {
        maxRetries: number;
        backoffMultiplier: number;
      };
    };
  };
};

// ============================================================================
// INTERFACES DE ENTREGA
// ============================================================================

/**
 * Notificação pronta para entrega
 */
export interface DeliveryNotification extends BaseNotification {
  recipient: NotificationRecipient;
  channel: NotificationChannel;
  template?: NotificationTemplate;
  scheduledFor?: Date;
  attempts: DeliveryAttempt[];
  status: NotificationStatus;
}

/**
 * Tentativa de entrega
 */
export type DeliveryAttempt = {
  id: string;
  attemptNumber: number;
  channel: NotificationChannel;
  status: NotificationStatus;
  response?: any;
  error?: string;
  attemptedAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
};

/**
 * Resultado de entrega
 */
export type DeliveryResult = {
  success: boolean;
  messageId?: string;
  status: NotificationStatus;
  response?: any;
  error?: string;
  retryAfter?: number; // segundos
};

// ============================================================================
// INTERFACES DE AUTOMAÇÃO
// ============================================================================

/**
 * Regra de automação de notificação
 */
export type NotificationRule = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: NotificationTrigger;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  schedule?: NotificationSchedule;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Gatilho de notificação
 */
export type NotificationTrigger = {
  type: 'event' | 'schedule' | 'condition';
  event?: string; // Nome do evento
  schedule?: string; // Cron expression
  condition?: string; // Condição SQL ou lógica
};

/**
 * Condição para execução da regra
 */
export type NotificationCondition = {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
};

/**
 * Ação a ser executada
 */
export type NotificationAction = {
  type: 'send_notification' | 'update_field' | 'call_webhook' | 'create_task';
  config: {
    notificationType?: NotificationType;
    channels?: NotificationChannel[];
    template?: string;
    delay?: number; // minutos
    data?: Record<string, any>;
  };
};

/**
 * Agendamento de notificação
 */
export type NotificationSchedule = {
  type: 'immediate' | 'delayed' | 'recurring';
  delay?: number; // minutos
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[]; // 0-6 (domingo-sábado)
    dayOfMonth?: number;
    endDate?: Date;
  };
};

// ============================================================================
// INTERFACES DE ANALYTICS
// ============================================================================

/**
 * Métricas de notificação
 */
export type NotificationMetrics = {
  period: {
    start: Date;
    end: Date;
  };
  total: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  byChannel: {
    [key in NotificationChannel]: {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
      deliveryRate: number;
      readRate: number;
    };
  };
  byType: {
    [key in NotificationType]: {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    };
  };
  performance: {
    averageDeliveryTime: number; // segundos
    averageReadTime: number; // segundos
    peakHours: number[];
    failureReasons: Record<string, number>;
  };
};

/**
 * Relatório de engajamento
 */
export type EngagementReport = {
  recipient: {
    id: string;
    type: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalReceived: number;
    totalRead: number;
    readRate: number;
    averageReadTime: number;
    preferredChannel: NotificationChannel;
    mostEngagedCategory: NotificationCategory;
    optOutRate: number;
  };
  trends: {
    engagement: Array<{
      date: Date;
      readRate: number;
    }>;
    channelPreference: Array<{
      channel: NotificationChannel;
      usage: number;
    }>;
  };
};

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Configuração global do sistema de notificações
 */
export type NotificationSystemConfig = {
  isEnabled: boolean;
  defaultChannel: NotificationChannel;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffTime: number; // segundos
  };
  rateLimiting: {
    enabled: boolean;
    limits: {
      [key in NotificationChannel]: {
        perMinute: number;
        perHour: number;
        perDay: number;
      };
    };
  };
  channels: ChannelConfig[];
  templates: {
    autoGenerate: boolean;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  analytics: {
    enabled: boolean;
    retentionDays: number;
    realTimeMetrics: boolean;
  };
  compliance: {
    lgpd: {
      enabled: boolean;
      consentRequired: boolean;
      dataRetentionDays: number;
    };
    optOut: {
      enabled: boolean;
      globalOptOut: boolean;
      categoryOptOut: boolean;
    };
  };
};

// ============================================================================
// TIPOS UTILITÁRIOS
// ============================================================================

/**
 * Contexto de notificação para templates
 */
export type NotificationContext = {
  recipient: NotificationRecipient;
  clinic: {
    id: string;
    name: string;
    logo?: string;
    contact: {
      phone: string;
      email: string;
      address: string;
    };
  };
  data: Record<string, any>;
  timestamp: Date;
  locale: string;
};

/**
 * Filtros para consulta de notificações
 */
export type NotificationFilters = {
  types?: NotificationType[];
  categories?: NotificationCategory[];
  channels?: NotificationChannel[];
  statuses?: NotificationStatus[];
  priorities?: NotificationPriority[];
  recipientId?: string;
  recipientType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  tags?: string[];
};

/**
 * Opções de paginação
 */
export type PaginationOptions = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Resultado paginado
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Evento de notificação para auditoria
 */
export type NotificationEvent = {
  id: string;
  notificationId: string;
  event: 'created' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  timestamp: Date;
  data?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
};

// ============================================================================
// EXPORTS
// ============================================================================

export type NotificationData = Record<string, any>;
export type TemplateVariables = Record<string, any>;
export type NotificationCallback = (
  notification: DeliveryNotification,
  result: DeliveryResult,
) => void;

/**
 * Configuração de inicialização do sistema
 */
export type NotificationSystemInit = {
  config: NotificationSystemConfig;
  channels: ChannelConfig[];
  templates?: NotificationTemplate[];
  rules?: NotificationRule[];
};
