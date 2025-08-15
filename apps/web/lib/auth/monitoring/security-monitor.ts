// Real-time Security Monitoring System
// Advanced threat detection and automated response for session security

import { SessionConfig } from '@/lib/auth/config/session-config';
import type { AnomalyAlert } from '@/lib/auth/suspicious/suspicious-activity-detector';
import { SessionUtils } from '@/lib/auth/utils/session-utils';

export interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  source: ThreatSource;
  target: ThreatTarget;
  description: string;
  indicators: ThreatIndicator[];
  riskScore: number; // 0-100
  confidence: number; // 0-100
  status: ThreatStatus;
  detectedAt: number;
  resolvedAt?: number;
  mitigationActions: MitigationAction[];
  falsePositive: boolean;
}

export type ThreatType =
  | 'brute_force_attack'
  | 'credential_stuffing'
  | 'session_hijacking'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'malicious_automation'
  | 'account_takeover'
  | 'insider_threat'
  | 'ddos_attack'
  | 'sql_injection'
  | 'xss_attack'
  | 'csrf_attack'
  | 'unauthorized_access'
  | 'suspicious_behavior';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ThreatSource =
  | 'external_ip'
  | 'internal_user'
  | 'automated_bot'
  | 'unknown_device'
  | 'suspicious_location'
  | 'compromised_account'
  | 'malicious_script';

export interface ThreatTarget {
  type: 'user' | 'session' | 'endpoint' | 'system';
  id: string;
  details: Record<string, any>;
}

export interface ThreatIndicator {
  type: IndicatorType;
  value: string;
  confidence: number;
  source: string;
  timestamp: number;
}

export type IndicatorType =
  | 'ip_address'
  | 'user_agent'
  | 'session_id'
  | 'user_id'
  | 'endpoint'
  | 'behavior_pattern'
  | 'time_pattern'
  | 'location'
  | 'device_fingerprint';

export type ThreatStatus =
  | 'active'
  | 'investigating'
  | 'mitigated'
  | 'resolved'
  | 'false_positive';

export interface MitigationAction {
  id: string;
  type: MitigationType;
  description: string;
  automated: boolean;
  executedAt: number;
  result: 'success' | 'failed' | 'pending';
  details: Record<string, any>;
}

export type MitigationType =
  | 'block_ip'
  | 'suspend_session'
  | 'require_mfa'
  | 'rate_limit'
  | 'quarantine_user'
  | 'alert_admin'
  | 'log_incident'
  | 'backup_data'
  | 'isolate_system'
  | 'force_logout';

export interface SecurityMetrics {
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  falsePositives: number;
  averageResponseTime: number; // milliseconds
  threatsByType: Record<ThreatType, number>;
  threatsBySeverity: Record<ThreatSeverity, number>;
  mitigationSuccess: number; // percentage
  lastUpdated: number;
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  threatType: ThreatType;
  conditions: RuleCondition[];
  actions: AutomatedAction[];
  enabled: boolean;
  priority: number;
  cooldown: number; // milliseconds
  lastTriggered?: number;
}

export interface RuleCondition {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in_range'
    | 'regex';
  value: any;
  weight: number; // 0-1
}

export interface AutomatedAction {
  type: MitigationType;
  parameters: Record<string, any>;
  delay: number; // milliseconds
  condition?: string; // JavaScript expression
}

export interface SecurityAlert {
  id: string;
  threatId: string;
  type: AlertType;
  severity: ThreatSeverity;
  title: string;
  message: string;
  recipients: string[];
  channels: AlertChannel[];
  sentAt: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export type AlertType =
  | 'threat_detected'
  | 'mitigation_failed'
  | 'system_compromise'
  | 'data_breach';
export type AlertChannel = 'email' | 'sms' | 'slack' | 'webhook' | 'dashboard';

export class SecurityMonitor {
  private utils: SessionUtils;
  private activeThreats: Map<string, SecurityThreat> = new Map();
  private monitoringRules: Map<string, MonitoringRule> = new Map();
  private securityMetrics: SecurityMetrics;
  private alertQueue: SecurityAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.securityMetrics = this.initializeMetrics();
    this.initializeMonitoringRules();
  }

