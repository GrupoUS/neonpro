// KPI Dashboard Types
// Description: TypeScript interfaces and types for comprehensive financial KPI tracking
// Author: Dev Agent
// Date: 2025-01-26

export type FinancialKPI = {
  id: string;
  kpi_name: string;
  kpi_category:
    | 'revenue'
    | 'profitability'
    | 'operational'
    | 'financial_health';
  current_value: number;
  target_value?: number;
  previous_value?: number;
  variance_percent?: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  calculation_formula?: string;
  data_sources?: Record<string, any>;
  last_updated: string;
  created_at: string;
  updated_at: string;
};

export type KPIThreshold = {
  id: string;
  kpi_id: string;
  threshold_type: 'warning' | 'critical' | 'target';
  threshold_value: number;
  comparison_operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  notification_enabled: boolean;
  notification_settings: {
    email?: boolean;
    dashboard?: boolean;
    sms?: boolean;
    escalation_hours?: number;
    recipients?: string[];
  };
  created_at: string;
  updated_at: string;
};

export type DashboardLayout = {
  id: string;
  user_id: string;
  layout_name: string;
  layout_type: 'kpi_dashboard' | 'executive_summary' | 'detailed_analysis';
  widget_configuration: DashboardWidget[];
  grid_layout: GridLayout;
  filters: DashboardFilters;
  is_default: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
};

export type DashboardWidget = {
  id: string;
  type: 'kpi_card' | 'chart' | 'table' | 'alert_panel' | 'summary_stats';
  kpi_ids?: string[];
  position: { x: number; y: number; w: number; h: number };
  configuration: {
    title?: string;
    chart_type?: 'line' | 'bar' | 'pie' | 'gauge' | 'sparkline';
    time_range?: string;
    comparison_enabled?: boolean;
    drill_down_enabled?: boolean;
    color_scheme?: string;
    display_format?: 'currency' | 'percentage' | 'number' | 'ratio';
  };
  style?: {
    background_color?: string;
    border_color?: string;
    text_color?: string;
  };
};

export type GridLayout = {
  cols: number;
  rows: number;
  row_height: number;
  margin: [number, number];
  container_padding: [number, number];
  breakpoints: Record<string, number>;
  layouts: Record<string, any[]>;
};

export type DashboardFilters = {
  time_period?: {
    start_date: string;
    end_date: string;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  service_types?: string[];
  providers?: string[];
  locations?: string[];
  patient_segments?: string[];
  comparison_period?: {
    type: 'previous_period' | 'year_over_year' | 'custom';
    start_date?: string;
    end_date?: string;
  };
};

export type KPIDrillPath = {
  id: string;
  kpi_id: string;
  drill_level: number;
  dimension_name: string;
  dimension_filters: Record<string, any>;
  aggregation_rules: {
    group_by: string[];
    aggregation_type: 'sum' | 'avg' | 'count' | 'min' | 'max';
    having_conditions?: Record<string, any>;
  };
  display_config: {
    chart_type?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    show_variance?: boolean;
  };
  created_at: string;
  updated_at: string;
};

export type KPIHistory = {
  id: string;
  kpi_id: string;
  value: number;
  recorded_at: string;
  calculation_metadata?: Record<string, any>;
  created_at: string;
};

export type KPIAlert = {
  id: string;
  kpi_id: string;
  threshold_id?: string;
  alert_type: 'warning' | 'critical' | 'improvement' | 'target_achieved';
  alert_message: string;
  alert_value?: number;
  threshold_value?: number;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
};

export type DashboardPerformance = {
  id: string;
  dashboard_id: string;
  load_time_ms: number;
  data_refresh_time_ms?: number;
  widget_count: number;
  user_id: string;
  session_id?: string;
  recorded_at: string;
};

// KPI Calculation Types
export type KPICalculationRequest = {
  kpi_ids?: string[];
  time_period: {
    start_date: string;
    end_date: string;
  };
  filters?: DashboardFilters;
  include_history?: boolean;
  include_variance?: boolean;
  force_recalculation?: boolean;
};

export type KPICalculationResult = {
  kpi_id: string;
  kpi_name: string;
  calculated_value: number;
  previous_value?: number;
  variance_percent?: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  calculation_timestamp: string;
  data_points_used: number;
  confidence_score?: number;
  breakdown?: Array<{
    dimension: string;
    value: number;
    percentage: number;
  }>;
};

// Drill-down Analysis Types
export type DrillDownRequest = {
  kpi_id: string;
  dimension: string;
  filters?: Record<string, any>;
  aggregation_level: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type DrillDownResult = {
  dimension_value: string;
  value: number;
  percentage_of_total: number;
  variance_from_previous?: number;
  trend_direction?: 'increasing' | 'decreasing' | 'stable';
  sub_dimensions?: DrillDownResult[];
  transaction_count?: number;
  metadata?: Record<string, any>;
};

// Dashboard Builder Types
export type DashboardTemplate = {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'custom';
  default_widgets: DashboardWidget[];
  default_filters: DashboardFilters;
  recommended_for: string[];
};

export type KPIBenchmark = {
  kpi_name: string;
  industry_average: number;
  top_quartile: number;
  median: number;
  bottom_quartile: number;
  benchmark_source: string;
  last_updated: string;
};

// Real-time Updates
export type KPIUpdateEvent = {
  type:
    | 'kpi_update'
    | 'alert_triggered'
    | 'threshold_breach'
    | 'dashboard_refresh';
  kpi_id?: string;
  dashboard_id?: string;
  alert_id?: string;
  data: any;
  timestamp: string;
};

// Mobile and Offline Types
export type OfflineKPIData = {
  kpis: FinancialKPI[];
  alerts: KPIAlert[];
  last_sync: string;
  sync_status: 'synced' | 'pending' | 'error';
  offline_capability: boolean;
};

// Analytics and Insights
export type KPIInsight = {
  id: string;
  kpi_id: string;
  insight_type:
    | 'trend_change'
    | 'anomaly_detected'
    | 'target_achievement'
    | 'correlation_found';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence_score: number;
  recommended_actions?: string[];
  created_at: string;
};

export type ExecutiveSummary = {
  period: {
    start_date: string;
    end_date: string;
  };
  key_metrics: {
    revenue: {
      current: number;
      target: number;
      variance: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    profitability: {
      margin: number;
      target_margin: number;
      variance: number;
    };
    operational: {
      efficiency_score: number;
      patient_satisfaction: number;
      capacity_utilization: number;
    };
  };
  top_insights: KPIInsight[];
  alerts_summary: {
    critical: number;
    warning: number;
    resolved: number;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    estimated_impact: string;
  }>;
};

// API Response Types
export type KPIAPIResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
  metadata?: {
    total_count?: number;
    page?: number;
    page_size?: number;
    calculation_time_ms?: number;
    cache_hit?: boolean;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
};
