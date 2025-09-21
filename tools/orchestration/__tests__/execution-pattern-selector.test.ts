/**
 * Execution Pattern Selector Tests
 * Tests intelligent pattern selection based on context and requirements
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ExecutionPatternSelector } from "../src/execution-pattern-selector";
import type {
  FeatureContext,
  AgentName,
  AgentCoordinationPattern,
  WorkflowType,
} from "../src/types";

describe("ExecutionPatternSelector", () => {
  let selector: ExecutionPatternSelector;

  beforeEach(() => {
    selector = new ExecutionPatternSelector();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe("Pattern Selection", () => {
    it("should select sequential pattern for low complexity features", async () => {
      const context = {
        feature: {
          name: "Simple UI Component",
          description: "A basic UI component for simple interactions",
          domain: ["ui"],
          complexity: "low" as const,
          requirements: ["Basic functionality"],
          acceptance: ["Component renders correctly", "User can interact"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "low" as const,
        criticality: "low" as const,
        healthcareCompliance: false,
        performanceRequired: false,
        agentCount: 1,
        estimatedDuration: 1000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.workflowType).toBe("sequential");
      expect(result.coordinationPattern).toBe("sequential");
      expect(result.executionStrategy.parallel).toBe(false);
    });

    it("should select parallel pattern for medium complexity features", async () => {
      const context = {
        feature: {
          name: "Medium Feature",
          description: "A feature with medium complexity requirements",
          domain: ["backend"],
          complexity: "medium" as const,
          requirements: ["Multiple components"],
          acceptance: ["All components work together", "Performance meets standards"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "medium" as const,
        criticality: "medium" as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 3,
        estimatedDuration: 5000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.workflowType).toBe("parallel");
      expect(result.coordinationPattern).toBe("parallel");
      expect(result.executionStrategy.parallel).toBe(true);
    });

    it("should select hierarchical pattern for high complexity features", async () => {
      const context = {
        feature: {
          name: "Complex System",
          description: "A high-complexity system with multiple integration points",
          domain: ["architecture"],
          complexity: "high" as const,
          requirements: ["Multiple subsystems", "Integration points"],
          acceptance: ["All subsystems integrated", "Performance requirements met", "Security validated"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "high" as const,
        criticality: "critical" as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 5,
        estimatedDuration: 10000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.workflowType).toBe("hierarchical");
      expect(result.coordinationPattern).toBe("hierarchical");
      expect(result.executionStrategy.parallel).toBe(true);
    });

    it("should select event-driven pattern for healthcare compliance features", async () => {
      const context = {
        feature: {
          name: "Healthcare Feature",
          description: "A healthcare feature requiring LGPD compliance",
          domain: ["healthcare"],
          complexity: "medium" as const,
          requirements: ["Patient data", "LGPD compliance"],
          acceptance: ["LGPD compliance verified", "Patient data secure", "Audit trail complete"],
          healthcareCompliance: true,
        } as FeatureContext,
        complexity: "medium" as const,
        criticality: "high" as const,
        healthcareCompliance: true,
        performanceRequired: true,
        agentCount: 4,
        estimatedDuration: 8000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.workflowType).toBe("event-driven");
      expect(result.coordinationPattern).toBe("event-driven");
      expect(result.optimization.compliance).toBeGreaterThan(0.8);
    });
  });

  describe("Agent Selection", () => {
    it("should select appropriate primary agents", async () => {
      const context = {
        feature: {
          name: "Test Feature",
          description: "A test feature for orchestration patterns",
          domain: ["testing"],
          complexity: "medium" as const,
          requirements: ["Unit tests", "Integration tests"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "medium" as const,
        criticality: "medium" as const,
        healthcareCompliance: false,
        performanceRequired: false,
        agentCount: 2,
        estimatedDuration: 3000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.agentSelection.primaryAgents).toContain("test");
      expect(result.agentSelection.primaryAgents.length).toBeGreaterThan(0);
    });

    it("should include support agents for complex features", async () => {
      const context = {
        feature: {
          name: "Complex Feature",
          description: "A test feature for orchestration patterns",
          domain: ["architecture"],
          complexity: "high" as const,
          requirements: ["Architecture", "Security", "Testing"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: true,
        } as FeatureContext,
        complexity: "high" as const,
        criticality: "critical" as const,
        healthcareCompliance: true,
        performanceRequired: true,
        agentCount: 5,
        estimatedDuration: 10000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.agentSelection.supportAgents?.length).toBeGreaterThan(0);
      expect(result.agentSelection.parallelAgents?.length).toBeGreaterThan(0);
    });
  });

  describe("Optimization Scoring", () => {
    it("should provide high performance score for performance-required features", async () => {
      const context = {
        feature: {
          name: "Performance Feature",
          description: "A test feature for orchestration patterns",
          domain: ["backend"],
          complexity: "medium" as const,
          requirements: ["High performance"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "medium" as const,
        criticality: "medium" as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 3,
        estimatedDuration: 2000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.optimization.performance).toBeGreaterThan(0.7);
    });

    it("should provide high compliance score for healthcare features", async () => {
      const context = {
        feature: {
          name: "Healthcare Feature",
          description: "A test feature for orchestration patterns",
          domain: ["healthcare"],
          complexity: "medium" as const,
          requirements: ["Patient data", "LGPD compliance"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: true,
        } as FeatureContext,
        complexity: "medium" as const,
        criticality: "high" as const,
        healthcareCompliance: true,
        performanceRequired: false,
        agentCount: 2,
        estimatedDuration: 4000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.optimization.compliance).toBeGreaterThan(0.8);
    });
  });

  describe("Risk Assessment", () => {
    it("should identify risks for complex features", async () => {
      const context = {
        feature: {
          name: "Complex Feature",
          description: "A test feature for orchestration patterns",
          domain: ["architecture"],
          complexity: "high" as const,
          requirements: ["Multiple subsystems", "Integration"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "high" as const,
        criticality: "critical" as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 5,
        estimatedDuration: 15000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.risks?.length).toBeGreaterThan(0);
      expect(result.mitigations?.length).toBeGreaterThan(0);
      expect(result.mitigations?.length).toBeGreaterThanOrEqual(
        result.risks?.length || 0,
      );
    });

    it("should provide appropriate justification for pattern selection", async () => {
      const context = {
        feature: {
          name: "Simple Feature",
          description: "A test feature for orchestration patterns",
          domain: ["ui"],
          complexity: "low" as const,
          requirements: ["Basic functionality"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "low" as const,
        criticality: "low" as const,
        healthcareCompliance: false,
        performanceRequired: false,
        agentCount: 1,
        estimatedDuration: 1000,
      };

      const result = await selector.selectOptimalPattern(context);

      expect(result.justification?.length).toBeGreaterThan(0);
      expect(typeof result.justification?.[0]).toBe("string");
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimal context gracefully", async () => {
      const minimalContext = {
        feature: {
          name: "Minimal Feature",
          description: "A test feature for orchestration patterns",
          domain: ["ui"],
          complexity: "low" as const,
          requirements: ["Basic"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "low" as const,
        criticality: "low" as const,
        healthcareCompliance: false,
        performanceRequired: false,
        agentCount: 1,
        estimatedDuration: 500,
      };

      const result = await selector.selectOptimalPattern(minimalContext);

      expect(result.workflowType).toBeDefined();
      expect(result.coordinationPattern).toBeDefined();
      expect(result.agentSelection.primaryAgents.length).toBeGreaterThan(0);
    });

    it("should handle large agent counts", async () => {
      const largeContext = {
        feature: {
          name: "Large Feature",
          description: "A test feature for orchestration patterns",
          domain: ["enterprise"],
          complexity: "high" as const,
          requirements: ["Many agents needed"],
          acceptance: ["Feature works as expected", "Quality standards met"],
          healthcareCompliance: false,
        } as FeatureContext,
        complexity: "high" as const,
        criticality: "critical" as const,
        healthcareCompliance: false,
        performanceRequired: true,
        agentCount: 10,
        estimatedDuration: 20000,
      };

      const result = await selector.selectOptimalPattern(largeContext);

      expect(result.executionStrategy.batchSize).toBeGreaterThan(0);
      expect(result.agentSelection.parallelAgents?.length).toBeGreaterThan(0);
    });
  });
});
