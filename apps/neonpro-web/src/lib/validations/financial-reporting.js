"use strict";
// =====================================================================================
// Advanced Financial Reporting Validation Schemas
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialReportingValidation =
  exports.validateKPIThresholds =
  exports.validateEmailList =
  exports.validateReportPeriod =
  exports.kpiQuerySchema =
  exports.financialReportQuerySchema =
  exports.validationResultSchema =
  exports.financialReportErrorSchema =
  exports.dashboardSubscriptionSchema =
  exports.reportExportOptionsSchema =
  exports.revenueAnalyticsSchema =
  exports.kpiCalculationSchema =
  exports.cashFlowStatementSchema =
  exports.balanceSheetSchema =
  exports.profitLossStatementSchema =
  exports.reportParametersSchema =
  exports.createReportTemplateSchema =
  exports.reportTemplateSchema =
  exports.createBudgetItemSchema =
  exports.budgetItemSchema =
  exports.createBudgetPlanSchema =
  exports.budgetPlanSchema =
  exports.financialBenchmarkSchema =
  exports.financialAnalyticsSchema =
  exports.createReportScheduleSchema =
  exports.reportScheduleSchema =
  exports.createFinancialKPISchema =
  exports.financialKPISchema =
  exports.createFinancialReportSchema =
  exports.financialReportSchema =
    void 0;
var zod_1 = require("zod");
var financial_reporting_1 = require("@/lib/types/financial-reporting");
// Base validation schemas
var uuidSchema = zod_1.z.string().uuid();
var dateSchema = zod_1.z.string().datetime();
var dateOnlySchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
var positiveNumberSchema = zod_1.z.number().min(0);
var percentageSchema = zod_1.z.number().min(0).max(100);
var currencySchema = zod_1.z.number().min(0);
// Enum validation schemas
var reportTypeSchema = zod_1.z.enum(Object.values(financial_reporting_1.REPORT_TYPES));
var reportFormatSchema = zod_1.z.enum(Object.values(financial_reporting_1.REPORT_FORMATS));
var reportStatusSchema = zod_1.z.enum(Object.values(financial_reporting_1.REPORT_STATUS));
var kpiUnitTypeSchema = zod_1.z.enum(Object.values(financial_reporting_1.KPI_UNIT_TYPES));
var periodTypeSchema = zod_1.z.enum(Object.values(financial_reporting_1.PERIOD_TYPES));
var alertStatusSchema = zod_1.z.enum(Object.values(financial_reporting_1.ALERT_STATUS));
var frequencyTypeSchema = zod_1.z.enum(Object.values(financial_reporting_1.FREQUENCY_TYPES));
// Financial Report validation schema
exports.financialReportSchema = zod_1.z
  .object({
    id: uuidSchema,
    report_type: reportTypeSchema,
    report_name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()),
    generated_date: dateSchema,
    period_start: dateOnlySchema,
    period_end: dateOnlySchema,
    file_path: zod_1.z.string().optional(),
    file_format: reportFormatSchema,
    status: reportStatusSchema,
    generated_by: uuidSchema.optional(),
    clinic_id: uuidSchema,
    file_size: zod_1.z.number().int().min(0).optional(),
    download_count: zod_1.z.number().int().min(0),
    last_downloaded: dateSchema.optional(),
    created_at: dateSchema,
    updated_at: dateSchema,
  })
  .refine(
    function (data) {
      return new Date(data.period_end) >= new Date(data.period_start);
    },
    {
      message: "Period end must be after or equal to period start",
      path: ["period_end"],
    },
  );
// Create Financial Report schema
exports.createFinancialReportSchema = zod_1.z
  .object({
    report_type: reportTypeSchema,
    report_name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()).default({}),
    period_start: dateOnlySchema,
    period_end: dateOnlySchema,
    file_format: reportFormatSchema.default("pdf"),
    clinic_id: uuidSchema,
  })
  .refine(
    function (data) {
      return new Date(data.period_end) >= new Date(data.period_start);
    },
    {
      message: "Period end must be after or equal to period start",
      path: ["period_end"],
    },
  );
