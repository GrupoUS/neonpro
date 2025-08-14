// NeonPro Notification System - Type Definitions
// Story 1.7: Sistema de Notificações Avançado
// File: src/lib/notifications/types.ts

// Base notification types
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'cancelled';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TemplateStatus = 'draft' | 'active' | 'archived';

// Notification categories for healthcare
export type NotificationCategory = 
  | 'appointment'     // Agendamentos
  | 'reminder'        // Lembretes
  | 'confirmation'    // Confirmações
  | 'cancellation'    // Cancelamentos
  | 'payment'         // Pagamentos
  | 'treatment'       // Tratamentos
  | 'follow_up'       // Acompanhamento
  | 'marketing'       // Marketing
  | 'system'          // Sistema
  | 'emergency';      // Emergência

// Provider types for different channels
export type EmailProvider = 'sendgrid' | 'aws_ses' | 'smtp';
export type SMSProvider = 'twilio' | 'aws_sns' | 'nexmo';
export type PushProvider = 'firebase' | 'apns' | 'onesignal';
export type WhatsAppProvider = 'twilio' | 'whatsapp_business';

// Base interfaces
export interface NotificationTemplate {
  id: string;
  clinicId?: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  subjectTemplate?: string;
  contentTemplate: string;
  variables: string[];
  status: TemplateStatus;
  isSystemTemplate: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  userId: string;
  clinicId?: string;
  title: string;
  content: string;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  templateId?: string;
  templateVariables?: Record<string, any>;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientPushToken?: string;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
  relatedResourceType?: string;
  relatedResourceId?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  clinicId?: string;
  
  // Channel preferences
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  inAppEnabled: boolean;
  
  // Category preferences
  appointmentNotifications: boolean;
  reminderNotifications: boolean;
  marketingNotifications: boolean;
  systemNotifications: boolean;
  
  // Timing preferences
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  
  // Contact information
  preferredEmail?: string;
  preferredPhone?: string;
  pushTokens: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  id: string;
  clinicId: string;
  channel: NotificationChannel;
  provider: string;
  config: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  clinicId?: string;
  title: string;
  content: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  templateId?: string;
  templateVariables?: Record<string, any>;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientPushToken?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  externalId?: string;
  deliveryAttempts: number;
  lastAttemptAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  clinicId?: string;
  eventType: string;
  eventTimestamp: string;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  providerData?: Record<string, any>;
  createdAt: string;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  avgDeliveryTime?: string;
  channelBreakdown: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

// Provider configuration interfaces
export interface EmailProviderConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  webhookUrl?: string;
  templateIds?: Record<string, string>;
}

export interface SMSProviderConfig {
  apiKey: string;
  apiSecret?: string;
  fromNumber: string;
  webhookUrl?: string;
}

export interface PushProviderConfig {
  serverKey: string;
  bundleId?: string;
  webhookUrl?: string;
}

export interface WhatsAppProviderConfig {
  apiKey: string;
  phoneNumberId: string;
  accessToken: string;
  webhookUrl?: string;
  verifyToken?: string;
}

// Event interfaces for real-time updates
export interface NotificationEvent {
  type: 'notification_sent' | 'notification_delivered' | 'notification_opened' | 'notification_clicked' | 'notification_failed';
  notificationId: string;
  userId: string;
  clinicId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Webhook payload interfaces
export interface WebhookPayload {
  event: string;
  notificationId: string;
  externalId?: string;
  status: NotificationStatus;
  timestamp: string;
  providerData?: Record<string, any>;
}

// Template variable definitions for different categories
export interface AppointmentVariables {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  professionalName: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  procedureName?: string;
  appointmentId: string;
}

export interface PaymentVariables {
  patientName: string;
  amount: string;
  dueDate: string;
  invoiceNumber: string;
  clinicName: string;
  paymentLink?: string;
}

export interface TreatmentVariables {
  patientName: string;
  treatmentName: string;
  professionalName: string;
  instructions: string;
  nextAppointment?: string;
  clinicName: string;
  clinicPhone: string;
}

// API response interfaces
export interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BulkNotificationResponse {
  successful: string[];
  failed: Array<{
    payload: NotificationPayload;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search and filter interfaces
export interface NotificationFilter {
  userId?: string;
  clinicId?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  startDate?: Date;
  endDate?: Date;
  templateId?: string;
}

export interface NotificationSearchParams {
  query?: string;
  filters?: NotificationFilter;
  sortBy?: 'createdAt' | 'sentAt' | 'deliveredAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Rate limiting interfaces
export interface RateLimit {
  channel: NotificationChannel;
  provider: string;
  perMinute: number;
  perHour: number;
  perDay: number;
  current: {
    minute: number;
    hour: number;
    day: number;
  };
  resetTime: {
    minute: Date;
    hour: Date;
    day: Date;
  };
}

// Scheduling interfaces
export interface ScheduledNotification {
  id: string;
  notificationPayload: NotificationPayload;
  scheduledAt: Date;
  status: 'scheduled' | 'sent' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Automation interfaces
export interface NotificationTrigger {
  id: string;
  name: string;
  description: string;
  event: string; // appointment_created, payment_due, etc.
  conditions: Record<string, any>;
  templateId: string;
  delay?: number; // seconds
  isActive: boolean;
  clinicId?: string;
  createdAt: string;
  updatedAt: string;
}

// Error handling interfaces
export interface NotificationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  notificationId?: string;
  timestamp: string;
}

// Security and compliance interfaces
export interface AuditLog {
  id: string;
  notificationId?: string;
  clinicId?: string;
  userId?: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  apiEndpoint?: string;
  createdAt: string;
}

export interface ComplianceSettings {
  lgpdCompliant: boolean;
  retentionPeriodDays: number;
  encryptionEnabled: boolean;
  auditingEnabled: boolean;
  consentRequired: boolean;
  optOutAvailable: boolean;
}

// Utility types
export type NotificationChannelConfig = 
  | { channel: 'email'; config: EmailProviderConfig }
  | { channel: 'sms'; config: SMSProviderConfig }
  | { channel: 'push'; config: PushProviderConfig }
  | { channel: 'whatsapp'; config: WhatsAppProviderConfig };

export type TemplateVariables = 
  | AppointmentVariables
  | PaymentVariables
  | TreatmentVariables
  | Record<string, any>;

// Constants
export const NOTIFICATION_CHANNELS: NotificationChannel[] = ['email', 'sms', 'whatsapp', 'push', 'in_app'];
export const NOTIFICATION_STATUSES: NotificationStatus[] = ['pending', 'processing', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'cancelled'];
export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'urgent'];
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ['appointment', 'reminder', 'confirmation', 'cancellation', 'payment', 'treatment', 'follow_up', 'marketing', 'system', 'emergency'];

// Default values
export const DEFAULT_NOTIFICATION_PREFERENCES: Partial<NotificationPreferences> = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: true,
  whatsappEnabled: false,
  inAppEnabled: true,
  appointmentNotifications: true,
  reminderNotifications: true,
  marketingNotifications: false,
  systemNotifications: true,
  timezone: 'America/Sao_Paulo',
  pushTokens: []
};

export const DEFAULT_RATE_LIMITS = {
  email: { perMinute: 20, perHour: 500, perDay: 2000 },
  sms: { perMinute: 10, perHour: 100, perDay: 500 },
  whatsapp: { perMinute: 5, perHour: 50, perDay: 200 },
  push: { perMinute: 100, perHour: 1000, perDay: 5000 },
  in_app: { perMinute: 200, perHour: 2000, perDay: 10000 }
};