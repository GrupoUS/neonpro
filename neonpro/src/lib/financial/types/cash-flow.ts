/**
 * Financial System Type Definitions
 * NeonPro - Sistema de analytics financeiros e business intelligence
 */

// ====================================================================
// CASH FLOW TYPES
// ====================================================================

export interface CashFlowEntry {
  id: string;
  date: Date;
  type: CashFlowType;
  amount: number;
  category: CashFlowCategory;
  subcategory?: string;
  description: string;
  account_id: string;
  account_name: string;
  reference_id?: string;
  reference_type?: 'treatment' | 'product' | 'service' | 'expense' | 'transfer';
  is_forecast: boolean;
  confidence_level?: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CashFlowSummary {
  period: string;
  opening_balance: number;
  closing_balance: number;
  total_inflow: number;
  total_outflow: number;
  net_cash_flow: number;
  daily_average: number;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface CashFlowAccount {
  id: string;
  name: string;
  type: AccountType;
  bank_name?: string;
  account_number?: string;
  current_balance: number;
  available_balance?: number;
  last_sync: Date;
  is_active: boolean;
  api_connected: boolean;
  sync_frequency: SyncFrequency;
}

export interface CashFlowTrend {
  date: Date;
  cumulative_inflow: number;
  cumulative_outflow: number;
  net_position: number;
  daily_change: number;
  weekly_average: number;
  monthly_projection: number;
}

export type CashFlowType = 
  | 'inflow' 
  | 'outflow' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'adjustment';

export type CashFlowCategory = 
  | 'treatment_revenue' 
  | 'product_sales' 
  | 'service_revenue' 
  | 'subscription_revenue'
  | 'salary_expense' 
  | 'rent_expense' 
  | 'utility_expense' 
  | 'supply_expense'
  | 'marketing_expense' 
  | 'equipment_expense' 
  | 'insurance_expense'
  | 'tax_expense' 
  | 'loan_payment' 
  | 'investment' 
  | 'other';

export type AccountType = 
  | 'checking' 
  | 'savings' 
  | 'business' 
  | 'investment' 
  | 'credit' 
  | 'cash';

export type SyncFrequency = 
  | 'real_time' 
  | 'hourly' 
  | 'daily' 
  | 'weekly' 
  | 'manual';

// ====================================================================
// PREDICTION TYPES
// ====================================================================

export interface FinancialPrediction {
  id: string;
  prediction_date: Date;
  prediction_period: PredictionPeriod;
  predicted_amount: number;
  prediction_type: PredictionType;
  confidence_level: number;
  model_version: string;
  input_parameters: PredictionParameters;
  created_at: Date;
  actual_amount?: number;
  accuracy_score?: number;
}

export interface PredictionModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  accuracy_score: number;
  training_data_size: number;
  last_trained: Date;
  is_active: boolean;
  parameters: ModelParameters;
  performance_metrics: ModelMetrics;
}

export interface SeasonalTrend {
  month: number;
  seasonal_factor: number;
  historical_average: number;
  trend_direction: 'up' | 'down' | 'stable';
  confidence_level: number;
  data_points: number;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  predicted_cash_flow: CashFlowForecast[];
  probability: number;
  risk_level: RiskLevel;
  created_by: string;
  created_at: Date;
}

export interface CashFlowForecast {
  date: Date;
  predicted_inflow: number;
  predicted_outflow: number;
  predicted_balance: number;
  confidence_lower: number;
  confidence_upper: number;
  key_drivers: string[];
}

export type PredictionPeriod = 
  | '7_days' 
  | '30_days' 
  | '90_days' 
  | '6_months' 
  | '1_year';

export type PredictionType = 
  | 'cash_flow' 
  | 'revenue' 
  | 'expenses' 
  | 'profit' 
  | 'patient_volume';

export type ModelType = 
  | 'linear_regression' 
  | 'time_series' 
  | 'neural_network' 
  | 'ensemble' 
  | 'seasonal_arima';

export type RiskLevel = 
  | 'very_low' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

export interface PredictionParameters {
  historical_months: number;
  seasonal_adjustment: boolean;
  external_factors: string[];
  confidence_threshold: number;
  [key: string]: any;
}

export interface ModelParameters {
  learning_rate?: number;
  epochs?: number;
  batch_size?: number;
  features: string[];
  target_variable: string;
  [key: string]: any;
}

export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  mape: number;
  r_squared: number;
  accuracy_by_period: Record<PredictionPeriod, number>;
}

// ====================================================================
// ALERT TYPES
// ====================================================================

