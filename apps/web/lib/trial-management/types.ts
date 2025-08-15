// Trial Management Types - STORY-SUB-002 Task 3
// AI-powered trial management system with conversion optimization
// Created: 2025-01-22

import { z } from 'zod';

// ============================================================================
// CORE TRIAL TYPES
// ============================================================================

export type TrialStage =
  | 'signup'
  | 'onboarding'
  | 'active'
  | 'at_risk'
  | 'converting'
  | 'converted'
  | 'expired'
  | 'cancelled';
export type ConversionStrategy =
  | 'engagement_boost'
  | 'feature_highlight'
  | 'discount_offer'
  | 'demo_scheduling'
  | 'urgency_reminder';
export type UserSegment =
  | 'power_user'
  | 'casual_user'
  | 'explorer'
  | 'passive'
  | 'high_value'
  | 'at_risk';
export type EngagementLevel =
  | 'very_high'
  | 'high'
  | 'medium'
  | 'low'
  | 'very_low';

// Core trial interface
export interface Trial {
  id: string;
  userId: string;
  status: TrialStage;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  conversionProbability: number;
  engagementScore: number;
  userSegment: UserSegment;
  currentStrategy: ConversionStrategy;
  metadata: TrialMetadata;
}

export interface TrialMetadata {
  signupSource: string;
  referralCode?: string;
  utmParams?: Record<string, string>;
  initialFeatures: string[];
  onboardingProgress: number;
  lastActivityDate: Date;
  totalSessions: number;
  averageSessionDuration: number;
  featuresUsed: string[];
  supportInteractions: number;
  emailEngagement: EmailEngagementData;
}

export interface EmailEngagementData {
  emailsReceived: number;
  emailsOpened: number;
  emailsClicked: number;
  lastEmailEngagement: Date;
  engagementRate: number;
}

// ============================================================================
// AI CONVERSION OPTIMIZATION
// ============================================================================

