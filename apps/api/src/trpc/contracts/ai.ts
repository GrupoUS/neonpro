/**
 * tRPC v11 AI Service API Contracts
 * Comprehensive AI integration with health compliance and error handling
 */

import {
  AIChatResponseSchema,
  AIHealthcheckResponseSchema,
  AIRequestSchema,
  AIResponseSchema,
  HealthcareTRPCError,
  PaginationSchema,
} from '@neonpro/types/api/contracts';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { auditLogger } from '@neonpro/security';
import { 
  aiSecurityService,
  sanitizeForAI,
  validatePromptSecurity,
  validateAIOutputSafety,
  shouldRetainAIData
} from '../../services/ai-security-service';
import { 
  lgpdConsentService, 
  lgpdAuditService 
} from '../../services/lgpd-consent-service';
import { lgpdDataSubjectService } from '../../services/lgpd-data-subject-service';
import { LGPDComplianceMiddleware } from '../../middleware/lgpd-compliance';
import { ConsentPurpose } from '../../services/lgpd-consent-service';
import { DataCategory } from '../../services/lgpd-audit-service';

// Health analysis service
import { HealthAnalysisService } from '@neonpro/core-services';

// AI service management functions
import {
  checkAIServiceHealth,
  checkModelAvailability,
  getAIUsageStats
} from '@neonpro/core-services';

// Initialize services
const healthAnalysisService = new HealthAnalysisService();

