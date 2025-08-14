// =====================================================================================
// Advanced Financial Reporting Types
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

// Core reporting enums and constants
export const REPORT_TYPES = {
  PROFIT_LOSS: 'profit_loss',
  BALANCE_SHEET: 'balance_sheet', 
  CASH_FLOW: 'cash_flow',
  REVENUE_ANALYSIS: 'revenue_analysis',
  EXPENSE_ANALYSIS: 'expense_analysis',
  EXECUTIVE_SUMMARY: 'executive_summary',
  SERVICE_PROFITABILITY: 'service_profitability',
  PROVIDER_PERFORMANCE: 'provider_performance'
} as const;

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel', 
  CSV: 'csv',
  JSON: 'json'
} as const;

export const REPORT_STATUS = {
  GENERATING: 'generating',
  GENERATED: 'generated',
  FAILED: 'failed',
  ARCHIVED: 'archived'
} as const;

export const KPI_UNIT_TYPES = {
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  NUMBER: 'number',
  RATIO: 'ratio'
} as const;

export const PERIOD_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
} as const;

export const ALERT_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning', 
  CRITICAL: 'critical'
} as const;

export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly'
} as const;

export const DASHBOARD_REFRESH_INTERVALS = {
  REAL_TIME: 5000,      // 5 seconds
  FREQUENT: 30000,      // 30 seconds  
  NORMAL: 60000,        // 1 minute
  SLOW: 300000,         // 5 minutes
  MANUAL: 0             // No auto refresh
} as const;

// Base financial report interface
export interface FinancialReport {
  id: string;
  report_type: keyof typeof REPORT_TYPES;
  report_name: string;
  description?: string;
  parameters: Record<string, any>;
  generated_date: string;
  period_start: string;
  period_end: string;
  file_path?: string;
  file_format: keyof typeof REPORT_FORMATS;
  status: keyof typeof REPORT_STATUS;
  generated_by?: string;
  clinic_id: string;
  file_size?: number;
  download_count: number;
  last_downloaded?: string;
  created_at: string;
  updated_at: string;
}

