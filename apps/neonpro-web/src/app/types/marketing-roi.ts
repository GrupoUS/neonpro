// Marketing ROI Types
// Generated for NeonPro - FASE 4

import { z } from 'zod';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MarketingChannel {
  EMAIL = 'email',
  SOCIAL = 'social',
  SEARCH = 'search',
  DISPLAY = 'display',
  DIRECT = 'direct',
  REFERRAL = 'referral',
  PAID_SOCIAL = 'paid_social',
  ORGANIC = 'organic'
}

export enum ROIMetricType {
  REVENUE = 'revenue',
  CONVERSION = 'conversion',
  COST_PER_ACQUISITION = 'cost_per_acquisition',
  LIFETIME_VALUE = 'lifetime_value',
  RETURN_ON_AD_SPEND = 'return_on_ad_spend'
}

export enum AlertType {
  PERFORMANCE = 'performance',
  BUDGET = 'budget',
  CONVERSION = 'conversion',
  COST = 'cost',
  ROI_THRESHOLD = 'roi_threshold'
}

export interface CampaignMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  roi: number;
}

export interface ROIAnalysis {
  channel: MarketingChannel;
  totalSpend: number;
  totalRevenue: number;
  roi: number;
  conversions: number;
  costPerAcquisition: number;
}
// Additional schemas for marketing ROI
export const CreateROIAlertSchema = z.object({
  name: z.string().min(1),
  threshold: z.number().min(0),
  metric: z.enum(['roi', 'roas', 'cac', 'ltv']),
  condition: z.enum(['above', 'below']),
  isActive: z.boolean().default(true)
});

export const MarketingROIFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  campaignId: z.string().optional(),
  channel: z.string().optional()
});

export const CreateMarketingCampaignSchema = z.object({
  name: z.string().min(1),
  channel: z.string().min(1),
  budget: z.number().min(0),
  startDate: z.string(),
  endDate: z.string().optional(),
  targetAudience: z.string().optional()
});

export const TreatmentROIFiltersSchema = z.object({
  treatmentType: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  providerId: z.string().optional()
});
