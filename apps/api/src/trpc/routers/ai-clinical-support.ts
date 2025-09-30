/**
 * AI Clinical Support API Router
 * 
 * Backend API for AI-powered clinical decision support
 * Features:
 * - Treatment recommendations based on patient profile
 * - Contraindication analysis
 * - Progress monitoring and outcome prediction
 * - Clinical guidelines integration
 * - Healthcare compliance (ANVISA/CFM)
 * - Emergency protocols
 */

import { z } from 'zod'
import { router, procedure } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

// Types
export interface PatientProfile {
  id: string
  age: number
  gender: 'male' | 'female' | 'other'
  skinType: string // Fitzpatrick classification
  medicalHistory: Array<{
    condition: string
    severity: 'mild' | 'moderate' | 'severe'
    treatments: string[]
    outcomes: string[]
  }>
  allergies: string[]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  lifestyleFactors: {
    smoking: boolean
    alcohol: boolean
    sunExposure: 'low' | 'moderate' | 'high'
    stress: 'low' | 'moderate' | 'high'
  }
}

export interface TreatmentRecommendation {
  id: string
  patientId: string
  treatmentType: string
  recommendedProducts: Array<{
    name: string
    concentration: string
    applicationProtocol: string
    expectedResults: string
    contraindications: string[]
  }>
  protocol: {
    sessions: number
    interval: string
    duration: string
    preparation: string[]
    aftercare: string[]
  }
  riskLevel: 'low' | 'moderate' | 'high'
  expectedOutcomes: string[]
  alternatives: string[]
  considerations: string[]
  generatedAt: Date
  confidence: number // 0-100
}

export interface ContraindicationAnalysis {
  id: string
  patientId: string
  proposedTreatment: string
  contraindications: Array<{
    type: 'absolute' | 'relative' | 'precaution'
    description: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
    recommendation: string
  }>
  riskFactors: Array<{
    factor: string
    impact: string
    mitigation: string
  }>
  overallRisk: 'minimal' | 'low' | 'moderate' | 'high' | 'contraindicated'
  recommendations: string[]
  reviewedAt: Date
}

export interface ProgressMonitoring {
  id: string
  patientId: string
  treatmentId: string
  baselineData: {
    photos: string[]
    measurements: Record<string, number>
    satisfactionScore: number
  }
  currentProgress: {
    photos: string[]
    measurements: Record<string, number>
    satisfactionScore: number
    sideEffects: string[]
  }
  progressMetrics: {
    improvementPercentage: number
    expectedVsActual: string
    complications: string[]
    adherenceRate: number
  }
  nextSteps: string[]
  lastUpdated: Date
}

export interface TreatmentOutcomePredictor {
  id: string
  patientId: string
  treatmentScenario: {
    treatmentType: string
    protocol: string
    products: string[]
  }
  prediction: {
    successProbability: number // 0-100
    expectedResults: string[]
    timeline: string
    risks: Array<{
      type: string
      probability: number
      severity: 'low' | 'moderate' | 'high'
      mitigation: string
    }>
    costEstimate: {
      min: number
      max: number
      currency: 'BRL'
    }
  }
  confidenceLevel: number // 0-100
  generatedAt: Date
}

// Input schemas
const PatientProfileSchema = z.object({
  age: z.number().min(18).max(100),
  gender: z.enum(['male', 'female', 'other']),
  skinType: z.string(),
  medicalHistory: z.array(z.object({
    condition: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    treatments: z.array(z.string()),
    outcomes: z.array(z.string()),
  })),
  allergies: z.array(z.string()),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })),
  lifestyleFactors: z.object({
    smoking: z.boolean(),
    alcohol: z.boolean(),
    sunExposure: z.enum(['low', 'moderate', 'high']),
    stress: z.enum(['low', 'moderate', 'high']),
  }),
})

const GetRecommendationsSchema = z.object({
  patientId: z.string().uuid(),
  concerns: z.array(z.string()),
  goals: z.array(z.string()),
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.enum(['BRL']).default('BRL'),
  }).optional(),
  timeCommitment: z.string().optional(),
})

const AnalyzeContraindicationsSchema = z.object({
  patientId: z.string().uuid(),
  proposedTreatment: z.string(),
  products: z.array(z.string()).optional(),
  protocolDetails: z.record(z.any()).optional(),
})

const MonitorProgressSchema = z.object({
  patientId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  currentData: z.object({
    photos: z.array(z.string().url()).optional(),
    measurements: z.record(z.number()).optional(),
    satisfactionScore: z.number().min(1).max(10).optional(),
    sideEffects: z.array(z.string()).optional(),
  }),
})

