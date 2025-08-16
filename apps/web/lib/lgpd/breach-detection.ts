/**
 * LGPD Data Breach Detection System
 * Implements real-time monitoring and detection of data breaches
 *
 * Features:
 * - Real-time breach detection and monitoring
 * - Automated incident response workflows
 * - Risk assessment and severity classification
 * - Notification and reporting automation
 * - Forensic data collection and preservation
 * - Compliance timeline tracking
 * - Integration with security monitoring systems
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { EventEmitter } from 'node:events';

// ============================================================================
// BREACH DETECTION TYPES & INTERFACES
// ============================================================================

/**
 * Breach Types
 */
export enum BreachType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  SYSTEM_COMPROMISE = 'system_compromise',
  INSIDER_THREAT = 'insider_threat',
  ACCIDENTAL_DISCLOSURE = 'accidental_disclosure',
  MALWARE_INFECTION = 'malware_infection',
  PHISHING_ATTACK = 'phishing_attack',
  SQL_INJECTION = 'sql_injection',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_CORRUPTION = 'data_corruption',
  SERVICE_DISRUPTION = 'service_disruption',
  CONFIGURATION_ERROR = 'configuration_error',
}

/**
 * Breach Severity Levels
 */
export enum BreachSeverity {
  CRITICAL = 'critical', // Immediate ANPD notification required
  HIGH = 'high', // 72-hour notification required
  MEDIUM = 'medium', // Internal investigation required
  LOW = 'low', // Monitoring and documentation
  INFORMATIONAL = 'informational', // Log for analysis
}

/**
 * Breach Status
 */
export enum BreachStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  CONTAINED = 'contained',
  MITIGATED = 'mitigated',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

/**
 * Data Categories Affected
 */
export enum AffectedDataCategory {
  PERSONAL_IDENTIFIERS = 'personal_identifiers',
  SENSITIVE_PERSONAL = 'sensitive_personal',
  FINANCIAL_DATA = 'financial_data',
  HEALTH_DATA = 'health_data',
  BIOMETRIC_DATA = 'biometric_data',
  LOCATION_DATA = 'location_data',
  COMMUNICATION_DATA = 'communication_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  AUTHENTICATION_DATA = 'authentication_data',
  CHILDREN_DATA = 'children_data',
}

/**
 * Detection Source Types
 */
export enum DetectionSource {
  SECURITY_MONITORING = 'security_monitoring',
  USER_REPORT = 'user_report',
  AUTOMATED_SCAN = 'automated_scan',
  THIRD_PARTY_ALERT = 'third_party_alert',
  INTERNAL_AUDIT = 'internal_audit',
  EXTERNAL_NOTIFICATION = 'external_notification',
  SYSTEM_LOG = 'system_log',
  ANOMALY_DETECTION = 'anomaly_detection',
}

/**
 * Breach Incident Interface
 */
