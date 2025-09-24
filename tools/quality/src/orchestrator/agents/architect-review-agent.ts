import type {
  AgentName,
  AgentResult,
  ComplexityLevel,
  FeatureContext,
  Finding,
  Recommendation,
  TDDPhase,
} from '../types'
import { normalizeComplexity } from '../types'
import { BaseAgent } from './base-agent'

/**
 * Architect Review Agent - Responsible for architectural design validation
 * Focuses on system design, scalability, and architectural best practices
 */
export class ArchitectReviewAgent extends BaseAgent {
  constructor() {
    super('architect-review' as AgentName)
  }

  /**
   * Check if agent can handle the given phase and context
   */
  canHandle(phase: TDDPhase, context: FeatureContext): boolean {
    // Architect review is valuable in all phases but most critical during refactor
    // Also important for complex features and system-level changes
    const complexityLevel = normalizeComplexity(context.complexity)
    const domainArray = Array.isArray(context.domain)
      ? context.domain
      : [context.domain]
    return (
      complexityLevel >= 5
      || domainArray.includes('architecture')
      || domainArray.includes('system')
      || context.domain.includes('integration')
    )
  }

  /**
   * Execute phase-specific architectural review operations
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
          architecturalIssues: findings.filter((f) => f.type.startsWith('architecture')).length,
          designRecommendations: recommendations.filter(
            (r) => r.type === 'architecture',
          ).length,
          complexityScore: normalizeComplexity(context.complexity),
          scalabilityIssues: findings.filter((f) => f.description.includes('scalability')).length,
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
            'architecture-design',
            `Architectural review failed: ${errorMessage}`,
            'high',
            context.files?.implementation || 'unknown',
            'Review architectural analysis tools and system dependencies',
          ),
        ],
        recommendations: [
          this.createRecommendation(
            'architecture',
            `Fix architectural review issue: ${errorMessage}`,
            'high',
            'Debug and resolve the architectural analysis infrastructure problem',
          ),
        ],
        metrics: { executionTime: Date.now() - startTime, errorCount: 1 },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Execute RED phase - Architectural test planning and design validation
   */
  private async executeRedPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    // Validate architectural test requirements
    const complexityLevel = normalizeComplexity(context.complexity)
    if (complexityLevel >= 7) {
      findings.push(
        this.createFinding(
          'architecture-design',
          'High complexity feature requires architectural test planning',
          'medium',
          context.files?.tests || 'tests/',
          'Plan integration tests and system-level validation for architectural components',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Design comprehensive architectural testing strategy',
          'high',
          'Include integration tests, contract tests, and system boundary validation',
        ),
      )
    }

    // Microservices architecture considerations
    if (
      context.domain.includes('microservices')
      || context.domain.includes('api')
    ) {
      findings.push(
        this.createFinding(
          'architecture-design',
          'Microservices feature requires service boundary validation',
          'high',
          context.files?.tests || 'tests/',
          'Design tests for service contracts, communication patterns, and failure scenarios',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Implement service contract testing',
          'high',
          'Add contract tests to validate service interfaces and communication protocols',
        ),
      )
    }

