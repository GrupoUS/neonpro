/**
 * AG-UI Protocol Extensions for Appointment Operations
 *
 * Extends the AG-UI Protocol with appointment-specific message types and operations
 * for intelligent scheduling, real-time availability, and automated workflows.
 *
 * Features:
 * - Appointment-specific message types
 * - Real-time availability updates
 * - Scheduling operations
 * - Reminder notifications
 * - No-show prediction events
 * - Resource optimization messages
 */

export interface AGUIAppointmentMessage {
  id: string;
  type: AGUIAppointmentMessageType;
  timestamp: Date;
  source: 'system' | 'user' | 'ai' | 'professional';
  clinicId: string;
  data: any;
  metadata?: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requiresConfirmation: boolean;
    expiresAt?: Date;
    relatedAppointmentId?: string;
    patientId?: string;
    professionalId?: string;
  };
}

export type AGUIAppointmentMessageType =
  // Scheduling Operations
  | 'appointment.requested'
  | 'appointment.scheduled'
  | 'appointment.confirmed'
  | 'appointment.rescheduled'
  | 'appointment.cancelled'
  | 'appointment.completed'
  | 'appointment.no_show'
  // Availability Management
  | 'availability.updated'
  | 'availability.query'
  | 'availability.conflict_detected'
  | 'slot.optimized'
  | 'resource.allocated'
  // AI Predictions and Analysis
  | 'no_show.predicted'
  | 'no_show.risk_updated'
  | 'optimization.suggested'
  | 'efficiency.analyzed'
  | 'bottleneck.detected'
  // Reminder and Communication
  | 'reminder.scheduled'
  | 'reminder.sent'
  | 'reminder.failed'
  | 'communication.delivered'
  | 'feedback.collected'
  // Real-time Updates
  | 'status.changed'
  | 'location.updated'
  | 'professional.assigned'
  | 'room.assigned'
  | 'equipment.assigned'
  // System Events
  | 'system.sync_completed'
  | 'system.error'
  | 'compliance.checked'
  | 'backup.completed';

export interface AppointmentRequestedData {
  patientId: string;
  serviceTypeId: string;
  preferredDates: DateRange[];
  preferredProfessionals: string[];
  duration: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  accessibility: string[];
  specialRequirements?: string[];
}

export interface AppointmentScheduledData {
  appointmentId: string;
  patientId: string;
  professionalId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  noShowRiskScore: number;
  optimizationScore: number;
  aiRecommendations: string[];
}

export interface AvailabilityUpdatedData {
  professionalId: string;
  date: Date;
  availableSlots: TimeSlot[];
  utilization: number;
  efficiency: number;
}

export interface NoShowPredictedData {
  appointmentId: string;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
  preventionActions: string[];
  modelVersion: string;
}

export interface SlotOptimizedData {
  originalSlot: TimeSlot;
  optimizedSlot: TimeSlot;
  improvementReason: string;
  efficiencyGain: number;
  conflictResolution: boolean;
}

export interface ReminderScheduledData {
  appointmentId: string;
  reminderType: 'email' | 'sms' | 'whatsapp';
  scheduledTime: Date;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AvailabilityConflictData {
  type: 'professional' | 'room' | 'equipment';
  resourceId: string;
  conflictingAppointments: string[];
  suggestedResolution: 'reschedule' | 'extend_hours' | 'add_resource';
  severity: 'low' | 'medium' | 'high';
}

// Helper types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ResourceUtilization {
  professionals: number;
  rooms: number;
  equipment: number;
  overall: number;
}

export class AGUIAppointmentProtocol {
  private static instance: AGUIAppointmentProtocol;
  private messageHandlers: Map<AGUIAppointmentMessageType, Function[]> = new Map();
  private eventBus: EventTarget;

  private constructor() {
    this.eventBus = new EventTarget();
    this.setupDefaultHandlers();
  }

  static getInstance(): AGUIAppointmentProtocol {
    if (!AGUIAppointmentProtocol.instance) {
      AGUIAppointmentProtocol.instance = new AGUIAppointmentProtocol();
    }
    return AGUIAppointmentProtocol.instance;
  }

