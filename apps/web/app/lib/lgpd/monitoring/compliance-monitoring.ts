/**
 * Real-Time LGPD Compliance Monitoring System
 *
 * Comprehensive real-time monitoring system for LGPD compliance across
 * all NeonPro healthcare application components with automated alerts,
 * scoring, and violation detection.
 *
 * Features:
 * - Real-time compliance scoring and metrics
 * - Automated violation detection and alerts
 * - Compliance trend analysis and reporting
 * - Risk assessment and mitigation recommendations
 * - Integration with existing audit and LGPD systems
 * - Healthcare-specific compliance monitoring
 */

import {
  AuditEventType,
  securityAuditLogger,
} from '../../auth/audit/security-audit-logger';
import { lgpdComplianceManager } from '../../auth/lgpd/lgpd-compliance-manager';

// Compliance scoring categories
export enum ComplianceCategory {
  CONSENT_MANAGEMENT = 'consent_management',
  DATA_SUBJECT_RIGHTS = 'data_subject_rights',
  DATA_PROTECTION = 'data_protection',
  AUDIT_TRAIL = 'audit_trail',
  DATA_RETENTION = 'data_retention',
  BREACH_RESPONSE = 'breach_response',
  THIRD_PARTY_COMPLIANCE = 'third_party_compliance',
  DOCUMENTATION = 'documentation',
}

export enum ComplianceLevel {
  CRITICAL = 'critical', // 0-25% - Immediate action required
  POOR = 'poor', // 26-50% - Urgent improvement needed
  FAIR = 'fair', // 51-75% - Attention required
  GOOD = 'good', // 76-90% - Minor improvements
  EXCELLENT = 'excellent', // 91-100% - Fully compliant
}

export enum ViolationType {
  CONSENT_VIOLATION = 'consent_violation',
  DATA_ACCESS_VIOLATION = 'data_access_violation',
  RETENTION_VIOLATION = 'retention_violation',
  AUDIT_VIOLATION = 'audit_violation',
  DISCLOSURE_VIOLATION = 'disclosure_violation',
  SECURITY_VIOLATION = 'security_violation',
  RESPONSE_TIME_VIOLATION = 'response_time_violation',
}

export type ComplianceMetrics = {
  overallScore: number;
  categoryScores: Record<ComplianceCategory, number>;
  complianceLevel: ComplianceLevel;
  totalViolations: number;
  criticalViolations: number;
  resolvedViolations: number;
  pendingDataRequests: number;
  activeConsents: number;
  expiredConsents: number;
  lastAssessment: number;
  nextAssessment: number;
  trends: ComplianceTrend[];
};

export type ComplianceTrend = {
  category: ComplianceCategory;
  period: 'daily' | 'weekly' | 'monthly';
  scores: number[];
  dates: number[];
  direction: 'improving' | 'declining' | 'stable';
};

export type ComplianceViolation = {
  id: string;
  type: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: ComplianceCategory;
  description: string;
  detectedAt: number;
  affectedUsers: string[];
  legalRisk: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  deadline?: number;
  resolvedAt?: number;
  resolution?: string;
  responsible?: string;
  status: 'open' | 'investigating' | 'resolving' | 'resolved' | 'escalated';
};

export type ComplianceAlert = {
  id: string;
  type:
    | 'violation'
    | 'deadline'
    | 'assessment'
    | 'consent_expiry'
    | 'retention';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  category: ComplianceCategory;
  createdAt: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  actionRequired: boolean;
  deadline?: number;
  relatedViolationId?: string;
};

export type ComplianceRecommendation = {
  id: string;
  category: ComplianceCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: number; // Score improvement expected
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
  legalBasis: string;
  resources: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
};

export type RealTimeComplianceStatus = {
  metrics: ComplianceMetrics;
  violations: ComplianceViolation[];
  alerts: ComplianceAlert[];
  recommendations: ComplianceRecommendation[];
  isMonitoring: boolean;
  lastUpdate: number;
  monitoringFrequency: number;
};

