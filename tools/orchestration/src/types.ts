export type AgentCoordinationPattern = "parallel" | "sequential" | "hierarchical" | "event-driven" | "consensus";

// Agent and workflow type definitions
export type AgentName = "test" | "code-reviewer" | "security-auditor" | "architect-review" | "tdd-orchestrator" | "test-auditor" | "custom-agent" | "tertiary-agent" | "non-existent-agent";
export type WorkflowType = "parallel" | "sequential" | "hierarchical" | "event-driven";

// Re-export types from agent-registry
export type { AgentCapability, OrchestrationContext, AgentType, TDDPhase, AgentStats } from './agent-registry';

export type OrchestrationOptions = {
  workflow: string;
  coordination: AgentCoordinationPattern;
  agents: string[];
  healthcare?: boolean;
  enableMetrics?: boolean;
  enableCompliance?: boolean;
};

export type FeatureContext = {
  name: string;
  description: string;
  domain: string[];
  complexity: "low" | "medium" | "high";
  requirements: string[];
  acceptance?: string[];
  healthcareCompliance?: boolean;
};

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
};

export type QualityControlContext = {
  action: string;
  type: string;
  depth?: string;
  parallel?: boolean;
  agents?: AgentName[];
  coordination?: AgentCoordinationPattern;
  healthcare?: boolean;
  target?: string;
  orchestrator?: boolean;
};

export type OrchestrationResult = {
  success: boolean;
  phases: string[];
  agentResults: AgentResult[];
  coordination: AgentCoordinationPattern;
  consensusResult?: ConsensusResult;
  healthcareCompliance?: HealthcareCompliance;
  duration: number;
};

export type QualityControlResult = {
  success: boolean;
  command: string;
  orchestrationResult?: OrchestrationResult;
  duration: number;
};

export type AgentResult = {
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
};

export type ConsensusResult = {
  agreement: number;
  conflicts: number;
  resolution: string;
};

export type HealthcareCompliance = {
  lgpd: boolean | { compliant: boolean; score: number };
  anvisa: boolean | { compliant: boolean; score: number };
  cfm: boolean | { compliant: boolean; score: number };
  score: number;
};

export type OrchestrationMetrics = {
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
};

export type SystemStatus = {
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
};

export type CommandExample = {
  availableCommands: string[];
  examples: string[];
  workflows: string[];
  agents: Array<{
    name: string;
    type: string;
    capabilities: string[];
  }>;
};

export type TDDOrchestrationSystem = {
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
  validateCompliance(context: any, agentResults: AgentResult[]): Promise<HealthcareCompliance>;
};

// Re-export WorkflowEngine and AgentRegistry interfaces for test compatibility
export interface WorkflowEngine {
  executeWorkflow(context: OrchestrationContext): Promise<OrchestrationResult>;
  getAvailableWorkflows(): string[];
  validateWorkflow(workflow: string): boolean;
}

export interface AgentRegistry {
  registerAgent(agent: any): void;
  getAgent(name: string): any;
  getAllAgents(): any[];
  initializeDefaultAgents(): void;
  agentStats: Map<string, any>;
}