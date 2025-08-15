// =====================================================================================
// Financial Analytics Core - KPI Engine
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { createClient } from '@/app/utils/supabase/client';
import {
  DASHBOARD_REFRESH_INTERVALS,
  type FinancialDashboardData,
  type KPICalculation,
  type PerformanceMetrics,
  type ReportParameters,
} from '@/lib/types/financial-reporting';
import { FinancialReportingEngine } from './reporting-engine';

export class FinancialAnalyticsCore {
  private supabase = createClient();
  private reportingEngine = new FinancialReportingEngine();

  // =====================================================================================
  // CORE KPI CALCULATION METHODS
  // =====================================================================================

  /**
   * Calculate comprehensive financial KPIs and performance metrics
   */
  async calculateFinancialKPIs(
    clinicId: string,
    parameters: ReportParameters
  ): Promise<KPICalculation> {
    const { period_start, period_end } = parameters;

    // Generate core financial statements for KPI calculation
    const [profitLoss, balanceSheet, cashFlow] = await Promise.all([
      this.reportingEngine.generateProfitLossStatement(clinicId, parameters),
      this.reportingEngine.generateBalanceSheet(clinicId, period_end),
      this.reportingEngine.generateCashFlowStatement(clinicId, parameters),
    ]);

    // Calculate profitability KPIs
    const grossProfitMargin = profitLoss.gross_profit_margin;
    const operatingProfitMargin = profitLoss.operating_profit_margin;
    const netProfitMargin = profitLoss.net_profit_margin;
    const returnOnAssets =
      balanceSheet.assets.total_assets > 0
        ? (profitLoss.net_profit / balanceSheet.assets.total_assets) * 100
        : 0;
    const returnOnEquity =
      balanceSheet.equity.total_equity > 0
        ? (profitLoss.net_profit / balanceSheet.equity.total_equity) * 100
        : 0;

    // Calculate liquidity KPIs
    const currentRatio =
      balanceSheet.liabilities.current_liabilities.total_current_liabilities > 0
        ? balanceSheet.assets.current_assets.total_current_assets /
          balanceSheet.liabilities.current_liabilities.total_current_liabilities
        : 0;

    const quickRatio =
      balanceSheet.liabilities.current_liabilities.total_current_liabilities > 0
        ? (balanceSheet.assets.current_assets.cash_and_equivalents +
            balanceSheet.assets.current_assets.accounts_receivable) /
          balanceSheet.liabilities.current_liabilities.total_current_liabilities
        : 0;

    const cashRatio =
      balanceSheet.liabilities.current_liabilities.total_current_liabilities > 0
        ? balanceSheet.assets.current_assets.cash_and_equivalents /
          balanceSheet.liabilities.current_liabilities.total_current_liabilities
        : 0;

    // Calculate efficiency KPIs
    const assetTurnover =
      balanceSheet.assets.total_assets > 0
        ? profitLoss.revenue.total_revenue / balanceSheet.assets.total_assets
        : 0;

    const receivablesTurnover =
      balanceSheet.assets.current_assets.accounts_receivable > 0
        ? profitLoss.revenue.total_revenue /
          balanceSheet.assets.current_assets.accounts_receivable
        : 0;

    const daysInAccountsReceivable =
      receivablesTurnover > 0 ? 365 / receivablesTurnover : 0;

    // Calculate leverage KPIs
    const debtToAssets =
      balanceSheet.assets.total_assets > 0
        ? balanceSheet.liabilities.total_liabilities /
          balanceSheet.assets.total_assets
        : 0;

    const debtToEquity =
      balanceSheet.equity.total_equity > 0
        ? balanceSheet.liabilities.total_liabilities /
          balanceSheet.equity.total_equity
        : 0;

    const equityMultiplier =
      balanceSheet.equity.total_equity > 0
        ? balanceSheet.assets.total_assets / balanceSheet.equity.total_equity
        : 0;

    // Calculate cash flow KPIs
    const operatingCashFlowRatio =
      balanceSheet.liabilities.current_liabilities.total_current_liabilities > 0
        ? cashFlow.operating_activities.net_cash_from_operations /
          balanceSheet.liabilities.current_liabilities.total_current_liabilities
        : 0;

    const cashFlowToDebt =
      balanceSheet.liabilities.total_liabilities > 0
        ? cashFlow.operating_activities.net_cash_from_operations /
          balanceSheet.liabilities.total_liabilities
        : 0;

    const freeCashFlow =
      cashFlow.operating_activities.net_cash_from_operations +
      cashFlow.investing_activities.net_cash_from_investing;

    return {
      calculation_date: new Date().toISOString(),
      period_start,
      period_end,
      clinic_id: clinicId,
      profitability_kpis: {
        gross_profit_margin: grossProfitMargin,
        operating_profit_margin: operatingProfitMargin,
        net_profit_margin: netProfitMargin,
        return_on_assets: returnOnAssets,
        return_on_equity: returnOnEquity,
        ebitda_margin: operatingProfitMargin, // Simplified for now
      },
      liquidity_kpis: {
        current_ratio: currentRatio,
        quick_ratio: quickRatio,
        cash_ratio: cashRatio,
        working_capital:
          balanceSheet.assets.current_assets.total_current_assets -
          balanceSheet.liabilities.current_liabilities
            .total_current_liabilities,
        cash_conversion_cycle: daysInAccountsReceivable, // Simplified for now
      },
      efficiency_kpis: {
        asset_turnover: assetTurnover,
        receivables_turnover: receivablesTurnover,
        days_in_accounts_receivable: daysInAccountsReceivable,
        revenue_per_employee: 0, // TODO: Implement employee tracking
        revenue_per_patient: 0, // TODO: Implement patient count tracking
      },
      leverage_kpis: {
        debt_to_assets: debtToAssets,
        debt_to_equity: debtToEquity,
        equity_multiplier: equityMultiplier,
        interest_coverage_ratio: 0, // TODO: Implement interest expense tracking
        debt_service_coverage_ratio: 0, // TODO: Implement debt service tracking
      },
      cash_flow_kpis: {
        operating_cash_flow_ratio: operatingCashFlowRatio,
        cash_flow_to_debt: cashFlowToDebt,
        free_cash_flow: freeCashFlow,
        cash_flow_per_share: 0, // Not applicable for clinics
        cash_return_on_invested_capital: 0, // TODO: Implement ROIC calculation
      },
    };
  }