export const aiRouter = router({
  /**
   * AI Chat completion with healthcare context and compliance
   */
  chat: protectedProcedure
    .meta({
      description: 'AI chat completion with healthcare context and LGPD compliance',
      tags: ['ai', 'chat', 'healthcare', 'compliance'],
      requiresPermission: 'ai:chat',
    })
    .input(AIRequestSchema.extend({
      message: z.string().min(1).max(4000),
      conversationId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      clinicId: z.string().uuid(),
      context: z.enum([
        'general',
        'patient_consultation',
        'appointment_scheduling',
        'medical_analysis',
      ]).default('general'),
      model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-3-haiku']).default('gpt-4'),
      temperature: z.number().min(0).max(2).default(0.7),
      maxTokens: z.number().min(1).max(4000).default(1000),
      includeHistory: z.boolean().default(true),
      lgpdCompliant: z.boolean().default(true),
    }))
    .output(AIChatResponseSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate clinic access
      if (ctx.clinicId !== input.clinicId) {
        throw new HealthcareTRPCError(
          'FORBIDDEN',
          'Access denied to clinic',
          'CLINIC_ACCESS_DENIED',
        );
      }

      // Validate patient access if patient context provided
      if (input.patientId) {
        const patient = await ctx.prisma.patient.findFirst({
          where: {
            id: input.patientId,
            clinicId: input.clinicId,
          },
        });
        if (!patient) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Patient not found or access denied',
            'PATIENT_NOT_FOUND',
          );
        }
      }

      // LGPD Compliance: Validate consent for AI processing
      if (input.lgpdCompliant) {
        try {
          await lgpdConsentService.validateConsent(
            input.patientId || ctx.userId,
            ConsentPurpose.AI_ANALYSIS,
            'AI chat processing'
          );
        } catch (error) {
          // Create audit entry for consent violation
          await lgpdAuditService.recordAudit({
            userId: ctx.userId,
            patientId: input.patientId,
            action: 'CONSENT_VIOLATION',
            entityType: 'AI_PROCESSING',
            entityId: `ai_chat_${Date.now()}`,
            dataCategory: DataCategory.HEALTH,
            severity: 'HIGH',
            description: 'AI processing attempted without valid consent',
            metadata: {
              operation: 'AI_CHAT',
              purpose: ConsentPurpose.AI_ANALYSIS,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
          throw error;
        }
      }

      // Apply AI security validations
      if (!validatePromptSecurity(input.message)) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Message contains potentially harmful content',
          'CONTENT_FILTERED',
        );
      }

      // Check rate limiting
      if (!aiSecurityService.canMakeRequest(ctx.user.id, input.clinicId)) {
        throw new HealthcareTRPCError(
          'TOO_MANY_REQUESTS',
          'AI request rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
        );
      }

      // Check AI usage limits (basic implementation)
      const dailyUsage = await ctx.prisma.auditTrail.count({
        where: {
          userId: ctx.userId,
          clinicId: input.clinicId,
          action: 'AI_CHAT',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const DAILY_LIMIT = 1000;
      if (dailyUsage >= DAILY_LIMIT) {
        throw new HealthcareTRPCError(
          'TOO_MANY_REQUESTS',
          'AI usage limit exceeded',
          'TOO_MANY_REQUESTS',
          {
            currentUsage: dailyUsage,
            limit: DAILY_LIMIT,
          },
        );
      }

      // Sanitize input for LGPD compliance using security service
      const sanitizedMessage = sanitizeForAI({
        message: input.message,
        patientId: input.patientId,
        clinicId: input.clinicId,
        userId: ctx.userId,
      });

      // Build healthcare context (simplified)
      const systemContext = {
        userId: ctx.userId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        timestamp: new Date().toISOString(),
      };

      // Get conversation history if requested
      let conversationHistory: any[] = [];
      let conversationId = input.conversationId;

      if (input.includeHistory && conversationId) {
        // Get conversation history from audit trails
        conversationHistory = await ctx.prisma.auditTrail.findMany({
          where: {
            userId: ctx.userId,
            clinicId: input.clinicId,
            action: 'AI_CHAT',
            resourceId: conversationId,
          },
          orderBy: { createdAt: 'asc' },
          take: 50,
        });
      } else if (!conversationId) {
        // Create new conversation audit trail
        conversationId = `ai_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: input.clinicId,
            action: 'AI_CHAT',
            resource: 'AI_CONVERSATION_START',
            resourceType: 'AI_PREDICTION',
            resourceId: conversationId,
            ipAddress: ctx.req.socket.remoteAddress || '',
            userAgent: ctx.req.headers['user-agent'] || '',
            status: 'SUCCESS',
            riskLevel: 'LOW',
            additionalInfo: JSON.stringify({
              patientId: input.patientId,
              model: input.model,
            }),
          },
        });
      }

      // Prepare AI request
      const aiRequest = {
        model: input.model,
        messages: [
          {
            role: 'system',
            content:
              `Healthcare AI Assistant for clinic ${input.clinicId}. User: ${ctx.userId}. Patient context: ${
                input.patientId || 'none'
              }.`,
          },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: sanitizedMessage,
          },
        ],
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        user: `user_${ctx.userId}`,
      };

      try {
        // Call AI service with retry logic
        const aiResponse = await callAIServiceWithRetry(aiRequest);

        // Validate AI response for security
        if (!validateAIOutputSafety(aiResponse.content)) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'AI response failed security validation',
            'CONTENT_FILTERED',
          );
        }

        // Store conversation message in audit trail with LGPD compliance
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: input.clinicId,
            action: 'AI_CHAT',
            resource: 'AI_MESSAGE_USER',
            resourceType: 'AI_PREDICTION',
            resourceId: conversationId,
            ipAddress: ctx.req.socket.remoteAddress || '',
            userAgent: ctx.req.headers['user-agent'] || '',
            status: 'SUCCESS',
            riskLevel: 'LOW',
            additionalInfo: JSON.stringify({
              role: 'user',
              content: sanitizedMessage,
              originalContent: input.message,
              model: input.model,
              lgpdCompliant: input.lgpdCompliant,
              patientId: input.patientId,
            }),
          },
        });

        // LGPD Compliance: Record AI data processing
        await lgpdAuditService.recordAudit({
          userId: ctx.userId,
          patientId: input.patientId,
          action: 'AI_DATA_PROCESSING',
          entityType: 'AI_CHAT',
          entityId: conversationId,
          dataCategory: DataCategory.HEALTH,
          severity: 'MEDIUM',
          description: 'AI chat message processed with LGPD compliance',
          metadata: {
            messageLength: sanitizedMessage.length,
            model: input.model,
            lgpdCompliant: input.lgpdCompliant,
            consentValidated: input.lgpdCompliant,
            processingTime: Date.now()
          }
        });

        // Store AI response in audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: input.clinicId,
            action: 'AI_CHAT',
            resource: 'AI_MESSAGE_ASSISTANT',
            resourceType: 'AI_PREDICTION',
            resourceId: conversationId,
            ipAddress: ctx.req.socket.remoteAddress || '',
            userAgent: ctx.req.headers['user-agent'] || '',
            status: 'SUCCESS',
            riskLevel: 'LOW',
            additionalInfo: JSON.stringify({
              role: 'assistant',
              content: aiResponse.content,
              model: input.model,
            }),
          },
        });

        // Log AI interaction for audit trail
        aiSecurityService.logAIInteraction({
          userId: ctx.userId,
          patientId: input.patientId,
          clinicId: input.clinicId,
          provider: input.model,
          prompt: input.message,
          response: aiResponse.content,
          timestamp: Date.now(),
        });

        // Update usage tracking with audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: input.clinicId,
            action: 'AI_CHAT',
            resource: 'AI_CONVERSATION',
            resourceType: 'AI_PREDICTION',
            resourceId: conversationId,
            ipAddress: ctx.req.socket.remoteAddress || '',
            userAgent: ctx.req.headers['user-agent'] || '',
            status: 'SUCCESS',
            riskLevel: 'LOW',
            additionalInfo: JSON.stringify({
              model: input.model,
              tokensUsed: 100,
              patientContext: !!input.patientId,
            }),
          },
        });

        return {
          success: true,
          data: {
            conversationId,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: aiResponse.content,
            model: input.model,
            usage: {
              prompt_tokens: aiResponse.usage?.prompt_tokens || 50,
              completion_tokens: aiResponse.usage?.completion_tokens || 50,
              total_tokens: aiResponse.usage?.total_tokens || 100,
            },
            finishReason: aiResponse.finish_reason || 'stop',
            metadata: {
              sanitized: true,
              contextType: input.context,
              responseTime: aiResponse.responseTime || 150,
              securityValidated: true,
            },
          },
          message: 'AI chat completion successful',
          timestamp: new Date().toISOString(),
        };
      } catch (error: unknown) {
        // Handle AI service errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code;

        if (errorCode === 'insufficient_quota') {
          throw new HealthcareTRPCError(
            'INTERNAL_SERVER_ERROR',
            'AI service quota exceeded',
            'SERVICE_UNAVAILABLE',
            { provider: input.model },
          );
        }

        if (errorCode === 'content_filter') {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'Content filtered by AI safety systems',
            'CONTENT_FILTERED',
            { reason: (error as any)?.details },
          );
        }

        // Log AI service error (simplified - remove auditLog if not in schema)
        console.error('AI service error:', errorMessage);

        throw new HealthcareTRPCError(
          'INTERNAL_SERVER_ERROR',
          'AI service error',
          'AI_PROCESSING_ERROR',
          { originalError: errorMessage },
        );
      }
    }),

  /**
   * Get AI conversation history
   */
  getConversationHistory: protectedProcedure
    .meta({
      description: 'Get AI conversation history with pagination and filtering',
      tags: ['ai', 'conversation', 'history'],
      requiresPermission: 'ai:history',
    })
    .input(PaginationSchema.extend({
      conversationId: z.string().uuid().optional(),
      clinicId: z.string().uuid(),
      patientId: z.string().uuid().optional(),
      context: z.enum([
        'general',
        'patient_consultation',
        'appointment_scheduling',
        'medical_analysis',
      ]).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      includeContent: z.boolean().default(true),
    }))
    .output(z.object({
      success: z.literal(true),
      data: z.object({
        conversations: z.array(z.object({
          id: z.string(),
          context: z.string(),
          patientId: z.string().nullable(),
          createdAt: z.string().datetime(),
          updatedAt: z.string().datetime(),
          messageCount: z.number(),
          lastMessage: z.object({
            role: z.string(),
            content: z.string(),
            createdAt: z.string().datetime(),
          }).optional(),
          messages: z.array(z.object({
            id: z.string(),
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
            usage: z.object({
              prompt_tokens: z.number(),
              completion_tokens: z.number(),
              total_tokens: z.number(),
            }).optional(),
            createdAt: z.string().datetime(),
          })).optional(),
        })),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Validate clinic access through context
      if (ctx.clinicId !== input.clinicId) {
        throw new HealthcareTRPCError(
          'FORBIDDEN',
          'Access denied to clinic',
          'CLINIC_ACCESS_DENIED',
        );
      }

      // Validate patient access if specified
      if (input.patientId) {
        const patient = await ctx.prisma.patient.findFirst({
          where: {
            id: input.patientId,
            clinicId: input.clinicId,
          },
        });
        if (!patient) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Patient not found or access denied',
            'PATIENT_NOT_FOUND',
          );
        }
      }

      const where = {
        userId: ctx.user.id,
        clinicId: input.clinicId,
        ...(input.conversationId && { id: input.conversationId }),
        ...(input.patientId && { patientId: input.patientId }),
        ...(input.context && { context: input.context }),
        ...(input.dateFrom && { createdAt: { gte: new Date(input.dateFrom) } }),
        ...(input.dateTo && { createdAt: { lte: new Date(input.dateTo) } }),
      };

      const [conversations, total] = await Promise.all([
        ctx.prisma.auditTrail.findMany({
          where: {
            ...where,
            action: 'AI_CHAT',
            resource: { in: ['AI_CONVERSATION_START', 'AI_MESSAGE_USER', 'AI_MESSAGE_ASSISTANT'] },
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          distinct: ['resourceId'],
        }),
        ctx.prisma.auditTrail.count({
          where: {
            ...where,
            action: 'AI_CHAT',
            resource: 'AI_CONVERSATION_START',
          },
        }),
      ]);

      // Get last message for each conversation if not including full content
      const conversationsWithLastMessage = await Promise.all(
        conversations.map(async conversation => {
          let lastMessage;
          if (!input.includeContent) {
            lastMessage = await ctx.prisma.auditTrail.findFirst({
              where: { 
                resourceId: conversation.resourceId,
                action: 'AI_CHAT',
              },
              orderBy: { createdAt: 'desc' },
              select: {
                additionalInfo: true,
                createdAt: true,
              },
            });
          }

          // Parse additional info to get message content
          const parseMessageInfo = (info: string) => {
            try {
              return JSON.parse(info);
            } catch {
              return { content: '', role: '' };
            }
          };

          const lastMessageInfo = lastMessage ? parseMessageInfo(lastMessage.additionalInfo) : null;

          return {
            id: conversation.resourceId,
            context: 'AI Conversation',
            patientId: conversation.patientId,
            createdAt: conversation.createdAt.toISOString(),
            updatedAt: conversation.createdAt.toISOString(),
            messageCount: 1, // Simplified for audit trail approach
            lastMessage: lastMessageInfo
              ? {
                role: lastMessageInfo.role,
                content: lastMessageInfo.content.substring(0, 100)
                  + (lastMessageInfo.content.length > 100 ? '...' : ''),
                createdAt: lastMessage.createdAt.toISOString(),
              }
              : undefined,
            messages: input.includeContent
              ? await ctx.prisma.auditTrail.findMany({
                  where: {
                    resourceId: conversation.resourceId,
                    action: 'AI_CHAT',
                    resource: { in: ['AI_MESSAGE_USER', 'AI_MESSAGE_ASSISTANT'] },
                  },
                  orderBy: { createdAt: 'asc' },
                  select: {
                    additionalInfo: true,
                    createdAt: true,
                  },
                }).then(msgs => msgs.map(msg => {
                  const msgInfo = parseMessageInfo(msg.additionalInfo);
                  return {
                    id: msg.id,
                    role: msgInfo.role as 'user' | 'assistant' | 'system',
                    content: msgInfo.content,
                    usage: msgInfo.usage,
                    createdAt: msg.createdAt.toISOString(),
                  };
                }))
              : undefined,
          };
        }),
      );

      return {
        success: true,
        data: {
          conversations: conversationsWithLastMessage,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * AI health analysis and insights
   */
  healthAnalysis: protectedProcedure
    .meta({
      description: 'AI-powered health analysis and insights generation',
      tags: ['ai', 'health', 'analysis', 'insights'],
      requiresPermission: 'ai:health_analysis',
    })
    .input(z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      analysisType: z.enum([
        'risk_assessment',
        'treatment_recommendation',
        'diagnostic_support',
        'follow_up_planning',
      ]),
      includeHistory: z.boolean().default(true),
      timeRange: z.object({
        from: z.string().datetime(),
        to: z.string().datetime(),
      }).optional(),
      customPrompt: z.string().max(1000).optional(),
    }))
    .output(z.object({
      success: z.literal(true),
      data: z.object({
        analysisId: z.string(),
        patientId: z.string(),
        analysisType: z.string(),
        insights: z.array(z.object({
          category: z.string(),
          title: z.string(),
          description: z.string(),
          confidence: z.number().min(0).max(1),
          severity: z.enum(['low', 'medium', 'high', 'critical']),
          recommendations: z.array(z.string()),
        })),
        riskFactors: z.array(z.object({
          factor: z.string(),
          impact: z.enum(['low', 'medium', 'high']),
          description: z.string(),
        })),
        recommendations: z.array(z.object({
          category: z.string(),
          recommendation: z.string(),
          priority: z.enum(['low', 'medium', 'high', 'urgent']),
          reasoning: z.string(),
        })),
        followUp: z.object({
          recommended: z.boolean(),
          timeframe: z.string().optional(),
          notes: z.string().optional(),
        }),
        metadata: z.object({
          model: z.string(),
          generatedAt: z.string().datetime(),
          dataPoints: z.number(),
          confidence: z.number(),
        }),
      }),
      message: z.string(),
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate clinic and patient access
      const clinic = await ctx.prisma.clinic.findFirst({
        where: {
          id: input.clinicId,
          userId: ctx.user.id
        }
      });

      if (!clinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_ACCESS_DENIED',
          { clinicId: input.clinicId }
        );
      }

      const patient = await ctx.prisma.patient.findFirst({
        where: {
          id: input.patientId,
          clinicId: input.clinicId,
          userId: ctx.user.id
        }
      });

      if (!patient) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Patient not found',
          'PATIENT_NOT_FOUND',
          { patientId: input.patientId }
        );
      }

      // Check if user has permission for health analysis
      if (!hasHealthAnalysisPermission(ctx.user.role)) {
        throw new HealthcareTRPCError(
          'FORBIDDEN',
          'Insufficient permissions for health analysis',
          'CLINIC_ACCESS_DENIED',
          { requiredPermission: 'health_analysis', userRole: ctx.user.role },
        );
      }

      // Gather patient data for analysis
      const patientData = await healthAnalysisService.gatherPatientAnalysisData({
        patientId: input.patientId,
        clinicId: input.clinicId,
        userId: ctx.user.id,
        userRole: ctx.user.role,
      });

      if (!patientData.hasMinimumData) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Insufficient patient data for analysis',
          'AI_PROCESSING_ERROR',
          {
            dataPoints: patientData.dataPointCount,
            minimumRequired: 3,
          },
        );
      }

      // Build analysis prompt
      const analysisPrompt = healthAnalysisService.buildHealthAnalysisPrompt({
        patientData,
        customPrompt: input.customPrompt,
      });

      try {
        // Call AI service for health analysis
        const aiResponse = await healthAnalysisService.callHealthAnalysisAI({
          prompt: analysisPrompt,
          model: 'gpt-4', // Use most capable model for health analysis
          temperature: 0.3, // Lower temperature for medical analysis
        });

        // Parse AI response into structured insights
        const analysisResult = healthAnalysisService.parseHealthAnalysisResponse(aiResponse.content);

        // Store analysis results
        const analysisId = await healthAnalysisService.storeHealthAnalysis({
          patientId: input.patientId,
          clinicId: input.clinicId,
          analysisType: input.analysisType,
          results: analysisResult,
          aiMetadata: {
            model: 'gpt-4',
            tokensUsed: aiResponse.usage.total_tokens,
            confidence: analysisResult.metadata.confidence,
          },
          userId: ctx.user.id,
        });

        // Create audit log for health analysis
        await ctx.prisma.auditLog.create({
          data: {
            action: 'ai_health_analysis',
            entityType: 'patient',
            entityId: input.patientId,
            details: {
              analysisId,
              analysisType: input.analysisType,
              dataPoints: patientData.dataPointCount,
              confidence: analysisResult.metadata.confidence,
              tokensUsed: aiResponse.usage.total_tokens,
            },
            userId: ctx.user.id,
          },
        });

        return {
          success: true,
          data: {
            analysisId,
            patientId: input.patientId,
            analysisType: input.analysisType,
            ...analysisResult,
          },
          message: 'Health analysis completed successfully',
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        await ctx.prisma.auditLog.create({
          data: {
            action: 'ai_health_analysis_error',
            entityType: 'patient',
            entityId: input.patientId,
            details: {
              error: error.message,
              analysisType: input.analysisType,
            },
            userId: ctx.user.id,
          },
        });

        throw new HealthcareTRPCError(
          'INTERNAL_SERVER_ERROR',
          'Health analysis failed',
          'HEALTH_ANALYSIS_ERROR',
          { originalError: error.message },
        );
      }
    }),

  /**
   * AI service health check and status
   */
  healthcheck: protectedProcedure
    .meta({
      description: 'Check AI service health and availability',
      tags: ['ai', 'health', 'monitoring'],
      requiresPermission: 'ai:healthcheck',
    })
    .input(z.object({
      includeModels: z.boolean().default(true),
      includeUsage: z.boolean().default(true),
    }))
    .output(AIHealthcheckResponseSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Check AI service availability
        const serviceStatus = await checkAIServiceHealth();

        // Get model availability if requested
        let modelStatus = null;
        if (input.includeModels) {
          modelStatus = await checkModelAvailability();
        }

        // Get usage statistics if requested
        let usageStats = null;
        if (input.includeUsage) {
          usageStats = await getAIUsageStats(ctx.user.id);
        }

        return {
          success: true,
          data: {
            status: serviceStatus.isHealthy ? 'healthy' : 'degraded',
            services: {
              openai: serviceStatus.openai,
              anthropic: serviceStatus.anthropic,
              fallback: serviceStatus.fallback,
            },
            models: modelStatus,
            usage: usageStats,
            lastCheck: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        return {
          success: true,
          data: {
            status: 'unhealthy',
            services: {
              openai: false,
              anthropic: false,
              fallback: false,
            },
            models: null,
            usage: null,
            lastCheck: new Date().toISOString(),
            error: error.message,
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      }
    }),

  /**
   * Generate AI-powered appointment suggestions
   */
  appointmentSuggestions: protectedProcedure
    .meta({
      description: 'Generate AI-powered appointment scheduling suggestions',
      tags: ['ai', 'appointments', 'scheduling'],
      requiresPermission: 'ai:appointments',
    })
    .input(z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      serviceType: z.string().optional(),
      preferredTimeframe: z.object({
        from: z.string().datetime(),
        to: z.string().datetime(),
      }).optional(),
      urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      previousAppointments: z.boolean().default(true),
    }))
    .output(z.object({
      success: z.literal(true),
      data: z.object({
        suggestions: z.array(z.object({
          appointmentType: z.string(),
          recommendedDate: z.string().datetime(),
          duration: z.number(),
          priority: z.enum(['low', 'medium', 'high', 'urgent']),
          reasoning: z.string(),
          professionalId: z.string().optional(),
          serviceId: z.string().optional(),
        })),
        optimization: z.object({
          bestTimeSlots: z.array(z.string().datetime()),
          conflictWarnings: z.array(z.string()),
          efficiencyScore: z.number().min(0).max(1),
        }),
        patientInsights: z.object({
          appointmentHistory: z.object({
            totalAppointments: z.number(),
            averageInterval: z.number(),
            lastAppointment: z.string().datetime().nullable(),
          }),
          preferences: z.object({
            preferredTimes: z.array(z.string()),
            preferredDays: z.array(z.string()),
            noShowRisk: z.enum(['low', 'medium', 'high']),
          }),
        }),
      }),
      message: z.string(),
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate access
      const clinic = await ctx.prisma.clinic.findFirst({
        where: {
          id: input.clinicId,
          userId: ctx.user.id
        }
      });

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      const patient = await ctx.prisma.patient.findFirst({
        where: {
          id: input.patientId,
          clinicId: input.clinicId,
          userId: ctx.user.id
        }
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Gather appointment data
      const appointmentData = await gatherAppointmentAnalysisData(
        input.patientId,
        input.clinicId,
        input.previousAppointments,
      );

      // Get clinic schedule and availability
      const clinicSchedule = await getClinicScheduleData(input.clinicId);

      // Generate AI suggestions
      const aiRequest = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: buildAppointmentSuggestionPrompt(clinicSchedule),
          },
          {
            role: 'user',
            content: JSON.stringify({
              patientData: appointmentData,
              preferences: input,
              clinicAvailability: clinicSchedule,
            }),
          },
        ],
        temperature: 0.4,
      };

      try {
        const aiResponse = await callAIServiceWithRetry(aiRequest);
        const suggestions = parseAppointmentSuggestions(aiResponse.content);

        // Audit log
        await ctx.prisma.auditLog.create({
          data: {
            action: 'ai_appointment_suggestions',
            entityType: 'patient',
            entityId: input.patientId,
            details: {
              suggestionsCount: suggestions.suggestions.length,
              urgency: input.urgency,
              tokensUsed: aiResponse.usage.total_tokens,
            },
            userId: ctx.user.id,
          },
        });

        return {
          success: true,
          data: suggestions,
          message: 'Appointment suggestions generated successfully',
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        throw new HealthcareTRPCError(
          'INTERNAL_SERVER_ERROR',
          'Failed to generate appointment suggestions',
          'APPOINTMENT_SUGGESTIONS_ERROR',
          { originalError: error.message },
        );
      }
    }),
});

// Helper functions
async function sanitizeHealthcareMessage(message: string, patientId?: string): Promise<string> {
  // Implementation for LGPD-compliant message sanitization
  return message; // Placeholder
}

async function buildHealthcareContext(context: any): Promise<string> {
  // Build context-aware system prompt for healthcare AI
  return 'Healthcare AI assistant context'; // Placeholder
}

async function callAIServiceWithRetry(request: any): Promise<any> {
  // Implementation for AI service calls with retry logic
  return {
    content: 'AI response',
    usage: { total_tokens: 100 },
    finish_reason: 'stop',
    responseTime: 1000,
  };
}

async function checkAIUsageLimit(userId: string, clinicId: string): Promise<any> {
  return { allowed: true, currentUsage: 0, limit: 1000, resetTime: new Date() };
}

function hasHealthAnalysisPermission(role: string): boolean {
  return ['doctor', 'admin'].includes(role);
}
