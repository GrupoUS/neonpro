// KPI Dashboard Validation Schemas
// Description: Zod validation schemas for KPI dashboard types and API requests
// Author: Dev Agent  
// Date: 2025-01-26

import { z } from 'zod';

// Base KPI Schema
export const FinancialKPISchema = z.object({
  id: z.string().uuid().optional(),
  kpi_name: z.string().min(1).max(100),
  kpi_category: z.enum(['revenue', 'profitability', 'operational', 'financial_health']),
  current_value: z.number(),
  target_value: z.number().optional(),
  previous_value: z.number().optional(),
  variance_percent: z.number().optional(),
  trend_direction: z.enum(['increasing', 'decreasing', 'stable']).default('stable'),
  calculation_formula: z.string().optional(),
  data_sources: z.record(z.any()).optional(),
  last_updated: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// KPI Threshold Schema
export const KPIThresholdSchema = z.object({
  id: z.string().uuid().optional(),
  kpi_id: z.string().uuid(),
  threshold_type: z.enum(['warning', 'critical', 'target']),
  threshold_value: z.number(),
  comparison_operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  notification_enabled: z.boolean().default(true),
  notification_settings: z.object({
    email: z.boolean().optional(),
    dashboard: z.boolean().optional(),
    sms: z.boolean().optional(),
    escalation_hours: z.number().positive().optional(),
    recipients: z.array(z.string().email()).optional(),
  }),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Dashboard Widget Schema
export const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['kpi_card', 'chart', 'table', 'alert_panel', 'summary_stats']),
  kpi_ids: z.array(z.string().uuid()).optional(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().positive(),
    h: z.number().positive(),
  }),
  configuration: z.object({
    title: z.string().optional(),
    chart_type: z.enum(['line', 'bar', 'pie', 'gauge', 'sparkline']).optional(),
    time_range: z.string().optional(),
    comparison_enabled: z.boolean().optional(),
    drill_down_enabled: z.boolean().optional(),
    color_scheme: z.string().optional(),
    display_format: z.enum(['currency', 'percentage', 'number', 'ratio']).optional(),
  }),
  style: z.object({
    background_color: z.string().optional(),
    border_color: z.string().optional(),
    text_color: z.string().optional(),
  }).optional(),
});

// Dashboard Filters Schema
export const DashboardFiltersSchema = z.object({
  time_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
    preset: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  }).optional(),
  service_types: z.array(z.string()).optional(),
  providers: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  patient_segments: z.array(z.string()).optional(),
  comparison_period: z.object({
    type: z.enum(['previous_period', 'year_over_year', 'custom']),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }).optional(),
});

// Dashboard Layout Schema
export const DashboardLayoutSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  layout_name: z.string().min(1).max(100),
  layout_type: z.enum(['kpi_dashboard', 'executive_summary', 'detailed_analysis']).default('kpi_dashboard'),
  widget_configuration: z.array(DashboardWidgetSchema),
  grid_layout: z.object({
    cols: z.number().positive(),
    rows: z.number().positive(),
    row_height: z.number().positive(),
    margin: z.tuple([z.number(), z.number()]),
    container_padding: z.tuple([z.number(), z.number()]),
    breakpoints: z.record(z.number()),
    layouts: z.record(z.array(z.any())),
  }),
  filters: DashboardFiltersSchema,
  is_default: z.boolean().default(false),
  is_shared: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// KPI Drill Path Schema