  /**
   * Calculate detailed performance metrics with benchmarking
   */
  async calculatePerformanceMetrics(
    clinicId: string,
    parameters: ReportParameters
  ): Promise<PerformanceMetrics> {
    const { period_start, period_end } = parameters;

    // Fetch operational data for performance metrics
    const [appointmentData, revenueData, expenseData] = await Promise.all([
      this.fetchAppointmentMetrics(clinicId, parameters),
      this.reportingEngine.calculateRevenueAnalytics(clinicId, parameters),
      this.reportingEngine.calculateExpenseAnalytics(clinicId, parameters),
    ]);

    // Calculate revenue metrics
    const revenueGrowthRate = await this.calculateGrowthRate(
      clinicId,
      'revenue',
      period_start,
      period_end
    );
    const averageTransactionValue =
      revenueData.total_revenue / (appointmentData.total_appointments || 1);
    const revenuePerSquareMeter = 0; // TODO: Implement clinic space tracking

    // Calculate operational metrics
    const patientRetentionRate = await this.calculatePatientRetentionRate(
      clinicId,
      parameters
    );
    const appointmentUtilizationRate = appointmentData.utilization_rate;
    const averageWaitTime = appointmentData.average_wait_time;
    const patientSatisfactionScore = 0; // TODO: Implement satisfaction tracking

    // Calculate cost metrics
    const costGrowthRate = await this.calculateGrowthRate(
      clinicId,
      'expenses',
      period_start,
      period_end
    );
    const costPerPatient = expenseData.cost_per_patient;
    const costPerAppointment =
      expenseData.total_expenses / (appointmentData.total_appointments || 1);

    // Calculate market metrics
    const marketShare = 0; // TODO: Implement market analysis
    const competitivePosition = 'unknown'; // TODO: Implement competitive analysis
    const brandAwareness = 0; // TODO: Implement brand tracking

    return {
      calculation_date: new Date().toISOString(),
      period_start,
      period_end,
      clinic_id: clinicId,
      revenue_metrics: {
        revenue_growth_rate: revenueGrowthRate,
        average_transaction_value: averageTransactionValue,
        revenue_per_patient: averageTransactionValue,
        revenue_per_square_meter: revenuePerSquareMeter,
        seasonal_revenue_variance: 0, // TODO: Implement seasonal analysis
      },
      operational_metrics: {
        patient_retention_rate: patientRetentionRate,
        appointment_utilization_rate: appointmentUtilizationRate,
        average_wait_time: averageWaitTime,
        patient_satisfaction_score: patientSatisfactionScore,
        staff_productivity_index: 0, // TODO: Implement staff tracking
      },
      cost_metrics: {
        cost_growth_rate: costGrowthRate,
        cost_per_patient: costPerPatient,
        cost_per_appointment: costPerAppointment,
        cost_inflation_impact: 0, // TODO: Implement inflation analysis
        cost_optimization_opportunities: [], // TODO: Implement cost optimization analysis
      },
      market_metrics: {
        market_share: marketShare,
        competitive_position: competitivePosition,
        brand_awareness: brandAwareness,
        market_growth_rate: 0, // TODO: Implement market research integration
        customer_acquisition_cost: 0, // TODO: Implement marketing analytics
      },
      benchmarks: {
        industry_averages: {}, // TODO: Implement industry benchmarking
        peer_comparisons: [], // TODO: Implement peer analysis
        historical_performance: await this.getHistoricalPerformance(
          clinicId,
          parameters
        ),
      },
    };
  }

