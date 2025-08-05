// Trial Management Engine - STORY-SUB-002 Task 3
// Core engine for AI-powered trial management and conversion optimization
// Created: 2025-01-22

import { createClient } from '@/lib/supabase/server'
import { Analytics } from '../analytics'
import type {
  Trial,
  TrialStage,
  ConversionPrediction,
  UserJourney,
  JourneyEvent,
  ConversionStrategy,
  UserSegment,
  EngagementLevel,
  ConversionFactor,
  ConversionRecommendation
} from './types'

export class TrialManagementEngine {
  private supabase: ReturnType<typeof createClient>
  private analytics: typeof Analytics

  constructor() {
    this.supabase = createClient()
    this.analytics = Analytics
  }

  // ========================================================================
  // TRIAL LIFECYCLE MANAGEMENT
  // ========================================================================

  async createTrial(userId: string, signupSource: string = 'website'): Promise<Trial> {
    const now = new Date()
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days trial

    // Create trial record in database
    const { data: trialData, error } = await this.supabase
      .from('trial_analytics')
      .insert({
        user_id: userId,
        trial_status: 'signup',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        signup_source: signupSource,
        metadata: {
          signupSource,
          initialFeatures: [],
          onboardingProgress: 0,
          totalSessions: 0,
          averageSessionDuration: 0,
          featuresUsed: [],
          supportInteractions: 0
        }
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create trial: ${error.message}`)

    // Initialize user journey tracking
    await this.initializeUserJourney(trialData.id, userId)

    return this.mapDatabaseToTrial(trialData)
  }  async updateTrialStage(trialId: string, newStage: TrialStage, trigger: string = 'manual'): Promise<Trial> {
    const { data: currentTrial, error: fetchError } = await this.supabase
      .from('trial_analytics')
      .select('*')
      .eq('id', trialId)
      .single()

    if (fetchError) throw new Error(`Trial not found: ${fetchError.message}`)

    // Calculate conversion probability for new stage
    const journey = await this.getUserJourney(trialId)
    const conversionProbability = await this.calculateConversionProbability(
      this.mapDatabaseToTrial(currentTrial),
      journey
    )

    // Update trial in database
    const { data: updatedTrial, error: updateError } = await this.supabase
      .from('trial_analytics')
      .update({
        trial_status: newStage,
        conversion_probability: conversionProbability,
        updated_at: new Date().toISOString()
      })
      .eq('id', trialId)
      .select()
      .single()

    if (updateError) throw new Error(`Failed to update trial: ${updateError.message}`)

    // Log stage transition
    await this.logStageTransition(trialId, currentTrial.trial_status, newStage, trigger)

    // Trigger appropriate campaign if needed
    await this.triggerAutomatedCampaign(updatedTrial, newStage)

    return this.mapDatabaseToTrial(updatedTrial)
  }

  async getTrial(trialId: string): Promise<Trial | null> {
    const { data, error } = await this.supabase
      .from('trial_analytics')
      .select('*')
      .eq('id', trialId)
      .single()

    if (error) return null
    return this.mapDatabaseToTrial(data)
  }

  async getUserActiveTrial(userId: string): Promise<Trial | null> {
    const { data, error } = await this.supabase
      .from('trial_analytics')
      .select('*')
      .eq('user_id', userId)
      .in('trial_status', ['signup', 'onboarding', 'active', 'at_risk', 'converting'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return this.mapDatabaseToTrial(data)
  }  // ========================================================================
  // AI CONVERSION PREDICTION & OPTIMIZATION
  // ========================================================================

  async predictConversion(trialId: string): Promise<ConversionPrediction> {
    const trial = await this.getTrial(trialId)
    if (!trial) throw new Error('Trial not found')

    const journey = await this.getUserJourney(trialId)
    const factors = await this.calculateConversionFactors(trial, journey)
    
    // AI-powered probability calculation based on multiple factors
    const probability = await this.calculateConversionProbability(trial, journey)
    const confidence = this.calculatePredictionConfidence(factors)
    
    const recommendations = await this.generateConversionRecommendations(trial, factors)
    const optimalStrategy = this.determineOptimalStrategy(trial, factors)
    
    return {
      trialId,
      userId: trial.userId,
      probability,
      confidence,
      factors,
      recommendations,
      optimalStrategy,
      timeToConversion: this.estimateTimeToConversion(probability, trial.daysRemaining),
      predictedRevenue: probability * 99, // Assuming $99 subscription
      riskLevel: this.assessRiskLevel(probability, trial.daysRemaining)
    }
  }

  private async calculateConversionProbability(trial: Trial, journey: UserJourney): Promise<number> {
    // Multi-factor AI algorithm inspired by BPR (Bayesian Personalized Ranking)
    const factors = await this.calculateConversionFactors(trial, journey)
    
    let probability = 0.1 // base probability
    
    // Engagement factor (40% weight)
    const engagementScore = factors.find(f => f.name === 'engagement')?.value || 0
    probability += (engagementScore / 100) * 0.4
    
    // Time urgency factor (20% weight)  
    const timeUrgency = Math.max(0, 1 - (trial.daysRemaining / 14))
    probability += timeUrgency * 0.2
    
    // Feature adoption factor (25% weight)
    const featureAdoption = factors.find(f => f.name === 'feature_adoption')?.value || 0
    probability += (featureAdoption / 100) * 0.25
    
    // Support interaction factor (10% weight)
    const supportInteraction = factors.find(f => f.name === 'support_interaction')?.value || 0
    probability += (supportInteraction / 100) * 0.1
    
    // Email engagement factor (5% weight)
    const emailEngagement = factors.find(f => f.name === 'email_engagement')?.value || 0
    probability += (emailEngagement / 100) * 0.05

    // Apply collaborative filtering boost based on similar users
    const collaborativeBoost = await this.getCollaborativeFilteringBoost(trial.userId)
    probability = Math.min(probability * (1 + collaborativeBoost), 0.95)

    return Math.max(0.01, Math.min(probability, 0.95))
  }  private async calculateConversionFactors(trial: Trial, journey: UserJourney): Promise<ConversionFactor[]> {
    const factors: ConversionFactor[] = []

    // Engagement factor
    const engagementEvents = journey.events.filter(e => e.type === 'feature_usage')
    const engagementScore = Math.min(engagementEvents.length * 10, 100)
    factors.push({
      name: 'engagement',
      weight: 0.4,
      value: engagementScore,
      impact: engagementScore > 60 ? 'positive' : engagementScore > 30 ? 'neutral' : 'negative',
      description: `User has ${engagementEvents.length} feature usage events`
    })

    // Feature adoption factor
    const uniqueFeatures = new Set(journey.events
      .filter(e => e.type === 'feature_usage')
      .map(e => e.data.featureId)).size
    const featureAdoptionScore = Math.min(uniqueFeatures * 20, 100)
    factors.push({
      name: 'feature_adoption',
      weight: 0.25,
      value: featureAdoptionScore,
      impact: uniqueFeatures >= 3 ? 'positive' : uniqueFeatures >= 2 ? 'neutral' : 'negative',
      description: `User has adopted ${uniqueFeatures} unique features`
    })

    // Time urgency factor
    const timeUrgency = (14 - trial.daysRemaining) / 14 * 100
    factors.push({
      name: 'time_urgency',
      weight: 0.2,
      value: timeUrgency,
      impact: trial.daysRemaining <= 3 ? 'positive' : trial.daysRemaining <= 7 ? 'neutral' : 'negative',
      description: `${trial.daysRemaining} days remaining in trial`
    })

    // Support interaction factor
    const supportEvents = journey.events.filter(e => e.type === 'support_contact')
    const supportScore = Math.min(supportEvents.length * 25, 100)
    factors.push({
      name: 'support_interaction',
      weight: 0.1,
      value: supportScore,
      impact: supportEvents.length > 0 ? 'positive' : 'neutral',
      description: `${supportEvents.length} support interactions`
    })

    // Email engagement factor
    const emailEvents = journey.events.filter(e => e.type === 'email_interaction')
    const emailScore = Math.min(emailEvents.length * 15, 100)
    factors.push({
      name: 'email_engagement',
      weight: 0.05,
      value: emailScore,
      impact: emailEvents.length >= 2 ? 'positive' : emailEvents.length >= 1 ? 'neutral' : 'negative',
      description: `${emailEvents.length} email interactions`
    })

    return factors
  }  private async generateConversionRecommendations(
    trial: Trial, 
    factors: ConversionFactor[]
  ): Promise<ConversionRecommendation[]> {
    const recommendations: ConversionRecommendation[] = []

    const engagementFactor = factors.find(f => f.name === 'engagement')
    const featureFactor = factors.find(f => f.name === 'feature_adoption')
    const timeFactor = factors.find(f => f.name === 'time_urgency')

    // Low engagement recommendations
    if (engagementFactor && engagementFactor.value < 40) {
      recommendations.push({
        action: 'Send personalized onboarding email sequence',
        priority: 'high',
        expectedImpact: 25,
        effort: 'low',
        timeline: 'Immediate',
        reasoning: 'Low engagement score indicates user needs guidance'
      })

      recommendations.push({
        action: 'Schedule a personal demo call',
        priority: 'medium',
        expectedImpact: 35,
        effort: 'high',
        timeline: '1-2 days',
        reasoning: 'Personal touch can significantly boost engagement'
      })
    }

    // Feature adoption recommendations  
    if (featureFactor && featureFactor.value < 60) {
      recommendations.push({
        action: 'Highlight unused premium features',
        priority: 'high',
        expectedImpact: 20,
        effort: 'low',
        timeline: 'Immediate',
        reasoning: 'User has not explored key value-driving features'
      })

      recommendations.push({
        action: 'Create personalized feature tour',
        priority: 'medium',
        expectedImpact: 30,
        effort: 'medium',
        timeline: '1 day',
        reasoning: 'Guided experience increases feature adoption'
      })
    }

    // Time urgency recommendations
    if (timeFactor && trial.daysRemaining <= 3) {
      recommendations.push({
        action: 'Offer limited-time discount (20% off)',
        priority: 'high',
        expectedImpact: 40,
        effort: 'low',
        timeline: 'Immediate',
        reasoning: 'Time pressure combined with incentive drives conversions'
      })

      recommendations.push({
        action: 'Send urgency reminder with success stories',
        priority: 'high',
        expectedImpact: 25,
        effort: 'low',
        timeline: 'Immediate',
        reasoning: 'Social proof with urgency is highly effective'
      })
    }

    // High-value user recommendations
    if (trial.conversionProbability > 0.7) {
      recommendations.push({
        action: 'Direct sales call to close the deal',
        priority: 'high',
        expectedImpact: 50,
        effort: 'high',
        timeline: '1 day',
        reasoning: 'High conversion probability warrants direct sales intervention'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }  private determineOptimalStrategy(trial: Trial, factors: ConversionFactor[]): ConversionStrategy {
    const engagementValue = factors.find(f => f.name === 'engagement')?.value || 0
    const featureValue = factors.find(f => f.name === 'feature_adoption')?.value || 0
    const timeUrgency = trial.daysRemaining <= 3

    if (timeUrgency && trial.conversionProbability > 0.5) {
      return 'urgency_reminder'
    } else if (engagementValue < 30) {
      return 'engagement_boost'
    } else if (featureValue < 40) {
      return 'feature_highlight'
    } else if (trial.conversionProbability > 0.7) {
      return 'demo_scheduling'
    } else {
      return 'discount_offer'
    }
  }

  private calculatePredictionConfidence(factors: ConversionFactor[]): number {
    // Confidence based on data availability and factor consistency
    const totalDataPoints = factors.reduce((sum, f) => sum + f.value, 0)
    const consistencyScore = this.calculateFactorConsistency(factors)
    
    let confidence = 0.6 // base confidence
    confidence += (totalDataPoints / 500) * 0.3 // more data = higher confidence
    confidence += consistencyScore * 0.1 // consistent factors = higher confidence
    
    return Math.min(confidence, 0.95)
  }

  private calculateFactorConsistency(factors: ConversionFactor[]): number {
    const positiveFactors = factors.filter(f => f.impact === 'positive').length
    const negativeFactors = factors.filter(f => f.impact === 'negative').length
    const neutralFactors = factors.filter(f => f.impact === 'neutral').length
    
    // Higher consistency when factors point in same direction
    if (positiveFactors >= negativeFactors * 2) return 1.0
    if (negativeFactors >= positiveFactors * 2) return 0.8
    return 0.6 // mixed signals = lower consistency
  }

  private estimateTimeToConversion(probability: number, daysRemaining: number): number {
    if (probability > 0.8) return Math.min(2, daysRemaining)
    if (probability > 0.6) return Math.min(5, daysRemaining) 
    if (probability > 0.4) return Math.min(8, daysRemaining)
    return daysRemaining
  }

  private assessRiskLevel(probability: number, daysRemaining: number): 'low' | 'medium' | 'high' {
    if (probability > 0.7) return 'low'
    if (probability > 0.4 && daysRemaining > 3) return 'medium'
    return 'high'
  }

  private async getCollaborativeFilteringBoost(userId: string): Promise<number> {
    // Simplified collaborative filtering - in production, use more sophisticated algorithm
    const { data: similarUsers } = await this.supabase
      .rpc('get_similar_trial_users', { target_user_id: userId })
    
    if (!similarUsers || similarUsers.length === 0) return 0
    
    const avgConversionRate = similarUsers.reduce((sum: number, user: any) => 
      sum + (user.converted ? 1 : 0), 0) / similarUsers.length
    
    return Math.min(avgConversionRate * 0.2, 0.1) // max 10% boost
  }  // ========================================================================
  // USER JOURNEY TRACKING
  // ========================================================================

  async trackEvent(
    trialId: string, 
    eventType: JourneyEvent['type'], 
    data: Record<string, any>,
    source: string = 'webapp'
  ): Promise<void> {
    const event: Omit<JourneyEvent, 'id'> = {
      type: eventType,
      timestamp: new Date(),
      data,
      score: this.calculateEventScore(eventType, data),
      source
    }

    // Store event in database
    await this.supabase
      .from('customer_lifecycle_events')
      .insert({
        trial_id: trialId,
        event_type: eventType,
        event_data: data,
        score: event.score,
        source,
        created_at: event.timestamp.toISOString()
      })

    // Update trial engagement score
    await this.updateTrialEngagement(trialId)

    // Check for stage transitions
    await this.checkStageTransitions(trialId)
  }

  private calculateEventScore(eventType: JourneyEvent['type'], data: Record<string, any>): number {
    const scoreMap = {
      'feature_usage': 10,
      'page_view': 1,
      'email_interaction': 5,
      'support_contact': 15,
      'upgrade_attempt': 25
    }

    let baseScore = scoreMap[eventType] || 1

    // Boost score for key features
    if (eventType === 'feature_usage' && data.featureId) {
      const keyFeatures = ['dashboard', 'reports', 'integrations', 'automation']
      if (keyFeatures.includes(data.featureId)) baseScore *= 1.5
    }

    // Boost score for long session duration
    if (data.sessionDuration && data.sessionDuration > 300) { // 5 minutes
      baseScore *= 1.2
    }

    return Math.min(baseScore, 50) // cap at 50 points per event
  }

  private async updateTrialEngagement(trialId: string): Promise<void> {
    // Calculate new engagement score based on recent events
    const { data: events } = await this.supabase
      .from('customer_lifecycle_events')
      .select('score, created_at')
      .eq('trial_id', trialId)
      .order('created_at', { ascending: false })
      .limit(50) // last 50 events

    if (!events || events.length === 0) return

    // Weight recent events more heavily (decay factor)
    const now = Date.now()
    let totalScore = 0
    let weightSum = 0

    events.forEach(event => {
      const ageHours = (now - new Date(event.created_at).getTime()) / (1000 * 60 * 60)
      const weight = Math.exp(-ageHours / 24) // exponential decay over 24 hours
      totalScore += event.score * weight
      weightSum += weight
    })

    const engagementScore = Math.min(weightSum > 0 ? totalScore / weightSum : 0, 100)

    // Update trial with new engagement score
    await this.supabase
      .from('trial_analytics')
      .update({ 
        engagement_score: engagementScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', trialId)
  }  private async checkStageTransitions(trialId: string): Promise<void> {
    const trial = await this.getTrial(trialId)
    if (!trial) return

    const journey = await this.getUserJourney(trialId)
    const newStage = this.determineTrialStage(trial, journey)

    if (newStage !== trial.status) {
      await this.updateTrialStage(trialId, newStage, 'automated')
    }
  }

  private determineTrialStage(trial: Trial, journey: UserJourney): TrialStage {
    const eventCount = journey.events.length
    const featureUsageEvents = journey.events.filter(e => e.type === 'feature_usage').length
    const uniqueFeatures = new Set(journey.events
      .filter(e => e.type === 'feature_usage')
      .map(e => e.data.featureId)).size

    // Stage determination logic
    if (trial.status === 'signup' && eventCount >= 3) {
      return 'onboarding'
    }
    
    if (trial.status === 'onboarding' && (featureUsageEvents >= 5 || uniqueFeatures >= 2)) {
      return 'active'
    }
    
    if (trial.status === 'active') {
      if (trial.conversionProbability >= 0.7) {
        return 'converting'
      } else if (trial.daysRemaining <= 3 && trial.conversionProbability < 0.3) {
        return 'at_risk'
      }
    }
    
    if (trial.daysRemaining <= 0 && trial.status !== 'converted') {
      return 'expired'
    }

    return trial.status
  }

  async getUserJourney(trialId: string): Promise<UserJourney> {
    const { data: events, error } = await this.supabase
      .from('customer_lifecycle_events')
      .select('*')
      .eq('trial_id', trialId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to get journey: ${error.message}`)

    const trial = await this.getTrial(trialId)
    if (!trial) throw new Error('Trial not found')

    const mappedEvents: JourneyEvent[] = events?.map(event => ({
      id: event.id,
      type: event.event_type,
      timestamp: new Date(event.created_at),
      data: event.event_data || {},
      score: event.score || 0,
      source: event.source || 'unknown'
    })) || []

    const milestones = this.generateJourneyMilestones(mappedEvents)
    const progressScore = this.calculateProgressScore(mappedEvents, milestones)

    return {
      userId: trial.userId,
      trialId,
      events: mappedEvents,
      milestones,
      currentStage: trial.status,
      progressScore,
      stageHistory: await this.getStageHistory(trialId)
    }
  }  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private async initializeUserJourney(trialId: string, userId: string): Promise<void> {
    // Create initial signup event
    await this.trackEvent(trialId, 'page_view', {
      page: 'signup_complete',
      source: 'trial_creation'
    }, 'system')
  }

  private async logStageTransition(
    trialId: string, 
    fromStage: string, 
    toStage: string, 
    trigger: string
  ): Promise<void> {
    await this.supabase
      .from('trial_stage_transitions')
      .insert({
        trial_id: trialId,
        from_stage: fromStage,
        to_stage: toStage,
        trigger,
        created_at: new Date().toISOString()
      })
  }

  private async triggerAutomatedCampaign(trial: any, newStage: TrialStage): Promise<void> {
    // Trigger appropriate automated campaigns based on stage
    const campaignTriggers = {
      'onboarding': 'welcome_sequence',
      'active': 'feature_highlight',
      'at_risk': 'urgency_reminder',
      'converting': 'sales_assist'
    }

    const campaignType = campaignTriggers[newStage]
    if (campaignType) {
      // In production, this would trigger campaign management system
      console.log(`Triggering ${campaignType} campaign for trial ${trial.id}`)
    }
  }

  private generateJourneyMilestones(events: JourneyEvent[]) {
    const milestones = [
      {
        name: 'First Login',
        description: 'User logged in for the first time',
        completed: events.some(e => e.type === 'page_view' && e.data.page === 'dashboard'),
        completedAt: events.find(e => e.type === 'page_view' && e.data.page === 'dashboard')?.timestamp,
        importance: 0.8,
        category: 'onboarding' as const
      },
      {
        name: 'First Feature Used',
        description: 'User used their first core feature',
        completed: events.some(e => e.type === 'feature_usage'),
        completedAt: events.find(e => e.type === 'feature_usage')?.timestamp,
        importance: 0.9,
        category: 'engagement' as const
      },
      {
        name: 'Multiple Features Explored',
        description: 'User explored 3+ different features',
        completed: new Set(events.filter(e => e.type === 'feature_usage').map(e => e.data.featureId)).size >= 3,
        completedAt: events.filter(e => e.type === 'feature_usage').length >= 3 ? 
          events.filter(e => e.type === 'feature_usage')[2]?.timestamp : undefined,
        importance: 0.95,
        category: 'value_realization' as const
      },
      {
        name: 'Support Interaction',
        description: 'User contacted support for help',
        completed: events.some(e => e.type === 'support_contact'),
        completedAt: events.find(e => e.type === 'support_contact')?.timestamp,
        importance: 0.7,
        category: 'engagement' as const
      }
    ]

    return milestones
  }

  private calculateProgressScore(events: JourneyEvent[], milestones: any[]): number {
    const completedMilestones = milestones.filter(m => m.completed)
    const totalImportance = milestones.reduce((sum, m) => sum + m.importance, 0)
    const completedImportance = completedMilestones.reduce((sum, m) => sum + m.importance, 0)
    
    return totalImportance > 0 ? (completedImportance / totalImportance) * 100 : 0
  }

  private async getStageHistory(trialId: string) {
    const { data: transitions } = await this.supabase
      .from('trial_stage_transitions')
      .select('*')
      .eq('trial_id', trialId)
      .order('created_at', { ascending: true })

    return transitions?.map(t => ({
      fromStage: t.from_stage as TrialStage,
      toStage: t.to_stage as TrialStage,
      timestamp: new Date(t.created_at),
      trigger: t.trigger,
      automated: t.trigger === 'automated',
      conversionProbabilityChange: 0 // Would be calculated from historical data
    })) || []
  }

  private mapDatabaseToTrial(data: any): Trial {
    return {
      id: data.id,
      userId: data.user_id,
      status: data.trial_status,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      daysRemaining: Math.max(0, Math.ceil((new Date(data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      conversionProbability: data.conversion_probability || 0.1,
      engagementScore: data.engagement_score || 0,
      userSegment: data.user_segment || 'casual_user',
      currentStrategy: data.current_strategy || 'engagement_boost',
      metadata: data.metadata || {}
    }
  }
}

