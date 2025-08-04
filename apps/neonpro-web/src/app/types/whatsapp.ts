// WhatsApp Business API Integration Types
// Based on Meta's WhatsApp Cloud API documentation
// For NeonPro clinic management system

export interface WhatsAppConfig {
  id?: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessName: string;
  businessDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id?: string;
  patientId?: string;
  phoneNumber: string;
  messageType: WhatsAppMessageType;
  templateName?: string;
  content: string;
  mediaUrl?: string;
  status: WhatsAppMessageStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum WhatsAppMessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  CONTACT = 'contact',
  INTERACTIVE = 'interactive'
}

export enum WhatsAppMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface WhatsAppTemplate {
  id?: string;
  name: string;
  category: WhatsAppTemplateCategory;
  language: string;
  status: WhatsAppTemplateStatus;
  components: WhatsAppTemplateComponent[];
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum WhatsAppTemplateCategory {
  AUTHENTICATION = 'authentication',
  MARKETING = 'marketing',
  UTILITY = 'utility'
}

export enum WhatsAppTemplateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED'
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  text?: string;
  buttons?: WhatsAppTemplateButton[];
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
}

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

// WhatsApp API Request/Response Types
export interface SendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: string;
  text?: {
    preview_url: boolean;
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    id?: string;
    caption?: string;
    filename?: string;
  };
}

export interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// NeonPro specific integration types
export interface PatientWhatsAppNotification {
  patientId: string;
  notificationType: 'appointment_reminder' | 'appointment_confirmation' | 'treatment_followup' | 'payment_reminder' | 'welcome_message';
  scheduleTime?: Date;
  templateName: string;
  templateParams: Record<string, string>;
  priority: 'low' | 'medium' | 'high';
}

export interface WhatsAppAnalytics {
  id?: string;
  date: Date;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  templatesByCategory: Record<WhatsAppTemplateCategory, number>;
  costBRL: number;
  createdAt: Date;
}

export interface WhatsAppOptIn {
  id?: string;
  patientId: string;
  phoneNumber: string;
  isOptedIn: boolean;
  optInSource: 'registration' | 'website' | 'qr_code' | 'sms' | 'manual';
  optInDate?: Date;
  optOutDate?: Date;
  consentMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Form schemas for configuration
export interface WhatsAppConfigForm {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessName: string;
  businessDescription?: string;
  isActive: boolean;
}

export interface WhatsAppTemplateForm {
  name: string;
  category: WhatsAppTemplateCategory;
  language: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  isActive: boolean;
}

export interface SendBulkMessageForm {
  templateId: string;
  recipientType: 'all_patients' | 'selected_patients' | 'custom_list';
  selectedPatients?: string[];
  customPhoneNumbers?: string[];
  templateParams?: Record<string, string>;
  scheduleTime?: Date;
}