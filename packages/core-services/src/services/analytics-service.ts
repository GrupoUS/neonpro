/**
 * Advanced Analytics and Business Intelligence Service for NeonPro Aesthetic Clinics
 * Provides comprehensive data aggregation, analytics, and business intelligence capabilities
 * Supports real-time dashboards, predictive analytics, and comprehensive reporting
 */

import { logHealthcareError } from '@neonpro/shared';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema Types
const AnalyticsConfigurationSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  configType: z.enum(['dashboard', 'report', 'metric', 'alert', 'forecast']),
  name: z.string(),
  configuration: z.record(z.any()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const KPIDefinitionSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AnalyticsDataWarehouseSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
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
});

const BIDashboardSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  layoutConfig: z.record(z.any()),
  isPublic: z.boolean(),
  isTemplate: z.boolean(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const DashboardWidgetSchema = z.object({
  id: z.string(),
  dashboardId: z.string(),
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']),
  title: z.string(),
  dataSource: z.string(),
  configuration: z.record(z.any()),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  refreshInterval: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ScheduledReportSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']),
  scheduleConfig: z.record(z.any()),
  recipients: z.array(z.string()),
  format: z.enum(['pdf', 'excel', 'csv', 'html']),
  isActive: z.boolean(),
  lastRunAt: z.string().nullable(),
  nextRunAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PredictiveModelSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  name: z.string(),
  modelType: z.enum([
    'no_show_prediction',
    'revenue_forecast',
    'inventory_demand',
    'patient_retention',
    'treatment_outcome',
  ]),
  modelConfig: z.record(z.any()),
  trainingDataConfig: z.record(z.any()),
  accuracyScore: z.number().nullable(),
  isActive: z.boolean(),
  lastTrainedAt: z.string().nullable(),
  nextTrainingAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AnalyticsAlertSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  name: z.string(),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']),
  conditionConfig: z.record(z.any()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  recipients: z.array(z.string()),
  isActive: z.boolean(),
  lastTriggeredAt: z.string().nullable(),
  triggerCount: z.number(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PerformanceMetricsSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  metricDate: z.string(),
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
  createdAt: z.string(),
});

const ComparativeAnalyticsSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  comparisonType: z.enum(['period_over_period', 'year_over_year', 'benchmark', 'competitor']),
  baselinePeriod: z.record(z.any()),
  comparisonPeriod: z.record(z.any()),
  metrics: z.record(z.any()),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
});

// Input Schemas
const CreateAnalyticsConfigurationInputSchema = z.object({
  clinicId: z.string(),
  configType: z.enum(['dashboard', 'report', 'metric', 'alert', 'forecast']),
  name: z.string(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const CreateKPIDefinitionInputSchema = z.object({
  clinicId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['financial', 'clinical', 'operational', 'patient', 'inventory', 'compliance']),
  calculationFormula: z.string(),
  unit: z.string().optional(),
  targetValue: z.number().optional(),
  benchmarkValue: z.number().optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  isActive: z.boolean().optional(),
});

const CreateBIDashboardInputSchema = z.object({
  clinicId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  layoutConfig: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
});

const CreateDashboardWidgetInputSchema = z.object({
  dashboardId: z.string(),
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']),
  title: z.string(),
  dataSource: z.string(),
  configuration: z.record(z.any()).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  refreshInterval: z.number().optional(),
});

const CreateScheduledReportInputSchema = z.object({
  clinicId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']),
  scheduleConfig: z.record(z.any()),
  recipients: z.array(z.string()),
  format: z.enum(['pdf', 'excel', 'csv', 'html']).optional(),
  isActive: z.boolean().optional(),
});

const CreatePredictiveModelInputSchema = z.object({
  clinicId: z.string(),
  name: z.string(),
  modelType: z.enum([
    'no_show_prediction',
    'revenue_forecast',
    'inventory_demand',
    'patient_retention',
    'treatment_outcome',
  ]),
  modelConfig: z.record(z.any),
  trainingDataConfig: z.record(z.any),
  accuracyScore: z.number().optional(),
  isActive: z.boolean().optional(),
});

const CreateAnalyticsAlertInputSchema = z.object({
  clinicId: z.string(),
  name: z.string(),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']),
  conditionConfig: z.record(z.any),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  recipients: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const UpdateAnalyticsConfigurationInputSchema = z.object({
  name: z.string().optional(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const UpdateKPIDefinitionInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  calculationFormula: z.string().optional(),
  unit: z.string().optional(),
  targetValue: z.number().optional(),
  benchmarkValue: z.number().optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  isActive: z.boolean().optional(),
});

const UpdateBIDashboardInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  layoutConfig: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
});

const UpdateDashboardWidgetInputSchema = z.object({
  widgetType: z.enum(['metric', 'chart', 'table', 'gauge', 'heatmap', 'trend']).optional(),
  title: z.string().optional(),
  dataSource: z.string().optional(),
  configuration: z.record(z.any()).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  refreshInterval: z.number().optional(),
});

const UpdateScheduledReportInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  reportType: z.enum(['financial', 'clinical', 'operational', 'compliance', 'custom']).optional(),
  scheduleConfig: z.record(z.any()).optional(),
  recipients: z.array(z.string()).optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'html']).optional(),
  isActive: z.boolean().optional(),
});

const UpdatePredictiveModelInputSchema = z.object({
  name: z.string().optional(),
  modelConfig: z.record(z.any).optional(),
  trainingDataConfig: z.record(z.any).optional(),
  accuracyScore: z.number().optional(),
  isActive: z.boolean().optional(),
});

const UpdateAnalyticsAlertInputSchema = z.object({
  name: z.string().optional(),
  alertType: z.enum(['threshold', 'trend', 'anomaly', 'custom']).optional(),
  conditionConfig: z.record(z.any).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  recipients: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Analytics Query Schemas
const AnalyticsQueryInputSchema = z.object({
  clinicId: z.string(),
  metricName: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dimensions: z.array(z.string()).optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'rate']).optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
});