export type BreachIncident = {
  id: string;
  title: string;
  description: string;
  type: BreachType;
  severity: BreachSeverity;
  status: BreachStatus;
  detectionSource: DetectionSource;
  detectedAt: Date;
  confirmedAt?: Date;
  containedAt?: Date;
  resolvedAt?: Date;

  // Affected data information
  affectedData: {
    categories: AffectedDataCategory[];
    estimatedRecords: number;
    confirmedRecords?: number;
    dataTypes: string[];
    systems: string[];
    locations: string[];
  };

  // Technical details
  technicalDetails: {
    attackVector?: string;
    vulnerabilityExploited?: string;
    systemsCompromised: string[];
    ipAddresses: string[];
    userAccounts: string[];
    timeframe: {
      start: Date;
      end?: Date;
    };
    indicators: {
      type: string;
      value: string;
      confidence: number;
    }[];
  };

  // Impact assessment
  impact: {
    dataSubjectsAffected: number;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    reputationalRisk: 'low' | 'medium' | 'high' | 'critical';
    financialImpact?: {
      estimated: number;
      currency: string;
    };
    operationalImpact: string;
    complianceImpact: string[];
  };

  // Response actions
  response: {
    immediateActions: {
      action: string;
      completedAt?: Date;
      assignedTo: string;
      status: 'pending' | 'in_progress' | 'completed';
    }[];
    containmentMeasures: string[];
    mitigationSteps: string[];
    recoveryActions: string[];
  };

  // Notifications and reporting
  notifications: {
    anpdNotified: boolean;
    anpdNotificationDate?: Date;
    dataSubjectsNotified: boolean;
    dataSubjectsNotificationDate?: Date;
    authoritiesNotified: string[];
    mediaNotified: boolean;
    internalNotifications: {
      recipient: string;
      notifiedAt: Date;
      method: string;
    }[];
  };

  // Investigation details
  investigation: {
    leadInvestigator: string;
    team: string[];
    forensicEvidence: {
      type: string;
      location: string;
      collectedAt: Date;
      hash?: string;
    }[];
    findings: string[];
    rootCause?: string;
    timeline: {
      timestamp: Date;
      event: string;
      source: string;
    }[];
  };

  // Compliance tracking
  compliance: {
    lgpdArticles: string[];
    notificationDeadlines: {
      authority: string;
      deadline: Date;
      completed: boolean;
      completedAt?: Date;
    }[];
    documentationRequired: string[];
    legalReview: boolean;
    legalReviewDate?: Date;
  };

  // Metadata
  createdBy: string;
  assignedTo: string;
  tags: string[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Detection Rule Interface
 */
export type DetectionRule = {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: BreachSeverity;
  enabled: boolean;

  // Rule conditions
  conditions: {
    type: 'threshold' | 'pattern' | 'anomaly' | 'correlation';
    parameters: Record<string, any>;
    timeWindow?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  }[];

  // Data sources
  dataSources: {
    type: string;
    location: string;
    fields: string[];
  }[];

  // Actions to take when rule triggers
  actions: {
    type: 'alert' | 'block' | 'quarantine' | 'notify';
    parameters: Record<string, any>;
  }[];

  // Metadata
  createdBy: string;
  lastTriggered?: Date;
  triggerCount: number;
  falsePositiveRate: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Monitoring Alert Interface
 */
export type MonitoringAlert = {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: BreachSeverity;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';

  // Alert details
  title: string;
  description: string;
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;

  // Context information
  context: {
    sourceSystem: string;
    affectedAssets: string[];
    indicators: Record<string, any>;
    metadata: Record<string, any>;
  };

  // Response tracking
  assignedTo?: string;
  escalatedTo?: string;
  escalatedAt?: Date;
  responseActions: {
    action: string;
    takenAt: Date;
    takenBy: string;
    result: string;
  }[];

  // Related incidents
  relatedIncidents: string[];

  createdAt: Date;
  updatedAt: Date;
};

/**
 * Breach Detection Events
 */
export type BreachDetectionEvents = {
  'breach:detected': { incident: BreachIncident };
  'breach:confirmed': { incident: BreachIncident };
  'breach:contained': { incident: BreachIncident };
  'breach:resolved': { incident: BreachIncident };
  'alert:triggered': { alert: MonitoringAlert };
  'alert:escalated': { alert: MonitoringAlert };
  'notification:required': {
    incident: BreachIncident;
    type: string;
    deadline: Date;
  };
  'compliance:deadline_approaching': {
    incident: BreachIncident;
    deadline: Date;
    hoursRemaining: number;
  };
};

// ============================================================================
// BREACH DETECTION SYSTEM
// ============================================================================

/**
 * Data Breach Detection and Response System
 *
 * Provides comprehensive breach detection including:
 * - Real-time monitoring and alerting
 * - Automated incident response
 * - Compliance timeline tracking
 * - Forensic evidence collection
 */
export class BreachDetectionSystem extends EventEmitter {
  private readonly incidents: Map<string, BreachIncident> = new Map();
  private readonly alerts: Map<string, MonitoringAlert> = new Map();
  private readonly rules: Map<string, DetectionRule> = new Map();
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private complianceCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: {
      monitoringIntervalMinutes: number;
      complianceCheckIntervalHours: number;
      autoEscalationEnabled: boolean;
      autoNotificationEnabled: boolean;
      forensicCollectionEnabled: boolean;
      realTimeMonitoring: boolean;
      alertThresholds: {
        critical: number;
        high: number;
        medium: number;
      };
    } = {
      monitoringIntervalMinutes: 5,
      complianceCheckIntervalHours: 1,
      autoEscalationEnabled: true,
      autoNotificationEnabled: true,
      forensicCollectionEnabled: true,
      realTimeMonitoring: true,
      alertThresholds: {
        critical: 1,
        high: 3,
        medium: 10,
      },
    },
  ) {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Initialize the breach detection system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load detection rules
      await this.loadDetectionRules();

      // Load existing incidents and alerts
      await this.loadIncidents();
      await this.loadAlerts();

      // Start monitoring intervals
      if (this.config.realTimeMonitoring) {
        this.startMonitoringInterval();
      }

      this.startComplianceCheckInterval();

      this.isInitialized = true;
      this.logActivity('system', 'breach_detection_initialized', {
        timestamp: new Date(),
        rulesLoaded: this.rules.size,
        incidentsLoaded: this.incidents.size,
        alertsLoaded: this.alerts.size,
      });
    } catch (error) {
      throw new Error(`Failed to initialize breach detection system: ${error}`);
    }
  }

  /**
   * Create new breach incident
   */
  async createIncident(
    incidentData: Omit<BreachIncident, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BreachIncident> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const incident: BreachIncident = {
      ...incidentData,
      id: this.generateId('incident'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate incident data
    this.validateIncident(incident);

    // Auto-assign severity if not provided
    if (!incident.severity) {
      incident.severity = this.calculateSeverity(incident);
    }

    // Set initial compliance deadlines
    this.setComplianceDeadlines(incident);

    // Start forensic collection if enabled
    if (this.config.forensicCollectionEnabled) {
      await this.startForensicCollection(incident);
    }

    this.incidents.set(incident.id, incident);
    await this.saveIncident(incident);

    // Trigger immediate response actions
    await this.triggerImmediateResponse(incident);

    this.emit('breach:detected', { incident });

    this.logActivity('user', 'incident_created', {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
      affectedRecords: incident.affectedData.estimatedRecords,
      createdBy: incident.createdBy,
    });

    return incident;
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: BreachStatus,
    updatedBy: string,
    notes?: string,
  ): Promise<BreachIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const previousStatus = incident.status;
    incident.status = status;
    incident.updatedAt = new Date();

    // Set status-specific timestamps
    switch (status) {
      case BreachStatus.CONFIRMED:
        incident.confirmedAt = new Date();
        break;
      case BreachStatus.CONTAINED:
        incident.containedAt = new Date();
        break;
      case BreachStatus.RESOLVED:
        incident.resolvedAt = new Date();
        break;
    }

    // Add timeline entry
    incident.investigation.timeline.push({
      timestamp: new Date(),
      event: `Status changed from ${previousStatus} to ${status}`,
      source: updatedBy,
    });

    if (notes) {
      incident.investigation.timeline.push({
        timestamp: new Date(),
        event: `Notes: ${notes}`,
        source: updatedBy,
      });
    }

    await this.saveIncident(incident);

    // Emit appropriate events
    switch (status) {
      case BreachStatus.CONFIRMED:
        this.emit('breach:confirmed', { incident });
        break;
      case BreachStatus.CONTAINED:
        this.emit('breach:contained', { incident });
        break;
      case BreachStatus.RESOLVED:
        this.emit('breach:resolved', { incident });
        break;
    }

    this.logActivity('user', 'incident_status_updated', {
      incidentId,
      previousStatus,
      newStatus: status,
      updatedBy,
    });

    return incident;
  }

  /**
   * Create monitoring alert
   */
  async createAlert(
    ruleId: string,
    alertData: Omit<
      MonitoringAlert,
      'id' | 'ruleId' | 'ruleName' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<MonitoringAlert> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Detection rule not found');
    }

    const alert: MonitoringAlert = {
      ...alertData,
      id: this.generateId('alert'),
      ruleId,
      ruleName: rule.name,
      responseActions: [],
      relatedIncidents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    await this.saveAlert(alert);

    // Update rule statistics
    rule.lastTriggered = new Date();
    rule.triggerCount++;
    await this.saveRule(rule);

    // Check for auto-escalation
    if (this.config.autoEscalationEnabled) {
      await this.checkAutoEscalation(alert);
    }

    this.emit('alert:triggered', { alert });

    this.logActivity('system', 'alert_created', {
      alertId: alert.id,
      ruleId,
      severity: alert.severity,
      sourceSystem: alert.context.sourceSystem,
    });

    return alert;
  }

  /**
   * Process security event for breach detection
   */
  async processSecurityEvent(event: {
    timestamp: Date;
    source: string;
    type: string;
    severity: string;
    data: Record<string, any>;
  }): Promise<MonitoringAlert[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const triggeredAlerts: MonitoringAlert[] = [];

    // Check event against all enabled rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      const matches = await this.evaluateRule(rule, event);
      if (matches) {
        const alert = await this.createAlert(rule.id, {
          severity: rule.severity,
          status: 'open',
          title: `${rule.name} triggered`,
          description: `Security event matched detection rule: ${rule.description}`,
          detectedAt: event.timestamp,
          context: {
            sourceSystem: event.source,
            affectedAssets: [event.source],
            indicators: event.data,
            metadata: {
              eventType: event.type,
              originalSeverity: event.severity,
            },
          },
        });

        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Get incidents with filtering
   */
  getIncidents(filters?: {
    status?: BreachStatus;
    severity?: BreachSeverity;
    type?: BreachType;
    dateRange?: { start: Date; end: Date };
  }): BreachIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.status) {
        incidents = incidents.filter((i) => i.status === filters.status);
      }
      if (filters.severity) {
        incidents = incidents.filter((i) => i.severity === filters.severity);
      }
      if (filters.type) {
        incidents = incidents.filter((i) => i.type === filters.type);
      }
      if (filters.dateRange) {
        incidents = incidents.filter(
          (i) =>
            i.detectedAt >= filters.dateRange?.start &&
            i.detectedAt <= filters.dateRange?.end,
        );
      }
    }

    return incidents.sort(
      (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime(),
    );
  }

  /**
   * Get alerts with filtering
   */
  getAlerts(filters?: {
    status?: string;
    severity?: BreachSeverity;
    ruleId?: string;
  }): MonitoringAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.status) {
        alerts = alerts.filter((a) => a.status === filters.status);
      }
      if (filters.severity) {
        alerts = alerts.filter((a) => a.severity === filters.severity);
      }
      if (filters.ruleId) {
        alerts = alerts.filter((a) => a.ruleId === filters.ruleId);
      }
    }

    return alerts.sort(
      (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime(),
    );
  }

  /**
   * Generate breach report
   */
  async generateBreachReport(
    incidentId: string,
    reportType: 'anpd' | 'internal' | 'data_subject' | 'forensic',
  ): Promise<{
    reportId: string;
    content: Record<string, any>;
    generatedAt: Date;
  }> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const reportId = this.generateId('report');
    let content: Record<string, any>;

    switch (reportType) {
      case 'anpd':
        content = this.generateANPDReport(incident);
        break;
      case 'internal':
        content = this.generateInternalReport(incident);
        break;
      case 'data_subject':
        content = this.generateDataSubjectReport(incident);
        break;
      case 'forensic':
        content = this.generateForensicReport(incident);
        break;
      default:
        throw new Error('Invalid report type');
    }

    const report = {
      reportId,
      content,
      generatedAt: new Date(),
    };

    await this.saveReport(report);

    this.logActivity('user', 'breach_report_generated', {
      incidentId,
      reportType,
      reportId,
    });

    return report;
  }

  /**
   * Calculate incident severity
   */
  private calculateSeverity(incident: BreachIncident): BreachSeverity {
    let score = 0;

    // Data sensitivity scoring
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.SENSITIVE_PERSONAL,
      )
    ) {
      score += 30;
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.FINANCIAL_DATA,
      )
    ) {
      score += 25;
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.HEALTH_DATA,
      )
    ) {
      score += 25;
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.BIOMETRIC_DATA,
      )
    ) {
      score += 20;
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.CHILDREN_DATA,
      )
    ) {
      score += 20;
    }

    // Volume scoring
    if (incident.affectedData.estimatedRecords > 100_000) {
      score += 20;
    } else if (incident.affectedData.estimatedRecords > 10_000) {
      score += 15;
    } else if (incident.affectedData.estimatedRecords > 1000) {
      score += 10;
    } else if (incident.affectedData.estimatedRecords > 100) {
      score += 5;
    }

    // Breach type scoring
    switch (incident.type) {
      case BreachType.DATA_EXFILTRATION:
      case BreachType.SYSTEM_COMPROMISE:
        score += 20;
        break;
      case BreachType.UNAUTHORIZED_ACCESS:
      case BreachType.INSIDER_THREAT:
        score += 15;
        break;
      case BreachType.ACCIDENTAL_DISCLOSURE:
        score += 10;
        break;
      default:
        score += 5;
    }

    // Determine severity based on score
    if (score >= 70) {
      return BreachSeverity.CRITICAL;
    }
    if (score >= 50) {
      return BreachSeverity.HIGH;
    }
    if (score >= 30) {
      return BreachSeverity.MEDIUM;
    }
    if (score >= 10) {
      return BreachSeverity.LOW;
    }
    return BreachSeverity.INFORMATIONAL;
  }

  /**
   * Set compliance deadlines
   */
  private setComplianceDeadlines(incident: BreachIncident): void {
    const now = new Date();

    // ANPD notification deadline (72 hours for high-risk breaches)
    if (
      incident.severity === BreachSeverity.CRITICAL ||
      incident.severity === BreachSeverity.HIGH
    ) {
      const anpdDeadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      incident.compliance.notificationDeadlines.push({
        authority: 'ANPD',
        deadline: anpdDeadline,
        completed: false,
      });
    }

    // Data subject notification deadline (varies based on risk)
    const dataSubjectDeadline = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days default
    incident.compliance.notificationDeadlines.push({
      authority: 'Data Subjects',
      deadline: dataSubjectDeadline,
      completed: false,
    });
  }

  /**
   * Start forensic collection
   */
  private async startForensicCollection(
    incident: BreachIncident,
  ): Promise<void> {
    // Collect system logs
    incident.investigation.forensicEvidence.push({
      type: 'system_logs',
      location: '/var/log/security',
      collectedAt: new Date(),
    });

    // Collect network traffic
    incident.investigation.forensicEvidence.push({
      type: 'network_traffic',
      location: '/var/log/network',
      collectedAt: new Date(),
    });

    // Collect application logs
    incident.investigation.forensicEvidence.push({
      type: 'application_logs',
      location: '/var/log/application',
      collectedAt: new Date(),
    });

    this.logActivity('system', 'forensic_collection_started', {
      incidentId: incident.id,
      evidenceCount: incident.investigation.forensicEvidence.length,
    });
  }

  /**
   * Trigger immediate response
   */
  private async triggerImmediateResponse(
    incident: BreachIncident,
  ): Promise<void> {
    // Add immediate containment actions based on incident type
    switch (incident.type) {
      case BreachType.UNAUTHORIZED_ACCESS:
        incident.response.immediateActions.push({
          action: 'Disable compromised user accounts',
          assignedTo: 'security_team',
          status: 'pending',
        });
        break;
      case BreachType.SYSTEM_COMPROMISE:
        incident.response.immediateActions.push({
          action: 'Isolate affected systems',
          assignedTo: 'security_team',
          status: 'pending',
        });
        break;
      case BreachType.DATA_EXFILTRATION:
        incident.response.immediateActions.push({
          action: 'Block suspicious network traffic',
          assignedTo: 'network_team',
          status: 'pending',
        });
        break;
    }

    // Auto-notification if enabled
    if (
      this.config.autoNotificationEnabled &&
      (incident.severity === BreachSeverity.CRITICAL ||
        incident.severity === BreachSeverity.HIGH)
    ) {
      this.emit('notification:required', {
        incident,
        type: 'immediate',
        deadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
    }
  }

  /**
   * Evaluate detection rule against event
   */
  private async evaluateRule(
    rule: DetectionRule,
    event: any,
  ): Promise<boolean> {
    // Simple rule evaluation - in a real implementation this would be more sophisticated
    for (const condition of rule.conditions) {
      switch (condition.type) {
        case 'threshold':
          if (this.evaluateThresholdCondition(condition, event)) {
            return true;
          }
          break;
        case 'pattern':
          if (this.evaluatePatternCondition(condition, event)) {
            return true;
          }
          break;
        case 'anomaly':
          if (await this.evaluateAnomalyCondition(condition, event)) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThresholdCondition(condition: any, event: any): boolean {
    const field = condition.parameters.field;
    const threshold = condition.parameters.threshold;
    const operator = condition.parameters.operator || '>=';

    const value = this.getNestedValue(event.data, field);
    if (value === undefined) {
      return false;
    }

    switch (operator) {
      case '>=':
        return value >= threshold;
      case '>':
        return value > threshold;
      case '<=':
        return value <= threshold;
      case '<':
        return value < threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Evaluate pattern condition
   */
  private evaluatePatternCondition(condition: any, event: any): boolean {
    const field = condition.parameters.field;
    const pattern = new RegExp(
      condition.parameters.pattern,
      condition.parameters.flags || 'i',
    );

    const value = this.getNestedValue(event.data, field);
    if (typeof value !== 'string') {
      return false;
    }

    return pattern.test(value);
  }

  /**
   * Evaluate anomaly condition
   */
  private async evaluateAnomalyCondition(
    condition: any,
    event: any,
  ): Promise<boolean> {
    // Simple anomaly detection - in a real implementation this would use ML
    const field = condition.parameters.field;
    const _threshold = condition.parameters.threshold || 2; // Standard deviations

    const value = this.getNestedValue(event.data, field);
    if (typeof value !== 'number') {
      return false;
    }

    // For demo purposes, consider values > 1000 as anomalous
    return value > 1000;
  }

  /**
   * Check for auto-escalation
   */
  private async checkAutoEscalation(alert: MonitoringAlert): Promise<void> {
    const threshold =
      this.config.alertThresholds[
        alert.severity as keyof typeof this.config.alertThresholds
      ];

    if (threshold && this.shouldEscalate(alert, threshold)) {
      alert.escalatedAt = new Date();
      alert.escalatedTo = 'security_manager';

      await this.saveAlert(alert);

      this.emit('alert:escalated', { alert });

      this.logActivity('system', 'alert_escalated', {
        alertId: alert.id,
        severity: alert.severity,
        escalatedTo: alert.escalatedTo,
      });
    }
  }

  /**
   * Check if alert should be escalated
   */
  private shouldEscalate(alert: MonitoringAlert, threshold: number): boolean {
    // Count similar alerts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const similarAlerts = Array.from(this.alerts.values()).filter(
      (a) =>
        a.ruleId === alert.ruleId &&
        a.detectedAt >= oneHourAgo &&
        a.status === 'open',
    );

    return similarAlerts.length >= threshold;
  }

  /**
   * Generate ANPD report
   */
  private generateANPDReport(incident: BreachIncident): Record<string, any> {
    return {
      incidentId: incident.id,
      organizationInfo: {
        name: 'NeonPro',
        cnpj: '00.000.000/0001-00',
        dpo: 'dpo@neonpro.com',
      },
      incidentDetails: {
        type: incident.type,
        detectedAt: incident.detectedAt,
        description: incident.description,
        affectedDataCategories: incident.affectedData.categories,
        estimatedAffectedRecords: incident.affectedData.estimatedRecords,
      },
      riskAssessment: {
        severity: incident.severity,
        businessImpact: incident.impact.businessImpact,
        dataSubjectsAffected: incident.impact.dataSubjectsAffected,
      },
      responseActions: {
        containmentMeasures: incident.response.containmentMeasures,
        mitigationSteps: incident.response.mitigationSteps,
      },
      timeline: incident.investigation.timeline,
    };
  }

  /**
   * Generate internal report
   */
  private generateInternalReport(
    incident: BreachIncident,
  ): Record<string, any> {
    return {
      executiveSummary: {
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        detectedAt: incident.detectedAt,
        affectedRecords: incident.affectedData.estimatedRecords,
      },
      technicalDetails: incident.technicalDetails,
      impactAssessment: incident.impact,
      responseActions: incident.response,
      investigation: incident.investigation,
      lessonsLearned: [],
      recommendations: [],
    };
  }

  /**
   * Generate data subject report
   */
  private generateDataSubjectReport(
    incident: BreachIncident,
  ): Record<string, any> {
    return {
      incidentSummary: {
        what: 'A security incident occurred that may have affected your personal data',
        when: incident.detectedAt,
        dataTypes: incident.affectedData.dataTypes,
      },
      riskToIndividuals: {
        likelihood: this.assessRiskToIndividuals(incident),
        potentialConsequences: this.getPotentialConsequences(incident),
      },
      actionsTaken: {
        containment: incident.response.containmentMeasures,
        mitigation: incident.response.mitigationSteps,
      },
      recommendedActions: this.getRecommendedActionsForDataSubjects(incident),
      contactInformation: {
        dpo: 'dpo@neonpro.com',
        supportTeam: 'security@neonpro.com',
      },
    };
  }

  /**
   * Generate forensic report
   */
  private generateForensicReport(
    incident: BreachIncident,
  ): Record<string, any> {
    return {
      incidentOverview: {
        id: incident.id,
        type: incident.type,
        detectedAt: incident.detectedAt,
        investigator: incident.investigation.leadInvestigator,
      },
      technicalAnalysis: incident.technicalDetails,
      evidenceCollection: incident.investigation.forensicEvidence,
      timeline: incident.investigation.timeline,
      findings: incident.investigation.findings,
      rootCause: incident.investigation.rootCause,
      recommendations: [],
    };
  }

  /**
   * Assess risk to individuals
   */
  private assessRiskToIndividuals(
    incident: BreachIncident,
  ): 'low' | 'medium' | 'high' {
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.SENSITIVE_PERSONAL,
      ) ||
      incident.affectedData.categories.includes(
        AffectedDataCategory.FINANCIAL_DATA,
      )
    ) {
      return 'high';
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.PERSONAL_IDENTIFIERS,
      )
    ) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get potential consequences
   */
  private getPotentialConsequences(incident: BreachIncident): string[] {
    const consequences: string[] = [];

    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.FINANCIAL_DATA,
      )
    ) {
      consequences.push('Financial fraud or identity theft');
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.SENSITIVE_PERSONAL,
      )
    ) {
      consequences.push('Discrimination or reputational damage');
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.AUTHENTICATION_DATA,
      )
    ) {
      consequences.push('Unauthorized account access');
    }

    return consequences;
  }

  /**
   * Get recommended actions for data subjects
   */
  private getRecommendedActionsForDataSubjects(
    incident: BreachIncident,
  ): string[] {
    const actions: string[] = [];

    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.AUTHENTICATION_DATA,
      )
    ) {
      actions.push('Change your password immediately');
      actions.push('Enable two-factor authentication');
    }
    if (
      incident.affectedData.categories.includes(
        AffectedDataCategory.FINANCIAL_DATA,
      )
    ) {
      actions.push('Monitor your financial accounts for suspicious activity');
      actions.push('Consider placing a fraud alert on your credit report');
    }

    actions.push('Monitor your account for unusual activity');
    actions.push('Contact us if you notice any suspicious activity');

    return actions;
  }

  /**
   * Start monitoring interval
   */
  private startMonitoringInterval(): void {
    this.monitoringInterval = setInterval(
      async () => {
        await this.performMonitoringCheck();
      },
      this.config.monitoringIntervalMinutes * 60 * 1000,
    );
  }

  /**
   * Start compliance check interval
   */
  private startComplianceCheckInterval(): void {
    this.complianceCheckInterval = setInterval(
      async () => {
        await this.performComplianceCheck();
      },
      this.config.complianceCheckIntervalHours * 60 * 60 * 1000,
    );
  }

  /**
   * Perform monitoring check
   */
  private async performMonitoringCheck(): Promise<void> {
    try {
      // Check for system health
      const openAlerts = Array.from(this.alerts.values()).filter(
        (a) => a.status === 'open',
      );

      if (openAlerts.length > 100) {
        this.logActivity('system', 'high_alert_volume', {
          openAlerts: openAlerts.length,
          timestamp: new Date(),
        });
      }

      // Check for stale incidents
      const staleIncidents = Array.from(this.incidents.values()).filter((i) => {
        const daysSinceUpdate =
          (Date.now() - i.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return i.status === BreachStatus.INVESTIGATING && daysSinceUpdate > 7;
      });

      if (staleIncidents.length > 0) {
        this.logActivity('system', 'stale_incidents_detected', {
          staleIncidents: staleIncidents.length,
          incidents: staleIncidents.map((i) => i.id),
        });
      }
    } catch (error) {
      this.logActivity('system', 'monitoring_check_error', {
        error: String(error),
      });
    }
  }

  /**
   * Perform compliance check
   */
  private async performComplianceCheck(): Promise<void> {
    try {
      const now = new Date();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // Check for approaching deadlines
      for (const incident of this.incidents.values()) {
        for (const deadline of incident.compliance.notificationDeadlines) {
          if (!deadline.completed) {
            const timeRemaining = deadline.deadline.getTime() - now.getTime();
            const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));

            if (timeRemaining <= twentyFourHours && timeRemaining > 0) {
              this.emit('compliance:deadline_approaching', {
                incident,
                deadline: deadline.deadline,
                hoursRemaining,
              });
            }
          }
        }
      }
    } catch (error) {
      this.logActivity('system', 'compliance_check_error', {
        error: String(error),
      });
    }
  }

  /**
   * Validate incident data
   */
  private validateIncident(incident: BreachIncident): void {
    if (!incident.title || incident.title.trim().length === 0) {
      throw new Error('Incident title is required');
    }

    if (!incident.description || incident.description.trim().length === 0) {
      throw new Error('Incident description is required');
    }

    if (incident.affectedData.estimatedRecords < 0) {
      throw new Error('Affected records count cannot be negative');
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Load detection rules
   */
  private async loadDetectionRules(): Promise<void> {
    // In a real implementation, this would load from database
    // For now, we'll create some sample rules
    const sampleRules: DetectionRule[] = [
      {
        id: 'rule_failed_logins',
        name: 'Multiple Failed Login Attempts',
        description: 'Detects multiple failed login attempts from same IP',
        category: 'authentication',
        severity: BreachSeverity.MEDIUM,
        enabled: true,
        conditions: [
          {
            type: 'threshold',
            parameters: {
              field: 'failed_attempts',
              threshold: 5,
              operator: '>=',
            },
            timeWindow: { value: 15, unit: 'minutes' },
          },
        ],
        dataSources: [
          {
            type: 'auth_logs',
            location: '/var/log/auth.log',
            fields: ['ip_address', 'failed_attempts', 'timestamp'],
          },
        ],
        actions: [
          {
            type: 'alert',
            parameters: { priority: 'high' },
          },
        ],
        createdBy: 'system',
        triggerCount: 0,
        falsePositiveRate: 0.1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const rule of sampleRules) {
      this.rules.set(rule.id, rule);
    }
  }

  /**
   * Load incidents
   */
  private async loadIncidents(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Load alerts
   */
  private async loadAlerts(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Save incident
   */
  private async saveIncident(incident: BreachIncident): Promise<void> {
    // In a real implementation, this would save to database
    this.incidents.set(incident.id, incident);
  }

  /**
   * Save alert
   */
  private async saveAlert(alert: MonitoringAlert): Promise<void> {
    // In a real implementation, this would save to database
    this.alerts.set(alert.id, alert);
  }

  /**
   * Save rule
   */
  private async saveRule(rule: DetectionRule): Promise<void> {
    // In a real implementation, this would save to database
    this.rules.set(rule.id, rule);
  }

  /**
   * Save report
   */
  private async saveReport(_report: any): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Log activity
   */
  private logActivity(
    _actor: string,
    _action: string,
    _details: Record<string, any>,
  ): void {}

  /**
   * Generate ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the breach detection system
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.complianceCheckInterval) {
      clearInterval(this.complianceCheckInterval);
      this.complianceCheckInterval = null;
    }

    this.removeAllListeners();
    this.isInitialized = false;

    this.logActivity('system', 'breach_detection_shutdown', {
      timestamp: new Date(),
    });
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const issues: string[] = [];

    if (!this.isInitialized) {
      issues.push('Breach detection system not initialized');
    }

    if (this.config.realTimeMonitoring && !this.monitoringInterval) {
      issues.push('Real-time monitoring not running');
    }

    if (!this.complianceCheckInterval) {
      issues.push('Compliance checking not running');
    }

    const enabledRules = Array.from(this.rules.values()).filter(
      (r) => r.enabled,
    );
    if (enabledRules.length === 0) {
      issues.push('No enabled detection rules');
    }

    const openIncidents = Array.from(this.incidents.values()).filter(
      (i) =>
        i.status !== BreachStatus.RESOLVED &&
        i.status !== BreachStatus.FALSE_POSITIVE,
    );

    if (openIncidents.length > 50) {
      issues.push(`High number of open incidents: ${openIncidents.length}`);
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        rulesCount: this.rules.size,
        enabledRules: enabledRules.length,
        incidentsCount: this.incidents.size,
        openIncidents: openIncidents.length,
        alertsCount: this.alerts.size,
        realTimeMonitoring: this.config.realTimeMonitoring,
        issues,
      },
    };
  }
}

/**
 * Default breach detection system instance
 */
export const breachDetectionSystem = new BreachDetectionSystem();

/**
 * Export types for external use
 */
export type {
  BreachIncident,
  MonitoringAlert,
  DetectionRule,
  BreachDetectionEvents,
};
