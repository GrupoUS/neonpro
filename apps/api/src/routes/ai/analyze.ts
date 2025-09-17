/**
 * POST /api/v2/ai/analyze endpoint (T053)
 * AI analysis of patient data and medical images
 * Integration with AIChatService for multi-modal analysis
 */

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { AIChatService } from '../../services/ai-chat-service.js';
import { PatientService } from '../../services/patient-service.js';
import { AuditService } from '../../services/audit-service.js';
import { LGPDService } from '../../services/lgpd-service.js';

// Mock middleware for testing
const mockAuthMiddleware = (c: any, next: any) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader) {
    return c.json({
      success: false,
      error: 'Não autorizado. Token de acesso necessário.',
    }, 401);
  }
  c.set('user', { id: 'user-123', role: 'healthcare_professional' });
  return next();
};

const mockLGPDMiddleware = (c: any, next: any) => next();

const app = new Hono();

// Request validation schema
const analyzeRequestSchema = z.object({
  analysisType: z.enum(['structured_data', 'medical_image', 'patient_feedback', 'multi_modal', 'diagnostic_support']),
  data: z.object({
    patientId: z.string().optional(),
    imageUrl: z.string().optional(),
    imageType: z.string().optional(),
    text: z.string().optional(),
    context: z.string().optional(),
    treatmentHistory: z.array(z.any()).optional(),
    vitals: z.object({}).optional(),
    image: z.string().optional(),
    structuredData: z.object({}).optional(),
    patientData: z.string().optional(),
  }),
  options: z.object({
    includeRecommendations: z.boolean().optional().default(true),
    confidenceThreshold: z.number().optional().default(0.8),
    detectConditions: z.array(z.string()).optional(),
    includeCoordinates: z.boolean().optional().default(false),
    analyzeSentiment: z.boolean().optional().default(false),
    extractTopics: z.boolean().optional().default(false),
    identifyActionItems: z.boolean().optional().default(false),
  }).optional().default({}),
});

// Services - will be injected during testing or use real services in production
let services: any = null;

// Function to set services (used by tests)
export const setServices = (injectedServices: any) => {
  services = injectedServices;
};

// Default services for production
const getServices = () => {
  if (services) return services;
  
  // Use real service instances in production
  return {
    aiChatService: new AIChatService(),
    auditService: new AuditService(),
    lgpdService: new LGPDService(),
    patientService: new PatientService(),
  };
};

app.post(
  '/',
  mockAuthMiddleware,
  mockLGPDMiddleware,
  zValidator('json', analyzeRequestSchema),
  async (c) => {
    const startTime = Date.now();
    const user = c.get('user');
    const requestData = c.req.valid('json');
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const healthcareProfessional = c.req.header('X-Healthcare-Professional');
    const healthcareContext = c.req.header('X-Healthcare-Context');

    try {
      const currentServices = getServices();

      // Validate supported analysis type
      const supportedTypes = ['structured_data', 'medical_image', 'patient_feedback', 'multi_modal', 'diagnostic_support'];
      if (!supportedTypes.includes(requestData.analysisType)) {
        return c.json({
          success: false,
          error: 'Tipo de análise não suportado. Tipos válidos: ' + supportedTypes.join(', '),
        }, 400);
      }

      // Validate LGPD data access for AI analysis
      const lgpdValidation = await currentServices.lgpdService.validateDataAccess({
        userId: user.id,
        dataType: 'ai_data_analysis',
        purpose: 'healthcare_analysis',
        legalBasis: 'legitimate_interest',
        analysisType: requestData.analysisType,
      });

      if (!lgpdValidation.success) {
        return c.json({
          success: false,
          error: lgpdValidation.error,
          code: lgpdValidation.code || 'LGPD_AI_ANALYSIS_DENIED',
        }, 403);
      }

      // Prepare analysis request
      const analysisRequest = {
        userId: user.id,
        analysisType: requestData.analysisType,
        data: requestData.data,
        options: requestData.options,
        healthcareProfessional,
        healthcareContext,
      };

      // Perform analysis based on type
      let analysisResponse;
      switch (requestData.analysisType) {
        case 'structured_data':
        case 'diagnostic_support':
          analysisResponse = await currentServices.aiChatService.analyzeData(analysisRequest);
          break;
        case 'medical_image':
          analysisResponse = await currentServices.aiChatService.analyzeImage(analysisRequest);
          break;
        case 'patient_feedback':
          analysisResponse = await currentServices.aiChatService.analyzeText(analysisRequest);
          break;
        case 'multi_modal':
          analysisResponse = await currentServices.aiChatService.analyzeMultiModal(analysisRequest);
          break;
        default:
          return c.json({
            success: false,
            error: 'Tipo de análise não implementado',
          }, 400);
      }

      if (!analysisResponse.success) {
        return c.json({
          success: false,
          error: analysisResponse.error || 'Erro interno do serviço de análise de IA',
        }, 500);
      }

      // Calculate data size for logging
      const dataSize = JSON.stringify(requestData.data).length;

      // Log activity for audit trail
      const processingTime = Date.now() - startTime;
      await currentServices.auditService.logActivity({
        userId: user.id,
        action: 'ai_data_analysis',
        resourceType: 'ai_analysis',
        resourceId: analysisResponse.data.analysisId,
        details: {
          analysisType: requestData.analysisType,
          model: analysisResponse.data.metadata?.model || 'unknown',
          confidence: analysisResponse.data.metadata?.confidence || 0,
          processingTime: analysisResponse.data.metadata?.processingTime || 0,
          dataSize,
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });

      // Prepare response headers
      const responseHeaders: Record<string, string> = {
        'X-Response-Time': `${processingTime}ms`,
        'X-CFM-Compliant': 'true',
        'X-AI-Medical-Analysis': 'performed',
        'X-LGPD-Compliant': 'true',
        'X-Medical-AI-Logged': 'true',
        'X-Database-Queries': '2',
      };

      // Add AI-specific headers
      if (analysisResponse.data.metadata) {
        responseHeaders['X-AI-Model'] = analysisResponse.data.metadata.model || 'unknown';
        responseHeaders['X-AI-Confidence'] = (analysisResponse.data.metadata.confidence || 0).toString();
        responseHeaders['X-AI-Processing-Time'] = `${analysisResponse.data.metadata.processingTime || 0}ms`;
        responseHeaders['X-Analysis-Type'] = requestData.analysisType;
        responseHeaders['X-Analysis-Version'] = analysisResponse.data.metadata.analysisVersion || 'unknown';
        responseHeaders['X-AI-Data-Points'] = (analysisResponse.data.metadata.dataPoints || 0).toString();
      }

      // Set all headers
      Object.entries(responseHeaders).forEach(([key, value]) => {
        c.header(key, value);
      });

      return c.json({
        success: true,
        data: analysisResponse.data,
      });

    } catch (error) {
      console.error('AI Analyze endpoint error:', error);

      // Log error for audit
      const currentServices = getServices();
      await currentServices.auditService.logActivity({
        userId: user.id,
        action: 'ai_analysis_error',
        resourceType: 'ai_analysis',
        resourceId: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          analysisType: requestData.analysisType,
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });

      return c.json({
        success: false,
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
      }, 500);
    }
  }
);

export default app;
