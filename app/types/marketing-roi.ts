/**
 * Marketing ROI Analysis Types
 * Comprehensive ROI calculation and optimization for marketing campaigns and treatments
 * 
 * Features:
 * - Marketing campaign ROI tracking
 * - Treatment profitability analysis  
 * - CAC (Customer Acquisition Cost) & LTV (Lifetime Value) analytics
 * - Real-time ROI monitoring and alerts
 * - Cost optimization recommendations
 * - Executive dashboard with strategic insights
 */

import { z } from 'zod';

// ===== ENUMS =====

export enum MarketingChannel {
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  INSTAGRAM_ADS = 'instagram_ads',
  WHATSAPP_BUSINESS = 'whatsapp_business',
  EMAIL_MARKETING = 'email_marketing',
  SMS_MARKETING = 'sms_marketing',
  ORGANIC_SOCIAL = 'organic_social',
  INFLUENCER = 'influencer',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  SEO = 'seo',
  PRINT_MEDIA = 'print_media',
  RADIO = 'radio',
  TV = 'tv',
  OUTDOOR = 'outdoor',
  EVENT = 'event',
  PARTNERSHIP = 'partnership',
  OTHER = 'other'
}

export enum CampaignType {
  BRAND_AWARENESS = 'brand_awareness',
  LEAD_GENERATION = 'lead_generation',
  CONVERSION = 'conversion',
  RETENTION = 'retention',
  REACTIVATION = 'reactivation',
  SEASONAL = 'seasonal',
  PROMOTIONAL = 'promotional',
  EDUCATIONAL = 'educational',
  OTHER = 'other'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ROIMetricType {
  REVENUE_ROI = 'revenue_roi',
  PROFIT_ROI = 'profit_roi',
  CUSTOMER_ROI = 'customer_roi',
  LIFETIME_ROI = 'lifetime_roi',
  ACQUISITION_ROI = 'acquisition_roi'
}

export enum AlertType {
  UNDERPERFORMING_CAMPAIGN = 'underperforming_campaign',
  HIGH_CAC = 'high_cac',
  LOW_LTV = 'low_ltv',
  NEGATIVE_ROI = 'negative_roi',
  BUDGET_EXCEEDED = 'budget_exceeded',
  OPPORTUNITY = 'opportunity'
}

export enum OptimizationArea {
  BUDGET_ALLOCATION = 'budget_allocation',
  CHANNEL_MIX = 'channel_mix',
  CAMPAIGN_TARGETING = 'campaign_targeting',
  PRICING_STRATEGY = 'pricing_strategy',
  COST_REDUCTION = 'cost_reduction',
  RESOURCE_ALLOCATION = 'resource_allocation'
}

// ===== CAMPAIGN MANAGEMENT =====

export interface MarketingCampaign {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  channel: MarketingChannel;
  type: CampaignType;
  status: CampaignStatus;
  start_date: Date;
  end_date?: Date;
  
  // Budget & Costs
  budget: number;
  actual_spend: number;
  cost_per_click?: number;
  cost_per_impression?: number;
  cost_per_lead?: number;
  cost_per_acquisition?: number;
  
  // Performance Metrics
  impressions: number;
  clicks: number;
  leads_generated: number;
  conversions: number;
  revenue_generated: number;
  profit_generated: number;
  
  // ROI Metrics
  roi_percentage: number;
  profit_roi_percentage: number;
  ltv_cac_ratio: number;
  payback_period_days: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface CampaignTouchpoint {
  id: string;
  campaign_id: string;
  patient_id: string;
  touchpoint_type: string;
  interaction_date: Date;
  channel: MarketingChannel;
  cost_attributed: number;
  conversion_attributed: boolean;
  revenue_attributed: number;
  created_at: Date;
}

// ===== TREATMENT PROFITABILITY =====

export interface TreatmentROI {
  id: string;
  clinic_id: string;
  treatment_id: string;
  treatment_name: string;
  
  // Cost Analysis
  direct_costs: number;
  indirect_costs: number;
  labor_costs: number;
  material_costs: number;
  equipment_costs: number;
  overhead_costs: number;
  total_costs: number;
  
  // Revenue Analysis
  base_price: number;
  average_selling_price: number;
  total_revenue: number;
  
  // Profitability Metrics
  gross_profit: number;
  gross_margin_percentage: number;
  roi_percentage: number;
  profit_per_procedure: number;
  
