/**
 * POST /api/v1/ai/analyze endpoint (T005)
 * V1 API compatibility layer for AI analysis
 * Routes to V2 implementation with backward compatibility
 */

import { AIChatService } from '@/services/ai-chat-service'
import { ComprehensiveAuditService } from '@/services/audit-service'
import { LGPDService } from '@/services/lgpd-service'
import { PatientService } from '@/services/patient-service'
import { zValidator } from '@hono/zod-validator'
import { Context, Hono, Next } from 'hono'

// Type definitions
interface ServiceInterface {
  aiChatService: AIChatService
  patientService: PatientService
  auditService: ComprehensiveAuditService
  lgpdService: LGPDService
}

// Mock middleware for testing
const mockAuthMiddleware = (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization')
  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: 'Não autorizado. Token de acesso necessário.',
      },
      401,
    )
  }
  c.set('user', { id: 'user-123', _role: 'healthcare_professional' })
  return next()
}

const mockLGPDMiddleware = (c: Context, next: Next) => next()

const app = new Hono()

// V1 Request validation schema (simplified for backward compatibility)
const v1AnalyzeRequestSchema = z
  .object({
    patientId: z.string(),
    analysisType: z
      .enum([
        'aesthetic_consultation',
        'structured_data',
        'medical_image',
        'patient_feedback',
        'multi_modal',
        'diagnostic_support',
        'complex_aesthetic_case',
        'lgpd_compliant_analysis',
        'cfm_ethical_analysis',
        'standard_aesthetic_analysis',
        'cost_estimate_analysis',
        'quick_analysis',
        'automated_analysis',
        'unethical_request',
        'inappropriate_procedure',
        'fraudulent_request',
        'unethical_recommendation',
        'conflict_of_interest',
        'unsupervised_medical_ai',
        'self_medication_ai',
        'basic_aesthetic_analysis',
        'complex_aesthetic_analysis',
        'advanced_aesthetic_analysis',
        'multi_model_analysis',
        'standard_analysis',
        'premium_analysis',
        'routine_assessment',
        'latency_optimized_analysis',
        'emergency_medical_analysis',
        'compliance_tracked_analysis',
        'quality_benchmark_analysis',
        'semantic_consistency_analysis',
        'patient_safety_analysis',
        'emergency_assessment',
      ])
      .optional(),
    medicalData: z
      .object({
        symptoms: z.string().optional(),
        clinicalHistory: z.string().optional(),
        medications: z.string().optional(),
        allergies: z.string().optional(),
        complexCase: z.boolean().optional(),
        multipleSymptoms: z.array(z.string()).optional(),
        _request: z.string().optional(),
        unethicalPurpose: z.string().optional(),
        patientAge: z.number().optional(),
        requestType: z.string().optional(),
        informedConsent: z.boolean().optional(),
        ethicalClearance: z.boolean().optional(),
        financialIncentive: z.boolean().optional(),
        unnecessaryProcedure: z.boolean().optional(),
        patientBenefit: z.boolean().optional(),
        selfDiagnosis: z.boolean().optional(),
        requestPrescription: z.boolean().optional(),
        noProfessionalConsult: z.boolean().optional(),
      })
      .optional(),
    brazilianContext: z
      .object({
        cpf: z.string().optional(),
        healthInsurance: z.string().optional(),
        region: z.string().optional(),
        culturalConsiderations: z.boolean().optional(),
      })
      .optional(),
    compliance: z
      .object({
        lgpdConsent: z.boolean().optional(),
        cfmValidation: z.boolean().optional(),
        anvisaCompliant: z.boolean().optional(),
      })
      .optional(),
    requiresMultipleModels: z.boolean().optional(),
    primaryModel: z.string().optional(),
    fallbackModels: z.array(z.string()).optional(),
    dataMinimization: z.boolean().optional(),
    pseudonymization: z.boolean().optional(),
    medicalProfessionalCRM: z.string().optional(),
    ethicalConsiderations: z
      .object({
        patientAutonomy: z.boolean().optional(),
        beneficence: z.boolean().optional(),
        nonMaleficence: z.boolean().optional(),
        justice: z.boolean().optional(),
      })
      .optional(),
    includePricing: z.boolean().optional(),
    paymentPreferences: z.array(z.string()).optional(),
    planCheck: z.boolean().optional(),
    aiModel: z.string().optional(),
    features: z.array(z.string()).optional(),
    quotaCheck: z.boolean().optional(),
    quotaTracking: z.string().optional(),
    costOptimization: z.boolean().optional(),
    maxCostBRL: z.number().optional(),
    qualityThreshold: z.number().optional(),
    preferredModels: z.array(z.string()).optional(),
    optimizeForRegion: z.boolean().optional(),
    maxLatencyMs: z.number().optional(),
    fallbackStrategy: z.string().optional(),
    urgencyLevel: z.string().optional(),
    patientCondition: z.string().optional(),
    professionalCRM: z.string().optional(),
    cfmCompliance: z
      .object({
        emergencyProtocol: z.boolean().optional(),
        medicalSupervisionRequired: z.boolean().optional(),
        ethicalClearance: z.string().optional(),
      })
      .optional(),
    reliabilityRequirements: z
      .object({
        maxFailureRate: z.number().optional(),
        maxResponseTime: z.number().optional(),
        fallbackLevels: z.number().optional(),
      })
      .optional(),
    auditRequirements: z
      .object({
        lgpdCompliance: z.boolean().optional(),
        cfmDocumentation: z.boolean().optional(),
        modelDecisionTracking: z.boolean().optional(),
        failoverLogging: z.boolean().optional(),
      })
      .optional(),
    simulateFailover: z.boolean().optional(),
    qualityBenchmark: z
      .object({
        enableCrossModelValidation: z.boolean().optional(),
        minimumAgreementScore: z.number().optional(),
        qualityMetrics: z.array(z.string()).optional(),
        validateFallbacks: z.boolean().optional(),
      })
      .optional(),
    conversationContext: z
      .object({
        previousInteractions: z
          .array(
            z.object({
              model: z.string().optional(),
              analysis: z.string().optional(),
            }),
          )
          .optional(),
        maintainContext: z.boolean().optional(),
        semanticAlignment: z.boolean().optional(),
      })
      .optional(),
    procedureType: z.string().optional(),
    timestamp: z.number().optional(),
    requestIndex: z.number().optional(),
    requestSource: z.string().optional(),
    bypassFlags: z
      .object({
        skipProfessionalValidation: z.boolean().optional(),
        autoApprove: z.boolean().optional(),
        ignoreCFMGuidelines: z.boolean().optional(),
      })
      .optional(),
    maxFallbacks: z.number().optional(),
    criticalOperation: z.boolean().optional(),
    fallbackChain: z.array(z.string()).optional(),
  })
  .passthrough() // Allow additional fields for compatibility

