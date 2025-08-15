/**
 * Security Event Logger - Advanced Security Monitoring and Threat Detection
 *
 * Comprehensive security event logging, pattern analysis, and threat detection
 * for the NeonPro session management system.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthenticationResponse,
  SecurityConfig,
  SecurityEvent,
  SecurityEventType,
  SecurityPattern,
  SecurityReport,
  SecuritySeverity,
  ThreatLevel,
} from './types';
import { removeUndefined, validateUUID } from './utils';

/**
 * Security Event Logger Class
 *
 * Core security monitoring operations:
 * - Event logging and categorization
 * - Pattern analysis and anomaly detection
 * - Risk assessment and threat scoring
 * - Automated response triggers
 * - Security reporting and analytics
 */
export class SecurityEventLogger {
  private readonly supabase: SupabaseClient;
  private readonly config: SecurityConfig;
  private readonly patternCache: Map<string, SecurityPattern[]> = new Map();
  private readonly riskScores: Map<string, number> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Log a security event
   */
  async logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    userId: string,
    deviceId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthenticationResponse> {
    try {
      // Validate input
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format',
          },
          timestamp: new Date().toISOString(),
        };
      }

      if (deviceId && !validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_DEVICE_ID',
            message: 'Invalid device ID format',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Calculate risk score
      const riskScore = await this.calculateRiskScore(
        type,
        severity,
        userId,
        details
      );

      // Determine threat level
      const threatLevel = this.determineThreatLevel(riskScore, severity);

      // Create event record
      const eventId = crypto.randomUUID();
      const eventData = removeUndefined({
        id: eventId,
        type,
        severity,
        user_id: userId,
        device_id: deviceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: details ? JSON.stringify(details) : null,
        risk_score: riskScore,
        threat_level: threatLevel,
        resolved: false,
        created_at: new Date().toISOString(),
      });

      const { data, error } = await this.supabase
        .from('security_events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'EVENT_LOG_FAILED',
            message: 'Failed to log security event',
            details: { error: error.message },
          },
          timestamp: new Date().toISOString(),
        };
      }

      const securityEvent = this.convertToSecurityEvent(data);

      // Trigger automated responses for high-risk events
      if (threatLevel === 'critical' || threatLevel === 'high') {
        await this.triggerAutomatedResponse(securityEvent);
      }

      // Update pattern analysis
      await this.updatePatternAnalysis(userId, type, severity);

      return {
        success: true,
        data: securityEvent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EVENT_LOG_ERROR',
          message: 'Error logging security event',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze security patterns for a user
   */
  async analyzePatterns(
    userId: string,
    timeWindow = 24
  ): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const startTime = new Date(
        Date.now() - timeWindow * 60 * 60 * 1000
      ).toISOString();

      const { data: events, error } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startTime)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: 'PATTERN_ANALYSIS_FAILED',
            message: 'Failed to analyze security patterns',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const patterns = this.detectPatterns(events || []);
      const anomalies = this.detectAnomalies(events || []);
      const riskAssessment = this.assessUserRisk(userId, events || []);

      // Cache patterns for future reference
      this.patternCache.set(userId, patterns);

      return {
        success: true,
        data: {
          userId,
          timeWindow,
          eventCount: events?.length || 0,
          patterns,
          anomalies,
          riskAssessment,
          analyzedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PATTERN_ANALYSIS_ERROR',
          message: 'Error analyzing security patterns',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get security events with filtering
   */
  async getEvents(
    userId?: string,
    type?: SecurityEventType,
    severity?: SecuritySeverity,
    startDate?: string,
    endDate?: string,
    limit = 100
  ): Promise<AuthenticationResponse> {
    try {
      let query = this.supabase.from('security_events').select('*');

      if (userId) {
        if (!validateUUID(userId)) {
          return {
            success: false,
            error: {
              code: 'INVALID_USER_ID',
              message: 'Invalid user ID format',
            },
            timestamp: new Date().toISOString(),
          };
        }
        query = query.eq('user_id', userId);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: {
            code: 'GET_EVENTS_FAILED',
            message: 'Failed to retrieve security events',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const events = (data || []).map((row) =>
        this.convertToSecurityEvent(row)
      );

      return {
        success: true,
        data: events,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_EVENTS_ERROR',
          message: 'Error retrieving security events',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Resolve a security event
   */
  async resolveEvent(
    eventId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(eventId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_EVENT_ID',
            message: 'Invalid event ID format',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from('security_events')
        .update({
          resolved: true,
          resolution,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'EVENT_RESOLVE_FAILED',
            message: 'Failed to resolve security event',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const securityEvent = this.convertToSecurityEvent(data);

      return {
        success: true,
        data: securityEvent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EVENT_RESOLVE_ERROR',
          message: 'Error resolving security event',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<SecurityReport> {
    try {
      let query = this.supabase
        .from('security_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: events, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch events for report: ${error.message}`);
      }

      const securityEvents = (events || []).map((row) =>
        this.convertToSecurityEvent(row)
      );

      // Generate statistics
      const totalEvents = securityEvents.length;
      const eventsBySeverity = this.groupEventsBySeverity(securityEvents);
      const eventsByType = this.groupEventsByType(securityEvents);
      const threatLevelDistribution =
        this.getThreatLevelDistribution(securityEvents);
      const topThreats = this.getTopThreats(securityEvents);
      const resolvedEvents = securityEvents.filter((e) => e.resolved).length;
      const unresolvedEvents = totalEvents - resolvedEvents;
      const averageRiskScore = this.calculateAverageRiskScore(securityEvents);

      // Identify trends
      const trends = this.identifySecurityTrends(securityEvents);

      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(
        securityEvents,
        trends
      );

      return {
        reportId: crypto.randomUUID(),
        startDate,
        endDate,
        userId,
        summary: {
          totalEvents,
          resolvedEvents,
          unresolvedEvents,
          averageRiskScore,
          highestThreatLevel: this.getHighestThreatLevel(securityEvents),
        },
        eventsBySeverity,
        eventsByType,
        threatLevelDistribution,
        topThreats,
        trends,
        recommendations,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Error generating security report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clean up old security events
   */
  async cleanupOldEvents(retentionDays = 90): Promise<AuthenticationResponse> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { data, error } = await this.supabase
        .from('security_events')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        return {
          success: false,
          error: {
            code: 'EVENT_CLEANUP_FAILED',
            message: 'Failed to cleanup old security events',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: {
          deletedCount: data?.length || 0,
          cutoffDate: cutoffDate.toISOString(),
          cleanupDate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EVENT_CLEANUP_ERROR',
          message: 'Error cleaning up old security events',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check for security violations
   */
  async checkSecurityViolations(
    userId: string
  ): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const violations = [];
      const now = new Date();
      const oneHour = 60 * 60 * 1000;
      const oneDay = 24 * oneHour;

      // Check for excessive failed login attempts
      const failedLogins = await this.getRecentEventCount(
        userId,
        'login_failed',
        new Date(now.getTime() - oneHour).toISOString()
      );

      if (failedLogins >= this.config.maxFailedLogins) {
        violations.push({
          type: 'excessive_failed_logins',
          severity: 'high' as SecuritySeverity,
          count: failedLogins,
          threshold: this.config.maxFailedLogins,
          timeWindow: '1 hour',
        });
      }

      // Check for suspicious device activity
      const suspiciousActivity = await this.getRecentEventCount(
        userId,
        'suspicious_activity',
        new Date(now.getTime() - oneDay).toISOString()
      );

      if (suspiciousActivity >= this.config.maxSuspiciousActivity) {
        violations.push({
          type: 'excessive_suspicious_activity',
          severity: 'medium' as SecuritySeverity,
          count: suspiciousActivity,
          threshold: this.config.maxSuspiciousActivity,
          timeWindow: '24 hours',
        });
      }

      // Check for concurrent session violations
      const concurrentSessions = await this.getRecentEventCount(
        userId,
        'concurrent_session_violation',
        new Date(now.getTime() - oneHour).toISOString()
      );

      if (concurrentSessions > 0) {
        violations.push({
          type: 'concurrent_session_violations',
          severity: 'medium' as SecuritySeverity,
          count: concurrentSessions,
          threshold: 0,
          timeWindow: '1 hour',
        });
      }

      return {
        success: true,
        data: {
          userId,
          violations,
          violationCount: violations.length,
          checkedAt: now.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SECURITY_CHECK_ERROR',
          message: 'Error checking security violations',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Private helper methods
   */
  private async calculateRiskScore(
    type: SecurityEventType,
    severity: SecuritySeverity,
    userId: string,
    details?: Record<string, any>
  ): Promise<number> {
    let baseScore = 0;

    // Base score by event type
    const typeScores: Record<SecurityEventType, number> = {
      login_success: 1,
      login_failed: 3,
      logout: 1,
      session_created: 1,
      session_expired: 2,
      device_registered: 2,
      device_trusted: 1,
      device_blocked: 5,
      suspicious_activity: 4,
      concurrent_session_violation: 3,
      security_breach: 8,
      unauthorized_access: 7,
      data_access: 2,
      permission_escalation: 6,
      account_locked: 4,
      password_changed: 2,
      email_changed: 3,
      profile_updated: 1,
    };

    baseScore = typeScores[type] || 1;

    // Severity multiplier
    const severityMultipliers: Record<SecuritySeverity, number> = {
      low: 1,
      medium: 1.5,
      high: 2.5,
      critical: 4,
    };

    baseScore *= severityMultipliers[severity];

    // Historical risk factor
    const userRiskScore = this.riskScores.get(userId) || 0;
    const historicalFactor = Math.min(userRiskScore / 100, 2); // Cap at 2x

    baseScore *= 1 + historicalFactor;

    // Context-specific adjustments
    if (details) {
      if (details.newLocation) {
        baseScore *= 1.3;
      }
      if (details.newDevice) {
        baseScore *= 1.2;
      }
      if (details.offHours) {
        baseScore *= 1.1;
      }
      if (details.vpnDetected) {
        baseScore *= 1.2;
      }
      if (details.torDetected) {
        baseScore *= 2.0;
      }
    }

    return Math.round(baseScore * 10) / 10; // Round to 1 decimal
  }

  private determineThreatLevel(
    riskScore: number,
    severity: SecuritySeverity
  ): ThreatLevel {
    if (severity === 'critical' || riskScore >= 15) {
      return 'critical';
    }
    if (severity === 'high' || riskScore >= 10) {
      return 'high';
    }
    if (severity === 'medium' || riskScore >= 5) {
      return 'medium';
    }
    return 'low';
  }

  private async triggerAutomatedResponse(event: SecurityEvent): Promise<void> {
    try {
      // Log automated response trigger
      await this.logEvent(
        'security_breach',
        'high',
        event.userId,
        event.deviceId,
        {
          triggeredBy: event.id,
          originalEvent: event.type,
          automatedResponse: true,
        }
      );

      // TODO: Implement specific automated responses
      // - Block suspicious devices
      // - Terminate sessions
      // - Send security alerts
      // - Escalate to security team
    } catch (error) {
      console.error('Error triggering automated response:', error);
    }
  }

  private async updatePatternAnalysis(
    userId: string,
    _type: SecurityEventType,
    severity: SecuritySeverity
  ): Promise<void> {
    try {
      const currentScore = this.riskScores.get(userId) || 0;
      const increment =
        severity === 'critical'
          ? 5
          : severity === 'high'
            ? 3
            : severity === 'medium'
              ? 2
              : 1;

      this.riskScores.set(userId, currentScore + increment);

      // Decay risk scores over time (simple implementation)
      setTimeout(
        () => {
          const score = this.riskScores.get(userId) || 0;
          this.riskScores.set(userId, Math.max(0, score - 1));
        },
        24 * 60 * 60 * 1000
      ); // 24 hours
    } catch (error) {
      console.error('Error updating pattern analysis:', error);
    }
  }

  private detectPatterns(events: any[]): SecurityPattern[] {
    const patterns: SecurityPattern[] = [];

    // Detect repeated failed logins
    const failedLogins = events.filter((e) => e.type === 'login_failed');
    if (failedLogins.length >= 3) {
      patterns.push({
        type: 'repeated_failed_logins',
        severity: 'high',
        count: failedLogins.length,
        description: `${failedLogins.length} failed login attempts detected`,
        firstOccurrence: failedLogins.at(-1).created_at,
        lastOccurrence: failedLogins[0].created_at,
      });
    }

    // Detect suspicious device registrations
    const deviceRegistrations = events.filter(
      (e) => e.type === 'device_registered'
    );
    if (deviceRegistrations.length >= 3) {
      patterns.push({
        type: 'multiple_device_registrations',
        severity: 'medium',
        count: deviceRegistrations.length,
        description: `${deviceRegistrations.length} new devices registered`,
        firstOccurrence: deviceRegistrations.at(-1).created_at,
        lastOccurrence: deviceRegistrations[0].created_at,
      });
    }

    return patterns;
  }

  private detectAnomalies(events: any[]): any[] {
    const anomalies = [];

    // Detect unusual time patterns
    const offHoursEvents = events.filter((e) => {
      const hour = new Date(e.created_at).getHours();
      return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
    });

    if (offHoursEvents.length > events.length * 0.3) {
      anomalies.push({
        type: 'unusual_time_pattern',
        description: 'High percentage of activity outside normal hours',
        percentage: Math.round((offHoursEvents.length / events.length) * 100),
      });
    }

    return anomalies;
  }

  private assessUserRisk(userId: string, events: any[]): any {
    const riskFactors = [];
    const totalEvents = events.length;

    const highSeverityEvents = events.filter(
      (e) => e.severity === 'high' || e.severity === 'critical'
    );
    const highSeverityRatio =
      totalEvents > 0 ? highSeverityEvents.length / totalEvents : 0;

    if (highSeverityRatio > 0.2) {
      riskFactors.push('High percentage of severe security events');
    }

    const failedLogins = events.filter((e) => e.type === 'login_failed');
    if (failedLogins.length > 5) {
      riskFactors.push('Excessive failed login attempts');
    }

    const riskLevel =
      riskFactors.length === 0
        ? 'low'
        : riskFactors.length <= 2
          ? 'medium'
          : 'high';

    return {
      level: riskLevel,
      factors: riskFactors,
      score: this.riskScores.get(userId) || 0,
    };
  }

  private async getRecentEventCount(
    userId: string,
    type: SecurityEventType,
    since: string
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('security_events')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('type', type)
        .gte('created_at', since);

      if (error) {
        console.error('Error getting recent event count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting recent event count:', error);
      return 0;
    }
  }

  private groupEventsBySeverity(
    events: SecurityEvent[]
  ): Record<SecuritySeverity, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      },
      {} as Record<SecuritySeverity, number>
    );
  }

  private groupEventsByType(
    events: SecurityEvent[]
  ): Record<SecurityEventType, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<SecurityEventType, number>
    );
  }

  private getThreatLevelDistribution(
    events: SecurityEvent[]
  ): Record<ThreatLevel, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.threatLevel] = (acc[event.threatLevel] || 0) + 1;
        return acc;
      },
      {} as Record<ThreatLevel, number>
    );
  }

  private getTopThreats(events: SecurityEvent[]): Array<{
    type: SecurityEventType;
    count: number;
    severity: SecuritySeverity;
  }> {
    const threatCounts = this.groupEventsByType(events);

    return Object.entries(threatCounts)
      .map(([type, count]) => ({
        type: type as SecurityEventType,
        count,
        severity: this.getMostCommonSeverity(
          events.filter((e) => e.type === type)
        ),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getMostCommonSeverity(events: SecurityEvent[]): SecuritySeverity {
    const severityCounts = this.groupEventsBySeverity(events);
    return (
      (Object.entries(severityCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as SecuritySeverity) || 'low'
    );
  }

  private calculateAverageRiskScore(events: SecurityEvent[]): number {
    if (events.length === 0) {
      return 0;
    }
    const total = events.reduce((sum, event) => sum + event.riskScore, 0);
    return Math.round((total / events.length) * 10) / 10;
  }

  private getHighestThreatLevel(events: SecurityEvent[]): ThreatLevel {
    const levels: ThreatLevel[] = ['low', 'medium', 'high', 'critical'];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (events.some((e) => e.threatLevel === levels[i])) {
        return levels[i];
      }
    }

    return 'low';
  }

  private identifySecurityTrends(events: SecurityEvent[]): any[] {
    // Simple trend analysis - could be enhanced with more sophisticated algorithms
    const trends = [];

    const recentEvents = events.filter((e) => {
      const eventDate = new Date(e.createdAt);
      const daysDiff =
        (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const olderEvents = events.filter((e) => {
      const eventDate = new Date(e.createdAt);
      const daysDiff =
        (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    });

    const recentCount = recentEvents.length;
    const olderCount = olderEvents.length;

    if (recentCount > olderCount * 1.5) {
      trends.push({
        type: 'increasing_activity',
        description: 'Security events are increasing',
        change: `+${Math.round(((recentCount - olderCount) / olderCount) * 100)}%`,
      });
    } else if (recentCount < olderCount * 0.5) {
      trends.push({
        type: 'decreasing_activity',
        description: 'Security events are decreasing',
        change: `-${Math.round(((olderCount - recentCount) / olderCount) * 100)}%`,
      });
    }

    return trends;
  }

  private generateSecurityRecommendations(
    events: SecurityEvent[],
    trends: any[]
  ): string[] {
    const recommendations = [];

    const failedLogins = events.filter((e) => e.type === 'login_failed').length;
    if (failedLogins > 10) {
      recommendations.push(
        'Consider implementing additional authentication factors'
      );
      recommendations.push('Review and strengthen password policies');
    }

    const suspiciousActivity = events.filter(
      (e) => e.type === 'suspicious_activity'
    ).length;
    if (suspiciousActivity > 5) {
      recommendations.push('Enhance device fingerprinting and detection');
      recommendations.push('Implement stricter device trust policies');
    }

    const increasingTrend = trends.find(
      (t) => t.type === 'increasing_activity'
    );
    if (increasingTrend) {
      recommendations.push(
        'Monitor security events more closely due to increasing activity'
      );
      recommendations.push(
        'Consider implementing automated response mechanisms'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Security posture appears stable - continue monitoring'
      );
    }

    return recommendations;
  }

  private convertToSecurityEvent(row: any): SecurityEvent {
    return {
      id: row.id,
      type: row.type,
      severity: row.severity,
      userId: row.user_id,
      deviceId: row.device_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      details: row.details ? JSON.parse(row.details) : undefined,
      riskScore: row.risk_score,
      threatLevel: row.threat_level,
      resolved: row.resolved,
      resolution: row.resolution,
      resolvedBy: row.resolved_by,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
    };
  }
}

export default SecurityEventLogger;
