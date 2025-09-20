/**
 * TDD Orchestrator Tests
 *
 * Comprehensive test suite for the TDD Orchestrator to achieve
 * high test coverage and validate healthcare compliance integration.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentCoordinator } from '../src/agents/coordinator';
import { QualityGateValidator } from '../src/core/quality-gates';
import { TDDCycle } from '../src/core/tdd-cycle';
import {
  createTDDOrchestrationSystem,
  runTDDCycle,
  TDDOrchestrator,
  TDDOrchestratorConfig,
} from '../src/core/tdd-orchestrator';

// Mock dependencies
vi.mock('../src/core/tdd-cycle', () => ({
  TDDCycle: vi.fn().mockImplementation(() => ({
    redPhase: vi.fn().mockResolvedValue(true),
    greenPhase: vi.fn().mockResolvedValue(true),
    refactorPhase: vi.fn().mockResolvedValue(true),
    getResults: vi.fn().mockReturnValue({
      feature: 'test-feature',
      agents: ['tdd-orchestrator'],
      phases: { 'red-phase': true, 'green-phase': true, 'refactor-phase': true },
      success: true,
      currentPhase: 'COMPLETE',
    }),
    executePhase: vi.fn().mockResolvedValue({
      success: true,
      phase: 'red',
      output: 'Mock TDD phase executed',
      duration: 1000,
    }),
    validatePhase: vi.fn().mockReturnValue(true),
    getPhaseStatus: vi.fn().mockReturnValue('completed'),
  })),
}));

vi.mock('../src/agents/coordinator', () => ({
  AgentCoordinator: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue([
      { agent: 'agent1', result: { success: true } },
      { agent: 'agent2', result: { success: true } },
    ]),
    validate: vi.fn().mockReturnValue(true),
    getStatus: vi.fn().mockReturnValue('active'),
  })),
}));

vi.mock('../src/core/quality-gates', () => ({
  QualityGateValidator: vi.fn().mockImplementation(() => ({
    validateGates: vi.fn().mockReturnValue({
      passed: 3,
      total: 3,
      failures: [],
      results: [
        { gate: 'test-coverage', passed: true, score: 85 },
        { gate: 'code-quality', passed: true, score: 90 },
        { gate: 'security', passed: true, score: 95 },
      ],
    }),
    addGate: vi.fn(),
    removeGate: vi.fn(),
  })),
}));

describe('TDDOrchestrator', () => {
  let orchestrator: TDDOrchestrator;
  let mockConfig: TDDOrchestratorConfig;
  let mockTDDCycle: any;
  let mockAgentCoordinator: any;
  let mockQualityGateValidator: any;

  beforeEach(() => {
    // Setup mock implementations
    mockTDDCycle = {
      redPhase: vi.fn().mockResolvedValue(true),
      greenPhase: vi.fn().mockResolvedValue(true),
      refactorPhase: vi.fn().mockResolvedValue(true),
    };

    mockAgentCoordinator = {
      execute: vi.fn().mockResolvedValue([
        { agent: 'architect-review', success: true },
        { agent: 'code-reviewer', success: true },
        { agent: 'security-auditor', success: true },
      ]),
    };

    mockQualityGateValidator = {
      validateGates: vi.fn().mockReturnValue({
        results: [
          { gate: 'test-coverage', passed: true },
          { gate: 'code-quality-score', passed: true },
          { gate: 'security-vulnerabilities', passed: true },
          { gate: 'healthcare-compliance', passed: true },
        ],
      }),
    };

    // Mock constructor implementations - usar cast para acessar mocks
    (TDDCycle as any).mockImplementation(() => mockTDDCycle);
    (AgentCoordinator as any).mockImplementation(() => mockAgentCoordinator);
    (QualityGateValidator as any).mockImplementation(() => mockQualityGateValidator);

    mockConfig = {
      feature: 'patient-authentication',
      agents: ['architect-review', 'code-reviewer', 'security-auditor', 'tdd-orchestrator'],
      workflow: 'standard-tdd',
      coordination: 'sequential',
      qualityGates: ['coverage', 'complexity', 'security'],
      healthcareCompliance: true,
    };

    orchestrator = new TDDOrchestrator(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(orchestrator).toBeDefined();
      expect(TDDCycle).toHaveBeenCalledWith(mockConfig);
      expect(AgentCoordinator).toHaveBeenCalledWith({
        pattern: 'sequential',
        agents: ['architect-review', 'code-reviewer', 'security-auditor', 'tdd-orchestrator'],
        qualityGates: ['coverage', 'complexity', 'security'],
        timeout: 300000,
      });
    });

    it('should handle different coordination patterns', () => {
      const parallelConfig = { ...mockConfig, coordination: 'parallel' as const };
      const parallelOrchestrator = new TDDOrchestrator(parallelConfig);

      expect(parallelOrchestrator).toBeDefined();
      expect(AgentCoordinator).toHaveBeenCalledWith(
        expect.objectContaining({ pattern: 'parallel' }),
      );
    });
  });

  describe('orchestrate', () => {
    it('should complete successful TDD cycle', async () => {
      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(true);
      expect(result.phases.red.success).toBe(true);
      expect(result.phases.green.success).toBe(true);
      expect(result.phases.refactor.success).toBe(true);
      expect(result.qualityGates.passed).toBe(4);
      expect(result.qualityGates.total).toBe(4);
      expect(result.qualityGates.failures).toHaveLength(0);
      expect(result.healthcareCompliance).toEqual({
        lgpd: true,
        anvisa: true,
        cfm: true,
        overall: true,
      });
      expect(result.metrics.cycleCount).toBe(1);
      expect(result.metrics.totalDuration).toBeGreaterThan(0);
    });

    it('should handle RED phase failure', async () => {
      mockTDDCycle.redPhase.mockResolvedValue(false);

      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(false);
      expect(result.phases.red.success).toBe(false);
      expect(result.phases.green.success).toBe(false); // Should not execute
      expect(result.phases.refactor.success).toBe(false); // Should not execute
    });

    it('should handle GREEN phase failure', async () => {
      mockTDDCycle.greenPhase.mockResolvedValue(false);

      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(false);
      expect(result.phases.red.success).toBe(true);
      expect(result.phases.green.success).toBe(false);
      expect(result.phases.refactor.success).toBe(false); // Should not execute
    });

    it('should handle REFACTOR phase failure', async () => {
      mockTDDCycle.refactorPhase.mockResolvedValue(false);

      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(false);
      expect(result.phases.red.success).toBe(true);
      expect(result.phases.green.success).toBe(true);
      expect(result.phases.refactor.success).toBe(false);
    });

    it('should handle quality gate failures', async () => {
      mockQualityGateValidator.validateGates.mockReturnValue({
        results: [
          { gate: 'test-coverage', passed: false },
          { gate: 'code-quality-score', passed: true },
          { gate: 'security-vulnerabilities', passed: true },
          { gate: 'healthcare-compliance', passed: true },
        ],
      });

      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(false);
      expect(result.qualityGates.passed).toBe(3);
      expect(result.qualityGates.failures).toContain('test-coverage');
    });

    it('should handle agent coordination failures', async () => {
      mockAgentCoordinator.execute.mockRejectedValue(new Error('Agent coordination failed'));

      const result = await orchestrator.orchestrate();

      expect(result.success).toBe(false);
      expect(result.phases.red.success).toBe(false);
    });

    it('should work without healthcare compliance', async () => {
      const configWithoutCompliance = { ...mockConfig, healthcareCompliance: false };
      const orchestratorWithoutCompliance = new TDDOrchestrator(configWithoutCompliance);

      const result = await orchestratorWithoutCompliance.orchestrate();

      expect(result.success).toBe(true);
      expect(result.healthcareCompliance).toBeUndefined();
    });

    it('should handle different workflow types', async () => {
      const workflows = [
        'standard-tdd',
        'security-critical-tdd',
        'microservices-tdd',
        'legacy-tdd',
      ] as const;

      for (const workflow of workflows) {
        const config = { ...mockConfig, workflow };
        const testOrchestrator = new TDDOrchestrator(config);

        const result = await testOrchestrator.orchestrate();

        expect(result.success).toBe(true);
      }
    });
  });

  describe('executePhase', () => {
    it('should execute RED phase successfully', async () => {
      const result = await (orchestrator as any).executePhase('RED');

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.agents).toContain('architect-review');
      expect(mockTDDCycle.redPhase).toHaveBeenCalled();
    });

    it('should execute GREEN phase successfully', async () => {
      const result = await (orchestrator as any).executePhase('GREEN');

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
      expect(mockTDDCycle.greenPhase).toHaveBeenCalled();
    });

    it('should execute REFACTOR phase successfully', async () => {
      const result = await (orchestrator as any).executePhase('REFACTOR');

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
      expect(mockTDDCycle.refactorPhase).toHaveBeenCalled();
    });

    it('should handle phase execution errors', async () => {
      mockTDDCycle.redPhase.mockRejectedValue(new Error('Phase execution failed'));

      const result = await (orchestrator as any).executePhase('RED');

      expect(result.success).toBe(false);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.agents).toHaveLength(0);
    });
  });

  describe('validateQualityGates', () => {
    it('should validate all quality gates', async () => {
      const result = await (orchestrator as any).validateQualityGates();

      expect(result.passed).toBe(4);
      expect(result.total).toBe(4);
      expect(result.failures).toHaveLength(0);
      expect(mockQualityGateValidator.validateGates).toHaveBeenCalledWith({
        'test-coverage': 95,
        'code-quality-score': 85,
        'security-vulnerabilities': 0,
        'healthcare-compliance': 100,
      });
    });

    it('should identify failing gates', async () => {
      mockQualityGateValidator.validateGates.mockReturnValue({
        results: [
          { gate: 'test-coverage', passed: false },
          { gate: 'code-quality-score', passed: true },
        ],
      });

      const result = await (orchestrator as any).validateQualityGates();

      expect(result.passed).toBe(1);
      expect(result.total).toBe(2);
      expect(result.failures).toContain('test-coverage');
    });
  });

  describe('validateHealthcareCompliance', () => {
    it('should validate healthcare compliance', async () => {
      const result = await (orchestrator as any).validateHealthcareCompliance();

      expect(result).toEqual({
        lgpd: true,
        anvisa: true,
        cfm: true,
        overall: true,
      });
    });
  });
});

describe('createTDDOrchestrationSystem', () => {
  it('should create orchestrator instance', () => {
    const config: TDDOrchestratorConfig = {
      feature: 'test-feature',
      agents: ['code-reviewer'],
      workflow: 'standard-tdd',
      coordination: 'sequential',
      qualityGates: ['coverage'],
    };

    const orchestrator = createTDDOrchestrationSystem(config);

    expect(orchestrator).toBeInstanceOf(TDDOrchestrator);
  });
});

describe('runTDDCycle', () => {
  it('should run complete TDD cycle with default config', async () => {
    // Create a real orchestrator for integration test
    const result = await runTDDCycle('integration-test-feature');

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.phases).toBeDefined();
    expect(result.qualityGates).toBeDefined();
    expect(result.metrics).toBeDefined();
  });

  it('should run TDD cycle with custom options', async () => {
    const options: Partial<TDDOrchestratorConfig> = {
      workflow: 'security-critical-tdd',
      healthcareCompliance: true,
      coordination: 'parallel',
    };

    const result = await runTDDCycle('security-feature', options);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.phases).toBeDefined();
  });
});
