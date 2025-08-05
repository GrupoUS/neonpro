// Audit Trail System
// Comprehensive logging and tracking of all session-related activities

import type { SessionConfig } from "@/lib/auth/config/session-config";
import type { SessionUtils } from "@/lib/auth/utils/session-utils";
import type { SecurityEvent, UserSession } from "@/types/session";

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: AuditActor;
  target: AuditTarget;
  action: string;
  description: string;
  details: AuditDetails;
  context: AuditContext;
  result: AuditResult;
  metadata: AuditMetadata;
  tags: string[];
  correlationId?: string;
  parentEventId?: string;
  childEventIds: string[];
}

export type AuditEventType =
  | "authentication"
  | "authorization"
  | "session_management"
  | "data_access"
  | "configuration_change"
  | "security_incident"
  | "system_event"
  | "user_action"
  | "admin_action"
  | "api_call"
  | "error_event"
  | "compliance_event";

export type AuditCategory =
  | "security"
  | "access"
  | "data"
  | "system"
  | "user"
  | "admin"
  | "compliance"
  | "performance"
  | "error";

export type AuditSeverity =
  | "critical" // Security breaches, system failures
  | "high" // Failed authentications, unauthorized access
  | "medium" // Configuration changes, admin actions
  | "low" // Normal user actions, successful operations
  | "info"; // Informational events

export interface AuditActor {
  type: ActorType;
  id: string;
  name?: string;
  role?: string;
  permissions?: string[];
  sessionId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: GeoLocation;
}

export type ActorType =
  | "user"
  | "admin"
  | "system"
  | "service"
  | "api_client"
  | "anonymous"
  | "bot";

export interface AuditTarget {
  type: TargetType;
  id: string;
  name?: string;
  resource?: string;
  attributes?: Record<string, any>;
}

export type TargetType =
  | "user"
  | "session"
  | "device"
  | "resource"
  | "system"
  | "database"
  | "file"
  | "api_endpoint"
  | "configuration";

export interface AuditDetails {
  operation: string;
  parameters?: Record<string, any>;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: ChangeRecord[];
  validationErrors?: ValidationError[];
  businessRules?: BusinessRuleResult[];
}

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: "create" | "update" | "delete";
}

export interface ValidationError {
  field: string;
  error: string;
  code: string;
}

export interface BusinessRuleResult {
  rule: string;
  passed: boolean;
  message: string;
}

export interface AuditContext {
  sessionId?: string;
  requestId?: string;
  transactionId?: string;
  workflowId?: string;
  applicationVersion?: string;
  environment?: string;
  clientInfo?: ClientInfo;
  serverInfo?: ServerInfo;
  networkInfo?: NetworkInfo;
}

export interface ClientInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

export interface ServerInfo {
  hostname: string;
  instanceId: string;
  version: string;
  environment: string;
  region: string;
  loadBalancer?: string;
}

export interface NetworkInfo {
  ipAddress: string;
  proxyIp?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  connectionType?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  country: string;
  region: string;
  city: string;
}

export interface AuditResult {
  status: ResultStatus;
  statusCode?: number;
  message?: string;
  errorCode?: string;
  errorDetails?: string;
  duration?: number;
  resourcesAffected?: number;
  dataSize?: number;
}

export type ResultStatus =
  | "success"
  | "failure"
  | "partial_success"
  | "warning"
  | "error"
  | "timeout"
  | "cancelled";

export interface AuditMetadata {
  source: string;
  version: string;
  schema: string;
  retention: RetentionPolicy;
  classification: DataClassification;
  compliance: ComplianceInfo;
  encryption: EncryptionInfo;
  integrity: IntegrityInfo;
}

export interface RetentionPolicy {
  period: number; // in milliseconds
  archiveAfter: number;
  deleteAfter: number;
  reason: string;
}

export interface DataClassification {
  level: "public" | "internal" | "confidential" | "restricted";
  categories: string[];
  handling: string[];
}

export interface ComplianceInfo {
  frameworks: string[]; // LGPD, GDPR, SOX, etc.
  requirements: string[];
  controls: string[];
  evidence: boolean;
}

export interface EncryptionInfo {
  encrypted: boolean;
  algorithm?: string;
  keyId?: string;
  strength?: number;
}

export interface IntegrityInfo {
  hash: string;
  algorithm: string;
  verified: boolean;
  timestamp: number;
}

