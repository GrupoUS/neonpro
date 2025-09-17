/**
 * Comprehensive Orchestration Integration Tests
 * Tests all orchestration components working together in various scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { 
  ExecutionPatternSelector,
  ToolOrchestrator,
  QualityControlOrchestrator,
  ResultAggregator,
  TestSuiteCoordinator,
  QualityControlBridge,
  TDDAgentRegistry,
  TDDOrchestrator,
} from '../index';
import type {
  FeatureContext,
  QualityControlContext,
  AgentResult,
  ToolExecutionRequest,
  AgentName,
  TDDPhase,
} from '../types';

describe('Orchestration Integration', () => {
  let executionPatternSelector: ExecutionPatternSelector;
  let toolOrchestrator: ToolOrchestrator;
  let qualityControlOrchestrator: QualityControlOrchestrator;
  let resultAggregator: ResultAggregator;
  let testSuiteCoordinator: TestSuiteCoordinator;
  let qualityControlBridge: QualityControlBridge;
  let agentRegistry: TDDAgentRegistry;
  let tddOrchestrator: TDDOrchestrator;

  beforeEach(() => {
    executionPatternSelector = new ExecutionPatternSelector();
    toolOrchestrator = new ToolOrchestrator();
    qualityControlOrchestrator = new QualityControlOrchestrator();
    resultAggregator = new ResultAggregator();
    testSuiteCoordinator = new TestSuiteCoordinator();
    qualityControlBridge = new QualityControlBridge();
    agentRegistry = new TDDAgentRegistry();
    tddOrchestrator = new TDDOrchestrator(agentRegistry);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Complete Orchestration Flow', () => {
    it('should execute complete TDD cycle with all components', async () => {
      const feature: FeatureContext = {
        name: 'Integration Test Feature',
        domain: ['testing', 'integration'],
        complexity: 'medium' as const,
        requirements: [
          'Unit tests',
          'Integration tests',
          'Code coverage',
          'Quality gates'
        ],
        healthcareCompliance: false,
      };

      // 1. Select execution pattern
      const patternContext = {
        feature,
        complexity: 'medium' as const,
        criticality: 'medium' as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 4,
        estimatedDuration: 8000,
      };

      const patternSelection = await executionPatternSelector.selectOptimalPattern(patternContext);

      expect(patternSelection.workflowType).toBeDefined();
      expect(patternSelection.coordinationPattern).toBeDefined();
      expect(patternSelection.agentSelection.primaryAgents.length).toBeGreaterThan(0);

      // 2. Execute tool orchestration
      const toolRequests: ToolExecutionRequest[] = [
        {
          id: 'test-tool-1',
          toolName: 'test-runner',
          action: 'run-tests',
          parameters: { type: 'unit' },
          priority: 'high' as const,
          timeout: 5000,
          retries: 2,
        },
        {
          id: 'analysis-tool-1',
          toolName: 'code-analyzer',
          action: 'analyze',
          parameters: { depth: 'deep' },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
      ];

      const toolResults = await toolOrchestrator.executeBatch(toolRequests);

      expect(toolResults.length).toBe(2);
      expect(toolResults.every(r => r.id)).toBe(true);

      // 3. Execute quality control orchestration
      const qcContext: QualityControlContext = {
        action: 'validate',
        target: 'integration-test-feature',
        type: 'validate' as const,
        depth: 'L4' as const,
        healthcare: false,
        parallel: true,
        agents: patternSelection.agentSelection.primaryAgents,
        orchestrator: true,
      };

      const qcSession = await qualityControlOrchestrator.executeQualityControlOrchestration(qcContext);

      expect(qcSession.status).toBe('completed');
      expect(qcSession.phases.length).toBeGreaterThan(0);
      expect(qcSession.agentResults.length).toBeGreaterThan(0);

      // 4. Aggregate results
      const allResults: AgentResult[] = [
        ...toolResults.map(r => ({
          agentName: 'tool-orchestrator' as AgentName,
          success: r.success,
          duration: r.duration,
          result: r.output,
          metrics: { quality: r.success ? 0.9 : 0.3 },
          errors: r.error ? [r.error] : [],
          warnings: r.warnings,
        })),
        ...qcSession.agentResults,
      ];

      const aggregatedResult = await resultAggregator.aggregateAgentResults(allResults);

      expect(aggregatedResult.results.length).toBeGreaterThan(0);
      expect(aggregatedResult.qualityScore).toBeGreaterThan(0);
      expect(aggregatedResult.agentCount).toBeGreaterThan(0);

      // 5. Execute test suite coordination
      const testSuite = await testSuiteCoordinator.coordinateTestExecution({
        featureName: feature.name,
        testTypes: ['unit', 'integration'],
        framework: 'jest',
        parallel: qcSession.parallel,
        timeout: 10000,
      });

      expect(testSuite.results.length).toBeGreaterThan(0);
      expect(testSuite.overallSuccess).toBe(true);

      // 6. Execute quality control bridge command
      const bridgeResult = await qualityControlBridge.executeQualityControl(
        `test ${feature.name} --depth=L4 --parallel --agents=${patternSelection.agentSelection.primaryAgents.join(',')}`
      );

      expect(bridgeResult.success).toBe(true);
      expect(bridgeResult.duration).toBeGreaterThan(0);
      expect(bridgeResult.qualityScore).toBeGreaterThan(0);

      // 7. Execute TDD cycle
      const tddResult = await tddOrchestrator.executeFullTDDCycle(feature, {
        healthcare: false,
        parallelExecution: patternSelection.executionStrategy.parallel,
        qualityGates: true,
      });

      expect(tddResult.success).toBe(true);
      expect(tddResult.duration).toBeGreaterThan(0);
      expect(tddResult.phases.length).toBe(3); // red, green, refactor
    });

    it('should handle healthcare compliance workflow', async () => {
      const healthcareFeature: FeatureContext = {
        name: 'Healthcare Patient Management',
        domain: ['healthcare', 'patient-data'],
        complexity: 'high' as const,
        requirements: [
          'Patient data storage',
          'LGPD compliance',
          'ANVISA certification',
          'CFM compliance',
          'Data encryption',
          'Audit logging'
        ],
        healthcareCompliance: true,
      };

      // 1. Select healthcare-appropriate execution pattern
      const patternContext = {
        feature: healthcareFeature,
        complexity: 'high' as const,
        criticality: 'critical' as const,
        healthcareCompliance: true,
        performanceRequired: true,
        agentCount: 5,
        estimatedDuration: 15000,
      };

      const patternSelection = await executionPatternSelector.selectOptimalPattern(patternContext);

      expect(patternSelection.workflowType).toBe('event-driven');
      expect(patternSelection.optimization.compliance).toBeGreaterThan(0.8);

      // 2. Execute healthcare quality control
      const healthcareQcContext: QualityControlContext = {
        action: 'compliance',
        target: 'patient-management-system',
        type: 'compliance' as const,
        depth: 'L5' as const,
        healthcare: true,
        parallel: false,
        agents: ['security-auditor', 'architect-review'] as AgentName[],
        orchestrator: true,
      };

      const qcSession = await qualityControlOrchestrator.executeQualityControlOrchestration(healthcareQcContext);

      expect(qcSession.healthcareCompliance.required).toBe(true);
      expect(qcSession.healthcareCompliance.lgpd).toBe(true);
      expect(qcSession.healthcareCompliance.anvisa).toBe(true);
      expect(qcSession.healthcareCompliance.cfm).toBe(true);
      expect(qcSession.metrics.complianceScore).toBeGreaterThan(0.9);

      // 3. Execute healthcare-specific tools
      const healthcareToolRequests: ToolExecutionRequest[] = [
        {
          id: 'lgpd-validation',
          toolName: 'compliance-validator',
          action: 'validate-lgpd',
          parameters: { data: 'patient-info' },
          priority: 'high' as const,
          timeout: 5000,
          retries: 3,
          metadata: {
            healthcareCompliance: true,
            dataSensitivity: 'high',
          },
        },
        {
          id: 'anvisa-validation',
          toolName: 'compliance-validator',
          action: 'validate-anvisa',
          parameters: { device: 'medical-software' },
          priority: 'high' as const,
          timeout: 5000,
          retries: 3,
          metadata: {
            healthcareCompliance: true,
            regulatoryStandard: 'ANVISA',
          },
        },
      ];

      const healthcareToolResults = await toolOrchestrator.executeBatch(healthcareToolRequests);

      expect(healthcareToolResults.length).toBe(2);
      expect(healthcareToolResults.every(r => r.warnings.length === 0)).toBe(true);

      // 4. Aggregate healthcare results
      const healthcareResults: AgentResult[] = [
        ...healthcareToolResults.map(r => ({
          agentName: 'healthcare-tool' as AgentName,
          success: r.success,
          duration: r.duration,
          result: r.output,
          metrics: { quality: r.success ? 0.95 : 0.5, complianceScore: r.success ? 1.0 : 0.0 },
          errors: r.error ? [r.error] : [],
          warnings: r.warnings,
          healthcareCompliance: {
            lgpd: r.success,
            anvisa: r.success,
            cfm: r.success,
            compliant: r.success,
          },
        })),
        ...qcSession.agentResults,
      ];

      const healthcareAggregated = await resultAggregator.aggregateAgentResults(healthcareResults);

      expect(healthcareAggregated.qualityScore).toBeGreaterThan(0.8);
      expect(healthcareAggregated.complianceScore).toBeGreaterThan(0.9);

      // 5. Execute healthcare test suite
      const healthcareTestSuite = await testSuiteCoordinator.coordinateTestExecution({
        featureName: healthcareFeature.name,
        testTypes: ['unit', 'integration', 'compliance'],
        framework: 'jest',
        parallel: false,
        timeout: 15000,
        healthcareMode: true,
      });

      expect(healthcareTestSuite.results.length).toBeGreaterThan(0);
      expect(healthcareTestSuite.complianceResults).toBeDefined();
      expect(healthcareTestSuite.complianceResults?.lgpdCompliant).toBe(true);

      // 6. Execute healthcare quality control bridge command
      const healthcareBridgeResult = await qualityControlBridge.executeQualityControl(
        `compliance ${healthcareFeature.name} --depth=L5 --healthcare --agents=security-auditor,architect-review`
      );

      expect(healthcareBridgeResult.success).toBe(true);
      expect(healthcareBridgeResult.complianceStatus).toBeDefined();
      expect(healthcareBridgeResult.complianceStatus?.required).toBe(true);

      // 7. Execute healthcare TDD cycle
      const healthcareTddResult = await tddOrchestrator.executeFullTDDCycle(healthcareFeature, {
        healthcare: true,
        parallelExecution: false,
        qualityGates: true,
        complianceValidation: true,
      });

      expect(healthcareTddResult.success).toBe(true);
      expect(healthcareTddResult.healthcareCompliance).toBeDefined();
      expect(healthcareTddResult.healthcareCompliance?.required).toBe(true);
    });

    it('should handle complex parallel execution', async () => {
      const complexFeature: FeatureContext = {
        name: 'Complex Enterprise System',
        domain: ['enterprise', 'microservices'],
        complexity: 'high' as const,
        requirements: [
          'Multiple microservices',
          'API gateway',
          'Database integration',
          'Caching layer',
          'Message queue',
          'Monitoring',
          'Security',
          'Performance optimization'
        ],
        healthcareCompliance: false,
      };

      // 1. Select complex execution pattern
      const patternContext = {
        feature: complexFeature,
        complexity: 'high' as const,
        criticality: 'critical' as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 8,
        estimatedDuration: 20000,
      };

      const patternSelection = await executionPatternSelector.selectOptimalPattern(patternContext);

      expect(patternSelection.workflowType).toBe('hierarchical');
      expect(patternSelection.executionStrategy.parallel).toBe(true);

      // 2. Execute complex tool orchestration
      const complexToolRequests: ToolExecutionRequest[] = Array.from({ length: 5 }, (_, i) => ({
        id: `complex-tool-${i}`,
        toolName: `microservice-tool-${i}`,
        action: 'deploy-and-test',
        parameters: { service: `service-${i}` },
        priority: i === 0 ? 'high' as const : 'medium' as const,
        timeout: 8000,
        retries: 2,
        dependencies: i > 0 ? [`complex-tool-${i-1}`] : undefined,
        resources: {
          memory: 512,
          cpu: 2,
          disk: 1024,
        },
      }));

      const complexToolResults = await toolOrchestrator.executeBatch(complexToolRequests);

      expect(complexToolResults.length).toBe(5);
      expect(complexToolResults.every(r => r.duration > 0)).toBe(true);

      // 3. Execute complex parallel quality control
      const complexQcContext: QualityControlContext = {
        action: 'comprehensive',
        target: 'enterprise-system',
        type: 'validate' as const,
        depth: 'L5' as const,
        healthcare: false,
        parallel: true,
        agents: patternSelection.agentSelection.primaryAgents,
        orchestrator: true,
      };

      const complexQcSession = await qualityControlOrchestrator.executeQualityControlOrchestration(complexQcContext);

      expect(complexQcSession.parallel).toBe(true);
      expect(complexQcSession.executionPlan.parallelGroups.length).toBeGreaterThan(0);

      // 4. Execute complex test suite
      const complexTestSuite = await testSuiteCoordinator.coordinateTestExecution({
        featureName: complexFeature.name,
        testTypes: ['unit', 'integration', 'e2e', 'performance', 'security'],
        framework: 'jest',
        parallel: true,
        timeout: 30000,
        batchSize: 3,
      });

      expect(complexTestSuite.results.length).toBeGreaterThan(0);
      expect(complexTestSuite.parallelExecution).toBe(true);

      // 5. Aggregate all complex results
      const complexResults: AgentResult[] = [
        ...complexToolResults.map(r => ({
          agentName: 'complex-tool' as AgentName,
          success: r.success,
          duration: r.duration,
          result: r.output,
          metrics: { quality: r.success ? 0.85 : 0.4, performance: r.success ? 0.9 : 0.3 },
          errors: r.error ? [r.error] : [],
          warnings: r.warnings,
        })),
        ...complexQcSession.agentResults,
        ...complexTestSuite.results.map(r => ({
          agentName: 'test-suite' as AgentName,
          success: r.success,
          duration: r.duration || 1000,
          result: r.output,
          metrics: { quality: r.success ? 0.9 : 0.5, coverage: r.coverage || 0.8 },
          errors: r.errors || [],
          warnings: r.warnings || [],
        })),
      ];

      const complexAggregated = await resultAggregator.aggregateAgentResults(complexResults);

      expect(complexAggregated.results.length).toBeGreaterThan(0);
      expect(complexAggregated.qualityScore).toBeGreaterThan(0.7);
      expect(complexAggregated.performanceScore).toBeGreaterThan(0.7);

      // 6. Analyze trends and patterns
      const analysis = await resultAggregator.analyzeResult(complexAggregated);
      const trends = await resultAggregator.analyzeTrend(
        complexAggregated.results.map(r => ({ 
          qualityScore: r.metrics?.quality || 0.5,
          timestamp: Date.now() - Math.random() * 3600000,
        })),
        'quality'
      );

      expect(analysis.qualityScore).toBeGreaterThan(0);
      expect(trends.direction).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle component failures gracefully', async () => {
      const feature: FeatureContext = {
        name: 'Error Prone Feature',
        domain: ['testing'],
        complexity: 'medium' as const,
        requirements: ['Error handling', 'Recovery'],
        healthcareCompliance: false,
      };

      // 1. Execute quality control with failure simulation
      const errorQcContext: QualityControlContext = {
        action: 'debug',
        target: 'error-prone-component',
        type: 'debug' as const,
        depth: 'L3' as const,
        healthcare: false,
        parallel: false,
        agents: ['non-existent-agent'] as AgentName[],
        orchestrator: true,
      };

      const errorQcSession = await qualityControlOrchestrator.executeQualityControlOrchestration(errorQcContext);

      expect(errorQcSession.status).toBe('completed');
      expect(errorQcSession.agentResults.some(r => r.success === false)).toBe(true);
      expect(errorQcSession.errors.length).toBeGreaterThanOrEqual(0);

      // 2. Execute tool orchestration with failing tools
      const failingToolRequests: ToolExecutionRequest[] = [
        {
          id: 'failing-tool',
          toolName: 'non-existent-tool',
          action: 'fail',
          parameters: {},
          priority: 'medium' as const,
          timeout: 1000,
          retries: 1,
        },
      ];

      const failingToolResults = await toolOrchestrator.executeBatch(failingToolRequests);

      expect(failingToolResults.length).toBe(1);
      expect(failingToolResults[0].success).toBe(false);
      expect(failingToolResults[0].error).toBeDefined();

      // 3. Aggregate results including failures
      const errorResults: AgentResult[] = [
        ...failingToolResults.map(r => ({
          agentName: 'failing-tool' as AgentName,
          success: r.success,
          duration: r.duration,
          result: r.output,
          metrics: { quality: r.success ? 0.9 : 0.2 },
          errors: r.error ? [r.error] : [],
          warnings: r.warnings,
        })),
        ...errorQcSession.agentResults,
      ];

      const errorAggregated = await resultAggregator.aggregateAgentResults(errorResults);

      expect(errorAggregated.results.length).toBeGreaterThan(0);
      expect(errorAggregated.successRate).toBeLessThan(1.0);
      expect(errorAggregated.errorCount).toBeGreaterThan(0);

      // 4. System should still provide meaningful analysis
      const errorAnalysis = await resultAggregator.analyzeResult(errorAggregated);

      expect(errorAnalysis).toBeDefined();
      expect(errorAnalysis.issues.length).toBeGreaterThan(0);
      expect(errorAnalysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle resource constraints and timeouts', async () => {
      // Create resource-intensive scenario
      const resourceIntensiveRequests: ToolExecutionRequest[] = [
        {
          id: 'resource-heavy-1',
          toolName: 'resource-intensive-tool',
          action: 'process',
          parameters: { dataSize: '1GB' },
          priority: 'medium' as const,
          timeout: 2000, // Very short timeout
          retries: 1,
          resources: {
            memory: 2048,
            cpu: 4,
            disk: 4096,
          },
        },
        {
          id: 'resource-heavy-2',
          toolName: 'resource-intensive-tool',
          action: 'process',
          parameters: { dataSize: '1GB' },
          priority: 'medium' as const,
          timeout: 2000,
          retries: 1,
          resources: {
            memory: 2048,
            cpu: 4,
            disk: 4096,
          },
        },
      ];

      const resourceResults = await toolOrchestrator.executeBatch(resourceIntensiveRequests);

      expect(resourceResults.length).toBe(2);
      // Results may vary due to resource constraints, but system should handle gracefully
      expect(resourceResults.every(r => r.duration !== undefined)).toBe(true);

      // Analyze resource utilization
      const resourceResultsAsAgentResults: AgentResult[] = resourceResults.map(r => ({
        agentName: 'resource-intensive-tool' as AgentName,
        success: r.success,
        duration: r.duration,
        result: r.output,
        metrics: { quality: r.success ? 0.8 : 0.4 },
        errors: r.error ? [r.error] : [],
        warnings: r.warnings,
      }));

      const resourceAggregated = await resultAggregator.aggregateAgentResults(resourceResultsAsAgentResults);
      const resourceAnalysis = await resultAggregator.analyzeResult(resourceAggregated);

      expect(resourceAnalysis).toBeDefined();
      expect(resourceAnalysis.performanceScore).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-volume execution', async () => {
      const highVolumeFeature: FeatureContext = {
        name: 'High Volume Processing',
        domain: ['batch-processing'],
        complexity: 'medium' as const,
        requirements: ['Process 1000 items', 'Parallel execution', 'Performance monitoring'],
        healthcareCompliance: false,
      };

      // Create high volume of tool requests
      const highVolumeRequests: ToolExecutionRequest[] = Array.from({ length: 20 }, (_, i) => ({
        id: `batch-tool-${i}`,
        toolName: 'batch-processor',
        action: 'process',
        parameters: { batchId: i, items: 50 },
        priority: 'low' as const,
        timeout: 5000,
        retries: 1,
      }));

      const startTime = Date.now();
      const highVolumeResults = await toolOrchestrator.executeBatch(highVolumeRequests);
      const endTime = Date.now();

      expect(highVolumeResults.length).toBe(20);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Process results through aggregation
      const highVolumeAgentResults: AgentResult[] = highVolumeResults.map(r => ({
        agentName: 'batch-processor' as AgentName,
        success: r.success,
        duration: r.duration,
        result: r.output,
        metrics: { quality: r.success ? 0.95 : 0.5, throughput: r.success ? 100 : 0 },
        errors: r.error ? [r.error] : [],
        warnings: r.warnings,
      }));

      const highVolumeAggregated = await resultAggregator.aggregateAgentResults(highVolumeAgentResults);
      const performanceMetrics = await resultAggregator.calculatePerformanceMetrics(highVolumeAggregated);

      expect(performanceMetrics.throughput).toBeGreaterThan(0);
      expect(performanceMetrics.averageDuration).toBeGreaterThan(0);
      expect(highVolumeAggregated.successRate).toBeGreaterThan(0.8);
    });

    it('should maintain performance under complex scenarios', async () => {
      const complexQcContext: QualityControlContext = {
        action: 'comprehensive',
        target: 'performance-test-system',
        type: 'validate' as const,
        depth: 'L5' as const,
        healthcare: false,
        parallel: true,
        agents: ['code-reviewer', 'security-auditor', 'test', 'architect-review'] as AgentName[],
        orchestrator: true,
      };

      const startTime = Date.now();
      const complexQcSession = await qualityControlOrchestrator.executeQualityControlOrchestration(complexQcContext);
      const endTime = Date.now();

      expect(complexQcSession.status).toBe('completed');
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds

      expect(complexQcSession.duration).toBeGreaterThan(0);
      expect(complexQcSession.metrics.performanceScore).toBeGreaterThan(0.7);
    });
  });
});