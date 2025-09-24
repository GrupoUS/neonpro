export { type OrchestrationStep, TOOL_WORKFLOWS, type ToolWorkflow } from './src/config';
export { orchestrateTools } from './src/orchestrator';

// TDD Orchestration System exports
export { TDDAgentRegistry } from './src/agent-registry';
export { createTDDOrchestrationSystem } from './src/orchestration-system';
export { QualityControlBridge } from './src/quality-control-bridge';
export { QualityControlOrchestrator } from './src/quality-control-orchestrator';
export { TDDOrchestrator } from './src/tdd-orchestrator';
export { executeQualityControl, runTDDCycle } from './src/utils';
export { WorkflowEngine } from './src/workflow-engine';

// New orchestration components
export { ExecutionPatternSelector } from './src/execution-pattern-selector';
export { ResultAggregator } from './src/result-aggregator';
export { TestSuiteCoordinator } from './src/test-suite-coordinator';
export { ToolOrchestrator } from './src/tool-orchestrator';

// Type exports
export type {
  AgentCoordinationPattern,
  AgentResult,
  CommandExample,
  ConsensusResult,
  FeatureContext,
  HealthcareCompliance,
  OrchestrationMetrics,
  OrchestrationOptions,
  OrchestrationResult,
  QualityControlContext,
  QualityControlResult,
  SystemStatus,
  TDDOrchestrationSystem,
  ToolExecutionRequest,
  ToolExecutionResult,
} from './types';

// Additional type exports for new components
