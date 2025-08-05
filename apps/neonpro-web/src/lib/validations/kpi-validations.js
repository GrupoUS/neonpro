"use strict";
// KPI Dashboard Validation Schemas
// Description: Zod validation schemas for KPI dashboard types and API requests
// Author: Dev Agent
// Date: 2025-01-26
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardWidgetSchema =
  exports.dashboardLayoutSchema =
  exports.PerformanceOptimizationSchema =
  exports.AlertListQuerySchema =
  exports.DashboardListQuerySchema =
  exports.KPIListQuerySchema =
  exports.BulkThresholdUpdateSchema =
  exports.BulkKPIUpdateSchema =
  exports.UpdateThresholdRequestSchema =
  exports.CreateThresholdRequestSchema =
  exports.UpdateDashboardRequestSchema =
  exports.CreateDashboardRequestSchema =
  exports.UpdateKPIRequestSchema =
  exports.CreateKPIRequestSchema =
  exports.DashboardPerformanceSchema =
  exports.KPIAlertSchema =
  exports.DashboardTemplateSchema =
  exports.DrillDownRequestSchema =
  exports.KPICalculationRequestSchema =
  exports.KPIDrillPathSchema =
  exports.DashboardLayoutSchema =
  exports.DashboardFiltersSchema =
  exports.DashboardWidgetSchema =
  exports.KPIThresholdSchema =
  exports.FinancialKPISchema =
    void 0;