const PredictOutcomeSchema = z.object({
  patientId: z.string().uuid(),
  treatmentType: z.string(),
  protocol: z.string(),
  products: z.array(z.string()),
  adherenceLevel: z.enum(['high', 'moderate', 'low']).default('moderate'),
})

export const aiClinicalSupportRouter = router({
  // Get treatment recommendations
  getRecommendations: procedure
    .input(GetRecommendationsSchema)
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        // Get patient profile
        const { data: patient, error: patientError } = await ctx.supabase
          .from('patients')
          .select('*')
          .eq('id', input.patientId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (patientError || !patient) {
          throw new Error('Patient not found or access denied')
        }

        // Generate AI recommendations (mock implementation)
        const recommendations = await generateTreatmentRecommendations(
          patient,
          input.concerns,
          input.goals,
          input.budget,
          input.timeCommitment
        )

        // Log recommendation generation for audit
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'ai_recommendation_generated',
            resource_type: 'ai_clinical_support',
            resource_id: input.patientId,
            details: {
              patient_id: input.patientId,
              concerns: input.concerns,
              goals: input.goals,
              recommendations_count: recommendations.length,
              generated_by: 'ai_clinical_support_system',
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          recommendations,
          patientProfile: {
            age: new Date().getFullYear() - new Date(patient.birth_date).getFullYear(),
            gender: patient.gender,
            concerns: input.concerns,
            goals: input.goals,
          },
        }
      } catch (error) {
        console.error('Failed to get treatment recommendations:', error)
        throw new Error('Failed to get treatment recommendations')
      }
    }),

  // Analyze contraindications
  analyzeContraindications: procedure
    .input(AnalyzeContraindicationsSchema)
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        // Get patient medical history
        const { data: patient, error: patientError } = await ctx.supabase
          .from('patients')
          .select('*')
          .eq('id', input.patientId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (patientError || !patient) {
          throw new Error('Patient not found or access denied')
        }

        // Perform contraindication analysis
        const analysis = await performContraindicationAnalysis(
          patient,
          input.proposedTreatment,
          input.products,
          input.protocolDetails
        )

        // Log analysis for medical compliance
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'contraindication_analysis',
            resource_type: 'ai_clinical_support',
            resource_id: input.patientId,
            details: {
              patient_id: input.patientId,
              proposed_treatment: input.proposedTreatment,
              overall_risk: analysis.overallRisk,
              contraindications_count: analysis.contraindications.length,
              reviewed_by: 'ai_clinical_support_system',
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          analysis,
        }
      } catch (error) {
        console.error('Failed to analyze contraindications:', error)
        throw new Error('Failed to analyze contraindications')
      }
    }),

  // Monitor treatment progress
  monitorProgress: procedure
    .input(MonitorProgressSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing treatment data
        const { data: treatment, error: treatmentError } = await ctx.supabase
          .from('patient_treatments')
          .select('*')
          .eq('id', input.treatmentId)
          .eq('patient_id', input.patientId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (treatmentError || !treatment) {
          throw new Error('Treatment not found or access denied')
        }

        // Get or create progress monitoring record
        const { data: existingMonitoring, error: monitoringError } = await ctx.supabase
          .from('treatment_progress_monitoring')
          .select('*')
          .eq('patient_id', input.patientId)
          .eq('treatment_id', input.treatmentId)
          .single()

        let monitoringRecord
        if (existingMonitoring) {
          // Update existing monitoring
          monitoringRecord = await updateProgressMonitoring(
            ctx.supabase,
            existingMonitoring,
            input.currentData
          )
        } else {
          // Create new monitoring record
          monitoringRecord = await createProgressMonitoring(
            ctx.supabase,
            input.patientId,
            input.treatmentId,
            input.currentData
          )
        }

        // Generate progress insights
        const insights = await generateProgressInsights(
          treatment,
          monitoringRecord,
          input.currentData
        )

        // Log progress monitoring
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'treatment_progress_monitored',
            resource_type: 'ai_clinical_support',
            resource_id: input.patientId,
            details: {
              patient_id: input.patientId,
              treatment_id: input.treatmentId,
              progress_percentage: insights.progressPercentage,
              satisfaction_score: input.currentData.satisfactionScore,
              side_effects_count: input.currentData.sideEffects?.length || 0,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          monitoring: monitoringRecord,
          insights,
        }
      } catch (error) {
        console.error('Failed to monitor progress:', error)
        throw new Error('Failed to monitor progress')
      }
    }),

  // Predict treatment outcomes
  predictOutcome: procedure
    .input(PredictOutcomeSchema)
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        // Get patient data for prediction
        const { data: patient, error: patientError } = await ctx.supabase
          .from('patients')
          .select('*')
          .eq('id', input.patientId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (patientError || !patient) {
          throw new Error('Patient not found or access denied')
        }

        // Generate outcome prediction
        const prediction = await generateTreatmentOutcomePrediction(
          patient,
          input.treatmentType,
          input.protocol,
          input.products,
          input.adherenceLevel
        )

        // Log prediction for audit
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'treatment_outcome_predicted',
            resource_type: 'ai_clinical_support',
            resource_id: input.patientId,
            details: {
              patient_id: input.patientId,
              treatment_type: input.treatmentType,
              success_probability: prediction.prediction.successProbability,
              confidence_level: prediction.confidenceLevel,
              adherence_level: input.adherenceLevel,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          prediction,
        }
      } catch (error) {
        console.error('Failed to predict outcome:', error)
        throw new Error('Failed to predict outcome')
      }
    }),

  // Get clinical guidelines
  getClinicalGuidelines: procedure
    .input(z.object({
      treatmentType: z.string(),
      condition: z.string().optional(),
      patientProfile: PatientProfileSchema.optional(),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        // Get relevant clinical guidelines
        const guidelines = await getClinicalGuidelines(
          input.treatmentType,
          input.condition,
          input.patientProfile
        )

        return {
          success: true,
          guidelines,
          lastUpdated: new Date().toISOString(),
          source: 'brazilian_aesthetic_medicine_guidelines',
        }
      } catch (error) {
        console.error('Failed to get clinical guidelines:', error)
        throw new Error('Failed to get clinical guidelines')
      }
    }),

  // Emergency protocol recommendations
  getEmergencyProtocol: procedure
    .input(z.object({
      situation: z.string(),
      severity: z.enum(['low', 'moderate', 'high', 'critical']),
      patientId: z.string().uuid().optional(),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        const protocol = await getEmergencyProtocol(
          input.situation,
          input.severity,
          input.patientId
        )

        // Log emergency protocol access
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'emergency_protocol_accessed',
            resource_type: 'ai_clinical_support',
            details: {
              situation: input.situation,
              severity: input.severity,
              patient_id: input.patientId,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          protocol,
          emergencyContacts: await getEmergencyContacts(ctx.clinicId),
        }
      } catch (error) {
        console.error('Failed to get emergency protocol:', error)
        throw new Error('Failed to get emergency protocol')
      }
    }),
})

