/**
 * Audit Logger - Session Activity Tracking & LGPD Compliance
 *
 * Comprehensive audit logging system for session management with LGPD compliance,
 * security monitoring, and detailed activity tracking for the NeonPro platform.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventEmitter } from "events";
import crypto from "crypto";
import type {
  SessionAuditLog,
  UserSession,
  SessionSecurityEvent,
  LGPDSessionData,
  SessionError,
  SessionLocation,
  DeviceRegistration,
} from "./types";

interface AuditLogEntry {
  id: string;
  sessionId?: string;
  userId: string;
  clinicId: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: SessionLocation;
  timestamp: Date;
  lgpdData?: LGPDSessionData;
  correlationId?: string;
  parentEventId?: string;
}

type AuditAction =
  // Session actions
  | "session_created"
  | "session_validated"
  | "session_renewed"
  | "session_terminated"
  | "session_expired"
  | "session_hijack_detected"
  | "session_concurrent_limit"
  // Authentication actions
  | "login_attempt"
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_verified"
  // Device actions
  | "device_registered"
  | "device_trusted"
  | "device_blocked"
  | "device_unblocked"
  | "device_fingerprint_changed"
  | "device_location_changed"
  // Security actions
  | "suspicious_activity"
  | "security_violation"
  | "ip_blocked"
  | "rate_limit_exceeded"
  | "privilege_escalation"
  | "unauthorized_access"
  | "data_access"
  // LGPD actions
  | "consent_given"
  | "consent_withdrawn"
  | "data_exported"
  | "data_deleted"
  | "privacy_policy_accepted"
  | "data_processing_logged"
  // System actions
  | "system_error"
  | "configuration_changed"
  | "maintenance_mode";

type AuditCategory =
  | "authentication"
  | "session"
  | "device"
  | "security"
  | "lgpd"
  | "system"
  | "user_activity";

type AuditSeverity = "low" | "medium" | "high" | "critical";

interface AuditSearchFilters {
  userId?: string;
  clinicId?: string;
  sessionId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  severity?: AuditSeverity;
  ipAddress?: string;
  deviceFingerprint?: string;
  startDate?: Date;
  endDate?: Date;
  correlationId?: string;
  limit?: number;
  offset?: number;
}

interface AuditStatistics {
  totalEvents: number;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  topActions: Array<{ action: AuditAction; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  topIPs: Array<{ ipAddress: string; count: number }>;
  securityEvents: number;
  lgpdEvents: number;
  recentTrends: Array<{ date: string; count: number }>;
}

export class AuditLogger extends EventEmitter {
  private supabase: SupabaseClient;
  private logBuffer: AuditLogEntry[] = [];
  private bufferSize: number = 100;
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;
  private correlationMap: Map<string, string> = new Map();

  constructor(
    supabase: SupabaseClient,
    options?: {
      bufferSize?: number;
      flushInterval?: number;
    },
  ) {
    super();
    this.supabase = supabase;
    this.bufferSize = options?.bufferSize || 100;
    this.flushInterval = options?.flushInterval || 5000;

    this.startFlushTimer();
  }

  // ============================================================================
  // AUDIT LOGGING METHODS
  // ============================================================================

  /**
   * Log a session-related audit event
   */
  async logSessionEvent(params: {
    sessionId?: string;
    userId: string;
    clinicId: string;
    action: AuditAction;
    details?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    location?: SessionLocation;
    severity?: AuditSeverity;
    correlationId?: string;
    parentEventId?: string;
  }): Promise<string> {
    const eventId = this.generateEventId();

    const logEntry: AuditLogEntry = {
      id: eventId,
      sessionId: params.sessionId,
      userId: params.userId,
      clinicId: params.clinicId,
      action: params.action,
      category: this.categorizeAction(params.action),
      severity: params.severity || this.determineSeverity(params.action),
      details: {
        ...params.details,
        eventId,
        source: "session_manager",
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceFingerprint: params.deviceFingerprint,
      location: params.location,
      timestamp: new Date(),
      correlationId: params.correlationId,
      parentEventId: params.parentEventId,
    };

    // Add LGPD data if applicable
    if (this.isLGPDRelevant(params.action)) {
      logEntry.lgpdData = this.generateLGPDData(logEntry);
    }

    // Buffer the log entry
    this.bufferLogEntry(logEntry);

    // Emit event for real-time monitoring
    this.emit("audit_event", logEntry);

    // Handle critical events immediately
    if (logEntry.severity === "critical") {
      await this.flushBuffer();
      this.emit("critical_event", logEntry);
    }

    return eventId;
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(params: {
    userId: string;
    clinicId: string;
    action: AuditAction;
    threatLevel: "low" | "medium" | "high" | "critical";
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    location?: SessionLocation;
    correlationId?: string;
  }): Promise<string> {
    const eventId = await this.logSessionEvent({
      ...params,
      severity: this.mapThreatToSeverity(params.threatLevel),
      details: {
        ...params.details,
        threatLevel: params.threatLevel,
        securityEvent: true,
      },
    });

    // Create security event record
    await this.createSecurityEventRecord({
      eventId,
      userId: params.userId,
      threatLevel: params.threatLevel,
      action: params.action,
      details: params.details,
      ipAddress: params.ipAddress,
      timestamp: new Date(),
    });

    return eventId;
  }

  /**
   * Log LGPD compliance event
   */
  async logLGPDEvent(params: {
    userId: string;
    clinicId: string;
    action: AuditAction;
    dataType: string;
    legalBasis: string;
    purpose: string;
    details?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    correlationId?: string;
  }): Promise<string> {
    const lgpdData: LGPDSessionData = {
      dataProcessingPurpose: params.purpose,
      legalBasis: params.legalBasis,
      dataCategories: [params.dataType],
      retentionPeriod: this.getRetentionPeriod(params.dataType),
      consentStatus: "given", // Simplified for demo
      dataMinimization: true,
      encryptionStatus: "encrypted",
    };

    const eventId = await this.logSessionEvent({
      userId: params.userId,
      clinicId: params.clinicId,
      action: params.action,
      severity: "medium",
      details: {
        ...params.details,
        dataType: params.dataType,
        legalBasis: params.legalBasis,
        purpose: params.purpose,
        lgpdCompliance: true,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      correlationId: params.correlationId,
    });

    // Store LGPD-specific data
    await this.storeLGPDData(eventId, lgpdData);

    return eventId;
  }

  /**
   * Create correlation between related events
   */
  createCorrelation(eventIds: string[], correlationType: string): string {
    const correlationId = this.generateCorrelationId();

    eventIds.forEach((eventId) => {
      this.correlationMap.set(eventId, correlationId);
    });

    // Store correlation in database
    this.storeCorrelation(correlationId, eventIds, correlationType);

    return correlationId;
  }

  // ============================================================================
  // AUDIT SEARCH & RETRIEVAL
  // ============================================================================

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(filters: AuditSearchFilters): Promise<{
    logs: SessionAuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Ensure buffer is flushed for real-time search
      await this.flushBuffer();

      let query = this.supabase.from("session_audit_logs").select("*", { count: "exact" });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.clinicId) {
        query = query.eq("clinic_id", filters.clinicId);
      }
      if (filters.sessionId) {
        query = query.eq("session_id", filters.sessionId);
      }
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters.ipAddress) {
        query = query.eq("ip_address", filters.ipAddress);
      }
      if (filters.deviceFingerprint) {
        query = query.eq("device_fingerprint", filters.deviceFingerprint);
      }
      if (filters.startDate) {
        query = query.gte("timestamp", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte("timestamp", filters.endDate.toISOString());
      }
      if (filters.correlationId) {
        query = query.eq("correlation_id", filters.correlationId);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      query = query.order("timestamp", { ascending: false }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new SessionError("Failed to search audit logs", "SYSTEM_ERROR", { error });
      }

      const logs = data.map(this.mapDatabaseToAuditLog);
      const total = count || 0;
      const hasMore = offset + limit < total;

      return { logs, total, hasMore };
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to search audit logs", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(eventId: string): Promise<SessionAuditLog | null> {
    try {
      const { data, error } = await this.supabase
        .from("session_audit_logs")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapDatabaseToAuditLog(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get correlated events
   */
  async getCorrelatedEvents(correlationId: string): Promise<SessionAuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .from("session_audit_logs")
        .select("*")
        .eq("correlation_id", correlationId)
        .order("timestamp", { ascending: true });

      if (error) {
        throw new SessionError("Failed to get correlated events", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToAuditLog);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get correlated events", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<SessionAuditLog[]> {
    const filters: AuditSearchFilters = {
      userId,
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit || 100,
    };

    const result = await this.searchAuditLogs(filters);
    return result.logs;
  }

  /**
   * Get security events for analysis
   */
  async getSecurityEvents(options?: {
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SessionAuditLog[]> {
    const filters: AuditSearchFilters = {
      category: "security",
      severity: options?.severity,
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit || 100,
    };

    const result = await this.searchAuditLogs(filters);
    return result.logs;
  }

  // ============================================================================
  // AUDIT ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Generate audit statistics
   */
  async generateAuditStatistics(options?: {
    userId?: string;
    clinicId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditStatistics> {
    try {
      await this.flushBuffer();

      let query = this.supabase
        .from("session_audit_logs")
        .select("action, category, severity, user_id, ip_address, timestamp");

      if (options?.userId) {
        query = query.eq("user_id", options.userId);
      }
      if (options?.clinicId) {
        query = query.eq("clinic_id", options.clinicId);
      }
      if (options?.startDate) {
        query = query.gte("timestamp", options.startDate.toISOString());
      }
      if (options?.endDate) {
        query = query.lte("timestamp", options.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new SessionError("Failed to generate audit statistics", "SYSTEM_ERROR", { error });
      }

      return this.calculateStatistics(data);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to generate audit statistics", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Generate LGPD compliance report
   */
  async generateLGPDReport(options?: {
    userId?: string;
    clinicId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalEvents: number;
    consentEvents: number;
    dataAccessEvents: number;
    dataExportEvents: number;
    dataDeletionEvents: number;
    complianceScore: number;
    violations: SessionAuditLog[];
  }> {
    try {
      const filters: AuditSearchFilters = {
        category: "lgpd",
        userId: options?.userId,
        clinicId: options?.clinicId,
        startDate: options?.startDate,
        endDate: options?.endDate,
        limit: 1000,
      };

      const result = await this.searchAuditLogs(filters);
      const events = result.logs;

      const report = {
        totalEvents: events.length,
        consentEvents: events.filter((e) => e.action.includes("consent")).length,
        dataAccessEvents: events.filter((e) => e.action === "data_access").length,
        dataExportEvents: events.filter((e) => e.action === "data_exported").length,
        dataDeletionEvents: events.filter((e) => e.action === "data_deleted").length,
        complianceScore: 0,
        violations: events.filter((e) => e.severity === "critical"),
      };

      // Calculate compliance score (simplified)
      const totalRequiredEvents = report.consentEvents + report.dataAccessEvents;
      const violationPenalty = report.violations.length * 10;
      report.complianceScore = Math.max(
        0,
        Math.min(100, (totalRequiredEvents > 0 ? 80 : 60) - violationPenalty),
      );

      return report;
    } catch (error) {
      throw new SessionError("Failed to generate LGPD report", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    filters: AuditSearchFilters,
    format: "json" | "csv" = "json",
  ): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    try {
      const result = await this.searchAuditLogs({ ...filters, limit: 10000 });
      const logs = result.logs;

      let data: string;
      let filename: string;
      let mimeType: string;

      if (format === "csv") {
        data = this.convertToCSV(logs);
        filename = `audit_logs_${Date.now()}.csv`;
        mimeType = "text/csv";
      } else {
        data = JSON.stringify(logs, null, 2);
        filename = `audit_logs_${Date.now()}.json`;
        mimeType = "application/json";
      }

      // Log the export event
      await this.logSessionEvent({
        userId: filters.userId || "system",
        clinicId: filters.clinicId || "system",
        action: "data_exported",
        severity: "medium",
        details: {
          exportFormat: format,
          recordCount: logs.length,
          filters,
        },
        ipAddress: "127.0.0.1",
        userAgent: "audit_system",
      });

      return { data, filename, mimeType };
    } catch (error) {
      throw new SessionError("Failed to export audit logs", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // AUDIT MAINTENANCE
  // ============================================================================

  /**
   * Archive old audit logs
   */
  async archiveOldLogs(retentionDays: number = 365): Promise<{
    archivedCount: number;
    deletedCount: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      // Get logs to archive
      const { data: oldLogs, error: fetchError } = await this.supabase
        .from("session_audit_logs")
        .select("id")
        .lt("timestamp", cutoffDate.toISOString())
        .limit(1000);

      if (fetchError) {
        throw new SessionError("Failed to fetch old logs", "SYSTEM_ERROR", { error: fetchError });
      }

      if (!oldLogs || oldLogs.length === 0) {
        return { archivedCount: 0, deletedCount: 0 };
      }

      // Archive to separate table (simplified - in production, use external storage)
      const { error: archiveError } = await this.supabase.from("session_audit_logs_archive").insert(
        oldLogs.map((log) => ({
          ...log,
          archived_at: new Date().toISOString(),
        })),
      );

      if (archiveError) {
        throw new SessionError("Failed to archive logs", "SYSTEM_ERROR", { error: archiveError });
      }

      // Delete from main table
      const { error: deleteError } = await this.supabase
        .from("session_audit_logs")
        .delete()
        .in(
          "id",
          oldLogs.map((log) => log.id),
        );

      if (deleteError) {
        throw new SessionError("Failed to delete archived logs", "SYSTEM_ERROR", {
          error: deleteError,
        });
      }

      return {
        archivedCount: oldLogs.length,
        deletedCount: oldLogs.length,
      };
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to archive old logs", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Cleanup sensitive data from logs
   */
  async cleanupSensitiveData(): Promise<number> {
    try {
      // Remove sensitive data from old logs (keep structure but anonymize)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: oldLogs, error: fetchError } = await this.supabase
        .from("session_audit_logs")
        .select("id, details")
        .lt("timestamp", thirtyDaysAgo.toISOString())
        .limit(100);

      if (fetchError || !oldLogs) {
        return 0;
      }

      let cleanedCount = 0;

      for (const log of oldLogs) {
        const cleanedDetails = this.anonymizeLogDetails(log.details);

        const { error } = await this.supabase
          .from("session_audit_logs")
          .update({ details: cleanedDetails })
          .eq("id", log.id);

        if (!error) {
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error("Failed to cleanup sensitive data:", error);
      return 0;
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private bufferLogEntry(entry: AuditLogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const dbEntries = entries.map((entry) => ({
        id: entry.id,
        session_id: entry.sessionId,
        user_id: entry.userId,
        clinic_id: entry.clinicId,
        action: entry.action,
        category: entry.category,
        severity: entry.severity,
        details: entry.details,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        device_fingerprint: entry.deviceFingerprint,
        location: entry.location,
        timestamp: entry.timestamp.toISOString(),
        lgpd_data: entry.lgpdData,
        correlation_id: entry.correlationId,
        parent_event_id: entry.parentEventId,
      }));

      const { error } = await this.supabase.from("session_audit_logs").insert(dbEntries);

      if (error) {
        console.error("Failed to flush audit log buffer:", error);
        // Re-add entries to buffer for retry
        this.logBuffer.unshift(...entries);
      }
    } catch (error) {
      console.error("Failed to flush audit log buffer:", error);
      // Re-add entries to buffer for retry
      this.logBuffer.unshift(...entries);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private categorizeAction(action: AuditAction): AuditCategory {
    if (action.includes("session")) return "session";
    if (action.includes("login") || action.includes("logout") || action.includes("mfa"))
      return "authentication";
    if (action.includes("device")) return "device";
    if (action.includes("suspicious") || action.includes("security") || action.includes("blocked"))
      return "security";
    if (action.includes("consent") || action.includes("data_") || action.includes("privacy"))
      return "lgpd";
    if (
      action.includes("system") ||
      action.includes("configuration") ||
      action.includes("maintenance")
    )
      return "system";
    return "user_activity";
  }

  private determineSeverity(action: AuditAction): AuditSeverity {
    const criticalActions = [
      "session_hijack_detected",
      "security_violation",
      "unauthorized_access",
      "privilege_escalation",
      "system_error",
    ];

    const highActions = [
      "login_failed",
      "device_blocked",
      "suspicious_activity",
      "ip_blocked",
      "rate_limit_exceeded",
      "consent_withdrawn",
    ];

    const mediumActions = [
      "session_terminated",
      "device_registered",
      "password_changed",
      "mfa_enabled",
      "data_exported",
      "data_deleted",
    ];

    if (criticalActions.includes(action)) return "critical";
    if (highActions.includes(action)) return "high";
    if (mediumActions.includes(action)) return "medium";
    return "low";
  }

  private isLGPDRelevant(action: AuditAction): boolean {
    const lgpdActions = [
      "consent_given",
      "consent_withdrawn",
      "data_exported",
      "data_deleted",
      "privacy_policy_accepted",
      "data_processing_logged",
      "data_access",
    ];

    return lgpdActions.includes(action);
  }

  private generateLGPDData(entry: AuditLogEntry): LGPDSessionData {
    return {
      dataProcessingPurpose: this.determinePurpose(entry.action),
      legalBasis: this.determineLegalBasis(entry.action),
      dataCategories: this.determineDataCategories(entry.action),
      retentionPeriod: this.getRetentionPeriod("audit_log"),
      consentStatus: "given",
      dataMinimization: true,
      encryptionStatus: "encrypted",
    };
  }

  private determinePurpose(action: AuditAction): string {
    if (action.includes("session")) return "Session management and security";
    if (action.includes("login")) return "User authentication";
    if (action.includes("device")) return "Device security and management";
    if (action.includes("security")) return "Security monitoring and protection";
    return "System operation and compliance";
  }

  private determineLegalBasis(action: AuditAction): string {
    if (action.includes("security") || action.includes("session")) return "Legitimate interest";
    if (action.includes("consent")) return "Consent";
    if (action.includes("data_")) return "Legal obligation";
    return "Legitimate interest";
  }

  private determineDataCategories(action: AuditAction): string[] {
    const categories = ["audit_logs"];

    if (action.includes("session") || action.includes("login")) {
      categories.push("authentication_data");
    }
    if (action.includes("device")) {
      categories.push("device_information");
    }
    if (action.includes("location")) {
      categories.push("location_data");
    }

    return categories;
  }

  private getRetentionPeriod(dataType: string): string {
    const retentionPeriods: Record<string, string> = {
      audit_log: "7 years",
      session_data: "1 year",
      device_data: "2 years",
      security_data: "5 years",
    };

    return retentionPeriods[dataType] || "1 year";
  }

  private mapThreatToSeverity(threatLevel: string): AuditSeverity {
    switch (threatLevel) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "medium";
    }
  }

  private async createSecurityEventRecord(params: {
    eventId: string;
    userId: string;
    threatLevel: string;
    action: AuditAction;
    details: Record<string, any>;
    ipAddress: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.supabase.from("security_events").insert({
        id: this.generateEventId(),
        audit_event_id: params.eventId,
        user_id: params.userId,
        threat_level: params.threatLevel,
        event_type: params.action,
        details: params.details,
        ip_address: params.ipAddress,
        timestamp: params.timestamp.toISOString(),
        resolved: false,
      });
    } catch (error) {
      console.error("Failed to create security event record:", error);
    }
  }

  private async storeLGPDData(eventId: string, lgpdData: LGPDSessionData): Promise<void> {
    try {
      await this.supabase.from("lgpd_audit_data").insert({
        audit_event_id: eventId,
        data_processing_purpose: lgpdData.dataProcessingPurpose,
        legal_basis: lgpdData.legalBasis,
        data_categories: lgpdData.dataCategories,
        retention_period: lgpdData.retentionPeriod,
        consent_status: lgpdData.consentStatus,
        data_minimization: lgpdData.dataMinimization,
        encryption_status: lgpdData.encryptionStatus,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to store LGPD data:", error);
    }
  }

  private async storeCorrelation(
    correlationId: string,
    eventIds: string[],
    type: string,
  ): Promise<void> {
    try {
      await this.supabase.from("audit_correlations").insert({
        correlation_id: correlationId,
        event_ids: eventIds,
        correlation_type: type,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to store correlation:", error);
    }
  }

  private calculateStatistics(data: any[]): AuditStatistics {
    const stats: AuditStatistics = {
      totalEvents: data.length,
      eventsByCategory: {
        authentication: 0,
        session: 0,
        device: 0,
        security: 0,
        lgpd: 0,
        system: 0,
        user_activity: 0,
      },
      eventsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      topActions: [],
      topUsers: [],
      topIPs: [],
      securityEvents: 0,
      lgpdEvents: 0,
      recentTrends: [],
    };

    // Count by category and severity
    const actionCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    data.forEach((event) => {
      stats.eventsByCategory[event.category as AuditCategory]++;
      stats.eventsBySeverity[event.severity as AuditSeverity]++;

      if (event.category === "security") stats.securityEvents++;
      if (event.category === "lgpd") stats.lgpdEvents++;

      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
      userCounts[event.user_id] = (userCounts[event.user_id] || 0) + 1;
      ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
    });

    // Top actions
    stats.topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action: action as AuditAction, count }));

    // Top users
    stats.topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    // Top IPs
    stats.topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ipAddress, count]) => ({ ipAddress, count }));

    // Recent trends (simplified - last 7 days)
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const count = data.filter((event) => event.timestamp.startsWith(dateStr)).length;

      stats.recentTrends.push({ date: dateStr, count });
    }

    return stats;
  }

  private convertToCSV(logs: SessionAuditLog[]): string {
    const headers = [
      "ID",
      "Session ID",
      "User ID",
      "Clinic ID",
      "Action",
      "Category",
      "Severity",
      "IP Address",
      "User Agent",
      "Timestamp",
      "Details",
    ];

    const rows = logs.map((log) => [
      log.id,
      log.sessionId || "",
      log.userId,
      log.clinicId,
      log.action,
      log.category,
      log.severity,
      log.ipAddress,
      log.userAgent,
      log.timestamp.toISOString(),
      JSON.stringify(log.details),
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  }

  private anonymizeLogDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveFields = ["password", "token", "secret", "key", "email", "phone"];
    const anonymized = { ...details };

    const anonymizeObject = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          result[key] = "[ANONYMIZED]";
        } else if (typeof value === "object") {
          result[key] = anonymizeObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return anonymizeObject(anonymized);
  }

  private mapDatabaseToAuditLog(data: any): SessionAuditLog {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      action: data.action,
      category: data.category,
      severity: data.severity,
      details: data.details,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      deviceFingerprint: data.device_fingerprint,
      location: data.location,
      timestamp: new Date(data.timestamp),
      lgpdData: data.lgpd_data,
      correlationId: data.correlation_id,
      parentEventId: data.parent_event_id,
    };
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    await this.flushBuffer();
    this.correlationMap.clear();
    this.removeAllListeners();
  }
}
