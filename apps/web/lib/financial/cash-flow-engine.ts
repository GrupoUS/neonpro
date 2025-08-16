/**
 * Cash Flow Monitoring Engine - Real-time Financial Analytics
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 *
 * This module provides real-time cash flow calculation and monitoring:
 * - Real-time cash flow calculation engine
 * - Multi-account cash flow aggregation
 * - Live financial position tracking
 * - Daily/weekly/monthly cash flow views
 * - Integration with banking APIs for real-time updates
 * - Cash flow trend analysis and indicators
 */

import { createClient } from '@/lib/supabase/client';

// Cash Flow Types
export type CashFlowData = {
  id: string;
  clinic_id: string;
  date: string;
  opening_balance: number;
  closing_balance: number;
  total_inflows: number;
  total_outflows: number;
  net_cash_flow: number;
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  created_at: string;
  updated_at: string;
};

export type CashFlowSummary = {
  current_balance: number;
  daily_change: number;
  weekly_change: number;
  monthly_change: number;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  projected_balance_7d: number;
  projected_balance_30d: number;
  cash_burn_rate: number;
  runway_days: number;
};

export type CashFlowAlert = {
  id: string;
  type:
    | 'low_balance'
    | 'negative_trend'
    | 'high_burn_rate'
    | 'threshold_breach';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  threshold_value?: number;
  current_value: number;
  triggered_at: string;
  acknowledged: boolean;
};

export type CashFlowMetrics = {
  daily_average_inflow: number;
  daily_average_outflow: number;
  weekly_volatility: number;
  monthly_growth_rate: number;
  cash_conversion_cycle: number;
  working_capital: number;
  quick_ratio: number;
  current_ratio: number;
};

export type CashFlowForecast = {
  date: string;
  predicted_balance: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: string[];
  accuracy_score: number;
};

export class CashFlowEngine {
  private readonly supabase = createClient();

