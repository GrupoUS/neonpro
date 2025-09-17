import { EventEmitter } from 'events';
import type {
  QualityGates,
  QualityGateStatus,
  TDDPhase,
  AgentResult,
  OrchestrationMetrics,
  FeatureContext
} from './types';

/**
 * Quality Gates System for TDD Orchestrator
 * Validates quality standards at each phase and provides metrics
 */
export class QualityGatesSystem extends EventEmitter {
  private thresholds: Record<string, number>;
  private requiredGates: string[];
  private optionalGates: string[];

  constructor(config: {
    thresholds: Record<string, number>;
    required: string[];
    optional: string[];
  }) {
    super();
    this.thresholds = config.thresholds;
    this.requiredGates = config.required;
    this.optionalGates = config.optional;
  }

  /**
   * Validate quality gates for a specific phase
   */
  async validatePhase(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGates> {
    const gates: QualityGates = {
      architecture: 'pending',
      security: 'pending',
      codeQuality: 'pending',
      testCoverage: 'pending',
      performance: 'pending',
      compliance: 'pending'
    };

    // Architecture validation
    gates.architecture = await this.validateArchitecture(phase, results, context);
    
    // Security validation
    gates.security = await this.validateSecurity(phase, results, context);
    
    // Code quality validation
    gates.codeQuality = await this.validateCodeQuality(phase, results, context);
    
    // Test coverage validation
    gates.testCoverage = await this.validateTestCoverage(phase, results, context);
    
    // Performance validation
    gates.performance = await this.validatePerformance(phase, results, context);
    
    // Compliance validation
    gates.compliance = await this.validateCompliance(phase, results, context);

    // Emit quality gate results
    this.emit('quality-gates-validated', {
      phase,
      gates,
      context: context.name,
      timestamp: new Date()
    });

    return gates;
  }

  /**
   * Check if all required quality gates have passed
   */
  areQualityGatesPassed(gates: QualityGates): boolean {
    const requiredResults = this.requiredGates.map(gate => gates[gate as keyof QualityGates]);
    return requiredResults.every(status => status === 'passed');
  }

  /**
   * Get quality gate metrics
   */
  getQualityMetrics(gates: QualityGates): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    Object.entries(gates).forEach(([gate, status]) => {
      metrics[`quality_gate_${gate}`] = status === 'passed' ? 1 : 0;
    });

    const passedCount = Object.values(gates).filter(status => status === 'passed').length;
    const totalCount = Object.values(gates).length;
    
    metrics.quality_gates_pass_rate = passedCount / totalCount;
    metrics.quality_gates_passed = passedCount;
    metrics.quality_gates_total = totalCount;

    return metrics;
  }

  /**
   * Validate architecture quality gate
   */
  private async validateArchitecture(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    const architectResults = results.filter(r => r.agent === 'architect-review');
    
    if (architectResults.length === 0) {
      return phase === 'red' ? 'skipped' : 'failed';
    }

    const criticalFindings = architectResults.reduce((count, result) => {
      return count + result.findings.filter(f => f.severity === 'critical').length;
    }, 0);

    const threshold = this.thresholds.architecture_critical_findings || 0;
    return criticalFindings <= threshold ? 'passed' : 'failed';
  }

  /**
   * Validate security quality gate
   */
  private async validateSecurity(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    if (!context.securityCritical) {
      return 'skipped';
    }

    const securityResults = results.filter(r => r.agent === 'security-auditor');
    
    if (securityResults.length === 0) {
      return 'failed';
    }

    const criticalSecurityFindings = securityResults.reduce((count, result) => {
      return count + result.findings.filter(f => 
        f.severity === 'critical' && f.type.startsWith('security-')
      ).length;
    }, 0);

    const threshold = this.thresholds.security_critical_findings || 0;
    return criticalSecurityFindings <= threshold ? 'passed' : 'failed';
  }

