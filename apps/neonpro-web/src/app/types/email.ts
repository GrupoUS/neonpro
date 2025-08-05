import type { z } from "zod";

// =======================================
// EMAIL PROVIDER TYPES & CONFIGURATIONS
// =======================================

export type EmailProvider = "smtp" | "ses" | "sendgrid" | "mailgun" | "resend" | "postmark";

export interface EmailProviderConfig {
  provider: EmailProvider;
  name: string;
  settings: Record<string, any>;
  isActive: boolean;
  priority: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  rateLimit?: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
}

// Provider-specific configurations
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
}

export interface SESConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  configurationSet?: string;
}

export interface SendGridConfig {
  apiKey: string;
  ipPoolName?: string;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  region: "us" | "eu";
}

export interface ResendConfig {
  apiKey: string;
}

export interface PostmarkConfig {
  serverToken: string;
  messageStream?: string;
}

// =======================================
// EMAIL MESSAGE TYPES
// =======================================

export interface EmailRecipient {
  email: string;
  name?: string;
  type: "to" | "cc" | "bcc";
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  cid?: string; // Content-ID for inline attachments
  size?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[]; // Array of variable names like ['patientName', 'appointmentDate']
  category: "follow-up" | "appointment" | "marketing" | "notification";
  isActive: boolean;
  clinicId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailMessage {
  id?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from: {
    email: string;
    name?: string;
  };
  replyTo?: {
    email: string;
    name?: string;
  };
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateVariables?: Record<string, any>;
  priority: "low" | "normal" | "high";
  scheduledAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

// =======================================
// EMAIL TRACKING & ANALYTICS
// =======================================

export type EmailStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "bounced"
  | "rejected"
  | "opened"
  | "clicked"
  | "unsubscribed"
  | "complained"
  | "failed";

export interface EmailEvent {
  id: string;
  emailId: string;
  messageId: string;
  event: EmailStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
  providerEventId?: string;
  reason?: string; // For bounces, complaints, etc.
  userAgent?: string; // For opens, clicks
  ipAddress?: string;
  linkUrl?: string; // For click events
}

export interface EmailAnalytics {
  totalSent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  failed: number;

  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;

  avgDeliveryTime?: number; // Minutes
  avgOpenTime?: number; // Hours

  topLinks?: Array<{
    url: string;
    clicks: number;
  }>;

  bounceReasons?: Array<{
    reason: string;
    count: number;
  }>;
}

// =======================================
// EMAIL CAMPAIGN TYPES
// =======================================

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  recipients: EmailRecipient[];
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "completed";
  segmentId?: string; // For patient segmentation

  settings: {
    trackOpens: boolean;
    trackClicks: boolean;
    enableUnsubscribe: boolean;
    batchSize?: number;
    sendRate?: number; // emails per minute
  };

  analytics?: EmailAnalytics;

  clinicId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}

// =======================================
// EMAIL SETTINGS & PREFERENCES
// =======================================

export interface EmailSettings {
  id: string;
  clinicId: string;

  defaultFrom: {
    email: string;
    name: string;
  };

  defaultReplyTo?: {
    email: string;
    name: string;
  };

  bounceHandling: {
    enabled: boolean;
    maxBounces: number;
    suppressAfterBounces: boolean;
  };

  unsubscribeHandling: {
    enabled: boolean;
    redirectUrl?: string;
    confirmationRequired: boolean;
  };

  deliveryOptimization: {
    sendingSchedule: {
      enabled: boolean;
      allowedHours: {
        start: string; // "09:00"
        end: string; // "18:00"
      };
      allowedDays: number[]; // [1,2,3,4,5] for Mon-Fri
      timezone: string;
    };

    rateLimit: {
      emailsPerMinute: number;
      emailsPerHour: number;
      emailsPerDay: number;
    };

    suppressionList: {
      enabled: boolean;
      bounced: boolean;
      complained: boolean;
      unsubscribed: boolean;
    };
  };

  dkimSigning: {
    enabled: boolean;
    domain?: string;
    selector?: string;
    privateKey?: string;
  };

  webhookUrl?: string;
  webhookSecret?: string;
}

// =======================================
// ZOD SCHEMAS FOR VALIDATION
// =======================================

export const EmailRecipientSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
  type: z.enum(["to", "cc", "bcc"]).default("to"),
});

export const EmailAttachmentSchema = z.object({
  filename: z.string().min(1, "Nome do arquivo é obrigatório"),
  content: z.any(), // Buffer or string
  contentType: z.string().optional(),
  cid: z.string().optional(),
  size: z.number().positive().optional(),
});

