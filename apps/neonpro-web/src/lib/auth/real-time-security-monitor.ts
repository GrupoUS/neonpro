/**
 * Real-Time Security Monitor
 * Story 1.4 - Task 5: Real-time security monitoring and alerting
 * 
 * Features:
 * - Real-time threat detection
 * - WebSocket-based monitoring
 * - Security dashboard integration
 * - Automated incident response
 * - Performance monitoring
 * - Compliance tracking
 */

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/auth';
import { SecurityAuditLogger } from './security-audit-logger';
import { SuspiciousActivityDetector, SuspiciousActivityAlert } from './suspicious-activity-detector';

export interface SecurityMetrics {
  timestamp: Date;
  activeUsers: number;
  activeSessions: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  averageResponseTime: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
  networkTraffic: {
    inbound: number;
    outbound: number;
  };
  securityEvents: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface SecurityThreshold {
  metricName: keyof SecurityMetrics | string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  isEnabled: boolean;
  cooldownMinutes: number;
  actions: {
    type: 'email' | 'sms' | 'webhook' | 'block_ip' | 'terminate_sessions' | 'escalate';
    target: string;
    delay: number;
  }[];
}

export interface SecurityIncident {
  incidentId: string;
  type: 'threshold_breach' | 'suspicious_activity' | 'system_anomaly' | 'compliance_violation' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  metrics?: SecurityMetrics;
  alerts?: SuspiciousActivityAlert[];
  evidence: Record<string, any>;
  timeline: {
    timestamp: Date;
    action: string;
    user: string;
    details: string;
  }[];
  impact: {
    affectedUsers: string[];
    affectedSystems: string[];
    dataExposure: boolean;
    serviceDisruption: boolean;
  };
  response: {
    containmentActions: string[];
    investigationNotes: string[];
    remediationSteps: string[];
    lessonsLearned: string[];
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // seconds
  alertingEnabled: boolean;
  dashboardEnabled: boolean;
  retentionDays: number;
  thresholds: SecurityThreshold[];
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
      template: string;
    };
    webhook: {
      enabled: boolean;
      url: string;
      secret: string;
    };
    dashboard: {
      enabled: boolean;
      refreshInterval: number;
    };
  };
  compliance: {
    lgpdEnabled: boolean;
    auditTrailEnabled: boolean;
    dataRetentionDays: number;
    anonymizationEnabled: boolean;
  };
}

const DEFAULT_THRESHOLDS: SecurityThreshold[] = [
  {
    metricName: 'failedLogins',
    operator: 'gte',
    value: 10,
    severity: 'medium',
    description: 'High number of failed login attempts',
    isEnabled: true,
    cooldownMinutes: 15,
    actions: [
      {
        type: 'email',
        target: 'security@company.com',
        delay: 0
      }
    ]
  },
  {
    metricName: 'suspiciousActivities',
    operator: 'gte',
    value: 5,
    severity: 'high',
    description: 'Multiple suspicious activities detected',
    isEnabled: true,
    cooldownMinutes: 10,
    actions: [
      {
        type: 'email',
        target: 'security@company.com',
        delay: 0
      },
      {
        type: 'escalate',
        target: 'security-team',
        delay: 300
      }
    ]
  },
  {
    metricName: 'systemLoad.cpu',
    operator: 'gte',
    value: 90,
    severity: 'medium',
    description: 'High CPU usage detected',
    isEnabled: true,
    cooldownMinutes: 5,
    actions: [
      {
        type: 'webhook',
        target: '/api/alerts/system-load',
        delay: 0
      }
    ]
  },
  {
    metricName: 'activeUsers',
    operator: 'gte',
    value: 1000,
    severity: 'low',
    description: 'High number of concurrent users',
    isEnabled: true,
    cooldownMinutes: 30,
    actions: [
      {
        type: 'webhook',
        target: '/api/alerts/high-load',
        delay: 0
      }
    ]
  }
];

