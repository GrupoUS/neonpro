// Security API Routes
// Story 1.4: Session Management & Security Implementation

import { NextRequest, NextResponse } from 'next/server';
import { SecurityMonitor } from '../security-monitor';
import { SessionManager } from '../session-manager';
import { DeviceManager } from '../device-manager';
import { SecurityEvent, SecurityAlert, SecurityMetrics } from '../types';
import { ValidationUtils } from '../utils';

/**
 * Security API route handlers
 */
export class SecurityRoutes {
  constructor(
    private securityMonitor: SecurityMonitor,
    private sessionManager: SessionManager,
    private deviceManager: DeviceManager
  ) {}

  /**
   * Get security events
   * GET /api/auth/security/events
   */
  async getSecurityEvents(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const severity = url.searchParams.get('severity');
      const type = url.searchParams.get('type');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const events = await this.securityMonitor.getSecurityEvents({
        userId: userId || undefined,
        severity: severity as any,
        type: type || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      });

      return NextResponse.json({
        success: true,
        events,
        pagination: {
          limit,
          offset,
          total: events.length,
        },
      });
    } catch (error) {
      console.error('Get security events error:', error);
      return NextResponse.json(
        { error: 'Failed to get security events' },
        { status: 500 }
      );
    }
  }

  /**
   * Get security alerts
   * GET /api/auth/security/alerts
   */
  async getSecurityAlerts(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const severity = url.searchParams.get('severity');
      const dismissed = url.searchParams.get('dismissed') === 'true';
      const limit = parseInt(url.searchParams.get('limit') || '20');

      const alerts = await this.securityMonitor.getSecurityAlerts({
        userId: userId || undefined,
        severity: severity as any,
        dismissed,
        limit,
      });

      return NextResponse.json({
        success: true,
        alerts,
        count: alerts.length,
      });
    } catch (error) {
      console.error('Get security alerts error:', error);
      return NextResponse.json(
        { error: 'Failed to get security alerts' },
        { status: 500 }
      );
    }
  }

  /**
   * Dismiss security alert
   * PUT /api/auth/security/alerts/:alertId/dismiss
   */
  async dismissAlert(request: NextRequest, alertId: string): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const body = await request.json().catch(() => ({}));
      const { reason = 'admin_dismissed' } = body;

      const success = await this.securityMonitor.dismissAlert(alertId, reason);

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to dismiss alert' },
          { status: 400 }
        );
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: 'alert_dismissed',
        severity: 'info',
        details: {
          alertId,
          reason,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: 'Alert dismissed successfully',
      });
    } catch (error) {
      console.error('Dismiss alert error:', error);
      return NextResponse.json(
        { error: 'Failed to dismiss alert' },
        { status: 500 }
      );
    }
  }

  /**
   * Get security metrics
   * GET /api/auth/security/metrics
   */
  async getSecurityMetrics(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const period = url.searchParams.get('period') || '24h';
      const userId = url.searchParams.get('userId');

      const metrics = await this.securityMonitor.getSecurityMetrics({
        period,
        userId: userId || undefined,
      });

      return NextResponse.json({
        success: true,
        metrics,
        period,
      });
    } catch (error) {
      console.error('Get security metrics error:', error);
      return NextResponse.json(
        { error: 'Failed to get security metrics' },
        { status: 500 }
      );
    }
  }

  /**
   * Report suspicious activity
   * POST /api/auth/security/report
   */
  async reportSuspiciousActivity(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { type, details, severity = 'medium' } = body;

      if (!type || !details) {
        return NextResponse.json(
          { error: 'Missing required fields: type, details' },
          { status: 400 }
        );
      }

      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Get session info if available
      const authHeader = request.headers.get('authorization');
      let userId: string | undefined;
      let sessionId: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
        const session = await this.sessionManager.getSession(sessionId);
        if (session) {
          userId = session.userId;
        }
      }

      // Log security event
      const event = await this.securityMonitor.logSecurityEvent({
        type: `suspicious_${type}`,
        userId,
        sessionId,
        severity: severity as any,
        details,
        timestamp: new Date(),
        ipAddress: clientIP,
        userAgent,
      });

      // Check if this triggers any alerts
      const riskScore = await this.securityMonitor.calculateRiskScore({
        userId,
        sessionId,
        ipAddress: clientIP,
        userAgent,
        activity: type,
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        eventId: event.id,
        riskScore,
        message: 'Suspicious activity reported successfully',
      });
    } catch (error) {
      console.error('Report suspicious activity error:', error);
      return NextResponse.json(
        { error: 'Failed to report suspicious activity' },
        { status: 500 }
      );
    }
  }

  /**
   * Get risk assessment
   * POST /api/auth/security/risk-assessment
   */
  async getRiskAssessment(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { userId, sessionId, activity } = body;

      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const riskScore = await this.securityMonitor.calculateRiskScore({
        userId,
        sessionId,
        ipAddress: clientIP,
        userAgent,
        activity,
        timestamp: new Date(),
      });

      const riskLevel = this.getRiskLevel(riskScore);
      const recommendations = this.getSecurityRecommendations(riskScore, riskLevel);

      return NextResponse.json({
        success: true,
        riskScore,
        riskLevel,
        recommendations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get risk assessment error:', error);
      return NextResponse.json(
        { error: 'Failed to get risk assessment' },
        { status: 500 }
      );
    }
  }

  /**
   * Block IP address
   * POST /api/auth/security/block-ip
   */
  async blockIP(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const body = await request.json();
      const { ipAddress, reason, duration } = body;

      if (!ipAddress || !reason) {
        return NextResponse.json(
          { error: 'Missing required fields: ipAddress, reason' },
          { status: 400 }
        );
      }

      // Validate IP address format
      if (!ValidationUtils.isValidIP(ipAddress)) {
        return NextResponse.json(
          { error: 'Invalid IP address format' },
          { status: 400 }
        );
      }

      const success = await this.securityMonitor.blockIP(
        ipAddress,
        reason,
        duration
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to block IP address' },
          { status: 400 }
        );
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: 'ip_blocked',
        severity: 'warning',
        details: {
          blockedIP: ipAddress,
          reason,
          duration,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: `IP address ${ipAddress} blocked successfully`,
      });
    } catch (error) {
      console.error('Block IP error:', error);
      return NextResponse.json(
        { error: 'Failed to block IP address' },
        { status: 500 }
      );
    }
  }

  /**
   * Unblock IP address
   * DELETE /api/auth/security/block-ip/:ipAddress
   */
  async unblockIP(request: NextRequest, ipAddress: string): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const success = await this.securityMonitor.unblockIP(ipAddress);

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to unblock IP address' },
          { status: 400 }
        );
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: 'ip_unblocked',
        severity: 'info',
        details: {
          unblockedIP: ipAddress,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: `IP address ${ipAddress} unblocked successfully`,
      });
    } catch (error) {
      console.error('Unblock IP error:', error);
      return NextResponse.json(
        { error: 'Failed to unblock IP address' },
        { status: 500 }
      );
    }
  }

  /**
   * Get blocked IPs
   * GET /api/auth/security/blocked-ips
   */
  async getBlockedIPs(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const blockedIPs = await this.securityMonitor.getBlockedIPs();

      return NextResponse.json({
        success: true,
        blockedIPs,
        count: blockedIPs.length,
      });
    } catch (error) {
      console.error('Get blocked IPs error:', error);
      return NextResponse.json(
        { error: 'Failed to get blocked IPs' },
        { status: 500 }
      );
    }
  }

  /**
   * Export security report
   * GET /api/auth/security/export
   */
  async exportSecurityReport(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const format = url.searchParams.get('format') || 'json';
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const includeEvents = url.searchParams.get('includeEvents') === 'true';
      const includeAlerts = url.searchParams.get('includeAlerts') === 'true';
      const includeMetrics = url.searchParams.get('includeMetrics') === 'true';

      const report = await this.securityMonitor.exportSecurityReport({
        format,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        includeEvents,
        includeAlerts,
        includeMetrics,
      });

      const headers = new Headers();
      
      if (format === 'csv') {
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', 'attachment; filename="security-report.csv"');
      } else {
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', 'attachment; filename="security-report.json"');
      }

      return new NextResponse(report, { headers });
    } catch (error) {
      console.error('Export security report error:', error);
      return NextResponse.json(
        { error: 'Failed to export security report' },
        { status: 500 }
      );
    }
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || 'unknown';
  }

  private async verifyAdminAuthorization(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);
    
    if (!session || !['owner', 'manager'].includes(session.userRole)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return null;
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'minimal';
  }

  private getSecurityRecommendations(riskScore: number, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push(
        'Immediately terminate all user sessions',
        'Block IP address temporarily',
        'Require MFA for next login',
        'Review and audit user account',
        'Consider account suspension'
      );
    } else if (riskLevel === 'high') {
      recommendations.push(
        'Require MFA for sensitive operations',
        'Monitor user activity closely',
        'Consider device re-verification',
        'Review recent login patterns'
      );
    } else if (riskLevel === 'medium') {
      recommendations.push(
        'Enable additional monitoring',
        'Consider MFA prompt',
        'Review device trust level'
      );
    } else if (riskLevel === 'low') {
      recommendations.push(
        'Continue normal monitoring',
        'No immediate action required'
      );
    }

    return recommendations;
  }
}

/**
 * Create security routes handler
 */
export function createSecurityRoutes(
  securityMonitor: SecurityMonitor,
  sessionManager: SessionManager,
  deviceManager: DeviceManager
) {
  return new SecurityRoutes(securityMonitor, sessionManager, deviceManager);
}
