/**
 * Real-time Notification Model (T036)
 * Comprehensive notification system for Brazilian healthcare
 *
 * Features:
 * - Multi-channel notifications (email, SMS, WhatsApp, push)
 * - Brazilian healthcare context and compliance
 * - Priority levels and delivery tracking
 * - Template management with Portuguese localization
 * - LGPD consent integration
 * - Real-time delivery status and metrics
 */

// Notification types
export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  MEDICATION_REMINDER = 'medication_reminder',
  TEST_RESULT = 'test_result',
  EMERGENCY_ALERT = 'emergency_alert',
  SYSTEM_NOTIFICATION = 'system_notification',
  MARKETING = 'marketing',
  HEALTH_TIP = 'health_tip',
  PAYMENT_REMINDER = 'payment_reminder',
}

// Notification channels
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  PUSH = 'push',
  IN_APP = 'in_app',
  VOICE = 'voice',
}

// Priority levels
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

// Notification status
export enum NotificationStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Channel configuration
export interface ChannelConfig {
  enabled: boolean
  number?: string // for SMS/WhatsApp
  address?: string // for email
  deviceToken?: string // for push notifications
  settings?: Record<string, any>
}

// Notification preferences
export interface NotificationPreferences {
  _userId: string
  channels: {
    whatsapp: ChannelConfig
    sms: ChannelConfig
    email: ChannelConfig
    push: ChannelConfig
    inApp: ChannelConfig
  }
  types: Record<string, string[]> // notification type -> preferred channels
  quietHours?: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
    timezone: string
  }
  language: 'pt-BR' | 'en-US'
  lgpdConsent: boolean
  marketingConsent?: boolean
}

// Notification template
export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType | string
  language: 'pt-BR' | 'en-US'
  channels: string[]
  templates: {
    whatsapp?: string
    sms?: string
    email?: {
      subject: string
      body: string
      html?: string
    }
    push?: {
      title: string
      body: string
      icon?: string
    }
    inApp?: {
      title: string
      body: string
      action?: string
    }
  }
  variables: string[]
  healthcareCompliant: boolean
  lgpdCompliant?: boolean
}

// Delivery status tracking
export interface DeliveryStatus {
  notificationId: string
  channel: NotificationChannel | string
  status: NotificationStatus | string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failedAt?: Date
  attempts: number
  errorMessage?: string | null
  providerId?: string // external provider message ID
  cost?: number
  metadata?: Record<string, any>
}

// Main notification interface
export interface Notification {
  id: string
  recipientId: string
  recipientType?: 'patient' | 'doctor' | 'staff' | 'admin'

  // Content
  type: NotificationType | string
  channel: NotificationChannel | string
  title: string
  message: string
  data?: Record<string, any> // additional data payload

  // Scheduling and priority
  priority: NotificationPriority | string
  status: NotificationStatus | string
  scheduledFor?: Date
  expiresAt?: Date

  // Template and localization
  templateId?: string
  language?: 'pt-BR' | 'en-US'
  variables?: Record<string, any>

  // Delivery tracking
  deliveryStatus?: DeliveryStatus[]
  attempts?: number
  lastAttemptAt?: Date
  nextRetryAt?: Date

  // Healthcare compliance
  healthcareContext?: boolean
  lgpdConsent?: boolean
  encryptionEnabled?: boolean
  auditTrail?: boolean

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string

  // LGPD compliance
  accessLog?: Array<{
    _userId: string
    action: string
    timestamp: Date
    ipAddress?: string
  }>
}

// Validate notification
export function validateNotification(
  notification: Partial<Notification>,
): boolean {
  if (!notification.recipientId || notification.recipientId.trim() === '') {
    return false
  }

  if (
    !notification.type ||
    !Object.values(NotificationType).includes(
      notification.type as NotificationType,
    )
  ) {
    return false
  }

  if (
    !notification.channel ||
    !Object.values(NotificationChannel).includes(
      notification.channel as NotificationChannel,
    )
  ) {
    return false
  }

  if (!notification.title || notification.title.trim() === '') {
    return false
  }

  if (!notification.message || notification.message.trim() === '') {
    return false
  }

  return true
}

// Schedule notification
export function scheduleNotification(
  notification: Partial<Notification>,
  scheduledFor: Date,
): Partial<Notification> {
  return {
    ...notification,
    status: NotificationStatus.SCHEDULED,
    scheduledFor,
    updatedAt: new Date(),
  }
}

