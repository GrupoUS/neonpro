Object.defineProperty(exports, "__esModule", { value: true });
exports.kpiResponseSchema =
  exports.widgetDataResponseSchema =
  exports.dashboardResponseSchema =
  exports.dashboardSummarySchema =
  exports.dashboardDataSchema =
  exports.performanceMetricsSchema =
  exports.trendDataSchema =
  exports.efficiencyMetricsSchema =
  exports.appointmentMetricsSchema =
  exports.patientMetricsSchema =
  exports.revenueMetricsSchema =
  exports.timeSlotDataSchema =
  exports.appointmentTypeSchema =
  exports.acquisitionSourceSchema =
  exports.patientSegmentSchema =
  exports.serviceRevenueSchema =
  exports.forecastPointSchema =
  exports.trendPointSchema =
  exports.widgetDataQuerySchema =
  exports.dashboardQueryParamsSchema =
  exports.dashboardExportSchema =
  exports.dashboardCacheSchema =
  exports.createPerformanceLogSchema =
  exports.performanceLogSchema =
  exports.updateAlertSchema =
  exports.createAlertSchema =
  exports.dashboardAlertSchema =
  exports.kpiCalculationRequestSchema =
  exports.kpiMetricSchema =
  exports.updateWidgetSchema =
  exports.createWidgetSchema =
  exports.dashboardWidgetSchema =
  exports.updateDashboardConfigSchema =
  exports.createDashboardConfigSchema =
  exports.dashboardConfigSchema =
  exports.widgetConfigurationSchema =
  exports.widgetPreferencesSchema =
  exports.layoutConfigSchema =
    void 0;