export interface FinancialAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  threshold_value: number;
  current_value: number;
  trigger_condition: AlertCondition;
  status: AlertStatus;
  account_id?: string;
  category?: CashFlowCategory;
  triggered_at: Date;
  resolved_at?: Date;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  escalated: boolean;
  escalation_level: number;
  notification_sent: boolean;
  notification_channels: NotificationChannel[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  alert_type: AlertType;
  trigger_condition: AlertCondition;
  threshold_value: number;
  comparison_operator: ComparisonOperator;
  evaluation_frequency: EvaluationFrequency;
  notification_channels: NotificationChannel[];
  escalation_rules: EscalationRule[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface EscalationRule {
  level: number;
  delay_minutes: number;
  notification_channels: NotificationChannel[];
  recipients: string[];
  message_template: string;
}

export interface AlertHistory {
  alert_id: string;
  action: AlertAction;
  performed_by: string;
  performed_at: Date;
  notes?: string;
  previous_status?: AlertStatus;
  new_status?: AlertStatus;
}

export type AlertType = 
  | 'low_balance' 
  | 'negative_cash_flow' 
  | 'unusual_expense' 
  | 'revenue_drop' 
  | 'forecast_deviation' 
  | 'payment_overdue' 
  | 'budget_exceeded' 
  | 'threshold_breach';

export type AlertSeverity = 
  | 'info' 
  | 'warning' 
  | 'critical' 
  | 'emergency';

export type AlertStatus = 
  | 'active' 
  | 'acknowledged' 
  | 'resolved' 
  | 'escalated' 
  | 'snoozed';

export type AlertCondition = 
  | 'balance_below' 
  | 'balance_above' 
  | 'percentage_change' 
  | 'amount_change' 
  | 'trend_direction' 
  | 'forecast_deviation';

export type ComparisonOperator = 
  | 'less_than' 
  | 'greater_than' 
  | 'equals' 
  | 'not_equals' 
  | 'percentage_change';

export type EvaluationFrequency = 
  | 'real_time' 
  | 'every_5_minutes' 
  | 'hourly' 
  | 'daily' 
  | 'weekly';

export type NotificationChannel = 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'slack' 
  | 'teams' 
  | 'webhook';

export type AlertAction = 
  | 'created' 
  | 'acknowledged' 
  | 'resolved' 
  | 'escalated' 
  | 'snoozed' 
  | 'updated';

// ====================================================================
// SCENARIO PLANNING TYPES
// ====================================================================

export interface FinancialScenario {
  id: string;
  name: string;
  description: string;
  scenario_type: ScenarioType;
  base_assumptions: ScenarioAssumption[];
  variable_assumptions: VariableAssumption[];
  results: ScenarioResults;
  risk_assessment: RiskAssessment;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  is_template: boolean;
}

export interface ScenarioAssumption {
  parameter: string;
  current_value: number;
  scenario_value: number;
  unit: string;
  description: string;
  impact_weight: number;
}

export interface VariableAssumption {
  parameter: string;
  min_value: number;
  max_value: number;
  step_size: number;
  unit: string;
  description: string;
}

export interface ScenarioResults {
  projected_revenue: number;
  projected_expenses: number;
  projected_profit: number;
  cash_flow_impact: number;
  roi_percentage: number;
  payback_period_months: number;
  break_even_point: Date;
  sensitivity_analysis: SensitivityAnalysis[];
}

export interface SensitivityAnalysis {
  parameter: string;
  base_case: number;
  optimistic_case: number;
  pessimistic_case: number;
  impact_on_profit: number;
  impact_percentage: number;
}

export interface RiskAssessment {
  overall_risk_score: number;
  risk_factors: RiskFactor[];
  mitigation_strategies: string[];
  confidence_level: number;
  stress_test_results: StressTestResult[];
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact_magnitude: number;
  risk_score: number;
  mitigation_actions: string[];
}

export interface StressTestResult {
  scenario: string;
  stress_factor: number;
  result_impact: number;
  recovery_time_months: number;
  survival_probability: number;
}

export type ScenarioType = 
  | 'what_if' 
  | 'sensitivity' 
  | 'stress_test' 
  | 'monte_carlo' 
  | 'optimization';

// ====================================================================
// BUSINESS INTELLIGENCE TYPES
// ====================================================================

export interface BusinessMetric {
  metric_name: string;
  current_value: number;
  previous_value: number;
  target_value: number;
  unit: string;
  trend_direction: 'up' | 'down' | 'stable';
  performance_status: 'excellent' | 'good' | 'average' | 'poor';
  last_updated: Date;
}

export interface KPIDashboard {
  clinic_id: string;
  period: string;
  financial_metrics: FinancialKPI[];
  operational_metrics: OperationalKPI[];
  patient_metrics: PatientKPI[];
  staff_metrics: StaffKPI[];
  generated_at: Date;
}

export interface FinancialKPI {
  name: string;
  value: number;
  target: number;
  variance: number;
  trend: number;
  benchmark: number;
  unit: string;
}

export interface OperationalKPI {
  name: string;
  value: number;
  target: number;
  efficiency_score: number;
  trend: number;
  unit: string;
}

export interface PatientKPI {
  name: string;
  value: number;
  target: number;
  satisfaction_score: number;
  trend: number;
  unit: string;
}

export interface StaffKPI {
  name: string;
  value: number;
  target: number;
  productivity_score: number;
  trend: number;
  unit: string;
}

// ====================================================================
// INTEGRATION TYPES
// ====================================================================

export interface BankingIntegration {
  id: string;
  bank_name: string;
  account_id: string;
  integration_type: IntegrationType;
  api_endpoint: string;
  auth_method: AuthMethod;
  sync_status: SyncStatus;
  last_sync: Date;
  sync_frequency: SyncFrequency;
  error_count: number;
  last_error?: string;
}

export interface RevenueStreamIntegration {
  stream_id: string;
  stream_name: string;
  source_system: string;
  integration_status: IntegrationStatus;
  sync_frequency: SyncFrequency;
  last_sync: Date;
  total_revenue_synced: number;
  sync_errors: number;
}

export type IntegrationType = 
  | 'api' 
  | 'file_import' 
  | 'manual_entry' 
  | 'webhook';

export type AuthMethod = 
  | 'oauth' 
  | 'api_key' 
  | 'basic_auth' 
  | 'certificate';

export type SyncStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'syncing' 
  | 'error' 
  | 'pending';

export type IntegrationStatus = 
  | 'active' 
  | 'inactive' 
  | 'configuring' 
  | 'error';

// ====================================================================
// SHADOW TESTING TYPES
// ====================================================================

export interface ShadowTestResult {
  test_id: string;
  calculation_type: CalculationType;
  primary_result: number;
  shadow_result: number;
  variance: number;
  variance_percentage: number;
  is_within_tolerance: boolean;
  tolerance_threshold: number;
  test_timestamp: Date;
  input_parameters: Record<string, any>;
  execution_time_ms: number;
}

export interface ValidationRule {
  rule_id: string;
  rule_name: string;
  calculation_type: CalculationType;
  tolerance_percentage: number;
  is_active: boolean;
  escalation_threshold: number;
  validation_method: ValidationMethod;
  created_at: Date;
}

export interface CalculationAuditLog {
  log_id: string;
  calculation_type: CalculationType;
  input_data: Record<string, any>;
  result: number;
  calculation_method: string;
  execution_time_ms: number;
  user_id: string;
  timestamp: Date;
  shadow_test_passed: boolean;
  validation_errors: string[];
}

export type CalculationType = 
  | 'cash_flow' 
  | 'prediction' 
  | 'alert_threshold' 
  | 'scenario_calculation' 
  | 'kpi_calculation' 
  | 'trend_analysis';

export type ValidationMethod = 
  | 'parallel_calculation' 
  | 'historical_comparison' 
  | 'rule_based' 
  | 'manual_verification';

// ====================================================================
// API RESPONSE TYPES
// ====================================================================

export interface FinancialAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  execution_time_ms: number;
  shadow_test_passed?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ====================================================================
// DASHBOARD CONFIGURATION TYPES
// ====================================================================

export interface DashboardConfig {
  user_id: string;
  dashboard_type: DashboardType;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  refresh_interval: number;
  auto_refresh: boolean;
  date_range: DateRange;
  filters: DashboardFilter[];
  last_updated: Date;
}

export interface DashboardWidget {
  widget_id: string;
  type: WidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  data_source: string;
  is_visible: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  z_index: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  min_width: number;
  min_height: number;
}

export interface WidgetConfiguration {
  title: string;
  show_legend: boolean;
  chart_type?: ChartType;
  color_scheme?: string;
  data_filters: Record<string, any>;
  refresh_interval?: number;
}

export interface DateRange {
  start_date: Date;
  end_date: Date;
  period_type: 'custom' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'year_to_date';
}

export interface DashboardFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

export type DashboardType = 
  | 'cash_flow' 
  | 'predictions' 
  | 'alerts' 
  | 'scenarios' 
  | 'kpis' 
  | 'executive';

export type DashboardLayout = 
  | 'grid' 
  | 'masonry' 
  | 'fixed' 
  | 'responsive';

export type WidgetType = 
  | 'line_chart' 
  | 'bar_chart' 
  | 'pie_chart' 
  | 'metric_card' 
  | 'table' 
  | 'gauge' 
  | 'progress_bar' 
  | 'alert_list' 
  | 'forecast_chart';

export type ChartType = 
  | 'line' 
  | 'area' 
  | 'bar' 
  | 'column' 
  | 'pie' 
  | 'donut' 
  | 'gauge' 
  | 'scatter' 
  | 'bubble';