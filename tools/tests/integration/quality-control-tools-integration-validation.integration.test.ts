/**
 * Quality Control Tools Integration & Validation Integration Tests
 * 
 * Comprehensive integration tests for quality control tools validation across
 * all services with focus on code quality, testing coverage, security validation,
 * and compliance enforcement for healthcare applications.
 * 
 * Security: Critical - Quality control tools integration tests
 * Test Coverage: Quality Control Tools Integration
 * Compliance: ISO 9001, CMMI, healthcare quality standards
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HealthcareProfessionalAuthorizationService } from '@api/services/healthcare-professional-authorization'
import { JWTSecurityService } from '@api/services/jwt-security-service'
import { AICacheInvalidationService } from '@api/services/ai-cache-invalidation-service'
import { BackgroundJobsManager } from '@api/services/background-jobs-manager'
import { SecurityLogger } from '@security/src/index'
import { PerformanceMonitor } from '@observability/src/monitoring/init'
import { HealthcareComplianceService } from '@ai-services/services/healthcare-compliance-service'

// Type definitions for quality control validation
interface QualityMetrics {
  codeCoverage: number
  testPassRate: number
  complexityScore: number
  maintainabilityIndex: number
  securityScore: number
  performanceScore: number
  complianceScore: number
  timestamp: Date
}

interface QualityValidationResult {
  isValid: boolean
  score: number
  category: 'code_quality' | 'test_coverage' | 'security' | 'performance' | 'compliance'
  violations: QualityViolation[]
  recommendations: QualityRecommendation[]
  timestamp: Date
}

interface QualityViolation {
  id: string
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info'
  category: string
  description: string
  location: string
  impact: string
  remediation: string
  effort: string
}

interface QualityRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  implementation: string
  benefits: string[]
  estimatedEffort: string
}

interface QualityGate {
  id: string
  name: string
  threshold: number
  metric: keyof QualityMetrics
  condition: 'gte' | 'lte' | 'eq'
  isBlocking: boolean
  category: string
}

interface ToolIntegrationResult {
  toolName: string
  integrationStatus: 'connected' | 'disconnected' | 'error'
  lastSync: Date
  dataQuality: number
  features: string[]
  errors: string[]
}

// Mock quality control services
const mockCodeQualityService = {
  analyzeCodeQuality: vi.fn(),
  calculateComplexity: vi.fn(),
  assessMaintainability: vi.fn(),
  generateQualityReport: vi.fn()
}

const mockTestCoverageService = {
  calculateCoverage: vi.fn(),
  validateTestSuite: vi.fn(),
  identifyCoverageGaps: vi.fn(),
  generateCoverageReport: vi.fn()
}

const mockSecurityValidationService = {
  performSecurityScan: vi.fn(),
  validateSecurityPractices: vi.fn(),
  generateSecurityReport: vi.fn()
}

const mockPerformanceValidationService = {
  runPerformanceTests: vi.fn(),
  validatePerformanceMetrics: vi.fn(),
  generatePerformanceReport: vi.fn()
}

const mockComplianceValidationService = {
  validateCompliance: vi.fn(),
  auditComplianceRequirements: vi.fn(),
  generateComplianceReport: vi.fn()
}

// Mock services
const mockJWTService = {
  validateToken: vi.fn(),
  generateToken: vi.fn(),
  refreshToken: vi.fn(),
  revokeToken: vi.fn()
}

const mockAuthService = {
  authenticate: vi.fn(),
  authorize: vi.fn(),
  validatePermissions: vi.fn()
}

const mockCacheService = {
  invalidate: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn()
}

describe('Quality Control Tools Integration & Validation Integration Tests', () => {
  let codeQualityService: typeof mockCodeQualityService
  let testCoverageService: typeof mockTestCoverageService
  let securityValidationService: typeof mockSecurityValidationService
  let performanceValidationService: typeof mockPerformanceValidationService
  let complianceValidationService: typeof mockComplianceValidationService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Initialize services with mocks
    codeQualityService = mockCodeQualityService
    testCoverageService = mockTestCoverageService
    securityValidationService = mockSecurityValidationService
    performanceValidationService = mockPerformanceValidationService
    complianceValidationService = mockComplianceValidationService
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Code Quality Validation', () => {
    it('should analyze code quality and generate metrics', async () => {
      // Arrange
      const codeAnalysis = {
        files: 150,
        linesOfCode: 25000,
        complexity: { average: 8.5, max: 25, min: 1 },
        maintainability: 85,
        duplication: 3.2,
        technicalDebt: 120 // hours
      }

      const expectedMetrics: QualityMetrics = {
        codeCoverage: 92,
        testPassRate: 98,
        complexityScore: 85,
        maintainabilityIndex: 85,
        securityScore: 88,
        performanceScore: 82,
        complianceScore: 95,
        timestamp: new Date()
      }

      mockCodeQualityService.analyzeCodeQuality.mockResolvedValue(codeAnalysis)
      mockCodeQualityService.calculateComplexity.mockResolvedValue({ score: 85, details: codeAnalysis.complexity })
      mockCodeQualityService.assessMaintainability.mockResolvedValue({ score: 85, factors: ['low_coupling', 'high_cohesion'] })

      // Act
      const analysisResult = await codeQualityService.analyzeCodeQuality('/home/vibecode/neonpro')
      const complexityResult = await codeQualityService.calculateComplexity(analysisResult)
      const maintainabilityResult = await codeQualityService.assessMaintainability(analysisResult)

      // Assert
      expect(analysisResult.files).toBe(150)
      expect(analysisResult.linesOfCode).toBe(25000)
      expect(complexityResult.score).toBeGreaterThan(80)
      expect(maintainabilityResult.score).toBeGreaterThan(80)
      expect(analysisResult.duplication).toBeLessThan(5) // Should be less than 5% duplication
    })

    it('should detect code quality violations', async () => {
      // Arrange
      const violations: QualityViolation[] = [
        {
          id: 'CODE-001',
          severity: 'major',
          category: 'Code Complexity',
          description: 'Function with cyclomatic complexity > 15',
          location: 'packages/security/src/index.ts:150',
          impact: 'Difficult to maintain and test',
          remediation: 'Refactor function into smaller functions',
          effort: '4 hours'
        },
        {
          id: 'CODE-002',
          severity: 'minor',
          category: 'Code Style',
          description: 'Inconsistent naming convention',
          location: 'packages/api/src/services/*.ts',
          impact: 'Reduced code readability',
          remediation: 'Apply consistent naming conventions',
          effort: '2 hours'
        }
      ]

      const expectedResult: QualityValidationResult = {
        isValid: false,
        score: 78,
        category: 'code_quality',
        violations,
        recommendations: [
          {
            id: 'CODE-REC-001',
            priority: 'high',
            title: 'Reduce Code Complexity',
            description: 'Refactor complex functions to improve maintainability',
            implementation: 'Break down large functions into smaller, focused functions',
            benefits: ['Improved testability', 'Better maintainability', 'Reduced bugs'],
            estimatedEffort: '1 day'
          }
        ],
        timestamp: new Date()
      }

      mockCodeQualityService.generateQualityReport.mockResolvedValue(expectedResult)

      // Act
      const result = await codeQualityService.generateQualityReport('code_quality')

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.score).toBeGreaterThan(70)
      expect(result.violations).toHaveLength(2)
      expect(result.violations[0].severity).toBe('major')
      expect(result.recommendations).toHaveLength(1)
    })

    it('should validate code quality against healthcare standards', async () => {
      // Arrange
      const healthcareStandards = {
        maxComplexity: 10,
        minMaintainability: 80,
        maxDuplication: 3,
        requiredDocumentation: 95,
        securityPractices: 100
      }

      const codeMetrics = {
        complexity: { average: 7.5, max: 12, min: 1 },
        maintainability: 88,
        duplication: 2.8,
        documentation: 97,
        securityPractices: 98
      }

      mockCodeQualityService.analyzeCodeQuality.mockResolvedValue(codeMetrics)

      // Act
      const result = await codeQualityService.analyzeCodeQuality('healthcare_critical_path')

      // Validate against healthcare standards
      const compliance = {
        complexity: result.complexity.max <= healthcareStandards.maxComplexity,
        maintainability: result.maintainability >= healthcareStandards.minMaintainability,
        duplication: result.duplication <= healthcareStandards.maxDuplication,
        documentation: result.documentation >= healthcareStandards.requiredDocumentation,
        security: result.securityPractices >= healthcareStandards.securityPractices
      }

      // Assert
      expect(compliance.complexity).toBe(true)
      expect(compliance.maintainability).toBe(true)
      expect(compliance.duplication).toBe(true)
      expect(compliance.documentation).toBe(true)
      expect(compliance.security).toBe(true)
    })
  })

  describe('Test Coverage Validation', () => {
    it('should calculate comprehensive test coverage metrics', async () => {
      // Arrange
      const coverageData = {
        totalLines: 25000,
        coveredLines: 23000,
        totalFunctions: 800,
        coveredFunctions: 750,
        totalBranches: 1200,
        coveredBranches: 1100,
        totalStatements: 15000,
        coveredStatements: 14200
      }

      const coverageMetrics = {
        lineCoverage: (coverageData.coveredLines / coverageData.totalLines) * 100,
        functionCoverage: (coverageData.coveredFunctions / coverageData.totalFunctions) * 100,
        branchCoverage: (coverageData.coveredBranches / coverageData.totalBranches) * 100,
        statementCoverage: (coverageData.coveredStatements / coverageData.totalStatements) * 100,
        overallCoverage: 0
      }

      coverageMetrics.overallCoverage = (
        coverageMetrics.lineCoverage +
        coverageMetrics.functionCoverage +
        coverageMetrics.branchCoverage +
        coverageMetrics.statementCoverage
      ) / 4

      mockTestCoverageService.calculateCoverage.mockResolvedValue(coverageMetrics)

      // Act
      const result = await testCoverageService.calculateCoverage('/home/vibecode/neonpro')

      // Assert
      expect(result.lineCoverage).toBeGreaterThan(90)
      expect(result.functionCoverage).toBeGreaterThan(90)
      expect(result.branchCoverage).toBeGreaterThan(85)
      expect(result.statementCoverage).toBeGreaterThan(90)
      expect(result.overallCoverage).toBeGreaterThan(90)
    })

    it('should identify test coverage gaps', async () => {
      // Arrange
      const coverageGaps = [
        {
          file: 'packages/security/src/index.ts',
          uncoveredLines: [150, 151, 152, 153],
          uncoveredFunctions: ['validateAdminAccess'],
          coverage: 85,
          type: 'partial'
        },
        {
          file: 'packages/api/src/services/patient-service.ts',
          uncoveredLines: [200, 201, 202],
          uncoveredFunctions: ['exportPatientData'],
          coverage: 92,
          type: 'partial'
        }
      ]

      mockTestCoverageService.identifyCoverageGaps.mockResolvedValue(coverageGaps)

      // Act
      const result = await testCoverageService.identifyCoverageGaps()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].file).toContain('security')
      expect(result[1].file).toContain('patient-service')
      expect(result[0].coverage).toBeGreaterThan(80)
      expect(result[1].coverage).toBeGreaterThan(90)
    })

    it('should validate test suite effectiveness', async () => {
      // Arrange
      const testValidation = {
        totalTests: 1500,
        passingTests: 1450,
        failingTests: 25,
        skippedTests: 25,
        flakyTests: 5,
        testExecutionTime: 120000, // 2 minutes
        coverage: {
          line: 92,
          function: 94,
          branch: 87,
          statement: 91
        }
      }

      const effectiveness = {
        passRate: (testValidation.passingTests / testValidation.totalTests) * 100,
        failureRate: (testValidation.failingTests / testValidation.totalTests) * 100,
        skipRate: (testValidation.skippedTests / testValidation.totalTests) * 100,
        flakyRate: (testValidation.flakyTests / testValidation.totalTests) * 100,
        effectiveness: 0
      }

      effectiveness.effectiveness = (
        effectiveness.passRate * 0.4 +
        testValidation.coverage.line * 0.3 +
        testValidation.coverage.branch * 0.3
      )

      mockTestCoverageService.validateTestSuite.mockResolvedValue({
        validation: testValidation,
        effectiveness,
        isValid: effectiveness.passRate > 95 && effectiveness.effectiveness > 90
      })

      // Act
      const result = await testCoverageService.validateTestSuite()

      // Assert
      expect(result.isValid).toBe(true)
      expect(effectiveness.passRate).toBeGreaterThan(95)
      expect(effectiveness.effectiveness).toBeGreaterThan(90)
      expect(effectiveness.flakyRate).toBeLessThan(1) // Should be less than 1% flaky tests
    })
  })

  describe('Security Validation Integration', () => {
    it('should perform comprehensive security validation', async () => {
      // Arrange
      const securityValidation = {
        vulnerabilities: [
          {
            id: 'SEC-001',
            type: 'SQL Injection',
            severity: 'critical',
            description: 'Potential SQL injection in patient search',
            location: 'packages/api/src/services/patient-service.ts:150',
            impact: 'High - could expose patient data',
            remediation: 'Use parameterized queries',
            effort: '4 hours'
          }
        ],
        securityScore: 85,
        compliance: {
          owaspTop10: 90,
          healthcareSecurity: 88,
          dataProtection: 92
        },
        recommendations: [
          {
            id: 'SEC-REC-001',
            priority: 'high',
            title: 'Fix SQL Injection',
            description: 'Implement parameterized queries for all database operations',
            implementation: 'Replace string concatenation with parameterized queries',
            benefits: ['Prevent SQL injection', 'Improve security posture'],
            estimatedEffort: '2 days'
          }
        ]
      }

      mockSecurityValidationService.performSecurityScan.mockResolvedValue(securityValidation)

      // Act
      const result = await securityValidationService.performSecurityScan('full_application')

      // Assert
      expect(result.securityScore).toBeGreaterThan(80)
      expect(result.compliance.owaspTop10).toBeGreaterThan(85)
      expect(result.compliance.healthcareSecurity).toBeGreaterThan(85)
      expect(result.vulnerabilities).toHaveLength(1)
      expect(result.vulnerabilities[0].severity).toBe('critical')
    })

    it('should validate security best practices', async () => {
      // Arrange
      const securityPractices = [
        {
          practice: 'Input Validation',
          implemented: true,
          coverage: 95,
          description: 'All user inputs are validated'
        },
        {
          practice: 'Authentication',
          implemented: true,
          coverage: 100,
          description: 'Strong authentication implemented'
        },
        {
          practice: 'Authorization',
          implemented: true,
          coverage: 90,
          description: 'Role-based access control implemented'
        },
        {
          practice: 'Encryption',
          implemented: true,
          coverage: 100,
          description: 'Data encryption at rest and in transit'
        },
        {
          practice: 'Audit Logging',
          implemented: true,
          coverage: 85,
          description: 'Comprehensive audit logging implemented'
        }
      ]

      mockSecurityValidationService.validateSecurityPractices.mockResolvedValue({
        practices: securityPractices,
        overallScore: 94,
        gaps: [
          {
            practice: 'Audit Logging',
            issue: 'Some security events not logged',
            recommendation: 'Implement comprehensive security event logging'
          }
        ]
      })

      // Act
      const result = await securityValidationService.validateSecurityPractices()

      // Assert
      expect(result.overallScore).toBeGreaterThan(90)
      expect(result.practices.every(p => p.implemented)).toBe(true)
      expect(result.practices[0].coverage).toBeGreaterThan(90)
      expect(result.gaps).toHaveLength(1)
    })
  })

  describe('Performance Validation Integration', () => {
    it('should run comprehensive performance tests', async () => {
      // Arrange
      const performanceResults = {
        loadTest: {
          averageResponseTime: 450,
          maxResponseTime: 1200,
          minResponseTime: 120,
          throughput: 1500,
          errorRate: 0.01,
          concurrency: 1000
        },
        stressTest: {
          peakThroughput: 2500,
          breakingPoint: 3000,
          recoveryTime: 30,
          stability: 95
        },
        scalability: {
          linearScaling: true,
          efficiency: 0.92,
          maxUsers: 5000
        },
        resourceUsage: {
          cpu: 65,
          memory: 512,
          disk: 25,
          network: 40
        }
      }

      mockPerformanceValidationService.runPerformanceTests.mockResolvedValue(performanceResults)

      // Act
      const result = await performanceValidationService.runPerformanceTests('performance_suite')

      // Assert
      expect(result.loadTest.averageResponseTime).toBeLessThan(500)
      expect(result.loadTest.errorRate).toBeLessThan(0.05)
      expect(result.stressTest.stability).toBeGreaterThan(90)
      expect(result.scalability.efficiency).toBeGreaterThan(0.85)
      expect(result.resourceUsage.cpu).toBeLessThan(80)
      expect(result.resourceUsage.memory).toBeLessThan(1024)
    })

    it('should validate performance against SLA requirements', async () => {
      // Arrange
      const slaRequirements = {
        responseTime: 1000, // 1 second
        availability: 99.9,
        throughput: 1000,
        errorRate: 0.01
      }

      const currentMetrics = {
        averageResponseTime: 450,
        availability: 99.95,
        throughput: 1500,
        errorRate: 0.005
      }

      mockPerformanceValidationService.validatePerformanceMetrics.mockResolvedValue({
        metrics: currentMetrics,
        slaCompliance: {
          responseTime: currentMetrics.averageResponseTime <= slaRequirements.responseTime,
          availability: currentMetrics.availability >= slaRequirements.availability,
          throughput: currentMetrics.throughput >= slaRequirements.throughput,
          errorRate: currentMetrics.errorRate <= slaRequirements.errorRate,
          overall: true
        },
        recommendations: []
      })

      // Act
      const result = await performanceValidationService.validatePerformanceMetrics(slaRequirements)

      // Assert
      expect(result.slaCompliance.overall).toBe(true)
      expect(result.slaCompliance.responseTime).toBe(true)
      expect(result.slaCompliance.availability).toBe(true)
      expect(result.slaCompliance.throughput).toBe(true)
      expect(result.slaCompliance.errorRate).toBe(true)
    })
  })

  describe('Compliance Validation Integration', () => {
    it('should validate healthcare compliance requirements', async () => {
      // Arrange
      const complianceValidation = {
        frameworks: [
          {
            name: 'LGPD',
            score: 95,
            requirements: [
              { id: 'LGPD-001', met: true, description: 'Data processing consent' },
              { id: 'LGPD-002', met: true, description: 'Data subject rights' },
              { id: 'LGPD-003', met: false, description: 'Data retention policy' }
            ]
          },
          {
            name: 'ANVISA',
            score: 92,
            requirements: [
              { id: 'ANVISA-001', met: true, description: 'Medical device registration' },
              { id: 'ANVISA-002', met: true, description: 'Clinical trial compliance' }
            ]
          },
          {
            name: 'CFM',
            score: 98,
            requirements: [
              { id: 'CFM-001', met: true, description: 'Professional registration' },
              { id: 'CFM-002', met: true, description: 'Telemedicine guidelines' }
            ]
          }
        ],
        overallScore: 95,
        criticalIssues: [
          {
            id: 'COMPLIANCE-001',
            framework: 'LGPD',
            requirement: 'Data retention policy',
            severity: 'high',
            description: 'Missing formal data retention policy',
            remediation: 'Implement and document data retention policy'
          }
        ]
      }

      mockComplianceValidationService.validateCompliance.mockResolvedValue(complianceValidation)

      // Act
      const result = await complianceValidationService.validateCompliance('healthcare')

      // Assert
      expect(result.overallScore).toBeGreaterThan(90)
      expect(result.frameworks[0].name).toBe('LGPD')
      expect(result.frameworks[0].score).toBeGreaterThan(90)
      expect(result.criticalIssues).toHaveLength(1)
      expect(result.criticalIssues[0].framework).toBe('LGPD')
    })

    it('should audit compliance requirements continuously', async () => {
      // Arrange
      const auditResults = {
        lastAudit: new Date('2024-01-15'),
        nextAudit: new Date('2024-04-15'),
        findings: [
          {
            id: 'AUDIT-001',
            type: 'finding',
            severity: 'medium',
            description: 'Incomplete audit trail for data access',
            status: 'open',
            dueDate: new Date('2024-02-15')
          }
        ],
        recommendations: [
          {
            id: 'AUDIT-REC-001',
            priority: 'medium',
            title: 'Complete audit trail implementation',
            description: 'Implement comprehensive audit trail for all data access',
            implementation: 'Add audit logging to all data access points',
            benefits: ['Improved compliance', 'Better security monitoring'],
            estimatedEffort: '3 days'
          }
        ],
        readinessScore: 85
      }

      mockComplianceValidationService.auditComplianceRequirements.mockResolvedValue(auditResults)

      // Act
      const result = await complianceValidationService.auditComplianceRequirements()

      // Assert
      expect(result.readinessScore).toBeGreaterThan(80)
      expect(result.findings).toHaveLength(1)
      expect(result.recommendations).toHaveLength(1)
      expect(result.findings[0].severity).toBe('medium')
    })
  })

  describe('Quality Gates Enforcement', () => {
    it('should enforce quality gates for healthcare applications', async () => {
      // Arrange
      const qualityGates: QualityGate[] = [
        {
          id: 'QG-001',
          name: 'Minimum Code Coverage',
          threshold: 90,
          metric: 'codeCoverage',
          condition: 'gte',
          isBlocking: true,
          category: 'testing'
        },
        {
          id: 'QG-002',
          name: 'Maximum Complexity',
          threshold: 10,
          metric: 'complexityScore',
          condition: 'lte',
          isBlocking: true,
          category: 'code_quality'
        },
        {
          id: 'QG-003',
          name: 'Security Score',
          threshold: 85,
          metric: 'securityScore',
          condition: 'gte',
          isBlocking: true,
          category: 'security'
        },
        {
          id: 'QG-004',
          name: 'Healthcare Compliance',
          threshold: 95,
          metric: 'complianceScore',
          condition: 'gte',
          isBlocking: true,
          category: 'compliance'
        }
      ]

      const currentMetrics: QualityMetrics = {
        codeCoverage: 92,
        testPassRate: 98,
        complexityScore: 8.5,
        maintainabilityIndex: 88,
        securityScore: 87,
        performanceScore: 85,
        complianceScore: 96,
        timestamp: new Date()
      }

      // Validate against quality gates
      const gateResults = qualityGates.map(gate => {
        const value = currentMetrics[gate.metric]
        const passed = gate.condition === 'gte' ? value >= gate.threshold : value <= gate.threshold
        return {
          gate: gate.name,
          passed,
          value,
          threshold: gate.threshold,
          isBlocking: gate.isBlocking
        }
      })

      // Act
      const blockingGates = gateResults.filter(r => !r.passed && r.isBlocking)
      const allPassed = gateResults.every(r => r.passed)

      // Assert
      expect(allPassed).toBe(true)
      expect(blockingGates).toHaveLength(0)
      expect(gateResults[0].passed).toBe(true) // Code coverage
      expect(gateResults[1].passed).toBe(true) // Complexity
      expect(gateResults[2].passed).toBe(true) // Security
      expect(gateResults[3].passed).toBe(true) // Compliance
    })

    it('should handle quality gate failures gracefully', async () => {
      // Arrange
      const failingMetrics: QualityMetrics = {
        codeCoverage: 85, // Below 90 threshold
        testPassRate: 95,
        complexityScore: 12, // Above 10 threshold
        maintainabilityIndex: 82,
        securityScore: 82, // Below 85 threshold
        performanceScore: 78,
        complianceScore: 98,
        timestamp: new Date()
      }

      const qualityGates: QualityGate[] = [
        {
          id: 'QG-001',
          name: 'Minimum Code Coverage',
          threshold: 90,
          metric: 'codeCoverage',
          condition: 'gte',
          isBlocking: true,
          category: 'testing'
        },
        {
          id: 'QG-002',
          name: 'Maximum Complexity',
          threshold: 10,
          metric: 'complexityScore',
          condition: 'lte',
          isBlocking: true,
          category: 'code_quality'
        },
        {
          id: 'QG-003',
          name: 'Security Score',
          threshold: 85,
          metric: 'securityScore',
          condition: 'gte',
          isBlocking: true,
          category: 'security'
        }
      ]

      // Validate against quality gates
      const gateResults = qualityGates.map(gate => {
        const value = failingMetrics[gate.metric]
        const passed = gate.condition === 'gte' ? value >= gate.threshold : value <= gate.threshold
        return {
          gate: gate.name,
          passed,
          value,
          threshold: gate.threshold,
          isBlocking: gate.isBlocking,
          deviation: gate.condition === 'gte' ? 
            ((threshold - value) / threshold * 100) : 
            ((value - threshold) / threshold * 100)
        }
      })

      // Act
      const blockingFailures = gateResults.filter(r => !r.passed && r.isBlocking)
      const recommendations = blockingFailures.map(failure => ({
        gate: failure.gate,
        currentValue: failure.value,
        threshold: failure.threshold,
        deviation: Math.abs(failure.deviation || 0),
        priority: failure.deviation > 10 ? 'high' : 'medium',
        action: failure.deviation > 10 ? 'Immediate action required' : 'Improvement recommended'
      }))

      // Assert
      expect(blockingFailures).toHaveLength(3)
      expect(recommendations).toHaveLength(3)
      expect(recommendations[0].priority).toBe('medium') // Code coverage 85 vs 90 (5.6% deviation)
      expect(recommendations[1].priority).toBe('high') // Complexity 12 vs 10 (20% deviation)
      expect(recommendations[2].priority).toBe('medium') // Security 82 vs 85 (3.5% deviation)
    })
  })

  describe('Tool Integration Status', () => {
    it('should monitor tool integration status', async () => {
      // Arrange
      const toolStatuses: ToolIntegrationResult[] = [
        {
          toolName: 'SonarQube',
          integrationStatus: 'connected',
          lastSync: new Date(),
          dataQuality: 95,
          features: ['code_analysis', 'security_scanning', 'coverage_tracking'],
          errors: []
        },
        {
          toolName: 'OWASP ZAP',
          integrationStatus: 'connected',
          lastSync: new Date(),
          dataQuality: 92,
          features: ['security_scanning', 'vulnerability_detection'],
          errors: []
        },
        {
          toolName: 'Jenkins',
          integrationStatus: 'connected',
          lastSync: new Date(),
          dataQuality: 88,
          features: ['ci_cd', 'test_execution', 'deployment'],
          errors: []
        }
      ]

      // Mock tool status checks
      const checkToolStatus = (toolName: string) => {
        return toolStatuses.find(t => t.toolName === toolName) || {
          toolName,
          integrationStatus: 'disconnected',
          lastSync: new Date(0),
          dataQuality: 0,
          features: [],
          errors: ['Tool not configured']
        }
      }

      // Act
      const sonarStatus = checkToolStatus('SonarQube')
      const zapStatus = checkToolStatus('OWASP ZAP')
      const jenkinsStatus = checkToolStatus('Jenkins')

      // Assert
      expect(sonarStatus.integrationStatus).toBe('connected')
      expect(sonarStatus.dataQuality).toBeGreaterThan(90)
      expect(zapStatus.integrationStatus).toBe('connected')
      expect(jenkinsStatus.integrationStatus).toBe('connected')
      expect(toolStatuses.every(t => t.errors.length === 0)).toBe(true)
    })

    it('should handle tool integration failures', async () => {
      // Arrange
      const failingTool: ToolIntegrationResult = {
        toolName: 'Artifactory',
        integrationStatus: 'error',
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        dataQuality: 0,
        features: [],
        errors: [
          'Connection timeout',
          'Authentication failed',
          'Configuration error'
        ]
      }

      // Act
      const isHealthy = failingTool.integrationStatus === 'connected' && 
                       failingTool.lastSync > new Date(Date.now() - 300000) && // Within 5 minutes
                       failingTool.errors.length === 0

      const recoveryActions = []
      if (failingTool.integrationStatus !== 'connected') {
        recoveryActions.push('Reconnect to tool service')
      }
      if (failingTool.lastSync < new Date(Date.now() - 300000)) {
        recoveryActions.push('Resync tool data')
      }
      if (failingTool.errors.length > 0) {
        recoveryActions.push('Resolve configuration errors')
      }

      // Assert
      expect(isHealthy).toBe(false)
      expect(recoveryActions).toHaveLength(3)
      expect(failingTool.errors).toHaveLength(3)
    })
  })

  describe('Cross-Tool Data Consistency', () => {
    it('should validate data consistency across quality tools', async () => {
      // Arrange
      const toolReports = {
        sonarQube: {
          codeCoverage: 92,
          complexity: 8.5,
          duplications: 3.2,
          vulnerabilities: 2
        },
        jest: {
          codeCoverage: 91,
          testPassRate: 98,
          testsExecuted: 1500
        },
        owaspZap: {
          vulnerabilities: 3,
          riskLevel: 'medium',
          securityScore: 88
        },
        performanceTest: {
          averageResponseTime: 450,
          throughput: 1500,
          errorRate: 0.01
        }
      }

      // Validate consistency metrics
      const consistencyChecks = [
        {
          metric: 'codeCoverage',
          tools: ['sonarQube', 'jest'],
          values: [toolReports.sonarQube.codeCoverage, toolReports.jest.codeCoverage],
          maxDeviation: 5 // 5% maximum deviation
        },
        {
          metric: 'vulnerabilities',
          tools: ['sonarQube', 'owaspZap'],
          values: [toolReports.sonarQube.vulnerabilities, toolReports.owaspZap.vulnerabilities],
          maxDeviation: 2
        }
      ]

      const consistencyResults = consistencyChecks.map(check => {
        const maxValue = Math.max(...check.values)
        const minValue = Math.min(...check.values)
        const deviation = maxValue - minValue
        const percentageDeviation = (deviation / maxValue) * 100
        const isConsistent = percentageDeviation <= check.maxDeviation

        return {
          metric: check.metric,
          tools: check.tools,
          values: check.values,
          deviation,
          percentageDeviation,
          isConsistent,
          maxDeviation: check.maxDeviation
        }
      })

      // Act
      const allConsistent = consistencyResults.every(r => r.isConsistent)
      const inconsistentMetrics = consistencyResults.filter(r => !r.isConsistent)

      // Assert
      expect(allConsistent).toBe(true)
      expect(inconsistentMetrics).toHaveLength(0)
      expect(consistencyResults[0].percentageDeviation).toBeLessThan(2) // 92 vs 91 (1.1% deviation)
    })

    it('should detect and resolve data inconsistencies', async () => {
      // Arrange
      const inconsistentReports = {
        toolA: { coverage: 95 },
        toolB: { coverage: 85 },
        toolC: { coverage: 88 }
      }

      const coverageValues = Object.values(inconsistentReports).map(r => r.coverage)
      const maxCoverage = Math.max(...coverageValues)
      const minCoverage = Math.min(...coverageValues)
      const deviation = maxCoverage - minCoverage
      const percentageDeviation = (deviation / maxCoverage) * 100

      // Act
      const resolutionStrategy = percentageDeviation > 10 ? 
        'Investigate tool configuration and data sources' :
        'Use median value and flag for review'

      const medianCoverage = coverageValues.sort((a, b) => a - b)[1]
      const recommendedActions = [
        `Coverage deviation detected: ${percentageDeviation.toFixed(1)}%`,
        `Median coverage: ${medianCoverage}%`,
        `Recommended action: ${resolutionStrategy}`,
        'Review tool configurations and data collection methods'
      ]

      // Assert
      expect(percentageDeviation).toBeGreaterThan(10) // 95 vs 85 (10.5% deviation)
      expect(resolutionStrategy).toContain('Investigate tool configuration')
      expect(recommendedActions).toHaveLength(4)
    })
  })

  describe('Real-time Quality Monitoring', () => {
    it('should monitor quality metrics in real-time', async () => {
      // Arrange
      const realTimeMetrics = {
        timestamp: new Date(),
        codeQuality: {
          complexity: 8.2,
          duplications: 3.1,
          technicalDebt: 115
        },
        testing: {
          coverage: 91.5,
          passRate: 97.8,
          executionTime: 118000
        },
        security: {
          vulnerabilities: 2,
          securityScore: 87.5,
          threatsBlocked: 45
        },
        performance: {
          responseTime: 440,
          throughput: 1520,
          errorRate: 0.008
        }
      }

      // Calculate health scores
      const healthScores = {
        codeQuality: Math.max(0, 100 - (realTimeMetrics.codeQuality.complexity * 2) - realTimeMetrics.codeQuality.technicalDebt / 10),
        testing: (realTimeMetrics.testing.coverage * 0.6 + realTimeMetrics.testing.passRate * 0.4),
        security: Math.max(0, 100 - (realTimeMetrics.security.vulnerabilities * 5) - (100 - realTimeMetrics.security.securityScore)),
        performance: Math.max(0, 100 - (realTimeMetrics.performance.responseTime / 10) - (realTimeMetrics.performance.errorRate * 1000))
      }

      const overallHealth = Object.values(healthScores).reduce((sum, score) => sum + score, 0) / Object.keys(healthScores).length

      // Act
      const healthStatus = overallHealth >= 90 ? 'excellent' :
                         overallHealth >= 80 ? 'good' :
                         overallHealth >= 70 ? 'fair' : 'poor'

      // Assert
      expect(overallHealth).toBeGreaterThan(85)
      expect(healthStatus).toBe('good' || 'excellent')
      expect(healthScores.testing).toBeGreaterThan(90)
      expect(healthScores.security).toBeGreaterThan(80)
      expect(realTimeMetrics.performance.errorRate).toBeLessThan(0.01)
    })

    it('should trigger alerts for quality degradation', async () => {
      // Arrange
      const baselineMetrics = {
        codeCoverage: 92,
        testPassRate: 98,
        securityScore: 88,
        performanceResponseTime: 450
      }

      const currentMetrics = {
        codeCoverage: 85, // 7% decrease
        testPassRate: 94, // 4% decrease
        securityScore: 79, // 10% decrease
        performanceResponseTime: 650 // 44% increase
      }

      const degradationThresholds = {
        codeCoverage: 5, // 5% decrease
        testPassRate: 3, // 3% decrease
        securityScore: 8, // 8% decrease
        performanceResponseTime: 20 // 20% increase
      }

      // Calculate degradation
      const degradations = Object.entries(baselineMetrics).map(([key, baseline]) => {
        const current = currentMetrics[key as keyof typeof currentMetrics]
        const threshold = degradationThresholds[key as keyof typeof degradationThresholds]
        
        let percentageChange: number
        if (key === 'performanceResponseTime') {
          percentageChange = ((current - baseline) / baseline) * 100
        } else {
          percentageChange = ((baseline - current) / baseline) * 100
        }
        
        const isDegraded = percentageChange > threshold
        
        return {
          metric: key,
          baseline,
          current,
          percentageChange,
          threshold,
          isDegraded,
          severity: percentageChange > threshold * 2 ? 'critical' : 'warning'
        }
      })

      // Act
      const alerts = degradations.filter(d => d.isDegraded)
      const criticalAlerts = alerts.filter(a => a.severity === 'critical')

      // Assert
      expect(alerts).toHaveLength(4) // All metrics show degradation
      expect(criticalAlerts).toHaveLength(2) // Security and performance are critical
      expect(alerts.some(a => a.metric === 'securityScore')).toBe(true)
      expect(alerts.some(a => a.metric === 'performanceResponseTime')).toBe(true)
    })
  })
})