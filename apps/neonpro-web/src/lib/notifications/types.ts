// Notification Types
// Generated for NeonPro - FASE 4

export enum NotificationType {
  ALERT = "alert",
  REMINDER = "reminder",
  SYSTEM = "system",
  APPOINTMENT = "appointment",
  MARKETING = "marketing",
  COMPLIANCE = "compliance",
  SECURITY = "security",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
  WHATSAPP = "whatsapp",
  PHONE = "phone",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  READ = "read",
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  content: string;
  channels: NotificationChannel[];
}

export interface NotificationRequest {
  templateId: string;
  recipientId: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  scheduledAt?: Date;
  data?: Record<string, any>;
}
export enum DeliveryStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  BOUNCED = "bounced",
  OPENED = "opened",
  CLICKED = "clicked",
}