// Financial KPI tracking interface
export interface FinancialKPI {
  id: string;
  clinic_id: string;
  kpi_name: string;
  display_name: string;
  description?: string;
  current_value: number;
  target_value?: number;
  previous_value?: number;
  threshold_warning?: number;
  threshold_critical?: number;
  unit_type: keyof typeof KPI_UNIT_TYPES;
  calculation_method?: string;
  alert_status: keyof typeof ALERT_STATUS;
  period_type: keyof typeof PERIOD_TYPES;
  period_start: string;
  period_end: string;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

// Report scheduling interface
export interface ReportSchedule {
  id: string;
  schedule_name: string;
  report_type: keyof typeof REPORT_TYPES;
  clinic_id: string;
  frequency: keyof typeof FREQUENCY_TYPES;
  frequency_config: Record<string, any>;
  report_parameters: Record<string, any>;
  recipients: string[];
  delivery_format: keyof typeof REPORT_FORMATS;
  is_active: boolean;
  last_run?: string;
  next_run: string;
  run_count: number;
  failure_count: number;
  last_failure_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Financial analytics interface
export interface FinancialAnalytics {
  id: string;
  clinic_id: string;
  metric_name: string;
  metric_category: string;
  metric_value: number;
  metric_data: Record<string, any>;
  comparison_value?: number;
  variance_amount?: number;
  variance_percentage?: number;
  period_type: keyof typeof PERIOD_TYPES;
  period_start: string;
  period_end: string;
  dimension_filters: Record<string, any>;
  calculated_at: string;
  created_at: string;
}

// Financial benchmarks interface
export interface FinancialBenchmark {
  id: string;
  benchmark_name: string;
  benchmark_category: string;
  metric_name: string;
  benchmark_value: number;
  unit_type: keyof typeof KPI_UNIT_TYPES;
  source?: string;
  applicable_criteria: Record<string, any>;
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

// Budget planning interfaces
export interface BudgetPlan {
  id: string;
  clinic_id: string;
  plan_name: string;
  description?: string;
  budget_year: number;
  budget_type: string;
  status: string;
  total_revenue_budget: number;
  total_expense_budget: number;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_plan_id: string;
  category_name: string;
  category_type: 'revenue' | 'expense';
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  period_allocation: Record<string, number>;
  notes?: string;
  last_updated: string;
  created_at: string;
}

// Report templates interface
export interface ReportTemplate {
  id: string;
  template_name: string;
  report_type: keyof typeof REPORT_TYPES;
  description?: string;
  template_config: Record<string, any>;
  is_default: boolean;
  is_public: boolean;
  clinic_id?: string;
  created_by?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Report generation parameters
export interface ReportParameters {
  period_start: string;
  period_end: string;
  comparison_period_start?: string;
  comparison_period_end?: string;
  include_budget_comparison?: boolean;
  include_benchmark_comparison?: boolean;
  filters?: {
    services?: string[];
    providers?: string[];
    locations?: string[];
    payment_methods?: string[];
    patient_segments?: string[];
  };
  grouping?: {
    by_service?: boolean;
    by_provider?: boolean;
    by_location?: boolean;
    by_month?: boolean;
    by_quarter?: boolean;
  };
  formatting?: {
    currency?: string;
    language?: string;
    decimal_places?: number;
    include_charts?: boolean;
    include_trends?: boolean;
  };
}

// Financial statement data structures
export interface ProfitLossStatement {
  period_start: string;
  period_end: string;
  clinic_id: string;
  revenue: {
    consultation_revenue: number;
    treatment_revenue: number;
    product_revenue: number;
    other_revenue: number;
    total_revenue: number;
  };
  cost_of_services: {
    direct_costs: number;
    materials_costs: number;
    equipment_costs: number;
    total_cost_of_services: number;
  };
  gross_profit: number;
  gross_profit_margin: number;
  operating_expenses: {
    staff_costs: number;
    rent_utilities: number;
    marketing_expenses: number;
    administrative_expenses: number;
    other_expenses: number;
    total_operating_expenses: number;
  };
  operating_profit: number;
  operating_profit_margin: number;
  other_income_expenses: {
    financial_income: number;
    financial_expenses: number;
    other_income: number;
    other_expenses: number;
    total_other: number;
  };
  profit_before_tax: number;
  tax_expenses: number;
  net_profit: number;
  net_profit_margin: number;
}

export interface BalanceSheet {
  as_of_date: string;
  clinic_id: string;
  assets: {
    current_assets: {
      cash_and_equivalents: number;
      accounts_receivable: number;
      inventory: number;
      prepaid_expenses: number;
      other_current_assets: number;
      total_current_assets: number;
    };
    non_current_assets: {
      equipment: number;
      accumulated_depreciation: number;
      net_equipment: number;
      software_licenses: number;
      other_non_current_assets: number;
      total_non_current_assets: number;
    };
    total_assets: number;
  };
  liabilities: {
    current_liabilities: {
      accounts_payable: number;
      accrued_expenses: number;
      short_term_debt: number;
      other_current_liabilities: number;
      total_current_liabilities: number;
    };
    non_current_liabilities: {
      long_term_debt: number;
      other_non_current_liabilities: number;
      total_non_current_liabilities: number;
    };
    total_liabilities: number;
  };
  equity: {
    paid_in_capital: number;
    retained_earnings: number;
    current_period_earnings: number;
    total_equity: number;
  };
  total_liabilities_and_equity: number;
}

export interface CashFlowStatement {
  period_start: string;
  period_end: string;
  clinic_id: string;
  operating_activities: {
    net_profit: number;
    depreciation: number;
    accounts_receivable_change: number;
    inventory_change: number;
    accounts_payable_change: number;
    other_working_capital_changes: number;
    net_cash_from_operations: number;
  };
  investing_activities: {
    equipment_purchases: number;
    software_purchases: number;
    other_investments: number;
    net_cash_from_investing: number;
  };
  financing_activities: {
    debt_proceeds: number;
    debt_payments: number;
    owner_contributions: number;
    owner_distributions: number;
    net_cash_from_financing: number;
  };
  net_cash_change: number;
  beginning_cash: number;
  ending_cash: number;
}

// KPI calculation interfaces
export interface KPICalculation {
  kpi_name: string;
  display_name: string;
  current_value: number;
  target_value?: number;
  previous_value?: number;
  unit_type: keyof typeof KPI_UNIT_TYPES;
  calculation_method: string;
  period_start: string;
  period_end: string;
  variance_from_target?: number;
  variance_from_previous?: number;
  trend_direction: 'up' | 'down' | 'stable';
  alert_status: keyof typeof ALERT_STATUS;
}

// Analytics data interfaces
export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_service: Array<{
    service_name: string;
    revenue: number;
    percentage: number;
    growth_rate?: number;
  }>;
  revenue_by_provider: Array<{
    provider_name: string;
    revenue: number;
    percentage: number;
    patient_count: number;
  }>;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
    growth_rate?: number;
  }>;
  revenue_trends: {
    daily_average: number;
    weekly_average: number;
    monthly_average: number;
    seasonal_patterns: Record<string, number>;
  };
}

export interface ExpenseAnalytics {
  total_expenses: number;
  expense_by_category: Array<{
    category_name: string;
    amount: number;
    percentage: number;
    budget_variance?: number;
  }>;
  expense_trends: {
    fixed_expenses: number;
    variable_expenses: number;
    growth_rate: number;
  };
  cost_per_patient: number;
  cost_per_service: Record<string, number>;
}

// Dashboard data structures
export interface FinancialDashboardData {
  summary_kpis: KPICalculation[];
  revenue_analytics: RevenueAnalytics;
  expense_analytics: ExpenseAnalytics;
  cash_flow_summary: {
    current_cash: number;
    cash_flow_this_month: number;
    cash_flow_trend: 'positive' | 'negative' | 'stable';
    projected_cash_next_month: number;
  };
  alerts: Array<{
    kpi_name: string;
    alert_level: keyof typeof ALERT_STATUS;
    message: string;
    action_required?: string;
  }>;
  recent_reports: FinancialReport[];
  benchmark_comparisons: Array<{
    metric_name: string;
    clinic_value: number;
    benchmark_value: number;
    variance_percentage: number;
    performance_rating: 'above' | 'at' | 'below';
  }>;
}

// Report export interfaces
export interface ReportExportOptions {
  format: keyof typeof REPORT_FORMATS;
  include_charts: boolean;
  include_raw_data: boolean;
  language: string;
  currency: string;
  custom_branding?: {
    logo_url?: string;
    clinic_name?: string;
    header_color?: string;
    footer_text?: string;
  };
}

export interface ReportExportResult {
  file_path: string;
  file_size: number;
  download_url: string;
  expires_at: string;
}

// Real-time dashboard interfaces
export interface DashboardSubscription {
  clinic_id: string;
  user_id: string;
  subscribed_kpis: string[];
  update_frequency: number; // seconds
  last_update: string;
}

export interface DashboardUpdate {
  kpi_updates: Partial<KPICalculation>[];
  alert_updates: Array<{
    kpi_name: string;
    old_status: keyof typeof ALERT_STATUS;
    new_status: keyof typeof ALERT_STATUS;
  }>;
  data_timestamp: string;
}

// Error handling and validation
export interface FinancialReportError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: FinancialReportError[];
  warnings: string[];
}

// Export utility type for all financial reporting types
export type FinancialReportingTypes = {
  FinancialReport: FinancialReport;
  FinancialKPI: FinancialKPI;
  ReportSchedule: ReportSchedule;
  FinancialAnalytics: FinancialAnalytics;
  FinancialBenchmark: FinancialBenchmark;
  BudgetPlan: BudgetPlan;
  BudgetItem: BudgetItem;
  ReportTemplate: ReportTemplate;
  ProfitLossStatement: ProfitLossStatement;
  BalanceSheet: BalanceSheet;
  CashFlowStatement: CashFlowStatement;
  KPICalculation: KPICalculation;
  RevenueAnalytics: RevenueAnalytics;
  ExpenseAnalytics: ExpenseAnalytics;
  FinancialDashboardData: FinancialDashboardData;
  ReportExportOptions: ReportExportOptions;
  ReportExportResult: ReportExportResult;
  DashboardSubscription: DashboardSubscription;
  DashboardUpdate: DashboardUpdate;
  ValidationResult: ValidationResult;
};

// Constants for financial calculations
export const FINANCIAL_CONSTANTS = {
  BRAZILIAN_TAX_RATES: {
    ISS: 0.05, // 5% typical ISS rate
    PIS: 0.0165, // 1.65% PIS rate  
    COFINS: 0.076, // 7.6% COFINS rate
    IRPJ: 0.15, // 15% IRPJ base rate
    CSLL: 0.09 // 9% CSLL rate
  },
  CURRENCY: {
    DEFAULT: 'BRL',
    SYMBOL: 'R$',
    DECIMAL_PLACES: 2
  },
  PERFORMANCE_THRESHOLDS: {
    DASHBOARD_LOAD_TIME_MS: 1000, // <1s load time requirement
    REPORT_GENERATION_TIME_MS: 3000, // <3s for standard reports
    REAL_TIME_UPDATE_INTERVAL_MS: 30000 // 30s real-time updates
  }
} as const;