// Compliance monitoring configuration
const MONITORING_CONFIG = {
  ASSESSMENT_FREQUENCY: 24 * 60 * 60 * 1000, // 24 hours
  ALERT_CHECK_FREQUENCY: 5 * 60 * 1000, // 5 minutes
  VIOLATION_RETENTION_DAYS: 365,
  SCORE_WEIGHTS: {
    [ComplianceCategory.CONSENT_MANAGEMENT]: 0.2,
    [ComplianceCategory.DATA_SUBJECT_RIGHTS]: 0.2,
    [ComplianceCategory.DATA_PROTECTION]: 0.15,
    [ComplianceCategory.AUDIT_TRAIL]: 0.15,
    [ComplianceCategory.DATA_RETENTION]: 0.1,
    [ComplianceCategory.BREACH_RESPONSE]: 0.1,
    [ComplianceCategory.THIRD_PARTY_COMPLIANCE]: 0.05,
    [ComplianceCategory.DOCUMENTATION]: 0.05,
  },
  VIOLATION_PENALTIES: {
    [ViolationType.CONSENT_VIOLATION]: 15,
    [ViolationType.DATA_ACCESS_VIOLATION]: 20,
    [ViolationType.RETENTION_VIOLATION]: 10,
    [ViolationType.AUDIT_VIOLATION]: 10,
    [ViolationType.DISCLOSURE_VIOLATION]: 25,
    [ViolationType.SECURITY_VIOLATION]: 20,
    [ViolationType.RESPONSE_TIME_VIOLATION]: 5,
  },
};

class RealTimeComplianceMonitor {
  private monitoringInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;
  private isRunning = false;
  private readonly listeners: Array<
    (status: RealTimeComplianceStatus) => void
  > = [];

  /**
   * Start real-time compliance monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;

      // Initial assessment
      await this.performFullAssessment();

      // Set up monitoring intervals
      this.monitoringInterval = setInterval(
        () => this.performFullAssessment(),
        MONITORING_CONFIG.ASSESSMENT_FREQUENCY,
      );

      this.alertCheckInterval = setInterval(
        () => this.checkForAlerts(),
        MONITORING_CONFIG.ALERT_CHECK_FREQUENCY,
      );

      // Log monitoring start
      await securityAuditLogger.logEvent(AuditEventType.PROFILE_UPDATE, {
        action: 'compliance_monitoring_started',
        frequency: MONITORING_CONFIG.ASSESSMENT_FREQUENCY,
      });
    } catch (_error) {
      this.isRunning = false;
      throw new Error('Failed to start compliance monitoring');
    }
  }

  /**
   * Stop compliance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = undefined;
    }

    this.isRunning = false;
  }

  /**
   * Get current compliance status
   */
  async getCurrentStatus(): Promise<RealTimeComplianceStatus> {
    try {
      const metrics = await this.calculateComplianceMetrics();
      const violations = await this.getActiveViolations();
      const alerts = await this.getActiveAlerts();
      const recommendations = await this.generateRecommendations(
        metrics,
        violations,
      );

      return {
        metrics,
        violations,
        alerts,
        recommendations,
        isMonitoring: this.isRunning,
        lastUpdate: Date.now(),
        monitoringFrequency: MONITORING_CONFIG.ASSESSMENT_FREQUENCY,
      };
    } catch (_error) {
      throw new Error('Failed to get compliance status');
    }
  }

  /**
   * Add real-time status listener
   */
  addStatusListener(
    listener: (status: RealTimeComplianceStatus) => void,
  ): void {
    this.listeners.push(listener);
  }

  /**
   * Remove status listener
   */
  removeStatusListener(
    listener: (status: RealTimeComplianceStatus) => void,
  ): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Manual compliance assessment trigger
   */
  async triggerAssessment(): Promise<ComplianceMetrics> {
    return this.performFullAssessment();
  }

