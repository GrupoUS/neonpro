/**
 * Healthcare Notification System Core
 * 
 * Comprehensive notification service with:
 * - Healthcare-specific notification channels
 * - LGPD-compliant patient communications
 * - Emergency and patient safety alerts
 * - Multi-modal delivery (email, SMS, push, in-app)
 * - Healthcare workflow integration
 * - Compliance and audit logging
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Notification priority levels for healthcare contexts
 */
export const NotificationPrioritySchema = z.enum([
  'low',        // General information, reminders
  'normal',     // Standard communications
  'high',       // Important updates, urgent reminders
  'urgent',     // Time-sensitive healthcare communications
  'critical',   // Patient safety concerns, immediate action required
  'emergency'   // Life-critical situations, immediate response required
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

/**
 * Healthcare-specific notification categories
 */
export const NotificationCategorySchema = z.enum([
  // Clinical notifications
  'appointment_reminder',
  'appointment_confirmation',
  'appointment_cancellation',
  'test_results_available',
  'prescription_ready',
  'medication_reminder',
  'vaccination_due',
  'screening_reminder',
  
  // Emergency and safety
  'patient_safety_alert',
  'emergency_notification',
  'adverse_event_report',
  'medical_device_alert',
  'infection_control_alert',
  
  // Administrative
  'insurance_update',
  'payment_reminder',
  'document_request',
  'policy_update',
  'system_maintenance',
  
  // Compliance and legal
  'consent_renewal',
  'privacy_policy_update',
  'lgpd_data_request',
  'audit_notification',
  'regulatory_update',
  
  // System notifications
  'system_alert',
  'performance_alert',
  'security_incident',
  'backup_notification',
  'integration_failure'
]);

export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

/**
 * Delivery channel types
 */
export const DeliveryChannelSchema = z.enum([
  'email',      // Email notifications
  'sms',        // SMS text messages
  'push',       // Mobile push notifications
  'in_app',     // In-application notifications
  'voice',      // Voice calls (for emergencies)
  'postal',     // Physical mail (for legal notices)
  'whatsapp',   // WhatsApp Business API
  'telegram'    // Telegram Bot API
]);

export type DeliveryChannel = z.infer<typeof DeliveryChannelSchema>;

/**
 * Notification status tracking
 */
export const NotificationStatusSchema = z.enum([
  'pending',     // Queued for delivery
  'processing',  // Being processed for delivery
  'sent',        // Successfully sent to delivery service
  'delivered',   // Confirmed delivery to recipient
  'read',        // Confirmed read by recipient
  'failed',      // Delivery failed
  'expired',     // Delivery window expired
  'cancelled'    // Cancelled before delivery
]);

export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

/**
 * Healthcare context for notifications
 */
export const HealthcareNotificationContextSchema = z.object({
  // Workflow context
  workflowType: z.enum([
    'patient_care',
    'appointment_management',
    'medication_management',
    'emergency_response',
    'diagnostic_process',
    'treatment_planning',
    'administrative_process',
    'compliance_process'
  ]).optional().describe('Healthcare workflow type'),
  
  workflowStage: z.string().optional().describe('Current workflow stage'),
  urgencyLevel: z.enum(['routine', 'urgent', 'critical', 'emergency']).optional().describe('Medical urgency'),
  
  // Patient context (LGPD-compliant)
  patientContext: z.object({
    anonymizedPatientId: z.string().optional().describe('LGPD-compliant patient ID'),
    ageGroup: z.enum(['pediatric', 'adult', 'geriatric']).optional().describe('Patient age group'),
    communicationPreferences: z.object({
      preferredLanguage: z.string().optional().describe('Patient preferred language'),
      preferredChannels: z.array(DeliveryChannelSchema).optional().describe('Preferred delivery channels'),
      accessibilityNeeds: z.array(z.string()).optional().describe('Accessibility requirements'),
      timeZone: z.string().optional().describe('Patient time zone')
    }).optional().describe('Patient communication preferences'),
    consentStatus: z.object({
      communicationConsent: z.boolean().describe('Consent for general communications'),
      marketingConsent: z.boolean().describe('Consent for marketing communications'),
      emergencyContact: z.boolean().describe('Consent for emergency communications'),
      dataProcessingConsent: z.boolean().describe('Consent for data processing'),
      thirdPartySharing: z.boolean().describe('Consent for third-party sharing')
    }).optional().describe('LGPD consent status')
  }).optional().describe('Patient-specific context'),
  
  // Professional context
  professionalContext: z.object({
    anonymizedProfessionalId: z.string().optional().describe('Healthcare professional ID'),
    role: z.string().optional().describe('Professional role'),
    department: z.string().optional().describe('Department or unit'),
    onCallStatus: z.boolean().optional().describe('Currently on-call'),
    escalationLevel: z.number().optional().describe('Escalation priority level')
  }).optional().describe('Healthcare professional context'),
  
  // Clinical context
  clinicalContext: z.object({
    facilityId: z.string().optional().describe('Healthcare facility ID'),
    serviceType: z.string().optional().describe('Type of medical service'),
    appointmentId: z.string().optional().describe('Related appointment ID'),
    treatmentId: z.string().optional().describe('Related treatment ID'),
    medicationId: z.string().optional().describe('Related medication ID'),
    protocolVersion: z.string().optional().describe('Clinical protocol version')
  }).optional().describe('Clinical context information')
});

export type HealthcareNotificationContext = z.infer<typeof HealthcareNotificationContextSchema>;

/**
 * LGPD compliance metadata for notifications
 */
export const LGPDNotificationComplianceSchema = z.object({
  // Data processing
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_interest',
    'legitimate_interests'
  ]).describe('LGPD legal basis for processing'),
  
  dataMinimization: z.boolean().describe('Data minimization applied'),
  purposeLimitation: z.string().describe('Specific purpose for data processing'),
  retentionPeriod: z.number().describe('Data retention period in days'),
  
  // Consent management
  consentId: z.string().optional().describe('Consent record ID'),
  consentTimestamp: z.string().datetime().optional().describe('When consent was given'),
  consentWithdrawalEnabled: z.boolean().describe('Whether consent can be withdrawn'),
  
  // Data rights
  dataSubjectRights: z.object({
    accessRight: z.boolean().describe('Right to access data'),
    rectificationRight: z.boolean().describe('Right to rectify data'),
    erasureRight: z.boolean().describe('Right to delete data'),
    portabilityRight: z.boolean().describe('Right to data portability'),
    objectionRight: z.boolean().describe('Right to object to processing')
  }).describe('Applicable data subject rights'),
  
  // Audit and tracking
  auditRequired: z.boolean().describe('Whether audit logging is required'),
  crossBorderTransfer: z.boolean().describe('Whether data crosses borders'),
  thirdPartySharing: z.boolean().describe('Whether data is shared with third parties'),
  
  // Privacy and security
  encryptionRequired: z.boolean().describe('Whether encryption is required'),
  anonymization: z.boolean().describe('Whether data is anonymized'),
  pseudonymization: z.boolean().describe('Whether data is pseudonymized')
});