// Financial KPI validation schema
exports.financialKPISchema = zod_1.z
  .object({
    id: uuidSchema,
    clinic_id: uuidSchema,
    kpi_name: zod_1.z.string().min(1).max(100),
    display_name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    current_value: zod_1.z.number(),
    target_value: zod_1.z.number().optional(),
    previous_value: zod_1.z.number().optional(),
    threshold_warning: zod_1.z.number().optional(),
    threshold_critical: zod_1.z.number().optional(),
    unit_type: kpiUnitTypeSchema,
    calculation_method: zod_1.z.string().optional(),
    alert_status: alertStatusSchema,
    period_type: periodTypeSchema,
    period_start: dateOnlySchema,
    period_end: dateOnlySchema,
    last_calculated: dateSchema,
    created_at: dateSchema,
    updated_at: dateSchema,
  })
  .refine(
    function (data) {
      return new Date(data.period_end) >= new Date(data.period_start);
    },
    {
      message: "Period end must be after or equal to period start",
      path: ["period_end"],
    },
  )
  .refine(
    function (data) {
      if (data.threshold_warning && data.threshold_critical) {
        return data.threshold_critical !== data.threshold_warning;
      }
      return true;
    },
    {
      message: "Warning and critical thresholds must be different",
      path: ["threshold_critical"],
    },
  );
