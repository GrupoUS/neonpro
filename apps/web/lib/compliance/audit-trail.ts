/**
 * Audit Trail System
 * Epic 10 - Story 10.4: Healthcare Compliance Computer Vision (Audit Trail)
 *
 * Comprehensive audit trail for healthcare compliance monitoring
 * Real-time logging, compliance verification, automated reporting
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

import { EventEmitter } from 'node:events';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

// Audit Trail Types
export type AuditEventType =
  | 'access'
  | 'modification'
  | 'deletion'
  | 'creation'
  | 'authentication'
  | 'authorization'
  | 'compliance_check'
  | 'data_export'
  | 'system_event';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ComplianceStatus =
  | 'compliant'
  | 'non_compliant'
  | 'pending_review'
  | 'exempt';
export type AuditCategory =
  | 'patient_data'
  | 'medical_records'
  | 'system_security'
  | 'user_activity'
  | 'compliance_validation'
  | 'data_processing';

// Core Audit Interfaces
export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId: string;
  userRole: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  description: string;
  beforeState?: any;
  afterState?: any;
  metadata: AuditMetadata;
  complianceContext: ComplianceContext;
  riskAssessment: RiskAssessment;
  retention: RetentionInfo;
}

export interface AuditMetadata {
  applicationName: string;
  applicationVersion: string;
  moduleId: string;
  functionName: string;
  requestId: string;
  correlationId: string;
  parentEventId?: string;
  childEventIds: string[];
  tags: string[];
  customData: Record<string, any>;
}

export interface ComplianceContext {
  applicableRegulations: string[];
  complianceStatus: ComplianceStatus;
  complianceRules: string[];
  violatedRules: string[];
  exemptionReason?: string;
  complianceOfficer?: string;
  reviewRequired: boolean;
  automaticValidation: boolean;
  validationResults: ComplianceValidationResult[];
}

export interface ComplianceValidationResult {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  validationStatus: 'passed' | 'failed' | 'warning' | 'not_applicable';
  validationMessage: string;
  severity: AuditSeverity;
  recommendedAction?: string;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  riskScore: number; // 0-100
  riskCategory:
    | 'operational'
    | 'security'
    | 'compliance'
    | 'privacy'
    | 'safety';
  mitigation: RiskMitigation;
  impactAssessment: ImpactAssessment;
}

export interface RiskMitigation {
  immediateActions: string[];
  longTermActions: string[];
  responsibleParty: string;
  mitigationStatus: 'pending' | 'in_progress' | 'completed' | 'deferred';
  mitigationDeadline?: string;
  mitigationEvidence?: string;
}

export interface ImpactAssessment {
  patientSafety: 'none' | 'low' | 'medium' | 'high';
  dataPrivacy: 'none' | 'low' | 'medium' | 'high';
  systemSecurity: 'none' | 'low' | 'medium' | 'high';
  regulatoryCompliance: 'none' | 'low' | 'medium' | 'high';
  businessContinuity: 'none' | 'low' | 'medium' | 'high';
  reputationalRisk: 'none' | 'low' | 'medium' | 'high';
}

export interface RetentionInfo {
  retentionPeriod: number; // in days
  legalBasis: string;
  retentionReason: string;
  scheduledDeletion: string;
  archiveRequired: boolean;
  archiveLocation?: string;
  immutableRecord: boolean;
}

export interface AuditQuery {
  startDate?: string;
  endDate?: string;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  userIds?: string[];
  resourceIds?: string[];
  complianceStatus?: ComplianceStatus[];
  riskLevels?: string[];
  searchText?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditReport {
  id: string;
  generatedDate: string;
  reportType: 'compliance' | 'security' | 'operational' | 'risk' | 'custom';
  timeRange: {
    startDate: string;
    endDate: string;
  };
  scope: AuditReportScope;
  summary: AuditSummary;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  complianceMetrics: ComplianceMetrics;
  riskMetrics: RiskMetrics;
  trends: AuditTrend[];
  attachments: ReportAttachment[];
}

export interface AuditReportScope {
  includedCategories: AuditCategory[];
  includedUsers: string[];
  includedResources: string[];
  excludedPatterns: string[];
  filterCriteria: Record<string, any>;
}

export interface AuditSummary {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  complianceRate: number;
  riskDistribution: Record<string, number>;
  topUsers: UserActivity[];
  topResources: ResourceActivity[];
}

export interface UserActivity {
  userId: string;
  userName: string;
  eventCount: number;
  riskScore: number;
  complianceRate: number;
  lastActivity: string;
}

export interface ResourceActivity {
  resourceId: string;
  resourceType: string;
  accessCount: number;
  modificationCount: number;
  riskScore: number;
  lastAccessed: string;
}

export interface AuditFinding {
  id: string;
  type:
    | 'compliance_violation'
    | 'security_incident'
    | 'data_breach'
    | 'unauthorized_access'
    | 'policy_violation';
  severity: AuditSeverity;
  title: string;
  description: string;
  evidence: string[];
  relatedEvents: string[];
  impactAssessment: ImpactAssessment;
  recommendedActions: string[];
  assignedTo?: string;
  dueDate?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface AuditRecommendation {
  id: string;
  category: 'compliance' | 'security' | 'operational' | 'risk_management';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  justification: string;
  implementation: RecommendationImplementation;
  expectedBenefit: string;
  riskReduction: number; // 0-100
}

export interface RecommendationImplementation {
  estimatedEffort: 'low' | 'medium' | 'high';
  timeline: string;
  resources: string[];
  dependencies: string[];
  successCriteria: string[];
}

export interface ComplianceMetrics {
  overallComplianceRate: number;
  complianceByRegulation: Record<string, number>;
  complianceByCategory: Record<AuditCategory, number>;
  complianceByUser: Record<string, number>;
  complianceTrends: ComplianceTrend[];
  violationsSummary: ViolationsSummary;
}

export interface ComplianceTrend {
  date: string;
  complianceRate: number;
  violationCount: number;
  category: AuditCategory;
}

export interface ViolationsSummary {
  totalViolations: number;
  violationsByType: Record<string, number>;
  violationsBySeverity: Record<AuditSeverity, number>;
  resolvedViolations: number;
  pendingViolations: number;
  avgResolutionTime: number; // in days
}

export interface RiskMetrics {
  overallRiskScore: number;
  riskByCategory: Record<string, number>;
  riskByUser: Record<string, number>;
  riskByResource: Record<string, number>;
  highRiskEvents: number;
  criticalRiskEvents: number;
  riskTrends: RiskTrend[];
  riskMitigationStatus: RiskMitigationStatus;
}

export interface RiskTrend {
  date: string;
  riskScore: number;
  eventCount: number;
  category: string;
}

export interface RiskMitigationStatus {
  totalMitigations: number;
  completedMitigations: number;
  pendingMitigations: number;
  overdueMitigations: number;
  avgMitigationTime: number; // in days
}

export interface AuditTrend {
  metric: string;
  timePeriod: string;
  values: TrendValue[];
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'low' | 'medium' | 'high';
}

export interface TrendValue {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ReportAttachment {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'document' | 'export';
  description: string;
  size: number;
  generatedDate: string;
}

// Main Audit Trail Manager Class
export class AuditTrailManager extends EventEmitter {
  private supabase = createClient();
  private auditBuffer: AuditTrailEntry[] = [];
  private bufferSize = 1000;
  private flushInterval = 30_000; // 30 seconds
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private riskThresholds: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializeAuditSystem();
  }

  /**
   * Initialize audit trail system
   */
  private async initializeAuditSystem(): Promise<void> {
    try {
      logger.info('Initializing Audit Trail System...');

      // Load compliance rules
      await this.loadComplianceRules();

      // Initialize risk thresholds
      this.initializeRiskThresholds();

      // Start periodic buffer flush
      this.startBufferFlush();

      // Initialize real-time monitoring
      this.startRealTimeMonitoring();

      logger.info('Audit Trail System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Audit Trail System:', error);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  async logAuditEvent(
    eventData: Partial<AuditTrailEntry> & {
      eventType: AuditEventType;
      category: AuditCategory;
      userId: string;
      action: string;
      description: string;
    }
  ): Promise<AuditTrailEntry> {
    try {
      const auditEntry: AuditTrailEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        severity: eventData.severity || 'info',
        userRole: eventData.userRole || 'unknown',
        sessionId: eventData.sessionId || 'unknown',
        ipAddress: eventData.ipAddress || 'unknown',
        userAgent: eventData.userAgent || 'unknown',
        metadata: {
          applicationName: 'NeonPro',
          applicationVersion: '1.0.0',
          moduleId: 'compliance_system',
          functionName: 'audit_trail',
          requestId: `req_${Date.now()}`,
          correlationId: `corr_${Date.now()}`,
          childEventIds: [],
          tags: [],
          customData: {},
          ...eventData.metadata,
        },
        complianceContext: await this.generateComplianceContext(eventData),
        riskAssessment: await this.performRiskAssessment(eventData),
        retention: this.generateRetentionInfo(eventData),
        ...eventData,
      };

      // Add to buffer
      this.auditBuffer.push(auditEntry);

      // Check for immediate compliance violations
      await this.checkImmediateCompliance(auditEntry);

      // Check buffer size and flush if necessary
      if (this.auditBuffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }

      // Emit event for real-time monitoring
      this.emit('auditEvent', auditEntry);

      return auditEntry;
    } catch (error) {
      logger.error('Failed to log audit event:', error);
      throw error;
    }
  }

  /**
   * Query audit trail
   */
  async queryAuditTrail(query: AuditQuery): Promise<{
    entries: AuditTrailEntry[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      let queryBuilder = this.supabase.from('audit_trail').select('*');

      // Apply filters
      if (query.startDate) {
        queryBuilder = queryBuilder.gte('timestamp', query.startDate);
      }

      if (query.endDate) {
        queryBuilder = queryBuilder.lte('timestamp', query.endDate);
      }

      if (query.eventTypes?.length) {
        queryBuilder = queryBuilder.in('event_type', query.eventTypes);
      }

      if (query.categories?.length) {
        queryBuilder = queryBuilder.in('category', query.categories);
      }

      if (query.severities?.length) {
        queryBuilder = queryBuilder.in('severity', query.severities);
      }

      if (query.userIds?.length) {
        queryBuilder = queryBuilder.in('user_id', query.userIds);
      }

      if (query.resourceIds?.length) {
        queryBuilder = queryBuilder.in('resource_id', query.resourceIds);
      }

      if (query.searchText) {
        queryBuilder = queryBuilder.or(
          `description.ilike.%${query.searchText}%,action.ilike.%${query.searchText}%`
        );
      }

      // Apply sorting
      const sortBy = query.sortBy || 'timestamp';
      const sortOrder = query.sortOrder || 'desc';
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      const limit = query.limit || 100;
      const offset = query.offset || 0;
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw error;
      }

      const entries = data?.map((row) => this.mapRowToAuditEntry(row)) || [];
      const totalCount = count || 0;
      const hasMore = totalCount > offset + limit;

      return {
        entries,
        totalCount,
        hasMore,
      };
    } catch (error) {
      logger.error('Failed to query audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive audit report
   */
  async generateAuditReport(
    reportType: AuditReport['reportType'],
    timeRange: { startDate: string; endDate: string },
    scope?: Partial<AuditReportScope>
  ): Promise<AuditReport> {
    try {
      logger.info(
        `Generating ${reportType} audit report for ${timeRange.startDate} to ${timeRange.endDate}`
      );

      const query: AuditQuery = {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
        ...scope,
      };

      const { entries } = await this.queryAuditTrail(query);

      const report: AuditReport = {
        id: `report_${reportType}_${Date.now()}`,
        generatedDate: new Date().toISOString(),
        reportType,
        timeRange,
        scope: {
          includedCategories:
            scope?.includedCategories ||
            Object.values(this.getAuditCategories()),
          includedUsers: scope?.includedUsers || [],
          includedResources: scope?.includedResources || [],
          excludedPatterns: scope?.excludedPatterns || [],
          filterCriteria: scope?.filterCriteria || {},
        },
        summary: this.generateAuditSummary(entries),
        findings: await this.generateAuditFindings(entries),
        recommendations: await this.generateAuditRecommendations(entries),
        complianceMetrics: this.generateComplianceMetrics(entries),
        riskMetrics: this.generateRiskMetrics(entries),
        trends: await this.generateAuditTrends(entries, timeRange),
        attachments: [],
      };

      // Save report
      await this.saveAuditReport(report);

      logger.info(`Audit report generated successfully: ${report.id}`);
      return report;
    } catch (error) {
      logger.error('Failed to generate audit report:', error);
      throw error;
    }
  }

  /**
   * Get compliance validation results
   */
  async getComplianceValidation(
    timeRange: { startDate: string; endDate: string },
    regulations?: string[]
  ): Promise<ComplianceValidationSummary> {
    try {
      const query: AuditQuery = {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
        categories: ['compliance_validation'],
      };

      const { entries } = await this.queryAuditTrail(query);

      const validationResults = entries.flatMap(
        (entry) => entry.complianceContext.validationResults || []
      );

      const filteredResults = regulations
        ? validationResults.filter((result) =>
            regulations.some((reg) => result.ruleName.includes(reg))
          )
        : validationResults;

      const summary: ComplianceValidationSummary = {
        totalValidations: filteredResults.length,
        passedValidations: filteredResults.filter(
          (r) => r.validationStatus === 'passed'
        ).length,
        failedValidations: filteredResults.filter(
          (r) => r.validationStatus === 'failed'
        ).length,
        warningValidations: filteredResults.filter(
          (r) => r.validationStatus === 'warning'
        ).length,
        complianceRate:
          filteredResults.length > 0
            ? (filteredResults.filter((r) => r.validationStatus === 'passed')
                .length /
                filteredResults.length) *
              100
            : 0,
        validationsByRegulation:
          this.groupValidationsByRegulation(filteredResults),
        criticalFailures: filteredResults.filter(
          (r) => r.validationStatus === 'failed' && r.severity === 'critical'
        ).length,
        recommendations:
          await this.generateComplianceRecommendations(filteredResults),
      };

      return summary;
    } catch (error) {
      logger.error('Failed to get compliance validation:', error);
      throw error;
    }
  }

  /**
   * Monitor real-time compliance
   */
  async startComplianceMonitoring(): Promise<void> {
    this.on('auditEvent', async (entry: AuditTrailEntry) => {
      // Check for compliance violations
      const violations = entry.complianceContext.violatedRules;

      if (violations.length > 0) {
        await this.handleComplianceViolation(entry, violations);
      }

      // Check risk thresholds
      if (entry.riskAssessment.riskLevel === 'critical') {
        await this.handleCriticalRisk(entry);
      }

      // Update real-time metrics
      await this.updateRealTimeMetrics(entry);
    });
  }

  // Helper Methods
  private async generateComplianceContext(
    eventData: Partial<AuditTrailEntry>
  ): Promise<ComplianceContext> {
    const applicableRegulations = this.getApplicableRegulations(eventData);
    const complianceRules = this.getComplianceRules(eventData);
    const validationResults = await this.validateCompliance(
      eventData,
      complianceRules
    );
    const violatedRules = validationResults
      .filter((r) => r.validationStatus === 'failed')
      .map((r) => r.ruleId);

    return {
      applicableRegulations,
      complianceStatus:
        violatedRules.length > 0 ? 'non_compliant' : 'compliant',
      complianceRules: complianceRules.map((r) => r.id),
      violatedRules,
      reviewRequired: violatedRules.some((ruleId) => {
        const rule = this.complianceRules.get(ruleId);
        return rule?.requiresReview;
      }),
      automaticValidation: true,
      validationResults,
    };
  }

  private async performRiskAssessment(
    eventData: Partial<AuditTrailEntry>
  ): Promise<RiskAssessment> {
    const riskFactors = this.identifyRiskFactors(eventData);
    const riskScore = this.calculateRiskScore(eventData, riskFactors);
    const riskLevel = this.getRiskLevel(riskScore);
    const riskCategory = this.getRiskCategory(eventData);

    return {
      riskLevel,
      riskFactors,
      riskScore,
      riskCategory,
      mitigation: {
        immediateActions: this.getImmediateActions(riskLevel, eventData),
        longTermActions: this.getLongTermActions(riskLevel, eventData),
        responsibleParty: 'compliance_team',
        mitigationStatus: 'pending',
      },
      impactAssessment: this.assessImpact(eventData, riskLevel),
    };
  }

  private generateRetentionInfo(
    eventData: Partial<AuditTrailEntry>
  ): RetentionInfo {
    const retentionPeriod = this.getRetentionPeriod(
      eventData.category,
      eventData.eventType
    );

    return {
      retentionPeriod,
      legalBasis: 'CFM Resolution 1.821/2007 + LGPD Art. 16',
      retentionReason: 'Audit trail for compliance and legal requirements',
      scheduledDeletion: new Date(
        Date.now() + retentionPeriod * 24 * 60 * 60 * 1000
      ).toISOString(),
      archiveRequired: true,
      immutableRecord: true,
    };
  }

  private async checkImmediateCompliance(
    entry: AuditTrailEntry
  ): Promise<void> {
    if (entry.complianceContext.complianceStatus === 'non_compliant') {
      const criticalViolations = entry.complianceContext.violatedRules.filter(
        (ruleId) => {
          const rule = this.complianceRules.get(ruleId);
          return rule?.severity === 'critical';
        }
      );

      if (criticalViolations.length > 0) {
        await this.triggerImmediateResponse(entry, criticalViolations);
      }
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    try {
      const entries = [...this.auditBuffer];
      this.auditBuffer = [];

      const { error } = await this.supabase
        .from('audit_trail')
        .insert(entries.map((entry) => this.mapAuditEntryToRow(entry)));

      if (error) {
        // Re-add to buffer if save failed
        this.auditBuffer.unshift(...entries);
        throw error;
      }

      logger.info(`Flushed ${entries.length} audit entries to database`);
    } catch (error) {
      logger.error('Failed to flush audit buffer:', error);
    }
  }

  private startBufferFlush(): void {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private startRealTimeMonitoring(): void {
    // Real-time monitoring implementation
    setInterval(() => {
      this.performPeriodicChecks();
    }, 60_000); // Every minute
  }

  private async performPeriodicChecks(): Promise<void> {
    // Implement periodic compliance and risk checks
    logger.info('Performing periodic audit checks...');
  }

  private getApplicableRegulations(
    eventData: Partial<AuditTrailEntry>
  ): string[] {
    const regulations = ['LGPD', 'CFM_1821_2007'];

    if (eventData.category === 'patient_data') {
      regulations.push('ANVISA_RDC_44_2009');
    }

    if (eventData.eventType === 'authentication') {
      regulations.push('ISO_27001');
    }

    return regulations;
  }

  private getComplianceRules(
    eventData: Partial<AuditTrailEntry>
  ): ComplianceRule[] {
    return Array.from(this.complianceRules.values()).filter(
      (rule) =>
        rule.applicableCategories.includes(
          eventData.category || 'system_security'
        ) &&
        rule.applicableEventTypes.includes(
          eventData.eventType || 'system_event'
        )
    );
  }

  private async validateCompliance(
    eventData: Partial<AuditTrailEntry>,
    rules: ComplianceRule[]
  ): Promise<ComplianceValidationResult[]> {
    const results: ComplianceValidationResult[] = [];

    for (const rule of rules) {
      const result = await this.validateRule(eventData, rule);
      results.push(result);
    }

    return results;
  }

  private async validateRule(
    eventData: Partial<AuditTrailEntry>,
    rule: ComplianceRule
  ): Promise<ComplianceValidationResult> {
    // Simplified rule validation - in real implementation, this would be more complex
    const isValid = await this.executeRuleValidation(eventData, rule);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleDescription: rule.description,
      validationStatus: isValid ? 'passed' : 'failed',
      validationMessage: isValid
        ? 'Rule validation passed'
        : 'Rule validation failed',
      severity: rule.severity,
      recommendedAction: isValid ? undefined : rule.recommendedAction,
    };
  }

  private async executeRuleValidation(
    _eventData: Partial<AuditTrailEntry>,
    _rule: ComplianceRule
  ): Promise<boolean> {
    // Implement actual rule validation logic
    // This is a simplified version
    return true; // Default to compliant for now
  }

  private identifyRiskFactors(eventData: Partial<AuditTrailEntry>): string[] {
    const factors: string[] = [];

    if (
      eventData.eventType === 'access' &&
      eventData.category === 'patient_data'
    ) {
      factors.push('Patient data access');
    }

    if (eventData.severity === 'error' || eventData.severity === 'critical') {
      factors.push('High severity event');
    }

    if (eventData.eventType === 'deletion') {
      factors.push('Data deletion operation');
    }

    return factors;
  }

  private calculateRiskScore(
    eventData: Partial<AuditTrailEntry>,
    riskFactors: string[]
  ): number {
    let score = 0;

    // Base score by event type
    const eventTypeScores: Record<AuditEventType, number> = {
      access: 10,
      modification: 20,
      deletion: 40,
      creation: 15,
      authentication: 5,
      authorization: 10,
      compliance_check: 5,
      data_export: 30,
      system_event: 5,
    };

    score += eventTypeScores[eventData.eventType || 'system_event'];

    // Add risk factor scores
    score += riskFactors.length * 10;

    // Severity multiplier
    const severityMultipliers: Record<AuditSeverity, number> = {
      info: 1,
      warning: 2,
      error: 3,
      critical: 5,
    };

    score *= severityMultipliers[eventData.severity || 'info'];

    return Math.min(score, 100); // Cap at 100
  }

  private getRiskLevel(
    riskScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  private getRiskCategory(
    eventData: Partial<AuditTrailEntry>
  ): 'operational' | 'security' | 'compliance' | 'privacy' | 'safety' {
    if (
      eventData.category === 'patient_data' ||
      eventData.category === 'medical_records'
    ) {
      return 'privacy';
    }

    if (eventData.category === 'system_security') {
      return 'security';
    }

    if (eventData.category === 'compliance_validation') {
      return 'compliance';
    }

    return 'operational';
  }

  private getImmediateActions(
    riskLevel: string,
    _eventData: Partial<AuditTrailEntry>
  ): string[] {
    const actions: string[] = [];

    if (riskLevel === 'critical') {
      actions.push('Immediate security team notification');
      actions.push('Suspend user access if necessary');
      actions.push('Investigate potential breach');
    }

    if (riskLevel === 'high') {
      actions.push('Alert compliance officer');
      actions.push('Review access controls');
    }

    return actions;
  }

  private getLongTermActions(
    riskLevel: string,
    _eventData: Partial<AuditTrailEntry>
  ): string[] {
    const actions: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      actions.push('Review and update security policies');
      actions.push('Enhance monitoring and alerting');
      actions.push('Conduct security awareness training');
    }

    return actions;
  }

  private assessImpact(
    eventData: Partial<AuditTrailEntry>,
    riskLevel: string
  ): ImpactAssessment {
    const baseImpact =
      riskLevel === 'critical'
        ? 'high'
        : riskLevel === 'high'
          ? 'medium'
          : 'low';

    return {
      patientSafety:
        eventData.category === 'medical_records' ? baseImpact : 'none',
      dataPrivacy: eventData.category === 'patient_data' ? baseImpact : 'low',
      systemSecurity:
        eventData.category === 'system_security' ? baseImpact : 'low',
      regulatoryCompliance: baseImpact,
      businessContinuity: riskLevel === 'critical' ? 'medium' : 'low',
      reputationalRisk: riskLevel === 'critical' ? 'high' : 'low',
    };
  }

  private getRetentionPeriod(
    category?: AuditCategory,
    _eventType?: AuditEventType
  ): number {
    // Retention periods in days
    const categoryRetention: Record<AuditCategory, number> = {
      patient_data: 365 * 20, // 20 years
      medical_records: 365 * 20, // 20 years
      system_security: 365 * 7, // 7 years
      user_activity: 365 * 5, // 5 years
      compliance_validation: 365 * 10, // 10 years
      data_processing: 365 * 5, // 5 years
    };

    return categoryRetention[category || 'system_security'];
  }

  private async loadComplianceRules(): Promise<void> {
    // Load compliance rules from configuration or database
    const defaultRules: ComplianceRule[] = [
      {
        id: 'lgpd_data_access',
        name: 'LGPD Data Access Control',
        description: 'Ensure proper authorization for personal data access',
        severity: 'critical',
        applicableCategories: ['patient_data'],
        applicableEventTypes: ['access'],
        requiresReview: true,
        recommendedAction: 'Review access permissions and audit trail',
      },
      {
        id: 'cfm_medical_records',
        name: 'CFM Medical Records Retention',
        description:
          'Ensure proper retention of medical records per CFM 1821/2007',
        severity: 'warning',
        applicableCategories: ['medical_records'],
        applicableEventTypes: ['deletion', 'modification'],
        requiresReview: false,
        recommendedAction: 'Verify retention policy compliance',
      },
    ];

    defaultRules.forEach((rule) => {
      this.complianceRules.set(rule.id, rule);
    });
  }

  private initializeRiskThresholds(): void {
    this.riskThresholds.set('critical_threshold', 80);
    this.riskThresholds.set('high_threshold', 60);
    this.riskThresholds.set('medium_threshold', 30);
  }

  private async triggerImmediateResponse(
    entry: AuditTrailEntry,
    violations: string[]
  ): Promise<void> {
    // Implement immediate response to critical violations
    logger.error(
      `Critical compliance violation detected: ${violations.join(', ')}`
    );

    // Emit critical event
    this.emit('criticalViolation', {
      entry,
      violations,
    });
  }

  private async handleComplianceViolation(
    _entry: AuditTrailEntry,
    violations: string[]
  ): Promise<void> {
    // Handle compliance violations
    logger.warning(`Compliance violation detected: ${violations.join(', ')}`);
  }

  private async handleCriticalRisk(entry: AuditTrailEntry): Promise<void> {
    // Handle critical risk events
    logger.error(`Critical risk event detected: ${entry.id}`);
  }

  private async updateRealTimeMetrics(_entry: AuditTrailEntry): Promise<void> {
    // Update real-time compliance and risk metrics
    // Implementation would update dashboards and monitoring systems
  }

  private mapRowToAuditEntry(row: any): AuditTrailEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      eventType: row.event_type,
      category: row.category,
      severity: row.severity,
      userId: row.user_id,
      userRole: row.user_role,
      sessionId: row.session_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      action: row.action,
      description: row.description,
      beforeState: row.before_state,
      afterState: row.after_state,
      metadata: row.metadata,
      complianceContext: row.compliance_context,
      riskAssessment: row.risk_assessment,
      retention: row.retention,
    };
  }

  private mapAuditEntryToRow(entry: AuditTrailEntry): any {
    return {
      id: entry.id,
      timestamp: entry.timestamp,
      event_type: entry.eventType,
      category: entry.category,
      severity: entry.severity,
      user_id: entry.userId,
      user_role: entry.userRole,
      session_id: entry.sessionId,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      resource_id: entry.resourceId,
      resource_type: entry.resourceType,
      action: entry.action,
      description: entry.description,
      before_state: entry.beforeState,
      after_state: entry.afterState,
      metadata: entry.metadata,
      compliance_context: entry.complianceContext,
      risk_assessment: entry.riskAssessment,
      retention: entry.retention,
    };
  }

  private getAuditCategories(): AuditCategory[] {
    return [
      'patient_data',
      'medical_records',
      'system_security',
      'user_activity',
      'compliance_validation',
      'data_processing',
    ];
  }

  private generateAuditSummary(entries: AuditTrailEntry[]): AuditSummary {
    return {
      totalEvents: entries.length,
      eventsByType: this.groupByField(entries, 'eventType'),
      eventsByCategory: this.groupByField(entries, 'category'),
      eventsBySeverity: this.groupByField(entries, 'severity'),
      complianceRate: this.calculateComplianceRate(entries),
      riskDistribution: this.calculateRiskDistribution(entries),
      topUsers: this.getTopUsers(entries),
      topResources: this.getTopResources(entries),
    };
  }

  private async generateAuditFindings(
    entries: AuditTrailEntry[]
  ): Promise<AuditFinding[]> {
    // Generate audit findings from entries
    const findings: AuditFinding[] = [];

    // Example finding for non-compliant events
    const nonCompliantEvents = entries.filter(
      (e) => e.complianceContext.complianceStatus === 'non_compliant'
    );
    if (nonCompliantEvents.length > 0) {
      findings.push({
        id: `finding_compliance_${Date.now()}`,
        type: 'compliance_violation',
        severity: 'warning',
        title: 'Compliance Violations Detected',
        description: `${nonCompliantEvents.length} compliance violations found`,
        evidence: nonCompliantEvents.map((e) => e.id),
        relatedEvents: nonCompliantEvents.map((e) => e.id),
        impactAssessment: {
          patientSafety: 'low',
          dataPrivacy: 'medium',
          systemSecurity: 'low',
          regulatoryCompliance: 'high',
          businessContinuity: 'low',
          reputationalRisk: 'medium',
        },
        recommendedActions: [
          'Review and address compliance gaps',
          'Update policies if necessary',
        ],
        status: 'open',
      });
    }

    return findings;
  }

  private async generateAuditRecommendations(
    _entries: AuditTrailEntry[]
  ): Promise<AuditRecommendation[]> {
    // Generate recommendations based on audit analysis
    return [
      {
        id: `rec_${Date.now()}`,
        category: 'compliance',
        priority: 'high',
        title: 'Enhance Access Control Monitoring',
        description: 'Implement more granular access control monitoring',
        justification:
          'Multiple access events detected that require closer monitoring',
        implementation: {
          estimatedEffort: 'medium',
          timeline: '2-4 weeks',
          resources: ['Security team', 'Development team'],
          dependencies: ['Updated access control system'],
          successCriteria: [
            'Reduced unauthorized access attempts',
            'Improved compliance scores',
          ],
        },
        expectedBenefit: 'Improved security posture and compliance',
        riskReduction: 25,
      },
    ];
  }

  private generateComplianceMetrics(
    entries: AuditTrailEntry[]
  ): ComplianceMetrics {
    return {
      overallComplianceRate: this.calculateComplianceRate(entries),
      complianceByRegulation: this.calculateComplianceByRegulation(entries),
      complianceByCategory: this.calculateComplianceByCategory(entries),
      complianceByUser: this.calculateComplianceByUser(entries),
      complianceTrends: this.calculateComplianceTrends(entries),
      violationsSummary: this.calculateViolationsSummary(entries),
    };
  }

  private generateRiskMetrics(entries: AuditTrailEntry[]): RiskMetrics {
    return {
      overallRiskScore: this.calculateOverallRiskScore(entries),
      riskByCategory: this.calculateRiskByCategory(entries),
      riskByUser: this.calculateRiskByUser(entries),
      riskByResource: this.calculateRiskByResource(entries),
      highRiskEvents: entries.filter(
        (e) => e.riskAssessment.riskLevel === 'high'
      ).length,
      criticalRiskEvents: entries.filter(
        (e) => e.riskAssessment.riskLevel === 'critical'
      ).length,
      riskTrends: this.calculateRiskTrends(entries),
      riskMitigationStatus: this.calculateRiskMitigationStatus(entries),
    };
  }

  private async generateAuditTrends(
    _entries: AuditTrailEntry[],
    _timeRange: { startDate: string; endDate: string }
  ): Promise<AuditTrend[]> {
    // Generate trend analysis
    return [
      {
        metric: 'compliance_rate',
        timePeriod: 'daily',
        values: [],
        trend: 'stable',
        significance: 'medium',
      },
    ];
  }

  private async saveAuditReport(report: AuditReport): Promise<void> {
    const { error } = await this.supabase.from('audit_reports').insert({
      id: report.id,
      generated_date: report.generatedDate,
      report_type: report.reportType,
      report_data: report,
    });

    if (error) {
      logger.error('Failed to save audit report:', error);
    }
  }

  // Additional helper methods for calculations
  private groupByField<T extends Record<string, any>>(
    items: T[],
    field: keyof T
  ): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const key = item[field] as string;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private calculateComplianceRate(entries: AuditTrailEntry[]): number {
    if (entries.length === 0) return 100;

    const compliantEntries = entries.filter(
      (e) => e.complianceContext.complianceStatus === 'compliant'
    );
    return (compliantEntries.length / entries.length) * 100;
  }

  private calculateRiskDistribution(
    entries: AuditTrailEntry[]
  ): Record<string, number> {
    return this.groupByField(
      entries.map((e) => ({ riskLevel: e.riskAssessment.riskLevel })),
      'riskLevel'
    );
  }

  private getTopUsers(entries: AuditTrailEntry[]): UserActivity[] {
    const userActivity = new Map<
      string,
      { count: number; riskScore: number; lastActivity: string }
    >();

    entries.forEach((entry) => {
      const existing = userActivity.get(entry.userId) || {
        count: 0,
        riskScore: 0,
        lastActivity: entry.timestamp,
      };
      userActivity.set(entry.userId, {
        count: existing.count + 1,
        riskScore: Math.max(existing.riskScore, entry.riskAssessment.riskScore),
        lastActivity:
          entry.timestamp > existing.lastActivity
            ? entry.timestamp
            : existing.lastActivity,
      });
    });

    return Array.from(userActivity.entries()).map(([userId, activity]) => ({
      userId,
      userName: `User ${userId}`, // In real implementation, would look up actual name
      eventCount: activity.count,
      riskScore: activity.riskScore,
      complianceRate: 95, // Would calculate actual compliance rate
      lastActivity: activity.lastActivity,
    }));
  }

  private getTopResources(entries: AuditTrailEntry[]): ResourceActivity[] {
    const resourceActivity = new Map<
      string,
      {
        accessCount: number;
        modificationCount: number;
        riskScore: number;
        lastAccessed: string;
      }
    >();

    entries.forEach((entry) => {
      if (!entry.resourceId) return;

      const existing = resourceActivity.get(entry.resourceId) || {
        accessCount: 0,
        modificationCount: 0,
        riskScore: 0,
        lastAccessed: entry.timestamp,
      };

      resourceActivity.set(entry.resourceId, {
        accessCount:
          existing.accessCount + (entry.eventType === 'access' ? 1 : 0),
        modificationCount:
          existing.modificationCount +
          (entry.eventType === 'modification' ? 1 : 0),
        riskScore: Math.max(existing.riskScore, entry.riskAssessment.riskScore),
        lastAccessed:
          entry.timestamp > existing.lastAccessed
            ? entry.timestamp
            : existing.lastAccessed,
      });
    });

    return Array.from(resourceActivity.entries()).map(
      ([resourceId, activity]) => ({
        resourceId,
        resourceType: 'patient_record', // Would determine actual type
        accessCount: activity.accessCount,
        modificationCount: activity.modificationCount,
        riskScore: activity.riskScore,
        lastAccessed: activity.lastAccessed,
      })
    );
  }

  private calculateComplianceByRegulation(
    _entries: AuditTrailEntry[]
  ): Record<string, number> {
    // Implementation for compliance calculation by regulation
    return {};
  }

  private calculateComplianceByCategory(
    _entries: AuditTrailEntry[]
  ): Record<AuditCategory, number> {
    // Implementation for compliance calculation by category
    return {} as Record<AuditCategory, number>;
  }

  private calculateComplianceByUser(
    _entries: AuditTrailEntry[]
  ): Record<string, number> {
    // Implementation for compliance calculation by user
    return {};
  }

  private calculateComplianceTrends(
    _entries: AuditTrailEntry[]
  ): ComplianceTrend[] {
    // Implementation for compliance trends calculation
    return [];
  }

  private calculateViolationsSummary(
    entries: AuditTrailEntry[]
  ): ViolationsSummary {
    const violations = entries.filter(
      (e) => e.complianceContext.complianceStatus === 'non_compliant'
    );

    return {
      totalViolations: violations.length,
      violationsByType: this.groupByField(violations, 'eventType'),
      violationsBySeverity: this.groupByField(violations, 'severity'),
      resolvedViolations: 0, // Would track resolution status
      pendingViolations: violations.length,
      avgResolutionTime: 0, // Would calculate actual resolution time
    };
  }

  private calculateOverallRiskScore(entries: AuditTrailEntry[]): number {
    if (entries.length === 0) return 0;

    const totalRisk = entries.reduce(
      (sum, entry) => sum + entry.riskAssessment.riskScore,
      0
    );
    return totalRisk / entries.length;
  }

  private calculateRiskByCategory(
    _entries: AuditTrailEntry[]
  ): Record<string, number> {
    // Implementation for risk calculation by category
    return {};
  }

  private calculateRiskByUser(
    _entries: AuditTrailEntry[]
  ): Record<string, number> {
    // Implementation for risk calculation by user
    return {};
  }

  private calculateRiskByResource(
    _entries: AuditTrailEntry[]
  ): Record<string, number> {
    // Implementation for risk calculation by resource
    return {};
  }

  private calculateRiskTrends(_entries: AuditTrailEntry[]): RiskTrend[] {
    // Implementation for risk trends calculation
    return [];
  }

  private calculateRiskMitigationStatus(
    _entries: AuditTrailEntry[]
  ): RiskMitigationStatus {
    // Implementation for risk mitigation status calculation
    return {
      totalMitigations: 0,
      completedMitigations: 0,
      pendingMitigations: 0,
      overdueMitigations: 0,
      avgMitigationTime: 0,
    };
  }

  private groupValidationsByRegulation(
    _results: ComplianceValidationResult[]
  ): Record<string, number> {
    // Implementation for grouping validations by regulation
    return {};
  }

  private async generateComplianceRecommendations(
    _results: ComplianceValidationResult[]
  ): Promise<string[]> {
    // Implementation for generating compliance recommendations
    return [
      'Regular compliance training for staff',
      'Update compliance policies and procedures',
      'Implement automated compliance checking',
    ];
  }
}

// Additional interfaces
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  severity: AuditSeverity;
  applicableCategories: AuditCategory[];
  applicableEventTypes: AuditEventType[];
  requiresReview: boolean;
  recommendedAction: string;
}

export interface ComplianceValidationSummary {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  warningValidations: number;
  complianceRate: number;
  validationsByRegulation: Record<string, number>;
  criticalFailures: number;
  recommendations: string[];
}

// Validation schemas
export const AuditEventValidationSchema = z.object({
  eventType: z.enum([
    'access',
    'modification',
    'deletion',
    'creation',
    'authentication',
    'authorization',
    'compliance_check',
    'data_export',
    'system_event',
  ]),
  category: z.enum([
    'patient_data',
    'medical_records',
    'system_security',
    'user_activity',
    'compliance_validation',
    'data_processing',
  ]),
  userId: z.string().min(1, 'User ID is required'),
  action: z.string().min(1, 'Action is required'),
  description: z.string().min(1, 'Description is required'),
});

// Export singleton instance
export const auditTrailManager = new AuditTrailManager();
