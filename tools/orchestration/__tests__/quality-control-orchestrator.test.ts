/**
 * Quality Control Orchestrator Tests
 * Tests main quality control coordination with healthcare compliance support
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { QualityControlOrchestrator } from "../src/quality-control-orchestrator";
import type {
  QualityControlContext,
  AgentName,
} from "../types";

describe("QualityControlOrchestrator", () => {
  let orchestrator: QualityControlOrchestrator;

  beforeEach(() => {
    orchestrator = new QualityControlOrchestrator(
  }

  afterEach(() => {
    // Cleanup if needed
  }

  describe("Quality Control Execution", () => {
    it("should execute basic quality control session", async () => {
      const context = {
        action: "test",
        target: "component",
        type: "test" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: false,
        agents: ["test"] as AgentName[],
        orchestrator: true,
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.id).toBeDefined(
      expect(session.action).toBe(context.action
      expect(session.target).toBe(context.target
      expect(session.status).toBe("completed"
      expect(session.duration).toBeGreaterThan(0
      expect(session.phases.length).toBeGreaterThan(0
    }

    it("should execute healthcare compliance quality control", async () => {
      const healthcareContext = {
        action: "compliance",
        target: "patient-data",
        type: "compliance" as const,
        depth: "L5" as const,
        healthcare: true,
        parallel: false,
        agents: ["test-auditor"] as AgentName[],
        orchestrator: true,
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(
          healthcareContext,
        

      expect(session.healthcareCompliance.required).toBe(true);
      expect(session.healthcareCompliance.lgpd).toBe(true);
      expect(session.healthcareCompliance.anvisa).toBe(true);
      expect(session.healthcareCompliance.cfm).toBe(true);
      expect(session.metrics.complianceScore).toBeGreaterThan(0.8
    }

    it("should execute parallel quality control", async () => {
      const parallelContext = {
        action: "analyze",
        target: "system",
        type: "analyze" as const,
        depth: "L4" as const,
        healthcare: false,
        parallel: true,
        agents: ["code-reviewer", "test-auditor", "test"] as AgentName[],
        orchestrator: true,
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(parallelContext

      expect(session.parallel).toBe(true);
      expect(session.executionPlan).toBeDefined(
      expect(session.executionPlan.parallelGroups.length).toBeGreaterThan(0
    }
  }

  describe("Strategy Selection", () => {
    it("should select appropriate strategy for testing", async () => {
      const testContext: QualityControlContext = {
        action: "test",
        target: "component",
        type: "test" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: false,
        agents: ["test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(testContext

      expect(session.strategy).toBeDefined(
      expect(session.strategy.type).toBe("comprehensive"
      expect(session.strategy.phases.length).toBeGreaterThan(0
    }

    it("should select security strategy for security audits", async () => {
      const securityContext: QualityControlContext = {
        action: "security",
        target: "system",
        type: "security" as const,
        depth: "L5" as const,
        healthcare: true,
        parallel: false,
        agents: ["test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(securityContext

      expect(session.strategy.type).toBe("security-focused"
      expect(
        session.strategy.phases.some((p) => p.type === "security-analysis"),
      ).toBe(true);
    }

    it("should select performance strategy for performance testing", async () => {
      const performanceContext: QualityControlContext = {
        action: "performance",
        target: "api",
        type: "performance" as const,
        depth: "L4" as const,
        healthcare: false,
        parallel: true,
        agents: ["test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(
          performanceContext,
        

      expect(session.strategy.type).toBe("performance-optimized"
      expect(
        session.strategy.phases.some((p) => p.type === "performance-analysis"),
      ).toBe(true);
    }
  }

  describe("Phase Execution", () => {
    it("should execute all strategy phases", async () => {
      const context: QualityControlContext = {
        action: "validate",
        target: "feature",
        type: "validate" as const,
        depth: "L4" as const,
        healthcare: false,
        parallel: false,
        agents: ["code-reviewer", "test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.phases.length).toBeGreaterThan(0
      expect(session.phases.every((p) => p.status === "completed")).toBe(true);
      expect(session.phases.every((p) => p.duration > 0)).toBe(true);
    }

    it("should handle phase failures gracefully", async () => {
      const failingContext: QualityControlContext = {
        action: "debug",
        target: "failing-component",
        type: "debug" as const,
        depth: "L2" as const,
        healthcare: false,
        parallel: false,
        agents: ["test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(failingContext

      expect(session.phases.length).toBeGreaterThan(0
      expect(session.phases.some((p) => p.status === "failed")).toBe(true);
      expect(session.errors.length).toBeGreaterThan(0
    }

    it("should collect phase metrics", async () => {
      const context: QualityControlContext = {
        action: "analyze",
        target: "system",
        type: "analyze" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: false,
        agents: ["code-reviewer"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.metrics).toBeDefined(
      expect(session.metrics.qualityScore).toBeGreaterThan(0
      expect(session.metrics.complianceScore).toBeGreaterThan(0
      expect(session.metrics.performanceScore).toBeGreaterThan(0
    }
  }

  describe("Healthcare Compliance Validation", () => {
    it("should validate LGPD compliance", async () => {
      const lgpdContext: QualityControlContext = {
        action: "compliance",
        target: "patient-data",
        type: "compliance" as const,
        depth: "L5" as const,
        healthcare: true,
        parallel: false,
        agents: ["test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(lgpdContext

      expect(session.healthcareCompliance.lgpdValidation).toBeDefined(
      expect(session.healthcareCompliance.lgpdValidation.compliant).toBe(true);
      expect(
        session.healthcareCompliance.lgpdValidation.violations.length,
      ).toBe(0
    }

    it("should validate ANVISA compliance", async () => {
      const anvisaContext: QualityControlContext = {
        action: "compliance",
        target: "medical-device",
        type: "compliance" as const,
        depth: "L5" as const,
        healthcare: true,
        parallel: false,
        agents: ["test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(anvisaContext

      expect(session.healthcareCompliance.anvisaValidation).toBeDefined(
      expect(session.healthcareCompliance.anvisaValidation.compliant).toBe(
        true,
      
    }

    it("should validate CFM compliance", async () => {
      const cfmContext: QualityControlContext = {
        action: "compliance",
        target: "medical-software",
        type: "compliance" as const,
        depth: "L5" as const,
        healthcare: true,
        parallel: false,
        agents: ["test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(cfmContext

      expect(session.healthcareCompliance.cfmValidation).toBeDefined(
      expect(session.healthcareCompliance.cfmValidation.compliant).toBe(true);
    }
  }

  describe("Agent Coordination", () => {
    it("should coordinate multiple agents effectively", async () => {
      const multiAgentContext: QualityControlContext = {
        action: "comprehensive",
        target: "system",
        type: "validate" as const,
        depth: "L4" as const,
        healthcare: false,
        parallel: true,
        agents: [
          "code-reviewer",
          "test-auditor",
          "test",
          "architect-review",
        ] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(
          multiAgentContext,
        

      expect(session.agentResults.length).toBeGreaterThan(0
      expect(session.agentResults.every((r) => r.agentName)).toBe(true);
      expect(session.executionPlan).toBeDefined(
      expect(session.executionPlan.parallelGroups.length).toBeGreaterThan(0
    }

    it("should handle agent conflicts", async () => {
      const conflictingContext: QualityControlContext = {
        action: "analyze",
        target: "shared-resource",
        type: "analyze" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: true,
        agents: ["code-reviewer", "test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(
          conflictingContext,
        

      expect(session.conflicts.length).toBeGreaterThanOrEqual(0
      expect(session.resolutions.length).toBeGreaterThanOrEqual(
        session.conflicts.length,
      
    }
  }

  describe("Result Aggregation", () => {
    it("should aggregate agent results effectively", async () => {
      const context: QualityControlContext = {
        action: "analyze",
        target: "component",
        type: "analyze" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: true,
        agents: ["code-reviewer", "test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.aggregatedResult).toBeDefined(
      expect(session.aggregatedResult.qualityScore).toBeGreaterThan(0
      expect(session.aggregatedResult.recommendations.length).toBeGreaterThan(
        0,
      
    }

    it("should provide actionable insights", async () => {
      const context: QualityControlContext = {
        action: "validate",
        target: "feature",
        type: "validate" as const,
        depth: "L4" as const,
        healthcare: true,
        parallel: false,
        agents: ["code-reviewer", "test-auditor"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.recommendations.length).toBeGreaterThan(0
      expect(session.nextActions.length).toBeGreaterThan(0
      expect(session.recommendations.every((r) => typeof r === "string")).toBe(
        true,
      
    }
  }

  describe("Performance Monitoring", () => {
    it("should track execution performance", async () => {
      const context: QualityControlContext = {
        action: "test",
        target: "component",
        type: "test" as const,
        depth: "L3" as const,
        healthcare: false,
        parallel: false,
        agents: ["test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.duration).toBeGreaterThan(0
      expect(session.metrics).toBeDefined(
      expect(session.metrics.executionTime).toBeGreaterThan(0
    }

    it("should provide performance analytics", async () => {
      const context: QualityControlContext = {
        action: "performance",
        target: "system",
        type: "performance" as const,
        depth: "L4" as const,
        healthcare: false,
        parallel: true,
        agents: ["test"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(context

      expect(session.performanceAnalytics).toBeDefined(
      expect(session.performanceAnalytics.throughput).toBeGreaterThan(0
      expect(session.performanceAnalytics.utilization).toBeGreaterThan(0
    }
  }

  describe("Error Handling", () => {
    it("should handle invalid contexts gracefully", async () => {
      const invalidContext = {
        action: "invalid",
        target: "",
        type: "invalid" as const,
        depth: "L1" as const,
        healthcare: false,
        parallel: false,
        agents: [] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(invalidContext

      expect(session.status).toBe("failed"
      expect(session.errors.length).toBeGreaterThan(0
    }

    it("should handle agent failures gracefully", async () => {
      const failingAgentContext: QualityControlContext = {
        action: "debug",
        target: "failing-component",
        type: "debug" as const,
        depth: "L2" as const,
        healthcare: false,
        parallel: false,
        agents: ["non-existent-agent"] as AgentName[],
      };

      const session =
        await orchestrator.executeQualityControlOrchestration(
          failingAgentContext,
        

      expect(session.status).toBe("completed"
      expect(session.agentResults.some((r) => r.success === false)).toBe(true);
    }
  }
}
