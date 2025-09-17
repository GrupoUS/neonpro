import { BaseAgent } from './base-agent';
import type {
  AgentName,
  TDDPhase,
  AgentResult,
  FeatureContext,
  Finding,
  Recommendation,
  RecommendationType
} from '../types';
import { normalizeComplexity } from '../types';

/**
 * Security Auditor Agent - Responsible for security validation and compliance
 * Focuses on vulnerability detection, security best practices, and compliance requirements
 */
export class SecurityAuditorAgent extends BaseAgent {
  constructor() {
    super('security-auditor' as AgentName);
  }

  /**
   * Check if agent can handle the given phase and context
   */
  canHandle(phase: TDDPhase, context: FeatureContext): boolean {
    // Security auditor is critical for security-sensitive features
    // Also important for compliance requirements and high-risk domains
    return context.securityCritical ||
           context.complianceRequirements.length > 0 ||
           context.domain.includes('auth') ||
           context.domain.includes('payment') ||
           context.domain.includes('data') ||
           context.domain.includes('api') ||
           context.domain.includes('user');
  }

  /**
   * Execute phase-specific security audit operations
   */
  protected async executePhase(phase: TDDPhase, context: FeatureContext): Promise<AgentResult> {
    const startTime = performance.now();
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];

    try {
      switch (phase) {
        case 'red':
          await this.executeRedPhase(context, findings, recommendations);
          break;
        case 'green':
          await this.executeGreenPhase(context, findings, recommendations);
          break;
        case 'refactor':
          await this.executeRefactorPhase(context, findings, recommendations);
          break;
        default:
          throw new Error(`Unsupported phase: ${phase}`);
      }

      return {
        agent: this.agentType,
        phase,
        status: 'success',
        findings,
        recommendations,
        metrics: {
          executionTime: Math.max(1, Math.round(performance.now() - startTime)),
          securityIssues: findings.filter(f => f.type.startsWith('security')).length,
          vulnerabilities: findings.filter(f => f.severity === 'critical' || f.severity === 'high').length,
          complianceIssues: findings.filter(f => f.type === 'compliance').length,
          securityRecommendations: recommendations.filter(r => r.type === 'security-testing').length,
          riskScore: this.calculateRiskScore(findings)
        },
        duration: Math.max(1, Math.round(performance.now() - startTime)),
        timestamp: new Date()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        agent: this.agentType,
        phase,
        status: 'failure',
        findings: [
          this.createFinding(
          'security-implementation',
          `Security audit failed: ${errorMessage}`,
          'high',
          context.files?.implementation || 'unknown',
          'Review security analysis tools and audit infrastructure'
        )
        ],
        recommendations: [
          this.createRecommendation(
          'security-testing',
          `Fix security audit issue: ${errorMessage}`,
          'high',
          'Debug and resolve the security audit infrastructure problem'
        )
        ],
        metrics: { executionTime: Math.max(1, Math.round(performance.now() - startTime)), errorCount: 1 },
        duration: Math.max(1, Math.round(performance.now() - startTime)),
        timestamp: new Date()
      };
    }
  }

  /**
   * Execute RED phase - Security test planning and threat modeling
   */
  private async executeRedPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[]
  ): Promise<void> {
    // Security test planning for critical features
    if (context.securityCritical) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Security-critical feature requires comprehensive security test planning',
          'critical',
          context.files?.tests || 'tests/',
          'Plan security tests including authentication, authorization, input validation, and data protection'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Design comprehensive security testing strategy',
          'critical',
          'Include penetration testing, security unit tests, and vulnerability scanning in test plan'
        )
      );
    }

    // Authentication and authorization testing
    if (context.domain.includes('auth') || context.domain.includes('user')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Authentication/authorization feature requires security test coverage',
          'high',
          context.files?.tests || 'tests/',
          'Design tests for authentication bypass, privilege escalation, and session management'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Implement authentication security tests',
          'high',
          'Add tests for token validation, session security, and access control mechanisms'
        )
      );
    }

    // Data protection and privacy testing
    if (context.domain.includes('data') || context.domain.includes('user')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Data handling feature requires privacy and protection test planning',
          'high',
          context.files?.tests || 'tests/',
          'Plan tests for data encryption, access controls, and privacy compliance'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Design data protection testing strategy',
          'high',
          'Include tests for data encryption, anonymization, and access logging'
        )
      );
    }

    // API security testing
    if (context.domain.includes('api')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'API feature requires security boundary testing',
          'high',
          context.files?.tests || 'tests/',
          'Plan tests for input validation, rate limiting, and API security headers'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Implement API security testing',
          'high',
          'Add tests for injection attacks, rate limiting, and API authentication'
        )
      );
    }

    // Payment and financial security
    if (context.domain.includes('payment') || context.domain.includes('financial')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Financial feature requires PCI DSS compliance testing',
          'critical',
          context.files?.tests || 'tests/',
          'Plan comprehensive financial security tests including PCI DSS compliance validation'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Implement PCI DSS compliance testing',
          'critical',
          'Add tests for payment data protection, secure transmission, and audit logging'
        )
      );
    }

    // Compliance requirements testing
    if (context.complianceRequirements.length > 0) {
      for (const requirement of context.complianceRequirements) {
        findings.push(
          this.createFinding(
            'compliance',
            `Compliance requirement ${requirement} needs security test coverage`,
            'high',
            context.files?.tests || 'tests/',
            `Design tests to validate ${requirement} compliance requirements`
          )
        );
      }

      recommendations.push(
        this.createRecommendation(
          'compliance',
          'Implement compliance validation testing',
          'high',
          'Add automated tests to validate all compliance requirements and generate audit reports'
        )
      );
    }
  }

  /**
   * Execute GREEN phase - Implementation security validation
   */
  private async executeGreenPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[]
  ): Promise<void> {
    // Input validation and sanitization
    if (context.files?.implementation) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Validate input sanitization and validation in implementation',
          'high',
          context.files.implementation,
          'Ensure all user inputs are properly validated and sanitized to prevent injection attacks'
        )
      );
    }

    // Authentication implementation validation
    if (context.domain.includes('auth')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Authentication implementation requires security validation',
          'critical',
          context.files?.implementation || 'src/',
          'Validate secure password handling, token generation, and session management'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Strengthen authentication security',
          'critical',
          'Implement secure password hashing, strong token generation, and secure session handling'
        )
      );
    }

    // Data encryption and protection
    if (context.domain.includes('data') || context.securityCritical) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Data handling implementation requires encryption validation',
          'high',
          context.files?.implementation || 'src/',
          'Ensure sensitive data is encrypted at rest and in transit with proper key management'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Implement data encryption best practices',
          'high',
          'Use strong encryption algorithms, secure key management, and proper data classification'
        )
      );
    }

    // API security implementation
    if (context.domain.includes('api')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'API implementation requires security header and rate limiting validation',
          'medium',
          context.files?.implementation || 'src/',
          'Validate security headers, rate limiting, and API authentication mechanisms'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Implement API security best practices',
          'medium',
          'Add security headers, implement rate limiting, and validate all API inputs'
        )
      );
    }

    // Error handling and information disclosure
    findings.push(
      this.createFinding(
        'security-implementation',
        'Validate error handling does not expose sensitive information',
        'medium',
        context.files?.implementation || 'src/',
        'Ensure error messages do not reveal system internals or sensitive data'
      )
    );

    recommendations.push(
      this.createRecommendation(
        'security-testing' as RecommendationType,
        'Implement secure error handling',
        'medium',
        'Ensure error messages do not leak sensitive information and implement proper logging'
      )
    );

    // Dependency security validation
    if (context.dependencies.length > 0) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Dependencies require security vulnerability scanning',
          'medium',
          'package.json',
          'Scan all dependencies for known security vulnerabilities and update as needed'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Implement dependency security scanning',
          'high',
          'Add automated dependency vulnerability scanning and update processes'
        )
      );
    }
  }

  /**
   * Execute REFACTOR phase - Comprehensive security improvement
   */
  private async executeRefactorPhase(
    context: FeatureContext,
    findings: Finding[],
    recommendations: Recommendation[]
  ): Promise<void> {
    const complexityLevel = normalizeComplexity(context.complexity);
    
    // Comprehensive security analysis
    findings.push(
      this.createFinding(
        'security-implementation',
        'Perform comprehensive security analysis and improvement assessment',
        'info',
        context.files?.implementation || 'src/',
        'Analyze security posture, identify vulnerabilities, and recommend improvements'
      )
    );

    // Security architecture review
    if (complexityLevel >= 7) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Complex implementation requires security architecture review',
          'high',
          context.files?.implementation || 'src/',
          'Review security architecture, threat model, and defense-in-depth implementation'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Strengthen security architecture',
          'high',
          'Implement defense-in-depth, principle of least privilege, and security by design'
        )
      );
    }

    // Cryptographic implementation review
    if (context.domain.includes('crypto') || context.domain.includes('encryption')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Cryptographic implementation requires expert security review',
          'critical',
          context.files?.implementation || 'src/',
          'Validate cryptographic algorithms, key management, and implementation security'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Implement cryptographic best practices',
          'critical',
          'Use proven cryptographic libraries, secure key management, and proper algorithm selection'
        )
      );
    }

    // Access control and authorization improvements
    if (context.domain.includes('auth') || context.domain.includes('user')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Access control implementation requires security hardening',
          'high',
          context.files?.implementation || 'src/',
          'Review and strengthen access control mechanisms, role-based permissions, and authorization logic'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing',
          'Implement robust access control',
          'high',
          'Use role-based access control, implement principle of least privilege, and add authorization logging'
        )
      );
    }

    // Security monitoring and logging
    findings.push(
      this.createFinding(
        'security-implementation',
        'Implementation requires security monitoring and audit logging',
        'medium',
        context.files?.implementation || 'src/',
        'Implement comprehensive security logging, monitoring, and alerting mechanisms'
      )
    );

    recommendations.push(
      this.createRecommendation(
        'security-testing',
        'Implement security monitoring',
        'medium',
        'Add security event logging, monitoring dashboards, and automated alerting for security incidents'
      )
    );

    // Compliance validation and reporting
    if (context.complianceRequirements.length > 0) {
      findings.push(
        this.createFinding(
          'compliance',
          'Compliance requirements need validation and reporting mechanisms',
          'high',
          context.files?.implementation || 'src/',
          'Implement compliance validation, audit trails, and automated reporting'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'compliance',
          'Implement compliance automation',
          'high',
          'Add automated compliance checking, audit trail generation, and compliance reporting'
        )
      );
    }

    // Security testing automation
    recommendations.push(
      this.createRecommendation(
        'security-testing' as RecommendationType,
        'Implement automated security testing',
        'medium',
        'Add security testing to CI/CD pipeline including SAST, DAST, and dependency scanning'
      )
    );

    // Incident response preparation
    if (context.securityCritical) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Security-critical feature requires incident response preparation',
          'medium',
          context.files?.implementation || 'src/',
          'Prepare incident response procedures, security playbooks, and recovery mechanisms'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Prepare security incident response',
          'medium',
          'Create incident response procedures, security monitoring alerts, and recovery protocols'
        )
      );
    }

    // Privacy and data protection improvements
    if (context.domain.includes('user') || context.domain.includes('data')) {
      findings.push(
        this.createFinding(
          'security-implementation',
          'Data handling requires privacy protection improvements',
          'high',
          context.files?.implementation || 'src/',
          'Implement privacy by design, data minimization, and user consent mechanisms'
        )
      );

      recommendations.push(
        this.createRecommendation(
          'security-testing' as RecommendationType,
          'Strengthen privacy protection',
          'high',
          'Implement data anonymization, user consent management, and privacy-preserving techniques'
        )
      );
    }
  }

  /**
   * Calculate risk score based on findings
   */
  private calculateRiskScore(findings: Finding[]): number {
    let score = 0;
    for (const finding of findings) {
      switch (finding.severity) {
        case 'critical':
          score += 10;
          break;
        case 'high':
          score += 7;
          break;
        case 'medium':
          score += 4;
          break;
        case 'low':
          score += 2;
          break;
        case 'info':
          score += 1;
          break;
      }
    }
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'vulnerability-assessment',
      'security-code-review',
      'authentication-validation',
      'authorization-testing',
      'data-protection-audit',
      'api-security-analysis',
      'compliance-validation',
      'cryptographic-review',
      'privacy-assessment',
      'security-architecture-review',
      'penetration-testing-planning',
      'security-monitoring-setup',
      'incident-response-preparation',
      'dependency-security-scanning',
      'security-test-automation'
    ];
  }

  /**
   * Get agent configuration
   */
  getConfiguration(): Record<string, any> {
    return {
      supportedPhases: ['red', 'green', 'refactor'],
      primaryPhases: ['green', 'refactor'],
      securityFrameworks: ['OWASP', 'NIST', 'ISO27001', 'SOC2'],
      complianceStandards: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'CCPA'],
      vulnerabilityCategories: [
        'injection', 'authentication', 'authorization', 'cryptography',
        'configuration', 'data-exposure', 'access-control', 'csrf',
        'xss', 'deserialization', 'logging', 'monitoring'
      ],
      securityTools: ['sonarqube', 'snyk', 'bandit', 'eslint-security', 'semgrep'],
      riskThresholds: {
        low: 10,
        medium: 25,
        high: 50,
        critical: 75
      },
      timeout: 300000, // 5 minutes
      retryAttempts: 2
    };
  }
}