  // Volume Analysis
  procedures_count: number;
  monthly_volume: number;
  capacity_utilization: number;
  
  // Comparative Metrics
  clinic_average_roi: number;
  industry_benchmark_roi: number;
  ranking_among_treatments: number;
  
  // Optimization Potential
  optimization_score: number;
  cost_reduction_potential: number;
  price_optimization_potential: number;
  volume_optimization_potential: number;
  
  period_start: Date;
  period_end: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== CAC & LTV ANALYTICS =====

export interface CustomerAcquisitionCost {
  id: string;
  clinic_id: string;
  channel: MarketingChannel;
  
  // Acquisition Metrics
  period_start: Date;
  period_end: Date;
  total_marketing_spend: number;
  customers_acquired: number;
  cac: number;
  
  // Channel Performance
  conversion_rate: number;
  cost_per_lead: number;
  lead_to_customer_rate: number;
  
  // Comparative Analysis
  previous_period_cac: number;
  cac_change_percentage: number;
  clinic_average_cac: number;
  industry_benchmark_cac: number;
  
  // Quality Metrics
  customer_quality_score: number;
  first_purchase_value: number;
  time_to_first_purchase_days: number;
  
  created_at: Date;
  updated_at: Date;
}

export interface CustomerLifetimeValue {
  id: string;
  clinic_id: string;
  patient_id?: string; // Optional for individual vs aggregate analysis
  
  // LTV Calculation
  lifetime_value: number;
  predicted_ltv: number;
  ltv_calculation_method: string;
  
  // Revenue Components
  total_revenue: number;
  average_order_value: number;
  purchase_frequency: number;
  customer_lifespan_months: number;
  
  // Profitability Components
  total_profit: number;
  gross_margin_percentage: number;
  profit_ltv: number;
  
  // Acquisition Context
  acquisition_channel: MarketingChannel;
  acquisition_date: Date;
  cac: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  
  // Predictive Metrics
  churn_probability: number;
  next_purchase_probability: number;
  upsell_probability: number;
  retention_months: number;
  
  // Segmentation
  customer_segment: string;
  value_tier: string;
  risk_level: string;
  
  period_start: Date;
  period_end: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== ROI MONITORING & ALERTS =====

export interface ROIAlert {
  id: string;
  clinic_id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Alert Details
  title: string;
  description: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  variance_percentage: number;
  
  // Context
  entity_type: 'campaign' | 'treatment' | 'channel' | 'clinic';
  entity_id: string;
  entity_name: string;
  
  // Actions
  suggested_actions: string[];
  potential_impact: number;
  priority_score: number;
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledged_at?: Date;
  acknowledged_by?: string;
  resolved_at?: Date;
  
  created_at: Date;
  updated_at: Date;
}

export interface ROIMonitoringRule {
  id: string;
  clinic_id: string;
  name: string;
  description: string;
  
  // Rule Configuration
  metric_type: ROIMetricType;
  entity_type: 'campaign' | 'treatment' | 'channel';
  threshold_value: number;
  comparison_operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals';
  
  // Trigger Conditions
  minimum_sample_size: number;
  evaluation_period_days: number;
  consecutive_violations: number;
  
  // Alert Configuration
  alert_type: AlertType;
  alert_severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: string[];
  
  // Status
  is_active: boolean;
  last_evaluated: Date;
  violations_count: number;
  
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// ===== OPTIMIZATION RECOMMENDATIONS =====

export interface OptimizationRecommendation {
  id: string;
  clinic_id: string;
  area: OptimizationArea;
  
  // Recommendation Details
  title: string;
  description: string;
  rationale: string;
  
  // Impact Analysis
  current_roi: number;
  projected_roi: number;
  roi_improvement_percentage: number;
  estimated_revenue_impact: number;
  estimated_cost_impact: number;
  estimated_profit_impact: number;
  
  // Implementation
  complexity_score: number; // 1-10
  implementation_effort: 'low' | 'medium' | 'high';
  implementation_timeline_days: number;
  required_resources: string[];
  
  // Context
  entity_type: 'campaign' | 'treatment' | 'channel' | 'clinic';
  entity_ids: string[];
  priority_score: number;
  confidence_level: number; // 0-100
  
