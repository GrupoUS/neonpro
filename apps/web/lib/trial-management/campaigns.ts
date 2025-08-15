// Campaign Management System - STORY-SUB-002 Task 3
// AI-powered trial conversion campaigns with A/B testing
// Created: 2025-01-22

import { createClient } from '@/app/utils/supabase/server';
import type {
  ABTestConfig,
  CampaignTarget,
  Trial,
  TrialCampaign,
} from './types';

export class CampaignManager {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  // ========================================================================
  // CAMPAIGN CREATION & MANAGEMENT
  // ========================================================================

  async createCampaign(
    campaignData: Partial<TrialCampaign>
  ): Promise<TrialCampaign> {
    const campaign: Omit<TrialCampaign, 'id'> = {
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || 'email',
      status: 'draft',
      target: campaignData.target || this.getDefaultTarget(),
      content: campaignData.content || this.getDefaultContent(),
      schedule: campaignData.schedule || this.getDefaultSchedule(),
      triggers: campaignData.triggers || [],
      metrics: this.initializeMetrics(),
      abTest: campaignData.abTest,
    };

    const { data, error } = await this.supabase
      .from('trial_campaigns')
      .insert({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        target_config: campaign.target,
        content_config: campaign.content,
        schedule_config: campaign.schedule,
        triggers_config: campaign.triggers,
        ab_test_config: campaign.abTest,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create campaign: ${error.message}`);

    return { ...campaign, id: data.id };
  }
  async launchCampaign(campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (campaign.status !== 'draft') {
      throw new Error('Only draft campaigns can be launched');
    }

    // Estimate audience size
    const audienceSize = await this.estimateAudienceSize(campaign.target);

    // Update campaign status and audience estimate
    await this.supabase
      .from('trial_campaigns')
      .update({
        status: 'active',
        estimated_audience: audienceSize,
        launched_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // If A/B test enabled, initialize test
    if (campaign.abTest) {
      await this.initializeABTest(campaignId, campaign.abTest);
    }

    // Schedule campaign execution
    await this.scheduleCampaignExecution(campaign);
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await this.supabase
      .from('trial_campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId);
  }

  async getCampaign(campaignId: string): Promise<TrialCampaign | null> {
    const { data, error } = await this.supabase
      .from('trial_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) return null;
    return this.mapDatabaseToCampaign(data);
  }

  // ========================================================================
  // AUDIENCE TARGETING & SEGMENTATION
  // ========================================================================

  async getEligibleTrials(target: CampaignTarget): Promise<Trial[]> {
    let query = this.supabase.from('trial_analytics').select('*');

    // Filter by trial stages
    if (target.trialStages.length > 0) {
      query = query.in('trial_status', target.trialStages);
    }

    // Filter by user segments
    if (target.segments.length > 0) {
      query = query.in('user_segment', target.segments);
    }

    // Filter by conversion probability range
    if (target.conversionProbabilityRange) {
      query = query
        .gte('conversion_probability', target.conversionProbabilityRange[0])
        .lte('conversion_probability', target.conversionProbabilityRange[1]);
    }

    const { data, error } = await query;

    if (error)
      throw new Error(`Failed to get eligible trials: ${error.message}`);

    return data?.map((trial) => this.mapDatabaseToTrial(trial)) || [];
  }
  private async estimateAudienceSize(target: CampaignTarget): Promise<number> {
    const eligibleTrials = await this.getEligibleTrials(target);
    return eligibleTrials.length;
  }

  // ========================================================================
  // A/B TESTING FRAMEWORK
  // ========================================================================

  private async initializeABTest(
    campaignId: string,
    abTestConfig: ABTestConfig
  ): Promise<void> {
    // Create A/B test record
    await this.supabase.from('campaign_ab_tests').insert({
      campaign_id: campaignId,
      name: abTestConfig.name,
      hypothesis: abTestConfig.hypothesis,
      status: 'running',
      variants_config: abTestConfig.variants,
      traffic_split: abTestConfig.trafficSplit,
      metrics_config: abTestConfig.metrics,
      duration_days: abTestConfig.duration,
      min_sample_size: abTestConfig.minSampleSize,
      confidence_level: abTestConfig.confidenceLevel,
    });
  }

  async assignTestVariant(userId: string, campaignId: string): Promise<string> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign?.abTest) return 'control';

    // Use deterministic assignment based on user ID hash
    const hash = this.hashUserId(userId);
    const variants = campaign.abTest.variants;
    const splits = campaign.abTest.trafficSplit;

    let cumulativeWeight = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += splits[i];
      if (hash < cumulativeWeight) {
        return variants[i].id;
      }
    }

    return variants[0].id; // fallback
  }

  private hashUserId(userId: string): number {
    // Simple hash function for consistent variant assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100; // Return 0-99
  }

  async trackTestConversion(
    campaignId: string,
    userId: string,
    variantId: string
  ): Promise<void> {
    await this.supabase.from('campaign_ab_test_results').insert({
      campaign_id: campaignId,
      user_id: userId,
      variant_id: variantId,
      converted: true,
      conversion_value: 99, // subscription price
      created_at: new Date().toISOString(),
    });
  } // ========================================================================
  // CAMPAIGN EXECUTION & PERSONALIZATION
  // ========================================================================

  async executeCampaign(campaignId: string, trial: Trial): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) return;

    // Get test variant if A/B testing enabled
    const variant = campaign.abTest
      ? await this.assignTestVariant(trial.userId, campaignId)
      : 'control';

    // Personalize content
    const personalizedContent = await this.personalizeContent(
      campaign.content,
      trial
    );

    // Execute based on campaign type
    switch (campaign.type) {
      case 'email':
        await this.sendEmail(trial.userId, personalizedContent);
        break;
      case 'in_app':
        await this.showInAppMessage(trial.userId, personalizedContent);
        break;
      case 'push':
        await this.sendPushNotification(trial.userId, personalizedContent);
        break;
    }

    // Track campaign delivery
    await this.trackCampaignDelivery(campaignId, trial.userId, variant);
  }

  private async personalizeContent(content: any, trial: Trial): Promise<any> {
    let personalizedMessage = content.message;

    // Replace personalization tokens
    if (content.personalization.useUserName) {
      // Get user name from database
      const { data: user } = await this.supabase
        .from('profiles')
        .select('full_name')
        .eq('id', trial.userId)
        .single();

      personalizedMessage = personalizedMessage.replace(
        '{{user_name}}',
        user?.full_name || 'there'
      );
    }

    if (content.personalization.useDaysRemaining) {
      personalizedMessage = personalizedMessage.replace(
        '{{days_remaining}}',
        trial.daysRemaining.toString()
      );
    }

    if (content.personalization.useTopFeatures) {
      const topFeatures = await this.getTopUnusedFeatures(trial.userId);
      personalizedMessage = personalizedMessage.replace(
        '{{top_features}}',
        topFeatures.join(', ')
      );
    }

    return {
      ...content,
      message: personalizedMessage,
    };
  }

  private async getTopUnusedFeatures(userId: string): Promise<string[]> {
    // Get user's used features
    const { data: usedFeatures } = await this.supabase
      .from('customer_lifecycle_events')
      .select('event_data')
      .eq('user_id', userId)
      .eq('event_type', 'feature_usage');

    const used = new Set(
      usedFeatures?.map((e) => e.event_data?.featureId) || []
    );

    // Return top unused features
    const allFeatures = [
      'dashboard',
      'reports',
      'integrations',
      'automation',
      'analytics',
    ];
    return allFeatures.filter((f) => !used.has(f)).slice(0, 3);
  }

  // Mock delivery methods (in production, integrate with actual services)
  private async sendEmail(userId: string, content: any): Promise<void> {
    console.log(`Sending email to user ${userId}:`, content);
  }

  private async showInAppMessage(userId: string, content: any): Promise<void> {
    console.log(`Showing in-app message to user ${userId}:`, content);
  }

  private async sendPushNotification(
    userId: string,
    content: any
  ): Promise<void> {
    console.log(`Sending push notification to user ${userId}:`, content);
  }

  private async trackCampaignDelivery(
    campaignId: string,
    userId: string,
    variant: string
  ): Promise<void> {
    await this.supabase.from('campaign_deliveries').insert({
      campaign_id: campaignId,
      user_id: userId,
      variant_id: variant,
      delivered_at: new Date().toISOString(),
    });
  } // ========================================================================
  // CAMPAIGN SCHEDULING & AUTOMATION
  // ========================================================================

  private async scheduleCampaignExecution(
    campaign: TrialCampaign
  ): Promise<void> {
    if (campaign.schedule.type === 'immediate') {
      // Execute immediately for all eligible trials
      const eligibleTrials = await this.getEligibleTrials(campaign.target);
      for (const trial of eligibleTrials) {
        await this.executeCampaign(campaign.id, trial);
      }
    } else if (campaign.schedule.type === 'trigger_based') {
      // Set up triggers (in production, use event system)
      console.log(`Setting up triggers for campaign ${campaign.id}`);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private getDefaultTarget(): CampaignTarget {
    return {
      segments: ['casual_user', 'explorer'],
      trialStages: ['active', 'at_risk'],
      conversionProbabilityRange: [0.2, 0.8],
      engagementLevelRange: ['medium', 'low'],
      customFilters: {},
      estimatedAudience: 0,
    };
  }

  private getDefaultContent() {
    return {
      title: "Don't Miss Out on Your Trial",
      message:
        "Hi {{user_name}}, you have {{days_remaining}} days left in your trial. Don't miss out on these amazing features: {{top_features}}",
      cta: {
        text: 'Upgrade Now',
        action: 'upgrade' as const,
        style: 'primary' as const,
      },
      personalization: {
        useUserName: true,
        useDaysRemaining: true,
        useTopFeatures: true,
        useCompanyName: false,
        customTokens: {},
      },
      assets: [],
    };
  }

  private getDefaultSchedule() {
    return {
      type: 'immediate' as const,
      timezone: 'UTC',
      deliveryWindows: [
        {
          start: '09:00',
          end: '17:00',
          days: [1, 2, 3, 4, 5], // weekdays
        },
      ],
    };
  }

  private initializeMetrics() {
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      unsubscribed: 0,
      bounced: 0,
      revenue: 0,
      conversionRate: 0,
      roi: 0,
    };
  }

  private mapDatabaseToCampaign(data: any): TrialCampaign {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      target: data.target_config,
      content: data.content_config,
      schedule: data.schedule_config,
      triggers: data.triggers_config || [],
      metrics: data.metrics || this.initializeMetrics(),
      abTest: data.ab_test_config,
    };
  }

  private mapDatabaseToTrial(data: any): Trial {
    return {
      id: data.id,
      userId: data.user_id,
      status: data.trial_status,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      daysRemaining: Math.max(
        0,
        Math.ceil(
          (new Date(data.end_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      ),
      conversionProbability: data.conversion_probability || 0.1,
      engagementScore: data.engagement_score || 0,
      userSegment: data.user_segment || 'casual_user',
      currentStrategy: data.current_strategy || 'engagement_boost',
      metadata: data.metadata || {},
    };
  }
}
