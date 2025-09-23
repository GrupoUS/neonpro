/**
 * Advanced Analytics and Business Intelligence tRPC Router
 * Comprehensive analytics endpoints for aesthetic clinic business intelligence
 */

import { createTRPCRouter } from '@trpc/server';
import { z } from 'zod';
import { 
  AnalyticsService,
  type CreateAnalyticsConfigurationInput,
  type UpdateAnalyticsConfigurationInput,
  type CreateKPIDefinitionInput,
  type UpdateKPIDefinitionInput,
  type CreateBIDashboardInput,
  type UpdateBIDashboardInput,
  type CreateDashboardWidgetInput,
  type UpdateDashboardWidgetInput,
  type CreateScheduledReportInput,
  type UpdateScheduledReportInput,
  type CreatePredictiveModelInput,
  type UpdatePredictiveModelInput,
  type CreateAnalyticsAlertInput,
  type UpdateAnalyticsAlertInput,
  type AnalyticsQueryInput,
  type DashboardQueryInput,
  type ReportQueryInput,
  type PredictiveQueryInput,
  type AlertQueryInput,
  type PerformanceMetricsQueryInput,
  type DataExportInput,
} from '@neonpro/core-services';
import { SuccessResponseSchema } from '../utils/response-schemas';

// Schema definitions for validation
const CreateAnalyticsConfigurationInputSchema = z.object({
  clinicId: z.string().uuid(),
  configType: z.enum(['dashboard', 'report', 'metric', 'alert', 'forecast']),
  name: z.string().min(1).max(100),
  configuration: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

const UpdateAnalyticsConfigurationInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const CreateKPIDefinitionInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['financial', 'clinical', 'operational', 'patient', 'inventory', 'compliance']),
  calculationFormula: z.string().min(1),
  unit: z.string().max(20).optional(),
  targetValue: z.number().optional(),
  benchmarkValue: z.number().optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional().default('sum'),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional().default('daily'),
  isActive: z.boolean().optional().default(true),
});

const UpdateKPIDefinitionInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  calculationFormula: z.string().min(1).optional(),
  unit: z.string().max(20).optional(),
  targetValue: z.number().optional(),
  benchmarkValue: z.number().optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  isActive: z.boolean().optional(),
});

const CreateBIDashboardInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  layoutConfig: z.record(z.any()).optional().default({}),
  isPublic: z.boolean().optional().default(false),
  isTemplate: z.boolean().optional().default(false),
});

const UpdateBIDashboardInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  layoutConfig: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
});

const CreateDashboardWidgetInputSchema = z.object({
  dashboardId: z.string().uuid(),
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']),
  title: z.string().min(1).max(100),
  dataSource: z.string().min(1).max(50),
  configuration: z.record(z.any()).optional().default({}),
  positionX: z.number().int().min(0).optional().default(0),
  positionY: z.number().int().min(0).optional().default(0),
  width: z.number().int().min(1).max(12).optional().default(4),
  height: z.number().int().min(1).max(12).optional().default(3),
  refreshInterval: z.number().int().min(30).max(3600).optional().default(300),
});

const UpdateDashboardWidgetInputSchema = z.object({
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']).optional(),
  title: z.string().min(1).max(100).optional(),
  dataSource: z.string().min(1).max(50).optional(),
  configuration: z.record(z.any()).optional(),
  positionX: z.number().int().min(0).optional(),
  positionY: z.number().int().min(0).optional(),
  width: z.number().int().min(1).max(12).optional(),
  height: z.number().int().min(1).max(12).optional(),
  refreshInterval: z.number().int().min(30).max(3600).optional(),
});

const CreateScheduledReportInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']),
  scheduleConfig: z.record(z.any()),
  recipients: z.array(z.string().email()),
  format: z.enum(['pdf', 'excel', 'csv', 'html']).optional().default('pdf'),
  isActive: z.boolean().optional().default(true),
});

const UpdateScheduledReportInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']).optional(),
  scheduleConfig: z.record(z.any()).optional(),
  recipients: z.array(z.string().email()).optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'html']).optional(),
  isActive: z.boolean().optional(),
});

const CreatePredictiveModelInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  modelType: z.enum(['no_show_prediction', 'revenue_forecast', 'inventory_demand', 'patient_retention', 'treatment_outcome']),
  modelConfig: z.record(z.any()),
  trainingDataConfig: z.record(z.any()),
  accuracyScore: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional().default(true),
});

const UpdatePredictiveModelInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  modelConfig: z.record(z.any()).optional(),
  trainingDataConfig: z.record(z.any).optional(),
  accuracyScore: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

const CreateAnalyticsAlertInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']),
  conditionConfig: z.record(z.any()),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  recipients: z.array(z.string().email()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

const UpdateAnalyticsAlertInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']).optional(),
  conditionConfig: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  recipients: z.array(z.string().email()).optional(),
  isActive: z.boolean().optional(),
});

const AnalyticsQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  metricName: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dimensions: z.array(z.string()).optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
});

const DashboardQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  dashboardId: z.string().uuid().optional(),
  isTemplate: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional(),
});

const ReportQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  reportType: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional(),
});

const PredictiveQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  modelType: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional(),
});

const AlertQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  alertType: z.string().optional(),
  severity: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional(),
});

const PerformanceMetricsQueryInputSchema = z.object({
  clinicId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  metrics: z.array(z.string()).optional(),
});

const DataExportInputSchema = z.object({
  clinicId: z.string().uuid(),
  requestType: z.enum(['analytics', 'raw_data', 'report', 'custom']),
  filters: z.record(z.any()).optional().default({}),
  format: z.enum(['csv', 'excel', 'json', 'parquet']).optional().default('csv'),
});

