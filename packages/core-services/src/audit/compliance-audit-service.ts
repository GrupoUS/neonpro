// Generic Compliance Audit Service (Phase 4)
// Complements existing AuditService with generic action/actor audit logging

import type {
  GenericAuditEvent,
  ConsentReference,
  ComplianceFramework,
  ComplianceReport,
  AuditSearchFilters,
  ComplianceViolation,
  RiskLevel,
  ComplianceStatus,
  AuditAction,
  ActorType,
} from "./types";
import { ComplianceValidator } from "./validators";

export interface ComplianceAuditConfig {
  /** Default frameworks to apply */
  defaultFrameworks: ComplianceFramework[];
  /** Auto-validate events on creation */
  autoValidate: boolean;
  /** Store events in database */
  persistEvents: boolean;
  /** Maximum events to keep in memory */
  maxMemoryEvents: number;
}

/**
 * Generic Compliance Audit Service
 * Provides action/actor audit logging with healthcare compliance validation
 * Complements the existing domain-specific AuditService
 */
export class ComplianceAuditService {
  private config: ComplianceAuditConfig;
  private events: Map<string, GenericAuditEvent> = new Map();
  private violations: Map<string, ComplianceViolation[]> = new Map();

  constructor(config?: Partial<ComplianceAuditConfig>) {
    this.config = {
      defaultFrameworks: ["LGPD", "ANVISA", "CFM"],
      autoValidate: true,
      persistEvents: false, // In-memory by default for Phase 4
      maxMemoryEvents: 1000,
      ...config,
    };
  }