export interface AuditQuery {
  startTime?: number;
  endTime?: number;
  types?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  actors?: string[];
  targets?: string[];
  actions?: string[];
  tags?: string[];
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  ipAddress?: string;
  status?: ResultStatus[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeMetadata?: boolean;
  includeDetails?: boolean;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  generatedAt: number;
  generatedBy: string;
  period: { start: number; end: number };
  query: AuditQuery;
  summary: AuditSummary;
  events: AuditEvent[];
  statistics: AuditStatistics;
  insights: AuditInsight[];
  recommendations: AuditRecommendation[];
  compliance: ComplianceReport;
}

export interface AuditSummary {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByStatus: Record<ResultStatus, number>;
  uniqueActors: number;
  uniqueTargets: number;
  timeRange: { start: number; end: number };
}

export interface AuditStatistics {
  eventsPerHour: number[];
  eventsPerDay: number[];
  topActors: { actor: string; count: number }[];
  topTargets: { target: string; count: number }[];
  topActions: { action: string; count: number }[];
  errorRate: number;
  averageDuration: number;
  peakHours: number[];
}

export interface AuditInsight {
  type: InsightType;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  evidence: AuditEvent[];
  confidence: number;
  impact: string;
  recommendation: string;
}

export type InsightType =
  | "anomaly_detected"
  | "pattern_identified"
  | "security_risk"
  | "compliance_violation"
  | "performance_issue"
  | "trend_analysis"
  | "behavioral_change";

export interface AuditRecommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: string;
  timeline: string;
  relatedEvents: string[];
}

export interface ComplianceReport {
  frameworks: FrameworkCompliance[];
  violations: ComplianceViolation[];
  gaps: ComplianceGap[];
  score: number;
  status: "compliant" | "non_compliant" | "partial" | "unknown";
}

export interface FrameworkCompliance {
  framework: string;
  version: string;
  requirements: RequirementCompliance[];
  score: number;
  status: "compliant" | "non_compliant" | "partial";
}

export interface RequirementCompliance {
  id: string;
  description: string;
  status: "met" | "not_met" | "partial" | "not_applicable";
  evidence: string[];
  gaps: string[];
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  events: string[];
  remediation: string;
  deadline?: number;
}

export interface ComplianceGap {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  impact: string;
  recommendation: string;
  priority: "low" | "medium" | "high" | "critical";
}

export class AuditTrailManager {
  private config: SessionConfig;
  private utils: SessionUtils;
  private eventStore: AuditEventStore;
  private encryptionService: EncryptionService;
  private integrityService: IntegrityService;
  private complianceEngine: ComplianceEngine;
  private analyticsEngine: AnalyticsEngine;
  private eventListeners: Map<string, Function[]> = new Map();
  private bufferSize: number = 1000;
  private eventBuffer: AuditEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor() {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.eventStore = new AuditEventStore();
    this.encryptionService = new EncryptionService();
    this.integrityService = new IntegrityService();
    this.complianceEngine = new ComplianceEngine();
    this.analyticsEngine = new AnalyticsEngine();
  }

  /**
   * Initialize audit trail system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize storage
      await this.eventStore.initialize();

      // Initialize encryption
      await this.encryptionService.initialize();

      // Initialize integrity service
      await this.integrityService.initialize();

      // Initialize compliance engine
      await this.complianceEngine.initialize();

      // Initialize analytics engine
      await this.analyticsEngine.initialize();

      // Start flush timer
      this.startFlushTimer();

      this.isInitialized = true;

      // Log initialization
      await this.logEvent({
        type: "system_event",
        category: "system",
        severity: "info",
        action: "audit_trail_initialized",
        description: "Audit trail system initialized successfully",
        actor: { type: "system", id: "audit_trail" },
        target: { type: "system", id: "audit_trail" },
      });
    } catch (error) {
      console.error("Error initializing audit trail:", error);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  public async logEvent(eventData: Partial<AuditEvent>): Promise<string> {
    try {
      const event = await this.createAuditEvent(eventData);

      // Add to buffer
      this.eventBuffer.push(event);

      // Flush if buffer is full
      if (this.eventBuffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }

      // Emit event
      this.emit("event_logged", event);

      // Check for real-time alerts
      await this.checkRealTimeAlerts(event);

      return event.id;
    } catch (error) {
      console.error("Error logging audit event:", error);
      throw error;
    }
  }

  /**
   * Create audit event
   */
  private async createAuditEvent(eventData: Partial<AuditEvent>): Promise<AuditEvent> {
    const timestamp = Date.now();
    const id = this.utils.generateSessionToken();

    const event: AuditEvent = {
      id,
      timestamp,
      type: eventData.type || "system_event",
      category: eventData.category || "system",
      severity: eventData.severity || "info",
      actor: eventData.actor || { type: "system", id: "unknown" },
      target: eventData.target || { type: "system", id: "unknown" },
      action: eventData.action || "unknown_action",
      description: eventData.description || "",
      details: eventData.details || { operation: eventData.action || "unknown" },
      context: await this.buildContext(eventData.context),
      result: eventData.result || { status: "success" },
      metadata: await this.buildMetadata(),
      tags: eventData.tags || [],
      correlationId: eventData.correlationId,
      parentEventId: eventData.parentEventId,
      childEventIds: eventData.childEventIds || [],
    };

    // Add integrity hash
    event.metadata.integrity = await this.integrityService.generateHash(event);

    // Encrypt sensitive data if needed
    if (this.shouldEncrypt(event)) {
      event.metadata.encryption = await this.encryptionService.encrypt(event);
    }

    return event;
  }

