// Analytics Core Types - STORY-SUB-002 Task 2
// Created: 2025-01-22
// High-performance TypeScript interfaces for analytics service layer

import { z } from 'zod';

// ============================================================================
// CORE METRIC TYPES
// ============================================================================

export type MetricPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type MetricCategory =
  | 'revenue'
  | 'conversion'
  | 'engagement'
  | 'retention'
  | 'growth';
export type TrialStatus = 'active' | 'converted' | 'expired' | 'cancelled';
export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

// Base metric interface
export type BaseMetric = {
  id: string;
  timestamp: Date;
  value: number;
  category: MetricCategory;
  metadata: Record<string, any>;
};

// Revenue metrics
export interface RevenueMetric extends BaseMetric {
  category: 'revenue';
  tier: SubscriptionTier;
  currency: string;
  mrr: number;
  arr: number;
}

// Conversion metrics
export interface ConversionMetric extends BaseMetric {
  category: 'conversion';
  source: string;
  stage: string;
  conversionRate: number;
  cohortId: string;
}

// Trial metrics
export interface TrialMetric extends BaseMetric {
  category: 'engagement' | 'conversion';
  userId: string;
  trialId: string;
  status: TrialStatus;
  daysActive: number;
  actionsCount: number;
  conversionProbability?: number;
} // Analytics Aggregation & Response Types - STORY-SUB-002 Task 2 (Part 2)

// ============================================================================
// AGGREGATED DATA TYPES
// ============================================================================

export type MetricAggregation = {
  period: MetricPeriod;
  startDate: Date;
  endDate: Date;
  total: number;
  average: number;
  median: number;
  percentile95: number;
  growth: number;
  periodOverPeriod: number;
};

export type RevenueAnalytics = {
  mrr: MetricAggregation;
  arr: MetricAggregation;
  churn: MetricAggregation;
  ltv: MetricAggregation;
  byTier: Record<SubscriptionTier, MetricAggregation>;
  forecast: ForecastData;
};

export type ConversionAnalytics = {
  trialToPayment: MetricAggregation;
  signupToTrial: MetricAggregation;
  visitorToSignup: MetricAggregation;
  funnelAnalysis: FunnelStage[];
  cohortAnalysis: CohortData[];
};
export type FunnelStage = {
  stage: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
};

export type CohortData = {
  cohortId: string;
  period: string;
  size: number;
  retentionRates: number[];
  revenuePerUser: number[];
  churnRate: number;
};

// ============================================================================
// FORECASTING & PREDICTION
// ============================================================================

export type ForecastData = {
  predicted: number[];
  confidence: number[];
  scenarios: {
    conservative: number[];
    optimistic: number[];
    realistic: number[];
  };
  accuracy: number;
  period: MetricPeriod;
};

export type TrialConversionPrediction = {
  userId: string;
  trialId: string;
  probability: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  predictedValue: number;
  daysToDecision: number;
}; // ============================================================================
// REAL-TIME DATA STREAMING
// ============================================================================

export type RealTimeMetric = {
  id: string;
  type: 'revenue' | 'conversion' | 'trial' | 'user';
  value: number;
  delta: number;
  timestamp: Date;
  trend: 'up' | 'down' | 'stable';
};

export type MetricAlert = {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
};

// ============================================================================
// SERVICE LAYER INTERFACES
// ============================================================================

export type AnalyticsQuery = {
  metrics: MetricCategory[];
  period: MetricPeriod;
  startDate: Date;
  endDate: Date;
  filters?: Record<string, any>;
  groupBy?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
};
export type AnalyticsResponse<T = any> = {
  data: T;
  metadata: {
    query: AnalyticsQuery;
    executionTime: number;
    cacheHit: boolean;
    dataFreshness: Date;
    totalRecords: number;
  };
};

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const MetricPeriodSchema = z.enum([
  'day',
  'week',
  'month',
  'quarter',
  'year',
]);
export const MetricCategorySchema = z.enum([
  'revenue',
  'conversion',
  'engagement',
  'retention',
  'growth',
]);
export const TrialStatusSchema = z.enum([
  'active',
  'converted',
  'expired',
  'cancelled',
]);
export const SubscriptionTierSchema = z.enum([
  'free',
  'basic',
  'professional',
  'enterprise',
]);

export const AnalyticsQuerySchema = z.object({
  metrics: z.array(MetricCategorySchema),
  period: MetricPeriodSchema,
  startDate: z.date(),
  endDate: z.date(),
  filters: z.record(z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
  aggregation: z.enum(['sum', 'avg', 'count', 'max', 'min']).optional(),
});

// Type utilities and inference helpers
export type MetricType = RevenueMetric | ConversionMetric | TrialMetric;
export type AnalyticsQueryResult<T extends MetricCategory> = T extends 'revenue'
  ? RevenueAnalytics
  : T extends 'conversion'
    ? ConversionAnalytics
    : never;
