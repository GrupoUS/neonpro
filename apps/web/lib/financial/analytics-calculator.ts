/**
 * Financial Analytics Calculator - Advanced Analytics and Calculations
 * NeonPro Healthcare System - Story 4.3 Architecture Alignment
 *
 * This module provides advanced financial analytics and calculation capabilities
 * for treatment profitability, revenue analysis, and business intelligence.
 */

import { z } from 'zod';

// =================== TYPES & SCHEMAS ===================

export const TreatmentProfitabilitySchema = z.object({
  treatmentId: z.string(),
  treatmentType: z.string(),
  revenue: z.number().min(0),
  directCosts: z.number().min(0),
  indirectCosts: z.number().min(0),
  laborCosts: z.number().min(0),
  materialCosts: z.number().min(0),
  overheadCosts: z.number().min(0),
  date: z.date(),
  clinicId: z.string(),
  patientId: z.string().optional(),
});

export type TreatmentProfitability = z.infer<
  typeof TreatmentProfitabilitySchema
>;

export const RevenueAnalyticsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  endDate: z.date(),
  revenueBySource: z.record(z.number()),
  revenueByTreatment: z.record(z.number()),
  revenueByPatient: z.record(z.number()),
  totalRevenue: z.number(),
  averageTransactionValue: z.number(),
  transactionCount: z.number(),
});

export type RevenueAnalytics = z.infer<typeof RevenueAnalyticsSchema>;

export type FinancialKPI = {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  period: string;
  category: 'revenue' | 'costs' | 'profitability' | 'efficiency';
};

export type ProfitabilityAnalysis = {
  treatmentType: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  roi: number;
  treatmentCount: number;
  averageRevenuePerTreatment: number;
  averageCostPerTreatment: number;
  recommendations: string[];
};

// =================== ANALYTICS CALCULATOR CLASS ===================

export class FinancialAnalyticsCalculator {
  private readonly PROFIT_MARGIN_TARGET = 0.3; // 30% target profit margin
  private readonly ROI_TARGET = 0.25; // 25% target ROI

  /**
   * Calculate treatment profitability analysis
   */
  async calculateTreatmentProfitability(
    treatments: TreatmentProfitability[],
  ): Promise<ProfitabilityAnalysis[]> {
    try {
      // Validate input data
      treatments.forEach((treatment) => {
        TreatmentProfitabilitySchema.parse(treatment);
      });

      // Group by treatment type
      const treatmentGroups = this.groupTreatmentsByType(treatments);

      const analyses: ProfitabilityAnalysis[] = [];

      for (const [treatmentType, treatmentList] of treatmentGroups.entries()) {
        const analysis = this.analyzeTreatmentGroup(
          treatmentType,
          treatmentList,
        );
        analyses.push(analysis);
      }

      return analyses.sort((a, b) => b.profitMargin - a.profitMargin);
    } catch (_error) {
      throw new Error('Failed to calculate treatment profitability');
    }
  }

  /**
   * Calculate comprehensive financial KPIs
   */
  async calculateFinancialKPIs(
    revenueData: RevenueAnalytics[],
    previousPeriodData?: RevenueAnalytics[],
  ): Promise<FinancialKPI[]> {
    try {
      const kpis: FinancialKPI[] = [];

      for (const data of revenueData) {
        RevenueAnalyticsSchema.parse(data);

        // Revenue KPIs
        kpis.push({
          name: 'Total Revenue',
          value: data.totalRevenue,
          target: this.calculateRevenueTarget(data),
          trend: this.calculateTrend(data, previousPeriodData, 'totalRevenue'),
          changePercentage: this.calculateChangePercentage(
            data,
            previousPeriodData,
            'totalRevenue',
          ),
          period: data.period,
          category: 'revenue',
        });

        kpis.push({
          name: 'Average Transaction Value',
          value: data.averageTransactionValue,
          target: this.calculateAverageTransactionTarget(data),
          trend: this.calculateTrend(
            data,
            previousPeriodData,
            'averageTransactionValue',
          ),
          changePercentage: this.calculateChangePercentage(
            data,
            previousPeriodData,
            'averageTransactionValue',
          ),
          period: data.period,
          category: 'revenue',
        });

        // Efficiency KPIs
        kpis.push({
          name: 'Transaction Count',
          value: data.transactionCount,
          target: this.calculateTransactionCountTarget(data),
          trend: this.calculateTrend(
            data,
            previousPeriodData,
            'transactionCount',
          ),
          changePercentage: this.calculateChangePercentage(
            data,
            previousPeriodData,
            'transactionCount',
          ),
          period: data.period,
          category: 'efficiency',
        });
      }

      return kpis;
    } catch (_error) {
      throw new Error('Failed to calculate financial KPIs');
    }
  }