  /**
   * Initialize security metrics
   */
  private initializeMetrics(): SecurityMetrics {
    return {
      totalThreats: 0,
      activeThreats: 0,
      resolvedThreats: 0,
      falsePositives: 0,
      averageResponseTime: 0,
      threatsByType: {} as Record<ThreatType, number>,
      threatsBySeverity: {} as Record<ThreatSeverity, number>,
      mitigationSuccess: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Initialize default monitoring rules
   */
  private initializeMonitoringRules(): void {
    const rules: MonitoringRule[] = [
      {
        id: 'brute_force_detection',
        name: 'Brute Force Attack Detection',
        description: 'Detects multiple failed login attempts from same IP',
        threatType: 'brute_force_attack',
        conditions: [
          {
            field: 'failed_attempts',
            operator: 'greater_than',
            value: 5,
            weight: 0.8,
          },
          {
            field: 'time_window',
            operator: 'less_than',
            value: 300_000,
            weight: 0.6,
          }, // 5 minutes
        ],
        actions: [
          { type: 'block_ip', parameters: { duration: 3_600_000 }, delay: 0 }, // 1 hour
          {
            type: 'alert_admin',
            parameters: { priority: 'high' },
            delay: 1000,
          },
        ],
        enabled: true,
        priority: 1,
        cooldown: 60_000, // 1 minute
      },
      {
        id: 'session_hijacking_detection',
        name: 'Session Hijacking Detection',
        description: 'Detects suspicious session usage patterns',
        threatType: 'session_hijacking',
        conditions: [
          {
            field: 'location_change',
            operator: 'equals',
            value: true,
            weight: 0.7,
          },
          {
            field: 'device_change',
            operator: 'equals',
            value: true,
            weight: 0.6,
          },
          {
            field: 'user_agent_change',
            operator: 'equals',
            value: true,
            weight: 0.5,
          },
        ],
        actions: [
          { type: 'suspend_session', parameters: {}, delay: 0 },
          { type: 'require_mfa', parameters: {}, delay: 1000 },
        ],
        enabled: true,
        priority: 2,
        cooldown: 30_000,
      },
      {
        id: 'privilege_escalation_detection',
        name: 'Privilege Escalation Detection',
        description: 'Detects unauthorized access to privileged resources',
        threatType: 'privilege_escalation',
        conditions: [
          {
            field: 'unauthorized_endpoint',
            operator: 'equals',
            value: true,
            weight: 0.9,
          },
          {
            field: 'role_mismatch',
            operator: 'equals',
            value: true,
            weight: 0.8,
          },
        ],
        actions: [
          { type: 'suspend_session', parameters: {}, delay: 0 },
          {
            type: 'alert_admin',
            parameters: { priority: 'critical' },
            delay: 500,
          },
          {
            type: 'log_incident',
            parameters: { category: 'security' },
            delay: 1000,
          },
        ],
        enabled: true,
        priority: 3,
        cooldown: 0, // No cooldown for critical threats
      },
      {
        id: 'automated_bot_detection',
        name: 'Automated Bot Detection',
        description: 'Detects bot-like behavior patterns',
        threatType: 'malicious_automation',
        conditions: [
          {
            field: 'request_frequency',
            operator: 'greater_than',
            value: 100,
            weight: 0.7,
          },
          {
            field: 'mouse_movement_pattern',
            operator: 'equals',
            value: 'bot_like',
            weight: 0.8,
          },
          {
            field: 'typing_pattern',
            operator: 'equals',
            value: 'automated',
            weight: 0.6,
          },
        ],
        actions: [
          {
            type: 'rate_limit',
            parameters: { limit: 10, window: 60_000 },
            delay: 0,
          },
          { type: 'require_mfa', parameters: {}, delay: 2000 },
        ],
        enabled: true,
        priority: 4,
        cooldown: 120_000, // 2 minutes
      },
      {
        id: 'data_exfiltration_detection',
        name: 'Data Exfiltration Detection',
        description: 'Detects unusual data access patterns',
        threatType: 'data_exfiltration',
        conditions: [
          {
            field: 'data_volume',
            operator: 'greater_than',
            value: 1_000_000,
            weight: 0.8,
          }, // 1MB
          {
            field: 'access_frequency',
            operator: 'greater_than',
            value: 50,
            weight: 0.6,
          },
          {
            field: 'off_hours_access',
            operator: 'equals',
            value: true,
            weight: 0.5,
          },
        ],
        actions: [
          { type: 'quarantine_user', parameters: {}, delay: 0 },
          { type: 'backup_data', parameters: {}, delay: 1000 },
          {
            type: 'alert_admin',
            parameters: { priority: 'critical' },
            delay: 500,
          },
        ],
        enabled: true,
        priority: 5,
        cooldown: 0,
      },
    ];

    rules.forEach((rule) => {
      this.monitoringRules.set(rule.id, rule);
    });
  }

  /**
   * Start security monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performSecurityScan();
    }, 10_000); // Scan every 10 seconds

    console.log('Security monitoring started');
    this.emit('monitoring_started', { timestamp: Date.now() });
  }

  /**
   * Stop security monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Security monitoring stopped');
    this.emit('monitoring_stopped', { timestamp: Date.now() });
  }

  /**
   * Perform comprehensive security scan
   */
  private async performSecurityScan(): Promise<void> {
    try {
      // Get recent anomalies from suspicious activity detector
      const recentAnomalies = await this.getRecentAnomalies();

      // Analyze each anomaly for potential threats
      for (const anomaly of recentAnomalies) {
        await this.analyzeAnomalyForThreats(anomaly);
      }

      // Check active sessions for threats
      await this.scanActiveSessions();

      // Process threat queue
      await this.processThreatQueue();

      // Update security metrics
      this.updateSecurityMetrics();

      // Send pending alerts
      await this.processPendingAlerts();
    } catch (error) {
      console.error('Error in security scan:', error);
    }
  }

  /**
   * Get recent anomalies from suspicious activity detector
   */
  private async getRecentAnomalies(): Promise<AnomalyAlert[]> {
    // This would typically fetch from database or cache
    // For now, we'll simulate with recent data
    return [];
  }

  /**
   * Analyze anomaly for potential security threats
   */
  private async analyzeAnomalyForThreats(anomaly: AnomalyAlert): Promise<void> {
    try {
      const threatType = this.mapAnomalyToThreatType(anomaly.alertType);
      const threat = await this.createThreatFromAnomaly(anomaly, threatType);

      if (threat) {
        await this.processThreat(threat);
      }
    } catch (error) {
      console.error('Error analyzing anomaly for threats:', error);
    }
  }

  /**
   * Create threat from anomaly
   */
  private async createThreatFromAnomaly(
    anomaly: AnomalyAlert,
    threatType: ThreatType
  ): Promise<SecurityThreat | null> {
    try {
      const threat: SecurityThreat = {
        id: this.utils.generateSessionToken(),
        type: threatType,
        severity: anomaly.severity,
        source: this.determineThreatSource(anomaly),
        target: {
          type: 'user',
          id: anomaly.userId,
          details: { sessionId: anomaly.sessionId },
        },
        description: `Security threat detected: ${anomaly.description}`,
        indicators: this.extractThreatIndicators(anomaly),
        riskScore: anomaly.riskScore,
        confidence: anomaly.evidence.statisticalSignificance,
        status: 'active',
        detectedAt: Date.now(),
        mitigationActions: [],
        falsePositive: false,
      };

      return threat;
    } catch (error) {
      console.error('Error creating threat from anomaly:', error);
      return null;
    }
  }

  /**
   * Process detected threat
   */
  private async processThreat(threat: SecurityThreat): Promise<void> {
    try {
      // Store threat
      this.activeThreats.set(threat.id, threat);

      // Find applicable monitoring rules
      const applicableRules = this.findApplicableRules(threat);

      // Execute automated actions
      for (const rule of applicableRules) {
        if (this.canTriggerRule(rule)) {
          await this.executeRuleActions(rule, threat);
          rule.lastTriggered = Date.now();
        }
      }

      // Create security alert
      await this.createSecurityAlert(threat);

      // Log security event
      await this.logSecurityEvent(threat);

      // Emit threat detected event
      this.emit('threat_detected', threat);

      console.log(
        `Security threat detected: ${threat.type} (Risk: ${threat.riskScore})`
      );
    } catch (error) {
      console.error('Error processing threat:', error);
    }
  }

  /**
   * Execute rule actions for threat
   */
  private async executeRuleActions(
    rule: MonitoringRule,
    threat: SecurityThreat
  ): Promise<void> {
    for (const action of rule.actions) {
      try {
        // Apply delay if specified
        if (action.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, action.delay));
        }

        // Check condition if specified
        if (
          action.condition &&
          !this.evaluateCondition(action.condition, threat)
        ) {
          continue;
        }

        // Execute mitigation action
        const mitigationAction = await this.executeMitigationAction(
          action.type,
          action.parameters,
          threat
        );

        if (mitigationAction) {
          threat.mitigationActions.push(mitigationAction);
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  /**
   * Execute mitigation action
   */
  private async executeMitigationAction(
    type: MitigationType,
    parameters: Record<string, any>,
    threat: SecurityThreat
  ): Promise<MitigationAction | null> {
    try {
      const action: MitigationAction = {
        id: this.utils.generateSessionToken(),
        type,
        description: `Automated ${type} action for threat ${threat.id}`,
        automated: true,
        executedAt: Date.now(),
        result: 'pending',
        details: parameters,
      };

      switch (type) {
        case 'block_ip':
          await this.blockIpAddress(threat, parameters);
          action.result = 'success';
          break;

        case 'suspend_session':
          await this.suspendSession(
            threat.target.details.sessionId,
            `Security threat: ${threat.type}`
          );
          action.result = 'success';
          break;

        case 'require_mfa':
          await this.requireMfa(threat.target.details.sessionId);
          action.result = 'success';
          break;

        case 'rate_limit':
          await this.applyRateLimit(threat, parameters);
          action.result = 'success';
          break;

        case 'quarantine_user':
          await this.quarantineUser(threat.target.id);
          action.result = 'success';
          break;

        case 'alert_admin':
          await this.alertAdministrators(threat, parameters);
          action.result = 'success';
          break;

        case 'log_incident':
          await this.logIncident(threat, parameters);
          action.result = 'success';
          break;

        case 'backup_data':
          await this.backupUserData(threat.target.id);
          action.result = 'success';
          break;

        case 'isolate_system':
          await this.isolateSystem(threat);
          action.result = 'success';
          break;

        case 'force_logout':
          await this.forceLogout(threat.target.id);
          action.result = 'success';
          break;

        default:
          action.result = 'failed';
          action.details.error = 'Unknown mitigation type';
      }

      return action;
    } catch (error) {
      console.error(`Error executing mitigation action ${type}:`, error);
      return {
        id: this.utils.generateSessionToken(),
        type,
        description: `Failed ${type} action for threat ${threat.id}`,
        automated: true,
        executedAt: Date.now(),
        result: 'failed',
        details: { error: error.message, ...parameters },
      };
    }
  }

  /**
   * Mitigation action implementations
   */
  private async blockIpAddress(
    threat: SecurityThreat,
    parameters: Record<string, any>
  ): Promise<void> {
    const ipIndicator = threat.indicators.find((i) => i.type === 'ip_address');
    if (ipIndicator) {
      await fetch('/api/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: ipIndicator.value,
          duration: parameters.duration || 3_600_000,
          reason: `Security threat: ${threat.type}`,
        }),
      });
    }
  }

  private async suspendSession(
    sessionId: string,
    reason: string
  ): Promise<void> {
    await fetch('/api/session/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, reason }),
    });
  }