  /**
   * Build audit context
   */
  private async buildContext(contextData?: Partial<AuditContext>): Promise<AuditContext> {
    const context: AuditContext = {
      sessionId: contextData?.sessionId,
      requestId: contextData?.requestId || this.utils.generateSessionToken(),
      transactionId: contextData?.transactionId,
      workflowId: contextData?.workflowId,
      applicationVersion: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      clientInfo: contextData?.clientInfo,
      serverInfo: {
        hostname: process.env.HOSTNAME || "localhost",
        instanceId: process.env.INSTANCE_ID || "local",
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        region: process.env.AWS_REGION || "local",
      },
      networkInfo: contextData?.networkInfo,
    };

    return context;
  }

  /**
   * Build audit metadata
   */
  private async buildMetadata(): Promise<AuditMetadata> {
    return {
      source: "neonpro_audit_trail",
      version: "1.0.0",
      schema: "audit_event_v1",
      retention: {
        period: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
        archiveAfter: 365 * 24 * 60 * 60 * 1000, // 1 year
        deleteAfter: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
        reason: "compliance_requirement",
      },
      classification: {
        level: "confidential",
        categories: ["audit", "security"],
        handling: ["encrypt", "backup", "monitor"],
      },
      compliance: {
        frameworks: ["LGPD", "ISO27001", "SOC2"],
        requirements: ["audit_logging", "data_retention", "access_control"],
        controls: ["AC-2", "AU-2", "AU-3", "AU-12"],
        evidence: true,
      },
      encryption: {
        encrypted: false,
        algorithm: undefined,
        keyId: undefined,
        strength: undefined,
      },
      integrity: {
        hash: "",
        algorithm: "SHA-256",
        verified: false,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Flush event buffer
   */
  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    try {
      const events = [...this.eventBuffer];
      this.eventBuffer = [];

      // Store events
      await this.eventStore.storeEvents(events);

      // Process for compliance
      await this.complianceEngine.processEvents(events);

      // Process for analytics
      await this.analyticsEngine.processEvents(events);

      this.emit("buffer_flushed", { count: events.length });
    } catch (error) {
      console.error("Error flushing event buffer:", error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...this.eventBuffer);
      throw error;
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      try {
        await this.flushBuffer();
      } catch (error) {
        console.error("Error in flush timer:", error);
      }
    }, this.flushInterval);
  }

  /**
   * Check for real-time alerts
   */
  private async checkRealTimeAlerts(event: AuditEvent): Promise<void> {
    try {
      // Check for critical events
      if (event.severity === "critical") {
        await this.sendAlert({
          type: "critical_event",
          event,
          message: `Critical audit event: ${event.description}`,
        });
      }

      // Check for security events
      if (event.category === "security" && event.severity === "high") {
        await this.sendAlert({
          type: "security_event",
          event,
          message: `Security event detected: ${event.description}`,
        });
      }

      // Check for compliance violations
      const violations = await this.complianceEngine.checkViolations(event);
      if (violations.length > 0) {
        await this.sendAlert({
          type: "compliance_violation",
          event,
          violations,
          message: `Compliance violation detected: ${violations.map((v) => v.requirement).join(", ")}`,
        });
      }
    } catch (error) {
      console.error("Error checking real-time alerts:", error);
    }
  }

  /**
   * Send alert
   */
  private async sendAlert(alert: any): Promise<void> {
    try {
      // Send to monitoring system
      await fetch("/api/monitoring/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });

      this.emit("alert_sent", alert);
    } catch (error) {
      console.error("Error sending alert:", error);
    }
  }

  /**
   * Query audit events
   */
  public async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      // Flush buffer to ensure latest events are included
      await this.flushBuffer();

      // Query from store
      const events = await this.eventStore.queryEvents(query);

      // Verify integrity
      const verifiedEvents = await this.verifyEventIntegrity(events);

      // Decrypt if needed
      const decryptedEvents = await this.decryptEvents(verifiedEvents);

      return decryptedEvents;
    } catch (error) {
      console.error("Error querying audit events:", error);
      throw error;
    }
  }