  /**
   * Generate comprehensive dashboard data with real-time insights
   */
  async generateDashboardData(
    clinicId: string
  ): Promise<FinancialDashboardData> {
    const now = new Date();
    const currentMonth = {
      period_start: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0],
      period_end: now.toISOString().split('T')[0],
    };

    const lastMonth = {
      period_start: new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split('T')[0],
      period_end: new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0],
    };

    // Fetch all required data for dashboard
    const [
      currentKPIs,
      lastMonthKPIs,
      revenueAnalytics,
      expenseAnalytics,
      performanceMetrics,
    ] = await Promise.all([
      this.calculateFinancialKPIs(clinicId, currentMonth),
      this.calculateFinancialKPIs(clinicId, lastMonth),
      this.reportingEngine.calculateRevenueAnalytics(clinicId, currentMonth),
      this.reportingEngine.calculateExpenseAnalytics(clinicId, currentMonth),
      this.calculatePerformanceMetrics(clinicId, currentMonth),
    ]);

    // Calculate real-time KPI changes
    const kpiChanges = this.calculateKPIChanges(currentKPIs, lastMonthKPIs);

    // Generate alerts and recommendations
    const alerts = this.generateFinancialAlerts(
      currentKPIs,
      performanceMetrics
    );
    const recommendations = this.generateRecommendations(
      currentKPIs,
      performanceMetrics
    );

    return {
      last_updated: new Date().toISOString(),
      clinic_id: clinicId,
      summary_cards: {
        total_revenue: {
          value: revenueAnalytics.total_revenue,
          change_from_previous: kpiChanges.revenue_change,
          trend: kpiChanges.revenue_change >= 0 ? 'up' : 'down',
          color: kpiChanges.revenue_change >= 0 ? 'green' : 'red',
        },
        total_expenses: {
          value: expenseAnalytics.total_expenses,
          change_from_previous: kpiChanges.expense_change,
          trend: kpiChanges.expense_change >= 0 ? 'up' : 'down',
          color: kpiChanges.expense_change >= 0 ? 'red' : 'green',
        },
        net_profit: {
          value:
            revenueAnalytics.total_revenue - expenseAnalytics.total_expenses,
          change_from_previous: kpiChanges.profit_change,
          trend: kpiChanges.profit_change >= 0 ? 'up' : 'down',
          color: kpiChanges.profit_change >= 0 ? 'green' : 'red',
        },
        cash_flow: {
          value: currentKPIs.cash_flow_kpis.free_cash_flow,
          change_from_previous: kpiChanges.cash_flow_change,
          trend: kpiChanges.cash_flow_change >= 0 ? 'up' : 'down',
          color: kpiChanges.cash_flow_change >= 0 ? 'green' : 'red',
        },
        patient_count: {
          value:
            performanceMetrics.operational_metrics.patient_retention_rate * 100, // Placeholder
          change_from_previous: 0,
          trend: 'stable' as const,
          color: 'blue',
        },
        avg_transaction_value: {
          value: performanceMetrics.revenue_metrics.average_transaction_value,
          change_from_previous: 0,
          trend: 'stable' as const,
          color: 'blue',
        },
      },
      charts_data: {
        revenue_trends: await this.getRevenueTrendData(clinicId),
        expense_breakdown: expenseAnalytics.expense_by_category.map((cat) => ({
          category: cat.category_name,
          value: cat.amount,
          percentage: cat.percentage,
        })),
        cash_flow_timeline: await this.getCashFlowTimelineData(clinicId),
        profitability_analysis:
          await this.getProfitabilityAnalysisData(clinicId),
        kpi_dashboard: {
          gross_margin: currentKPIs.profitability_kpis.gross_profit_margin,
          operating_margin:
            currentKPIs.profitability_kpis.operating_profit_margin,
          net_margin: currentKPIs.profitability_kpis.net_profit_margin,
          current_ratio: currentKPIs.liquidity_kpis.current_ratio,
          debt_ratio: currentKPIs.leverage_kpis.debt_to_assets,
        },
      },
      alerts,
      recommendations,
      refresh_interval: DASHBOARD_REFRESH_INTERVALS.FINANCIAL_OVERVIEW,
    };
  }

  // =====================================================================================
  // ANALYTICS HELPER METHODS
  // =====================================================================================

  /**
   * Fetch appointment-related metrics for performance calculation
   */
  private async fetchAppointmentMetrics(
    clinicId: string,
    parameters: ReportParameters
  ): Promise<{
    total_appointments: number;
    utilization_rate: number;
    average_wait_time: number;
  }> {
    const { period_start, period_end } = parameters;

    const { data: appointmentData, error } = await this.supabase
      .from('appointments')
      .select('id, status, scheduled_date')
      .eq('clinic_id', clinicId)
      .gte('scheduled_date', period_start)
      .lte('scheduled_date', period_end);

    if (error)
      throw new Error(`Appointment metrics fetch failed: ${error.message}`);

    const totalAppointments = appointmentData?.length || 0;
    const completedAppointments =
      appointmentData?.filter((apt) => apt.status === 'completed').length || 0;
    const utilizationRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    return {
      total_appointments: totalAppointments,
      utilization_rate: utilizationRate,
      average_wait_time: 0, // TODO: Implement wait time tracking
    };
  }

  /**
   * Calculate growth rate for a specific metric over time
   */
  private async calculateGrowthRate(
    _clinicId: string,
    _metricType: 'revenue' | 'expenses',
    _periodStart: string,
    _periodEnd: string
  ): Promise<number> {
    // TODO: Implement growth rate calculation with historical data comparison
    return 0;
  }

  /**
   * Calculate patient retention rate
   */
  private async calculatePatientRetentionRate(
    _clinicId: string,
    _parameters: ReportParameters
  ): Promise<number> {
    // TODO: Implement patient retention calculation
    return 0;
  }

  /**
   * Calculate KPI changes between periods
   */
  private calculateKPIChanges(
    current: KPICalculation,
    previous: KPICalculation
  ) {
    return {
      revenue_change: 0, // TODO: Implement revenue comparison
      expense_change: 0, // TODO: Implement expense comparison
      profit_change: 0, // TODO: Implement profit comparison
      cash_flow_change:
        current.cash_flow_kpis.free_cash_flow -
        previous.cash_flow_kpis.free_cash_flow,
    };
  }

  /**
   * Generate financial alerts based on KPIs and performance
   */
  private generateFinancialAlerts(
    kpis: KPICalculation,
    _performance: PerformanceMetrics
  ) {
    const alerts: Array<{
      type: 'warning' | 'danger' | 'info';
      title: string;
      message: string;
      timestamp: string;
    }> = [];

    // Cash flow alerts
    if (kpis.cash_flow_kpis.free_cash_flow < 0) {
      alerts.push({
        type: 'danger',
        title: 'Fluxo de Caixa Negativo',
        message:
          'O fluxo de caixa livre está negativo. Revisar gastos urgentemente.',
        timestamp: new Date().toISOString(),
      });
    }

    // Liquidity alerts
    if (kpis.liquidity_kpis.current_ratio < 1.0) {
      alerts.push({
        type: 'warning',
        title: 'Liquidez Baixa',
        message:
          'Índice de liquidez corrente abaixo de 1.0. Monitorar capacidade de pagamento.',
        timestamp: new Date().toISOString(),
      });
    }

    // Profitability alerts
    if (kpis.profitability_kpis.net_profit_margin < 5) {
      alerts.push({
        type: 'warning',
        title: 'Margem de Lucro Baixa',
        message:
          'Margem de lucro líquido abaixo de 5%. Revisar estratégia de preços.',
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Generate actionable recommendations based on financial analysis
   */
  private generateRecommendations(
    kpis: KPICalculation,
    performance: PerformanceMetrics
  ) {
    const recommendations: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expected_impact: string;
    }> = [];

    // Revenue optimization recommendations
    if (performance.revenue_metrics.revenue_growth_rate < 10) {
      recommendations.push({
        category: 'Revenue Growth',
        priority: 'high',
        title: 'Implementar Estratégias de Crescimento',
        description:
          'Considerar novos serviços, parcerias ou campanhas de marketing para aumentar receita.',
        expected_impact: 'Aumento de 15-25% na receita em 6 meses',
      });
    }

    // Cost optimization recommendations
    if (kpis.profitability_kpis.gross_profit_margin < 60) {
      recommendations.push({
        category: 'Cost Management',
        priority: 'medium',
        title: 'Otimizar Custos Operacionais',
        description:
          'Revisar fornecedores, negociar contratos e eliminar desperdícios.',
        expected_impact: 'Redução de 10-15% nos custos operacionais',
      });
    }

    // Cash flow recommendations
    if (kpis.cash_flow_kpis.operating_cash_flow_ratio < 0.5) {
      recommendations.push({
        category: 'Cash Flow',
        priority: 'high',
        title: 'Melhorar Gestão de Recebíveis',
        description:
          'Implementar cobrança mais eficiente e reduzir prazo de recebimento.',
        expected_impact: 'Melhoria de 20-30% no fluxo de caixa operacional',
      });
    }

    return recommendations;
  }

  /**
   * Get historical performance data for trending
   */
  private async getHistoricalPerformance(
    _clinicId: string,
    _parameters: ReportParameters
  ) {
    // TODO: Implement historical performance analysis
    return {};
  }

  /**
   * Get revenue trend data for charting
   */
  private async getRevenueTrendData(_clinicId: string) {
    // TODO: Implement revenue trend data for dashboard charts
    return [];
  }

  /**
   * Get cash flow timeline data for charting
   */
  private async getCashFlowTimelineData(_clinicId: string) {
    // TODO: Implement cash flow timeline data for dashboard charts
    return [];
  }

  /**
   * Get profitability analysis data for charting
   */
  private async getProfitabilityAnalysisData(_clinicId: string) {
    // TODO: Implement profitability analysis data for dashboard charts
    return [];
  }
}