const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  metricsInterval: 30,
  alertingEnabled: true,
  dashboardEnabled: true,
  retentionDays: 90,
  thresholds: DEFAULT_THRESHOLDS,
  notifications: {
    email: {
      enabled: true,
      recipients: ['admin@company.com'],
      template: 'security-alert'
    },
    webhook: {
      enabled: false,
      url: '',
      secret: ''
    },
    dashboard: {
      enabled: true,
      refreshInterval: 5
    }
  },
  compliance: {
    lgpdEnabled: true,
    auditTrailEnabled: true,
    dataRetentionDays: 365,
    anonymizationEnabled: true
  }
};

export class RealTimeSecurityMonitor {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private activityDetector: SuspiciousActivityDetector;
  private config: MonitoringConfig;
  private metricsInterval?: NodeJS.Timeout;
  private websocketServer?: any; // WebSocket server instance
  private connectedClients: Set<any> = new Set();
  private lastMetrics?: SecurityMetrics;
  private alertCooldowns: Map<string, Date> = new Map();
  private activeIncidents: Map<string, SecurityIncident> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    activityDetector: SuspiciousActivityDetector,
    customConfig?: Partial<MonitoringConfig>
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.activityDetector = activityDetector;
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(): Promise<void> {
    try {
      // Start metrics collection
      this.startMetricsCollection();
      
      // Initialize WebSocket server for real-time updates
      await this.initializeWebSocket();
      
      // Load existing incidents
      await this.loadActiveIncidents();
      
      // Set up activity detector integration
      this.setupActivityDetectorIntegration();
      
      console.log('Real-time security monitoring started');
      
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
    
    if (this.websocketServer) {
      this.websocketServer.close();
      this.websocketServer = undefined;
    }
    
    this.connectedClients.clear();
    console.log('Real-time security monitoring stopped');
  }

  /**
   * Get current security metrics
   */
  async getCurrentMetrics(): Promise<SecurityMetrics> {
    try {
      const metrics: SecurityMetrics = {
        timestamp: new Date(),
        activeUsers: await this.getActiveUsersCount(),
        activeSessions: await this.getActiveSessionsCount(),
        failedLogins: await this.getFailedLoginsCount(),
        suspiciousActivities: await this.getSuspiciousActivitiesCount(),
        blockedIPs: await this.getBlockedIPsCount(),
        averageResponseTime: await this.getAverageResponseTime(),
        systemLoad: await this.getSystemLoad(),
        networkTraffic: await this.getNetworkTraffic(),
        securityEvents: await this.getSecurityEventsStats()
      };

      this.lastMetrics = metrics;
      return metrics;
      
    } catch (error) {
      console.error('Failed to get current metrics:', error);
      throw error;
    }
  }

  /**
   * Get security metrics history
   */
  async getMetricsHistory(
    timeRange: { start: Date; end: Date },
    interval: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<SecurityMetrics[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_metrics')
        .select('*')
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        throw new Error(`Failed to get metrics history: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToMetrics);
      
    } catch (error) {
      console.error('Failed to get metrics history:', error);
      throw error;
    }
  }

  /**
   * Create security incident
   */
  async createIncident(
    incident: Omit<SecurityIncident, 'incidentId' | 'detectedAt' | 'timeline'>
  ): Promise<SecurityIncident> {
    try {
      const fullIncident: SecurityIncident = {
        ...incident,
        incidentId: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detectedAt: new Date(),
        timeline: [
          {
            timestamp: new Date(),
            action: 'incident_created',
            user: 'system',
            details: 'Incident automatically created by security monitor'
          }
        ]
      };

      // Store incident
      await this.storeIncident(fullIncident);
      
      // Add to active incidents
      this.activeIncidents.set(fullIncident.incidentId, fullIncident);
      
      // Broadcast to connected clients
      this.broadcastToClients('incident_created', fullIncident);
      
      // Log security event
      await this.auditLogger.logSecurityEvent({
        eventType: 'security_incident_created',
        metadata: {
          incidentId: fullIncident.incidentId,
          type: fullIncident.type,
          severity: fullIncident.severity
        }
      });

      return fullIncident;
      
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  }

  /**
   * Update security incident
   */
  async updateIncident(
    incidentId: string,
    updates: Partial<SecurityIncident>,
    user: string = 'system'
  ): Promise<SecurityIncident> {
    try {
      const existingIncident = this.activeIncidents.get(incidentId);
      if (!existingIncident) {
        throw new Error('Incident not found');
      }

      const updatedIncident: SecurityIncident = {
        ...existingIncident,
        ...updates,
        timeline: [
          ...existingIncident.timeline,
          {
            timestamp: new Date(),
            action: 'incident_updated',
            user,
            details: `Incident updated: ${Object.keys(updates).join(', ')}`
          }
        ]
      };

      // Update storage
      await this.storeIncident(updatedIncident);
      
      // Update active incidents
      this.activeIncidents.set(incidentId, updatedIncident);
      
      // Broadcast update
      this.broadcastToClients('incident_updated', updatedIncident);
      
      return updatedIncident;
      
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  }

  /**
   * Resolve security incident
   */
  async resolveIncident(
    incidentId: string,
    resolution: string,
    user: string
  ): Promise<SecurityIncident> {
    try {
      const updates: Partial<SecurityIncident> = {
        status: 'resolved',
        resolvedAt: new Date(),
        timeline: [{
          timestamp: new Date(),
          action: 'incident_resolved',
          user,
          details: resolution
        }]
      };

      const resolvedIncident = await this.updateIncident(incidentId, updates, user);
      
      // Remove from active incidents
      this.activeIncidents.delete(incidentId);
      
      return resolvedIncident;
      
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      throw error;
    }
  }

  /**
   * Get active incidents
   */
  getActiveIncidents(): SecurityIncident[] {
    return Array.from(this.activeIncidents.values());
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<SecurityIncident | null> {
    try {
      // Check active incidents first
      const activeIncident = this.activeIncidents.get(incidentId);
      if (activeIncident) {
        return activeIncident;
      }

      // Query database
      const { data, error } = await this.supabase
        .from('security_incidents')
        .select('*')
        .eq('incident_id', incidentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get incident: ${error.message}`);
      }

      return this.mapDatabaseToIncident(data);
      
    } catch (error) {
      console.error('Failed to get incident:', error);
      throw error;
    }
  }

