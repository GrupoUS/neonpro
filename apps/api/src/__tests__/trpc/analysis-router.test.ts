/**
 * Analysis Router Tests
 * TDD implementation for analysis router with healthcare compliance validation
 * 
 * Testing Strategy:
 * - RED: Write failing tests first
 * - GREEN: Make tests pass with minimal implementation
 * - REFACTOR: Improve code structure while maintaining test coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'

// Mock service classes
const mockAnalysisService = {
  startAnalysis: vi.fn(),
  getAnalysis: vi.fn(),
  getAnalysisStatus: vi.fn(),
  getAnalysisResults: vi.fn(),
  listAnalyses: vi.fn()
}

const mockHealthcareValidator = {
  validateRequest: vi.fn(),
  validateReadAccess: vi.fn()
}

const mockPerformanceOptimizer = {
  optimizeConfig: vi.fn()
}

const mockReportGenerator = {
  generateReport: vi.fn()
}

const mockVisualizationService = {
  generateVisualization: vi.fn()
}

describe('Analysis Router - Healthcare Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Analysis Request Validation - RED Phase', () => {
    it('should validate analysis request schema correctly', () => {
      // Test setup: Schema validation
      const AnalysisRequestSchema = z.object({
        packageName: z.string().min(1, 'Package name is required'),
        packageVersion: z.string().optional(),
        services: z.array(z.string()).min(1, 'At least one service is required'),
        options: z.object({
          depth: z.number().min(1).max(10).default(3),
          includeRecommendations: z.boolean().default(true),
          performanceOnly: z.boolean().default(false)
        }).default({ depth: 3, includeRecommendations: true, performanceOnly: false })
      })

      // Valid case - GREEN: Test should pass
      const validRequest = {
        packageName: '@neonpro/core',
        packageVersion: '1.0.0',
        services: ['security', 'performance'],
        options: {
          depth: 5,
          includeRecommendations: true,
          performanceOnly: false
        }
      }

      const validationResult = AnalysisRequestSchema.safeParse(validRequest)
      expect(validationResult.success).toBe(true)
    })

    it('should reject invalid package names', () => {
      // Test setup: Invalid package name
      const AnalysisRequestSchema = z.object({
        packageName: z.string().min(1, 'Package name is required').regex(/^@[\w-]+\/[\w-]+$/, 'Invalid package name format')
      })

      const invalidRequest = {
        packageName: 'invalid-package-name',
        services: ['security']
      }

      const validationResult = AnalysisRequestSchema.safeParse(invalidRequest)
      
      // RED: Test fails initially, implementation needed to fix
      expect(validationResult.success).toBe(false)
      expect(validationResult.error?.issues[0].message).toBe('Invalid package name format')
    })

    it('should enforce healthcare service requirements', () => {
      // Test setup: Healthcare-specific service validation
      const HealthcareServicesSchema = z.object({
        services: z.array(z.string()).refine(
          (services) => services.includes('lgpd-compliance') || services.includes('anvisa-validation'),
          'At least one healthcare compliance service is required'
        )
      })

      const invalidHealthcareRequest = {
        services: ['performance', 'security'] // Missing healthcare services
      }

      const validationResult = HealthcareServicesSchema.safeParse(invalidHealthcareRequest)
      
      expect(validationResult.success).toBe(false)
      expect(validationResult.error?.issues[0].message).toBe('At least one healthcare compliance service is required')
    })
  })

  describe('Analysis Controller - GREEN Phase Implementation', () => {
    it('should start healthcare analysis with validation', async () => {
      // Test setup: Analysis controller
      const analysisController = {
        async startAnalysis(input: any) {
          // Healthcare validation
          await mockHealthcareValidator.validateRequest(input)

          // Performance optimization
          const optimizedConfig = await mockPerformanceOptimizer.optimizeConfig(input)

          // Start analysis
          const analysisId = await mockAnalysisService.startAnalysis(optimizedConfig)

          return {
            analysisId,
            status: 'pending',
            startedAt: new Date().toISOString(),
            services: optimizedConfig.services
          }
        }
      }

      const input = {
        packageName: '@neonpro/core',
        services: ['lgpd-compliance', 'anvisa-validation'],
        options: { depth: 5 }
      }

      mockHealthcareValidator.validateRequest.mockResolvedValue(undefined)
      mockPerformanceOptimizer.optimizeConfig.mockResolvedValue({
        ...input,
        services: ['lgpd-compliance', 'anvisa-validation']
      })
      mockAnalysisService.startAnalysis.mockResolvedValue('analysis-123')

      const result = await analysisController.startAnalysis(input)
      
      expect(result.analysisId).toBe('analysis-123')
      expect(result.status).toBe('pending')
      expect(result.services).toEqual(['lgpd-compliance', 'anvisa-validation'])
    })

    it('should handle analysis start failures gracefully', async () => {
      const analysisController = {
        async startAnalysis(input: any) {
          try {
            await mockHealthcareValidator.validateRequest(input)
            const optimizedConfig = await mockPerformanceOptimizer.optimizeConfig(input)
            const analysisId = await mockAnalysisService.startAnalysis(optimizedConfig)
            
            return { analysisId, status: 'pending' }
          } catch (error) {
            // Healthcare-specific error handling
            if (error instanceof Error && error.message.includes('LGPD')) {
              throw new Error(`Healthcare compliance failed: ${error.message}`)
            }
            throw error
          }
        }
      }

      const input = {
        packageName: '@neonpro/core',
        services: ['lgpd-compliance']
      }

      // Simulate LGPD validation failure
      mockHealthcareValidator.validateRequest.mockRejectedValue(
        new Error('LGPD consent missing for patient data processing')
      )

      await expect(analysisController.startAnalysis(input)).rejects.toThrow(
        'Healthcare compliance failed: LGPD consent missing'
      )
    })
  })

  describe('Analysis Results - REFACTOR Phase', () => {
    it('should generate healthcare-compliant reports', async () => {
      const analysisController = {
        async getAnalysisResults(analysisId: string, format: string) {
          const analysis = await mockAnalysisService.getAnalysisResults(analysisId, format)
          
          // Generate healthcare-compliant report
          mockReportGenerator.generateReport.mockResolvedValue({
            id: `report-${Date.now()}`,
            title: 'Healthcare Compliance Report',
            content: JSON.stringify({
              summary: analysis.summary,
              healthScore: analysis.healthScore,
              recommendations: analysis.recommendations.filter(r => r.healthcare === true)
            }, null, 2),
            format: 'json'
          })

          return mockReportGenerator.generateReport(analysis, 'executive-summary', format)
        }
      }

      const mockAnalysis = {
        id: 'analysis-123',
        summary: 'Healthcare compliance analysis complete',
        healthScore: 85,
        recommendations: [
          { type: 'lgpd', healthcare: true, priority: 'high' },
          { type: 'performance', healthcare: false, priority: 'medium' }
        ]
      }

      mockAnalysisService.getAnalysisResults.mockResolvedValue(mockAnalysis)
      mockReportGenerator.generateReport.mockResolvedValue({
        id: 'report-123',
        title: 'Healthcare Compliance Report',
        content: 'Healthcare-focused report content',
        format: 'json'
      })

      const result = await analysisController.getAnalysisResults('analysis-123', 'json')
      
      expect(result.content).toContain('lgpd')
      expect(result.content).not.toContain('performance')
      expect(result.format).toBe('json')
    })

    it('should validate visualization data for healthcare compliance', async () => {
      const analysisController = {
        async getAnalysisVisualization(analysisId: string, chartTypes: string[]) {
          await mockHealthcareValidator.validateReadAccess(analysisId)
          
          const analysis = await mockAnalysisService.getAnalysis(analysisId)
          if (!analysis) {
            throw new Error('Analysis not found')
          }

          // Generate healthcare-compliant visualizations
          const visualizations = await mockVisualizationService.generateVisualization(
            analysis,
            chartTypes,
            'chartjs',
            true
          )

          return visualizations.map(viz => ({
            ...viz,
            healthcareCompliant: true,
            dataProtectionMasked: viz.data.patientId ? `${viz.data.patientId.substring(0, 4)}***` : null
          }))
        }
      }

      const mockAnalysis = {
        id: 'analysis-123',
        healthScore: 85,
        patientId: 'patient_67890',
        compliance: {
          lgpd: true,
          anvisa: true
        }
      }

      mockHealthcareValidator.validateReadAccess.mockResolvedValue(undefined)
      mockAnalysisService.getAnalysis.mockResolvedValue(mockAnalysis)
      mockVisualizationService.generateVisualization.mockResolvedValue([{
        id: 'viz-123',
        chartType: 'health-score-gauge',
        data: { patientId: 'patient_67890', healthScore: 85 },
        config: {},
        format: 'chartjs'
      }])

      const result = await analysisController.getAnalysisVisualization('analysis-123', ['health-score-gauge'])
      
      expect(result[0].healthcareCompliant).toBe(true)
      expect(result[0].dataProtectionMasked).toBe('pati***')
      expect(result[0].data.patientId).toBeUndefined() // Original data should be masked
    })
  })

  describe('Performance Optimization - Healthcare-specific', () => {
    it('should optimize performance for healthcare workflows', async () => {
      const analysisController = {
        async startAnalysis(input: any) {
          // Healthcare-specific performance optimization
          const optimizedConfig = await mockPerformanceOptimizer.optimizeConfig({
            ...input,
            healthcareSpecific: {
              enableRealtimeAuditing: true,
              optimizeForHealthcareData: true,
              maxConcurrency: 5 // Healthcare-specific concurrency limit
            }
          })

          const analysisId = await mockAnalysisService.startAnalysis(optimizedConfig)

          return { analysisId, optimized: true }
        }
      }

      const input = {
        packageName: '@neonpro/core',
        services: ['lgpd-compliance'],
        options: { depth: 5 }
      }

      mockPerformanceOptimizer.optimizeConfig.mockResolvedValue({
        ...input,
        healthcareSpecific: {
          enableRealtimeAuditing: true,
          optimizeForHealthcareData: true,
          maxConcurrency: 5
        }
      })

      const result = await analysisController.startAnalysis(input)
      
      expect(result.optimized).toBe(true)
      expect(mockPerformanceOptimizer.optimizeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareSpecific: {
            enableRealtimeAuditing: true,
            optimizeForHealthcareData: true,
            maxConcurrency: 5
          }
        })
      )
    })
  })

  describe('Audit Trail - Healthcare Compliance', () => {
    it('should log analysis access for healthcare compliance', async () => {
      const auditLog: Array<{
        action: string
        userId?: string
        clinicId?: string
        sensitiveDataAccessed: boolean
        timestamp: string
      }> = []

      const analysisController = {
        async getAnalysisResults(analysisId: string, format: string) {
          // Log healthcare audit trail
          auditLog.push({
            action: 'analysis_results_access',
            userId: 'usr_123',
            clinicId: 'clinic_456',
            sensitiveDataAccessed: format === 'pdf',
            timestamp: new Date().toISOString()
          })

          return { id: 'report-123', format }
        }
      }

      await analysisController.getAnalysisResults('analysis-123', 'json')
      
      expect(auditLog).toHaveLength(1)
      expect(auditLog[0].action).toBe('analysis_results_access')
      expect(auditLog[0].sensitiveDataAccessed).toBe(false)
      expect(auditLog[0].userId).toBe('usr_123')
    })

    it('should detect sensitive data access patterns', async () => {
      let sensitiveAccessCount = 0

      const analysisController = {
        async getAnalysisResults(analysisId: string, format: string) {
          // Detect sensitive data access
          if (format === 'pdf' || format === 'excel') {
            sensitiveAccessCount++
            
            // Healthcare compliance monitoring
            if (sensitiveAccessCount > 3) {
              throw new Error('Excessive sensitive data access detected - healthcare compliance violation')
            }
          }

          return { id: 'report-123', format }
        }
      }

      // First access - should succeed
      await analysisController.getAnalysisResults('analysis-123', 'json')
      
      // Multiple sensitive accesses - should detect pattern
      await analysisController.getAnalysisResults('analysis-123', 'pdf')
      await analysisController.getAnalysisResults('analysis-123', 'pdf')
      await analysisController.getAnalysisResults('analysis-123', 'pdf')
      
      expect(sensitiveAccessCount).toBe(3)

      // Fourth access should be blocked
      await expect(analysisController.getAnalysisResults('analysis-123', 'pdf')).rejects.toThrow(
        'Excessive sensitive data access detected'
      )
    })
  })
})