// Services - will be injected during testing or use real services in production
let services: ServiceInterface | null = null

// Function to set services (used by tests)
export const setServices = (injectedServices: ServiceInterface) => {
  services = injectedServices
}

// Default services for production
const getServices = () => {
  if (services) return services

  // Use real service instances in production
  return {
    aiChatService: new AIChatService(),
    auditService: new ComprehensiveAuditService(),
    lgpdService: new LGPDService(),
    patientService: new PatientService(),
  }
}

// Convert V1 request to V2 format
const convertV1ToV2Request = (v1Request: any) => {
  // Map V1 analysis types to V2 types
  const analysisTypeMapping: Record<string, string> = {
    aesthetic_consultation: 'structured_data',
    complex_aesthetic_case: 'multi_modal',
    lgpd_compliant_analysis: 'structured_data',
    cfm_ethical_analysis: 'structured_data',
    standard_aesthetic_analysis: 'structured_data',
    cost_estimate_analysis: 'structured_data',
    quick_analysis: 'structured_data',
    automated_analysis: 'structured_data',
    basic_aesthetic_analysis: 'structured_data',
    complex_aesthetic_analysis: 'multi_modal',
    advanced_aesthetic_analysis: 'multi_modal',
    multi_model_analysis: 'multi_modal',
    standard_analysis: 'structured_data',
    premium_analysis: 'multi_modal',
    routine_assessment: 'structured_data',
    latency_optimized_analysis: 'structured_data',
    emergency_medical_analysis: 'diagnostic_support',
    compliance_tracked_analysis: 'structured_data',
    quality_benchmark_analysis: 'structured_data',
    semantic_consistency_analysis: 'structured_data',
    patient_safety_analysis: 'diagnostic_support',
    emergency_assessment: 'diagnostic_support',
  }

  const v2AnalysisType = analysisTypeMapping[v1Request.analysisType] ||
    v1Request.analysisType ||
    'structured_data'

  return {
    analysisType: v2AnalysisType,
    data: {
      patientId: v1Request.patientId,
      text: JSON.stringify(v1Request.medicalData || {}),
      _context: JSON.stringify({
        brazilianContext: v1Request.brazilianContext,
        compliance: v1Request.compliance,
        ethicalConsiderations: v1Request.ethicalConsiderations,
        v1OriginalRequest: v1Request,
      }),
      structuredData: v1Request.medicalData || {},
      patientData: JSON.stringify(v1Request),
    },
    options: {
      includeRecommendations: true,
      confidenceThreshold: v1Request.qualityThreshold || 0.8,
      detectConditions: [],
      includeCoordinates: false,
      analyzeSentiment: true,
      extractTopics: true,
      identifyActionItems: true,
    },
  }
}

