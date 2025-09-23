/**
 * Base domain event interface
 */
export interface DomainEvent {
  id: string;
  timestamp: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  metadata?: Record<string, any>;
}

/**
 * Patient domain events
 */
export interface PatientCreatedEvent extends DomainEvent {
  eventType: "PatientCreated";
  aggregateType: "Patient";
  data: {
    patientId: string;
    clinicId: string;
    name: string;
    email?: string;
    phone?: string;
    createdBy: string;
  };
}

export interface PatientUpdatedEvent extends DomainEvent {
  eventType: "PatientUpdated";
  aggregateType: "Patient";
  data: {
    patientId: string;
    updatedFields: string[];
    updatedBy: string;
  };
}

export interface PatientDeletedEvent extends DomainEvent {
  eventType: "PatientDeleted";
  aggregateType: "Patient";
  data: {
    patientId: string;
    deletedBy: string;
    reason?: string;
  };
}

export interface PatientAnonymizedEvent extends DomainEvent {
  eventType: "PatientAnonymized";
  aggregateType: "Patient";
  data: {
    patientId: string;
    anonymizedBy: string;
    reason: "gdpr_request" | "data_retention" | "other";
  };
}

/**
 * Appointment domain events
 */
export interface AppointmentCreatedEvent extends DomainEvent {
  eventType: "AppointmentCreated";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    createdBy: string;
  };
}

export interface AppointmentUpdatedEvent extends DomainEvent {
  eventType: "AppointmentUpdated";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    updatedFields: string[];
    updatedBy: string;
  };
}

export interface AppointmentCancelledEvent extends DomainEvent {
  eventType: "AppointmentCancelled";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    cancelledBy: string;
    reason: string;
    cancelledAt: string;
  };
}

export interface AppointmentRescheduledEvent extends DomainEvent {
  eventType: "AppointmentRescheduled";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    previousStartTime: string;
    previousEndTime: string;
    newStartTime: string;
    newEndTime: string;
    rescheduledBy: string;
  };
}

export interface AppointmentCompletedEvent extends DomainEvent {
  eventType: "AppointmentCompleted";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    completedBy: string;
    duration: number;
    notes?: string;
    diagnosis?: string;
    treatment?: string;
  };
}

export interface AppointmentNoShowEvent extends DomainEvent {
  eventType: "AppointmentNoShow";
  aggregateType: "Appointment";
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    recordedBy: string;
    reason?: string;
  };
}

/**
 * Consent domain events
 */
export interface ConsentCreatedEvent extends DomainEvent {
  eventType: "ConsentCreated";
  aggregateType: "Consent";
  data: {
    consentId: string;
    patientId: string;
    consentType: string;
    purpose: string;
    dataTypes: string[];
    grantedBy: string;
    grantedAt: string;
    expiresAt?: string;
  };
}

export interface ConsentGrantedEvent extends DomainEvent {
  eventType: "ConsentGranted";
  aggregateType: "Consent";
  data: {
    consentId: string;
    patientId: string;
    grantedBy: string;
    grantedAt: string;
  };
}

export interface ConsentRevokedEvent extends DomainEvent {
  eventType: "ConsentRevoked";
  aggregateType: "Consent";
  data: {
    consentId: string;
    patientId: string;
    revokedBy: string;
    revokedAt: string;
    reason?: string;
  };
}

export interface ConsentExpiredEvent extends DomainEvent {
  eventType: "ConsentExpired";
  aggregateType: "Consent";
  data: {
    consentId: string;
    patientId: string;
    expiredAt: string;
    autoProcessed: boolean;
  };
}

export interface ConsentRenewedEvent extends DomainEvent {
  eventType: "ConsentRenewed";
  aggregateType: "Consent";
  data: {
    consentId: string;
    patientId: string;
    renewedBy: string;
    renewedAt: string;
    previousExpiration: string;
    newExpiration: string;
  };
}

export interface ComplianceCheckedEvent extends DomainEvent {
  eventType: "ComplianceChecked";
  aggregateType: "Patient";
  data: {
    patientId: string;
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIALLY_COMPLIANT";
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    violationCount: number;
    checkedBy: string;
    checkedAt: string;
  };
}

export interface ComplianceViolationEvent extends DomainEvent {
  eventType: "ComplianceViolation";
  aggregateType: "Patient";
  data: {
    patientId: string;
    violationType: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    detectedAt: string;
    detectedBy: string;
  };
}

/**
 * Event dispatcher interface
 */
export interface DomainEventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchBatch(events: DomainEvent[]): Promise<void>;
}

/**
 * Event handler interface
 */
export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Event bus interface
 */
export interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>,
  ): Promise<void>;
  unsubscribe(
    eventType: string,
    handler: DomainEventHandler<DomainEvent>,
  ): Promise<void>;
}

/**
 * Event store interface
 */
export interface DomainEventStore {
  save(event: DomainEvent): Promise<void>;
  saveBatch(events: DomainEvent[]): Promise<void>;
  findByAggregateId(aggregateId: string): Promise<DomainEvent[]>;
  findByEventType(eventType: string): Promise<DomainEvent[]>;
  findByDateRange(startDate: string, endDate: string): Promise<DomainEvent[]>;
}

/**
 * Event utilities
 */
export class EventFactory {
  private static counter = 0;

  static createEventId(): string {
    return `event_${Date.now()}_${++EventFactory.counter}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createTimestamp(): string {
    return new Date().toISOString();
  }

  static createEvent<T extends DomainEvent>(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    data: T extends { data: infer D } ? D : never,
    metadata?: Record<string, any>,
  ): T {
    return {
      id: this.createEventId(),
      timestamp: this.createTimestamp(),
      eventType,
      aggregateId,
      aggregateType,
      version: 1,
      metadata: {
        ...metadata,
        data,
      },
    } as unknown as T;
  }
}
