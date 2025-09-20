/**
 * Enhanced RLS Security Service with Security Headers Integration
 * Comprehensive row-level security with threat detection and automated protection
 */

import { createServerClient } from '../clients/supabase.js';
import { HealthcareRateLimitStore, type RateLimitData } from '../middleware/rate-limiting.js';
import { SecurityHeadersService } from './security-headers-service.js';

export interface SecurityContext {
  userId: string;
  userRole: string;
  clinicId: string;
  professionalId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  emergencyAccess?: boolean;
  requestMethod: string;
  requestPath: string;
  timestamp: Date;
}

export interface SecurityAlert {
  type:
    | 'ACCESS_VIOLATION'
    | 'THREAT_DETECTED'
    | 'SUSPICIOUS_PATTERN'
    | 'EMERGENCY_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  context: SecurityContext;
  details?: Record<string, any>;
  actionTaken: string;
}

export interface RLSAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId?: string;
  accessGranted: boolean;
  reason?: string;
  securityScore: number;
  threatLevel: number;
  metadata: Record<string, any>;
}

export class EnhancedRLSSecurityService {
  private supabase;
  private securityHeaders: SecurityHeadersService;
  private alertThresholds = {
    consecutiveFailures: 3,
    suspiciousPatternScore: 75,
    emergencyAccessRequired: 90,
  };

  constructor() {
    this.supabase = createServerClient();
    this.securityHeaders = new SecurityHeadersService();
  }

