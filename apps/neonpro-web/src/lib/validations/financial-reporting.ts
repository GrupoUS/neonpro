// =====================================================================================
// Advanced Financial Reporting Validation Schemas
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { z } from 'zod';
import { 
  REPORT_TYPES, 
  REPORT_FORMATS, 
  REPORT_STATUS,
  KPI_UNIT_TYPES,
  PERIOD_TYPES,
  ALERT_STATUS,
  FREQUENCY_TYPES 
} from '@/lib/types/financial-reporting';

// Base validation schemas
const uuidSchema = z.string().uuid();
const dateSchema = z.string().datetime();
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const positiveNumberSchema = z.number().min(0);
const percentageSchema = z.number().min(0).max(100);
const currencySchema = z.number().min(0);

// Enum validation schemas
const reportTypeSchema = z.enum(Object.values(REPORT_TYPES) as [string, ...string[]]);
const reportFormatSchema = z.enum(Object.values(REPORT_FORMATS) as [string, ...string[]]);
const reportStatusSchema = z.enum(Object.values(REPORT_STATUS) as [string, ...string[]]);
const kpiUnitTypeSchema = z.enum(Object.values(KPI_UNIT_TYPES) as [string, ...string[]]);
const periodTypeSchema = z.enum(Object.values(PERIOD_TYPES) as [string, ...string[]]);
const alertStatusSchema = z.enum(Object.values(ALERT_STATUS) as [string, ...string[]]);
const frequencyTypeSchema = z.enum(Object.values(FREQUENCY_TYPES) as [string, ...string[]]);

// Financial Report validation schema
export const financialReportSchema = z.object({
  id: uuidSchema,
  report_type: reportTypeSchema,
  report_name: z.string().min(1).max(200),
  description: z.string().optional(),
  parameters: z.record(z.any()),
  generated_date: dateSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  file_path: z.string().optional(),
  file_format: reportFormatSchema,
  status: reportStatusSchema,
  generated_by: uuidSchema.optional(),
  clinic_id: uuidSchema,
  file_size: z.number().int().min(0).optional(),
  download_count: z.number().int().min(0),
  last_downloaded: dateSchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema
}).refine(
  (data) => new Date(data.period_end) >= new Date(data.period_start),
  {
    message: "Period end must be after or equal to period start",
    path: ["period_end"]
  }
);

// Create Financial Report schema
export const createFinancialReportSchema = z.object({
  report_type: reportTypeSchema,
  report_name: z.string().min(1).max(200),
  description: z.string().optional(),
  parameters: z.record(z.any()).default({}),
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  file_format: reportFormatSchema.default('pdf'),
  clinic_id: uuidSchema
}).refine(
  (data) => new Date(data.period_end) >= new Date(data.period_start),
  {
    message: "Period end must be after or equal to period start",
    path: ["period_end"]
  }
);

// Financial KPI validation schema
export const financialKPISchema = z.object({
  id: uuidSchema,
  clinic_id: uuidSchema,
  kpi_name: z.string().min(1).max(100),
  display_name: z.string().min(1).max(200),
  description: z.string().optional(),
  current_value: z.number(),
  target_value: z.number().optional(),
  previous_value: z.number().optional(),
  threshold_warning: z.number().optional(),
  threshold_critical: z.number().optional(),
  unit_type: kpiUnitTypeSchema,
  calculation_method: z.string().optional(),
  alert_status: alertStatusSchema,
  period_type: periodTypeSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  last_calculated: dateSchema,
  created_at: dateSchema,
  updated_at: dateSchema
}).refine(
  (data) => new Date(data.period_end) >= new Date(data.period_start),
  {
    message: "Period end must be after or equal to period start",
    path: ["period_end"]
  }
).refine(
  (data) => {
    if (data.threshold_warning && data.threshold_critical) {
      return data.threshold_critical !== data.threshold_warning;
    }
    return true;
  },
  {
    message: "Warning and critical thresholds must be different",
    path: ["threshold_critical"]
  }
);

// Create Financial KPI schema
export const createFinancialKPISchema = z.object({
  clinic_id: uuidSchema,
  kpi_name: z.string().min(1).max(100),
  display_name: z.string().min(1).max(200),
  description: z.string().optional(),
  current_value: z.number(),
  target_value: z.number().optional(),
  threshold_warning: z.number().optional(),
  threshold_critical: z.number().optional(),
  unit_type: kpiUnitTypeSchema,
  calculation_method: z.string().optional(),
  period_type: periodTypeSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema
});