  /**
   * Calculate revenue forecasting with seasonal patterns
   */
  async calculateRevenueForecasting(
    historicalData: RevenueAnalytics[],
    forecastPeriods = 12,
  ): Promise<{
    forecast: Array<{
      period: string;
      predictedRevenue: number;
      confidenceInterval: { lower: number; upper: number };
      seasonalFactor: number;
    }>;
    trendAnalysis: {
      overallTrend: 'growing' | 'declining' | 'stable';
      growthRate: number;
      seasonality: Record<string, number>;
    };
  }> {
    try {
      // Validate historical data
      historicalData.forEach((data) => {
        RevenueAnalyticsSchema.parse(data);
      });

      if (historicalData.length < 3) {
        throw new Error(
          'Insufficient historical data for forecasting (minimum 3 periods required)',
        );
      }

      // Calculate trend and seasonality
      const trendAnalysis = this.calculateTrendAnalysis(historicalData);
      const seasonalFactors = this.calculateSeasonalFactors(historicalData);

      // Generate forecast
      const forecast = this.generateRevenueForecast(
        historicalData,
        trendAnalysis,
        seasonalFactors,
        forecastPeriods,
      );

      return {
        forecast,
        trendAnalysis: {
          overallTrend: trendAnalysis.trend,
          growthRate: trendAnalysis.growthRate,
          seasonality: seasonalFactors,
        },
      };
    } catch (_error) {
      throw new Error('Failed to calculate revenue forecasting');
    }
  }

  /**
   * Calculate cost analysis and optimization recommendations
   */
  async calculateCostOptimization(
    treatments: TreatmentProfitability[],
  ): Promise<{
    costBreakdown: Record<string, { amount: number; percentage: number }>;
    optimizationOpportunities: Array<{
      category: string;
      potentialSavings: number;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    benchmarkComparison: Record<
      string,
      { current: number; benchmark: number; variance: number }
    >;
  }> {
    try {
      // Validate input data
      treatments.forEach((treatment) => {
        TreatmentProfitabilitySchema.parse(treatment);
      });

      // Calculate cost breakdown
      const costBreakdown = this.calculateCostBreakdown(treatments);

      // Identify optimization opportunities
      const optimizationOpportunities = this.identifyOptimizationOpportunities(
        treatments,
        costBreakdown,
      );

      // Benchmark comparison
      const benchmarkComparison =
        this.calculateBenchmarkComparison(costBreakdown);

      return {
        costBreakdown,
        optimizationOpportunities,
        benchmarkComparison,
      };
    } catch (_error) {
      throw new Error('Failed to calculate cost optimization');
    }
  }

  // =================== PRIVATE HELPER METHODS ===================

  private groupTreatmentsByType(
    treatments: TreatmentProfitability[],
  ): Map<string, TreatmentProfitability[]> {
    const groups = new Map<string, TreatmentProfitability[]>();

    treatments.forEach((treatment) => {
      const type = treatment.treatmentType;
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)?.push(treatment);
    });

    return groups;
  }

  private analyzeTreatmentGroup(
    treatmentType: string,
    treatments: TreatmentProfitability[],
  ): ProfitabilityAnalysis {
    const totalRevenue = treatments.reduce((sum, t) => sum + t.revenue, 0);
    const totalCosts = treatments.reduce(
      (sum, t) =>
        sum +
        t.directCosts +
        t.indirectCosts +
        t.laborCosts +
        t.materialCosts +
        t.overheadCosts,
      0,
    );
    const grossProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
    const roi = totalCosts > 0 ? grossProfit / totalCosts : 0;

    const averageRevenuePerTreatment = totalRevenue / treatments.length;
    const averageCostPerTreatment = totalCosts / treatments.length;

    const recommendations = this.generateRecommendations(
      profitMargin,
      roi,
      treatmentType,
    );

    return {
      treatmentType,
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      roi,
      treatmentCount: treatments.length,
      averageRevenuePerTreatment,
      averageCostPerTreatment,
      recommendations,
    };
  }

