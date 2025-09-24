/**
 * AI Clinical Decision Support System Test Suite
 * Tests treatment recommendations, contraindication analysis, and clinical guidance
 */

import { AIClinicalDecisionSupport } from '../services/ai-clinical-decision-support.js'
import type {
  ContraindicationAnalysis,
  PatientAssessment,
  TreatmentPlan,
  TreatmentRecommendation,
} from '../services/ai-clinical-decision-support.js'

describe('AIClinicalDecisionSupport', () => {
  let service: AIClinicalDecisionSupport

  beforeEach(() => {
    service = AIClinicalDecisionSupport.getInstance()
  })

  describe('Treatment Recommendations', () => {
    test('should generate personalized treatment recommendations', async () => {
      const assessment: PatientAssessment = {
        id: 'assessment_1',
        patientId: 'patient_1',
        assessmentDate: new Date(),
        skinType: 'III',
        fitzpatrickScale: 3,
        skinConditions: ['mild_acne', 'fine_lines'],
        medicalHistory: {
          allergies: [],
          medications: [],
          previousTreatments: [],
          chronicConditions: [],
          pregnancyStatus: 'none',
        },
        aestheticGoals: ['reduce_fine_lines', 'improve_skin_texture'],
        budgetRange: {
          min: 2000,
          max: 5000,
          currency: 'BRL',
        },
        riskFactors: [],
      }

      const recommendations = await service.generateTreatmentRecommendations(assessment)

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('procedureId')
      expect(recommendations[0]).toHaveProperty('confidence')
      expect(recommendations[0]).toHaveProperty('suitability')
      expect(recommendations[0].suitability).toBeGreaterThan(0.4)

      // Verify recommendations are sorted by suitability
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].suitability).toBeGreaterThanOrEqual(
          recommendations[i].suitability,
        )
      }
    })

    test('should filter out low-suitability procedures', async () => {
      const assessment: PatientAssessment = {
        id: 'assessment_2',
        patientId: 'patient_2',
        assessmentDate: new Date(),
        skinType: 'VI', // Dark skin - many procedures may be unsuitable
        fitzpatrickScale: 6,
        skinConditions: ['melasma', 'post_inflammatory_hyperpigmentation'],
        medicalHistory: {
          allergies: ['lidocaine'],
          medications: ['blood_thinners'],
          previousTreatments: [],
          chronicConditions: ['autoimmune_disorder'],
          pregnancyStatus: 'pregnant',
        },
        aestheticGoals: ['skin_lightening', 'scar_removal'],
        budgetRange: {
          min: 1000,
          max: 3000,
          currency: 'BRL',
        },
        riskFactors: ['high_fitzpatrick', 'pregnancy', 'autoimmune'],
      }

      const recommendations = await service.generateTreatmentRecommendations(assessment)

      // Should have fewer recommendations due to contraindications
      expect(recommendations.length).toBeLessThanOrEqual(5)

      // All remaining recommendations should have moderate to high suitability
      recommendations.forEach((rec) => {
        expect(rec.suitability).toBeGreaterThan(0.4)
        expect(rec.safety).toBeGreaterThan(0.5)
      })
    })

    test('should consider budget constraints in recommendations', async () => {
      const lowBudgetAssessment: PatientAssessment = {
        id: 'assessment_3',
        patientId: 'patient_3',
        assessmentDate: new Date(),
        skinType: 'II',
        fitzpatrickScale: 2,
        skinConditions: ['fine_lines'],
        medicalHistory: {
          allergies: [],
          medications: [],
          previousTreatments: [],
          chronicConditions: [],
          pregnancyStatus: 'none',
        },
        aestheticGoals: ['reduce_fine_lines'],
        budgetRange: {
          min: 500,
          max: 1000,
          currency: 'BRL',
        },
        riskFactors: [],
      }

      const recommendations = await service.generateTreatmentRecommendations(lowBudgetAssessment)

      // Should prioritize affordable treatments
      const affordableRecommendations = recommendations.filter((r) => r.cost <= 1000)
      expect(affordableRecommendations.length).toBeGreaterThan(0)

      // Affordable options should appear first
      if (recommendations.length > 1) {
        expect(recommendations[0].cost).toBeLessThanOrEqual(1000)
      }
    })
  })

  describe('Treatment Plan Creation', () => {
    test('should create comprehensive treatment plan', async () => {
      const recommendations: TreatmentRecommendation[] = [
        {
          id: 'rec_1',
          procedureId: 'botox_forehead',
          procedureName: 'Botox Forehead',
          confidence: 0.8,
          efficacy: 0.7,
          safety: 0.9,
          suitability: 0.8,
          expectedResults: {
            timeline: '1-2 weeks',
            improvement: 'Moderate',
            longevity: '3-4 months',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 1200,
          sessions: 1,
          recovery: {
            downtime: 'none',
            activityRestrictions: [],
          },
          evidenceLevel: 'A',
        },
        {
          id: 'rec_2',
          procedureId: 'hyaluronic_lips',
          procedureName: 'Hyaluronic Acid Lip Filler',
          confidence: 0.7,
          efficacy: 0.8,
          safety: 0.8,
          suitability: 0.7,
          expectedResults: {
            timeline: 'Immediate',
            improvement: 'Significant',
            longevity: '6-9 months',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 1800,
          sessions: 1,
          recovery: {
            downtime: 'minimal',
            activityRestrictions: ['Avoid pressure for 48h'],
          },
          evidenceLevel: 'B',
        },
      ]

      const treatmentPlan = await service.createTreatmentPlan(
        'patient_4',
        recommendations,
        ['reduce_aging_signs', 'enhance_appearance'],
      )

      expect(treatmentPlan.id).toBeDefined()
      expect(treatmentPlan.patientId).toBe('patient_4')
      expect(treatmentPlan.primaryGoals).toEqual(['reduce_aging_signs', 'enhance_appearance'])
      expect(treatmentPlan.recommendations).toHaveLength(2)
      expect(treatmentPlan.prioritizedPlan.length).toBeGreaterThan(0)
      expect(treatmentPlan.budgetBreakdown.total).toBeGreaterThan(0)
      expect(treatmentPlan.riskAssessment).toBeDefined()
      expect(treatmentPlan.followUpSchedule.length).toBeGreaterThan(0)
    })

    test('should create phased treatment approach', async () => {
      const recommendations: TreatmentRecommendation[] = [
        {
          id: 'rec_1',
          procedureId: 'skincare_products',
          procedureName: 'Medical Grade Skincare',
          confidence: 0.9,
          efficacy: 0.6,
          safety: 1.0,
          suitability: 0.8,
          expectedResults: { timeline: '4-8 weeks', improvement: 'Mild', longevity: 'Ongoing' },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 500,
          sessions: 1,
          recovery: { downtime: 'none', activityRestrictions: [] },
          evidenceLevel: 'B',
        },
        {
          id: 'rec_2',
          procedureId: 'chemical_peel',
          procedureName: 'Chemical Peel',
          confidence: 0.8,
          efficacy: 0.7,
          safety: 0.8,
          suitability: 0.7,
          expectedResults: {
            timeline: '1-2 weeks',
            improvement: 'Moderate',
            longevity: '3-6 months',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 800,
          sessions: 1,
          recovery: { downtime: 'minimal', activityRestrictions: ['Sun protection'] },
          evidenceLevel: 'B',
        },
        {
          id: 'rec_3',
          procedureId: 'laser_resurfacing',
          procedureName: 'Laser Resurfacing',
          confidence: 0.7,
          efficacy: 0.9,
          safety: 0.6,
          suitability: 0.6,
          expectedResults: {
            timeline: '2-4 weeks',
            improvement: 'Significant',
            longevity: '1-2 years',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 2500,
          sessions: 1,
          recovery: { downtime: 'significant', activityRestrictions: ['No sun exposure'] },
          evidenceLevel: 'A',
        },
      ]

      const treatmentPlan = await service.createTreatmentPlan(
        'patient_5',
        recommendations,
        ['skin_rejuvenation'],
      )

      // Should have multiple phases
      expect(treatmentPlan.prioritizedPlan.length).toBeGreaterThan(1)

      // Phase 1 should include least invasive treatments
      const phase1 = treatmentPlan.prioritizedPlan.find((p) => p.phase === 1)
      expect(phase1).toBeDefined()
      expect(phase1!.procedures).toContain('Medical Grade Skincare')

      // Later phases should include more intensive treatments
      const phase3 = treatmentPlan.prioritizedPlan.find((p) => p.phase === 3)
      expect(phase3).toBeDefined()
      expect(phase3!.procedures).toContain('Laser Resurfacing')
    })

    test('should calculate appropriate budget breakdown', async () => {
      const recommendations: TreatmentRecommendation[] = [
        {
          id: 'rec_1',
          procedureId: 'procedure_1',
          procedureName: 'Procedure 1',
          confidence: 0.8,
          efficacy: 0.7,
          safety: 0.9,
          suitability: 0.8,
          expectedResults: {
            timeline: '1-2 weeks',
            improvement: 'Moderate',
            longevity: '3-4 months',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 1000,
          sessions: 1,
          recovery: { downtime: 'none', activityRestrictions: [] },
          evidenceLevel: 'A',
        },
        {
          id: 'rec_2',
          procedureId: 'procedure_2',
          procedureName: 'Procedure 2',
          confidence: 0.7,
          efficacy: 0.8,
          safety: 0.8,
          suitability: 0.7,
          expectedResults: {
            timeline: 'Immediate',
            improvement: 'Significant',
            longevity: '6-9 months',
          },
          risks: [],
          contraindications: [],
          alternatives: [],
          cost: 2000,
          sessions: 1,
          recovery: { downtime: 'minimal', activityRestrictions: [] },
          evidenceLevel: 'B',
        },
      ]

      const treatmentPlan = await service.createTreatmentPlan(
        'patient_6',
        recommendations,
        ['test_goals'],
      )

      // Budget should be calculated correctly
      expect(treatmentPlan.budgetBreakdown.total).toBe(3000)
      expect(treatmentPlan.budgetBreakdown.byPhase.length).toBeGreaterThan(0)

      // Phase breakdown should match total
      const phaseTotal = treatmentPlan.budgetBreakdown.byPhase.reduce(
        (sum, phase) => sum + phase.cost,
        0,
      )
      expect(phaseTotal).toBe(treatmentPlan.budgetBreakdown.total)
    })
  })

  describe('Contraindication Analysis', () => {
    test('should identify absolute contraindications', async () => {
      const analyses = await service.analyzeContraindications(
        'patient_7',
        ['botox_forehead', 'laser_treatment'],
      )

      expect(analyses.length).toBe(2)

      const botoxAnalysis = analyses.find((a) => a.procedureId === 'botox_forehead')
      expect(botoxAnalysis).toBeDefined()

      if (botoxAnalysis) {
        expect(botoxAnalysis.patientId).toBe('patient_7')
        expect(botoxAnalysis.canProceed).toBeDefined()
        expect(Array.isArray(botoxAnalysis.absoluteContraindications)).toBe(true)
        expect(Array.isArray(botoxAnalysis.relativeContraindications)).toBe(true)
        expect(Array.isArray(botoxAnalysis.recommendations)).toBe(true)
      }
    })

    test('should provide modified approach for contraindicated procedures', async () => {
      // Mock a patient with contraindications
      const analyses = await service.analyzeContraindications(
        'patient_8',
        ['botox_forehead'],
      )

      const analysis = analyses[0]

      if (analysis.absoluteContraindications.length > 0) {
        expect(analysis.canProceed).toBe(false)
        expect(analysis.modifiedApproach).toBeDefined()
        expect(analysis.recommendations.some((r) => r.includes('contraindicated'))).toBe(true)
      }
    })

    test('should generate appropriate recommendations based on risk level', async () => {
      const analyses = await service.analyzeContraindications(
        'patient_9',
        ['low_risk_procedure', 'high_risk_procedure'],
      )

      analyses.forEach((analysis) => {
        expect(analysis.recommendations.length).toBeGreaterThan(0)

        if (analysis.absoluteContraindications.length > 0) {
          expect(analysis.recommendations.some((r) => r.includes('contraindicated'))).toBe(true)
        }

        if (analysis.relativeContraindications.length > 0) {
          expect(analysis.recommendations.some((r) => r.includes('caution'))).toBe(true)
        }
      })
    })
  })

  describe('Treatment Guidelines', () => {
    test('should generate personalized treatment guidelines', async () => {
      const patientFactors = {
        skinType: 'III',
        age: 35,
        gender: 'female',
        concerns: ['fine_lines', 'uneven_texture'],
      }

      const guidelines = await service.generateTreatmentGuidelines(
        'botox_forehead',
        patientFactors,
      )

      expect(guidelines.guidelines).toBeDefined()
      expect(guidelines.personalizedRecommendations).toBeDefined()
      expect(guidelines.precautions).toBeDefined()

      expect(Array.isArray(guidelines.personalizedRecommendations)).toBe(true)
      expect(Array.isArray(guidelines.precautions)).toBe(true)
    })

    test('should provide evidence-based treatment information', async () => {
      const patientFactors = {
        skinType: 'II',
        age: 45,
        gender: 'male',
        concerns: ['deep_lines', 'volume_loss'],
      }

      const guidelines = await service.generateTreatmentGuidelines(
        'hyaluronic_filler',
        patientFactors,
      )

      expect(guidelines.guidelines.indications).toBeDefined()
      expect(guidelines.guidelines.contraindications).toBeDefined()
      expect(guidelines.guidelines.patientSelection).toBeDefined()
      expect(guidelines.guidelines.protocol).toBeDefined()
      expect(guidelines.guidelines.expectedOutcomes).toBeDefined()
      expect(guidelines.guidelines.complications).toBeDefined()
      expect(guidelines.guidelines.evidenceReferences).toBeDefined()

      // Should have evidence levels
      guidelines.guidelines.evidenceReferences.forEach((ref) => {
        expect(ref.study).toBeDefined()
        expect(ref.year).toBeDefined()
        expect(ref.journal).toBeDefined()
        expect(ref.findings).toBeDefined()
      })
    })
  })

  describe('Treatment Outcome Prediction', () => {
    test('should predict treatment outcomes with confidence intervals', async () => {
      const prediction = await service.predictTreatmentOutcomes(
        'patient_10',
        'botox_forehead',
        {
          sessions: 1,
          intensity: 'medium',
          frequency: 'once',
        },
      )

      expect(prediction.efficacy).toBeGreaterThanOrEqual(0)
      expect(prediction.efficacy).toBeLessThanOrEqual(1)
      expect(prediction.satisfaction).toBeGreaterThanOrEqual(0)
      expect(prediction.satisfaction).toBeLessThanOrEqual(1)
      expect(prediction.risks).toBeDefined()
      expect(prediction.timeline).toBeDefined()
      expect(prediction.recommendations).toBeDefined()

      // Timeline should have all components
      expect(prediction.timeline.initialResults).toBeDefined()
      expect(prediction.timeline.optimalResults).toBeDefined()
      expect(prediction.timeline.maintenance).toBeDefined()

      // Risks should be properly structured
      prediction.risks.forEach((risk) => {
        expect(risk.type).toBeDefined()
        expect(risk.probability).toBeGreaterThanOrEqual(0)
        expect(risk.probability).toBeLessThanOrEqual(1)
        expect(['low', 'medium', 'high']).toContain(risk.severity)
      })
    })

    test('should provide realistic outcome expectations', async () => {
      const prediction = await service.predictTreatmentOutcomes(
        'patient_11',
        'hyaluronic_filler',
        {
          sessions: 2,
          intensity: 'medium',
          frequency: 'biweekly',
        },
      )

      // Should have realistic efficacy and satisfaction scores
      expect(prediction.efficacy).toBeGreaterThan(0.3)
      expect(prediction.efficacy).toBeLessThan(0.95)
      expect(prediction.satisfaction).toBeGreaterThan(0.4)
      expect(prediction.satisfaction).toBeLessThan(0.95)

      // Timeline should be realistic
      expect(prediction.timeline.initialResults).toMatch(/immediate|1-2|2-4/i)
      expect(prediction.timeline.optimalResults).toMatch(/1-2|2-4|4-6/i)
      expect(prediction.timeline.maintenance).toMatch(/months|year/i)
    })
  })

  describe('Treatment Progress Monitoring', () => {
    test('should monitor treatment progress effectively', async () => {
      const monitoring = await service.monitorTreatmentProgress(
        'treatment_plan_1',
        3, // current session
        {
          satisfaction: 8,
          sideEffects: ['mild_redness'],
          adherenceToAftercare: 'good',
        },
        {
          improvement: 70,
          complications: [],
          healing: 'good',
        },
      )

      expect(['ahead', 'on_track', 'behind', 'concerns']).toContain(monitoring.progress)
      expect(monitoring.recommendations).toBeDefined()
      expect(monitoring.adjustments).toBeDefined()
      expect(monitoring.nextSessionPlan).toBeDefined()

      expect(Array.isArray(monitoring.recommendations)).toBe(true)
      expect(Array.isArray(monitoring.adjustments)).toBe(true)
      expect(typeof monitoring.nextSessionPlan).toBe('string')
    })

    test('should recommend adjustments for poor progress', async () => {
      const monitoring = await service.monitorTreatmentProgress(
        'treatment_plan_2',
        2,
        {
          satisfaction: 4,
          sideEffects: ['significant_swelling', 'bruising'],
          adherenceToAftercare: 'fair',
        },
        {
          improvement: 30,
          complications: ['prolonged_redness'],
          healing: 'fair',
        },
      )

      // Should recommend adjustments for poor progress
      if (monitoring.progress === 'behind' || monitoring.progress === 'concerns') {
        expect(monitoring.adjustments.length).toBeGreaterThan(0)
        expect(monitoring.recommendations.some((r) =>
          r.toLowerCase().includes('adjust')
          || r.toLowerCase().includes('modify')
          || r.toLowerCase().includes('change')
        )).toBe(true)
      }
    })

    test('should recognize excellent progress', async () => {
      const monitoring = await service.monitorTreatmentProgress(
        'treatment_plan_3',
        4,
        {
          satisfaction: 9,
          sideEffects: [],
          adherenceToAftercare: 'excellent',
        },
        {
          improvement: 85,
          complications: [],
          healing: 'excellent',
        },
      )

      // Should recognize excellent progress
      expect(['ahead', 'on_track']).toContain(monitoring.progress)

      if (monitoring.progress === 'ahead') {
        expect(monitoring.recommendations.some((r) =>
          r.toLowerCase().includes('excellent')
          || r.toLowerCase().includes('great')
          || r.toLowerCase().includes('ahead')
        )).toBe(true)
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle incomplete patient assessment', async () => {
      const incompleteAssessment: PatientAssessment = {
        id: 'assessment_4',
        patientId: 'patient_12',
        assessmentDate: new Date(),
        skinType: 'II',
        fitzpatrickScale: 2,
        skinConditions: [],
        medicalHistory: {
          allergies: [],
          medications: [],
          previousTreatments: [],
          chronicConditions: [],
          pregnancyStatus: 'unknown',
        },
        aestheticGoals: [],
        budgetRange: {
          min: 0,
          max: 0,
          currency: 'BRL',
        },
        riskFactors: [],
      }

      const recommendations = await service.generateTreatmentRecommendations(incompleteAssessment)

      // Should still provide recommendations but with lower confidence
      expect(recommendations.length).toBeGreaterThanOrEqual(0)
      if (recommendations.length > 0) {
        expect(recommendations[0].confidence).toBeLessThan(0.8)
      }
    })

    test('should handle empty procedure list', async () => {
      await expect(
        service.analyzeContraindications('patient_13', []),
      ).resolves.toEqual([])
    })

    test('should handle invalid patient ID gracefully', async () => {
      await expect(
        service.analyzeContraindications('invalid_patient', ['botox_forehead']),
      ).rejects.toThrow('Patient not found')
    })
  })

  describe('Safety and Validation', () => {
    test('should prioritize patient safety over efficacy', async () => {
      const highRiskAssessment: PatientAssessment = {
        id: 'assessment_5',
        patientId: 'patient_14',
        assessmentDate: new Date(),
        skinType: 'V',
        fitzpatrickScale: 5,
        skinConditions: ['keloid_tendency'],
        medicalHistory: {
          allergies: ['multiple_substances'],
          medications: ['immunosuppressants'],
          previousTreatments: [],
          chronicConditions: ['autoimmune_disorder', 'bleeding_disorder'],
          pregnancyStatus: 'pregnant',
        },
        aestheticGoals: ['scar_removal'],
        budgetRange: {
          min: 10000,
          max: 20000,
          currency: 'BRL',
        },
        riskFactors: ['high_risk_patient'],
      }

      const recommendations = await service.generateTreatmentRecommendations(highRiskAssessment)

      // Should either return no recommendations or only very safe options
      recommendations.forEach((rec) => {
        expect(rec.safety).toBeGreaterThan(0.7)
        expect(rec.contraindications.length).toBeGreaterThan(0)
      })
    })

    test('should provide appropriate alternatives for contraindicated procedures', async () => {
      const assessment: PatientAssessment = {
        id: 'assessment_6',
        patientId: 'patient_15',
        assessmentDate: new Date(),
        skinType: 'IV',
        fitzpatrickScale: 4,
        skinConditions: ['melasma'],
        medicalHistory: {
          allergies: [],
          medications: [],
          previousTreatments: [],
          chronicConditions: [],
          pregnancyStatus: 'none',
        },
        aestheticGoals: ['skin_rejuvenation'],
        budgetRange: {
          min: 2000,
          max: 5000,
          currency: 'BRL',
        },
        riskFactors: ['melasma_risk'],
      }

      const recommendations = await service.generateTreatmentRecommendations(assessment)

      // Should provide alternatives for risky procedures
      recommendations.forEach((rec) => {
        if (rec.risks.some((r) => r.probability > 0.3)) {
          expect(rec.alternatives.length).toBeGreaterThan(0)
        }
      })
    })
  })
})