export const KPIDrillPathSchema = z.object({
  id: z.string().uuid().optional(),
  kpi_id: z.string().uuid(),
  drill_level: z.number().positive().default(1),
  dimension_name: z.string().min(1).max(100),
  dimension_filters: z.record(z.any()),
  aggregation_rules: z.object({
    group_by: z.array(z.string()),
    aggregation_type: z.enum(['sum', 'avg', 'count', 'min', 'max']),
    having_conditions: z.record(z.any()).optional(),
  }),
  display_config: z.object({
    chart_type: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
    limit: z.number().positive().optional(),
    show_variance: z.boolean().optional(),
  }),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// KPI Calculation Request Schema
export const KPICalculationRequestSchema = z.object({
  kpi_ids: z.array(z.string().uuid()).optional(),
  time_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  filters: DashboardFiltersSchema.optional(),
  include_history: z.boolean().default(false),
  include_variance: z.boolean().default(true),
  force_recalculation: z.boolean().default(false),
});

// Drill Down Request Schema
export const DrillDownRequestSchema = z.object({
  kpi_id: z.string().uuid(),
  dimension: z.string().min(1),
  filters: z.record(z.any()).optional(),
  aggregation_level: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  limit: z.number().positive().max(1000).default(50),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Dashboard Template Schema
export const DashboardTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.enum(['executive', 'operational', 'financial', 'custom']),
  default_widgets: z.array(DashboardWidgetSchema),
  default_filters: DashboardFiltersSchema,
  recommended_for: z.array(z.string()),
});

// KPI Alert Schema
export const KPIAlertSchema = z.object({
  id: z.string().uuid().optional(),
  kpi_id: z.string().uuid(),
  threshold_id: z.string().uuid().optional(),
  alert_type: z.enum(['warning', 'critical', 'improvement', 'target_achieved']),
  alert_message: z.string().min(1),
  alert_value: z.number().optional(),
  threshold_value: z.number().optional(),
  is_acknowledged: z.boolean().default(false),
  acknowledged_by: z.string().uuid().optional(),
  acknowledged_at: z.string().optional(),
  created_at: z.string().optional(),
});

// Dashboard Performance Schema
export const DashboardPerformanceSchema = z.object({
  dashboard_id: z.string().uuid(),
  load_time_ms: z.number().positive(),
  data_refresh_time_ms: z.number().positive().optional(),
  widget_count: z.number().nonnegative(),
  user_id: z.string().uuid(),
  session_id: z.string().optional(),
});

// API Request Schemas
export const CreateKPIRequestSchema = FinancialKPISchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_updated: true,
});

export const UpdateKPIRequestSchema = FinancialKPISchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CreateDashboardRequestSchema = DashboardLayoutSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateDashboardRequestSchema = DashboardLayoutSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CreateThresholdRequestSchema = KPIThresholdSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateThresholdRequestSchema = KPIThresholdSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Bulk Operations Schemas
export const BulkKPIUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    data: UpdateKPIRequestSchema,
  })),
  force_calculation: z.boolean().default(false),
});

export const BulkThresholdUpdateSchema = z.object({
  kpi_id: z.string().uuid(),
  thresholds: z.array(CreateThresholdRequestSchema),
  replace_existing: z.boolean().default(false),
});

// Query Parameters Schemas
export const KPIListQuerySchema = z.object({
  category: z.enum(['revenue', 'profitability', 'operational', 'financial_health']).optional(),
  search: z.string().optional(),
  sort_by: z.enum(['kpi_name', 'current_value', 'variance_percent', 'last_updated']).default('kpi_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
  include_thresholds: z.boolean().default(false),
  include_history: z.boolean().default(false),
});

export const DashboardListQuerySchema = z.object({
  layout_type: z.enum(['kpi_dashboard', 'executive_summary', 'detailed_analysis']).optional(),
  is_shared: z.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['layout_name', 'created_at', 'updated_at']).default('layout_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(50).default(10),
});

export const AlertListQuerySchema = z.object({
  kpi_id: z.string().uuid().optional(),
  alert_type: z.enum(['warning', 'critical', 'improvement', 'target_achieved']).optional(),
  is_acknowledged: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.enum(['created_at', 'alert_type', 'alert_value']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

// Performance and Optimization Schemas
export const PerformanceOptimizationSchema = z.object({
  cache_duration_minutes: z.number().positive().default(5),
  enable_real_time_updates: z.boolean().default(true),
  batch_calculation_size: z.number().positive().default(50),
  parallel_calculation_enabled: z.boolean().default(true),
  compression_enabled: z.boolean().default(true),
});

// Export types
export type FinancialKPIInput = z.infer<typeof FinancialKPISchema>;
export type KPIThresholdInput = z.infer<typeof KPIThresholdSchema>;
export type DashboardLayoutInput = z.infer<typeof DashboardLayoutSchema>;
export type DashboardWidgetInput = z.infer<typeof DashboardWidgetSchema>;
export type KPIDrillPathInput = z.infer<typeof KPIDrillPathSchema>;
export type KPICalculationRequestInput = z.infer<typeof KPICalculationRequestSchema>;
export type DrillDownRequestInput = z.infer<typeof DrillDownRequestSchema>;
export type KPIAlertInput = z.infer<typeof KPIAlertSchema>;
export type DashboardPerformanceInput = z.infer<typeof DashboardPerformanceSchema>;