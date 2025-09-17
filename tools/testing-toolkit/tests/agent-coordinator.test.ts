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

    vi.spyOn(coordinator as any, 'evaluateSuccess').mockReturnValueOnce(false);

    const results = await coordinator.execute();
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0].issues).toContain('Quality gates not met for architect-review');

    const summary = coordinator.getSummary();
    expect(summary.success).toBe(false);
    expect(summary.summary).toBe('0/1 agents successful');
    expect(summary.results['architect-review'].recommendations).toContain(
      'Improve patterns metrics for architect-review',
    );
  });

  it('executes agents in parallel and aggregates results', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer', 'security-auditor'],
      qualityGates: [],
    });

    const randomSpy = mockRandomSequence([0.92, 0.88, 0.96, 0.95, 0.0, 0.97]);

    const results = await coordinator.execute();
    expect(randomSpy).toHaveBeenCalled();
    expect(results).toHaveLength(2);
    expect(results.every(result => result.success)).toBe(true);

    const summary = coordinator.getSummary();
    expect(summary.success).toBe(true);
    expect(summary.successRate).toBe(100);

    const codeReviewer = summary.results['code-reviewer'];
    expect(codeReviewer.recommendations).toEqual([]);
    const securityAuditor = summary.results['security-auditor'];
    expect(securityAuditor.metrics.vulnerabilities).toBe(0);
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

    expect(results[0].success).toBe(false);
    expect(results[0].issues[0]).toContain('Agent execution failed');
    expect(coordinator.getSummary().success).toBe(false);
  });
});