export type LGPDNotificationCompliance = z.infer<typeof LGPDNotificationComplianceSchema>;

/**
 * Notification delivery attempt tracking
 */
export const DeliveryAttemptSchema = z.object({
  id: z.string().describe('Unique attempt ID'),
  channel: DeliveryChannelSchema.describe('Delivery channel used'),
  timestamp: z.string().datetime().describe('Attempt timestamp'),
  status: NotificationStatusSchema.describe('Delivery status'),
  errorCode: z.string().optional().describe('Error code if failed'),
  errorMessage: z.string().optional().describe('Error message if failed'),
  metadata: z.record(z.unknown()).optional().describe('Channel-specific metadata'),
  retryCount: z.number().default(0).describe('Number of retry attempts'),
  nextRetryAt: z.string().datetime().optional().describe('Next retry timestamp')
});

export type DeliveryAttempt = z.infer<typeof DeliveryAttemptSchema>;

/**
 * Core notification schema
 */
export const NotificationSchema = z.object({
  // Core identification
  id: z.string().describe('Unique notification ID'),
  correlationId: z.string().optional().describe('Correlation ID for related notifications'),
  
  // Content and delivery
  title: z.string().max(200).describe('Notification title'),
  message: z.string().max(2000).describe('Notification message content'),
  category: NotificationCategorySchema.describe('Notification category'),
  priority: NotificationPrioritySchema.describe('Priority level'),
  
  // Recipient information (LGPD-compliant)
  recipientId: z.string().describe('LGPD-compliant recipient identifier'),
  recipientType: z.enum(['patient', 'professional', 'admin', 'system']).describe('Recipient type'),
  
  // Delivery configuration
  channels: z.array(DeliveryChannelSchema).describe('Delivery channels to use'),
  preferredChannel: DeliveryChannelSchema.optional().describe('Preferred delivery channel'),
  deliveryWindow: z.object({
    startTime: z.string().datetime().describe('Earliest delivery time'),
    endTime: z.string().datetime().describe('Latest delivery time'),
    timeZone: z.string().describe('Recipient time zone')
  }).optional().describe('Delivery time window'),
  
  // Scheduling
  scheduledAt: z.string().datetime().optional().describe('Scheduled delivery time'),
  expiresAt: z.string().datetime().optional().describe('Expiration time'),
  
  // Content personalization
  template: z.string().optional().describe('Template identifier'),
  templateVariables: z.record(z.unknown()).optional().describe('Template variable values'),
  localization: z.object({
    language: z.string().describe('Content language'),
    region: z.string().optional().describe('Regional customization')
  }).optional().describe('Localization settings'),
  
  // Healthcare context
  healthcareContext: HealthcareNotificationContextSchema.optional().describe('Healthcare-specific context'),
  
  // Compliance and legal
  lgpdCompliance: LGPDNotificationComplianceSchema.describe('LGPD compliance metadata'),
  
  // Delivery tracking
  status: NotificationStatusSchema.describe('Current notification status'),
  deliveryAttempts: z.array(DeliveryAttemptSchema).describe('Delivery attempts'),
  
  // Metadata and tracking
  metadata: z.record(z.unknown()).optional().describe('Additional metadata'),
  tags: z.array(z.string()).optional().describe('Searchable tags'),
  
  // Timestamps
  createdAt: z.string().datetime().describe('Creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp'),
  sentAt: z.string().datetime().optional().describe('Sent timestamp'),
  deliveredAt: z.string().datetime().optional().describe('Delivery timestamp'),
  readAt: z.string().datetime().optional().describe('Read timestamp')
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Notification template schema
 */
export const NotificationTemplateSchema = z.object({
  id: z.string().describe('Template ID'),
  name: z.string().describe('Template name'),
  category: NotificationCategorySchema.describe('Template category'),
  
  // Multi-channel content
  content: z.object({
    email: z.object({
      subject: z.string().describe('Email subject template'),
      htmlBody: z.string().describe('HTML email body template'),
      textBody: z.string().describe('Plain text email body template')
    }).optional().describe('Email content templates'),
    
    sms: z.object({
      message: z.string().max(160).describe('SMS message template')
    }).optional().describe('SMS content template'),
    
    push: z.object({
      title: z.string().describe('Push notification title'),
      body: z.string().describe('Push notification body'),
      actionUrl: z.string().optional().describe('Action URL for push notification')
    }).optional().describe('Push notification template'),
    
    inApp: z.object({
      title: z.string().describe('In-app notification title'),
      message: z.string().describe('In-app notification message'),
      actionButton: z.string().optional().describe('Action button text'),
      actionUrl: z.string().optional().describe('Action URL')
    }).optional().describe('In-app notification template')
  }).describe('Multi-channel content templates'),
  
  // Template variables
  variables: z.array(z.object({
    name: z.string().describe('Variable name'),
    type: z.enum(['string', 'number', 'date', 'boolean']).describe('Variable type'),
    required: z.boolean().describe('Whether variable is required'),
    defaultValue: z.unknown().optional().describe('Default value if not provided')
  })).describe('Template variables'),
  
  // Localization support
  localizations: z.record(z.object({
    content: z.record(z.unknown()).describe('Localized content'),
    variables: z.record(z.string()).describe('Localized variable names')
  })).optional().describe('Localization mappings'),
  
  // Compliance settings
  lgpdCompliance: z.object({
    requiresConsent: z.boolean().describe('Whether template requires explicit consent'),
    dataProcessingPurpose: z.string().describe('Purpose of data processing'),
    retentionPeriod: z.number().describe('Data retention period in days')
  }).describe('LGPD compliance for template'),
  
  // Metadata
  isActive: z.boolean().describe('Whether template is active'),
  version: z.string().describe('Template version'),
  createdAt: z.string().datetime().describe('Creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp')
});

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;

/**
 * Notification queue configuration
 */
export const NotificationQueueConfigSchema = z.object({
  // Queue settings
  enabled: z.boolean().default(true).describe('Enable notification queue'),
  maxQueueSize: z.number().default(10000).describe('Maximum queue size'),
  batchSize: z.number().default(50).describe('Batch processing size'),
  processingInterval: z.number().default(5000).describe('Processing interval in milliseconds'),
  
  // Retry configuration
  retrySettings: z.object({
    maxRetries: z.number().default(3).describe('Maximum retry attempts'),
    retryDelay: z.number().default(60000).describe('Retry delay in milliseconds'),
    exponentialBackoff: z.boolean().default(true).describe('Use exponential backoff'),
    maxRetryDelay: z.number().default(3600000).describe('Maximum retry delay in milliseconds')
  }).describe('Retry configuration'),
  
  // Priority handling
  priorityQueues: z.object({
    emergency: z.number().default(1).describe('Emergency queue weight'),
    critical: z.number().default(2).describe('Critical queue weight'),
    urgent: z.number().default(5).describe('Urgent queue weight'),
    high: z.number().default(10).describe('High priority queue weight'),
    normal: z.number().default(20).describe('Normal priority queue weight'),
    low: z.number().default(50).describe('Low priority queue weight')
  }).describe('Priority queue weights'),
  
  // Channel limits
  channelLimits: z.object({
    email: z.number().default(100).describe('Email sends per minute'),
    sms: z.number().default(50).describe('SMS sends per minute'),
    push: z.number().default(500).describe('Push notifications per minute'),
    voice: z.number().default(10).describe('Voice calls per minute')
  }).describe('Channel rate limits'),
  
  // Healthcare settings
  healthcareSettings: z.object({
    emergencyBypass: z.boolean().default(true).describe('Bypass limits for emergencies'),
    patientSafetyPriority: z.boolean().default(true).describe('Prioritize patient safety notifications'),
    complianceLogging: z.boolean().default(true).describe('Enable compliance audit logging'),
    consentValidation: z.boolean().default(true).describe('Validate consent before sending')
  }).describe('Healthcare-specific settings')
});

export type NotificationQueueConfig = z.infer<typeof NotificationQueueConfigSchema>;

// ============================================================================
// NOTIFICATION SERVICE CLASS
// ============================================================================

/**
 * Healthcare-compliant notification service
 */
export class NotificationService {
  private config: NotificationQueueConfig;
  private notificationQueue: Map<NotificationPriority, Notification[]> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private processingTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: Partial<NotificationQueueConfig> = {}) {
    this.config = NotificationQueueConfigSchema.parse(config);
    
    // Initialize priority queues
    this.initializePriorityQueues();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the notification service
   */
  private initialize(): void {
    try {
      this.setupProcessingTimer();
      this.loadDefaultTemplates();
      this.isInitialized = true;
      
      console.log('📢 [NotificationService] Healthcare notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Initialize priority queues
   */
  private initializePriorityQueues(): void {
    const priorities: NotificationPriority[] = ['emergency', 'critical', 'urgent', 'high', 'normal', 'low'];
    priorities.forEach(priority => {
      this.notificationQueue.set(priority, []);
    });
  }

  /**
   * Setup processing timer
   */
  private setupProcessingTimer(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }
    
    this.processingTimer = setInterval(() => {
      this.processQueue();
    }, this.config.processingInterval);
  }

  /**
   * Load default notification templates
   */
  private loadDefaultTemplates(): void {
    // TODO: Load templates from database or configuration
    console.log('📄 [NotificationService] Loading default notification templates');
  }

  // ============================================================================
  // NOTIFICATION CREATION
  // ============================================================================

  /**
   * Create and queue a new notification
   */
  async createNotification(params: {
    title: string;
    message: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    recipientId: string;
    recipientType: 'patient' | 'professional' | 'admin' | 'system';
    channels: DeliveryChannel[];
    healthcareContext?: HealthcareNotificationContext;
    scheduledAt?: Date;
    expiresAt?: Date;
    template?: string;
    templateVariables?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    try {
      // Generate notification ID
      const id = `notif_${nanoid(12)}`;
      
      // Determine LGPD compliance
      const lgpdCompliance = this.determineLGPDCompliance(params);
      
      // Create notification object
      const notification: Notification = {
        id,
        title: params.title,
        message: params.message,
        category: params.category,
        priority: params.priority,
        recipientId: params.recipientId,
        recipientType: params.recipientType,
        channels: params.channels,
        status: 'pending',
        deliveryAttempts: [],
        healthcareContext: params.healthcareContext,
        lgpdCompliance,
        scheduledAt: params.scheduledAt?.toISOString(),
        expiresAt: params.expiresAt?.toISOString(),
        template: params.template,
        templateVariables: params.templateVariables,
        metadata: params.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Validate notification
      const validatedNotification = NotificationSchema.parse(notification);
      
      // Add to appropriate priority queue
      this.addToQueue(validatedNotification);
      
      console.log(`📢 [NotificationService] Created ${params.priority} notification: ${id}`);
      
      return validatedNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Create patient safety alert
   */
  async createPatientSafetyAlert(params: {
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patientId: string;
    healthcareContext: HealthcareNotificationContext;
    immediateDelivery?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const priority = params.severity === 'critical' ? 'emergency' : 
                    params.severity === 'high' ? 'critical' :
                    params.severity === 'medium' ? 'urgent' : 'high';
    
    const notification = await this.createNotification({
      title: `[PATIENT SAFETY] ${params.title}`,
      message: params.message,
      category: 'patient_safety_alert',
      priority,
      recipientId: params.patientId,
      recipientType: 'patient',
      channels: ['push', 'sms', 'email'], // Multi-channel for safety
      healthcareContext: params.healthcareContext,
      metadata: {
        ...params.metadata,
        patientSafetyAlert: true,
        severity: params.severity
      }
    });
    
    // Immediate processing for critical alerts
    if (params.immediateDelivery || params.severity === 'critical') {
      await this.processNotificationImmediately(notification.id);
    }
    
    return notification;
  }

  /**
   * Create emergency notification
   */
  async createEmergencyNotification(params: {
    title: string;
    message: string;
    recipientId: string;
    recipientType: 'patient' | 'professional' | 'admin';
    healthcareContext: HealthcareNotificationContext;
    escalationChain?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const notification = await this.createNotification({
      title: `[EMERGENCY] ${params.title}`,
      message: params.message,
      category: 'emergency_notification',
      priority: 'emergency',
      recipientId: params.recipientId,
      recipientType: params.recipientType,
      channels: ['voice', 'sms', 'push', 'email'], // All channels for emergencies
      healthcareContext: params.healthcareContext,
      metadata: {
        ...params.metadata,
        emergencyNotification: true,
        escalationChain: params.escalationChain
      }
    });
    
    // Immediate processing for emergencies
    await this.processNotificationImmediately(notification.id);
    
    return notification;
  }

  /**
   * Create medication reminder
   */
  async createMedicationReminder(params: {
    patientId: string;
    medicationName: string;
    dosage: string;
    scheduleTime: Date;
    healthcareContext: HealthcareNotificationContext;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    return this.createNotification({
      title: 'Medication Reminder',
      message: `Time to take your medication: ${params.medicationName} (${params.dosage})`,
      category: 'medication_reminder',
      priority: 'high',
      recipientId: params.patientId,
      recipientType: 'patient',
      channels: ['push', 'sms'],
      scheduledAt: params.scheduleTime,
      healthcareContext: params.healthcareContext,
      template: 'medication_reminder',
      templateVariables: {
        medicationName: params.medicationName,
        dosage: params.dosage,
        scheduleTime: params.scheduleTime.toISOString()
      },
      metadata: params.metadata
    });
  }

  /**
   * Create appointment reminder
   */
  async createAppointmentReminder(params: {
    patientId: string;
    appointmentDate: Date;
    doctorName: string;
    location: string;
    reminderType: '24h' | '2h' | '30min';
    healthcareContext: HealthcareNotificationContext;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const reminderTime = this.calculateReminderTime(params.appointmentDate, params.reminderType);
    
    return this.createNotification({
      title: 'Appointment Reminder',
      message: `You have an appointment with ${params.doctorName} at ${params.location}`,
      category: 'appointment_reminder',
      priority: 'normal',
      recipientId: params.patientId,
      recipientType: 'patient',
      channels: ['push', 'email'],
      scheduledAt: reminderTime,
      healthcareContext: params.healthcareContext,
      template: 'appointment_reminder',
      templateVariables: {
        appointmentDate: params.appointmentDate.toISOString(),
        doctorName: params.doctorName,
        location: params.location,
        reminderType: params.reminderType
      },
      metadata: params.metadata
    });
  }

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  /**
   * Add notification to appropriate priority queue
   */
  private addToQueue(notification: Notification): void {
    const queue = this.notificationQueue.get(notification.priority);
    if (!queue) {
      throw new Error(`Invalid priority: ${notification.priority}`);
    }
    
    queue.push(notification);
    
    // Check queue size limits
    if (queue.length > this.config.maxQueueSize) {
      console.warn(`Queue size limit exceeded for priority: ${notification.priority}`);
      // Remove oldest non-emergency notifications
      if (notification.priority !== 'emergency') {
        queue.shift();
      }
    }
  }

  /**
   * Process notification queue
   */
  private async processQueue(): Promise<void> {
    try {
      // Process queues by priority
      const priorities: NotificationPriority[] = ['emergency', 'critical', 'urgent', 'high', 'normal', 'low'];
      
      for (const priority of priorities) {
        const queue = this.notificationQueue.get(priority);
        if (!queue || queue.length === 0) continue;
        
        // Determine batch size based on priority
        const batchSize = this.getBatchSizeForPriority(priority);
        const batch = queue.splice(0, batchSize);
        
        // Process batch
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
    }
  }

  /**
   * Get batch size for priority level
   */
  private getBatchSizeForPriority(priority: NotificationPriority): number {
    const weights = this.config.priorityQueues;
    const baseBatchSize = this.config.batchSize;
    
    switch (priority) {
      case 'emergency': return Math.max(1, Math.floor(baseBatchSize / weights.emergency));
      case 'critical': return Math.max(1, Math.floor(baseBatchSize / weights.critical));
      case 'urgent': return Math.max(1, Math.floor(baseBatchSize / weights.urgent));
      case 'high': return Math.max(1, Math.floor(baseBatchSize / weights.high));
      case 'normal': return Math.max(1, Math.floor(baseBatchSize / weights.normal));
      case 'low': return Math.max(1, Math.floor(baseBatchSize / weights.low));
      default: return 1;
    }
  }

  /**
   * Process notification batch
   */
  private async processBatch(notifications: Notification[]): Promise<void> {
    const promises = notifications.map(notification => this.processNotification(notification));
    await Promise.allSettled(promises);
  }

  /**
   * Process individual notification
   */
  private async processNotification(notification: Notification): Promise<void> {
    try {
      // Check if scheduled for future delivery
      if (notification.scheduledAt && new Date(notification.scheduledAt) > new Date()) {
        // Re-queue for later
        this.addToQueue(notification);
        return;
      }
      
      // Check if expired
      if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) {
        await this.updateNotificationStatus(notification.id, 'expired');
        return;
      }
      
      // Validate consent if enabled in config
      if (this.config.healthcareSettings.consentValidation) {
        const hasConsent = await this.validateConsent(notification);
        if (!hasConsent) {
          await this.updateNotificationStatus(notification.id, 'cancelled');
          return;
        }
      }
      
      // Update status to processing
      await this.updateNotificationStatus(notification.id, 'processing');
      
      // Process each delivery channel
      for (const channel of notification.channels) {
        await this.deliverToChannel(notification, channel);
      }
      
    } catch (error) {
      console.error(`Failed to process notification ${notification.id}:`, error);
      await this.updateNotificationStatus(notification.id, 'failed');
    }
  }

  /**
   * Process notification immediately (bypass queue)
   */
  private async processNotificationImmediately(notificationId: string): Promise<void> {
    // Find notification in queues
    let notification: Notification | undefined;
    
    for (const [_priority, queue] of this.notificationQueue.entries()) {
      const index = queue.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notification = queue.splice(index, 1)[0];
        break;
      }
    }
    
    if (notification) {
      await this.processNotification(notification);
    }
  }

  // ============================================================================
  // DELIVERY CHANNELS
  // ============================================================================

  /**
   * Deliver notification to specific channel
   */
  private async deliverToChannel(notification: Notification, channel: DeliveryChannel): Promise<void> {
    const attemptId = `attempt_${nanoid(8)}`;
    const attempt: DeliveryAttempt = {
      id: attemptId,
      channel,
      timestamp: new Date().toISOString(),
      status: 'processing',
      retryCount: 0
    };
    
    try {
      // Add attempt to notification
      notification.deliveryAttempts.push(attempt);
      
      // Check channel rate limits
      if (!this.checkChannelRateLimit(channel, notification)) {
        attempt.status = 'failed';
        attempt.errorMessage = 'Rate limit exceeded';
        return;
      }
      
      // Deliver based on channel
      switch (channel) {
        case 'email':
          await this.deliverEmail(notification, attempt);
          break;
        case 'sms':
          await this.deliverSMS(notification, attempt);
          break;
        case 'push':
          await this.deliverPush(notification, attempt);
          break;
        case 'in_app':
          await this.deliverInApp(notification, attempt);
          break;
        case 'voice':
          await this.deliverVoice(notification, attempt);
          break;
        default:
          throw new Error(`Unsupported delivery channel: ${channel}`);
      }
      
      // Update attempt status
      attempt.status = 'sent';
      attempt.timestamp = new Date().toISOString();
      
    } catch (error) {
      attempt.status = 'failed';
      attempt.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Schedule retry if applicable
      if (attempt.retryCount < this.config.retrySettings.maxRetries) {
        this.scheduleRetry(notification, attempt);
      }
    }
  }

  /**
   * Deliver email notification (mock implementation)
   */
  private async deliverEmail(notification: Notification, _attempt: DeliveryAttempt): Promise<void> {
    console.log(`📧 [NotificationService] Delivering email notification: ${notification.id}`);
    // TODO: Implement actual email delivery
  }

  /**
   * Deliver SMS notification (mock implementation)
   */
  private async deliverSMS(notification: Notification, _attempt: DeliveryAttempt): Promise<void> {
    console.log(`📱 [NotificationService] Delivering SMS notification: ${notification.id}`);
    // TODO: Implement actual SMS delivery
  }

  /**
   * Deliver push notification (mock implementation)
   */
  private async deliverPush(notification: Notification, _attempt: DeliveryAttempt): Promise<void> {
    console.log(`🔔 [NotificationService] Delivering push notification: ${notification.id}`);
    // TODO: Implement actual push notification delivery
  }

  /**
   * Deliver in-app notification (mock implementation)
   */
  private async deliverInApp(notification: Notification, _attempt: DeliveryAttempt): Promise<void> {
    console.log(`💬 [NotificationService] Delivering in-app notification: ${notification.id}`);
    // TODO: Implement actual in-app notification delivery
  }

  /**
   * Deliver voice call (mock implementation)
   */
  private async deliverVoice(notification: Notification, _attempt: DeliveryAttempt): Promise<void> {
    console.log(`📞 [NotificationService] Delivering voice notification: ${notification.id}`);
    // TODO: Implement actual voice call delivery
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Determine LGPD compliance metadata
   */
  private determineLGPDCompliance(params: any): LGPDNotificationCompliance {
    // Default LGPD compliance for healthcare notifications
    return {
      legalBasis: 'legitimate_interests', // Healthcare notifications are legitimate interest
      dataMinimization: true,
      purposeLimitation: 'Healthcare communication and patient care',
      retentionPeriod: 365, // 1 year for healthcare records
      consentWithdrawalEnabled: true,
      dataSubjectRights: {
        accessRight: true,
        rectificationRight: true,
        erasureRight: true,
        portabilityRight: true,
        objectionRight: true
      },
      auditRequired: ['emergency', 'critical', 'patient_safety_alert'].includes(params.category),
      crossBorderTransfer: false,
      thirdPartySharing: false,
      encryptionRequired: true,
      anonymization: false,
      pseudonymization: true
    };
  }

  /**
   * Calculate reminder time based on appointment and reminder type
   */
  private calculateReminderTime(appointmentDate: Date, reminderType: string): Date {
    const reminder = new Date(appointmentDate);
    
    switch (reminderType) {
      case '24h':
        reminder.setHours(reminder.getHours() - 24);
        break;
      case '2h':
        reminder.setHours(reminder.getHours() - 2);
        break;
      case '30min':
        reminder.setMinutes(reminder.getMinutes() - 30);
        break;
    }
    
    return reminder;
  }

  /**
   * Check channel rate limits
   */
  private checkChannelRateLimit(_channel: DeliveryChannel, notification: Notification): boolean {
    // Emergency notifications bypass rate limits
    if (notification.priority === 'emergency' && this.config.healthcareSettings.emergencyBypass) {
      return true;
    }
    
    // TODO: Implement actual rate limiting logic
    return true;
  }

  /**
   * Validate consent for notification delivery
   */
  private async validateConsent(notification: Notification): Promise<boolean> {
    // Skip consent validation for emergency notifications
    if (notification.priority === 'emergency' || 
        notification.category === 'emergency_notification' ||
        notification.category === 'patient_safety_alert') {
      console.log(`🚨 [NotificationService] Emergency notification - bypassing consent check: ${notification.id}`);
      return true;
    }
    
    // Check user's consent status for this notification category
    const consentStatus = notification.healthcareContext?.patientContext?.consentStatus;
    
    if (!consentStatus) {
      console.warn(`⚠️ [NotificationService] No consent data available for notification: ${notification.id}`);
      return false;
    }
    
    // Validate based on notification category
    let hasConsent = false;
    
    switch (notification.category) {
      case 'appointment_reminder':
      case 'appointment_confirmation':
      case 'appointment_cancellation':
      case 'test_results_available':
      case 'prescription_ready':
      case 'medication_reminder':
        hasConsent = consentStatus.communicationConsent;
        break;
        
      case 'insurance_update':
      case 'payment_reminder':
        hasConsent = consentStatus.communicationConsent;
        break;
        
      case 'policy_update':
      case 'consent_renewal':
      case 'privacy_policy_update':
      case 'lgpd_data_request':
        hasConsent = consentStatus.dataProcessingConsent;
        break;
        
      default:
        hasConsent = false;
    }
    
    console.log(`🔒 [NotificationService] Consent validation for ${notification.id}: ${hasConsent ? 'Granted' : 'Denied'}`);
    return hasConsent;
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(notificationId: string, status: NotificationStatus): Promise<void> {
    console.log(`📊 [NotificationService] Updating notification ${notificationId} status to: ${status}`);
    // TODO: Implement actual status update persistence
  }

  /**
   * Schedule retry for failed delivery
   */
  private scheduleRetry(notification: Notification, attempt: DeliveryAttempt): void {
    const retryDelay = this.calculateRetryDelay(attempt.retryCount);
    const nextRetry = new Date(Date.now() + retryDelay);
    
    attempt.nextRetryAt = nextRetry.toISOString();
    attempt.retryCount++;
    
    console.log(`🔄 [NotificationService] Scheduling retry for notification ${notification.id} at ${nextRetry.toISOString()}`);
    
    // TODO: Implement actual retry scheduling
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    if (!this.config.retrySettings.exponentialBackoff) {
      return this.config.retrySettings.retryDelay;
    }
    
    const delay = this.config.retrySettings.retryDelay * Math.pow(2, retryCount);
    return Math.min(delay, this.config.retrySettings.maxRetryDelay);
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    queueSizes: Record<NotificationPriority, number>;
    totalQueued: number;
    isInitialized: boolean;
    config: NotificationQueueConfig;
  } {
    const queueSizes: Record<NotificationPriority, number> = {} as any;
    let totalQueued = 0;
    
    for (const [priority, queue] of this.notificationQueue.entries()) {
      queueSizes[priority] = queue.length;
      totalQueued += queue.length;
    }
    
    return {
      queueSizes,
      totalQueued,
      isInitialized: this.isInitialized,
      config: this.config
    };
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    // Clear processing timer
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }
    
    // Clear queues
    this.notificationQueue.clear();
    this.templates.clear();
    
    this.isInitialized = false;
    
    console.log('🔄 [NotificationService] Notification service destroyed and resources cleaned up');
  }
}

// ============================================================================
// DEFAULT SERVICE INSTANCE
// ============================================================================

/**
 * Default notification service instance with healthcare-optimized settings
 */
export const notificationService = new NotificationService({
  enabled: true,
  maxQueueSize: 5000, // Larger queue for healthcare
  batchSize: 25, // Smaller batches for better control
  processingInterval: 3000, // 3 seconds for faster processing
  
  retrySettings: {
    maxRetries: 5, // More retries for healthcare
    retryDelay: 30000, // 30 seconds
    exponentialBackoff: true,
    maxRetryDelay: 1800000 // 30 minutes max
  },
  
  priorityQueues: {
    emergency: 1,   // Highest priority
    critical: 2,    // Very high priority
    urgent: 3,      // High priority
    high: 5,        // Above normal
    normal: 10,     // Standard
    low: 20         // Lowest priority
  },
  
  channelLimits: {
    email: 200,     // Higher limit for healthcare
    sms: 100,       // Higher limit for urgent communications
    push: 1000,     // High limit for immediate notifications
    voice: 20       // Limited for emergency use
  },
  
  healthcareSettings: {
    emergencyBypass: true,
    patientSafetyPriority: true,
    complianceLogging: true,
    consentValidation: true
  }
});