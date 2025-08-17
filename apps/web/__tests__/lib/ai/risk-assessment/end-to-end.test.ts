import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCriticalPatientData,
  createHighRiskPatientData,
  createLowRiskPatientData,
  createMockPatientData,
} from '@/__tests__/utils/mock-supabase';
import { createRiskAssessmentService } from '@/app/lib/services/risk-assessment-automation';
import { RiskAssessmentIntegration } from '@/lib/ai/patient-insights/risk-assessment';

// ============================================================================
// END-TO-END RISK ASSESSMENT WORKFLOW TESTS
// ============================================================================

describe('Patient Risk Assessment System - End-to-End Workflow', () => {
  let riskAssessmentService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create service with test configuration
    riskAssessmentService = createRiskAssessmentService({
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key-12345',
      enableRealTimeMonitoring: true,
      professionalOversightEnabled: true,
      auditTrailEnabled: true,
      performanceMonitoringEnabled: true,
    });
  });

  describe('Complete Clinical Workflow', () => {
    it('should execute complete workflow for low-risk patient', async () => {
      const lowRiskPatient = createLowRiskPatientData();

      // Mock successful database operations
      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      // Execute risk assessment
      const result = await riskAssessmentService.executeRiskAssessment(
        lowRiskPatient,
        'CRM123456/SP',
        '192.168.1.100',
        'NeonPro Healthcare System',
      );

      // Validate low-risk classification
      expect(result.scoreBreakdown.riskLevel).toBeOneOf(['LOW', 'MEDIUM']);
      expect(result.scoreBreakdown.overallScore).toBeLessThan(50);

      // Professional oversight should be minimal
      expect(result.professionalOversight.timeframe).toBeGreaterThanOrEqual(30);
      expect(result.professionalOversight.reviewLevel).toBeOneOf([
        'NURSE',
        'PHYSICIAN',
      ]);

      // No emergency escalation
      expect(result.emergencyEscalation?.triggered).toBeFalsy();

      // Recommendations should be routine
      const criticalRecommendations = result.recommendations.filter(
        (r) => r.priority === 'CRITICAL',
      );
      expect(criticalRecommendations).toHaveLength(0);
    });

    it('should execute complete workflow for high-risk patient', async () => {
      const highRiskPatient = createHighRiskPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await riskAssessmentService.executeRiskAssessment(
        highRiskPatient,
        'CRM789012/SP',
      );

      // Validate high-risk classification
      expect(result.scoreBreakdown.riskLevel).toBeOneOf(['HIGH', 'CRITICAL']);
      expect(result.scoreBreakdown.overallScore).toBeGreaterThan(60);

      // Professional oversight should be intensive
      expect(result.professionalOversight.requiredReview).toBe(true);
      expect(result.professionalOversight.timeframe).toBeLessThanOrEqual(30);
      expect(result.professionalOversight.reviewLevel).toBeOneOf([
        'PHYSICIAN',
        'SPECIALIST',
        'SENIOR_PHYSICIAN',
      ]);

      // May trigger emergency escalation
      if (result.emergencyEscalation?.triggered) {
        expect(result.emergencyEscalation.alertLevel).toBeOneOf([
          'ORANGE',
          'RED',
          'BLACK',
        ]);
        expect(result.emergencyEscalation.escalationPriority).toBeOneOf([
          'URGENT',
          'IMMEDIATE',
          'EMERGENCY',
        ]);
      }

      // Should have multiple recommendations
      expect(result.recommendations.length).toBeGreaterThan(3);
      const highPriorityRecommendations = result.recommendations.filter(
        (r) => r.priority === 'HIGH' || r.priority === 'CRITICAL',
      );
      expect(highPriorityRecommendations.length).toBeGreaterThan(0);
    });

    it('should execute complete workflow for critical patient', async () => {
      const criticalPatient = createCriticalPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await riskAssessmentService.executeRiskAssessment(
        criticalPatient,
        'CRM345678/SP',
      );

      // Validate critical classification
      expect(result.scoreBreakdown.riskLevel).toBe('CRITICAL');
      expect(result.scoreBreakdown.overallScore).toBeGreaterThan(85);

      // Professional oversight should be immediate
      expect(result.professionalOversight.requiredReview).toBe(true);
      expect(result.professionalOversight.timeframe).toBeLessThanOrEqual(15);
      expect(result.professionalOversight.reviewLevel).toBeOneOf([
        'SENIOR_PHYSICIAN',
        'SPECIALIST',
      ]);

      // Must trigger emergency escalation
      expect(result.emergencyEscalation?.triggered).toBe(true);
      expect(result.emergencyEscalation?.alertLevel).toBeOneOf([
        'RED',
        'BLACK',
      ]);
      expect(result.emergencyEscalation?.escalationPriority).toBeOneOf([
        'IMMEDIATE',
        'EMERGENCY',
      ]);

      // Should have critical recommendations
      const criticalRecommendations = result.recommendations.filter(
        (r) => r.priority === 'CRITICAL',
      );
      expect(criticalRecommendations.length).toBeGreaterThan(0);

      // Immediate timeframe requirements
      const immediateRecommendations = result.recommendations.filter(
        (r) => r.timeframe === 'Imediato',
      );
      expect(immediateRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Treatment Integration Workflow', () => {
    it('should integrate risk assessment with treatment predictions', async () => {
      const patientData = createMockPatientData({
        medicalHistory: {
          chronicConditions: ['diabetes', 'hipertensão'],
        },
      });

      // Mock treatment options
      const treatmentOptions = [
        {
          treatmentId: 'TRT001',
          name: 'Procedimento Estético Simples',
          complexity: 'LOW' as const,
          estimatedOutcome: 85,
        },
        {
          treatmentId: 'TRT002',
          name: 'Cirurgia Plástica',
          complexity: 'HIGH' as const,
          estimatedOutcome: 75,
        },
        {
          treatmentId: 'TRT003',
          name: 'Tratamento Minimamente Invasivo',
          complexity: 'MEDIUM' as const,
          estimatedOutcome: 80,
        },
      ];

      // Mock database for risk history
      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'assessment-123',
              patient_id: patientData.patientId,
              overall_score: 65,
              risk_level: 'MEDIUM',
              category_scores: {
                demographic: 40,
                medicalHistory: 60,
                currentCondition: 30,
                procedureSpecific: 50,
                environmental: 20,
                psychosocial: 10,
              },
              critical_factors: [
                {
                  factor: 'Diabetes tipo 2',
                  category: 'MEDICAL_HISTORY',
                  impact: 20,
                  explanation:
                    'Condição crônica que aumenta risco de complicações',
                },
              ],
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Execute treatment enhancement
      const enhancedTreatments =
        await RiskAssessmentIntegration.enhanceTreatmentPrediction(
          patientData.patientId,
          patientData.tenantId,
          treatmentOptions,
          'CRM123456/SP',
        );

      // Validate results
      expect(enhancedTreatments).toHaveLength(3);

      // Check risk-adjusted outcomes
      enhancedTreatments.forEach((treatment) => {
        expect(treatment.riskAdjustedOutcome).toBeLessThanOrEqual(
          treatment.name === 'Procedimento Estético Simples' ? 85 : 75,
        );
        expect(treatment.riskLevel).toBeOneOf([
          'LOW',
          'MEDIUM',
          'HIGH',
          'CRITICAL',
        ]);
        expect(treatment.riskFactors).toBeInstanceOf(Array);
        expect(treatment.recommendations).toBeInstanceOf(Array);
      });

      // High complexity treatment should have more risk factors
      const highComplexityTreatment = enhancedTreatments.find(
        (t) => t.name === 'Cirurgia Plástica',
      );
      const lowComplexityTreatment = enhancedTreatments.find(
        (t) => t.name === 'Procedimento Estético Simples',
      );

      expect(highComplexityTreatment?.riskAdjustedOutcome).toBeLessThan(
        lowComplexityTreatment?.riskAdjustedOutcome,
      );
    });
  });

  describe('Real-Time Monitoring Integration', () => {
    it('should integrate vital signs monitoring with risk updates', async () => {
      const patientData = createMockPatientData();

      // Mock baseline risk assessment
      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              patient_id: patientData.patientId,
              overall_score: 45,
              risk_level: 'MEDIUM',
              category_scores: { currentCondition: 30 },
              critical_factors: [],
            },
          ],
          error: null,
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Simulate critical vital signs change
      const criticalVitalSigns = {
        bloodPressure: { systolic: 190, diastolic: 120 },
        heartRate: 45,
        temperature: 39.8,
        respiratoryRate: 8,
        oxygenSaturation: 85,
      };

      const result =
        await RiskAssessmentIntegration.integrateVitalSignsMonitoring(
          patientData.patientId,
          patientData.tenantId,
          criticalVitalSigns,
          'CRM123456/SP',
        );

      // Should trigger risk update
      expect(result.riskUpdate).toBe(true);
      expect(result.newRiskLevel).toBeOneOf(['HIGH', 'CRITICAL']);
      expect(result.alerts.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Verify specific alerts for critical vitals
      expect(
        result.alerts.some((alert) => alert.includes('hipertensiva')),
      ).toBe(true);
      expect(result.alerts.some((alert) => alert.includes('Hipoxemia'))).toBe(
        true,
      );
    });

    it('should handle stable vital signs without triggering updates', async () => {
      const patientData = createMockPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              patient_id: patientData.patientId,
              overall_score: 25,
              risk_level: 'LOW',
            },
          ],
          error: null,
        }),
      });

      // Normal vital signs
      const normalVitalSigns = {
        bloodPressure: { systolic: 125, diastolic: 82 },
        heartRate: 72,
        temperature: 36.6,
        respiratoryRate: 16,
        oxygenSaturation: 99,
      };

      const result =
        await RiskAssessmentIntegration.integrateVitalSignsMonitoring(
          patientData.patientId,
          patientData.tenantId,
          normalVitalSigns,
          'CRM123456/SP',
        );

      // Should not trigger risk update
      expect(result.riskUpdate).toBe(false);
      expect(result.alerts.length).toBe(0);
    });
  });

  describe('Performance and Compliance Validation', () => {
    it('should meet constitutional healthcare performance requirements', async () => {
      const patientData = createMockPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      // Test multiple assessments for performance consistency
      const assessmentTimes: number[] = [];
      const accuracyScores: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        const result = await riskAssessmentService.executeRiskAssessment(
          patientData,
          'CRM123456/SP',
        );

        const endTime = performance.now();
        assessmentTimes.push(endTime - startTime);
        accuracyScores.push(result.accuracy);
      }

      // Performance requirements
      const averageTime =
        assessmentTimes.reduce((a, b) => a + b) / assessmentTimes.length;
      expect(averageTime).toBeLessThan(1000); // Service layer <1s

      const maxTime = Math.max(...assessmentTimes);
      expect(maxTime).toBeLessThan(2000); // Maximum single execution

      // Accuracy requirements
      const averageAccuracy =
        accuracyScores.reduce((a, b) => a + b) / accuracyScores.length;
      expect(averageAccuracy).toBeGreaterThanOrEqual(98); // ≥98% requirement
    });

    it('should validate LGPD compliance throughout workflow', async () => {
      const patientData = createMockPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      const mockAuditInsert = jest.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'audit_trail') {
          return { insert: mockAuditInsert };
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      await riskAssessmentService.executeRiskAssessment(
        patientData,
        'CRM123456/SP',
        '192.168.1.100',
      );

      // Verify audit trail creation
      expect(mockAuditInsert).toHaveBeenCalled();

      const auditData = mockAuditInsert.mock.calls[0][0];
      expect(auditData).toHaveProperty('legal_basis');
      expect(auditData).toHaveProperty('data_subject_notified');
      expect(auditData).toHaveProperty('retention_expiry');
      expect(auditData).toHaveProperty('digital_signature');
    });

    it('should validate Brazilian healthcare context consistency', async () => {
      const patientData = createMockPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await riskAssessmentService.executeRiskAssessment(
        patientData,
        'CRM123456/SP',
      );

      // Verify Portuguese language in recommendations
      const hasPortugueseText = result.recommendations.some(
        (rec) =>
          rec.action.includes('paciente') ||
          rec.action.includes('médic') ||
          rec.action.includes('avaliação') ||
          rec.rationale.includes('risco'),
      );
      expect(hasPortugueseText).toBe(true);

      // Verify CFM format in created_by
      expect(result.createdBy).toMatch(/CRM\d+\/[A-Z]{2}/);

      // Verify Brazilian healthcare context in critical factors
      if (result.scoreBreakdown.criticalFactors.length > 0) {
        const hasPortugueseFactors = result.scoreBreakdown.criticalFactors.some(
          (factor) =>
            factor.explanation.includes('paciente') ||
            factor.explanation.includes('risco') ||
            factor.explanation.includes('condição'),
        );
        expect(hasPortugueseFactors).toBe(true);
      }
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle database failures gracefully', async () => {
      const patientData = createMockPatientData();

      const mockSupabase =
        require('@/__tests__/utils/mock-supabase').createMockSupabaseClient();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Database connection failed' },
        }),
      });

      await expect(
        riskAssessmentService.executeRiskAssessment(
          patientData,
          'CRM123456/SP',
        ),
      ).rejects.toThrow();
    });

    it('should validate input data integrity', async () => {
      const invalidPatientData = {
        ...createMockPatientData(),
        demographicFactors: {
          ...createMockPatientData().demographicFactors,
          age: -5, // Invalid age
        },
      };

      await expect(
        riskAssessmentService.executeRiskAssessment(
          invalidPatientData,
          'CRM123456/SP',
        ),
      ).rejects.toThrow();
    });
  });
});