// Create Financial KPI schema
exports.createFinancialKPISchema = zod_1.z.object({
  clinic_id: uuidSchema,
  kpi_name: zod_1.z.string().min(1).max(100),
  display_name: zod_1.z.string().min(1).max(200),
  description: zod_1.z.string().optional(),
  current_value: zod_1.z.number(),
  target_value: zod_1.z.number().optional(),
  threshold_warning: zod_1.z.number().optional(),
  threshold_critical: zod_1.z.number().optional(),
  unit_type: kpiUnitTypeSchema,
  calculation_method: zod_1.z.string().optional(),
  period_type: periodTypeSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
});
// Report Schedule validation schema
exports.reportScheduleSchema = zod_1.z.object({
  id: uuidSchema,
  schedule_name: zod_1.z.string().min(1).max(200),
  report_type: reportTypeSchema,
  clinic_id: uuidSchema,
  frequency: frequencyTypeSchema,
  frequency_config: zod_1.z.record(zod_1.z.any()),
  report_parameters: zod_1.z.record(zod_1.z.any()),
  recipients: zod_1.z.array(zod_1.z.string().email()).min(1),
  delivery_format: reportFormatSchema,
  is_active: zod_1.z.boolean(),
  last_run: dateSchema.optional(),
  next_run: dateSchema,
  run_count: zod_1.z.number().int().min(0),
  failure_count: zod_1.z.number().int().min(0),
  last_failure_reason: zod_1.z.string().optional(),
  created_by: uuidSchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema,
});
// Create Report Schedule schema
exports.createReportScheduleSchema = zod_1.z.object({
  schedule_name: zod_1.z.string().min(1).max(200),
  report_type: reportTypeSchema,
  clinic_id: uuidSchema,
  frequency: frequencyTypeSchema,
  frequency_config: zod_1.z.record(zod_1.z.any()).default({}),
  report_parameters: zod_1.z.record(zod_1.z.any()).default({}),
  recipients: zod_1.z.array(zod_1.z.string().email()).min(1),
  delivery_format: reportFormatSchema.default("pdf"),
  is_active: zod_1.z.boolean().default(true),
});
// Financial Analytics validation schema
exports.financialAnalyticsSchema = zod_1.z.object({
  id: uuidSchema,
  clinic_id: uuidSchema,
  metric_name: zod_1.z.string().min(1).max(100),
  metric_category: zod_1.z.string().min(1).max(50),
  metric_value: zod_1.z.number(),
  metric_data: zod_1.z.record(zod_1.z.any()),
  comparison_value: zod_1.z.number().optional(),
  variance_amount: zod_1.z.number().optional(),
  variance_percentage: zod_1.z.number().optional(),
  period_type: periodTypeSchema,
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  dimension_filters: zod_1.z.record(zod_1.z.any()),
  calculated_at: dateSchema,
  created_at: dateSchema,
});
// Financial Benchmark validation schema
exports.financialBenchmarkSchema = zod_1.z.object({
  id: uuidSchema,
  benchmark_name: zod_1.z.string().min(1).max(100),
  benchmark_category: zod_1.z.string().min(1).max(50),
  metric_name: zod_1.z.string().min(1).max(100),
  benchmark_value: zod_1.z.number(),
  unit_type: kpiUnitTypeSchema,
  source: zod_1.z.string().optional(),
  applicable_criteria: zod_1.z.record(zod_1.z.any()),
  is_active: zod_1.z.boolean(),
  effective_date: dateOnlySchema,
  expiry_date: dateOnlySchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema,
});
// Budget Plan validation schema
exports.budgetPlanSchema = zod_1.z.object({
  id: uuidSchema,
  clinic_id: uuidSchema,
  plan_name: zod_1.z.string().min(1).max(200),
  description: zod_1.z.string().optional(),
  budget_year: zod_1.z.number().int().min(2020).max(2050),
  budget_type: zod_1.z.enum(["annual", "quarterly", "monthly"]),
  status: zod_1.z.enum(["draft", "approved", "active", "completed"]),
  total_revenue_budget: currencySchema,
  total_expense_budget: currencySchema,
  created_by: uuidSchema.optional(),
  approved_by: uuidSchema.optional(),
  approved_at: dateSchema.optional(),
  created_at: dateSchema,
  updated_at: dateSchema,
});
// Create Budget Plan schema
exports.createBudgetPlanSchema = zod_1.z.object({
  clinic_id: uuidSchema,
  plan_name: zod_1.z.string().min(1).max(200),
  description: zod_1.z.string().optional(),
  budget_year: zod_1.z.number().int().min(2020).max(2050),
  budget_type: zod_1.z.enum(["annual", "quarterly", "monthly"]).default("annual"),
  total_revenue_budget: currencySchema,
  total_expense_budget: currencySchema,
});
// Budget Item validation schema
exports.budgetItemSchema = zod_1.z.object({
  id: uuidSchema,
  budget_plan_id: uuidSchema,
  category_name: zod_1.z.string().min(1).max(100),
  category_type: zod_1.z.enum(["revenue", "expense"]),
  budgeted_amount: currencySchema,
  actual_amount: currencySchema,
  variance_amount: zod_1.z.number(),
  variance_percentage: zod_1.z.number(),
  period_allocation: zod_1.z.record(zod_1.z.number()),
  notes: zod_1.z.string().optional(),
  last_updated: dateSchema,
  created_at: dateSchema,
});
// Create Budget Item schema
exports.createBudgetItemSchema = zod_1.z.object({
  budget_plan_id: uuidSchema,
  category_name: zod_1.z.string().min(1).max(100),
  category_type: zod_1.z.enum(["revenue", "expense"]),
  budgeted_amount: currencySchema,
  period_allocation: zod_1.z.record(zod_1.z.number()).default({}),
  notes: zod_1.z.string().optional(),
});
// Report Template validation schema
exports.reportTemplateSchema = zod_1.z.object({
  id: uuidSchema,
  template_name: zod_1.z.string().min(1).max(200),
  report_type: reportTypeSchema,
  description: zod_1.z.string().optional(),
  template_config: zod_1.z.record(zod_1.z.any()),
  is_default: zod_1.z.boolean(),
  is_public: zod_1.z.boolean(),
  clinic_id: uuidSchema.optional(),
  created_by: uuidSchema.optional(),
  usage_count: zod_1.z.number().int().min(0),
  created_at: dateSchema,
  updated_at: dateSchema,
});
// Create Report Template schema
exports.createReportTemplateSchema = zod_1.z.object({
  template_name: zod_1.z.string().min(1).max(200),
  report_type: reportTypeSchema,
  description: zod_1.z.string().optional(),
  template_config: zod_1.z.record(zod_1.z.any()).default({}),
  is_default: zod_1.z.boolean().default(false),
  is_public: zod_1.z.boolean().default(false),
  clinic_id: uuidSchema.optional(),
});
// Report Parameters validation schema
exports.reportParametersSchema = zod_1.z
  .object({
    period_start: dateOnlySchema,
    period_end: dateOnlySchema,
    comparison_period_start: dateOnlySchema.optional(),
    comparison_period_end: dateOnlySchema.optional(),
    include_budget_comparison: zod_1.z.boolean().default(false),
    include_benchmark_comparison: zod_1.z.boolean().default(false),
    filters: zod_1.z
      .object({
        services: zod_1.z.array(zod_1.z.string()).optional(),
        providers: zod_1.z.array(zod_1.z.string()).optional(),
        locations: zod_1.z.array(zod_1.z.string()).optional(),
        payment_methods: zod_1.z.array(zod_1.z.string()).optional(),
        patient_segments: zod_1.z.array(zod_1.z.string()).optional(),
      })
      .optional(),
    grouping: zod_1.z
      .object({
        by_service: zod_1.z.boolean().default(false),
        by_provider: zod_1.z.boolean().default(false),
        by_location: zod_1.z.boolean().default(false),
        by_month: zod_1.z.boolean().default(false),
        by_quarter: zod_1.z.boolean().default(false),
      })
      .optional(),
    formatting: zod_1.z
      .object({
        currency: zod_1.z.string().default("BRL"),
        language: zod_1.z.string().default("pt-BR"),
        decimal_places: zod_1.z.number().int().min(0).max(4).default(2),
        include_charts: zod_1.z.boolean().default(true),
        include_trends: zod_1.z.boolean().default(true),
      })
      .optional(),
  })
  .refine(
    function (data) {
      return new Date(data.period_end) >= new Date(data.period_start);
    },
    {
      message: "Period end must be after or equal to period start",
      path: ["period_end"],
    },
  )
  .refine(
    function (data) {
      if (data.comparison_period_start && data.comparison_period_end) {
        return new Date(data.comparison_period_end) >= new Date(data.comparison_period_start);
      }
      return true;
    },
    {
      message: "Comparison period end must be after or equal to comparison period start",
      path: ["comparison_period_end"],
    },
  );
