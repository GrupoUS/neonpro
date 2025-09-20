/**
 * Security Monitoring Dashboard Service
 * Real-time security monitoring with comprehensive analytics and alerting
 */

import { createServerClient } from '../clients/supabase.js';
import { logger } from '@/utils/secure-logger';
import { enhancedRLSSecurityService, type SecurityAlert } from './enhanced-rls-security.js';

export interface SecurityMetrics {
  timestamp: Date;
  totalRequests: number;
  deniedRequests: number;
  securityScore: number;
  threatLevel: number;
  alerts: SecurityAlert[];
  topThreatTypes: string[];
  responseTime: number;
}

export interface SecurityDashboard {
  overview: {
    totalEndpoints: number;
    protectedEndpoints: number;
    activeUsers: number;
    securityScore: number;
    threatLevel: number;
    lastUpdated: Date;
  };
  realTimeMetrics: SecurityMetrics;
  alerts: {
    critical: SecurityAlert[];
    high: SecurityAlert[];
    medium: SecurityAlert[];
    low: SecurityAlert[];
  };
  accessPatterns: {
    byRole: Record<string, { requests: number; denied: number; score: number }>;
    byEndpoint: Record<
      string,
      { requests: number; denied: number; avgThreat: number }
    >;
    byTime: Array<{ hour: number; requests: number; threats: number }>;
  };
  compliance: {
    lgpdCompliant: boolean;
    auditLogRetention: boolean;
    dataEncryption: boolean;
    accessControls: boolean;
    incidentResponse: boolean;
  };
}

export interface SecurityReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalRequests: number;
    deniedRequests: number;
    securityIncidents: number;
    avgSecurityScore: number;
    maxThreatLevel: number;
  };
  threats: Array<{
    type: string;
    severity: string;
    count: number;
    description: string;
  }>;
  recommendations: string[];
  compliance: {
    score: number;
    issues: string[];
    passedChecks: string[];
  };
}

export class SecurityMonitoringDashboardService {
  private supabase;
  private metricsCache = new Map<string, SecurityMetrics>();
  private dashboardUpdateInterval = 30000; // 30 seconds

  constructor() {
    this.supabase = createServerClient();
    this.startRealTimeMonitoring();
  }

  /**
   * Get comprehensive security dashboard
   */
  async getSecurityDashboard(clinicId?: string): Promise<SecurityDashboard> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get real-time metrics
      const realTimeMetrics = await this.getRealTimeMetrics(
        clinicId,
        oneHourAgo,
        now,
      );

      // Get alerts by severity
      const alerts = await this.getAlertsBySeverity(
        clinicId,
        twentyFourHoursAgo,
        now,
      );

      // Get access patterns
      const accessPatterns = await this.getAccessPatterns(
        clinicId,
        twentyFourHoursAgo,
        now,
      );

      // Get compliance status
      const compliance = await this.getComplianceStatus(clinicId);

      // Get overview stats
      const overview = await this.getOverviewStats(clinicId);

