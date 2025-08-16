// Expense & Budget Management Engine
// Epic 5, Story 5.1, Task 5: Expense & Budget Management
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { createClient } from '@/app/utils/supabase/client';

export type ExpenseCategory = {
  categoryId: string;
  categoryName: string;
  parentCategoryId?: string;
  budgetAllocation: number;
  actualSpending: number;
  variance: number;
  variancePercent: number;
  alertThreshold: number;
  isOverBudget: boolean;
};

export type BudgetVarianceReport = {
  period: string;
  categories: ExpenseCategory[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  alerts: BudgetAlert[];
};

export type BudgetAlert = {
  alertId: string;
  categoryId: string;
  categoryName: string;
  alertType: 'warning' | 'critical' | 'exceeded';
  threshold: number;
  currentAmount: number;
  message: string;
  createdAt: Date;
  isResolved: boolean;
};

export type VendorExpenseData = {
  vendorId: string;
  vendorName: string;
  category: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  paymentTerms: string;
  lastPayment: Date;
  outstandingAmount: number;
  performanceScore: number;
};

export type CostCenterAllocation = {
  costCenterId: string;
  costCenterName: string;
  department: string;
  allocatedBudget: number;
  actualExpenses: number;
  utilizationRate: number;
  efficiency: number;
  profitContribution: number;
};

export type ExpenseForecast = {
  period: string;
  forecastedAmount: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  riskFactors: string[];
};

export class ExpenseBudgetEngine {
  private readonly supabase = createClient();

  // =====================================================================================
  // AUTOMATED EXPENSE CATEGORIZATION
  // =====================================================================================

  /**
   * Automatically categorize expenses using ML-based classification
   */
  async categorizeExpenses(
    clinicId: string,
    expenseIds?: string[]
  ): Promise<{ categorized: number; failed: number; suggestions: any[] }> {
    const { data: categorizationResult, error } = await this.supabase.rpc(
      'auto_categorize_expenses',
      {
        p_clinic_id: clinicId,
        p_expense_ids: expenseIds || null,
      }
    );

    if (error) {
      throw new Error(`Expense categorization failed: ${error.message}`);
    }

    return {
      categorized: categorizationResult.categorized_count,
      failed: categorizationResult.failed_count,
      suggestions: categorizationResult.suggestions || [],
    };
  }

  /**
   * Get expense categories with current spending and budget status
   */
  async getExpenseCategories(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<ExpenseCategory[]> {
    const { data: categoryData, error } = await this.supabase.rpc(
      'get_expense_categories_with_budget',
      {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString(),
      }
    );

    if (error) {
      throw new Error(`Failed to fetch expense categories: ${error.message}`);
    }

    return categoryData.map((category: any) => ({
      categoryId: category.category_id,
      categoryName: category.category_name,
      parentCategoryId: category.parent_category_id,
      budgetAllocation: Number.parseFloat(category.budget_allocation),
      actualSpending: Number.parseFloat(category.actual_spending),
      variance: Number.parseFloat(category.variance),
      variancePercent: Number.parseFloat(category.variance_percent),
      alertThreshold: Number.parseFloat(category.alert_threshold),
      isOverBudget: category.is_over_budget,
    }));
  }

  // =====================================================================================
  // BUDGET VARIANCE REPORTING
  // =====================================================================================

  /**
   * Generate comprehensive budget variance report
   */
  async generateBudgetVarianceReport(
    clinicId: string,
    period: string,
    _includeForecasting = true
  ): Promise<BudgetVarianceReport> {
    const dateRange = this.parsePeriodToDates(period);

    const [categories, alerts] = await Promise.all([
      this.getExpenseCategories(clinicId, dateRange),
      this.getBudgetAlerts(clinicId, dateRange),
    ]);

    const totalBudget = categories.reduce(
      (sum, cat) => sum + cat.budgetAllocation,
      0
    );
    const totalActual = categories.reduce(
      (sum, cat) => sum + cat.actualSpending,
      0
    );
    const totalVariance = totalActual - totalBudget;
    const variancePercent =
      totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;

    return {
      period,
      categories,
      totalBudget,
      totalActual,
      totalVariance,
      variancePercent,
      alerts,
    };
  }

  /**
   * Get budget alerts and threshold monitoring
   */
  async getBudgetAlerts(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<BudgetAlert[]> {
    const { data: alertData, error } = await this.supabase
      .from('budget_alerts')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch budget alerts: ${error.message}`);
    }

    return alertData.map((alert: any) => ({
      alertId: alert.id,
      categoryId: alert.category_id,
      categoryName: alert.category_name,
      alertType: alert.alert_type,
      threshold: Number.parseFloat(alert.threshold),
      currentAmount: Number.parseFloat(alert.current_amount),
      message: alert.message,
      createdAt: new Date(alert.created_at),
      isResolved: alert.is_resolved,
    }));
  }

  /**
   * Create budget alert when thresholds are exceeded
   */
  async createBudgetAlert(
    clinicId: string,
    categoryId: string,
    alertType: 'warning' | 'critical' | 'exceeded',
    currentAmount: number,
    threshold: number
  ): Promise<string> {
    const alertMessage = this.generateAlertMessage(
      alertType,
      currentAmount,
      threshold
    );

    const { data: alertData, error } = await this.supabase
      .from('budget_alerts')
      .insert({
        clinic_id: clinicId,
        category_id: categoryId,
        alert_type: alertType,
        threshold,
        current_amount: currentAmount,
        message: alertMessage,
        is_resolved: false,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create budget alert: ${error.message}`);
    }

    return alertData.id;
  }

  // =====================================================================================
  // EXPENSE TREND ANALYSIS & OPTIMIZATION
  // =====================================================================================

  /**
   * Analyze expense trends and identify cost optimization opportunities
   */
  async analyzeExpenseTrends(
    clinicId: string,
    dateRange: { start: Date; end: Date },
    granularity: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<any[]> {
    const { data: trendData, error } = await this.supabase.rpc(
      'analyze_expense_trends',
      {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString(),
        p_granularity: granularity,
      }
    );

    if (error) {
      throw new Error(`Expense trend analysis failed: ${error.message}`);
    }

    return trendData.map((trend: any) => ({
      period: trend.period,
      totalExpenses: Number.parseFloat(trend.total_expenses),
      growthRate: Number.parseFloat(trend.growth_rate),
      volatility: Number.parseFloat(trend.volatility),
      optimization_opportunities: trend.optimization_opportunities || [],
      costSavingPotential: Number.parseFloat(trend.cost_saving_potential || 0),
    }));
  }

  /**
   * Identify cost optimization insights and recommendations
   */
  async generateCostOptimizationInsights(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<any[]> {
    const { data: insights, error } = await this.supabase.rpc(
      'generate_cost_optimization_insights',
      {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString(),
      }
    );

    if (error) {
      throw new Error(`Cost optimization analysis failed: ${error.message}`);
    }

    return insights.map((insight: any) => ({
      category: insight.category,
      currentSpending: Number.parseFloat(insight.current_spending),
      benchmarkSpending: Number.parseFloat(insight.benchmark_spending),
      savingsPotential: Number.parseFloat(insight.savings_potential),
      recommendations: insight.recommendations || [],
      priority: insight.priority,
      implementationEffort: insight.implementation_effort,
    }));
  }

  // =====================================================================================
  // VENDOR & SUPPLIER EXPENSE TRACKING
  // =====================================================================================

  /**
   * Analyze vendor and supplier expenses with performance metrics
   */
  async analyzeVendorExpenses(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<VendorExpenseData[]> {
    const { data: vendorData, error } = await this.supabase.rpc(
      'analyze_vendor_expenses',
      {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString(),
      }
    );

    if (error) {
      throw new Error(`Vendor expense analysis failed: ${error.message}`);
    }

    return vendorData.map((vendor: any) => ({
      vendorId: vendor.vendor_id,
      vendorName: vendor.vendor_name,
      category: vendor.category,
      totalSpent: Number.parseFloat(vendor.total_spent),
      transactionCount: Number.parseInt(vendor.transaction_count, 10),
      averageAmount: Number.parseFloat(vendor.average_amount),
      paymentTerms: vendor.payment_terms,
      lastPayment: new Date(vendor.last_payment),
      outstandingAmount: Number.parseFloat(vendor.outstanding_amount),
      performanceScore: Number.parseFloat(vendor.performance_score),
    }));
  }

  // =====================================================================================
  // COST CENTER ALLOCATION & DEPARTMENTAL REPORTING
  // =====================================================================================

  /**
   * Allocate costs to departments and cost centers
   */
  async allocateCostsByCenter(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<CostCenterAllocation[]> {
    const { data: allocationData, error } = await this.supabase.rpc(
      'allocate_costs_by_center',
      {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString(),
      }
    );

    if (error) {
      throw new Error(`Cost center allocation failed: ${error.message}`);
    }

    return allocationData.map((center: any) => ({
      costCenterId: center.cost_center_id,
      costCenterName: center.cost_center_name,
      department: center.department,
      allocatedBudget: Number.parseFloat(center.allocated_budget),
      actualExpenses: Number.parseFloat(center.actual_expenses),
      utilizationRate: Number.parseFloat(center.utilization_rate),
      efficiency: Number.parseFloat(center.efficiency),
      profitContribution: Number.parseFloat(center.profit_contribution),
    }));
  }

  // =====================================================================================
  // EXPENSE FORECASTING & BUDGET PLANNING
  // =====================================================================================

  /**
   * Generate expense forecasting for budget planning
   */
  async generateExpenseForecast(
    clinicId: string,
    categoryIds: string[],
    forecastPeriods = 12
  ): Promise<ExpenseForecast[]> {
    const { data: forecastData, error } = await this.supabase.rpc(
      'generate_expense_forecast',
      {
        p_clinic_id: clinicId,
        p_category_ids: categoryIds,
        p_forecast_periods: forecastPeriods,
      }
    );

    if (error) {
      throw new Error(`Expense forecasting failed: ${error.message}`);
    }

    return forecastData.map((forecast: any) => ({
      period: forecast.period,
      forecastedAmount: Number.parseFloat(forecast.forecasted_amount),
      confidenceInterval: {
        lower: Number.parseFloat(forecast.confidence_lower),
        upper: Number.parseFloat(forecast.confidence_upper),
      },
      trend: forecast.trend,
      seasonalFactor: Number.parseFloat(forecast.seasonal_factor),
      riskFactors: forecast.risk_factors || [],
    }));
  }

  /**
   * Create budget plan based on historical data and forecasting
   */
  async createBudgetPlan(
    clinicId: string,
    planYear: number,
    baselineType:
      | 'historical'
      | 'zero_based'
      | 'growth_adjusted' = 'growth_adjusted'
  ): Promise<any> {
    const { data: budgetPlan, error } = await this.supabase.rpc(
      'create_budget_plan',
      {
        p_clinic_id: clinicId,
        p_plan_year: planYear,
        p_baseline_type: baselineType,
      }
    );

    if (error) {
      throw new Error(`Budget plan creation failed: ${error.message}`);
    }

    return budgetPlan;
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  /**
   * Parse period string to date range
   */
  private parsePeriodToDates(period: string): { start: Date; end: Date } {
    const now = new Date();

    switch (period) {
      case 'current_month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case 'current_quarter': {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        return {
          start: new Date(now.getFullYear(), quarterStart, 1),
          end: new Date(now.getFullYear(), quarterStart + 3, 0),
        };
      }
      case 'current_year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        };
      default:
        // Default to current month
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }
  }

  /**
   * Generate alert message based on alert type and amounts
   */
  private generateAlertMessage(
    alertType: 'warning' | 'critical' | 'exceeded',
    currentAmount: number,
    threshold: number
  ): string {
    const percentage = ((currentAmount / threshold) * 100).toFixed(1);

    switch (alertType) {
      case 'warning':
        return `Budget utilization at ${percentage}% of allocated threshold`;
      case 'critical':
        return `CRITICAL: Budget utilization at ${percentage}% - immediate attention required`;
      case 'exceeded':
        return `EXCEEDED: Budget overrun by ${(currentAmount - threshold).toFixed(2)} (${percentage}% of threshold)`;
      default:
        return `Budget alert: Current spending ${currentAmount} vs threshold ${threshold}`;
    }
  }
}