// Financial statement validation schemas
exports.profitLossStatementSchema = zod_1.z.object({
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  clinic_id: uuidSchema,
  revenue: zod_1.z.object({
    consultation_revenue: currencySchema,
    treatment_revenue: currencySchema,
    product_revenue: currencySchema,
    other_revenue: currencySchema,
    total_revenue: currencySchema,
  }),
  cost_of_services: zod_1.z.object({
    direct_costs: currencySchema,
    materials_costs: currencySchema,
    equipment_costs: currencySchema,
    total_cost_of_services: currencySchema,
  }),
  gross_profit: zod_1.z.number(),
  gross_profit_margin: percentageSchema,
  operating_expenses: zod_1.z.object({
    staff_costs: currencySchema,
    rent_utilities: currencySchema,
    marketing_expenses: currencySchema,
    administrative_expenses: currencySchema,
    other_expenses: currencySchema,
    total_operating_expenses: currencySchema,
  }),
  operating_profit: zod_1.z.number(),
  operating_profit_margin: percentageSchema,
  other_income_expenses: zod_1.z.object({
    financial_income: currencySchema,
    financial_expenses: currencySchema,
    other_income: currencySchema,
    other_expenses: currencySchema,
    total_other: zod_1.z.number(),
  }),
  profit_before_tax: zod_1.z.number(),
  tax_expenses: currencySchema,
  net_profit: zod_1.z.number(),
  net_profit_margin: percentageSchema,
});
exports.balanceSheetSchema = zod_1.z.object({
  as_of_date: dateOnlySchema,
  clinic_id: uuidSchema,
  assets: zod_1.z.object({
    current_assets: zod_1.z.object({
      cash_and_equivalents: currencySchema,
      accounts_receivable: currencySchema,
      inventory: currencySchema,
      prepaid_expenses: currencySchema,
      other_current_assets: currencySchema,
      total_current_assets: currencySchema,
    }),
    non_current_assets: zod_1.z.object({
      equipment: currencySchema,
      accumulated_depreciation: zod_1.z.number(),
      net_equipment: currencySchema,
      software_licenses: currencySchema,
      other_non_current_assets: currencySchema,
      total_non_current_assets: currencySchema,
    }),
    total_assets: currencySchema,
  }),
  liabilities: zod_1.z.object({
    current_liabilities: zod_1.z.object({
      accounts_payable: currencySchema,
      accrued_expenses: currencySchema,
      short_term_debt: currencySchema,
      other_current_liabilities: currencySchema,
      total_current_liabilities: currencySchema,
    }),
    non_current_liabilities: zod_1.z.object({
      long_term_debt: currencySchema,
      other_non_current_liabilities: currencySchema,
      total_non_current_liabilities: currencySchema,
    }),
    total_liabilities: currencySchema,
  }),
  equity: zod_1.z.object({
    paid_in_capital: currencySchema,
    retained_earnings: zod_1.z.number(),
    current_period_earnings: zod_1.z.number(),
    total_equity: zod_1.z.number(),
  }),
  total_liabilities_and_equity: currencySchema,
});
exports.cashFlowStatementSchema = zod_1.z.object({
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  clinic_id: uuidSchema,
  operating_activities: zod_1.z.object({
    net_profit: zod_1.z.number(),
    depreciation: currencySchema,
    accounts_receivable_change: zod_1.z.number(),
    inventory_change: zod_1.z.number(),
    accounts_payable_change: zod_1.z.number(),
    other_working_capital_changes: zod_1.z.number(),
    net_cash_from_operations: zod_1.z.number(),
  }),
  investing_activities: zod_1.z.object({
    equipment_purchases: zod_1.z.number(),
    software_purchases: zod_1.z.number(),
    other_investments: zod_1.z.number(),
    net_cash_from_investing: zod_1.z.number(),
  }),
  financing_activities: zod_1.z.object({
    debt_proceeds: currencySchema,
    debt_payments: zod_1.z.number(),
    owner_contributions: currencySchema,
    owner_distributions: zod_1.z.number(),
    net_cash_from_financing: zod_1.z.number(),
  }),
  net_cash_change: zod_1.z.number(),
  beginning_cash: currencySchema,
  ending_cash: currencySchema,
});
// KPI Calculation validation schema
exports.kpiCalculationSchema = zod_1.z.object({
  kpi_name: zod_1.z.string().min(1),
  display_name: zod_1.z.string().min(1),
  current_value: zod_1.z.number(),
  target_value: zod_1.z.number().optional(),
  previous_value: zod_1.z.number().optional(),
  unit_type: kpiUnitTypeSchema,
  calculation_method: zod_1.z.string(),
  period_start: dateOnlySchema,
  period_end: dateOnlySchema,
  variance_from_target: zod_1.z.number().optional(),
  variance_from_previous: zod_1.z.number().optional(),
  trend_direction: zod_1.z.enum(["up", "down", "stable"]),
  alert_status: alertStatusSchema,
});
// Revenue Analytics validation schema
exports.revenueAnalyticsSchema = zod_1.z.object({
  total_revenue: currencySchema,
  revenue_by_service: zod_1.z.array(
    zod_1.z.object({
      service_name: zod_1.z.string(),
      revenue: currencySchema,
      percentage: percentageSchema,
      growth_rate: zod_1.z.number().optional(),
    }),
  ),
  revenue_by_provider: zod_1.z.array(
    zod_1.z.object({
      provider_name: zod_1.z.string(),
      revenue: currencySchema,
      percentage: percentageSchema,
      patient_count: zod_1.z.number().int().min(0),
    }),
  ),
  revenue_by_period: zod_1.z.array(
    zod_1.z.object({
      period: zod_1.z.string(),
      revenue: currencySchema,
      growth_rate: zod_1.z.number().optional(),
    }),
  ),
  revenue_trends: zod_1.z.object({
    daily_average: currencySchema,
    weekly_average: currencySchema,
    monthly_average: currencySchema,
    seasonal_patterns: zod_1.z.record(zod_1.z.number()),
  }),
});
// Export validation schema
exports.reportExportOptionsSchema = zod_1.z.object({
  format: reportFormatSchema,
  include_charts: zod_1.z.boolean().default(true),
  include_raw_data: zod_1.z.boolean().default(false),
  language: zod_1.z.string().default("pt-BR"),
  currency: zod_1.z.string().default("BRL"),
  custom_branding: zod_1.z
    .object({
      logo_url: zod_1.z.string().url().optional(),
      clinic_name: zod_1.z.string().optional(),
      header_color: zod_1.z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
      footer_text: zod_1.z.string().optional(),
    })
    .optional(),
});
// Dashboard subscription validation schema
exports.dashboardSubscriptionSchema = zod_1.z.object({
  clinic_id: uuidSchema,
  user_id: uuidSchema,
  subscribed_kpis: zod_1.z.array(zod_1.z.string()).min(1),
  update_frequency: zod_1.z.number().int().min(1).max(3600), // 1 second to 1 hour
  last_update: dateSchema,
});
// Error handling validation schema
exports.financialReportErrorSchema = zod_1.z.object({
  code: zod_1.z.string(),
  message: zod_1.z.string(),
  details: zod_1.z.record(zod_1.z.any()).optional(),
  timestamp: dateSchema,
});
exports.validationResultSchema = zod_1.z.object({
  is_valid: zod_1.z.boolean(),
  errors: zod_1.z.array(exports.financialReportErrorSchema),
  warnings: zod_1.z.array(zod_1.z.string()),
});
// Query parameter validation schemas
exports.financialReportQuerySchema = zod_1.z.object({
  clinic_id: uuidSchema,
  report_type: reportTypeSchema.optional(),
  status: reportStatusSchema.optional(),
  period_start: dateOnlySchema.optional(),
  period_end: dateOnlySchema.optional(),
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z.enum(["generated_date", "report_name", "file_size"]).default("generated_date"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.kpiQuerySchema = zod_1.z.object({
  clinic_id: uuidSchema,
  kpi_names: zod_1.z.array(zod_1.z.string()).optional(),
  period_type: periodTypeSchema.optional(),
  alert_status: alertStatusSchema.optional(),
  period_start: dateOnlySchema.optional(),
  period_end: dateOnlySchema.optional(),
});
// Validation utility functions
var validateReportPeriod = function (start, end) {
  var startDate = new Date(start);
  var endDate = new Date(end);
  var diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  // Maximum 2 years period
  return diffDays >= 0 && diffDays <= 730;
};
exports.validateReportPeriod = validateReportPeriod;
var validateEmailList = function (emails) {
  return emails.every(function (email) {
    return zod_1.z.string().email().safeParse(email).success;
  });
};
exports.validateEmailList = validateEmailList;
var validateKPIThresholds = function (warning, critical) {
  if (warning !== undefined && critical !== undefined) {
    return warning !== critical;
  }
  return true;
};
exports.validateKPIThresholds = validateKPIThresholds;
// Export all schemas
exports.financialReportingValidation = {
  financialReportSchema: exports.financialReportSchema,
  createFinancialReportSchema: exports.createFinancialReportSchema,
  financialKPISchema: exports.financialKPISchema,
  createFinancialKPISchema: exports.createFinancialKPISchema,
  reportScheduleSchema: exports.reportScheduleSchema,
  createReportScheduleSchema: exports.createReportScheduleSchema,
  financialAnalyticsSchema: exports.financialAnalyticsSchema,
  financialBenchmarkSchema: exports.financialBenchmarkSchema,
  budgetPlanSchema: exports.budgetPlanSchema,
  createBudgetPlanSchema: exports.createBudgetPlanSchema,
  budgetItemSchema: exports.budgetItemSchema,
  createBudgetItemSchema: exports.createBudgetItemSchema,
  reportTemplateSchema: exports.reportTemplateSchema,
  createReportTemplateSchema: exports.createReportTemplateSchema,
  reportParametersSchema: exports.reportParametersSchema,
  profitLossStatementSchema: exports.profitLossStatementSchema,
  balanceSheetSchema: exports.balanceSheetSchema,
  cashFlowStatementSchema: exports.cashFlowStatementSchema,
  kpiCalculationSchema: exports.kpiCalculationSchema,
  revenueAnalyticsSchema: exports.revenueAnalyticsSchema,
  reportExportOptionsSchema: exports.reportExportOptionsSchema,
  dashboardSubscriptionSchema: exports.dashboardSubscriptionSchema,
  financialReportErrorSchema: exports.financialReportErrorSchema,
  validationResultSchema: exports.validationResultSchema,
  financialReportQuerySchema: exports.financialReportQuerySchema,
  kpiQuerySchema: exports.kpiQuerySchema,
  validateReportPeriod: exports.validateReportPeriod,
  validateEmailList: exports.validateEmailList,
  validateKPIThresholds: exports.validateKPIThresholds,
};