// Create multi-channel notification
export function createMultiChannelNotification(
  baseNotification: Partial<Notification>,
  channels: string[],
): Partial<Notification>[] {
  return channels.map(channel => ({
    ...baseNotification,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channel,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
}

// Anonymize notification for LGPD compliance
export function anonymizeNotification(
  notification: Partial<Notification>,
): Partial<Notification> {
  const anonymized = { ...notification }

  if (anonymized.title) {
    anonymized.title = `NOTIFICAÇÃO ANONIMIZADA - ${Date.now()}`
  }

  if (anonymized.message) {
    anonymized.message = `MENSAGEM ANONIMIZADA - ${Date.now()}`
  }

  if (anonymized.data) {
    const anonymizedData: Record<string, any> = {}
    Object.keys(anonymized.data).forEach(key => {
      if (key.includes('name') || key.includes('Name')) {
        anonymizedData[key] = `PACIENTE_ANON_${Date.now()}`
      } else if (key.includes('phone') || key.includes('Phone')) {
        anonymizedData[key] = '(**) *****-****'
      } else if (key.includes('email') || key.includes('Email')) {
        anonymizedData[key] = `anon_${Date.now()}@anonymized.com`
      } else {
        anonymizedData[key] = `DADO_ANONIMIZADO_${Date.now()}`
      }
    })
    anonymized.data = anonymizedData
  }

  return anonymized
}

// Retry notification
export function retryNotification(
  notification: Partial<Notification>,
): Partial<Notification> {
  const now = new Date()
  const nextRetry = new Date(
    now.getTime() + Math.pow(2, notification.attempts || 0) * 60000,
  ) // Exponential backoff

  return {
    ...notification,
    status: NotificationStatus.PENDING,
    attempts: (notification.attempts || 0) + 1,
    lastAttemptAt: now,
    nextRetryAt: nextRetry,
    updatedAt: now,
  }
}

// Calculate notification metrics
export function calculateNotificationMetrics(
  notifications: Partial<Notification>[],
): {
  totalSent: number
  deliveryRate: number
  readRate: number
  failureRate: number
  totalCost: number
  byChannel: Record<string, number>
  byStatus: Record<string, number>
} {
  const metrics = {
    totalSent: notifications.length,
    deliveryRate: 0,
    readRate: 0,
    failureRate: 0,
    totalCost: 0,
    byChannel: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  }

  let delivered = 0
  let read = 0
  let failed = 0

  notifications.forEach(notification => {
    // Count by channel
    if (notification.channel) {
      metrics.byChannel[notification.channel] = (metrics.byChannel[notification.channel] || 0) + 1
    }

    // Count by status
    if (notification.status) {
      metrics.byStatus[notification.status] = (metrics.byStatus[notification.status] || 0) + 1

      if (
        notification.status === NotificationStatus.DELIVERED ||
        notification.status === NotificationStatus.READ
      ) {
        delivered++
      }

      if (notification.status === NotificationStatus.READ) {
        read++
      }

      if (notification.status === NotificationStatus.FAILED) {
        failed++
      }
    }

    // Sum costs from delivery status
    if (notification.deliveryStatus) {
      notification.deliveryStatus.forEach(delivery => {
        if (delivery.cost) {
          metrics.totalCost += delivery.cost
        }
      })
    }
  })

  if (notifications.length > 0) {
    metrics.deliveryRate = delivered / notifications.length
    metrics.readRate = read / notifications.length
    metrics.failureRate = failed / notifications.length
  }

  return metrics
}

// Validate healthcare compliance
export function validateHealthcareCompliance(
  notification: Partial<Notification>,
): boolean {
  // Check LGPD consent for healthcare notifications
  if (notification.healthcareContext && !notification.lgpdConsent) {
    return false
  }

  // Marketing notifications require explicit consent
  if (
    notification.type === NotificationType.MARKETING &&
    !notification.lgpdConsent
  ) {
    return false
  }

  // Healthcare notifications should have encryption enabled
  if (notification.healthcareContext && !notification.encryptionEnabled) {
    return false
  }

  // Audit trail should be enabled for healthcare notifications
  if (notification.healthcareContext && !notification.auditTrail) {
    return false
  }

  return true
}

// Create notification with defaults
export function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
): Notification {
  const now = new Date()

  return {
    ...data,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: NotificationStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  }
}

// Get notifications by recipient
export function getNotificationsByRecipient(
  notifications: Notification[],
  recipientId: string,
): Notification[] {
  return notifications
    .filter(notification => notification.recipientId === recipientId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Get notifications by type
export function getNotificationsByType(
  notifications: Notification[],
  type: NotificationType,
): Notification[] {
  return notifications.filter(notification => notification.type === type)
}

// Get pending notifications
export function getPendingNotifications(
  notifications: Notification[],
): Notification[] {
  return notifications.filter(
    notification =>
      notification.status === NotificationStatus.PENDING ||
      notification.status === NotificationStatus.SCHEDULED,
  )
}

// Get failed notifications for retry
export function getFailedNotifications(
  notifications: Notification[],
): Notification[] {
  return notifications.filter(
    notification =>
      notification.status === NotificationStatus.FAILED &&
      (notification.attempts || 0) < 3, // Max 3 retry attempts
  )
}

// Check if notification should be sent now
export function shouldSendNotification(
  notification: Notification,
  preferences?: NotificationPreferences,
): boolean {
  // Check if scheduled time has passed
  if (notification.scheduledFor && notification.scheduledFor > new Date()) {
    return false
  }

  // Check if expired
  if (notification.expiresAt && notification.expiresAt < new Date()) {
    return false
  }

  // Check quiet hours
  if (preferences?.quietHours?.enabled) {
    const now = new Date()
    const currentTime = now.toTimeString().substring(0, 5) // HH:MM format

    const { start, end } = preferences.quietHours
    if (start <= end) {
      // Same day range
      if (currentTime >= start && currentTime <= end) {
        return false
      }
    } else {
      // Cross-midnight range
      if (currentTime >= start || currentTime <= end) {
        return false
      }
    }
  }

  return true
}
