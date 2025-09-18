/**
 * tRPC Contract: AI Router
 * Healthcare Domain: Conversational AI and Predictive Analytics
 * Portuguese Language: Native Brazilian healthcare communication
 */

import { z } from 'zod';
import { procedure, router } from '../trpc-setup';

/**
 * AI Router Contract
 * Focus: 24/7 patient engagement and predictive healthcare analytics
 */
export const aiRouter = router({

  /**
   * Conversational AI Chat
   * Language: Portuguese with healthcare terminology
   * Compliance: Patient data anonymization before AI processing
   */
  chat: procedure
    .input(z.object({
      message: z.string().min(1).max(2000),
      conversationId: z.string().optional(),
      patientContext: z.object({
        patientId: z.string().optional(), // Anonymized for AI
        medicalHistory: z.array(z.string()).optional(),
        currentSymptoms: z.array(z.string()).optional()
      }).optional(),
      aiProvider: z.enum(['OPENAI_GPT4', 'ANTHROPIC_CLAUDE']).default('OPENAI_GPT4')
    }))
    .output(z.object({
      response: z.string(),
      conversationId: z.string(),
      confidence: z.number().min(0).max(1),
      medicalRecommendations: z.array(z.object({
        type: z.enum(['SCHEDULE_APPOINTMENT', 'CONTACT_DOCTOR', 'EMERGENCY', 'SELF_CARE']),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        message: z.string(),
        actionRequired: z.boolean()
      })).optional(),
      costTracking: z.object({
        provider: z.string(),
        tokensUsed: z.number(),
        estimatedCost: z.number() // Cost optimization tracking
      })
    }))
    .mutation(),

  /**
   * No-Show Prediction Analytics
   * AI Model: Behavioral analysis for appointment attendance
   * Business Impact: Revenue protection through early intervention
   */
  predictNoShow: procedure
    .input(z.object({
      appointmentId: z.string(),
      patientFactors: z.object({
        age: z.number(),
        appointmentHistory: z.array(z.object({
          scheduled: z.date(),
          attended: z.boolean(),
          cancelledInAdvance: z.boolean()
        })),
        communicationPreferences: z.array(z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'PHONE'])),
        socioeconomicIndicators: z.object({
          neighborhood: z.string(),
          transportationAccess: z.enum(['PUBLIC', 'PRIVATE', 'LIMITED']),
          insuranceType: z.enum(['PRIVATE', 'SUS', 'MIXED'])
        }).optional()
      }),
      appointmentFactors: z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
        timeOfDay: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
        appointmentType: z.string(),
        doctorId: z.string(),
        advanceBookingDays: z.number()
      })
    }))
    .output(z.object({
      riskScore: z.number().min(0).max(1), // 0 = very likely to attend, 1 = very likely no-show
      riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      riskFactors: z.array(z.object({
        factor: z.string(),
        impact: z.number().min(-1).max(1), // Negative = reduces risk, Positive = increases risk
        confidence: z.number().min(0).max(1)
      })),
      interventionRecommendations: z.array(z.object({
        strategy: z.enum(['REMINDER_INCREASE', 'INCENTIVE_OFFER', 'APPOINTMENT_RESCHEDULE', 'PERSONAL_CONTACT']),
        expectedImpact: z.number().min(0).max(1), // Expected risk reduction
        cost: z.number(), // Implementation cost in BRL
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
      })),
      modelMetadata: z.object({
        version: z.string(),
        trainingDate: z.date(),
        accuracy: z.number().min(0).max(1),
        dataPoints: z.number()
      })
    }))
    .query(),

  /**
   * Healthcare Insights Generation
   * Analytics: Pattern recognition in patient data
   * Compliance: LGPD-compliant data analysis
   */
  generateInsights: procedure
    .input(z.object({
      analysisType: z.enum([
        'APPOINTMENT_PATTERNS',
        'PATIENT_SATISFACTION',
        'REVENUE_OPTIMIZATION',
        'OPERATIONAL_EFFICIENCY',
        'MEDICAL_OUTCOMES'
      ]),
      timeRange: z.object({
        startDate: z.date(),
        endDate: z.date()
      }),
      filters: z.object({
        doctorIds: z.array(z.string()).optional(),
        patientAgeGroups: z.array(z.string()).optional(),
        appointmentTypes: z.array(z.string()).optional()
      }).optional(),
      aggregationLevel: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY')
    }))
    .output(z.object({
      insights: z.array(z.object({
        title: z.string(),
        description: z.string(),
        impact: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
        confidence: z.number().min(0).max(1),
        recommendations: z.array(z.string()),
        dataVisualization: z.object({
          chartType: z.enum(['LINE', 'BAR', 'PIE', 'SCATTER']),
          data: z.array(z.object({
            label: z.string(),
            value: z.number(),
            metadata: z.record(z.unknown()).optional()
          }))
        }).optional()
      })),
      summary: z.object({
        totalInsights: z.number(),
        criticalFindings: z.number(),
        potentialSavings: z.number(), // BRL
        recommendedActions: z.array(z.string())
      })
    }))
    .query(),

  /**
   * AI Cost Optimization
   * Multi-Provider: Intelligent routing between OpenAI and Anthropic
   * Performance: <2s response time requirement
   */
  optimizeAiUsage: procedure
    .input(z.object({
      analysisType: z.enum(['COST_ANALYSIS', 'PERFORMANCE_OPTIMIZATION', 'PROVIDER_COMPARISON']),
      timeRange: z.object({
        startDate: z.date(),
        endDate: z.date()
      })
    }))
    .output(z.object({
      currentUsage: z.object({
        openaiCosts: z.number(),
        anthropicCosts: z.number(),
        totalRequests: z.number(),
        averageResponseTime: z.number()
      }),
      optimization: z.object({
        recommendedProvider: z.enum(['OPENAI_GPT4', 'ANTHROPIC_CLAUDE']),
        potentialSavings: z.number(),
        qualityImpact: z.enum(['IMPROVED', 'MAINTAINED', 'REDUCED']),
        implementationSteps: z.array(z.string())
      }),
      providerComparison: z.array(z.object({
        provider: z.string(),
        costPerRequest: z.number(),
        averageQuality: z.number().min(0).max(1),
        averageResponseTime: z.number(),
        healthcareAccuracy: z.number().min(0).max(1)
      }))
    }))
    .query()

});

export type AiRouter = typeof aiRouter;