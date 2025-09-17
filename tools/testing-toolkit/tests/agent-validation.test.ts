import { afterEach, describe, expect, it } from 'vitest';
import { QUALITY_GATES } from '../src/agents';
import {
  generateAgentRecommendations,
  validateAgentMetrics,
  validateHealthcareCompliance,
  validateTDDCycle,
} from '../src/agents/validation';

describe('Agent validation utilities', () => {
  const gates = QUALITY_GATES as unknown as Record<string, any>;

  afterEach(() => {
    delete gates.CODE_REVIEWER;
    delete gates.SECURITY_AUDITOR;
  });

  it('identifies failing metrics and computes score', () => {
    gates.CODE_REVIEWER = { quality: 85, performance: 80, maintainability: 85 };

    const result = validateAgentMetrics('code-reviewer', {
      quality: 70,
      performance: 90,
      maintainability: 60,
    });

    expect(result.passed).toBe(false);
    expect(result.failures).toContain('quality: 70 below threshold of 85');
    expect(result.failures).toContain('maintainability: 60 below threshold of 85');
    expect(result.score).toBeLessThan(100);
  });

  it('applies vulnerability threshold with lower-is-better logic', () => {
    gates.SECURITY_AUDITOR = { compliance: 95, vulnerabilities: 0, authentication: 100 };

    const result = validateAgentMetrics('security-auditor', {
      compliance: 100,
      vulnerabilities: 2,
      authentication: 90,
    });

    expect(result.passed).toBe(false);
    expect(result.failures).toContain('vulnerabilities: 2 exceeds threshold of 0');
  });

  it('returns default passing result when no gate configured', () => {
    const result = validateAgentMetrics('architect-review', { patterns: 50 });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it('validates TDD cycle phases', () => {
    const failing = validateTDDCycle({ 'red-phase': true });
    expect(failing.compliant).toBe(false);
    expect(failing.missingPhases).toContain('green-phase');
    const passing = validateTDDCycle({
      'red-phase': true,
      'green-phase': true,
      'refactor-phase': true,
    });

    expect(passing.compliant).toBe(true);
    expect(passing.completionRate).toBe(100);
  });

  it('evaluates healthcare compliance risk levels', () => {
    const result = validateHealthcareCompliance({
      consentGiven: false,
      dataProcessingPurpose: '',
      auditTrail: [],
    });

    expect(result.compliant).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.riskLevel).toBe('critical');
  });

  it('generates targeted recommendations from validation results', () => {
    const validation = {
      passed: false,
      failures: ['patterns: 60 below threshold', 'coverage: 70 below threshold'],
      score: 68,
    };
    const recommendations = generateAgentRecommendations(
      'tdd-orchestrator',
      { patterns: 60, coverage: 70, structure: 95 },
      validation,
    );

    expect(recommendations).toContain('Follow TDD patterns more consistently');
    expect(recommendations).toContain('Increase test coverage for critical paths');
    expect(recommendations).toContain(
      'tdd-orchestrator requires significant improvement (score: 68%)',
    );
  });

  it('passes when optional metrics are missing', () => {
    const result = validateAgentMetrics('code-reviewer', { quality: 90 });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('defaults to success when no quality gate is defined', () => {
    const result = validateAgentMetrics('architect-review' as any, { quality: 90 });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });
  it('returns perfect score when no metrics provided', () => {
    const result = validateAgentMetrics('code-reviewer', {});
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });
  it('sets critical risk when consent or audit trail missing', () => {
    const result = validateHealthcareCompliance({
      consentGiven: false,
      dataProcessingPurpose: '',
      auditTrail: [],
    });
    expect(result.compliant).toBe(false);
    expect(result.riskLevel).toBe('critical');
  });

  it('sets medium risk when only data purpose missing', () => {
    const result = validateHealthcareCompliance({
      consentGiven: true,
      dataProcessingPurpose: '',
      auditTrail: [
        { timestamp: new Date(), action: 'read', userId: 'user', dataType: 'personal', purpose: 'care' },
      ],
      incidentReports: [
        { id: 'incident-200', resolved: true, timestamp: new Date() },
      ],
      dataRetentionPolicy: 'Retain for 5 years',
    });
    expect(result.compliant).toBe(false);
    expect(result.riskLevel).toBe('medium');
  });
  it('handles vulnerabilities below threshold without failures', () => {
    const result = validateAgentMetrics('security-auditor', {
      compliance: 100,
      vulnerabilities: 0,
      authentication: 100,
    });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('skips recommendations when validation passes', () => {
    const metrics = { quality: 90, performance: 90, maintainability: 90 };
    const validation = validateAgentMetrics('code-reviewer', metrics);
    const recommendations = generateAgentRecommendations('code-reviewer', metrics, validation);
    expect(recommendations).toHaveLength(0);
  });

});
  it('suggests minor improvements when score is moderate', () => {
    const validation = {
      passed: false,
      failures: ['performance: 78 below threshold'],
      score: 80,
    };
    const recommendations = generateAgentRecommendations(
      'code-reviewer',
      { quality: 90, performance: 78, maintainability: 90 },
      validation,
    );

    expect(recommendations).toContain('code-reviewer needs minor improvements (score: 80%)');
  });
  it('sets high risk when multiple non-critical violations occur', () => {
    const result = validateHealthcareCompliance({
      consentGiven: true,
      dataProcessingPurpose: '',
      auditTrail: [
        { timestamp: new Date(), action: 'read', userId: 'user', dataType: 'personal', purpose: 'care' },
      ],
      incidentReports: [],
      dataRetentionPolicy: '',
    });

    expect(result.compliant).toBe(false);
    expect(result.riskLevel).toBe('high');
  });
