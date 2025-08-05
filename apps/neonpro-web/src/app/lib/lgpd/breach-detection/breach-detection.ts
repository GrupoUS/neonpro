/**
 * LGPD Breach Detection & Notification System
 *
 * Automated detection, assessment, and notification system for data breaches
 * in healthcare environments, ensuring LGPD compliance and rapid response.
 */

import type { createClient } from "@/app/lib/supabase/server";
import type { lgpdAuditLogger } from "../audit/lgpd-audit";
import type { realTimeComplianceMonitor } from "../monitoring/compliance-monitoring";

// Breach severity levels
export enum BreachSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Breach types
export enum BreachType {
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_LEAK = "data_leak",
  SYSTEM_COMPROMISE = "system_compromise",
  INSIDER_THREAT = "insider_threat",
  EXTERNAL_ATTACK = "external_attack",
  HUMAN_ERROR = "human_error",
  TECHNICAL_FAILURE = "technical_failure",
  THIRD_PARTY_BREACH = "third_party_breach",
}

// Affected data categories
export enum AffectedDataCategory {
  PERSONAL_DATA = "personal_data",
  SENSITIVE_PERSONAL_DATA = "sensitive_personal_data",
  HEALTH_DATA = "health_data",
  BIOMETRIC_DATA = "biometric_data",
  FINANCIAL_DATA = "financial_data",
  GENETIC_DATA = "genetic_data",
  AUTHENTICATION_DATA = "authentication_data",
}

// Notification recipients
export enum NotificationRecipient {
  DPO = "dpo",
  IT_SECURITY = "it_security",
  MANAGEMENT = "management",
  LEGAL = "legal",
  DATA_SUBJECTS = "data_subjects",
  ANPD = "anpd",
  ANVISA = "anvisa",
}

// Data breach interface
export interface DataBreach {
  id: string;
  type: BreachType;
  severity: BreachSeverity;
  title: string;
  description: string;
  detectedAt: Date;
  reportedAt?: Date;

  // Affected data
  affectedDataCategories: AffectedDataCategory[];
  estimatedAffectedRecords: number;
  dataSubjectsAffected: number;

  // Technical details
  source: string;
  attackVector?: string;
  vulnerabilityExploited?: string;
  systemsAffected: string[];

  // Response and mitigation
  status: "detected" | "investigating" | "contained" | "resolved" | "reported";
  containmentActions: string[];
  mitigationSteps: string[];
  investigationFindings?: string;

  // Notifications
  notificationsSent: NotificationRecord[];
  anpdNotificationRequired: boolean;
  anpdNotificationSent?: Date;
  dataSubjectNotificationRequired: boolean;
  dataSubjectNotificationSent?: Date;

  // Legal and compliance
  regulatoryDeadlines: RegulatoryDeadline[];
  legalConsultationRequired: boolean;
  legalAdviceReceived?: Date;

  // Risk assessment
  riskAssessment: BreachRiskAssessment;
  likelihoodOfHarm: "low" | "medium" | "high";
  potentialConsequences: string[];

  // Resolution
  rootCause?: string;
  preventiveMeasures: string[];
  lessonLearned?: string;
  resolvedAt?: Date;
  resolvedBy?: string;

  // Metadata
  createdBy: string;
  updatedAt: Date;
  metadata: Record<string, any>;
}

// Notification record
export interface NotificationRecord {
  id: string;
  recipient: NotificationRecipient;
  recipientDetails: string;
  sentAt: Date;
  method: "email" | "sms" | "phone" | "portal" | "letter";
  status: "sent" | "delivered" | "failed" | "acknowledged";
  content: string;
  acknowledgmentRequired: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

// Regulatory deadline
export interface RegulatoryDeadline {
  authority: "anpd" | "anvisa" | "other";
  requirement: string;
  deadline: Date;
  status: "pending" | "completed" | "overdue";
  completedAt?: Date;
  notes?: string;
}

// Risk assessment
export interface BreachRiskAssessment {
  overallRiskScore: number; // 0-100
  confidentialityImpact: number; // 1-5
  integrityImpact: number; // 1-5
  availabilityImpact: number; // 1-5

  // LGPD specific factors
  sensitiveDataInvolved: boolean;
  childrenDataInvolved: boolean;
  healthDataInvolved: boolean;
  biometricDataInvolved: boolean;

  // Business impact
  financialImpact: "low" | "medium" | "high" | "critical";
  reputationalImpact: "low" | "medium" | "high" | "critical";
  operationalImpact: "low" | "medium" | "high" | "critical";

  // Regulatory risk
  fineRisk: number; // estimated fine amount
  legalActionRisk: "low" | "medium" | "high";
  regulatoryInvestigationRisk: "low" | "medium" | "high";

