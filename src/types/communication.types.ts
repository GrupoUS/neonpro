// Communication and Notification Types
export type NotificationType = 
  | 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMATION' | 'APPOINTMENT_CANCELLED'
  | 'TREATMENT_REMINDER' | 'BILLING_REMINDER' | 'PAYMENT_CONFIRMATION'
  | 'EMERGENCY_ALERT' | 'SYSTEM_UPDATE' | 'CONSENT_EXPIRY' | 'COMPLIANCE_ALERT'

export type NotificationChannel = 
  | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH_NOTIFICATION' | 'SYSTEM_ALERT'

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export type CommunicationChannel = 
  | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE_CALL' | 'PUSH_NOTIFICATION' | 'IN_APP'

export interface Notification {
  id: string
  userId?: string
  patientId?: string
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  title: string
  message: string
  actionUrl?: string
  scheduledFor?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  recipientEmail?: string
  recipientPhone?: string
  externalId?: string
  consentRequired: boolean
  lgpdBasis?: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationLog {
  id: string
  patientId?: string
  userId?: string
  channel: CommunicationChannel
  messageType: string
  subject?: string
  content: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  failureReason?: string
  externalId?: string
  consentBased: boolean
  retentionExpires?: string
  createdAt: string
}

export interface MessageTemplate {
  id: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  content: string
  variables: string[] // e.g., ['{patientName}', '{appointmentDate}']
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  pushEnabled: boolean
  appointmentReminders: boolean
  billingReminders: boolean
  marketingMessages: boolean
  emergencyAlerts: boolean
  preferredLanguage: string
  timezone: string
  updatedAt: string
}

export interface BulkMessage {
  id: string
  name: string
  type: NotificationType
  channel: CommunicationChannel
  subject?: string
  content: string
  targetAudience: 'all_patients' | 'active_patients' | 'specific_group'
  filters?: any
  totalRecipients: number
  successfulSends: number
  failedSends: number
  scheduledFor?: string
  sentAt?: string
  createdBy: string
  createdAt: string
}