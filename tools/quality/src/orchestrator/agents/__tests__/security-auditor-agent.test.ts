import { describe, it, expect, beforeEach } from "vitest";
import { SecurityAuditorAgent } from "../security-auditor-agent";
import type { FeatureContext, TDDPhase } from "../../types";

describe("SecurityAuditorAgent", () => {
  let agent: SecurityAuditorAgent;
  let mockContext: FeatureContext;

  beforeEach(() => {
    agent = new SecurityAuditorAgent(
    mockContext = {
      requirements: [],
      name: "test-feature",
      description: "Test authentication feature",
      domain: ["authentication"],
      complexity: 7,
      priority: "high",
      estimatedEffort: 8,
      dependencies: [],
      securityCritical: true,
      complianceRequirements: ["GDPR"],
      acceptanceCriteria: ["secure authentication", "password validation"],
      files: {
        implementation: "src/auth/login.ts",
        tests: "src/auth/login.test.ts",
      },
    };
  }

  describe("canHandle", () => {
    it("should handle security-critical features in all phases", () => {
      const phases: TDDPhase[] = ["red", "green", "refactor"];

      phases.forEach((phase) => {
        expect(agent.canHandle(phase, mockContext)).toBe(true);
      }
    }

    it("should handle authentication domain features", () => {
      const authContext = { ...mockContext, domain: ["authentication"] };
      expect(agent.canHandle("red", authContext)).toBe(true);
    }

    it("should handle authorization domain features", () => {
      const authzContext = { ...mockContext, domain: ["authorization"] };
      expect(agent.canHandle("red", authzContext)).toBe(true);
    }

    it("should handle user-facing features", () => {
      const userContext = {
        ...mockContext,
        domain: ["user"],
        securityCritical: false,
      };
      expect(agent.canHandle("red", userContext)).toBe(true);
    }

    it("should not handle non-security features", () => {
      const nonSecurityContext = {
        ...mockContext,
        domain: ["ui-components"],
        securityCritical: false,
        complianceRequirements: [],
      };
      expect(agent.canHandle("red", nonSecurityContext)).toBe(false);
    }
  }

  describe("execute", () => {
    it("should execute red phase and return security findings", async () => {
      const result = await agent.execute("red", mockContext

      expect(result.agent).toBe("security-auditor"
      expect(result.phase).toBe("red"
      expect(result.findings).toBeDefined(
      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations).toBeDefined(
      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics).toBeDefined(
      expect(result.duration).toBeGreaterThan(0
      expect(result.timestamp).toBeInstanceOf(Date
    }

    it("should execute green phase and return implementation recommendations", async () => {
      const result = await agent.execute("green", mockContext

      expect(result.agent).toBe("security-auditor"
      expect(result.phase).toBe("green"
      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }

    it("should execute refactor phase and return security improvements", async () => {
      const result = await agent.execute("refactor", mockContext

      expect(result.agent).toBe("security-auditor"
      expect(result.phase).toBe("refactor"
      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }

    it("should handle invalid phase gracefully", async () => {
      const result = await agent.execute("invalid" as TDDPhase, mockContext

      expect(result.status).toBe("failure"
      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }
  }

  describe("red phase execution", () => {
    it("should identify authentication vulnerabilities", async () => {
      const result = await agent.execute("red", {
        ...mockContext,
        domain: ["authentication"],
      }

      expect(result.findings.length).toBeGreaterThan(0
      expect(result.metrics.securityIssues).toBeGreaterThan(0
    }

    it("should identify authorization vulnerabilities", async () => {
      const result = await agent.execute("red", {
        ...mockContext,
        domain: ["authorization"],
      }

      expect(result.findings.length).toBeGreaterThan(0
      expect(result.metrics.securityIssues).toBeGreaterThan(0
    }

    it("should identify input validation issues", async () => {
      const result = await agent.execute("red", mockContext

      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }

    it("should create security-testing recommendations", async () => {
      const result = await agent.execute("red", mockContext

      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics.securityRecommendations).toBeGreaterThan(0
    }
  }

  describe("green phase execution", () => {
    it("should provide implementation guidance", async () => {
      const result = await agent.execute("green", mockContext

      const implementationFindings = result.findings.filter(
        (f) => f.type === "security-implementation",
      
      expect(implementationFindings.length).toBeGreaterThan(0
    }

    it("should recommend security controls", async () => {
      const result = await agent.execute("green", mockContext

      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics.securityRecommendations).toBeGreaterThan(0
    }

    it("should handle compliance requirements", async () => {
      const complianceContext = { ...mockContext, domain: ["healthcare"] };
      const result = await agent.execute("green", complianceContext

      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }
  }

  describe("refactor phase execution", () => {
    it("should suggest security architecture improvements", async () => {
      const result = await agent.execute("refactor", mockContext

      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics.securityRecommendations).toBeGreaterThan(0
    }

    it("should recommend cryptographic improvements", async () => {
      const cryptoContext = { ...mockContext, domain: ["crypto"] };
      const result = await agent.execute("refactor", cryptoContext

      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics.securityRecommendations).toBeGreaterThan(0
    }

    it("should suggest access control improvements", async () => {
      const authContext = { ...mockContext, domain: ["authorization"] };
      const result = await agent.execute("refactor", authContext

      expect(result.recommendations.length).toBeGreaterThan(0
      expect(result.metrics.securityRecommendations).toBeGreaterThan(0
    }
  }

  describe("risk calculation", () => {
    it("should calculate higher risk for critical findings", async () => {
      const criticalContext = { ...mockContext, securityCritical: true };
      const result = await agent.execute("red", criticalContext

      expect(result.metrics.riskScore).toBeGreaterThan(0
      expect(result.metrics.securityIssues).toBeGreaterThan(0
    }

    it("should track security metrics", async () => {
      const result = await agent.execute("red", mockContext

      expect(result.metrics.securityIssues).toBeDefined(
      expect(result.metrics.vulnerabilities).toBeDefined(
      expect(result.metrics.securityRecommendations).toBeDefined(
      expect(result.metrics.executionTime).toBeGreaterThanOrEqual(0
    }
  }

  describe("capabilities and configuration", () => {
    it("should return correct capabilities", () => {
      const capabilities = agent.getCapabilities(

      expect(capabilities).toContain("vulnerability-assessment"
      expect(capabilities).toContain("security-code-review"
      expect(capabilities).toContain("authentication-validation"
      expect(capabilities).toContain("authorization-testing"
      expect(capabilities).toContain("compliance-validation"
      expect(capabilities).toContain("security-test-automation"
    }

    it("should return valid configuration", () => {
      const config = agent.getConfiguration(

      expect(config.securityFrameworks).toBeDefined(
      expect(config.complianceStandards).toBeDefined(
      expect(config.vulnerabilityCategories).toBeDefined(
      expect(config.riskThresholds).toBeDefined(
    }
  }

  describe("edge cases", () => {
    it("should handle empty context gracefully", async () => {
      const emptyContext: FeatureContext = {
        name: "",
        description: "",
        domain: [],
        complexity: 1,
        priority: "low",
        estimatedEffort: 1,
        dependencies: [],
        requirements: [],
        securityCritical: false,
        complianceRequirements: [],
        acceptanceCriteria: [],
        files: {},
      };

      const result = await agent.execute("red", emptyContext
      expect(result).toBeDefined(
      expect(result.findings).toBeDefined(
      expect(result.recommendations).toBeDefined(
    }

    it("should handle missing files in context", async () => {
      const contextWithoutFiles = { ...mockContext, files: {} };
      const result = await agent.execute("red", contextWithoutFiles

      expect(result).toBeDefined(
      expect(result.findings.length).toBeGreaterThan(0
    }

    it("should handle multiple domain contexts", async () => {
      const multiDomainContext = {
        ...mockContext,
        domain: ["authentication", "authorization", "data-processing"],
      };
      const result = await agent.execute("red", multiDomainContext

      expect(result.findings.length).toBeGreaterThan(0
      expect(result.recommendations.length).toBeGreaterThan(0
    }
  }
}