  assessmentDate: Date;
  assessedBy: string;
  reviewDate: Date;
}

// Breach detection rules
export interface BreachDetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Detection criteria
  eventTypes: string[];
  thresholds: Record<string, number>;
  conditions: Record<string, any>;

  // Response
  autoSeverity: BreachSeverity;
  autoNotifications: NotificationRecipient[];
  autoContainmentActions: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

class BreachDetectionSystem {
  private supabase = createClient();
  private detectionRules: Map<string, BreachDetectionRule> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.loadDetectionRules();
    this.setupDefaultRules();
  }

  // Load detection rules from database
  private async loadDetectionRules(): Promise<void> {
    try {
      const { data: rules, error } = await this.supabase
        .from("lgpd_breach_detection_rules")
        .select("*")
        .eq("enabled", true);

      if (error) throw error;

      this.detectionRules.clear();
      rules?.forEach((rule) => {
        this.detectionRules.set(rule.id, rule);
      });
    } catch (error) {
      console.error("Error loading breach detection rules:", error);
    }
  }

  // Setup default detection rules
  private setupDefaultRules(): void {
    const defaultRules: Omit<
      BreachDetectionRule,
      "id" | "createdAt" | "updatedAt" | "lastTriggered" | "triggerCount"
    >[] = [
      {
        name: "Multiple Failed Login Attempts",
        description: "Detect potential brute force attacks",
        enabled: true,
        eventTypes: ["authentication_failed"],
        thresholds: { failed_attempts: 5, time_window: 300 },
        conditions: { consecutive: true },
        autoSeverity: BreachSeverity.MEDIUM,
        autoNotifications: [NotificationRecipient.IT_SECURITY],
        autoContainmentActions: ["lock_account", "alert_security_team"],
      },
      {
        name: "Unusual Data Access Pattern",
        description: "Detect unusual data access volumes or patterns",
        enabled: true,
        eventTypes: ["data_access"],
        thresholds: { access_volume: 1000, time_window: 3600 },
        conditions: { deviation_factor: 3 },
        autoSeverity: BreachSeverity.HIGH,
        autoNotifications: [NotificationRecipient.IT_SECURITY, NotificationRecipient.DPO],
        autoContainmentActions: ["monitor_user", "alert_security_team"],
      },
      {
        name: "Data Export Anomaly",
        description: "Detect large or unusual data exports",
        enabled: true,
        eventTypes: ["data_export"],
        thresholds: { export_size: 10000, record_count: 5000 },
        conditions: { outside_hours: true },
        autoSeverity: BreachSeverity.CRITICAL,
        autoNotifications: [
          NotificationRecipient.IT_SECURITY,
          NotificationRecipient.DPO,
          NotificationRecipient.MANAGEMENT,
        ],
        autoContainmentActions: [
          "suspend_export",
          "alert_security_team",
          "investigate_immediately",
        ],
      },
      {
        name: "Unauthorized System Access",
        description: "Detect access from unauthorized locations or devices",
        enabled: true,
        eventTypes: ["system_access"],
        thresholds: {},
        conditions: { unauthorized_location: true, unknown_device: true },
        autoSeverity: BreachSeverity.HIGH,
        autoNotifications: [NotificationRecipient.IT_SECURITY],
        autoContainmentActions: ["require_mfa", "alert_security_team"],
      },
      {
        name: "Database Query Anomaly",
        description: "Detect unusual database queries or access patterns",
        enabled: true,
        eventTypes: ["database_query"],
        thresholds: { query_complexity: 5, execution_time: 30 },
        conditions: { sensitive_tables: true },
        autoSeverity: BreachSeverity.MEDIUM,
        autoNotifications: [NotificationRecipient.IT_SECURITY],
        autoContainmentActions: ["log_detailed", "alert_security_team"],
      },
    ];

    // Add default rules if not already present
    defaultRules.forEach((rule) => {
      const ruleId = `default_${rule.name.toLowerCase().replace(/\s+/g, "_")}`;
      if (!this.detectionRules.has(ruleId)) {
        const fullRule: BreachDetectionRule = {
          ...rule,
          id: ruleId,
          createdAt: new Date(),
          updatedAt: new Date(),
          triggerCount: 0,
        };
        this.detectionRules.set(ruleId, fullRule);
      }
    });
  }

