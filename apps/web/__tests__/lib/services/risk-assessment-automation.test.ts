import { createMockSupabaseClient } from '@/__tests__/utils/mock-supabase';
import {
  createRiskAssessmentService,
  type PatientRiskAssessmentService,
} from '@/app/lib/services/risk-assessment-automation';
import type {
  RiskAssessmentInput,
  RiskLevel,
} from '@/app/types/risk-assessment-automation';

// ============================================================================
// SERVICE LAYER INTEGRATION TESTS - CONSTITUTIONAL HEALTHCARE COMPLIANCE
// ============================================================================

// Mock Supabase client for testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}));

describe('Patient Risk Assessment Service - Integration Tests', () => {
  let service: PatientRiskAssessmentService;
  let mockSupabase: any;

  const mockPatientData: RiskAssessmentInput = {
    patientId: '12345678-1234-1234-1234-123456789012',
    tenantId: '87654321-4321-4321-4321-210987654321',
    assessmentDate: new Date(),
    assessmentType: 'PRE_PROCEDURE',

    demographicFactors: {
      age: 55,
      gender: 'FEMALE',
      bmi: 32.0,
      geneticPredispositions: ['diabetes familiar', 'hipertensão'],
      smokingStatus: 'CURRENT',
      alcoholConsumption: 'LIGHT',
      physicalActivityLevel: 'SEDENTARY',
    },

    medicalHistory: {
      chronicConditions: [
        'diabetes tipo 2',
        'hipertensão arterial',
        'obesidade',
      ],
      previousSurgeries: [
        {
          procedure: 'Colecistectomia laparoscópica',
          date: new Date('2022-03-15'),
          complications: ['infecção da ferida'],
          outcome: 'COMPLICATED',
        },
      ],
      allergies: [
        {
          allergen: 'Dipirona',
          severity: 'SEVERE',
          reaction: 'Broncoespasmo',
        },
      ],
      familyHistory: [
        {
          condition: 'Diabetes tipo 2',
          relationship: 'Mãe',
          ageAtDiagnosis: 48,
        },
      ],
      currentMedications: [
        {
          name: 'Metformina XR',
          dosage: '1000mg',
          frequency: '2x/dia',
          startDate: new Date('2022-01-01'),
          indication: 'Diabetes tipo 2',
        },
      ],
      immunizationStatus: {
        'COVID-19': { vaccinated: true, lastDose: new Date('2023-09-15') },
      },
    },

    currentCondition: {
      vitalSigns: {
        bloodPressure: {
          systolic: 165,
          diastolic: 95,
          timestamp: new Date(),
        },
        heartRate: {
          bpm: 88,
          rhythm: 'REGULAR',
          timestamp: new Date(),
        },
        temperature: {
          celsius: 36.8,
          timestamp: new Date(),
        },
        respiratoryRate: {
          rpm: 18,
          timestamp: new Date(),
        },
        oxygenSaturation: {
          percentage: 96,
          timestamp: new Date(),
        },
      },
      currentSymptoms: [
        {
          symptom: 'Dispneia aos esforços',
          severity: 3,
          duration: '2 semanas',
          onset: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ],
      painLevel: 4,
      mentalStatus: 'ALERT',
      mobilityStatus: 'AMBULATORY',
    },

    procedureSpecific: {
      plannedProcedure: {
        name: 'Abdominoplastia',
        type: 'SURGICAL',
        complexity: 'HIGH',
        duration: 240,
        anesthesiaRequired: true,
        anesthesiaType: 'GENERAL',
      },
      equipmentRequired: [
        {
          device: 'Bisturi elétrico',
          anvisaRegistration: 'REG-80146280001',
          riskClass: 'II',
        },
      ],
      contraindicationsPresent: ['Diabetes não controlado'],
      drugInteractions: [],
    },

    environmental: {
      supportSystem: {
        hasCaregiver: true,
        familySupport: 'MODERATE',
        socialIsolation: false,
        languageBarriers: false,
      },
      accessibilityFactors: {
        transportationAvailable: true,
        distanceToClinic: 25,
        financialConstraints: true,
        insuranceCoverage: 'PARTIAL',
      },
      complianceHistory: {
        previousAppointmentAttendance: 75,
        medicationCompliance: 'FAIR',
        followUpCompliance: 'GOOD',
      },
    },

    // LGPD Compliance
    consentGiven: true,
    consentDate: new Date(),
    dataProcessingPurpose: ['risk_assessment', 'treatment_planning'],
    retentionPeriod: 2555, // 7 years
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = createRiskAssessmentService({
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      enableRealTimeMonitoring: true,
      professionalOversightEnabled: true,
      auditTrailEnabled: true,
      performanceMonitoringEnabled: true,
    });

    mockSupabase = createMockSupabaseClient();
  });

  describe('executeRiskAssessment', () => {
    it('should execute complete risk assessment workflow', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await service.executeRiskAssessment(
        mockPatientData,
        'CRM123456/SP',
        '192.168.1.100',
        'Mozilla/5.0 Test Browser',
      );

      expect(result).toHaveProperty('id');
      expect(result.patientId).toBe(mockPatientData.patientId);
      expect(result.scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.scoreBreakdown.overallScore).toBeLessThanOrEqual(100);
      expect(result.accuracy).toBeGreaterThanOrEqual(98); // ≥98% requirement
    });

    it('should handle LGPD compliance validation', async () => {
      const nonCompliantData = {
        ...mockPatientData,
        consentGiven: false,
      };

      await expect(
        service.executeRiskAssessment(nonCompliantData, 'CRM123456/SP'),
      ).rejects.toThrow(/Consentimento LGPD/);
    });

    it('should meet processing time requirements', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const startTime = performance.now();

      await service.executeRiskAssessment(mockPatientData, 'CRM123456/SP');

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(1000); // Service layer should be <1s
    });
  });

  describe('Database Integration', () => {
    it('should store risk assessment with constitutional compliance', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await service.executeRiskAssessment(mockPatientData, 'CRM123456/SP');

      // Verify database calls
      expect(mockSupabase.from).toHaveBeenCalledWith(
        'patient_risk_assessments',
      );
      expect(mockInsert).toHaveBeenCalled();

      const insertedData = mockInsert.mock.calls[0][0];
      expect(insertedData).toHaveProperty(
        'patient_id',
        mockPatientData.patientId,
      );
      expect(insertedData).toHaveProperty(
        'tenant_id',
        mockPatientData.tenantId,
      );
      expect(insertedData).toHaveProperty('consent_given', true);
      expect(insertedData).toHaveProperty('retention_expiry');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Database connection failed' },
        }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await expect(
        service.executeRiskAssessment(mockPatientData, 'CRM123456/SP'),
      ).rejects.toThrow(/Database storage failed/);
    });
  });

  describe('Professional Oversight Integration', () => {
    it('should trigger professional notifications for high-risk patients', async () => {
      const highRiskPatient = {
        ...mockPatientData,
        currentCondition: {
          ...mockPatientData.currentCondition,
          vitalSigns: {
            ...mockPatientData.currentCondition.vitalSigns,
            bloodPressure: {
              systolic: 180,
              diastolic: 110,
              timestamp: new Date(),
            },
          },
        },
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await service.executeRiskAssessment(
        highRiskPatient,
        'CRM123456/SP',
      );

      expect(result.professionalOversight.requiredReview).toBe(true);
      expect(result.professionalOversight.timeframe).toBeLessThanOrEqual(30);
    });
  });

  describe('Audit Trail Compliance', () => {
    it('should create comprehensive audit trails', async () => {
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

      await service.executeRiskAssessment(mockPatientData, 'CRM123456/SP');

      expect(mockAuditInsert).toHaveBeenCalled();

      const auditData = mockAuditInsert.mock.calls[0][0];
      expect(auditData).toHaveProperty('patient_id', mockPatientData.patientId);
      expect(auditData).toHaveProperty('action', 'CREATED');
      expect(auditData).toHaveProperty('performed_by', 'CRM123456/SP');
      expect(auditData).toHaveProperty('legal_basis');
      expect(auditData).toHaveProperty('digital_signature');
    });
  });

  describe('Service Health Monitoring', () => {
    it('should provide service health metrics', async () => {
      const health = await service.getServiceHealth();

      expect(health).toHaveProperty('status');
      expect(health.status).toBeOneOf(['healthy', 'degraded', 'unhealthy']);
      expect(health).toHaveProperty('metrics');
      expect(health.metrics).toHaveProperty('totalAssessments');
      expect(health.metrics).toHaveProperty('averageAccuracy');
      expect(health.metrics).toHaveProperty('averageProcessingTime');
      expect(health.lastUpdated).toBeInstanceOf(Date);
    });

    it('should detect degraded performance', async () => {
      // Mock poor performance metrics
      jest
        .spyOn(
          require('@/lib/ai/risk-assessment/risk-scoring-algorithm'),
          'riskScoringEngine',
        )
        .mockReturnValue({
          getPerformanceMetrics: () => ({
            averageAccuracy: 92, // Below 95% threshold
            averageProcessingTime: 150, // Above 100ms but below 200ms
            totalAssessments: 100,
            cacheHitRate: 0.75,
          }),
        });

      const health = await service.getServiceHealth();
      expect(health.status).toBe('degraded');
    });
  });
});