export interface ConversionPrediction {
  trialId: string;
  userId: string;
  probability: number;
  confidence: number;
  factors: ConversionFactor[];
  recommendations: ConversionRecommendation[];
  optimalStrategy: ConversionStrategy;
  timeToConversion: number; // days
  predictedRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ConversionFactor {
  name: string;
  weight: number;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ConversionRecommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  reasoning: string;
}

// ============================================================================
// USER JOURNEY & BEHAVIOR TRACKING
// ============================================================================

export interface UserJourney {
  userId: string;
  trialId: string;
  events: JourneyEvent[];
  milestones: JourneyMilestone[];
  currentStage: TrialStage;
  progressScore: number;
  stageHistory: StageTransition[];
}

export interface JourneyEvent {
  id: string;
  type:
    | 'feature_usage'
    | 'page_view'
    | 'email_interaction'
    | 'support_contact'
    | 'upgrade_attempt';
  timestamp: Date;
  data: Record<string, any>;
  score: number; // engagement impact
  source: string;
}

export interface JourneyMilestone {
  name: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  importance: number;
  category:
    | 'onboarding'
    | 'engagement'
    | 'value_realization'
    | 'conversion_readiness';
}

export interface StageTransition {
  fromStage: TrialStage;
  toStage: TrialStage;
  timestamp: Date;
  trigger: string;
  automated: boolean;
  conversionProbabilityChange: number;
} // Campaign Management & A/B Testing Types - STORY-SUB-002 Task 3 (Part 2)

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

export interface TrialCampaign {
  id: string;
  name: string;
  type: 'email' | 'in_app' | 'push' | 'sms' | 'retargeting';
  status: 'draft' | 'active' | 'paused' | 'completed';
  target: CampaignTarget;
  content: CampaignContent;
  schedule: CampaignSchedule;
  triggers: CampaignTrigger[];
  metrics: CampaignMetrics;
  abTest?: ABTestConfig;
}

export interface CampaignTarget {
  segments: UserSegment[];
  trialStages: TrialStage[];
  conversionProbabilityRange: [number, number];
  engagementLevelRange: EngagementLevel[];
  customFilters: Record<string, any>;
  estimatedAudience: number;
}

export interface CampaignContent {
  subject?: string;
  title: string;
  message: string;
  cta: CallToAction;
  personalization: PersonalizationRules;
  assets: CampaignAsset[];
}

export interface CallToAction {
  text: string;
  action:
    | 'upgrade'
    | 'schedule_demo'
    | 'contact_sales'
    | 'extend_trial'
    | 'feature_tour';
  url?: string;
  style: 'primary' | 'secondary' | 'urgent';
}

export interface PersonalizationRules {
  useUserName: boolean;
  useDaysRemaining: boolean;
  useTopFeatures: boolean;
  useCompanyName: boolean;
  customTokens: Record<string, string>;
}

export interface CampaignAsset {
  type: 'image' | 'video' | 'document' | 'gif';
  url: string;
  alt?: string;
  title?: string;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'trigger_based' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  deliveryWindows: TimeWindow[];
}

export interface TimeWindow {
  start: string; // HH:MM format
  end: string; // HH:MM format
  days: number[]; // 0-6, Sunday=0
}

export interface CampaignTrigger {
  type: 'time_based' | 'behavior_based' | 'score_based' | 'stage_change';
  condition: string;
  delay: number; // minutes
  maxTriggers: number;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue: number;
  conversionRate: number;
  roi: number;
} // ============================================================================
// A/B TESTING FRAMEWORK
// ============================================================================

export interface ABTestConfig {
  id: string;
  name: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  trafficSplit: number[]; // percentages that sum to 100
  metrics: ABTestMetric[];
  duration: number; // days
  minSampleSize: number;
  confidenceLevel: number;
  statisticalSignificance?: number;
  winner?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  changes: VariantChange[];
  weight: number; // traffic percentage
  participants: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface VariantChange {
  element: string;
  property: string;
  value: any;
  previousValue?: any;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  primary: boolean;
  target?: number;
  currentValue?: number;
  improvement?: number;
  significance?: number;
}

// ============================================================================
// FEATURE RECOMMENDATION SYSTEM
// ============================================================================

export interface FeatureRecommendation {
  userId: string;
  trialId: string;
  recommendations: RecommendedFeature[];
  strategy: 'collaborative' | 'content_based' | 'hybrid';
  generatedAt: Date;
  validUntil: Date;
}

export interface RecommendedFeature {
  featureId: string;
  featureName: string;
  score: number;
  reason: string;
  category: string;
  estimatedValue: number;
  usageComplexity: 'low' | 'medium' | 'high';
  timeToValue: number; // minutes
  similarUsers: string[];
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const TrialStageSchema = z.enum([
  'signup',
  'onboarding',
  'active',
  'at_risk',
  'converting',
  'converted',
  'expired',
  'cancelled',
]);
export const ConversionStrategySchema = z.enum([
  'engagement_boost',
  'feature_highlight',
  'discount_offer',
  'demo_scheduling',
  'urgency_reminder',
]);
export const UserSegmentSchema = z.enum([
  'power_user',
  'casual_user',
  'explorer',
  'passive',
  'high_value',
  'at_risk',
]);
export const EngagementLevelSchema = z.enum([
  'very_high',
  'high',
  'medium',
  'low',
  'very_low',
]);

export const TrialSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: TrialStageSchema,
  startDate: z.date(),
  endDate: z.date(),
  daysRemaining: z.number(),
  conversionProbability: z.number().min(0).max(1),
  engagementScore: z.number().min(0).max(100),
  userSegment: UserSegmentSchema,
  currentStrategy: ConversionStrategySchema,
  metadata: z.any(),
});

// ============================================================================
// TYPE UTILITIES
// ============================================================================

export type TrialEventType = JourneyEvent['type'];
export type CampaignType = TrialCampaign['type'];
export type CampaignStatus = TrialCampaign['status'];

// Factory interfaces
export interface TrialFactory {
  createTrial(userId: string, metadata: Partial<TrialMetadata>): Trial;
  updateTrialStage(trialId: string, newStage: TrialStage): Promise<Trial>;
  calculateEngagementScore(events: JourneyEvent[]): number;
  predictConversion(trial: Trial, journey: UserJourney): ConversionPrediction;
}

// Export main types for convenience
export type {
  Trial,
  ConversionPrediction,
  UserJourney,
  TrialCampaign,
  ABTestConfig,
  FeatureRecommendation,
};
