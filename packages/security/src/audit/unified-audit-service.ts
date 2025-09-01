/**
 * Unified Audit Service for NeonPro Aesthetic Clinic Platform
 * Consolidates audit functionality from compliance, security, and audit-trail packages
 *
 * Features:
 * - Healthcare compliance (LGPD appropriate for aesthetic clinics)
 * - Cryptographic integrity with hash chains
 * - Performance optimization with batching
 * - Aesthetic clinic specific event types
 * - Constitutional governance integration
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

// Audit event types for aesthetic clinic operations
export const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: "auth.login.success",
  LOGIN_FAILURE: "auth.login.failure",
  LOGOUT: "auth.logout",
  PASSWORD_CHANGE: "auth.password.change",

  // Patient data access (aesthetic clinic context)
  PATIENT_CREATE: "patient.create",
  PATIENT_READ: "patient.read",
  PATIENT_UPDATE: "patient.update",
  PATIENT_DELETE: "patient.delete",
  PATIENT_EXPORT: "patient.export",

  // Aesthetic procedures
  CONSULTATION_CREATE: "consultation.create",
  TREATMENT_PLAN_CREATE: "treatment.plan.create",
  PROCEDURE_SCHEDULE: "procedure.schedule",
  PROCEDURE_COMPLETE: "procedure.complete",

  // LGPD compliance (appropriate for aesthetic clinics)
  CONSENT_GIVEN: "lgpd.consent.given",
  CONSENT_WITHDRAWN: "lgpd.consent.withdrawn",
  DATA_EXPORT_REQUEST: "lgpd.data.export",
  DATA_DELETION_REQUEST: "lgpd.data.deletion",

  // System events
  SYSTEM_CONFIG_CHANGE: "system.config.change",
  BACKUP_CREATED: "system.backup.created",
  SECURITY_ALERT: "security.alert",
} as const;

export const AuditSeverity = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
} as const;

export const AuditOutcome = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  PARTIAL: "PARTIAL",
} as const;

// Audit event schema
export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(),
  eventType: z.string(),
  severity: z.nativeEnum(AuditSeverity),
  outcome: z.nativeEnum(AuditOutcome),
  userId: z.string().optional(),
  patientId: z.string().optional(),
  clinicId: z.string().optional(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
  description: z.string(),
  details: z.record(z.unknown()).optional(),
  hash: z.string().optional(),
  previousHash: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Audit configuration
export interface AuditConfig {
  enabled: boolean;
  enableHashing: boolean;
  batchSize: number;
  batchTimeout: number; // milliseconds
  retentionDays: number;
  performanceTarget: number; // milliseconds
  supabaseUrl: string;
  supabaseServiceKey: string;
}

// Audit filters for querying
export interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  severities?: string[];
  userId?: string;
  patientId?: string;
  clinicId?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

// Default configuration
const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  enableHashing: true,
  batchSize: 50,
  batchTimeout: 5000, // 5 seconds
  retentionDays: 2555, // 7 years for healthcare compliance
  performanceTarget: 10, // 10ms target
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

/**
 * Unified Audit Service
 * Combines best features from all three previous implementations
 */
export class UnifiedAuditService {
  private readonly config: AuditConfig;
  private readonly supabase: SupabaseClient;

  // Performance optimization
  private readonly eventBuffer: AuditEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  // Hash chain for integrity
  private lastHash = "";

