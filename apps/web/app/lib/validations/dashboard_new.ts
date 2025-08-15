import { z } from 'zod';

// Layout Configuration
export const layoutConfigSchema = z.object({
  layout: z.enum(['grid', 'flex', 'masonry']),
  columns: z.number().min(1).max(12),
  rowHeight: z.number().min(20).max(500),
  compactType: z.enum(['vertical', 'horizontal']).nullable().optional(),
  margin: z.tuple([z.number(), z.number()]).optional(),
  containerPadding: z.tuple([z.number(), z.number()]).optional(),
  breakpoints: z.object({
    lg: z.number(),
    md: z.number(),
    sm: z.number(),
    xs: z.number(),
    xxs: z.number(),
  }).optional(),
});

// Widget Preferences
export const widgetPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  autoRefresh: z.boolean(),
  refreshInterval: z.number().min(1000).max(300000), // 1s to 5min
  showAnimations: z.boolean(),
  colorScheme: z.array(z.string()).optional(),
  dateFormat: z.string().optional(),
  numberFormat: z.string().optional(),
});

// Widget Configuration
export const widgetConfigurationSchema = z.object({
  chartType: z.enum(['line', 'bar', 'pie', 'area', 'scatter', 'donut']).optional(),
  timeRange: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  aggregation: z.enum(['sum', 'average', 'count', 'min', 'max']).optional(),
  filters: z.record(z.any()).optional(),
  colors: z.array(z.string()).optional(),
  showLegend: z.boolean().optional(),
  showGrid: z.boolean().optional(),
  showTooltip: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  yAxisLabel: z.string().optional(),
  xAxisLabel: z.string().optional(),
  valueFormat: z.string().optional(),
  customQuery: z.string().optional(),
  refreshInterval: z.number().min(1000).max(300000).optional(),
});

// Dashboard Configuration
export const dashboardConfigSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  layout_config: layoutConfigSchema,
  widget_preferences: widgetPreferencesSchema,
  update_frequency: z.number().min(1000).max(3600000),
  is_default: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createDashboardConfigSchema = z.object({
  layout_config: layoutConfigSchema,
  widget_preferences: widgetPreferencesSchema,
  update_frequency: z.number().min(1000).max(3600000).optional().default(30000),
  is_default: z.boolean().optional().default(false),
});

export const updateDashboardConfigSchema = z.object({
  layout_config: layoutConfigSchema.optional(),
  widget_preferences: widgetPreferencesSchema.optional(),
  update_frequency: z.number().min(1000).max(3600000).optional(),
  is_default: z.boolean().optional(),
});

// Dashboard Widget
export const dashboardWidgetSchema = z.object({
  id: z.string().uuid(),
  config_id: z.string().uuid(),
  widget_type: z.enum(['chart', 'metric', 'table', 'alert', 'progress', 'gauge']),
  widget_name: z.string().min(1).max(100),
  data_source: z.string().min(1).max(100),
  position_x: z.number().min(0),
  position_y: z.number().min(0),
  width: z.number().min(1).max(12),
  height: z.number().min(1).max(20),
  configuration: widgetConfigurationSchema,
  is_visible: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createWidgetSchema = z.object({
  config_id: z.string().uuid(),
  widget_type: z.enum(['chart', 'metric', 'table', 'alert', 'progress', 'gauge']),
  widget_name: z.string().min(1).max(100),
  data_source: z.string().min(1).max(100),
  position_x: z.number().min(0),
  position_y: z.number().min(0),
  width: z.number().min(1).max(12),
  height: z.number().min(1).max(20),
  configuration: widgetConfigurationSchema,
  is_visible: z.boolean().optional().default(true),
});

export const updateWidgetSchema = z.object({
  widget_type: z.enum(['chart', 'metric', 'table', 'alert', 'progress', 'gauge']).optional(),
  widget_name: z.string().min(1).max(100).optional(),
  data_source: z.string().min(1).max(100).optional(),
  position_x: z.number().min(0).optional(),
  position_y: z.number().min(0).optional(),
  width: z.number().min(1).max(12).optional(),
  height: z.number().min(1).max(20).optional(),
  configuration: widgetConfigurationSchema.optional(),
  is_visible: z.boolean().optional(),
});

// KPI Metrics
export const kpiMetricSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  metric_name: z.string().min(1).max(100),
  metric_value: z.number(),
  metric_type: z.enum(['revenue', 'patient', 'appointment', 'efficiency']),
  calculation_date: z.string().datetime(),
  calculation_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const kpiCalculationRequestSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  calculation_date: z.string().datetime().optional(),
  metrics: z.array(z.string()).optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
});

