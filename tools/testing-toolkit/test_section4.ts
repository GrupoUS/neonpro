
    expect(
      evaluateSuccess('test-auditor', {
        compliance: 100,
        vulnerabilities: 0,
        authentication: 100,
      }),
    ).toBe(true);

    expect(
      evaluateSuccess('test-auditor', {
        compliance: 80,
        vulnerabilities: 2,
        authentication: 70,
      }),
    ).toBe(false);
  }

  it('returns deterministic metrics for quality gates based on agent type', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: [
        'code-reviewer',
        'test-auditor',
        'architect-review',
        'tdd-orchestrator',
