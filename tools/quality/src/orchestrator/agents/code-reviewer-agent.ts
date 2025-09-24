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
 * Code Reviewer Agent - Responsible for code quality analysis and improvement
 * Focuses on maintainability, readability, and best practices
 */
export class CodeReviewerAgent extends BaseAgent {
  constructor() {
    super('code-reviewer' as AgentName)
  }

  /**
   * Check if agent can handle the given phase and context
   */
  canHandle(phase: TDDPhase, _context: FeatureContext): boolean {
    // Code reviewer is most active during green and refactor phases
    return ['green', 'refactor'].includes(phase)
  }

  /**
   * Execute phase-specific code review operations
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
        case 'green':
          await this.executeGreenPhase(context, findings, recommendations)
          break
        case 'refactor':
          await this.executeRefactorPhase(context, findings, recommendations)
          break
        case 'red':
          // Limited involvement in red phase - mainly test code review
          await this.executeRedPhase(context, findings, recommendations)
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
          codeQualityIssues: findings.filter((f) => f.type === 'code-quality')
            .length,
          refactoringOpportunities: findings.filter(
            (f) => f.type === 'refactoring-quality',
          ).length,
          criticalIssues: findings.filter((f) => f.severity === 'critical')
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
            'code-quality',
            `Code review failed: ${errorMessage}`,
            'high',
            context.files?.implementation || 'unknown',
            'Review code analysis tools and dependencies',
          ),
        ],
        recommendations: [
          this.createRecommendation(
            'code-improvement',
            `Fix code review issue: ${errorMessage}`,
            'high',
            'Debug and resolve the code analysis infrastructure problem',
          ),
        ],
        metrics: { executionTime: Date.now() - startTime, errorCount: 1 },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Execute RED phase - Review test code quality
   */
  private async executeRedPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Review test code structure and quality
    if (context.files?.tests) {
      findings.push(
        this.createFinding(
          'test-quality',
          'Review test code structure and naming conventions',
          'info',
          context.files.tests,
          'Ensure tests follow naming conventions and are well-structured',
        ),
      )

      // Check for test maintainability
      recommendations.push(
        this.createRecommendation(
          'test-strategy',
          'Ensure test code follows project standards',
          'medium',
          'Apply consistent naming, structure, and documentation patterns to test code',
        ),
      )
    }

    // High complexity features need extra test review attention
    if (complexityLevel > 6) {
      recommendations.push(
        this.createRecommendation(
          'test-strategy',
          'Complex features require comprehensive test coverage planning',
          'high',
          'Plan test scenarios for edge cases, error conditions, and integration points',
        ),
      )
    }
  }

  /**
   * Execute GREEN phase - Review implementation code quality
   */
  private async executeGreenPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Basic code quality checks
    if (context.files?.implementation) {
      findings.push(
        this.createFinding(
          'code-quality',
          'Review implementation for basic quality standards',
          'info',
          context.files.implementation,
          'Check for proper error handling, naming conventions, and code structure',
        ),
      )
    }

    // Security-critical code needs extra scrutiny
    if (context.securityCritical) {
      findings.push(
        this.createFinding(
          'code-quality',
          'Security-critical code requires enhanced review',
          'high',
          context.files?.implementation || 'src/',
          'Perform thorough security-focused code review including input validation and data handling',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'code-improvement',
          'Apply security best practices in implementation',
          'high',
          'Implement proper input validation, error handling, and secure coding patterns',
        ),
      )
    }

    // Performance considerations for complex features
    if (complexityLevel > 7) {
      findings.push(
        this.createFinding(
          'performance',
          'High complexity implementation may have performance implications',
          'medium',
          context.files?.implementation || 'src/',
          'Review algorithms, data structures, and resource usage for optimization opportunities',
        ),
      )
    }

    // Check for minimal implementation principle
    recommendations.push(
      this.createRecommendation(
        'code-improvement',
        'Ensure implementation follows minimal viable approach',
        'medium',
        'Avoid over-engineering and implement only what is necessary to pass tests',
      ),
    )
  }

  /**
   * Execute REFACTOR phase - Comprehensive code quality improvement
   */
  private async executeRefactorPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Comprehensive code quality analysis
    if (context.files?.implementation) {
      findings.push(
        this.createFinding(
          'refactoring-quality',
          'Analyze code for refactoring opportunities',
          'info',
          context.files.implementation,
          'Look for code duplication, complex methods, and opportunities for abstraction',
        ),
      )
    }

    // Maintainability improvements
    recommendations.push(
      this.createRecommendation(
        'code-improvement',
        'Improve code maintainability and readability',
        'medium',
        'Refactor complex methods, extract reusable components, and improve naming',
      ),
    )

    // Domain-specific improvements
    if (context.domain.includes('api')) {
      recommendations.push(
        this.createRecommendation(
          'code-improvement',
          'Apply API-specific best practices',
          'medium',
          'Ensure proper error handling, validation, and response formatting for API endpoints',
        ),
      )
    }

    if (context.domain.includes('database')) {
      recommendations.push(
        this.createRecommendation(
          'performance',
          'Optimize database interactions',
          'medium',
          'Review queries for efficiency, implement proper indexing, and consider caching strategies',
        ),
      )
    }

    // Compliance requirements
    if (context.complianceRequirements.length > 0) {
      findings.push(
        this.createFinding(
          'compliance',
          'Verify compliance requirements are met',
          'high',
          context.files?.implementation || 'src/',
          'Ensure implementation meets all specified compliance requirements',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'compliance',
          'Document compliance implementation',
          'high',
          'Add documentation and comments explaining how compliance requirements are addressed',
        ),
      )
    }

    // Technical debt identification
    if (complexityLevel > 8) {
      findings.push(
        this.createFinding(
          'refactoring-quality',
          'High complexity may indicate technical debt',
          'medium',
          context.files?.implementation || 'src/',
          'Consider breaking down complex components and improving separation of concerns',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'code-improvement',
          'Address technical debt in complex implementation',
          'high',
          'Refactor complex code into smaller, more manageable components with clear responsibilities',
        ),
      )
    }
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'code-quality-analysis',
      'refactoring-recommendations',
      'maintainability-assessment',
      'performance-analysis',
      'security-code-review',
      'compliance-verification',
      'technical-debt-identification',
      'best-practices-enforcement',
    ]
  }

  /**
   * Get agent configuration
   */
  getConfiguration(): Record<string, any> {
    return {
      supportedPhases: ['green', 'refactor', 'red'],
      primaryPhases: ['green', 'refactor'],
      codeAnalysisTools: ['eslint', 'sonarqube', 'codeclimate'],
      qualityMetrics: [
        'complexity',
        'maintainability',
        'duplication',
        'coverage',
      ],
      qualityThresholds: {
        cyclomaticComplexity: 10,
        maintainabilityIndex: 70,
        duplicationPercentage: 5,
        codeSmells: 0,
      },
      timeout: 180000, // 3 minutes
      retryAttempts: 2,
    }
  }
}