export const EmailTemplateSchema = z.object({
  name: z.string().min(1, "Nome do template é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  htmlContent: z.string().min(1, "Conteúdo HTML é obrigatório"),
  textContent: z.string().optional(),
  variables: z.array(z.string()).default([]),
  category: z.enum(["follow-up", "appointment", "marketing", "notification"]),
  isActive: z.boolean().default(true),
});

export const EmailMessageSchema = z.object({
  to: z.array(EmailRecipientSchema).min(1, "Pelo menos um destinatário é obrigatório"),
  cc: z.array(EmailRecipientSchema).optional(),
  bcc: z.array(EmailRecipientSchema).optional(),
  from: z.object({
    email: z.string().email("Email do remetente inválido"),
    name: z.string().optional(),
  }),
  replyTo: z
    .object({
      email: z.string().email("Email de resposta inválido"),
      name: z.string().optional(),
    })
    .optional(),
  subject: z.string().min(1, "Assunto é obrigatório"),
  htmlContent: z.string().min(1, "Conteúdo HTML é obrigatório"),
  textContent: z.string().optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  templateId: z.string().optional(),
  templateVariables: z.record(z.any()).optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  scheduledAt: z.date().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const EmailCampaignSchema = z.object({
  name: z.string().min(1, "Nome da campanha é obrigatório"),
  templateId: z.string().min(1, "Template é obrigatório"),
  recipients: z.array(EmailRecipientSchema).min(1, "Pelo menos um destinatário é obrigatório"),
  scheduledAt: z.date().optional(),
  segmentId: z.string().optional(),
  settings: z.object({
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    enableUnsubscribe: z.boolean().default(true),
    batchSize: z.number().positive().optional(),
    sendRate: z.number().positive().optional(),
  }),
});

export const EmailProviderConfigSchema = z.object({
  provider: z.enum(["smtp", "ses", "sendgrid", "mailgun", "resend", "postmark"]),
  name: z.string().min(1, "Nome do provedor é obrigatório"),
  settings: z.record(z.any()),
  isActive: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(5),
  dailyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
  rateLimit: z
    .object({
      requestsPerSecond: z.number().positive(),
      requestsPerMinute: z.number().positive(),
    })
    .optional(),
});

export const EmailSettingsSchema = z.object({
  defaultFrom: z.object({
    email: z.string().email("Email padrão inválido"),
    name: z.string().min(1, "Nome padrão é obrigatório"),
  }),
  defaultReplyTo: z
    .object({
      email: z.string().email("Email de resposta inválido"),
      name: z.string().optional(),
    })
    .optional(),
  bounceHandling: z.object({
    enabled: z.boolean().default(true),
    maxBounces: z.number().min(1).max(10).default(3),
    suppressAfterBounces: z.boolean().default(true),
  }),
  unsubscribeHandling: z.object({
    enabled: z.boolean().default(true),
    redirectUrl: z.string().url().optional(),
    confirmationRequired: z.boolean().default(false),
  }),
  deliveryOptimization: z.object({
    sendingSchedule: z.object({
      enabled: z.boolean().default(false),
      allowedHours: z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
        end: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
      }),
      allowedDays: z.array(z.number().min(0).max(6)),
      timezone: z.string().default("America/Sao_Paulo"),
    }),
    rateLimit: z.object({
      emailsPerMinute: z.number().positive().default(60),
      emailsPerHour: z.number().positive().default(1000),
      emailsPerDay: z.number().positive().default(10000),
    }),
    suppressionList: z.object({
      enabled: z.boolean().default(true),
      bounced: z.boolean().default(true),
      complained: z.boolean().default(true),
      unsubscribed: z.boolean().default(true),
    }),
  }),
  dkimSigning: z.object({
    enabled: z.boolean().default(false),
    domain: z.string().optional(),
    selector: z.string().optional(),
    privateKey: z.string().optional(),
  }),
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
});

// =======================================
// EMAIL SERVICE INTERFACES
// =======================================

export interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  providerMessageId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BulkEmailResponse {
  success: boolean;
  results: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  totalSent: number;
  totalFailed: number;
}

export interface EmailServiceInterface {
  sendEmail(message: EmailMessage): Promise<EmailServiceResponse>;
  sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse>;
  getDeliveryStatus(messageId: string): Promise<EmailStatus>;
  validateConfiguration(): Promise<boolean>;
  getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }>;
}

// =======================================
// UTILITY TYPES
// =======================================

export interface EmailValidationResult {
  isValid: boolean;
  email: string;
  reason?: string;
  suggestions?: string[];
}

export interface EmailPreview {
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: Record<string, any>;
}

export interface EmailDeliveryReport {
  messageId: string;
  recipient: string;
  status: EmailStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  provider: EmailProvider;
  cost?: number;
}

// =======================================
// EXPORT ALL TYPES
// =======================================

export type {
  EmailProvider,
  EmailProviderConfig,
  SMTPConfig,
  SESConfig,
  SendGridConfig,
  MailgunConfig,
  ResendConfig,
  PostmarkConfig,
  EmailRecipient,
  EmailAttachment,
  EmailTemplate,
  EmailMessage,
  EmailStatus,
  EmailEvent,
  EmailAnalytics,
  EmailCampaign,
  EmailSettings,
  EmailServiceResponse,
  BulkEmailResponse,
  EmailServiceInterface,
  EmailValidationResult,
  EmailPreview,
  EmailDeliveryReport,
};