  /**
   * Calculate real-time cash flow for a clinic
   */
  async calculateRealTimeCashFlow(clinicId: string): Promise<CashFlowData> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get opening balance (previous day's closing balance)
      const { data: previousDay } = await this.supabase
        .from('cash_flow_daily')
        .select('closing_balance')
        .eq('clinic_id', clinicId)
        .lt('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const openingBalance = previousDay?.closing_balance || 0;

      // Calculate today's inflows and outflows
      const [inflows, outflows] = await Promise.all([
        this.calculateDailyInflows(clinicId, today),
        this.calculateDailyOutflows(clinicId, today),
      ]);

      const netCashFlow = inflows.total - outflows.total;
      const closingBalance = openingBalance + netCashFlow;

      const cashFlowData: CashFlowData = {
        id: `${clinicId}-${today}`,
        clinic_id: clinicId,
        date: today,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        total_inflows: inflows.total,
        total_outflows: outflows.total,
        net_cash_flow: netCashFlow,
        operating_cash_flow: inflows.operating - outflows.operating,
        investing_cash_flow: inflows.investing - outflows.investing,
        financing_cash_flow: inflows.financing - outflows.financing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Upsert cash flow data
      await this.supabase.from('cash_flow_daily').upsert(cashFlowData);

      return cashFlowData;
    } catch (_error) {
      throw new Error('Failed to calculate real-time cash flow');
    }
  }

  /**
   * Get cash flow summary with trends and projections
   */
  async getCashFlowSummary(clinicId: string): Promise<CashFlowSummary> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Get current balance
      const currentCashFlow = await this.calculateRealTimeCashFlow(clinicId);
      const currentBalance = currentCashFlow.closing_balance;

      // Get historical data for trend analysis
      const { data: historicalData } = await this.supabase
        .from('cash_flow_daily')
        .select('date, closing_balance, net_cash_flow')
        .eq('clinic_id', clinicId)
        .gte('date', monthAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!historicalData || historicalData.length === 0) {
        throw new Error('No historical cash flow data found');
      }

      // Calculate changes and trends
      const yesterdayData = historicalData.find(
        (d) => d.date === yesterday.toISOString().split('T')[0],
      );
      const weekAgoData = historicalData.find(
        (d) => d.date === weekAgo.toISOString().split('T')[0],
      );
      const monthAgoData = historicalData[0];

      const dailyChange = yesterdayData
        ? currentBalance - yesterdayData.closing_balance
        : 0;
      const weeklyChange = weekAgoData
        ? currentBalance - weekAgoData.closing_balance
        : 0;
      const monthlyChange = monthAgoData
        ? currentBalance - monthAgoData.closing_balance
        : 0;

      // Calculate trend direction and percentage
      const recentTrend = this.calculateTrend(historicalData.slice(-7));
      const trendDirection =
        recentTrend > 0.05 ? 'up' : recentTrend < -0.05 ? 'down' : 'stable';
      const trendPercentage = Math.abs(recentTrend) * 100;

      // Calculate cash burn rate (average daily outflow)
      const avgDailyOutflow =
        historicalData.reduce(
          (sum, d) => sum + Math.abs(Math.min(d.net_cash_flow, 0)),
          0,
        ) / historicalData.length;
      const runwayDays =
        avgDailyOutflow > 0
          ? Math.floor(currentBalance / avgDailyOutflow)
          : Number.POSITIVE_INFINITY;

      // Generate projections
      const projectedBalance7d = await this.projectCashFlow(clinicId, 7);
      const projectedBalance30d = await this.projectCashFlow(clinicId, 30);

      return {
        current_balance: currentBalance,
        daily_change: dailyChange,
        weekly_change: weeklyChange,
        monthly_change: monthlyChange,
        trend_direction: trendDirection,
        trend_percentage: trendPercentage,
        projected_balance_7d: projectedBalance7d,
        projected_balance_30d: projectedBalance30d,
        cash_burn_rate: avgDailyOutflow,
        runway_days: runwayDays,
      };
    } catch (_error) {
      throw new Error('Failed to get cash flow summary');
    }
  }

  /**
   * Generate cash flow alerts based on thresholds and trends
   */
  async generateCashFlowAlerts(clinicId: string): Promise<CashFlowAlert[]> {
    try {
      const summary = await this.getCashFlowSummary(clinicId);
      const alerts: CashFlowAlert[] = [];

      // Get alert thresholds from clinic settings
      const { data: settings } = await this.supabase
        .from('clinic_financial_settings')
        .select('cash_flow_alerts')
        .eq('clinic_id', clinicId)
        .single();

      const thresholds = settings?.cash_flow_alerts || {
        low_balance: 10_000,
        negative_trend_days: 3,
        high_burn_rate: 5000,
        runway_warning_days: 30,
      };

      // Low balance alert
      if (summary.current_balance < thresholds.low_balance) {
        alerts.push({
          id: `low_balance_${Date.now()}`,
          type: 'low_balance',
          severity:
            summary.current_balance < thresholds.low_balance * 0.5
              ? 'critical'
              : 'warning',
          message: `Cash balance is below threshold: R$ ${summary.current_balance.toLocaleString('pt-BR')}`,
          threshold_value: thresholds.low_balance,
          current_value: summary.current_balance,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        });
      }

      // Negative trend alert
      if (summary.trend_direction === 'down' && summary.trend_percentage > 10) {
        alerts.push({
          id: `negative_trend_${Date.now()}`,
          type: 'negative_trend',
          severity: summary.trend_percentage > 20 ? 'critical' : 'warning',
          message: `Negative cash flow trend detected: ${summary.trend_percentage.toFixed(1)}% decline`,
          current_value: summary.trend_percentage,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        });
      }

      // High burn rate alert
      if (summary.cash_burn_rate > thresholds.high_burn_rate) {
        alerts.push({
          id: `high_burn_rate_${Date.now()}`,
          type: 'high_burn_rate',
          severity: 'warning',
          message: `High cash burn rate: R$ ${summary.cash_burn_rate.toLocaleString('pt-BR')}/day`,
          threshold_value: thresholds.high_burn_rate,
          current_value: summary.cash_burn_rate,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        });
      }

      // Runway warning alert
      if (
        summary.runway_days < thresholds.runway_warning_days &&
        summary.runway_days !== Number.POSITIVE_INFINITY
      ) {
        alerts.push({
          id: `runway_warning_${Date.now()}`,
          type: 'threshold_breach',
          severity: summary.runway_days < 7 ? 'emergency' : 'critical',
          message: `Cash runway warning: ${summary.runway_days} days remaining`,
          threshold_value: thresholds.runway_warning_days,
          current_value: summary.runway_days,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        });
      }

      return alerts;
    } catch (_error) {
      throw new Error('Failed to generate cash flow alerts');
    }
  }

  /**
   * Calculate daily inflows by category
   */
  private async calculateDailyInflows(clinicId: string, date: string) {
    const { data: payments } = await this.supabase
      .from('payments')
      .select('amount, payment_type, category')
      .eq('clinic_id', clinicId)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`)
      .eq('status', 'completed');

    const total = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const operating =
      payments
        ?.filter((p) => p.category === 'treatment' || p.category === 'product')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
    const investing =
      payments
        ?.filter((p) => p.category === 'investment')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
    const financing =
      payments
        ?.filter((p) => p.category === 'loan' || p.category === 'equity')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

    return { total, operating, investing, financing };
  }

  /**
   * Calculate daily outflows by category
   */
  private async calculateDailyOutflows(clinicId: string, date: string) {
    const { data: expenses } = await this.supabase
      .from('expenses')
      .select('amount, expense_type, category')
      .eq('clinic_id', clinicId)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`)
      .eq('status', 'paid');

    const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const operating =
      expenses
        ?.filter((e) => e.category === 'operational' || e.category === 'staff')
        .reduce((sum, e) => sum + e.amount, 0) || 0;
    const investing =
      expenses
        ?.filter(
          (e) => e.category === 'equipment' || e.category === 'technology',
        )
        .reduce((sum, e) => sum + e.amount, 0) || 0;
    const financing =
      expenses
        ?.filter(
          (e) => e.category === 'loan_payment' || e.category === 'interest',
        )
        .reduce((sum, e) => sum + e.amount, 0) || 0;

    return { total, operating, investing, financing };
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(data: Array<{ closing_balance: number }>): number {
    if (data.length < 2) {
      return 0;
    }

    const first = data[0].closing_balance;
    const last = data.at(-1).closing_balance;

    return first > 0 ? (last - first) / first : 0;
  }

  /**
   * Project cash flow for future days
   */
  private async projectCashFlow(
    clinicId: string,
    days: number,
  ): Promise<number> {
    try {
      // Get historical average daily cash flow
      const { data: historicalData } = await this.supabase
        .from('cash_flow_daily')
        .select('net_cash_flow')
        .eq('clinic_id', clinicId)
        .order('date', { ascending: false })
        .limit(30);

      if (!historicalData || historicalData.length === 0) {
        return 0;
      }

      const avgDailyCashFlow =
        historicalData.reduce((sum, d) => sum + d.net_cash_flow, 0) /
        historicalData.length;
      const currentBalance = await this.calculateRealTimeCashFlow(clinicId);

      return currentBalance.closing_balance + avgDailyCashFlow * days;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Get cash flow metrics for analysis
   */
  async getCashFlowMetrics(
    clinicId: string,
    days = 30,
  ): Promise<CashFlowMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const { data: cashFlowData } = await this.supabase
        .from('cash_flow_daily')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!cashFlowData || cashFlowData.length === 0) {
        throw new Error('No cash flow data found for metrics calculation');
      }

      // Calculate metrics
      const dailyInflows = cashFlowData.map((d) => d.total_inflows);
      const dailyOutflows = cashFlowData.map((d) => d.total_outflows);
      const balances = cashFlowData.map((d) => d.closing_balance);

      const dailyAverageInflow =
        dailyInflows.reduce((sum, val) => sum + val, 0) / dailyInflows.length;
      const dailyAverageOutflow =
        dailyOutflows.reduce((sum, val) => sum + val, 0) / dailyOutflows.length;

      // Calculate volatility (standard deviation of daily changes)
      const dailyChanges = balances
        .slice(1)
        .map((balance, i) => balance - balances[i]);
      const avgDailyChange =
        dailyChanges.reduce((sum, val) => sum + val, 0) / dailyChanges.length;
      const variance =
        dailyChanges.reduce(
          (sum, val) => sum + (val - avgDailyChange) ** 2,
          0,
        ) / dailyChanges.length;
      const weeklyVolatility = Math.sqrt(variance) * Math.sqrt(7); // Annualized to weekly

      // Calculate growth rate
      const firstBalance = balances[0];
      const lastBalance = balances.at(-1);
      const monthlyGrowthRate =
        firstBalance > 0
          ? ((lastBalance - firstBalance) / firstBalance) * 100
          : 0;

      // Get current assets and liabilities for ratios
      const { data: financialPosition } = await this.supabase
        .from('financial_position')
        .select('current_assets, current_liabilities, quick_assets')
        .eq('clinic_id', clinicId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const currentAssets = financialPosition?.current_assets || 0;
      const currentLiabilities = financialPosition?.current_liabilities || 0;
      const quickAssets = financialPosition?.quick_assets || 0;

      const workingCapital = currentAssets - currentLiabilities;
      const currentRatio =
        currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
      const quickRatio =
        currentLiabilities > 0 ? quickAssets / currentLiabilities : 0;

      return {
        daily_average_inflow: dailyAverageInflow,
        daily_average_outflow: dailyAverageOutflow,
        weekly_volatility: weeklyVolatility,
        monthly_growth_rate: monthlyGrowthRate,
        cash_conversion_cycle: 0, // TODO: Implement based on receivables and payables
        working_capital: workingCapital,
        quick_ratio: quickRatio,
        current_ratio: currentRatio,
      };
    } catch (_error) {
      throw new Error('Failed to calculate cash flow metrics');
    }
  }
}

export default CashFlowEngine;
