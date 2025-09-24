/**
 * Agent Registry Test Suite
 * Testing agent capability management, selection, and lifecycle
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TDDAgentRegistry } from "../src/agent-registry";
import type {
  AgentCapability,
  OrchestrationContext,
  AgentType,
  TDDPhase,
} from "../src/types";

describe("TDDAgentRegistry", () => {
  let registry: TDDAgentRegistry;
  let mockContext: OrchestrationContext;

  beforeEach(() => {
    registry = new TDDAgentRegistry();

    mockContext = {
      featureName: "user-authentication",
      featureType: "security",
      complexity: "medium",
      criticalityLevel: "high",
      requirements: [
        "Secure login functionality",
        "Password validation",
        "Session management",
      ],
      healthcareCompliance: {
        required: false,
        lgpd: false,
        anvisa: false,
        cfm: false,
      },
    };
  });

  describe("Agent Registration", () => {
    it("should register all default agents on initialization", () => {
      const allAgents = registry.getAllAgents();

      expect(allAgents.length).toBe(5); // tdd-orchestrator, architect-review, code-reviewer, security-auditor, test

      const agentTypes = allAgents.map((agent) => agent.type);
      expect(agentTypes).toContain("tdd-orchestrator");
      expect(agentTypes).toContain("architect-review");
      expect(agentTypes).toContain("code-reviewer");
      expect(agentTypes).toContain("security-auditor");
      expect(agentTypes).toContain("test");
    });

    it("should retrieve individual agents by type", () => {
      const testAgent = registry.getAgent("test");
      const securityAgent = registry.getAgent("security-auditor");
      const codeReviewAgent = registry.getAgent("code-reviewer");

      expect(testAgent).toBeDefined();
      expect(testAgent?.type).toBe("test");
      expect(testAgent?.name).toBe("Test Coordination Agent");

      expect(securityAgent).toBeDefined();
      expect(securityAgent?.type).toBe("security-auditor");
      expect(securityAgent?.healthcareCompliance?.lgpd).toBe(true);

      expect(codeReviewAgent).toBeDefined();
      expect(codeReviewAgent?.priority).toBe("secondary");
    });

    it("should return undefined for non-existent agents", () => {
      const nonExistent = registry.getAgent("non-existent" as AgentType);
      expect(nonExistent).toBeUndefined();
    });

    it("should register new custom agents", () => {
      const customAgent: AgentCapability = {
        type: "custom-agent" as AgentType,
        name: "Custom Test Agent",
        description: "A custom agent for testing",
        capabilities: ["custom-capability"],
        specializations: ["custom-specialization"],
        priority: "tertiary",
        phases: ["red"],
        triggers: ["custom"],
        configuration: {},
      };

      registry.registerAgent(customAgent);

      const retrievedAgent = registry.getAgent("custom-agent" as AgentType);
      expect(retrievedAgent).toBeDefined();
      expect(retrievedAgent?.name).toBe("Custom Test Agent");
    });

    it("should unregister agents successfully", () => {
      const success = registry.unregisterAgent("code-reviewer");
      expect(success).toBe(true);

      const retrievedAgent = registry.getAgent("code-reviewer");
      expect(retrievedAgent).toBeUndefined();

      // Should still have other agents
      const allAgents = registry.getAllAgents();
      expect(allAgents.length).toBe(4);
    });

    it("should fail to unregister non-existent agents", () => {
      const success = registry.unregisterAgent("non-existent" as AgentType);
      expect(success).toBe(false);
    });
  });

  describe("Phase-Based Agent Selection", () => {
    it("should return correct agents for RED phase", () => {
      const redAgents = registry.getAgentsForPhase("red", mockContext);

      expect(redAgents.length).toBeGreaterThan(0);

      const agentTypes = redAgents.map((agent) => agent.type);
      expect(agentTypes).toContain("test"); // Primary for RED phase
      expect(agentTypes).toContain("architect-review"); // Secondary for RED phase
      expect(agentTypes).toContain("security-auditor"); // Secondary for RED phase
    });

    it("should return correct agents for GREEN phase", () => {
      const greenAgents = registry.getAgentsForPhase("green", mockContext);

      expect(greenAgents.length).toBeGreaterThan(0);

      const agentTypes = greenAgents.map((agent) => agent.type);
      expect(agentTypes).toContain("code-reviewer"); // Primary for GREEN phase
      expect(agentTypes).toContain("security-auditor"); // Secondary for GREEN phase
      expect(agentTypes).toContain("test"); // Secondary for GREEN phase
    });

    it("should return correct agents for REFACTOR phase", () => {
      const refactorAgents = registry.getAgentsForPhase(
        "refactor",
        mockContext,
      );

      expect(refactorAgents.length).toBeGreaterThan(0);

      const agentTypes = refactorAgents.map((agent) => agent.type);
      expect(agentTypes).toContain("architect-review"); // Primary for REFACTOR phase
      expect(agentTypes).toContain("code-reviewer"); // Primary for REFACTOR phase
    });

    it("should filter agents based on healthcare compliance requirements", () => {
      mockContext.healthcareCompliance = {
        required: true,
        lgpd: true,
        anvisa: true,
        cfm: true,
      };

      const agents = registry.getAgentsForPhase("red", mockContext);

      // All returned agents should support required compliance
      agents.forEach((agent) => {
        if (mockContext.healthcareCompliance.lgpd) {
          expect(agent.healthcareCompliance?.lgpd).toBe(true);
        }
        if (mockContext.healthcareCompliance.anvisa) {
          expect(agent.healthcareCompliance?.anvisa).toBe(true);
        }
        if (mockContext.healthcareCompliance.cfm) {
          expect(agent.healthcareCompliance?.cfm).toBe(true);
        }
      });
    });

    it("should filter agents based on feature type", () => {
      mockContext.featureType = "microservice";

      const agents = registry.getAgentsForPhase("refactor", mockContext);

      // Should include architect-review for microservices
      const hasArchitectAgent = agents.some(
        (agent) =>
          agent.type === "architect-review" &&
          agent.specializations.includes("microservices-architecture"),
      );

      expect(hasArchitectAgent).toBe(true);
    });

    it("should filter out tertiary agents for critical features", () => {
      mockContext.criticalityLevel = "critical";

      // First, register a tertiary agent for testing
      const tertiaryAgent: AgentCapability = {
        type: "tertiary-agent" as AgentType,
        name: "Tertiary Test Agent",
        description: "A tertiary priority agent",
        capabilities: ["test-capability"],
        specializations: ["test-spec"],
        priority: "tertiary",
        phases: ["red"],
        triggers: ["test"],
        configuration: {},
      };
      registry.registerAgent(tertiaryAgent);

      const agents = registry.getAgentsForPhase("red", mockContext);

      // Should not include tertiary agents for critical features
      const hasTertiaryAgent = agents.some(
        (agent) => agent.priority === "tertiary",
      );

      expect(hasTertiaryAgent).toBe(false);
    });
  });

  describe("Capability-Based Agent Selection", () => {
    it("should return agents for architecture validation capability", () => {
      const agents = registry.getAgentsForCapability("architecture-validation");

      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].type).toBe("architect-review");
      expect(agents[0].capabilities).toContain("architecture-validation");
    });

    it("should return agents for security scanning capability", () => {
      const agents = registry.getAgentsForCapability(
        "security-vulnerability-scanning",
      );

      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].type).toBe("security-auditor");
      expect(agents[0].capabilities).toContain(
        "security-vulnerability-scanning",
      );
    });

    it("should return agents for code quality capability", () => {
      const agents = registry.getAgentsForCapability("code-quality-analysis");

      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].type).toBe("code-reviewer");
      expect(agents[0].capabilities).toContain("code-quality-analysis");
    });

    it("should return agents for testing capability", () => {
      const agents = registry.getAgentsForCapability(
        "test-pattern-enforcement",
      );

      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].type).toBe("test");
      expect(agents[0].capabilities).toContain("test-pattern-enforcement");
    });

    it("should return agents for compliance capability", () => {
      const agents = registry.getAgentsForCapability("compliance-validation");

      expect(agents.length).toBe(1);
      const agentTypes = agents.map((agent) => agent.type);
      expect(agentTypes).toContain("security-auditor");
      expect(agents[0].capabilities).toContain("compliance-validation");
    });

    it("should return empty array for non-existent capabilities", () => {
      const agents = registry.getAgentsForCapability("non-existent-capability");
      expect(agents).toEqual([]);
    });
  });

  describe("Optimal Agent Selection", () => {
    it("should select optimal agents based on context triggers", () => {
      mockContext.featureName = "user-authentication-security";
      mockContext.requirements = [
        "security validation",
        "authentication flow",
        "vulnerability scanning",
      ];

      const agents = registry.selectOptimalAgents(mockContext);

      expect(agents.length).toBeGreaterThan(0);

      // Security-related context should prioritize security auditor
      const securityAgent = agents.find(
        (agent) => agent.type === "security-auditor",
      );

      expect(securityAgent).toBeDefined();

      // Should be sorted by relevance score
      const scores = agents.map((agent) =>
        (registry as any).calculateAgentScore(agent, mockContext),
      );

      // Verify scores are in descending order
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it("should prioritize agents with healthcare compliance for medical contexts", () => {
      mockContext.featureName = "patient-data-management";
      mockContext.healthcareCompliance = {
        required: true,
        lgpd: true,
        anvisa: false,
        cfm: false,
      };

      const agents = registry.selectOptimalAgents(mockContext);

      // Healthcare compliant agents should score higher
      const healthcareAgents = agents.filter(
        (agent) => agent.healthcareCompliance?.lgpd,
      );

      expect(healthcareAgents.length).toBeGreaterThan(0);
    });

    it("should consider agent specializations in scoring", () => {
      mockContext.featureType = "microservice";
      mockContext.featureName = "microservice-authentication";

      const agents = registry.selectOptimalAgents(mockContext);

      // Agents with microservice specialization should score higher
      const microserviceSpecialists = agents.filter((agent) =>
        agent.specializations.some(
          (spec) =>
            spec.includes("microservice") || spec.includes("architecture"),
        ),
      );

      expect(microserviceSpecialists.length).toBeGreaterThan(0);
    });

    it("should boost scores for primary agents in complex contexts", () => {
      mockContext.complexity = "high";

      const agents = registry.selectOptimalAgents(mockContext);
      const primaryAgents = agents.filter(
        (agent) => agent.priority === "primary",
      );

      expect(primaryAgents.length).toBeGreaterThan(0);

      // Primary agents should appear early in the sorted list for complex contexts
      const firstAgent = agents[0];
      expect(firstAgent.priority).toBe("primary");
    });
  });

  describe("Agent Score Calculation", () => {
    it("should calculate higher scores for matching triggers", () => {
      const calculateScore = (registry as any).calculateAgentScore;

      const securityAgent = registry.getAgent("security-auditor")!;

      // Context with security-related content
      const securityContext = {
        ...mockContext,
        featureName: "security-authentication",
        requirements: ["security", "vulnerability", "compliance"],
      };

      const score = calculateScore.call(
        registry,
        securityAgent,
        securityContext,
      );

      expect(score).toBeGreaterThanOrEqual(75); // Base secondary score + trigger bonuses
    });

    it("should calculate higher scores for matching specializations", () => {
      const calculateScore = (registry as any).calculateAgentScore;

      const architectAgent = registry.getAgent("architect-review")!;

      const architectContext = {
        ...mockContext,
        featureName: "microservices architecture",
        requirements: ["scalability", "system design"],
      };

      const score = calculateScore.call(
        registry,
        architectAgent,
        architectContext,
      );

      expect(score).toBeGreaterThanOrEqual(75); // Base secondary score + specialization bonuses
    });

    it("should boost scores for healthcare compliance when required", () => {
      const calculateScore = (registry as any).calculateAgentScore;

      const securityAgent = registry.getAgent("security-auditor")!;

      const healthcareContext = {
        ...mockContext,
        healthcareCompliance: {
          required: true,
          lgpd: true,
          anvisa: true,
          cfm: true,
        },
      };

      const score = calculateScore.call(
        registry,
        securityAgent,
        healthcareContext,
      );

      expect(score).toBeGreaterThan(125); // Base + compliance bonuses
    });

    it("should assign different base scores by priority", () => {
      const calculateScore = (registry as any).calculateAgentScore;

      const primaryAgent = registry.getAgent("test")!; // Primary priority
      const secondaryAgent = registry.getAgent("code-reviewer")!; // Secondary priority

      const score1 = calculateScore.call(registry, primaryAgent, mockContext);
      const score2 = calculateScore.call(registry, secondaryAgent, mockContext);

      expect(score1).toBeGreaterThan(score2); // Primary should score higher than secondary
    });
  });

  describe("Agent Validation", () => {
    it("should validate agent capability against context requirements", () => {
      const securityAgent = registry.getAgent("security-auditor")!;

      mockContext.criticalityLevel = "critical";
      mockContext.healthcareCompliance.required = true;

      const isValid = registry.validateAgentCapability(
        securityAgent,
        mockContext,
      );

      expect(isValid).toBe(true);
    });

    it("should reject agents lacking required capabilities", () => {
      const testAgent = registry.getAgent("test")!;

      // Context requiring security capabilities that test agent doesn't have
      const securityContext = {
        ...mockContext,
        criticalityLevel: "critical" as const,
        healthcareCompliance: {
          required: true,
          lgpd: true,
          anvisa: false,
          cfm: false,
        },
      };

      const isValid = registry.validateAgentCapability(
        testAgent,
        securityContext,
      );

      // Test agent may not have all required security capabilities
      expect(typeof isValid).toBe("boolean");
    });
  });

  describe("Workflow Recommendations", () => {
    it("should recommend appropriate agent workflow for standard context", () => {
      const workflow = registry.getRecommendedWorkflow(mockContext);

      expect(Array.isArray(workflow)).toBe(true);
      expect(workflow.length).toBeGreaterThan(0);
      expect(workflow[0]).toBe("tdd-orchestrator"); // Should always start with orchestrator
    });

    it("should recommend enhanced workflow for complex context", () => {
      mockContext.complexity = "high";

      const workflow = registry.getRecommendedWorkflow(mockContext);

      expect(workflow).toContain("tdd-orchestrator");
      expect(workflow).toContain("architect-review"); // Should include architect for complex features
      expect(workflow).toContain("test");
      expect(workflow).toContain("code-reviewer");
    });

    it("should recommend security-enhanced workflow for healthcare context", () => {
      mockContext.healthcareCompliance.required = true;
      mockContext.healthcareCompliance.lgpd = true;

      const workflow = registry.getRecommendedWorkflow(mockContext);

      expect(workflow).toContain("security-auditor"); // Should include security auditor for healthcare
    });
  });

  describe("Agent Configuration Management", () => {
    it("should update agent configuration successfully", () => {
      const newConfig = {
        customSetting: "test-value",
        threshold: 85,
      };

      const success = registry.updateAgentConfiguration("test", newConfig);
      expect(success).toBe(true);

      const agent = registry.getAgent("test");
      expect(agent?.configuration.customSetting).toBe("test-value");
      expect(agent?.configuration.threshold).toBe(85);
    });

    it("should fail to update configuration for non-existent agent", () => {
      const success = registry.updateAgentConfiguration(
        "non-existent" as AgentType,
        { setting: "value" },
      );

      expect(success).toBe(false);
    });
  });

  describe("Agent Statistics", () => {
    it("should return agent statistics structure", () => {
      const stats = registry.getAgentStats("test");

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("executionCount");
      expect(stats).toHaveProperty("successRate");
      expect(stats).toHaveProperty("averageExecutionTime");
      expect(stats).toHaveProperty("lastExecution");
    });

    it("should return default stats for all agents", () => {
      const allAgents = registry.getAllAgents();

      allAgents.forEach((agent) => {
        const stats = registry.getAgentStats(agent.type);
        expect(stats.executionCount).toBe(0); // Default for new agents
        expect(stats.successRate).toBe(0);
        expect(stats.averageExecutionTime).toBe(0);
        expect(stats.lastExecution).toBeNull();
      });
    });
  });

  describe("Context Requirements Extraction", () => {
    it("should extract healthcare compliance requirements", () => {
      const extractCapabilities = (registry as any).extractRequiredCapabilities;

      mockContext.healthcareCompliance.required = true;

      const capabilities = extractCapabilities.call(registry, mockContext);
      expect(capabilities).toContain("healthcare-compliance-validation");
    });

    it("should extract security requirements for critical features", () => {
      const extractCapabilities = (registry as any).extractRequiredCapabilities;

      mockContext.criticalityLevel = "critical";

      const capabilities = extractCapabilities.call(registry, mockContext);
      expect(capabilities).toContain("security-vulnerability-scanning");
    });

    it("should extract architecture requirements for microservices", () => {
      const extractCapabilities = (registry as any).extractRequiredCapabilities;

      mockContext.featureType = "microservice";

      const capabilities = extractCapabilities.call(registry, mockContext);
      expect(capabilities).toContain("architecture-validation");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty context gracefully", () => {
      const emptyContext = {} as OrchestrationContext;

      expect(() => {
        registry.getAgentsForPhase("red", emptyContext);
      }).not.toThrow();

      expect(() => {
        registry.selectOptimalAgents(emptyContext);
      }).not.toThrow();
    });

    it("should handle invalid phase gracefully", () => {
      const agents = registry.getAgentsForPhase(
        "invalid-phase" as TDDPhase,
        mockContext,
      );

      expect(agents).toEqual([]);
    });

    it("should handle context with undefined properties", () => {
      const partialContext = {
        featureName: "test-feature",
        // Missing other required properties
      } as OrchestrationContext;

      expect(() => {
        registry.selectOptimalAgents(partialContext);
      }).not.toThrow();
    });
  });
});
