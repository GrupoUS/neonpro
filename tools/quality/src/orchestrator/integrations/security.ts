/**
 * Security Integration for TDD Orchestrator
 *
 * Provides basic security validation and monitoring for orchestration operations.
 * Focuses on orchestration-specific security concerns.
 */

import type { AgentMessage, AgentName, OrchestrationState } from '../types'

interface SecurityConfig {
  maxExecutionTime: number
  allowedAgents: AgentName[]
  enableValidation: boolean
  maxMessageSize: number
}

interface SecurityReport {
  orchestrationId: string
  securityChecks: number
  validationFailures: number
  timeoutViolations: number
  suspiciousActivity: boolean
  riskLevel: 'low' | 'medium' | 'high'
}

export class OrchestrationSecurity {
  private config: SecurityConfig
  private sessionMetrics: Map<
    string,
    {
      checks: number
      failures: number
      timeouts: number
    }
  > = new Map()

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxExecutionTime: 300000, // 5 minutes
      allowedAgents: [
        'apex-dev',
        'code-reviewer',
        'architect-review',
        'security-auditor',
      ],
      enableValidation: true,
      maxMessageSize: 1024 * 1024, // 1MB
      ...config,
    }
  }

  /**
   * Validates an orchestration state before execution
   */
  async validateOrchestrationState(
    state: OrchestrationState,
  ): Promise<boolean> {
    try {
      // Basic validation
      if (!state.workflow || !state.feature) {
        this.recordValidationFailure(state.id)
        return false
      }

      // Check if agents are allowed
      const activeAgents = state.agents.active
      if (activeAgents && activeAgents.length > 0) {
        const unauthorizedAgents = activeAgents.filter(
          (agent) => !this.config.allowedAgents.includes(agent),
        )
        if (unauthorizedAgents.length > 0) {
          this.recordValidationFailure(state.id)
          return false
        }
      }

      this.recordSecurityCheck(state.id)
      return true
    } catch (error) {
      console.error('Security validation error:', error)
      return false
    }
  }

  /**
   * Validates agent execution parameters
   */
  async validateAgentExecution(
    agentName: AgentName,
    message: AgentMessage,
    orchestrationId: string,
  ): Promise<boolean> {
    try {
      // Check if agent is allowed
      if (!this.config.allowedAgents.includes(agentName)) {
        this.recordValidationFailure(orchestrationId)
        return false
      }

      // Validate message payload
      if (!message.payload || typeof message.payload !== 'object') {
        this.recordValidationFailure(orchestrationId)
        return false
      }

      // Check message size (approximate)
      const messageSize = JSON.stringify(message.payload).length
      if (messageSize > this.config.maxMessageSize) {
        this.recordValidationFailure(orchestrationId)
        return false
      }

      this.recordSecurityCheck(orchestrationId)
      return true
    } catch (error) {
      console.error('Agent execution validation error:', error)
      return false
    }
  }

  /**
   * Checks for execution timeout violations
   */
  checkExecutionTimeout(startTime: number, orchestrationId: string): boolean {
    const elapsed = Date.now() - startTime
    const isTimeout = elapsed > this.config.maxExecutionTime

    if (isTimeout) {
      this.recordTimeoutViolation(orchestrationId)
    }

    return isTimeout
  }

  /**
   * Generates a security report for an orchestration session
   */
  generateSecurityReport(orchestrationId: string): SecurityReport {
    const metrics = this.sessionMetrics.get(orchestrationId) || {
      checks: 0,
      failures: 0,
      timeouts: 0,
    }

    const riskLevel = this.calculateRiskLevel(metrics)

    return {
      orchestrationId,
      securityChecks: metrics.checks,
      validationFailures: metrics.failures,
      timeoutViolations: metrics.timeouts,
      suspiciousActivity: metrics.failures > 3 || metrics.timeouts > 1,
      riskLevel,
    }
  }

  /**
   * Cleans up session metrics
   */
  cleanupSession(orchestrationId: string): void {
    this.sessionMetrics.delete(orchestrationId)
  }

  private recordSecurityCheck(orchestrationId: string): void {
    const metrics = this.sessionMetrics.get(orchestrationId) || {
      checks: 0,
      failures: 0,
      timeouts: 0,
    }
    metrics.checks++
    this.sessionMetrics.set(orchestrationId, metrics)
  }

  private recordValidationFailure(orchestrationId: string): void {
    const metrics = this.sessionMetrics.get(orchestrationId) || {
      checks: 0,
      failures: 0,
      timeouts: 0,
    }
    metrics.failures++
    this.sessionMetrics.set(orchestrationId, metrics)
  }

  private recordTimeoutViolation(orchestrationId: string): void {
    const metrics = this.sessionMetrics.get(orchestrationId) || {
      checks: 0,
      failures: 0,
      timeouts: 0,
    }
    metrics.timeouts++
    this.sessionMetrics.set(orchestrationId, metrics)
  }

  private calculateRiskLevel(metrics: {
    checks: number
    failures: number
    timeouts: number
  }): 'low' | 'medium' | 'high' {
    if (metrics.failures > 5 || metrics.timeouts > 2) {
      return 'high'
    }
    if (metrics.failures > 2 || metrics.timeouts > 0) {
      return 'medium'
    }
    return 'low'
  }
}

// Default configuration
export const defaultSecurityConfig: SecurityConfig = {
  maxExecutionTime: 300000, // 5 minutes
  allowedAgents: [
    'apex-dev',
    'code-reviewer',
    'architect-review',
    'security-auditor',
  ],
  enableValidation: true,
  maxMessageSize: 1024 * 1024, // 1MB
}

// Singleton instance
export const orchestrationSecurity = new OrchestrationSecurity(
  defaultSecurityConfig,
)
