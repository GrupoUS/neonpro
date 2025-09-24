/**
 * Predictive Analytics Service for Financial Operations
 *
 * Advanced AI-powered financial analytics with trend analysis,
 * forecasting, and intelligent insights for Brazilian aesthetic clinics.
 */

import { z } from 'zod';
import { Billing } from '../billing-service';

/**
 * Advanced Analytics Types
 */
export interface TrendAnalysis {
  period: string;
  revenueTrend: 'increasing' | 'decreasing' | 'stable';
  growthRate: number;
  confidence: number;
  seasonalityFactors: Array<{
    factor: string;
    impact: number;
    period: string;
  }>;
  anomalies: Array<{
    date: string;
    expected: number;
    actual: number;
    deviation: number;
  }>;
}

export interface FinancialForecast {
  timeframe: '7d' | '30d' | '90d' | '6m' | '1y';
  predictions: Array<{
    period: string;
    predictedRevenue: number;
    confidence: number;
    factors: Array<{
      factor: string;
      impact: 'positive' | 'negative';
      weight: number;
    }>;
  }>;
  summary: {
    totalPredictedRevenue: number;
    averageGrowthRate: number;
    riskFactors: string[];
    opportunities: string[];
  };
}

export interface RevenueInsights {
  topPerformers: Array<{
    category: string;
    revenue: number;
    growth: number;
    contribution: number;
  }>;
  underperformers: Array<{
    category: string;
    revenue: number;
    growth: number;
    potential: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    averageRevenue: number;
    trend: 'up' | 'down' | 'stable';
    drivers: string[];
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
}

export interface CashFlowAnalysis {
  currentBalance: number;
  projectedBalance: number;
  cashFlowItems: Array<{
    date: string;
    type: 'inflow' | 'outflow';
    amount: number;
    category: string;
    probability: number;
  }>;
  risks: Array<{
    type: 'shortage' | 'surplus';
    severity: 'low' | 'medium' | 'high';
    date: string;
    amount: number;
    mitigation: string;
  }>;
  recommendations: string[];
}

/**
 * Analytics Configuration Schema
 */
const analyticsConfigSchema = z.object({
  models: z.object({
    revenuePrediction: z.object({
      algorithm: z.enum(['linear_regression', 'arima', 'prophet', 'lstm']),
      confidenceThreshold: z.number().min(0).max(1).default(0.8),
      lookbackPeriod: z.number().default(90), // days
    }),
    anomalyDetection: z.object({
      algorithm: z.enum(['isolation_forest', 'z_score', 'iqr']),
      sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
      windowSize: z.number().default(30), // days
    }),
    trendAnalysis: z.object({
      smoothingFactor: z.number().min(0).max(1).default(0.3),
      seasonalityDetection: z.boolean().default(true),
      confidenceInterval: z.number().default(0.95),
    }),
  }),
  dataSources: z.array(z.enum([
    'billing_transactions',
    'payment_history',
    'appointment_data',
    'patient_demographics',
    'market_data',
  ])).default(['billing_transactions', 'payment_history']),
  refreshInterval: z.number().default(3600), // seconds
  retentionPeriod: z.number().default(365), // days
});

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;

/**
 * Predictive Analytics Service
 */
export class PredictiveAnalyticsService {
  private config: AnalyticsConfig;
  private modelCache: Map<string, any> = new Map();
  private lastUpdate: Date = new Date();

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = analyticsConfigSchema.parse(config);
  }

