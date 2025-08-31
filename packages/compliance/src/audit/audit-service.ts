/**
 * @fileoverview Audit Service for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Service
 *
 * Quality Standard: ≥9.9/10
 */

import type { ComplianceScore } from "../types";
import {
  AuditConfigSchema,
  AuditEventSchema,
  AuditEventType,
  AuditFiltersSchema,
  AuditSeverity,
} from "./types";
import type {
  AuditConfig,
  AuditEvent,
  AuditFilters,
  AuditLog,
  AuditTrailValidation,
} from "./types";

/**
 * Constitutional Audit Service
 * Manages audit logging and trail validation for healthcare compliance
 */
export class AuditService {
  private readonly supabaseClient: any;

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Log an audit event
   */
  async logEvent(
    tenantId: string,
    event: AuditEvent,
  ): Promise<{ success: boolean; auditLogId?: string; error?: string; }> {
    try {
      // Validate event data
      const validatedEvent = AuditEventSchema.parse(event);

      // Calculate compliance score based on event type and severity
      const complianceScore = this.calculateComplianceScore(
        event.eventType,
        event.severity,
      );

      const auditLog: Omit<AuditLog, "id"> = {
        tenantId,
        eventType: validatedEvent.eventType,
        severity: validatedEvent.severity,
        userId: validatedEvent.userId,
        patientId: validatedEvent.patientId,
        resourceId: validatedEvent.resourceId,
        resourceType: validatedEvent.resourceType,
        action: validatedEvent.action,
        description: validatedEvent.description,
        metadata: validatedEvent.metadata || {},
        ipAddress: validatedEvent.ipAddress,
        userAgent: validatedEvent.userAgent,
        timestamp: new Date(),
        regulation: validatedEvent.regulation,
        complianceScore,
      };

      const { data, error } = await this.supabaseClient
        .from("audit_logs")
        .insert([auditLog])
        .select("id")
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Trigger real-time monitoring if critical event
      if (event.severity === AuditSeverity.CRITICAL) {
        await this.triggerRealTimeAlert(tenantId, auditLog);
      }

      return { success: true, auditLogId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(
    filters: AuditFilters,
  ): Promise<{ success: boolean; logs?: AuditLog[]; error?: string; }> {
    try {
      // Validate filters
      const validatedFilters = AuditFiltersSchema.parse(filters);

      let query = this.supabaseClient
        .from("audit_logs")
        .select("*")
        .order("timestamp", {
          ascending: false,
        });

      // Apply filters
      if (validatedFilters.tenantId) {
        query = query.eq("tenant_id", validatedFilters.tenantId);
      }

      if (
        validatedFilters.eventTypes
        && validatedFilters.eventTypes.length > 0
      ) {
        query = query.in("event_type", validatedFilters.eventTypes);
      }

      if (
        validatedFilters.severities
        && validatedFilters.severities.length > 0
      ) {
        query = query.in("severity", validatedFilters.severities);
      }

      if (validatedFilters.userId) {
        query = query.eq("user_id", validatedFilters.userId);
      }

      if (validatedFilters.patientId) {
        query = query.eq("patient_id", validatedFilters.patientId);
      }

      if (validatedFilters.resourceType) {
        query = query.eq("resource_type", validatedFilters.resourceType);
      }

      if (validatedFilters.startDate) {
        query = query.gte(
          "timestamp",
          validatedFilters.startDate.toISOString(),
        );
      }

      if (validatedFilters.endDate) {
        query = query.lte("timestamp", validatedFilters.endDate.toISOString());
      }

      if (validatedFilters.regulation) {
        query = query.eq("regulation", validatedFilters.regulation);
      }

      if (validatedFilters.minComplianceScore !== undefined) {
        query = query.gte(
          "compliance_score",
          validatedFilters.minComplianceScore,
        );
      }

      if (validatedFilters.limit) {
        query = query.limit(validatedFilters.limit);
      }

      if (validatedFilters.offset) {
        query = query.range(
          validatedFilters.offset,
          validatedFilters.offset + (validatedFilters.limit || 100) - 1,
        );
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, logs: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate audit trail integrity
   */
  async validateAuditTrail(tenantId: string): Promise<AuditTrailValidation> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get audit logs for the last 30 days
      const { data: logs, error } = await this.supabaseClient
        .from("audit_logs")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      const violations: string[] = [];
      const recommendations: string[] = [];
      const missingEvents: string[] = [];
      let integrityScore = 10;

      // Check for required event types
      const requiredEventTypes = [
        AuditEventType.USER_LOGIN,
        AuditEventType.PATIENT_DATA_ACCESS,
        AuditEventType.SYSTEM_CONFIGURATION_CHANGE,
      ];

      const loggedEventTypes = new Set(
        logs.map((log: AuditLog) => log.event_type),
      );

      for (const requiredType of requiredEventTypes) {
        if (!loggedEventTypes.has(requiredType)) {
          missingEvents.push(requiredType);
          violations.push(`Missing required audit events: ${requiredType}`);
          integrityScore -= 1;
        }
      }

      // Check for gaps in audit trail (periods without any logs)
      if (logs.length > 0) {
        const sortedLogs = logs.sort(
          (a: AuditLog, b: AuditLog) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        for (let i = 1; i < sortedLogs.length; i++) {
          const prevTime = new Date(sortedLogs[i - 1].timestamp).getTime();
          const currTime = new Date(sortedLogs[i].timestamp).getTime();
          const gap = currTime - prevTime;

          // Flag gaps longer than 24 hours
          if (gap > 24 * 60 * 60 * 1000) {
            violations.push(
              `Audit trail gap detected: ${new Date(prevTime)} to ${new Date(currTime)}`,
            );
            integrityScore -= 0.5;
          }
        }
      }

      // Check for suspicious patterns
      const criticalEvents = logs.filter(
        (log: AuditLog) => log.severity === AuditSeverity.CRITICAL,
      );
      if (criticalEvents.length > 10) {
        violations.push("High number of critical events detected");
        recommendations.push("Review security measures and access controls");
        integrityScore -= 1;
      }

      // Generate recommendations
      if (missingEvents.length > 0) {
        recommendations.push(
          "Ensure all required healthcare operations are properly logged",
        );
      }

      if (violations.length === 0) {
        recommendations.push(
          "Audit trail integrity is maintained - continue current practices",
        );
      }

      return {
        isComplete: violations.length === 0 && integrityScore >= 9.9,
        missingEvents,
        integrityScore: Math.max(0, integrityScore) as ComplianceScore,
        lastValidation: new Date(),
        violations,
        recommendations,
      };
    } catch {
      return {
        isComplete: false,
        missingEvents: [],
        integrityScore: 0 as ComplianceScore,
        lastValidation: new Date(),
        violations: ["Audit trail validation system failure"],
        recommendations: [
          "Contact system administrator to resolve audit validation issues",
        ],
      };
    }
  }

  /**
   * Configure audit settings
   */
  async configureAudit(
    config: AuditConfig,
  ): Promise<{ success: boolean; error?: string; }> {
    try {
      // Validate configuration
      const validatedConfig = AuditConfigSchema.parse(config);

      const { error } = await this.supabaseClient
        .from("audit_configurations")
        .upsert([validatedConfig], { onConflict: "tenant_id" });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate compliance score based on event type and severity
   */
  private calculateComplianceScore(
    eventType: AuditEventType,
    severity: AuditSeverity,
  ): ComplianceScore {
    let baseScore = 10;

    // Reduce score based on severity
    switch (severity) {
      case AuditSeverity.CRITICAL: {
        baseScore -= 3;
        break;
      }
      case AuditSeverity.HIGH: {
        baseScore -= 2;
        break;
      }
      case AuditSeverity.MEDIUM: {
        baseScore -= 1;
        break;
      }
      case AuditSeverity.LOW: {
        baseScore -= 0.1;
        break;
      }
    }

    // Adjust based on event type
    if (eventType === AuditEventType.COMPLIANCE_VIOLATION) {
      baseScore -= 2;
    } else if (eventType === AuditEventType.DATA_BREACH_DETECTED) {
      baseScore -= 5;
    } else if (eventType === AuditEventType.FAILED_LOGIN_ATTEMPT) {
      baseScore -= 0.5;
    }

    return Math.max(0, Math.min(10, baseScore)) as ComplianceScore;
  }

  /**
   * Trigger real-time alert for critical events
   */
  private async triggerRealTimeAlert(
    _tenantId: string,
    _auditLog: Omit<AuditLog, "id">,
  ): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Send notifications to administrators
      // 2. Trigger automated responses
      // 3. Update compliance dashboards
      // 4. Generate incident reports
    } catch {}
  }
}
