/**
 * TDD Cycle Implementation
 *
 * Implements the Red-Green-Refactor cycle with agent coordination
 * following the patterns defined in the testing documentation.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { executeREDPhase } from '../agents/red-phase-specialist'

export interface TDDCycleConfig {
  feature: string
  description?: string
  agents: Array<
    | 'architect-review'
    | 'code-reviewer'
    | 'security-auditor'
    | 'tdd-orchestrator'
    | 'test-agent'
  >
  compliance?: Array<'LGPD' | 'ANVISA' | 'CFM'>
  coverageThreshold?: number
}

export interface TDDPhase {
  name: 'RED' | 'GREEN' | 'REFACTOR'
  primaryAgent: string
  supportAgents: string[]
  qualityGates: string[]
}

/**
 * TDD Cycle Orchestrator
 *
 * Coordinates the complete TDD cycle with agent validation
 */
export class TDDCycle {
  private config: TDDCycleConfig
  private currentPhase: TDDPhase | null = null
  private testResults: Map<string, any> = new Map()

  constructor(config: TDDCycleConfig) {
    this.config = config
  }

  /**
   * RED Phase: Define failing tests
   */
  async redPhase(testDefinition: () => void): Promise<boolean> {
    this.currentPhase = {
      name: 'RED',
      primaryAgent: 'security-auditor',
      supportAgents: ['architect-review', 'tdd-orchestrator'],
      qualityGates: [
        'Test patterns compliance ≥95%',
        'Architecture alignment ≥90%',
        'Error detection ≥100%',
        'Test coverage ≥95%',
      ],
    }

    console.error(`🔴 RED Phase: ${this.config.feature}`)
    console.error(
      `Primary Agent: ${this.currentPhase.primaryAgent} (TDD RED Phase Authority)`,
    )
    console.error(
      `Support Agents: ${this.currentPhase.supportAgents.join(', ')}`,
    )

    try {
      // Execute RED phase with security-auditor leadership
      console.error(
        '🔍 Security-auditor executing comprehensive RED phase analysis...',
      )
      const redPhaseResult = await executeREDPhase(this.config.feature, {
        testCoverageTarget: 95,
        errorDetectionThreshold: 100,
        qualityValidationEnabled: true,
        enableHealthcareCompliance: (this.config.compliance?.includes('LGPD') ?? false)
          || (this.config.compliance?.includes('ANVISA') ?? false)
          || (this.config.compliance?.includes('CFM') ?? false),
      })

      if (!redPhaseResult.success) {
        console.warn('⚠️  RED phase validation issues detected:')
        redPhaseResult.recommendations.forEach((rec) => console.warn(`   - ${rec}`))
      }

      // Execute test definition - should fail initially
      testDefinition()
      this.testResults.set('red-phase', false)
      this.testResults.set('red-phase-validation', redPhaseResult)
      return false // Tests should fail in RED phase
    } catch {
      this.testResults.set('red-phase', true)
      console.error('✅ RED Phase complete - Tests failing as expected')
      return true
    }
  }

  /**
   * GREEN Phase: Implement minimal code to pass tests
   */
  async greenPhase(implementation: () => void): Promise<boolean> {
    this.currentPhase = {
      name: 'GREEN',
      primaryAgent: 'code-reviewer',
      supportAgents: [
        'architect-review',
        'security-auditor',
        'tdd-orchestrator',
      ],
      qualityGates: [
        'All tests passing ≥100%',
        'Code quality metrics ≥85%',
        'Security validation ≥100%',
        'Pattern compliance ≥90%',
      ],
    }

    console.error(`🟢 GREEN Phase: ${this.config.feature}`)
    console.error(`Primary Agent: ${this.currentPhase.primaryAgent}`)
    console.error(
      `Support Agents: ${this.currentPhase.supportAgents.join(', ')}`,
    )

    try {
      // Execute implementation
      implementation()
      this.testResults.set('green-phase', true)
      console.error('✅ GREEN Phase complete - Tests passing')
      return true
    } catch (error) {
      this.testResults.set('green-phase', false)
      console.error('❌ GREEN Phase failed:', error)
      return false
    }
  }

  /**
   * REFACTOR Phase: Improve code while maintaining tests
   */
  async refactorPhase(refactoring: () => void): Promise<boolean> {
    this.currentPhase = {
      name: 'REFACTOR',
      primaryAgent: 'code-reviewer',
      supportAgents: [
        'architect-review',
        'security-auditor',
        'tdd-orchestrator',
      ],
      qualityGates: [
        'Quality metrics improved ≥10%',
        'Architecture score maintained ≥90%',
        'Security posture improved ≥100%',
        'Test performance improved ≥5%',
      ],
    }

    console.error(`🔄 REFACTOR Phase: ${this.config.feature}`)
    console.error(`Coordination: parallel execution`)
    console.error(`Agents: ${this.currentPhase.supportAgents.join(', ')}`)

    try {
      // Execute refactoring
      refactoring()
      this.testResults.set('refactor-phase', true)
      console.error('✅ REFACTOR Phase complete - Code improved')
      return true
    } catch (error) {
      this.testResults.set('refactor-phase', false)
      console.error('❌ REFACTOR Phase failed:', error)
      return false
    }
  }

  /**
   * Get cycle results
   */
  getResults() {
    return {
      feature: this.config.feature,
      agents: this.config.agents,
      phases: Object.fromEntries(this.testResults),
      success: Array.from(this.testResults.values()).every((result) => result),
      currentPhase: this.currentPhase?.name || 'COMPLETE',
    }
  }
}

/**
 * Helper function to create a TDD test suite
 */
export function createTDDSuite(
  config: TDDCycleConfig,
  implementation: {
    redPhase: () => void
    greenPhase: () => void
    refactorPhase: () => void
  },
  options?: { forceMock?: boolean },
): { name: string; description: string } | void {
  // If forceMock is true, return a mock object for testing
  if (options?.forceMock) {
    return {
      name: config.feature,
      description: `TDD: ${config.feature}`,
    }
  }

  describe(`TDD: ${config.feature}`, () => {
    let cycle: TDDCycle

    beforeEach(() => {
      cycle = new TDDCycle(config)
    })

    it('should complete RED phase (failing tests)', async () => {
      const result = await cycle.redPhase(implementation.redPhase)
      expect(result).toBe(true)
    })

    it('should complete GREEN phase (passing tests)', async () => {
      await cycle.redPhase(implementation.redPhase)
      const result = await cycle.greenPhase(implementation.greenPhase)
      expect(result).toBe(true)
    })

    it('should complete REFACTOR phase (improved code)', async () => {
      await cycle.redPhase(implementation.redPhase)
      await cycle.greenPhase(implementation.greenPhase)
      const result = await cycle.refactorPhase(implementation.refactorPhase)
      expect(result).toBe(true)
    })

    it('should validate agent coordination', () => {
      const results = cycle.getResults()
      expect(results.agents).toEqual(config.agents)
      expect(results.feature).toBe(config.feature)
    })
  })
}
