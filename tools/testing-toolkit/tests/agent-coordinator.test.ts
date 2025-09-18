import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgentCoordinator } from '../src/agents';

function mockRandomSequence(values: number[]) {
  let index = 0;
  return vi.spyOn(Math, 'random').mockImplementation(() => {
    const value = values[index] ?? values[values.length - 1] ?? 0.99;
    index += 1;
    return value;
  });
}

describe('AgentCoordinator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stops sequential coordination when fail-fast gate triggers', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['architect-review', 'code-reviewer'],
      qualityGates: ['fail-fast'],
    });

    const validateSpy = vi
      .spyOn(coordinator as any, 'validateQualityGates')
      .mockResolvedValueOnce({ patterns: 60, scalability: 55, design: 50 });

    const results = await coordinator.execute();
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0]?.issues).toContain('Quality gates not met for architect-review');

    const summary = coordinator.getSummary();
    expect(summary.success).toBe(false);
    expect(summary.summary).toBe('0/1 agents successful');
    expect(summary.results['architect-review']?.recommendations).toContain(
      'Improve patterns metrics for architect-review',
    );
  });

  it('executes agents in parallel and aggregates results', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer', 'security-auditor'],
      qualityGates: [],
    });

    vi.spyOn(coordinator as any, 'validateQualityGates').mockImplementation(
      async (...args: any[]) => {
        const agent = args[0] as string;
        if (agent === 'code-reviewer') {
          return { quality: 90, performance: 85, maintainability: 90 };
        }

        return { compliance: 100, vulnerabilities: 0, authentication: 100 };
      },
    );

    const results = await coordinator.execute();
    expect(results).toHaveLength(2);
    expect(results.every(result => result.success)).toBe(true);

    const summary = coordinator.getSummary();
    expect(summary.success).toBe(true);
    expect(summary.successRate).toBe(100);

    const codeReviewer = summary.results['code-reviewer'];
    expect(codeReviewer?.recommendations).toEqual([]);
    const securityAuditor = summary.results['security-auditor'];
    expect(securityAuditor?.metrics.vulnerabilities).toBe(0);
  });

  it('throws when hierarchical coordination lacks a primary agent', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'hierarchical',
      agents: [],
      qualityGates: [],
    });

    await expect(coordinator.execute()).rejects.toThrow(
      'No primary agent specified for hierarchical execution',
    );
  });

  it('returns failure details when agent execution throws', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['tdd-orchestrator'],
      qualityGates: [],
    });
    vi.spyOn(coordinator as any, 'validateQualityGates').mockRejectedValueOnce(new Error('boom'));

    const results = await coordinator.execute();

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.success).toBe(false);
    expect(results[0]?.issues[0]).toContain('Agent execution failed');
    expect(coordinator.getSummary().success).toBe(false);
  });

  it('computes success using quality gate thresholds', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['security-auditor'],
      qualityGates: [],
    });

    const evaluateSuccess = (coordinator as any).evaluateSuccess.bind(coordinator);

    expect(
      evaluateSuccess('security-auditor', {
        compliance: 100,
        vulnerabilities: 0,
        authentication: 100,
      }),
    ).toBe(true);

    expect(
      evaluateSuccess('security-auditor', {
        compliance: 80,
        vulnerabilities: 2,
        authentication: 70,
      }),
    ).toBe(false);
  });

  it('returns deterministic metrics for quality gates based on agent type', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer', 'security-auditor', 'architect-review', 'tdd-orchestrator'],
      qualityGates: [],
    });

    const randomSpy = mockRandomSequence([
      0.6, 0.8, 0.9, // code-reviewer metrics
      0.99, 0.04, 0.92, // security-auditor metrics (vulnerabilities should be 0)
      0.3, 0.45, 0.55, // architect-review metrics
      0.75, 0.65, 0.85, // tdd-orchestrator metrics
    ]);

    const codeMetrics = await (coordinator as any).validateQualityGates('code-reviewer');
    expect(codeMetrics).toEqual({ quality: 60, performance: 80, maintainability: 90 });

    const securityMetrics = await (coordinator as any).validateQualityGates('security-auditor');
    expect(securityMetrics).toEqual({ compliance: 99, vulnerabilities: 0, authentication: 92 });

    const architectMetrics = await (coordinator as any).validateQualityGates('architect-review');
    expect(architectMetrics).toMatchObject({ patterns: 30, boundaries: 45 });
    expect(architectMetrics.scalability).toBeCloseTo(55, 5);

    const tddMetrics = await (coordinator as any).validateQualityGates('tdd-orchestrator');
    expect(tddMetrics).toMatchObject({ patterns: 75, coverage: 65 });
    expect(tddMetrics.structure).toBeCloseTo(85, 5);

    randomSpy.mockRestore();
  });

  it('produces recommendations when specialties are below threshold', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer'],
      qualityGates: [],
    });

    const generateRecommendations = (coordinator as any).generateRecommendations.bind(coordinator);
    const recommendations = generateRecommendations('code-reviewer', {
      quality: 60,
      performance: 70,
      maintainability: 90,
    });

    expect(recommendations).toContain('Improve quality metrics for code-reviewer');
    expect(recommendations).toContain('Improve performance metrics for code-reviewer');
  });

  it('executes hierarchical coordination with support agents', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'hierarchical',
      agents: ['architect-review', 'tdd-orchestrator'],
      qualityGates: [],
    });

    vi.spyOn(coordinator as any, 'validateQualityGates').mockImplementation(
      async (...args: any[]) => {
        const agent = args[0] as string;
        if (agent === 'architect-review') {
          return { patterns: 95, boundaries: 92, scalability: 88 };
        }
        return { patterns: 90, coverage: 91, structure: 96 };
      },
    );

    const results = await coordinator.execute();

    expect(results).toHaveLength(2);
    expect(results.every(result => result.success)).toBe(true);

    const summary = coordinator.getSummary();
    expect(summary.pattern).toBe('hierarchical');
    expect(summary.successRate).toBe(100);
    expect(summary.results['architect-review']?.metrics.patterns).toBeGreaterThanOrEqual(90);
  });

  it('treats missing metrics as passing when thresholds are undefined', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['security-auditor'],
      qualityGates: [],
    });

    const evaluateSuccess = (coordinator as any).evaluateSuccess.bind(coordinator);
    expect(
      evaluateSuccess('security-auditor', {
        compliance: 100,
      }),
    ).toBe(true);
  });

  it('returns success when agent has no quality gate definition', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['security-auditor'],
      qualityGates: [],
    });

    const evaluateSuccess = (coordinator as any).evaluateSuccess.bind(coordinator);
    expect(evaluateSuccess('unknown-agent' as any, {})).toBe(true);
  });

});