  /**
   * Send an appointment-related message through the protocol
   */
  async sendMessage(message: AGUIAppointmentMessage): Promise<void> {
    try {
      // Validate message
      this.validateMessage(message);

      // Add timestamp if not present
      if (!message.timestamp) {
        message.timestamp = new Date();
      }

      // Dispatch to event bus
      const event = new CustomEvent(message.type, {
        detail: message,
      });
      this.eventBus.dispatchEvent(event);

      // Call registered handlers
      const handlers = this.messageHandlers.get(message.type) || [];
      for (const handler of handlers) {
        try {
          await handler(message);
        } catch {
          console.error(`Error in handler for ${message.type}:`, error);
        }
      }

      // Log for compliance and debugging
      await this.logMessage(message);
    } catch {
      console.error('Error sending AG-UI message:', error);
      throw error;
    }
  }

  /**
   * Register a handler for specific message types
   */
  on(messageType: AGUIAppointmentMessageType, handler: Function): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Remove a handler for specific message types
   */
  off(messageType: AGUIAppointmentMessageType, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Send appointment request message
   */
  async sendAppointmentRequest(
    clinicId: string,
    data: AppointmentRequestedData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'appointment.requested',
      timestamp: new Date(),
      source: 'user',
      clinicId,
      data,
      metadata: {
        priority: data.urgency,
        requiresConfirmation: true,
        patientId: data.patientId,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send appointment scheduled message
   */
  async sendAppointmentScheduled(
    clinicId: string,
    data: AppointmentScheduledData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'appointment.scheduled',
      timestamp: new Date(),
      source: 'system',
      clinicId,
      data,
      metadata: {
        priority: 'medium',
        requiresConfirmation: false,
        relatedAppointmentId: data.appointmentId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send availability update message
   */
  async sendAvailabilityUpdate(
    clinicId: string,
    data: AvailabilityUpdatedData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'availability.updated',
      timestamp: new Date(),
      source: 'system',
      clinicId,
      data,
      metadata: {
        priority: 'medium',
        requiresConfirmation: false,
        professionalId: data.professionalId,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send no-show prediction message
   */
  async sendNoShowPrediction(
    clinicId: string,
    data: NoShowPredictedData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'no_show.predicted',
      timestamp: new Date(),
      source: 'ai',
      clinicId,
      data,
      metadata: {
        priority: data.riskScore > 70 ? 'high' : data.riskScore > 40 ? 'medium' : 'low',
        requiresConfirmation: false,
        relatedAppointmentId: data.appointmentId,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send slot optimization message
   */
  async sendSlotOptimized(
    clinicId: string,
    data: SlotOptimizedData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'slot.optimized',
      timestamp: new Date(),
      source: 'ai',
      clinicId,
      data,
      metadata: {
        priority: 'medium',
        requiresConfirmation: false,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send reminder scheduled message
   */
  async sendReminderScheduled(
    clinicId: string,
    data: ReminderScheduledData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'reminder.scheduled',
      timestamp: new Date(),
      source: 'system',
      clinicId,
      data,
      metadata: {
        priority: data.priority,
        requiresConfirmation: false,
        relatedAppointmentId: data.appointmentId,
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Send availability conflict message
   */
  async sendAvailabilityConflict(
    clinicId: string,
    data: AvailabilityConflictData,
    metadata?: Partial<AGUIAppointmentMessage['metadata']>,
  ): Promise<void> {
    const message: AGUIAppointmentMessage = {
      id: this.generateMessageId(),
      type: 'availability.conflict_detected',
      timestamp: new Date(),
      source: 'system',
      clinicId,
      data,
      metadata: {
        priority: data.severity,
        requiresConfirmation: data.severity === 'high',
        ...metadata,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Query availability for a specific professional
   */
  async queryAvailability(
    clinicId: string,
    professionalId: string,
    dateRange: DateRange,
  ): Promise<AvailabilityUpdatedData> {
    return new Promise((resolve, reject) => {
      const message: AGUIAppointmentMessage = {
        id: this.generateMessageId(),
        type: 'availability.query',
        timestamp: new Date(),
        source: 'system',
        clinicId,
        data: {
          professionalId,
          dateRange,
          queryType: 'professional_availability',
        },
        metadata: {
          priority: 'medium',
          requiresConfirmation: false,
          professionalId,
        },
      };

      // Set up response handler
      const timeout = setTimeout(() => {
        this.off('availability.updated', responseHandler);
        reject(new Error('Availability query timeout'));
      }, 10000);

      const responseHandler = (msg: AGUIAppointmentMessage) => {
        if (msg.data.professionalId === professionalId) {
          clearTimeout(timeout);
          this.off('availability.updated', responseHandler);
          resolve(msg.data);
        }
      };

      this.on('availability.updated', responseHandler);
      this.sendMessage(message);
    });
  }

  /**
   * Request optimization for a specific time slot
   */
  async requestSlotOptimization(
    clinicId: string,
    slot: TimeSlot,
    constraints: {
      patientId?: string;
      serviceType?: string;
      preferredProfessionals?: string[];
      duration?: number;
    },
  ): Promise<SlotOptimizedData> {
    return new Promise((resolve, reject) => {
      const message: AGUIAppointmentMessage = {
        id: this.generateMessageId(),
        type: 'optimization.suggested',
        timestamp: new Date(),
        source: 'user',
        clinicId,
        data: {
          originalSlot: slot,
          constraints,
          requestType: 'slot_optimization',
        },
        metadata: {
          priority: 'medium',
          requiresConfirmation: false,
          patientId: constraints.patientId,
        },
      };

      // Set up response handler
      const timeout = setTimeout(() => {
        this.off('slot.optimized', responseHandler);
        reject(new Error('Slot optimization timeout'));
      }, 15000);

      const responseHandler = (msg: AGUIAppointmentMessage) => {
        if (msg.data.originalSlot.start.getTime() === slot.start.getTime()) {
          clearTimeout(timeout);
          this.off('slot.optimized', responseHandler);
          resolve(msg.data);
        }
      };

      this.on('slot.optimized', responseHandler);
      this.sendMessage(message);
    });
  }

  // Private helper methods
  private validateMessage(message: AGUIAppointmentMessage): void {
    if (!message.id) {
      throw new Error('Message ID is required');
    }
    if (!message.type) {
      throw new Error('Message type is required');
    }
    if (!message.clinicId) {
      throw new Error('Clinic ID is required');
    }
    if (!message.data) {
      throw new Error('Message data is required');
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logMessage(message: AGUIAppointmentMessage): Promise<void> {
    // Log message for compliance and debugging
    console.log(`[AG-UI Protocol] ${message.type}:`, {
      id: message.id,
      clinicId: message.clinicId,
      timestamp: message.timestamp,
      source: message.source,
      metadata: message.metadata,
    });

    // Here you would typically log to a database or external service
    // This is important for LGPD compliance and audit trails
  }

  private setupDefaultHandlers(): void {
    // Handler for system errors
    this.on('system.error', async (message: AGUIAppointmentMessage) => {
      console.error('System error:', message.data);

      // Send alert to administrators
      // This would integrate with your notification system
    });

    // Handler for compliance checks
    this.on('compliance.checked', async (message: AGUIAppointmentMessage) => {
      console.log('Compliance check completed:', message.data);

      // Log compliance status for audit purposes
      // This is critical for LGPD compliance
    });

    // Handler for real-time updates
    this.on('status.changed', async (message: AGUIAppointmentMessage) => {
      console.log('Status changed:', message.data);

      // Update real-time displays and notifications
      // This would integrate with your WebSocket system
    });
  }

  /**
   * Get protocol statistics and health
   */
  getStats(): {
    registeredHandlers: number;
    messageTypes: string[];
    uptime: number;
  } {
    return {
      registeredHandlers: Array.from(this.messageHandlers.values())
        .reduce((sum, handlers) => sum + handlers.length, 0),
      messageTypes: Array.from(this.messageHandlers.keys()),
      uptime: process.uptime(), // This would be replaced with actual uptime tracking
    };
  }

  /**
   * Clean up resources and handlers
   */
  destroy(): void {
    this.messageHandlers.clear();
    // Clean up event listeners
    this.eventBus = new EventTarget();
  }
}

// Export singleton instance
export const aguiAppointmentProtocol = AGUIAppointmentProtocol.getInstance();