    // Database and persistence layer considerations
    if (
      context.domain.includes('database')
      || context.domain.includes('persistence')
    ) {
      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Plan data layer testing strategy',
          'medium',
          'Include tests for data consistency, transaction boundaries, and migration scenarios',
        ),
      )
    }

    // Security architecture for critical features
    if (context.securityCritical) {
      findings.push(
        this.createFinding(
          'architecture-design',
          'Security-critical feature requires architectural security validation',
          'critical',
          context.files?.tests || 'tests/',
          'Design security tests for authentication, authorization, and data protection boundaries',
        ),
      )
    }
  }

  /**
   * Execute GREEN phase - Implementation architecture validation
   */
  private async executeGreenPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Validate implementation follows architectural patterns
    if (context.files?.implementation) {
      findings.push(
        this.createFinding(
          'architecture-implementation',
          'Validate implementation follows established architectural patterns',
          'info',
          context.files.implementation,
          'Ensure implementation adheres to system architecture and design principles',
        ),
      )
    }

    // Dependency management and coupling analysis
    if (context.dependencies.length > 3) {
      findings.push(
        this.createFinding(
          'architecture-implementation',
          'High number of dependencies may indicate tight coupling',
          'medium',
          context.files?.implementation || 'src/',
          'Review dependencies and consider dependency injection or abstraction patterns',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Reduce coupling through dependency abstraction',
          'medium',
          'Implement dependency injection or interface-based abstractions to reduce coupling',
        ),
      )
    }

    // Performance architecture considerations
    if (complexityLevel >= 8) {
      findings.push(
        this.createFinding(
          'performance',
          'High complexity implementation may have performance architecture implications',
          'medium',
          context.files?.implementation || 'src/',
          'Review performance characteristics and consider caching, async patterns, or optimization',
        ),
      )
    }

    // Scalability considerations
    if (context.domain.includes('api') || context.domain.includes('service')) {
      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Consider scalability patterns for service implementation',
          'medium',
          'Implement patterns like circuit breakers, rate limiting, or async processing for scalability',
        ),
      )
    }
  }

  /**
   * Execute REFACTOR phase - Comprehensive architectural improvement
   */
  private async executeRefactorPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[],
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity)

    // Comprehensive architectural analysis
    findings.push(
      this.createFinding(
        'architecture-improvement',
        'Analyze architectural quality and improvement opportunities',
        'info',
        context.files?.implementation || 'src/',
        'Review system design, patterns, and architectural principles compliance',
      ),
    )

    // SOLID principles validation
    recommendations.push(
      this.createRecommendation(
        'architecture',
        'Validate SOLID principles compliance',
        'medium',
        'Ensure implementation follows Single Responsibility, Open/Closed, and other SOLID principles',
      ),
    )

    // Design patterns application
    if (complexityLevel >= 6) {
      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Consider appropriate design patterns for complex implementation',
          'medium',
          'Apply relevant design patterns like Strategy, Factory, or Observer to improve maintainability',
        ),
      )
    }

    // System integration patterns
    if (context.domain.includes('integration')) {
      findings.push(
        this.createFinding(
          'architecture-improvement',
          'Integration feature requires robust error handling and resilience patterns',
          'high',
          context.files?.implementation || 'src/',
          'Implement retry mechanisms, circuit breakers, and graceful degradation patterns',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Implement integration resilience patterns',
          'high',
          'Add retry logic, timeout handling, and fallback mechanisms for external integrations',
        ),
      )
    }

    // Data architecture considerations
    if (
      context.domain.includes('database')
      || context.domain.includes('data')
    ) {
      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Optimize data access patterns and caching strategy',
          'medium',
          'Implement efficient data access patterns, consider caching layers, and optimize queries',
        ),
      )
    }

    // Security architecture improvements
    if (context.securityCritical) {
      findings.push(
        this.createFinding(
          'architecture-improvement',
          'Security-critical feature requires architectural security review',
          'critical',
          context.files?.implementation || 'src/',
          'Validate security boundaries, access controls, and data protection mechanisms',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Strengthen security architecture',
          'critical',
          'Implement defense in depth, principle of least privilege, and secure communication patterns',
        ),
      )
    }

    // Compliance architecture
    if (context.complianceRequirements.length > 0) {
      findings.push(
        this.createFinding(
          'compliance',
          'Compliance requirements need architectural validation',
          'high',
          context.files?.implementation || 'src/',
          'Ensure architectural design supports all compliance requirements',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'compliance',
          'Implement compliance-aware architectural patterns',
          'high',
          'Design audit trails, data retention policies, and access logging as architectural components',
        ),
      )
    }

    // Technical debt and maintainability
    if (complexityLevel >= 9) {
      findings.push(
        this.createFinding(
          'architecture-improvement',
          'Very high complexity indicates potential architectural technical debt',
          'high',
          context.files?.implementation || 'src/',
          'Consider architectural refactoring to reduce complexity and improve maintainability',
        ),
      )

      recommendations.push(
        this.createRecommendation(
          'architecture',
          'Address architectural technical debt',
          'high',
          'Refactor into smaller components, improve separation of concerns, and apply architectural patterns',
        ),
      )
    }
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'architectural-design-validation',
      'system-integration-analysis',
      'scalability-assessment',
      'performance-architecture-review',
      'security-architecture-validation',
      'compliance-architecture-review',
      'design-pattern-recommendations',
      'technical-debt-architectural-analysis',
      'microservices-architecture-review',
      'data-architecture-optimization',
    ]
  }

  /**
   * Get agent configuration
   */
  getConfiguration(): Record<string, any> {
    return {
      supportedPhases: ['red', 'green', 'refactor'],
      primaryPhases: ['refactor'],
      complexityThreshold: 5,
      architecturalPatterns: [
        'microservices',
        'layered',
        'hexagonal',
        'event-driven',
        'cqrs',
        'saga',
        'circuit-breaker',
        'bulkhead',
      ],
      qualityAttributes: [
        'scalability',
        'performance',
        'security',
        'maintainability',
        'reliability',
        'availability',
        'testability',
      ],
      analysisTools: ['sonarqube', 'archunit', 'dependency-cruiser'],
      timeout: 240000, // 4 minutes
      retryAttempts: 2,
    }
  }
}