// Report Schedule validation schema
export const reportScheduleSchema = z.object({
  id: uuidSchema,
  schedule_name: z.string().min(1).max(200),
  report_type: reportTypeSchema,
  clinic_id: uuidSchema,
  frequency: frequencyTypeSchema,
  frequency_config: z.record(z.any()),
  report_parameters: z.record(z.any()),
  recipients: z.array(z.string().email()).min(1),
  delivery_format: reportFormatSchema,
  is_active: z.boolean(),
  last_run: dateSchema.optional(),
  next_run: dateSchema,
  run_count: z.number().int().min(0),
  failure_count: z.number().int().min(0),
  last_failure_reason: z.string().optional(),
  created_by: uuidSchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema
});

// Create Report Schedule schema
export const createReportScheduleSchema = z.object({
  schedule_name: z.string().min(1).max(200),
  report_type: reportTypeSchema,
  clinic_id: uuidSchema,
  frequency: frequencyTypeSchema,
  frequency_config: z.record(z.any()).default({}),
  report_parameters: z.record(z.any()).default({}),
  recipients: z.array(z.string().email()).min(1),
  delivery_format: reportFormatSchema.default('pdf'),
  is_active: z.boolean().default(true)
});

// Financial Analytics validation schema
export const financialAnalyticsSchema = z.object({
  id: uuidSchema,
  clinic_id: uuidSchema,
  metric_name: z.string().min(1).max(100),
  metric_category: z.string().min(1).max(50),
  metric_value: z.number(),
  metric_data: z.record(z.any()),
  comparison_value: z.number().optional(),
  variance_amount: z.number().optional(),
  variance_percentage: z.number().optional(),
  period_type: periodTypeSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  dimension_filters: z.record(z.any()),
  calculated_at: dateSchema,
  created_at: dateSchema
});

// Financial Benchmark validation schema
export const financialBenchmarkSchema = z.object({
  id: uuidSchema,
  benchmark_name: z.string().min(1).max(100),
  benchmark_category: z.string().min(1).max(50),
  metric_name: z.string().min(1).max(100),
  benchmark_value: z.number(),
  unit_type: kpiUnitTypeSchema,
  source: z.string().optional(),
  applicable_criteria: z.record(z.any()),
  is_active: z.boolean(),
  effective_date: dateOnlySchema,
  expiry_date: dateOnlySchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema
});

// Budget Plan validation schema
export const budgetPlanSchema = z.object({
  id: uuidSchema,
  clinic_id: uuidSchema,
  plan_name: z.string().min(1).max(200),
  description: z.string().optional(),
  budget_year: z.number().int().min(2020).max(2050),
  budget_type: z.enum(['annual', 'quarterly', 'monthly']),
  status: z.enum(['draft', 'approved', 'active', 'completed']),
  total_revenue_budget: currencySchema,
  total_expense_budget: currencySchema,
  created_by: uuidSchema.optional(),
  approved_by: uuidSchema.optional(),
  approved_at: dateSchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema
});

// Create Budget Plan schema
export const createBudgetPlanSchema = z.object({
  clinic_id: uuidSchema,
  plan_name: z.string().min(1).max(200),
  description: z.string().optional(),
  budget_year: z.number().int().min(2020).max(2050),
  budget_type: z.enum(['annual', 'quarterly', 'monthly']).default('annual'),
  total_revenue_budget: currencySchema,
  total_expense_budget: currencySchema
});

// Budget Item validation schema
export const budgetItemSchema = z.object({
  id: uuidSchema,
  budget_plan_id: uuidSchema,
  category_name: z.string().min(1).max(100),
  category_type: z.enum(['revenue', 'expense']),
  budgeted_amount: currencySchema,
  actual_amount: currencySchema,
  variance_amount: z.number(),
  variance_percentage: z.number(),
  period_allocation: z.record(z.number()),
  notes: z.string().optional(),
  last_updated: dateSchema,
  created_at: dateSchema
});

// Create Budget Item schema
export const createBudgetItemSchema = z.object({
  budget_plan_id: uuidSchema,
  category_name: z.string().min(1).max(100),
  category_type: z.enum(['revenue', 'expense']),
  budgeted_amount: currencySchema,
  period_allocation: z.record(z.number()).default({}),
  notes: z.string().optional()
});

// Report Template validation schema
export const reportTemplateSchema = z.object({
  id: uuidSchema,
  template_name: z.string().min(1).max(200),
  report_type: reportTypeSchema,
  description: z.string().optional(),
  template_config: z.record(z.any()),
  is_default: z.boolean(),
  is_public: z.boolean(),
  clinic_id: uuidSchema.optional(),
  created_by: uuidSchema.optional(),
  usage_count: z.number().int().min(0),
  created_at: dateSchema,
  updated_at: dateSchema
});

// Create Report Template schema
export const createReportTemplateSchema = z.object({
  template_name: z.string().min(1).max(200),
  report_type: reportTypeSchema,
  description: z.string().optional(),
  template_config: z.record(z.any()).default({}),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false),
  clinic_id: uuidSchema.optional()
});