const DashboardQueryInputSchema = z.object({
  clinicId: z.string(),
  dashboardId: z.string().optional(),
  isTemplate: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const ReportQueryInputSchema = z.object({
  clinicId: z.string(),
  reportType: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const PredictiveQueryInputSchema = z.object({
  clinicId: z.string(),
  modelType: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const AlertQueryInputSchema = z.object({
  clinicId: z.string(),
  alertType: z.string().optional(),
  severity: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const PerformanceMetricsQueryInputSchema = z.object({
  clinicId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  metrics: z.array(z.string()).optional(),
});

// Export Schemas
const DataExportInputSchema = z.object({
  clinicId: z.string(),
  requestType: z.enum(['analytics', 'raw_data', 'report', 'custom']),
  filters: z.record(z.any).optional(),
  format: z.enum(['csv', 'excel', 'json', 'parquet']).optional(),
});

// Type exports
type AnalyticsConfiguration = z.infer<typeof AnalyticsConfigurationSchema>;
type KPIDefinition = z.infer<typeof KPIDefinitionSchema>;
type AnalyticsDataWarehouse = z.infer<typeof AnalyticsDataWarehouseSchema>;
type BIDashboard = z.infer<typeof BIDashboardSchema>;
type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;
type ScheduledReport = z.infer<typeof ScheduledReportSchema>;
type PredictiveModel = z.infer<typeof PredictiveModelSchema>;
type AnalyticsAlert = z.infer<typeof AnalyticsAlertSchema>;
type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
type ComparativeAnalytics = z.infer<typeof ComparativeAnalyticsSchema>;

type CreateAnalyticsConfigurationInput = z.infer<typeof CreateAnalyticsConfigurationInputSchema>;
type CreateKPIDefinitionInput = z.infer<typeof CreateKPIDefinitionInputSchema>;
type CreateBIDashboardInput = z.infer<typeof CreateBIDashboardInputSchema>;
type CreateDashboardWidgetInput = z.infer<typeof CreateDashboardWidgetInputSchema>;
type CreateScheduledReportInput = z.infer<typeof CreateScheduledReportInputSchema>;
type CreatePredictiveModelInput = z.infer<typeof CreatePredictiveModelInputSchema>;
type CreateAnalyticsAlertInput = z.infer<typeof CreateAnalyticsAlertInputSchema>;

type UpdateAnalyticsConfigurationInput = z.infer<typeof UpdateAnalyticsConfigurationInputSchema>;
type UpdateKPIDefinitionInput = z.infer<typeof UpdateKPIDefinitionInputSchema>;
type UpdateBIDashboardInput = z.infer<typeof UpdateBIDashboardInputSchema>;
type UpdateDashboardWidgetInput = z.infer<typeof UpdateDashboardWidgetInputSchema>;
type UpdateScheduledReportInput = z.infer<typeof UpdateScheduledReportInputSchema>;
type UpdatePredictiveModelInput = z.infer<typeof UpdatePredictiveModelInputSchema>;
type UpdateAnalyticsAlertInput = z.infer<typeof UpdateAnalyticsAlertInputSchema>;

type AnalyticsQueryInput = z.infer<typeof AnalyticsQueryInputSchema>;
type DashboardQueryInput = z.infer<typeof DashboardQueryInputSchema>;
type ReportQueryInput = z.infer<typeof ReportQueryInputSchema>;
type PredictiveQueryInput = z.infer<typeof PredictiveQueryInputSchema>;
type AlertQueryInput = z.infer<typeof AlertQueryInputSchema>;
type PerformanceMetricsQueryInput = z.infer<typeof PerformanceMetricsQueryInputSchema>;
type DataExportInput = z.infer<typeof DataExportInputSchema>;

// Analytics Service Interface
export interface AnalyticsService {
  // Analytics Configuration
  createAnalyticsConfiguration(
    config: CreateAnalyticsConfigurationInput,
  ): Promise<AnalyticsConfiguration>;
  updateAnalyticsConfiguration(
    id: string,
    config: UpdateAnalyticsConfigurationInput,
  ): Promise<AnalyticsConfiguration>;
  deleteAnalyticsConfiguration(id: string): Promise<boolean>;
  getAnalyticsConfigurations(clinicId: string): Promise<AnalyticsConfiguration[]>;

  // KPI Management
  createKPIDefinition(kpi: CreateKPIDefinitionInput): Promise<KPIDefinition>;
  updateKPIDefinition(id: string, kpi: UpdateKPIDefinitionInput): Promise<KPIDefinition>;
  deleteKPIDefinition(id: string): Promise<boolean>;
  getKPIDefinitions(clinicId: string): Promise<KPIDefinition[]>;
  calculateKPIValue(
    clinicId: string,
    kpiName: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number>;

  // BI Dashboards
  createBIDashboard(dashboard: CreateBIDashboardInput): Promise<BIDashboard>;
  updateBIDashboard(id: string, dashboard: UpdateBIDashboardInput): Promise<BIDashboard>;
  deleteBIDashboard(id: string): Promise<boolean>;
  getBIDashboards(query: DashboardQueryInput): Promise<BIDashboard[]>;
  getBIDashboardById(id: string): Promise<BIDashboard | null>;

  // Dashboard Widgets
  createDashboardWidget(widget: CreateDashboardWidgetInput): Promise<DashboardWidget>;
  updateDashboardWidget(id: string, widget: UpdateDashboardWidgetInput): Promise<DashboardWidget>;
  deleteDashboardWidget(id: string): Promise<boolean>;
  getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]>;

  // Scheduled Reports
  createScheduledReport(report: CreateScheduledReportInput): Promise<ScheduledReport>;
  updateScheduledReport(id: string, report: UpdateScheduledReportInput): Promise<ScheduledReport>;
  deleteScheduledReport(id: string): Promise<boolean>;
  getScheduledReports(query: ReportQueryInput): Promise<ScheduledReport[]>;
  generateReport(id: string): Promise<Blob>;

  // Predictive Models
  createPredictiveModel(model: CreatePredictiveModelInput): Promise<PredictiveModel>;
  updatePredictiveModel(id: string, model: UpdatePredictiveModelInput): Promise<PredictiveModel>;
  deletePredictiveModel(id: string): Promise<boolean>;
  getPredictiveModels(query: PredictiveQueryInput): Promise<PredictiveModel[]>;
  trainModel(id: string): Promise<PredictiveModel>;
  predictWithModel(id: string, inputData: any): Promise<any>;

  // Analytics Alerts
  createAnalyticsAlert(alert: CreateAnalyticsAlertInput): Promise<AnalyticsAlert>;
  updateAnalyticsAlert(id: string, alert: UpdateAnalyticsAlertInput): Promise<AnalyticsAlert>;
  deleteAnalyticsAlert(id: string): Promise<boolean>;
  getAnalyticsAlerts(query: AlertQueryInput): Promise<AnalyticsAlert[]>;
  checkAndTriggerAlerts(clinicId: string): Promise<AnalyticsAlert[]>;

  // Data Analytics
  getAnalyticsData(query: AnalyticsQueryInput): Promise<AnalyticsDataWarehouse[]>;
  getPerformanceMetrics(query: PerformanceMetricsQueryInput): Promise<PerformanceMetrics[]>;
  aggregateData(clinicId: string, config: any): Promise<any>;
  generateComparativeAnalysis(
    clinicId: string,
    comparisonType: string,
    baselinePeriod: any,
    comparisonPeriod: any,
  ): Promise<ComparativeAnalytics>;

  // Data Export
  createDataExport(exportData: DataExportInput): Promise<any>;
  getDataExports(clinicId: string): Promise<any[]>;
  downloadExport(id: string): Promise<Blob>;

  // Real-time Analytics
  trackEvent(
    clinicId: string,
    eventType: string,
    eventData: any,
    userId?: string,
    sessionId?: string,
  ): Promise<void>;
  getRealtimeMetrics(clinicId: string): Promise<any>;
  getDashboardData(dashboardId: string): Promise<any>;

  // Predictive Analytics
  predictNoShowProbability(
    patientId: string,
    clinicId: string,
    appointmentDate: string,
  ): Promise<number>;
  generateRevenueForecast(clinicId: string, forecastDays: number): Promise<any>;
  predictInventoryDemand(clinicId: string, productId: string, forecastDays: number): Promise<any>;
  predictPatientRetention(clinicId: string, patientId: string): Promise<number>;
}

// Analytics Service Implementation
export class AnalyticsService implements AnalyticsService {
  private supabase: SupabaseClient;

  constructor(config: { supabaseUrl: string; supabaseKey: string }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // Analytics Configuration
  async createAnalyticsConfiguration(
    config: CreateAnalyticsConfigurationInput,
  ): Promise<AnalyticsConfiguration> {
    const validatedConfig = CreateAnalyticsConfigurationInputSchema.parse(config);

    const { data, error } = await this.supabase
      .from('analytics_configurations')
      .insert({
        clinic_id: validatedConfig.clinicId,
        config_type: validatedConfig.configType,
        name: validatedConfig.name,
        configuration: validatedConfig.configuration || {},
        is_active: validatedConfig.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analytics configuration: ${error.message}`);
    }

    return AnalyticsConfigurationSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      configType: data.config_type,
    });
  }

  async updateAnalyticsConfiguration(
    id: string,
    config: UpdateAnalyticsConfigurationInput,
  ): Promise<AnalyticsConfiguration> {
    const validatedConfig = UpdateAnalyticsConfigurationInputSchema.parse(config);

    const { data, error } = await this.supabase
      .from('analytics_configurations')
      .update({
        ...(validatedConfig.name && { name: validatedConfig.name }),
        ...(validatedConfig.configuration !== undefined
          && { configuration: validatedConfig.configuration }),
        ...(validatedConfig.isActive !== undefined && { is_active: validatedConfig.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update analytics configuration: ${error.message}`);
    }

    return AnalyticsConfigurationSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      configType: data.config_type,
    });
  }

  async deleteAnalyticsConfiguration(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('analytics_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete analytics configuration: ${error.message}`);
    }

    return true;
  }

  async getAnalyticsConfigurations(clinicId: string): Promise<AnalyticsConfiguration[]> {
    const { data, error } = await this.supabase
      .from('analytics_configurations')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get analytics configurations: ${error.message}`);
    }

    return data.map(item =>
      AnalyticsConfigurationSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        configType: item.config_type,
      })
    );
  }

  // KPI Management
  async createKPIDefinition(kpi: CreateKPIDefinitionInput): Promise<KPIDefinition> {
    const validatedKPI = CreateKPIDefinitionInputSchema.parse(kpi);

    const { data, error } = await this.supabase
      .from('kpi_definitions')
      .insert({
        clinic_id: validatedKPI.clinicId,
        name: validatedKPI.name,
        description: validatedKPI.description,
        category: validatedKPI.category,
        calculation_formula: validatedKPI.calculationFormula,
        unit: validatedKPI.unit,
        target_value: validatedKPI.targetValue,
        benchmark_value: validatedKPI.benchmarkValue,
        aggregation_type: validatedKPI.aggregationType || 'sum',
        frequency: validatedKPI.frequency || 'daily',
        is_active: validatedKPI.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create KPI definition: ${error.message}`);
    }

    return KPIDefinitionSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      calculationFormula: data.calculation_formula,
      targetValue: data.target_value,
      benchmarkValue: data.benchmark_value,
      aggregationType: data.aggregation_type,
      frequency: data.frequency,
      isActive: data.is_active,
    });
  }

  async updateKPIDefinition(id: string, kpi: UpdateKPIDefinitionInput): Promise<KPIDefinition> {
    const validatedKPI = UpdateKPIDefinitionInputSchema.parse(kpi);

    const { data, error } = await this.supabase
      .from('kpi_definitions')
      .update({
        ...(validatedKPI.name !== undefined && { name: validatedKPI.name }),
        ...(validatedKPI.description !== undefined && { description: validatedKPI.description }),
        ...(validatedKPI.calculationFormula !== undefined
          && { calculation_formula: validatedKPI.calculationFormula }),
        ...(validatedKPI.unit !== undefined && { unit: validatedKPI.unit }),
        ...(validatedKPI.targetValue !== undefined && { target_value: validatedKPI.targetValue }),
        ...(validatedKPI.benchmarkValue !== undefined
          && { benchmark_value: validatedKPI.benchmarkValue }),
        ...(validatedKPI.aggregationType !== undefined
          && { aggregation_type: validatedKPI.aggregationType }),
        ...(validatedKPI.frequency !== undefined && { frequency: validatedKPI.frequency }),
        ...(validatedKPI.isActive !== undefined && { is_active: validatedKPI.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update KPI definition: ${error.message}`);
    }

    return KPIDefinitionSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      calculationFormula: data.calculation_formula,
      targetValue: data.target_value,
      benchmarkValue: data.benchmark_value,
      aggregationType: data.aggregation_type,
      frequency: data.frequency,
      isActive: data.is_active,
    });
  }

  async deleteKPIDefinition(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('kpi_definitions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete KPI definition: ${error.message}`);
    }

    return true;
  }

  async getKPIDefinitions(clinicId: string): Promise<KPIDefinition[]> {
    const { data, error } = await this.supabase
      .from('kpi_definitions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get KPI definitions: ${error.message}`);
    }

    return data.map(item =>
      KPIDefinitionSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        calculationFormula: item.calculation_formula,
        targetValue: item.target_value,
        benchmarkValue: item.benchmark_value,
        aggregationType: item.aggregation_type,
        frequency: item.frequency,
        isActive: item.is_active,
      })
    );
  }

  async calculateKPIValue(
    clinicId: string,
    kpiName: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('calculate_kpi_value', {
      p_clinic_id: clinicId,
      p_kpi_name: kpiName,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      throw new Error(`Failed to calculate KPI value: ${error.message}`);
    }

    return data;
  }

  // BI Dashboards
  async createBIDashboard(dashboard: CreateBIDashboardInput): Promise<BIDashboard> {
    const validatedDashboard = CreateBIDashboardInputSchema.parse(dashboard);

    const { data, error } = await this.supabase
      .from('bi_dashboards')
      .insert({
        clinic_id: validatedDashboard.clinicId,
        name: validatedDashboard.name,
        description: validatedDashboard.description,
        layout_config: validatedDashboard.layoutConfig || {},
        is_public: validatedDashboard.isPublic ?? false,
        is_template: validatedDashboard.isTemplate ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create BI dashboard: ${error.message}`);
    }

    return BIDashboardSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      layoutConfig: data.layout_config,
      isPublic: data.is_public,
      isTemplate: data.is_template,
      createdBy: data.created_by,
    });
  }

  async updateBIDashboard(id: string, dashboard: UpdateBIDashboardInput): Promise<BIDashboard> {
    const validatedDashboard = UpdateBIDashboardInputSchema.parse(dashboard);

    const { data, error } = await this.supabase
      .from('bi_dashboards')
      .update({
        ...(validatedDashboard.name !== undefined && { name: validatedDashboard.name }),
        ...(validatedDashboard.description !== undefined
          && { description: validatedDashboard.description }),
        ...(validatedDashboard.layoutConfig !== undefined
          && { layout_config: validatedDashboard.layoutConfig }),
        ...(validatedDashboard.isPublic !== undefined
          && { is_public: validatedDashboard.isPublic }),
        ...(validatedDashboard.isTemplate !== undefined
          && { is_template: validatedDashboard.isTemplate }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update BI dashboard: ${error.message}`);
    }

    return BIDashboardSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      layoutConfig: data.layout_config,
      isPublic: data.is_public,
      isTemplate: data.is_template,
      createdBy: data.created_by,
    });
  }

  async deleteBIDashboard(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('bi_dashboards')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete BI dashboard: ${error.message}`);
    }

    return true;
  }

  async getBIDashboards(query: DashboardQueryInput): Promise<BIDashboard[]> {
    let queryBuilder = this.supabase
      .from('bi_dashboards')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.dashboardId) {
      queryBuilder = queryBuilder.eq('id', query.dashboardId);
    }

    if (query.isTemplate !== undefined) {
      queryBuilder = queryBuilder.eq('is_template', query.isTemplate);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        (query.offset || 0) + (query.limit || 10) - 1,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get BI dashboards: ${error.message}`);
    }

    return data.map(item =>
      BIDashboardSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        layoutConfig: item.layout_config,
        isPublic: item.is_public,
        isTemplate: item.is_template,
        createdBy: item.created_by,
      })
    );
  }

  async getBIDashboardById(id: string): Promise<BIDashboard | null> {
    const { data, error } = await this.supabase
      .from('bi_dashboards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get BI dashboard: ${error.message}`);
    }

    return BIDashboardSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      layoutConfig: data.layout_config,
      isPublic: data.is_public,
      isTemplate: data.is_template,
      createdBy: data.created_by,
    });
  }

  // Dashboard Widgets
  async createDashboardWidget(widget: CreateDashboardWidgetInput): Promise<DashboardWidget> {
    const validatedWidget = CreateDashboardWidgetInputSchema.parse(widget);

    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id: validatedWidget.dashboardId,
        widget_type: validatedWidget.widgetType,
        title: validatedWidget.title,
        data_source: validatedWidget.dataSource,
        configuration: validatedWidget.configuration || {},
        position_x: validatedWidget.positionX || 0,
        position_y: validatedWidget.positionY || 0,
        width: validatedWidget.width || 4,
        height: validatedWidget.height || 3,
        refresh_interval: validatedWidget.refreshInterval || 300,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create dashboard widget: ${error.message}`);
    }

    return DashboardWidgetSchema.parse({
      ...data,
      dashboardId: data.dashboard_id,
      widgetType: data.widget_type,
      dataSource: data.data_source,
      positionX: data.position_x,
      positionY: data.position_y,
      refreshInterval: data.refresh_interval,
    });
  }

  async updateDashboardWidget(
    id: string,
    widget: UpdateDashboardWidgetInput,
  ): Promise<DashboardWidget> {
    const validatedWidget = UpdateDashboardWidgetInputSchema.parse(widget);

    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .update({
        ...(validatedWidget.widgetType !== undefined
          && { widget_type: validatedWidget.widgetType }),
        ...(validatedWidget.title !== undefined && { title: validatedWidget.title }),
        ...(validatedWidget.dataSource !== undefined
          && { data_source: validatedWidget.dataSource }),
        ...(validatedWidget.configuration !== undefined
          && { configuration: validatedWidget.configuration }),
        ...(validatedWidget.positionX !== undefined && { position_x: validatedWidget.positionX }),
        ...(validatedWidget.positionY !== undefined && { position_y: validatedWidget.positionY }),
        ...(validatedWidget.width !== undefined && { width: validatedWidget.width }),
        ...(validatedWidget.height !== undefined && { height: validatedWidget.height }),
        ...(validatedWidget.refreshInterval !== undefined
          && { refresh_interval: validatedWidget.refreshInterval }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update dashboard widget: ${error.message}`);
    }

    return DashboardWidgetSchema.parse({
      ...data,
      dashboardId: data.dashboard_id,
      widgetType: data.widget_type,
      dataSource: data.data_source,
      positionX: data.position_x,
      positionY: data.position_y,
      refreshInterval: data.refresh_interval,
    });
  }

  async deleteDashboardWidget(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete dashboard widget: ${error.message}`);
    }

    return true;
  }

  async getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get dashboard widgets: ${error.message}`);
    }

    return data.map(item =>
      DashboardWidgetSchema.parse({
        ...item,
        dashboardId: item.dashboard_id,
        widgetType: item.widget_type,
        dataSource: item.data_source,
        positionX: item.position_x,
        positionY: item.position_y,
        refreshInterval: item.refresh_interval,
      })
    );
  }

  // Scheduled Reports
  async createScheduledReport(report: CreateScheduledReportInput): Promise<ScheduledReport> {
    const validatedReport = CreateScheduledReportInputSchema.parse(report);

    const { data, error } = await this.supabase
      .from('scheduled_reports')
      .insert({
        clinic_id: validatedReport.clinicId,
        name: validatedReport.name,
        description: validatedReport.description,
        report_type: validatedReport.reportType,
        schedule_config: validatedReport.scheduleConfig,
        recipients: validatedReport.recipients,
        format: validatedReport.format || 'pdf',
        is_active: validatedReport.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create scheduled report: ${error.message}`);
    }

    return ScheduledReportSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      reportType: data.report_type,
      scheduleConfig: data.schedule_config,
      format: data.format,
      isActive: data.is_active,
      lastRunAt: data.last_run_at,
      nextRunAt: data.next_run_at,
      createdBy: data.created_by,
    });
  }

  async updateScheduledReport(
    id: string,
    report: UpdateScheduledReportInput,
  ): Promise<ScheduledReport> {
    const validatedReport = UpdateScheduledReportInputSchema.parse(report);

    const { data, error } = await this.supabase
      .from('scheduled_reports')
      .update({
        ...(validatedReport.name !== undefined && { name: validatedReport.name }),
        ...(validatedReport.description !== undefined
          && { description: validatedReport.description }),
        ...(validatedReport.reportType !== undefined
          && { report_type: validatedReport.reportType }),
        ...(validatedReport.scheduleConfig !== undefined
          && { schedule_config: validatedReport.scheduleConfig }),
        ...(validatedReport.recipients !== undefined && { recipients: validatedReport.recipients }),
        ...(validatedReport.format !== undefined && { format: validatedReport.format }),
        ...(validatedReport.isActive !== undefined && { is_active: validatedReport.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update scheduled report: ${error.message}`);
    }

    return ScheduledReportSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      reportType: data.report_type,
      scheduleConfig: data.schedule_config,
      format: data.format,
      isActive: data.is_active,
      lastRunAt: data.last_run_at,
      nextRunAt: data.next_run_at,
      createdBy: data.created_by,
    });
  }

  async deleteScheduledReport(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete scheduled report: ${error.message}`);
    }

    return true;
  }

  async getScheduledReports(query: ReportQueryInput): Promise<ScheduledReport[]> {
    let queryBuilder = this.supabase
      .from('scheduled_reports')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.reportType) {
      queryBuilder = queryBuilder.eq('report_type', query.reportType);
    }

    if (query.isActive !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', query.isActive);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        (query.offset || 0) + (query.limit || 10) - 1,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get scheduled reports: ${error.message}`);
    }

    return data.map(item =>
      ScheduledReportSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        reportType: item.report_type,
        scheduleConfig: item.schedule_config,
        format: item.format,
        isActive: item.is_active,
        lastRunAt: item.last_run_at,
        nextRunAt: item.next_run_at,
        createdBy: item.created_by,
      })
    );
  }

  async generateReport(id: string): Promise<Blob> {
    // This would integrate with a report generation service
    // For now, we'll return a mock implementation
    const { data, error } = await this.supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }

    // Mock report generation - in reality this would call a report generation service
    const reportData = {
      reportId: id,
      generatedAt: new Date().toISOString(),
      data: 'Report data would be generated here',
    };

    return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  }

  // Predictive Models
  async createPredictiveModel(model: CreatePredictiveModelInput): Promise<PredictiveModel> {
    const validatedModel = CreatePredictiveModelInputSchema.parse(model);

    const { data, error } = await this.supabase
      .from('predictive_models')
      .insert({
        clinic_id: validatedModel.clinicId,
        name: validatedModel.name,
        model_type: validatedModel.modelType,
        model_config: validatedModel.modelConfig,
        training_data_config: validatedModel.trainingDataConfig,
        accuracy_score: validatedModel.accuracyScore,
        is_active: validatedModel.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create predictive model: ${error.message}`);
    }

    return PredictiveModelSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      modelType: data.model_type,
      modelConfig: data.model_config,
      trainingDataConfig: data.training_data_config,
      accuracyScore: data.accuracy_score,
      isActive: data.is_active,
      lastTrainedAt: data.last_trained_at,
      nextTrainingAt: data.next_training_at,
    });
  }

  async updatePredictiveModel(
    id: string,
    model: UpdatePredictiveModelInput,
  ): Promise<PredictiveModel> {
    const validatedModel = UpdatePredictiveModelInputSchema.parse(model);

    const { data, error } = await this.supabase
      .from('predictive_models')
      .update({
        ...(validatedModel.name !== undefined && { name: validatedModel.name }),
        ...(validatedModel.modelConfig !== undefined
          && { model_config: validatedModel.modelConfig }),
        ...(validatedModel.trainingDataConfig !== undefined
          && { training_data_config: validatedModel.trainingDataConfig }),
        ...(validatedModel.accuracyScore !== undefined
          && { accuracy_score: validatedModel.accuracyScore }),
        ...(validatedModel.isActive !== undefined && { is_active: validatedModel.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update predictive model: ${error.message}`);
    }

    return PredictiveModelSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      modelType: data.model_type,
      modelConfig: data.model_config,
      trainingDataConfig: data.training_data_config,
      accuracyScore: data.accuracy_score,
      isActive: data.is_active,
      lastTrainedAt: data.last_trained_at,
      nextTrainingAt: data.next_training_at,
    });
  }

  async deletePredictiveModel(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('predictive_models')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete predictive model: ${error.message}`);
    }

    return true;
  }

  async getPredictiveModels(query: PredictiveQueryInput): Promise<PredictiveModel[]> {
    let queryBuilder = this.supabase
      .from('predictive_models')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.modelType) {
      queryBuilder = queryBuilder.eq('model_type', query.modelType);
    }

    if (query.isActive !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', query.isActive);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        (query.offset || 0) + (query.limit || 10) - 1,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get predictive models: ${error.message}`);
    }

    return data.map(item =>
      PredictiveModelSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        modelType: item.model_type,
        modelConfig: item.model_config,
        trainingDataConfig: item.training_data_config,
        accuracyScore: item.accuracy_score,
        isActive: item.is_active,
        lastTrainedAt: item.last_trained_at,
        nextTrainingAt: item.next_training_at,
      })
    );
  }

  async trainModel(id: string): Promise<PredictiveModel> {
    // This would integrate with a machine learning service
    // For now, we'll simulate model training
    const { data, error } = await this.supabase
      .from('predictive_models')
      .update({
        last_trained_at: new Date().toISOString(),
        accuracy_score: 0.85, // Mock accuracy score
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to train model: ${error.message}`);
    }

    return PredictiveModelSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      modelType: data.model_type,
      modelConfig: data.model_config,
      trainingDataConfig: data.training_data_config,
      accuracyScore: data.accuracy_score,
      isActive: data.is_active,
      lastTrainedAt: data.last_trained_at,
      nextTrainingAt: data.next_training_at,
    });
  }

  async predictWithModel(id: string, inputData: any): Promise<any> {
    // This would integrate with a machine learning service
    // For now, we'll return mock predictions
    const { data: model, error } = await this.supabase
      .from('predictive_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get model for prediction: ${error.message}`);
    }

    // Mock prediction based on model type
    switch (model.model_type) {
      case 'no_show_prediction':
        return {
          prediction: Math.random() * 0.5 + 0.1, // Random probability between 0.1 and 0.6
          confidence: 0.75,
        };
      case 'revenue_forecast':
        return {
          predictions: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            predicted: Math.random() * 5000 + 1000,
            confidence_lower: Math.random() * 3000 + 500,
            confidence_upper: Math.random() * 7000 + 1500,
          })),
        };
      default:
        return {
          prediction: Math.random(),
          confidence: 0.7,
        };
    }
  }

  // Analytics Alerts
  async createAnalyticsAlert(alert: CreateAnalyticsAlertInput): Promise<AnalyticsAlert> {
    const validatedAlert = CreateAnalyticsAlertInputSchema.parse(alert);

    const { data, error } = await this.supabase
      .from('analytics_alerts')
      .insert({
        clinic_id: validatedAlert.clinicId,
        name: validatedAlert.name,
        alert_type: validatedAlert.alertType,
        condition_config: validatedAlert.conditionConfig,
        severity: validatedAlert.severity || 'medium',
        recipients: validatedAlert.recipients || [],
        is_active: validatedAlert.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analytics alert: ${error.message}`);
    }

    return AnalyticsAlertSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      alertType: data.alert_type,
      conditionConfig: data.condition_config,
      severity: data.severity,
      isActive: data.is_active,
      lastTriggeredAt: data.last_triggered_at,
      createdBy: data.created_by,
    });
  }

  async updateAnalyticsAlert(
    id: string,
    alert: UpdateAnalyticsAlertInput,
  ): Promise<AnalyticsAlert> {
    const validatedAlert = UpdateAnalyticsAlertInputSchema.parse(alert);

    const { data, error } = await this.supabase
      .from('analytics_alerts')
      .update({
        ...(validatedAlert.name !== undefined && { name: validatedAlert.name }),
        ...(validatedAlert.alertType !== undefined && { alert_type: validatedAlert.alertType }),
        ...(validatedAlert.conditionConfig !== undefined
          && { condition_config: validatedAlert.conditionConfig }),
        ...(validatedAlert.severity !== undefined && { severity: validatedAlert.severity }),
        ...(validatedAlert.recipients !== undefined && { recipients: validatedAlert.recipients }),
        ...(validatedAlert.isActive !== undefined && { is_active: validatedAlert.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update analytics alert: ${error.message}`);
    }

    return AnalyticsAlertSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      alertType: data.alert_type,
      conditionConfig: data.condition_config,
      severity: data.severity,
      isActive: data.is_active,
      lastTriggeredAt: data.last_triggered_at,
      createdBy: data.created_by,
    });
  }

  async deleteAnalyticsAlert(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('analytics_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete analytics alert: ${error.message}`);
    }

    return true;
  }

  async getAnalyticsAlerts(query: AlertQueryInput): Promise<AnalyticsAlert[]> {
    let queryBuilder = this.supabase
      .from('analytics_alerts')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.alertType) {
      queryBuilder = queryBuilder.eq('alert_type', query.alertType);
    }

    if (query.severity) {
      queryBuilder = queryBuilder.eq('severity', query.severity);
    }

    if (query.isActive !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', query.isActive);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        (query.offset || 0) + (query.limit || 10) - 1,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get analytics alerts: ${error.message}`);
    }

    return data.map(item =>
      AnalyticsAlertSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        alertType: item.alert_type,
        conditionConfig: item.condition_config,
        severity: item.severity,
        isActive: item.is_active,
        lastTriggeredAt: item.last_triggered_at,
        createdBy: item.created_by,
      })
    );
  }

  async checkAndTriggerAlerts(clinicId: string): Promise<AnalyticsAlert[]> {
    const triggeredAlerts: AnalyticsAlert[] = [];

    // Get all active alerts for the clinic
    const alerts = await this.getAnalyticsAlerts({
      clinicId,
      isActive: true,
    });

    for (const alert of alerts) {
      let shouldTrigger = false;

      switch (alert.alertType) {
        case 'threshold':
          shouldTrigger = await this.checkThresholdAlert(alert, clinicId);
          break;
        case 'trend':
          shouldTrigger = await this.checkTrendAlert(alert, clinicId);
          break;
        case 'anomaly':
          shouldTrigger = await this.checkAnomalyAlert(alert, clinicId);
          break;
        default:
          // Custom alerts would have their own logic
          break;
      }

      if (shouldTrigger) {
        // Update alert trigger info
        await this.supabase
          .from('analytics_alerts')
          .update({
            last_triggered_at: new Date().toISOString(),
            trigger_count: (alert.triggerCount || 0) + 1,
          })
          .eq('id', alert.id);

        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  }

  private async checkThresholdAlert(alert: AnalyticsAlert, clinicId: string): Promise<boolean> {
    const { kpi, operator, value } = alert.conditionConfig;

    if (!kpi || !operator || value === undefined) {
      return false;
    }

    const currentValue = await this.calculateKPIValue(clinicId, kpi);

    switch (operator) {
      case '>':
        return currentValue > value;
      case '<':
        return currentValue < value;
      case '>=':
        return currentValue >= value;
      case '<=':
        return currentValue <= value;
      case '==':
        return currentValue === value;
      default:
        return false;
    }
  }

  private async checkTrendAlert(alert: AnalyticsAlert, clinicId: string): Promise<boolean> {
    // Simplified trend detection - would use more sophisticated algorithms in production
    const { kpi, direction, threshold } = alert.conditionConfig;

    if (!kpi || !direction || threshold === undefined) {
      return false;
    }

    // Get current and previous values
    const currentValue = await this.calculateKPIValue(clinicId, kpi);
    const previousValue = await this.calculateKPIValue(
      clinicId,
      kpi,
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    );

    if (previousValue === 0) return false;

    const change = ((currentValue - previousValue) / previousValue) * 100;

    switch (direction) {
      case 'increasing':
        return change > threshold;
      case 'decreasing':
        return change < -threshold;
      default:
        return false;
    }
  }

  private async checkAnomalyAlert(alert: AnalyticsAlert, clinicId: string): Promise<boolean> {
    // Simplified anomaly detection - would use statistical methods in production
    const { kpi, threshold } = alert.conditionConfig;

    if (!kpi || threshold === undefined) {
      return false;
    }

    // Get historical data for comparison
    const { data, error } = await this.supabase
      .from('analytics_data_warehouse')
      .select('metric_value')
      .eq('clinic_id', clinicId)
      .eq('metric_name', kpi)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data || data.length < 10) {
      return false;
    }

    const values = data.map(d => d.metric_value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const currentValue = await this.calculateKPIValue(clinicId, kpi);
    const zScore = Math.abs((currentValue - mean) / stdDev);

    return zScore > threshold;
  }

  // Data Analytics
  async getAnalyticsData(query: AnalyticsQueryInput): Promise<AnalyticsDataWarehouse[]> {
    let queryBuilder = this.supabase
      .from('analytics_data_warehouse')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.metricName) {
      queryBuilder = queryBuilder.eq('metric_name', query.metricName);
    }

    if (query.category) {
      queryBuilder = queryBuilder.eq('metric_category', query.category);
    }

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('date_date', query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte('date_date', query.endDate);
    }

    queryBuilder = queryBuilder.order('date_date', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get analytics data: ${error.message}`);
    }

    return data.map(item =>
      AnalyticsDataWarehouseSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        date: item.date_date,
        hour: item.hour,
        metricName: item.metric_name,
        metricValue: item.metric_value,
        metricCategory: item.metric_category,
        dimension1: item.dimension_1,
        dimension2: item.dimension_2,
        dimension3: item.dimension_3,
        sourceSystem: item.source_system,
      })
    );
  }

  async getPerformanceMetrics(query: PerformanceMetricsQueryInput): Promise<PerformanceMetrics[]> {
    let queryBuilder = this.supabase
      .from('performance_metrics')
      .select('*')
      .eq('clinic_id', query.clinicId);

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('metric_date', query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte('metric_date', query.endDate);
    }

    queryBuilder = queryBuilder.order('metric_date', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to get performance metrics: ${error.message}`);
    }

    return data.map(item =>
      PerformanceMetricsSchema.parse({
        ...item,
        clinicId: item.clinic_id,
        metricDate: item.metric_date,
        metricHour: item.metric_hour,
        revenueTotal: item.revenue_total,
        revenueTreatments: item.revenue_treatments,
        revenueProducts: item.revenue_products,
        appointmentCount: item.appointment_count,
        newPatients: item.new_patients,
        patientRetentionRate: item.patient_retention_rate,
        treatmentSuccessRate: item.treatment_success_rate,
        inventoryTurnover: item.inventory_turnover,
        professionalUtilization: item.professional_utilization,
        patientSatisfactionScore: item.patient_satisfaction_score,
        noShowRate: item.no_show_rate,
      })
    );
  }

  async aggregateData(clinicId: string, config: any): Promise<any> {
    const { metricName, category, startDate, endDate, dimensions, aggregationType } = config;

    let queryBuilder = this.supabase
      .from('analytics_data_warehouse')
      .select('*')
      .eq('clinic_id', clinicId);

    if (metricName) {
      queryBuilder = queryBuilder.eq('metric_name', metricName);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('metric_category', category);
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('date_date', startDate);
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('date_date', endDate);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to aggregate data: ${error.message}`);
    }

    // Aggregate based on configuration
    const aggregated = this.aggregateByDimensions(data, dimensions, aggregationType);

    return aggregated;
  }

  private aggregateByDimensions(data: any[], dimensions: string[], aggregationType: string): any {
    const groups: { [key: string]: any[] } = {};

    // Group by dimensions
    data.forEach(item => {
      const key = dimensions.map(dim => item[dim] || 'all').join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item.metric_value);
    });

    // Aggregate values
    const result: any = {};
    Object.keys(groups).forEach(key => {
      const values = groups[key];
      let aggregatedValue: number;

      switch (aggregationType) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0);
      }

      result[key] = aggregatedValue;
    });

    return result;
  }

  async generateComparativeAnalysis(
    clinicId: string,
    comparisonType: string,
    baselinePeriod: any,
    comparisonPeriod: any,
  ): Promise<ComparativeAnalytics> {
    // Get data for both periods
    const baselineData = await this.getAnalyticsData({
      clinicId,
      startDate: baselinePeriod.startDate,
      endDate: baselinePeriod.endDate,
    });

    const comparisonData = await this.getAnalyticsData({
      clinicId,
      startDate: comparisonPeriod.startDate,
      endDate: comparisonPeriod.endDate,
    });

    // Calculate metrics and comparisons
    const metrics = this.calculateComparativeMetrics(baselineData, comparisonData);
    const insights = this.generateInsights(metrics, comparisonType);
    const recommendations = this.generateRecommendations(insights, comparisonType);

    // Save the analysis
    const { data, error } = await this.supabase
      .from('comparative_analytics')
      .insert({
        clinic_id: clinicId,
        comparison_type: comparisonType,
        baseline_period: baselinePeriod,
        comparison_period: comparisonPeriod,
        metrics,
        insights,
        recommendations,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comparative analysis: ${error.message}`);
    }

    return ComparativeAnalyticsSchema.parse({
      ...data,
      clinicId: data.clinic_id,
      comparisonType: data.comparison_type,
      baselinePeriod: data.baseline_period,
      comparisonPeriod: data.comparison_period,
      createdBy: data.created_by,
    });
  }

  private calculateComparativeMetrics(baselineData: any[], comparisonData: any[]): any {
    const baselineMetrics = this.aggregateByMetrics(baselineData);
    const comparisonMetrics = this.aggregateByMetrics(comparisonData);

    const result: any = {};
    Object.keys(baselineMetrics).forEach(metric => {
      const baseline = baselineMetrics[metric];
      const comparison = comparisonMetrics[metric] || 0;
      const change = baseline > 0 ? ((comparison - baseline) / baseline) * 100 : 0;

      result[metric] = {
        baseline,
        comparison,
        change,
        absoluteChange: comparison - baseline,
      };
    });

    return result;
  }

  private aggregateByMetrics(data: any[]): any {
    const metrics: { [key: string]: number } = {};

    data.forEach(item => {
      if (!metrics[item.metric_name]) {
        metrics[item.metric_name] = 0;
      }
      metrics[item.metric_name] += item.metric_value;
    });

    return metrics;
  }

  private generateInsights(metrics: any, comparisonType: string): string[] {
    const insights: string[] = [];

    Object.keys(metrics).forEach(metric => {
      const { baseline, comparison, change } = metrics[metric];

      if (Math.abs(change) > 10) {
        const direction = change > 0 ? 'aumentou' : 'diminuiu';
        insights.push(
          `${metric} ${direction} ${
            Math.abs(change).toFixed(1)
          }% em comparação com o período anterior`,
        );
      }

      if (comparison > baseline * 1.5) {
        insights.push(
          `${metric} mostrou crescimento significativo de ${
            ((comparison - baseline) / baseline * 100).toFixed(1)
          }%`,
        );
      }

      if (comparison < baseline * 0.5) {
        insights.push(
          `${metric} apresentou queda preocupante de ${
            ((baseline - comparison) / baseline * 100).toFixed(1)
          }%`,
        );
      }
    });

    return insights;
  }

  private generateRecommendations(insights: string[], comparisonType: string): string[] {
    const recommendations: string[] = [];

    insights.forEach(insight => {
      if (insight.includes('aumentou') && insight.includes('pacientes')) {
        recommendations.push(
          'Considere expandir a capacidade de atendimento ou adicionar mais profissionais',
        );
      }

      if (insight.includes('diminuiu') && insight.includes('receita')) {
        recommendations.push(
          'Analise as causas da queda de receita e implemente estratégias de recuperação',
        );
      }

      if (insight.includes('crescimento significativo')) {
        recommendations.push(
          'Monitore de perto este indicador para garantir sustentabilidade do crescimento',
        );
      }

      if (insight.includes('queda preocupante')) {
        recommendations.push('Investigue imediatamente as causas e implemente ações corretivas');
      }
    });

    return recommendations;
  }

  // Data Export
  async createDataExport(exportData: DataExportInput): Promise<any> {
    const validatedExport = DataExportInputSchema.parse(exportData);

    const { data, error } = await this.supabase
      .from('data_export_requests')
      .insert({
        clinic_id: validatedExport.clinicId,
        request_type: validatedExport.requestType,
        filters: validatedExport.filters || {},
        format: validatedExport.format || 'csv',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create data export: ${error.message}`);
    }

    return {
      ...data,
      clinicId: data.clinic_id,
      requestType: data.request_type,
      filters: data.filters,
      format: data.format,
      status: data.status,
    };
  }

  async getDataExports(clinicId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('data_export_requests')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get data exports: ${error.message}`);
    }

    return data.map(item => ({
      ...item,
      clinicId: item.clinic_id,
      requestType: item.request_type,
      filters: item.filters,
      format: item.format,
      status: item.status,
    }));
  }

  async downloadExport(id: string): Promise<Blob> {
    const { data, error } = await this.supabase
      .from('data_export_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get export: ${error.message}`);
    }

    if (data.status !== 'completed' || !data.file_url) {
      throw new Error('Export is not ready for download');
    }

    // In a real implementation, this would download the file from storage
    // For now, we'll return a mock blob
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  // Real-time Analytics
  async trackEvent(
    clinicId: string,
    eventType: string,
    eventData: any,
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('analytics_events')
      .insert({
        clinic_id: clinicId,
        event_type: eventType,
        event_data: eventData,
        user_id: userId,
        session_id: sessionId,
      });

    if (error) {
      logHealthcareError('analytics', error, { method: 'trackAnalyticsEvent', eventType, userId });
    }
  }

  async getRealtimeMetrics(clinicId: string): Promise<any> {
    // Get today's performance metrics
    const today = new Date().toISOString().split('T')[0];
    const metrics = await this.getPerformanceMetrics({
      clinicId,
      startDate: today,
      endDate: today,
      limit: 1,
    });

    if (metrics.length === 0) {
      return {
        revenueTotal: 0,
        appointmentCount: 0,
        newPatients: 0,
        noShowRate: 0,
      };
    }

    return {
      revenueTotal: metrics[0].revenueTotal,
      appointmentCount: metrics[0].appointmentCount,
      newPatients: metrics[0].newPatients,
      noShowRate: metrics[0].noShowRate,
    };
  }

  async getDashboardData(dashboardId: string): Promise<any> {
    const dashboard = await this.getBIDashboardById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const widgets = await this.getDashboardWidgets(dashboardId);
    const widgetData: any = {};

    for (const widget of widgets) {
      try {
        widgetData[widget.id] = await this.getWidgetData(widget);
      } catch (error) {
        logHealthcareError('analytics', error, {
          method: 'getBIDashboardData',
          widgetId: widget.id,
        });
        widgetData[widget.id] = { error: 'Failed to load data' };
      }
    }

    return {
      dashboard,
      widgets,
      widgetData,
    };
  }

  private async getWidgetData(widget: DashboardWidget): Promise<any> {
    const { dataSource, configuration } = widget;

    switch (dataSource) {
      case 'kpi':
        const kpiName = configuration.kpiName;
        const value = await this.calculateKPIValue('placeholder-clinic-id', kpiName); // Would use actual clinic ID
        return { value, format: configuration.format || 'number' };

      case 'time_series':
        const days = configuration.period || 7;
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

        const timeSeriesData = await this.getAnalyticsData({
          clinicId: 'placeholder-clinic-id', // Would use actual clinic ID
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          metricName: configuration.metrics?.[0] || 'revenue_total',
        });

        return {
          data: timeSeriesData.map(item => ({
            date: item.date,
            value: item.metricValue,
          })),
        };

      default:
        return { message: 'Unsupported data source' };
    }
  }

  // Predictive Analytics
  async predictNoShowProbability(
    patientId: string,
    clinicId: string,
    appointmentDate: string,
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('predict_no_show_probability', {
      p_patient_id: patientId,
      p_clinic_id: clinicId,
      p_appointment_date: appointmentDate,
    });

    if (error) {
      throw new Error(`Failed to predict no-show probability: ${error.message}`);
    }

    return data;
  }

  async generateRevenueForecast(clinicId: string, forecastDays: number): Promise<any> {
    const { data, error } = await this.supabase.rpc('generate_revenue_forecast', {
      p_clinic_id: clinicId,
      p_forecast_days: forecastDays,
    });

    if (error) {
      throw new Error(`Failed to generate revenue forecast: ${error.message}`);
    }

    return data;
  }

  async predictInventoryDemand(
    clinicId: string,
    productId: string,
    forecastDays: number,
  ): Promise<any> {
    // This would integrate with a machine learning service
    // For now, we'll return mock predictions
    const forecast = Array.from({ length: forecastDays }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predictedDemand: Math.floor(Math.random() * 10) + 1,
      confidence: 0.7 + Math.random() * 0.2,
    }));

    return forecast;
  }

  async predictPatientRetention(clinicId: string, patientId: string): Promise<number> {
    // This would integrate with a machine learning service
    // For now, we'll return a mock prediction
    const { data, error } = await this.supabase
      .from('appointments')
      .select('appointment_date')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('appointment_date', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to get patient history: ${error.message}`);
    }

    // Simple heuristic based on appointment frequency
    if (data.length < 2) return 0.5;

    const appointments = data.map(d => new Date(d.appointment_date).getTime());
    const intervals = [];
    for (let i = 1; i < appointments.length; i++) {
      intervals.push(appointments[i - 1] - appointments[i]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastAppointment = appointments[0];
    const timeSinceLast = Date.now() - lastAppointment;

    // Predict retention based on time since last appointment vs average interval
    const retentionProbability = Math.max(0, Math.min(1, 1 - (timeSinceLast / avgInterval)));

    return retentionProbability;
  }
}
