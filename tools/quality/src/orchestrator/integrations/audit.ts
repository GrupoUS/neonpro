/**
 * 📝 Audit Integration for TDD Orchestrator
 * ========================================
 *
 * Integrates the TDD Orchestrator with the audit system to log
 * orchestration events, agent executions, and quality gate results.
 *
 * Note: Adapts orchestration events to the existing AI audit interface
 */

import { AuditEventInput, writeAudit } from '../../../../../packages/core-services/src/audit/writer'
import {
  AgentName,
  AgentResult,
  OrchestrationState,
  OrchestratorEvent,
  QualityGateStatus,
  TDDPhase,
} from '../types'

export interface OrchestrationAuditConfig {
  enableOrchestrationEvents: boolean
  enableAgentEvents: boolean
  enableQualityGateEvents: boolean
  enablePhaseTransitions: boolean
  logLevel: 'minimal' | 'standard' | 'detailed'
}

export class OrchestrationAudit {
  private config: OrchestrationAuditConfig

  constructor(config: OrchestrationAuditConfig) {
    this.config = config
  }

  /**
   * Log orchestration start event
   */
  async logOrchestrationStart(state: OrchestrationState): Promise<void> {
    if (!this.config.enableOrchestrationEvents) return

    const auditEvent: AuditEventInput = {
      action: 'query',
      _userId: 'orchestrator',
      outcome: 'success',
      queryType: `orchestration-start-${state.workflow}`,
      latencyMs: 0,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log orchestration completion event
   */
  async logOrchestrationComplete(
    state: OrchestrationState,
    success: boolean,
    duration: number,
  ): Promise<void> {
    if (!this.config.enableOrchestrationEvents) return

    const auditEvent: AuditEventInput = {
      action: 'suggestions',
      _userId: 'orchestrator',
      outcome: success ? 'success' : 'error',
      queryType: `orchestration-complete-${state.workflow}`,
      latencyMs: duration,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log TDD phase transition
   */
  async logPhaseTransition(
    orchestrationId: string,
    _fromPhase: TDDPhase | null,
    toPhase: TDDPhase,
    _iteration: number,
  ): Promise<void> {
    if (!this.config.enablePhaseTransitions) return

    const auditEvent: AuditEventInput = {
      action: 'query',
      _userId: 'orchestrator',
      outcome: 'success',
      queryType: `phase-transition-${toPhase}`,
      sessionId: orchestrationId,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log agent execution
   */
  async logAgentExecution(
    orchestrationId: string,
    agentResult: AgentResult,
  ): Promise<void> {
    if (!this.config.enableAgentEvents) return

    const auditEvent: AuditEventInput = {
      action: 'explanation',
      _userId: 'orchestrator',
      outcome: agentResult.status === 'success' ? 'success' : 'error',
      queryType: `agent-${agentResult.agent}`,
      sessionId: orchestrationId,
      latencyMs: agentResult.duration,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log quality gate result
   */
  async logQualityGateResult(
    orchestrationId: string,
    gateName: string,
    status: QualityGateStatus,
    _details?: Record<string, any>,
  ): Promise<void> {
    if (!this.config.enableQualityGateEvents) return

    const auditEvent: AuditEventInput = {
      action: 'suggestions',
      _userId: 'orchestrator',
      outcome: status === 'passed' ? 'success' : 'error',
      queryType: `quality-gate-${gateName}`,
      sessionId: orchestrationId,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log orchestrator event
   */
  async logOrchestratorEvent(event: OrchestratorEvent): Promise<void> {
    const auditEvent: AuditEventInput = {
      action: 'query',
      _userId: 'orchestrator',
      outcome: 'success',
      queryType: `orchestrator-${event.type}`,
      sessionId: event.orchestrationId,
    }

    await writeAudit(auditEvent)
  }

  /**
   * Log error or warning
   */
  async logError(
    orchestrationId: string,
    error: Error,
    context: {
      agent?: AgentName
      phase?: TDDPhase
      operation?: string
    },
  ): Promise<void> {
    const auditEvent: AuditEventInput = {
      action: 'query',
      _userId: 'orchestrator',
      outcome: 'error',
      queryType: `error-${context.operation || 'unknown'}`,
      sessionId: orchestrationId,
    }

    await writeAudit(auditEvent)
  }
}

// Default configuration
export const defaultAuditConfig: OrchestrationAuditConfig = {
  enableOrchestrationEvents: true,
  enableAgentEvents: true,
  enableQualityGateEvents: true,
  enablePhaseTransitions: true,
  logLevel: 'standard',
}

// Singleton instance
export const orchestrationAudit = new OrchestrationAudit(defaultAuditConfig)
