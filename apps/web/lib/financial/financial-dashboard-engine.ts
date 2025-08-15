/**
 * Financial Dashboard Engine - Real-time Analytics Hub
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 *
 * This module orchestrates all financial analytics components:
 * - Real-time financial metrics aggregation
 * - Dashboard data preparation and caching
 * - Performance optimization for live updates
 * - Multi-dimensional financial analysis
 * - Integration with all financial engines
 * - Real-time notifications and alerts
 */

import { createClient } from '@/lib/supabase/client';
import {
  AutomatedAlertsEngine,
  type FinancialAlert,
} from './automated-alerts-engine';
import { CashFlowEngine, type CashFlowSummary } from './cash-flow-engine';
import {
  PredictiveAnalyticsEngine,
  type RiskAssessment,
} from './predictive-analytics-engine';

// Dashboard Types and Interfaces
export interface FinancialDashboardData {
  clinic_id: string;
  timestamp: string;
  cash_flow: CashFlowSummary;
  metrics: FinancialMetrics;
  alerts: FinancialAlert[];
  forecasts: DashboardForecast[];
  risk_assessment: RiskAssessment;
  performance_indicators: PerformanceIndicators;
  trends: TrendAnalysis;
  comparisons: ComparisonData;
  recommendations: Recommendation[];
}

export interface FinancialMetrics {
  // Revenue Metrics
  total_revenue: number;
  revenue_growth: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  revenue_per_patient: number;
  revenue_by_service: ServiceRevenue[];

  // Expense Metrics
  total_expenses: number;
  expense_growth: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  expense_by_category: CategoryExpense[];
  expense_ratio: number;

  // Profitability Metrics
  gross_profit: number;
  gross_margin: number;
  net_profit: number;
  net_margin: number;
  ebitda: number;
  ebitda_margin: number;

  // Efficiency Metrics
  revenue_per_employee: number;
  patient_acquisition_cost: number;
  patient_lifetime_value: number;
  collection_efficiency: number;

  // Liquidity Metrics
  current_ratio: number;
  quick_ratio: number;
  cash_ratio: number;
  working_capital: number;

  // Activity Metrics
  receivables_turnover: number;
  inventory_turnover: number;
  asset_turnover: number;
  days_sales_outstanding: number;
}

export interface ServiceRevenue {
  service_name: string;
  revenue: number;
  percentage: number;
  growth_rate: number;
  patient_count: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  budget_variance: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DashboardForecast {
  type: 'revenue' | 'expenses' | 'cash_flow' | 'profit';
  period: '7d' | '30d' | '90d' | '1y';
  current_value: number;
  predicted_value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

export interface PerformanceIndicators {
  financial_health_score: number; // 0-100
  growth_score: number; // 0-100
  efficiency_score: number; // 0-100
  risk_score: number; // 0-100
  overall_score: number; // 0-100

  benchmarks: {
    industry_average: number;
    top_quartile: number;
    clinic_ranking: number;
  };

  key_strengths: string[];
  improvement_areas: string[];
}

export interface TrendAnalysis {
  revenue_trend: TrendData;
  expense_trend: TrendData;
  profit_trend: TrendData;
  cash_flow_trend: TrendData;
  patient_volume_trend: TrendData;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  duration_days: number;
  projected_continuation: number; // 0-1 probability
  seasonal_factor: number;
  anomalies: TrendAnomaly[];
}

export interface TrendAnomaly {
  date: string;
  value: number;
  expected_value: number;
  deviation_percentage: number;
  possible_causes: string[];
}

export interface ComparisonData {
  previous_period: PeriodComparison;
  same_period_last_year: PeriodComparison;
  budget_comparison: BudgetComparison;
  industry_benchmarks: IndustryBenchmarks;
}

export interface PeriodComparison {
  revenue_change: number;
  expense_change: number;
  profit_change: number;
  cash_flow_change: number;
  patient_volume_change: number;
  key_drivers: string[];
}

export interface BudgetComparison {
  revenue_vs_budget: number;
  expense_vs_budget: number;
  profit_vs_budget: number;
  variance_analysis: VarianceAnalysis[];
}

export interface VarianceAnalysis {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variance_percentage: number;
  explanation: string;
}

export interface IndustryBenchmarks {
  revenue_per_patient: {
    clinic_value: number;
    industry_average: number;
    percentile_ranking: number;
  };
  profit_margin: {
    clinic_value: number;
    industry_average: number;
    percentile_ranking: number;
  };
  collection_rate: {
    clinic_value: number;
    industry_average: number;
    percentile_ranking: number;
  };
}

export interface Recommendation {
  id: string;
  category: 'revenue' | 'expense' | 'cash_flow' | 'efficiency' | 'risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expected_impact: {
    financial_impact: number;
    timeframe: string;
    confidence: number;
  };
  action_steps: string[];
  resources_needed: string[];
  success_metrics: string[];
  deadline: string;
}

export interface DashboardConfig {
  refresh_interval: number; // seconds
  cache_duration: number; // seconds
  alert_thresholds: Record<string, number>;
  display_preferences: {
    currency: string;
    date_format: string;
    number_format: string;
    timezone: string;
  };
  widgets_enabled: string[];
  custom_metrics: CustomMetric[];
}

export interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  description: string;
  target_value?: number;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
}

