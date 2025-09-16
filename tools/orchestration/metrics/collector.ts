/**
 * Comprehensive Metrics Collector for TDD Orchestration
 * Tracks performance, quality, agent coordination, and healthcare compliance metrics
 */

import {
  AgentResult,
  OrchestrationResult,
  TDDPhase,
  AgentName,
  OrchestrationContext,
  QualityControlResult,
  HealthcareComplianceContext,
} from '../types';

export interface MetricsSnapshot {
  timestamp: Date;
  orchestration: OrchestrationMetrics;
  agents: AgentMetrics;
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  healthcare: HealthcareMetrics;
  coordination: CoordinationMetrics;
}

export interface OrchestrationMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  phaseBreakdown: {
    [phase in TDDPhase]: {
      totalExecutions: number;
      averageDuration: number;
      successRate: number;
    };
  };
  workflowDistribution: Record<string, number>;
  parallelExecutionEfficiency: number;
}

export interface AgentMetrics {
  agentPerformance: {
    [agent in AgentName]: {
      totalActivations: number;
      successfulActivations: number;
      averageExecutionTime: number;
      averageQualityScore: number;
      issuesFound: number;
      recommendationsProvided: number;
      conflictInvolvement: number;
    };
  };
  coordination: {
    parallelExecutions: number;
    sequentialExecutions: number;
    mixedExecutions: number;
    conflictsResolved: number;
    consensusAchieved: number;
  };
}

export interface QualityMetrics {
  overallQualityScore: number;
  qualityTrends: Array<{
    timestamp: Date;
    score: number;
    category: string;
  }>;
  complianceScores: {
    codeQuality: number;
    testCoverage: number;
    security: number;
    accessibility: number;
    performance: number;
  };
  improvementSuggestions: string[];
  qualityGatePasses: number;
  qualityGateFailures: number;
}