  /**
   * Generate comprehensive trend analysis
   */
  async generateTrendAnalysis(
    historicalData: Billing[],
    period: '30d' | '90d' | '6m' | '1y' = '90d',
  ): Promise<TrendAnalysis> {
    try {
      // Filter data by period
      const cutoffDate = this.getCutoffDate(period);
      const periodData = historicalData.filter(
        billing => new Date(billing.createdAt) >= cutoffDate,
      );

      // Calculate revenue trends
      const dailyRevenue = this.calculateDailyRevenue(periodData);
      const trend = this.calculateRevenueTrend(dailyRevenue);

      // Detect seasonality
      const seasonality = this.detectSeasonality(dailyRevenue);

      // Identify anomalies
      const anomalies = this.detectTrendAnomalies(dailyRevenue);

      return {
        period,
        revenueTrend: trend.direction,
        growthRate: trend.rate,
        confidence: trend.confidence,
        seasonalityFactors: seasonality,
        anomalies,
      };
    } catch {
      console.error('Trend analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate financial forecast
   */
  async generateFinancialForecast(
    historicalData: Billing[],
    timeframe: '7d' | '30d' | '90d' | '6m' | '1y' = '30d',
  ): Promise<FinancialForecast> {
    try {
      // Prepare training data
      const trainingData = this.prepareTrainingData(historicalData);

      // Generate predictions
      const predictions = await this.generatePredictions(trainingData, timeframe);

      // Analyze risk factors and opportunities
      const analysis = this.analyzeForecastFactors(predictions);

      return {
        timeframe,
        predictions,
        summary: {
          totalPredictedRevenue: predictions.reduce((sum, p) => sum + p.predictedRevenue, 0),
          averageGrowthRate: this.calculateAverageGrowthRate(predictions),
          riskFactors: analysis.risks,
          opportunities: analysis.opportunities,
        },
      };
    } catch {
      console.error('Financial forecast failed:', error);
      throw error;
    }
  }

  /**
   * Generate revenue insights
   */
  async generateRevenueInsights(
    billingData: Billing[],
  ): Promise<RevenueInsights> {
    try {
      // Categorize billing data
      const categorizedData = this.categorizeBillingData(billingData);

      // Identify top performers
      const topPerformers = this.identifyTopPerformers(categorizedData);

      // Identify underperformers
      const underperformers = this.identifyUnderperformers(categorizedData);

      // Analyze seasonal trends
      const seasonalTrends = this.analyzeSeasonalTrends(billingData);

      // Generate recommendations
      const recommendations = this.generateInsightRecommendations(
        topPerformers,
        underperformers,
        seasonalTrends,
      );

      return {
        topPerformers,
        underperformers,
        seasonalTrends,
        recommendations,
      };
    } catch {
      console.error('Revenue insights failed:', error);
      throw error;
    }
  }

  /**
   * Generate cash flow analysis
   */
  async generateCashFlowAnalysis(
    billingData: Billing[],
    forecastDays: number = 30,
  ): Promise<CashFlowAnalysis> {
    try {
      // Calculate current cash position
      const currentBalance = this.calculateCurrentBalance(billingData);

      // Project future cash flows
      const cashFlowItems = await this.projectCashFlows(billingData, forecastDays);

      // Calculate projected balance
      const projectedBalance = this.calculateProjectedBalance(currentBalance, cashFlowItems);

      // Identify cash flow risks
      const risks = this.identifyCashFlowRisks(cashFlowItems);

      // Generate recommendations
      const recommendations = this.generateCashFlowRecommendations(risks);

      return {
        currentBalance,
        projectedBalance,
        cashFlowItems,
        risks,
        recommendations,
      };
    } catch {
      console.error('Cash flow analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate daily revenue from billing data
   */
  private calculateDailyRevenue(billingData: Billing[]): Array<{ date: string; revenue: number }> {
    const dailyRevenue = new Map<string, number>();

    billingData.forEach(billing => {
      if (billing.paymentStatus === 'paid') {
        const date = new Date(billing.paymentDate || billing.createdAt).toISOString().split('T')[0];
        dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + billing.total);
      }
    });

    return Array.from(dailyRevenue.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate revenue trend
   */
  private calculateRevenueTrend(dailyRevenue: Array<{ date: string; revenue: number }>): {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    confidence: number;
  } {
    if (dailyRevenue.length < 2) {
      return { direction: 'stable', rate: 0, confidence: 0 };
    }

    // Simple linear regression for trend calculation
    const n = dailyRevenue.length;
    const xValues = dailyRevenue.map((_, i) => i);
    const yValues = dailyRevenue.map(d => d.revenue);

    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

    const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
    const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const direction = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable';

    // Calculate confidence based on R-squared
    const ssRes = yValues.reduce((sum, y, i) => {
      const predicted = yMean + slope * (xValues[i] - xMean);
      return sum + Math.pow(y - predicted, 2);
    }, 0);

    const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    return {
      direction,
      rate: slope,
      confidence: Math.abs(rSquared),
    };
  }

  /**
   * Detect seasonality patterns
   */
  private detectSeasonality(dailyRevenue: Array<{ date: string; revenue: number }>): Array<{
    factor: string;
    impact: number;
    period: string;
  }> {
    // Simple seasonality detection based on day of week and month
    const dayOfWeekImpact = this.calculateDayOfWeekImpact(dailyRevenue);
    const monthlyImpact = this.calculateMonthlyImpact(dailyRevenue);

    return [
      ...dayOfWeekImpact,
      ...monthlyImpact,
    ];
  }

  /**
   * Calculate day of week impact
   */
  private calculateDayOfWeekImpact(dailyRevenue: Array<{ date: string; revenue: number }>): Array<{
    factor: string;
    impact: number;
    period: string;
  }> {
    const dayOfWeekRevenue = new Map<number, { total: number; count: number }>();

    dailyRevenue.forEach(({ date, revenue }) => {
      const dayOfWeek = new Date(date).getDay();
      const current = dayOfWeekRevenue.get(dayOfWeek) || { total: 0, count: 0 };
      dayOfWeekRevenue.set(dayOfWeek, {
        total: current.total + revenue,
        count: current.count + 1,
      });
    });

    const overallAverage = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0)
      / dailyRevenue.length;
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return Array.from(dayOfWeekRevenue.entries()).map(([day, data]) => {
      const average = data.total / data.count;
      const impact = (average - overallAverage) / overallAverage;

      return {
        factor: `${daysOfWeek[day]} - Impacto Sazonal`,
        impact,
        period: 'weekly',
      };
    });
  }

  /**
   * Calculate monthly impact
   */
  private calculateMonthlyImpact(dailyRevenue: Array<{ date: string; revenue: number }>): Array<{
    factor: string;
    impact: number;
    period: string;
  }> {
    const monthlyRevenue = new Map<number, { total: number; count: number }>();

    dailyRevenue.forEach(({ date, revenue }) => {
      const month = new Date(date).getMonth();
      const current = monthlyRevenue.get(month) || { total: 0, count: 0 };
      monthlyRevenue.set(month, {
        total: current.total + revenue,
        count: current.count + 1,
      });
    });

    const overallAverage = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0)
      / dailyRevenue.length;
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    return Array.from(monthlyRevenue.entries()).map(([month, data]) => {
      const average = data.total / data.count;
      const impact = (average - overallAverage) / overallAverage;

      return {
        factor: `${months[month]} - Impacto Mensal`,
        impact,
        period: 'yearly',
      };
    });
  }

  /**
   * Detect trend anomalies
   */
  private detectTrendAnomalies(dailyRevenue: Array<{ date: string; revenue: number }>): Array<{
    date: string;
    expected: number;
    actual: number;
    deviation: number;
  }> {
    if (dailyRevenue.length < 10) return [];

    // Calculate moving average
    const windowSize = 7;
    const anomalies: Array<{
      date: string;
      expected: number;
      actual: number;
      deviation: number;
    }> = [];

    for (let i = windowSize; i < dailyRevenue.length; i++) {
      const window = dailyRevenue.slice(i - windowSize, i);
      const movingAverage = window.reduce((sum, d) => sum + d.revenue, 0) / windowSize;
      const current = dailyRevenue[i];

      // Check if deviation is significant (> 2 standard deviations)
      const stdDev = this.calculateStandardDeviation(window.map(d => d.revenue));
      const deviation = Math.abs(current.revenue - movingAverage);

      if (deviation > 2 * stdDev) {
        anomalies.push({
          date: current.date,
          expected: movingAverage,
          actual: current.revenue,
          deviation: deviation / movingAverage,
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get cutoff date for period filtering
   */
  private getCutoffDate(period: '30d' | '90d' | '6m' | '1y'): Date {
    const now = new Date();
    const cutoffDate = new Date(now);

    switch (period) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return cutoffDate;
  }

  /**
   * Prepare training data for predictions
   */
  private prepareTrainingData(
    billingData: Billing[],
  ): Array<{ date: string; revenue: number; features: any }> {
    return billingData
      .filter(billing => billing.paymentStatus === 'paid')
      .map(billing => ({
        date: billing.createdAt,
        revenue: billing.total,
        features: {
          billingType: billing.billingType,
          paymentMethod: billing.paymentMethod,
          itemCount: billing.items.length,
          hasDiscount: billing.discounts > 0,
          dayOfWeek: new Date(billing.createdAt).getDay(),
          month: new Date(billing.createdAt).getMonth(),
        },
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate predictions based on training data
   */
  private async generatePredictions(
    trainingData: Array<{ date: string; revenue: number; features: any }>,
    timeframe: '7d' | '30d' | '90d' | '6m' | '1y',
  ): Promise<
    Array<{
      period: string;
      predictedRevenue: number;
      confidence: number;
      factors: Array<{
        factor: string;
        impact: 'positive' | 'negative';
        weight: number;
      }>;
    }>
  > {
    // Simplified prediction algorithm
    // In a real implementation, this would use ML models

    const periods = this.getPredictionPeriods(timeframe);
    const trend = this.calculateRevenueTrend(
      trainingData.map(d => ({ date: d.date, revenue: d.revenue })),
    );
    const baseRevenue = trainingData.length > 0
      ? trainingData.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7
      : 0;

    return periods.map((period, index) => {
      const growthFactor = 1 + (trend.rate * (index + 1) * 0.1);
      const predictedRevenue = baseRevenue * growthFactor;

      // Adjust confidence based on prediction distance
      const confidence = Math.max(0.5, trend.confidence - (index * 0.05));

      return {
        period,
        predictedRevenue,
        confidence,
        factors: [
          {
            factor: 'Tendência Histórica',
            impact: trend.rate > 0 ? 'positive' : 'negative',
            weight: Math.abs(trend.rate),
          },
        ],
      };
    });
  }

  /**
   * Get prediction periods based on timeframe
   */
  private getPredictionPeriods(timeframe: '7d' | '30d' | '90d' | '6m' | '1y'): string[] {
    const now = new Date();
    const periods: string[] = [];

    switch (timeframe) {
      case '7d':
        for (let i = 1; i <= 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          periods.push(date.toISOString().split('T')[0]);
        }
        break;
      case '30d':
        for (let i = 1; i <= 30; i += 3) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          periods.push(`Semana ${Math.ceil(i / 7)}`);
        }
        break;
      case '90d':
        for (let i = 1; i <= 12; i++) {
          periods.push(`Semana ${i}`);
        }
        break;
      case '6m':
        for (let i = 1; i <= 6; i++) {
          periods.push(`Mês ${i}`);
        }
        break;
      case '1y':
        for (let i = 1; i <= 12; i++) {
          periods.push(`Mês ${i}`);
        }
        break;
    }

    return periods;
  }

  /**
   * Analyze forecast factors
   */
  private analyzeForecastFactors(predictions: any[]): { risks: string[]; opportunities: string[] } {
    const risks: string[] = [];
    const opportunities: string[] = [];

    // Analyze prediction trends
    const avgRevenue = predictions.reduce((sum, p) => sum + p.predictedRevenue, 0)
      / predictions.length;
    const minRevenue = Math.min(...predictions.map(p => p.predictedRevenue));
    const maxRevenue = Math.max(...predictions.map(p => p.predictedRevenue));

    if (minRevenue < avgRevenue * 0.7) {
      risks.push('Volatilidade significativa na receita projetada');
    }

    if (maxRevenue > avgRevenue * 1.5) {
      opportunities.push('Potencial de crescimento acima da média');
    }

    return { risks, opportunities };
  }

  /**
   * Categorize billing data
   */
  private categorizeBillingData(billingData: Billing[]): Map<string, Billing[]> {
    const categorized = new Map<string, Billing[]>();

    billingData.forEach(billing => {
      // Categorize by procedure type or billing type
      const category = billing.billingType;

      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category)!.push(billing);
    });

    return categorized;
  }

  /**
   * Identify top performers
   */
  private identifyTopPerformers(categorizedData: Map<string, Billing[]>): Array<{
    category: string;
    revenue: number;
    growth: number;
    contribution: number;
  }> {
    const totalRevenue = Array.from(categorizedData.values())
      .flat()
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.total, 0);

    return Array.from(categorizedData.entries())
      .map(([category, billings]) => {
        const revenue = billings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.total, 0);

        const contribution = totalRevenue > 0 ? revenue / totalRevenue : 0;

        // Calculate simple growth (comparing first half vs second half of period)
        const midPoint = Math.floor(billings.length / 2);
        const firstHalf = billings.slice(0, midPoint);
        const secondHalf = billings.slice(midPoint);

        const firstHalfRevenue = firstHalf
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.total, 0);

        const secondHalfRevenue = secondHalf
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.total, 0);

        const growth = firstHalfRevenue > 0
          ? (secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue
          : 0;

        return { category, revenue, growth, contribution };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  /**
   * Identify underperformers
   */
  private identifyUnderperformers(categorizedData: Map<string, Billing[]>): Array<{
    category: string;
    revenue: number;
    growth: number;
    potential: number;
  }> {
    // Similar to top performers but focusing on low growth/revenue
    const performers = this.identifyTopPerformers(categorizedData);

    return performers
      .filter(p => p.growth < 0 || p.contribution < 0.05)
      .map(p => ({
        category: p.category,
        revenue: p.revenue,
        growth: p.growth,
        potential: p.revenue * 0.2, // 20% growth potential
      }))
      .sort((a, b) => a.potential - b.potential);
  }

  /**
   * Analyze seasonal trends
   */
  private analyzeSeasonalTrends(billingData: Billing[]): Array<{
    month: string;
    averageRevenue: number;
    trend: 'up' | 'down' | 'stable';
    drivers: string[];
  }> {
    const monthlyData = new Map<number, { total: number; count: number }>();
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    billingData.forEach(billing => {
      if (billing.paymentStatus === 'paid') {
        const month = new Date(billing.createdAt).getMonth();
        const current = monthlyData.get(month) || { total: 0, count: 0 };
        monthlyData.set(month, {
          total: current.total + billing.total,
          count: current.count + 1,
        });
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => {
      const averageRevenue = data.total / data.count;

      // Simple trend analysis (compare with previous month)
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevData = monthlyData.get(prevMonth);
      const trend = prevData
        ? averageRevenue > (prevData.total / prevData.count) * 1.05
          ? 'up'
          : averageRevenue < (prevData.total / prevData.count) * 0.95
          ? 'down'
          : 'stable'
        : 'stable';

      return {
        month: months[month],
        averageRevenue,
        trend,
        drivers: this.identifyMonthlyDrivers(month, billingData),
      };
    });
  }

  /**
   * Identify monthly revenue drivers
   */
  private identifyMonthlyDrivers(month: number, billingData: Billing[]): string[] {
    const monthBillings = billingData.filter(b =>
      new Date(b.createdAt).getMonth() === month
      && b.paymentStatus === 'paid'
    );

    const drivers: string[] = [];

    // Analyze top procedures in this month
    const procedureCounts = new Map<string, number>();
    monthBillings.forEach(billing => {
      billing.items.forEach(item => {
        const procedure = item.procedureCode.description;
        procedureCounts.set(procedure, (procedureCounts.get(procedure) || 0) + 1);
      });
    });

    const topProcedures = Array.from(procedureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([procedure]) => procedure);

    drivers.push(`Procedimentos principais: ${topProcedures.join(', ')}`);

    return drivers;
  }

  /**
   * Generate insight recommendations
   */
  private generateInsightRecommendations(
    topPerformers: any[],
    underperformers: any[],
    seasonalTrends: any[],
  ): Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeline: string;
  }> {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: string;
      timeline: string;
    }> = [];

    // High performers recommendations
    if (topPerformers.length > 0 && topPerformers[0].growth > 0.1) {
      recommendations.push({
        priority: 'high',
        action: `Expandir serviços de ${topPerformers[0].category} - crescimento de ${
          (topPerformers[0].growth * 100).toFixed(1)
        }%`,
        expectedImpact: 'Aumento de 15-25% na receita',
        timeline: '90 dias',
      });
    }

    // Underperformers recommendations
    underperformers.forEach(underperformer => {
      if (underperformer.potential > 1000) {
        recommendations.push({
          priority: 'medium',
          action: `Revisar estratégia para ${underperformer.category}`,
          expectedImpact: 'Recuperar até R$ ' + underperformer.potential.toFixed(2),
          timeline: '60 dias',
        });
      }
    });

    // Seasonal recommendations
    const highSeasonMonths = seasonalTrends.filter(t => t.trend === 'up');
    if (highSeasonMonths.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Preparar equipe e estoque para alta temporada',
        expectedImpact: 'Maximizar receita durante pico de demanda',
        timeline: '30 dias',
      });
    }

    return recommendations;
  }

  /**
   * Calculate current balance
   */
  private calculateCurrentBalance(billingData: Billing[]): number {
    return billingData
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.total, 0);
  }

  /**
   * Project cash flows
   */
  private async projectCashFlows(
    billingData: Billing[],
    forecastDays: number,
  ): Promise<
    Array<{
      date: string;
      type: 'inflow' | 'outflow';
      amount: number;
      category: string;
      probability: number;
    }>
  > {
    // Simplified cash flow projection
    const cashFlows: Array<{
      date: string;
      type: 'inflow' | 'outflow';
      amount: number;
      category: string;
      probability: number;
    }> = [];

    const now = new Date();
    const paidBillings = billingData.filter(b => b.paymentStatus === 'paid');
    const pendingBillings = billingData.filter(b => b.paymentStatus === 'pending');

    // Project inflows from pending payments
    pendingBillings.forEach(billing => {
      const dueDate = new Date(billing.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= forecastDays && daysUntilDue >= 0) {
        cashFlows.push({
          date: dueDate.toISOString().split('T')[0],
          type: 'inflow',
          amount: billing.total,
          category: 'Recebimento de cliente',
          probability: this.calculatePaymentProbability(billing),
        });
      }
    });

    // Project regular outflows (simplified)
    const averageMonthlyOutflow = this.calculateAverageMonthlyOutflow(paidBillings);

    for (let i = 1; i <= forecastDays; i += 7) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      cashFlows.push({
        date: date.toISOString().split('T')[0],
        type: 'outflow',
        amount: averageMonthlyOutflow / 4.33, // Weekly outflow
        category: 'Despesas operacionais',
        probability: 0.9,
      });
    }

    return cashFlows.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate payment probability
   */
  private calculatePaymentProbability(billing: Billing): number {
    // Simple probability calculation based on billing characteristics
    let probability = 0.7; // Base probability

    // Adjust based on billing type
    if (billing.billingType === 'health_plan') probability += 0.1;
    if (billing.billingType === 'sus') probability += 0.05;
    if (billing.billingType === 'private') probability += 0.15;

    // Adjust based on amount
    if (billing.total > 1000) probability -= 0.1;
    if (billing.total > 5000) probability -= 0.1;

    return Math.max(0.1, Math.min(1.0, probability));
  }

  /**
   * Calculate average monthly outflow
   */
  private calculateAverageMonthlyOutflow(paidBillings: Billing[]): number {
    // Simplified calculation - assumes outflows are 70% of inflows
    const totalInflow = paidBillings.reduce((sum, b) => sum + b.total, 0);
    return totalInflow * 0.7 / 12; // Monthly outflow
  }

  /**
   * Calculate projected balance
   */
  private calculateProjectedBalance(
    currentBalance: number,
    cashFlows: Array<{
      date: string;
      type: 'inflow' | 'outflow';
      amount: number;
      category: string;
      probability: number;
    }>,
  ): number {
    return cashFlows.reduce((balance, flow) => {
      const expectedAmount = flow.amount * flow.probability;
      return flow.type === 'inflow' ? balance + expectedAmount : balance - expectedAmount;
    }, currentBalance);
  }

  /**
   * Identify cash flow risks
   */
  private identifyCashFlowRisks(
    cashFlows: Array<{
      date: string;
      type: 'inflow' | 'outflow';
      amount: number;
      category: string;
      probability: number;
    }>,
  ): Array<{
    type: 'shortage' | 'surplus';
    severity: 'low' | 'medium' | 'high';
    date: string;
    amount: number;
    mitigation: string;
  }> {
    const risks: Array<{
      type: 'shortage' | 'surplus';
      severity: 'low' | 'medium' | 'high';
      date: string;
      amount: number;
      mitigation: string;
    }> = [];

    let runningBalance = 0;

    cashFlows.forEach(flow => {
      const expectedAmount = flow.amount * flow.probability;
      runningBalance += flow.type === 'inflow' ? expectedAmount : -expectedAmount;

      if (runningBalance < 0) {
        const severity = runningBalance < -10000
          ? 'high'
          : runningBalance < -5000
          ? 'medium'
          : 'low';
        risks.push({
          type: 'shortage',
          severity,
          date: flow.date,
          amount: Math.abs(runningBalance),
          mitigation: severity === 'high'
            ? 'Buscar financiamento ou adiar despesas não essenciais'
            : 'Acelerar cobranças de clientes',
        });
      }
    });

    return risks;
  }

  /**
   * Generate cash flow recommendations
   */
  private generateCashFlowRecommendations(risks: any[]): string[] {
    const recommendations: string[] = [];

    if (risks.some(r => r.severity === 'high')) {
      recommendations.push('Estabelecer linha de crédito emergencial');
      recommendations.push('Renegociar prazos com fornecedores');
    }

    if (risks.some(r => r.severity === 'medium')) {
      recommendations.push('Implementar política de cobrança antecipada');
      recommendations.push('Revisar cronograma de despesas');
    }

    recommendations.push('Monitorar fluxo de caixa diariamente');
    recommendations.push('Manter reserva de emergência');

    return recommendations;
  }

  /**
   * Calculate average growth rate
   */
  private calculateAverageGrowthRate(predictions: any[]): number {
    if (predictions.length < 2) return 0;

    const totalGrowth = predictions[predictions.length - 1].predictedRevenue
      - predictions[0].predictedRevenue;
    const averageGrowth = totalGrowth / predictions.length;
    const baseRevenue = predictions[0].predictedRevenue;

    return baseRevenue > 0 ? averageGrowth / baseRevenue : 0;
  }

  /**
   * Get service configuration
   */
  getConfiguration(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<AnalyticsConfig>): AnalyticsConfig {
    this.config = analyticsConfigSchema.parse({
      ...this.config,
      ...updates,
    });

    // Clear model cache on configuration change
    this.modelCache.clear();
    this.lastUpdate = new Date();

    return this.config;
  }

  /**
   * Get service health status
   */
  getHealthStatus(): any {
    return {
      initialized: true,
      lastUpdate: this.lastUpdate.toISOString(),
      modelCacheSize: this.modelCache.size,
      config: this.config,
    };
  }
}
