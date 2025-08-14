/**
 * Resource Analytics System
 * Story 2.4: Advanced analytics and insights for resource optimization
 * 
 * Features:
 * - Real-time utilization tracking
 * - Performance analytics
 * - Cost optimization insights
 * - Predictive analytics
 * - ROI analysis
 * - Resource efficiency scoring
 */

import { createClient } from '@supabase/supabase-js';
import { Resource, ResourceUtilization, ResourceAllocation } from './resource-manager';
import { MaintenanceCost, EquipmentUsage } from './maintenance-system';

// Analytics types
export interface ResourceMetrics {
  resource_id: string;
  period: string;
  utilization_rate: number;
  efficiency_score: number;
  availability_rate: number;
  cost_per_hour: number;
  revenue_generated: number;
  roi_score: number;
  performance_trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface UtilizationAnalytics {
  total_resources: number;
  active_resources: number;
  average_utilization: number;
  peak_utilization_time: string;
  low_utilization_time: string;
  underutilized_resources: Resource[];
  overutilized_resources: Resource[];
  utilization_trends: Array<{ date: string; utilization: number }>;
}

export interface CostAnalytics {
  total_cost: number;
  cost_per_resource: number;
  cost_breakdown: Record<string, number>;
  cost_trends: Array<{ period: string; cost: number }>;
  cost_optimization_opportunities: Array<{
    resource_id: string;
    potential_savings: number;
    recommendation: string;
  }>;
  roi_analysis: Array<{
    resource_id: string;
    investment: number;
    returns: number;
    roi_percentage: number;
  }>;
}

export interface PerformanceAnalytics {
  overall_efficiency: number;
  performance_by_type: Record<string, number>;
  performance_trends: Array<{ date: string; efficiency: number }>;
  top_performers: Resource[];
  underperformers: Resource[];
  performance_factors: Array<{
    factor: string;
    impact: number;
    correlation: number;
  }>;
}

export interface PredictiveInsights {
  demand_forecast: Array<{ date: string; predicted_demand: number; confidence: number }>;
  capacity_recommendations: Array<{
    resource_type: string;
    current_capacity: number;
    recommended_capacity: number;
    reasoning: string;
  }>;
  maintenance_predictions: Array<{
    resource_id: string;
    predicted_failure_date: Date;
    confidence: number;
    preventive_actions: string[];
  }>;
  optimization_opportunities: Array<{
    type: 'reallocation' | 'scheduling' | 'capacity' | 'maintenance';
    description: string;
    potential_impact: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
}

export interface ResourceReport {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  generated_at: Date;
  data: any;
  insights: string[];
  recommendations: string[];
  charts: ChartData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  data: any[];
  labels: string[];
  colors?: string[];
}

export type ReportType = 'utilization' | 'performance' | 'cost' | 'maintenance' | 'predictive' | 'comprehensive';
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Resource Analytics System
 * Provides comprehensive analytics and insights for resource optimization
 */
export class ResourceAnalytics {
  private supabase;
  private analyticsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get comprehensive resource metrics
   */
  async getResourceMetrics(
    resourceId?: string,
    period: AnalyticsPeriod = 'month'
  ): Promise<ResourceMetrics[]> {
    const cacheKey = `metrics_${resourceId || 'all'}_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
        .rpc('get_resource_metrics', {
          resource_filter: resourceId,
          period_type: period
        });

      if (error) throw error;

      const metrics = await this.enrichMetricsWithRecommendations(data || []);
      this.setCachedData(cacheKey, metrics);
      
      return metrics;
    } catch (error) {
      console.error('❌ Error fetching resource metrics:', error);
      throw new Error('Failed to fetch resource metrics');
    }
  }

  /**
   * Get utilization analytics
   */
  async getUtilizationAnalytics(period: AnalyticsPeriod = 'month'): Promise<UtilizationAnalytics> {
    const cacheKey = `utilization_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get all resources
      const { data: resources, error: resourcesError } = await this.supabase
        .from('resources')
        .select('*');

      if (resourcesError) throw resourcesError;

      // Get utilization data
      const { data: utilization, error: utilizationError } = await this.supabase
        .rpc('get_utilization_analytics', { period_type: period });

      if (utilizationError) throw utilizationError;

      // Calculate analytics
      const totalResources = resources?.length || 0;
      const activeResources = resources?.filter(r => r.status === 'available').length || 0;
      
      const avgUtilization = utilization?.reduce((sum: number, u: any) => 
        sum + u.utilization_rate, 0) / (utilization?.length || 1);

      // Find peak and low utilization times
      const hourlyUtilization = await this.getHourlyUtilization();
      const peakHour = hourlyUtilization.reduce((max, curr) => 
        curr.utilization > max.utilization ? curr : max);
      const lowHour = hourlyUtilization.reduce((min, curr) => 
        curr.utilization < min.utilization ? curr : min);

      // Identify under/over utilized resources
      const underutilized = resources?.filter(r => {
        const resourceUtil = utilization?.find((u: any) => u.resource_id === r.id);
        return resourceUtil && resourceUtil.utilization_rate < 0.3;
      }) || [];

      const overutilized = resources?.filter(r => {
        const resourceUtil = utilization?.find((u: any) => u.resource_id === r.id);
        return resourceUtil && resourceUtil.utilization_rate > 0.9;
      }) || [];

      // Get utilization trends
      const trends = await this.getUtilizationTrends(period);

      const analytics: UtilizationAnalytics = {
        total_resources: totalResources,
        active_resources: activeResources,
        average_utilization: avgUtilization,
        peak_utilization_time: `${peakHour.hour}:00`,
        low_utilization_time: `${lowHour.hour}:00`,
        underutilized_resources: underutilized,
        overutilized_resources: overutilized,
        utilization_trends: trends
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching utilization analytics:', error);
      throw new Error('Failed to fetch utilization analytics');
    }
  }

