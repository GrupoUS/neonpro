// Revenue & Profitability Analytics Engine
// Epic 5, Story 5.1, Task 4: Revenue & Profitability Analysis
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import type { createClient } from "@/lib/supabase/client";
import type {
  RevenueAnalytics,
  ServiceProfitability,
  ProviderPerformance,
  PatientLifetimeValue,
  RevenueForecast,
  TimeSeriesData,
  SeasonalAnalysis,
  ProfitabilityMetrics,
} from "@/lib/types/financial-reporting";

export interface RevenueAnalysisFilters {
  clinicId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  serviceIds?: string[];
  providerIds?: string[];
  locationIds?: string[];
  includeForecasting?: boolean;
}

export interface ServiceRevenueData {
  serviceId: string;
  serviceName: string;
  category: string;
  totalRevenue: number;
  transactionCount: number;
  averageValue: number;
  costAllocation: number;
  profitMargin: number;
  growthRate: number;
  seasonalIndex: number;
}

export interface ProviderRevenueData {
  providerId: string;
  providerName: string;
  specialization: string;
  totalRevenue: number;
  patientCount: number;
  averageRevenuePerPatient: number;
  utilizationRate: number;
  conversionRate: number;
  growthTrend: number;
}

export interface PatientLTVData {
  patientId: string;
  totalLifetimeValue: number;
  averageVisitValue: number;
  visitFrequency: number;
  retentionRate: number;
  churnRisk: number;
  nextVisitProbability: number;
  recommendedActions: string[];
}

export class RevenueAnalyticsEngine {
  private supabase = createClient();

  // =====================================================================================
  // SERVICE-BASED REVENUE ANALYSIS
  // =====================================================================================