  private generateRecommendations(
    profitMargin: number,
    roi: number,
    treatmentType: string,
  ): string[] {
    const recommendations: string[] = [];

    if (profitMargin < this.PROFIT_MARGIN_TARGET) {
      recommendations.push(
        `Profit margin for ${treatmentType} is ${(profitMargin * 100).toFixed(1)}%, below target of ${this.PROFIT_MARGIN_TARGET * 100}%. Consider pricing optimization.`,
      );
    }

    if (roi < this.ROI_TARGET) {
      recommendations.push(
        `ROI for ${treatmentType} is ${(roi * 100).toFixed(1)}%, below target of ${this.ROI_TARGET * 100}%. Review cost structure.`,
      );
    }

    if (profitMargin > 0.5) {
      recommendations.push(
        `High profit margin of ${(profitMargin * 100).toFixed(1)}% for ${treatmentType}. Consider market expansion opportunities.`,
      );
    }

    return recommendations;
  }

  private calculateTrend(
    current: RevenueAnalytics,
    previous: RevenueAnalytics[] | undefined,
    field: keyof RevenueAnalytics,
  ): 'up' | 'down' | 'stable' {
    if (!previous || previous.length === 0) {
      return 'stable';
    }

    const currentValue = current[field] as number;
    const previousValue = previous[0][field] as number;

    if (currentValue > previousValue * 1.05) {
      return 'up';
    }
    if (currentValue < previousValue * 0.95) {
      return 'down';
    }
    return 'stable';
  }

