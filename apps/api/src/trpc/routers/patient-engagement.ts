import { PatientEngagementService } from '@neonpro/business-services'
import {
  CommunicationHistorySchema,
  CommunicationPreferencesSchema,
  CommunicationTemplateSchema,
  EngagementActionSchema,
  EngagementCampaignSchema,
  LoyaltyProgramSchema,
  PatientJourneyStageSchema,
  PatientSurveySchema,
  ReengagementTriggerSchema,
  SurveyResponseSchema,
} from '@neonpro/business-services'
import { createTRPCRouter } from '@trpc/server'
import { z } from 'zod'

// Success response schema
const SuccessResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  })

// Communication Preferences Schemas
const CommunicationPreferencesInputSchema = CommunicationPreferencesSchema.omit({
  patientId: true,
  clinicId: true,
}).extend({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
})

// Communication History Schemas
const CommunicationHistoryInputSchema = CommunicationHistorySchema.omit({
  patientId: true,
  clinicId: true,
}).extend({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
})

// Template Schemas
const CommunicationTemplateInputSchema = CommunicationTemplateSchema.omit({ clinicId: true })
  .extend({
    clinicId: z.string().uuid(),
  })

// Patient Journey Schemas
const PatientJourneyStageInputSchema = PatientJourneyStageSchema.omit({
  patientId: true,
  clinicId: true,
}).extend({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
})

// Engagement Action Schemas
const EngagementActionInputSchema = EngagementActionSchema.omit({ patientId: true, clinicId: true })
  .extend({
    patientId: z.string().uuid(),
    clinicId: z.string().uuid(),
  })

// Loyalty Program Schemas
const LoyaltyProgramInputSchema = LoyaltyProgramSchema.omit({ clinicId: true }).extend({
  clinicId: z.string().uuid(),
})

// Survey Schemas
const PatientSurveyInputSchema = PatientSurveySchema.omit({ clinicId: true }).extend({
  clinicId: z.string().uuid(),
})

const SurveyResponseInputSchema = SurveyResponseSchema.omit({ patientId: true }).extend({
  patientId: z.string().uuid(),
})

// Campaign Schemas
const EngagementCampaignInputSchema = EngagementCampaignSchema.omit({ clinicId: true }).extend({
  clinicId: z.string().uuid(),
})

// Reengagement Trigger Schemas
const ReengagementTriggerInputSchema = ReengagementTriggerSchema.omit({
  patientId: true,
  clinicId: true,
}).extend({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
})