// Report Parameters validation schema
export const reportParametersSchema = z.object({
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  comparison_period_start: dateOnlySchema.optional(),
  comparison_period_end: dateOnlySchema.optional(),
  include_budget_comparison: z.boolean().default(false),
  include_benchmark_comparison: z.boolean().default(false),
  filters: z.object({
    services: z.array(z.string()).optional(),
    providers: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    payment_methods: z.array(z.string()).optional(),
    patient_segments: z.array(z.string()).optional()
  }).optional(),
  grouping: z.object({
    by_service: z.boolean().default(false),
    by_provider: z.boolean().default(false),
    by_location: z.boolean().default(false),
    by_month: z.boolean().default(false),
    by_quarter: z.boolean().default(false)
  }).optional(),
  formatting: z.object({
    currency: z.string().default('BRL'),
    language: z.string().default('pt-BR'),
    decimal_places: z.number().int().min(0).max(4).default(2),
    include_charts: z.boolean().default(true),
    include_trends: z.boolean().default(true)
  }).optional()
}).refine(
  (data) => new Date(data.period_end) >= new Date(data.period_start),
  {
    message: "Period end must be after or equal to period start",
    path: ["period_end"]
  }
).refine(
  (data) => {
    if (data.comparison_period_start && data.comparison_period_end) {
      return new Date(data.comparison_period_end) >= new Date(data.comparison_period_start);
    }
    return true;
  },
  {
    message: "Comparison period end must be after or equal to comparison period start",
    path: ["comparison_period_end"]
  }
);

// Financial statement validation schemas
export const profitLossStatementSchema = z.object({
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  clinic_id: uuidSchema,
  revenue: z.object({
    consultation_revenue: currencySchema,
    treatment_revenue: currencySchema,
    product_revenue: currencySchema,
    other_revenue: currencySchema,
    total_revenue: currencySchema
  }),
  cost_of_services: z.object({
    direct_costs: currencySchema,
    materials_costs: currencySchema,
    equipment_costs: currencySchema,
    total_cost_of_services: currencySchema
  }),
  gross_profit: z.number(),
  gross_profit_margin: percentageSchema,
  operating_expenses: z.object({
    staff_costs: currencySchema,
    rent_utilities: currencySchema,
    marketing_expenses: currencySchema,
    administrative_expenses: currencySchema,
    other_expenses: currencySchema,
    total_operating_expenses: currencySchema
  }),
  operating_profit: z.number(),
  operating_profit_margin: percentageSchema,
  other_income_expenses: z.object({
    financial_income: currencySchema,
    financial_expenses: currencySchema,
    other_income: currencySchema,
    other_expenses: currencySchema,
    total_other: z.number()
  }),
  profit_before_tax: z.number(),
  tax_expenses: currencySchema,
  net_profit: z.number(),
  net_profit_margin: percentageSchema
});

export const balanceSheetSchema = z.object({
  as_of_date: dateOnlySchema,
  clinic_id: uuidSchema,
  assets: z.object({
    current_assets: z.object({
      cash_and_equivalents: currencySchema,
      accounts_receivable: currencySchema,
      inventory: currencySchema,
      prepaid_expenses: currencySchema,
      other_current_assets: currencySchema,
      total_current_assets: currencySchema
    }),
    non_current_assets: z.object({
      equipment: currencySchema,
      accumulated_depreciation: z.number(),
      net_equipment: currencySchema,
      software_licenses: currencySchema,
      other_non_current_assets: currencySchema,
      total_non_current_assets: currencySchema
    }),
    total_assets: currencySchema
  }),
  liabilities: z.object({
    current_liabilities: z.object({
      accounts_payable: currencySchema,
      accrued_expenses: currencySchema,
      short_term_debt: currencySchema,
      other_current_liabilities: currencySchema,
      total_current_liabilities: currencySchema
    }),
    non_current_liabilities: z.object({
      long_term_debt: currencySchema,
      other_non_current_liabilities: currencySchema,
      total_non_current_liabilities: currencySchema
    }),
    total_liabilities: currencySchema
  }),
  equity: z.object({
    paid_in_capital: currencySchema,
    retained_earnings: z.number(),
    current_period_earnings: z.number(),
    total_equity: z.number()
  }),
  total_liabilities_and_equity: currencySchema
});

export const cashFlowStatementSchema = z.object({
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  clinic_id: uuidSchema,
  operating_activities: z.object({
    net_profit: z.number(),
    depreciation: currencySchema,
    accounts_receivable_change: z.number(),
    inventory_change: z.number(),
    accounts_payable_change: z.number(),
    other_working_capital_changes: z.number(),
    net_cash_from_operations: z.number()
  }),
  investing_activities: z.object({
    equipment_purchases: z.number(),
    software_purchases: z.number(),
    other_investments: z.number(),
    net_cash_from_investing: z.number()
  }),
  financing_activities: z.object({
    debt_proceeds: currencySchema,
    debt_payments: z.number(),
    owner_contributions: currencySchema,
    owner_distributions: z.number(),
    net_cash_from_financing: z.number()
  }),
  net_cash_change: z.number(),
  beginning_cash: currencySchema,
  ending_cash: currencySchema
});

