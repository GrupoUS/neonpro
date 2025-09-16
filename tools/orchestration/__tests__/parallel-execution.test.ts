/**
 * Comprehensive Test Suite for Parallel Agent Execution Workflows
 * Tests TDD orchestration, quality control integration, and agent coordination
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTDDOrchestrationSystem,
  executeQualityControl,
  runTDDCycle,
  TDDOrchestrator,
  QualityControlBridge,
  WorkflowEngine,
  TDDAgentRegistry,
} from '../index';
import type {
  FeatureContext,
  OrchestrationOptions,
  QualityControlContext,
  AgentCoordinationPattern,
  OrchestrationResult,
  QualityControlResult,
} from '../types';

describe('Parallel Agent Execution Workflows', () => {
  let orchestrationSystem: ReturnType<typeof createTDDOrchestrationSystem>;
  let orchestrator: TDDOrchestrator;
  let qualityControlBridge: QualityControlBridge;
  let workflowEngine: WorkflowEngine;
  let agentRegistry: TDDAgentRegistry;

  beforeEach(async () => {
    orchestrationSystem = createTDDOrchestrationSystem({
      enableCommunication: true,
      enableMetrics: true,
      enableCompliance: true,
      healthcareMode: true,
    });

    await orchestrationSystem.initialize();

    orchestrator = orchestrationSystem.orchestrator;
    qualityControlBridge = orchestrationSystem.qualityControlBridge;
    workflowEngine = orchestrationSystem.workflowEngine;
    agentRegistry = orchestrationSystem.agentRegistry;
  });

  afterEach(async () => {
    await orchestrationSystem.shutdown();
  });

  describe('Quality Control Command Integration', () => {
    it('should parse and execute quality control commands', async () => {
      const command = 'analyze --type security --depth L5 --parallel --agents code-reviewer,security-auditor';
      const result = await executeQualityControl(command);

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        command: expect.stringContaining('analyze'),
        orchestrationResult: expect.any(Object),
        duration: expect.any(Number),
      });
    });

    it('should execute parallel code review workflow', async () => {
      const qualityContext: QualityControlContext = {
        action: 'review',
        type: 'analyze',
        depth: 'L5',
        parallel: true,
        agents: ['code-reviewer', 'architect-review', 'security-auditor'],
        coordination: 'parallel',
      };

      const result = await qualityControlBridge.executeQualityControl(
        'review --parallel --agents code-reviewer,architect-review,security-auditor',
        qualityContext
      );

      expect(result.success).toBe(true);
      expect(result.orchestrationResult).toBeDefined();
      expect(result.orchestrationResult?.agentResults).toHaveLength(3);
    });

    it('should handle healthcare compliance in parallel execution', async () => {
      const qualityContext: QualityControlContext = {
        action: 'validate',
        type: 'compliance',
        healthcare: true,
        parallel: true,
        agents: ['security-auditor'],
        coordination: 'parallel',
      };

      const result = await qualityControlBridge.executeQualityControl(
        'validate --healthcare --parallel',
        qualityContext
      );

      expect(result.success).toBe(true);
      expect(result.orchestrationResult?.healthcareCompliance).toBeDefined();
      expect(result.orchestrationResult?.healthcareCompliance?.lgpd).toBe(true);
    });
  });

  describe('Agent Coordination Patterns', () => {
    const testFeature: FeatureContext = {
      name: 'parallel-test-feature',
      description: 'Test feature for parallel execution',
      domain: ['testing', 'orchestration'],
      complexity: 'medium' as const,
      requirements: ['parallel execution', 'quality control', 'healthcare compliance'],
      acceptance: [
        'Should execute agents in parallel',
        'Should maintain quality standards',
        'Should validate healthcare compliance',
      ],
    };

    it('should execute parallel coordination pattern', async () => {
      const options: OrchestrationOptions = {
        workflow: 'parallel',
        coordination: 'parallel',
        agents: ['code-reviewer', 'architect-review'],
        healthcare: true,
      };

      const result = await orchestrator.executeFullTDDCycle(testFeature, options);

      expect(result.success).toBe(true);
      expect(result.phases).toHaveLength(3); // red, green, refactor
      expect(result.agentResults.length).toBeGreaterThan(0);
      expect(result.coordination).toBe('parallel');
    });

    it('should execute hierarchical coordination pattern', async () => {
      const options: OrchestrationOptions = {
        workflow: 'hierarchical',
        coordination: 'hierarchical',
        agents: ['architect-review', 'code-reviewer', 'security-auditor'],
        healthcare: true,
      };

      const result = await orchestrator.executeFullTDDCycle(testFeature, options);

      expect(result.success).toBe(true);
      expect(result.coordination).toBe('hierarchical');
      expect(result.agentResults).toBeDefined();
    });

    it('should execute event-driven coordination pattern', async () => {
      const options: OrchestrationOptions = {
        workflow: 'event-driven',
        coordination: 'event-driven',
        agents: ['code-reviewer', 'test'],
        healthcare: false,
      };

      const result = await orchestrator.executeFullTDDCycle(testFeature, options);

      expect(result.success).toBe(true);
      expect(result.coordination).toBe('event-driven');
    });

    it('should handle consensus coordination pattern', async () => {
      const options: OrchestrationOptions = {
        workflow: 'consensus',
        coordination: 'consensus',
        agents: ['code-reviewer', 'architect-review', 'security-auditor'],
        healthcare: true,
      };

      const result = await orchestrator.executeFullTDDCycle(testFeature, options);

      expect(result.success).toBe(true);
      expect(result.coordination).toBe('consensus');
      expect(result.consensusResult).toBeDefined();
    });
  });

  describe('Agent Registry Parallel Optimization', () => {
    it('should optimize agents for parallel execution', () => {
      const agents = ['code-reviewer', 'architect-review', 'security-auditor', 'test'];
      const optimized = agentRegistry.getParallelOptimizedAgents(agents);

      expect(optimized).toHaveLength(agents.length);
      expect(optimized.every(agent => agents.includes(agent.name))).toBe(true);
    });

    it('should create coordination groups', () => {
      const agents = ['code-reviewer', 'architect-review', 'security-auditor'];
      const groups = agentRegistry.getAgentCoordinationGroups(agents, 'parallel');

      expect(groups).toBeDefined();
      expect(groups.length).toBeGreaterThan(0);
      expect(groups.every(group => group.agents.length > 0)).toBe(true);
    });

    it('should create execution plan for parallel agents', () => {
      const agents = ['code-reviewer', 'security-auditor'];
      const plan = agentRegistry.createParallelExecutionPlan(agents, 'parallel');

      expect(plan).toMatchObject({
        phases: expect.any(Array),
        totalEstimatedTime: expect.any(Number),
        parallelizationFactor: expect.any(Number),
        conflictResolution: expect.any(String),
      });
    });
  });

  describe('Workflow Engine Parallel Patterns', () => {
    it('should execute advanced parallel coordination', async () => {
      const executionPlan = {
        phases: [
          {
            name: 'analysis',
            agents: ['code-reviewer', 'architect-review'],
            parallel: true,
            coordination: 'parallel' as AgentCoordinationPattern,
          },
          {
            name: 'validation',
            agents: ['security-auditor'],
            parallel: false,
            coordination: 'sequential' as AgentCoordinationPattern,
          },
        ],
        totalEstimatedTime: 300,
        parallelizationFactor: 0.6,
        conflictResolution: 'priority-based' as const,
      };

      const context = {
        featureName: 'test-feature',
        featureType: 'testing',
        complexity: 'medium' as const,
        criticalityLevel: 'medium' as const,
        requirements: ['test requirement'],
        healthcareCompliance: {
          required: true,
          lgpd: true,
          anvisa: true,
          cfm: true,
        },
      };

      const result = await workflowEngine.executeAdvancedParallelCoordination(
        executionPlan,
        context
      );

      expect(result.success).toBe(true);
      expect(result.phaseResults).toHaveLength(2);
      expect(result.agentResults.length).toBeGreaterThan(0);
    });

    it('should handle conflict resolution strategies', async () => {
      const strategies = ['priority-based', 'consensus', 'coordinator-decides'] as const;

      for (const strategy of strategies) {
        const executionPlan = {
          phases: [{
            name: 'test-phase',
            agents: ['code-reviewer', 'architect-review'],
            parallel: true,
            coordination: 'parallel' as AgentCoordinationPattern,
          }],
          totalEstimatedTime: 200,
          parallelizationFactor: 0.5,
          conflictResolution: strategy,
        };

        const context = {
          featureName: 'conflict-test',
          featureType: 'testing',
          complexity: 'low' as const,
          criticalityLevel: 'low' as const,
          requirements: ['conflict resolution'],
          healthcareCompliance: {
            required: false,
            lgpd: false,
            anvisa: false,
            cfm: false,
          },
        };

        const result = await workflowEngine.executeAdvancedParallelCoordination(
          executionPlan,
          context
        );

        expect(result.success).toBe(true);
        expect(result.conflictResolution).toBe(strategy);
      }
    });
  });

  describe('Communication System Integration', () => {
    it('should establish agent communication', async () => {
      const communication = orchestrationSystem.communication;
      expect(communication).toBeDefined();

      if (communication) {
        const stats = communication.getSystemStats();
        expect(stats).toMatchObject({
          protocol: expect.objectContaining({
            registeredAgents: expect.any(Number),
          }),
          messageBus: expect.objectContaining({
            totalMessages: expect.any(Number),
          }),
          health: expect.objectContaining({
            registeredAgents: expect.any(Number),
            activeConflicts: expect.any(Number),
            messagesThroughput: expect.any(Number),
          }),
        });
      }
    });

    it('should handle agent message coordination', async () => {
      const communication = orchestrationSystem.communication;

      if (communication) {
        // Test message coordination during parallel execution
        const qualityContext: QualityControlContext = {
          action: 'analyze',
          type: 'test',
          parallel: true,
          agents: ['code-reviewer', 'test'],
          coordination: 'parallel',
        };

        const result = await qualityControlBridge.executeQualityControl(
          'analyze --parallel --type test',
          qualityContext
        );

        expect(result.success).toBe(true);

        // Verify communication stats were updated
        const stats = communication.getSystemStats();
        expect(stats.messageBus.totalMessages).toBeGreaterThan(0);
      }
    });
  });

  describe('Metrics Collection', () => {
    it('should collect orchestration metrics', () => {
      const metrics = orchestrationSystem.getMetrics();

      if ('snapshot' in metrics) {
        expect(metrics.snapshot).toMatchObject({
          orchestration: expect.objectContaining({
            totalExecutions: expect.any(Number),
          }),
          agent: expect.objectContaining({
            totalAgentExecutions: expect.any(Number),
          }),
          quality: expect.objectContaining({
            overallQualityScore: expect.any(Number),
          }),
          performance: expect.objectContaining({
            averageExecutionTime: expect.any(Number),
          }),
        });
      }
    });

    it('should track healthcare compliance metrics', () => {
      const metrics = orchestrationSystem.getMetrics();

      if ('snapshot' in metrics) {
        expect(metrics.snapshot.healthcare).toMatchObject({
          lgpdCompliance: expect.any(Number),
          anvisaCompliance: expect.any(Number),
          cfmCompliance: expect.any(Number),
        });
      }
    });
  });

  describe('Healthcare Compliance Validation', () => {
    it('should validate LGPD compliance', async () => {
      const context = {
        featureName: 'healthcare-feature',
        featureType: 'healthcare',
        complexity: 'high' as const,
        criticalityLevel: 'critical' as const,
        requirements: ['LGPD compliance'],
        healthcareCompliance: {
          required: true,
          lgpd: true,
          anvisa: true,
          cfm: true,
        },
      };

      const agentResults = [
        {
          agentName: 'security-auditor' as const,
          success: true,
          result: { securityScan: { vulnerabilities: [], score: 95 } },
          duration: 100,
          quality: { score: 9.5, issues: [] },
        },
      ];

      if (orchestrationSystem.complianceValidator) {
        const compliance = await orchestrationSystem.validateCompliance(context, agentResults);

        expect(compliance).toMatchObject({
          lgpd: expect.objectContaining({
            compliant: expect.any(Boolean),
            score: expect.any(Number),
          }),
          anvisa: expect.objectContaining({
            compliant: expect.any(Boolean),
            score: expect.any(Number),
          }),
          cfm: expect.objectContaining({
            compliant: expect.any(Boolean),
            score: expect.any(Number),
          }),
        });
      }
    });
  });

  describe('System Status and Health', () => {
    it('should provide comprehensive system status', () => {
      const status = orchestrationSystem.getStatus();

      expect(status).toMatchObject({
        system: 'TDD Orchestration Framework',
        version: '1.0.0',
        status: 'ready',
        components: expect.objectContaining({
          orchestrator: 'active',
          agentRegistry: expect.stringContaining('agents registered'),
          workflowEngine: expect.stringContaining('workflows available'),
          qualityControlBridge: 'active',
        }),
        capabilities: expect.objectContaining({
          multiAgentCoordination: true,
          parallelExecution: true,
          qualityControlIntegration: true,
          healthcareCompliance: true,
          metricsCollection: true,
          realtimeCommunication: true,
        }),
        healthcareMode: true,
      });
    });

    it('should provide command examples', () => {
      const examples = orchestrationSystem.getCommandExamples();

      expect(examples).toMatchObject({
        availableCommands: expect.any(Array),
        examples: expect.any(Array),
        workflows: expect.any(Array),
        agents: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            type: expect.any(String),
            capabilities: expect.any(Array),
          }),
        ]),
      });
    });
  });

  describe('End-to-End Integration', () => {
    it('should execute complete TDD cycle with parallel agents', async () => {
      const testFeature: FeatureContext = {
        name: 'e2e-parallel-feature',
        description: 'End-to-end test for parallel TDD execution',
        domain: ['testing', 'e2e'],
        complexity: 'high',
        requirements: [
          'Parallel agent execution',
          'Quality control integration',
          'Healthcare compliance',
          'Real-time communication',
        ],
        acceptance: [
          'All agents execute in parallel',
          'Quality gates are enforced',
          'Healthcare compliance is validated',
          'Metrics are collected',
        ],
      };

      const result = await runTDDCycle(testFeature, {
        workflow: 'parallel',
        coordination: 'parallel',
        agents: ['code-reviewer', 'architect-review', 'security-auditor'],
        healthcare: true,
        enableMetrics: true,
        enableCompliance: true,
      });

      expect(result.success).toBe(true);
      expect(result.phases).toHaveLength(3);
      expect(result.agentResults.length).toBeGreaterThan(0);
      expect(result.healthcareCompliance).toBeDefined();
      expect(result.coordination).toBe('parallel');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle complex quality control scenarios', async () => {
      const commands = [
        'analyze --type security --depth L8 --parallel --healthcare',
        'test --type unit --parallel --agents test,code-reviewer',
        'review --depth L6 --parallel --agents architect-review,security-auditor --healthcare',
        'validate --type compliance --healthcare --parallel',
      ];

      for (const command of commands) {
        const result = await executeQualityControl(command);
        expect(result.success).toBe(true);
        expect(result.orchestrationResult).toBeDefined();
      }
    });
  });
});