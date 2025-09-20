/**
 * Quality Orchestrator - Main Export File
 * Simplified exports for available components
 */

// Core orchestrator
export { TDDOrchestrator } from "./orchestrator-core";

// Agent registry
export { AgentRegistry } from "./agent-registry";

// Workflow engine
export { WorkflowEngine } from "./workflow-engine";

// Quality gates
export { QualityGatesSystem } from "./quality-gates";

// Communication system
export { CommunicationSystem } from "./communication";

// Available agent implementations
export { BaseAgent } from "./agents/base-agent";
export { TestAgent } from "./agents/test-agent";
export { CodeReviewerAgent } from "./agents/code-reviewer-agent";
export { ArchitectReviewAgent } from "./agents/architect-review-agent";
export { SecurityAuditorAgent } from "./agents/security-auditor-agent";

// Types
export type * from "./types";