// Helper functions (mock implementations - would integrate with actual AI services)
async function generateTreatmentRecommendations(
  patient: any,
  concerns: string[],
  goals: string[],
  budget?: { min?: number; max?: number; currency: string },
  timeCommitment?: string
): Promise<TreatmentRecommendation[]> {
  // Mock AI recommendation generation
  const recommendations: TreatmentRecommendation[] = [
    {
      id: crypto.randomUUID(),
      patientId: patient.id,
      treatmentType: 'chemical_peel',
      recommendedProducts: [
        {
          name: 'Ácido Glicólico 50%',
          concentration: '50%',
          applicationProtocol: 'Aplicar 1-2 camadas, tempo de ação 3-5 minutos',
          expectedResults: 'Melhora da textura e luminosidade da pele',
          contraindications: ['peles sensíveis', 'exposição solar recente'],
        },
      ],
      protocol: {
        sessions: 4,
        interval: 'quinzenal',
        duration: '45 minutos',
        preparation: ['Suspender uso de ácidos 5 dias antes', 'Protetor solar diário'],
        aftercare: ['Evitar sol por 72h', 'Hidratação intensa', 'Protetor solar SPF 30+'],
      },
      riskLevel: 'low',
      expectedOutcomes: ['Melhora de 60-80% na textura', 'Redução de manchas claras'],
      alternatives: ['Peeling de diamante', 'Laser CO2 fracionado'],
      considerations: ['Necessário acompanhamento dermatológico', 'Resultados progressivos'],
      generatedAt: new Date(),
      confidence: 85,
    },
  ]

  return recommendations
}

async function performContraindicationAnalysis(
  patient: any,
  proposedTreatment: string,
  products?: string[],
  protocolDetails?: Record<string, any>
): Promise<ContraindicationAnalysis> {
  // Mock contraindication analysis
  return {
    id: crypto.randomUUID(),
    patientId: patient.id,
    proposedTreatment,
    contraindications: [
      {
        type: 'relative',
        description: 'Histórico de herpes labial',
        severity: 'moderate',
        recommendation: 'Profilaxia com aciclovir antes do procedimento',
      },
    ],
    riskFactors: [
      {
        factor: 'Fototipo alto (IV-V)',
        impact: 'Maior risco de hipercromia pós-inflamatória',
        mitigation: 'Protocolo com ácidos mais suaves e cuidados intensivos com fotoproteção',
      },
    ],
    overallRisk: 'low',
    recommendations: [
      'Realizar teste de contato na pele atrás da orelha',
      'Orientar sobre cuidados pós-procedimento',
      'Agendar retorno para avaliação',
    ],
    reviewedAt: new Date(),
  }
}

