/**
 * Marketing ROI Analysis Service
 * Comprehensive ROI calculation and optimization service for marketing campaigns and treatments
 *
 * Features:
 * - Marketing campaign ROI tracking and optimization
 * - Treatment profitability analysis with cost optimization
 * - CAC (Customer Acquisition Cost) & LTV (Lifetime Value) analytics
 * - Real-time ROI monitoring with automated alerts
 * - Predictive ROI modeling and forecasting
 * - Cost optimization recommendations with strategic insights
 * - Executive dashboard analytics and reporting
 */

import {
  AlertType,
  CampaignStatus,
  type CreateMarketingCampaignRequest,
  type CreateOptimizationRecommendationRequest,
  type CreateROIAlertRequest,
  type CustomerAcquisitionCost,
  type CustomerLifetimeValue,
  type MarketingCampaign,
  MarketingChannel,
  type MarketingROIFilters,
  type OptimizationRecommendation,
  type ROIAlert,
  type ROIDashboardMetrics,
  type ROIForecast,
  ROIMetricType,
  type ROIMonitoringRule,
  type ROITrendData,
  type TreatmentROI,
  type TreatmentROIFilters,
  type UpdateCampaignMetricsRequest,
} from '@/app/types/marketing-roi';
import { createClient } from '@/app/utils/supabase/server';

export class MarketingROIService {
  private readonly supabase;

  constructor() {
    this.supabase = createClient();
  }

  // ===== MARKETING CAMPAIGN ROI MANAGEMENT =====

