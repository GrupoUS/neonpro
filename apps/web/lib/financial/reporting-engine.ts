// =====================================================================================
// Financial Reporting Engine - Core System
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { createClient } from '@/app/utils/supabase/client';
import {
  type BalanceSheet,
  type CashFlowStatement,
  type ExpenseAnalytics,
  FINANCIAL_CONSTANTS,
  type FinancialReport,
  type ProfitLossStatement,
  type ReportParameters,
  type RevenueAnalytics,
  type ValidationResult,
} from '@/lib/types/financial-reporting';
import {
  balanceSheetSchema,
  cashFlowStatementSchema,
  profitLossStatementSchema,
  reportParametersSchema,
} from '@/lib/validations/financial-reporting';

export class FinancialReportingEngine {
  private readonly supabase = createClient();

  // =====================================================================================
  // CORE REPORT GENERATION METHODS
  // =====================================================================================

  /**
   * Generate Profit & Loss Statement with Brazilian accounting standards
   */
  async generateProfitLossStatement(
    clinicId: string,
    parameters: ReportParameters,
  ): Promise<ProfitLossStatement> {
    const { period_start, period_end } = parameters;

    // Fetch revenue data from invoices and payments
    const { data: revenueData, error: revenueError } = await this.supabase
      .from('invoices')
      .select(
        `
        total_amount,
        tax_amount,
        status,
        invoice_items (
          service_id,
          total_amount,
          description
        )
      `,
      )
      .eq('clinic_id', clinicId)
      .gte('issue_date', period_start)
      .lte('issue_date', period_end)
      .eq('status', 'paid');

    if (revenueError) {
      throw new Error(`Revenue data fetch failed: ${revenueError.message}`);
    }

    // Fetch expense data from cash flow entries
    const { data: expenseData, error: expenseError } = await this.supabase
      .from('cash_flow_entries')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('transaction_date', period_start)
      .lte('transaction_date', period_end)
      .eq('transaction_type', 'expense');

    if (expenseError) {
      throw new Error(`Expense data fetch failed: ${expenseError.message}`);
    }

    // Calculate revenue components
    const consultationRevenue =
      revenueData
        ?.filter((inv) =>
          inv.invoice_items.some((item) =>
            item.description?.includes('consulta'),
          ),
        )
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    const treatmentRevenue =
      revenueData
        ?.filter((inv) =>
          inv.invoice_items.some((item) =>
            item.description?.includes('tratamento'),
          ),
        )
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    const productRevenue =
      revenueData
        ?.filter((inv) =>
          inv.invoice_items.some((item) =>
            item.description?.includes('produto'),
          ),
        )
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    const otherRevenue =
      revenueData
        ?.filter(
          (inv) =>
            !inv.invoice_items.some(
              (item) =>
                item.description?.includes('consulta') ||
                item.description?.includes('tratamento') ||
                item.description?.includes('produto'),
            ),
        )
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    const totalRevenue =
      consultationRevenue + treatmentRevenue + productRevenue + otherRevenue;

    // Calculate expense components
    const staffCosts =
      expenseData
        ?.filter(
          (exp) => exp.category === 'staff' || exp.category === 'payroll',
        )
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const rentUtilities =
      expenseData
        ?.filter(
          (exp) => exp.category === 'rent' || exp.category === 'utilities',
        )
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const marketingExpenses =
      expenseData
        ?.filter((exp) => exp.category === 'marketing')
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const administrativeExpenses =
      expenseData
        ?.filter((exp) => exp.category === 'administrative')
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const directCosts =
      expenseData
        ?.filter(
          (exp) => exp.category === 'materials' || exp.category === 'supplies',
        )
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const materialsCosts =
      expenseData
        ?.filter((exp) => exp.category === 'materials')
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const equipmentCosts =
      expenseData
        ?.filter((exp) => exp.category === 'equipment')
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const otherExpenses =
      expenseData
        ?.filter(
          (exp) =>
            ![
              'staff',
              'payroll',
              'rent',
              'utilities',
              'marketing',
              'administrative',
              'materials',
              'supplies',
              'equipment',
            ].includes(exp.category),
        )
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    // Calculate derived values
    const totalCostOfServices = directCosts + materialsCosts + equipmentCosts;
    const grossProfit = totalRevenue - totalCostOfServices;
    const grossProfitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalOperatingExpenses =
      staffCosts +
      rentUtilities +
      marketingExpenses +
      administrativeExpenses +
      otherExpenses;
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const operatingProfitMargin =
      totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

    // Brazilian tax calculations
    const taxExpenses =
      totalRevenue *
      (FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.ISS +
        FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.PIS +
        FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.COFINS);

    const profitBeforeTax = operatingProfit;
    const netProfit = profitBeforeTax - taxExpenses;
    const netProfitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const profitLossStatement: ProfitLossStatement = {
      period_start,
      period_end,
      clinic_id: clinicId,
      revenue: {
        consultation_revenue: consultationRevenue,
        treatment_revenue: treatmentRevenue,
        product_revenue: productRevenue,
        other_revenue: otherRevenue,
        total_revenue: totalRevenue,
      },
      cost_of_services: {
        direct_costs: directCosts,
        materials_costs: materialsCosts,
        equipment_costs: equipmentCosts,
        total_cost_of_services: totalCostOfServices,
      },
      gross_profit: grossProfit,
      gross_profit_margin: grossProfitMargin,
      operating_expenses: {
        staff_costs: staffCosts,
        rent_utilities: rentUtilities,
        marketing_expenses: marketingExpenses,
        administrative_expenses: administrativeExpenses,
        other_expenses: otherExpenses,
        total_operating_expenses: totalOperatingExpenses,
      },
      operating_profit: operatingProfit,
      operating_profit_margin: operatingProfitMargin,
      other_income_expenses: {
        financial_income: 0,
        financial_expenses: 0,
        other_income: 0,
        other_expenses: 0,
        total_other: 0,
      },
      profit_before_tax: profitBeforeTax,
      tax_expenses: taxExpenses,
      net_profit: netProfit,
      net_profit_margin: netProfitMargin,
    };

    // Validate the generated statement
    const validation = profitLossStatementSchema.safeParse(profitLossStatement);
    if (!validation.success) {
      throw new Error(`P&L validation failed: ${validation.error.message}`);
    }

    return profitLossStatement;
  }

