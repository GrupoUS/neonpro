/**
 * Webhook & Event System Types
 * Story 7.3: Webhook & Event System Implementation
 * 
 * This module defines comprehensive types for the webhook and event system:
 * - Event definitions and schemas
 * - Webhook configuration and management
 * - Retry logic and failure handling
 * - Event filtering and routing
 * - Subscription management
 * - Security and authentication
 */

// Event System Types
export type EventType = 
  | 'patient.created'
  | 'patient.updated'
  | 'patient.deleted'
  | 'appointment.scheduled'
  | 'appointment.confirmed'
  | 'appointment.cancelled'
  | 'appointment.completed'
  | 'appointment.no_show'
  | 'treatment.started'
  | 'treatment.completed'
  | 'treatment.cancelled'
  | 'invoice.generated'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'payment.received'
  | 'payment.failed'
  | 'payment.refunded'
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'clinic.updated'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'system.backup_completed'
  | 'system.maintenance_started'
  | 'system.maintenance_completed'
  | 'custom.event'

export type EventPriority = 'low' | 'normal' | 'high' | 'critical'
export type EventStatus = 'pending' | 'processing' | 'delivered' | 'failed' | 'cancelled'
export type WebhookStatus = 'active' | 'inactive' | 'suspended' | 'failed'
export type RetryStrategy = 'exponential' | 'linear' | 'fixed' | 'custom'

// Base Event Interface
export interface BaseEvent {
  id: string
  type: EventType
  version: string
  timestamp: Date
  source: string
  priority: EventPriority
  metadata: {
    clinicId: string
    userId?: string
    sessionId?: string
    requestId?: string
    correlationId?: string
    environment: 'development' | 'staging' | 'production'
    region?: string
  }
  data: Record<string, any>
  context?: {
    userAgent?: string
    ipAddress?: string
    location?: {
      country?: string
      region?: string
      city?: string
    }
    device?: {
      type: 'desktop' | 'mobile' | 'tablet'
      os?: string
      browser?: string
    }
  }
}

// Specific Event Types
export interface PatientEvent extends BaseEvent {
  type: 'patient.created' | 'patient.updated' | 'patient.deleted'
  data: {
    patientId: string
    patientData?: {
      name: string
      email?: string
      phone?: string
      cpf?: string
      birthDate?: string
      address?: any
    }
    changes?: {
      field: string
      oldValue: any
      newValue: any
    }[]
  }
}

export interface AppointmentEvent extends BaseEvent {
  type: 'appointment.scheduled' | 'appointment.confirmed' | 'appointment.cancelled' | 'appointment.completed' | 'appointment.no_show'
  data: {
    appointmentId: string
    patientId: string
    providerId: string
    serviceId: string
    scheduledAt: Date
    duration: number
    status: string
    reason?: string
    notes?: string
  }
}

export interface PaymentEvent extends BaseEvent {
  type: 'payment.received' | 'payment.failed' | 'payment.refunded'
  data: {
    paymentId: string
    invoiceId: string
    patientId: string
    amount: number
    currency: string
    method: string
    gateway: string
    transactionId?: string
    status: string
    failureReason?: string
  }
}

export interface InvoiceEvent extends BaseEvent {
  type: 'invoice.generated' | 'invoice.sent' | 'invoice.paid' | 'invoice.overdue'
  data: {
    invoiceId: string
    invoiceNumber: string
    patientId: string
    amount: number
    currency: string
    dueDate: Date
    status: string
    services: {
      id: string
      name: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }[]
  }
}

// Webhook Configuration
export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  description?: string
  status: WebhookStatus
  events: EventType[]
  filters?: {
    clinicIds?: string[]
    userIds?: string[]
    conditions?: {
      field: string
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
      value: any
    }[]
  }
  headers?: Record<string, string>
  authentication?: {
    type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'hmac_signature'
    config: {
      apiKey?: string
      token?: string
      username?: string
      password?: string
      secret?: string
      algorithm?: 'sha256' | 'sha512'
    }
  }
  retryConfig: {
    strategy: RetryStrategy
    maxAttempts: number
    initialDelay: number
    maxDelay: number
    backoffMultiplier?: number
    customDelays?: number[]
  }
  timeout: number
  rateLimit?: {
    requestsPerSecond: number
    burstLimit: number
  }
  metadata: {
    clinicId: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    lastTriggered?: Date
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
  }
}

// Event Delivery
export interface EventDelivery {
  id: string
  eventId: string
  webhookId: string
  attempt: number
  status: EventStatus
  requestData: {
    url: string
    method: 'POST' | 'PUT' | 'PATCH'
    headers: Record<string, string>
    body: string
    timestamp: Date
  }
  responseData?: {
    statusCode: number
    headers: Record<string, string>
    body: string
    duration: number
    timestamp: Date
  }
  error?: {
    type: 'network' | 'timeout' | 'authentication' | 'server_error' | 'client_error'
    message: string
    details?: any
  }
  nextRetryAt?: Date
  completedAt?: Date
  metadata: {
    clinicId: string
    correlationId: string
    processingTime: number
  }
}