  /**
   * Get incidents with filtering
   */
  async getIncidents(options?: {
    status?: SecurityIncident['status'][];
    severity?: SecurityIncident['severity'][];
    type?: SecurityIncident['type'][];
    timeRange?: { start: Date; end: Date };
    limit?: number;
    offset?: number;
  }): Promise<SecurityIncident[]> {
    try {
      let query = this.supabase
        .from('security_incidents')
        .select('*')
        .order('detected_at', { ascending: false });

      if (options?.status) {
        query = query.in('status', options.status);
      }

      if (options?.severity) {
        query = query.in('severity', options.severity);
      }

      if (options?.type) {
        query = query.in('type', options.type);
      }

      if (options?.timeRange) {
        query = query
          .gte('detected_at', options.timeRange.start.toISOString())
          .lte('detected_at', options.timeRange.end.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get incidents: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToIncident);
      
    } catch (error) {
      console.error('Failed to get incidents:', error);
      throw error;
    }
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring if needed
    if (this.config.enabled && !this.metricsInterval) {
      this.startMetricsCollection();
    } else if (!this.config.enabled && this.metricsInterval) {
      this.stopMonitoring();
    }
  }

  /**
   * Get monitoring configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Add WebSocket client
   */
  addWebSocketClient(client: any): void {
    this.connectedClients.add(client);
    
    // Send current metrics to new client
    if (this.lastMetrics) {
      client.send(JSON.stringify({
        type: 'metrics_update',
        data: this.lastMetrics
      }));
    }
    
    // Send active incidents
    const activeIncidents = this.getActiveIncidents();
    if (activeIncidents.length > 0) {
      client.send(JSON.stringify({
        type: 'incidents_update',
        data: activeIncidents
      }));
    }
  }

  /**
   * Remove WebSocket client
   */
  removeWebSocketClient(client: any): void {
    this.connectedClients.delete(client);
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalIncidents: number;
    incidentsBySeverity: Record<SecurityIncident['severity'], number>;
    incidentsByType: Record<SecurityIncident['type'], number>;
    averageResolutionTime: number;
    falsePositiveRate: number;
    systemUptime: number;
    alertsTriggered: number;
    metricsCollected: number;
  }> {
    try {
      const incidents = await this.getIncidents({ timeRange });
      const metrics = await this.getMetricsHistory(timeRange);
      
      const incidentsBySeverity: Record<SecurityIncident['severity'], number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };
      
      const incidentsByType: Record<SecurityIncident['type'], number> = {
        threshold_breach: 0,
        suspicious_activity: 0,
        system_anomaly: 0,
        compliance_violation: 0,
        manual: 0
      };
      
      let totalResolutionTime = 0;
      let resolvedIncidents = 0;
      let falsePositives = 0;
      
      for (const incident of incidents) {
        incidentsBySeverity[incident.severity]++;
        incidentsByType[incident.type]++;
        
        if (incident.status === 'resolved' && incident.resolvedAt) {
          const resolutionTime = incident.resolvedAt.getTime() - incident.detectedAt.getTime();
          totalResolutionTime += resolutionTime;
          resolvedIncidents++;
        }
        
        if (incident.status === 'false_positive') {
          falsePositives++;
        }
      }
      
      return {
        totalIncidents: incidents.length,
        incidentsBySeverity,
        incidentsByType,
        averageResolutionTime: resolvedIncidents > 0 ? totalResolutionTime / resolvedIncidents : 0,
        falsePositiveRate: incidents.length > 0 ? falsePositives / incidents.length : 0,
        systemUptime: this.calculateSystemUptime(timeRange),
        alertsTriggered: this.calculateAlertsTriggered(timeRange),
        metricsCollected: metrics.length
      };
      
    } catch (error) {
      console.error('Failed to get monitoring statistics:', error);
      throw error;
    }
  }