  /**
   * Log a generic audit event with compliance validation
   */
  async logEvent(params: {
    action: AuditAction;
    actor: {
      id: string;
      type: ActorType;
      name?: string;
      email?: string;
      _role?: string;
    };
    resource: {
      type: string;
      id: string;
      name?: string;
      category?: string;
    };
    clinicId: string;
    consentRef?: ConsentReference;
    frameworks?: ComplianceFramework[];
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<GenericAuditEvent> {
    const auditEvent: GenericAuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      action: params.action,
      actor: params.actor,
      timestamp: new Date().toISOString(),
      resource: params.resource,
      clinicId: params.clinicId,
      consentRef: params.consentRef,
      riskLevel: "LOW", // Will be updated by validation
      complianceStatus: "UNKNOWN", // Will be updated by validation
      metadata: params.metadata,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      frameworks: params.frameworks || this.config.defaultFrameworks,
    };

    // Auto-validate if enabled
    if (this.config.autoValidate) {
      const validation = ComplianceValidator.validateEvent(auditEvent);
      auditEvent.complianceStatus = validation.complianceStatus;
      auditEvent.riskLevel = validation.riskLevel;

      if (validation.violations.length > 0) {
        this.violations.set(auditEvent.id, validation.violations);
      }
    }

    // Store in memory
    this.events.set(auditEvent.id, auditEvent);

    // Cleanup old events if over limit
    this.cleanupOldEvents();

    return auditEvent;
  }

  /**
   * Log data access event
   */
  async logDataAccess(params: {
    actorId: string;
    actorType: ActorType;
    resourceType: string;
    resourceId: string;
    clinicId: string;
    consentRef?: ConsentReference;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<GenericAuditEvent> {
    return this.logEvent({
      action: "READ",
      actor: { id: params.actorId, type: params.actorType },
      resource: { type: params.resourceType, id: params.resourceId },
      clinicId: params.clinicId,
      consentRef: params.consentRef,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
    });
  }

  /**
   * Log consent grant event
   */
  async logConsentGrant(params: {
    patientId: string;
    consentRef: ConsentReference;
    clinicId: string;
    grantedBy?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<GenericAuditEvent> {
    return this.logEvent({
      action: "CONSENT_GRANT",
      actor: {
        id: params.grantedBy || params.patientId,
        type: params.grantedBy ? "ADMIN" : "PATIENT",
      },
      resource: {
        type: "consent",
        id: params.consentRef.id,
        category: params.consentRef.type,
      },
      clinicId: params.clinicId,
      consentRef: params.consentRef,
      metadata: { ...params.metadata, patientId: params.patientId },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Log consent revocation event
   */
  async logConsentRevoke(params: {
    patientId: string;
    consentRef: ConsentReference;
    clinicId: string;
    revokedBy?: string;
    reason?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<GenericAuditEvent> {
    return this.logEvent({
      action: "CONSENT_REVOKE",
      actor: {
        id: params.revokedBy || params.patientId,
        type: params.revokedBy ? "ADMIN" : "PATIENT",
      },
      resource: {
        type: "consent",
        id: params.consentRef.id,
        category: params.consentRef.type,
      },
      clinicId: params.clinicId,
      consentRef: params.consentRef,
      metadata: {
        ...params.metadata,
        patientId: params.patientId,
        reason: params.reason,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Log medical action (prescription, diagnosis)
   */
  async logMedicalAction(params: {
    action: "PRESCRIBE" | "DIAGNOSE";
    doctorId: string;
    patientId: string;
    resourceId: string;
    clinicId: string;
    consentRef?: ConsentReference;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<GenericAuditEvent> {
    return this.logEvent({
      action: params.action,
      actor: {
        id: params.doctorId,
        type: "DOCTOR",
        name: params.metadata?.doctorName,
        email: params.metadata?.doctorEmail,
      },
      resource: {
        type: params.action.toLowerCase(),
        id: params.resourceId,
        category: "medical",
      },
      clinicId: params.clinicId,
      consentRef: params.consentRef,
      metadata: {
        ...params.metadata,
        patientId: params.patientId,
      },
      frameworks: ["LGPD", "ANVISA", "CFM"], // All frameworks for medical actions
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
    });
  }

  /**
   * Search audit events
   */
  async searchEvents(
    clinicId: string,
    filters?: AuditSearchFilters,
    limit: number = 100,
  ): Promise<GenericAuditEvent[]> {
    let results = Array.from(this.events.values()).filter((event) => event.clinicId === clinicId);

    if (filters) {
      if (filters.action) {
        results = results.filter((e) => e.action === filters.action);
      }
      if (filters.actorType) {
        results = results.filter((e) => e.actor.type === filters.actorType);
      }
      if (filters.actorId) {
        results = results.filter((e) => e.actor.id === filters.actorId);
      }
      if (filters.resourceType) {
        results = results.filter((e) => e.resource.type === filters.resourceType,
        );
      }
      if (filters.resourceId) {
        results = results.filter((e) => e.resource.id === filters.resourceId);
      }
      if (filters.riskLevel) {
        results = results.filter((e) => e.riskLevel === filters.riskLevel);
      }
      if (filters.complianceStatus) {
        results = results.filter((e) => e.complianceStatus === filters.complianceStatus,
        );
      }
      if (filters.framework) {
        results = results.filter((e) =>
          e.frameworks.includes(filters.framework!),
        );
      }
      if (filters.startDate) {
        results = results.filter((e) => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        results = results.filter((e) => e.timestamp <= filters.endDate!);
      }
      if (filters.sessionId) {
        results = results.filter((e) => e.sessionId === filters.sessionId);
      }
      if (filters.consentRefId) {
        results = results.filter((e) => e.consentRef?.id === filters.consentRefId,
        );
      }
    }

    // Sort by timestamp (newest first) and limit
    return results
      .sort((a,_b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get compliance violations for events
   */
  getViolations(eventIds?: string[]): ComplianceViolation[] {
    if (eventIds) {
      return eventIds.map((id) => this.violations.get(id) || []).flat();
    }

    return Array.from(this.violations.values()).flat();
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    clinicId: string,
    startDate: string,
    endDate: string,
    frameworks?: ComplianceFramework[],
  ): Promise<ComplianceReport> {
    const events = await this.searchEvents(clinicId, {
      startDate,
      endDate,
      framework: frameworks?.[0], // Simple filter for single framework
    });

    const filteredEvents = frameworks
      ? events.filter((e) => frameworks.some((f) => e.frameworks.includes(f)))
      : events;

    const totalEvents = filteredEvents.length;

    // Count by compliance status
    const statusBreakdown: Record<ComplianceStatus, number> = {
      COMPLIANT: 0,
      NON_COMPLIANT: 0,
      PENDING_REVIEW: 0,
      UNKNOWN: 0,
    };

    // Count by risk level
    const riskBreakdown: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    filteredEvents.forEach((event) => {
      statusBreakdown[event.complianceStatus]++;
      riskBreakdown[event.riskLevel]++;
    });

    // Collect violations
    const eventIds = filteredEvents.map((e) => e.id);
    const violations = this.getViolations(eventIds);

    // Calculate compliance score
    const compliantEvents = statusBreakdown.COMPLIANT;
    const complianceScore =
      totalEvents > 0 ? Math.round((compliantEvents / totalEvents) * 100) : 100;

    return {
      period: { start: startDate, end: endDate },
      clinicId,
      totalEvents,
      statusBreakdown,
      riskBreakdown,
      violations,
      complianceScore,
      frameworks: frameworks || this.config.defaultFrameworks,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate existing event
   */
  validateEvent(eventId: string): {
    complianceStatus: ComplianceStatus;
    violations: ComplianceViolation[];
    riskLevel: RiskLevel;
  } | null {
    const event = this.events.get(eventId);
    if (!event) return null;

    const validation = ComplianceValidator.validateEvent(event);

    // Update stored event
    event.complianceStatus = validation.complianceStatus;
    event.riskLevel = validation.riskLevel;

    // Update violations
    if (validation.violations.length > 0) {
      this.violations.set(eventId, validation.violations);
    } else {
      this.violations.delete(eventId);
    }

    return validation;
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): GenericAuditEvent | undefined {
    return this.events.get(eventId);
  }

  /**
   * Get events for session
   */
  getSessionEvents(sessionId: string, clinicId: string): GenericAuditEvent[] {
    return Array.from(this.events.values())
      .filter((event) => event.sessionId === sessionId && event.clinicId === clinicId,
      )
      .sort((a,_b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  /**
   * Clean up old events to stay within memory limit
   */
  private cleanupOldEvents(): void {
    if (this.events.size <= this.config.maxMemoryEvents) return;

    const events = Array.from(this.events.entries()).sort(([,_a],_[,_b]) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Keep only the most recent events
    const toRemove = events.slice(this.config.maxMemoryEvents);

    // Clear old events and violations
    toRemove.forEach(([id]) => {
      this.events.delete(id);
      this.violations.delete(id);
    });
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEvents: number;
    eventsWithViolations: number;
    riskDistribution: Record<RiskLevel, number>;
    complianceDistribution: Record<ComplianceStatus, number>;
  } {
    const events = Array.from(this.events.values());
    const totalEvents = events.length;
    const eventsWithViolations = Array.from(this.violations.keys()).length;

    const riskDistribution: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    const complianceDistribution: Record<ComplianceStatus, number> = {
      COMPLIANT: 0,
      NON_COMPLIANT: 0,
      PENDING_REVIEW: 0,
      UNKNOWN: 0,
    };

    events.forEach((event) => {
      riskDistribution[event.riskLevel]++;
      complianceDistribution[event.complianceStatus]++;
    });

    return {
      totalEvents,
      eventsWithViolations,
      riskDistribution,
      complianceDistribution,
    };
  }
}