  // Performance metrics
  private totalEvents = 0;
  private totalProcessingTime = 0;
  private errorCount = 0;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
    this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseServiceKey);
  }

  /**
   * Log audit event with performance optimization
   */
  async logEvent(
    eventData: Omit<AuditEvent, "id" | "timestamp" | "hash" | "previousHash">,
  ): Promise<string | null> {
    const startTime = performance.now();

    if (!this.config.enabled) {
      return null;
    }

    try {
      // Create complete audit event
      const event: AuditEvent = {
        ...eventData,
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        hash: "",
        previousHash: this.lastHash,
      };

      // Generate cryptographic hash for integrity
      if (this.config.enableHashing) {
        event.hash = this.generateEventHash(event);
        this.lastHash = event.hash;
      }

      // Validate event structure
      const validatedEvent = AuditEventSchema.parse(event);

      // Add to buffer for batch processing
      this.eventBuffer.push(validatedEvent);

      // Immediate processing for critical events
      if (validatedEvent.severity === AuditSeverity.CRITICAL) {
        await this.flushBuffer();
      } // Batch processing for performance
      else if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flushBuffer();
      } // Set timer for batch timeout
      else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.flushBuffer();
        }, this.config.batchTimeout);
      }

      // Record performance metrics
      const processingTime = performance.now() - startTime;
      this.recordPerformanceMetrics(processingTime);

      return validatedEvent.id;
    } catch (error) {
      this.errorCount++;
      const processingTime = performance.now() - startTime;
      this.recordPerformanceMetrics(processingTime);

      console.error("Failed to log audit event:", error);
      return null;
    }
  }

  /**
   * Log authentication success
   */
  logLoginSuccess(
    userId: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<string | null> {
    return this.logEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      severity: AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      ipAddress,
      userAgent,
      description: "User logged in successfully",
    });
  }

  /**
   * Log authentication failure
   */
  logLoginFailure(
    email: string,
    ipAddress: string,
    reason: string,
    userAgent?: string,
  ): Promise<string | null> {
    return this.logEvent({
      eventType: AuditEventType.LOGIN_FAILURE,
      severity: AuditSeverity.WARNING,
      outcome: AuditOutcome.FAILURE,
      ipAddress,
      userAgent,
      description: `Login failed for ${email}: ${reason}`,
      details: { email, reason },
    });
  }

  /**
   * Log patient data access (aesthetic clinic context)
   */
  logPatientAccess(options: {
    userId: string;
    patientId: string;
    clinicId: string;
    action: "create" | "read" | "update" | "delete";
    ipAddress: string;
    details?: Record<string, unknown>;
  }): Promise<string | null> {
    const { userId, patientId, clinicId, action, ipAddress, details } = options;
    const eventTypeMap = {
      create: AuditEventType.PATIENT_CREATE,
      read: AuditEventType.PATIENT_READ,
      update: AuditEventType.PATIENT_UPDATE,
      delete: AuditEventType.PATIENT_DELETE,
    };

    return this.logEvent({
      eventType: eventTypeMap[action],
      severity: action === "delete" ? AuditSeverity.WARNING : AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      patientId,
      clinicId,
      resourceId: patientId,
      resourceType: "patient",
      ipAddress,
      description: `Patient ${action} operation performed`,
      details,
    });
  }

  /**
   * Log LGPD consent event (appropriate for aesthetic clinics)
   */
  logConsentEvent(options: {
    userId: string;
    patientId: string;
    clinicId: string;
    action: "given" | "withdrawn";
    purpose: string;
    ipAddress: string;
  }): Promise<string | null> {
    const { userId, patientId, clinicId, action, purpose, ipAddress } = options;
    const eventType = action === "given"
      ? AuditEventType.CONSENT_GIVEN
      : AuditEventType.CONSENT_WITHDRAWN;

    return this.logEvent({
      eventType,
      severity: AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      patientId,
      clinicId,
      resourceId: patientId,
      resourceType: "consent",
      ipAddress,
      description: `LGPD consent ${action} for ${purpose}`,
      details: { purpose, action },
    });
  }

  /**
   * Log aesthetic procedure event
   */
  logProcedureEvent(options: {
    userId: string;
    patientId: string;
    clinicId: string;
    procedureType: string;
    action: "schedule" | "complete" | "cancel";
    ipAddress: string;
    details?: Record<string, unknown>;
  }): Promise<string | null> {
    const { userId, patientId, clinicId, procedureType, action, ipAddress, details } = options;

    return this.logEvent({
      eventType: action === "schedule"
        ? AuditEventType.PROCEDURE_SCHEDULE
        : AuditEventType.PROCEDURE_COMPLETE,
      severity: AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      patientId,
      clinicId,
      resourceType: "procedure",
      ipAddress,
      description: `Aesthetic procedure ${action}: ${procedureType}`,
      details: { procedureType, action, ...details },
    });
  }

  /**
   * Generate cryptographic hash for event integrity
   */
  private generateEventHash(event: Omit<AuditEvent, "hash">): string {
    const hashInput = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      userId: event.userId,
      patientId: event.patientId,
      resourceId: event.resourceId,
      previousHash: event.previousHash,
    });

    return createHash("sha256").update(hashInput).digest("hex");
  }

  /**
   * Flush event buffer to persistent storage
   */
  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer.length = 0; // Clear buffer

    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      // Store events in Supabase
      const eventRecords = events.map((event) => ({
        id: event.id,
        timestamp: event.timestamp,
        event_type: event.eventType,
        severity: event.severity,
        outcome: event.outcome,
        user_id: event.userId,
        patient_id: event.patientId,
        clinic_id: event.clinicId,
        resource_id: event.resourceId,
        resource_type: event.resourceType,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        description: event.description,
        details: event.details,
        hash: event.hash,
        previous_hash: event.previousHash,
      }));

      const { error } = await this.supabase
        .from("audit_events")
        .insert(eventRecords);

      if (error) {
        throw new Error(`Failed to store audit events: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to flush audit buffer:", error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events);
      throw error;
    }
  }

  /**
   * Query audit events with filters
   */
  async queryEvents(filters: AuditFilters): Promise<{
    events: AuditEvent[];
    totalCount: number;
  }> {
    try {
      let query = this.supabase
        .from("audit_events")
        .select("*", { count: "exact" })
        .order("timestamp", { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte("timestamp", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte("timestamp", filters.endDate.toISOString());
      }

      if (filters.eventTypes && filters.eventTypes.length > 0) {
        query = query.in("event_type", filters.eventTypes);
      }

      if (filters.severities && filters.severities.length > 0) {
        query = query.in("severity", filters.severities);
      }

      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      if (filters.clinicId) {
        query = query.eq("clinic_id", filters.clinicId);
      }

      if (filters.resourceType) {
        query = query.eq("resource_type", filters.resourceType);
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 100) - 1,
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to query audit events: ${error.message}`);
      }

      const events = (data || []).map((record) => ({
        id: record.id,
        timestamp: record.timestamp,
        eventType: record.event_type,
        severity: record.severity,
        outcome: record.outcome,
        userId: record.user_id,
        patientId: record.patient_id,
        clinicId: record.clinic_id,
        resourceId: record.resource_id,
        resourceType: record.resource_type,
        ipAddress: record.ip_address,
        userAgent: record.user_agent,
        description: record.description,
        details: record.details,
        hash: record.hash,
        previousHash: record.previous_hash,
      }));

      return {
        events,
        totalCount: count || 0,
      };
    } catch (error) {
      console.error("Failed to query audit events:", error);
      return { events: [], totalCount: 0 };
    }
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(processingTime: number): void {
    this.totalEvents++;
    this.totalProcessingTime += processingTime;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    totalEvents: number;
    averageProcessingTime: number;
    errorRate: number;
    bufferUtilization: number;
  } {
    const averageProcessingTime = this.totalEvents > 0
      ? this.totalProcessingTime / this.totalEvents
      : 0;

    const errorRate = this.totalEvents > 0
      ? this.errorCount / this.totalEvents
      : 0;

    const bufferUtilization = this.eventBuffer.length / this.config.batchSize;

    return {
      totalEvents: this.totalEvents,
      averageProcessingTime,
      errorRate,
      bufferUtilization,
    };
  }

  /**
   * Cleanup old audit events based on retention policy
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    try {
      const { data, error } = await this.supabase
        .from("audit_events")
        .delete()
        .lt("timestamp", cutoffDate.toISOString())
        .select("id");

      if (error) {
        throw new Error(`Failed to cleanup audit events: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Failed to cleanup audit events:", error);
      return 0;
    }
  }

  /**
   * Graceful shutdown with buffer flush
   */
  async shutdown(): Promise<void> {
    // Flush remaining events
    if (this.eventBuffer.length > 0) {
      await this.flushBuffer();
    }

    // Clear any pending timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}