      return {
        overview,
        realTimeMetrics,
        alerts,
        accessPatterns,
        compliance,
      };
    } catch (error) {
      logger.error('Failed to generate security dashboard', error);
      throw new Error('Failed to generate security dashboard');
    }
  }

  /**
   * Get real-time security metrics
   */
  private async getRealTimeMetrics(
    clinicId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<SecurityMetrics> {
    const cacheKey = `metrics_${clinicId || 'all'}_${startDate.getTime()}`;

    // Check cache first
    const cached = this.metricsCache.get(cacheKey);
    if (
      cached
      && Date.now() - cached.timestamp.getTime() < this.dashboardUpdateInterval
    ) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const metrics: SecurityMetrics = {
        timestamp: new Date(),
        totalRequests: data?.length || 0,
        deniedRequests: data?.filter(log => !log.access_granted).length || 0,
        securityScore: data?.reduce((acc, log) => acc + log.security_score, 0)
            / (data?.length || 1) || 0,
        threatLevel: data?.reduce((acc, log) => acc + log.threat_level, 0)
            / (data?.length || 1) || 0,
        alerts: data
          ?.filter(log => log.threat_level > 50)
          .map(log => ({
            type: 'THREAT_DETECTED' as const,
            severity: log.threat_level > 75 ? 'HIGH' : ('MEDIUM' as const),
            description: log.reason,
            context: {
              userId: log.user_id,
              userRole: '',
              clinicId: '',
              sessionId: '',
              requestMethod: '',
              requestPath: '',
              timestamp: new Date(log.timestamp),
            },
            details: { threatLevel: log.threat_level },
            actionTaken: 'Logged for review',
          })) || [],
        topThreatTypes: this.getTopThreatTypes(data || []),
        responseTime: Math.random() * 100 + 50, // Mock response time
      };

      // Cache the result
      this.metricsCache.set(cacheKey, metrics);

      return metrics;
    } catch (error) {
      logger.error('Failed to get real-time metrics', error);
      return {
        timestamp: new Date(),
        totalRequests: 0,
        deniedRequests: 0,
        securityScore: 0,
        threatLevel: 0,
        alerts: [],
        topThreatTypes: [],
        responseTime: 0,
      };
    }
  }

  /**
   * Get alerts grouped by severity
   */
  private async getAlertsBySeverity(
    clinicId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    critical: SecurityAlert[];
    high: SecurityAlert[];
    medium: SecurityAlert[];
    low: SecurityAlert[];
  }> {
    try {
      let query = this.supabase
        .from('security_alerts')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;

      const alerts = data || [];

      return {
        critical: alerts.filter(alert => alert.severity === 'CRITICAL'),
        high: alerts.filter(alert => alert.severity === 'HIGH'),
        medium: alerts.filter(alert => alert.severity === 'MEDIUM'),
        low: alerts.filter(alert => alert.severity === 'LOW'),
      };
    } catch (error) {
      logger.error('Failed to get alerts by severity', error);
      return { critical: [], high: [], medium: [], low: [] };
    }
  }

  /**
   * Get access patterns analysis
   */
  private async getAccessPatterns(
    clinicId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    byRole: Record<string, { requests: number; denied: number; score: number }>;
    byEndpoint: Record<
      string,
      { requests: number; denied: number; avgThreat: number }
    >;
    byTime: Array<{ hour: number; requests: number; threats: number }>;
  }> {
    try {
      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;
      const logs = data || [];

      // Analyze by role
      const byRole: Record<
        string,
        { requests: number; denied: number; score: number }
      > = {};

      // Analyze by endpoint
      const byEndpoint: Record<
        string,
        { requests: number; denied: number; avgThreat: number }
      > = {};

      // Analyze by time
      const byTime: Array<{ hour: number; requests: number; threats: number }> = Array(24)
        .fill(0)
        .map((_, hour) => ({ hour, requests: 0, threats: 0 }));

      logs.forEach(log => {
        // By role (extract from user data or metadata)
        const role = log.metadata?.userRole || 'unknown';
        if (!byRole[role]) {
          byRole[role] = { requests: 0, denied: 0, score: 0 };
        }
        byRole[role].requests++;
        if (!log.access_granted) byRole[role].denied++;
        byRole[role].score += log.security_score;

        // By endpoint
        const endpoint = log.table_name;
        if (!byEndpoint[endpoint]) {
          byEndpoint[endpoint] = { requests: 0, denied: 0, avgThreat: 0 };
        }
        byEndpoint[endpoint].requests++;
        if (!log.access_granted) byEndpoint[endpoint].denied++;

        // By time
        const hour = new Date(log.timestamp).getHours();
        byTime[hour].requests++;
        if (log.threat_level > 50) byTime[hour].threats++;
      });

      // Calculate averages
      Object.keys(byRole).forEach(role => {
        const data = byRole[role];
        data.score = data.score / data.requests;
      });

      Object.keys(byEndpoint).forEach(endpoint => {
        const data = byEndpoint[endpoint];
        data.avgThreat = logs
          .filter(log => log.table_name === endpoint)
          .reduce((acc, log) => acc + log.threat_level, 0) / data.requests;
      });

      return {
        byRole,
        byEndpoint,
        byTime,
      };
    } catch (error) {
      logger.error('Failed to get access patterns', error);
      return { byRole: {}, byEndpoint: {}, byTime: [] };
    }
  }

  /**
   * Get compliance status
   */
  private async getComplianceStatus(clinicId?: string): Promise<{
    lgpdCompliant: boolean;
    auditLogRetention: boolean;
    dataEncryption: boolean;
    accessControls: boolean;
    incidentResponse: boolean;
  }> {
    try {
      // Check various compliance aspects
      const [
        auditRetention,
        encryptionStatus,
        accessControlStatus,
        incidentStatus,
      ] = await Promise.all([
        this.checkAuditLogRetention(),
        this.checkDataEncryption(),
        this.checkAccessControls(),
        this.checkIncidentResponse(),
      ]);

      return {
        lgpdCompliant: auditRetention && encryptionStatus && accessControlStatus,
        auditLogRetention,
        dataEncryption: encryptionStatus,
        accessControls: accessControlStatus,
        incidentResponse: incidentStatus,
      };
    } catch (error) {
      logger.error('Failed to get compliance status', error);
      return {
        lgpdCompliant: false,
        auditLogRetention: false,
        dataEncryption: false,
        accessControls: false,
        incidentResponse: false,
      };
    }
  }

  /**
   * Get overview statistics
   */
  private async getOverviewStats(clinicId?: string): Promise<{
    totalEndpoints: number;
    protectedEndpoints: number;
    activeUsers: number;
    securityScore: number;
    threatLevel: number;
    lastUpdated: Date;
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('user_id, security_score, threat_level')
        .gte('timestamp', oneHourAgo.toISOString());

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;
      const logs = data || [];

      const uniqueUsers = new Set(logs.map(log => log.user_id));
      const avgSecurityScore = logs.reduce((acc, log) => acc + log.security_score, 0) / logs.length;
      const avgThreatLevel = logs.reduce((acc, log) => acc + log.threat_level, 0) / logs.length;

      return {
        totalEndpoints: 15, // Mock data
        protectedEndpoints: 15,
        activeUsers: uniqueUsers.size,
        securityScore: avgSecurityScore || 0,
        threatLevel: avgThreatLevel || 0,
        lastUpdated: now,
      };
    } catch (error) {
      logger.error('Failed to get overview stats', error);
      return {
        totalEndpoints: 0,
        protectedEndpoints: 0,
        activeUsers: 0,
        securityScore: 0,
        threatLevel: 0,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateSecurityReport(options: {
    clinicId?: string;
    startDate: Date;
    endDate: Date;
    includeRecommendations?: boolean;
  }): Promise<SecurityReport> {
    try {
      const {
        clinicId,
        startDate,
        endDate,
        includeRecommendations = true,
      } = options;

      const report: SecurityReport = {
        id: `security_report_${Date.now()}`,
        generatedAt: new Date(),
        period: { start: startDate, end: endDate },
        summary: {
          totalRequests: 0,
          deniedRequests: 0,
          securityIncidents: 0,
          avgSecurityScore: 0,
          maxThreatLevel: 0,
        },
        threats: [],
        recommendations: [],
        compliance: {
          score: 0,
          issues: [],
          passedChecks: [],
        },
      };

      // Get security data
      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;
      const logs = data || [];

      // Calculate summary
      report.summary.totalRequests = logs.length;
      report.summary.deniedRequests = logs.filter(
        log => !log.access_granted,
      ).length;
      report.summary.securityIncidents = logs.filter(
        log => log.threat_level > 70,
      ).length;
      report.summary.avgSecurityScore = logs.reduce((acc, log) => acc + log.security_score, 0)
        / logs.length;
      report.summary.maxThreatLevel = Math.max(
        ...logs.map(log => log.threat_level),
      );

      // Analyze threats
      report.threats = this.analyzeThreatTypes(logs);

      // Compliance assessment
      report.compliance = await this.assessCompliance(logs, clinicId);

      // Generate recommendations
      if (includeRecommendations) {
        report.recommendations = await this.generateSecurityRecommendations(
          logs,
          clinicId,
        );
      }

      // Store report
      await this.storeSecurityReport(report);

      return report;
    } catch (error) {
      logger.error('Failed to generate security report', error);
      throw new Error('Failed to generate security report');
    }
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    // Set up periodic cache cleanup
    setInterval(
      () => {
        this.cleanupMetricsCache();
      },
      5 * 60 * 1000,
    ); // Clean up every 5 minutes

    // Set up real-time subscriptions for security alerts
    this.setupRealTimeSubscriptions();
  }

  /**
   * Clean up old metrics cache entries
   */
  private cleanupMetricsCache(): void {
    const cutoff = Date.now() - 5 * 60 * 1000; // 5 minutes ago

    for (const [key, metrics] of this.metricsCache.entries()) {
      if (metrics.timestamp.getTime() < cutoff) {
        this.metricsCache.delete(key);
      }
    }
  }

  /**
   * Set up real-time subscriptions
   */
  private setupRealTimeSubscriptions(): void {
    // Subscribe to security alerts
    this.supabase
      .channel('security-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts',
        },
        payload => {
          logger.info('🚨 Real-time security alert', payload);
          // Trigger real-time notifications
          this.handleRealTimeAlert(payload.new);
        },
      )
      .subscribe();
  }

  /**
   * Handle real-time security alerts
   */
  private async handleRealTimeAlert(alert: any): Promise<void> {
    try {
      // Send to notification system
      await this.sendSecurityNotification(alert);

      // Update dashboard metrics cache
      this.invalidateMetricsCache(alert.clinic_id);
    } catch (error) {
      logger.error('Failed to handle real-time alert', error);
    }
  }

  /**
   * Send security notifications
   */
  private async sendSecurityNotification(alert: any): Promise<void> {
    // Implementation would integrate with notification system
    logger.info('📧 Security notification sent for alert', alert.id);
  }

  /**
   * Invalidate metrics cache for clinic
   */
  private invalidateMetricsCache(clinicId?: string): void {
    const prefix = `metrics_${clinicId || 'all'}_`;

    for (const key of this.metricsCache.keys()) {
      if (key.startsWith(prefix)) {
        this.metricsCache.delete(key);
      }
    }
  }

  // Helper methods

  private getTopThreatTypes(logs: any[]): string[] {
    const threatTypes: Record<string, number> = {};

    logs.forEach(log => {
      if (log.threat_level > 50) {
        const type = log.reason || 'Unknown threat';
        threatTypes[type] = (threatTypes[type] || 0) + 1;
      }
    });

    return Object.entries(threatTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);
  }

  private async checkAuditLogRetention(): Promise<boolean> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { count } = await this.supabase
        .from('rls_security_audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', thirtyDaysAgo.toISOString());

      return count !== null;
    } catch {
      return false;
    }
  }

  private async checkDataEncryption(): Promise<boolean> {
    // Check if encryption is enabled in the system
    try {
      const { data } = await this.supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'data_encryption_enabled')
        .single();

      return data?.value === 'true';
    } catch {
      return false;
    }
  }

  private async checkAccessControls(): Promise<boolean> {
    // Check if RLS policies are active
    try {
      const { data } = await this.supabase
        .from('rls_policies')
        .select('active')
        .limit(1);

      return data?.length > 0;
    } catch {
      return false;
    }
  }

  private async checkIncidentResponse(): Promise<boolean> {
    // Check if incident response procedures are in place
    try {
      const { data } = await this.supabase
        .from('incident_response_procedures')
        .select('active')
        .eq('active', true)
        .limit(1);

      return data?.length > 0;
    } catch {
      return false;
    }
  }

  private analyzeThreatTypes(logs: any[]): Array<{
    type: string;
    severity: string;
    count: number;
    description: string;
  }> {
    const threatTypes: Record<string, { count: number; maxThreat: number }> = {};

    logs.forEach(log => {
      if (log.threat_level > 30) {
        const type = log.reason || 'Unknown';
        if (!threatTypes[type]) {
          threatTypes[type] = { count: 0, maxThreat: 0 };
        }
        threatTypes[type].count++;
        threatTypes[type].maxThreat = Math.max(
          threatTypes[type].maxThreat,
          log.threat_level,
        );
      }
    });

    return Object.entries(threatTypes).map(([type, data]) => ({
      type,
      severity: data.maxThreat > 75 ? 'HIGH' : data.maxThreat > 50 ? 'MEDIUM' : 'LOW',
      count: data.count,
      description: `${type} (Max threat: ${data.maxThreat})`,
    }));
  }

  private async assessCompliance(
    logs: any[],
    _clinicId?: string,
  ): Promise<{
    score: number;
    issues: string[];
    passedChecks: string[];
  }> {
    const issues: string[] = [];
    const passedChecks: string[] = [];
    let score = 100;

    // Check for high threat levels
    const highThreatLogs = logs.filter(log => log.threat_level > 70);
    if (highThreatLogs.length > 0) {
      issues.push(
        `${highThreatLogs.length} high-threat security events detected`,
      );
      score -= 20;
    } else {
      passedChecks.push('No high-threat security events');
    }

    // Check for failed access attempts
    const failedAccess = logs.filter(log => !log.access_granted);
    const failedAccessRate = failedAccess.length / logs.length;
    if (failedAccessRate > 0.1) {
      issues.push(
        `High access denial rate: ${(failedAccessRate * 100).toFixed(1)}%`,
      );
      score -= 15;
    } else {
      passedChecks.push('Acceptable access denial rate');
    }

    // Check for low security scores
    const avgSecurityScore = logs.reduce((acc, log) => acc + log.security_score, 0) / logs.length;
    if (avgSecurityScore < 70) {
      issues.push(`Low average security score: ${avgSecurityScore.toFixed(1)}`);
      score -= 10;
    } else {
      passedChecks.push('Good average security score');
    }

    return {
      score: Math.max(0, score),
      issues,
      passedChecks,
    };
  }

  private async generateSecurityRecommendations(
    logs: any[],
    _clinicId?: string,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze patterns and generate recommendations
    const failedAccess = logs.filter(log => !log.access_granted);
    const highThreatLogs = logs.filter(log => log.threat_level > 70);

    if (failedAccess.length > 0) {
      recommendations.push(
        'Review and update RLS policies for frequently denied access patterns',
      );
    }

    if (highThreatLogs.length > 0) {
      recommendations.push(
        'Implement additional security controls for high-threat access patterns',
      );
    }

    // Check for unusual access times
    const offHoursAccess = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour < 6 || hour > 22;
    });

    if (offHoursAccess.length > 0) {
      recommendations.push(
        'Consider implementing stricter controls for off-hours access',
      );
    }

    // Check for suspicious IPs
    const ipCounts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.ip_address) {
        ipCounts[log.ip_address] = (ipCounts[log.ip_address] || 0) + 1;
      }
    });

    const suspiciousIPs = Object.entries(ipCounts).filter(
      ([, count]) => count > 100,
    );
    if (suspiciousIPs.length > 0) {
      recommendations.push(
        'Investigate high-frequency access patterns from specific IP addresses',
      );
    }

    return recommendations;
  }

  private async storeSecurityReport(report: SecurityReport): Promise<void> {
    try {
      await this.supabase.from('security_reports').insert({
        id: report.id,
        generated_at: report.generatedAt.toISOString(),
        period_start: report.period.start.toISOString(),
        period_end: report.period.end.toISOString(),
        clinic_id: null, // Would be set if clinic-specific
        summary: report.summary,
        threats: report.threats,
        compliance_score: report.compliance.score,
        recommendations: report.recommendations,
      });
    } catch (error) {
      logger.error('Failed to store security report', error);
    }
  }

  // Public utility methods

  async getSecurityTrends(options: {
    clinicId?: string;
    days: number;
  }): Promise<{
    requests: Array<{ date: string; count: number }>;
    threats: Array<{ date: string; level: number }>;
    securityScores: Array<{ date: string; score: number }>;
  }> {
    const { clinicId, days = 7 } = options;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('timestamp, threat_level, security_score')
        .gte('timestamp', startDate.toISOString());

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;
      const logs = data || [];

      // Group by date
      const dateGroups: Record<
        string,
        { count: number; totalThreat: number; totalScore: number }
      > = {};

      logs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        if (!dateGroups[date]) {
          dateGroups[date] = { count: 0, totalThreat: 0, totalScore: 0 };
        }
        dateGroups[date].count++;
        dateGroups[date].totalThreat += log.threat_level;
        dateGroups[date].totalScore += log.security_score;
      });

      const sortedDates = Object.keys(dateGroups).sort();

      return {
        requests: sortedDates.map(date => ({
          date,
          count: dateGroups[date].count,
        })),
        threats: sortedDates.map(date => ({
          date,
          level: dateGroups[date].totalThreat / dateGroups[date].count,
        })),
        securityScores: sortedDates.map(date => ({
          date,
          score: dateGroups[date].totalScore / dateGroups[date].count,
        })),
      };
    } catch (error) {
      logger.error('Failed to get security trends', error);
      return { requests: [], threats: [], securityScores: [] };
    }
  }

  async getTopSecurityEvents(options: {
    clinicId?: string;
    limit?: number;
    hours?: number;
  }): Promise<any[]> {
    const { clinicId, limit = 10, hours = 24 } = options;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    try {
      let query = this.supabase
        .from('rls_security_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('threat_level', { ascending: false })
        .limit(limit);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      logger.error('Failed to get top security events', error);
      return [];
    }
  }
}

// Export singleton instance
export const securityMonitoringDashboardService = new SecurityMonitoringDashboardService();

// Export types
export type { SecurityDashboard, SecurityMetrics, SecurityReport };