  /**
   * Analyze revenue by service type and category with profitability metrics
   */
  async analyzeRevenueByService(filters: RevenueAnalysisFilters): Promise<ServiceRevenueData[]> {
    const { clinicId, dateRange, serviceIds } = filters;

    // Fetch service revenue data with cost allocation
    const { data: serviceData, error } = await this.supabase.rpc("analyze_service_revenue", {
      p_clinic_id: clinicId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
      p_service_ids: serviceIds || null,
    });

    if (error) throw new Error(`Service revenue analysis failed: ${error.message}`);

    // Calculate profitability metrics for each service
    const enrichedData = await Promise.all(
      serviceData.map(async (service: any) => {
        const costAllocation = await this.calculateServiceCostAllocation(
          service.service_id,
          dateRange,
        );
        const seasonalIndex = await this.calculateSeasonalIndex(service.service_id, dateRange);
        const growthRate = await this.calculateGrowthRate(service.service_id, dateRange);

        return {
          serviceId: service.service_id,
          serviceName: service.service_name,
          category: service.category,
          totalRevenue: parseFloat(service.total_revenue),
          transactionCount: parseInt(service.transaction_count),
          averageValue: parseFloat(service.average_value),
          costAllocation,
          profitMargin:
            ((parseFloat(service.total_revenue) - costAllocation) /
              parseFloat(service.total_revenue)) *
            100,
          growthRate,
          seasonalIndex,
        };
      }),
    );

    return enrichedData.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Calculate service profitability with cost allocation
   */
  async calculateServiceProfitability(
    serviceId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<ServiceProfitability> {
    // Get direct costs (provider time, materials, equipment usage)
    const { data: directCosts } = await this.supabase
      .from("service_costs")
      .select("*")
      .eq("service_id", serviceId)
      .gte("allocated_date", dateRange.start.toISOString())
      .lte("allocated_date", dateRange.end.toISOString());

    // Get indirect costs (overhead allocation based on service utilization)
    const { data: overheadData } = await this.supabase.rpc("calculate_overhead_allocation", {
      p_service_id: serviceId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    const directCostTotal =
      directCosts?.reduce((sum, cost) => sum + parseFloat(cost.amount), 0) || 0;
    const overheadCost = overheadData?.[0]?.overhead_allocation || 0;
    const totalCost = directCostTotal + overheadCost;

    // Get revenue for the service
    const { data: revenueData } = await this.supabase.rpc("get_service_revenue", {
      p_service_id: serviceId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    const totalRevenue = revenueData?.[0]?.total_revenue || 0;
    const grossProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      serviceId,
      totalRevenue,
      directCosts: directCostTotal,
      overheadCosts: overheadCost,
      totalCosts: totalCost,
      grossProfit,
      marginPercent,
      breakEvenVolume:
        totalCost > 0
          ? Math.ceil(totalCost / (totalRevenue / (revenueData?.[0]?.transaction_count || 1)))
          : 0,
    };
  }

  // =====================================================================================
  // PROVIDER PERFORMANCE ANALYTICS
  // =====================================================================================

  /**
   * Analyze provider performance and revenue contribution
   */
  async analyzeProviderPerformance(
    filters: RevenueAnalysisFilters,
  ): Promise<ProviderRevenueData[]> {
    const { clinicId, dateRange, providerIds } = filters;

    const { data: providerData, error } = await this.supabase.rpc("analyze_provider_revenue", {
      p_clinic_id: clinicId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
      p_provider_ids: providerIds || null,
    });

    if (error) throw new Error(`Provider performance analysis failed: ${error.message}`);

    // Enrich with additional metrics
    const enrichedData = await Promise.all(
      providerData.map(async (provider: any) => {
        const utilizationRate = await this.calculateProviderUtilization(
          provider.provider_id,
          dateRange,
        );
        const conversionRate = await this.calculateProviderConversionRate(
          provider.provider_id,
          dateRange,
        );
        const growthTrend = await this.calculateProviderGrowthTrend(
          provider.provider_id,
          dateRange,
        );

        return {
          providerId: provider.provider_id,
          providerName: provider.provider_name,
          specialization: provider.specialization,
          totalRevenue: parseFloat(provider.total_revenue),
          patientCount: parseInt(provider.patient_count),
          averageRevenuePerPatient: parseFloat(provider.avg_revenue_per_patient),
          utilizationRate,
          conversionRate,
          growthTrend,
        };
      }),
    );

    return enrichedData.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Calculate provider utilization rate (booked time vs available time)
   */
  private async calculateProviderUtilization(
    providerId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<number> {
    const { data: utilizationData } = await this.supabase.rpc("calculate_provider_utilization", {
      p_provider_id: providerId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    return utilizationData?.[0]?.utilization_rate || 0;
  }

  /**
   * Calculate provider conversion rate (appointments to completed treatments)
   */
  private async calculateProviderConversionRate(
    providerId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<number> {
    const { data: conversionData } = await this.supabase.rpc("calculate_provider_conversion", {
      p_provider_id: providerId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    return conversionData?.[0]?.conversion_rate || 0;
  }

  // =====================================================================================
  // TIME-PERIOD ANALYSIS & SEASONAL PATTERNS
  // =====================================================================================

  /**
   * Generate time-period revenue comparison with seasonal analysis
   */
  async generateTimePeriodAnalysis(
    clinicId: string,
    currentPeriod: { start: Date; end: Date },
    comparisonType: "previous_period" | "same_period_last_year" | "rolling_average",
  ): Promise<TimeSeriesData[]> {
    const { data: timeSeriesData, error } = await this.supabase.rpc(
      "generate_time_series_analysis",
      {
        p_clinic_id: clinicId,
        p_current_start: currentPeriod.start.toISOString(),
        p_current_end: currentPeriod.end.toISOString(),
        p_comparison_type: comparisonType,
      },
    );

    if (error) throw new Error(`Time series analysis failed: ${error.message}`);

    return timeSeriesData.map((period: any) => ({
      period: period.period,
      revenue: parseFloat(period.revenue),
      transactions: parseInt(period.transactions),
      averageValue: parseFloat(period.average_value),
      growthRate: parseFloat(period.growth_rate),
      seasonalIndex: parseFloat(period.seasonal_index),
      trendDirection: period.trend_direction,
    }));
  }

  /**
   * Calculate seasonal index for demand patterns
   */
  private async calculateSeasonalIndex(
    serviceId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<number> {
    const { data: seasonalData } = await this.supabase.rpc("calculate_seasonal_index", {
      p_service_id: serviceId,
      p_date_range_start: dateRange.start.toISOString(),
      p_date_range_end: dateRange.end.toISOString(),
    });

    return seasonalData?.[0]?.seasonal_index || 1.0;
  }

  // =====================================================================================
  // PATIENT LIFETIME VALUE ANALYTICS
  // =====================================================================================

  /**
   * Calculate patient lifetime value and retention metrics
   */
  async calculatePatientLifetimeValue(
    clinicId: string,
    patientIds?: string[],
  ): Promise<PatientLTVData[]> {
    const { data: ltvData, error } = await this.supabase.rpc("calculate_patient_ltv", {
      p_clinic_id: clinicId,
      p_patient_ids: patientIds || null,
    });

    if (error) throw new Error(`Patient LTV calculation failed: ${error.message}`);

    return ltvData.map((patient: any) => ({
      patientId: patient.patient_id,
      totalLifetimeValue: parseFloat(patient.total_ltv),
      averageVisitValue: parseFloat(patient.avg_visit_value),
      visitFrequency: parseFloat(patient.visit_frequency),
      retentionRate: parseFloat(patient.retention_rate),
      churnRisk: parseFloat(patient.churn_risk),
      nextVisitProbability: parseFloat(patient.next_visit_probability),
      recommendedActions: this.generatePatientRecommendations(patient),
    }));
  }

  /**
   * Generate recommendations based on patient behavior patterns
   */
  private generatePatientRecommendations(patientData: any): string[] {
    const recommendations: string[] = [];

    if (patientData.churn_risk > 0.7) {
      recommendations.push("High churn risk - Schedule follow-up call");
      recommendations.push("Offer loyalty program or discount");
    }

    if (patientData.visit_frequency < 2) {
      recommendations.push("Low engagement - Send health education content");
      recommendations.push("Schedule preventive care reminders");
    }

    if (patientData.avg_visit_value > patientData.clinic_average * 1.5) {
      recommendations.push("High-value patient - Prioritize premium services");
      recommendations.push("Invite to VIP program");
    }

    return recommendations;
  }

  // =====================================================================================
  // REVENUE FORECASTING & GROWTH ANALYSIS
  // =====================================================================================

  /**
   * Generate revenue forecasting based on historical patterns
   */
  async generateRevenueForecast(
    clinicId: string,
    forecastPeriods: number = 12,
    forecastType: "linear" | "seasonal" | "ml_enhanced" = "seasonal",
  ): Promise<RevenueForecast[]> {
    const { data: forecastData, error } = await this.supabase.rpc("generate_revenue_forecast", {
      p_clinic_id: clinicId,
      p_forecast_periods: forecastPeriods,
      p_forecast_type: forecastType,
    });

    if (error) throw new Error(`Revenue forecasting failed: ${error.message}`);

    return forecastData.map((forecast: any) => ({
      period: forecast.period,
      forecastedRevenue: parseFloat(forecast.forecasted_revenue),
      confidenceInterval: {
        lower: parseFloat(forecast.confidence_lower),
        upper: parseFloat(forecast.confidence_upper),
      },
      trend: forecast.trend,
      seasonalFactor: parseFloat(forecast.seasonal_factor),
      growthRate: parseFloat(forecast.growth_rate),
    }));
  }

  /**
   * Calculate growth rate for services/providers
   */
  private async calculateGrowthRate(
    entityId: string,
    dateRange: { start: Date; end: Date },
    entityType: "service" | "provider" = "service",
  ): Promise<number> {
    const { data: growthData } = await this.supabase.rpc("calculate_growth_rate", {
      p_entity_id: entityId,
      p_entity_type: entityType,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    return growthData?.[0]?.growth_rate || 0;
  }

  private async calculateProviderGrowthTrend(
    providerId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<number> {
    return this.calculateGrowthRate(providerId, dateRange, "provider");
  }

  // =====================================================================================
  // COST ALLOCATION & PROFITABILITY HELPERS
  // =====================================================================================

  /**
   * Calculate service cost allocation (direct + overhead)
   */
  private async calculateServiceCostAllocation(
    serviceId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<number> {
    const { data: costData } = await this.supabase.rpc("calculate_service_cost_allocation", {
      p_service_id: serviceId,
      p_start_date: dateRange.start.toISOString(),
      p_end_date: dateRange.end.toISOString(),
    });

    return costData?.[0]?.total_allocated_cost || 0;
  }

  // =====================================================================================
  // AGGREGATED ANALYTICS DASHBOARD DATA
  // =====================================================================================

  /**
   * Get comprehensive revenue analytics for dashboard
   */
  async getRevenueAnalyticsDashboard(
    clinicId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<RevenueAnalytics> {
    const [serviceRevenue, providerPerformance, timeSeries, topPatients, forecast] =
      await Promise.all([
        this.analyzeRevenueByService({ clinicId, dateRange }),
        this.analyzeProviderPerformance({ clinicId, dateRange }),
        this.generateTimePeriodAnalysis(clinicId, dateRange, "previous_period"),
        this.calculatePatientLifetimeValue(clinicId),
        this.generateRevenueForecast(clinicId, 6),
      ]);

    return {
      serviceBreakdown: serviceRevenue,
      providerPerformance: providerPerformance,
      timeSeriesData: timeSeries,
      topPatientsByLTV: topPatients.slice(0, 10),
      revenueForecast: forecast,
      summary: {
        totalRevenue: serviceRevenue.reduce((sum, s) => sum + s.totalRevenue, 0),
        averageProfitMargin:
          serviceRevenue.reduce((sum, s) => sum + s.profitMargin, 0) / serviceRevenue.length,
        topServiceRevenue: serviceRevenue[0]?.totalRevenue || 0,
        topProviderRevenue: providerPerformance[0]?.totalRevenue || 0,
        growthRate: timeSeries[timeSeries.length - 1]?.growthRate || 0,
      },
    };
  }
}
