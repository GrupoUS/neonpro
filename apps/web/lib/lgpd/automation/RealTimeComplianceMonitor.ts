import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { LGPDComplianceManager } from '../LGPDComplianceManager';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface ComplianceMetrics {
  overall_score: number;
  consent_compliance: number;
  data_subject_rights_compliance: number;
  breach_response_compliance: number;
  retention_compliance: number;
  documentation_compliance: number;
  third_party_compliance: number;
  last_updated: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category:
    | 'consent'
    | 'breach'
    | 'retention'
    | 'rights'
    | 'documentation'
    | 'third_party';
  title: string;
  description: string;
  severity_score: number;
  legal_deadline?: string;
  auto_resolution_available: boolean;
  resolution_steps: string[];
  affected_users?: number;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
}

export interface MonitoringConfig {
  real_time_monitoring: boolean;
  alert_thresholds: {
    consent_expiry_days: number;
    breach_response_hours: number;
    data_request_deadline_days: number;
    retention_overdue_days: number;
    compliance_score_minimum: number;
  };
  notification_channels: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    dashboard: boolean;
  };
  automated_responses: {
    consent_renewal: boolean;
    breach_notifications: boolean;
    retention_cleanup: boolean;
    compliance_reports: boolean;
  };
}

export interface ComplianceDashboard {
  metrics: ComplianceMetrics;
  active_alerts: ComplianceAlert[];
  trends: {
    consent_trends: Array<{
      date: string;
      granted: number;
      withdrawn: number;
      expired: number;
    }>;
    request_trends: Array<{
      date: string;
      access: number;
      rectification: number;
      erasure: number;
      portability: number;
    }>;
    breach_trends: Array<{
      date: string;
      incidents: number;
      resolved: number;
      avg_response_time: number;
    }>;
    compliance_trends: Array<{
      date: string;
      score: number;
      category_scores: Record<string, number>;
    }>;
  };
  legal_deadlines: Array<{
    type: string;
    description: string;
    deadline: string;
    status: 'upcoming' | 'due' | 'overdue';
    days_remaining: number;
  }>;
  recent_activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user_id?: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export class RealTimeComplianceMonitor {
  private supabase: SupabaseClient;
  private complianceManager: LGPDComplianceManager;
  private config: MonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: ComplianceAlert) => void> = [];

