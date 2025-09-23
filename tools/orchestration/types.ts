/**
 * Core types for TDD orchestration system
 */

export type AgentCoordinationPattern =
  | "parallel"
  | "sequential"
  | "hierarchical"
  | "event-driven"
  | "consensus";

export type WorkflowType =
  | "standard-tdd"
  | "security-critical"
  | "performance-focused"
  | "healthcare-compliant";

export interface ToolExecutionRequest {
  id: string;
  toolName: string;
  action: string;
  parameters: Record<string, any>;
  context: FeatureContext;
  timeout: number;
  priority: "low" | "medium" | "high";
  retries: number;
  dependencies?: string[];
  resources?: {
    memory: number;
    cpu: number;
    disk: number;
  };
  metadata?: Record<string, any>;
}

export interface ToolExecutionResult {
  id: string;
  success: boolean;
  result?: any;
  output?: any;
  duration: number;
  errors?: string[];
  warnings?: string[];
  error?: string;
}

export interface AggregatedResult {
  overall: {
    success: boolean;
    qualityScore: number;
    performance: number;
    coverage: number;
    complianceScore: number;
  };
  byAgent: Record<string, AgentResult>;
  byPhase: Record<string, any>;
  trends: {
    quality: number[];
    performance: number[];
    coverage: number[];
  };
}

export interface ResultAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceScore: number;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
}

export interface AgentCapability {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  specializations: string[];
  priority: "primary" | "secondary" | "tertiary";
  phases: TDDPhase[];
  triggers: string[];
  configuration: Record<string, any>;
  healthcareCompliance?: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}

export interface OrchestrationContext {
  featureName: string;
  featureType: string;
  complexity: "low" | "medium" | "high";
  criticalityLevel: "low" | "medium" | "high" | "critical";
  requirements: string[];
  healthcareCompliance: {
    required: boolean;
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}

export type AgentType =
  | "tdd-orchestrator"
  | "architect-review"
  | "code-reviewer"
  | "security-auditor"
  | "test"
  | "test-auditor"
  | "custom-agent"
  | "tertiary-agent"
  | "non-existent-agent";

export type AgentName = AgentType;

export type TDDPhase = "red" | "green" | "refactor";

export interface AgentStats {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution: Date | null;
}

export interface AgentResult {
  agentName: string;
  success: boolean;
  result: any;
  duration: number;
  quality?: {
    score: number;
    issues: string[];
  };
  metrics?: {
    quality?: number;
    performance?: number;
    coverage?: number;
    complianceScore?: number;
    vulnerabilities?: any;
    issues?: any;
    memoryUsage?: any;
    cpuUsage?: number;
  };
  errors?: string[];
  warnings?: string[];
  healthcareCompliance?: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
    compliant: boolean;
  };
}

export interface ConsensusResult {
  agreement: number;
  conflicts: number;
  resolution: string;
}

export interface HealthcareCompliance {
  lgpd: boolean | { compliant: boolean; score: number };
  anvisa: boolean | { compliant: boolean; score: number };
  cfm: boolean | { compliant: boolean; score: number };
  score: number;
}

export interface OrchestrationResult {
  success: boolean;
  phases: string[];
  agentResults: AgentResult[];
  coordination: AgentCoordinationPattern;
  consensusResult?: ConsensusResult;
  healthcareCompliance?: HealthcareCompliance;
  duration: number;
}

export interface OrchestrationMetrics {
  snapshot: {
    orchestration: {
      totalExecutions: number;
      averageExecutionTime: number;
    };
    agent: {
      totalAgentExecutions: number;
      agentPerformance: Record<string, number>;
    };
    quality: {
      overallQualityScore: number;
      qualityTrends: string[];
    };
    performance: {
      averageExecutionTime: number;
      throughput: number;
    };
    healthcare: {
      lgpdCompliance: number;
      anvisaCompliance: number;
      cfmCompliance: number;
    };
  };
}

export interface SystemStatus {
  system: string;
  version: string;
  status: "ready" | "busy" | "error";
  components: {
    orchestrator: string;
    agentRegistry: string;
    workflowEngine: string;
    qualityControlBridge: string;
  };
  capabilities: {
    multiAgentCoordination: boolean;
    parallelExecution: boolean;
    qualityControlIntegration: boolean;
    healthcareCompliance: boolean;
    metricsCollection: boolean;
    realtimeCommunication: boolean;
  };
  healthcareMode: boolean;
}

export interface CommandExample {
  availableCommands: string[];
  examples: string[];
  workflows: string[];
  agents: Array<{
    name: string;
    type: string;
    capabilities: string[];
  }>;
}

export interface TDDOrchestrationSystem {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  orchestrator: any;
  qualityControlBridge: any;
  workflowEngine: any;
  agentRegistry: any;
  communication?: any;
  complianceValidator?: any;
  getMetrics(): OrchestrationMetrics;
  getStatus(): SystemStatus;
  getCommandExamples(): CommandExample;
  validateCompliance(
    context: any,
    agentResults: AgentResult[],
  ): Promise<HealthcareCompliance>;
}

export interface QualityControlContext {
  action: string;
  type: string;
  depth?: string;
  parallel?: boolean;
  agents?: AgentType[];
  coordination?: AgentCoordinationPattern;
  healthcare?: boolean;
  target?: string;
  orchestrator?: boolean;
}

export interface QualityControlResult {
  success: boolean;
  command: string;
  orchestrationResult?: OrchestrationResult;
  duration: number;
  qualityScore?: number;
  complianceStatus?: {
    required: boolean;
    lgpd?: boolean;
    anvisa?: boolean;
    cfm?: boolean;
  };
}

export interface OrchestrationOptions {
  workflow: string;
  coordination: AgentCoordinationPattern;
  agents: string[];
  healthcare?: boolean;
  enableMetrics?: boolean;
  enableCompliance?: boolean;
}

export interface FeatureContext {
  name: string;
  description: string;
  domain: string[];
  complexity: "low" | "medium" | "high";
  requirements: string[];
  acceptance?: string[];
  healthcareCompliance?: boolean;
}

export interface TDDCycleResult {
  success: boolean;
  phases: TDDPhase[];
  duration: number;
  agentResults: AgentResult[];
  qualityScore: number;
  complianceScore: number;
  coordination?: AgentCoordinationPattern;
  consensusResult?: ConsensusResult;
  healthcareCompliance?: {
    required: boolean;
    lgpd?: boolean;
    anvisa?: boolean;
    cfm?: boolean;
  };
  // Additional properties expected by tests
  cycleId?: string;
  red?: any;
  green?: any;
  refactor?: any;
  metrics?: any;
  error?: string;
  errors?: string[];
  warnings?: string[];
}

export interface WorkflowEngine {
  executeWorkflow(context: OrchestrationContext): Promise<OrchestrationResult>;
  getAvailableWorkflows(): string[];
  validateWorkflow(workflow: string): boolean;
}

export interface TDDOrchestrator {
  executeTDDCycle(context: OrchestrationContext): Promise<TDDCycleResult>;
  executeFullTDDCycle(
    feature: FeatureContext,
    options?: any,
  ): Promise<TDDCycleResult>;
  getPhaseStatus(): TDDPhase;
  pauseExecution(): void;
  resumeExecution(): void;
}

export interface AgentRegistry {
  registerAgent(agent: any): void;
  getAgent(name: string): any;
  getAllAgents(): any[];
}
