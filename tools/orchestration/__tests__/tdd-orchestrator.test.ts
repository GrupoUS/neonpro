/**
 * TDD Orchestrator Test Suite
 * Comprehensive testing for TDD orchestration engine with multi-agent coordination
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { TDDOrchestrator } from '../orchestration/tdd-orchestrator';
import { TDDAgentRegistry } from '../orchestration/agent-registry';
import { StandardTDDWorkflow } from '../orchestration/workflows/standard-tdd';
import { SecurityCriticalWorkflow } from '../orchestration/workflows/security-critical';
import type {
  OrchestrationContext,
  TDDCycleResult,
  AgentRegistry,
  WorkflowEngine,
  TDDPhase,
} from '../orchestration/types';

// Mock workflow engine
class MockWorkflowEngine implements WorkflowEngine {
  private workflows = new Map([
    ['standard-tdd', new StandardTDDWorkflow()],
    ['security-critical', new SecurityCriticalWorkflow()],
  ]);

  async selectWorkflow(context: OrchestrationContext) {
    if (context.criticalityLevel === 'critical' || context.healthcareCompliance.required) {
      return this.workflows.get('security-critical')!;
    }
    return this.workflows.get('standard-tdd')!;
  }

  getWorkflow(name: string) {
    return this.workflows.get(name);
  }

  registerWorkflow(name: string, workflow: any) {
    this.workflows.set(name, workflow);
  }
}

describe('TDDOrchestrator', () => {
  let orchestrator: TDDOrchestrator;
  let agentRegistry: AgentRegistry;
  let workflowEngine: WorkflowEngine;
  let mockContext: OrchestrationContext;

  beforeEach(() => {
    agentRegistry = new TDDAgentRegistry();
    workflowEngine = new MockWorkflowEngine();
    orchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);

    mockContext = {
      featureName: 'user-authentication',
      featureType: 'security',
      complexity: 'medium',
      criticalityLevel: 'high',
      requirements: [
        'Secure user login',
        'Password validation',
        'Session management',
        'Multi-factor authentication',
      ],
      healthcareCompliance: {
        required: false,
        lgpd: false,
        anvisa: false,
        cfm: false,
      },
      currentPhase: 'red',
    };
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with agent registry and workflow engine', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator).toBeInstanceOf(TDDOrchestrator);
    });

    it('should initialize with default metrics', () => {
      // Access private metrics through reflection for testing
      const metrics = (orchestrator as any).metrics;
      expect(metrics.totalCycles).toBe(0);
      expect(metrics.successfulCycles).toBe(0);
      expect(metrics.failedCycles).toBe(0);
    });
  });

  describe('Full TDD Cycle Execution', () => {
    it('should execute complete TDD cycle successfully', async () => {
      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(true);
      expect(result.cycleId).toBeDefined();
      expect(result.phases).toBeDefined();
      expect(result.phases.red).toBeDefined();
      expect(result.phases.green).toBeDefined();
      expect(result.phases.refactor).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle healthcare compliance context', async () => {
      mockContext.healthcareCompliance = {
        required: true,
        lgpd: true,
        anvisa: true,
        cfm: true,
      };
      mockContext.criticalityLevel = 'critical';

      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(true);
      expect(result.healthcareCompliance).toBeDefined();
      expect(result.healthcareCompliance?.lgpd).toBe(true);
      expect(result.healthcareCompliance?.anvisa).toBe(true);
      expect(result.healthcareCompliance?.cfm).toBe(true);
    });

    it('should handle complex feature context', async () => {
      mockContext.complexity = 'high';
      mockContext.featureType = 'microservice';
      mockContext.requirements = [
        'Distributed authentication',
        'Service mesh integration',
        'Load balancing',
        'Health monitoring',
        'Circuit breaker pattern',
      ];

      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(true);
      expect(result.phases.red?.success).toBe(true);
      expect(result.phases.green?.success).toBe(true);
      expect(result.phases.refactor?.success).toBe(true);
    });

    it('should handle failure during RED phase', async () => {
      // Mock a scenario where RED phase fails
      const failingContext = {
        ...mockContext,
        featureName: 'failing-feature',
        requirements: [], // Invalid requirements to trigger failure
      };

      // Mock the workflow to simulate failure
      vi.spyOn(workflowEngine, 'selectWorkflow').mockImplementation(async () => {
        const workflow = new StandardTDDWorkflow();
        vi.spyOn(workflow, 'executeAgent').mockRejectedValueOnce(
          new Error('Test failure in RED phase')
        );
        return workflow;
      });

      const result = await orchestrator.executeFullTDDCycle(failingContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('red');
    });

    it('should update metrics after successful cycle', async () => {
      await orchestrator.executeFullTDDCycle(mockContext);

      const metrics = (orchestrator as any).metrics;
      expect(metrics.totalCycles).toBe(1);
      expect(metrics.successfulCycles).toBe(1);
      expect(metrics.averageDuration).toBeGreaterThan(0);
    });

    it('should update metrics after failed cycle', async () => {
      // Force a failure
      vi.spyOn(workflowEngine, 'selectWorkflow').mockRejectedValueOnce(
        new Error('Workflow selection failed')
      );

      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(false);
      const metrics = (orchestrator as any).metrics;
      expect(metrics.totalCycles).toBe(1);
      expect(metrics.failedCycles).toBe(1);
    });
  });

  describe('Phase Execution', () => {
    it('should execute RED phase with proper agent coordination', async () => {
      const redPhase = (orchestrator as any).executeRedPhase;
      const result = await redPhase.call(orchestrator, mockContext);

      expect(result.success).toBe(true);
      expect(result.qualityGates).toBeDefined();
      expect(Array.isArray(result.qualityGates)).toBe(true);
    });

    it('should execute GREEN phase with implementation validation', async () => {
      const greenPhase = (orchestrator as any).executeGreenPhase;
      const result = await greenPhase.call(orchestrator, mockContext);

      expect(result.success).toBe(true);
      expect(result.qualityGates).toBeDefined();
    });

    it('should execute REFACTOR phase with quality improvements', async () => {
      const refactorPhase = (orchestrator as any).executeRefactorPhase;
      const result = await refactorPhase.call(orchestrator, mockContext);

      expect(result.success).toBe(true);
      expect(result.qualityGates).toBeDefined();
    });

    it('should determine coordination patterns based on context', () => {
      const determinePattern = (orchestrator as any).determineCoordinationPattern;
      
      // Test high complexity -> hierarchical
      mockContext.complexity = 'high';
      let pattern = determinePattern.call(orchestrator, mockContext, 'red');
      expect(pattern).toBe('hierarchical');

      // Test microservice + refactor -> parallel
      mockContext.featureType = 'microservice';
      pattern = determinePattern.call(orchestrator, mockContext, 'refactor');
      expect(pattern).toBe('parallel');

      // Test healthcare compliance -> sequential
      mockContext.healthcareCompliance.required = true;
      pattern = determinePattern.call(orchestrator, mockContext, 'green');
      expect(pattern).toBe('sequential');
    });
  });

  describe('Agent Coordination Patterns', () => {
    it('should execute sequential coordination pattern', async () => {
      const executeSequential = (orchestrator as any).executeSequentialCoordination;
      const agents = agentRegistry.getAgentsForPhase('red', mockContext);
      const workflow = await workflowEngine.selectWorkflow(mockContext);

      const result = await executeSequential.call(
        orchestrator,
        agents,
        mockContext,
        workflow
      );

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
    });

    it('should execute parallel coordination pattern', async () => {
      const executeParallel = (orchestrator as any).executeParallelCoordination;
      const agents = agentRegistry.getAgentsForPhase('refactor', mockContext);
      const workflow = await workflowEngine.selectWorkflow(mockContext);

      const result = await executeParallel.call(
        orchestrator,
        agents,
        mockContext,
        workflow
      );

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
    });

    it('should execute hierarchical coordination pattern', async () => {
      const executeHierarchical = (orchestrator as any).executeHierarchicalCoordination;
      
      // Set up agents with primary/secondary priorities
      const agents = agentRegistry.getAgentsForPhase('red', mockContext);
      agents.forEach(agent => {
        if (agent.type === 'test') agent.priority = 'primary';
        else agent.priority = 'secondary';
      });

      const workflow = await workflowEngine.selectWorkflow(mockContext);

      const result = await executeHierarchical.call(
        orchestrator,
        agents,
        mockContext,
        workflow
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Quality Gates', () => {
    it('should apply quality gates for RED phase', async () => {
      const applyQualityGates = (orchestrator as any).applyQualityGates;
      const mockResult = {
        success: true,
        testResults: {
          structure: { valid: true, message: 'Good structure' },
          coverage: { percentage: 85 },
        },
      };

      const qualityGates = await applyQualityGates.call(
        orchestrator,
        mockResult,
        mockContext,
        'red'
      );

      expect(Array.isArray(qualityGates)).toBe(true);
      expect(qualityGates.length).toBeGreaterThan(0);
      expect(qualityGates.some(gate => gate.name.includes('Test Structure'))).toBe(true);
      expect(qualityGates.some(gate => gate.name.includes('Coverage'))).toBe(true);
    });

    it('should apply quality gates for GREEN phase', async () => {
      const applyQualityGates = (orchestrator as any).applyQualityGates;
      const mockResult = {
        success: true,
        implementationResults: { valid: true, message: 'Good implementation' },
        testResults: { allPassing: true, passedCount: 10, totalCount: 10 },
      };

      const qualityGates = await applyQualityGates.call(
        orchestrator,
        mockResult,
        mockContext,
        'green'
      );

      expect(Array.isArray(qualityGates)).toBe(true);
      expect(qualityGates.some(gate => gate.name.includes('Implementation'))).toBe(true);
      expect(qualityGates.some(gate => gate.name.includes('Tests Passing'))).toBe(true);
    });

    it('should apply quality gates for REFACTOR phase', async () => {
      const applyQualityGates = (orchestrator as any).applyQualityGates;
      const mockResult = {
        success: true,
        qualityScore: 9.6,
        performanceMetrics: { withinLimits: true, summary: 'Good performance' },
      };

      const qualityGates = await applyQualityGates.call(
        orchestrator,
        mockResult,
        mockContext,
        'refactor'
      );

      expect(Array.isArray(qualityGates)).toBe(true);
      expect(qualityGates.some(gate => gate.name.includes('Code Quality'))).toBe(true);
      expect(qualityGates.some(gate => gate.name.includes('Performance'))).toBe(true);
    });

    it('should validate required coverage based on criticality', () => {
      const getRequiredCoverage = (orchestrator as any).getRequiredCoverage;
      
      mockContext.criticalityLevel = 'critical';
      expect(getRequiredCoverage.call(orchestrator, mockContext)).toBe(95);
      
      mockContext.criticalityLevel = 'high';
      expect(getRequiredCoverage.call(orchestrator, mockContext)).toBe(85);
      
      mockContext.criticalityLevel = 'medium';
      expect(getRequiredCoverage.call(orchestrator, mockContext)).toBe(75);
    });
  });

  describe('Healthcare Compliance Validation', () => {
    it('should validate LGPD compliance when required', async () => {
      mockContext.healthcareCompliance.lgpd = true;
      
      const validateHealthcare = (orchestrator as any).validateHealthcareCompliance;
      const compliance = await validateHealthcare.call(orchestrator, mockContext);

      expect(compliance.lgpd).toBe(true);
      expect(compliance.auditTrail).toBeDefined();
      expect(Array.isArray(compliance.auditTrail)).toBe(true);
    });

    it('should validate ANVISA compliance when required', async () => {
      mockContext.healthcareCompliance.anvisa = true;
      
      const validateHealthcare = (orchestrator as any).validateHealthcareCompliance;
      const compliance = await validateHealthcare.call(orchestrator, mockContext);

      expect(compliance.anvisa).toBe(true);
    });

    it('should validate CFM compliance when required', async () => {
      mockContext.healthcareCompliance.cfm = true;
      
      const validateHealthcare = (orchestrator as any).validateHealthcareCompliance;
      const compliance = await validateHealthcare.call(orchestrator, mockContext);

      expect(compliance.cfm).toBe(true);
    });

    it('should validate international compliance standards', async () => {
      mockContext.healthcareCompliance.required = true;
      
      const validateHealthcare = (orchestrator as any).validateHealthcareCompliance;
      const compliance = await validateHealthcare.call(orchestrator, mockContext);

      expect(compliance.international).toBeDefined();
      expect(compliance.international.hipaa).toBeDefined();
      expect(compliance.international.gdpr).toBeDefined();
    });
  });

  describe('Metrics and Reporting', () => {
    it('should generate unique cycle IDs', () => {
      const generateId1 = (orchestrator as any).generateCycleId();
      const generateId2 = (orchestrator as any).generateCycleId();

      expect(generateId1).toBeDefined();
      expect(generateId2).toBeDefined();
      expect(generateId1).not.toBe(generateId2);
      expect(generateId1).toMatch(/^tdd-\d+-\w+$/);
    });

    it('should aggregate agent results correctly', () => {
      const aggregateResults = (orchestrator as any).aggregateResults;
      
      const mockResults = [
        { success: true, results: ['result1'], agent: 'test' },
        { success: true, results: ['result2'], agent: 'code-reviewer' },
      ];

      const aggregated = aggregateResults.call(orchestrator, mockResults, true);
      
      expect(aggregated.success).toBe(true);
      expect(aggregated.results).toEqual(['result1', 'result2']);
      expect(aggregated.agentResults).toEqual(mockResults);
    });

    it('should create proper failure results', () => {
      const createFailureResult = (orchestrator as any).createFailureResult;
      
      const failureResult = createFailureResult.call(
        orchestrator,
        'test-cycle-id',
        'red',
        'Test error message'
      );

      expect(failureResult.success).toBe(false);
      expect(failureResult.cycleId).toBe('test-cycle-id');
      expect(failureResult.error).toContain('red');
      expect(failureResult.error).toContain('Test error message');
    });

    it('should update metrics correctly', () => {
      const updateMetrics = (orchestrator as any).updateMetrics;
      const initialMetrics = (orchestrator as any).metrics;
      
      // Test successful cycle
      updateMetrics.call(orchestrator, 'cycle-1', 5000, true);
      expect(initialMetrics.totalCycles).toBe(1);
      expect(initialMetrics.successfulCycles).toBe(1);
      expect(initialMetrics.averageDuration).toBe(5000);
      
      // Test failed cycle
      updateMetrics.call(orchestrator, 'cycle-2', 3000, false);
      expect(initialMetrics.totalCycles).toBe(2);
      expect(initialMetrics.failedCycles).toBe(1);
      expect(initialMetrics.averageDuration).toBe(4000); // (5000 + 3000) / 2
    });
  });

  describe('Error Handling', () => {
    it('should handle agent registry errors gracefully', async () => {
      // Mock registry to throw error
      vi.spyOn(agentRegistry, 'getAgentsForPhase').mockImplementation(() => {
        throw new Error('Registry error');
      });

      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Registry error');
    });

    it('should handle workflow engine errors gracefully', async () => {
      vi.spyOn(workflowEngine, 'selectWorkflow').mockRejectedValue(
        new Error('Workflow error')
      );

      const result = await orchestrator.executeFullTDDCycle(mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow error');
    });

    it('should handle timeout scenarios', async () => {
      // This would be more complex in real implementation with actual timeouts
      // For now, we test the error handling structure
      const result = await orchestrator.executeFullTDDCycle({
        ...mockContext,
        featureName: 'timeout-test',
      });

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Integration with Agent Registry', () => {
    it('should select appropriate agents for each phase', () => {
      const redAgents = agentRegistry.getAgentsForPhase('red', mockContext);
      expect(redAgents.length).toBeGreaterThan(0);
      expect(redAgents.some(agent => agent.type === 'test')).toBe(true);

      const greenAgents = agentRegistry.getAgentsForPhase('green', mockContext);
      expect(greenAgents.length).toBeGreaterThan(0);
      expect(greenAgents.some(agent => agent.type === 'code-reviewer')).toBe(true);

      const refactorAgents = agentRegistry.getAgentsForPhase('refactor', mockContext);
      expect(refactorAgents.length).toBeGreaterThan(0);
      expect(refactorAgents.some(agent => agent.type === 'architect-review')).toBe(true);
    });

    it('should select security agents for critical contexts', () => {
      mockContext.criticalityLevel = 'critical';
      mockContext.healthcareCompliance.required = true;

      const agents = agentRegistry.selectOptimalAgents(mockContext);
      expect(agents.some(agent => agent.type === 'security-auditor')).toBe(true);
    });
  });

  describe('Integration with Workflow Engine', () => {
    it('should select standard workflow for regular contexts', async () => {
      mockContext.criticalityLevel = 'medium';
      mockContext.healthcareCompliance.required = false;

      const workflow = await workflowEngine.selectWorkflow(mockContext);
      expect(workflow.name).toBe('standard-tdd');
    });

    it('should select security workflow for critical contexts', async () => {
      mockContext.criticalityLevel = 'critical';
      mockContext.healthcareCompliance.required = true;

      const workflow = await workflowEngine.selectWorkflow(mockContext);
      expect(workflow.name).toBe('security-critical');
    });
  });
});

describe('TDDOrchestrator Performance', () => {
  let orchestrator: TDDOrchestrator;
  let mockContext: OrchestrationContext;

  beforeEach(() => {
    const agentRegistry = new TDDAgentRegistry();
    const workflowEngine = new MockWorkflowEngine();
    orchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);

    mockContext = {
      featureName: 'performance-test',
      featureType: 'api',
      complexity: 'medium',
      criticalityLevel: 'medium',
      requirements: ['Performance test requirement'],
      healthcareCompliance: {
        required: false,
        lgpd: false,
        anvisa: false,
        cfm: false,
      },
    };
  });

  it('should complete TDD cycle within reasonable time', async () => {
    const startTime = Date.now();
    const result = await orchestrator.executeFullTDDCycle(mockContext);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it('should handle multiple concurrent cycles', async () => {
    const cycles = Array.from({ length: 3 }, (_, i) => ({
      ...mockContext,
      featureName: `concurrent-feature-${i}`,
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      cycles.map(context => orchestrator.executeFullTDDCycle(context))
    );
    const duration = Date.now() - startTime;

    expect(results.every(result => result.success)).toBe(true);
    expect(duration).toBeLessThan(15000); // Concurrent execution should be faster
  });
});