  /**
   * Comprehensive security evaluation for RLS access
   */
  async evaluateSecureAccess(
    context: SecurityContext,
    tableName: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    recordId?: string,
    requestData?: any,
  ): Promise<{
    granted: boolean;
    reason: string;
    securityScore: number;
    threatLevel: number;
    requirements?: string[];
    alerts?: SecurityAlert[];
  }> {
    const startTime = Date.now();

    try {
      // Initialize security evaluation
      const evaluation = {
        granted: false,
        reason: 'Security evaluation pending',
        securityScore: 0,
        threatLevel: 0,
        requirements: [] as string[],
        alerts: [] as SecurityAlert[],
      };

      // Phase 1: Threat Detection and Security Scoring
      const threatAssessment = await this.assessThreats(
        context,
        tableName,
        operation,
      );
      evaluation.threatLevel = threatAssessment.threatLevel;
      evaluation.alerts.push(...threatAssessment.alerts);

      // Phase 2: Access Pattern Analysis
      const patternAnalysis = await this.analyzeAccessPatterns(
        context,
        tableName,
        operation,
      );
      evaluation.securityScore = patternAnalysis.securityScore;

      // Phase 3: RLS Policy Evaluation (enhanced from existing)
      const rlsEvaluation = await this.evaluateEnhancedRLS(
        context,
        tableName,
        operation,
        recordId,
      );
      evaluation.granted = rlsEvaluation.granted;
      evaluation.reason = rlsEvaluation.reason;
      evaluation.requirements = rlsEvaluation.requirements;

      // Phase 4: Security Headers Integration
      const headersCheck = await this.validateSecurityHeadersIntegration(context);
      evaluation.securityScore += headersCheck.scoreModifier;

      // Phase 5: Emergency Access Override Check
      if (context.emergencyAccess) {
        const emergencyResult = await this.handleEmergencyAccess(
          context,
          evaluation,
        );
        if (emergencyResult.overrideGranted) {
          evaluation.granted = true;
          evaluation.reason = emergencyResult.reason;
          evaluation.alerts.push(emergencyResult.alert);
        }
      }

      // Phase 6: Final Security Decision
      const finalDecision = await this.makeFinalSecurityDecision(evaluation);

      // Phase 7: Audit Logging
      await this.logSecurityEvent({
        ...context,
        operation,
        tableName,
        recordId,
        accessGranted: finalDecision.granted,
        reason: finalDecision.reason,
        securityScore: finalDecision.securityScore,
        threatLevel: finalDecision.threatLevel,
        metadata: {
          evaluationTimeMs: Date.now() - startTime,
          threatAssessment,
          patternAnalysis,
          rlsEvaluation,
          headersCheck,
          requestData: this.sanitizeRequestData(requestData),
        },
      });

      return finalDecision;
    } catch (error) {
      console.error('Enhanced RLS security evaluation failed:', error);

      // Fail safe for healthcare systems - log the security failure
      await this.logSecurityEvent({
        ...context,
        operation,
        tableName,
        recordId,
        accessGranted: false,
        reason: 'Security evaluation error',
        securityScore: 0,
        threatLevel: 100,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: 'SECURITY_EVALUATION_FAILURE',
        },
      });

      return {
        granted: false,
        reason: 'Security system error - access denied',
        securityScore: 0,
        threatLevel: 100,
      };
    }
  }

  /**
   * Advanced threat detection
   */
  private async assessThreats(
    context: SecurityContext,
    tableName: string,
    _operation: string,
  ): Promise<{ threatLevel: number; alerts: SecurityAlert[] }> {
    const alerts: SecurityAlert[] = [];
    let threatScore = 0;

    // Check for IP-based threats
    if (context.ipAddress) {
      const ipThreatScore = await this.evaluateIPThreat(context.ipAddress);
      threatScore += ipThreatScore;

      if (ipThreatScore > 70) {
        alerts.push({
          type: 'THREAT_DETECTED',
          severity: 'HIGH',
          description: 'Suspicious IP address detected',
          context,
          details: { ipAddress: context.ipAddress, threatScore: ipThreatScore },
          actionTaken: 'Enhanced monitoring applied',
        });
      }
    }

    // Check for unusual access patterns
    const patternThreatScore = await this.detectUnusualPatterns(
      context,
      tableName,
      operation,
    );
    threatScore += patternThreatScore;

    if (patternThreatScore > 60) {
      alerts.push({
        type: 'SUSPICIOUS_PATTERN',
        severity: 'MEDIUM',
        description: 'Unusual access pattern detected',
        context,
        details: { tableName, operation, patternScore: patternThreatScore },
        actionTaken: 'Pattern flagged for review',
      });
    }

    // Check for time-based anomalies
    const timeAnomalyScore = this.evaluateTimeAnomaly(context.timestamp);
    threatScore += timeAnomalyScore;

    if (timeAnomalyScore > 80) {
      alerts.push({
        type: 'THREAT_DETECTED',
        severity: 'HIGH',
        description: 'Access outside normal business hours',
        context,
        details: {
          accessTime: context.timestamp.toISOString(),
          timeAnomalyScore,
        },
        actionTaken: 'Enhanced validation required',
      });
    }

    // Cap threat level at 100
    return {
      threatLevel: Math.min(threatScore, 100),
      alerts,
    };
  }

  /**
   * Access pattern analysis for anomaly detection
   */
  private async analyzeAccessPatterns(
    context: SecurityContext,
    tableName: string,
    operation: string,
  ): Promise<{ securityScore: number; anomalies: string[] }> {
    const anomalies: string[] = [];
    let securityScore = 100; // Start with perfect score

    try {
      // Check for rapid consecutive access
      const recentAccessCount = await this.countRecentAccess(
        context.userId,
        context.clinicId,
        60,
      );
      if (recentAccessCount > 50) {
        securityScore -= 30;
        anomalies.push('High frequency access pattern');
      }

      // Check for unusual table access sequences
      const accessSequence = await this.getRecentAccessSequence(
        context.userId,
        10,
      );
      if (this.detectUnusualSequence(accessSequence, tableName, operation)) {
        securityScore -= 25;
        anomalies.push('Unusual table access sequence');
      }

      // Check for role-consistent access
      const roleConsistencyScore = await this.evaluateRoleConsistency(
        context,
        tableName,
        operation,
      );
      securityScore -= roleConsistencyScore.penalty;
      if (roleConsistencyScore.penalty > 0) {
        anomalies.push(roleConsistencyScore.reason);
      }

      // Check for geographic anomalies (if IP geolocation available)
      if (context.ipAddress) {
        const geoAnomalyScore = await this.evaluateGeographicAnomaly(
          context.userId,
          context.ipAddress,
        );
        securityScore -= geoAnomalyScore;
        if (geoAnomalyScore > 20) {
          anomalies.push('Geographic access anomaly');
        }
      }

      return {
        securityScore: Math.max(0, securityScore),
        anomalies,
      };
    } catch (error) {
      console.error('Access pattern analysis failed:', error);
      return {
        securityScore: 50,
        anomalies: ['Pattern analysis failed'],
      };
    }
  }

  /**
   * Enhanced RLS evaluation with security context
   */
  private async evaluateEnhancedRLS(
    context: SecurityContext,
    tableName: string,
    operation: string,
    recordId?: string,
  ): Promise<{ granted: boolean; reason: string; requirements: string[] }> {
    const requirements: string[] = [];

    try {
      // Import and use existing RLS policies
      const { advancedRLSPolicies } = await import(
        '../security/rls-policies.js'
      );

      const result = await advancedRLSPolicies.evaluatePolicy(
        {
          userId: context.userId,
          userRole: context.userRole,
          clinicId: context.clinicId,
          professionalId: context.professionalId,
          emergencyAccess: context.emergencyAccess,
          accessTime: context.timestamp,
          ipAddress: context.ipAddress,
        },
        tableName,
        operation as any,
        recordId,
      );

      // Add security requirements
      if (result.auditRequired) {
        requirements.push('Full audit logging required');
      }

      if (result.emergencyAccess) {
        requirements.push('Emergency access justification required');
      }

      if (result.conditions) {
        requirements.push(`RLS conditions: ${result.conditions.join(', ')}`);
      }

      return {
        granted: result.allowed,
        reason: result.reason || 'RLS policy evaluation completed',
        requirements,
      };
    } catch (error) {
      console.error('Enhanced RLS evaluation failed:', error);
      return {
        granted: false,
        reason: 'RLS evaluation error',
        requirements: ['Manual security review required'],
      };
    }
  }

  /**
   * Validate security headers integration
   */
  private async validateSecurityHeadersIntegration(
    context: SecurityContext,
  ): Promise<{ scoreModifier: number; issues: string[] }> {
    const issues: string[] = [];
    let scoreModifier = 0;

    try {
      // Check if security headers service is available
      const securityContext = {
        sensitivityLevel: this.determineSensitivityLevel(context.requestPath),
        isHealthcareEndpoint: context.requestPath.includes('/api/patients'),
        hasPatientData: context.requestPath.includes('/medical-records')
          || context.requestPath.includes('/diagnostics'),
        requestMethod: context.requestMethod,
        endpoint: context.requestPath,
      };

      const headerRecommendations = await this.securityHeaders.generateSecurityHeaders(
        securityContext,
      );

      // Validate critical security headers
      const criticalHeaders = [
        'content-security-policy',
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options',
      ];

      for (const header of criticalHeaders) {
        if (!headerRecommendations.headers[header]) {
          issues.push(`Missing critical security header: ${header}`);
          scoreModifier -= 10;
        }
      }

      return {
        scoreModifier: Math.max(-50, scoreModifier),
        issues,
      };
    } catch (error) {
      console.error('Security headers validation failed:', error);
      return {
        scoreModifier: -20,
        issues: ['Security headers validation failed'],
      };
    }
  }

  /**
   * Handle emergency access with enhanced security
   */
  private async handleEmergencyAccess(
    context: SecurityContext,
    currentEvaluation: any,
  ): Promise<{
    overrideGranted: boolean;
    reason: string;
    alert: SecurityAlert;
  }> {
    try {
      // Validate emergency access justification
      const hasValidJustification = await this.validateEmergencyJustification(context);

      if (!hasValidJustification) {
        return {
          overrideGranted: false,
          reason: 'Invalid emergency access justification',
          alert: {
            type: 'ACCESS_VIOLATION',
            severity: 'HIGH',
            description: 'Invalid emergency access attempt',
            context,
            actionTaken: 'Emergency access denied - invalid justification',
          },
        };
      }

      // Check if user has emergency access privileges
      const hasEmergencyPrivileges = await this.checkEmergencyPrivileges(
        context.userId,
        context.userRole,
      );

      if (!hasEmergencyPrivileges) {
        return {
          overrideGranted: false,
          reason: 'Insufficient privileges for emergency access',
          alert: {
            type: 'ACCESS_VIOLATION',
            severity: 'HIGH',
            description: 'Unauthorized emergency access attempt',
            context,
            actionTaken: 'Emergency access denied - insufficient privileges',
          },
        };
      }

      // Grant emergency access with enhanced logging
      return {
        overrideGranted: true,
        reason: 'Emergency access granted with enhanced monitoring',
        alert: {
          type: 'EMERGENCY_ACCESS',
          severity: 'HIGH',
          description: 'Emergency access granted',
          context,
          details: {
            originalDecision: currentEvaluation.granted,
            originalScore: currentEvaluation.securityScore,
            justification: 'Emergency medical access',
          },
          actionTaken: 'Emergency access granted with full audit logging',
        },
      };
    } catch (error) {
      console.error('Emergency access validation error:', error);
      return {
        overrideGranted: false,
        reason: 'Emergency access validation error',
        alert: {
          type: 'ACCESS_VIOLATION',
          severity: 'CRITICAL',
          description: 'Emergency access system error',
          context,
          actionTaken: 'Emergency access denied - system error',
        },
      };
    }
  }

  /**
   * Make final security decision
   */
  private async makeFinalSecurityDecision(evaluation: any): Promise<any> {
    // Apply security thresholds
    const MIN_SECURITY_SCORE = 30;
    const MAX_THREAT_LEVEL = 80;

    if (evaluation.securityScore < MIN_SECURITY_SCORE) {
      return {
        ...evaluation,
        granted: false,
        reason: `Insufficient security score (${evaluation.securityScore} < ${MIN_SECURITY_SCORE})`,
      };
    }

    if (evaluation.threatLevel > MAX_THREAT_LEVEL) {
      return {
        ...evaluation,
        granted: false,
        reason: `Threat level too high (${evaluation.threatLevel} > ${MAX_THREAT_LEVEL})`,
      };
    }

    // If basic checks pass, use RLS decision
    return evaluation;
  }

  /**
   * Log comprehensive security events
   */
  private async logSecurityEvent(auditLog: RLSAuditLog): Promise<void> {
    try {
      await this.supabase.from('rls_security_audit_logs').insert({
        timestamp: auditLog.timestamp.toISOString(),
        user_id: auditLog.userId,
        operation: auditLog.operation,
        table_name: auditLog.tableName,
        record_id: auditLog.recordId,
        access_granted: auditLog.accessGranted,
        reason: auditLog.reason,
        security_score: auditLog.securityScore,
        threat_level: auditLog.threatLevel,
        metadata: auditLog.metadata,
        session_id: auditLog.sessionId,
        ip_address: auditLog.ipAddress,
        user_agent: auditLog.userAgent,
      });

      // Send real-time alert for critical security events
      if (auditLog.threatLevel > 70 || !auditLog.accessGranted) {
        await this.triggerSecurityAlert(auditLog);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Helper methods

  private async evaluateIPThreat(ipAddress: string): Promise<number> {
    // Check against threat intelligence databases
    // For now, implement basic checks
    const privateIPs = /^10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\./;
    if (privateIPs.test(ipAddress)) {
      return 10; // Low threat for private IPs
    }
    return 30; // Moderate threat for public IPs
  }

  private async detectUnusualPatterns(
    context: SecurityContext,
    _tableName: string,
    _operation: string,
  ): Promise<number> {
    // Check for unusual access patterns
    try {
      const recentCount = await this.countRecentAccess(
        context.userId,
        context.clinicId,
        300,
      ); // 5 minutes
      if (recentCount > 20) {
        return 60; // High frequency access
      }
      return 0;
    } catch {
      return 20; // Default moderate threat
    }
  }

  private evaluateTimeAnomaly(timestamp: Date): number {
    const hour = timestamp.getHours();
    // Business hours: 6 AM to 10 PM
    if (hour >= 6 && hour <= 22) {
      return 0; // Normal hours
    }
    if ((hour >= 22 && hour <= 23) || (hour >= 0 && hour <= 6)) {
      return 30; // Off hours
    }
    return 80; // Very unusual hours
  }

  private async countRecentAccess(
    userId: string,
    clinicId: string,
    timeWindowSeconds: number,
  ): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - timeWindowSeconds * 1000);
      const { count } = await this.supabase
        .from('rls_security_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .gte('timestamp', cutoff.toISOString());

      return count || 0;
    } catch {
      return 0;
    }
  }

  private async getRecentAccessSequence(
    userId: string,
    limit: number,
  ): Promise<any[]> {
    try {
      const { data } = await this.supabase
        .from('rls_security_audit_logs')
        .select('table_name, operation, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      return data || [];
    } catch {
      return [];
    }
  }

  private detectUnusualSequence(
    sequence: any[],
    currentTable: string,
    _currentOperation: string,
  ): boolean {
    // Detect suspicious access patterns
    const sensitiveTables = [
      'medical_records',
      'patient_diagnosis',
      'billing_records',
    ];
    const hasSensitiveAccess = sequence.some(
      log => sensitiveTables.includes(log.table_name) && log.operation === 'SELECT',
    );

    return hasSensitiveAccess && sensitiveTables.includes(currentTable);
  }

  private async evaluateRoleConsistency(
    context: SecurityContext,
    tableName: string,
    operation: string,
  ): Promise<{ penalty: number; reason: string }> {
    // Check if role is consistent with typical access patterns
    const roleTableMatrix: Record<string, Record<string, string[]>> = {
      doctor: {
        SELECT: ['patients', 'medical_records', 'appointments'],
        UPDATE: ['patients', 'appointments'],
      },
      nurse: {
        SELECT: ['patients', 'medical_records', 'appointments'],
        UPDATE: ['appointments'],
      },
      receptionist: {
        SELECT: ['patients', 'appointments'],
        UPDATE: ['appointments'],
      },
      patient: { SELECT: ['patients', 'appointments'], UPDATE: ['patients'] },
    };

    const allowedTables = roleTableMatrix[context.userRole]?.[operation] || [];

    if (!allowedTables.includes(tableName)) {
      return {
        penalty: 40,
        reason: `Role ${context.userRole} not typically allowed to ${operation} ${tableName}`,
      };
    }

    return { penalty: 0, reason: 'Role access pattern is normal' };
  }

  private async evaluateGeographicAnomaly(
    userId: string,
    ipAddress: string,
  ): Promise<number> {
    // Check for geographic access anomalies
    try {
      const { data: recentAccess } = await this.supabase
        .from('rls_security_audit_logs')
        .select('ip_address')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (recentAccess && recentAccess.length > 0) {
        const lastIP = recentAccess[0].ip_address;
        if (lastIP && lastIP !== ipAddress) {
          return 40; // IP changed recently
        }
      }
      return 0;
    } catch {
      return 20;
    }
  }

  private determineSensitivityLevel(
    requestPath: string,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (
      requestPath.includes('/medical-records')
      || requestPath.includes('/diagnostics')
    ) {
      return 'critical';
    }
    if (requestPath.includes('/patients') || requestPath.includes('/billing')) {
      return 'high';
    }
    if (
      requestPath.includes('/appointments')
      || requestPath.includes('/professionals')
    ) {
      return 'medium';
    }
    return 'low';
  }

  private async validateEmergencyJustification(
    context: SecurityContext,
  ): Promise<boolean> {
    // Validate emergency access justification
    // In a real implementation, this would check for proper documentation
    return context.emergencyAccess && context.requestMethod === 'GET';
  }

  private async checkEmergencyPrivileges(
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    // Check if user has emergency access privileges
    const emergencyRoles = ['doctor', 'admin', 'clinic_admin'];
    return emergencyRoles.includes(userRole);
  }

  private async triggerSecurityAlert(auditLog: RLSAuditLog): Promise<void> {
    // Send real-time security alerts
    console.warn('🚨 SECURITY ALERT:', {
      type: auditLog.accessGranted ? 'GRANTED' : 'DENIED',
      threatLevel: auditLog.threatLevel,
      user: auditLog.userId,
      operation: `${auditLog.operation} ${auditLog.tableName}`,
      reason: auditLog.reason,
    });
  }

  private sanitizeRequestData(requestData?: any): any {
    if (!requestData) return undefined;

    // Remove sensitive data from audit logs
    const sanitized = { ...requestData };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.credit_card;

    return sanitized;
  }

  // Public utility methods

  async getUserSecuritySummary(userId: string): Promise<{
    securityScore: number;
    recentAlerts: SecurityAlert[];
    accessPatterns: any;
  }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: auditData } = await this.supabase
        .from('rls_security_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      const securityScore = auditData?.reduce((acc, log) => acc + log.security_score, 0)
        / (auditData?.length || 1);

      return {
        securityScore,
        recentAlerts: auditData
          ?.filter(log => log.threat_level > 50)
          .map(log => ({
            type: 'THREAT_DETECTED' as const,
            severity: log.threat_level > 75 ? 'HIGH' : ('MEDIUM' as const),
            description: log.reason,
            context: {} as SecurityContext,
            actionTaken: 'Logged for review',
          })) || [],
        accessPatterns: {
          totalAccess: auditData?.length || 0,
          averageSecurityScore: securityScore,
          lastAccess: auditData?.[0]?.timestamp,
        },
      };
    } catch (error) {
      console.error('Failed to get user security summary:', error);
      return {
        securityScore: 50,
        recentAlerts: [],
        accessPatterns: { totalAccess: 0, averageSecurityScore: 50 },
      };
    }
  }

  async generateSecurityReport(options: {
    startDate?: Date;
    endDate?: Date;
    clinicId?: string;
    threatThreshold?: number;
  }): Promise<any> {
    const { startDate, endDate, clinicId, threatThreshold = 50 } = options;

    try {
      let query = this.supabase.from('rls_security_audit_logs').select('*');

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data: auditData } = await query;

      const totalRequests = auditData?.length || 0;
      const deniedRequests = auditData?.filter(log => !log.access_granted).length || 0;
      const highThreatEvents = auditData?.filter(log => log.threat_level >= threatThreshold)
        .length || 0;

      return {
        period: {
          start: startDate?.toISOString() || 'beginning',
          end: endDate?.toISOString() || 'now',
        },
        summary: {
          totalRequests,
          deniedRequests,
          accessDeniedRate: totalRequests > 0 ? (deniedRequests / totalRequests) * 100 : 0,
          highThreatEvents,
          averageSecurityScore: auditData?.reduce((acc, log) => acc + log.security_score, 0)
              / totalRequests || 0,
          averageThreatLevel: auditData?.reduce((acc, log) => acc + log.threat_level, 0)
              / totalRequests || 0,
        },
        threats: auditData?.filter(log => log.threat_level >= threatThreshold) || [],
        trends: this.analyzeSecurityTrends(auditData || []),
      };
    } catch (error) {
      console.error('Failed to generate security report:', error);
      return { error: 'Failed to generate security report' };
    }
  }

  private analyzeSecurityTrends(auditData: any[]): any {
    // Analyze security trends over time
    const hourlyData: Record<
      number,
      { total: number; denied: number; avgScore: number }
    > = {};

    auditData.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { total: 0, denied: 0, avgScore: 0 };
      }
      hourlyData[hour].total++;
      if (!log.access_granted) hourlyData[hour].denied++;
      hourlyData[hour].avgScore += log.security_score;
    });

    Object.keys(hourlyData).forEach(hour => {
      const data = hourlyData[parseInt(hour)];
      data.avgScore = data.avgScore / data.total;
    });

    return {
      hourlyPatterns: hourlyData,
      peakThreatHours: Object.entries(hourlyData)
        .sort(([, a], [, b]) => b.denied - a.denied)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour)),
    };
  }
}

// Export singleton instance
export const enhancedRLSSecurityService = new EnhancedRLSSecurityService();

// Export types
export type { RLSAuditLog, SecurityAlert, SecurityContext };