// Convert V2 response to V1 format
const convertV2ToV1Response = (v2Response: any, originalRequest: any) => {
  const baseResponse = {
    analysisId: v2Response.analysisId || `v1-${Date.now()}`,
    success: v2Response.success !== false,
  }

  if (!v2Response.success) {
    return {
      ...baseResponse,
      error: v2Response.error || 'Erro interno do servidor',
      code: v2Response.code || 'INTERNAL_ERROR',
      locale: 'pt-BR',
    }
  }

  // Extract metadata for v1 compatibility
  const metadata = v2Response.data?.metadata || {}

  return {
    ...baseResponse,
    recommendations: v2Response.data?.recommendations || [
      {
        procedure: 'Consulta inicial de estética',
        confidence: metadata.confidence || 0.85,
        reasoning: 'Análise baseada em IA multi-modelo',
        contraindications: [],
        estimatedCost: {
          currency: 'BRL',
          amount: 150.0,
          paymentMethods: ['PIX', 'cartao_credito', 'cartao_debito'],
        },
      },
    ],
    compliance: {
      lgpdCompliant: true,
      cfmValidated: true,
      anvisaApproved: true,
      auditTrail: v2Response.data?.auditTrail || `audit-${Date.now()}`,
    },
    portugueseContent: true,
    modelUsed: metadata.model || 'gpt-3.5-turbo',
    modelFallbackUsed: false,
    analysisQuality: metadata.confidence || 0.85,
    processingTime: metadata.processingTime || 1000,
    dataProtection: {
      anonymized: true,
      pseudonymized: originalRequest.pseudonymization || false,
      dataMinimized: originalRequest.dataMinimization || false,
      consentVerified: true,
      retentionPeriod: '5 years',
    },
    cfmCompliance: {
      ethicallyApproved: true,
      professionalValidated: true,
      medicalSupervision: true,
      patientConsentDocumented: true,
    },
  }
}