// Dashboard Alerts
export const dashboardAlertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  alert_type: z.enum(['revenue_drop', 'low_bookings', 'high_cancellations', 'efficiency_warning']),
  metric_name: z.string().min(1).max(100),
  threshold_value: z.number(),
  threshold_operator: z.enum(['less_than', 'greater_than', 'equals']),
  notification_method: z.enum(['email', 'sms', 'push', 'dashboard']),
  is_active: z.boolean(),
  last_triggered_at: z.string().datetime().optional(),
  trigger_count: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createAlertSchema = z.object({
  alert_type: z.enum(['revenue_drop', 'low_bookings', 'high_cancellations', 'efficiency_warning']),
  metric_name: z.string().min(1).max(100),
  threshold_value: z.number(),
  threshold_operator: z.enum(['less_than', 'greater_than', 'equals']).optional().default('less_than'),
  notification_method: z.enum(['email', 'sms', 'push', 'dashboard']).optional().default('dashboard'),
});

export const updateAlertSchema = z.object({
  alert_type: z.enum(['revenue_drop', 'low_bookings', 'high_cancellations', 'efficiency_warning']).optional(),
  metric_name: z.string().min(1).max(100).optional(),
  threshold_value: z.number().optional(),
  threshold_operator: z.enum(['less_than', 'greater_than', 'equals']).optional(),
  notification_method: z.enum(['email', 'sms', 'push', 'dashboard']).optional(),
  is_active: z.boolean().optional(),
});

// Performance Logs
export const performanceLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  dashboard_load_time: z.number().min(0),
  data_fetch_time: z.number().min(0),
  widget_count: z.number().min(0),
  error_count: z.number().min(0),
  timestamp: z.string().datetime(),
});

export const createPerformanceLogSchema = z.object({
  dashboard_load_time: z.number().min(0),
  data_fetch_time: z.number().min(0),
  widget_count: z.number().min(0),
  error_count: z.number().min(0).optional().default(0),
});

// Dashboard Cache
export const dashboardCacheSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  cache_key: z.string().min(1).max(200),
  cache_data: z.any(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

// Export Data Schemas
export const dashboardExportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv', 'png']),
  widgets: z.array(z.string().uuid()).optional(),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  include_charts: z.boolean().optional().default(true),
  include_data: z.boolean().optional().default(true),
});

// Query Parameters
export const dashboardQueryParamsSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  config_id: z.string().uuid().optional(),
  widget_id: z.string().uuid().optional(),
  time_range: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  refresh: z.boolean().optional(),
  cache: z.boolean().optional().default(true),
});

export const widgetDataQuerySchema = z.object({
  widget_id: z.string().uuid(),
  time_range: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  aggregation: z.enum(['sum', 'average', 'count', 'min', 'max']).optional(),
  filters: z.record(z.any()).optional(),
});

// Metrics Data Schemas
export const trendPointSchema = z.object({
  date: z.string().datetime(),
  value: z.number(),
  change: z.number().optional(),
  percentage_change: z.number().optional(),
});

export const forecastPointSchema = z.object({
  date: z.string().datetime(),
  predicted_value: z.number(),
  confidence_lower: z.number(),
  confidence_upper: z.number(),
  accuracy: z.number().optional(),
});

export const serviceRevenueSchema = z.object({
  service_name: z.string(),
  revenue: z.number(),
  percentage: z.number(),
  count: z.number(),
});

export const patientSegmentSchema = z.object({
  segment: z.string(),
  count: z.number(),
  percentage: z.number(),
  avg_value: z.number(),
});

export const acquisitionSourceSchema = z.object({
  source: z.string(),
  count: z.number(),
  percentage: z.number(),
  cost_per_acquisition: z.number().optional(),
});

export const appointmentTypeSchema = z.object({
  type: z.string(),
  count: z.number(),
  percentage: z.number(),
  average_duration: z.number(),
  revenue: z.number(),
});

export const timeSlotDataSchema = z.object({
  hour: z.number().min(0).max(23),
  bookings: z.number(),
  capacity: z.number(),
  utilization: z.number(),
});

