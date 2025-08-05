import type { createClient } from "@/lib/supabase/client";
import type { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { createClient as createServerClient } from "@/lib/supabase/server";
import type { performanceTracker } from "./performance-tracker";

export interface SecurityEvent {
  id: string;
  eventType:
    | "authentication"
    | "authorization"
    | "data_access"
    | "configuration"
    | "security_violation";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  sessionId?: string;
  resource: string;
  action: string;
  outcome: "success" | "failure" | "blocked";
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface ComplianceReport {
  period: { start: Date; end: Date };
  lgpdCompliance: {
    dataAccessRequests: number;
    dataExportRequests: number;
    dataDeletionRequests: number;
    consentUpdates: number;
    breachNotifications: number;
  };
  securityMetrics: {
    failedLoginAttempts: number;
    suspiciousActivities: number;
    blockedRequests: number;
    vulnerabilityScans: number;
  };
  riskAssessment: {
    overallRiskScore: number;
    highRiskEvents: SecurityEvent[];
    recommendations: string[];
  };
}

export interface AuditConfig {
  enableRealTimeAlerts: boolean;
  alertThresholds: {
    failedLoginAttempts: number;
    suspiciousIPActivity: number;
    dataAccessVolume: number;
  };
  retentionPeriodDays: number;
  complianceReportingEnabled: boolean;
  anonymizePII: boolean;
}

class SecurityAuditFramework {
  private static instance: SecurityAuditFramework;
  private config: AuditConfig;

  private constructor() {
    this.config = {
      enableRealTimeAlerts: true,
      alertThresholds: {
        failedLoginAttempts: 5,
        suspiciousIPActivity: 10,
        dataAccessVolume: 100,
      },
      retentionPeriodDays: 2555, // 7 years for LGPD compliance
      complianceReportingEnabled: true,
      anonymizePII: true,
    };
  }

  public static getInstance(): SecurityAuditFramework {
    if (!SecurityAuditFramework.instance) {
      SecurityAuditFramework.instance = new SecurityAuditFramework();
    }
    return SecurityAuditFramework.instance;
  }

  /**
   * Log security event with automatic threat detection
   */
  async logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): Promise<void> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      const securityEvent: SecurityEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };

      // Store the event
      const { error } = await supabase.from("security_audit_log").insert({
        event_id: securityEvent.id,
        event_type: securityEvent.eventType,
        severity: securityEvent.severity,
        user_id: securityEvent.userId,
        session_id: securityEvent.sessionId,
        resource: securityEvent.resource,
        action: securityEvent.action,
        outcome: securityEvent.outcome,
        metadata: securityEvent.metadata,
        timestamp: securityEvent.timestamp.toISOString(),
        ip_address: securityEvent.ipAddress,
        user_agent: securityEvent.userAgent,
      });

      if (error) {
        console.error("Security event logging error:", error);
        return;
      }

      // Real-time threat detection
      await this.detectThreats(securityEvent);

      // Check for compliance violations
      if (this.config.complianceReportingEnabled) {
        await this.checkComplianceViolations(securityEvent);
      }

      performanceTracker.recordMetric("security_event_logging", Date.now() - startTime);
    } catch (error) {
      console.error("Security audit framework error:", error);
    }
  }

  /**
   * Detect threats and trigger alerts
   */
  private async detectThreats(event: SecurityEvent): Promise<void> {
    if (!this.config.enableRealTimeAlerts) return;

    try {
      // Failed login attempt detection
      if (event.eventType === "authentication" && event.outcome === "failure") {
        await this.checkFailedLoginThreshold(event.ipAddress, event.userId);
      }

      // Suspicious IP activity detection
      if (event.severity === "high" || event.severity === "critical") {
        await this.checkSuspiciousIPActivity(event.ipAddress);
      }

      // Data access pattern detection
      if (event.eventType === "data_access") {
        await this.checkDataAccessPatterns(event.userId, event.ipAddress);
      }

      // Configuration change monitoring
      if (event.eventType === "configuration") {
        await this.alertConfigurationChange(event);
      }
    } catch (error) {
      console.error("Threat detection error:", error);
    }
  }

  /**
   * Check failed login attempts threshold
   */
  private async checkFailedLoginThreshold(ipAddress: string, userId?: string): Promise<void> {
    try {
      const supabase = await createClient();

      // Count failed attempts in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("security_audit_log")
        .select("count", { count: "exact" })
        .eq("event_type", "authentication")
        .eq("outcome", "failure")
        .eq("ip_address", ipAddress)
        .gte("timestamp", oneHourAgo.toISOString());

      if (error) throw error;

      const failedAttempts = data?.length || 0;

      if (failedAttempts >= this.config.alertThresholds.failedLoginAttempts) {
        await this.triggerSecurityAlert({
          type: "failed_login_threshold",
          severity: "high",
          message: `${failedAttempts} failed login attempts from IP ${ipAddress}`,
          metadata: { ipAddress, userId, failedAttempts },
        });
      }
    } catch (error) {
      console.error("Failed login threshold check error:", error);
    }
  }

  /**
   * Check for suspicious IP activity
   */
  private async checkSuspiciousIPActivity(ipAddress: string): Promise<void> {
    try {
      const supabase = await createServerClient();

      // Count high-severity events from this IP in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("security_audit_log")
        .select("count", { count: "exact" })
        .eq("ip_address", ipAddress)
        .in("severity", ["high", "critical"])
        .gte("timestamp", twentyFourHoursAgo.toISOString());

      if (error) throw error;

      const suspiciousEvents = data?.length || 0;

      if (suspiciousEvents >= this.config.alertThresholds.suspiciousIPActivity) {
        await this.triggerSecurityAlert({
          type: "suspicious_ip_activity",
          severity: "critical",
          message: `${suspiciousEvents} suspicious activities from IP ${ipAddress}`,
          metadata: { ipAddress, suspiciousEvents },
        });
      }
    } catch (error) {
      console.error("Suspicious IP activity check error:", error);
    }
  }

  /**
   * Check data access patterns for anomalies
   */
  private async checkDataAccessPatterns(userId?: string, ipAddress?: string): Promise<void> {
    if (!userId) return;

    try {
      const supabase = await createServerClient();

      // Count data access events in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("security_audit_log")
        .select("count", { count: "exact" })
        .eq("event_type", "data_access")
        .eq("user_id", userId)
        .gte("timestamp", oneHourAgo.toISOString());

      if (error) throw error;

      const dataAccessCount = data?.length || 0;

      if (dataAccessCount >= this.config.alertThresholds.dataAccessVolume) {
        await this.triggerSecurityAlert({
          type: "unusual_data_access",
          severity: "medium",
          message: `User ${userId} accessed ${dataAccessCount} data records in the last hour`,
          metadata: { userId, ipAddress, dataAccessCount },
        });
      }
    } catch (error) {
      console.error("Data access pattern check error:", error);
    }
  }

  /**
   * Alert on configuration changes
   */
  private async alertConfigurationChange(event: SecurityEvent): Promise<void> {
    await this.triggerSecurityAlert({
      type: "configuration_change",
      severity: "medium",
      message: `Configuration change: ${event.action} on ${event.resource}`,
      metadata: {
        userId: event.userId,
        resource: event.resource,
        action: event.action,
        metadata: event.metadata,
      },
    });
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(alert: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      const supabase = await createServerClient();

      // Store alert
      await supabase.from("security_alerts").insert({
        alert_id: crypto.randomUUID(),
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message,
        metadata: alert.metadata,
        timestamp: new Date().toISOString(),
        status: "open",
      });

      // Send real-time notification (placeholder for integration with notification system)
      console.warn(`SECURITY ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    } catch (error) {
      console.error("Security alert trigger error:", error);
    }
  }

  /**
   * Check for LGPD compliance violations
   */
  private async checkComplianceViolations(event: SecurityEvent): Promise<void> {
    try {
      // Check for unauthorized personal data access
      if (event.eventType === "data_access" && event.outcome === "failure") {
        if (event.resource.includes("patient") || event.resource.includes("personal")) {
          await this.logComplianceViolation({
            type: "unauthorized_personal_data_access",
            event,
            description: "Attempted unauthorized access to personal data",
          });
        }
      }

      // Check for data export without proper consent
      if (event.action === "export" && !event.metadata.consentVerified) {
        await this.logComplianceViolation({
          type: "data_export_without_consent",
          event,
          description: "Data export attempted without verified consent",
        });
      }

      // Check for data retention policy violations
      if (event.action === "access" && event.metadata.dataAge > this.config.retentionPeriodDays) {
        await this.logComplianceViolation({
          type: "data_retention_violation",
          event,
          description: "Access to data beyond retention period",
        });
      }
    } catch (error) {
      console.error("Compliance violation check error:", error);
    }
  }

  /**
   * Log compliance violation
   */
  private async logComplianceViolation(violation: {
    type: string;
    event: SecurityEvent;
    description: string;
  }): Promise<void> {
    try {
      const supabase = await createServerClient();

      await supabase.from("compliance_violations").insert({
        violation_id: crypto.randomUUID(),
        violation_type: violation.type,
        description: violation.description,
        related_event_id: violation.event.id,
        user_id: violation.event.userId,
        timestamp: new Date().toISOString(),
        status: "reported",
        severity: "high",
      });

      // Trigger immediate alert for compliance violations
      await this.triggerSecurityAlert({
        type: "compliance_violation",
        severity: "critical",
        message: `LGPD Compliance Violation: ${violation.description}`,
        metadata: {
          violationType: violation.type,
          eventId: violation.event.id,
          userId: violation.event.userId,
        },
      });
    } catch (error) {
      console.error("Compliance violation logging error:", error);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(period: { start: Date; end: Date }): Promise<ComplianceReport> {
    try {
      const supabase = await createServerClient();

      // Get LGPD-related metrics
      const lgpdMetrics = await this.getLGPDMetrics(period);

      // Get security metrics
      const securityMetrics = await this.getSecurityMetrics(period);

      // Get high-risk events
      const { data: highRiskEvents, error } = await supabase
        .from("security_audit_log")
        .select("*")
        .in("severity", ["high", "critical"])
        .gte("timestamp", period.start.toISOString())
        .lte("timestamp", period.end.toISOString())
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Calculate overall risk score
      const overallRiskScore = this.calculateRiskScore(securityMetrics, highRiskEvents || []);

      // Generate recommendations
      const recommendations = this.generateRecommendations(securityMetrics, highRiskEvents || []);

      return {
        period,
        lgpdCompliance: lgpdMetrics,
        securityMetrics,
        riskAssessment: {
          overallRiskScore,
          highRiskEvents: (highRiskEvents || []).map(this.mapDatabaseEventToSecurityEvent),
          recommendations,
        },
      };
    } catch (error) {
      console.error("Compliance report generation error:", error);
      throw error;
    }
  }

  /**
   * Get LGPD compliance metrics
   */
  private async getLGPDMetrics(period: { start: Date; end: Date }) {
    try {
      const supabase = await createServerClient();

      const { data, error } = await supabase
        .from("security_audit_log")
        .select("action, metadata")
        .gte("timestamp", period.start.toISOString())
        .lte("timestamp", period.end.toISOString());

      if (error) throw error;

      const events = data || [];

      return {
        dataAccessRequests: events.filter((e) => e.action === "data_access_request").length,
        dataExportRequests: events.filter((e) => e.action === "data_export").length,
        dataDeletionRequests: events.filter((e) => e.action === "data_deletion").length,
        consentUpdates: events.filter((e) => e.action === "consent_update").length,
        breachNotifications: events.filter((e) => e.action === "breach_notification").length,
      };
    } catch (error) {
      console.error("LGPD metrics error:", error);
      return {
        dataAccessRequests: 0,
        dataExportRequests: 0,
        dataDeletionRequests: 0,
        consentUpdates: 0,
        breachNotifications: 0,
      };
    }
  }

  /**
   * Get security metrics
   */
  private async getSecurityMetrics(period: { start: Date; end: Date }) {
    try {
      const supabase = await createServerClient();

      const { data, error } = await supabase
        .from("security_audit_log")
        .select("event_type, outcome, severity")
        .gte("timestamp", period.start.toISOString())
        .lte("timestamp", period.end.toISOString());

      if (error) throw error;

      const events = data || [];

      return {
        failedLoginAttempts: events.filter(
          (e) => e.event_type === "authentication" && e.outcome === "failure",
        ).length,
        suspiciousActivities: events.filter(
          (e) => e.severity === "high" || e.severity === "critical",
        ).length,
        blockedRequests: events.filter((e) => e.outcome === "blocked").length,
        vulnerabilityScans: events.filter((e) => e.event_type === "security_scan").length,
      };
    } catch (error) {
      console.error("Security metrics error:", error);
      return {
        failedLoginAttempts: 0,
        suspiciousActivities: 0,
        blockedRequests: 0,
        vulnerabilityScans: 0,
      };
    }
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(securityMetrics: any, highRiskEvents: any[]): number {
    let score = 0;

    // Weight different factors
    score += securityMetrics.failedLoginAttempts * 0.1;
    score += securityMetrics.suspiciousActivities * 0.3;
    score += securityMetrics.blockedRequests * 0.05;
    score += highRiskEvents.length * 0.5;

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score));
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(securityMetrics: any, highRiskEvents: any[]): string[] {
    const recommendations: string[] = [];

    if (securityMetrics.failedLoginAttempts > 50) {
      recommendations.push("Consider implementing stronger brute force protection");
    }

    if (securityMetrics.suspiciousActivities > 20) {
      recommendations.push("Review and strengthen access controls");
    }

    if (highRiskEvents.length > 10) {
      recommendations.push("Conduct security audit and penetration testing");
    }

    if (securityMetrics.vulnerabilityScans === 0) {
      recommendations.push("Implement regular vulnerability scanning");
    }

    return recommendations;
  }

  /**
   * Map database event to SecurityEvent
   */
  private mapDatabaseEventToSecurityEvent(dbEvent: any): SecurityEvent {
    return {
      id: dbEvent.event_id,
      eventType: dbEvent.event_type,
      severity: dbEvent.severity,
      userId: dbEvent.user_id,
      sessionId: dbEvent.session_id,
      resource: dbEvent.resource,
      action: dbEvent.action,
      outcome: dbEvent.outcome,
      metadata: dbEvent.metadata,
      timestamp: new Date(dbEvent.timestamp),
      ipAddress: dbEvent.ip_address,
      userAgent: dbEvent.user_agent,
    };
  }
}

export const securityAuditFramework = SecurityAuditFramework.getInstance();
