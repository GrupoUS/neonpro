/**
 * Tool Orchestrator Tests
 * Tests coordinated tool execution with intelligent scheduling and conflict resolution
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ToolOrchestrator } from '../tool-orchestrator';
import type {
  ToolExecutionRequest,
  ToolExecutionResult,
  AgentName,
  FeatureContext,
} from '../types';

describe('ToolOrchestrator', () => {
  let orchestrator: ToolOrchestrator;

  beforeEach(() => {
    orchestrator = new ToolOrchestrator();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Tool Execution', () => {
    it('should execute simple tool request successfully', async () => {
      const request: ToolExecutionRequest = {
        id: 'test-1',
        toolName: 'test-tool',
        action: 'test-action',
        parameters: { input: 'test' },
        priority: 'medium' as const,
        timeout: 5000,
        retries: 2,
      };

      const result = await orchestrator.executeTool(request);

      expect(result.id).toBe(request.id);
      expect(result.toolName).toBe(request.toolName);
      expect(result.action).toBe(request.action);
      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle tool execution with dependencies', async () => {
      const dependencyRequest: ToolExecutionRequest = {
        id: 'dependency-1',
        toolName: 'dependency-tool',
        action: 'setup',
        parameters: { setup: true },
        priority: 'high' as const,
        timeout: 3000,
        retries: 1,
      };

      const dependentRequest: ToolExecutionRequest = {
        id: 'dependent-1',
        toolName: 'dependent-tool',
        action: 'execute',
        parameters: { ready: true },
        priority: 'medium' as const,
        timeout: 5000,
        retries: 2,
        dependencies: ['dependency-1'],
      };

      // Execute dependency first
      const dependencyResult = await orchestrator.executeTool(dependencyRequest);
      expect(dependencyResult.success).toBe(true);

      // Execute dependent tool
      const dependentResult = await orchestrator.executeTool(dependentRequest);
      expect(dependentResult.success).toBe(true);
    });

    it('should handle tool execution failures gracefully', async () => {
      const failingRequest: ToolExecutionRequest = {
        id: 'fail-1',
        toolName: 'failing-tool',
        action: 'fail',
        parameters: { shouldFail: true },
        priority: 'low' as const,
        timeout: 1000,
        retries: 1,
      };

      const result = await orchestrator.executeTool(failingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should retry failed tool executions', async () => {
      const flakyRequest: ToolExecutionRequest = {
        id: 'flaky-1',
        toolName: 'flaky-tool',
        action: 'flaky',
        parameters: { succeedOnRetry: true },
        priority: 'medium' as const,
        timeout: 2000,
        retries: 3,
      };

      const result = await orchestrator.executeTool(flakyRequest);

      // Should eventually succeed after retries
      expect(result.success).toBe(true);
    });
  });

  describe('Resource Management', () => {
    it('should allocate resources for tool execution', async () => {
      const resourceRequest: ToolExecutionRequest = {
        id: 'resource-1',
        toolName: 'resource-intensive-tool',
        action: 'process',
        parameters: { data: 'large' },
        priority: 'high' as const,
        timeout: 10000,
        retries: 1,
        resources: {
          memory: 512,
          cpu: 2,
          disk: 1024,
        },
      };

      const result = await orchestrator.executeTool(resourceRequest);

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle resource constraints', async () => {
      const constrainedRequest: ToolExecutionRequest = {
        id: 'constrained-1',
        toolName: 'constrained-tool',
        action: 'minimal',
        parameters: { minimal: true },
        priority: 'low' as const,
        timeout: 1000,
        retries: 1,
        resources: {
          memory: 64,
          cpu: 0.5,
          disk: 100,
        },
      };

      const result = await orchestrator.executeTool(constrainedRequest);

      expect(result.success).toBe(true);
    });

    it('should prioritize high-priority requests', async () => {
      const lowPriority: ToolExecutionRequest = {
        id: 'low-1',
        toolName: 'background-tool',
        action: 'background',
        parameters: { background: true },
        priority: 'low' as const,
        timeout: 5000,
        retries: 1,
      };

      const highPriority: ToolExecutionRequest = {
        id: 'high-1',
        toolName: 'urgent-tool',
        action: 'urgent',
        parameters: { urgent: true },
        priority: 'critical' as const,
        timeout: 2000,
        retries: 1,
      };

      // Execute both
      const [lowResult, highResult] = await Promise.all([
        orchestrator.executeTool(lowPriority),
        orchestrator.executeTool(highPriority),
      ]);

      // Both should succeed, but high priority should be faster
      expect(lowResult.success).toBe(true);
      expect(highResult.success).toBe(true);
      expect(highResult.duration).toBeLessThanOrEqual(lowResult.duration);
    });
  });

  describe('Batch Execution', () => {
    it('should execute multiple tools in parallel', async () => {
      const requests: ToolExecutionRequest[] = [
        {
          id: 'batch-1',
          toolName: 'batch-tool',
          action: 'process',
          parameters: { batch: 1 },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
        {
          id: 'batch-2',
          toolName: 'batch-tool',
          action: 'process',
          parameters: { batch: 2 },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
        {
          id: 'batch-3',
          toolName: 'batch-tool',
          action: 'process',
          parameters: { batch: 3 },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
      ];

      const results = await orchestrator.executeBatch(requests);

      expect(results.length).toBe(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.duration > 0)).toBe(true);
    });

    it('should handle batch execution with failures', async () => {
      const requests: ToolExecutionRequest[] = [
        {
          id: 'batch-success-1',
          toolName: 'batch-tool',
          action: 'process',
          parameters: { batch: 1 },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
        {
          id: 'batch-fail-1',
          toolName: 'failing-tool',
          action: 'fail',
          parameters: { shouldFail: true },
          priority: 'medium' as const,
          timeout: 1000,
          retries: 1,
        },
        {
          id: 'batch-success-2',
          toolName: 'batch-tool',
          action: 'process',
          parameters: { batch: 2 },
          priority: 'medium' as const,
          timeout: 3000,
          retries: 1,
        },
      ];

      const results = await orchestrator.executeBatch(requests);

      expect(results.length).toBe(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve resource conflicts', async () => {
      const conflictingRequest1: ToolExecutionRequest = {
        id: 'conflict-1',
        toolName: 'exclusive-tool',
        action: 'exclusive',
        parameters: { resource: 'shared' },
        priority: 'medium' as const,
        timeout: 5000,
        retries: 1,
        resources: {
          memory: 1024,
          cpu: 4,
        },
      };

      const conflictingRequest2: ToolExecutionRequest = {
        id: 'conflict-2',
        toolName: 'exclusive-tool',
        action: 'exclusive',
        parameters: { resource: 'shared' },
        priority: 'high' as const,
        timeout: 3000,
        retries: 1,
        resources: {
          memory: 1024,
          cpu: 4,
        },
      };

      // Execute conflicting requests
      const [result1, result2] = await Promise.all([
        orchestrator.executeTool(conflictingRequest1),
        orchestrator.executeTool(conflictingRequest2),
      ]);

      // Both should handle the conflict appropriately
      expect(result1.duration).toBeGreaterThan(0);
      expect(result2.duration).toBeGreaterThan(0);
    });

    it('should handle timeout conflicts', async () => {
      const timeoutRequest: ToolExecutionRequest = {
        id: 'timeout-1',
        toolName: 'slow-tool',
        action: 'slow',
        parameters: { delay: 2000 },
        priority: 'medium' as const,
        timeout: 1000, // Short timeout
        retries: 1,
      };

      const result = await orchestrator.executeTool(timeoutRequest);

      // Should handle timeout gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Healthcare Compliance', () => {
    it('should validate healthcare compliance for medical tools', async () => {
      const healthcareRequest: ToolExecutionRequest = {
        id: 'healthcare-1',
        toolName: 'medical-tool',
        action: 'process-patient-data',
        parameters: { 
          patientData: 'sensitive',
          compliance: true 
        },
        priority: 'high' as const,
        timeout: 5000,
        retries: 2,
        metadata: {
          healthcareCompliance: true,
          dataSensitivity: 'high',
        },
      };

      const result = await orchestrator.executeTool(healthcareRequest);

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBe(0); // No compliance warnings
    });

    it('should warn about non-compliant healthcare operations', async () => {
      const nonCompliantRequest: ToolExecutionRequest = {
        id: 'non-compliant-1',
        toolName: 'medical-tool',
        action: 'process-patient-data',
        parameters: { 
          patientData: 'sensitive',
          compliance: false 
        },
        priority: 'medium' as const,
        timeout: 5000,
        retries: 1,
        metadata: {
          healthcareCompliance: true,
          dataSensitivity: 'high',
        },
      };

      const result = await orchestrator.executeTool(nonCompliantRequest);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('compliance'))).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track execution metrics', async () => {
      const request: ToolExecutionRequest = {
        id: 'metrics-1',
        toolName: 'metrics-tool',
        action: 'track',
        parameters: { metrics: true },
        priority: 'medium' as const,
        timeout: 3000,
        retries: 1,
      };

      const result = await orchestrator.executeTool(request);

      expect(result.duration).toBeGreaterThan(0);
      
      // Check performance stats
      const stats = orchestrator.getPerformanceStats();
      expect(stats.totalExecutions).toBeGreaterThan(0);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    it('should provide resource utilization metrics', async () => {
      const resourceRequest: ToolExecutionRequest = {
        id: 'resource-metrics-1',
        toolName: 'resource-tool',
        action: 'consume',
        parameters: { consume: true },
        priority: 'medium' as const,
        timeout: 3000,
        retries: 1,
        resources: {
          memory: 256,
          cpu: 1,
          disk: 512,
        },
      };

      const result = await orchestrator.executeTool(resourceRequest);

      expect(result.success).toBe(true);
      
      // Check resource utilization
      const resourceStats = orchestrator.getResourceUtilization();
      expect(resourceStats.memoryUtilization).toBeGreaterThan(0);
      expect(resourceStats.cpuUtilization).toBeGreaterThan(0);
    });
  });
});