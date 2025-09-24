    const architectMetrics = await (coordinator as any).validateQualityGates(
      'architect-review'
    );

    expect(architectMetrics).toMatchObject({ patterns: 30, boundaries: 45 });
    expect(architectMetrics.scalability).toBeCloseTo(55, 5);

    const tddMetrics = await (coordinator as any).validateQualityGates(
      'tdd-orchestrator'
    );

    expect(tddMetrics).toMatchObject({ patterns: 75, coverage: 65 });
    expect(tddMetrics.structure).toBeCloseTo(85, 5);

    randomSpy.mockRestore();
  }

  it('produces recommendations when specialties are below threshold', () => {
    const coordinator = new AgentCoordinator({
      pattern: 'parallel',
      agents: ['code-reviewer'],
      qualityGates: [],
    });

    const generateRecommendations = (
      coordinator as any