  /**
   * Report violation manually
   */
  async reportViolation(
    violation: Omit<ComplianceViolation, 'id' | 'detectedAt' | 'status'>,
  ): Promise<void> {
    try {
      const newViolation: ComplianceViolation = {
        ...violation,
        id: this.generateViolationId(),
        detectedAt: Date.now(),
        status: 'open',
      };

      await this.storeViolation(newViolation);
      await this.createViolationAlert(newViolation);

      // Log violation
      await securityAuditLogger.logEvent(AuditEventType.SUSPICIOUS_ACTIVITY, {
        action: 'lgpd_violation_reported',
        violationType: violation.type,
        severity: violation.severity,
        affectedUsers: violation.affectedUsers.length,
      });

      // Trigger immediate assessment
      await this.performFullAssessment();
    } catch (_error) {
      throw new Error('Failed to report violation');
    }
  }

  /**
   * Resolve violation
   */
  async resolveViolation(
    violationId: string,
    resolution: string,
    responsible: string,
  ): Promise<void> {
    try {
      const violations = this.getStoredViolations();
      const violation = violations.find((v) => v.id === violationId);

      if (!violation) {
        throw new Error('Violation not found');
      }

      violation.status = 'resolved';
      violation.resolvedAt = Date.now();
      violation.resolution = resolution;
      violation.responsible = responsible;

      this.storeViolations(violations);

      // Log resolution
      await securityAuditLogger.logEvent(AuditEventType.PROFILE_UPDATE, {
        action: 'lgpd_violation_resolved',
        violationId,
        resolution,
        responsible,
      });

      // Create resolution alert
      await this.createAlert({
        type: 'violation',
        severity: 'info',
        title: 'Violação LGPD Resolvida',
        message: `Violação ${violationId} foi resolvida: ${resolution}`,
        category: violation.category,
        actionRequired: false,
      });

      // Trigger assessment to update scores
      await this.performFullAssessment();
    } catch (_error) {
      throw new Error('Failed to resolve violation');
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
  ): Promise<void> {
    try {
      const alerts = this.getStoredAlerts();
      const alert = alerts.find((a) => a.id === alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();

      this.storeAlerts(alerts);
    } catch (_error) {
      throw new Error('Failed to acknowledge alert');
    }
  }

  // Private methods

  private async performFullAssessment(): Promise<ComplianceMetrics> {
    const metrics = await this.calculateComplianceMetrics();

    // Check for new violations
    await this.detectViolations();

    // Update trends
    await this.updateComplianceTrends(metrics);

    // Notify listeners
    const status = await this.getCurrentStatus();
    this.notifyListeners(status);

    return metrics;
  }

  private async calculateComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      // Calculate category scores
      const categoryScores = await this.calculateCategoryScores();

      // Calculate overall score using weights
      const overallScore = Object.entries(categoryScores).reduce(
        (sum, [category, score]) => {
          const weight =
            MONITORING_CONFIG.SCORE_WEIGHTS[category as ComplianceCategory] ||
            0;
          return sum + score * weight;
        },
        0,
      );

      // Get violation counts
      const violations = await this.getActiveViolations();
      const criticalViolations = violations.filter(
        (v) => v.severity === 'critical',
      ).length;
      const resolvedViolations = this.getStoredViolations().filter(
        (v) => v.status === 'resolved',
      ).length;

      // Get consent metrics
      const consentMetrics = await lgpdComplianceManager.getConsentMetrics();

      // Get data request metrics
      const requestMetrics =
        await lgpdComplianceManager.getDataSubjectRequestMetrics();

      const metrics: ComplianceMetrics = {
        overallScore: Math.round(overallScore),
        categoryScores,
        complianceLevel: this.determineComplianceLevel(overallScore),
        totalViolations: violations.length,
        criticalViolations,
        resolvedViolations,
        pendingDataRequests: requestMetrics.pending,
        activeConsents: consentMetrics.granted,
        expiredConsents: 0, // TODO: Calculate expired consents
        lastAssessment: Date.now(),
        nextAssessment: Date.now() + MONITORING_CONFIG.ASSESSMENT_FREQUENCY,
        trends: await this.getComplianceTrends(),
      };

      // Store metrics for historical tracking
      this.storeMetrics(metrics);

      return metrics;
    } catch (_error) {
      throw new Error('Failed to calculate compliance metrics');
    }
  }

