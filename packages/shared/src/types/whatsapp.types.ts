/**
 * WhatsApp Business API Types for NeonPro Healthcare
 * TypeScript type definitions for WhatsApp integration
 * Healthcare compliance: LGPD + Message audit logging
 */

// Base WhatsApp message types
export interface WhatsappMessage {
  id: string;
  whatsappMessageId: string;
  clinicId: string;
  patientId?: string;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  messageType: "text" | "image" | "document" | "audio" | "video" | "template";
  content: string;
  status: "sent" | "delivered" | "read" | "failed" | "pending";
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp conversation types
export interface WhatsappConversation {
  id: string;
  clinicId: string;
  patientId?: string;
  phoneNumber: string;
  contactName?: string;
  status: "active" | "closed" | "archived";
  lastMessageAt?: Date;
  messageCount: number;
  unreadCount: number;
  assignedTo?: string; // Professional ID
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp API webhook types
export interface WhatsappWebhookVerification {
  "hub.mode": "subscribe";
  "hub.challenge": string;
  "hub.verify_token": string;
}

export interface WhatsappContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsappTextMessage {
  body: string;
}

export interface WhatsappMediaMessage {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
  filename?: string; // for documents
  voice?: boolean; // for audio
}

export interface WhatsappIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: WhatsappTextMessage;
  image?: WhatsappMediaMessage;
  document?: WhatsappMediaMessage;
  audio?: WhatsappMediaMessage;
  video?: WhatsappMediaMessage;
  type: "text" | "image" | "document" | "audio" | "video";
}

export interface WhatsappMessageStatusUpdate {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export interface WhatsappWebhookValue {
  messaging_product: "whatsapp";
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsappContact[];
  messages?: WhatsappIncomingMessage[];
  statuses?: WhatsappMessageStatusUpdate[];
}

export interface WhatsappWebhookChange {
  value: WhatsappWebhookValue;
  field: "messages";
}

export interface WhatsappWebhookEntry {
  id: string;
  changes: WhatsappWebhookChange[];
}

export interface WhatsappIncomingWebhook {
  object: "whatsapp_business_account";
  entry: WhatsappWebhookEntry[];
}

// Send message types
export interface SendWhatsappMessageRequest {
  to: string;
  message: string;
  type?: "text" | "template";
  clinicId: string;
  patientId?: string;
  messageType?:
    | "appointment_reminder"
    | "appointment_confirmation"
    | "general"
    | "emergency"
    | "marketing"
    | "follow_up"
    | "treatment_info";
  templateName?: string;
  templateParams?: string[];
  scheduledFor?: Date;
}

export interface SendWhatsappMessageResponse {
  messageId: string;
  status: "success" | "error";
  timestamp: string;
  error?: string;
}

// WhatsApp template types
export interface WhatsappTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: WhatsappTemplateButton[];
}

export interface WhatsappTemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
  components: WhatsappTemplateComponent[];
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp configuration types
export interface WhatsappBusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: WhatsappBusinessHourSchedule[];
}

export interface WhatsappBusinessHourSchedule {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  start: string; // HH:MM format
  end: string; // HH:MM format
  enabled: boolean;
}

export interface WhatsappConfig {
  id: string;
  clinicId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  accessToken: string;
  verifyToken: string;
  webhookUrl: string;
  businessAccountId: string;
  isActive: boolean;
  autoReply: boolean;
  autoReplyMessage?: string;
  businessHours?: WhatsappBusinessHours;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp analytics types
export interface WhatsappAnalytics {
  id: string;
  clinicId: string;
  date: Date;
  messagesSent: number;
  messagesReceived: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  conversationsStarted: number;
  conversationsClosed: number;
  averageResponseTime?: number; // in minutes
  patientSatisfactionScore?: number; // 0-10 scale
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface WhatsappApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface WhatsappMessageListResponse {
  messages: WhatsappMessage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WhatsappConversationListResponse {
  conversations: WhatsappConversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error types
export interface WhatsappError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Event types for real-time updates
export interface WhatsappMessageEvent {
  type: "message_received" | "message_sent" | "message_status_updated";
  conversationId: string;
  message: WhatsappMessage;
  clinicId: string;
  timestamp: Date;
}

export interface WhatsappConversationEvent {
  type: "conversation_created" | "conversation_updated" | "conversation_closed";
  conversation: WhatsappConversation;
  clinicId: string;
  timestamp: Date;
}

// Utility types
export type WhatsappMessageDirection = "inbound" | "outbound";
export type WhatsappMessageType = "text" | "image" | "document" | "audio" | "video" | "template";
export type WhatsappMessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";
export type WhatsappConversationStatus = "active" | "closed" | "archived";
export type WhatsappTemplateStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
export type WhatsappTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

// Filter and query types
export interface WhatsappMessageFilters {
  clinicId?: string;
  patientId?: string;
  phoneNumber?: string;
  direction?: WhatsappMessageDirection;
  messageType?: WhatsappMessageType;
  status?: WhatsappMessageStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface WhatsappConversationFilters {
  clinicId?: string;
  patientId?: string;
  phoneNumber?: string;
  status?: WhatsappConversationStatus;
  assignedTo?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface WhatsappPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