  /**
   * Validate code quality gate
   */
  private async validateCodeQuality(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    const codeReviewResults = results.filter(r => r.agent === 'code-reviewer');
    
    if (codeReviewResults.length === 0) {
      return phase === 'red' ? 'skipped' : 'failed';
    }

    const qualityScore = codeReviewResults.reduce((score, result) => {
      const criticalIssues = result.findings.filter(f => f.severity === 'critical').length;
      const highIssues = result.findings.filter(f => f.severity === 'high').length;
      
      // Calculate quality score (0-100)
      const deductions = (criticalIssues * 20) + (highIssues * 10);
      return Math.max(0, score - deductions);
    }, 100);

    const threshold = this.thresholds.code_quality_score || 80;
    return qualityScore >= threshold ? 'passed' : 'failed';
  }

  /**
   * Validate test coverage quality gate
   */
  private async validateTestCoverage(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    if (phase === 'red') {
      return 'skipped'; // No coverage expected in red phase
    }

    const testResults = results.filter(r => r.agent === 'test');
    
    if (testResults.length === 0) {
      return 'failed';
    }

    const coverageMetrics = testResults.reduce((metrics, result) => {
      return {
        ...metrics,
        ...result.metrics
      };
    }, {} as Record<string, number>);

    const coverage = coverageMetrics['test_coverage'] || 0;
    const threshold = this.thresholds.test_coverage || 80;
    
    return coverage >= threshold ? 'passed' : 'failed';
  }

  /**
   * Validate performance quality gate
   */
  private async validatePerformance(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    if (phase === 'red') {
      return 'skipped'; // No performance testing in red phase
    }

    const performanceMetrics = results.reduce((metrics, result) => {
      return {
        ...metrics,
        ...result.metrics
      };
    }, {} as Record<string, number>);

    const responseTime = performanceMetrics['avg_response_time'] || 0;
    const threshold = this.thresholds.max_response_time || 1000;
    
    return responseTime <= threshold ? 'passed' : 'failed';
  }

  /**
   * Validate compliance quality gate
   */
  private async validateCompliance(
    phase: TDDPhase,
    results: AgentResult[],
    context: FeatureContext
  ): Promise<QualityGateStatus> {
    if (context.complianceRequirements.length === 0) {
      return 'skipped';
    }

    const complianceFindings = results.reduce((findings, result) => {
      return findings.concat(
        result.findings.filter(f => f.type === 'compliance')
      );
    }, [] as any[]);

    const criticalComplianceIssues = complianceFindings.filter(f => 
      f.severity === 'critical'
    ).length;

    const threshold = this.thresholds.compliance_critical_findings || 0;
    return criticalComplianceIssues <= threshold ? 'passed' : 'failed';
  }

  /**
   * Generate quality gate report
   */
  generateReport(gates: QualityGates, metrics: OrchestrationMetrics): string {
    const report = [
      '# Quality Gates Report',
      `**Feature:** ${metrics.feature}`,
      `**Workflow:** ${metrics.workflow}`,
      `**Timestamp:** ${metrics.timestamp.toISOString()}`,
      '',
      '## Quality Gate Results',
      ''
    ];

    Object.entries(gates).forEach(([gate, status]) => {
      const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
      report.push(`- ${emoji} **${gate}**: ${status.toUpperCase()}`);
    });

    report.push('');
    report.push('## Metrics');
    report.push('');

    const qualityMetrics = this.getQualityMetrics(gates);
    Object.entries(qualityMetrics).forEach(([metric, value]) => {
      report.push(`- **${metric}**: ${value}`);
    });

    return report.join('\n');
  }
}

/**
 * Default quality gate configuration
 */
export const defaultQualityGateConfig = {
  thresholds: {
    architecture_critical_findings: 0,
    security_critical_findings: 0,
    code_quality_score: 80,
    test_coverage: 80,
    max_response_time: 1000,
    compliance_critical_findings: 0
  },
  required: ['codeQuality', 'testCoverage'],
  optional: ['architecture', 'security', 'performance', 'compliance']
};