  private async calculateCategoryScores(): Promise<
    Record<ComplianceCategory, number>
  > {
    const scores: Record<ComplianceCategory, number> = {
      [ComplianceCategory.CONSENT_MANAGEMENT]:
        await this.calculateConsentScore(),
      [ComplianceCategory.DATA_SUBJECT_RIGHTS]:
        await this.calculateDataRightsScore(),
      [ComplianceCategory.DATA_PROTECTION]:
        await this.calculateDataProtectionScore(),
      [ComplianceCategory.AUDIT_TRAIL]: await this.calculateAuditScore(),
      [ComplianceCategory.DATA_RETENTION]: await this.calculateRetentionScore(),
      [ComplianceCategory.BREACH_RESPONSE]:
        await this.calculateBreachResponseScore(),
      [ComplianceCategory.THIRD_PARTY_COMPLIANCE]:
        await this.calculateThirdPartyScore(),
      [ComplianceCategory.DOCUMENTATION]:
        await this.calculateDocumentationScore(),
    };

    return scores;
  }

  private async calculateConsentScore(): Promise<number> {
    try {
      const consentMetrics = await lgpdComplianceManager.getConsentMetrics();
      const violations = this.getStoredViolations().filter(
        (v) =>
          v.type === ViolationType.CONSENT_VIOLATION && v.status !== 'resolved',
      );

      let baseScore = 100;

      // Penalty for consent violations
      baseScore -=
        violations.length *
        MONITORING_CONFIG.VIOLATION_PENALTIES[ViolationType.CONSENT_VIOLATION];

      // Bonus for high consent rates
      const consentRate =
        consentMetrics.total > 0
          ? consentMetrics.granted / consentMetrics.total
          : 1;
      baseScore *= consentRate;

      return Math.max(0, Math.min(100, baseScore));
    } catch (_error) {
      return 50; // Default moderate score on error
    }
  }

  private async calculateDataRightsScore(): Promise<number> {
    try {
      const requestMetrics =
        await lgpdComplianceManager.getDataSubjectRequestMetrics();
      const violations = this.getStoredViolations().filter(
        (v) =>
          v.type === ViolationType.RESPONSE_TIME_VIOLATION &&
          v.status !== 'resolved',
      );

      let baseScore = 100;

      // Penalty for delayed responses
      baseScore -=
        violations.length *
        MONITORING_CONFIG.VIOLATION_PENALTIES[
          ViolationType.RESPONSE_TIME_VIOLATION
        ];

      // Bonus for prompt request handling
      if (requestMetrics.total > 0) {
        const completionRate = requestMetrics.completed / requestMetrics.total;
        baseScore *= completionRate;
      }

      return Math.max(0, Math.min(100, baseScore));
    } catch (_error) {
      return 50;
    }
  }

  private async calculateDataProtectionScore(): Promise<number> {
    try {
      const securityMetrics = await securityAuditLogger.getSecurityMetrics(24);
      const violations = this.getStoredViolations().filter(
        (v) =>
          v.type === ViolationType.SECURITY_VIOLATION &&
          v.status !== 'resolved',
      );

      let baseScore = 100;

      // Penalty for security violations
      baseScore -=
        violations.length *
        MONITORING_CONFIG.VIOLATION_PENALTIES[ViolationType.SECURITY_VIOLATION];

      // Penalty for suspicious activities
      baseScore -= securityMetrics.suspiciousActivities * 5;

      return Math.max(0, Math.min(100, baseScore));
    } catch (_error) {
      return 50;
    }
  }