  // Actions
  recommended_actions: {
    action: string;
    description: string;
    priority: number;
    estimated_impact: number;
  }[];
  
  // Status
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  approved_at?: Date;
  approved_by?: string;
  implementation_started_at?: Date;
  completed_at?: Date;
  
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// ===== DASHBOARD & ANALYTICS =====

export interface ROIDashboardMetrics {
  clinic_id: string;
  period_start: Date;
  period_end: Date;
  
  // Overall ROI Summary
  total_marketing_spend: number;
  total_revenue_generated: number;
  total_profit_generated: number;
  overall_roi_percentage: number;
  overall_profit_roi_percentage: number;
  
  // Campaign Performance
  active_campaigns_count: number;
  total_campaigns_count: number;
  average_campaign_roi: number;
  best_performing_campaign: {
    id: string;
    name: string;
    roi_percentage: number;
  };
  worst_performing_campaign: {
    id: string;
    name: string;
    roi_percentage: number;
  };
  
  // Channel Performance
  channel_performance: {
    channel: MarketingChannel;
    spend: number;
    revenue: number;
    roi_percentage: number;
    customers_acquired: number;
    cac: number;
  }[];
  
  // CAC & LTV
  average_cac: number;
  average_ltv: number;
  ltv_cac_ratio: number;
  average_payback_period_months: number;
  
  // Treatment Profitability
  most_profitable_treatments: {
    treatment_id: string;
    treatment_name: string;
    roi_percentage: number;
    profit_margin: number;
  }[];
  
  // Alerts & Opportunities
  active_alerts_count: number;
  optimization_opportunities_count: number;
  potential_roi_improvement: number;
  
  // Trends
  roi_trend_percentage: number;
  cac_trend_percentage: number;
  ltv_trend_percentage: number;
  
  generated_at: Date;
}

export interface ROITrendData {
  date: Date;
  roi_percentage: number;
  revenue: number;
  spend: number;
  profit: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  campaigns_active: number;
  customers_acquired: number;
}

export interface ROIComparison {
  entity_type: 'campaign' | 'treatment' | 'channel';
  entity_id: string;
  entity_name: string;
  current_period_roi: number;
  previous_period_roi: number;
  roi_change_percentage: number;
  trend: 'improving' | 'declining' | 'stable';
  ranking: number;
  benchmark_comparison: 'above' | 'below' | 'at_benchmark';
}

// ===== PREDICTIVE ROI =====

export interface ROIForecast {
  id: string;
  clinic_id: string;
  forecast_type: 'campaign' | 'treatment' | 'channel' | 'overall';
  entity_id?: string;
  
  // Forecast Details
  forecast_period_start: Date;
  forecast_period_end: Date;
  confidence_level: number;
  model_accuracy: number;
  
  // Predictions
  predicted_spend: number;
  predicted_revenue: number;
  predicted_profit: number;
  predicted_roi_percentage: number;
  predicted_customers_acquired: number;
  predicted_cac: number;
  predicted_ltv: number;
  
  // Scenarios
  optimistic_scenario: {
    roi_percentage: number;
    revenue: number;
    probability: number;
  };
  realistic_scenario: {
    roi_percentage: number;
    revenue: number;
    probability: number;
  };
  pessimistic_scenario: {
    roi_percentage: number;
    revenue: number;
    probability: number;
  };
  