  constructor(
    supabase: SupabaseClient,
    complianceManager: LGPDComplianceManager,
    config: MonitoringConfig
  ) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }

  /**
   * Start Real-Time Compliance Monitoring
   */
  async startMonitoring(intervalMinutes = 5): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // Initial compliance check
      await this.performComplianceCheck();

      // Set up real-time monitoring
      if (this.config.real_time_monitoring) {
        this.monitoringInterval = setInterval(
          async () => {
            try {
              await this.performComplianceCheck();
            } catch (error) {
              console.error('Error in compliance monitoring cycle:', error);
            }
          },
          intervalMinutes * 60 * 1000
        );

        // Set up database change listeners
        await this.setupRealtimeListeners();
      }

      console.log(
        `Real-time compliance monitoring started (${intervalMinutes}min intervals)`
      );
    } catch (error) {
      console.error('Error starting compliance monitoring:', error);
      throw new Error(
        `Failed to start compliance monitoring: ${error.message}`
      );
    }
  }

  /**
   * Stop Real-Time Monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Real-time compliance monitoring stopped');
  }

  /**
   * Get Current Compliance Dashboard
   */
  async getComplianceDashboard(): Promise<ComplianceDashboard> {
    try {
      // Get current metrics
      const metrics = await this.calculateComplianceMetrics();

      // Get active alerts
      const { data: alerts, error: alertsError } = await this.supabase
        .from('lgpd_compliance_alerts')
        .select('*')
        .eq('status', 'active')
        .order('severity_score', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;

      // Get trends data
      const trends = await this.getComplianceTrends();

      // Get legal deadlines
      const legalDeadlines = await this.getUpcomingLegalDeadlines();

      // Get recent activities
      const recentActivities = await this.getRecentComplianceActivities();

      return {
        metrics,
        active_alerts: alerts || [],
        trends,
        legal_deadlines: legalDeadlines,
        recent_activities: recentActivities,
      };
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      throw new Error(`Failed to get compliance dashboard: ${error.message}`);
    }
  }

  /**
   * Perform Comprehensive Compliance Check
   */
  async performComplianceCheck(): Promise<{
    metrics: ComplianceMetrics;
    new_alerts: ComplianceAlert[];
    resolved_alerts: string[];
  }> {
    try {
      const newAlerts: ComplianceAlert[] = [];
      const resolvedAlerts: string[] = [];

      // Calculate current compliance metrics
      const metrics = await this.calculateComplianceMetrics();

      // Check consent compliance
      const consentAlerts = await this.checkConsentCompliance();
      newAlerts.push(...consentAlerts);

      // Check data subject rights compliance
      const rightsAlerts = await this.checkDataSubjectRightsCompliance();
      newAlerts.push(...rightsAlerts);

      // Check breach response compliance
      const breachAlerts = await this.checkBreachResponseCompliance();
      newAlerts.push(...breachAlerts);

      // Check retention compliance
      const retentionAlerts = await this.checkRetentionCompliance();
      newAlerts.push(...retentionAlerts);

      // Check documentation compliance
      const documentationAlerts = await this.checkDocumentationCompliance();
      newAlerts.push(...documentationAlerts);

      // Check third-party compliance
      const thirdPartyAlerts = await this.checkThirdPartyCompliance();
      newAlerts.push(...thirdPartyAlerts);

      // Store new alerts
      if (newAlerts.length > 0) {
        const { error: alertsError } = await this.supabase
          .from('lgpd_compliance_alerts')
          .insert(
            newAlerts.map((alert) => ({
              type: alert.type,
              category: alert.category,
              title: alert.title,
              description: alert.description,
              severity_score: alert.severity_score,
              legal_deadline: alert.legal_deadline,
              auto_resolution_available: alert.auto_resolution_available,
              resolution_steps: alert.resolution_steps,
              affected_users: alert.affected_users,
              status: 'active',
              created_at: new Date().toISOString(),
            }))
          );

        if (alertsError) throw alertsError;

        // Trigger alert notifications
        for (const alert of newAlerts) {
          await this.triggerAlertNotification(alert);
        }
      }

      // Update compliance metrics
      await this.supabase.from('lgpd_compliance_metrics').upsert({
        overall_score: metrics.overall_score,
        consent_compliance: metrics.consent_compliance,
        data_subject_rights_compliance: metrics.data_subject_rights_compliance,
        breach_response_compliance: metrics.breach_response_compliance,
        retention_compliance: metrics.retention_compliance,
        documentation_compliance: metrics.documentation_compliance,
        third_party_compliance: metrics.third_party_compliance,
        last_updated: new Date().toISOString(),
        measurement_date: new Date().toISOString().split('T')[0],
      });

      // Log monitoring event
      await this.complianceManager.logAuditEvent({
        event_type: 'compliance_monitoring',
        resource_type: 'compliance_check',
        action: 'automated_compliance_check_completed',
        details: {
          overall_score: metrics.overall_score,
          new_alerts: newAlerts.length,
          resolved_alerts: resolvedAlerts.length,
          monitoring_timestamp: new Date().toISOString(),
        },
      });

      return {
        metrics,
        new_alerts: newAlerts,
        resolved_alerts,
      };
    } catch (error) {
      console.error('Error performing compliance check:', error);
      throw new Error(`Failed to perform compliance check: ${error.message}`);
    }
  }

  /**
   * Register Alert Callback
   */
  onAlert(callback: (alert: ComplianceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Resolve Compliance Alert
   */
  async resolveAlert(
    alertId: string,
    resolution: {
      method: 'manual' | 'automated';
      notes?: string;
      resolved_by?: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('lgpd_compliance_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_method: resolution.method,
          resolution_notes: resolution.notes,
          resolved_by: resolution.resolved_by,
        })
        .eq('id', alertId);

      if (error) throw error;

      // Log resolution
      await this.complianceManager.logAuditEvent({
        event_type: 'alert_resolution',
        resource_type: 'compliance_alert',
        resource_id: alertId,
        action: 'alert_resolved',
        details: {
          resolution_method: resolution.method,
          resolved_by: resolution.resolved_by,
          resolution_timestamp: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  /**
   * Generate Compliance Report
   */
  async generateComplianceReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    includeRecommendations = true
  ): Promise<{
    report_id: string;
    metrics: ComplianceMetrics;
    alerts_summary: any;
    trends_analysis: any;
    recommendations?: string[];
    generated_at: string;
  }> {
    try {
      const dashboard = await this.getComplianceDashboard();

      // Generate report analysis
      const { data: reportData, error } = await this.supabase.rpc(
        'generate_compliance_report',
        {
          report_type: reportType,
          include_recommendations: includeRecommendations,
          dashboard_data: dashboard,
        }
      );

      if (error) throw error;

      // Store report
      const { data: report, error: reportError } = await this.supabase
        .from('lgpd_compliance_reports')
        .insert({
          report_type: reportType,
          report_data: reportData,
          generated_at: new Date().toISOString(),
          metrics_snapshot: dashboard.metrics,
        })
        .select('id')
        .single();

      if (reportError) throw reportError;

      return {
        report_id: report.id,
        ...reportData,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }
  }

  // Private helper methods
  private async calculateComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      const { data: metrics, error } = await this.supabase.rpc(
        'calculate_compliance_metrics'
      );

      if (error) throw error;

      return {
        overall_score: metrics.overall_score || 0,
        consent_compliance: metrics.consent_compliance || 0,
        data_subject_rights_compliance:
          metrics.data_subject_rights_compliance || 0,
        breach_response_compliance: metrics.breach_response_compliance || 0,
        retention_compliance: metrics.retention_compliance || 0,
        documentation_compliance: metrics.documentation_compliance || 0,
        third_party_compliance: metrics.third_party_compliance || 0,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error calculating compliance metrics:', error);
      throw error;
    }
  }

  private async checkConsentCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check for expiring consents
      const { data: expiringConsents, error } = await this.supabase
        .from('lgpd_user_consents')
        .select('*')
        .eq('status', 'granted')
        .lt(
          'expires_at',
          new Date(
            Date.now() +
              this.config.alert_thresholds.consent_expiry_days *
                24 *
                60 *
                60 *
                1000
          ).toISOString()
        );

      if (error) throw error;

      if (expiringConsents && expiringConsents.length > 0) {
        alerts.push({
          id: `consent-expiry-${Date.now()}`,
          type: 'medium',
          category: 'consent',
          title: 'Consents Expiring Soon',
          description: `${expiringConsents.length} user consents are expiring within ${this.config.alert_thresholds.consent_expiry_days} days`,
          severity_score: 60,
          auto_resolution_available: true,
          resolution_steps: [
            'Review expiring consents',
            'Send renewal notifications to users',
            'Update consent collection processes',
          ],
          affected_users: expiringConsents.length,
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking consent compliance:', error);
      return [];
    }
  }

  private async checkDataSubjectRightsCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check for overdue data subject requests
      const { data: overdueRequests, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .lt('legal_deadline', new Date().toISOString());

      if (error) throw error;

      if (overdueRequests && overdueRequests.length > 0) {
        alerts.push({
          id: `rights-overdue-${Date.now()}`,
          type: 'critical',
          category: 'rights',
          title: 'Overdue Data Subject Requests',
          description: `${overdueRequests.length} data subject requests are overdue`,
          severity_score: 95,
          auto_resolution_available: false,
          resolution_steps: [
            'Review overdue requests immediately',
            'Prioritize request fulfillment',
            'Notify legal team if necessary',
            'Document delay reasons',
          ],
          affected_users: overdueRequests.length,
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking data subject rights compliance:', error);
      return [];
    }
  }

  private async checkBreachResponseCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check for breach incidents requiring notification
      const { data: breachIncidents, error } = await this.supabase
        .from('lgpd_breach_incidents')
        .select('*')
        .eq('requires_notification', true)
        .eq('notification_sent', false)
        .lt(
          'created_at',
          new Date(
            Date.now() -
              this.config.alert_thresholds.breach_response_hours *
                60 *
                60 *
                1000
          ).toISOString()
        );

      if (error) throw error;

      if (breachIncidents && breachIncidents.length > 0) {
        alerts.push({
          id: `breach-notification-${Date.now()}`,
          type: 'critical',
          category: 'breach',
          title: 'Breach Notification Required',
          description: `${breachIncidents.length} breach incidents require immediate notification to ANPD`,
          severity_score: 100,
          legal_deadline: new Date(
            Date.now() + 72 * 60 * 60 * 1000
          ).toISOString(), // 72 hours from now
          auto_resolution_available: true,
          resolution_steps: [
            'Review breach incident details',
            'Prepare ANPD notification',
            'Send notification within 72 hours',
            'Document notification process',
          ],
          affected_users: breachIncidents.reduce(
            (sum, incident) => sum + (incident.affected_users || 0),
            0
          ),
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking breach response compliance:', error);
      return [];
    }
  }

  private async checkRetentionCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check for data past retention period
      const { data: retentionViolations, error } = await this.supabase.rpc(
        'check_retention_compliance'
      );

      if (error) throw error;

      if (retentionViolations && retentionViolations.length > 0) {
        alerts.push({
          id: `retention-violation-${Date.now()}`,
          type: 'high',
          category: 'retention',
          title: 'Data Retention Violations',
          description: `${retentionViolations.length} data records exceed retention periods`,
          severity_score: 80,
          auto_resolution_available: true,
          resolution_steps: [
            'Review retention policy violations',
            'Schedule data deletion or anonymization',
            'Update retention policies if needed',
            'Implement automated retention cleanup',
          ],
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking retention compliance:', error);
      return [];
    }
  }

  private async checkDocumentationCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check for missing or outdated documentation
      const { data: documentationIssues, error } = await this.supabase.rpc(
        'check_documentation_compliance'
      );

      if (error) throw error;

      if (documentationIssues && documentationIssues.missing_documents > 0) {
        alerts.push({
          id: `documentation-missing-${Date.now()}`,
          type: 'medium',
          category: 'documentation',
          title: 'Missing LGPD Documentation',
          description: `${documentationIssues.missing_documents} required LGPD documents are missing or outdated`,
          severity_score: 70,
          auto_resolution_available: false,
          resolution_steps: [
            'Review required LGPD documentation',
            'Update privacy policies and notices',
            'Complete data processing records',
            'Review and update consent forms',
          ],
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking documentation compliance:', error);
      return [];
    }
  }

  private async checkThirdPartyCompliance(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check third-party data sharing compliance
      const { data: thirdPartyIssues, error } = await this.supabase.rpc(
        'check_third_party_compliance'
      );

      if (error) throw error;

      if (thirdPartyIssues && thirdPartyIssues.non_compliant_shares > 0) {
        alerts.push({
          id: `third-party-compliance-${Date.now()}`,
          type: 'high',
          category: 'third_party',
          title: 'Third-Party Compliance Issues',
          description: `${thirdPartyIssues.non_compliant_shares} third-party data shares lack proper compliance documentation`,
          severity_score: 85,
          auto_resolution_available: false,
          resolution_steps: [
            'Review third-party data sharing agreements',
            'Update data processing agreements (DPAs)',
            'Verify third-party LGPD compliance',
            'Document legal basis for data sharing',
          ],
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error checking third-party compliance:', error);
      return [];
    }
  }

  private async setupRealtimeListeners(): Promise<void> {
    // Set up real-time listeners for critical tables
    this.supabase
      .channel('compliance-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lgpd_breach_incidents',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            await this.handleBreachIncidentAlert(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lgpd_data_subject_requests',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            await this.handleDataSubjectRequestAlert(payload.new);
          }
        }
      )
      .subscribe();
  }

  private async handleBreachIncidentAlert(incident: any): Promise<void> {
    if (incident.severity === 'high' || incident.severity === 'critical') {
      const alert: ComplianceAlert = {
        id: `breach-incident-${incident.id}`,
        type: 'critical',
        category: 'breach',
        title: 'New Critical Breach Incident',
        description: `A ${incident.severity} severity breach incident has been reported`,
        severity_score: incident.severity === 'critical' ? 100 : 90,
        legal_deadline: new Date(
          Date.now() + 72 * 60 * 60 * 1000
        ).toISOString(),
        auto_resolution_available: false,
        resolution_steps: [
          'Assess breach impact immediately',
          'Contain the breach',
          'Notify ANPD within 72 hours if required',
          'Notify affected users if required',
        ],
        affected_users: incident.affected_users,
        created_at: new Date().toISOString(),
        status: 'active',
      };

      await this.triggerAlertNotification(alert);
    }
  }

  private async handleDataSubjectRequestAlert(request: any): Promise<void> {
    // Monitor high-priority data subject requests
    if (request.request_type === 'erasure' || request.priority === 'high') {
      const alert: ComplianceAlert = {
        id: `data-request-${request.id}`,
        type: 'high',
        category: 'rights',
        title: 'High-Priority Data Subject Request',
        description: `A ${request.request_type} request requires immediate attention`,
        severity_score: 80,
        legal_deadline: request.legal_deadline,
        auto_resolution_available: request.request_type !== 'erasure',
        resolution_steps: [
          'Review request details',
          'Verify user identity',
          'Process request within legal deadline',
          'Notify user of completion',
        ],
        created_at: new Date().toISOString(),
        status: 'active',
      };

      await this.triggerAlertNotification(alert);
    }
  }

  private async triggerAlertNotification(
    alert: ComplianceAlert
  ): Promise<void> {
    // Trigger registered callbacks
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    }

    // Send notifications based on configuration
    if (this.config.notification_channels.email) {
      await this.sendEmailNotification(alert);
    }

    if (this.config.notification_channels.webhook) {
      await this.sendWebhookNotification(alert);
    }
  }

  private async sendEmailNotification(alert: ComplianceAlert): Promise<void> {
    // Implementation for email notifications
    // This would integrate with your email service
    console.log('Email notification sent for alert:', alert.title);
  }

  private async sendWebhookNotification(alert: ComplianceAlert): Promise<void> {
    // Implementation for webhook notifications
    // This would send to configured webhook endpoints
    console.log('Webhook notification sent for alert:', alert.title);
  }

  private async getComplianceTrends(): Promise<any> {
    const { data: trends, error } = await this.supabase.rpc(
      'get_compliance_trends',
      {
        days_back: 30,
      }
    );

    if (error) throw error;
    return trends;
  }

  private async getUpcomingLegalDeadlines(): Promise<any[]> {
    const { data: deadlines, error } = await this.supabase.rpc(
      'get_upcoming_legal_deadlines'
    );

    if (error) throw error;
    return deadlines || [];
  }

  private async getRecentComplianceActivities(): Promise<any[]> {
    const { data: activities, error } = await this.supabase
      .from('lgpd_audit_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return activities || [];
  }
}
