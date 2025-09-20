// Enhanced Multi-Model AI Assistant Operation Log Model
// Brazilian Healthcare Compliance: Complete audit trail and operation tracking
// LGPD, CFM, ANVISA compliance with comprehensive logging
// Date: 2025-09-19

import type {
  AuditTrail,
  EnhancedAIModel,
  SubscriptionTier,
  MedicalSpecialty,
  AIFeatureCode,
} from "@neonpro/types";

// ================================================
// OPERATION LOG INTERFACES
// ================================================

/**
 * Operation categories for classification and filtering
 */
export type OperationCategory =
  | "ai_request"
  | "plan_change"
  | "user_action"
  | "system_event"
  | "compliance_check"
  | "security_event"
  | "billing_event"
  | "data_processing"
  | "admin_action";

/**
 * Operation severity levels for alerting and monitoring
 */
export type OperationSeverity = "info" | "warning" | "error" | "critical";

/**
 * Compliance frameworks for regulatory tracking
 */
export type ComplianceFramework =
  | "LGPD"
  | "CFM"
  | "ANVISA"
  | "ISO27001"
  | "HIPAA";

/**
 * Data processing purposes for LGPD compliance
 */
export type DataProcessingPurpose =
  | "analytics"
  | "diagnosis"
  | "training"
  | "audit";

/**
 * Comprehensive operation log entry
 */
export interface OperationLogEntry {
  readonly id: string;
  readonly timestamp: Date;

  // Basic Operation Info
  readonly category: OperationCategory;
  readonly operation: string;
  readonly description: string;
  readonly severity: OperationSeverity;

  // User and Context
  readonly clinicId: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly userRole?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;

  // AI-Specific Context
  readonly modelCode?: EnhancedAIModel;
  readonly planCode?: SubscriptionTier;
  readonly featureCode?: AIFeatureCode;
  readonly medicalSpecialty?: MedicalSpecialty;

  // Request/Response Data
  readonly requestData?: Record<string, any>;
  readonly responseData?: Record<string, any>;
  readonly errorDetails?: {
    readonly code: string;
    readonly message: string;
    readonly stack?: string;
  };

  // Performance Metrics
  readonly duration?: number; // milliseconds
  readonly costUsd?: number;
  readonly tokensUsed?: number;
  readonly cacheHit?: boolean;

  // Compliance and Security
  readonly complianceFrameworks: ComplianceFramework[];
  readonly dataProcessingPurpose?: DataProcessingPurpose;
  readonly personalDataInvolved: boolean;
  readonly sensitiveDataLevel: "none" | "low" | "medium" | "high" | "critical";
  readonly anonymizationApplied: boolean;
  readonly consentId?: string;
  readonly consentStatus: "valid" | "missing" | "invalid" | "withdrawn";

  // Audit Trail
  readonly auditTrail: AuditTrail;

  // Healthcare Specific
  readonly patientInvolved?: boolean;
  readonly diagnosisAssistance?: boolean;
  readonly prescriptionInvolved?: boolean;
  readonly medicalAdviceGiven?: boolean;
  readonly regulatoryFlags: string[];

  // System Context
  readonly systemVersion?: string;
  readonly environmentType: "development" | "staging" | "production";
  readonly correlationId?: string;
  readonly parentOperationId?: string;

  // Additional Metadata
  readonly tags: string[];
  readonly metadata: Record<string, any>;
}

/**
 * Log query filters for searching and filtering
 */