// Event Subscription
export interface EventSubscription {
  id: string
  name: string
  description?: string
  clinicId: string
  userId: string
  events: EventType[]
  filters?: {
    conditions: {
      field: string
      operator: string
      value: any
    }[]
    logic: 'AND' | 'OR'
  }
  destinations: {
    type: 'webhook' | 'email' | 'sms' | 'push' | 'internal'
    config: {
      webhookId?: string
      email?: string
      phone?: string
      pushToken?: string
      internalHandler?: string
    }
  }[]
  isActive: boolean
  metadata: {
    createdAt: Date
    updatedAt: Date
    lastTriggered?: Date
    totalEvents: number
    successfulDeliveries: number
    failedDeliveries: number
  }
}

// Event Queue
export interface EventQueueItem {
  id: string
  event: BaseEvent
  webhookIds: string[]
  priority: EventPriority
  scheduledAt: Date
  attempts: number
  maxAttempts: number
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  processingStartedAt?: Date
  completedAt?: Date
  error?: {
    message: string
    details?: any
  }
}

// Event Analytics
export interface EventAnalytics {
  period: {
    startDate: Date
    endDate: Date
  }
  totalEvents: number
  eventsByType: Record<EventType, number>
  eventsByPriority: Record<EventPriority, number>
  eventsByStatus: Record<EventStatus, number>
  deliveryMetrics: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    averageDeliveryTime: number
    deliverySuccessRate: number
  }
  webhookMetrics: {
    totalWebhooks: number
    activeWebhooks: number
    averageResponseTime: number
    topPerformingWebhooks: {
      webhookId: string
      name: string
      successRate: number
      averageResponseTime: number
    }[]
    failingWebhooks: {
      webhookId: string
      name: string
      failureRate: number
      lastError: string
    }[]
  }
  errorAnalysis: {
    totalErrors: number
    errorsByType: Record<string, number>
    commonErrors: {
      error: string
      count: number
      percentage: number
    }[]
  }
  performanceMetrics: {
    averageProcessingTime: number
    queueDepth: number
    throughputPerSecond: number
    peakLoad: {
      timestamp: Date
      eventsPerSecond: number
    }
  }
}

// Configuration Interfaces
export interface WebhookSystemConfig {
  queue: {
    maxSize: number
    processingConcurrency: number
    batchSize: number
    processingInterval: number
  }
  delivery: {
    defaultTimeout: number
    maxRetries: number
    defaultRetryStrategy: RetryStrategy
    rateLimitDefault: {
      requestsPerSecond: number
      burstLimit: number
    }
  }
  security: {
    requireAuthentication: boolean
    allowedOrigins: string[]
    signatureValidation: boolean
    encryptPayloads: boolean
  }
  monitoring: {
    enableMetrics: boolean
    enableLogging: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    metricsRetentionDays: number
  }
  performance: {
    enableCaching: boolean
    cacheTimeout: number
    enableCompression: boolean
    maxPayloadSize: number
  }
}

// Event Handler Interface
export interface EventHandler {
  eventType: EventType
  handler: (event: BaseEvent) => Promise<void>
  priority: number
  async: boolean
}

// Webhook Validation
export interface WebhookValidationResult {
  isValid: boolean
  errors: {
    field: string
    message: string
    code: string
  }[]
  warnings: {
    field: string
    message: string
    code: string
  }[]
}

// Event Filter
export interface EventFilter {
  id: string
  name: string
  description?: string
  conditions: {
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
    value: any
  }[]
  logic: 'AND' | 'OR'
  isActive: boolean
}

// Event Template
export interface EventTemplate {
  id: string
  name: string
  description?: string
  eventType: EventType
  template: {
    subject?: string
    body: string
    format: 'json' | 'xml' | 'form' | 'custom'
    variables: {
      name: string
      type: 'string' | 'number' | 'boolean' | 'date' | 'object'
      required: boolean
      defaultValue?: any
    }[]
  }
  metadata: {
    clinicId: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    usageCount: number
  }
}

// Export all types
export type {
  BaseEvent,
  PatientEvent,
  AppointmentEvent,
  PaymentEvent,
  InvoiceEvent,
  WebhookEndpoint,
  EventDelivery,
  EventSubscription,
  EventQueueItem,
  EventAnalytics,
  WebhookSystemConfig,
  EventHandler,
  WebhookValidationResult,
  EventFilter,
  EventTemplate
}
