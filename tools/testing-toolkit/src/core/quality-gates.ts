/**
 * Quality Gates Implementation
 *
 * Implements quality gates for testing with configurable thresholds
 * and validation rules.
 */

import type { QualityGateResult } from './types';

export interface QualityGateConfig {
  name: string;
  threshold: number;
  critical: boolean;
  description: string;
}

export const DEFAULT_QUALITY_GATES: QualityGateConfig[] = [
  {
    name: 'test-coverage',
    threshold: 85,
    critical: true,
    description: 'Minimum test coverage percentage',
  },
  {
    name: 'performance-budget',
    threshold: 1000,
    critical: false,
    description: 'Maximum test execution time in milliseconds',
  },
  {
    name: 'security-vulnerabilities',
    threshold: 0,
    critical: true,
    description: 'Maximum number of critical security vulnerabilities',
  },
  {
    name: 'code-quality-score',
    threshold: 80,
    critical: false,
    description: 'Minimum code quality score',
  },
  {
    name: 'healthcare-compliance',
    threshold: 100,
    critical: true,
    description: 'Healthcare compliance score (LGPD, ANVISA, CFM)',
  },
];

export class QualityGateValidator {
  private gates: QualityGateConfig[];

  constructor(gates: QualityGateConfig[] = DEFAULT_QUALITY_GATES) {
    this.gates = gates;
  }

  /**
   * Validate a single quality gate
   */
  validateGate(gateName: string, actualValue: number): QualityGateResult {
    const gate = this.gates.find(g => g.name === gateName);

    if (!gate) {
      throw new Error(`Quality gate '${gateName}' not found`);
    }

    let passed: boolean;

    // Special handling for different gate types
    if (gateName === 'security-vulnerabilities') {
      // Lower is better for vulnerabilities
      passed = actualValue <= gate.threshold;
    } else if (gateName === 'performance-budget') {
      // Lower is better for performance
      passed = actualValue <= gate.threshold;
    } else {
      // Higher is better for most metrics
      passed = actualValue >= gate.threshold;
    }

    return {
      gate: gateName,
      passed,
      actual: actualValue,
      expected: gate.threshold,
      critical: gate.critical,
    };
  }

  /**
   * Validate multiple quality gates
   */
  validateGates(metrics: Record<string, number>): {
    results: QualityGateResult[];
    passed: boolean;
    criticalFailures: QualityGateResult[];
    summary: string;
  } {
    const results: QualityGateResult[] = [];

    Object.entries(metrics).forEach(([gateName, value]) => {
      try {
        const result = this.validateGate(gateName, value);
        results.push(result);
      } catch {
        console.warn(`Skipping unknown quality gate: ${gateName}`);
      }
    });

    const failedResults = results.filter(r => !r.passed);
    const criticalFailures = failedResults.filter(r => r.critical);
    const passed = criticalFailures.length === 0;

    const summary = passed
      ? `All quality gates passed (${results.length} gates checked)`
      : `${criticalFailures.length} critical failures, ${failedResults.length} total failures`;

    return {
      results,
      passed,
      criticalFailures,
      summary,
    };
  }

  /**
   * Add or update a quality gate
   */
  addGate(gate: QualityGateConfig): void {
    const existingIndex = this.gates.findIndex(g => g.name === gate.name);

    if (existingIndex >= 0) {
      this.gates[existingIndex] = gate;
    } else {
      this.gates.push(gate);
    }
  }

  /**
   * Get all configured gates
   */
  getGates(): QualityGateConfig[] {
    return [...this.gates];
  }

  /**
   * Generate quality gate report
   */
  generateReport(results: QualityGateResult[]): string {
    const lines: string[] = [];
    lines.push('Quality Gates Report');
    lines.push('==================');
    lines.push('');

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const critical = result.critical ? ' (CRITICAL)' : '';
      lines.push(`${status} ${result.gate}${critical}`);
      lines.push(`  Expected: ${result.expected}, Actual: ${result.actual}`);
      lines.push('');
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const criticalFailures = results.filter(r => !r.passed && r.critical).length;

    lines.push(`Summary: ${passedCount}/${totalCount} gates passed`);
    if (criticalFailures > 0) {
      lines.push(`⚠️  ${criticalFailures} critical failures detected`);
    }

    return lines.join('\n');
  }
}