  // Assumptions
  assumptions: string[];
  risk_factors: string[];
  
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// ===== ZOD VALIDATION SCHEMAS =====

export const MarketingCampaignSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  name: z.string().min(1, 'Nome da campanha é obrigatório'),
  description: z.string().optional(),
  channel: z.nativeEnum(MarketingChannel),
  type: z.nativeEnum(CampaignType),
  status: z.nativeEnum(CampaignStatus),
  start_date: z.date(),
  end_date: z.date().optional(),
  budget: z.number().min(0, 'Orçamento deve ser positivo'),
  actual_spend: z.number().min(0, 'Gasto real deve ser positivo'),
  cost_per_click: z.number().min(0).optional(),
  cost_per_impression: z.number().min(0).optional(),
  cost_per_lead: z.number().min(0).optional(),
  cost_per_acquisition: z.number().min(0).optional(),
  impressions: z.number().min(0, 'Impressões devem ser positivas'),
  clicks: z.number().min(0, 'Cliques devem ser positivos'),
  leads_generated: z.number().min(0, 'Leads devem ser positivos'),
  conversions: z.number().min(0, 'Conversões devem ser positivas'),
  revenue_generated: z.number().min(0, 'Receita deve ser positiva'),
  profit_generated: z.number().min(0, 'Lucro deve ser positivo'),
  roi_percentage: z.number(),
  profit_roi_percentage: z.number(),
  ltv_cac_ratio: z.number().min(0),
  payback_period_days: z.number().min(0),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string()
});

export const TreatmentROISchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  treatment_id: z.string(),
  treatment_name: z.string().min(1, 'Nome do tratamento é obrigatório'),
  direct_costs: z.number().min(0, 'Custos diretos devem ser positivos'),
  indirect_costs: z.number().min(0, 'Custos indiretos devem ser positivos'),
  labor_costs: z.number().min(0, 'Custos de mão de obra devem ser positivos'),
  material_costs: z.number().min(0, 'Custos de material devem ser positivos'),
  equipment_costs: z.number().min(0, 'Custos de equipamento devem ser positivos'),
  overhead_costs: z.number().min(0, 'Custos gerais devem ser positivos'),
  total_costs: z.number().min(0, 'Custos totais devem ser positivos'),
  base_price: z.number().min(0, 'Preço base deve ser positivo'),
  average_selling_price: z.number().min(0, 'Preço médio deve ser positivo'),
  total_revenue: z.number().min(0, 'Receita total deve ser positiva'),
  gross_profit: z.number(),
  gross_margin_percentage: z.number(),
  roi_percentage: z.number(),
  profit_per_procedure: z.number(),
  procedures_count: z.number().min(0, 'Contagem de procedimentos deve ser positiva'),
  monthly_volume: z.number().min(0, 'Volume mensal deve ser positivo'),
  capacity_utilization: z.number().min(0).max(100, 'Utilização de capacidade deve estar entre 0 e 100'),
  clinic_average_roi: z.number(),
  industry_benchmark_roi: z.number(),
  ranking_among_treatments: z.number().min(1),
  optimization_score: z.number().min(0).max(100),
  cost_reduction_potential: z.number().min(0),
  price_optimization_potential: z.number().min(0),
  volume_optimization_potential: z.number().min(0),
  period_start: z.date(),
  period_end: z.date(),
  created_at: z.date(),
  updated_at: z.date()
});

export const CustomerAcquisitionCostSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  channel: z.nativeEnum(MarketingChannel),
  period_start: z.date(),
  period_end: z.date(),
  total_marketing_spend: z.number().min(0, 'Gasto de marketing deve ser positivo'),
  customers_acquired: z.number().min(0, 'Clientes adquiridos devem ser positivos'),
  cac: z.number().min(0, 'CAC deve ser positivo'),
  conversion_rate: z.number().min(0).max(100, 'Taxa de conversão deve estar entre 0 e 100'),
  cost_per_lead: z.number().min(0, 'Custo por lead deve ser positivo'),
  lead_to_customer_rate: z.number().min(0).max(100, 'Taxa lead-cliente deve estar entre 0 e 100'),
  previous_period_cac: z.number().min(0),
  cac_change_percentage: z.number(),
  clinic_average_cac: z.number().min(0),
  industry_benchmark_cac: z.number().min(0),
  customer_quality_score: z.number().min(0).max(100),
  first_purchase_value: z.number().min(0),
  time_to_first_purchase_days: z.number().min(0),
  created_at: z.date(),
  updated_at: z.date()
});

export const CustomerLifetimeValueSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  patient_id: z.string().optional(),
  lifetime_value: z.number().min(0, 'LTV deve ser positivo'),
  predicted_ltv: z.number().min(0, 'LTV previsto deve ser positivo'),
  ltv_calculation_method: z.string(),
  total_revenue: z.number().min(0, 'Receita total deve ser positiva'),
  average_order_value: z.number().min(0, 'Valor médio de compra deve ser positivo'),
  purchase_frequency: z.number().min(0, 'Frequência de compra deve ser positiva'),
  customer_lifespan_months: z.number().min(0, 'Tempo de vida deve ser positivo'),
  total_profit: z.number(),
  gross_margin_percentage: z.number(),
  profit_ltv: z.number(),
  acquisition_channel: z.nativeEnum(MarketingChannel),
  acquisition_date: z.date(),
  cac: z.number().min(0),
  ltv_cac_ratio: z.number().min(0),
  payback_period_months: z.number().min(0),
  churn_probability: z.number().min(0).max(100),
  next_purchase_probability: z.number().min(0).max(100),
  upsell_probability: z.number().min(0).max(100),
  retention_months: z.number().min(0),
  customer_segment: z.string(),
  value_tier: z.string(),
  risk_level: z.string(),
  period_start: z.date(),
  period_end: z.date(),
  created_at: z.date(),
  updated_at: z.date()
});

