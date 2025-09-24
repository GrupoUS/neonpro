import type {
  AgentName,
  AgentResult,
  FeatureContext,
  Finding,
  Recommendation,
  TDDPhase,
} from '../types'
import { normalizeComplexity } from '../types'
import { BaseAgent } from './base-agent'

/**
 * Test Agent - Responsible for test creation, validation, and quality
 * Handles all TDD phases with focus on test-first development
 */
export class TestAgent extends BaseAgent {
  constructor() {
    super('test' as AgentName)
  }

  /**
   * Check if agent can handle the given phase and context
   */
  canHandle(phase: TDDPhase, _context: FeatureContext): boolean {
    // Test agent can handle all TDD phases
    return ['red', 'green', 'refactor'].includes(phase)
  }

  /**
   * Execute phase-specific test operations
   */
  protected async executePhase(
    phase: TDDPhase,
    context: FeatureContext,
  ): Promise<AgentResult> {
    const startTime = Date.now()
    const findings: Finding[] = []
    const recommendations: Recommendation[] = []

    try {
      switch (phase) {
        case 'red':
          await this.executeRedPhase(context, findings, recommendations)
          break
        case 'green':
          await this.executeGreenPhase(context, findings, recommendations)
          break
        case 'refactor':
          await this.executeRefactorPhase(context, findings, recommendations)
          break
        default:
          throw new Error(`Unsupported phase: ${phase}`)
      }

      return {
        agent: this.agentType,
        phase,
        status: 'success',
        findings,
        recommendations,
        metrics: {
          executionTime: Date.now() - startTime,
          testsCreated: findings.filter((f) => f.type === 'test-creation')
            .length,
          testQualityIssues: findings.filter((f) => f.type === 'test-quality')
            .length,
        },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        agent: this.agentType,
        phase,
        status: 'failure',
        findings: [
          this.createFinding(
            'test-creation',
            `Test execution failed: ${errorMessage}`,
            'high',
            context.files?.tests || 'unknown',
            'Review test setup and dependencies',
          ),
        ],
        recommendations: [
          this.createRecommendation(
            'test-strategy',
            `Fix test execution issue: ${errorMessage}`,
            'high',
            'Debug and resolve the underlying test infrastructure problem',
          ),
        ],
        metrics: { executionTime: Date.now() - startTime, errorCount: 1 },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Execute RED phase - Create failing tests
   */
  private async executeRedPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Analyze acceptance criteria for test creation
    if (
      !context.acceptanceCriteria
      || context.acceptanceCriteria.length === 0
    ) {
      findings.push(
        this.createFinding(
          'test-creation',
          'No acceptance criteria defined for feature',
          'high',
          context.name,
          'Define clear acceptance criteria before creating tests',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'test-strategy',
          'Define acceptance criteria to guide test creation',
          'high',
          'Work with stakeholders to define clear, testable acceptance criteria',
        ),
      )
      return
    }

    // Validate test structure and coverage
    for (const criteria of context.acceptanceCriteria) {
      findings.push(
        this.createFinding(
          'test-creation',
          `Test needed for: ${criteria}`,
          'info',
          context.files?.tests || 'tests/',
          'Create failing test that validates this acceptance criteria',
        ),
      )
    }

    // Check for edge cases and error scenarios
    if (complexityLevel > 5) {
      recommendations.push(
        this.createRecommendation(
          'test-strategy',
          'High complexity feature requires comprehensive edge case testing',
          'medium',
          'Include tests for boundary conditions, error scenarios, and performance edge cases',
        ),
      )
    }

    // Security-critical features need additional test coverage
    if (context.securityCritical) {
      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Security-critical feature requires security-focused tests',
          'high',
          'Include tests for authentication, authorization, input validation, and data protection',
        ),
      )
    }
  }

  /**
   * Execute GREEN phase - Validate test implementation
   */
  private async executeGreenPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Check if tests are now passing
    findings.push(
      this.createFinding(
        'test-validation',
        'Verify all tests pass with minimal implementation',
        'info',
        context.files?.implementation || 'src/',
        'Ensure implementation is minimal and focused on making tests pass',
      ),
    )

    // Validate implementation quality
    if (complexityLevel > 7) {
      findings.push(
        this.createFinding(
          'test-stability',
          'High complexity implementation may have stability issues',
          'medium',
          context.files?.implementation || 'src/',
          'Add integration tests to verify system stability',
        ),
      )
    }

    // Check for over-engineering
    recommendations.push(
      this.createRecommendation(
        'code-improvement',
        'Ensure implementation is minimal and focused',
        'medium',
        'Avoid over-engineering - implement only what is needed to pass tests',
      ),
    )
  }

  /**
   * Execute REFACTOR phase - Improve test quality and maintainability
   */
  private async executeRefactorPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Check test maintainability
    findings.push(
      this.createFinding(
        'test-quality',
        'Review test maintainability and readability',
        'info',
        context.files?.tests || 'tests/',
        'Ensure tests are clear, maintainable, and follow testing best practices',
      ),
    )

    // Suggest test improvements
    recommendations.push(
      this.createRecommendation(
        'test-strategy',
        'Optimize test structure and remove duplication',
        'medium',
        'Refactor tests to improve readability, reduce duplication, and enhance maintainability',
      ),
    )

    // Performance considerations for complex features
    if (complexityLevel > 6) {
      recommendations.push(
        this.createRecommendation(
          'performance',
          'Consider performance testing for complex features',
          'medium',
          'Add performance benchmarks and load testing for high-complexity features',
        ),
      )
    }

    // Documentation recommendations
    if (
      context.domain.includes('api')
      || context.domain.includes('integration')
    ) {
      recommendations.push(
        this.createRecommendation(
          'test-strategy',
          'Document test scenarios and API contracts',
          'low',
          'Create documentation for test scenarios and API contract validation',
        ),
      )
    }
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'test-creation',
      'test-validation',
      'test-quality-analysis',
      'acceptance-criteria-validation',
      'edge-case-identification',
      'security-test-planning',
      'performance-test-planning',
      'test-maintainability',
    ]
  }

  /**
   * Get agent configuration
   */
  getConfiguration(): Record<string, any> {
    return {
      supportedPhases: ['red', 'green', 'refactor'],
      testFrameworks: ['jest', 'vitest', 'cypress', 'playwright'],
      testTypes: ['unit', 'integration', 'e2e', 'performance', 'security'],
      qualityThresholds: {
        coverage: 90,
        complexity: 10,
        maintainability: 8,
      },
      timeout: 300000, // 5 minutes
      retryAttempts: 2,
    }
  }
}