  /**
   * Generate Balance Sheet with asset and liability tracking
   */
  async generateBalanceSheet(
    clinicId: string,
    asOfDate: string,
  ): Promise<BalanceSheet> {
    // Fetch cash position from latest cash flow
    const { data: cashData, error: cashError } = await this.supabase
      .from('cash_registers')
      .select('current_balance')
      .eq('clinic_id', clinicId)
      .single();

    if (cashError) {
      throw new Error(`Cash data fetch failed: ${cashError.message}`);
    }

    // Fetch accounts receivable from unpaid invoices
    const { data: receivableData, error: receivableError } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .in('status', ['issued', 'sent', 'overdue'])
      .lte('issue_date', asOfDate);

    if (receivableError) {
      throw new Error(
        `Receivable data fetch failed: ${receivableError.message}`,
      );
    }

    // Fetch accounts payable from unpaid bills
    const { data: payableData, error: payableError } = await this.supabase
      .from('cash_flow_entries')
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('transaction_type', 'expense')
      .eq('payment_status', 'pending')
      .lte('transaction_date', asOfDate);

    if (payableError) {
      throw new Error(`Payable data fetch failed: ${payableError.message}`);
    }

    // Calculate balance sheet components
    const cashAndEquivalents = cashData?.current_balance || 0;
    const accountsReceivable =
      receivableData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const inventory = 0; // TODO: Implement inventory tracking
    const prepaidExpenses = 0; // TODO: Implement prepaid expense tracking
    const otherCurrentAssets = 0;
    const totalCurrentAssets =
      cashAndEquivalents +
      accountsReceivable +
      inventory +
      prepaidExpenses +
      otherCurrentAssets;

    const equipment = 0; // TODO: Implement equipment asset tracking
    const accumulatedDepreciation = 0; // TODO: Implement depreciation tracking
    const netEquipment = equipment - accumulatedDepreciation;
    const softwareLicenses = 0; // TODO: Implement software asset tracking
    const otherNonCurrentAssets = 0;
    const totalNonCurrentAssets =
      netEquipment + softwareLicenses + otherNonCurrentAssets;
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    const accountsPayable =
      payableData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const accruedExpenses = 0; // TODO: Implement accrued expense tracking
    const shortTermDebt = 0; // TODO: Implement debt tracking
    const otherCurrentLiabilities = 0;
    const totalCurrentLiabilities =
      accountsPayable +
      accruedExpenses +
      shortTermDebt +
      otherCurrentLiabilities;

    const longTermDebt = 0; // TODO: Implement long-term debt tracking
    const otherNonCurrentLiabilities = 0;
    const totalNonCurrentLiabilities =
      longTermDebt + otherNonCurrentLiabilities;
    const totalLiabilities =
      totalCurrentLiabilities + totalNonCurrentLiabilities;

    const paidInCapital = 0; // TODO: Implement capital tracking
    const retainedEarnings = 0; // TODO: Implement retained earnings tracking
    const currentPeriodEarnings = 0; // TODO: Calculate from P&L
    const totalEquity =
      paidInCapital + retainedEarnings + currentPeriodEarnings;

    const balanceSheet: BalanceSheet = {
      as_of_date: asOfDate,
      clinic_id: clinicId,
      assets: {
        current_assets: {
          cash_and_equivalents: cashAndEquivalents,
          accounts_receivable: accountsReceivable,
          inventory,
          prepaid_expenses: prepaidExpenses,
          other_current_assets: otherCurrentAssets,
          total_current_assets: totalCurrentAssets,
        },
        non_current_assets: {
          equipment,
          accumulated_depreciation: accumulatedDepreciation,
          net_equipment: netEquipment,
          software_licenses: softwareLicenses,
          other_non_current_assets: otherNonCurrentAssets,
          total_non_current_assets: totalNonCurrentAssets,
        },
        total_assets: totalAssets,
      },
      liabilities: {
        current_liabilities: {
          accounts_payable: accountsPayable,
          accrued_expenses: accruedExpenses,
          short_term_debt: shortTermDebt,
          other_current_liabilities: otherCurrentLiabilities,
          total_current_liabilities: totalCurrentLiabilities,
        },
        non_current_liabilities: {
          long_term_debt: longTermDebt,
          other_non_current_liabilities: otherNonCurrentLiabilities,
          total_non_current_liabilities: totalNonCurrentLiabilities,
        },
        total_liabilities: totalLiabilities,
      },
      equity: {
        paid_in_capital: paidInCapital,
        retained_earnings: retainedEarnings,
        current_period_earnings: currentPeriodEarnings,
        total_equity: totalEquity,
      },
      total_liabilities_and_equity: totalLiabilities + totalEquity,
    };

    // Validate the generated balance sheet
    const validation = balanceSheetSchema.safeParse(balanceSheet);
    if (!validation.success) {
      throw new Error(
        `Balance sheet validation failed: ${validation.error.message}`,
      );
    }

    return balanceSheet;
  }

