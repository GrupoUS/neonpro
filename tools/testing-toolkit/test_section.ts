    expect(summary.summary).toBe('0/1 agents successful');
    expect(summary.results['architect-review']?.recommendations).toContain(
      'Improve patterns metrics for architect-review'
    );
  });

  it('executes agents in parallel and aggregates results', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer', 'test-auditor'],
      qualityGates: [],
    });

    vi.spyOn(coordinator as any, 'validateQualityGates').mockImplementation(
      async (...args: any[]) => {
        const agent = args[0] as string;
        if (agent === 'code-reviewer') {
          return { quality: 90, performance: 85, maintainability: 90 };
        }

        return { compliance: 100, vulnerabilities: 0, authentication: 100 };
      }
    );

    const results = await coordinator.execute();
    expect(results).toHaveLength(2);
    expect(results.every(result => result.success)).toBe(true);

    const summary = coordinator.getSummary();
    expect(summary.success).toBe(true);
    expect(summary.successRate).toBe(100);

    const codeReviewer = summary.results['code-reviewer'];
    expect(codeReviewer?.recommendations).toEqual([]);
    const securityAuditor = summary.results['test-auditor'];
    expect(securityAuditor?.metrics.vulnerabilities).toBe(0);
  }

  it('throws when hierarchical coordination lacks a primary agent', async () => {
    const coordinator = new AgentCoordinator({
      pattern: 'hierarchical',
      agents: [],
      qualityGates: [],