export interface LogQueryFilters {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly categories?: OperationCategory[];
  readonly severities?: OperationSeverity[];
  readonly clinicIds?: string[];
  readonly userIds?: string[];
  readonly operations?: string[];
  readonly complianceFrameworks?: ComplianceFramework[];
  readonly personalDataOnly?: boolean;
  readonly errorOnly?: boolean;
  readonly tags?: string[];
  readonly searchQuery?: string;
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Log aggregation results for analytics
 */
export interface LogAggregation {
  readonly period: "hour" | "day" | "week" | "month";
  readonly timestamp: Date;
  readonly counts: {
    readonly total: number;
    readonly byCategory: Record<OperationCategory, number>;
    readonly bySeverity: Record<OperationSeverity, number>;
    readonly errors: number;
    readonly complianceEvents: number;
  };
  readonly performance: {
    readonly averageDuration: number;
    readonly totalCost: number;
    readonly totalTokens: number;
  };
  readonly compliance: {
    readonly personalDataEvents: number;
    readonly consentIssues: number;
    readonly regulatoryFlags: string[];
  };
}

// ================================================
// OPERATION LOG MODEL CLASS
// ================================================

/**
 * Operation log model for comprehensive audit trails and compliance tracking
 */
export class OperationLog {
  private _entries: Map<string, OperationLogEntry> = new Map();
  private _aggregations: Map<string, LogAggregation> = new Map();

  constructor() {}

  // ================================================
  // LOG ENTRY MANAGEMENT
  // ================================================

  /**
   * Records a new operation log entry
   */
  logOperation(
    entry: Omit<OperationLogEntry, "id" | "timestamp" | "auditTrail">,
  ): OperationLogEntry {
    const now = new Date();
    const id = this.generateLogId();

    const fullEntry: OperationLogEntry = {
      ...entry,
      id,
      timestamp: now,
      auditTrail: {
        action: entry.operation,
        timestamp: now,
        userId: entry.userId || "system",
        userRole: entry.userRole,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        consentStatus: entry.consentStatus,
        dataProcessingPurpose:
          (entry.dataProcessingPurpose as
            | "analytics"
            | "diagnosis"
            | "training"
            | "audit") || "audit",
        anonymizationLevel: entry.anonymizationApplied ? "anonymized" : "none",
        metadata: {
          category: entry.category,
          severity: entry.severity,
          correlationId: entry.correlationId,
          ...entry.metadata,
        },
      },
    };

    this._entries.set(id, fullEntry);
    this.updateAggregations(fullEntry);

    // Trigger alerts for critical operations
    if (fullEntry.severity === "critical") {
      this.triggerCriticalAlert(fullEntry);
    }

    return fullEntry;
  }