  /**
   * Create a new marketing campaign with initial setup
   */
  async createMarketingCampaign(
    clinicId: string,
    campaignData: CreateMarketingCampaignRequest,
    userId: string
  ): Promise<MarketingCampaign> {
    try {
      const campaign: Partial<MarketingCampaign> = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        ...campaignData,
        start_date: new Date(campaignData.start_date),
        end_date: campaignData.end_date
          ? new Date(campaignData.end_date)
          : undefined,
        status: CampaignStatus.DRAFT,
        actual_spend: 0,
        impressions: 0,
        clicks: 0,
        leads_generated: 0,
        conversions: 0,
        revenue_generated: 0,
        profit_generated: 0,
        roi_percentage: 0,
        profit_roi_percentage: 0,
        ltv_cac_ratio: 0,
        payback_period_days: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from('marketing_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create initial monitoring rules for the campaign
      await this.createCampaignMonitoringRules(data.id, clinicId, userId);

      return data;
    } catch (error) {
      console.error('Error creating marketing campaign:', error);
      throw new Error('Failed to create marketing campaign');
    }
  }

  /**
   * Update campaign performance metrics and recalculate ROI
   */
  async updateCampaignMetrics(
    campaignId: string,
    metrics: UpdateCampaignMetricsRequest
  ): Promise<MarketingCampaign> {
    try {
      // First get current campaign data
      const { data: campaign, error: fetchError } = await this.supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Calculate updated ROI metrics
      const updatedMetrics = await this.calculateCampaignROI(campaign, metrics);

      const { data, error } = await this.supabase
        .from('marketing_campaigns')
        .update({
          ...metrics,
          ...updatedMetrics,
          updated_at: new Date(),
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Check for ROI alerts after updating metrics
      await this.checkROIAlerts(data);

      return data;
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
      throw new Error('Failed to update campaign metrics');
    }
  }

  /**
   * Calculate comprehensive ROI metrics for a campaign
   */
  private async calculateCampaignROI(
    campaign: MarketingCampaign,
    newMetrics: UpdateCampaignMetricsRequest
  ): Promise<Partial<MarketingCampaign>> {
    const actualSpend = newMetrics.actual_spend ?? campaign.actual_spend;
    const revenueGenerated =
      newMetrics.revenue_generated ?? campaign.revenue_generated;
    const profitGenerated =
      newMetrics.profit_generated ?? campaign.profit_generated;
    const conversions = newMetrics.conversions ?? campaign.conversions;

    // Basic ROI calculations
    const roiPercentage =
      actualSpend > 0
        ? ((revenueGenerated - actualSpend) / actualSpend) * 100
        : 0;
    const profitROIPercentage =
      actualSpend > 0 ? (profitGenerated / actualSpend) * 100 : 0;

    // CAC calculation
    const cac = conversions > 0 ? actualSpend / conversions : 0;

    // Estimate LTV for new customers (simplified - in real implementation, use historical data)
    const estimatedLTV = await this.estimateCustomerLTV(
      campaign.clinic_id,
      campaign.channel
    );
    const ltvCacRatio = cac > 0 ? estimatedLTV / cac : 0;

    // Payback period calculation (days to recover CAC)
    const monthlyRevenuePerCustomer = estimatedLTV / 12; // Assuming 12-month lifespan
    const paybackPeriodDays =
      cac > 0 && monthlyRevenuePerCustomer > 0
        ? cac / (monthlyRevenuePerCustomer / 30)
        : 0;

    return {
      roi_percentage: roiPercentage,
      profit_roi_percentage: profitROIPercentage,
      ltv_cac_ratio: ltvCacRatio,
      payback_period_days: Math.round(paybackPeriodDays),
      cost_per_acquisition: cac,
    };
  }

  /**
   * Get all campaigns for a clinic with filtering and pagination
   */
  async getCampaigns(
    clinicId: string,
    filters?: MarketingROIFilters,
    page = 1,
    limit = 20
  ): Promise<{ campaigns: MarketingCampaign[]; total: number }> {
    try {
      let query = this.supabase
        .from('marketing_campaigns')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId);

      // Apply filters
      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }
      if (filters?.campaign_type) {
        query = query.eq('type', filters.campaign_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.date_range) {
        query = query
          .gte('start_date', filters.date_range.start.toISOString())
          .lte('start_date', filters.date_range.end.toISOString());
      }
      if (filters?.min_roi) {
        query = query.gte('roi_percentage', filters.min_roi);
      }
      if (filters?.max_budget) {
        query = query.lte('budget', filters.max_budget);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        campaigns: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  // ===== TREATMENT PROFITABILITY ANALYSIS =====

  /**
   * Calculate comprehensive treatment ROI analysis
   */
  async calculateTreatmentROI(
    clinicId: string,
    treatmentId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<TreatmentROI> {
    try {
      // Get treatment data and costs
      const treatmentData = await this.getTreatmentFinancialData(
        treatmentId,
        periodStart,
        periodEnd
      );

      // Calculate costs
      const totalCosts =
        treatmentData.direct_costs +
        treatmentData.indirect_costs +
        treatmentData.labor_costs +
        treatmentData.material_costs +
        treatmentData.equipment_costs +
        treatmentData.overhead_costs;

      // Calculate profitability metrics
      const grossProfit = treatmentData.total_revenue - totalCosts;
      const grossMarginPercentage =
        treatmentData.total_revenue > 0
          ? (grossProfit / treatmentData.total_revenue) * 100
          : 0;
      const roiPercentage =
        totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;
      const profitPerProcedure =
        treatmentData.procedures_count > 0
          ? grossProfit / treatmentData.procedures_count
          : 0;

      // Get comparative metrics
      const clinicAverageROI = await this.getClinicAverageROI(
        clinicId,
        periodStart,
        periodEnd
      );
      const industryBenchmarkROI = await this.getIndustryBenchmarkROI(
        treatmentData.treatment_name
      );
      const ranking = await this.getTreatmentRanking(
        clinicId,
        treatmentId,
        roiPercentage
      );

      // Calculate optimization potential
      const optimizationAnalysis =
        await this.analyzeOptimizationPotential(treatmentData);

      const treatmentROI: TreatmentROI = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        treatment_id: treatmentId,
        treatment_name: treatmentData.treatment_name,
        ...treatmentData,
        total_costs: totalCosts,
        gross_profit: grossProfit,
        gross_margin_percentage: grossMarginPercentage,
        roi_percentage: roiPercentage,
        profit_per_procedure: profitPerProcedure,
        clinic_average_roi: clinicAverageROI,
        industry_benchmark_roi: industryBenchmarkROI,
        ranking_among_treatments: ranking,
        ...optimizationAnalysis,
        period_start: periodStart,
        period_end: periodEnd,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('treatment_roi_analysis')
        .upsert(treatmentROI)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error calculating treatment ROI:', error);
      throw new Error('Failed to calculate treatment ROI');
    }
  }

  /**
   * Get treatment profitability analysis for all treatments
   */
  async getTreatmentProfitabilityAnalysis(
    clinicId: string,
    filters?: TreatmentROIFilters
  ): Promise<TreatmentROI[]> {
    try {
      let query = this.supabase
        .from('treatment_roi_analysis')
        .select('*')
        .eq('clinic_id', clinicId);

      // Apply filters
      if (filters?.treatment_ids?.length) {
        query = query.in('treatment_id', filters.treatment_ids);
      }
      if (filters?.min_roi) {
        query = query.gte('roi_percentage', filters.min_roi);
      }
      if (filters?.min_procedures) {
        query = query.gte('procedures_count', filters.min_procedures);
      }
      if (filters?.date_range) {
        query = query
          .gte('period_start', filters.date_range.start.toISOString())
          .lte('period_end', filters.date_range.end.toISOString());
      }

      // Apply sorting
      const sortBy = filters?.sort_by || 'roi_percentage';
      const sortOrder = filters?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching treatment profitability analysis:', error);
      throw new Error('Failed to fetch treatment profitability analysis');
    }
  }

  // ===== CAC & LTV ANALYTICS =====

  /**
   * Calculate Customer Acquisition Cost (CAC) by channel
   */
  async calculateCAC(
    clinicId: string,
    channel: MarketingChannel,
    periodStart: Date,
    periodEnd: Date
  ): Promise<CustomerAcquisitionCost> {
    try {
      // Get marketing spend for the channel and period
      const { data: campaigns, error: campaignError } = await this.supabase
        .from('marketing_campaigns')
        .select('actual_spend, conversions, leads_generated')
        .eq('clinic_id', clinicId)
        .eq('channel', channel)
        .gte('start_date', periodStart.toISOString())
        .lte('start_date', periodEnd.toISOString());

      if (campaignError) {
        throw campaignError;
      }

      const totalSpend =
        campaigns?.reduce((sum, c) => sum + c.actual_spend, 0) || 0;
      const totalCustomers =
        campaigns?.reduce((sum, c) => sum + c.conversions, 0) || 0;
      const totalLeads =
        campaigns?.reduce((sum, c) => sum + c.leads_generated, 0) || 0;

      const cac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
      const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const conversionRate =
        totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0;
      const leadToCustomerRate = conversionRate;

      // Get previous period for comparison
      const previousPeriodStart = new Date(periodStart);
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      const previousPeriodEnd = new Date(periodEnd);
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);

      const previousCAC = await this.getPreviousCAC(
        clinicId,
        channel,
        previousPeriodStart,
        previousPeriodEnd
      );
      const cacChangePercentage =
        previousCAC > 0 ? ((cac - previousCAC) / previousCAC) * 100 : 0;

      // Get benchmarks
      const clinicAverageCAC = await this.getClinicAverageCAC(
        clinicId,
        periodStart,
        periodEnd
      );
      const industryBenchmarkCAC = await this.getIndustryBenchmarkCAC(channel);

      // Calculate customer quality metrics
      const customerQualityMetrics = await this.calculateCustomerQualityMetrics(
        clinicId,
        channel,
        periodStart,
        periodEnd
      );

      const cacAnalysis: CustomerAcquisitionCost = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        channel,
        period_start: periodStart,
        period_end: periodEnd,
        total_marketing_spend: totalSpend,
        customers_acquired: totalCustomers,
        cac,
        conversion_rate: conversionRate,
        cost_per_lead: costPerLead,
        lead_to_customer_rate: leadToCustomerRate,
        previous_period_cac: previousCAC,
        cac_change_percentage: cacChangePercentage,
        clinic_average_cac: clinicAverageCAC,
        industry_benchmark_cac: industryBenchmarkCAC,
        ...customerQualityMetrics,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('customer_acquisition_cost')
        .upsert(cacAnalysis)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error calculating CAC:', error);
      throw new Error('Failed to calculate CAC');
    }
  }

  /**
   * Calculate Customer Lifetime Value (LTV)
   */
  async calculateLTV(
    clinicId: string,
    patientId?: string,
    acquisitionChannel?: MarketingChannel
  ): Promise<CustomerLifetimeValue> {
    try {
      let ltvData;

      if (patientId) {
        // Calculate LTV for specific patient
        ltvData = await this.calculateIndividualLTV(clinicId, patientId);
      } else {
        // Calculate aggregate LTV for channel or clinic
        ltvData = await this.calculateAggregateLTV(
          clinicId,
          acquisitionChannel
        );
      }

      // Get CAC for LTV/CAC ratio calculation
      const cac = await this.getCAC(
        clinicId,
        acquisitionChannel || MarketingChannel.DIRECT
      );
      const ltvCacRatio = cac > 0 ? ltvData.lifetime_value / cac : 0;
      const paybackPeriodMonths =
        cac > 0 && ltvData.average_order_value > 0
          ? cac / ltvData.average_order_value
          : 0;

      // Calculate predictive metrics
      const predictiveMetrics = await this.calculateLTVPredictiveMetrics(
        clinicId,
        patientId,
        acquisitionChannel
      );

      const ltvAnalysis: CustomerLifetimeValue = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        patient_id: patientId,
        ...ltvData,
        acquisition_channel: acquisitionChannel || MarketingChannel.DIRECT,
        cac,
        ltv_cac_ratio: ltvCacRatio,
        payback_period_months: paybackPeriodMonths,
        ...predictiveMetrics,
        period_start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('customer_lifetime_value')
        .upsert(ltvAnalysis)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error calculating LTV:', error);
      throw new Error('Failed to calculate LTV');
    }
  }

  /**
   * Get comprehensive CAC & LTV analysis
   */
  async getCACLTVAnalysis(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<{
    cac_analysis: CustomerAcquisitionCost[];
    ltv_analysis: CustomerLifetimeValue[];
    ltv_cac_ratios: {
      channel: MarketingChannel;
      ratio: number;
      status: string;
    }[];
    payback_analysis: {
      channel: MarketingChannel;
      average_payback_months: number;
      median_payback_months: number;
    }[];
  }> {
    try {
      // Calculate CAC for all channels
      const channels = Object.values(MarketingChannel);
      const cacPromises = channels.map((channel) =>
        this.calculateCAC(clinicId, channel, periodStart, periodEnd)
      );
      const cacAnalysis = await Promise.all(cacPromises);

      // Calculate LTV for all channels
      const ltvPromises = channels.map((channel) =>
        this.calculateLTV(clinicId, undefined, channel)
      );
      const ltvAnalysis = await Promise.all(ltvPromises);

      // Calculate LTV/CAC ratios and status
      const ltvCacRatios = cacAnalysis.map((cac, index) => {
        const ltv = ltvAnalysis[index];
        const ratio = ltv.ltv_cac_ratio;
        let status = 'poor';
        if (ratio >= 5) {
          status = 'excellent';
        } else if (ratio >= 3) {
          status = 'good';
        } else if (ratio >= 1.5) {
          status = 'acceptable';
        }

        return {
          channel: cac.channel,
          ratio,
          status,
        };
      });

      // Calculate payback analysis
      const paybackAnalysis = await this.calculatePaybackAnalysis(
        clinicId,
        periodStart,
        periodEnd
      );

      return {
        cac_analysis: cacAnalysis,
        ltv_analysis: ltvAnalysis,
        ltv_cac_ratios: ltvCacRatios,
        payback_analysis: paybackAnalysis,
      };
    } catch (error) {
      console.error('Error getting CAC/LTV analysis:', error);
      throw new Error('Failed to get CAC/LTV analysis');
    }
  }

  // ===== ROI MONITORING & ALERTS =====

  /**
   * Check for ROI alerts based on monitoring rules
   */
  async checkROIAlerts(campaign: MarketingCampaign): Promise<void> {
    try {
      // Get monitoring rules for the clinic
      const { data: rules, error } = await this.supabase
        .from('roi_monitoring_rules')
        .select('*')
        .eq('clinic_id', campaign.clinic_id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Check each rule against campaign metrics
      for (const rule of rules || []) {
        const shouldTrigger = await this.evaluateMonitoringRule(rule, campaign);

        if (shouldTrigger) {
          await this.createROIAlert(rule, campaign);
        }
      }
    } catch (error) {
      console.error('Error checking ROI alerts:', error);
    }
  }

  /**
   * Create an ROI alert
   */
  async createROIAlert(
    clinicId: string,
    alertData: CreateROIAlertRequest
  ): Promise<ROIAlert> {
    try {
      const alert: Partial<ROIAlert> = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        ...alertData,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const { data, error } = await this.supabase
        .from('roi_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send notifications based on alert severity
      await this.sendAlertNotifications(data);

      return data;
    } catch (error) {
      console.error('Error creating ROI alert:', error);
      throw new Error('Failed to create ROI alert');
    }
  }

  /**
   * Get active ROI alerts for a clinic
   */
  async getActiveAlerts(clinicId: string): Promise<ROIAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('roi_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('priority_score', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw new Error('Failed to fetch active alerts');
    }
  }

  // ===== OPTIMIZATION RECOMMENDATIONS =====

  /**
   * Generate optimization recommendations based on ROI analysis
   */
  async generateOptimizationRecommendations(
    clinicId: string,
    userId: string
  ): Promise<OptimizationRecommendation[]> {
    try {
      const recommendations: OptimizationRecommendation[] = [];

      // Analyze campaign performance for optimization opportunities
      const campaignRecommendations = await this.analyzeCampaignOptimizations(
        clinicId,
        userId
      );
      recommendations.push(...campaignRecommendations);

      // Analyze treatment profitability for optimization opportunities
      const treatmentRecommendations = await this.analyzeTreatmentOptimizations(
        clinicId,
        userId
      );
      recommendations.push(...treatmentRecommendations);

      // Analyze budget allocation for optimization opportunities
      const budgetRecommendations = await this.analyzeBudgetOptimizations(
        clinicId,
        userId
      );
      recommendations.push(...budgetRecommendations);

      // Analyze channel mix for optimization opportunities
      const channelRecommendations = await this.analyzeChannelOptimizations(
        clinicId,
        userId
      );
      recommendations.push(...channelRecommendations);

      // Sort by priority score and potential impact
      recommendations.sort((a, b) => {
        const aPriority = a.priority_score * a.estimated_profit_impact;
        const bPriority = b.priority_score * b.estimated_profit_impact;
        return bPriority - aPriority;
      });

      return recommendations.slice(0, 20); // Return top 20 recommendations
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      throw new Error('Failed to generate optimization recommendations');
    }
  }

  /**
   * Create an optimization recommendation
   */
  async createOptimizationRecommendation(
    clinicId: string,
    recommendationData: CreateOptimizationRecommendationRequest,
    userId: string
  ): Promise<OptimizationRecommendation> {
    try {
      const recommendation: Partial<OptimizationRecommendation> = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        ...recommendationData,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from('optimization_recommendations')
        .insert(recommendation)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating optimization recommendation:', error);
      throw new Error('Failed to create optimization recommendation');
    }
  }

  // ===== DASHBOARD & ANALYTICS =====

  /**
   * Get comprehensive ROI dashboard metrics
   */
  async getROIDashboardMetrics(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ROIDashboardMetrics> {
    try {
      // Get campaign performance data
      const { data: campaigns, error: campaignError } = await this.supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('start_date', periodStart.toISOString())
        .lte('start_date', periodEnd.toISOString());

      if (campaignError) {
        throw campaignError;
      }

      // Calculate overall metrics
      const totalSpend =
        campaigns?.reduce((sum, c) => sum + c.actual_spend, 0) || 0;
      const totalRevenue =
        campaigns?.reduce((sum, c) => sum + c.revenue_generated, 0) || 0;
      const totalProfit =
        campaigns?.reduce((sum, c) => sum + c.profit_generated, 0) || 0;
      const overallROI =
        totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
      const overallProfitROI =
        totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;

      // Campaign performance
      const activeCampaigns =
        campaigns?.filter((c) => c.status === CampaignStatus.ACTIVE) || [];
      const avgCampaignROI =
        campaigns?.length > 0
          ? campaigns.reduce((sum, c) => sum + c.roi_percentage, 0) /
            campaigns.length
          : 0;

      // Best and worst performing campaigns
      const sortedCampaigns =
        campaigns?.sort((a, b) => b.roi_percentage - a.roi_percentage) || [];
      const bestCampaign = sortedCampaigns[0];
      const worstCampaign = sortedCampaigns.at(-1);

      // Channel performance
      const channelPerformance = await this.getChannelPerformance(
        clinicId,
        periodStart,
        periodEnd
      );

      // CAC & LTV metrics
      const cacLtvMetrics = await this.getCACLTVMetrics(
        clinicId,
        periodStart,
        periodEnd
      );

      // Treatment profitability
      const treatmentProfitability =
        await this.getTreatmentProfitabilityMetrics(
          clinicId,
          periodStart,
          periodEnd
        );

      // Alerts and opportunities
      const activeAlerts = await this.getActiveAlerts(clinicId);
      const optimizationOpportunities =
        await this.getOptimizationOpportunities(clinicId);

      // Trends
      const trends = await this.getROITrends(clinicId, periodStart, periodEnd);

      const dashboardMetrics: ROIDashboardMetrics = {
        clinic_id: clinicId,
        period_start: periodStart,
        period_end: periodEnd,
        total_marketing_spend: totalSpend,
        total_revenue_generated: totalRevenue,
        total_profit_generated: totalProfit,
        overall_roi_percentage: overallROI,
        overall_profit_roi_percentage: overallProfitROI,
        active_campaigns_count: activeCampaigns.length,
        total_campaigns_count: campaigns?.length || 0,
        average_campaign_roi: avgCampaignROI,
        best_performing_campaign: bestCampaign
          ? {
              id: bestCampaign.id,
              name: bestCampaign.name,
              roi_percentage: bestCampaign.roi_percentage,
            }
          : { id: '', name: '', roi_percentage: 0 },
        worst_performing_campaign: worstCampaign
          ? {
              id: worstCampaign.id,
              name: worstCampaign.name,
              roi_percentage: worstCampaign.roi_percentage,
            }
          : { id: '', name: '', roi_percentage: 0 },
        channel_performance: channelPerformance,
        average_cac: cacLtvMetrics.averageCAC,
        average_ltv: cacLtvMetrics.averageLTV,
        ltv_cac_ratio: cacLtvMetrics.ltvCacRatio,
        average_payback_period_months: cacLtvMetrics.averagePaybackMonths,
        most_profitable_treatments: treatmentProfitability,
        active_alerts_count: activeAlerts.length,
        optimization_opportunities_count: optimizationOpportunities.length,
        potential_roi_improvement: optimizationOpportunities.reduce(
          (sum, o) => sum + o.roi_improvement_percentage,
          0
        ),
        roi_trend_percentage: trends.roiTrend,
        cac_trend_percentage: trends.cacTrend,
        ltv_trend_percentage: trends.ltvTrend,
        generated_at: new Date(),
      };

      return dashboardMetrics;
    } catch (error) {
      console.error('Error getting ROI dashboard metrics:', error);
      throw new Error('Failed to get ROI dashboard metrics');
    }
  }

  /**
   * Get ROI trend data for visualization
   */
  async getROITrendData(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date,
    _granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<ROITrendData[]> {
    try {
      // Implementation would depend on your specific requirements
      // This is a simplified version
      const { data, error } = await this.supabase
        .from('roi_trend_data')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', periodStart.toISOString())
        .lte('date', periodEnd.toISOString())
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting ROI trend data:', error);
      throw new Error('Failed to get ROI trend data');
    }
  }

  // ===== PREDICTIVE ROI =====

  /**
   * Generate ROI forecast based on historical data and trends
   */
  async generateROIForecast(
    clinicId: string,
    forecastType: 'campaign' | 'treatment' | 'channel' | 'overall',
    entityId: string | undefined,
    forecastPeriodStart: Date,
    forecastPeriodEnd: Date,
    userId: string
  ): Promise<ROIForecast> {
    try {
      // Get historical data for forecasting
      const historicalData = await this.getHistoricalROIData(
        clinicId,
        forecastType,
        entityId
      );

      // Apply forecasting algorithms (simplified here - in real implementation, use ML models)
      const forecast = await this.applyForecastingModel(
        historicalData,
        forecastPeriodStart,
        forecastPeriodEnd
      );

      const roiForecast: ROIForecast = {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        forecast_type: forecastType,
        entity_id: entityId,
        forecast_period_start: forecastPeriodStart,
        forecast_period_end: forecastPeriodEnd,
        confidence_level: forecast.confidence,
        model_accuracy: forecast.accuracy,
        predicted_spend: forecast.predictedSpend,
        predicted_revenue: forecast.predictedRevenue,
        predicted_profit: forecast.predictedProfit,
        predicted_roi_percentage: forecast.predictedROI,
        predicted_customers_acquired: forecast.predictedCustomers,
        predicted_cac: forecast.predictedCAC,
        predicted_ltv: forecast.predictedLTV,
        optimistic_scenario: forecast.optimisticScenario,
        realistic_scenario: forecast.realisticScenario,
        pessimistic_scenario: forecast.pessimisticScenario,
        assumptions: forecast.assumptions,
        risk_factors: forecast.riskFactors,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
      };

      // Save forecast to database
      const { data, error } = await this.supabase
        .from('roi_forecasts')
        .insert(roiForecast)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error generating ROI forecast:', error);
      throw new Error('Failed to generate ROI forecast');
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Estimate customer LTV for a channel (simplified implementation)
   */
  private async estimateCustomerLTV(
    _clinicId: string,
    channel: MarketingChannel
  ): Promise<number> {
    // This would use historical data to estimate LTV
    // For now, return a default value based on channel
    const channelLTVMultipliers = {
      [MarketingChannel.GOOGLE_ADS]: 1.2,
      [MarketingChannel.FACEBOOK_ADS]: 1.0,
      [MarketingChannel.INSTAGRAM_ADS]: 0.9,
      [MarketingChannel.REFERRAL]: 1.5,
      [MarketingChannel.EMAIL_MARKETING]: 1.1,
      [MarketingChannel.DIRECT]: 1.3,
    };

    const baseLTV = 2500; // Base LTV for the clinic
    const multiplier = channelLTVMultipliers[channel] || 1.0;

    return baseLTV * multiplier;
  }

  /**
   * Create initial monitoring rules for a new campaign
   */
  private async createCampaignMonitoringRules(
    campaignId: string,
    clinicId: string,
    userId: string
  ): Promise<void> {
    const rules = [
      {
        id: crypto.randomUUID(),
        clinic_id: clinicId,
        name: `Low ROI Alert - ${campaignId}`,
        description: 'Alert when campaign ROI falls below threshold',
        metric_type: ROIMetricType.REVENUE_ROI,
        entity_type: 'campaign' as const,
        threshold_value: -10,
        comparison_operator: 'less_than' as const,
        minimum_sample_size: 10,
        evaluation_period_days: 7,
        consecutive_violations: 2,
        alert_type: AlertType.UNDERPERFORMING_CAMPAIGN,
        alert_severity: 'medium' as const,
        notification_channels: ['email'],
        is_active: true,
        last_evaluated: new Date(),
        violations_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
      },
    ];

    await this.supabase.from('roi_monitoring_rules').insert(rules);
  }

  /**
   * Send alert notifications based on severity
   */
  private async sendAlertNotifications(alert: ROIAlert): Promise<void> {
    // Implementation would depend on your notification system
    console.log(
      `Sending ROI alert notification: ${alert.title} (${alert.severity})`
    );
  }

  /**
   * Evaluate if a monitoring rule should trigger an alert
   */
  private async evaluateMonitoringRule(
    rule: ROIMonitoringRule,
    campaign: MarketingCampaign
  ): Promise<boolean> {
    // Simplified evaluation logic
    if (rule.metric_type === ROIMetricType.REVENUE_ROI) {
      switch (rule.comparison_operator) {
        case 'less_than':
          return campaign.roi_percentage < rule.threshold_value;
        case 'greater_than':
          return campaign.roi_percentage > rule.threshold_value;
        default:
          return false;
      }
    }
    return false;
  }

  // Additional helper methods would be implemented here...
  // (getTreatmentFinancialData, getClinicAverageROI, analyzeOptimizationPotential, etc.)
}

export const marketingROIService = new MarketingROIService();