export interface PerformanceMetrics {
  executionTimes: {
    fastest: number;
    slowest: number;
    median: number;
    p95: number;
    p99: number;
  };
  throughput: {
    orchestrationsPerHour: number;
    agentExecutionsPerMinute: number;
    qualityChecksPerMinute: number;
  };
  resourceUtilization: {
    memoryUsage: number;
    cpuUsage: number;
    concurrentAgents: number;
  };
  bottlenecks: Array<{
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface HealthcareMetrics {
  complianceValidations: {
    lgpd: { passed: number; failed: number; score: number };
    anvisa: { passed: number; failed: number; score: number };
    cfm: { passed: number; failed: number; score: number };
    hipaa: { passed: number; failed: number; score: number };
  };
  patientDataOperations: {
    total: number;
    under100ms: number;
    under200ms: number;
    over200ms: number;
    averageResponseTime: number;
  };
  auditTrail: {
    entriesGenerated: number;
    complianceScore: number;
    integrityScore: number;
  };
  securityValidations: {
    vulnerabilitiesFound: number;
    criticalVulnerabilities: number;
    securityTestsPassed: number;
    encryptionCompliance: number;
  };
}

export interface CoordinationMetrics {
  messageBus: {
    totalMessages: number;
    messagesPerAgent: Record<string, number>;
    messageTypes: Record<string, number>;
    averageMessageSize: number;
  };
  conflicts: {
    totalConflicts: number;
    conflictsByType: Record<string, number>;
    resolutionStrategies: Record<string, number>;
    averageResolutionTime: number;
  };
  synchronization: {
    parallelEfficiency: number;
    coordinationOverhead: number;
    waitTimeReductions: number;
  };
}

export class TDDMetricsCollector {
  private metrics: MetricsSnapshot;
  private executionHistory: Array<{
    timestamp: Date;
    type: string;
    duration: number;
    success: boolean;
    context: any;
  }> = [];
  private agentActivations: Map<AgentName, any[]> = new Map();
  private qualityHistory: Array<{ timestamp: Date; score: number; category: string }> = [];
  private performanceData: number[] = [];

  constructor() {
    this.metrics = this.initializeMetrics();
    this.startPeriodicCollection();
  }

  /**
   * Record orchestration execution
   */
  recordOrchestration(
    result: OrchestrationResult,
    context: OrchestrationContext,
    duration: number
  ): void {
    const execution = {
      timestamp: new Date(),
      type: 'orchestration',
      duration,
      success: result.success,
      context: {
        workflow: result.workflow,
        feature: result.feature.name,
        complexity: result.feature.complexity,
        healthcare: context.healthcareCompliance.required,
      },
    };

    this.executionHistory.push(execution);
    this.performanceData.push(duration);

    // Update orchestration metrics
    this.metrics.orchestration.totalExecutions++;
    if (result.success) {
      this.metrics.orchestration.successfulExecutions++;
    } else {
      this.metrics.orchestration.failedExecutions++;
    }

    this.updateAverageDuration(duration);
    this.updateWorkflowDistribution(result.workflow);
    this.recordPhaseMetrics(result);

    // Update quality metrics
    this.recordQualityScore(result.overallQualityScore, 'orchestration');
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(
    agent: AgentName,
    result: AgentResult,
    context: OrchestrationContext
  ): void {
    const activation = {
      timestamp: new Date(),
      agent,
      success: result.success,
      duration: result.duration,
      qualityScore: result.qualityScore || 0,
      issuesFound: result.errors?.length || 0,
      warnings: result.warnings?.length || 0,
      context,
    };

    // Store activation
    if (!this.agentActivations.has(agent)) {
      this.agentActivations.set(agent, []);
    }
    this.agentActivations.get(agent)!.push(activation);

    // Update agent metrics
    const agentMetrics = this.metrics.agents.agentPerformance[agent];
    agentMetrics.totalActivations++;
    if (result.success) {
      agentMetrics.successfulActivations++;
    }

    agentMetrics.averageExecutionTime = this.calculateAverage(
      agentMetrics.averageExecutionTime,
      result.duration,
      agentMetrics.totalActivations
    );

    if (result.qualityScore) {
      agentMetrics.averageQualityScore = this.calculateAverage(
        agentMetrics.averageQualityScore,
        result.qualityScore,
        agentMetrics.totalActivations
      );
    }

    agentMetrics.issuesFound += result.errors?.length || 0;
    agentMetrics.recommendationsProvided += result.warnings?.length || 0;

    // Record quality score
    if (result.qualityScore) {
      this.recordQualityScore(result.qualityScore, agent);
    }
  }

  /**
   * Record quality control execution
   */
  recordQualityControl(
    result: QualityControlResult,
    context: OrchestrationContext,
    duration: number
  ): void {
    const execution = {
      timestamp: new Date(),
      type: 'quality-control',
      duration,
      success: result.success,
      context: {
        action: result.action,
        agentCount: result.agentResults?.length || 0,
        healthcare: context.healthcareCompliance.required,
      },
    };

    this.executionHistory.push(execution);
    this.performanceData.push(duration);

    // Record quality score
    this.recordQualityScore(result.qualityScore, 'quality-control');

    // Update agent coordination metrics if agents were used
    if (result.agentResults && result.agentResults.length > 1) {
      this.metrics.agents.coordination.parallelExecutions++;
    }

    // Record healthcare compliance if applicable
    if (result.complianceStatus) {
      this.recordHealthcareCompliance(result.complianceStatus);
    }
  }

  /**
   * Record message bus statistics
   */
  recordMessageBusStats(stats: any): void {
    this.metrics.coordination.messageBus = {
      totalMessages: stats.totalMessages,
      messagesPerAgent: stats.messagesByAgent,
      messageTypes: stats.messagesByType,
      averageMessageSize: this.calculateAverageMessageSize(stats),
    };
  }

  /**
   * Record conflict resolution
   */
  recordConflictResolution(
    conflictKey: string,
    conflictType: string,
    resolutionStrategy: string,
    resolutionTime: number
  ): void {
    this.metrics.coordination.conflicts.totalConflicts++;
    this.metrics.coordination.conflicts.conflictsByType[conflictType] =
      (this.metrics.coordination.conflicts.conflictsByType[conflictType] || 0) + 1;
    this.metrics.coordination.conflicts.resolutionStrategies[resolutionStrategy] =
      (this.metrics.coordination.conflicts.resolutionStrategies[resolutionStrategy] || 0) + 1;

    // Update average resolution time
    this.metrics.coordination.conflicts.averageResolutionTime = this.calculateAverage(
      this.metrics.coordination.conflicts.averageResolutionTime,
      resolutionTime,
      this.metrics.coordination.conflicts.totalConflicts
    );
  }

  /**
   * Record healthcare compliance validation
   */
  recordHealthcareCompliance(complianceStatus: HealthcareComplianceContext): void {
    if (complianceStatus.lgpdRequired) {
      this.metrics.healthcare.complianceValidations.lgpd.passed++;
    }
    if (complianceStatus.anvisaRequired) {
      this.metrics.healthcare.complianceValidations.anvisa.passed++;
    }
    if (complianceStatus.cfmRequired) {
      this.metrics.healthcare.complianceValidations.cfm.passed++;
    }

    // Record patient data operation performance
    if (complianceStatus.performanceThreshold) {
      this.metrics.healthcare.patientDataOperations.total++;
      if (complianceStatus.performanceThreshold <= 100) {
        this.metrics.healthcare.patientDataOperations.under100ms++;
      } else if (complianceStatus.performanceThreshold <= 200) {
        this.metrics.healthcare.patientDataOperations.under200ms++;
      } else {
        this.metrics.healthcare.patientDataOperations.over200ms++;
      }
    }

    // Update audit trail metrics
    this.metrics.healthcare.auditTrail.entriesGenerated++;
    this.metrics.healthcare.auditTrail.complianceScore =
      Math.min(100, this.metrics.healthcare.auditTrail.complianceScore + 1);
  }

  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot(): MetricsSnapshot {
    this.updateDerivedMetrics();
    return { ...this.metrics, timestamp: new Date() };
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    trends: Array<{ timestamp: Date; metric: string; value: number }>;
    bottlenecks: Array<{ type: string; description: string; severity: string }>;
    recommendations: string[];
  } {
    const trends = this.calculatePerformanceTrends();
    const bottlenecks = this.identifyBottlenecks();
    const recommendations = this.generateRecommendations();

    return { trends, bottlenecks, recommendations };
  }

  /**
   * Get quality report
   */
  getQualityReport(): {
    overallScore: number;
    categoryBreakdown: Record<string, number>;
    trends: Array<{ timestamp: Date; score: number; category: string }>;
    improvements: string[];
  } {
    const categoryScores = this.calculateCategoryScores();
    const recentTrends = this.qualityHistory.slice(-50); // Last 50 entries

    return {
      overallScore: this.metrics.quality.overallQualityScore,
      categoryBreakdown: categoryScores,
      trends: recentTrends,
      improvements: this.metrics.quality.improvementSuggestions,
    };
  }

  /**
   * Get healthcare compliance report
   */
  getHealthcareReport(): {
    overallCompliance: number;
    lgpdCompliance: number;
    anvisaCompliance: number;
    cfmCompliance: number;
    performanceCompliance: number;
    auditTrailStatus: string;
    recommendations: string[];
  } {
    const healthcare = this.metrics.healthcare;

    const lgpdScore = this.calculateComplianceScore(healthcare.complianceValidations.lgpd);
    const anvisaScore = this.calculateComplianceScore(healthcare.complianceValidations.anvisa);
    const cfmScore = this.calculateComplianceScore(healthcare.complianceValidations.cfm);

    const performanceCompliance = healthcare.patientDataOperations.total > 0 ?
      (healthcare.patientDataOperations.under100ms / healthcare.patientDataOperations.total) * 100 : 100;

    const overallCompliance = (lgpdScore + anvisaScore + cfmScore + performanceCompliance) / 4;

    return {
      overallCompliance,
      lgpdCompliance: lgpdScore,
      anvisaCompliance: anvisaScore,
      cfmCompliance: cfmScore,
      performanceCompliance,
      auditTrailStatus: healthcare.auditTrail.complianceScore > 90 ? 'compliant' : 'needs-attention',
      recommendations: this.generateHealthcareRecommendations(),
    };
  }

  /**
   * Export metrics for reporting
   */
  exportMetrics(format: 'json' | 'csv' | 'summary' = 'json'): any {
    const snapshot = this.getMetricsSnapshot();

    switch (format) {
      case 'csv':
        return this.convertToCSV(snapshot);
      case 'summary':
        return this.createSummaryReport(snapshot);
      case 'json':
      default:
        return snapshot;
    }
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.executionHistory = [];
    this.agentActivations.clear();
    this.qualityHistory = [];
    this.performanceData = [];
  }

  // Private helper methods

  private initializeMetrics(): MetricsSnapshot {
    return {
      timestamp: new Date(),
      orchestration: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageDuration: 0,
        phaseBreakdown: {
          red: { totalExecutions: 0, averageDuration: 0, successRate: 0 },
          green: { totalExecutions: 0, averageDuration: 0, successRate: 0 },
          refactor: { totalExecutions: 0, averageDuration: 0, successRate: 0 },
        },
        workflowDistribution: {},
        parallelExecutionEfficiency: 0,
      },
      agents: {
        agentPerformance: {
          'tdd-orchestrator': this.createAgentMetrics(),
          'architect-review': this.createAgentMetrics(),
          'code-reviewer': this.createAgentMetrics(),
          'security-auditor': this.createAgentMetrics(),
          'test': this.createAgentMetrics(),
        },
        coordination: {
          parallelExecutions: 0,
          sequentialExecutions: 0,
          mixedExecutions: 0,
          conflictsResolved: 0,
          consensusAchieved: 0,
        },
      },
      quality: {
        overallQualityScore: 0,
        qualityTrends: [],
        complianceScores: {
          codeQuality: 0,
          testCoverage: 0,
          security: 0,
          accessibility: 0,
          performance: 0,
        },
        improvementSuggestions: [],
        qualityGatePasses: 0,
        qualityGateFailures: 0,
      },
      performance: {
        executionTimes: {
          fastest: 0,
          slowest: 0,
          median: 0,
          p95: 0,
          p99: 0,
        },
        throughput: {
          orchestrationsPerHour: 0,
          agentExecutionsPerMinute: 0,
          qualityChecksPerMinute: 0,
        },
        resourceUtilization: {
          memoryUsage: 0,
          cpuUsage: 0,
          concurrentAgents: 0,
        },
        bottlenecks: [],
      },
      healthcare: {
        complianceValidations: {
          lgpd: { passed: 0, failed: 0, score: 0 },
          anvisa: { passed: 0, failed: 0, score: 0 },
          cfm: { passed: 0, failed: 0, score: 0 },
          hipaa: { passed: 0, failed: 0, score: 0 },
        },
        patientDataOperations: {
          total: 0,
          under100ms: 0,
          under200ms: 0,
          over200ms: 0,
          averageResponseTime: 0,
        },
        auditTrail: {
          entriesGenerated: 0,
          complianceScore: 100,
          integrityScore: 100,
        },
        securityValidations: {
          vulnerabilitiesFound: 0,
          criticalVulnerabilities: 0,
          securityTestsPassed: 0,
          encryptionCompliance: 100,
        },
      },
      coordination: {
        messageBus: {
          totalMessages: 0,
          messagesPerAgent: {},
          messageTypes: {},
          averageMessageSize: 0,
        },
        conflicts: {
          totalConflicts: 0,
          conflictsByType: {},
          resolutionStrategies: {},
          averageResolutionTime: 0,
        },
        synchronization: {
          parallelEfficiency: 0,
          coordinationOverhead: 0,
          waitTimeReductions: 0,
        },
      },
    };
  }

  private createAgentMetrics(): any {
    return {
      totalActivations: 0,
      successfulActivations: 0,
      averageExecutionTime: 0,
      averageQualityScore: 0,
      issuesFound: 0,
      recommendationsProvided: 0,
      conflictInvolvement: 0,
    };
  }

  private recordQualityScore(score: number, category: string): void {
    const entry = { timestamp: new Date(), score, category };
    this.qualityHistory.push(entry);

    // Keep only last 1000 entries
    if (this.qualityHistory.length > 1000) {
      this.qualityHistory.shift();
    }

    // Update overall quality score
    const recentScores = this.qualityHistory.slice(-10).map(h => h.score);
    this.metrics.quality.overallQualityScore =
      recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
  }

  private updateAverageDuration(duration: number): void {
    const total = this.metrics.orchestration.totalExecutions;
    this.metrics.orchestration.averageDuration =
      (this.metrics.orchestration.averageDuration * (total - 1) + duration) / total;
  }

  private updateWorkflowDistribution(workflow: string): void {
    this.metrics.orchestration.workflowDistribution[workflow] =
      (this.metrics.orchestration.workflowDistribution[workflow] || 0) + 1;
  }

  private recordPhaseMetrics(result: OrchestrationResult): void {
    Object.entries(result.phases).forEach(([phase, phaseResult]) => {
      const phaseMetrics = this.metrics.orchestration.phaseBreakdown[phase as TDDPhase];
      phaseMetrics.totalExecutions++;

      if (phaseResult.success) {
        phaseMetrics.successRate =
          ((phaseMetrics.successRate * (phaseMetrics.totalExecutions - 1)) + 1) / phaseMetrics.totalExecutions;
      } else {
        phaseMetrics.successRate =
          (phaseMetrics.successRate * (phaseMetrics.totalExecutions - 1)) / phaseMetrics.totalExecutions;
      }

      phaseMetrics.averageDuration = this.calculateAverage(
        phaseMetrics.averageDuration,
        phaseResult.duration,
        phaseMetrics.totalExecutions
      );
    });
  }

  private calculateAverage(currentAvg: number, newValue: number, count: number): number {
    return (currentAvg * (count - 1) + newValue) / count;
  }

  private calculateAverageMessageSize(stats: any): number {
    return stats.totalMessages > 0 ?
      Object.values(stats.messagesByAgent).reduce((sum: number, count: any) => sum + count, 0) / stats.totalMessages : 0;
  }

  private calculateComplianceScore(compliance: { passed: number; failed: number }): number {
    const total = compliance.passed + compliance.failed;
    return total > 0 ? (compliance.passed / total) * 100 : 100;
  }

  private updateDerivedMetrics(): void {
    this.updatePerformanceMetrics();
    this.updateThroughputMetrics();
    this.updateParallelEfficiency();
  }

  private updatePerformanceMetrics(): void {
    if (this.performanceData.length > 0) {
      const sorted = [...this.performanceData].sort((a, b) => a - b);

      this.metrics.performance.executionTimes = {
        fastest: sorted[0],
        slowest: sorted[sorted.length - 1],
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    }
  }

  private updateThroughputMetrics(): void {
    const lastHour = Date.now() - (60 * 60 * 1000);
    const recentExecutions = this.executionHistory.filter(e => e.timestamp.getTime() > lastHour);

    this.metrics.performance.throughput.orchestrationsPerHour = recentExecutions.length;
  }

  private updateParallelEfficiency(): void {
    const parallelExecs = this.metrics.agents.coordination.parallelExecutions;
    const sequentialExecs = this.metrics.agents.coordination.sequentialExecutions;
    const total = parallelExecs + sequentialExecs;

    this.metrics.orchestration.parallelExecutionEfficiency =
      total > 0 ? (parallelExecs / total) * 100 : 0;
  }

  private calculatePerformanceTrends(): Array<{ timestamp: Date; metric: string; value: number }> {
    return this.executionHistory.slice(-20).map(e => ({
      timestamp: e.timestamp,
      metric: 'duration',
      value: e.duration,
    }));
  }

  private identifyBottlenecks(): Array<{ type: string; description: string; severity: string }> {
    const bottlenecks: Array<{ type: string; description: string; severity: string }> = [];

    // Check for slow agents
    Object.entries(this.metrics.agents.agentPerformance).forEach(([agent, metrics]) => {
      if (metrics.averageExecutionTime > 10000) { // 10 seconds
        bottlenecks.push({
          type: 'agent-performance',
          description: `Agent ${agent} has high average execution time: ${metrics.averageExecutionTime}ms`,
          severity: 'medium',
        });
      }
    });

    // Check for low quality scores
    if (this.metrics.quality.overallQualityScore < 8) {
      bottlenecks.push({
        type: 'quality',
        description: `Overall quality score is low: ${this.metrics.quality.overallQualityScore}`,
        severity: 'high',
      });
    }

    return bottlenecks;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (this.metrics.performance.executionTimes.p95 > 30000) {
      recommendations.push('Consider optimizing agent execution patterns - 95th percentile is over 30 seconds');
    }

    // Quality recommendations
    if (this.metrics.quality.overallQualityScore < 9) {
      recommendations.push('Implement additional quality checks to improve overall quality score');
    }

    // Healthcare recommendations
    if (this.metrics.healthcare.patientDataOperations.over200ms > 0) {
      recommendations.push('Optimize patient data operations to meet <100ms requirement');
    }

    return recommendations;
  }

  private generateHealthcareRecommendations(): string[] {
    const recommendations: string[] = [];
    const healthcare = this.metrics.healthcare;

    if (healthcare.patientDataOperations.over200ms > 0) {
      recommendations.push('Optimize patient data operations to meet performance requirements');
    }

    if (healthcare.securityValidations.criticalVulnerabilities > 0) {
      recommendations.push('Address critical security vulnerabilities immediately');
    }

    if (healthcare.auditTrail.complianceScore < 95) {
      recommendations.push('Improve audit trail completeness for regulatory compliance');
    }

    return recommendations;
  }

  private calculateCategoryScores(): Record<string, number> {
    const categories = ['orchestration', 'architect-review', 'code-reviewer', 'security-auditor', 'test'];
    const scores: Record<string, number> = {};

    categories.forEach(category => {
      const categoryEntries = this.qualityHistory.filter(h => h.category === category);
      if (categoryEntries.length > 0) {
        scores[category] = categoryEntries.reduce((sum, entry) => sum + entry.score, 0) / categoryEntries.length;
      } else {
        scores[category] = 0;
      }
    });

    return scores;
  }

  private convertToCSV(snapshot: MetricsSnapshot): string {
    // Simple CSV conversion - could be enhanced
    const headers = ['Timestamp', 'Total_Executions', 'Success_Rate', 'Avg_Duration', 'Quality_Score'];
    const data = [
      snapshot.timestamp.toISOString(),
      snapshot.orchestration.totalExecutions.toString(),
      (snapshot.orchestration.successfulExecutions / snapshot.orchestration.totalExecutions * 100).toFixed(2),
      snapshot.orchestration.averageDuration.toFixed(2),
      snapshot.quality.overallQualityScore.toFixed(2),
    ];

    return [headers.join(','), data.join(',')].join('\n');
  }

  private createSummaryReport(snapshot: MetricsSnapshot): any {
    return {
      summary: 'TDD Orchestration Metrics Summary',
      timestamp: snapshot.timestamp,
      overview: {
        totalExecutions: snapshot.orchestration.totalExecutions,
        successRate: `${(snapshot.orchestration.successfulExecutions / snapshot.orchestration.totalExecutions * 100).toFixed(1)}%`,
        averageDuration: `${snapshot.orchestration.averageDuration.toFixed(0)}ms`,
        qualityScore: `${snapshot.quality.overallQualityScore.toFixed(1)}/10`,
      },
      performance: {
        fastest: `${snapshot.performance.executionTimes.fastest}ms`,
        slowest: `${snapshot.performance.executionTimes.slowest}ms`,
        p95: `${snapshot.performance.executionTimes.p95}ms`,
      },
      healthcare: this.getHealthcareReport(),
      topPerformingAgents: this.getTopPerformingAgents(),
    };
  }

  private getTopPerformingAgents(): Array<{ agent: string; score: number; activations: number }> {
    return Object.entries(this.metrics.agents.agentPerformance)
      .map(([agent, metrics]) => ({
        agent,
        score: metrics.averageQualityScore,
        activations: metrics.totalActivations,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  private startPeriodicCollection(): void {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateDerivedMetrics();
    }, 30000);
  }
}