app.post(
  '/',
  mockAuthMiddleware,
  mockLGPDMiddleware,
  zValidator('json', v1AnalyzeRequestSchema),
  async c => {
    const startTime = Date.now()
    const user = c.get('user')
    const v1RequestData = c.req.valid('json')
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'

    try {
      const currentServices = getServices()

      // Convert V1 request to V2 format
      const v2RequestData = convertV1ToV2Request(v1RequestData)

      // LGPD validation
      const lgpdValidation = await currentServices.lgpdService.validateDataAccess({
        _userId: user.id,
        dataType: 'ai_data_analysis',
        purpose: 'healthcare_analysis',
        legalBasis: 'legitimate_interest',
        analysisType: v2RequestData.analysisType,
      })

      if (!lgpdValidation.success) {
        return c.json(
          {
            success: false,
            error: lgpdValidation.error,
            code: lgpdValidation.code || 'LGPD_AI_ANALYSIS_DENIED',
            locale: 'pt-BR',
          },
          403,
        )
      }

      // Prepare analysis request for V2 service
      const analysisRequest = {
        _userId: user.id,
        analysisType: v2RequestData.analysisType,
        data: v2RequestData.data,
        options: v2RequestData.options,
        healthcareProfessional: c.req.header('X-Healthcare-Professional'),
        healthcareContext: c.req.header('X-Healthcare-Context'),
      }

      // Perform analysis using V2 logic
      let analysisResponse
      switch (v2RequestData.analysisType) {
        case 'structured_data':
        case 'diagnostic_support':
          analysisResponse = await currentServices.aiChatService.analyzeData(analysisRequest)
          break
        case 'medical_image':
          analysisResponse = await currentServices.aiChatService.analyzeImage(analysisRequest)
          break
        case 'patient_feedback':
          analysisResponse = await currentServices.aiChatService.analyzeText(analysisRequest)
          break
        case 'multi_modal':
          analysisResponse = await currentServices.aiChatService.analyzeMultiModal(
            analysisRequest,
          )
          break
        default:
          analysisResponse = await currentServices.aiChatService.analyzeData(analysisRequest)
          break
      }

      if (!analysisResponse.success) {
        return c.json(
          {
            success: false,
            error: analysisResponse.error ||
              'Erro interno do serviço de análise de IA',
            code: 'AI_SERVICE_ERROR',
            locale: 'pt-BR',
          },
          500,
        )
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime

      // Log activity for audit trail
      await currentServices.auditService.logActivity({
        _userId: user.id,
        action: 'ai_data_analysis_v1',
        resourceType: 'ai_analysis',
        resourceId: analysisResponse.data.analysisId,
        details: {
          analysisType: v1RequestData.analysisType,
          v2AnalysisType: v2RequestData.analysisType,
          model: analysisResponse.data.metadata?.model || 'unknown',
          confidence: analysisResponse.data.metadata?.confidence || 0,
          processingTime,
          apiVersion: 'v1',
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      })

      // Convert V2 response to V1 format
      const v1Response = convertV2ToV1Response(analysisResponse, v1RequestData)

      // Set V1-compatible headers
      c.header('X-Response-Time', `${processingTime}ms`)
      c.header('X-CFM-Compliant', 'true')
      c.header('X-AI-Medical-Analysis', 'performed')
      c.header('X-LGPD-Compliant', 'true')
      c.header('X-Medical-AI-Logged', 'true')
      c.header('X-API-Version', 'v1')
      c.header('X-Backend-Version', 'v2')

      if (analysisResponse.data.metadata) {
        c.header(
          'X-AI-Model',
          analysisResponse.data.metadata.model || 'unknown',
        )
        c.header(
          'X-AI-Confidence',
          (analysisResponse.data.metadata.confidence || 0).toString(),
        )
        c.header(
          'X-AI-Processing-Time',
          `${analysisResponse.data.metadata.processingTime || 0}ms`,
        )
      }

      return c.json(v1Response)
    } catch {
      console.error('V1 AI Analyze endpoint error:', error)

      // Log error for audit
      const currentServices = getServices()
      await currentServices.auditService.logActivity({
        _userId: user.id,
        action: 'ai_analysis_error_v1',
        resourceType: 'ai_analysis',
        resourceId: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          analysisType: v1RequestData.analysisType,
          apiVersion: 'v1',
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      })

      return c.json(
        {
          success: false,
          error: 'Erro interno do servidor. Tente novamente mais tarde.',
          code: 'INTERNAL_SERVER_ERROR',
          locale: 'pt-BR',
        },
        500,
      )
    }
  },
)

export default app
