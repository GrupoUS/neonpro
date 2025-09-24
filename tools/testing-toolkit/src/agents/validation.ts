/**
 * Agent Validation Utilities
 *
 * Provides validation functions for agent coordination and quality gates.
 */

import { QUALITY_GATES } from './index'
import type { AgentMetrics, AgentType } from './types'

/**
 * Validate agent metrics against quality gates
 */
export function validateAgentMetrics(
  agent: AgentType,
  metrics: AgentMetrics,
): {
  passed: boolean
  failures: string[]
  score: number
} {
  const gateKey = agent
    .toUpperCase()
    .replace('-', '_') as keyof typeof QUALITY_GATES
  const gates = QUALITY_GATES[gateKey]

  if (!gates) {
    return { passed: true, failures: [], score: 100 }
  }

  const failures: string[] = []
  let totalScore = 0
  let gateCount = 0

  Object.entries(gates).forEach(([metric, threshold]) => {
    const value = metrics[metric]
    if (value === undefined) return

    gateCount++

    if (metric === 'vulnerabilities') {
      // Lower is better for vulnerabilities
      if (value > threshold) {
        failures.push(`${metric}: ${value} exceeds threshold of ${threshold}`)
        totalScore += 0
      } else {
        totalScore += 100
      }
    } else {
      // Higher is better for other metrics
      if (value < threshold) {
        failures.push(`${metric}: ${value} below threshold of ${threshold}`)
        totalScore += (value / threshold) * 100
      } else {
        totalScore += 100
      }
    }
  })

  const score = gateCount > 0 ? totalScore / gateCount : 100

  return {
    passed: failures.length === 0,
    failures,
    score: Math.round(score),
  }
}

/**
 * Validate TDD cycle compliance
 */
export function validateTDDCycle(phases: Record<string, boolean>): {
  compliant: boolean
  missingPhases: string[]
  completionRate: number
} {
  const requiredPhases = ['red-phase', 'green-phase', 'refactor-phase']
  const missingPhases = requiredPhases.filter((phase) => !phases[phase])
  const completedPhases = requiredPhases.filter((phase) => phases[phase])

  return {
    compliant: missingPhases.length === 0,
    missingPhases,
    completionRate: (completedPhases.length / requiredPhases.length) * 100,
  }
}

/**
 * Validate healthcare compliance requirements
 */
export function validateHealthcareCompliance(data: any): {
  compliant: boolean
  violations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
} {
  const violations: string[] = []

  // LGPD compliance checks
  if (!data.consentGiven) {
    violations.push('Missing patient consent (LGPD violation)')
  }

  if (!data.dataProcessingPurpose) {
    violations.push('Missing data processing purpose (LGPD violation)')
  }

  if (
    !data.auditTrail
    || !Array.isArray(data.auditTrail)
    || data.auditTrail.length === 0
  ) {
    violations.push(
      'Missing or incomplete audit trail (LGPD/ANVISA violation)',
    )
  }

  if (
    !data.incidentReports
    || !Array.isArray(data.incidentReports)
    || data.incidentReports.length === 0
  ) {
    violations.push(
      'Missing incident response records (LGPD/ANVISA violation)',
    )
  }

  if (!data.dataRetentionPolicy) {
    violations.push('Missing data retention policy (LGPD violation)')
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (violations.length > 0) {
    if (violations.some((v) => v.includes('consent') || v.includes('audit'))) {
      riskLevel = 'critical'
    } else if (violations.length > 2) {
      riskLevel = 'high'
    } else {
      riskLevel = 'medium'
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    riskLevel,
  }
}

/**
 * Generate agent recommendations based on validation results
 */
export function generateAgentRecommendations(
  agent: AgentType,
  _metrics: AgentMetrics,
  validationResult: ReturnType<typeof validateAgentMetrics>,
): string[] {
  const recommendations: string[] = []

  if (!validationResult.passed) {
    validationResult.failures.forEach((failure) => {
      const [metric] = failure.split(':')

      switch (agent) {
        case 'architect-review':
          if (metric === 'patterns') {
            recommendations.push(
              'Review and improve architectural patterns compliance',
            )
          } else if (metric === 'scalability') {
            recommendations.push(
              'Address scalability concerns in system design',
            )
          }
          break

        case 'code-reviewer':
          if (metric === 'quality') {
            recommendations.push(
              'Improve code quality metrics (complexity, maintainability)',
            )
          } else if (metric === 'performance') {
            recommendations.push('Optimize performance bottlenecks')
          }
          break

        case 'security-auditor':
          if (metric === 'error-detection') {
            recommendations.push(
              'Improve error detection and test coverage in RED phase',
            )
          } else if (metric === 'test-coverage') {
            recommendations.push(
              'Increase test coverage to meet ≥95% threshold',
            )
          } else if (metric === 'quality-validation') {
            recommendations.push(
              'Enhance test quality validation and maintainability',
            )
          } else if (metric === 'red-phase-compliance') {
            recommendations.push(
              'Ensure full compliance with TDD RED phase requirements',
            )
          }
          break

        case 'tdd-orchestrator':
          if (metric === 'coverage') {
            recommendations.push('Increase test coverage for critical paths')
          } else if (metric === 'patterns') {
            recommendations.push('Follow TDD patterns more consistently')
          }
          break
      }
    })
  }

  // General recommendations based on score
  if (validationResult.score < 70) {
    recommendations.push(
      `${agent} requires significant improvement (score: ${validationResult.score}%)`,
    )
  } else if (validationResult.score < 85) {
    recommendations.push(
      `${agent} needs minor improvements (score: ${validationResult.score}%)`,
    )
  }

  return recommendations
}
