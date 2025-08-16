/**
 * Subscription Utilities and Helpers
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */

import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row'];
type UserSubscription =
  Database['public']['Tables']['user_subscriptions']['Row'];

export type SubscriptionContext = {
  subscription: UserSubscription & {
    plan: SubscriptionPlan;
  };
  hasFeature: (feature: string) => boolean;
  checkUsageLimit: (
    feature: string,
    currentUsage?: number,
  ) => Promise<{
    allowed: boolean;
    limit?: number;
    current?: number;
    remaining?: number;
  }>;
  incrementUsage: (feature: string, amount?: number) => Promise<boolean>;
};

/**
 * Get subscription context for API routes
 */
export async function getSubscriptionContext(
  request: NextRequest,
): Promise<SubscriptionContext | null> {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    // Get user's clinic
    const { data: userClinic } = await supabase
      .from('user_clinics')
      .select('clinic_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (!userClinic) {
      return null;
    }

    // Get active subscription with plan
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*)
      `,
      )
      .eq('clinic_id', userClinic.clinic_id)
      .in('status', ['trial', 'active'])
      .single();

    if (!subscription) {
      return null;
    }

    return {
      subscription: subscription as UserSubscription & {
        plan: SubscriptionPlan;
      },

      hasFeature: (feature: string) => {
        const features =
          (subscription.plan?.features as Record<string, boolean>) || {};
        return features[feature] === true;
      },

      checkUsageLimit: async (feature: string, currentUsage?: number) => {
        const limits =
          (subscription.plan?.limits as Record<string, number>) || {};
        const limit = limits[feature];

        if (limit === -1 || limit === undefined) {
          return { allowed: true };
        }

        let usage = currentUsage;
        if (usage === undefined) {
          usage = await getCurrentUsage(supabase, subscription, feature);
        }

        return {
          allowed: usage < limit,
          limit,
          current: usage,
          remaining: Math.max(0, limit - usage),
        };
      },

      incrementUsage: async (feature: string, amount = 1) => {
        return await incrementFeatureUsage(
          supabase,
          subscription,
          feature,
          amount,
        );
      },
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Get current usage for a feature
 */
async function getCurrentUsage(
  supabase: any,
  subscription: UserSubscription,
  feature: string,
): Promise<number> {
  try {
    switch (feature) {
      case 'max_patients': {
        const { count: patientCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', subscription.clinic_id)
          .eq('is_active', true);
        return patientCount || 0;
      }

      case 'max_appointments_per_month': {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', subscription.clinic_id)
          .gte('appointment_date', startOfMonth.toISOString());
        return appointmentCount || 0;
      }

      case 'max_users': {
        const { count: userCount } = await supabase
          .from('user_clinics')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', subscription.clinic_id)
          .eq('is_active', true);
        return userCount || 0;
      }

      case 'sms_notifications':
      case 'email_notifications': {
        const { data: usage } = await supabase
          .from('subscription_usage')
          .select('usage_count')
          .eq('subscription_id', subscription.id)
          .eq('feature_name', feature)
          .gte('usage_period_start', getUsagePeriodStart('monthly'))
          .single();
        return usage?.usage_count || 0;
      }

      case 'storage_gb':
        // Calculate storage usage (placeholder - implement based on actual storage calculation)
        return 0;

      case 'api_requests_per_month': {
        const { data: apiUsage } = await supabase
          .from('subscription_usage')
          .select('usage_count')
          .eq('subscription_id', subscription.id)
          .eq('feature_name', feature)
          .gte('usage_period_start', getUsagePeriodStart('monthly'))
          .single();
        return apiUsage?.usage_count || 0;
      }

      default:
        return 0;
    }
  } catch (_error) {
    return 0;
  }
}

/**
 * Increment usage for a specific feature
 */
async function incrementFeatureUsage(
  supabase: any,
  subscription: UserSubscription,
  feature: string,
  amount: number,
): Promise<boolean> {
  try {
    const periodStart = getUsagePeriodStart('monthly');

    const { error } = await supabase.from('subscription_usage').upsert(
      {
        subscription_id: subscription.id,
        feature_name: feature,
        usage_period_start: periodStart,
        usage_count: amount,
      },
      {
        onConflict: 'subscription_id,feature_name,usage_period_start',
        ignoreDuplicates: false,
      },
    );

    if (error) {
      return false;
    }

    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Get usage period start based on reset frequency
 */
function getUsagePeriodStart(
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
): string {
  const now = new Date();

  switch (frequency) {
    case 'daily':
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();

    case 'weekly': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart.toISOString();
    }

    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    case 'yearly':
      return new Date(now.getFullYear(), 0, 1).toISOString();

    default:
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
}

/**
 * Check if a subscription is active and not expired
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (!subscription) {
    return false;
  }

  const now = new Date();

  // Check trial expiration
  if (subscription.status === 'trial' && subscription.trial_end) {
    return now <= new Date(subscription.trial_end);
  }

  // Check active status
  return subscription.status === 'active';
}

/**
 * Get subscription tier display information
 */
export function getSubscriptionTierInfo(plan: SubscriptionPlan) {
  const tierInfo = {
    basic: {
      color: 'blue',
      icon: '⭐',
      priority: 1,
    },
    professional: {
      color: 'purple',
      icon: '🚀',
      priority: 2,
    },
    enterprise: {
      color: 'gold',
      icon: '👑',
      priority: 3,
    },
  };

  return (
    tierInfo[plan.name as keyof typeof tierInfo] || {
      color: 'gray',
      icon: '📦',
      priority: 0,
    }
  );
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(monthly: number, yearly: number): number {
  const monthlyTotal = monthly * 12;
  const discount = ((monthlyTotal - yearly) / monthlyTotal) * 100;
  return Math.round(discount);
}
