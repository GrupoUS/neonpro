export { orchestrateTools } from "./src/orchestrator";
export {
  TOOL_WORKFLOWS,
  type ToolWorkflow,
  type OrchestrationStep,
} from "./src/config";

// TDD Orchestration System exports
export { createTDDOrchestrationSystem } from "./src/orchestration-system";
export { executeQualityControl, runTDDCycle } from "./src/utils";
export { TDDOrchestrator } from "./src/tdd-orchestrator";
export { QualityControlBridge } from "./src/quality-control-bridge";
export { QualityControlOrchestrator } from "./src/quality-control-orchestrator";
export { WorkflowEngine } from "./src/workflow-engine";
export { TDDAgentRegistry } from "./src/agent-registry";

// New orchestration components
export { ExecutionPatternSelector } from "./src/execution-pattern-selector";
export { ToolOrchestrator } from "./src/tool-orchestrator";
export { ResultAggregator } from "./src/result-aggregator";
export { TestSuiteCoordinator } from "./src/test-suite-coordinator";

// Type exports
export type {
  AgentCoordinationPattern,
  OrchestrationOptions,
  FeatureContext,
  QualityControlContext,
  OrchestrationResult,
  QualityControlResult,
  AgentResult,
  ConsensusResult,
  HealthcareCompliance,
  OrchestrationMetrics,
  SystemStatus,
  CommandExample,
  TDDOrchestrationSystem,
  ToolExecutionRequest,
  ToolExecutionResult,
} from "./types";

// Additional type exports for new components