  // Start breach monitoring
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Set up real-time monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.runDetectionCycle();
    }, 60000); // Run every minute

    // Set up database triggers for real-time detection
    await this.setupDatabaseTriggers();

    await lgpdAuditLogger.logEvent({
      eventType: "breach_monitoring_started",
      userId: "system",
      userRole: "system",
      resource: "breach_detection_system",
      action: "start_monitoring",
      outcome: "success",
      details: { rules_count: this.detectionRules.size },
    });
  }

  // Stop breach monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  // Run detection cycle
  private async runDetectionCycle(): Promise<void> {
    try {
      for (const rule of this.detectionRules.values()) {
        if (!rule.enabled) continue;

        const detected = await this.evaluateRule(rule);
        if (detected) {
          await this.handleDetection(rule, detected);
        }
      }
    } catch (error) {
      console.error("Error in breach detection cycle:", error);
    }
  }

  // Evaluate detection rule
  private async evaluateRule(rule: BreachDetectionRule): Promise<any | null> {
    try {
      // Get recent events matching rule criteria
      const { data: events, error } = await this.supabase
        .from("lgpd_audit_log")
        .select("*")
        .in("event_type", rule.eventTypes)
        .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!events || events.length === 0) return null;

      // Apply rule logic
      return this.applyRuleLogic(rule, events);
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return null;
    }
  }

  // Apply rule logic to events
  private applyRuleLogic(rule: BreachDetectionRule, events: any[]): any | null {
    // Implement specific logic based on rule type
    switch (rule.name) {
      case "Multiple Failed Login Attempts":
        return this.detectFailedLogins(rule, events);
      case "Unusual Data Access Pattern":
        return this.detectUnusualAccess(rule, events);
      case "Data Export Anomaly":
        return this.detectExportAnomaly(rule, events);
      case "Unauthorized System Access":
        return this.detectUnauthorizedAccess(rule, events);
      case "Database Query Anomaly":
        return this.detectQueryAnomaly(rule, events);
      default:
        return null;
    }
  }

  // Detect failed login patterns
  private detectFailedLogins(rule: BreachDetectionRule, events: any[]): any | null {
    const failedLogins = events.filter((e) => e.outcome === "failure");
    const groupedByUser = this.groupEventsByUser(failedLogins);

    for (const [userId, userEvents] of Object.entries(groupedByUser)) {
      if ((userEvents as any[]).length >= rule.thresholds.failed_attempts) {
        const timeSpan =
          new Date((userEvents as any[])[0].created_at).getTime() -
          new Date((userEvents as any[])[(userEvents as any[]).length - 1].created_at).getTime();

        if (timeSpan <= rule.thresholds.time_window * 1000) {
          return {
            userId,
            failedAttempts: (userEvents as any[]).length,
            timeSpan: timeSpan / 1000,
            events: userEvents,
          };
        }
      }
    }

    return null;
  }

  // Detect unusual data access
  private detectUnusualAccess(rule: BreachDetectionRule, events: any[]): any | null {
    const accessEvents = events.filter((e) => e.action === "read" || e.action === "access");
    const groupedByUser = this.groupEventsByUser(accessEvents);

    for (const [userId, userEvents] of Object.entries(groupedByUser)) {
      if ((userEvents as any[]).length >= rule.thresholds.access_volume) {
        return {
          userId,
          accessCount: (userEvents as any[]).length,
          events: userEvents,
        };
      }
    }

    return null;
  }

  // Detect data export anomalies
  private detectExportAnomaly(rule: BreachDetectionRule, events: any[]): any | null {
    const exportEvents = events.filter((e) => e.action === "export");

    for (const event of exportEvents) {
      const eventTime = new Date(event.created_at).getHours();
      const isOutsideHours = eventTime < 8 || eventTime > 18; // Outside business hours

      if (isOutsideHours && rule.conditions.outside_hours) {
        return {
          userId: event.user_id,
          exportTime: event.created_at,
          outsideHours: true,
          event,
        };
      }
    }

    return null;
  }

  // Detect unauthorized access
  private detectUnauthorizedAccess(rule: BreachDetectionRule, events: any[]): any | null {
    // This would typically check against known IP ranges, device fingerprints, etc.
    // For now, we'll check for suspicious patterns in the metadata

    for (const event of events) {
      const metadata = event.details || {};
      if (metadata.suspicious_location || metadata.unknown_device) {
        return {
          userId: event.user_id,
          suspiciousIndicators: {
            location: metadata.suspicious_location,
            device: metadata.unknown_device,
          },
          event,
        };
      }
    }

    return null;
  }

  // Detect database query anomalies
  private detectQueryAnomaly(rule: BreachDetectionRule, events: any[]): any | null {
    const queryEvents = events.filter((e) => e.action === "query");

    for (const event of queryEvents) {
      const details = event.details || {};
      if (
        details.execution_time > rule.thresholds.execution_time ||
        details.complexity_score > rule.thresholds.query_complexity
      ) {
        return {
          userId: event.user_id,
          queryComplexity: details.complexity_score,
          executionTime: details.execution_time,
          event,
        };
      }
    }

    return null;
  }
}
