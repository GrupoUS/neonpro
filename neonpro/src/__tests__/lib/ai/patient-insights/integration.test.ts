// Tests for Patient Insights Integration Module
// Story 3.2: Task 9 - Basic Integration Testing

import { PatientInsightsIntegration } from '@/lib/ai/patient-insights/index'

describe('PatientInsightsIntegration', () => {
  let patientInsights: PatientInsightsIntegration
  
  beforeEach(() => {
    // Initialize with test configuration
    patientInsights = new PatientInsightsIntegration({
      enableRiskAssessment: true,
      enableTreatmentRecommendations: true,
      enablePredictiveAnalytics: true,
      enableBehaviorAnalysis: true,
      enableHealthTrends: true,
      enableContinuousLearning: true,
      riskThresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      },
      parallelProcessing: true
    })
  })

  describe('Configuration and Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultInstance = new PatientInsightsIntegration()
      expect(defaultInstance).toBeInstanceOf(PatientInsightsIntegration)
    })

    it('should apply custom configuration', () => {
      const customConfig = {
        enableRiskAssessment: false,
        enableBehaviorAnalysis: true,
        riskThresholds: {
          low: 0.2,
          medium: 0.5,
          high: 0.7
        }
      }
      
      const customInstance = new PatientInsightsIntegration(customConfig)
      expect(customInstance).toBeInstanceOf(PatientInsightsIntegration)
    })
  })

  describe('Basic Functionality', () => {
    it('should have required methods', () => {
      expect(typeof patientInsights.generateComprehensiveInsights).toBe('function')
      expect(typeof patientInsights.generateQuickRiskAssessment).toBe('function')
      expect(typeof patientInsights.generateTreatmentGuidance).toBe('function')
      expect(typeof patientInsights.monitorPatientAlerts).toBe('function')
      expect(typeof patientInsights.updatePatientOutcome).toBe('function')
      expect(typeof patientInsights.getSystemHealth).toBe('function')
    })

    it('should return system health status', async () => {
      const result = await patientInsights.getSystemHealth()
      
      expect(result).toBeDefined()
      expect(result.overall).toMatch(/^(healthy|degraded|critical)$/)
      expect(Array.isArray(result.engines)).toBe(true)
      expect(result.lastChecked).toBeInstanceOf(Date)
      expect(result.uptime).toBeGreaterThanOrEqual(0)
      expect(result.performance).toBeDefined()
      expect(result.performance.averageResponseTime).toBeGreaterThanOrEqual(0)
      expect(result.performance.successRate).toBeGreaterThanOrEqual(0)
      expect(result.performance.errorRate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Configuration Edge Cases', () => {
    it('should handle disabled modules gracefully', () => {
      const minimalInstance = new PatientInsightsIntegration({
        enableRiskAssessment: false,
        enableTreatmentRecommendations: false,
        enablePredictiveAnalytics: false,
        enableBehaviorAnalysis: false,
        enableHealthTrends: false,
        enableContinuousLearning: false
      })
      
      expect(minimalInstance).toBeInstanceOf(PatientInsightsIntegration)
    })

    it('should handle partial configuration', () => {
      const partialInstance = new PatientInsightsIntegration({
        enableRiskAssessment: true,
        riskThresholds: {
          low: 0.1,
          medium: 0.5,
          high: 0.9
        }
      })
      
      expect(partialInstance).toBeInstanceOf(PatientInsightsIntegration)
    })
  })

  describe('Error Handling for Disabled Features', () => {
    it('should throw error when risk assessment is disabled', async () => {
      const disabledInstance = new PatientInsightsIntegration({
        enableRiskAssessment: false
      })
      
      await expect(
        disabledInstance.generateQuickRiskAssessment('patient-123')
      ).rejects.toThrow('Risk assessment is disabled')
    })

    it('should throw error when treatment recommendations are disabled', async () => {
      const disabledInstance = new PatientInsightsIntegration({
        enableTreatmentRecommendations: false
      })
      
      await expect(
        disabledInstance.generateTreatmentGuidance('patient-123')
      ).rejects.toThrow('Treatment recommendations are disabled')
    })

    it('should return empty array when continuous learning is disabled', async () => {
      const disabledInstance = new PatientInsightsIntegration({
        enableContinuousLearning: false
      })
      
      const result = await disabledInstance.updatePatientOutcome(
        'patient-123',
        'treatment-456',
        { result: 'successful' }
      )
      
      expect(result).toEqual([])
    })
  })

  describe('Input Validation', () => {
    it('should validate patient ID in comprehensive insights', async () => {
      await expect(
        patientInsights.generateComprehensiveInsights({
          patientId: '',
          requestId: 'req-456',
          requestedInsights: ['risk'],
          timestamp: new Date(),
          userId: 'user-789',
          clinicId: 'clinic-abc'
        })
      ).rejects.toThrow('Patient ID is required')
    })

    it('should validate requested insights array', async () => {
      await expect(
        patientInsights.generateComprehensiveInsights({
          patientId: 'patient-123',
          requestId: 'req-456',
          requestedInsights: [],
          timestamp: new Date(),
          userId: 'user-789',
          clinicId: 'clinic-abc'
        })
      ).rejects.toThrow('At least one insight type must be requested')
    })
  })

  describe('Performance Requirements', () => {
    it('should complete system health check within reasonable time', async () => {
      const start = Date.now()
      
      await patientInsights.getSystemHealth()
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(5000) // 5 seconds max
    }, 10000)
  })
})