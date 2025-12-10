/**
 * Subscription Service for NeonPro
 * Manages user subscriptions and AI model access
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * AI Model Types
 */
export type AIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'gemini-2.0-flash-exp'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

/**
 * Subscription Tiers
 */
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * User Subscription Interface
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Model Access Configuration
 */
export interface ModelAccess {
  model: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  available: boolean;
  maxTokens?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

/**
 * Subscription Tier Features
 */
const TIER_FEATURES: Record<SubscriptionTier, {
  models: AIModel[];
  maxTokensPerRequest: number;
  dailyRequests: number;
  monthlyRequests: number;
}> = {
  free: {
    models: ['gpt-3.5-turbo', 'gemini-1.5-flash'],
    maxTokensPerRequest: 1000,
    dailyRequests: 10,
    monthlyRequests: 100,
  },
  basic: {
    models: [
      'gpt-3.5-turbo',
      'gpt-4o-mini',
      'claude-3-5-haiku-20241022',
      'gemini-1.5-flash',
    ],
    maxTokensPerRequest: 4000,
    dailyRequests: 50,
    monthlyRequests: 1000,
  },
  pro: {
    models: [
      'gpt-3.5-turbo',
      'gpt-4o-mini',
      'gpt-4o',
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
    maxTokensPerRequest: 8000,
    dailyRequests: 200,
    monthlyRequests: 5000,
  },
  enterprise: {
    models: [
      'gpt-3.5-turbo',
      'gpt-4o-mini',
      'gpt-4o',
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
    ],
    maxTokensPerRequest: 16000,
    dailyRequests: -1, // unlimited
    monthlyRequests: -1, // unlimited
  },
};

/**
 * Model Metadata
 */
const MODEL_METADATA: Record<AIModel, {
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
}> = {
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'openai' },
  'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'openai' },
  'gpt-4o': { name: 'GPT-4o', provider: 'openai' },
  'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', provider: 'google' },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', provider: 'google' },
  'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash', provider: 'google' },
};

/**
 * Get user subscription from database
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data as UserSubscription;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);

  return (
    subscription.status === 'active' ||
    subscription.status === 'trialing'
  ) && periodEnd > now;
}

/**
 * Get available models for subscription tier
 */
export function getAvailableModels(subscription: UserSubscription | null): ModelAccess[] {
  const tier: SubscriptionTier = subscription?.tier || 'free';
  const features = TIER_FEATURES[tier];

  return features.models.map((model) => {
    const metadata = MODEL_METADATA[model];
    return {
      model,
      name: metadata.name,
      provider: metadata.provider,
      available: true,
      maxTokens: features.maxTokensPerRequest,
      dailyLimit: features.dailyRequests,
      monthlyLimit: features.monthlyRequests,
    };
  });
}

/**
 * Check if user has access to specific model
 */
export function hasModelAccess(
  subscription: UserSubscription | null,
  model: AIModel
): boolean {
  const tier: SubscriptionTier = subscription?.tier || 'free';
  const features = TIER_FEATURES[tier];

  return features.models.includes(model);
}

/**
 * Get models formatted for chat component
 */
export function getModelsForChat(subscription: UserSubscription | null): Array<{
  id: string;
  name: string;
  provider: string;
}> {
  const availableModels = getAvailableModels(subscription);

  return availableModels.map((modelAccess) => ({
    id: modelAccess.model,
    name: modelAccess.name,
    provider: modelAccess.provider,
  }));
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  userId: string,
  updates: Partial<UserSubscription>
): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return null;
    }

    return data as UserSubscription;
  } catch (error) {
    console.error('Error in updateUserSubscription:', error);
    return null;
  }
}

/**
 * Create initial subscription for new user
 */
export async function createUserSubscription(
  userId: string,
  tier: SubscriptionTier = 'free'
): Promise<UserSubscription | null> {
  try {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    return data as UserSubscription;
  } catch (error) {
    console.error('Error in createUserSubscription:', error);
    return null;
  }
}

/**
 * Get subscription limits and usage
 */
export function getSubscriptionLimits(subscription: UserSubscription | null): {
  tier: SubscriptionTier;
  maxTokensPerRequest: number;
  dailyRequests: number;
  monthlyRequests: number;
  isUnlimited: boolean;
} {
  const tier: SubscriptionTier = subscription?.tier || 'free';
  const features = TIER_FEATURES[tier];

  return {
    tier,
    maxTokensPerRequest: features.maxTokensPerRequest,
    dailyRequests: features.dailyRequests,
    monthlyRequests: features.monthlyRequests,
    isUnlimited: features.dailyRequests === -1,
  };
}