// KPI Calculation validation schema
export const kpiCalculationSchema = z.object({
  kpi_name: z.string().min(1),
  display_name: z.string().min(1),
  current_value: z.number(),
  target_value: z.number().optional(),
  previous_value: z.number().optional(),
  unit_type: kpiUnitTypeSchema,
  calculation_method: z.string(),
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  variance_from_target: z.number().optional(),
  variance_from_previous: z.number().optional(),
  trend_direction: z.enum(['up', 'down', 'stable']),
  alert_status: alertStatusSchema
});

// Revenue Analytics validation schema
export const revenueAnalyticsSchema = z.object({
  total_revenue: currencySchema,
  revenue_by_service: z.array(z.object({
    service_name: z.string(),
    revenue: currencySchema,
    percentage: percentageSchema,
    growth_rate: z.number().optional()
  })),
  revenue_by_provider: z.array(z.object({
    provider_name: z.string(),
    revenue: currencySchema,
    percentage: percentageSchema,
    patient_count: z.number().int().min(0)
  })),
  revenue_by_period: z.array(z.object({
    period: z.string(),
    revenue: currencySchema,
    growth_rate: z.number().optional()
  })),
  revenue_trends: z.object({
    daily_average: currencySchema,
    weekly_average: currencySchema,
    monthly_average: currencySchema,
    seasonal_patterns: z.record(z.number())
  })
});

// Export validation schema
export const reportExportOptionsSchema = z.object({
  format: reportFormatSchema,
  include_charts: z.boolean().default(true),
  include_raw_data: z.boolean().default(false),
  language: z.string().default('pt-BR'),
  currency: z.string().default('BRL'),
  custom_branding: z.object({
    logo_url: z.string().url().optional(),
    clinic_name: z.string().optional(),
    header_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    footer_text: z.string().optional()
  }).optional()
});

// Dashboard subscription validation schema
export const dashboardSubscriptionSchema = z.object({
  clinic_id: uuidSchema,
  user_id: uuidSchema,
  subscribed_kpis: z.array(z.string()).min(1),
  update_frequency: z.number().int().min(1).max(3600), // 1 second to 1 hour
  last_update: dateSchema
});

// Error handling validation schema
export const financialReportErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: dateSchema
});

export const validationResultSchema = z.object({
  is_valid: z.boolean(),
  errors: z.array(financialReportErrorSchema),
  warnings: z.array(z.string())
});

// Query parameter validation schemas
export const financialReportQuerySchema = z.object({
  clinic_id: uuidSchema,
  report_type: reportTypeSchema.optional(),
  status: reportStatusSchema.optional(),
  period_start: dateOnlySchema.optional(),
  period_end: dateOnlySchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['generated_date', 'report_name', 'file_size']).default('generated_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const kpiQuerySchema = z.object({
  clinic_id: uuidSchema,
  kpi_names: z.array(z.string()).optional(),
  period_type: periodTypeSchema.optional(),
  alert_status: alertStatusSchema.optional(),
  period_start: dateOnlySchema.optional(),
  period_end: dateOnlySchema.optional()
});

// Validation utility functions
export const validateReportPeriod = (start: string, end: string): boolean => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Maximum 2 years period
  return diffDays >= 0 && diffDays <= 730;
};

export const validateEmailList = (emails: string[]): boolean => {
  return emails.every(email => z.string().email().safeParse(email).success);
};

export const validateKPIThresholds = (warning?: number, critical?: number): boolean => {
  if (warning !== undefined && critical !== undefined) {
    return warning !== critical;
  }
  return true;
};

// Export all schemas
export const financialReportingValidation = {
  financialReportSchema,
  createFinancialReportSchema,
  financialKPISchema,
  createFinancialKPISchema,
  reportScheduleSchema,
  createReportScheduleSchema,
  financialAnalyticsSchema,
  financialBenchmarkSchema,
  budgetPlanSchema,
  createBudgetPlanSchema,
  budgetItemSchema,
  createBudgetItemSchema,
  reportTemplateSchema,
  createReportTemplateSchema,
  reportParametersSchema,
  profitLossStatementSchema,
  balanceSheetSchema,
  cashFlowStatementSchema,
  kpiCalculationSchema,
  revenueAnalyticsSchema,
  reportExportOptionsSchema,
  dashboardSubscriptionSchema,
  financialReportErrorSchema,
  validationResultSchema,
  financialReportQuerySchema,
  kpiQuerySchema,
  validateReportPeriod,
  validateEmailList,
  validateKPIThresholds
};