  /**
   * Logs an AI request operation
   */
  logAIRequest(params: {
    clinicId: string;
    userId: string;
    sessionId?: string;
    modelCode: EnhancedAIModel;
    planCode: SubscriptionTier;
    medicalSpecialty?: MedicalSpecialty;
    requestData?: Record<string, any>;
    responseData?: Record<string, any>;
    duration: number;
    costUsd: number;
    tokensUsed: number;
    cacheHit: boolean;
    personalDataInvolved: boolean;
    consentId?: string;
    patientInvolved?: boolean;
    diagnosisAssistance?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): OperationLogEntry {
    return this.logOperation({
      category: "ai_request",
      operation: "ai_chat_request",
      description: `AI request using ${params.modelCode} model`,
      severity: "info",
      clinicId: params.clinicId,
      userId: params.userId,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      modelCode: params.modelCode,
      planCode: params.planCode,
      medicalSpecialty: params.medicalSpecialty,
      requestData: params.requestData,
      responseData: params.responseData,
      duration: params.duration,
      costUsd: params.costUsd,
      tokensUsed: params.tokensUsed,
      cacheHit: params.cacheHit,
      complianceFrameworks: params.medicalSpecialty
        ? ["LGPD", "CFM"]
        : ["LGPD"],
      dataProcessingPurpose: params.diagnosisAssistance
        ? "diagnosis"
        : "analytics",
      personalDataInvolved: params.personalDataInvolved,
      sensitiveDataLevel: params.medicalSpecialty ? "high" : "low",
      anonymizationApplied: true,
      consentId: params.consentId,
      consentStatus: params.consentId ? "valid" : "missing",
      patientInvolved: params.patientInvolved,
      diagnosisAssistance: params.diagnosisAssistance,
      prescriptionInvolved: false,
      medicalAdviceGiven: Boolean(params.diagnosisAssistance),
      regulatoryFlags: this.generateRegulatoryFlags(
        params.medicalSpecialty,
        params.diagnosisAssistance,
      ),
      environmentType: "production",
      tags: [
        "ai_request",
        params.modelCode,
        ...(params.medicalSpecialty ? [params.medicalSpecialty] : []),
      ],
      metadata: {
        cacheEfficiency: params.cacheHit ? "high" : "none",
        costOptimization: params.cacheHit ? "applied" : "opportunity",
      },
    });
  }

  /**
   * Logs a plan change operation
   */
  logPlanChange(params: {
    clinicId: string;
    userId: string;
    fromPlan: SubscriptionTier;
    toPlan: SubscriptionTier;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): OperationLogEntry {
    return this.logOperation({
      category: "plan_change",
      operation: "subscription_updated",
      description: `Plan changed from ${params.fromPlan} to ${params.toPlan}`,
      severity: "info",
      clinicId: params.clinicId,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      planCode: params.toPlan,
      complianceFrameworks: ["LGPD"],
      dataProcessingPurpose: "analytics",
      personalDataInvolved: true,
      sensitiveDataLevel: "medium",
      anonymizationApplied: false,
      consentStatus: "valid",
      environmentType: "production",
      regulatoryFlags: ["LGPD", "BILLING"],
      tags: ["plan_change", params.fromPlan, params.toPlan],
      metadata: {
        changeReason: params.reason,
        fromPlan: params.fromPlan,
        toPlan: params.toPlan,
      },
    });
  }

  /**
   * Logs a compliance check operation
   */
  logComplianceCheck(params: {
    clinicId: string;
    userId?: string;
    framework: ComplianceFramework;
    checkType: string;
    result: "pass" | "fail" | "warning";
    details: Record<string, any>;
    violations?: string[];
  }): OperationLogEntry {
    return this.logOperation({
      category: "compliance_check",
      operation: "compliance_audit",
      description: `${params.framework} compliance check: ${params.checkType}`,
      severity:
        params.result === "fail"
          ? "critical"
          : params.result === "warning"
            ? "warning"
            : "info",
      clinicId: params.clinicId,
      userId: params.userId,
      complianceFrameworks: [params.framework],
      dataProcessingPurpose: "audit",
      personalDataInvolved: params.framework === "LGPD",
      sensitiveDataLevel: "medium",
      anonymizationApplied: true,
      consentStatus: "valid",
      environmentType: "production",
      regulatoryFlags: params.violations || [],
      tags: ["compliance", params.framework.toLowerCase(), params.result],
      metadata: {
        checkType: params.checkType,
        result: params.result,
        details: params.details,
        violations: params.violations,
      },
    });
  }

  /**
   * Logs a security event
   */
  logSecurityEvent(params: {
    clinicId: string;
    userId?: string;
    eventType: string;
    severity: OperationSeverity;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    threatLevel?: "low" | "medium" | "high" | "critical";
    blocked?: boolean;
  }): OperationLogEntry {
    return this.logOperation({
      category: "security_event",
      operation: params.eventType,
      description: params.description,
      severity: params.severity,
      clinicId: params.clinicId,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      complianceFrameworks: ["LGPD"],
      dataProcessingPurpose: "audit",
      personalDataInvolved: Boolean(params.userId),
      sensitiveDataLevel:
        params.threatLevel === "critical" ? "critical" : "medium",
      anonymizationApplied: true,
      consentStatus: "valid",
      environmentType: "production",
      regulatoryFlags: params.blocked
        ? ["SECURITY_BLOCKED"]
        : ["SECURITY_MONITORED"],
      tags: [
        "security",
        params.eventType,
        ...(params.threatLevel ? [params.threatLevel] : []),
      ],
      metadata: {
        threatLevel: params.threatLevel,
        blocked: params.blocked,
        eventType: params.eventType,
      },
    });
  }

  // ================================================
  // QUERY AND RETRIEVAL
  // ================================================

  /**
   * Queries log entries with filters
   */
  queryLogs(filters: LogQueryFilters): OperationLogEntry[] {
    let entries = Array.from(this._entries.values());

    // Apply date filters
    if (filters.startDate) {
      entries = entries.filter((e) => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      entries = entries.filter((e) => e.timestamp <= filters.endDate!);
    }

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      entries = entries.filter((e) => filters.categories!.includes(e.category));
    }

    // Apply severity filters
    if (filters.severities && filters.severities.length > 0) {
      entries = entries.filter((e) => filters.severities!.includes(e.severity));
    }

    // Apply clinic filters
    if (filters.clinicIds && filters.clinicIds.length > 0) {
      entries = entries.filter((e) => filters.clinicIds!.includes(e.clinicId));
    }

    // Apply user filters
    if (filters.userIds && filters.userIds.length > 0) {
      entries = entries.filter(
        (e) => e.userId && filters.userIds!.includes(e.userId),
      );
    }

    // Apply operation filters
    if (filters.operations && filters.operations.length > 0) {
      entries = entries.filter((e) =>
        filters.operations!.includes(e.operation),
      );
    }

    // Apply compliance filters
    if (
      filters.complianceFrameworks &&
      filters.complianceFrameworks.length > 0
    ) {
      entries = entries.filter((e) =>
        e.complianceFrameworks.some((f) =>
          filters.complianceFrameworks!.includes(f),
        ),
      );
    }

    // Apply personal data filter
    if (filters.personalDataOnly) {
      entries = entries.filter((e) => e.personalDataInvolved);
    }

    // Apply error filter
    if (filters.errorOnly) {
      entries = entries.filter(
        (e) =>
          e.severity === "error" || e.severity === "critical" || e.errorDetails,
      );
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      entries = entries.filter((e) =>
        filters.tags!.some((tag) => e.tags.includes(tag)),
      );
    }

    // Apply text search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.operation.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (filters.offset) {
      entries = entries.slice(filters.offset);
    }
    if (filters.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  /**
   * Gets a specific log entry by ID
   */
  getLogEntry(id: string): OperationLogEntry | null {
    return this._entries.get(id) || null;
  }

  /**
   * Gets recent log entries for a user
   */
  getRecentUserActivity(
    userId: string,
    limit: number = 50,
  ): OperationLogEntry[] {
    return this.queryLogs({
      userIds: [userId],
      limit,
    });
  }

  /**
   * Gets compliance-related log entries
   */
  getComplianceLogs(
    framework: ComplianceFramework,
    startDate?: Date,
    endDate?: Date,
  ): OperationLogEntry[] {
    return this.queryLogs({
      complianceFrameworks: [framework],
      startDate,
      endDate,
    });
  }

  /**
   * Gets security events
   */
  getSecurityEvents(
    severity?: OperationSeverity,
    limit?: number,
  ): OperationLogEntry[] {
    return this.queryLogs({
      categories: ["security_event"],
      severities: severity ? [severity] : undefined,
      limit,
    });
  }

  // ================================================
  // ANALYTICS AND AGGREGATION
  // ================================================

  /**
   * Gets log aggregations by period
   */
  getAggregations(
    period: "hour" | "day" | "week" | "month",
    startDate?: Date,
    endDate?: Date,
  ): LogAggregation[] {
    return Array.from(this._aggregations.values())
      .filter((agg) => agg.period === period)
      .filter((agg) => !startDate || agg.timestamp >= startDate)
      .filter((agg) => !endDate || agg.timestamp <= endDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Gets compliance summary
   */
  getComplianceSummary(
    startDate?: Date,
    endDate?: Date,
  ): {
    totalEvents: number;
    byFramework: Record<ComplianceFramework, number>;
    personalDataEvents: number;
    consentIssues: number;
    violations: string[];
    complianceScore: number;
  } {
    const complianceLogs = this.queryLogs({
      startDate,
      endDate,
    }).filter((log) => log.complianceFrameworks.length > 0);

    const byFramework: Record<ComplianceFramework, number> = {
      LGPD: 0,
      CFM: 0,
      ANVISA: 0,
      ISO27001: 0,
      HIPAA: 0,
    };

    let personalDataEvents = 0;
    let consentIssues = 0;
    const violations = new Set<string>();

    for (const log of complianceLogs) {
      for (const framework of log.complianceFrameworks) {
        byFramework[framework]++;
      }

      if (log.personalDataInvolved) {
        personalDataEvents++;
      }

      if (log.consentStatus !== "valid") {
        consentIssues++;
      }

      for (const flag of log.regulatoryFlags) {
        violations.add(flag);
      }
    }

    const complianceScore =
      complianceLogs.length > 0
        ? Math.max(0, 100 - (consentIssues / complianceLogs.length) * 100)
        : 100;

    return {
      totalEvents: complianceLogs.length,
      byFramework,
      personalDataEvents,
      consentIssues,
      violations: Array.from(violations),
      complianceScore,
    };
  }

  /**
   * Gets performance analytics
   */
  getPerformanceAnalytics(
    startDate?: Date,
    endDate?: Date,
  ): {
    averageDuration: number;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    errorRate: number;
    cacheHitRate: number;
  } {
    const entries = this.queryLogs({ startDate, endDate });

    let totalDuration = 0;
    let totalCost = 0;
    let totalTokens = 0;
    let requestCount = 0;
    let errorCount = 0;
    let cacheHits = 0;
    let durationsCount = 0;
    let cacheRequests = 0;

    for (const entry of entries) {
      if (entry.category === "ai_request") {
        requestCount++;

        if (entry.duration !== undefined) {
          totalDuration += entry.duration;
          durationsCount++;
        }

        if (entry.costUsd !== undefined) {
          totalCost += entry.costUsd;
        }

        if (entry.tokensUsed !== undefined) {
          totalTokens += entry.tokensUsed;
        }

        if (entry.cacheHit !== undefined) {
          cacheRequests++;
          if (entry.cacheHit) {
            cacheHits++;
          }
        }
      }

      if (entry.severity === "error" || entry.severity === "critical") {
        errorCount++;
      }
    }

    return {
      averageDuration: durationsCount > 0 ? totalDuration / durationsCount : 0,
      totalCost,
      totalTokens,
      requestCount,
      errorRate: entries.length > 0 ? errorCount / entries.length : 0,
      cacheHitRate: cacheRequests > 0 ? cacheHits / cacheRequests : 0,
    };
  }

  // ================================================
  // HELPER METHODS
  // ================================================

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRegulatoryFlags(
    specialty?: MedicalSpecialty,
    diagnosisAssistance?: boolean,
  ): string[] {
    const flags: string[] = [];

    if (specialty) {
      flags.push("CFM_OVERSIGHT");

      if (
        ["dermatologia", "cirurgia_plastica", "cosmiatria"].includes(specialty)
      ) {
        flags.push("ANVISA_OVERSIGHT");
      }
    }

    if (diagnosisAssistance) {
      flags.push("MEDICAL_ADVICE");
    }

    return flags;
  }

  private updateAggregations(entry: OperationLogEntry): void {
    const periods: Array<"hour" | "day" | "week" | "month"> = [
      "hour",
      "day",
      "week",
      "month",
    ];

    periods.forEach((period) => {
      const key = this.getAggregationKey(entry.timestamp, period);
      const existing = this._aggregations.get(key);

      if (existing) {
        // Create new objects with updated values since properties are readonly
        const updatedCounts = {
          total: existing.counts.total + 1,
          byCategory: {
            ...existing.counts.byCategory,
            [entry.category]:
              (existing.counts.byCategory[entry.category] || 0) + 1,
          },
          bySeverity: {
            ...existing.counts.bySeverity,
            [entry.severity]:
              (existing.counts.bySeverity[entry.severity] || 0) + 1,
          },
          errors:
            existing.counts.errors +
            (entry.severity === "error" || entry.severity === "critical"
              ? 1
              : 0),
          complianceEvents:
            existing.counts.complianceEvents +
            (entry.complianceFrameworks.length > 0 ? 1 : 0),
        };

        const updatedPerformance = {
          averageDuration:
            entry.duration !== undefined
              ? (existing.performance.averageDuration + entry.duration) / 2
              : existing.performance.averageDuration,
          totalCost: existing.performance.totalCost + (entry.costUsd || 0),
          totalTokens:
            existing.performance.totalTokens + (entry.tokensUsed || 0),
        };

        const updatedCompliance = {
          personalDataEvents:
            existing.compliance.personalDataEvents +
            (entry.personalDataInvolved ? 1 : 0),
          consentIssues:
            existing.compliance.consentIssues +
            (entry.consentStatus !== "valid" ? 1 : 0),
          regulatoryFlags: [
            ...new Set([
              ...existing.compliance.regulatoryFlags,
              ...entry.regulatoryFlags,
            ]),
          ],
        };

        // Replace the entire aggregation object
        const updatedAggregation: LogAggregation = {
          ...existing,
          counts: updatedCounts,
          performance: updatedPerformance,
          compliance: updatedCompliance,
        };

        this._aggregations.set(key, updatedAggregation);
      } else {
        const aggregation: LogAggregation = {
          period,
          timestamp: this.getPeriodStart(entry.timestamp, period),
          counts: {
            total: 1,
            byCategory: {
              ai_request: 0,
              plan_change: 0,
              user_action: 0,
              system_event: 0,
              compliance_check: 0,
              security_event: 0,
              billing_event: 0,
              data_processing: 0,
              admin_action: 0,
              [entry.category]: 1,
            },
            bySeverity: {
              info: 0,
              warning: 0,
              error: 0,
              critical: 0,
              [entry.severity]: 1,
            },
            errors:
              entry.severity === "error" || entry.severity === "critical"
                ? 1
                : 0,
            complianceEvents: entry.complianceFrameworks.length > 0 ? 1 : 0,
          },
          performance: {
            averageDuration: entry.duration || 0,
            totalCost: entry.costUsd || 0,
            totalTokens: entry.tokensUsed || 0,
          },
          compliance: {
            personalDataEvents: entry.personalDataInvolved ? 1 : 0,
            consentIssues: entry.consentStatus !== "valid" ? 1 : 0,
            regulatoryFlags: [...entry.regulatoryFlags],
          },
        };

        this._aggregations.set(key, aggregation);
      }
    });
  }

  private getAggregationKey(
    date: Date,
    period: "hour" | "day" | "week" | "month",
  ): string {
    const d = new Date(date);

    switch (period) {
      case "hour":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case "day":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      case "month":
        return `${d.getFullYear()}-${d.getMonth()}`;
    }
  }

  private getPeriodStart(
    date: Date,
    period: "hour" | "day" | "week" | "month",
  ): Date {
    const d = new Date(date);

    switch (period) {
      case "hour":
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
        );
      case "day":
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate(),
        );
      case "month":
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
  }

  private triggerCriticalAlert(entry: OperationLogEntry): void {
    // In a real implementation, this would integrate with alerting systems
    console.warn(`CRITICAL OPERATION LOGGED:`, {
      id: entry.id,
      operation: entry.operation,
      clinicId: entry.clinicId,
      timestamp: entry.timestamp,
    });
  }

  // ================================================
  // SERIALIZATION AND EXPORT
  // ================================================

  /**
   * Exports logs for compliance reporting
   */
  exportForCompliance(
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date,
  ): {
    framework: ComplianceFramework;
    period: { start: Date; end: Date };
    totalEntries: number;
    entries: OperationLogEntry[];
    summary: ReturnType<OperationLog["getComplianceSummary"]>;
  } {
    const entries = this.getComplianceLogs(framework, startDate, endDate);

    return {
      framework,
      period: { start: startDate, end: endDate },
      totalEntries: entries.length,
      entries,
      summary: this.getComplianceSummary(startDate, endDate),
    };
  }

  /**
   * Converts to serializable object
   */
  toJSON(): {
    totalEntries: number;
    recentActivity: OperationLogEntry[];
    complianceSummary: ReturnType<OperationLog["getComplianceSummary"]>;
    performanceAnalytics: ReturnType<OperationLog["getPerformanceAnalytics"]>;
  } {
    return {
      totalEntries: this._entries.size,
      recentActivity: this.queryLogs({ limit: 100 }),
      complianceSummary: this.getComplianceSummary(),
      performanceAnalytics: this.getPerformanceAnalytics(),
    };
  }

  /**
   * Creates OperationLog instance
   */
  static create(): OperationLog {
    return new OperationLog();
  }
}