export const ROIAlertSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  type: z.nativeEnum(AlertType),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Título do alerta é obrigatório'),
  description: z.string().min(1, 'Descrição do alerta é obrigatória'),
  metric_name: z.string(),
  current_value: z.number(),
  threshold_value: z.number(),
  variance_percentage: z.number(),
  entity_type: z.enum(['campaign', 'treatment', 'channel', 'clinic']),
  entity_id: z.string(),
  entity_name: z.string(),
  suggested_actions: z.array(z.string()),
  potential_impact: z.number(),
  priority_score: z.number().min(0).max(100),
  status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']),
  acknowledged_at: z.date().optional(),
  acknowledged_by: z.string().optional(),
  resolved_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const OptimizationRecommendationSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  area: z.nativeEnum(OptimizationArea),
  title: z.string().min(1, 'Título da recomendação é obrigatório'),
  description: z.string().min(1, 'Descrição da recomendação é obrigatória'),
  rationale: z.string(),
  current_roi: z.number(),
  projected_roi: z.number(),
  roi_improvement_percentage: z.number(),
  estimated_revenue_impact: z.number(),
  estimated_cost_impact: z.number(),
  estimated_profit_impact: z.number(),
  complexity_score: z.number().min(1).max(10),
  implementation_effort: z.enum(['low', 'medium', 'high']),
  implementation_timeline_days: z.number().min(0),
  required_resources: z.array(z.string()),
  entity_type: z.enum(['campaign', 'treatment', 'channel', 'clinic']),
  entity_ids: z.array(z.string()),
  priority_score: z.number().min(0).max(100),
  confidence_level: z.number().min(0).max(100),
  recommended_actions: z.array(z.object({
    action: z.string(),
    description: z.string(),
    priority: z.number(),
    estimated_impact: z.number()
  })),
  status: z.enum(['pending', 'approved', 'in_progress', 'completed', 'rejected']),
  approved_at: z.date().optional(),
  approved_by: z.string().optional(),
  implementation_started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string()
});

export const ROIForecastSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  forecast_type: z.enum(['campaign', 'treatment', 'channel', 'overall']),
  entity_id: z.string().optional(),
  forecast_period_start: z.date(),
  forecast_period_end: z.date(),
  confidence_level: z.number().min(0).max(100),
  model_accuracy: z.number().min(0).max(100),
  predicted_spend: z.number().min(0),
  predicted_revenue: z.number().min(0),
  predicted_profit: z.number(),
  predicted_roi_percentage: z.number(),
  predicted_customers_acquired: z.number().min(0),
  predicted_cac: z.number().min(0),
  predicted_ltv: z.number().min(0),
  optimistic_scenario: z.object({
    roi_percentage: z.number(),
    revenue: z.number(),
    probability: z.number().min(0).max(100)
  }),
  realistic_scenario: z.object({
    roi_percentage: z.number(),
    revenue: z.number(),
    probability: z.number().min(0).max(100)
  }),
  pessimistic_scenario: z.object({
    roi_percentage: z.number(),
    revenue: z.number(),
    probability: z.number().min(0).max(100)
  }),
  assumptions: z.array(z.string()),
  risk_factors: z.array(z.string()),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string()
});

// ===== API REQUEST/RESPONSE TYPES =====

export interface CreateMarketingCampaignRequest {
  name: string;
  description?: string;
  channel: MarketingChannel;
  type: CampaignType;
  start_date: string;
  end_date?: string;
  budget: number;
  cost_per_click?: number;
  cost_per_impression?: number;
  cost_per_lead?: number;
  cost_per_acquisition?: number;
}

export interface UpdateCampaignMetricsRequest {
  actual_spend?: number;
  impressions?: number;
  clicks?: number;
  leads_generated?: number;
  conversions?: number;
  revenue_generated?: number;
  profit_generated?: number;
}

