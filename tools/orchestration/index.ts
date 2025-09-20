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
export { WorkflowEngine } from "./src/workflow-engine";
export { TDDAgentRegistry } from "./src/tdd-agent-registry";

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
} from "./src/types";
