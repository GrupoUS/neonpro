// Dashboard Configuration Types
export interface DashboardConfiguration {
  id: string;
  user_id: string;
  clinic_id?: string;
  name: string;
  layout_config: LayoutConfig;
  widget_preferences: WidgetPreferences;
  theme: DashboardTheme;
  update_frequency: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface LayoutConfig {
  grid_size: number;
  responsive_breakpoints: ResponsiveBreakpoints;
  auto_save: boolean;
  snap_to_grid: boolean;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface WidgetPreferences {
  auto_refresh: boolean;
  show_legends: boolean;
  animate_transitions: boolean;
  default_time_range: TimeRange;
}

// Widget Types
export interface DashboardWidget {
  id: string;
  config_id: string;
  widget_type: WidgetType;
  widget_name: string;
  data_source: DataSourceType;
  position: WidgetPosition;
  configuration: WidgetConfiguration;
  display_config: WidgetDisplayConfig;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  min_width?: number;
  min_height?: number;
  max_width?: number;
  max_height?: number;
}

export interface WidgetConfiguration {
  data_params: Record<string, any>;
  refresh_interval: number;
  cache_duration: number;
  filters: FilterConfig[];
  aggregation: AggregationType;
  time_range: TimeRange;
}

export interface WidgetDisplayConfig {
  chart_type: ChartType;
  color_scheme: string[];
  show_legend: boolean;
  show_grid: boolean;
  animation_enabled: boolean;
  format_config: FormatConfig;
}

export interface FilterConfig {
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface FormatConfig {
  decimal_places?: number;
  prefix?: string;
  suffix?: string;
  format_type?: "number" | "currency" | "percentage" | "date";
  threshold_config?: ThresholdConfig[];
}

export interface ThresholdConfig {
  value: number;
  color: string;
  operator: ">" | "<" | ">=" | "<=" | "=";
  label?: string;
}

// KPI and Metrics Types
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  change_percentage: number;
  trend: "up" | "down" | "stable";
  benchmark: number;
  target: number;
  category: MetricType;
  calculation_date: string;
}

export interface RevenueMetrics {
  daily_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;
  average_transaction: number;
  revenue_by_service: ServiceRevenue[];
  revenue_trend: TrendData[];
  revenue_forecast: ForecastData[];
}

export interface ServiceRevenue {
  service_name: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface PatientMetrics {
  new_patients: number;
  returning_patients: number;
  total_patients: number;
  patient_growth: number;
  retention_rate: number;
  lifetime_value: number;
  patient_segmentation: PatientSegment[];
  acquisition_sources: AcquisitionSource[];
}

export interface PatientSegment {
  segment_name: string;
  count: number;
  percentage: number;
  average_value: number;
}

export interface AcquisitionSource {
  source: string;
  count: number;
  percentage: number;
  cost_per_acquisition: number;
}

export interface AppointmentMetrics {
  total_appointments: number;
  booking_rate: number;
  cancellation_rate: number;
  no_show_rate: number;
  utilization_rate: number;
  average_booking_lead_time: number;
  appointment_types: AppointmentTypeMetric[];
  time_slot_analysis: TimeSlotMetric[];
}

export interface AppointmentTypeMetric {
  type: string;
  count: number;
  percentage: number;
  average_duration: number;
}

export interface TimeSlotMetric {
  time_slot: string;
  booking_rate: number;
  utilization: number;
  revenue: number;
}

export interface EfficiencyMetrics {
  staff_productivity: number;
  resource_utilization: number;
  treatment_efficiency: number;
  wait_time_average: number;
  service_completion_rate: number;
  cost_per_patient: number;
  profit_margin: number;
  operational_efficiency: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface ForecastData {
  date: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

// Alert Types
export interface DashboardAlert {
  id: string;
  user_id: string;
  clinic_id?: string;
  alert_type: AlertType;
  metric_name: string;
  threshold_value: number;
  threshold_operator: string;
  current_value?: number;
  notification_method: NotificationMethod;
  is_active: boolean;
  trigger_count: number;
  last_triggered?: string;
  created_at: string;
  updated_at: string;
}

// Performance and Cache Types
export interface DashboardPerformanceLog {
  id: string;
  user_id: string;
  clinic_id?: string;
  dashboard_load_time: number;
  data_fetch_time: number;
  widget_count: number;
  error_count: number;
  timestamp: string;
}

export interface DashboardCache {
  id: string;
  cache_key: string;
  cache_data: any;
  expires_at: string;
  clinic_id?: string;
  created_at: string;
}

// Response Types
export interface DashboardSummary {
  total_revenue: number;
  total_patients: number;
  total_appointments: number;
  efficiency_score: number;
  growth_rate: number;
  alert_count: number;
  last_updated: string;
  performance_score: number;
}

export interface WidgetDataResponse {
  widget_id: string;
  data: any;
  metadata: {
    last_updated: string;
    data_points: number;
    calculation_time: number;
  };
}

export interface KPIResponse {
  clinic_id: string;
  metrics: KPIMetric[];
  calculation_date: string;
  summary: DashboardSummary;
  trends: TrendData[];
}

export interface DashboardConfigurationResponse {
  id: string;
  user_id: string;
  clinic_id?: string;
  name: string;
  layout_config: LayoutConfig;
  widget_preferences: WidgetPreferences;
  theme: DashboardTheme;
  update_frequency: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  dashboard_widgets: DashboardWidget[];
}

export interface WidgetCreateRequest {
  config_id: string;
  widget_type: WidgetType;
  widget_name: string;
  data_source: DataSourceType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  configuration: any;
  is_visible?: boolean;
}

export interface AlertCreateRequest {
  alert_type: AlertType;
  metric_name: string;
  threshold_value: number;
  threshold_operator?: string;
  notification_method?: NotificationMethod;
}

export interface PerformanceLogRequest {
  dashboard_load_time: number;
  data_fetch_time: number;
  widget_count: number;
  error_count?: number;
}

// Type Unions
export type DashboardTheme = "light" | "dark" | "auto";
export type ChartType = "line" | "bar" | "pie" | "area" | "scatter" | "donut" | "gauge";
export type MetricType = "revenue" | "patient" | "appointment" | "efficiency";
export type AlertType =
  | "revenue_drop"
  | "low_bookings"
  | "high_cancellations"
  | "efficiency_warning";
export type NotificationMethod = "email" | "sms" | "push" | "dashboard";
export type TimeRange = "today" | "week" | "month" | "quarter" | "year" | "custom";
export type AggregationType = "sum" | "average" | "count" | "min" | "max";
export type WidgetType = "kpi" | "chart" | "table" | "metric" | "progress" | "gauge" | "timeline";
export type DataSourceType =
  | "revenue"
  | "patients"
  | "appointments"
  | "staff"
  | "inventory"
  | "custom";