const KpiCalculationInputSchema = z.object({
  clinicId: z.string().uuid(),
  kpiName: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const ComparativeAnalysisInputSchema = z.object({
  clinicId: z.string().uuid(),
  comparisonType: z.enum(['period_over_period', 'year_over_year', 'benchmark', 'competitor']),
  baselinePeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  comparisonPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

const TrackEventInputSchema = z.object({
  clinicId: z.string().uuid(),
  eventType: z.string().min(1),
  eventData: z.record(z.any()).optional().default({}),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

const _PredictionInputSchema = z.object({
  patientId: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  appointmentDate: z.string().datetime().optional(),
  productId: z.string().uuid().optional(),
  forecastDays: z.number().int().min(1).max(365).optional().default(30),
});

// Response schemas
const AnalyticsConfigurationSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  configType: z.enum(['dashboard', 'report', 'metric', 'alert', 'forecast']),
  name: z.string(),
  configuration: z.record(z.any()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const KPIDefinitionSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.enum(['financial', 'clinical', 'operational', 'patient', 'inventory', 'compliance']),
  calculationFormula: z.string(),
  unit: z.string().nullable(),
  targetValue: z.number().nullable(),
  benchmarkValue: z.number().nullable(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const BIDashboardSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  layoutConfig: z.record(z.any()),
  isPublic: z.boolean(),
  isTemplate: z.boolean(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const DashboardWidgetSchema = z.object({
  id: z.string().uuid(),
  dashboardId: z.string().uuid(),
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']),
  title: z.string(),
  dataSource: z.string(),
  configuration: z.record(z.any()),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  refreshInterval: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const ScheduledReportSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']),
  scheduleConfig: z.record(z.any()),
  recipients: z.array(z.string()),
  format: z.enum(['pdf', 'excel', 'csv', 'html']),
  isActive: z.boolean(),
  lastRunAt: z.string().datetime().nullable(),
  nextRunAt: z.string().datetime().nullable(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const PredictiveModelSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  modelType: z.enum(['no_show_prediction', 'revenue_forecast', 'inventory_demand', 'patient_retention', 'treatment_outcome']),
  modelConfig: z.record(z.any),
  trainingDataConfig: z.record(z.any),
  accuracyScore: z.number().nullable(),
  isActive: z.boolean(),
  lastTrainedAt: z.string().datetime().nullable(),
  nextTrainingAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const AnalyticsAlertSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']),
  conditionConfig: z.record(z.any),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  recipients: z.array(z.string()),
  isActive: z.boolean(),
  lastTriggeredAt: z.string().datetime().nullable(),
  triggerCount: z.number(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const PerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  metricDate: z.string().datetime(),
  metricHour: z.number().nullable(),
  revenueTotal: z.number(),
  revenueTreatments: z.number(),
  revenueProducts: z.number(),
  appointmentCount: z.number(),
  newPatients: z.number(),
  patientRetentionRate: z.number(),
  treatmentSuccessRate: z.number(),
  inventoryTurnover: z.number(),
  professionalUtilization: z.number(),
  patientSatisfactionScore: z.number(),
  noShowRate: z.number(),
  createdAt: z.string().datetime(),
});

const ComparativeAnalyticsSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  comparisonType: z.enum(['period_over_period', 'year_over_year', 'benchmark', 'competitor']),
  baselinePeriod: z.record(z.any),
  comparisonPeriod: z.record(z.any),
  metrics: z.record(z.any),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

// Create the analytics router
export const analyticsRouter = createTRPCRouter({
  // Analytics Configuration Management
  createAnalyticsConfiguration: {
    input: CreateAnalyticsConfigurationInputSchema,
    output: SuccessResponseSchema(AnalyticsConfigurationSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const configuration = await analyticsService.createAnalyticsConfiguration(input as CreateAnalyticsConfigurationInput);

        return {
          success: true,
          message: 'Configuração de analytics criada com sucesso',
          data: configuration,
        };
      } catch {
        console.error('Error creating analytics configuration:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar configuração de analytics',
          data: null,
        };
      }
    },
  },

  updateAnalyticsConfiguration: {
    input: z.object({
      id: z.string().uuid(),
      configuration: UpdateAnalyticsConfigurationInputSchema,
    }),
    output: SuccessResponseSchema(AnalyticsConfigurationSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const configuration = await analyticsService.updateAnalyticsConfiguration(
          input.id,
          input.configuration as UpdateAnalyticsConfigurationInput
        );

        return {
          success: true,
          message: 'Configuração de analytics atualizada com sucesso',
          data: configuration,
        };
      } catch {
        console.error('Error updating analytics configuration:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar configuração de analytics',
          data: null,
        };
      }
    },
  },

  deleteAnalyticsConfiguration: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteAnalyticsConfiguration(input.id);

        return {
          success: true,
          message: 'Configuração de analytics excluída com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting analytics configuration:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir configuração de analytics',
          data: false,
        };
      }
    },
  },

  getAnalyticsConfigurations: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(AnalyticsConfigurationSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const configurations = await analyticsService.getAnalyticsConfigurations(input.clinicId);

        return {
          success: true,
          message: 'Configurações de analytics recuperadas com sucesso',
          data: configurations,
        };
      } catch {
        console.error('Error getting analytics configurations:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar configurações de analytics',
          data: [],
        };
      }
    },
  },

  // KPI Management
  createKPIDefinition: {
    input: CreateKPIDefinitionInputSchema,
    output: SuccessResponseSchema(KPIDefinitionSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const kpi = await analyticsService.createKPIDefinition(input as CreateKPIDefinitionInput);

        return {
          success: true,
          message: 'KPI criada com sucesso',
          data: kpi,
        };
      } catch {
        console.error('Error creating KPI definition:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar KPI',
          data: null,
        };
      }
    },
  },

  updateKPIDefinition: {
    input: z.object({
      id: z.string().uuid(),
      kpi: UpdateKPIDefinitionInputSchema,
    }),
    output: SuccessResponseSchema(KPIDefinitionSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const kpi = await analyticsService.updateKPIDefinition(
          input.id,
          input.kpi as UpdateKPIDefinitionInput
        );

        return {
          success: true,
          message: 'KPI atualizada com sucesso',
          data: kpi,
        };
      } catch {
        console.error('Error updating KPI definition:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar KPI',
          data: null,
        };
      }
    },
  },

  deleteKPIDefinition: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteKPIDefinition(input.id);

        return {
          success: true,
          message: 'KPI excluída com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting KPI definition:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir KPI',
          data: false,
        };
      }
    },
  },

  getKPIDefinitions: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(KPIDefinitionSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const kpis = await analyticsService.getKPIDefinitions(input.clinicId);

        return {
          success: true,
          message: 'KPIs recuperadas com sucesso',
          data: kpis,
        };
      } catch {
        console.error('Error getting KPI definitions:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar KPIs',
          data: [],
        };
      }
    },
  },

  calculateKPIValue: {
    input: KpiCalculationInputSchema,
    output: SuccessResponseSchema(z.number()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const value = await analyticsService.calculateKPIValue(
          input.clinicId,
          input.kpiName,
          input.startDate,
          input.endDate
        );

        return {
          success: true,
          message: 'Valor da KPI calculado com sucesso',
          data: value,
        };
      } catch {
        console.error('Error calculating KPI value:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao calcular valor da KPI',
          data: 0,
        };
      }
    },
  },

  // BI Dashboards
  createBIDashboard: {
    input: CreateBIDashboardInputSchema,
    output: SuccessResponseSchema(BIDashboardSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const dashboard = await analyticsService.createBIDashboard(input as CreateBIDashboardInput);

        return {
          success: true,
          message: 'Dashboard criado com sucesso',
          data: dashboard,
        };
      } catch {
        console.error('Error creating BI dashboard:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar dashboard',
          data: null,
        };
      }
    },
  },

  updateBIDashboard: {
    input: z.object({
      id: z.string().uuid(),
      dashboard: UpdateBIDashboardInputSchema,
    }),
    output: SuccessResponseSchema(BIDashboardSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const dashboard = await analyticsService.updateBIDashboard(
          input.id,
          input.dashboard as UpdateBIDashboardInput
        );

        return {
          success: true,
          message: 'Dashboard atualizado com sucesso',
          data: dashboard,
        };
      } catch {
        console.error('Error updating BI dashboard:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar dashboard',
          data: null,
        };
      }
    },
  },

  deleteBIDashboard: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteBIDashboard(input.id);

        return {
          success: true,
          message: 'Dashboard excluído com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting BI dashboard:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir dashboard',
          data: false,
        };
      }
    },
  },

  getBIDashboards: {
    input: DashboardQueryInputSchema,
    output: SuccessResponseSchema(z.array(BIDashboardSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const dashboards = await analyticsService.getBIDashboards(input as DashboardQueryInput);

        return {
          success: true,
          message: 'Dashboards recuperados com sucesso',
          data: dashboards,
        };
      } catch {
        console.error('Error getting BI dashboards:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar dashboards',
          data: [],
        };
      }
    },
  },

  getBIDashboardById: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(BIDashboardSchema.nullable()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const dashboard = await analyticsService.getBIDashboardById(input.id);

        return {
          success: true,
          message: 'Dashboard recuperado com sucesso',
          data: dashboard,
        };
      } catch {
        console.error('Error getting BI dashboard by ID:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar dashboard',
          data: null,
        };
      }
    },
  },

  // Dashboard Widgets
  createDashboardWidget: {
    input: CreateDashboardWidgetInputSchema,
    output: SuccessResponseSchema(DashboardWidgetSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const widget = await analyticsService.createDashboardWidget(input as CreateDashboardWidgetInput);

        return {
          success: true,
          message: 'Widget criado com sucesso',
          data: widget,
        };
      } catch {
        console.error('Error creating dashboard widget:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar widget',
          data: null,
        };
      }
    },
  },

  updateDashboardWidget: {
    input: z.object({
      id: z.string().uuid(),
      widget: UpdateDashboardWidgetInputSchema,
    }),
    output: SuccessResponseSchema(DashboardWidgetSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const widget = await analyticsService.updateDashboardWidget(
          input.id,
          input.widget as UpdateDashboardWidgetInput
        );

        return {
          success: true,
          message: 'Widget atualizado com sucesso',
          data: widget,
        };
      } catch {
        console.error('Error updating dashboard widget:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar widget',
          data: null,
        };
      }
    },
  },

  deleteDashboardWidget: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteDashboardWidget(input.id);

        return {
          success: true,
          message: 'Widget excluído com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting dashboard widget:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir widget',
          data: false,
        };
      }
    },
  },

  getDashboardWidgets: {
    input: z.object({
      dashboardId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(DashboardWidgetSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const widgets = await analyticsService.getDashboardWidgets(input.dashboardId);

        return {
          success: true,
          message: 'Widgets recuperados com sucesso',
          data: widgets,
        };
      } catch {
        console.error('Error getting dashboard widgets:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar widgets',
          data: [],
        };
      }
    },
  },

  // Scheduled Reports
  createScheduledReport: {
    input: CreateScheduledReportInputSchema,
    output: SuccessResponseSchema(ScheduledReportSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const report = await analyticsService.createScheduledReport(input as CreateScheduledReportInput);

        return {
          success: true,
          message: 'Relatório agendado criado com sucesso',
          data: report,
        };
      } catch {
        console.error('Error creating scheduled report:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar relatório agendado',
          data: null,
        };
      }
    },
  },

  updateScheduledReport: {
    input: z.object({
      id: z.string().uuid(),
      report: UpdateScheduledReportInputSchema,
    }),
    output: SuccessResponseSchema(ScheduledReportSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const report = await analyticsService.updateScheduledReport(
          input.id,
          input.report as UpdateScheduledReportInput
        );

        return {
          success: true,
          message: 'Relatório agendado atualizado com sucesso',
          data: report,
        };
      } catch {
        console.error('Error updating scheduled report:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar relatório agendado',
          data: null,
        };
      }
    },
  },

  deleteScheduledReport: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteScheduledReport(input.id);

        return {
          success: true,
          message: 'Relatório agendado excluído com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting scheduled report:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir relatório agendado',
          data: false,
        };
      }
    },
  },

  getScheduledReports: {
    input: ReportQueryInputSchema,
    output: SuccessResponseSchema(z.array(ScheduledReportSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const reports = await analyticsService.getScheduledReports(input as ReportQueryInput);

        return {
          success: true,
          message: 'Relatórios agendados recuperados com sucesso',
          data: reports,
        };
      } catch {
        console.error('Error getting scheduled reports:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar relatórios agendados',
          data: [],
        };
      }
    },
  },

  generateReport: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.string()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const reportBlob = await analyticsService.generateReport(input.id);
        const reportData = await reportBlob.text();

        return {
          success: true,
          message: 'Relatório gerado com sucesso',
          data: reportData,
        };
      } catch {
        console.error('Error generating report:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar relatório',
          data: '',
        };
      }
    },
  },

  // Predictive Models
  createPredictiveModel: {
    input: CreatePredictiveModelInputSchema,
    output: SuccessResponseSchema(PredictiveModelSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const model = await analyticsService.createPredictiveModel(input as CreatePredictiveModelInput);

        return {
          success: true,
          message: 'Modelo preditivo criado com sucesso',
          data: model,
        };
      } catch {
        console.error('Error creating predictive model:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar modelo preditivo',
          data: null,
        };
      }
    },
  },

  updatePredictiveModel: {
    input: z.object({
      id: z.string().uuid(),
      model: UpdatePredictiveModelInputSchema,
    }),
    output: SuccessResponseSchema(PredictiveModelSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const model = await analyticsService.updatePredictiveModel(
          input.id,
          input.model as UpdatePredictiveModelInput
        );

        return {
          success: true,
          message: 'Modelo preditivo atualizado com sucesso',
          data: model,
        };
      } catch {
        console.error('Error updating predictive model:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar modelo preditivo',
          data: null,
        };
      }
    },
  },

  deletePredictiveModel: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deletePredictiveModel(input.id);

        return {
          success: true,
          message: 'Modelo preditivo excluído com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting predictive model:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir modelo preditivo',
          data: false,
        };
      }
    },
  },

  getPredictiveModels: {
    input: PredictiveQueryInputSchema,
    output: SuccessResponseSchema(z.array(PredictiveModelSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const models = await analyticsService.getPredictiveModels(input as PredictiveQueryInput);

        return {
          success: true,
          message: 'Modelos preditivos recuperados com sucesso',
          data: models,
        };
      } catch {
        console.error('Error getting predictive models:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar modelos preditivos',
          data: [],
        };
      }
    },
  },

  trainModel: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(PredictiveModelSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const model = await analyticsService.trainModel(input.id);

        return {
          success: true,
          message: 'Modelo treinado com sucesso',
          data: model,
        };
      } catch {
        console.error('Error training model:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao treinar modelo',
          data: null,
        };
      }
    },
  },

  predictWithModel: {
    input: z.object({
      id: z.string().uuid(),
      inputData: z.record(z.any()),
    }),
    output: SuccessResponseSchema(z.record(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const prediction = await analyticsService.predictWithModel(input.id, input.inputData);

        return {
          success: true,
          message: 'Predição gerada com sucesso',
          data: prediction,
        };
      } catch {
        console.error('Error predicting with model:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar predição',
          data: {},
        };
      }
    },
  },

  // Analytics Alerts
  createAnalyticsAlert: {
    input: CreateAnalyticsAlertInputSchema,
    output: SuccessResponseSchema(AnalyticsAlertSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const alert = await analyticsService.createAnalyticsAlert(input as CreateAnalyticsAlertInput);

        return {
          success: true,
          message: 'Alerta de analytics criado com sucesso',
          data: alert,
        };
      } catch {
        console.error('Error creating analytics alert:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar alerta de analytics',
          data: null,
        };
      }
    },
  },

  updateAnalyticsAlert: {
    input: z.object({
      id: z.string().uuid(),
      alert: UpdateAnalyticsAlertInputSchema,
    }),
    output: SuccessResponseSchema(AnalyticsAlertSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const alert = await analyticsService.updateAnalyticsAlert(
          input.id,
          input.alert as UpdateAnalyticsAlertInput
        );

        return {
          success: true,
          message: 'Alerta de analytics atualizado com sucesso',
          data: alert,
        };
      } catch {
        console.error('Error updating analytics alert:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar alerta de analytics',
          data: null,
        };
      }
    },
  },

  deleteAnalyticsAlert: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const success = await analyticsService.deleteAnalyticsAlert(input.id);

        return {
          success: true,
          message: 'Alerta de analytics excluído com sucesso',
          data: success,
        };
      } catch {
        console.error('Error deleting analytics alert:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao excluir alerta de analytics',
          data: false,
        };
      }
    },
  },

  getAnalyticsAlerts: {
    input: AlertQueryInputSchema,
    output: SuccessResponseSchema(z.array(AnalyticsAlertSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const alerts = await analyticsService.getAnalyticsAlerts(input as AlertQueryInput);

        return {
          success: true,
          message: 'Alertas de analytics recuperados com sucesso',
          data: alerts,
        };
      } catch {
        console.error('Error getting analytics alerts:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar alertas de analytics',
          data: [],
        };
      }
    },
  },

  checkAndTriggerAlerts: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(AnalyticsAlertSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const triggeredAlerts = await analyticsService.checkAndTriggerAlerts(input.clinicId);

        return {
          success: true,
          message: 'Alertas verificados com sucesso',
          data: triggeredAlerts,
        };
      } catch {
        console.error('Error checking and triggering alerts:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao verificar alertas',
          data: [],
        };
      }
    },
  },

  // Data Analytics
  getAnalyticsData: {
    input: AnalyticsQueryInputSchema,
    output: SuccessResponseSchema(z.array(z.object({
      id: z.string().uuid(),
      clinicId: z.string().uuid(),
      date: z.string(),
      hour: z.number().nullable(),
      metricName: z.string(),
      metricValue: z.number(),
      metricCategory: z.string(),
      dimension1: z.string().nullable(),
      dimension2: z.string().nullable(),
      dimension3: z.string().nullable(),
      sourceSystem: z.string(),
      createdAt: z.string(),
    }))),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const _data = await analyticsService.getAnalyticsData(input as AnalyticsQueryInput);

        return {
          success: true,
          message: 'Dados de analytics recuperados com sucesso',
          data: data,
        };
      } catch {
        console.error('Error getting analytics data:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar dados de analytics',
          data: [],
        };
      }
    },
  },

  getPerformanceMetrics: {
    input: PerformanceMetricsQueryInputSchema,
    output: SuccessResponseSchema(z.array(PerformanceMetricsSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const metrics = await analyticsService.getPerformanceMetrics(input as PerformanceMetricsQueryInput);

        return {
          success: true,
          message: 'Métricas de desempenho recuperadas com sucesso',
          data: metrics,
        };
      } catch {
        console.error('Error getting performance metrics:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar métricas de desempenho',
          data: [],
        };
      }
    },
  },

  aggregateData: {
    input: z.object({
      clinicId: z.string().uuid(),
      config: z.record(z.any()),
    }),
    output: SuccessResponseSchema(z.record(z.any())),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const aggregatedData = await analyticsService.aggregateData(input.clinicId, input.config);

        return {
          success: true,
          message: 'Dados agregados com sucesso',
          data: aggregatedData,
        };
      } catch {
        console.error('Error aggregating data:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao agregar dados',
          data: {},
        };
      }
    },
  },

  generateComparativeAnalysis: {
    input: ComparativeAnalysisInputSchema,
    output: SuccessResponseSchema(ComparativeAnalyticsSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const analysis = await analyticsService.generateComparativeAnalysis(
          input.clinicId,
          input.comparisonType,
          input.baselinePeriod,
          input.comparisonPeriod
        );

        return {
          success: true,
          message: 'Análise comparativa gerada com sucesso',
          data: analysis,
        };
      } catch {
        console.error('Error generating comparative analysis:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar análise comparativa',
          data: null,
        };
      }
    },
  },

  // Data Export
  createDataExport: {
    input: DataExportInputSchema,
    output: SuccessResponseSchema(z.object({
      id: z.string().uuid(),
      clinicId: z.string().uuid(),
      requestType: z.string(),
      filters: z.record(z.any()),
      format: z.string(),
      status: z.string(),
      createdAt: z.string(),
    })),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const exportRequest = await analyticsService.createDataExport(input as DataExportInput);

        return {
          success: true,
          message: 'Solicitação de exportação criada com sucesso',
          data: exportRequest,
        };
      } catch {
        console.error('Error creating data export:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar solicitação de exportação',
          data: null,
        };
      }
    },
  },

  getDataExports: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(z.object({
      id: z.string().uuid(),
      clinicId: z.string().uuid(),
      requestType: z.string(),
      filters: z.record(z.any()),
      format: z.string(),
      status: z.string(),
      createdAt: z.string(),
      completedAt: z.string().nullable(),
    }))),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const exports = await analyticsService.getDataExports(input.clinicId);

        return {
          success: true,
          message: 'Exportações recuperadas com sucesso',
          data: exports,
        };
      } catch {
        console.error('Error getting data exports:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar exportações',
          data: [],
        };
      }
    },
  },

  downloadExport: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.string()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const exportBlob = await analyticsService.downloadExport(input.id);
        const exportData = await exportBlob.text();

        return {
          success: true,
          message: 'Exportação baixada com sucesso',
          data: exportData,
        };
      } catch {
        console.error('Error downloading export:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao baixar exportação',
          data: '',
        };
      }
    },
  },

  // Real-time Analytics
  trackEvent: {
    input: TrackEventInputSchema,
    output: SuccessResponseSchema(z.boolean()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        await analyticsService.trackEvent(
          input.clinicId,
          input.eventType,
          input.eventData,
          input.userId,
          input.sessionId
        );

        return {
          success: true,
          message: 'Evento rastreado com sucesso',
          data: true,
        };
      } catch {
        console.error('Error tracking event:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao rastrear evento',
          data: false,
        };
      }
    },
  },

  getRealtimeMetrics: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.object({
      revenueTotal: z.number(),
      appointmentCount: z.number(),
      newPatients: z.number(),
      noShowRate: z.number(),
    })),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const metrics = await analyticsService.getRealtimeMetrics(input.clinicId);

        return {
          success: true,
          message: 'Métricas em tempo real recuperadas com sucesso',
          data: metrics,
        };
      } catch {
        console.error('Error getting realtime metrics:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar métricas em tempo real',
          data: {
            revenueTotal: 0,
            appointmentCount: 0,
            newPatients: 0,
            noShowRate: 0,
          },
        };
      }
    },
  },

  getDashboardData: {
    input: z.object({
      dashboardId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.object({
      dashboard: BIDashboardSchema,
      widgets: z.array(DashboardWidgetSchema),
      widgetData: z.record(z.any()),
    })),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const dashboardData = await analyticsService.getDashboardData(input.dashboardId);

        return {
          success: true,
          message: 'Dados do dashboard recuperados com sucesso',
          data: dashboardData,
        };
      } catch {
        console.error('Error getting dashboard data:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao recuperar dados do dashboard',
          data: {
            dashboard: null,
            widgets: [],
            widgetData: {},
          },
        };
      }
    },
  },

  // Predictive Analytics
  predictNoShowProbability: {
    input: z.object({
      patientId: z.string().uuid(),
      clinicId: z.string().uuid(),
      appointmentDate: z.string().datetime(),
    }),
    output: SuccessResponseSchema(z.number()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const probability = await analyticsService.predictNoShowProbability(
          input.patientId,
          input.clinicId,
          input.appointmentDate
        );

        return {
          success: true,
          message: 'Probabilidade de não comparecimento calculada com sucesso',
          data: probability,
        };
      } catch {
        console.error('Error predicting no-show probability:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao calcular probabilidade de não comparecimento',
          data: 0,
        };
      }
    },
  },

  generateRevenueForecast: {
    input: z.object({
      clinicId: z.string().uuid(),
      forecastDays: z.number().int().min(1).max(365).optional().default(30),
    }),
    output: SuccessResponseSchema(z.array(z.object({
      forecastDate: z.string(),
      predictedRevenue: z.number(),
      confidenceLower: z.number(),
      confidenceUpper: z.number(),
    }))),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const forecast = await analyticsService.generateRevenueForecast(input.clinicId, input.forecastDays);

        return {
          success: true,
          message: 'Previsão de receita gerada com sucesso',
          data: forecast,
        };
      } catch {
        console.error('Error generating revenue forecast:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar previsão de receita',
          data: [],
        };
      }
    },
  },

  predictInventoryDemand: {
    input: z.object({
      clinicId: z.string().uuid(),
      productId: z.string().uuid(),
      forecastDays: z.number().int().min(1).max(365).optional().default(30),
    }),
    output: SuccessResponseSchema(z.array(z.object({
      date: z.string(),
      predictedDemand: z.number(),
      confidence: z.number(),
    }))),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const forecast = await analyticsService.predictInventoryDemand(
          input.clinicId,
          input.productId,
          input.forecastDays
        );

        return {
          success: true,
          message: 'Previsão de demanda de estoque gerada com sucesso',
          data: forecast,
        };
      } catch {
        console.error('Error predicting inventory demand:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar previsão de demanda de estoque',
          data: [],
        };
      }
    },
  },

  predictPatientRetention: {
    input: z.object({
      clinicId: z.string().uuid(),
      patientId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.number()),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const analyticsService = new AnalyticsService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });

        const retentionProbability = await analyticsService.predictPatientRetention(input.clinicId, input.patientId);

        return {
          success: true,
          message: 'Probabilidade de retenção de paciente calculada com sucesso',
          data: retentionProbability,
        };
      } catch {
        console.error('Error predicting patient retention:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao calcular probabilidade de retenção de paciente',
          data: 0,
        };
      }
    },
  },
});