import { treatmentPlanningService } from '@neonpro/business-services'
import {
  CreateTreatmentAssessmentInput,
  CreateTreatmentDocumentInput,
  CreateTreatmentOutcomeInput,
  CreateTreatmentPlanInput,
  CreateTreatmentProcedureInput,
  CreateTreatmentProgressInput,
  CreateTreatmentRecommendationInput,
  CreateTreatmentSessionInput,
  UpdateTreatmentPlanInput,
  UpdateTreatmentSessionInput,
} from '@neonpro/types'
import { createTRPCRouter } from '@trpc/server'
import { z } from 'zod'

export const treatmentPlanningRouter = createTRPCRouter({
  // Treatment Plan CRUD
  createTreatmentPlan: {
    input: CreateTreatmentPlanInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const treatmentPlan = await service.createTreatmentPlan({
          ...input,
          clinic_id: ctx.clinic.id,
        })

        return {
          success: true,
          message: 'Plano de tratamento criado com sucesso',
          data: treatmentPlan,
        }
      } catch {
        console.error('Error creating treatment plan:', error)
        return {
          success: false,
          message: 'Erro ao criar plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentPlanById: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const treatmentPlan = await service.getTreatmentPlanById(input.id)

        if (!treatmentPlan) {
          return {
            success: false,
            message: 'Plano de tratamento não encontrado',
          }
        }

        return {
          success: true,
          message: 'Plano de tratamento encontrado',
          data: treatmentPlan,
        }
      } catch {
        console.error('Error getting treatment plan:', error)
        return {
          success: false,
          message: 'Erro ao buscar plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentPlansByClinic: {
    input: z.object({
      patientId: z.string().uuid().optional(),
      professionalId: z.string().uuid().optional(),
      status: z.string().optional(),
      priorityLevel: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const filters: any = {}

        if (input.patientId) filters.patientId = input.patientId
        if (input.professionalId) filters.professionalId = input.professionalId
        if (input.status) filters.status = input.status
        if (input.priorityLevel) filters.priorityLevel = input.priorityLevel

        if (input.startDate && input.endDate) {
          filters.dateRange = {
            start: new Date(input.startDate),
            end: new Date(input.endDate),
          }
        }

        const treatmentPlans = await service.getTreatmentPlansByClinic(ctx.clinic.id, filters)

        return {
          success: true,
          message: 'Planos de tratamento encontrados',
          data: treatmentPlans,
        }
      } catch {
        console.error('Error getting treatment plans:', error)
        return {
          success: false,
          message: 'Erro ao buscar planos de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  updateTreatmentPlan: {
    input: UpdateTreatmentPlanInput.extend({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const { id, ...updateData } = input
        const treatmentPlan = await service.updateTreatmentPlan(id, updateData)

        return {
          success: true,
          message: 'Plano de tratamento atualizado com sucesso',
          data: treatmentPlan,
        }
      } catch {
        console.error('Error updating treatment plan:', error)
        return {
          success: false,
          message: 'Erro ao atualizar plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  deleteTreatmentPlan: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const { error } = await ctx.supabase
          .from('treatment_plans')
          .delete()
          .eq('id', input.id)

        if (error) {
          throw new Error(error.message)
        }

        return {
          success: true,
          message: 'Plano de tratamento excluído com sucesso',
        }
      } catch {
        console.error('Error deleting treatment plan:', error)
        return {
          success: false,
          message: 'Erro ao excluir plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Treatment Session Management
  createTreatmentSession: {
    input: CreateTreatmentSessionInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const session = await service.createTreatmentSession({
          ...input,
          professional_id: ctx.user.id,
        })

        return {
          success: true,
          message: 'Sessão de tratamento criada com sucesso',
          data: session,
        }
      } catch {
        console.error('Error creating treatment session:', error)
        return {
          success: false,
          message: 'Erro ao criar sessão de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentSessionsByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const sessions = await service.getTreatmentSessionsByPlan(input.treatmentPlanId)

        return {
          success: true,
          message: 'Sessões de tratamento encontradas',
          data: sessions,
        }
      } catch {
        console.error('Error getting treatment sessions:', error)
        return {
          success: false,
          message: 'Erro ao buscar sessões de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  updateTreatmentSession: {
    input: UpdateTreatmentSessionInput.extend({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const { id, ...updateData } = input
        const session = await service.updateTreatmentSession(id, updateData)

        return {
          success: true,
          message: 'Sessão de tratamento atualizada com sucesso',
          data: session,
        }
      } catch {
        console.error('Error updating treatment session:', error)
        return {
          success: false,
          message: 'Erro ao atualizar sessão de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  deleteTreatmentSession: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const { error } = await ctx.supabase
          .from('treatment_sessions')
          .delete()
          .eq('id', input.id)

        if (error) {
          throw new Error(error.message)
        }

        return {
          success: true,
          message: 'Sessão de tratamento excluída com sucesso',
        }
      } catch {
        console.error('Error deleting treatment session:', error)
        return {
          success: false,
          message: 'Erro ao excluir sessão de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Treatment Procedure Management
  createTreatmentProcedure: {
    input: CreateTreatmentProcedureInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const procedure = await service.createTreatmentProcedure(input)

        return {
          success: true,
          message: 'Procedimento de tratamento criado com sucesso',
          data: procedure,
        }
      } catch {
        console.error('Error creating treatment procedure:', error)
        return {
          success: false,
          message: 'Erro ao criar procedimento de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentProceduresByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const procedures = await service.getTreatmentProceduresByPlan(input.treatmentPlanId)

        return {
          success: true,
          message: 'Procedimentos de tratamento encontrados',
          data: procedures,
        }
      } catch {
        console.error('Error getting treatment procedures:', error)
        return {
          success: false,
          message: 'Erro ao buscar procedimentos de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Assessment Management
  createTreatmentAssessment: {
    input: CreateTreatmentAssessmentInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const assessment = await service.createTreatmentAssessment({
          ...input,
          assessor_id: ctx.user.id,
        })

        return {
          success: true,
          message: 'Avaliação de tratamento criada com sucesso',
          data: assessment,
        }
      } catch {
        console.error('Error creating treatment assessment:', error)
        return {
          success: false,
          message: 'Erro ao criar avaliação de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentAssessmentsByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const assessments = await service.getTreatmentAssessmentsByPlan(input.treatmentPlanId)

        return {
          success: true,
          message: 'Avaliações de tratamento encontradas',
          data: assessments,
        }
      } catch {
        console.error('Error getting treatment assessments:', error)
        return {
          success: false,
          message: 'Erro ao buscar avaliações de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Progress Tracking
  createTreatmentProgress: {
    input: CreateTreatmentProgressInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const progress = await service.createTreatmentProgress({
          ...input,
          tracked_by: ctx.user.id,
        })

        return {
          success: true,
          message: 'Registro de progresso criado com sucesso',
          data: progress,
        }
      } catch {
        console.error('Error creating treatment progress:', error)
        return {
          success: false,
          message: 'Erro ao criar registro de progresso',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentProgressByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const progress = await service.getTreatmentProgressByPlan(input.treatmentPlanId)

        return {
          success: true,
          message: 'Registros de progresso encontrados',
          data: progress,
        }
      } catch {
        console.error('Error getting treatment progress:', error)
        return {
          success: false,
          message: 'Erro ao buscar registros de progresso',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // AI Recommendations
  createTreatmentRecommendation: {
    input: CreateTreatmentRecommendationInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const recommendation = await service.createTreatmentRecommendation(input)

        return {
          success: true,
          message: 'Recomendação de tratamento criada com sucesso',
          data: recommendation,
        }
      } catch {
        console.error('Error creating treatment recommendation:', error)
        return {
          success: false,
          message: 'Erro ao criar recomendação de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentRecommendationsByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const recommendations = await service.getTreatmentRecommendationsByPlan(
          input.treatmentPlanId,
        )

        return {
          success: true,
          message: 'Recomendações de tratamento encontradas',
          data: recommendations,
        }
      } catch {
        console.error('Error getting treatment recommendations:', error)
        return {
          success: false,
          message: 'Erro ao buscar recomendações de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  acceptTreatmentRecommendation: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        await service.acceptTreatmentRecommendation(input.id, ctx.user.id)

        return {
          success: true,
          message: 'Recomendação aceita com sucesso',
        }
      } catch {
        console.error('Error accepting treatment recommendation:', error)
        return {
          success: false,
          message: 'Erro ao aceitar recomendação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  rejectTreatmentRecommendation: {
    input: z.object({
      id: z.string().uuid(),
      reason: z.string(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        await service.rejectTreatmentRecommendation(input.id, input.reason)

        return {
          success: true,
          message: 'Recomendação rejeitada com sucesso',
        }
      } catch {
        console.error('Error rejecting treatment recommendation:', error)
        return {
          success: false,
          message: 'Erro ao rejeitar recomendação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Document Management
  createTreatmentDocument: {
    input: CreateTreatmentDocumentInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const document = await service.createTreatmentDocument({
          ...input,
          created_by: ctx.user.id,
        })

        return {
          success: true,
          message: 'Documento de tratamento criado com sucesso',
          data: document,
        }
      } catch {
        console.error('Error creating treatment document:', error)
        return {
          success: false,
          message: 'Erro ao criar documento de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentDocumentsByPlan: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const documents = await service.getTreatmentDocumentsByPlan(input.treatmentPlanId)

        return {
          success: true,
          message: 'Documentos de tratamento encontrados',
          data: documents,
        }
      } catch {
        console.error('Error getting treatment documents:', error)
        return {
          success: false,
          message: 'Erro ao buscar documentos de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  signTreatmentDocument: {
    input: z.object({
      id: z.string().uuid(),
      patientSignatureData: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const { error } = await ctx.supabase
          .from('treatment_documents')
          .update({
            status: 'signed',
            signed_by: ctx.user.id,
            signed_at: new Date().toISOString(),
            patient_signature_data: input.patientSignatureData,
            patient_signed_at: input.patientSignatureData ? new Date().toISOString() : null,
          })
          .eq('id', input.id)

        if (error) {
          throw new Error(error.message)
        }

        return {
          success: true,
          message: 'Documento assinado com sucesso',
        }
      } catch {
        console.error('Error signing treatment document:', error)
        return {
          success: false,
          message: 'Erro ao assinar documento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Treatment Outcomes
  createTreatmentOutcome: {
    input: CreateTreatmentOutcomeInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const outcome = await service.createTreatmentOutcome({
          ...input,
          created_by: ctx.user.id,
        })

        return {
          success: true,
          message: 'Registro de resultado criado com sucesso',
          data: outcome,
        }
      } catch {
        console.error('Error creating treatment outcome:', error)
        return {
          success: false,
          message: 'Erro ao criar registro de resultado',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Templates
  getAssessmentTemplates: {
    input: z.object({
      procedureType: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const templates = await service.getAssessmentTemplates(input)

        return {
          success: true,
          message: 'Templates de avaliação encontrados',
          data: templates,
        }
      } catch {
        console.error('Error getting assessment templates:', error)
        return {
          success: false,
          message: 'Erro ao buscar templates de avaliação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getDocumentationTemplates: {
    input: z.object({
      procedureType: z.string().optional(),
      templateType: z.string().optional(),
      isRequired: z.boolean().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const templates = await service.getDocumentationTemplates(input)

        return {
          success: true,
          message: 'Templates de documentação encontrados',
          data: templates,
        }
      } catch {
        console.error('Error getting documentation templates:', error)
        return {
          success: false,
          message: 'Erro ao buscar templates de documentação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Statistics and Analytics
  getTreatmentPlanStats: {
    input: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const dateRange = input.startDate && input.endDate
          ? {
            start: new Date(input.startDate),
            end: new Date(input.endDate),
          }
          : undefined

        const stats = await service.getTreatmentPlanStats(ctx.clinic.id, dateRange)

        return {
          success: true,
          message: 'Estatísticas de planos de tratamento encontradas',
          data: stats,
        }
      } catch {
        console.error('Error getting treatment plan stats:', error)
        return {
          success: false,
          message: 'Erro ao buscar estatísticas de planos de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentSessionStats: {
    input: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const dateRange = input.startDate && input.endDate
          ? {
            start: new Date(input.startDate),
            end: new Date(input.endDate),
          }
          : undefined

        const stats = await service.getTreatmentSessionStats(ctx.clinic.id, dateRange)

        return {
          success: true,
          message: 'Estatísticas de sessões de tratamento encontradas',
          data: stats,
        }
      } catch {
        console.error('Error getting treatment session stats:', error)
        return {
          success: false,
          message: 'Erro ao buscar estatísticas de sessões de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getTreatmentProgressSummary: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const summary = await service.getTreatmentProgressSummary(input.treatmentPlanId)

        return {
          success: true,
          message: 'Resumo de progresso de tratamento encontrado',
          data: summary,
        }
      } catch {
        console.error('Error getting treatment progress summary:', error)
        return {
          success: false,
          message: 'Erro ao buscar resumo de progresso de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Advanced Features
  generateTreatmentPlanSummary: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const summary = await service.generateTreatmentPlanSummary(input.treatmentPlanId)

        return {
          success: true,
          message: 'Resumo do plano de tratamento gerado com sucesso',
          data: { summary },
        }
      } catch {
        console.error('Error generating treatment plan summary:', error)
        return {
          success: false,
          message: 'Erro ao gerar resumo do plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  checkTreatmentPlanCompliance: {
    input: z.object({
      treatmentPlanId: z.string().uuid(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const service = new treatmentPlanningService(ctx.supabase)
        const compliance = await service.checkTreatmentPlanCompliance(input.treatmentPlanId)

        return {
          success: true,
          message: 'Verificação de conformidade concluída',
          data: compliance,
        }
      } catch {
        console.error('Error checking treatment plan compliance:', error)
        return {
          success: false,
          message: 'Erro ao verificar conformidade do plano de tratamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },
})