export interface CreateROIAlertRequest {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  variance_percentage: number;
  entity_type: 'campaign' | 'treatment' | 'channel' | 'clinic';
  entity_id: string;
  entity_name: string;
  suggested_actions: string[];
  potential_impact: number;
  priority_score: number;
}

export interface CreateOptimizationRecommendationRequest {
  area: OptimizationArea;
  title: string;
  description: string;
  rationale: string;
  current_roi: number;
  projected_roi: number;
  roi_improvement_percentage: number;
  estimated_revenue_impact: number;
  estimated_cost_impact: number;
  estimated_profit_impact: number;
  complexity_score: number;
  implementation_effort: 'low' | 'medium' | 'high';
  implementation_timeline_days: number;
  required_resources: string[];
  entity_type: 'campaign' | 'treatment' | 'channel' | 'clinic';
  entity_ids: string[];
  priority_score: number;
  confidence_level: number;
  recommended_actions: {
    action: string;
    description: string;
    priority: number;
    estimated_impact: number;
  }[];
}

export interface ROIDashboardRequest {
  clinic_id: string;
  period_start: string;
  period_end: string;
  include_trends?: boolean;
  include_comparisons?: boolean;
  include_forecasts?: boolean;
}

export interface ROIDashboardResponse {
  success: boolean;
  data: ROIDashboardMetrics;
  trends?: ROITrendData[];
  comparisons?: ROIComparison[];
  forecasts?: ROIForecast[];
  alerts?: ROIAlert[];
  recommendations?: OptimizationRecommendation[];
}

export interface CampaignListResponse {
  success: boolean;
  data: MarketingCampaign[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters?: {
    channel?: MarketingChannel;
    status?: CampaignStatus;
    date_range?: {
      start: string;
      end: string;
    };
  };
}

export interface TreatmentROIListResponse {
  success: boolean;
  data: TreatmentROI[];
  summary?: {
    total_treatments: number;
    average_roi: number;
    most_profitable_treatment: string;
    least_profitable_treatment: string;
    total_profit: number;
  };
}

export interface CACLTVAnalysisResponse {
  success: boolean;
  data: {
    cac_analysis: CustomerAcquisitionCost[];
    ltv_analysis: CustomerLifetimeValue[];
    ltv_cac_ratios: {
      channel: MarketingChannel;
      ratio: number;
      status: 'excellent' | 'good' | 'acceptable' | 'poor';
    }[];
    payback_analysis: {
      channel: MarketingChannel;
      average_payback_months: number;
      median_payback_months: number;
    }[];
  };
}

// ===== UTILITY TYPES =====

export type MarketingROIFilters = {
  channel?: MarketingChannel;
  campaign_type?: CampaignType;
  status?: CampaignStatus;
  date_range?: {
    start: Date;
    end: Date;
  };
  min_roi?: number;
  max_budget?: number;
};

export type TreatmentROIFilters = {
  treatment_ids?: string[];
  min_roi?: number;
  min_procedures?: number;
  date_range?: {
    start: Date;
    end: Date;
  };
  sort_by?: 'roi' | 'profit' | 'volume' | 'margin';
  sort_order?: 'asc' | 'desc';
};

export type ROIMetric = {
  name: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  benchmark?: number;
};

export type ROIInsight = {
  type: 'opportunity' | 'risk' | 'achievement' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact_score: number;
  actionable: boolean;
  suggested_action?: string;
  related_entities: {
    type: string;
    id: string;
    name: string;
  }[];
};

// Export all types for easy importing
export type {
  MarketingCampaign,
  CampaignTouchpoint,
  TreatmentROI,
  CustomerAcquisitionCost,
  CustomerLifetimeValue,
  ROIAlert,
  ROIMonitoringRule,
  OptimizationRecommendation,
  ROIDashboardMetrics,
  ROITrendData,
  ROIComparison,
  ROIForecast,
  CreateMarketingCampaignRequest,
  UpdateCampaignMetricsRequest,
  CreateROIAlertRequest,
  CreateOptimizationRecommendationRequest,
  ROIDashboardRequest,
  ROIDashboardResponse,
  CampaignListResponse,
  TreatmentROIListResponse,
  CACLTVAnalysisResponse,
  MarketingROIFilters,
  TreatmentROIFilters,
  ROIMetric,
  ROIInsight
};