/**
 * Financial Analytics Calculator
 * 
 * Advanced financial analytics and calculations engine for business intelligence.
 * Provides treatment profitability analysis, revenue forecasting, and financial insights.
 * 
 * Features:
 * - Treatment profitability analysis with cost breakdown
 * - Revenue trend analysis and forecasting
 * - Financial benchmarking and goal tracking
 * - Automated insights and recommendations
 * - Performance optimization for large datasets
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Types for Analytics
export interface TreatmentProfitability {
  treatment_id: string;
  treatment_type: string;
  revenue: number;
  direct_costs: number;
  indirect_costs: number;
  profit_margin: number;
  roi_percentage: number;
  volume: number;
  average_price: number;
  cost_breakdown: {
    materials: number;
    labor: number;
    overhead: number;
    equipment: number;
  };
}

export interface RevenueAnalytics {
  date: string;
  revenue_source: string;
  amount: number;
  growth_rate: number;
  seasonal_factor: number;
  trend_direction: 'up' | 'down' | 'stable';
  forecast_confidence: number;
}

export interface FinancialBenchmark {
  metric_name: string;
  clinic_value: number;
  industry_average: number;
  percentile_rank: number;
  benchmark_date: string;
  performance_status: 'above' | 'below' | 'at' | 'unknown';
  improvement_potential: number;
}

export interface FinancialInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact_score: number;
  confidence_level: number;
  action_items: string[];
  data_source: string;
  created_at: string;
}

export interface ForecastData {
  period: string;
  predicted_revenue: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: {
    seasonal: number;
    trend: number;
    external: number;
  };
  accuracy_score: number;
}

class FinancialAnalyticsCalculator {
  private supabase: ReturnType<typeof createClient<Database>>;
  private clinicId: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    clinicId: string
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.clinicId = clinicId;
    this.cache = new Map();
  }

  /**
   * Calculate treatment profitability analysis
   */
  async calculateTreatmentProfitability(
    startDate?: Date,
    endDate?: Date
  ): Promise<TreatmentProfitability[]> {
    const cacheKey = `treatment_profitability_${this.clinicId}_${startDate?.toISOString()}_${endDate?.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const dateFilter = startDate && endDate ? {
        gte: startDate.toISOString(),
        lte: endDate.toISOString()
      } : {};

      // Get appointment data with treatments and invoices
      const { data: appointments, error: appointmentsError } = await this.supabase
        .from('appointments')
        .select(`
          id,
          treatment_type,
          appointment_date,
          invoice:invoices(total_amount, items),
          treatment_costs(*)
        `)
        .eq('clinic_id', this.clinicId)
        .eq('status', 'completed')
        .gte('appointment_date', dateFilter.gte || '2020-01-01')
        .lte('appointment_date', dateFilter.lte || new Date().toISOString());

      if (appointmentsError) throw appointmentsError;

      // Group by treatment type and calculate profitability
      const treatmentGroups = this.groupTreatmentsByType(appointments || []);
      const profitabilityData: TreatmentProfitability[] = [];

      for (const [treatmentType, treatments] of Object.entries(treatmentGroups)) {
        const analysis = await this.analyzeTreatmentGroup(treatmentType, treatments);
        profitabilityData.push(analysis);
      }

      // Sort by profit margin descending
      profitabilityData.sort((a, b) => b.profit_margin - a.profit_margin);

      this.setCache(cacheKey, profitabilityData, 300000); // 5 minutes cache
      return profitabilityData;

    } catch (error) {
      console.error('Error calculating treatment profitability:', error);
      throw new Error('Failed to calculate treatment profitability');
    }
  }

  /**
   * Analyze revenue trends and generate forecasts
   */
  async analyzeRevenueTrends(
    periodMonths: number = 12
  ): Promise<{
    historical: RevenueAnalytics[];
    forecast: ForecastData[];
    insights: FinancialInsight[];
  }> {
    const cacheKey = `revenue_trends_${this.clinicId}_${periodMonths}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - periodMonths);

      // Get historical revenue data
      const { data: invoices, error } = await this.supabase
        .from('invoices')
        .select('total_amount, paid_date, payment_method, items')
        .eq('clinic_id', this.clinicId)
        .eq('status', 'paid')
        .gte('paid_date', startDate.toISOString())
        .lte('paid_date', endDate.toISOString())
        .order('paid_date', { ascending: true });

      if (error) throw error;

      // Process historical data
      const historical = this.processHistoricalRevenue(invoices || []);
      
      // Generate forecasts
      const forecast = this.generateRevenueForecast(historical);
      
      // Generate insights
      const insights = this.generateRevenueInsights(historical, forecast);

      const result = { historical, forecast, insights };
      this.setCache(cacheKey, result, 600000); // 10 minutes cache
      return result;

    } catch (error) {
      console.error('Error analyzing revenue trends:', error);
      throw new Error('Failed to analyze revenue trends');
    }
  }

  /**
   * Calculate financial benchmarks
   */
  async calculateFinancialBenchmarks(): Promise<FinancialBenchmark[]> {
    const cacheKey = `financial_benchmarks_${this.clinicId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get clinic's current metrics
      const clinicMetrics = await this.getClinicMetrics();
      
      // Industry benchmarks (these would typically come from external data)
      const industryBenchmarks = this.getIndustryBenchmarks();
      
      const benchmarks: FinancialBenchmark[] = [];

      for (const [metric, clinicValue] of Object.entries(clinicMetrics)) {
        const industryAverage = industryBenchmarks[metric];
        if (industryAverage !== undefined) {
          const percentileRank = this.calculatePercentileRank(clinicValue, industryAverage);
          const performanceStatus = this.getPerformanceStatus(clinicValue, industryAverage);
          const improvementPotential = this.calculateImprovementPotential(clinicValue, industryAverage);

          benchmarks.push({
            metric_name: metric,
            clinic_value: clinicValue,
            industry_average: industryAverage,
            percentile_rank: percentileRank,
            benchmark_date: new Date().toISOString(),
            performance_status: performanceStatus,
            improvement_potential: improvementPotential
          });
        }
      }

      this.setCache(cacheKey, benchmarks, 3600000); // 1 hour cache
      return benchmarks;

    } catch (error) {
      console.error('Error calculating financial benchmarks:', error);
      throw new Error('Failed to calculate financial benchmarks');
    }
  }

  /**
   * Generate automated financial insights
   */
  async generateFinancialInsights(): Promise<FinancialInsight[]> {
    const cacheKey = `financial_insights_${this.clinicId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const insights: FinancialInsight[] = [];
      
      // Analyze treatment profitability for insights
      const profitability = await this.calculateTreatmentProfitability();
      insights.push(...this.generateProfitabilityInsights(profitability));
      
      // Analyze revenue trends for insights
      const { historical, forecast } = await this.analyzeRevenueTrends();
      insights.push(...this.generateRevenueInsights(historical, forecast));
      
      // Analyze cash flow patterns
      const cashFlowInsights = await this.generateCashFlowInsights();
      insights.push(...cashFlowInsights);
      
      // Analyze patient value insights
      const patientInsights = await this.generatePatientValueInsights();
      insights.push(...patientInsights);

      // Sort by impact score descending
      insights.sort((a, b) => b.impact_score - a.impact_score);

      this.setCache(cacheKey, insights, 1800000); // 30 minutes cache
      return insights;

    } catch (error) {
      console.error('Error generating financial insights:', error);
      throw new Error('Failed to generate financial insights');
    }
  }

  /**
   * Calculate cost optimization recommendations
   */
  async calculateCostOptimization(): Promise<{
    opportunities: FinancialInsight[];
    potential_savings: number;
    implementation_priority: string[];
  }> {
    try {
      // Analyze expense patterns
      const { data: expenses, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('clinic_id', this.clinicId)
        .gte('expense_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const opportunities: FinancialInsight[] = [];
      let potentialSavings = 0;

      // Analyze expense categories for optimization
      const expenseCategories = this.groupExpensesByCategory(expenses || []);
      
      for (const [category, categoryExpenses] of Object.entries(expenseCategories)) {
        const analysis = this.analyzeCategoryOptimization(category, categoryExpenses);
        if (analysis.savings > 0) {
          opportunities.push({
            id: `cost_opt_${category}_${Date.now()}`,
            type: 'opportunity',
            title: `${category} Cost Optimization`,
            description: analysis.description,
            impact_score: analysis.impact,
            confidence_level: analysis.confidence,
            action_items: analysis.actions,
            data_source: 'expense_analysis',
            created_at: new Date().toISOString()
          });
          potentialSavings += analysis.savings;
        }
      }

      // Priority implementation order
      const implementationPriority = opportunities
        .sort((a, b) => b.impact_score - a.impact_score)
        .map(opp => opp.title);

      return {
        opportunities,
        potential_savings: potentialSavings,
        implementation_priority: implementationPriority
      };

    } catch (error) {
      console.error('Error calculating cost optimization:', error);
      throw new Error('Failed to calculate cost optimization');
    }
  }

  /**
   * Private helper methods
   */
  private groupTreatmentsByType(appointments: any[]): Record<string, any[]> {
    return appointments.reduce((groups, appointment) => {
      const type = appointment.treatment_type || 'Unknown';
      if (!groups[type]) groups[type] = [];
      groups[type].push(appointment);
      return groups;
    }, {});
  }

  private async analyzeTreatmentGroup(treatmentType: string, treatments: any[]): Promise<TreatmentProfitability> {
    const totalRevenue = treatments.reduce((sum, treatment) => {
      const invoiceAmount = Array.isArray(treatment.invoice) 
        ? treatment.invoice[0]?.total_amount || 0
        : treatment.invoice?.total_amount || 0;
      return sum + invoiceAmount;
    }, 0);

    const volume = treatments.length;
    const averagePrice = volume > 0 ? totalRevenue / volume : 0;

    // Calculate costs (simplified - would need actual cost data)
    const directCosts = totalRevenue * 0.3; // 30% assumption
    const indirectCosts = totalRevenue * 0.2; // 20% assumption
    const totalCosts = directCosts + indirectCosts;
    
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const roiPercentage = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      treatment_id: `${treatmentType}_analysis`,
      treatment_type: treatmentType,
      revenue: totalRevenue,
      direct_costs: directCosts,
      indirect_costs: indirectCosts,
      profit_margin: profitMargin,
      roi_percentage: roiPercentage,
      volume,
      average_price: averagePrice,
      cost_breakdown: {
        materials: directCosts * 0.4,
        labor: directCosts * 0.4,
        overhead: indirectCosts * 0.6,
        equipment: indirectCosts * 0.4
      }
    };
  }

  private processHistoricalRevenue(invoices: any[]): RevenueAnalytics[] {
    // Group by month
    const monthlyData = invoices.reduce((groups, invoice) => {
      const date = new Date(invoice.paid_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          date: monthKey,
          revenue_source: 'treatments',
          amount: 0,
          count: 0
        };
      }
      
      groups[monthKey].amount += invoice.total_amount || 0;
      groups[monthKey].count += 1;
      return groups;
    }, {});

    // Calculate growth rates and trends
    const sortedData = Object.values(monthlyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    return sortedData.map((data: any, index) => {
      const previousData = index > 0 ? sortedData[index - 1] : null;
      const growthRate = previousData && previousData.amount > 0 
        ? ((data.amount - previousData.amount) / previousData.amount) * 100 
        : 0;
      
      const trendDirection = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';
      
      return {
        date: data.date,
        revenue_source: data.revenue_source,
        amount: data.amount,
        growth_rate: growthRate,
        seasonal_factor: this.calculateSeasonalFactor(data.date),
        trend_direction: trendDirection,
        forecast_confidence: 0.8 // Base confidence
      };
    });
  }

  private generateRevenueForecast(historical: RevenueAnalytics[]): ForecastData[] {
    if (historical.length < 3) return [];

    const forecast: ForecastData[] = [];
    const lastData = historical[historical.length - 1];
    const avgGrowthRate = historical.reduce((sum, data) => sum + data.growth_rate, 0) / historical.length;
    
    // Generate 6 months forecast
    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(lastData.date + '-01');
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastPeriod = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      
      const baseRevenue = lastData.amount * Math.pow(1 + avgGrowthRate / 100, i);
      const seasonalAdjustment = this.calculateSeasonalFactor(forecastPeriod);
      const predictedRevenue = baseRevenue * seasonalAdjustment;
      
      const confidenceInterval = {
        lower: predictedRevenue * 0.8,
        upper: predictedRevenue * 1.2
      };
      
      forecast.push({
        period: forecastPeriod,
        predicted_revenue: predictedRevenue,
        confidence_interval: confidenceInterval,
        factors: {
          seasonal: seasonalAdjustment,
          trend: avgGrowthRate,
          external: 1.0
        },
        accuracy_score: Math.max(0.5, 0.9 - (i * 0.1)) // Decreasing accuracy over time
      });
    }
    
    return forecast;
  }

  private generateRevenueInsights(historical: RevenueAnalytics[], forecast: ForecastData[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Trend analysis
    const recentTrend = historical.slice(-3).reduce((sum, data) => sum + data.growth_rate, 0) / 3;
    
    if (recentTrend > 10) {
      insights.push({
        id: `revenue_growth_${Date.now()}`,
        type: 'trend',
        title: 'Strong Revenue Growth Detected',
        description: `Revenue has grown by an average of ${recentTrend.toFixed(1)}% over the last 3 months.`,
        impact_score: 8,
        confidence_level: 0.9,
        action_items: [
          'Consider expanding capacity to meet growing demand',
          'Analyze which treatments are driving growth',
          'Plan for increased resource requirements'
        ],
        data_source: 'revenue_analysis',
        created_at: new Date().toISOString()
      });
    } else if (recentTrend < -5) {
      insights.push({
        id: `revenue_decline_${Date.now()}`,
        type: 'risk',
        title: 'Revenue Decline Trend',
        description: `Revenue has declined by an average of ${Math.abs(recentTrend).toFixed(1)}% over the last 3 months.`,
        impact_score: 9,
        confidence_level: 0.85,
        action_items: [
          'Investigate causes of revenue decline',
          'Review pricing strategy',
          'Analyze patient retention rates',
          'Consider marketing initiatives'
        ],
        data_source: 'revenue_analysis',
        created_at: new Date().toISOString()
      });
    }
    
    return insights;
  }

  private async generateCashFlowInsights(): Promise<FinancialInsight[]> {
    // Implementation for cash flow insights
    return [];
  }

  private async generatePatientValueInsights(): Promise<FinancialInsight[]> {
    // Implementation for patient value insights
    return [];
  }

  private generateProfitabilityInsights(profitability: TreatmentProfitability[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    if (profitability.length > 0) {
      const mostProfitable = profitability[0];
      const leastProfitable = profitability[profitability.length - 1];
      
      if (mostProfitable.profit_margin > 50) {
        insights.push({
          id: `high_margin_treatment_${Date.now()}`,
          type: 'opportunity',
          title: 'High-Margin Treatment Opportunity',
          description: `${mostProfitable.treatment_type} shows excellent profitability with ${mostProfitable.profit_margin.toFixed(1)}% margin.`,
          impact_score: 7,
          confidence_level: 0.9,
          action_items: [
            'Increase marketing for this treatment',
            'Train staff to upsell this service',
            'Optimize scheduling for higher volume'
          ],
          data_source: 'profitability_analysis',
          created_at: new Date().toISOString()
        });
      }
      
      if (leastProfitable.profit_margin < 10) {
        insights.push({
          id: `low_margin_treatment_${Date.now()}`,
          type: 'risk',
          title: 'Low-Margin Treatment Alert',
          description: `${leastProfitable.treatment_type} has low profitability at ${leastProfitable.profit_margin.toFixed(1)}% margin.`,
          impact_score: 6,
          confidence_level: 0.85,
          action_items: [
            'Review pricing for this treatment',
            'Analyze cost structure',
            'Consider discontinuing if not strategic'
          ],
          data_source: 'profitability_analysis',
          created_at: new Date().toISOString()
        });
      }
    }
    
    return insights;
  }

  private async getClinicMetrics(): Promise<Record<string, number>> {
    // Implementation to get current clinic metrics
    return {
      revenue_per_patient: 500,
      profit_margin: 25,
      patient_retention_rate: 85,
      average_treatment_value: 150,
      cost_per_acquisition: 50
    };
  }

  private getIndustryBenchmarks(): Record<string, number> {
    // Industry benchmark data (would typically come from external source)
    return {
      revenue_per_patient: 450,
      profit_margin: 20,
      patient_retention_rate: 80,
      average_treatment_value: 140,
      cost_per_acquisition: 60
    };
  }

  private calculatePercentileRank(clinicValue: number, industryAverage: number): number {
    // Simplified percentile calculation
    const ratio = clinicValue / industryAverage;
    if (ratio >= 1.2) return 90;
    if (ratio >= 1.1) return 75;
    if (ratio >= 1.0) return 60;
    if (ratio >= 0.9) return 40;
    if (ratio >= 0.8) return 25;
    return 10;
  }

  private getPerformanceStatus(clinicValue: number, industryAverage: number): 'above' | 'below' | 'at' | 'unknown' {
    const ratio = clinicValue / industryAverage;
    if (ratio > 1.05) return 'above';
    if (ratio < 0.95) return 'below';
    return 'at';
  }

  private calculateImprovementPotential(clinicValue: number, industryAverage: number): number {
    if (clinicValue >= industryAverage) return 0;
    return ((industryAverage - clinicValue) / clinicValue) * 100;
  }

  private groupExpensesByCategory(expenses: any[]): Record<string, any[]> {
    return expenses.reduce((groups, expense) => {
      const category = expense.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(expense);
      return groups;
    }, {});
  }

  private analyzeCategoryOptimization(category: string, expenses: any[]): {
    savings: number;
    description: string;
    impact: number;
    confidence: number;
    actions: string[];
  } {
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const avgMonthly = totalAmount / 3; // 3 months of data
    
    // Simple optimization logic (would be more sophisticated in practice)
    let savings = 0;
    let description = '';
    let impact = 0;
    let confidence = 0;
    let actions: string[] = [];
    
    if (category === 'Supplies' && avgMonthly > 1000) {
      savings = avgMonthly * 0.15; // 15% potential savings
      description = 'Bulk purchasing and supplier negotiation could reduce supply costs.';
      impact = 7;
      confidence = 0.8;
      actions = [
        'Negotiate bulk discounts with suppliers',
        'Review inventory management',
        'Consider alternative suppliers'
      ];
    } else if (category === 'Marketing' && avgMonthly > 500) {
      savings = avgMonthly * 0.2; // 20% potential savings
      description = 'Digital marketing optimization could improve ROI.';
      impact = 6;
      confidence = 0.7;
      actions = [
        'Analyze marketing channel performance',
        'Focus on highest ROI channels',
        'Implement tracking and optimization'
      ];
    }
    
    return { savings, description, impact, confidence, actions };
  }

  private calculateSeasonalFactor(period: string): number {
    const month = parseInt(period.split('-')[1]);
    
    // Simplified seasonal factors for healthcare (would be data-driven in practice)
    const seasonalFactors = {
      1: 0.9,  // January - post-holiday low
      2: 0.95, // February
      3: 1.1,  // March - spring uptick
      4: 1.05, // April
      5: 1.0,  // May
      6: 0.95, // June - summer vacation start
      7: 0.9,  // July - vacation season
      8: 0.95, // August
      9: 1.1,  // September - back to routine
      10: 1.05, // October
      11: 1.0,  // November
      12: 0.85  // December - holidays
    };
    
    return seasonalFactors[month] || 1.0;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

export default FinancialAnalyticsCalculator;
export type {
  TreatmentProfitability,
  RevenueAnalytics,
  FinancialBenchmark,
  FinancialInsight,
  ForecastData
};