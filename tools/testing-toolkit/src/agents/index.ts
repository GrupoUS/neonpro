/**
 * Agent Coordination Utilities
 *
 * Integrates with the code review agents defined in .claude/agents/code-review/
 * Provides utilities for coordinating testing with specialized agents.
 */

export * from "./coordinator";
export * from "./types";
export * from "./validation";
export * from "./red-phase-specialist";

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
    description: "TDD RED phase testing and auditing authority",
    specialties: ["testing", "error-detection", "quality-validation", "coverage-analysis"],
    qualityGates: [
      "red-phase-compliance",
      "error-detection",
      "test-coverage",
      "quality-validation",
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
    "red-phase-compliance": 95,
    "error-detection": 100,
    "test-coverage": 95,
    "quality-validation": 90,
  },
  TDD: {
    patterns: 90,
    coverage: 90,
    structure: 95,
  },
} as const;
