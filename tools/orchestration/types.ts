/**
 * Type definitions for TDD Orchestration Framework
 * 
 * Defines interfaces and types for agent coordination, workflow management,
 * and TDD cycle orchestration with healthcare compliance support.
 */

// Core TDD Phases
export type TDDPhase = 'red' | 'green' | 'refactor';

// Agent Types (matching code review agents)
export type AgentName = 
  | 'tdd-orchestrator'
  | 'architect-review' 
  | 'code-reviewer'
  | 'security-auditor'
  | 'test';

// Workflow Types
export type WorkflowType = 
  | 'standard-tdd'
  | 'security-critical-tdd'
  | 'microservices-tdd' 
  | 'legacy-tdd'
  | 'healthcare-tdd';

// Orchestration Types
export type OrchestrationType =
  | 'full-cycle'
  | 'phase-specific'
  | 'agent-specific'
  | 'workflow-specific';

// Feature Context
export interface FeatureContext {
  name: string;
  complexity: 'low' | 'medium' | 'high';
  domain: string[];
  requirements: string[];
  files?: string[];
  dependencies?: string[];
}

// Agent Capability Definition
export interface AgentCapability {
  name: AgentName;
  description: string;
  specializations: string[];
  triggers: string[];
  phases: {
    red?: AgentAction[];
    green?: AgentAction[];
    refactor?: AgentAction[];
  };
  qualityGates: QualityGate[];
}

// Agent Action
export interface AgentAction {
  id: string;
  description: string;
  command?: string;
  expectedOutput: string;
  timeout: number;
  retries: number;
}

// Quality Gate Definition
export interface QualityGate {
  id: string;
  name: string;
  description: string;
  threshold: number;
  metric: string;
  required: boolean;
}

// Agent Task
export interface AgentTask {
  agent: AgentName;
  phase: TDDPhase;
  action: AgentAction;
  context: FeatureContext;
  dependencies?: string[];
  priority: number;
}

// Agent Result
export interface AgentResult {
  agent: AgentName;
  task: AgentTask;
  success: boolean;
  duration: number;
  output: string;
  metrics?: Record<string, any>;
  qualityGateResults?: QualityGateResult[];
  errors?: string[];
  warnings?: string[];
}

// Quality Gate Result
export interface QualityGateResult {
  gate: QualityGate;
  passed: boolean;
  actualValue: number;
  threshold: number;
  message?: string;
}

// Orchestration State
export interface OrchestrationState {
  feature: FeatureContext;
  currentPhase: TDDPhase;
  iteration: number;
  testStatus: 'failing' | 'passing' | 'optimizing';
  agents: {
    active: AgentName[];
    completed: AgentName[];
    pending: AgentName[];
    failed: AgentName[];
  };
  qualityGates: {
    [agentName: string]: QualityGateStatus;
  };
  metrics: OrchestrationMetrics;
}

// Quality Gate Status
export interface QualityGateStatus {
  agent: AgentName;
  gates: QualityGateResult[];
  overallPassed: boolean;
  score: number;
}

// Orchestration Metrics
export interface OrchestrationMetrics {
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  phaseMetrics: {
    [phase in TDDPhase]: {
      duration: number;
      agentCount: number;
      qualityScore: number;
      iterationsCount: number;
    };
  };
  agentMetrics: {
    [agent: string]: {
      activations: number;
      totalDuration: number;
      successRate: number;
      qualityContribution: number;
    };
  };
  workflowEfficiency: number;
  overallQualityScore: number;
}

// Workflow Configuration
export interface WorkflowConfig {
  type: WorkflowType;
  name: string;
  description: string;
  phases: {
    [phase in TDDPhase]: PhaseConfig;
  };
  qualityGates: QualityGate[];
  agentCoordination: AgentCoordinationConfig;
}

// Phase Configuration
export interface PhaseConfig {
  primaryAgent: AgentName;
  supportAgents: AgentName[];
  executionMode: 'sequential' | 'parallel' | 'mixed';
  maxIterations: number;
  timeoutMinutes: number;
  requiredQualityScore: number;
}

// Agent Coordination Configuration
export interface AgentCoordinationConfig {
  communicationProtocol: 'message-passing' | 'shared-state' | 'event-driven';
  conflictResolution: 'priority-based' | 'consensus' | 'coordinator-decides';
  stateSharing: {
    featureSpec: boolean;
    codeChanges: boolean;
    testSuite: boolean;
    qualityMetrics: boolean;
    securityFindings: boolean;
  };
}

// Orchestration Options
export interface OrchestrationOptions {
  type: OrchestrationType;
  feature: FeatureContext;
  workflow?: WorkflowType;
  phase?: TDDPhase;
  agents?: AgentName[];
  allAgents?: boolean;
  parallel?: boolean;
  healthcare?: boolean;
  securityCritical?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  timeout?: number;
  maxIterations?: number;
}

// Communication Message
export interface AgentMessage {
  sender: AgentName;
  receiver: AgentName | 'broadcast';
  type: 'analysis' | 'recommendation' | 'validation' | 'coordination';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: {
    phase: TDDPhase;
    feature: string;
    files: string[];
  };
  payload: any;
  timestamp: Date;
  correlationId: string;
}

// Orchestration Result
export interface OrchestrationResult {
  success: boolean;
  feature: FeatureContext;
  workflow: WorkflowType;
  duration: number;
  phases: {
    [phase in TDDPhase]: PhaseResult;
  };
  overallQualityScore: number;
  metrics: OrchestrationMetrics;
  recommendations: string[];
  nextActions: string[];
  errors?: string[];
}

// Phase Result
export interface PhaseResult {
  phase: TDDPhase;
  success: boolean;
  duration: number;
  iterations: number;
  agentResults: AgentResult[];
  qualityScore: number;
  testStatus: 'failing' | 'passing' | 'optimizing';
  codeChanges: string[];
  recommendations: string[];
}

// Quality Assessment
export interface QualityAssessment {
  overallScore: number; // 0-100
  phaseScores: {
    [phase in TDDPhase]: number;
  };
  agentContributions: {
    [agentName: string]: {
      issuesFound: number;
      improvementsSuggested: number;
      qualityImpact: number;
    };
  };
  complianceStatus: {
    healthcare: boolean;
    lgpd: boolean;
    security: boolean;
  };
  recommendations: string[];
  nextActions: string[];
}

// Healthcare Compliance Context
export interface HealthcareComplianceContext {
  lgpdRequired: boolean;
  anvisaRequired: boolean;
  cfmRequired: boolean;
  patientDataInvolved: boolean;
  auditTrailRequired: boolean;
  performanceThreshold: number; // ms
  dataRetentionPolicies: string[];
}

// Error Types
export class OrchestrationError extends Error {
  constructor(
    message: string,
    public agent?: AgentName,
    public phase?: TDDPhase,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

export class AgentTimeoutError extends Error {
  constructor(
    public agent: AgentName,
    public timeout: number
  ) {
    super(`Agent ${agent} timed out after ${timeout}ms`);
    this.name = 'AgentTimeoutError';
  }
}

export class QualityGateError extends Error {
  constructor(
    message: string,
    public gate: QualityGate,
    public actualValue: number,
    public threshold: number
  ) {
    super(message);
    this.name = 'QualityGateError';
  }
}