  /**
   * Generate Cash Flow Statement with operating, investing, and financing activities
   */
  async generateCashFlowStatement(
    clinicId: string,
    parameters: ReportParameters,
  ): Promise<CashFlowStatement> {
    const { period_start, period_end } = parameters;

    // Fetch all cash flow entries for the period
    const { data: cashFlowData, error: cashFlowError } = await this.supabase
      .from('cash_flow_entries')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('transaction_date', period_start)
      .lte('transaction_date', period_end);

    if (cashFlowError) {
      throw new Error(`Cash flow data fetch failed: ${cashFlowError.message}`);
    }

    // Fetch beginning and ending cash balances
    const { data: beginningCashData } = await this.supabase
      .from('cash_flow_entries')
      .select('running_balance')
      .eq('clinic_id', clinicId)
      .lt('transaction_date', period_start)
      .order('transaction_date', { ascending: false })
      .limit(1);

    const { data: endingCashData } = await this.supabase
      .from('cash_flow_entries')
      .select('running_balance')
      .eq('clinic_id', clinicId)
      .lte('transaction_date', period_end)
      .order('transaction_date', { ascending: false })
      .limit(1);

    const beginningCash = beginningCashData?.[0]?.running_balance || 0;
    const endingCash = endingCashData?.[0]?.running_balance || 0;

    // Calculate operating activities
    const operatingRevenue =
      cashFlowData
        ?.filter((entry) => entry.transaction_type === 'revenue')
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const operatingExpenses =
      cashFlowData
        ?.filter(
          (entry) =>
            entry.transaction_type === 'expense' &&
            entry.category !== 'equipment' &&
            entry.category !== 'investment',
        )
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const netProfit = operatingRevenue - operatingExpenses;
    const depreciation = 0; // TODO: Implement depreciation calculation
    const accountsReceivableChange = 0; // TODO: Calculate AR changes
    const inventoryChange = 0; // TODO: Calculate inventory changes
    const accountsPayableChange = 0; // TODO: Calculate AP changes
    const otherWorkingCapitalChanges = 0;
    const netCashFromOperations =
      netProfit +
      depreciation +
      accountsReceivableChange +
      inventoryChange +
      accountsPayableChange +
      otherWorkingCapitalChanges;

    // Calculate investing activities
    const equipmentPurchases =
      cashFlowData
        ?.filter(
          (entry) =>
            entry.transaction_type === 'expense' &&
            entry.category === 'equipment',
        )
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const softwarePurchases =
      cashFlowData
        ?.filter(
          (entry) =>
            entry.transaction_type === 'expense' &&
            entry.category === 'software',
        )
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const otherInvestments =
      cashFlowData
        ?.filter(
          (entry) =>
            entry.transaction_type === 'expense' &&
            entry.category === 'investment',
        )
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const netCashFromInvesting = -(
      equipmentPurchases +
      softwarePurchases +
      otherInvestments
    );

    // Calculate financing activities
    const debtProceeds = 0; // TODO: Implement debt tracking
    const debtPayments = 0; // TODO: Implement debt tracking
    const ownerContributions = 0; // TODO: Implement capital tracking
    const ownerDistributions = 0; // TODO: Implement distribution tracking
    const netCashFromFinancing =
      debtProceeds - debtPayments + ownerContributions - ownerDistributions;

    const netCashChange =
      netCashFromOperations + netCashFromInvesting + netCashFromFinancing;

    const cashFlowStatement: CashFlowStatement = {
      period_start,
      period_end,
      clinic_id: clinicId,
      operating_activities: {
        net_profit: netProfit,
        depreciation,
        accounts_receivable_change: accountsReceivableChange,
        inventory_change: inventoryChange,
        accounts_payable_change: accountsPayableChange,
        other_working_capital_changes: otherWorkingCapitalChanges,
        net_cash_from_operations: netCashFromOperations,
      },
      investing_activities: {
        equipment_purchases: -equipmentPurchases,
        software_purchases: -softwarePurchases,
        other_investments: -otherInvestments,
        net_cash_from_investing: netCashFromInvesting,
      },
      financing_activities: {
        debt_proceeds: debtProceeds,
        debt_payments: -debtPayments,
        owner_contributions: ownerContributions,
        owner_distributions: -ownerDistributions,
        net_cash_from_financing: netCashFromFinancing,
      },
      net_cash_change: netCashChange,
      beginning_cash: beginningCash,
      ending_cash: endingCash,
    };

    // Validate the generated cash flow statement
    const validation = cashFlowStatementSchema.safeParse(cashFlowStatement);
    if (!validation.success) {
      throw new Error(
        `Cash flow statement validation failed: ${validation.error.message}`,
      );
    }

    return cashFlowStatement;
  }