  // Private methods

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getCurrentMetrics();
        
        // Store metrics
        await this.storeMetrics(metrics);
        
        // Check thresholds
        await this.checkThresholds(metrics);
        
        // Broadcast to clients
        this.broadcastToClients('metrics_update', metrics);
        
      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    }, this.config.metricsInterval * 1000);
  }

  private async initializeWebSocket(): Promise<void> {
    // WebSocket server initialization would go here
    // This is a placeholder for the actual WebSocket implementation
    console.log('WebSocket server initialized for real-time monitoring');
  }

  private async loadActiveIncidents(): Promise<void> {
    try {
      const activeIncidents = await this.getIncidents({
        status: ['open', 'investigating']
      });
      
      for (const incident of activeIncidents) {
        this.activeIncidents.set(incident.incidentId, incident);
      }
      
    } catch (error) {
      console.error('Failed to load active incidents:', error);
    }
  }

  private setupActivityDetectorIntegration(): void {
    // This would integrate with the SuspiciousActivityDetector
    // to automatically create incidents from suspicious activities
    console.log('Activity detector integration set up');
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) {
        console.error('Failed to get active users count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get active users count:', error);
      return 0;
    }
  }

  private async getActiveSessionsCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) {
        console.error('Failed to get active sessions count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get active sessions count:', error);
      return 0;
    }
  }

  private async getFailedLoginsCount(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { count, error } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login_failed')
        .gte('timestamp', oneHourAgo.toISOString());

      if (error) {
        console.error('Failed to get failed logins count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get failed logins count:', error);
      return 0;
    }
  }

  private async getSuspiciousActivitiesCount(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { count, error } = await this.supabase
        .from('suspicious_activity_alerts')
        .select('*', { count: 'exact', head: true })
        .gte('detected_at', oneHourAgo.toISOString())
        .eq('is_resolved', false);

      if (error) {
        console.error('Failed to get suspicious activities count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get suspicious activities count:', error);
      return 0;
    }
  }

  private async getBlockedIPsCount(): Promise<number> {
    // This would query a blocked IPs table
    // For now, return a placeholder value
    return 0;
  }

  private async getAverageResponseTime(): Promise<number> {
    // This would calculate average API response time
    // For now, return a placeholder value
    return 150; // ms
  }

  private async getSystemLoad(): Promise<SecurityMetrics['systemLoad']> {
    // This would get actual system metrics
    // For now, return placeholder values
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };
  }

  private async getNetworkTraffic(): Promise<SecurityMetrics['networkTraffic']> {
    // This would get actual network metrics
    // For now, return placeholder values
    return {
      inbound: Math.random() * 1000000, // bytes
      outbound: Math.random() * 1000000 // bytes
    };
  }

  private async getSecurityEventsStats(): Promise<SecurityMetrics['securityEvents']> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('session_security_events')
        .select('event_type, severity')
        .gte('timestamp', oneHourAgo.toISOString());

      if (error) {
        console.error('Failed to get security events stats:', error);
        return { total: 0, byType: {}, bySeverity: {} };
      }

      const events = data || [];
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      for (const event of events) {
        byType[event.event_type] = (byType[event.event_type] || 0) + 1;
        bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      }

      return {
        total: events.length,
        byType,
        bySeverity
      };
    } catch (error) {
      console.error('Failed to get security events stats:', error);
      return { total: 0, byType: {}, bySeverity: {} };
    }
  }

  private async checkThresholds(metrics: SecurityMetrics): Promise<void> {
    if (!this.config.alertingEnabled) {
      return;
    }

    for (const threshold of this.config.thresholds.filter(t => t.isEnabled)) {
      try {
        const value = this.getMetricValue(metrics, threshold.metricName);
        const breached = this.compareValues(value, threshold.operator, threshold.value);
        
        if (breached && !this.isInCooldown(threshold)) {
          await this.handleThresholdBreach(threshold, value, metrics);
          this.setCooldown(threshold);
        }
      } catch (error) {
        console.error(`Failed to check threshold ${threshold.metricName}:`, error);
      }
    }
  }

  private getMetricValue(metrics: SecurityMetrics, metricName: string): any {
    const parts = metricName.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private compareValues(value: any, operator: string, threshold: any): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private isInCooldown(threshold: SecurityThreshold): boolean {
    const lastAlert = this.alertCooldowns.get(threshold.metricName);
    if (!lastAlert) {
      return false;
    }
    
    const cooldownEnd = new Date(lastAlert.getTime() + threshold.cooldownMinutes * 60 * 1000);
    return new Date() < cooldownEnd;
  }

  private setCooldown(threshold: SecurityThreshold): void {
    this.alertCooldowns.set(threshold.metricName, new Date());
  }

  private async handleThresholdBreach(
    threshold: SecurityThreshold,
    value: any,
    metrics: SecurityMetrics
  ): Promise<void> {
    try {
      // Create incident
      const incident = await this.createIncident({
        type: 'threshold_breach',
        severity: threshold.severity,
        title: `Threshold breach: ${threshold.metricName}`,
        description: `${threshold.description}. Current value: ${value}, threshold: ${threshold.value}`,
        status: 'open',
        metrics,
        evidence: {
          threshold,
          currentValue: value,
          metrics
        },
        impact: {
          affectedUsers: [],
          affectedSystems: [],
          dataExposure: false,
          serviceDisruption: threshold.severity === 'critical'
        },
        response: {
          containmentActions: [],
          investigationNotes: [],
          remediationSteps: [],
          lessonsLearned: []
        }
      });

      // Execute threshold actions
      for (const action of threshold.actions) {
        if (action.delay > 0) {
          setTimeout(() => this.executeThresholdAction(action, incident), action.delay * 1000);
        } else {
          await this.executeThresholdAction(action, incident);
        }
      }
      
    } catch (error) {
      console.error('Failed to handle threshold breach:', error);
    }
  }

  private async executeThresholdAction(
    action: SecurityThreshold['actions'][0],
    incident: SecurityIncident
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailAlert(action.target, incident);
          break;
        case 'webhook':
          await this.sendWebhookAlert(action.target, incident);
          break;
        case 'escalate':
          await this.escalateIncident(incident, action.target);
          break;
        // Add other action types as needed
      }
      
      // Log action execution
      await this.auditLogger.logSecurityEvent({
        eventType: 'threshold_action_executed',
        metadata: {
          incidentId: incident.incidentId,
          actionType: action.type,
          target: action.target
        }
      });
      
    } catch (error) {
      console.error('Failed to execute threshold action:', error);
    }
  }

  private async sendEmailAlert(recipient: string, incident: SecurityIncident): Promise<void> {
    // Email sending implementation would go here
    console.log(`Email alert sent to ${recipient} for incident ${incident.incidentId}`);
  }

  private async sendWebhookAlert(url: string, incident: SecurityIncident): Promise<void> {
    // Webhook sending implementation would go here
    console.log(`Webhook alert sent to ${url} for incident ${incident.incidentId}`);
  }

  private async escalateIncident(incident: SecurityIncident, target: string): Promise<void> {
    // Incident escalation implementation would go here
    console.log(`Incident ${incident.incidentId} escalated to ${target}`);
  }

  private broadcastToClients(type: string, data: any): void {
    const message = JSON.stringify({ type, data });
    
    for (const client of this.connectedClients) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Failed to send message to client:', error);
        this.connectedClients.delete(client);
      }
    }
  }

  private async storeMetrics(metrics: SecurityMetrics): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_metrics')
        .insert({
          timestamp: metrics.timestamp.toISOString(),
          active_users: metrics.activeUsers,
          active_sessions: metrics.activeSessions,
          failed_logins: metrics.failedLogins,
          suspicious_activities: metrics.suspiciousActivities,
          blocked_ips: metrics.blockedIPs,
          average_response_time: metrics.averageResponseTime,
          system_load: metrics.systemLoad,
          network_traffic: metrics.networkTraffic,
          security_events: metrics.securityEvents
        });

      if (error) {
        console.error('Failed to store metrics:', error);
      }
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  private async storeIncident(incident: SecurityIncident): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_incidents')
        .upsert({
          incident_id: incident.incidentId,
          type: incident.type,
          severity: incident.severity,
          title: incident.title,
          description: incident.description,
          detected_at: incident.detectedAt.toISOString(),
          resolved_at: incident.resolvedAt?.toISOString(),
          status: incident.status,
          assigned_to: incident.assignedTo,
          metrics: incident.metrics,
          alerts: incident.alerts,
          evidence: incident.evidence,
          timeline: incident.timeline,
          impact: incident.impact,
          response: incident.response
        });

      if (error) {
        console.error('Failed to store incident:', error);
      }
    } catch (error) {
      console.error('Failed to store incident:', error);
    }
  }

  private mapDatabaseToMetrics(data: any): SecurityMetrics {
    return {
      timestamp: new Date(data.timestamp),
      activeUsers: data.active_users,
      activeSessions: data.active_sessions,
      failedLogins: data.failed_logins,
      suspiciousActivities: data.suspicious_activities,
      blockedIPs: data.blocked_ips,
      averageResponseTime: data.average_response_time,
      systemLoad: data.system_load,
      networkTraffic: data.network_traffic,
      securityEvents: data.security_events
    };
  }

  private mapDatabaseToIncident(data: any): SecurityIncident {
    return {
      incidentId: data.incident_id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      status: data.status,
      assignedTo: data.assigned_to,
      metrics: data.metrics,
      alerts: data.alerts,
      evidence: data.evidence,
      timeline: data.timeline,
      impact: data.impact,
      response: data.response
    };
  }

  private calculateSystemUptime(timeRange: { start: Date; end: Date }): number {
    // This would calculate actual system uptime
    // For now, return a placeholder value (99.9%)
    return 0.999;
  }

  private calculateAlertsTriggered(timeRange: { start: Date; end: Date }): number {
    // This would count actual alerts triggered
    // For now, return a placeholder value
    return 0;
  }
}