  private async requireMfa(sessionId: string): Promise<void> {
    await fetch('/api/session/require-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  }

  private async applyRateLimit(
    threat: SecurityThreat,
    parameters: Record<string, any>
  ): Promise<void> {
    await fetch('/api/security/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: threat.target.id,
        limit: parameters.limit || 10,
        window: parameters.window || 60_000,
      }),
    });
  }

  private async quarantineUser(userId: string): Promise<void> {
    await fetch('/api/users/quarantine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }

  private async alertAdministrators(
    threat: SecurityThreat,
    parameters: Record<string, any>
  ): Promise<void> {
    await fetch('/api/security/alert-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threatId: threat.id,
        priority: parameters.priority || 'medium',
        message: threat.description,
      }),
    });
  }

  private async logIncident(
    threat: SecurityThreat,
    parameters: Record<string, any>
  ): Promise<void> {
    await fetch('/api/security/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threatId: threat.id,
        category: parameters.category || 'security',
        severity: threat.severity,
        details: threat,
      }),
    });
  }

  private async backupUserData(userId: string): Promise<void> {
    await fetch('/api/users/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }

  private async isolateSystem(threat: SecurityThreat): Promise<void> {
    console.log(`System isolation triggered for threat ${threat.id}`);
    // Implementation would depend on infrastructure
  }

  private async forceLogout(userId: string): Promise<void> {
    await fetch('/api/users/force-logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }

  /**
   * Utility methods
   */
  private mapAnomalyToThreatType(anomalyType: string): ThreatType {
    const mapping: Record<string, ThreatType> = {
      unusual_typing_pattern: 'suspicious_behavior',
      abnormal_mouse_behavior: 'malicious_automation',
      suspicious_navigation: 'unauthorized_access',
      unusual_api_usage: 'privilege_escalation',
      off_hours_access: 'insider_threat',
      location_anomaly: 'account_takeover',
      device_anomaly: 'session_hijacking',
      rapid_actions: 'malicious_automation',
      bot_like_behavior: 'malicious_automation',
      credential_stuffing: 'credential_stuffing',
      session_hijacking: 'session_hijacking',
      privilege_escalation: 'privilege_escalation',
    };
    return mapping[anomalyType] || 'suspicious_behavior';
  }

  private determineThreatSource(anomaly: AnomalyAlert): ThreatSource {
    if (anomaly.alertType.includes('location')) return 'suspicious_location';
    if (anomaly.alertType.includes('device')) return 'unknown_device';
    if (anomaly.alertType.includes('bot')) return 'automated_bot';
    if (anomaly.alertType.includes('credential')) return 'compromised_account';
    return 'internal_user';
  }

  private extractThreatIndicators(anomaly: AnomalyAlert): ThreatIndicator[] {
    const indicators: ThreatIndicator[] = [];

    // Extract indicators from anomaly evidence
    if (anomaly.evidence.comparisonData) {
      Object.entries(anomaly.evidence.comparisonData).forEach(
        ([key, value]) => {
          indicators.push({
            type: this.mapFieldToIndicatorType(key),
            value: String(value),
            confidence: anomaly.evidence.statisticalSignificance,
            source: 'anomaly_detector',
            timestamp: anomaly.timestamp,
          });
        }
      );
    }

    return indicators;
  }

  private mapFieldToIndicatorType(field: string): IndicatorType {
    const mapping: Record<string, IndicatorType> = {
      ip: 'ip_address',
      userAgent: 'user_agent',
      sessionId: 'session_id',
      userId: 'user_id',
      endpoint: 'endpoint',
      behavior: 'behavior_pattern',
      time: 'time_pattern',
      location: 'location',
      device: 'device_fingerprint',
    };
    return mapping[field] || 'behavior_pattern';
  }

  private findApplicableRules(threat: SecurityThreat): MonitoringRule[] {
    return Array.from(this.monitoringRules.values())
      .filter((rule) => rule.enabled && rule.threatType === threat.type)
      .sort((a, b) => a.priority - b.priority);
  }

  private canTriggerRule(rule: MonitoringRule): boolean {
    if (!rule.lastTriggered) return true;
    return Date.now() - rule.lastTriggered >= rule.cooldown;
  }

  private evaluateCondition(
    condition: string,
    _threat: SecurityThreat
  ): boolean {
    try {
      // Simple condition evaluation - in production, use a proper expression evaluator
      return eval(condition.replace(/threat\./g, 'threat.'));
    } catch {
      return false;
    }
  }

  private async scanActiveSessions(): Promise<void> {
    // Implementation would scan active sessions for threats
    // This is a placeholder for the actual implementation
  }

  private async processThreatQueue(): Promise<void> {
    // Process any queued threats
    // This is a placeholder for the actual implementation
  }

  private updateSecurityMetrics(): void {
    const now = Date.now();
    const activeThreats = Array.from(this.activeThreats.values());

    this.securityMetrics = {
      totalThreats: activeThreats.length,
      activeThreats: activeThreats.filter((t) => t.status === 'active').length,
      resolvedThreats: activeThreats.filter((t) => t.status === 'resolved')
        .length,
      falsePositives: activeThreats.filter((t) => t.falsePositive).length,
      averageResponseTime: this.calculateAverageResponseTime(activeThreats),
      threatsByType: this.groupThreatsByType(activeThreats),
      threatsBySeverity: this.groupThreatsBySeverity(activeThreats),
      mitigationSuccess: this.calculateMitigationSuccess(activeThreats),
      lastUpdated: now,
    };
  }

  private calculateAverageResponseTime(threats: SecurityThreat[]): number {
    const resolvedThreats = threats.filter((t) => t.resolvedAt);
    if (resolvedThreats.length === 0) return 0;

    const totalTime = resolvedThreats.reduce((sum, t) => {
      return sum + (t.resolvedAt! - t.detectedAt);
    }, 0);

    return totalTime / resolvedThreats.length;
  }

  private groupThreatsByType(
    threats: SecurityThreat[]
  ): Record<ThreatType, number> {
    const groups: Record<ThreatType, number> = {} as Record<ThreatType, number>;
    threats.forEach((threat) => {
      groups[threat.type] = (groups[threat.type] || 0) + 1;
    });
    return groups;
  }

  private groupThreatsBySeverity(
    threats: SecurityThreat[]
  ): Record<ThreatSeverity, number> {
    const groups: Record<ThreatSeverity, number> = {} as Record<
      ThreatSeverity,
      number
    >;
    threats.forEach((threat) => {
      groups[threat.severity] = (groups[threat.severity] || 0) + 1;
    });
    return groups;
  }

  private calculateMitigationSuccess(threats: SecurityThreat[]): number {
    const threatsWithActions = threats.filter(
      (t) => t.mitigationActions.length > 0
    );
    if (threatsWithActions.length === 0) return 0;

    const successfulActions = threatsWithActions.reduce((sum, t) => {
      return (
        sum + t.mitigationActions.filter((a) => a.result === 'success').length
      );
    }, 0);

    const totalActions = threatsWithActions.reduce(
      (sum, t) => sum + t.mitigationActions.length,
      0
    );

    return totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;
  }

  private async createSecurityAlert(threat: SecurityThreat): Promise<void> {
    const alert: SecurityAlert = {
      id: this.utils.generateSessionToken(),
      threatId: threat.id,
      type: 'threat_detected',
      severity: threat.severity,
      title: `Security Threat Detected: ${threat.type}`,
      message: threat.description,
      recipients: ['security@company.com'], // Configure as needed
      channels: ['email', 'dashboard'],
      sentAt: Date.now(),
      acknowledged: false,
    };

    this.alertQueue.push(alert);
  }

  private async processPendingAlerts(): Promise<void> {
    while (this.alertQueue.length > 0) {
      const alert = this.alertQueue.shift()!;
      await this.sendAlert(alert);
    }
  }

  private async sendAlert(alert: SecurityAlert): Promise<void> {
    try {
      await fetch('/api/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Error sending security alert:', error);
      // Re-queue alert for retry
      this.alertQueue.push(alert);
    }
  }

  private async logSecurityEvent(threat: SecurityThreat): Promise<void> {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'threat_detected',
          severity: threat.severity,
          userId: threat.target.id,
          sessionId: threat.target.details.sessionId,
          description: threat.description,
          metadata: {
            threatId: threat.id,
            threatType: threat.type,
            riskScore: threat.riskScore,
            indicators: threat.indicators,
            mitigationActions: threat.mitigationActions,
          },
        }),
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Event system
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
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
   * Public API methods
   */
  public getActiveThreats(): SecurityThreat[] {
    return Array.from(this.activeThreats.values()).filter(
      (threat) => threat.status === 'active'
    );
  }

  public getThreatById(threatId: string): SecurityThreat | undefined {
    return this.activeThreats.get(threatId);
  }

  public resolveThreat(threatId: string, falsePositive = false): boolean {
    const threat = this.activeThreats.get(threatId);
    if (threat) {
      threat.status = 'resolved';
      threat.resolvedAt = Date.now();
      threat.falsePositive = falsePositive;
      this.emit('threat_resolved', threat);
      return true;
    }
    return false;
  }

  public getSecurityMetrics(): SecurityMetrics {
    return { ...this.securityMetrics };
  }

  public addMonitoringRule(rule: MonitoringRule): void {
    this.monitoringRules.set(rule.id, rule);
  }

  public removeMonitoringRule(ruleId: string): boolean {
    return this.monitoringRules.delete(ruleId);
  }

  public getMonitoringRules(): MonitoringRule[] {
    return Array.from(this.monitoringRules.values());
  }

  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  public cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean up old threats
    for (const [id, threat] of this.activeThreats.entries()) {
      if (threat.status === 'resolved' && now - threat.detectedAt > maxAge) {
        this.activeThreats.delete(id);
      }
    }
  }

  public destroy(): void {
    this.stopMonitoring();
    this.activeThreats.clear();
    this.monitoringRules.clear();
    this.eventListeners.clear();
    this.alertQueue.length = 0;
  }
}

// Singleton instance
let securityMonitor: SecurityMonitor | null = null;

export function getSecurityMonitor(): SecurityMonitor {
  if (!securityMonitor) {
    securityMonitor = new SecurityMonitor();
  }
  return securityMonitor;
}

export default SecurityMonitor;