var zod_1 = require("zod");
// Base KPI Schema
exports.FinancialKPISchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  kpi_name: zod_1.z.string().min(1).max(100),
  kpi_category: zod_1.z.enum(["revenue", "profitability", "operational", "financial_health"]),
  current_value: zod_1.z.number(),
  target_value: zod_1.z.number().optional(),
  previous_value: zod_1.z.number().optional(),
  variance_percent: zod_1.z.number().optional(),
  trend_direction: zod_1.z.enum(["increasing", "decreasing", "stable"]).default("stable"),
  calculation_formula: zod_1.z.string().optional(),
  data_sources: zod_1.z.record(zod_1.z.any()).optional(),
  last_updated: zod_1.z.string().optional(),
  created_at: zod_1.z.string().optional(),
  updated_at: zod_1.z.string().optional(),
});
// KPI Threshold Schema
exports.KPIThresholdSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  kpi_id: zod_1.z.string().uuid(),
  threshold_type: zod_1.z.enum(["warning", "critical", "target"]),
  threshold_value: zod_1.z.number(),
  comparison_operator: zod_1.z.enum(["gt", "lt", "eq", "gte", "lte"]),
  notification_enabled: zod_1.z.boolean().default(true),
  notification_settings: zod_1.z.object({
    email: zod_1.z.boolean().optional(),
    dashboard: zod_1.z.boolean().optional(),
    sms: zod_1.z.boolean().optional(),
    escalation_hours: zod_1.z.number().positive().optional(),
    recipients: zod_1.z.array(zod_1.z.string().email()).optional(),
  }),
  created_at: zod_1.z.string().optional(),
  updated_at: zod_1.z.string().optional(),
});
// Dashboard Widget Schema
exports.DashboardWidgetSchema = zod_1.z.object({
  id: zod_1.z.string(),
  type: zod_1.z.enum(["kpi_card", "chart", "table", "alert_panel", "summary_stats"]),
  kpi_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  position: zod_1.z.object({
    x: zod_1.z.number().min(0),
    y: zod_1.z.number().min(0),
    w: zod_1.z.number().positive(),
    h: zod_1.z.number().positive(),
  }),
  configuration: zod_1.z.object({
    title: zod_1.z.string().optional(),
    chart_type: zod_1.z.enum(["line", "bar", "pie", "gauge", "sparkline"]).optional(),
    time_range: zod_1.z.string().optional(),
    comparison_enabled: zod_1.z.boolean().optional(),
    drill_down_enabled: zod_1.z.boolean().optional(),
    color_scheme: zod_1.z.string().optional(),
    display_format: zod_1.z.enum(["currency", "percentage", "number", "ratio"]).optional(),
  }),
  style: zod_1.z
    .object({
      background_color: zod_1.z.string().optional(),
      border_color: zod_1.z.string().optional(),
      text_color: zod_1.z.string().optional(),
    })
    .optional(),
});
// Dashboard Filters Schema
exports.DashboardFiltersSchema = zod_1.z.object({
  time_period: zod_1.z
    .object({
      start_date: zod_1.z.string(),
      end_date: zod_1.z.string(),
      preset: zod_1.z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
    })
    .optional(),
  service_types: zod_1.z.array(zod_1.z.string()).optional(),
  providers: zod_1.z.array(zod_1.z.string()).optional(),
  locations: zod_1.z.array(zod_1.z.string()).optional(),
  patient_segments: zod_1.z.array(zod_1.z.string()).optional(),
  comparison_period: zod_1.z
    .object({
      type: zod_1.z.enum(["previous_period", "year_over_year", "custom"]),
      start_date: zod_1.z.string().optional(),
      end_date: zod_1.z.string().optional(),
    })
    .optional(),
});
// Dashboard Layout Schema
exports.DashboardLayoutSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  user_id: zod_1.z.string().uuid(),
  layout_name: zod_1.z.string().min(1).max(100),
  layout_type: zod_1.z
    .enum(["kpi_dashboard", "executive_summary", "detailed_analysis"])
    .default("kpi_dashboard"),
  widget_configuration: zod_1.z.array(exports.DashboardWidgetSchema),
  grid_layout: zod_1.z.object({
    cols: zod_1.z.number().positive(),
    rows: zod_1.z.number().positive(),
    row_height: zod_1.z.number().positive(),
    margin: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    container_padding: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    breakpoints: zod_1.z.record(zod_1.z.number()),
    layouts: zod_1.z.record(zod_1.z.array(zod_1.z.any())),
  }),
  filters: exports.DashboardFiltersSchema,
  is_default: zod_1.z.boolean().default(false),
  is_shared: zod_1.z.boolean().default(false),
  created_at: zod_1.z.string().optional(),
  updated_at: zod_1.z.string().optional(),
});
// KPI Drill Path Schema
exports.KPIDrillPathSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  kpi_id: zod_1.z.string().uuid(),
  drill_level: zod_1.z.number().positive().default(1),
  dimension_name: zod_1.z.string().min(1).max(100),
  dimension_filters: zod_1.z.record(zod_1.z.any()),
  aggregation_rules: zod_1.z.object({
    group_by: zod_1.z.array(zod_1.z.string()),
    aggregation_type: zod_1.z.enum(["sum", "avg", "count", "min", "max"]),
    having_conditions: zod_1.z.record(zod_1.z.any()).optional(),
  }),
  display_config: zod_1.z.object({
    chart_type: zod_1.z.string().optional(),
    sort_order: zod_1.z.enum(["asc", "desc"]).optional(),
    limit: zod_1.z.number().positive().optional(),
    show_variance: zod_1.z.boolean().optional(),
  }),
  created_at: zod_1.z.string().optional(),
  updated_at: zod_1.z.string().optional(),
});
// KPI Calculation Request Schema
exports.KPICalculationRequestSchema = zod_1.z.object({
  kpi_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  time_period: zod_1.z.object({
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
  }),
  filters: exports.DashboardFiltersSchema.optional(),
  include_history: zod_1.z.boolean().default(false),
  include_variance: zod_1.z.boolean().default(true),
  force_recalculation: zod_1.z.boolean().default(false),
});
// Drill Down Request Schema
exports.DrillDownRequestSchema = zod_1.z.object({
  kpi_id: zod_1.z.string().uuid(),
  dimension: zod_1.z.string().min(1),
  filters: zod_1.z.record(zod_1.z.any()).optional(),
  aggregation_level: zod_1.z.enum(["day", "week", "month", "quarter", "year"]),
  limit: zod_1.z.number().positive().max(1000).default(50),
  sort_by: zod_1.z.string().optional(),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Dashboard Template Schema
exports.DashboardTemplateSchema = zod_1.z.object({
  id: zod_1.z.string().optional(),
  name: zod_1.z.string().min(1).max(100),
  description: zod_1.z.string().max(500),
  category: zod_1.z.enum(["executive", "operational", "financial", "custom"]),
  default_widgets: zod_1.z.array(exports.DashboardWidgetSchema),
  default_filters: exports.DashboardFiltersSchema,
  recommended_for: zod_1.z.array(zod_1.z.string()),
});
// KPI Alert Schema
exports.KPIAlertSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  kpi_id: zod_1.z.string().uuid(),
  threshold_id: zod_1.z.string().uuid().optional(),
  alert_type: zod_1.z.enum(["warning", "critical", "improvement", "target_achieved"]),
  alert_message: zod_1.z.string().min(1),
  alert_value: zod_1.z.number().optional(),
  threshold_value: zod_1.z.number().optional(),
  is_acknowledged: zod_1.z.boolean().default(false),
  acknowledged_by: zod_1.z.string().uuid().optional(),
  acknowledged_at: zod_1.z.string().optional(),
  created_at: zod_1.z.string().optional(),
});
// Dashboard Performance Schema
exports.DashboardPerformanceSchema = zod_1.z.object({
  dashboard_id: zod_1.z.string().uuid(),
  load_time_ms: zod_1.z.number().positive(),
  data_refresh_time_ms: zod_1.z.number().positive().optional(),
  widget_count: zod_1.z.number().nonnegative(),
  user_id: zod_1.z.string().uuid(),
  session_id: zod_1.z.string().optional(),
});
// API Request Schemas
exports.CreateKPIRequestSchema = exports.FinancialKPISchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_updated: true,
});
exports.UpdateKPIRequestSchema = exports.FinancialKPISchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.CreateDashboardRequestSchema = exports.DashboardLayoutSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdateDashboardRequestSchema = exports.DashboardLayoutSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.CreateThresholdRequestSchema = exports.KPIThresholdSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdateThresholdRequestSchema = exports.KPIThresholdSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
// Bulk Operations Schemas
exports.BulkKPIUpdateSchema = zod_1.z.object({
  updates: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string().uuid(),
      data: exports.UpdateKPIRequestSchema,
    }),
  ),
  force_calculation: zod_1.z.boolean().default(false),
});
exports.BulkThresholdUpdateSchema = zod_1.z.object({
  kpi_id: zod_1.z.string().uuid(),
  thresholds: zod_1.z.array(exports.CreateThresholdRequestSchema),
  replace_existing: zod_1.z.boolean().default(false),
});
// Query Parameters Schemas
exports.KPIListQuerySchema = zod_1.z.object({
  category: zod_1.z
    .enum(["revenue", "profitability", "operational", "financial_health"])
    .optional(),
  search: zod_1.z.string().optional(),
  sort_by: zod_1.z
    .enum(["kpi_name", "current_value", "variance_percent", "last_updated"])
    .default("kpi_name"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("asc"),
  page: zod_1.z.number().positive().default(1),
  limit: zod_1.z.number().positive().max(100).default(20),
  include_thresholds: zod_1.z.boolean().default(false),
  include_history: zod_1.z.boolean().default(false),
});
exports.DashboardListQuerySchema = zod_1.z.object({
  layout_type: zod_1.z.enum(["kpi_dashboard", "executive_summary", "detailed_analysis"]).optional(),
  is_shared: zod_1.z.boolean().optional(),
  search: zod_1.z.string().optional(),
  sort_by: zod_1.z.enum(["layout_name", "created_at", "updated_at"]).default("layout_name"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("asc"),
  page: zod_1.z.number().positive().default(1),
  limit: zod_1.z.number().positive().max(50).default(10),
});
exports.AlertListQuerySchema = zod_1.z.object({
  kpi_id: zod_1.z.string().uuid().optional(),
  alert_type: zod_1.z.enum(["warning", "critical", "improvement", "target_achieved"]).optional(),
  is_acknowledged: zod_1.z.boolean().optional(),
  date_from: zod_1.z.string().optional(),
  date_to: zod_1.z.string().optional(),
  sort_by: zod_1.z.enum(["created_at", "alert_type", "alert_value"]).default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
  page: zod_1.z.number().positive().default(1),
  limit: zod_1.z.number().positive().max(100).default(20),
});
// Performance and Optimization Schemas
exports.PerformanceOptimizationSchema = zod_1.z.object({
  cache_duration_minutes: zod_1.z.number().positive().default(5),
  enable_real_time_updates: zod_1.z.boolean().default(true),
  batch_calculation_size: zod_1.z.number().positive().default(50),
  parallel_calculation_enabled: zod_1.z.boolean().default(true),
  compression_enabled: zod_1.z.boolean().default(true),
});
// Export missing schemas with proper names
exports.dashboardLayoutSchema = exports.DashboardLayoutSchema;
exports.dashboardWidgetSchema = exports.DashboardWidgetSchema;