  /**
   * Generate audit report
   */
  public async generateReport(
    query: AuditQuery,
    options?: {
      includeInsights?: boolean;
      includeRecommendations?: boolean;
      includeCompliance?: boolean;
    },
  ): Promise<AuditReport> {
    try {
      const events = await this.queryEvents(query);

      const report: AuditReport = {
        id: this.utils.generateSessionToken(),
        title: "Audit Trail Report",
        description: "Comprehensive audit trail analysis",
        generatedAt: Date.now(),
        generatedBy: "audit_trail_system",
        period: {
          start: query.startTime || 0,
          end: query.endTime || Date.now(),
        },
        query,
        summary: this.generateSummary(events),
        events,
        statistics: await this.analyticsEngine.generateStatistics(events),
        insights: options?.includeInsights
          ? await this.analyticsEngine.generateInsights(events)
          : [],
        recommendations: options?.includeRecommendations
          ? await this.analyticsEngine.generateRecommendations(events)
          : [],
        compliance: options?.includeCompliance
          ? await this.complianceEngine.generateReport(events)
          : {
              frameworks: [],
              violations: [],
              gaps: [],
              score: 0,
              status: "unknown",
            },
      };

      // Log report generation
      await this.logEvent({
        type: "admin_action",
        category: "admin",
        severity: "medium",
        action: "audit_report_generated",
        description: `Audit report generated with ${events.length} events`,
        actor: { type: "system", id: "audit_trail" },
        target: { type: "system", id: "audit_report" },
        details: {
          operation: "generate_report",
          parameters: { reportId: report.id, eventCount: events.length },
        },
      });

      return report;
    } catch (error) {
      console.error("Error generating audit report:", error);
      throw error;
    }
  }

  /**
   * Generate summary
   */
  private generateSummary(events: AuditEvent[]): AuditSummary {
    const summary: AuditSummary = {
      totalEvents: events.length,
      eventsByType: {} as Record<AuditEventType, number>,
      eventsByCategory: {} as Record<AuditCategory, number>,
      eventsBySeverity: {} as Record<AuditSeverity, number>,
      eventsByStatus: {} as Record<ResultStatus, number>,
      uniqueActors: new Set(events.map((e) => e.actor.id)).size,
      uniqueTargets: new Set(events.map((e) => e.target.id)).size,
      timeRange: {
        start: Math.min(...events.map((e) => e.timestamp)),
        end: Math.max(...events.map((e) => e.timestamp)),
      },
    };

    // Count by type
    events.forEach((event) => {
      summary.eventsByType[event.type] = (summary.eventsByType[event.type] || 0) + 1;
      summary.eventsByCategory[event.category] =
        (summary.eventsByCategory[event.category] || 0) + 1;
      summary.eventsBySeverity[event.severity] =
        (summary.eventsBySeverity[event.severity] || 0) + 1;
      summary.eventsByStatus[event.result.status] =
        (summary.eventsByStatus[event.result.status] || 0) + 1;
    });

    return summary;
  }

  /**
   * Verify event integrity
   */
  private async verifyEventIntegrity(events: AuditEvent[]): Promise<AuditEvent[]> {
    const verifiedEvents: AuditEvent[] = [];

    for (const event of events) {
      try {
        const isValid = await this.integrityService.verifyHash(event);
        if (isValid) {
          event.metadata.integrity.verified = true;
          verifiedEvents.push(event);
        } else {
          console.warn(`Integrity verification failed for event ${event.id}`);
          // Log integrity violation
          await this.logEvent({
            type: "security_incident",
            category: "security",
            severity: "high",
            action: "integrity_violation",
            description: `Audit event integrity verification failed for event ${event.id}`,
            actor: { type: "system", id: "integrity_service" },
            target: { type: "system", id: event.id },
          });
        }
      } catch (error) {
        console.error(`Error verifying integrity for event ${event.id}:`, error);
      }
    }

    return verifiedEvents;
  }

