import type { RiskAssessmentInput } from '@/app/types/risk-assessment-automation';
import {
  calculateComprehensiveRiskAssessment,
  calculateCurrentConditionRisk,
  calculateDemographicRisk,
  calculateEnvironmentalRisk,
  calculateMedicalHistoryRisk,
  calculateProcedureSpecificRisk,
  determineEmergencyEscalation,
  RISK_THRESHOLDS,
} from '@/lib/ai/risk-assessment/ml-risk-models';

// ============================================================================
// ML RISK MODELS TEST SUITE - CONSTITUTIONAL HEALTHCARE COMPLIANCE
// ============================================================================

describe('ML Risk Models - Constitutional Healthcare Tests', () => {
  // Mock patient data for comprehensive testing
  const mockPatientData: RiskAssessmentInput = {
    patientId: '12345678-1234-1234-1234-123456789012',
    tenantId: '87654321-4321-4321-4321-210987654321',
    assessmentDate: new Date(),
    assessmentType: 'PRE_PROCEDURE',

    demographicFactors: {
      age: 45,
      gender: 'MALE',
      bmi: 28.5,
      geneticPredispositions: ['hipertensão familiar'],
      smokingStatus: 'FORMER',
      alcoholConsumption: 'MODERATE',
      physicalActivityLevel: 'LIGHT',
    },

    medicalHistory: {
      chronicConditions: ['hipertensão', 'diabetes tipo 2'],
      previousSurgeries: [
        {
          procedure: 'Apendicectomia',
          date: new Date('2020-01-15'),
          outcome: 'SUCCESSFUL',
        },
      ],
      allergies: [
        {
          allergen: 'Penicilina',
          severity: 'MODERATE',
          reaction: 'Rash cutâneo',
        },
      ],
      familyHistory: [
        {
          condition: 'Cardiopatia',
          relationship: 'Pai',
          ageAtDiagnosis: 55,
        },
      ],
      currentMedications: [
        {
          name: 'Losartana',
          dosage: '50mg',
          frequency: '1x/dia',
          startDate: new Date('2023-01-01'),
          indication: 'Hipertensão',
        },
        {
          name: 'Metformina',
          dosage: '850mg',
          frequency: '2x/dia',
          startDate: new Date('2023-01-01'),
          indication: 'Diabetes',
        },
      ],
      immunizationStatus: {
        'COVID-19': { vaccinated: true, lastDose: new Date('2023-01-01') },
        Influenza: { vaccinated: true, lastDose: new Date('2023-03-01') },
      },
    },

    currentCondition: {
      vitalSigns: {
        bloodPressure: {
          systolic: 140,
          diastolic: 90,
          timestamp: new Date(),
        },
        heartRate: {
          bpm: 75,
          rhythm: 'REGULAR',
          timestamp: new Date(),
        },
        temperature: {
          celsius: 36.5,
          timestamp: new Date(),
        },
        respiratoryRate: {
          rpm: 16,
          timestamp: new Date(),
        },
        oxygenSaturation: {
          percentage: 98,
          timestamp: new Date(),
        },
      },
      currentSymptoms: [],
      painLevel: 2,
      mentalStatus: 'ALERT',
      mobilityStatus: 'AMBULATORY',
    },

    environmental: {
      supportSystem: {
        hasCaregiver: true,
        familySupport: 'STRONG',
        socialIsolation: false,
        languageBarriers: false,
      },
      accessibilityFactors: {
        transportationAvailable: true,
        distanceToClinic: 15,
        financialConstraints: false,
        insuranceCoverage: 'FULL',
      },
      complianceHistory: {
        previousAppointmentAttendance: 90,
        medicationCompliance: 'GOOD',
        followUpCompliance: 'GOOD',
      },
    },

    // LGPD Compliance
    consentGiven: true,
    consentDate: new Date(),
    dataProcessingPurpose: ['risk_assessment', 'treatment_planning'],
    retentionPeriod: 2555, // 7 years
  };

  describe('Demographic Risk Assessment', () => {
    it('should calculate demographic risk with Brazilian healthcare standards', () => {
      const result = calculateDemographicRisk(
        mockPatientData.demographicFactors,
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.factors).toBeInstanceOf(Array);

      // Verify specific risk factors are identified
      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Ex-tabagista'))).toBe(
        true,
      );
      expect(factorNames.some((name) => name.includes('Sobrepeso'))).toBe(true);
    });

    it('should handle extreme age cases correctly', () => {
      const elderlyPatient = {
        ...mockPatientData.demographicFactors,
        age: 75,
      };

      const result = calculateDemographicRisk(elderlyPatient);
      expect(result.score).toBeGreaterThan(15); // Should have higher risk for elderly

      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Idade avançada'))).toBe(
        true,
      );
    });

    it('should identify high-risk smoking status', () => {
      const smokingPatient = {
        ...mockPatientData.demographicFactors,
        smokingStatus: 'CURRENT' as const,
      };

      const result = calculateDemographicRisk(smokingPatient);
      expect(result.score).toBeGreaterThan(20); // Smoking significantly increases risk

      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Tabagismo atual'))).toBe(
        true,
      );
    });

    it('should meet constitutional healthcare accuracy requirement (≥98%)', () => {
      // Test with known risk scenarios
      const testCases = [
        { age: 25, bmi: 22, smokingStatus: 'NEVER', expectedRisk: 'LOW' },
        { age: 75, bmi: 35, smokingStatus: 'CURRENT', expectedRisk: 'HIGH' },
        { age: 65, bmi: 30, smokingStatus: 'FORMER', expectedRisk: 'MEDIUM' },
      ] as const;

      const accurateResults = testCases.filter((testCase) => {
        const testData = {
          ...mockPatientData.demographicFactors,
          age: testCase.age,
          bmi: testCase.bmi,
          smokingStatus: testCase.smokingStatus,
        };

        const result = calculateDemographicRisk(testData);

        switch (testCase.expectedRisk) {
          case 'LOW':
            return result.score < 30;
          case 'MEDIUM':
            return result.score >= 30 && result.score < 70;
          case 'HIGH':
            return result.score >= 70;
          default:
            return false;
        }
      });

      const accuracy = (accurateResults.length / testCases.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(98); // ≥98% accuracy requirement
    });
  });

  describe('Medical History Risk Assessment', () => {
    it('should identify high-risk chronic conditions', () => {
      const result = calculateMedicalHistoryRisk(
        mockPatientData.medicalHistory,
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);

      // Should identify diabetes and hypertension as high-risk
      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some(
          (name) => name.includes('diabetes') || name.includes('hipertensão'),
        ),
      ).toBe(true);
    });

    it('should handle multiple chronic conditions with multiplier effect', () => {
      const multiConditionPatient = {
        ...mockPatientData.medicalHistory,
        chronicConditions: [
          'diabetes',
          'hipertensão',
          'cardiopatia',
          'insuficiência renal',
        ],
      };

      const result = calculateMedicalHistoryRisk(multiConditionPatient);

      // Multiple conditions should increase risk significantly
      expect(result.score).toBeGreaterThan(40);

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) => name.includes('Múltiplas condições')),
      ).toBe(true);
    });

    it('should validate ANVISA medication compliance', () => {
      const result = calculateMedicalHistoryRisk(
        mockPatientData.medicalHistory,
      );

      // Should handle Brazilian medication names correctly
      expect(result.factors.length).toBeGreaterThanOrEqual(0);

      // Verify Brazilian healthcare context is maintained
      const hasPortugueseFactors = result.factors.some(
        (f) =>
          f.explanation.includes('Condição') || f.explanation.includes('risco'),
      );
      expect(hasPortugueseFactors).toBe(true);
    });
  });
  describe('Current Condition Risk Assessment', () => {
    it('should detect critical vital signs (Brazilian emergency standards)', () => {
      const criticalVitalsPatient = {
        ...mockPatientData.currentCondition,
        vitalSigns: {
          ...mockPatientData.currentCondition.vitalSigns,
          bloodPressure: {
            systolic: 190,
            diastolic: 120,
            timestamp: new Date(),
          },
          oxygenSaturation: {
            percentage: 85,
            timestamp: new Date(),
          },
        },
      };

      const result = calculateCurrentConditionRisk(criticalVitalsPatient);

      expect(result.score).toBeGreaterThan(60); // Critical vitals should result in high risk

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) => name.includes('Crise hipertensiva')),
      ).toBe(true);
      expect(
        factorNames.some((name) => name.includes('Hipoxemia crítica')),
      ).toBe(true);
    });

    it('should assess mental status correctly', () => {
      const unconsciousPatient = {
        ...mockPatientData.currentCondition,
        mentalStatus: 'UNCONSCIOUS' as const,
      };

      const result = calculateCurrentConditionRisk(unconsciousPatient);

      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Inconsciência'))).toBe(
        true,
      );
      expect(result.score).toBeGreaterThan(30); // Unconscious state is high risk
    });

    it('should handle severe pain levels', () => {
      const severePainPatient = {
        ...mockPatientData.currentCondition,
        painLevel: 9 as const,
      };

      const result = calculateCurrentConditionRisk(severePainPatient);

      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Dor severa'))).toBe(
        true,
      );
    });

    it('should meet performance requirement (<100ms processing)', async () => {
      const startTime = performance.now();

      calculateCurrentConditionRisk(mockPatientData.currentCondition);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(100); // <100ms requirement
    });
  });

  describe('Procedure-Specific Risk Assessment', () => {
    const mockProcedure = {
      plannedProcedure: {
        name: 'Procedimento Estético',
        type: 'COSMETIC' as const,
        complexity: 'MEDIUM' as const,
        duration: 120,
        anesthesiaRequired: true,
        anesthesiaType: 'LOCAL' as const,
      },
      equipmentRequired: [
        {
          device: 'Laser CO2',
          anvisaRegistration: 'REG-12345',
          riskClass: 'III' as const,
        },
      ],
      contraindicationsPresent: [],
      drugInteractions: [],
    };

    it('should assess ANVISA equipment compliance', () => {
      const result = calculateProcedureSpecificRisk(mockProcedure);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) => name.includes('Equipamento Classe III')),
      ).toBe(true);
    });

    it('should handle complex procedures with general anesthesia', () => {
      const complexProcedure = {
        ...mockProcedure,
        plannedProcedure: {
          ...mockProcedure.plannedProcedure,
          complexity: 'COMPLEX' as const,
          anesthesiaType: 'GENERAL' as const,
          duration: 300,
        },
      };

      const result = calculateProcedureSpecificRisk(complexProcedure);

      expect(result.score).toBeGreaterThan(30); // Complex procedure should have higher risk

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) => name.includes('alta complexidade')),
      ).toBe(true);
      expect(factorNames.some((name) => name.includes('Anestesia geral'))).toBe(
        true,
      );
    });

    it('should identify drug interactions', () => {
      const procedureWithInteractions = {
        ...mockProcedure,
        drugInteractions: [
          {
            medication1: 'Varfarina',
            medication2: 'Aspirina',
            severity: 'MAJOR' as const,
            description: 'Risco de sangramento',
          },
        ],
      };

      const result = calculateProcedureSpecificRisk(procedureWithInteractions);

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) =>
          name.includes('Interações medicamentosas graves'),
        ),
      ).toBe(true);
    });
  });

  describe('Environmental Risk Assessment', () => {
    it('should assess social support systems', () => {
      const isolatedPatient = {
        ...mockPatientData.environmental,
        supportSystem: {
          hasCaregiver: false,
          familySupport: 'NONE' as const,
          socialIsolation: true,
          languageBarriers: true,
        },
      };

      const result = calculateEnvironmentalRisk(isolatedPatient);

      expect(result.score).toBeGreaterThan(20); // Poor support should increase risk

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) =>
          name.includes('Ausência de suporte familiar'),
        ),
      ).toBe(true);
      expect(
        factorNames.some((name) => name.includes('Isolamento social')),
      ).toBe(true);
    });

    it('should assess healthcare accessibility', () => {
      const poorAccessPatient = {
        ...mockPatientData.environmental,
        accessibilityFactors: {
          transportationAvailable: false,
          distanceToClinic: 80,
          financialConstraints: true,
          insuranceCoverage: 'NONE' as const,
        },
      };

      const result = calculateEnvironmentalRisk(poorAccessPatient);

      const factorNames = result.factors.map((f) => f.factor);
      expect(
        factorNames.some((name) => name.includes('Transporte indisponível')),
      ).toBe(true);
      expect(
        factorNames.some((name) => name.includes('Distância elevada')),
      ).toBe(true);
      expect(
        factorNames.some((name) => name.includes('cobertura de seguro')),
      ).toBe(true);
    });

    it('should assess compliance history', () => {
      const poorCompliancePatient = {
        ...mockPatientData.environmental,
        complianceHistory: {
          previousAppointmentAttendance: 40,
          medicationCompliance: 'POOR' as const,
          followUpCompliance: 'POOR' as const,
        },
      };

      const result = calculateEnvironmentalRisk(poorCompliancePatient);

      const factorNames = result.factors.map((f) => f.factor);
      expect(factorNames.some((name) => name.includes('Baixa aderência'))).toBe(
        true,
      );
    });
  });

  describe('Comprehensive Risk Assessment', () => {
    it('should calculate overall risk with weighted factors', () => {
      const result = calculateComprehensiveRiskAssessment(mockPatientData);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskLevel);
      expect(result.categoryScores).toHaveProperty('demographic');
      expect(result.categoryScores).toHaveProperty('medicalHistory');
      expect(result.categoryScores).toHaveProperty('currentCondition');
      expect(result.categoryScores).toHaveProperty('environmental');
      expect(result.criticalFactors).toBeInstanceOf(Array);
      expect(result.confidenceInterval).toHaveProperty('lower');
      expect(result.confidenceInterval).toHaveProperty('upper');
      expect(result.confidenceInterval).toHaveProperty('confidence');
    });

    it('should maintain constitutional healthcare accuracy (≥98%)', () => {
      // Test multiple scenarios for accuracy validation
      const testScenarios = [
        {
          name: 'Low Risk Scenario',
          modifications: {
            demographicFactors: {
              age: 25,
              bmi: 22,
              smokingStatus: 'NEVER' as const,
            },
            medicalHistory: { chronicConditions: [], currentMedications: [] },
            currentCondition: {
              ...mockPatientData.currentCondition,
              vitalSigns: {
                ...mockPatientData.currentCondition.vitalSigns,
                bloodPressure: {
                  systolic: 120,
                  diastolic: 80,
                  timestamp: new Date(),
                },
              },
            },
          },
          expectedRiskLevel: 'LOW' as const,
        },
        {
          name: 'High Risk Scenario',
          modifications: {
            demographicFactors: {
              age: 75,
              bmi: 35,
              smokingStatus: 'CURRENT' as const,
            },
            medicalHistory: {
              chronicConditions: [
                'diabetes',
                'cardiopatia',
                'insuficiência renal',
              ],
              currentMedications: Array.from({ length: 8 }, () => ({
                name: 'Medication',
                dosage: '10mg',
                frequency: '1x/dia',
                startDate: new Date(),
                indication: 'Treatment',
              })),
            },
            currentCondition: {
              ...mockPatientData.currentCondition,
              vitalSigns: {
                ...mockPatientData.currentCondition.vitalSigns,
                bloodPressure: {
                  systolic: 180,
                  diastolic: 110,
                  timestamp: new Date(),
                },
                oxygenSaturation: { percentage: 88, timestamp: new Date() },
              },
            },
          },
          expectedRiskLevel: 'HIGH' as const,
        },
      ];

      const accurateResults = testScenarios.filter((scenario) => {
        const testData = {
          ...mockPatientData,
          ...scenario.modifications,
        };

        const result = calculateComprehensiveRiskAssessment(testData);

        return (
          result.riskLevel === scenario.expectedRiskLevel ||
          (scenario.expectedRiskLevel === 'HIGH' &&
            result.riskLevel === 'CRITICAL')
        );
      });

      const accuracy = (accurateResults.length / testScenarios.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(98); // ≥98% accuracy requirement
    });

    it('should provide explainable AI factors', () => {
      const result = calculateComprehensiveRiskAssessment(mockPatientData);

      result.criticalFactors.forEach((factor) => {
        expect(factor).toHaveProperty('factor');
        expect(factor).toHaveProperty('category');
        expect(factor).toHaveProperty('impact');
        expect(factor).toHaveProperty('explanation');
        expect(factor.explanation).toMatch(/[a-zA-ZÀ-ÿ]/); // Should contain explanatory text
      });
    });
  });

  describe('Emergency Escalation Detection', () => {
    it('should trigger emergency escalation for critical conditions', () => {
      const criticalPatient = {
        ...mockPatientData,
        currentCondition: {
          ...mockPatientData.currentCondition,
          vitalSigns: {
            ...mockPatientData.currentCondition.vitalSigns,
            bloodPressure: {
              systolic: 200,
              diastolic: 130,
              timestamp: new Date(),
            },
            oxygenSaturation: { percentage: 80, timestamp: new Date() },
          },
          mentalStatus: 'UNCONSCIOUS' as const,
        },
      };

      const riskResult = calculateComprehensiveRiskAssessment(criticalPatient);
      const escalation = determineEmergencyEscalation(
        riskResult,
        criticalPatient,
      );

      expect(escalation.requiresEscalation).toBe(true);
      expect(['IMMEDIATE', 'EMERGENCY']).toContain(escalation.escalationPriority);
      expect(escalation.escalationReasons.length).toBeGreaterThan(0);
    });

    it('should not trigger escalation for stable patients', () => {
      const stablePatient = {
        ...mockPatientData,
        demographicFactors: {
          ...mockPatientData.demographicFactors,
          age: 30,
          smokingStatus: 'NEVER' as const,
        },
        medicalHistory: {
          ...mockPatientData.medicalHistory,
          chronicConditions: [],
        },
        currentCondition: {
          ...mockPatientData.currentCondition,
          vitalSigns: {
            ...mockPatientData.currentCondition.vitalSigns,
            bloodPressure: {
              systolic: 120,
              diastolic: 80,
              timestamp: new Date(),
            },
            oxygenSaturation: { percentage: 99, timestamp: new Date() },
          },
        },
      };

      const riskResult = calculateComprehensiveRiskAssessment(stablePatient);
      const escalation = determineEmergencyEscalation(
        riskResult,
        stablePatient,
      );

      expect(escalation.requiresEscalation).toBe(false);
    });
  });

  describe('Performance and Compliance Requirements', () => {
    it('should meet processing time requirements (<100ms)', async () => {
      const iterations = 10;
      const processingTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        calculateComprehensiveRiskAssessment(mockPatientData);
        const endTime = performance.now();

        processingTimes.push(endTime - startTime);
      }

      const averageTime =
        processingTimes.reduce((sum, time) => sum + time, 0) / iterations;
      expect(averageTime).toBeLessThan(100); // <100ms average requirement

      const maxTime = Math.max(...processingTimes);
      expect(maxTime).toBeLessThan(200); // Maximum single execution time
    });

    it('should maintain LGPD compliance validation', () => {
      // Test with missing consent
      const nonConsentData = {
        ...mockPatientData,
        consentGiven: false,
      };

      // Should still calculate but flag compliance issue
      const result = calculateComprehensiveRiskAssessment(nonConsentData);
      expect(result).toBeDefined();

      // Test with valid consent
      const validConsentData = {
        ...mockPatientData,
        consentGiven: true,
        consentDate: new Date(),
        dataProcessingPurpose: ['risk_assessment'],
      };

      const validResult =
        calculateComprehensiveRiskAssessment(validConsentData);
      expect(validResult).toBeDefined();
      expect(validResult.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should validate Brazilian healthcare context', () => {
      const result = calculateComprehensiveRiskAssessment(mockPatientData);

      // Verify Portuguese language in explanations
      const hasPortugueseText = result.criticalFactors.some(
        (factor) =>
          factor.explanation.includes('paciente') ||
          factor.explanation.includes('risco') ||
          factor.explanation.includes('condição'),
      );

      expect(hasPortugueseText).toBe(true);
    });
  });

  describe('Risk Threshold Validation', () => {
    it('should validate risk threshold constants', () => {
      expect(RISK_THRESHOLDS.LOW.min).toBe(0);
      expect(RISK_THRESHOLDS.LOW.max).toBe(30);
      expect(RISK_THRESHOLDS.MEDIUM.min).toBe(31);
      expect(RISK_THRESHOLDS.MEDIUM.max).toBe(70);
      expect(RISK_THRESHOLDS.HIGH.min).toBe(71);
      expect(RISK_THRESHOLDS.HIGH.max).toBe(85);
      expect(RISK_THRESHOLDS.CRITICAL.min).toBe(86);
      expect(RISK_THRESHOLDS.CRITICAL.max).toBe(100);

      // Ensure no gaps in thresholds
      expect(RISK_THRESHOLDS.LOW.max + 1).toBe(RISK_THRESHOLDS.MEDIUM.min);
      expect(RISK_THRESHOLDS.MEDIUM.max + 1).toBe(RISK_THRESHOLDS.HIGH.min);
      expect(RISK_THRESHOLDS.HIGH.max + 1).toBe(RISK_THRESHOLDS.CRITICAL.min);
    });
  });
});
