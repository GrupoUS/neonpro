/**
 * 🎭 TDD Orchestrator Types
 * ========================
 *
 * Core type definitions for the multi-agent TDD orchestration system
 */

// Agent Types
export type AgentName =
  | 'apex-dev'
  | 'test'
  | 'compliance-validator'
  | 'code-reviewer'
  | 'security-auditor'
  | 'architect-review'
  | 'tdd-orchestrator'
  | 'test-auditor'
  | 'custom-agent'
  | 'tertiary-agent'
  | 'non-existent-agent'

export type TDDPhase = 'red' | 'green' | 'refactor'

export type WorkflowType =
  | 'standard'
  | 'security-critical'
  | 'microservices'
  | 'legacy'

export type ComplexityLevel = 'low' | 'medium' | 'high'

export type QualityGateStatus = 'pending' | 'passed' | 'failed' | 'skipped'

// Complexity Level Utilities
export function normalizeComplexity(
  complexity: number | ComplexityLevel,
): number {
  if (typeof complexity === 'number') {
    return complexity
  }

  switch (complexity) {
    case 'low':
      return 1
    case 'medium':
      return 5
    case 'high':
      return 9
    default:
      return 1
  }
}

export function getComplexityLevel(
  complexity: number | ComplexityLevel,
): ComplexityLevel {
  if (typeof complexity === 'string') {
    return complexity
  }

  if (complexity <= 3) return 'low'
  if (complexity <= 7) return 'medium'
  return 'high'
}

// Domain Utilities
export function normalizeDomain(domain: string | string[]): string[] {
  return Array.isArray(domain) ? domain : [domain]
}

export type MessageType =
  | 'analysis'
  | 'recommendation'
  | 'validation'
  | 'error'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

// Feature Context
export interface FeatureContext {
  name: string
  description: string
  domain: string | string[]
  complexity: number | ComplexityLevel
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedEffort: number
  dependencies: string[]
  requirements?: string[]
  securityCritical: boolean
  complianceRequirements: string[]
  acceptanceCriteria: string[]
  files: {
    implementation?: string
    tests?: string
    documentation?: string
  }
}

// TDD Cycle State
export interface TDDCycleState {
  phase: TDDPhase
  iteration: number
  testStatus: 'failing' | 'passing' | 'optimizing'
  startTime: Date
  phaseStartTime: Date
}

// Agent State
export interface AgentState {
  active: AgentName[]
  completed: AgentName[]
  pending: AgentName[]
  failed: AgentName[]
}

// Quality Gates
export interface QualityGates {
  architecture: QualityGateStatus
  security: QualityGateStatus
  codeQuality: QualityGateStatus
  testCoverage: QualityGateStatus
  performance: QualityGateStatus
  compliance: QualityGateStatus
}

// Orchestration State
export interface OrchestrationState {
  id: string
  feature: FeatureContext
  tddCycle: TDDCycleState
  agents: AgentState
  qualityGates: QualityGates
  workflow: WorkflowType
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Agent Communication
export interface AgentMessage {
  id: string
  sender: AgentName | 'orchestrator'
  receiver: AgentName | 'orchestrator' | 'broadcast'
  type: MessageType
  priority: Priority
  context: {
    phase: TDDPhase
    feature: string
    files: string[]
    iteration: number
  }
  payload: Record<string, any>
  timestamp: Date
}

// Agent Capabilities
export interface AgentCapabilities {
  name: AgentName
  phases: TDDPhase[]
  specializations: string[]
  triggers: string[]
  dependencies: AgentName[]
  parallelizable: boolean
}

// Workflow Configuration
export interface WorkflowConfig {
  name?: string
  description?: string
  type?: WorkflowType
  phases: {
    [K in TDDPhase]: PhaseConfig
  }
  qualityGates?: string[]
  triggers?: string[]
  complianceRequirements?: string[]
}

/**
 * Finding types for agent results
 */
export type FindingType =
  | 'test-creation'
  | 'test-validation'
  | 'test-stability'
  | 'test-quality'
  | 'code-quality'
  | 'refactoring-quality'
  | 'architecture-design'
  | 'architecture-implementation'
  | 'architecture-improvement'
  | 'security-test-requirements'
  | 'security-implementation'
  | 'security-refactoring'
  | 'performance'
  | 'compliance'

/**
 * Recommendation types for agent results
 */
export type RecommendationType =
  | 'test-strategy'
  | 'code-improvement'
  | 'security-testing'
  | 'architecture'
  | 'performance'
  | 'compliance'
  | 'error'

/**
 * Finding from agent analysis
 */
export interface Finding {
  type: FindingType
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info'
  description: string
  location: string
  suggestion: string
}

/**
 * Recommendation from agent analysis
 */
export interface Recommendation {
  type: RecommendationType
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action: string
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  enabled: boolean
  timeout: number
  retryAttempts: number
  capabilities: string[]
  triggers: string[]
}

/**
 * Phase configuration for workflows
 */
export interface PhaseConfig {
  agents: AgentName[]
  qualityGates: string[]
  parallelizable: boolean
  timeout: number
  retryAttempts: number
}

/**
 * Agent result from execution
 */
export interface AgentResult {
  agent: AgentName
  phase: TDDPhase
  status: 'success' | 'failure' | 'warning' | 'skipped'
  findings: Finding[]
  recommendations: Recommendation[]
  metrics: Record<string, number>
  duration: number
  timestamp: Date
}

// Workflow Engine Configuration
export interface WorkflowEngineConfig {
  workflows: {
    [K in WorkflowType]: WorkflowConfig
  }
  defaultTimeout: number
  retryAttempts: number
}

// Orchestrator Configuration
export interface OrchestratorConfig {
  agents: {
    [K in AgentName]: {
      enabled: boolean
      timeout: number
      retries: number
      config: Record<string, any>
    }
  }
  workflows: {
    [K in WorkflowType]: WorkflowConfig
  }
  qualityGates: {
    thresholds: Record<string, number>
    required: string[]
    optional: string[]
  }
  communication: {
    maxRetries: number
    timeout: number
    bufferSize: number
  }
  monitoring: {
    enabled: boolean
    metricsEndpoint?: string
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

// Event Types
export interface OrchestratorEvent {
  type:
    | 'workflow-started'
    | 'phase-changed'
    | 'agent-completed'
    | 'quality-gate-failed'
    | 'workflow-completed'
  orchestrationId: string
  timestamp: Date
  data: Record<string, any>
}

// Metrics
export interface OrchestrationMetrics {
  orchestrationId: string
  workflow: WorkflowType
  feature: string
  totalDuration: number
  phaseDurations: Record<TDDPhase, number>
  agentDurations: Record<AgentName, number>
  qualityGateResults: QualityGates
  findingsCount: Record<string, number>
  recommendationsCount: Record<string, number>
  success: boolean
  timestamp: Date
}