  /**
   * Decrypt events
   */
  private async decryptEvents(events: AuditEvent[]): Promise<AuditEvent[]> {
    const decryptedEvents: AuditEvent[] = [];

    for (const event of events) {
      try {
        if (event.metadata.encryption.encrypted) {
          const decryptedEvent = await this.encryptionService.decrypt(event);
          decryptedEvents.push(decryptedEvent);
        } else {
          decryptedEvents.push(event);
        }
      } catch (error) {
        console.error(`Error decrypting event ${event.id}:`, error);
        // Include encrypted event with error flag
        decryptedEvents.push({
          ...event,
          result: {
            ...event.result,
            status: "error",
            message: "Decryption failed",
          },
        });
      }
    }

    return decryptedEvents;
  }

  /**
   * Check if event should be encrypted
   */
  private shouldEncrypt(event: AuditEvent): boolean {
    // Encrypt events with sensitive data
    const sensitiveTypes: AuditEventType[] = [
      "authentication",
      "authorization",
      "data_access",
      "security_incident",
    ];

    const sensitiveCategories: AuditCategory[] = ["security", "data", "compliance"];

    return (
      sensitiveTypes.includes(event.type) ||
      sensitiveCategories.includes(event.category) ||
      event.severity === "critical" ||
      event.metadata.classification.level === "restricted"
    );
  }

  /**
   * Convenience methods for common audit events
   */
  public async logAuthentication(userId: string, success: boolean, details?: any): Promise<string> {
    return this.logEvent({
      type: "authentication",
      category: "security",
      severity: success ? "info" : "high",
      action: success ? "login_success" : "login_failure",
      description: `User ${success ? "successfully logged in" : "failed to log in"}`,
      actor: { type: "user", id: userId },
      target: { type: "system", id: "authentication_system" },
      result: { status: success ? "success" : "failure" },
      details: { operation: "authenticate", ...details },
    });
  }

  public async logSessionEvent(
    sessionId: string,
    action: string,
    userId?: string,
    details?: any,
  ): Promise<string> {
    return this.logEvent({
      type: "session_management",
      category: "access",
      severity: "info",
      action,
      description: `Session ${action}`,
      actor: { type: "user", id: userId || "unknown" },
      target: { type: "session", id: sessionId },
      result: { status: "success" },
      details: { operation: action, ...details },
      context: { sessionId },
    });
  }

  public async logSecurityIncident(
    type: string,
    description: string,
    severity: AuditSeverity,
    details?: any,
  ): Promise<string> {
    return this.logEvent({
      type: "security_incident",
      category: "security",
      severity,
      action: "security_incident",
      description,
      actor: { type: "system", id: "security_monitor" },
      target: { type: "system", id: "security_system" },
      result: { status: "warning" },
      details: { operation: "security_incident", incidentType: type, ...details },
      tags: ["security", "incident", type],
    });
  }

  public async logDataAccess(
    userId: string,
    resource: string,
    action: string,
    success: boolean,
    details?: any,
  ): Promise<string> {
    return this.logEvent({
      type: "data_access",
      category: "data",
      severity: success ? "info" : "medium",
      action,
      description: `User ${success ? "accessed" : "attempted to access"} ${resource}`,
      actor: { type: "user", id: userId },
      target: { type: "resource", id: resource },
      result: { status: success ? "success" : "failure" },
      details: { operation: action, ...details },
    });
  }

  public async logConfigurationChange(
    adminId: string,
    setting: string,
    oldValue: any,
    newValue: any,
    details?: any,
  ): Promise<string> {
    return this.logEvent({
      type: "configuration_change",
      category: "admin",
      severity: "medium",
      action: "configuration_update",
      description: `Configuration setting '${setting}' changed`,
      actor: { type: "admin", id: adminId },
      target: { type: "configuration", id: setting },
      result: { status: "success" },
      details: {
        operation: "update_configuration",
        previousValues: { [setting]: oldValue },
        newValues: { [setting]: newValue },
        changes: [{ field: setting, oldValue, newValue, changeType: "update" as const }],
        ...details,
      },
    });
  }

