import { describe, it, expect } from "vitest";
import { AgentRegistry } from "../agent-registry";
import type { FeatureContext } from "../types";

describe("AgentRegistry", () => {
  const createBaseFeature = (
    overrides: Partial<FeatureContext> = {},
  ): FeatureContext => ({
    name: "Test Feature",
    description: "Baseline context for registry tests",
    domain: ["general"],
    complexity: 3,
    priority: "medium",
    estimatedEffort: 5,
    dependencies: [],
    requirements: ["Basic functionality required"],
    securityCritical: false,
    complianceRequirements: [],
    acceptanceCriteria: ["AC-1"],
    files: {
      implementation: "src/index.ts",
      tests: "src/index.test.ts",
    },
    ...overrides,
  }

  it("activates security auditor when domain is provided as string containing auth keywords", () => {
    const registry = new AgentRegistry(
    const feature = createBaseFeature({
      domain: ["authentication"],
      securityCritical: false,
    }

    const agents = registry.selectAgentsForFeature(feature

    expect(agents).toContain("security-auditor"
  }

  it("treats high numeric complexity as high-level and activates full agent set", () => {
    const registry = new AgentRegistry(
    const feature = createBaseFeature({
      complexity: 8,
      domain: ["ui"],
    }

    const agents = registry.selectAgentsForFeature(feature

    expect(agents).toEqual(
      expect.arrayContaining([
        "test",
        "code-reviewer",
        "architect-review",
        "security-auditor",
      ]),
    
  }

  it("falls back to acceptance criteria when requirements are absent", () => {
    const registry = new AgentRegistry(
    const feature = createBaseFeature({
      domain: ["performance"],
      acceptanceCriteria: ["The system must respond within 500ms"],
    }

    const agents = registry.selectAgentsForFeature(feature

    expect(agents).toContain("code-reviewer"
  }
}
