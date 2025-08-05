// Trial Management System - Main Export - STORY-SUB-002 Task 3
// AI-powered trial management with conversion optimization
// Created: 2025-01-22

// Core Types and Interfaces
export type {
  TrialStage,
  ConversionStrategy,
  UserSegment,
  EngagementLevel,
  Trial,
  TrialMetadata,
  EmailEngagementData,
  ConversionPrediction,
  ConversionFactor,
  ConversionRecommendation,
  UserJourney,
  JourneyEvent,
  JourneyMilestone,
  StageTransition,
  TrialCampaign,
  CampaignTarget,
  CampaignContent,
  CallToAction,
  PersonalizationRules,
  CampaignSchedule,
  TimeWindow,
  CampaignTrigger,
  CampaignMetrics,
  ABTestConfig,
  ABTestVariant,
  VariantChange,
  ABTestMetric,
  FeatureRecommendation,
  RecommendedFeature,
  TrialFactory
} from './types'

// Validation Schemas
export {
  TrialStageSchema,
  ConversionStrategySchema,
  UserSegmentSchema,
  EngagementLevelSchema,
  TrialSchema
} from './types'

// Core System Components
export { TrialManagementEngine } from './engine'
export { CampaignManager } from './campaigns'

// Main Trial Management Class
export class TrialManager {
  static engine = new TrialManagementEngine()
  static campaigns = new CampaignManager()

  // Quick access methods for common operations
  static async createTrial(userId: string, source: string = 'website') {
    return TrialManager.engine.createTrial(userId, source)
  }

  static async getUserTrial(userId: string) {
    return TrialManager.engine.getUserActiveTrial(userId)
  }

  static async predictConversion(trialId: string) {
    return TrialManager.engine.predictConversion(trialId)
  }

  static async trackActivity(trialId: string, eventType: JourneyEvent['type'], data: Record<string, any>) {
    return TrialManager.engine.trackEvent(trialId, eventType, data)
  }

  static async getUserJourney(trialId: string) {
    return TrialManager.engine.getUserJourney(trialId)
  }

  static async createCampaign(campaignData: Partial<TrialCampaign>) {
    return TrialManager.campaigns.createCampaign(campaignData)
  }

  static async launchCampaign(campaignId: string) {
    return TrialManager.campaigns.launchCampaign(campaignId)
  }
}

// Default export
export default TrialManager
