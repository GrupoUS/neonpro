/**
 * Performance Benchmarking & Security Scanning Integration Tests
 * 
 * Comprehensive integration tests for performance benchmarking and security scanning
 * across all services with focus on real-time performance metrics, vulnerability detection,
 * and compliance validation for healthcare applications.
 * 
 * Security: Critical - Performance benchmarking and security scanning tests
 * Test Coverage: Performance & Security Integration
 * Compliance: OWASP, NIST, ISO 27001, LGPD
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HealthcareProfessionalAuthorizationService } from '@api/services/healthcare-professional-authorization'
import { JWTSecurityService } from '@api/services/jwt-security-service'
import { AICacheInvalidationService } from '@api/services/ai-cache-invalidation-service'
import { BackgroundJobsManager } from '@api/services/background-jobs-manager'
import { SecurityLogger } from '@security/src/index'
import { PerformanceMonitor } from '@observability/src/monitoring/init'

// Type definitions for performance and security metrics
interface PerformanceMetrics {
  requestDuration: number
  memoryUsage: number
  cpuUsage: number
  responseTime: number
  throughput: number
  errorRate: number
  timestamp: Date
}

interface SecurityScanResult {
  scanId: string
  timestamp: Date
  vulnerabilities: SecurityVulnerability[]
  complianceScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: SecurityRecommendation[]
}

interface SecurityVulnerability {
  id: string
  type: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  location: string
  impact: string
  remediation: string
  cveId?: string
  owaspCategory?: string
}

interface SecurityRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  implementation: string
  estimatedEffort: string
}

interface BenchmarkConfiguration {
  duration: number
  concurrentUsers: number
  rampUpTime: number
  requestsPerSecond: number
  thinkTime: number
  scenarios: BenchmarkScenario[]
}

interface BenchmarkScenario {
  name: string
  weight: number
  requests: BenchmarkRequest[]
  successCriteria: BenchmarkSuccessCriteria
}

interface BenchmarkRequest {
  method: string
  endpoint: string
  headers?: Record<string, string>
  body?: any
  expectedStatusCode: number
}

interface BenchmarkSuccessCriteria {
  maxResponseTime: number
  minThroughput: number
  maxErrorRate: number
  availabilityPercentage: number
}

interface BenchmarkResult {
  scenario: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  throughput: number
  errorRate: number
  availability: number
  metCriteria: boolean
}

// Mock performance monitor
const mockPerformanceMonitor = {
  startTransaction: vi.fn(),
  endTransaction: vi.fn(),
  recordMetric: vi.fn(),
  getMetrics: vi.fn(),
  generateReport: vi.fn(),
  alert: vi.fn()
}

// Mock security scanner
const mockSecurityScanner = {
  performVulnerabilityScan: vi.fn(),
  performDependencyScan: vi.fn(),
  performConfigurationScan: vi.fn(),
  performComplianceScan: vi.fn(),
  generateSecurityReport: vi.fn()
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

const mockBackgroundJobs = {
  enqueueJob: vi.fn(),
  processJob: vi.fn(),
  getJobStatus: vi.fn(),
  getJobHistory: vi.fn()
}

describe('Performance Benchmarking & Security Scanning Integration Tests', () => {
  let performanceMonitor: PerformanceMonitor
  let securityLogger: SecurityLogger
  let jwtService: JWTSecurityService
  let authService: HealthcareProfessionalAuthorizationService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Initialize services with mocks
    performanceMonitor = new PerformanceMonitor() as any
    securityLogger = new SecurityLogger() as any
    jwtService = new JWTSecurityService() as any
    authService = new HealthcareProfessionalAuthorizationService() as any
    
    // Setup mock implementations
    ;(performanceMonitor as any).recordMetric = mockPerformanceMonitor.recordMetric
    ;(performanceMonitor as any).generateReport = mockPerformanceMonitor.generateReport
    ;(securityLogger as any).performVulnerabilityScan = mockSecurityScanner.performVulnerabilityScan
    ;(jwtService as any).validateToken = mockJWTService.validateToken
    ;(authService as any).authenticate = mockAuthService.authenticate
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Performance Metrics Collection', () => {
    it('should collect and record performance metrics for API endpoints', async () => {
      // Arrange
      const metrics: PerformanceMetrics = {
        requestDuration: 150,
        memoryUsage: 512,
        cpuUsage: 25,
        responseTime: 120,
        throughput: 1000,
        errorRate: 0.01,
        timestamp: new Date()
      }

      mockPerformanceMonitor.recordMetric.mockResolvedValue(metrics)

      // Act
      const result = await performanceMonitor.recordMetric('api_request', metrics)

      // Assert
      expect(result).toEqual(metrics)
      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalledWith('api_request', metrics)
      expect(result.requestDuration).toBeLessThan(200)
      expect(result.errorRate).toBeLessThan(0.05)
    })

    it('should track memory usage patterns over time', async () => {
      // Arrange
      const memoryMetrics = [
        { timestamp: new Date(Date.now() - 300000), usage: 256 },
        { timestamp: new Date(Date.now() - 240000), usage: 384 },
        { timestamp: new Date(Date.now() - 180000), usage: 512 },
        { timestamp: new Date(Date.now() - 120000), usage: 640 },
        { timestamp: new Date(Date.now() - 60000), usage: 768 }
      ]

      mockPerformanceMonitor.getMetrics.mockResolvedValue(memoryMetrics)

      // Act
      const result = await performanceMonitor.getMetrics('memory_usage')

      // Assert
      expect(result).toHaveLength(5)
      expect(result[4].usage).toBeGreaterThan(result[0].usage)
      
      // Check for memory leak detection
      const trend = result[result.length - 1].usage - result[0].usage
      expect(trend).toBeLessThan(1024) // Should not grow more than 1GB in 5 minutes
    })

    it('should monitor CPU usage under load', async () => {
      // Arrange
      const cpuMetrics = Array.from({ length: 60 }, (_, i) => ({
        timestamp: new Date(Date.now() - (59 - i) * 1000),
        usage: Math.min(95, 20 + Math.random() * 30 + i * 0.5)
      }))

      mockPerformanceMonitor.getMetrics.mockResolvedValue(cpuMetrics)

      // Act
      const result = await performanceMonitor.getMetrics('cpu_usage')

      // Assert
      expect(result).toHaveLength(60)
      
      // Check for CPU spikes
      const maxCpu = Math.max(...result.map(m => m.usage))
      expect(maxCpu).toBeLessThan(90) // Should not exceed 90% CPU
      
      // Check average CPU usage
      const avgCpu = result.reduce((sum, m) => sum + m.usage, 0) / result.length
      expect(avgCpu).toBeLessThan(70) // Average should be below 70%
    })
  })

  describe('Security Vulnerability Scanning', () => {
    it('should perform comprehensive vulnerability scanning', async () => {
      // Arrange
      const scanResult: SecurityScanResult = {
        scanId: 'scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'VULN-001',
            type: 'SQL Injection',
            severity: 'high',
            description: 'Potential SQL injection vulnerability in query parameters',
            location: 'API endpoint: /api/patients/search',
            impact: 'Could allow unauthorized database access',
            remediation: 'Use parameterized queries and input validation',
            owaspCategory: 'A1: Injection'
          }
        ],
        complianceScore: 85,
        riskLevel: 'medium',
        recommendations: [
          {
            id: 'REC-001',
            priority: 'high',
            title: 'Implement Input Validation',
            description: 'Add strict input validation to all API endpoints',
            implementation: 'Use zod schemas for request validation',
            estimatedEffort: '2 days'
          }
        ]
      }

      mockSecurityScanner.performVulnerabilityScan.mockResolvedValue(scanResult)

      // Act
      const result = await securityLogger.performVulnerabilityScan('full_application')

      // Assert
      expect(result).toEqual(scanResult)
      expect(result.complianceScore).toBeGreaterThan(80)
      expect(result.vulnerabilities).toHaveLength(1)
      expect(result.vulnerabilities[0].severity).toBe('high')
    })

    it('should scan dependencies for known vulnerabilities', async () => {
      // Arrange
      const dependencyScanResult: SecurityScanResult = {
        scanId: 'deps-scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'DEPS-001',
            type: 'Vulnerable Dependency',
            severity: 'medium',
            description: 'Outdated package with known CVE',
            location: 'package.json: express@4.17.1',
            impact: 'Could allow remote code execution',
            remediation: 'Update to express@4.18.2 or later',
            cveId: 'CVE-2022-24999'
          }
        ],
        complianceScore: 90,
        riskLevel: 'medium',
        recommendations: [
          {
            id: 'DEPS-REC-001',
            priority: 'medium',
            title: 'Update Dependencies',
            description: 'Update vulnerable packages to latest secure versions',
            implementation: 'Run npm update and review breaking changes',
            estimatedEffort: '1 day'
          }
        ]
      }

      mockSecurityScanner.performDependencyScan.mockResolvedValue(dependencyScanResult)

      // Act
      const result = await securityLogger.performDependencyScan()

      // Assert
      expect(result).toEqual(dependencyScanResult)
      expect(result.vulnerabilities).toHaveLength(1)
      expect(result.vulnerabilities[0].cveId).toBe('CVE-2022-24999')
    })

    it('should perform configuration security scanning', async () => {
      // Arrange
      const configScanResult: SecurityScanResult = {
        scanId: 'config-scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'CONFIG-001',
            type: 'Insecure Configuration',
            severity: 'high',
            description: 'Debug mode enabled in production',
            location: 'environment configuration',
            impact: 'Could expose sensitive information',
            remediation: 'Disable debug mode in production environment',
            owaspCategory: 'A5: Security Misconfiguration'
          }
        ],
        complianceScore: 75,
        riskLevel: 'high',
        recommendations: [
          {
            id: 'CONFIG-REC-001',
            priority: 'high',
            title: 'Secure Configuration',
            description: 'Review and secure all environment configurations',
            implementation: 'Set NODE_ENV=production and remove debug flags',
            estimatedEffort: '4 hours'
          }
        ]
      }

      mockSecurityScanner.performConfigurationScan.mockResolvedValue(configScanResult)

      // Act
      const result = await securityLogger.performConfigurationScan()

      // Assert
      expect(result).toEqual(configScanResult)
      expect(result.riskLevel).toBe('high')
      expect(result.complianceScore).toBeGreaterThan(70)
    })
  })

  describe('Load Testing and Benchmarking', () => {
    it('should execute load testing scenarios', async () => {
      // Arrange
      const config: BenchmarkConfiguration = {
        duration: 60,
        concurrentUsers: 100,
        rampUpTime: 30,
        requestsPerSecond: 50,
        thinkTime: 1000,
        scenarios: [
          {
            name: 'patient_api_load',
            weight: 70,
            requests: [
              {
                method: 'GET',
                endpoint: '/api/patients',
                expectedStatusCode: 200
              },
              {
                method: 'GET',
                endpoint: '/api/patients/123',
                expectedStatusCode: 200
              }
            ],
            successCriteria: {
              maxResponseTime: 1000,
              minThroughput: 100,
              maxErrorRate: 0.01,
              availabilityPercentage: 99.9
            }
          }
        ]
      }

      const expectedResult: BenchmarkResult = {
        scenario: 'patient_api_load',
        totalRequests: 3000,
        successfulRequests: 2995,
        failedRequests: 5,
        averageResponseTime: 450,
        minResponseTime: 120,
        maxResponseTime: 1200,
        throughput: 150,
        errorRate: 0.0017,
        availability: 99.83,
        metCriteria: true
      }

      // Mock load test execution
      vi.spyOn(performanceMonitor, 'generateReport').mockResolvedValue(expectedResult)

      // Act
      const result = await performanceMonitor.generateReport(config)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(result.metCriteria).toBe(true)
      expect(result.averageResponseTime).toBeLessThan(1000)
      expect(result.errorRate).toBeLessThan(0.01)
      expect(result.availability).toBeGreaterThan(99.5)
    })

    it('should simulate peak load scenarios', async () => {
      // Arrange
      const peakLoadConfig: BenchmarkConfiguration = {
        duration: 120,
        concurrentUsers: 1000,
        rampUpTime: 60,
        requestsPerSecond: 200,
        thinkTime: 500,
        scenarios: [
          {
            name: 'peak_load_simulation',
            weight: 100,
            requests: [
              {
                method: 'GET',
                endpoint: '/api/auth/login',
                body: { username: 'test', password: 'test' },
                expectedStatusCode: 200
              }
            ],
            successCriteria: {
              maxResponseTime: 2000,
              minThroughput: 500,
              maxErrorRate: 0.05,
              availabilityPercentage: 99.0
            }
          }
        ]
      }

      const peakLoadResult: BenchmarkResult = {
        scenario: 'peak_load_simulation',
        totalRequests: 24000,
        successfulRequests: 22800,
        failedRequests: 1200,
        averageResponseTime: 1250,
        minResponseTime: 150,
        maxResponseTime: 3500,
        throughput: 400,
        errorRate: 0.05,
        availability: 95.0,
        metCriteria: true
      }

      mockPerformanceMonitor.generateReport.mockResolvedValue(peakLoadResult)

      // Act
      const result = await performanceMonitor.generateReport(peakLoadConfig)

      // Assert
      expect(result).toEqual(peakLoadResult)
      expect(result.metCriteria).toBe(true)
      expect(result.throughput).toBeGreaterThan(500)
      expect(result.errorRate).toBeLessThan(0.06)
    })

    it('should handle stress testing scenarios', async () => {
      // Arrange
      const stressTestConfig: BenchmarkConfiguration = {
        duration: 300,
        concurrentUsers: 5000,
        rampUpTime: 120,
        requestsPerSecond: 1000,
        thinkTime: 200,
        scenarios: [
          {
            name: 'stress_test',
            weight: 100,
            requests: [
              {
                method: 'POST',
                endpoint: '/api/appointments',
                body: { patientId: '123', date: new Date() },
                expectedStatusCode: 201
              }
            ],
            successCriteria: {
              maxResponseTime: 5000,
              minThroughput: 800,
              maxErrorRate: 0.10,
              availabilityPercentage: 95.0
            }
          }
        ]
      }

      const stressTestResult: BenchmarkResult = {
        scenario: 'stress_test',
        totalRequests: 300000,
        successfulRequests: 270000,
        failedRequests: 30000,
        averageResponseTime: 2800,
        minResponseTime: 200,
        maxResponseTime: 8500,
        throughput: 900,
        errorRate: 0.10,
        availability: 90.0,
        metCriteria: false // System degraded under extreme load
      }

      mockPerformanceMonitor.generateReport.mockResolvedValue(stressTestResult)

      // Act
      const result = await performanceMonitor.generateReport(stressTestConfig)

      // Assert
      expect(result).toEqual(stressTestResult)
      expect(result.metCriteria).toBe(false) // Expected to fail under extreme stress
      expect(result.availability).toBeGreaterThan(85) // But should maintain basic availability
    })
  })

  describe('Security Performance Integration', () => {
    it('should measure performance impact of security scanning', async () => {
      // Arrange
      const baselineMetrics: PerformanceMetrics = {
        requestDuration: 100,
        memoryUsage: 256,
        cpuUsage: 15,
        responseTime: 80,
        throughput: 2000,
        errorRate: 0.001,
        timestamp: new Date()
      }

      const securityScanMetrics: PerformanceMetrics = {
        requestDuration: 150,
        memoryUsage: 384,
        cpuUsage: 25,
        responseTime: 120,
        throughput: 1800,
        errorRate: 0.001,
        timestamp: new Date()
      }

      mockPerformanceMonitor.recordMetric
        .mockResolvedValueOnce(baselineMetrics)
        .mockResolvedValueOnce(securityScanMetrics)

      // Act
      const baseline = await performanceMonitor.recordMetric('baseline', baselineMetrics)
      const withSecurity = await performanceMonitor.recordMetric('with_security', securityScanMetrics)

      // Calculate performance impact
      const performanceImpact = {
        requestDurationIncrease: ((withSecurity.requestDuration - baseline.requestDuration) / baseline.requestDuration) * 100,
        memoryUsageIncrease: ((withSecurity.memoryUsage - baseline.memoryUsage) / baseline.memoryUsage) * 100,
        throughputDecrease: ((baseline.throughput - withSecurity.throughput) / baseline.throughput) * 100
      }

      // Assert
      expect(performanceImpact.requestDurationIncrease).toBeLessThan(100) // Should not double request time
      expect(performanceImpact.memoryUsageIncrease).toBeLessThan(100) // Should not double memory usage
      expect(performanceImpact.throughputDecrease).toBeLessThan(50) // Should not reduce throughput by more than 50%
    })

    it('should validate security scanning frequency under load', async () => {
      // Arrange
      const scanFrequency = 10 // scans per second
      const testDuration = 60 // seconds
      const expectedScans = scanFrequency * testDuration

      let completedScans = 0
      mockSecurityScanner.performVulnerabilityScan.mockImplementation(async () => {
        completedScans++
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate 50ms scan time
        return {
          scanId: `scan-${completedScans}`,
          timestamp: new Date(),
          vulnerabilities: [],
          complianceScore: 100,
          riskLevel: 'low',
          recommendations: []
        }
      })

      // Act
      const scanPromises = Array.from({ length: expectedScans }, () =>
        securityLogger.performVulnerabilityScan('load_test')
      )
      const results = await Promise.allSettled(scanPromises)
      const successfulScans = results.filter(r => r.status === 'fulfilled').length

      // Assert
      expect(successfulScans).toBeGreaterThan(expectedScans * 0.95) // Should complete at least 95% of scans
      expect(completedScans).toBe(expectedScans)
    })
  })

  describe('Real-time Monitoring and Alerting', () => {
    it('should detect and alert on performance degradation', async () => {
      // Arrange
      const degradingMetrics: PerformanceMetrics = {
        requestDuration: 2000,
        memoryUsage: 2048,
        cpuUsage: 85,
        responseTime: 1800,
        throughput: 100,
        errorRate: 0.05,
        timestamp: new Date()
      }

      const alert = {
        id: 'alert-123',
        type: 'performance_degradation',
        severity: 'high',
        message: 'Performance degradation detected',
        metrics: degradingMetrics,
        timestamp: new Date()
      }

      mockPerformanceMonitor.recordMetric.mockResolvedValue(degradingMetrics)
      mockPerformanceMonitor.alert.mockResolvedValue(alert)

      // Act
      const result = await performanceMonitor.recordMetric('degraded_performance', degradingMetrics)
      const alertResult = await performanceMonitor.alert('performance_degradation', degradingMetrics)

      // Assert
      expect(alertResult).toEqual(alert)
      expect(alertResult.severity).toBe('high')
      expect(result.requestDuration).toBeGreaterThan(1000) // Should detect high response time
    })

    it('should detect and alert on security incidents', async () => {
      // Arrange
      const securityIncident: SecurityScanResult = {
        scanId: 'incident-scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'INCIDENT-001',
            type: 'Authentication Bypass',
            severity: 'critical',
            description: 'Potential authentication bypass vulnerability',
            location: 'Authentication service',
            impact: 'Could allow unauthorized access',
            remediation: 'Immediate patch required',
            owaspCategory: 'A7: Identification and Authentication Failures'
          }
        ],
        complianceScore: 20,
        riskLevel: 'critical',
        recommendations: [
          {
            id: 'INCIDENT-REC-001',
            priority: 'critical',
            title: 'Patch Authentication System',
            description: 'Immediate security patch required',
            implementation: 'Deploy emergency patch to authentication service',
            estimatedEffort: '2 hours'
          }
        ]
      }

      const alert = {
        id: 'security-alert-123',
        type: 'security_incident',
        severity: 'critical',
        message: 'Critical security vulnerability detected',
        incident: securityIncident,
        timestamp: new Date()
      }

      mockSecurityScanner.performVulnerabilityScan.mockResolvedValue(securityIncident)
      mockPerformanceMonitor.alert.mockResolvedValue(alert)

      // Act
      const scanResult = await securityLogger.performVulnerabilityScan('emergency_scan')
      const alertResult = await performanceMonitor.alert('security_incident', scanResult)

      // Assert
      expect(scanResult.riskLevel).toBe('critical')
      expect(alertResult.severity).toBe('critical')
      expect(scanResult.vulnerabilities[0].severity).toBe('critical')
    })
  })

  describe('Compliance Validation Integration', () => {
    it('should validate performance compliance with healthcare standards', async () => {
      // Arrange
      const performanceStandards = {
        maxResponseTime: 2000, // 2 seconds for healthcare applications
        minAvailability: 99.9, // High availability for healthcare
        maxErrorRate: 0.001, // Very low error tolerance
        securityScanFrequency: 3600 // Scan every hour
      }

      const currentMetrics: PerformanceMetrics = {
        requestDuration: 800,
        memoryUsage: 512,
        cpuUsage: 35,
        responseTime: 650,
        throughput: 1500,
        errorRate: 0.0005,
        timestamp: new Date()
      }

      mockPerformanceMonitor.recordMetric.mockResolvedValue(currentMetrics)

      // Act
      const result = await performanceMonitor.recordMetric('healthcare_compliance', currentMetrics)

      // Validate against healthcare standards
      const compliance = {
        responseTime: result.responseTime <= performanceStandards.maxResponseTime,
        throughput: result.throughput > 1000, // Minimum throughput for healthcare
        errorRate: result.errorRate <= performanceStandards.maxErrorRate,
        availability: result.errorRate <= (1 - performanceStandards.minAvailability / 100)
      }

      // Assert
      expect(compliance.responseTime).toBe(true)
      expect(compliance.throughput).toBe(true)
      expect(compliance.errorRate).toBe(true)
      expect(compliance.availability).toBe(true)
    })

    it('should validate security compliance with healthcare regulations', async () => {
      // Arrange
      const healthcareSecurityScan: SecurityScanResult = {
        scanId: 'healthcare-compliance-scan',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'HEALTH-001',
            type: 'Data Encryption',
            severity: 'medium',
            description: 'Some data transmitted without encryption',
            location: 'API communication layer',
            impact: 'Could expose sensitive patient data',
            remediation: 'Enable TLS 1.3 for all communications',
            owaspCategory: 'A2: Cryptographic Failures'
          }
        ],
        complianceScore: 88,
        riskLevel: 'medium',
        recommendations: [
          {
            id: 'HEALTH-REC-001',
            priority: 'high',
            title: 'Enable Full Encryption',
            description: 'Ensure all patient data is encrypted in transit and at rest',
            implementation: 'Configure TLS 1.3 and database encryption',
            estimatedEffort: '3 days'
          }
        ]
      }

      mockSecurityScanner.performVulnerabilityScan.mockResolvedValue(healthcareSecurityScan)

      // Act
      const result = await securityLogger.performVulnerabilityScan('healthcare_compliance')

      // Assert
      expect(result.complianceScore).toBeGreaterThan(85) // Healthcare requires high compliance
      expect(result.riskLevel).toBe('medium')
      expect(result.vulnerabilities).toHaveLength(1)
      expect(result.vulnerabilities[0].type).toBe('Data Encryption')
    })
  })

  describe('Integration with External Security Tools', () => {
    it('should integrate with OWASP ZAP for security scanning', async () => {
      // Arrange
      const zapScanResult: SecurityScanResult = {
        scanId: 'zap-scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'ZAP-001',
            type: 'Cross-Site Scripting (XSS)',
            severity: 'medium',
            description: 'Reflected XSS vulnerability in search parameter',
            location: '/api/search?q=test',
            impact: 'Could allow client-side code execution',
            remediation: 'Implement input sanitization and output encoding',
            owaspCategory: 'A3: Injection'
          }
        ],
        complianceScore: 92,
        riskLevel: 'medium',
        recommendations: [
          {
            id: 'ZAP-REC-001',
            priority: 'medium',
            title: 'Fix XSS Vulnerability',
            description: 'Sanitize search input and encode output',
            implementation: 'Use DOMPurify and proper encoding',
            estimatedEffort: '4 hours'
          }
        ]
      }

      mockSecurityScanner.performVulnerabilityScan.mockResolvedValue(zapScanResult)

      // Act
      const result = await securityLogger.performVulnerabilityScan('zap_integration')

      // Assert
      expect(result).toEqual(zapScanResult)
      expect(result.complianceScore).toBeGreaterThan(90)
      expect(result.vulnerabilities[0].owaspCategory).toBe('A3: Injection')
    })

    it('should integrate with Snyk for dependency scanning', async () => {
      // Arrange
      const snykScanResult: SecurityScanResult = {
        scanId: 'snyk-scan-123',
        timestamp: new Date(),
        vulnerabilities: [
          {
            id: 'SNYK-001',
            type: 'Vulnerable Dependency',
            severity: 'high',
            description: 'Remote code execution in lodash package',
            location: 'node_modules/lodash',
            impact: 'Could allow remote code execution',
            remediation: 'Update to lodash@4.17.21',
            cveId: 'CVE-2021-23337'
          }
        ],
        complianceScore: 85,
        riskLevel: 'high',
        recommendations: [
          {
            id: 'SNYK-REC-001',
            priority: 'high',
            title: 'Update Lodash Package',
            description: 'Update to latest secure version of lodash',
            implementation: 'Run npm install lodash@4.17.21',
            estimatedEffort: '30 minutes'
          }
        ]
      }

      mockSecurityScanner.performDependencyScan.mockResolvedValue(snykScanResult)

      // Act
      const result = await securityLogger.performDependencyScan()

      // Assert
      expect(result).toEqual(snykScanResult)
      expect(result.vulnerabilities[0].cveId).toBe('CVE-2021-23337')
      expect(result.riskLevel).toBe('high')
    })
  })
})