var zod_1 = require("zod");
// Layout Configuration
exports.layoutConfigSchema = zod_1.z.object({
  layout: zod_1.z.enum(["grid", "flex", "masonry"]),
  columns: zod_1.z.number().min(1).max(12),
  rowHeight: zod_1.z.number().min(20).max(500),
  compactType: zod_1.z.enum(["vertical", "horizontal"]).nullable().optional(),
  margin: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
  containerPadding: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
  breakpoints: zod_1.z
    .object({
      lg: zod_1.z.number(),
      md: zod_1.z.number(),
      sm: zod_1.z.number(),
      xs: zod_1.z.number(),
      xxs: zod_1.z.number(),
    })
    .optional(),
});
// Widget Preferences
exports.widgetPreferencesSchema = zod_1.z.object({
  theme: zod_1.z.enum(["light", "dark", "auto"]),
  autoRefresh: zod_1.z.boolean(),
  refreshInterval: zod_1.z.number().min(1000).max(300000), // 1s to 5min
  showAnimations: zod_1.z.boolean(),
  colorScheme: zod_1.z.array(zod_1.z.string()).optional(),
  dateFormat: zod_1.z.string().optional(),
  numberFormat: zod_1.z.string().optional(),
});
// Widget Configuration
exports.widgetConfigurationSchema = zod_1.z.object({
  chartType: zod_1.z.enum(["line", "bar", "pie", "area", "scatter", "donut"]).optional(),
  timeRange: zod_1.z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
  aggregation: zod_1.z.enum(["sum", "average", "count", "min", "max"]).optional(),
  filters: zod_1.z.record(zod_1.z.any()).optional(),
  colors: zod_1.z.array(zod_1.z.string()).optional(),
  showLegend: zod_1.z.boolean().optional(),
  showGrid: zod_1.z.boolean().optional(),
  showTooltip: zod_1.z.boolean().optional(),
  title: zod_1.z.string().optional(),
  subtitle: zod_1.z.string().optional(),
  yAxisLabel: zod_1.z.string().optional(),
  xAxisLabel: zod_1.z.string().optional(),
  valueFormat: zod_1.z.string().optional(),
  customQuery: zod_1.z.string().optional(),
  refreshInterval: zod_1.z.number().min(1000).max(300000).optional(),
});
// Dashboard Configuration
exports.dashboardConfigSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  user_id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid().optional(),
  layout_config: exports.layoutConfigSchema,
  widget_preferences: exports.widgetPreferencesSchema,
  update_frequency: zod_1.z.number().min(1000).max(3600000),
  is_default: zod_1.z.boolean(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.createDashboardConfigSchema = zod_1.z.object({
  layout_config: exports.layoutConfigSchema,
  widget_preferences: exports.widgetPreferencesSchema,
  update_frequency: zod_1.z.number().min(1000).max(3600000).optional().default(30000),
  is_default: zod_1.z.boolean().optional().default(false),
});
exports.updateDashboardConfigSchema = zod_1.z.object({
  layout_config: exports.layoutConfigSchema.optional(),
  widget_preferences: exports.widgetPreferencesSchema.optional(),
  update_frequency: zod_1.z.number().min(1000).max(3600000).optional(),
  is_default: zod_1.z.boolean().optional(),
});
// Dashboard Widget
exports.dashboardWidgetSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  config_id: zod_1.z.string().uuid(),
  widget_type: zod_1.z.enum(["chart", "metric", "table", "alert", "progress", "gauge"]),
  widget_name: zod_1.z.string().min(1).max(100),
  data_source: zod_1.z.string().min(1).max(100),
  position_x: zod_1.z.number().min(0),
  position_y: zod_1.z.number().min(0),
  width: zod_1.z.number().min(1).max(12),
  height: zod_1.z.number().min(1).max(20),
  configuration: exports.widgetConfigurationSchema,
  is_visible: zod_1.z.boolean(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.createWidgetSchema = zod_1.z.object({
  config_id: zod_1.z.string().uuid(),
  widget_type: zod_1.z.enum(["chart", "metric", "table", "alert", "progress", "gauge"]),
  widget_name: zod_1.z.string().min(1).max(100),
  data_source: zod_1.z.string().min(1).max(100),
  position_x: zod_1.z.number().min(0),
  position_y: zod_1.z.number().min(0),
  width: zod_1.z.number().min(1).max(12),
  height: zod_1.z.number().min(1).max(20),
  configuration: exports.widgetConfigurationSchema,
  is_visible: zod_1.z.boolean().optional().default(true),
});
exports.updateWidgetSchema = zod_1.z.object({
  widget_type: zod_1.z.enum(["chart", "metric", "table", "alert", "progress", "gauge"]).optional(),
  widget_name: zod_1.z.string().min(1).max(100).optional(),
  data_source: zod_1.z.string().min(1).max(100).optional(),
  position_x: zod_1.z.number().min(0).optional(),
  position_y: zod_1.z.number().min(0).optional(),
  width: zod_1.z.number().min(1).max(12).optional(),
  height: zod_1.z.number().min(1).max(20).optional(),
  configuration: exports.widgetConfigurationSchema.optional(),
  is_visible: zod_1.z.boolean().optional(),
});
// KPI Metrics
exports.kpiMetricSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid().optional(),
  metric_name: zod_1.z.string().min(1).max(100),
  metric_value: zod_1.z.number(),
  metric_type: zod_1.z.enum(["revenue", "patient", "appointment", "efficiency"]),
  calculation_date: zod_1.z.string().datetime(),
  calculation_period: zod_1.z.enum(["daily", "weekly", "monthly", "yearly"]),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.kpiCalculationRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid().optional(),
  calculation_date: zod_1.z.string().datetime().optional(),
  metrics: zod_1.z.array(zod_1.z.string()).optional(),
  period: zod_1.z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
});
// Dashboard Alerts
exports.dashboardAlertSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  user_id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid().optional(),
  alert_type: zod_1.z.enum([
    "revenue_drop",
    "low_bookings",
    "high_cancellations",
    "efficiency_warning",
  ]),
  metric_name: zod_1.z.string().min(1).max(100),
  threshold_value: zod_1.z.number(),
  threshold_operator: zod_1.z.enum(["less_than", "greater_than", "equals"]),
  notification_method: zod_1.z.enum(["email", "sms", "push", "dashboard"]),
  is_active: zod_1.z.boolean(),
  last_triggered_at: zod_1.z.string().datetime().optional(),
  trigger_count: zod_1.z.number().min(0),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.createAlertSchema = zod_1.z.object({
  alert_type: zod_1.z.enum([
    "revenue_drop",
    "low_bookings",
    "high_cancellations",
    "efficiency_warning",
  ]),
  metric_name: zod_1.z.string().min(1).max(100),
  threshold_value: zod_1.z.number(),
  threshold_operator: zod_1.z
    .enum(["less_than", "greater_than", "equals"])
    .optional()
    .default("less_than"),
  notification_method: zod_1.z
    .enum(["email", "sms", "push", "dashboard"])
    .optional()
    .default("dashboard"),
});
exports.updateAlertSchema = zod_1.z.object({
  alert_type: zod_1.z
    .enum(["revenue_drop", "low_bookings", "high_cancellations", "efficiency_warning"])
    .optional(),
  metric_name: zod_1.z.string().min(1).max(100).optional(),
  threshold_value: zod_1.z.number().optional(),
  threshold_operator: zod_1.z.enum(["less_than", "greater_than", "equals"]).optional(),
  notification_method: zod_1.z.enum(["email", "sms", "push", "dashboard"]).optional(),
  is_active: zod_1.z.boolean().optional(),
});
// Performance Logs
exports.performanceLogSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  user_id: zod_1.z.string().uuid().optional(),
  clinic_id: zod_1.z.string().uuid().optional(),
  dashboard_load_time: zod_1.z.number().min(0),
  data_fetch_time: zod_1.z.number().min(0),
  widget_count: zod_1.z.number().min(0),
  error_count: zod_1.z.number().min(0),
  timestamp: zod_1.z.string().datetime(),
});
exports.createPerformanceLogSchema = zod_1.z.object({
  dashboard_load_time: zod_1.z.number().min(0),
  data_fetch_time: zod_1.z.number().min(0),
  widget_count: zod_1.z.number().min(0),
  error_count: zod_1.z.number().min(0).optional().default(0),
});
// Dashboard Cache
exports.dashboardCacheSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid().optional(),
  cache_key: zod_1.z.string().min(1).max(200),
  cache_data: zod_1.z.any(),
  expires_at: zod_1.z.string().datetime(),
  created_at: zod_1.z.string().datetime(),
});
// Export Data Schemas
exports.dashboardExportSchema = zod_1.z.object({
  format: zod_1.z.enum(["pdf", "excel", "csv", "png"]),
  widgets: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  date_range: zod_1.z
    .object({
      start: zod_1.z.string().datetime(),
      end: zod_1.z.string().datetime(),
    })
    .optional(),
  include_charts: zod_1.z.boolean().optional().default(true),
  include_data: zod_1.z.boolean().optional().default(true),
});
// Query Parameters
exports.dashboardQueryParamsSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid().optional(),
  config_id: zod_1.z.string().uuid().optional(),
  widget_id: zod_1.z.string().uuid().optional(),
  time_range: zod_1.z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
  start_date: zod_1.z.string().datetime().optional(),
  end_date: zod_1.z.string().datetime().optional(),
  refresh: zod_1.z.boolean().optional(),
  cache: zod_1.z.boolean().optional().default(true),
});
exports.widgetDataQuerySchema = zod_1.z.object({
  widget_id: zod_1.z.string().uuid(),
  time_range: zod_1.z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
  start_date: zod_1.z.string().datetime().optional(),
  end_date: zod_1.z.string().datetime().optional(),
  aggregation: zod_1.z.enum(["sum", "average", "count", "min", "max"]).optional(),
  filters: zod_1.z.record(zod_1.z.any()).optional(),
});
// Metrics Data Schemas
exports.trendPointSchema = zod_1.z.object({
  date: zod_1.z.string().datetime(),
  value: zod_1.z.number(),
  change: zod_1.z.number().optional(),
  percentage_change: zod_1.z.number().optional(),
});
exports.forecastPointSchema = zod_1.z.object({
  date: zod_1.z.string().datetime(),
  predicted_value: zod_1.z.number(),
  confidence_lower: zod_1.z.number(),
  confidence_upper: zod_1.z.number(),
  accuracy: zod_1.z.number().optional(),
});
exports.serviceRevenueSchema = zod_1.z.object({
  service_name: zod_1.z.string(),
  revenue: zod_1.z.number(),
  percentage: zod_1.z.number(),
  count: zod_1.z.number(),
});
exports.patientSegmentSchema = zod_1.z.object({
  segment: zod_1.z.string(),
  count: zod_1.z.number(),
  percentage: zod_1.z.number(),
  avg_value: zod_1.z.number(),
});
exports.acquisitionSourceSchema = zod_1.z.object({
  source: zod_1.z.string(),
  count: zod_1.z.number(),
  percentage: zod_1.z.number(),
  cost_per_acquisition: zod_1.z.number().optional(),
});
exports.appointmentTypeSchema = zod_1.z.object({
  type: zod_1.z.string(),
  count: zod_1.z.number(),
  percentage: zod_1.z.number(),
  average_duration: zod_1.z.number(),
  revenue: zod_1.z.number(),
});
exports.timeSlotDataSchema = zod_1.z.object({
  hour: zod_1.z.number().min(0).max(23),
  bookings: zod_1.z.number(),
  capacity: zod_1.z.number(),
  utilization: zod_1.z.number(),
});
// Comprehensive Dashboard Data
exports.revenueMetricsSchema = zod_1.z.object({
  daily_revenue: zod_1.z.number(),
  weekly_revenue: zod_1.z.number(),
  monthly_revenue: zod_1.z.number(),
  revenue_growth: zod_1.z.number(),
  average_transaction: zod_1.z.number(),
  revenue_by_service: zod_1.z.array(exports.serviceRevenueSchema),
  revenue_trend: zod_1.z.array(exports.trendPointSchema),
  revenue_forecast: zod_1.z.array(exports.forecastPointSchema),
});
exports.patientMetricsSchema = zod_1.z.object({
  new_patients: zod_1.z.number(),
  returning_patients: zod_1.z.number(),
  total_patients: zod_1.z.number(),
  patient_growth: zod_1.z.number(),
  retention_rate: zod_1.z.number(),
  lifetime_value: zod_1.z.number(),
  patient_segmentation: zod_1.z.array(exports.patientSegmentSchema),
  acquisition_sources: zod_1.z.array(exports.acquisitionSourceSchema),
});
exports.appointmentMetricsSchema = zod_1.z.object({
  total_appointments: zod_1.z.number(),
  booking_rate: zod_1.z.number(),
  cancellation_rate: zod_1.z.number(),
  no_show_rate: zod_1.z.number(),
  utilization_rate: zod_1.z.number(),
  average_booking_lead_time: zod_1.z.number(),
  appointment_types: zod_1.z.array(exports.appointmentTypeSchema),
  time_slot_analysis: zod_1.z.array(exports.timeSlotDataSchema),
});
exports.efficiencyMetricsSchema = zod_1.z.object({
  staff_productivity: zod_1.z.number(),
  resource_utilization: zod_1.z.number(),
  treatment_efficiency: zod_1.z.number(),
  wait_time_average: zod_1.z.number(),
  service_completion_rate: zod_1.z.number(),
  cost_per_patient: zod_1.z.number(),
  profit_margin: zod_1.z.number(),
  operational_efficiency: zod_1.z.number(),
});
exports.trendDataSchema = zod_1.z.object({
  period: zod_1.z.string(),
  revenue: zod_1.z.number(),
  patients: zod_1.z.number(),
  appointments: zod_1.z.number(),
  growth_rate: zod_1.z.number(),
  efficiency_score: zod_1.z.number(),
});
exports.performanceMetricsSchema = zod_1.z.object({
  average_load_time: zod_1.z.number(),
  data_freshness: zod_1.z.number(),
  cache_hit_rate: zod_1.z.number(),
  error_rate: zod_1.z.number(),
  uptime_percentage: zod_1.z.number(),
  concurrent_users: zod_1.z.number(),
});
exports.dashboardDataSchema = zod_1.z.object({
  revenue: exports.revenueMetricsSchema,
  patients: exports.patientMetricsSchema,
  appointments: exports.appointmentMetricsSchema,
  efficiency: exports.efficiencyMetricsSchema,
  trends: zod_1.z.array(exports.trendDataSchema),
  alerts: zod_1.z.array(exports.dashboardAlertSchema),
  performance: exports.performanceMetricsSchema,
});
exports.dashboardSummarySchema = zod_1.z.object({
  total_revenue: zod_1.z.number(),
  total_patients: zod_1.z.number(),
  total_appointments: zod_1.z.number(),
  efficiency_score: zod_1.z.number(),
  growth_rate: zod_1.z.number(),
  alert_count: zod_1.z.number(),
  last_updated: zod_1.z.string().datetime(),
  performance_score: zod_1.z.number(),
});
// Response Schemas
exports.dashboardResponseSchema = zod_1.z.object({
  success: zod_1.z.boolean(),
  data: exports.dashboardDataSchema,
  performance: zod_1.z.object({
    load_time: zod_1.z.number(),
    data_fetch_time: zod_1.z.number(),
    cache_hit: zod_1.z.boolean(),
  }),
  alerts: zod_1.z.array(exports.dashboardAlertSchema),
  last_updated: zod_1.z.string().datetime(),
});
exports.widgetDataResponseSchema = zod_1.z.object({
  widget_id: zod_1.z.string().uuid(),
  data: zod_1.z.any(),
  metadata: zod_1.z.object({
    last_updated: zod_1.z.string().datetime(),
    data_points: zod_1.z.number(),
    calculation_time: zod_1.z.number(),
  }),
  error: zod_1.z.string().optional(),
});
exports.kpiResponseSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid(),
  metrics: zod_1.z.array(exports.kpiMetricSchema),
  calculation_date: zod_1.z.string().datetime(),
  summary: exports.dashboardSummarySchema,
  trends: zod_1.z.array(exports.trendDataSchema),
});