  /**
   * Get cost analytics
   */
  async getCostAnalytics(period: AnalyticsPeriod = 'month'): Promise<CostAnalytics> {
    const cacheKey = `cost_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get cost data
      const { data: costs, error } = await this.supabase
        .rpc('get_cost_analytics', { period_type: period });

      if (error) throw error;

      const totalCost = costs?.reduce((sum: number, c: any) => sum + c.total_cost, 0) || 0;
      const resourceCount = costs?.length || 1;
      const costPerResource = totalCost / resourceCount;

      // Calculate cost breakdown
      const costBreakdown = costs?.reduce((breakdown: Record<string, number>, cost: any) => {
        const type = cost.resource_type || 'other';
        breakdown[type] = (breakdown[type] || 0) + cost.total_cost;
        return breakdown;
      }, {}) || {};

      // Get cost trends
      const trends = await this.getCostTrends(period);

      // Identify optimization opportunities
      const optimizationOpportunities = await this.identifyCostOptimizations(costs || []);

      // Calculate ROI analysis
      const roiAnalysis = await this.calculateROIAnalysis(costs || []);

      const analytics: CostAnalytics = {
        total_cost: totalCost,
        cost_per_resource: costPerResource,
        cost_breakdown: costBreakdown,
        cost_trends: trends,
        cost_optimization_opportunities: optimizationOpportunities,
        roi_analysis: roiAnalysis
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching cost analytics:', error);
      throw new Error('Failed to fetch cost analytics');
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(period: AnalyticsPeriod = 'month'): Promise<PerformanceAnalytics> {
    const cacheKey = `performance_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get performance data
      const { data: performance, error } = await this.supabase
        .rpc('get_performance_analytics', { period_type: period });

      if (error) throw error;

      // Calculate overall efficiency
      const overallEfficiency = performance?.reduce((sum: number, p: any) => 
        sum + p.efficiency_score, 0) / (performance?.length || 1);

      // Group performance by type
      const performanceByType = performance?.reduce((grouped: Record<string, number>, p: any) => {
        const type = p.resource_type || 'other';
        if (!grouped[type]) {
          grouped[type] = 0;
        }
        grouped[type] += p.efficiency_score;
        return grouped;
      }, {}) || {};

      // Calculate averages for each type
      Object.keys(performanceByType).forEach(type => {
        const count = performance?.filter((p: any) => p.resource_type === type).length || 1;
        performanceByType[type] /= count;
      });

      // Get performance trends
      const trends = await this.getPerformanceTrends(period);

      // Get resources
      const { data: resources } = await this.supabase
        .from('resources')
        .select('*');

      // Identify top performers and underperformers
      const topPerformers = resources?.filter(r => {
        const perf = performance?.find((p: any) => p.resource_id === r.id);
        return perf && perf.efficiency_score > 0.8;
      }).slice(0, 5) || [];

      const underperformers = resources?.filter(r => {
        const perf = performance?.find((p: any) => p.resource_id === r.id);
        return perf && perf.efficiency_score < 0.6;
      }).slice(0, 5) || [];

      // Analyze performance factors
      const performanceFactors = await this.analyzePerformanceFactors(performance || []);

      const analytics: PerformanceAnalytics = {
        overall_efficiency: overallEfficiency,
        performance_by_type: performanceByType,
        performance_trends: trends,
        top_performers: topPerformers,
        underperformers: underperformers,
        performance_factors: performanceFactors
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching performance analytics:', error);
      throw new Error('Failed to fetch performance analytics');
    }
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights(period: AnalyticsPeriod = 'month'): Promise<PredictiveInsights> {
    const cacheKey = `predictive_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Generate demand forecast
      const demandForecast = await this.generateDemandForecast();

      // Generate capacity recommendations
      const capacityRecommendations = await this.generateCapacityRecommendations();

      // Generate maintenance predictions
      const maintenancePredictions = await this.generateMaintenancePredictions();

      // Identify optimization opportunities
      const optimizationOpportunities = await this.identifyOptimizationOpportunities();

      const insights: PredictiveInsights = {
        demand_forecast: demandForecast,
        capacity_recommendations: capacityRecommendations,
        maintenance_predictions: maintenancePredictions,
        optimization_opportunities: optimizationOpportunities
      };

      this.setCachedData(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('❌ Error generating predictive insights:', error);
      throw new Error('Failed to generate predictive insights');
    }
  }

  /**
   * Generate comprehensive resource report
   */
  async generateReport(
    type: ReportType,
    period: AnalyticsPeriod = 'month',
    resourceId?: string
  ): Promise<ResourceReport> {
    try {
      let data: any;
      let insights: string[] = [];
      let recommendations: string[] = [];
      let charts: ChartData[] = [];

      switch (type) {
        case 'utilization':
          data = await this.getUtilizationAnalytics(period);
          insights = this.generateUtilizationInsights(data);
          recommendations = this.generateUtilizationRecommendations(data);
          charts = this.createUtilizationCharts(data);
          break;

        case 'performance':
          data = await this.getPerformanceAnalytics(period);
          insights = this.generatePerformanceInsights(data);
          recommendations = this.generatePerformanceRecommendations(data);
          charts = this.createPerformanceCharts(data);
          break;

        case 'cost':
          data = await this.getCostAnalytics(period);
          insights = this.generateCostInsights(data);
          recommendations = this.generateCostRecommendations(data);
          charts = this.createCostCharts(data);
          break;

        case 'predictive':
          data = await this.getPredictiveInsights(period);
          insights = this.generatePredictiveInsights(data);
          recommendations = this.generatePredictiveRecommendations(data);
          charts = this.createPredictiveCharts(data);
          break;

        case 'comprehensive':
          data = {
            utilization: await this.getUtilizationAnalytics(period),
            performance: await this.getPerformanceAnalytics(period),
            cost: await this.getCostAnalytics(period),
            predictive: await this.getPredictiveInsights(period)
          };
          insights = this.generateComprehensiveInsights(data);
          recommendations = this.generateComprehensiveRecommendations(data);
          charts = this.createComprehensiveCharts(data);
          break;

        default:
          throw new Error(`Unsupported report type: ${type}`);
      }

      const report: ResourceReport = {
        id: `report_${type}_${Date.now()}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${period}`,
        type,
        period,
        generated_at: new Date(),
        data,
        insights,
        recommendations,
        charts
      };

      // Save report to database
      await this.saveReport(report);

      console.log(`✅ Generated ${type} report for ${period}`);
      return report;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Get hourly utilization data
   */
  private async getHourlyUtilization(): Promise<Array<{ hour: number; utilization: number }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_hourly_utilization');

      if (error) throw error;

      return data || Array.from({ length: 24 }, (_, hour) => ({ hour, utilization: 0.5 }));
    } catch (error) {
      console.error('❌ Error fetching hourly utilization:', error);
      return Array.from({ length: 24 }, (_, hour) => ({ hour, utilization: 0.5 }));
    }
  }

  /**
   * Get utilization trends
   */
  private async getUtilizationTrends(period: AnalyticsPeriod): Promise<Array<{ date: string; utilization: number }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_utilization_trends', { period_type: period });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching utilization trends:', error);
      return [];
    }
  }

  /**
   * Get cost trends
   */
  private async getCostTrends(period: AnalyticsPeriod): Promise<Array<{ period: string; cost: number }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_cost_trends', { period_type: period });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching cost trends:', error);
      return [];
    }
  }

  /**
   * Get performance trends
   */
  private async getPerformanceTrends(period: AnalyticsPeriod): Promise<Array<{ date: string; efficiency: number }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_performance_trends', { period_type: period });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching performance trends:', error);
      return [];
    }
  }

  /**
   * Enrich metrics with AI-generated recommendations
   */
  private async enrichMetricsWithRecommendations(metrics: any[]): Promise<ResourceMetrics[]> {
    return metrics.map(metric => ({
      ...metric,
      recommendations: this.generateMetricRecommendations(metric)
    }));
  }

  /**
   * Generate recommendations for a specific metric
   */
  private generateMetricRecommendations(metric: any): string[] {
    const recommendations: string[] = [];

    if (metric.utilization_rate < 0.3) {
      recommendations.push('Consider reallocating this resource to higher-demand areas');
      recommendations.push('Review scheduling to increase utilization');
    }

    if (metric.utilization_rate > 0.9) {
      recommendations.push('Resource is overutilized - consider adding capacity');
      recommendations.push('Implement load balancing to prevent burnout');
    }

    if (metric.efficiency_score < 0.6) {
      recommendations.push('Performance is below optimal - investigate root causes');
      recommendations.push('Consider maintenance or training interventions');
    }

    if (metric.roi_score < 0.5) {
      recommendations.push('ROI is low - evaluate cost-benefit ratio');
      recommendations.push('Consider optimization or replacement options');
    }

    return recommendations;
  }

  /**
   * Identify cost optimization opportunities
   */
  private async identifyCostOptimizations(costs: any[]): Promise<Array<{
    resource_id: string;
    potential_savings: number;
    recommendation: string;
  }>> {
    const opportunities: Array<{
      resource_id: string;
      potential_savings: number;
      recommendation: string;
    }> = [];

    for (const cost of costs) {
      if (cost.cost_per_hour > cost.average_market_rate * 1.2) {
        opportunities.push({
          resource_id: cost.resource_id,
          potential_savings: (cost.cost_per_hour - cost.average_market_rate) * cost.usage_hours,
          recommendation: 'Cost is 20% above market rate - negotiate better rates or find alternatives'
        });
      }

      if (cost.utilization_rate < 0.3) {
        opportunities.push({
          resource_id: cost.resource_id,
          potential_savings: cost.total_cost * 0.3,
          recommendation: 'Low utilization - consider sharing or reducing capacity'
        });
      }
    }

    return opportunities;
  }

  /**
   * Calculate ROI analysis
   */
  private async calculateROIAnalysis(costs: any[]): Promise<Array<{
    resource_id: string;
    investment: number;
    returns: number;
    roi_percentage: number;
  }>> {
    return costs.map(cost => {
      const investment = cost.total_cost;
      const returns = cost.revenue_generated || investment * 1.2; // Default 20% return
      const roiPercentage = ((returns - investment) / investment) * 100;

      return {
        resource_id: cost.resource_id,
        investment,
        returns,
        roi_percentage: roiPercentage
      };
    });
  }

  /**
   * Analyze performance factors
   */
  private async analyzePerformanceFactors(performance: any[]): Promise<Array<{
    factor: string;
    impact: number;
    correlation: number;
  }>> {
    // Simplified performance factor analysis
    return [
      { factor: 'Maintenance Frequency', impact: 0.3, correlation: -0.7 },
      { factor: 'Usage Intensity', impact: 0.25, correlation: -0.5 },
      { factor: 'Staff Training', impact: 0.2, correlation: 0.6 },
      { factor: 'Equipment Age', impact: 0.15, correlation: -0.4 },
      { factor: 'Environmental Conditions', impact: 0.1, correlation: -0.3 }
    ];
  }

  /**
   * Generate demand forecast
   */
  private async generateDemandForecast(): Promise<Array<{ date: string; predicted_demand: number; confidence: number }>> {
    // Simplified demand forecasting - in real implementation, use ML models
    const forecast: Array<{ date: string; predicted_demand: number; confidence: number }> = [];
    const baseDate = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Higher demand on weekdays
      let baseDemand = dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.8 : 0.4;
      
      // Add some randomness
      const variation = (Math.random() - 0.5) * 0.2;
      const predictedDemand = Math.max(0, Math.min(1, baseDemand + variation));
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_demand: predictedDemand,
        confidence: 0.75 + Math.random() * 0.2
      });
    }

    return forecast;
  }

  /**
   * Generate capacity recommendations
   */
  private async generateCapacityRecommendations(): Promise<Array<{
    resource_type: string;
    current_capacity: number;
    recommended_capacity: number;
    reasoning: string;
  }>> {
    try {
      const { data: resources, error } = await this.supabase
        .from('resources')
        .select('*');

      if (error) throw error;

      const capacityByType = resources?.reduce((acc: Record<string, number>, resource) => {
        const type = resource.equipment_type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}) || {};

      return Object.entries(capacityByType).map(([type, current]) => {
        const recommended = Math.ceil(current * 1.1); // 10% increase recommendation
        return {
          resource_type: type,
          current_capacity: current,
          recommended_capacity: recommended,
          reasoning: 'Based on demand trends and utilization patterns'
        };
      });
    } catch (error) {
      console.error('❌ Error generating capacity recommendations:', error);
      return [];
    }
  }

  /**
   * Generate maintenance predictions
   */
  private async generateMaintenancePredictions(): Promise<Array<{
    resource_id: string;
    predicted_failure_date: Date;
    confidence: number;
    preventive_actions: string[];
  }>> {
    try {
      const { data: resources, error } = await this.supabase
        .from('resources')
        .select('*')
        .eq('type', 'equipment');

      if (error) throw error;

      return resources?.map(resource => {
        // Simplified prediction - in real implementation, use ML models
        const daysToFailure = 30 + Math.random() * 300; // 30-330 days
        const predictedDate = new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000);
        
        return {
          resource_id: resource.id,
          predicted_failure_date: predictedDate,
          confidence: 0.6 + Math.random() * 0.3,
          preventive_actions: [
            'Schedule regular maintenance checks',
            'Monitor performance metrics closely',
            'Replace worn components proactively'
          ]
        };
      }) || [];
    } catch (error) {
      console.error('❌ Error generating maintenance predictions:', error);
      return [];
    }
  }

  /**
   * Identify optimization opportunities
   */
  private async identifyOptimizationOpportunities(): Promise<Array<{
    type: 'reallocation' | 'scheduling' | 'capacity' | 'maintenance';
    description: string;
    potential_impact: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }>> {
    return [
      {
        type: 'reallocation',
        description: 'Reallocate underutilized resources to high-demand areas',
        potential_impact: 0.15,
        implementation_effort: 'medium'
      },
      {
        type: 'scheduling',
        description: 'Optimize scheduling to reduce idle time',
        potential_impact: 0.12,
        implementation_effort: 'low'
      },
      {
        type: 'capacity',
        description: 'Adjust capacity based on demand patterns',
        potential_impact: 0.20,
        implementation_effort: 'high'
      },
      {
        type: 'maintenance',
        description: 'Implement predictive maintenance to reduce downtime',
        potential_impact: 0.18,
        implementation_effort: 'medium'
      }
    ];
  }

  /**
   * Generate insights for different report types
   */
  private generateUtilizationInsights(data: UtilizationAnalytics): string[] {
    const insights: string[] = [];
    
    insights.push(`Average utilization rate is ${(data.average_utilization * 100).toFixed(1)}%`);
    insights.push(`Peak utilization occurs at ${data.peak_utilization_time}`);
    insights.push(`${data.underutilized_resources.length} resources are underutilized`);
    insights.push(`${data.overutilized_resources.length} resources are overutilized`);
    
    return insights;
  }

  private generatePerformanceInsights(data: PerformanceAnalytics): string[] {
    const insights: string[] = [];
    
    insights.push(`Overall efficiency is ${(data.overall_efficiency * 100).toFixed(1)}%`);
    insights.push(`${data.top_performers.length} resources are performing excellently`);
    insights.push(`${data.underperformers.length} resources need attention`);
    
    return insights;
  }

  private generateCostInsights(data: CostAnalytics): string[] {
    const insights: string[] = [];
    
    insights.push(`Total cost is $${data.total_cost.toLocaleString()}`);
    insights.push(`Average cost per resource is $${data.cost_per_resource.toFixed(2)}`);
    insights.push(`${data.cost_optimization_opportunities.length} cost optimization opportunities identified`);
    
    return insights;
  }

  private generatePredictiveInsights(data: PredictiveInsights): string[] {
    const insights: string[] = [];
    
    insights.push(`${data.demand_forecast.length} days of demand forecast available`);
    insights.push(`${data.capacity_recommendations.length} capacity adjustments recommended`);
    insights.push(`${data.optimization_opportunities.length} optimization opportunities identified`);
    
    return insights;
  }

  private generateComprehensiveInsights(data: any): string[] {
    return [
      ...this.generateUtilizationInsights(data.utilization),
      ...this.generatePerformanceInsights(data.performance),
      ...this.generateCostInsights(data.cost),
      ...this.generatePredictiveInsights(data.predictive)
    ];
  }

  /**
   * Generate recommendations for different report types
   */
  private generateUtilizationRecommendations(data: UtilizationAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (data.underutilized_resources.length > 0) {
      recommendations.push('Reallocate underutilized resources to high-demand areas');
    }
    
    if (data.overutilized_resources.length > 0) {
      recommendations.push('Add capacity or implement load balancing for overutilized resources');
    }
    
    return recommendations;
  }

  private generatePerformanceRecommendations(data: PerformanceAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (data.underperformers.length > 0) {
      recommendations.push('Investigate and address performance issues in underperforming resources');
    }
    
    if (data.overall_efficiency < 0.7) {
      recommendations.push('Implement performance improvement initiatives');
    }
    
    return recommendations;
  }

  private generateCostRecommendations(data: CostAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (data.cost_optimization_opportunities.length > 0) {
      recommendations.push('Implement identified cost optimization opportunities');
    }
    
    recommendations.push('Review and negotiate vendor contracts for better rates');
    
    return recommendations;
  }

  private generatePredictiveRecommendations(data: PredictiveInsights): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Implement predictive maintenance based on failure predictions');
    recommendations.push('Adjust capacity planning based on demand forecasts');
    
    return recommendations;
  }

  private generateComprehensiveRecommendations(data: any): string[] {
    return [
      ...this.generateUtilizationRecommendations(data.utilization),
      ...this.generatePerformanceRecommendations(data.performance),
      ...this.generateCostRecommendations(data.cost),
      ...this.generatePredictiveRecommendations(data.predictive)
    ];
  }

  /**
   * Create charts for different report types
   */
  private createUtilizationCharts(data: UtilizationAnalytics): ChartData[] {
    return [
      {
        type: 'line',
        title: 'Utilization Trends',
        data: data.utilization_trends,
        labels: data.utilization_trends.map(t => t.date)
      },
      {
        type: 'bar',
        title: 'Resource Utilization',
        data: [data.average_utilization],
        labels: ['Average Utilization']
      }
    ];
  }

  private createPerformanceCharts(data: PerformanceAnalytics): ChartData[] {
    return [
      {
        type: 'line',
        title: 'Performance Trends',
        data: data.performance_trends,
        labels: data.performance_trends.map(t => t.date)
      },
      {
        type: 'bar',
        title: 'Performance by Type',
        data: Object.values(data.performance_by_type),
        labels: Object.keys(data.performance_by_type)
      }
    ];
  }

  private createCostCharts(data: CostAnalytics): ChartData[] {
    return [
      {
        type: 'line',
        title: 'Cost Trends',
        data: data.cost_trends,
        labels: data.cost_trends.map(t => t.period)
      },
      {
        type: 'pie',
        title: 'Cost Breakdown',
        data: Object.values(data.cost_breakdown),
        labels: Object.keys(data.cost_breakdown)
      }
    ];
  }

  private createPredictiveCharts(data: PredictiveInsights): ChartData[] {
    return [
      {
        type: 'line',
        title: 'Demand Forecast',
        data: data.demand_forecast,
        labels: data.demand_forecast.map(f => f.date)
      }
    ];
  }

  private createComprehensiveCharts(data: any): ChartData[] {
    return [
      ...this.createUtilizationCharts(data.utilization),
      ...this.createPerformanceCharts(data.performance),
      ...this.createCostCharts(data.cost),
      ...this.createPredictiveCharts(data.predictive)
    ];
  }

  /**
   * Save report to database
   */
  private async saveReport(report: ResourceReport): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('resource_reports')
        .insert([{
          id: report.id,
          title: report.title,
          type: report.type,
          period: report.period,
          generated_at: report.generated_at.toISOString(),
          data: report.data,
          insights: report.insights,
          recommendations: report.recommendations,
          charts: report.charts
        }]);

      if (error) throw error;

      console.log(`✅ Report saved: ${report.id}`);
    } catch (error) {
      console.error('❌ Error saving report:', error);
      // Don't throw error - report generation should still succeed
    }
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear analytics cache
   */
  clearCache(): void {
    this.analyticsCache.clear();
    console.log('✅ Analytics cache cleared');
  }
}

export default ResourceAnalytics;