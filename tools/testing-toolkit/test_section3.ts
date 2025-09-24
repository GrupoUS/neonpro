  it('returns failure details when agent execution throws', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['tdd-orchestrator'],
      qualityGates: [],
    });
    vi.spyOn(coordinator as any, 'validateQualityGates').mockRejectedValueOnce(
      new Error('boom')
    );

    const results = await coordinator.execute();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.success).toBe(false);
    expect(results[0]?.issues[0]).toContain('Agent execution failed');
    expect(coordinator.getSummary().success).toBe(false);
  }

  it('computes success using quality gate thresholds', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'sequential',
      agents: ['test-auditor'],
      qualityGates: [],
    });

    const evaluateSuccess = (coordinator as any).evaluateSuccess.bind(
      coordinator
    );

