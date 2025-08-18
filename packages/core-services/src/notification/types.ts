import { z } from 'zod';
import {
  type BaseEntity,
  DateSchema,
  EmailSchema,
  NotificationType,
  PhoneSchema,
  UUIDSchema,
} from '../types';

// Notification interfaces for aesthetic clinic communications
export interface Notification extends BaseEntity {
  type: NotificationType;
  recipientId: string; // Patient ID
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: NotificationStatus;
  priority: NotificationPriority;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  externalId?: string; // ID from external service (SendGrid, Twilio, etc.)
  metadata?: Record<string, any>;
  campaignId?: string;
  automationId?: string;
  isAutomated: boolean;
}

export interface NotificationTemplate extends BaseEntity {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string; // For email templates
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  language: string;
  version: number;
  parentTemplateId?: string; // For versioning
  previewText?: string; // For email previews
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: string;
  validation?: string; // RegEx pattern
}

export interface NotificationCampaign extends BaseEntity {
  name: string;
  description: string;
  type: CampaignType;
  templateId: string;
  channel: NotificationChannel;
  targetAudience: AudienceFilter;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  failedCount: number;
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  abTestConfig?: ABTestConfig;
}
export interface AudienceFilter {
  patientIds?: string[];
  tags?: string[];
  ageRange?: { min: number; max: number };
  gender?: string;
  treatmentHistory?: string[];
  lastVisitDate?: { from: Date; to: Date };
  totalSpent?: { min: number; max: number };
  city?: string[];
  marketingConsent: boolean;
  excludePatientIds?: string[];
}

export interface RecurringConfig {
  frequency: RecurringFrequency;
  interval: number; // Every X days/weeks/months
  endDate?: Date;
  maxOccurrences?: number;
  dayOfWeek?: number[]; // For weekly (0-6, Sunday-Saturday)
  dayOfMonth?: number; // For monthly (1-31)
}

export interface ABTestConfig {
  enabled: boolean;
  variantA: ABTestVariant;
  variantB: ABTestVariant;
  trafficSplit: number; // Percentage for variant A (0-100)
  testDuration: number; // Days
  winnerMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
}

export interface ABTestVariant {
  name: string;
  templateId: string;
  subject?: string;
}

export interface NotificationPreference extends BaseEntity {
  patientId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  treatmentFollowups: boolean;
  promotionalOffers: boolean;
  birthdayMessages: boolean;
  reviewRequests: boolean;
  generalUpdates: boolean;
  preferredTime: TimePreference;
  timezone: string;
  language: string;
  unsubscribeToken?: string;
  unsubscribedAt?: Date;
  unsubscribeReason?: string;
}

export interface TimePreference {
  morning: boolean; // 6-12
  afternoon: boolean; // 12-18
  evening: boolean; // 18-22
  weekend: boolean;
}

export interface NotificationLog extends BaseEntity {
  notificationId: string;
  event: NotificationEvent;
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
} // Enums
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum CampaignType {
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
  FOLLOWUP = 'followup',
  EDUCATIONAL = 'educational',
  ANNOUNCEMENT = 'announcement',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum VariableType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum NotificationEvent {
  CREATED = 'created',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  FAILED = 'failed',
  UNSUBSCRIBED = 'unsubscribed',
  SPAM_REPORTED = 'spam_reported',
} // Validation schemas
export const TemplateVariableSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(VariableType),
  description: z.string().min(1),
  required: z.boolean(),
  defaultValue: z.string().optional(),
  validation: z.string().optional(),
});

export const CreateNotificationTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  subject: z.string().min(1).optional(),
  content: z.string().min(1),
  variables: z.array(TemplateVariableSchema).default([]),
  isActive: z.boolean().default(true),
  language: z.string().default('pt-BR'),
  previewText: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const CreateNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  recipientId: UUIDSchema,
  recipientEmail: EmailSchema.optional(),
  recipientPhone: PhoneSchema.optional(),
  channel: z.nativeEnum(NotificationChannel),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  templateId: UUIDSchema.optional(),
  templateData: z.record(z.any()).optional(),
  scheduledAt: DateSchema.optional(),
  priority: z
    .nativeEnum(NotificationPriority)
    .default(NotificationPriority.NORMAL),
  maxRetries: z.number().min(0).max(5).default(3),
  metadata: z.record(z.any()).optional(),
  campaignId: UUIDSchema.optional(),
  automationId: UUIDSchema.optional(),
  isAutomated: z.boolean().default(false),
});

export const AudienceFilterSchema = z.object({
  patientIds: z.array(UUIDSchema).optional(),
  tags: z.array(z.string()).optional(),
  ageRange: z
    .object({
      min: z.number().min(0).max(120),
      max: z.number().min(0).max(120),
    })
    .optional(),
  gender: z.string().optional(),
  treatmentHistory: z.array(z.string()).optional(),
  lastVisitDate: z
    .object({
      from: DateSchema,
      to: DateSchema,
    })
    .optional(),
  totalSpent: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  city: z.array(z.string()).optional(),
  marketingConsent: z.boolean(),
  excludePatientIds: z.array(UUIDSchema).optional(),
});

export const CreateNotificationCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  type: z.nativeEnum(CampaignType),
  templateId: UUIDSchema,
  channel: z.nativeEnum(NotificationChannel),
  targetAudience: AudienceFilterSchema,
  scheduledAt: DateSchema.optional(),
  isRecurring: z.boolean().default(false),
});

export const NotificationPreferenceSchema = z.object({
  patientId: UUIDSchema,
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  whatsappNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  appointmentReminders: z.boolean().default(true),
  treatmentFollowups: z.boolean().default(true),
  promotionalOffers: z.boolean().default(false),
  birthdayMessages: z.boolean().default(true),
  reviewRequests: z.boolean().default(true),
  generalUpdates: z.boolean().default(false),
  preferredTime: z.object({
    morning: z.boolean().default(true),
    afternoon: z.boolean().default(true),
    evening: z.boolean().default(false),
    weekend: z.boolean().default(false),
  }),
  timezone: z.string().default('America/Sao_Paulo'),
  language: z.string().default('pt-BR'),
});

export type CreateNotificationTemplateData = z.infer<
  typeof CreateNotificationTemplateSchema
>;
export type CreateNotificationData = z.infer<typeof CreateNotificationSchema>;
export type CreateNotificationCampaignData = z.infer<
  typeof CreateNotificationCampaignSchema
>;
export type NotificationPreferenceData = z.infer<
  typeof NotificationPreferenceSchema
>;
export type AudienceFilterData = z.infer<typeof AudienceFilterSchema>;