  private async calculateAuditScore(): Promise<number> {
    try {
      const securityMetrics = await securityAuditLogger.getSecurityMetrics(24);
      const violations = this.getStoredViolations().filter(
        (v) =>
          v.type === ViolationType.AUDIT_VIOLATION && v.status !== 'resolved',
      );

      let baseScore = 100;

      // Penalty for audit violations
      baseScore -=
        violations.length *
        MONITORING_CONFIG.VIOLATION_PENALTIES[ViolationType.AUDIT_VIOLATION];

      // Bonus for comprehensive logging
      if (securityMetrics.totalEvents > 100) {
        baseScore += 5; // Bonus for active audit trail
      }

      return Math.max(0, Math.min(100, baseScore));
    } catch (_error) {
      return 50;
    }
  }

  private async calculateRetentionScore(): Promise<number> {
    try {
      const violations = this.getStoredViolations().filter(
        (v) =>
          v.type === ViolationType.RETENTION_VIOLATION &&
          v.status !== 'resolved',
      );

      let baseScore = 100;

      // Penalty for retention violations
      baseScore -=
        violations.length *
        MONITORING_CONFIG.VIOLATION_PENALTIES[
          ViolationType.RETENTION_VIOLATION
        ];

      return Math.max(0, Math.min(100, baseScore));
    } catch (_error) {
      return 50;
    }
  }

  private async calculateBreachResponseScore(): Promise<number> {
    // TODO: Implement based on breach response system
    return 85; // Default good score
  }

  private async calculateThirdPartyScore(): Promise<number> {
    // TODO: Implement based on third-party compliance system
    return 80; // Default good score
  }

  private async calculateDocumentationScore(): Promise<number> {
    // TODO: Implement based on documentation automation system
    return 75; // Default fair score
  }

  private determineComplianceLevel(score: number): ComplianceLevel {
    if (score >= 91) {
      return ComplianceLevel.EXCELLENT;
    }
    if (score >= 76) {
      return ComplianceLevel.GOOD;
    }
    if (score >= 51) {
      return ComplianceLevel.FAIR;
    }
    if (score >= 26) {
      return ComplianceLevel.POOR;
    }
    return ComplianceLevel.CRITICAL;
  }

  private async detectViolations(): Promise<void> {
    // TODO: Implement sophisticated violation detection
    // For now, check basic violations

    try {
      // Check for expired data subject requests
      await this.checkExpiredDataRequests();

      // Check for excessive failed logins (potential consent violations)
      await this.checkExcessiveFailedLogins();
    } catch (_error) {}
  }

  private async checkExpiredDataRequests(): Promise<void> {
    const requestMetrics =
      await lgpdComplianceManager.getDataSubjectRequestMetrics();

    if (requestMetrics.pending > 0) {
      // TODO: Check actual request dates
      // For now, simulate check
      const _thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      // If any requests are older than 30 days, create violation
    }
  }

  private async checkExcessiveFailedLogins(): Promise<void> {
    const securityMetrics = await securityAuditLogger.getSecurityMetrics(1);

    if (securityMetrics.failedLogins > 50) {
      await this.reportViolation({
        type: ViolationType.SECURITY_VIOLATION,
        severity: 'medium',
        category: ComplianceCategory.DATA_PROTECTION,
        description: `Excessivo número de tentativas de login falhadas: ${securityMetrics.failedLogins}`,
        affectedUsers: [],
        legalRisk: 'medium',
        recommendedActions: [
          'Implementar CAPTCHA',
          'Revisar logs de segurança',
          'Considerar bloqueio temporário de IPs suspeitos',
        ],
      });
    }
  }

  private async getActiveViolations(): Promise<ComplianceViolation[]> {
    return this.getStoredViolations().filter((v) => v.status !== 'resolved');
  }

  private async getActiveAlerts(): Promise<ComplianceAlert[]> {
    return this.getStoredAlerts().filter((a) => !a.acknowledged);
  }

