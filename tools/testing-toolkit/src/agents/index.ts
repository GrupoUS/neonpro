/**
 * Agent Coordination Utilities
 *
 * Integrates with the code review agents defined in .claude/agents/code-review/
 * Provides utilities for coordinating testing with specialized agents.
 */

export * from "./coordinator";
export * from "./types";
export * from "./validation";

// Agent types matching the code review agents
export const AGENT_REGISTRY = {
  "architect-review": {
    name: "architect-review",
    description: "Architecture and system design validation",
    specialties: ["patterns", "scalability", "design"],
    qualityGates: [
      "architecture-compliance",
      "pattern-validation",
      "scalability-check",
    ],
  },
  "code-reviewer": {
    name: "code-reviewer",
    description: "Code quality and performance analysis",
    specialties: ["quality", "performance", "maintainability"],
    qualityGates: [
      "code-quality",
      "performance-metrics",
      "maintainability-score",
    ],
  },
  "security-auditor": {
    name: "security-auditor",
    description: "Security and compliance validation",
    specialties: ["security", "compliance", "vulnerabilities"],
    qualityGates: [
      "security-scan",
      "compliance-check",
      "vulnerability-assessment",
    ],
  },
  "tdd-orchestrator": {
    name: "tdd-orchestrator",
    description: "TDD cycle coordination and test orchestration",
    specialties: ["tdd", "orchestration", "coordination"],
    qualityGates: ["tdd-compliance", "test-coverage", "cycle-validation"],
  },
} as const;

export type AgentType = keyof typeof AGENT_REGISTRY;

// Agent coordination patterns
export const COORDINATION_PATTERNS = {
  SEQUENTIAL: "sequential",
  PARALLEL: "parallel",
  HIERARCHICAL: "hierarchical",
} as const;

// Quality gate definitions
export const QUALITY_GATES = {
  ARCHITECTURE: {
    patterns: 90,
    boundaries: 85,
    scalability: 80,
  },
  CODE_QUALITY: {
    quality: 85,
    performance: 80,
    maintainability: 85,
  },
  SECURITY: {
    compliance: 95,
    vulnerabilities: 0,
    authentication: 100,
  },
  TDD: {
    patterns: 90,
    coverage: 90,
    structure: 95,
  },
} as const;
