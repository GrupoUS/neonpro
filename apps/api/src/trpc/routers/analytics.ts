/**
 * Advanced Analytics and Business Intelligence tRPC Router
 * Comprehensive analytics endpoints for aesthetic clinic business intelligence
 */

import {
  AnalyticsConfigurationSchema,
  CreateAnalyticsConfigurationInput,
  DeleteAnalyticsConfigurationInput,
  UpdateAnalyticsConfigurationInput,
} from '@neonpro/observability'
import { router } from '../trpc'
import { SuccessResponseSchema } from '../utils/response-schemas'

// Create the analytics router
export const analyticsRouter = router({
  // Analytics Configuration Management
  createAnalyticsConfiguration: {
    input: CreateAnalyticsConfigurationInput,
    output: SuccessResponseSchema(AnalyticsConfigurationSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const configuration = await analyticsService.createAnalyticsConfiguration(
          input as CreateAnalyticsConfigurationInput,
        )

        return {
          success: true,
          message: 'Configuração de analytics criada com sucesso',
          data: configuration,
        }
      } catch (error) {
        console.error('Error creating analytics configuration:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao criar configuração de analytics',
          data: null,
        }
      }
    },
  },

  updateAnalyticsConfiguration: {
    input: UpdateAnalyticsConfigurationInput,
    output: SuccessResponseSchema(AnalyticsConfigurationSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const configuration = await analyticsService.updateAnalyticsConfiguration(
          input.id,
          input.configuration as UpdateAnalyticsConfigurationInput,
        )

        return {
          success: true,
          message: 'Configuração de analytics atualizada com sucesso',
          data: configuration,
        }
      } catch (error) {
        console.error('Error updating analytics configuration:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao atualizar configuração de analytics',
          data: null,
        }
      }
    },
  },

  deleteAnalyticsConfiguration: {
    input: DeleteAnalyticsConfigurationInput,
    output: SuccessResponseSchema(AnalyticsConfigurationSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const configuration = await analyticsService.deleteAnalyticsConfiguration(
          input.id,
        )

        return {
          success: true,
          message: 'Configuração de analytics deletada com sucesso',
          data: configuration,
        }
      } catch (error) {
        console.error('Error deleting analytics configuration:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao deletar configuração de analytics',
          data: null,
        }
      }
    },
  },
})