export const patientEngagementRouter = createTRPCRouter({
  // Communication Preferences
  getCommunicationPreferences: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const preferences = await patientEngagementService.getCommunicationPreferences(
          input.patientId,
          input.clinicId,
        )

        return {
          success: true,
          message: 'Preferências de comunicação obtidas com sucesso',
          data: preferences,
        }
      } catch {
        console.error('Error getting communication preferences:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter preferências de comunicação',
          data: null,
        }
      }
    },
  },

  updateCommunicationPreferences: {
    input: CommunicationPreferencesInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const preferences = await patientEngagementService.updateCommunicationPreferences(input)

        return {
          success: true,
          message: 'Preferências de comunicação atualizadas com sucesso',
          data: preferences,
        }
      } catch {
        console.error('Error updating communication preferences:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao atualizar preferências de comunicação',
          data: null,
        }
      }
    },
  },

  // Communication History
  sendCommunication: {
    input: CommunicationHistoryInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const communication = await patientEngagementService.sendCommunication(input)

        return {
          success: true,
          message: 'Comunicação enviada com sucesso',
          data: communication,
        }
      } catch {
        console.error('Error sending communication:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao enviar comunicação',
          data: null,
        }
      }
    },
  },

  getCommunicationHistory: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const history = await patientEngagementService.getCommunicationHistory(
          input.patientId,
          input.clinicId,
          input.limit,
        )

        return {
          success: true,
          message: 'Histórico de comunicação obtido com sucesso',
          data: history,
        }
      } catch {
        console.error('Error getting communication history:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter histórico de comunicação',
          data: [],
        }
      }
    },
  },

  // Templates
  createTemplate: {
    input: CommunicationTemplateInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const template = await patientEngagementService.createTemplate(input)

        return {
          success: true,
          message: 'Template criado com sucesso',
          data: template,
        }
      } catch {
        console.error('Error creating template:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar template',
          data: null,
        }
      }
    },
  },

  getTemplatesByCategory: {
    input: z.object({
      clinicId: z.string().uuid(),
      category: z.enum([
        'appointment_reminder',
        'follow_up_care',
        'educational',
        'promotional',
        'survey',
        'birthday',
        'reengagement',
        'treatment_reminder',
      ]),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const templates = await patientEngagementService.getTemplatesByCategory(
          input.clinicId,
          input.category,
        )

        return {
          success: true,
          message: 'Templates obtidos com sucesso',
          data: templates,
        }
      } catch {
        console.error('Error getting templates:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter templates',
          data: [],
        }
      }
    },
  },

  // Patient Journey
  updatePatientJourneyStage: {
    input: PatientJourneyStageInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const journey = await patientEngagementService.updatePatientJourneyStage(input)

        return {
          success: true,
          message: 'Estágio da jornada do paciente atualizado com sucesso',
          data: journey,
        }
      } catch {
        console.error('Error updating patient journey stage:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao atualizar estágio da jornada do paciente',
          data: null,
        }
      }
    },
  },

  getPatientJourney: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const journey = await patientEngagementService.getPatientJourney(
          input.patientId,
          input.clinicId,
        )

        return {
          success: true,
          message: 'Jornada do paciente obtida com sucesso',
          data: journey,
        }
      } catch {
        console.error('Error getting patient journey:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter jornada do paciente',
          data: null,
        }
      }
    },
  },

  // Engagement Actions
  recordEngagementAction: {
    input: EngagementActionInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const action = await patientEngagementService.recordEngagementAction(input)

        return {
          success: true,
          message: 'Ação de engajamento registrada com sucesso',
          data: action,
        }
      } catch {
        console.error('Error recording engagement action:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao registrar ação de engajamento',
          data: null,
        }
      }
    },
  },

  getPatientEngagementActions: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const actions = await patientEngagementService.getPatientEngagementActions(
          input.patientId,
          input.clinicId,
          input.limit,
        )

        return {
          success: true,
          message: 'Ações de engajamento obtidas com sucesso',
          data: actions,
        }
      } catch {
        console.error('Error getting engagement actions:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter ações de engajamento',
          data: [],
        }
      }
    },
  },

  // Loyalty Programs
  createLoyaltyProgram: {
    input: LoyaltyProgramInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const program = await patientEngagementService.createLoyaltyProgram(input)

        return {
          success: true,
          message: 'Programa de fidelidade criado com sucesso',
          data: program,
        }
      } catch {
        console.error('Error creating loyalty program:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar programa de fidelidade',
          data: null,
        }
      }
    },
  },

  getLoyaltyPrograms: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const programs = await patientEngagementService.getLoyaltyPrograms(input.clinicId)

        return {
          success: true,
          message: 'Programas de fidelidade obtidos com sucesso',
          data: programs,
        }
      } catch {
        console.error('Error getting loyalty programs:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter programas de fidelidade',
          data: [],
        }
      }
    },
  },

  getPatientPointsBalance: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const balance = await patientEngagementService.getPatientPointsBalance(
          input.patientId,
          input.clinicId,
        )

        return {
          success: true,
          message: 'Saldo de pontos obtido com sucesso',
          data: balance,
        }
      } catch {
        console.error('Error getting patient points balance:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter saldo de pontos',
          data: null,
        }
      }
    },
  },

  updatePatientPoints: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      pointsToAdd: z.number(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const updatedBalance = await patientEngagementService.updatePatientPoints(
          input.patientId,
          input.clinicId,
          input.pointsToAdd,
        )

        return {
          success: true,
          message: 'Pontos do paciente atualizados com sucesso',
          data: updatedBalance,
        }
      } catch {
        console.error('Error updating patient points:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar pontos do paciente',
          data: null,
        }
      }
    },
  },

  // Surveys
  createSurvey: {
    input: PatientSurveyInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const survey = await patientEngagementService.createSurvey(input)

        return {
          success: true,
          message: 'Pesquisa criada com sucesso',
          data: survey,
        }
      } catch {
        console.error('Error creating survey:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar pesquisa',
          data: null,
        }
      }
    },
  },

  getSurveys: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const surveys = await patientEngagementService.getSurveys(input.clinicId)

        return {
          success: true,
          message: 'Pesquisas obtidas com sucesso',
          data: surveys,
        }
      } catch {
        console.error('Error getting surveys:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter pesquisas',
          data: [],
        }
      }
    },
  },

  submitSurveyResponse: {
    input: SurveyResponseInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const response = await patientEngagementService.submitSurveyResponse(input)

        return {
          success: true,
          message: 'Resposta da pesquisa enviada com sucesso',
          data: response,
        }
      } catch {
        console.error('Error submitting survey response:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao enviar resposta da pesquisa',
          data: null,
        }
      }
    },
  },

  // Campaigns
  createCampaign: {
    input: EngagementCampaignInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const campaign = await patientEngagementService.createCampaign(input)

        return {
          success: true,
          message: 'Campanha criada com sucesso',
          data: campaign,
        }
      } catch {
        console.error('Error creating campaign:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar campanha',
          data: null,
        }
      }
    },
  },

  getCampaigns: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const campaigns = await patientEngagementService.getCampaigns(input.clinicId)

        return {
          success: true,
          message: 'Campanhas obtidas com sucesso',
          data: campaigns,
        }
      } catch {
        console.error('Error getting campaigns:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter campanhas',
          data: [],
        }
      }
    },
  },

  // Reengagement Triggers
  createReengagementTrigger: {
    input: ReengagementTriggerInputSchema,
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const trigger = await patientEngagementService.createReengagementTrigger(input)

        return {
          success: true,
          message: 'Gatilho de reengajamento criado com sucesso',
          data: trigger,
        }
      } catch {
        console.error('Error creating reengagement trigger:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao criar gatilho de reengajamento',
          data: null,
        }
      }
    },
  },

  getReengagementTriggers: {
    input: z.object({
      clinicId: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).default('pending'),
    }),
    output: SuccessResponseSchema(z.array(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const triggers = await patientEngagementService.getReengagementTriggers(
          input.clinicId,
          input.status,
        )

        return {
          success: true,
          message: 'Gatilhos de reengajamento obtidos com sucesso',
          data: triggers,
        }
      } catch {
        console.error('Error getting reengagement triggers:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter gatilhos de reengajamento',
          data: [],
        }
      }
    },
  },

  updateReengagementTrigger: {
    input: z.object({
      triggerId: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
      actionTaken: z.string(),
      outcome: z.any(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const trigger = await patientEngagementService.updateReengagementTrigger(
          input.triggerId,
          input.status,
          input.actionTaken,
          input.outcome,
        )

        return {
          success: true,
          message: 'Gatilho de reengajamento atualizado com sucesso',
          data: trigger,
        }
      } catch {
        console.error('Error updating reengagement trigger:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao atualizar gatilho de reengajamento',
          data: null,
        }
      }
    },
  },

  // Analytics
  getEngagementAnalytics: {
    input: z.object({
      clinicId: z.string().uuid(),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const analytics = await patientEngagementService.getEngagementAnalytics(
          input.clinicId,
          input.dateRange,
        )

        return {
          success: true,
          message: 'Análise de engajamento obtida com sucesso',
          data: analytics,
        }
      } catch {
        console.error('Error getting engagement analytics:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter análise de engajamento',
          data: null,
        }
      }
    },
  },

  getPatientEngagementReport: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const report = await patientEngagementService.getPatientEngagementReport(
          input.patientId,
          input.clinicId,
        )

        return {
          success: true,
          message: 'Relatório de engajamento do paciente obtido com sucesso',
          data: report,
        }
      } catch {
        console.error('Error getting patient engagement report:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter relatório de engajamento do paciente',
          data: null,
        }
      }
    },
  },

  // Automated Workflows
  processAppointmentReminders: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const result = await patientEngagementService.processAppointmentReminders(input.clinicId)

        return {
          success: true,
          message: 'Lembretes de agendamento processados com sucesso',
          data: result,
        }
      } catch {
        console.error('Error processing appointment reminders:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao processar lembretes de agendamento',
          data: null,
        }
      }
    },
  },

  processFollowUpCommunications: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const result = await patientEngagementService.processFollowUpCommunications(input.clinicId)

        return {
          success: true,
          message: 'Comunicações de follow-up processadas com sucesso',
          data: result,
        }
      } catch {
        console.error('Error processing follow up communications:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao processar comunicações de follow-up',
          data: null,
        }
      }
    },
  },

  processBirthdayGreetings: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.any()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const result = await patientEngagementService.processBirthdayGreetings(input.clinicId)

        return {
          success: true,
          message: 'Saudações de aniversário processadas com sucesso',
          data: result,
        }
      } catch {
        console.error('Error processing birthday greetings:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao processar saudações de aniversário',
          data: null,
        }
      }
    },
  },

  // Template Processing
  processTemplate: {
    input: z.object({
      templateId: z.string().uuid(),
      variables: z.record(z.any()),
    }),
    output: SuccessResponseSchema(z.object({
      content: z.string(),
      subject: z.string().optional(),
    })),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const patientEngagementService = new PatientEngagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const processed = await patientEngagementService.processTemplate(
          input.templateId,
          input.variables,
        )

        return {
          success: true,
          message: 'Template processado com sucesso',
          data: processed,
        }
      } catch {
        console.error('Error processing template:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao processar template',
          data: null,
        }
      }
    },
  },
})
