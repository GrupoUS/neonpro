/**
 * Agent Types and Interfaces
 *
 * Type definitions for agent coordination and testing workflows.
 */

export type AgentType =
  | 'architect-review'
  | 'code-reviewer'
  | 'security-auditor'
  | 'tdd-orchestrator'
  | 'test-agent';

export type CoordinationPattern = 'sequential' | 'parallel' | 'hierarchical';

export interface AgentCapability {
  name: string;
  description: string;
  specialties: string[];
  qualityGates: string[];
}

export interface QualityGate {
  name: string;
  threshold: number;
  critical: boolean;
}

export interface AgentMetrics {
  [key: string]: number;
}

export interface AgentExecution {
  agent: AgentType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success: boolean;
  metrics: AgentMetrics;
  issues: string[];
  recommendations: string[];
}

export interface CoordinationResult {
  pattern: CoordinationPattern;
  agents: AgentType[];
  executions: AgentExecution[];
  overallSuccess: boolean;
  totalDuration: number;
  summary: string;
}