  // =====================================================================================
  // ANALYTICS AND KPI CALCULATION METHODS
  // =====================================================================================

  /**
   * Calculate comprehensive revenue analytics
   */
  async calculateRevenueAnalytics(
    clinicId: string,
    parameters: ReportParameters,
  ): Promise<RevenueAnalytics> {
    const { period_start, period_end } = parameters;

    // Fetch revenue data with service and provider details
    const { data: revenueData, error } = await this.supabase
      .from('invoices')
      .select(
        `
        total_amount,
        issue_date,
        invoice_items (
          service_id,
          total_amount,
          description
        ),
        appointments (
          professional_id,
          professionals (
            name
          )
        )
      `,
      )
      .eq('clinic_id', clinicId)
      .gte('issue_date', period_start)
      .lte('issue_date', period_end)
      .eq('status', 'paid');

    if (error) {
      throw new Error(`Revenue analytics fetch failed: ${error.message}`);
    }

    const totalRevenue =
      revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    // Calculate revenue by service
    const serviceRevenue = new Map<string, number>();
    revenueData?.forEach((invoice) => {
      invoice.invoice_items.forEach((item) => {
        const serviceName = item.description || 'Other';
        serviceRevenue.set(
          serviceName,
          (serviceRevenue.get(serviceName) || 0) + item.total_amount,
        );
      });
    });

    const revenueByService = Array.from(serviceRevenue.entries()).map(
      ([service_name, revenue]) => ({
        service_name,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }),
    );

    // Calculate revenue by provider
    const providerRevenue = new Map<
      string,
      { revenue: number; patient_count: number }
    >();
    revenueData?.forEach((invoice) => {
      const providerName =
        invoice.appointments?.professionals?.name || 'Unknown';
      const current = providerRevenue.get(providerName) || {
        revenue: 0,
        patient_count: 0,
      };
      current.revenue += invoice.total_amount;
      current.patient_count += 1;
      providerRevenue.set(providerName, current);
    });

    const revenueByProvider = Array.from(providerRevenue.entries()).map(
      ([provider_name, data]) => ({
        provider_name,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        patient_count: data.patient_count,
      }),
    );

    // Calculate revenue trends (placeholder - would need more sophisticated analysis)
    const dailyAverage = totalRevenue / 30; // Assuming 30-day period
    const weeklyAverage = dailyAverage * 7;
    const monthlyAverage = totalRevenue;

    return {
      total_revenue: totalRevenue,
      revenue_by_service: revenueByService,
      revenue_by_provider: revenueByProvider,
      revenue_by_period: [], // TODO: Implement period-based breakdown
      revenue_trends: {
        daily_average: dailyAverage,
        weekly_average: weeklyAverage,
        monthly_average: monthlyAverage,
        seasonal_patterns: {}, // TODO: Implement seasonal analysis
      },
    };
  }