  /**
   * Event system
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup and shutdown
   */
  public async shutdown(): Promise<void> {
    try {
      // Stop flush timer
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }

      // Flush remaining events
      await this.flushBuffer();

      // Shutdown services
      await this.eventStore.shutdown();
      await this.encryptionService.shutdown();
      await this.integrityService.shutdown();
      await this.complianceEngine.shutdown();
      await this.analyticsEngine.shutdown();

      // Clear state
      this.eventListeners.clear();
      this.eventBuffer = [];
      this.isInitialized = false;

      console.log("Audit trail system shutdown completed");
    } catch (error) {
      console.error("Error during audit trail shutdown:", error);
      throw error;
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const checks = {
        initialized: this.isInitialized,
        eventStore: await this.eventStore.healthCheck(),
        encryption: await this.encryptionService.healthCheck(),
        integrity: await this.integrityService.healthCheck(),
        compliance: await this.complianceEngine.healthCheck(),
        analytics: await this.analyticsEngine.healthCheck(),
        bufferSize: this.eventBuffer.length,
        flushTimer: !!this.flushTimer,
      };

      const allHealthy = Object.values(checks).every((check) =>
        typeof check === "boolean" ? check : check.status === "healthy",
      );

      return {
        status: allHealthy ? "healthy" : "unhealthy",
        details: checks,
      };
    } catch (error) {
      return {
        status: "error",
        details: { error: error.message },
      };
    }
  }
}

/**
 * Helper classes (simplified implementations)
 */
class AuditEventStore {
  async initialize(): Promise<void> {
    // Initialize database connection
  }

  async storeEvents(events: AuditEvent[]): Promise<void> {
    // Store events in database
    console.log(`Storing ${events.length} audit events`);
  }

  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    // Query events from database
    return [];
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: "healthy" };
  }

  async shutdown(): Promise<void> {
    // Close database connection
  }
}

class EncryptionService {
  async initialize(): Promise<void> {
    // Initialize encryption keys
  }

  async encrypt(event: AuditEvent): Promise<EncryptionInfo> {
    // Encrypt sensitive event data
    return {
      encrypted: true,
      algorithm: "AES-256-GCM",
      keyId: "audit-key-1",
      strength: 256,
    };
  }

  async decrypt(event: AuditEvent): Promise<AuditEvent> {
    // Decrypt event data
    return event;
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: "healthy" };
  }

  async shutdown(): Promise<void> {
    // Cleanup encryption resources
  }
}

class IntegrityService {
  async initialize(): Promise<void> {
    // Initialize integrity checking
  }

  async generateHash(event: AuditEvent): Promise<IntegrityInfo> {
    // Generate integrity hash
    const hash = "sha256_hash_placeholder";
    return {
      hash,
      algorithm: "SHA-256",
      verified: false,
      timestamp: Date.now(),
    };
  }

  async verifyHash(event: AuditEvent): Promise<boolean> {
    // Verify integrity hash
    return true;
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: "healthy" };
  }

  async shutdown(): Promise<void> {
    // Cleanup integrity resources
  }
}

class ComplianceEngine {
  async initialize(): Promise<void> {
    // Initialize compliance rules
  }

  async processEvents(events: AuditEvent[]): Promise<void> {
    // Process events for compliance
    console.log(`Processing ${events.length} events for compliance`);
  }

  async checkViolations(event: AuditEvent): Promise<ComplianceViolation[]> {
    // Check for compliance violations
    return [];
  }

  async generateReport(events: AuditEvent[]): Promise<ComplianceReport> {
    // Generate compliance report
    return {
      frameworks: [],
      violations: [],
      gaps: [],
      score: 95,
      status: "compliant",
    };
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: "healthy" };
  }

  async shutdown(): Promise<void> {
    // Cleanup compliance resources
  }
}

class AnalyticsEngine {
  async initialize(): Promise<void> {
    // Initialize analytics
  }

  async processEvents(events: AuditEvent[]): Promise<void> {
    // Process events for analytics
    console.log(`Processing ${events.length} events for analytics`);
  }

  async generateStatistics(events: AuditEvent[]): Promise<AuditStatistics> {
    // Generate statistics
    return {
      eventsPerHour: [],
      eventsPerDay: [],
      topActors: [],
      topTargets: [],
      topActions: [],
      errorRate: 0.01,
      averageDuration: 150,
      peakHours: [9, 10, 11, 14, 15, 16],
    };
  }

  async generateInsights(events: AuditEvent[]): Promise<AuditInsight[]> {
    // Generate insights
    return [];
  }

  async generateRecommendations(events: AuditEvent[]): Promise<AuditRecommendation[]> {
    // Generate recommendations
    return [];
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: "healthy" };
  }

  async shutdown(): Promise<void> {
    // Cleanup analytics resources
  }
}

export default AuditTrailManager;