export class FinancialDashboardEngine {
  private readonly supabase = createClient();
  private readonly cashFlowEngine = new CashFlowEngine();
  private readonly alertsEngine = new AutomatedAlertsEngine();
  private readonly predictiveEngine = new PredictiveAnalyticsEngine();
  private readonly cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  /**
   * Get comprehensive dashboard data for a clinic
   */
  async getDashboardData(
    clinicId: string,
    config?: DashboardConfig
  ): Promise<FinancialDashboardData> {
    try {
      const cacheKey = `dashboard_${clinicId}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        return cached;
      }

      // Gather all financial data in parallel for performance
      const [cashFlow, metrics, alerts, forecasts, riskAssessment] =
        await Promise.all([
          this.cashFlowEngine.getCashFlowSummary(clinicId),
          this.calculateFinancialMetrics(clinicId),
          this.alertsEngine.processFinancialAlerts(clinicId),
          this.generateDashboardForecasts(clinicId),
          this.predictiveEngine.performRiskAssessment(clinicId),
        ]);

      // Calculate performance indicators
      const performanceIndicators = await this.calculatePerformanceIndicators(
        clinicId,
        metrics
      );

      // Analyze trends
      const trends = await this.analyzeTrends(clinicId);

      // Generate comparisons
      const comparisons = await this.generateComparisons(clinicId, metrics);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(clinicId, {
        metrics,
        alerts,
        riskAssessment,
        trends,
      });

      const dashboardData: FinancialDashboardData = {
        clinic_id: clinicId,
        timestamp: new Date().toISOString(),
        cash_flow: cashFlow,
        metrics,
        alerts: alerts.filter((alert) => !alert.acknowledged_at), // Only unacknowledged alerts
        forecasts,
        risk_assessment: riskAssessment,
        performance_indicators: performanceIndicators,
        trends,
        comparisons,
        recommendations,
      };

      // Cache the result
      this.setCache(cacheKey, dashboardData, config?.cache_duration || 300); // 5 minutes default

      return dashboardData;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }

  /**
   * Calculate comprehensive financial metrics
   */
  private async calculateFinancialMetrics(
    clinicId: string
  ): Promise<FinancialMetrics> {
    try {
      // Get base cash flow metrics
      const cashFlowMetrics =
        await this.cashFlowEngine.getCashFlowMetrics(clinicId);

      // Get revenue data
      const revenueData = await this.getRevenueMetrics(clinicId);

      // Get expense data
      const expenseData = await this.getExpenseMetrics(clinicId);

      // Calculate profitability metrics
      const profitabilityMetrics = this.calculateProfitabilityMetrics(
        revenueData,
        expenseData
      );

      // Calculate efficiency metrics
      const efficiencyMetrics = await this.calculateEfficiencyMetrics(
        clinicId,
        revenueData
      );

      // Calculate activity metrics
      const activityMetrics = await this.calculateActivityMetrics(clinicId);

      return {
        // Revenue Metrics
        total_revenue: revenueData.total_revenue,
        revenue_growth: revenueData.growth_rates,
        revenue_per_patient: revenueData.revenue_per_patient,
        revenue_by_service: revenueData.by_service,

        // Expense Metrics
        total_expenses: expenseData.total_expenses,
        expense_growth: expenseData.growth_rates,
        expense_by_category: expenseData.by_category,
        expense_ratio: expenseData.total_expenses / revenueData.total_revenue,

        // Profitability Metrics
        gross_profit: profitabilityMetrics.gross_profit,
        gross_margin: profitabilityMetrics.gross_margin,
        net_profit: profitabilityMetrics.net_profit,
        net_margin: profitabilityMetrics.net_margin,
        ebitda: profitabilityMetrics.ebitda,
        ebitda_margin: profitabilityMetrics.ebitda_margin,

        // Efficiency Metrics
        revenue_per_employee: efficiencyMetrics.revenue_per_employee,
        patient_acquisition_cost: efficiencyMetrics.patient_acquisition_cost,
        patient_lifetime_value: efficiencyMetrics.patient_lifetime_value,
        collection_efficiency: efficiencyMetrics.collection_efficiency,

        // Liquidity Metrics
        current_ratio: cashFlowMetrics.current_ratio,
        quick_ratio: cashFlowMetrics.quick_ratio,
        cash_ratio: 0, // TODO: Calculate from balance sheet
        working_capital: cashFlowMetrics.working_capital,

        // Activity Metrics
        receivables_turnover: activityMetrics.receivables_turnover,
        inventory_turnover: activityMetrics.inventory_turnover,
        asset_turnover: activityMetrics.asset_turnover,
        days_sales_outstanding: activityMetrics.days_sales_outstanding,
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      throw new Error('Failed to calculate financial metrics');
    }
  }

  /**
   * Generate dashboard-specific forecasts
   */
  private async generateDashboardForecasts(
    clinicId: string
  ): Promise<DashboardForecast[]> {
    try {
      const forecasts: DashboardForecast[] = [];

      // Generate revenue forecast
      const revenueForecast =
        await this.predictiveEngine.generateFinancialForecast(
          clinicId,
          'revenue_forecast',
          3 // 3 months
        );

      // Generate cash flow forecast
      const cashFlowForecast =
        await this.predictiveEngine.generateFinancialForecast(
          clinicId,
          'cash_flow_prediction',
          3 // 3 months
        );

      // Convert to dashboard format
      const currentRevenue = await this.getCurrentRevenue(clinicId);
      const currentCashFlow = await this.getCurrentCashFlow(clinicId);

      // 30-day revenue forecast
      const revenue30d = revenueForecast.predictions
        .slice(0, 30)
        .reduce((sum, p) => sum + p.predicted_value, 0);

      forecasts.push({
        type: 'revenue',
        period: '30d',
        current_value: currentRevenue,
        predicted_value: revenue30d,
        confidence: revenueForecast.accuracy_estimate,
        trend:
          revenue30d > currentRevenue
            ? 'up'
            : revenue30d < currentRevenue
              ? 'down'
              : 'stable',
        change_percentage:
          ((revenue30d - currentRevenue) / currentRevenue) * 100,
      });

      // 30-day cash flow forecast
      const cashFlow30d = cashFlowForecast.predictions
        .slice(0, 30)
        .reduce((sum, p) => sum + p.predicted_value, 0);

      forecasts.push({
        type: 'cash_flow',
        period: '30d',
        current_value: currentCashFlow,
        predicted_value: cashFlow30d,
        confidence: cashFlowForecast.accuracy_estimate,
        trend:
          cashFlow30d > currentCashFlow
            ? 'up'
            : cashFlow30d < currentCashFlow
              ? 'down'
              : 'stable',
        change_percentage:
          ((cashFlow30d - currentCashFlow) / currentCashFlow) * 100,
      });

      return forecasts;
    } catch (error) {
      console.error('Error generating dashboard forecasts:', error);
      return [];
    }
  }

  /**
   * Calculate performance indicators and scores
   */
  private async calculatePerformanceIndicators(
    clinicId: string,
    metrics: FinancialMetrics
  ): Promise<PerformanceIndicators> {
    try {
      // Calculate individual scores (0-100)
      const financialHealthScore = this.calculateFinancialHealthScore(metrics);
      const growthScore = this.calculateGrowthScore(metrics);
      const efficiencyScore = this.calculateEfficiencyScore(metrics);
      const riskScore = await this.calculateRiskScore(clinicId);

      // Calculate overall score (weighted average)
      const overallScore =
        financialHealthScore * 0.3 +
        growthScore * 0.25 +
        efficiencyScore * 0.25 +
        (100 - riskScore) * 0.2; // Lower risk = higher score

      // Get industry benchmarks
      const benchmarks = await this.getIndustryBenchmarks(clinicId);

      // Identify strengths and improvement areas
      const analysis = this.analyzePerformance(
        {
          financialHealthScore,
          growthScore,
          efficiencyScore,
          riskScore,
        },
        metrics
      );

      return {
        financial_health_score: financialHealthScore,
        growth_score: growthScore,
        efficiency_score: efficiencyScore,
        risk_score: riskScore,
        overall_score: overallScore,
        benchmarks,
        key_strengths: analysis.strengths,
        improvement_areas: analysis.improvements,
      };
    } catch (error) {
      console.error('Error calculating performance indicators:', error);
      throw new Error('Failed to calculate performance indicators');
    }
  }

  /**
   * Analyze trends across different financial metrics
   */
  private async analyzeTrends(clinicId: string): Promise<TrendAnalysis> {
    try {
      // Get historical data for trend analysis
      const { data: historicalData } = await this.supabase
        .from('cash_flow_daily')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte(
          'date',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('date', { ascending: true });

      if (!historicalData || historicalData.length < 30) {
        throw new Error('Insufficient data for trend analysis');
      }

      // Analyze different trend components
      const revenueTrend = this.analyzeTrendComponent(
        historicalData,
        'total_inflows'
      );
      const expenseTrend = this.analyzeTrendComponent(
        historicalData,
        'total_outflows'
      );
      const profitTrend = this.analyzeTrendComponent(
        historicalData,
        'net_cash_flow'
      );
      const cashFlowTrend = this.analyzeTrendComponent(
        historicalData,
        'closing_balance'
      );

      // Get patient volume data for trend analysis
      const patientVolumeTrend = await this.analyzePatientVolumeTrend(clinicId);

      return {
        revenue_trend: revenueTrend,
        expense_trend: expenseTrend,
        profit_trend: profitTrend,
        cash_flow_trend: cashFlowTrend,
        patient_volume_trend: patientVolumeTrend,
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw new Error('Failed to analyze trends');
    }
  }

  /**
   * Generate comprehensive recommendations
   */
  private async generateRecommendations(
    _clinicId: string,
    analysisData: {
      metrics: FinancialMetrics;
      alerts: FinancialAlert[];
      riskAssessment: RiskAssessment;
      trends: TrendAnalysis;
    }
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Revenue optimization recommendations
      if (analysisData.metrics.revenue_growth.monthly < 0.05) {
        recommendations.push({
          id: `rev_opt_${Date.now()}`,
          category: 'revenue',
          priority: 'high',
          title: 'Optimize Revenue Growth',
          description:
            'Monthly revenue growth is below target. Consider implementing revenue optimization strategies.',
          expected_impact: {
            financial_impact: analysisData.metrics.total_revenue * 0.15,
            timeframe: '3 months',
            confidence: 0.8,
          },
          action_steps: [
            'Analyze service pricing strategy',
            'Implement upselling programs',
            'Review patient retention strategies',
            'Explore new service offerings',
          ],
          resources_needed: [
            'Marketing budget',
            'Staff training',
            'System updates',
          ],
          success_metrics: [
            'Monthly revenue growth > 5%',
            'Patient retention rate > 85%',
          ],
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
      }

      // Cash flow recommendations
      if (analysisData.trends.cash_flow_trend.direction === 'down') {
        recommendations.push({
          id: `cash_flow_${Date.now()}`,
          category: 'cash_flow',
          priority: 'critical',
          title: 'Improve Cash Flow Management',
          description:
            'Cash flow trend is declining. Immediate action required to stabilize financial position.',
          expected_impact: {
            financial_impact: analysisData.metrics.working_capital * 0.2,
            timeframe: '1 month',
            confidence: 0.9,
          },
          action_steps: [
            'Accelerate receivables collection',
            'Negotiate extended payment terms with suppliers',
            'Review and optimize expense timing',
            'Consider short-term financing options',
          ],
          resources_needed: [
            'Collection team',
            'Supplier negotiations',
            'Financial advisor',
          ],
          success_metrics: [
            'Positive cash flow within 30 days',
            'DSO < 30 days',
          ],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
      }

      // Efficiency recommendations
      if (analysisData.metrics.collection_efficiency < 0.9) {
        recommendations.push({
          id: `efficiency_${Date.now()}`,
          category: 'efficiency',
          priority: 'medium',
          title: 'Improve Collection Efficiency',
          description:
            'Collection efficiency is below optimal levels. Implement better collection processes.',
          expected_impact: {
            financial_impact: analysisData.metrics.total_revenue * 0.1,
            timeframe: '2 months',
            confidence: 0.85,
          },
          action_steps: [
            'Implement automated payment reminders',
            'Offer multiple payment options',
            'Train staff on collection best practices',
            'Review and update payment policies',
          ],
          resources_needed: [
            'Payment system upgrades',
            'Staff training',
            'Policy updates',
          ],
          success_metrics: [
            'Collection efficiency > 95%',
            'Reduced payment delays',
          ],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
      }

      // Risk-based recommendations
      for (const riskFactor of analysisData.riskAssessment.risk_factors) {
        if (
          riskFactor.risk_level === 'high' ||
          riskFactor.risk_level === 'critical'
        ) {
          recommendations.push({
            id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: 'risk',
            priority:
              riskFactor.risk_level === 'critical' ? 'critical' : 'high',
            title: `Mitigate ${riskFactor.factor}`,
            description: riskFactor.description,
            expected_impact: {
              financial_impact: riskFactor.impact_score * 1000, // Simplified calculation
              timeframe: '1-3 months',
              confidence: 0.7,
            },
            action_steps: riskFactor.mitigation_strategies,
            resources_needed: ['Risk management team', 'Monitoring systems'],
            success_metrics: [`Reduce ${riskFactor.factor} risk score by 50%`],
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          });
        }
      }

      return recommendations.slice(0, 10); // Limit to top 10 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.timestamp + cached.ttl * 1000) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });
  }

  /**
   * Helper methods for calculations (simplified implementations)
   */
  private async getRevenueMetrics(_clinicId: string): Promise<any> {
    // Simplified implementation
    return {
      total_revenue: 100_000,
      growth_rates: { daily: 0.02, weekly: 0.05, monthly: 0.1, yearly: 0.15 },
      revenue_per_patient: 500,
      by_service: [],
    };
  }

  private async getExpenseMetrics(_clinicId: string): Promise<any> {
    // Simplified implementation
    return {
      total_expenses: 80_000,
      growth_rates: { daily: 0.01, weekly: 0.03, monthly: 0.08, yearly: 0.12 },
      by_category: [],
    };
  }

  private calculateProfitabilityMetrics(
    revenueData: any,
    expenseData: any
  ): any {
    const grossProfit = revenueData.total_revenue - expenseData.total_expenses;
    return {
      gross_profit: grossProfit,
      gross_margin: grossProfit / revenueData.total_revenue,
      net_profit: grossProfit * 0.8, // Simplified
      net_margin: (grossProfit * 0.8) / revenueData.total_revenue,
      ebitda: grossProfit * 0.9, // Simplified
      ebitda_margin: (grossProfit * 0.9) / revenueData.total_revenue,
    };
  }

  private async calculateEfficiencyMetrics(
    _clinicId: string,
    _revenueData: any
  ): Promise<any> {
    // Simplified implementation
    return {
      revenue_per_employee: 50_000,
      patient_acquisition_cost: 100,
      patient_lifetime_value: 2000,
      collection_efficiency: 0.95,
    };
  }

  private async calculateActivityMetrics(_clinicId: string): Promise<any> {
    // Simplified implementation
    return {
      receivables_turnover: 12,
      inventory_turnover: 6,
      asset_turnover: 2,
      days_sales_outstanding: 30,
    };
  }

  private calculateFinancialHealthScore(metrics: FinancialMetrics): number {
    // Simplified scoring algorithm
    let score = 50; // Base score

    // Positive factors
    if (metrics.current_ratio > 1.5) {
      score += 15;
    }
    if (metrics.net_margin > 0.1) {
      score += 15;
    }
    if (metrics.revenue_growth.monthly > 0.05) {
      score += 10;
    }
    if (metrics.collection_efficiency > 0.9) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateGrowthScore(metrics: FinancialMetrics): number {
    // Simplified growth scoring
    let score = 50;

    if (metrics.revenue_growth.monthly > 0.1) {
      score += 25;
    }
    if (metrics.revenue_growth.yearly > 0.15) {
      score += 25;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateEfficiencyScore(metrics: FinancialMetrics): number {
    // Simplified efficiency scoring
    let score = 50;

    if (metrics.collection_efficiency > 0.95) {
      score += 20;
    }
    if (metrics.expense_ratio < 0.8) {
      score += 15;
    }
    if (metrics.days_sales_outstanding < 30) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private async calculateRiskScore(clinicId: string): Promise<number> {
    // Get risk assessment and convert to score
    try {
      const riskAssessment =
        await this.predictiveEngine.performRiskAssessment(clinicId);
      return riskAssessment.overall_risk_score;
    } catch {
      return 50; // Default moderate risk
    }
  }

  private async getIndustryBenchmarks(_clinicId: string): Promise<any> {
    // Simplified benchmarks
    return {
      industry_average: 75,
      top_quartile: 85,
      clinic_ranking: 65,
    };
  }

  private analyzePerformance(scores: any, _metrics: FinancialMetrics): any {
    const strengths = [];
    const improvements = [];

    if (scores.financialHealthScore > 80) {
      strengths.push('Strong financial health');
    } else if (scores.financialHealthScore < 60) {
      improvements.push('Improve financial stability');
    }

    if (scores.growthScore > 80) {
      strengths.push('Excellent growth trajectory');
    } else if (scores.growthScore < 60) {
      improvements.push('Focus on growth strategies');
    }

    return { strengths, improvements };
  }

  private analyzeTrendComponent(data: any[], field: string): TrendData {
    // Simplified trend analysis
    const values = data.map((d) => d[field] || 0);
    const recent = values.slice(-7);
    const older = values.slice(-14, -7);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const direction =
      recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
    const strength = Math.abs(recentAvg - olderAvg) / olderAvg;

    return {
      direction,
      strength: Math.min(1, strength),
      duration_days: 7,
      projected_continuation: 0.7,
      seasonal_factor: 0.1,
      anomalies: [],
    };
  }

  private async analyzePatientVolumeTrend(
    _clinicId: string
  ): Promise<TrendData> {
    // Simplified patient volume trend
    return {
      direction: 'up',
      strength: 0.3,
      duration_days: 14,
      projected_continuation: 0.8,
      seasonal_factor: 0.15,
      anomalies: [],
    };
  }

  private async generateComparisons(
    _clinicId: string,
    _metrics: FinancialMetrics
  ): Promise<ComparisonData> {
    // Simplified comparison data
    return {
      previous_period: {
        revenue_change: 0.05,
        expense_change: 0.03,
        profit_change: 0.08,
        cash_flow_change: 0.02,
        patient_volume_change: 0.04,
        key_drivers: ['Increased patient volume', 'New service offerings'],
      },
      same_period_last_year: {
        revenue_change: 0.15,
        expense_change: 0.12,
        profit_change: 0.18,
        cash_flow_change: 0.1,
        patient_volume_change: 0.12,
        key_drivers: ['Market expansion', 'Improved efficiency'],
      },
      budget_comparison: {
        revenue_vs_budget: 0.02,
        expense_vs_budget: -0.01,
        profit_vs_budget: 0.05,
        variance_analysis: [],
      },
      industry_benchmarks: {
        revenue_per_patient: {
          clinic_value: 500,
          industry_average: 450,
          percentile_ranking: 75,
        },
        profit_margin: {
          clinic_value: 0.2,
          industry_average: 0.18,
          percentile_ranking: 70,
        },
        collection_rate: {
          clinic_value: 0.95,
          industry_average: 0.92,
          percentile_ranking: 80,
        },
      },
    };
  }

  private async getCurrentRevenue(clinicId: string): Promise<number> {
    // Get current month revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data } = await this.supabase
      .from('cash_flow_daily')
      .select('total_inflows')
      .eq('clinic_id', clinicId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    return data?.reduce((sum, d) => sum + d.total_inflows, 0) || 0;
  }

  private async getCurrentCashFlow(clinicId: string): Promise<number> {
    const cashFlowSummary =
      await this.cashFlowEngine.getCashFlowSummary(clinicId);
    return cashFlowSummary.current_balance;
  }
}

export default FinancialDashboardEngine;