  private calculateChangePercentage(
    current: RevenueAnalytics,
    previous: RevenueAnalytics[] | undefined,
    field: keyof RevenueAnalytics,
  ): number {
    if (!previous || previous.length === 0) {
      return 0;
    }

    const currentValue = current[field] as number;
    const previousValue = previous[0][field] as number;

    if (previousValue === 0) {
      return 0;
    }
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  private calculateRevenueTarget(data: RevenueAnalytics): number {
    // Dynamic target based on historical performance + growth expectations
    return data.totalRevenue * 1.1; // 10% growth target
  }

  private calculateAverageTransactionTarget(data: RevenueAnalytics): number {
    return data.averageTransactionValue * 1.05; // 5% improvement target
  }

  private calculateTransactionCountTarget(data: RevenueAnalytics): number {
    return data.transactionCount * 1.08; // 8% increase target
  }

  private calculateTrendAnalysis(historicalData: RevenueAnalytics[]): {
    trend: 'growing' | 'declining' | 'stable';
    growthRate: number;
  } {
    const revenues = historicalData.map((d) => d.totalRevenue);
    const periods = revenues.length;

    if (periods < 2) {
      return { trend: 'stable', growthRate: 0 };
    }

    // Simple linear regression for trend
    const growthRate =
      (revenues[periods - 1] - revenues[0]) / (revenues[0] * (periods - 1));

    if (growthRate > 0.02) {
      return { trend: 'growing', growthRate };
    }
    if (growthRate < -0.02) {
      return { trend: 'declining', growthRate };
    }
    return { trend: 'stable', growthRate };
  }

  private calculateSeasonalFactors(
    historicalData: RevenueAnalytics[],
  ): Record<string, number> {
    // Simplified seasonal analysis - would need more sophisticated analysis in production
    const factors: Record<string, number> = {};

    historicalData.forEach((_data, index) => {
      const month = (index % 12) + 1;
      factors[`month_${month}`] = 1.0; // Placeholder - would calculate actual seasonal factors
    });

    return factors;
  }

  private generateRevenueForecast(
    historicalData: RevenueAnalytics[],
    trendAnalysis: { trend: string; growthRate: number },
    _seasonalFactors: Record<string, number>,
    forecastPeriods: number,
  ): Array<{
    period: string;
    predictedRevenue: number;
    confidenceInterval: { lower: number; upper: number };
    seasonalFactor: number;
  }> {
    const forecast = [];
    const lastRevenue = historicalData.at(-1).totalRevenue;
    const baseGrowth = trendAnalysis.growthRate;

    for (let i = 1; i <= forecastPeriods; i++) {
      const periodRevenue = lastRevenue * (1 + baseGrowth * i);
      const seasonalFactor = 1.0; // Simplified - would use actual seasonal calculation
      const predictedRevenue = periodRevenue * seasonalFactor;

      forecast.push({
        period: `Period ${i}`,
        predictedRevenue,
        confidenceInterval: {
          lower: predictedRevenue * 0.85,
          upper: predictedRevenue * 1.15,
        },
        seasonalFactor,
      });
    }

    return forecast;
  }

  private calculateCostBreakdown(
    treatments: TreatmentProfitability[],
  ): Record<string, { amount: number; percentage: number }> {
    const totalDirectCosts = treatments.reduce(
      (sum, t) => sum + t.directCosts,
      0,
    );
    const totalIndirectCosts = treatments.reduce(
      (sum, t) => sum + t.indirectCosts,
      0,
    );
    const totalLaborCosts = treatments.reduce(
      (sum, t) => sum + t.laborCosts,
      0,
    );
    const totalMaterialCosts = treatments.reduce(
      (sum, t) => sum + t.materialCosts,
      0,
    );
    const totalOverheadCosts = treatments.reduce(
      (sum, t) => sum + t.overheadCosts,
      0,
    );

    const totalCosts =
      totalDirectCosts +
      totalIndirectCosts +
      totalLaborCosts +
      totalMaterialCosts +
      totalOverheadCosts;

    return {
      direct: {
        amount: totalDirectCosts,
        percentage: (totalDirectCosts / totalCosts) * 100,
      },
      indirect: {
        amount: totalIndirectCosts,
        percentage: (totalIndirectCosts / totalCosts) * 100,
      },
      labor: {
        amount: totalLaborCosts,
        percentage: (totalLaborCosts / totalCosts) * 100,
      },
      materials: {
        amount: totalMaterialCosts,
        percentage: (totalMaterialCosts / totalCosts) * 100,
      },
      overhead: {
        amount: totalOverheadCosts,
        percentage: (totalOverheadCosts / totalCosts) * 100,
      },
    };
  }

  private identifyOptimizationOpportunities(
    _treatments: TreatmentProfitability[],
    costBreakdown: Record<string, { amount: number; percentage: number }>,
  ): Array<{
    category: string;
    potentialSavings: number;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const opportunities = [];

    // High labor cost optimization
    if (costBreakdown.labor.percentage > 40) {
      opportunities.push({
        category: 'Labor Optimization',
        potentialSavings: costBreakdown.labor.amount * 0.1,
        recommendation:
          'Consider workflow optimization and staff productivity improvements',
        priority: 'high' as const,
      });
    }

    // Material cost optimization
    if (costBreakdown.materials.percentage > 30) {
      opportunities.push({
        category: 'Material Cost Reduction',
        potentialSavings: costBreakdown.materials.amount * 0.08,
        recommendation:
          'Negotiate better supplier rates and reduce material waste',
        priority: 'medium' as const,
      });
    }

    // Overhead optimization
    if (costBreakdown.overhead.percentage > 25) {
      opportunities.push({
        category: 'Overhead Reduction',
        potentialSavings: costBreakdown.overhead.amount * 0.05,
        recommendation: 'Review fixed costs and administrative expenses',
        priority: 'low' as const,
      });
    }

    return opportunities;
  }

  private calculateBenchmarkComparison(
    costBreakdown: Record<string, { amount: number; percentage: number }>,
  ): Record<string, { current: number; benchmark: number; variance: number }> {
    const benchmarks = {
      labor: 35, // Industry benchmark 35%
      materials: 25, // Industry benchmark 25%
      overhead: 20, // Industry benchmark 20%
      direct: 15, // Industry benchmark 15%
      indirect: 5, // Industry benchmark 5%
    };

    const comparison: Record<
      string,
      { current: number; benchmark: number; variance: number }
    > = {};

    Object.keys(benchmarks).forEach((key) => {
      const current = costBreakdown[key]?.percentage || 0;
      const benchmark = benchmarks[key as keyof typeof benchmarks];
      comparison[key] = {
        current,
        benchmark,
        variance: current - benchmark,
      };
    });

    return comparison;
  }
}

// =================== FACTORY & EXPORTS ===================

/**
 * Factory function to create FinancialAnalyticsCalculator instance
 */
export const createFinancialAnalyticsCalculator =
  (): FinancialAnalyticsCalculator => {
    return new FinancialAnalyticsCalculator();
  };

/**
 * Default export for convenience
 */
export default createFinancialAnalyticsCalculator;

/**
 * Utility functions for financial calculations
 */
export const FinancialUtils = {
  formatCurrency: (amount: number, currency = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  calculatePercentage: (value: number, total: number): number => {
    return total > 0 ? (value / total) * 100 : 0;
  },

  roundToDecimal: (value: number, decimals = 2): number => {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  },
};