async function generateProgressInsights(
  treatment: any,
  monitoring: any,
  currentData: any
): Promise<any> {
  // Mock progress insights generation
  return {
    progressPercentage: 65,
    expectedVsActual: 'Dentro do esperado',
    recommendations: [
      'Manter adesão ao tratamento',
      'Intensificar cuidados com hidratação',
      'Proteção solar rigorosa',
    ],
    nextAppointment: '2024-02-15',
  }
}

async function generateTreatmentOutcomePrediction(
  patient: any,
  treatmentType: string,
  protocol: string,
  products: string[],
  adherenceLevel: string
): Promise<TreatmentOutcomePredictor> {
  // Mock outcome prediction
  return {
    id: crypto.randomUUID(),
    patientId: patient.id,
    treatmentScenario: {
      treatmentType,
      protocol,
      products,
    },
    prediction: {
      successProbability: adherenceLevel === 'high' ? 85 : 70,
      expectedResults: [
        'Melhora significativa da textura cutânea',
        'Redução de rugas finas',
        'Melhora do tônus e firmeza',
      ],
      timeline: '8-12 semanas para resultados visíveis',
      risks: [
        {
          type: 'hipersensibilidade',
          probability: 15,
          severity: 'low',
          mitigation: 'Teste de contato prévio',
        },
      ],
      costEstimate: {
        min: 800,
        max: 1200,
        currency: 'BRL',
      },
    },
    confidenceLevel: 75,
    generatedAt: new Date(),
  }
}

async function getClinicalGuidelines(
  treatmentType: string,
  condition?: string,
  patientProfile?: any
): Promise<any[]> {
  // Mock clinical guidelines
  return [
    {
      title: `Protocolo Clínico: ${treatmentType}`,
      source: 'Sociedade Brasileira de Dermatologia',
      version: '2024',
      sections: [
        {
          title: 'Indicações',
          content: 'Pacientes com idade entre 25-60 anos, fototipos I-IV',
        },
        {
          title: 'Contraindicações',
          content: 'Gestantes, lactantes, pacientes com doenças autoimunes',
        },
        {
          title: 'Protocolo recomendado',
          content: '4-6 sessões com intervalo de 15-21 dias',
        },
      ],
    },
  ]
}

async function getEmergencyProtocol(
  situation: string,
  severity: string,
  patientId?: string
): Promise<any> {
  // Mock emergency protocol
  return {
    situation,
    severity,
    protocol: [
      '1. Interromper imediatamente o procedimento',
      '2. Avaliar sinais vitais',
      '3. Comunicar médico responsável',
      '4. Documentar ocorrência',
    ],
    medications: [
      {
        name: 'Dipirona 1g IV',
        indication: 'Dor intensa',
        dosage: 'Conforme prescrição médica',
      },
    ],
    contacts: [
      { name: 'Serviço de emergência', phone: '192' },
      { name: 'Médico plantonista', phone: '11-99999-9999' },
    ],
  }
}

async function getEmergencyContacts(clinicId: string): Promise<any[]> {
  // Mock emergency contacts
  return [
    { name: 'SAMU', phone: '192' },
    { name: 'Bombeiros', phone: '193' },
    { name: 'Médico plantonista', phone: '11-99999-9999' },
    { name: 'Hospital mais próximo', phone: '11-88888-8888' },
  ]
}

async function createProgressMonitoring(
  supabase: any,
  patientId: string,
  treatmentId: string,
  currentData: any
): Promise<any> {
  const { data, error } = await supabase
    .from('treatment_progress_monitoring')
    .insert({
      id: crypto.randomUUID(),
      patient_id: patientId,
      treatment_id: treatmentId,
      baseline_data: currentData,
      current_progress: currentData,
      progress_metrics: {
        improvementPercentage: 0,
        expectedVsActual: 'Baseline',
        complications: [],
        adherenceRate: 100,
      },
      next_steps: ['Iniciar acompanhamento regular'],
      last_updated: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function updateProgressMonitoring(
  supabase: any,
  existing: any,
  currentData: any
): Promise<any> {
  const { data, error } = await supabase
    .from('treatment_progress_monitoring')
    .update({
      current_progress: currentData,
      last_updated: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) throw error
  return data
}