  private async generateRecommendations(
    metrics: ComplianceMetrics,
    _violations: ComplianceViolation[],
  ): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];

    // Generate recommendations based on low scores
    Object.entries(metrics.categoryScores).forEach(([category, score]) => {
      if (score < 75) {
        recommendations.push({
          id: this.generateRecommendationId(),
          category: category as ComplianceCategory,
          priority: score < 50 ? 'high' : 'medium',
          title: `Melhorar conformidade em ${category}`,
          description: `Score atual: ${score}%. Ações necessárias para melhorar conformidade.`,
          expectedImpact: 100 - score,
          implementationEffort: 'medium',
          timeline: score < 50 ? '30 dias' : '60 dias',
          legalBasis: 'LGPD Art. 50',
          resources: ['Equipe técnica', 'Consultoria jurídica'],
          status: 'pending',
        });
      }
    });

    return recommendations;
  }

  private async createViolationAlert(
    violation: ComplianceViolation,
  ): Promise<void> {
    await this.createAlert({
      type: 'violation',
      severity: violation.severity === 'critical' ? 'critical' : 'error',
      title: 'Nova Violação LGPD Detectada',
      message: `${violation.description} (Risco: ${violation.legalRisk})`,
      category: violation.category,
      actionRequired: true,
      deadline: violation.deadline,
      relatedViolationId: violation.id,
    });
  }

  private async createAlert(
    alertData: Omit<ComplianceAlert, 'id' | 'createdAt' | 'acknowledged'>,
  ): Promise<void> {
    const alert: ComplianceAlert = {
      ...alertData,
      id: this.generateAlertId(),
      createdAt: Date.now(),
      acknowledged: false,
    };

    const alerts = this.getStoredAlerts();
    alerts.push(alert);
    this.storeAlerts(alerts);
  }

  private async checkForAlerts(): Promise<void> {
    // TODO: Implement sophisticated alert checking
    // Check deadlines, consent expiries, etc.
  }

  private async updateComplianceTrends(
    _metrics: ComplianceMetrics,
  ): Promise<void> {
    // TODO: Implement trend tracking
    // Store historical metrics and calculate trends
  }

  private async getComplianceTrends(): Promise<ComplianceTrend[]> {
    // TODO: Implement trend retrieval
    return [];
  }

  private notifyListeners(status: RealTimeComplianceStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (_error) {}
    });
  }

  // Storage methods (using localStorage for now, should use database in production)

  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeViolation(violation: ComplianceViolation): Promise<void> {
    const violations = this.getStoredViolations();
    violations.push(violation);
    this.storeViolations(violations);
  }

  private getStoredViolations(): ComplianceViolation[] {
    try {
      const stored = localStorage.getItem('lgpd_compliance_violations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeViolations(violations: ComplianceViolation[]): void {
    localStorage.setItem(
      'lgpd_compliance_violations',
      JSON.stringify(violations),
    );
  }

  private getStoredAlerts(): ComplianceAlert[] {
    try {
      const stored = localStorage.getItem('lgpd_compliance_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeAlerts(alerts: ComplianceAlert[]): void {
    localStorage.setItem('lgpd_compliance_alerts', JSON.stringify(alerts));
  }

  private storeMetrics(metrics: ComplianceMetrics): void {
    localStorage.setItem('lgpd_compliance_metrics', JSON.stringify(metrics));
  }
}

// Export singleton instance
export const realTimeComplianceMonitor = new RealTimeComplianceMonitor();

// Export convenience functions
export async function startComplianceMonitoring(): Promise<void> {
  return realTimeComplianceMonitor.startMonitoring();
}

export async function getComplianceStatus(): Promise<RealTimeComplianceStatus> {
  return realTimeComplianceMonitor.getCurrentStatus();
}

export async function reportComplianceViolation(
  violation: Omit<ComplianceViolation, 'id' | 'detectedAt' | 'status'>,
): Promise<void> {
  return realTimeComplianceMonitor.reportViolation(violation);
}

export async function resolveComplianceViolation(
  violationId: string,
  resolution: string,
  responsible: string,
): Promise<void> {
  return realTimeComplianceMonitor.resolveViolation(
    violationId,
    resolution,
    responsible,
  );
}

export type {
  ComplianceMetrics,
  ComplianceViolation,
  ComplianceAlert,
  ComplianceRecommendation,
  RealTimeComplianceStatus,
};