// Comprehensive Dashboard Data
export const revenueMetricsSchema = z.object({
  daily_revenue: z.number(),
  weekly_revenue: z.number(),
  monthly_revenue: z.number(),
  revenue_growth: z.number(),
  average_transaction: z.number(),
  revenue_by_service: z.array(serviceRevenueSchema),
  revenue_trend: z.array(trendPointSchema),
  revenue_forecast: z.array(forecastPointSchema),
});

export const patientMetricsSchema = z.object({
  new_patients: z.number(),
  returning_patients: z.number(),
  total_patients: z.number(),
  patient_growth: z.number(),
  retention_rate: z.number(),
  lifetime_value: z.number(),
  patient_segmentation: z.array(patientSegmentSchema),
  acquisition_sources: z.array(acquisitionSourceSchema),
});

export const appointmentMetricsSchema = z.object({
  total_appointments: z.number(),
  booking_rate: z.number(),
  cancellation_rate: z.number(),
  no_show_rate: z.number(),
  utilization_rate: z.number(),
  average_booking_lead_time: z.number(),
  appointment_types: z.array(appointmentTypeSchema),
  time_slot_analysis: z.array(timeSlotDataSchema),
});

export const efficiencyMetricsSchema = z.object({
  staff_productivity: z.number(),
  resource_utilization: z.number(),
  treatment_efficiency: z.number(),
  wait_time_average: z.number(),
  service_completion_rate: z.number(),
  cost_per_patient: z.number(),
  profit_margin: z.number(),
  operational_efficiency: z.number(),
});

export const trendDataSchema = z.object({
  period: z.string(),
  revenue: z.number(),
  patients: z.number(),
  appointments: z.number(),
  growth_rate: z.number(),
  efficiency_score: z.number(),
});

export const performanceMetricsSchema = z.object({
  average_load_time: z.number(),
  data_freshness: z.number(),
  cache_hit_rate: z.number(),
  error_rate: z.number(),
  uptime_percentage: z.number(),
  concurrent_users: z.number(),
});

export const dashboardDataSchema = z.object({
  revenue: revenueMetricsSchema,
  patients: patientMetricsSchema,
  appointments: appointmentMetricsSchema,
  efficiency: efficiencyMetricsSchema,
  trends: z.array(trendDataSchema),
  alerts: z.array(dashboardAlertSchema),
  performance: performanceMetricsSchema,
});

export const dashboardSummarySchema = z.object({
  total_revenue: z.number(),
  total_patients: z.number(),
  total_appointments: z.number(),
  efficiency_score: z.number(),
  growth_rate: z.number(),
  alert_count: z.number(),
  last_updated: z.string().datetime(),
  performance_score: z.number(),
});

// Response Schemas
export const dashboardResponseSchema = z.object({
  success: z.boolean(),
  data: dashboardDataSchema,
  performance: z.object({
    load_time: z.number(),
    data_fetch_time: z.number(),
    cache_hit: z.boolean(),
  }),
  alerts: z.array(dashboardAlertSchema),
  last_updated: z.string().datetime(),
});

export const widgetDataResponseSchema = z.object({
  widget_id: z.string().uuid(),
  data: z.any(),
  metadata: z.object({
    last_updated: z.string().datetime(),
    data_points: z.number(),
    calculation_time: z.number(),
  }),
  error: z.string().optional(),
});

export const kpiResponseSchema = z.object({
  clinic_id: z.string().uuid(),
  metrics: z.array(kpiMetricSchema),
  calculation_date: z.string().datetime(),
  summary: dashboardSummarySchema,
  trends: z.array(trendDataSchema),
});

// Type exports for runtime use
export type DashboardConfigInput = z.infer<typeof createDashboardConfigSchema>;
export type DashboardConfigUpdate = z.infer<typeof updateDashboardConfigSchema>;
export type WidgetInput = z.infer<typeof createWidgetSchema>;
export type WidgetUpdate = z.infer<typeof updateWidgetSchema>;
export type AlertInput = z.infer<typeof createAlertSchema>;
export type AlertUpdate = z.infer<typeof updateAlertSchema>;
export type KPICalculationRequest = z.infer<typeof kpiCalculationRequestSchema>;
export type DashboardExportRequest = z.infer<typeof dashboardExportSchema>;
export type DashboardQueryParams = z.infer<typeof dashboardQueryParamsSchema>;
export type WidgetDataQuery = z.infer<typeof widgetDataQuerySchema>;
export type PerformanceLogInput = z.infer<typeof createPerformanceLogSchema>;