  /**
   * Calculate comprehensive expense analytics
   */
  async calculateExpenseAnalytics(
    clinicId: string,
    parameters: ReportParameters,
  ): Promise<ExpenseAnalytics> {
    const { period_start, period_end } = parameters;

    // Fetch expense data
    const { data: expenseData, error } = await this.supabase
      .from('cash_flow_entries')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('transaction_date', period_start)
      .lte('transaction_date', period_end)
      .eq('transaction_type', 'expense');

    if (error) {
      throw new Error(`Expense analytics fetch failed: ${error.message}`);
    }

    const totalExpenses =
      expenseData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    // Calculate expenses by category
    const categoryExpenses = new Map<string, number>();
    expenseData?.forEach((expense) => {
      const category = expense.category || 'Other';
      categoryExpenses.set(
        category,
        (categoryExpenses.get(category) || 0) + expense.amount,
      );
    });

    const expenseByCategory = Array.from(categoryExpenses.entries()).map(
      ([category_name, amount]) => ({
        category_name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }),
    );

    // Calculate fixed vs variable expenses (simplified categorization)
    const fixedExpenses =
      expenseData
        ?.filter((exp) =>
          ['rent', 'utilities', 'insurance', 'software'].includes(exp.category),
        )
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const variableExpenses = totalExpenses - fixedExpenses;

    return {
      total_expenses: totalExpenses,
      expense_by_category: expenseByCategory,
      expense_trends: {
        fixed_expenses: fixedExpenses,
        variable_expenses: variableExpenses,
        growth_rate: 0, // TODO: Calculate growth rate
      },
      cost_per_patient: 0, // TODO: Calculate cost per patient
      cost_per_service: {}, // TODO: Calculate cost per service
    };
  }

  // =====================================================================================
  // REPORT MANAGEMENT METHODS
  // =====================================================================================

  /**
   * Save generated report to database and file system
   */
  async saveFinancialReport(
    report: Partial<FinancialReport>,
    _content: any,
  ): Promise<FinancialReport> {
    const { data, error } = await this.supabase
      .from('financial_reports')
      .insert([
        {
          ...report,
          status: 'generated',
          generated_date: new Date().toISOString(),
          download_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save report: ${error.message}`);
    }

    // TODO: Save report content to file system and update file_path

    return data;
  }

  /**
   * Get saved financial reports with filtering
   */
  async getFinancialReports(
    clinicId: string,
    filters: {
      report_type?: string;
      status?: string;
      period_start?: string;
      period_end?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ reports: FinancialReport[]; total: number }> {
    let query = this.supabase
      .from('financial_reports')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (filters.report_type) {
      query = query.eq('report_type', filters.report_type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start);
    }

    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('generated_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return {
      reports: data || [],
      total: count || 0,
    };
  }

  /**
   * Validate report parameters and data integrity
   */
  validateReportParameters(parameters: ReportParameters): ValidationResult {
    const validation = reportParametersSchema.safeParse(parameters);

    if (!validation.success) {
      return {
        is_valid: false,
        errors: validation.error.errors.map((err) => ({
          code: 'VALIDATION_ERROR',
          message: err.message,
          details: { path: err.path, value: err.input },
          timestamp: new Date().toISOString(),
        })),
        warnings: [],
      };
    }

    const warnings: string[] = [];

    // Check for reasonable date ranges
    const startDate = new Date(parameters.period_start);
    const endDate = new Date(parameters.period_end);
    const diffDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 365) {
      warnings.push(
        'Report period exceeds 1 year, performance may be impacted',
      );
    }

    if (endDate > new Date()) {
      warnings.push('Report period includes future dates');
    }

    return {
      is_valid: true,
      errors: [],
      warnings,
    };
  }
}
