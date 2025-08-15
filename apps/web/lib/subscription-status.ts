/**
 * Subscription Status Validation Utilities
 *
 * This module provides utilities for validating and managing user subscription status
 * with caching, performance optimization, and comprehensive error handling.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

// Types for subscription status validation
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'cancelled'
  | 'expired'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  stripe_price_id: string;
  features: string[];
  max_patients: number | null;
  max_clinics: number | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

export interface SubscriptionValidationResult {
  hasAccess: boolean;
  status: SubscriptionStatus | null;
  subscription: UserSubscription | null;
  message: string;
  redirectTo?: string;
  gracePeriod?: boolean;
  expiresAt?: Date;
  trialActive?: boolean;
  performance: {
    validationTime: number;
    cacheHit: boolean;
    source: 'cache' | 'database' | 'error' | 'config';
  };
}

// Performance monitoring
export interface PerformanceMetrics {
  validationTime: number;
  cacheHit: boolean;
  errorCount: number;
  source: 'cache' | 'database' | 'error' | 'config';
  timestamp: number;
}

// In-memory cache with TTL support
interface CacheEntry {
  data: SubscriptionValidationResult;
  expires: number;
  created: number;
}

class SubscriptionCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly GRACE_TTL = 30 * 1000; // 30 seconds for grace period
  private readonly ERROR_TTL = 30 * 1000; // 30 seconds for errors

  get(key: string): SubscriptionValidationResult | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expires <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(
    key: string,
    data: SubscriptionValidationResult,
    customTTL?: number
  ): void {
    let ttl = this.DEFAULT_TTL;

    // Use shorter TTL for grace period and errors
    if (data.gracePeriod) {
      ttl = this.GRACE_TTL;
    } else if (!data.hasAccess && data.status === null) {
      ttl = this.ERROR_TTL;
    } else if (customTTL) {
      ttl = customTTL;
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      created: Date.now(),
    });
  }

  clear(userIdPattern?: string): void {
    if (userIdPattern) {
      const pattern = `subscription:${userIdPattern}`;
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const validEntries = entries.filter(([_, entry]) => entry.expires > now);

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      oldestEntry:
        entries.length > 0
          ? Math.min(...entries.map(([_, entry]) => entry.created))
          : null,
      newestEntry:
        entries.length > 0
          ? Math.max(...entries.map(([_, entry]) => entry.created))
          : null,
    };
  }
}

// Global cache instance
const subscriptionCache = new SubscriptionCache();

// Performance metrics collector
const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS_HISTORY = 1000;

function addPerformanceMetric(metric: PerformanceMetrics): void {
  performanceMetrics.push(metric);
  if (performanceMetrics.length > MAX_METRICS_HISTORY) {
    performanceMetrics.shift();
  }
}

/**
 * Create Supabase client for subscription operations
 */
function createSubscriptionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // No-op for middleware
        },
        remove() {
          // No-op for middleware
        },
      },
    }
  );
}

/**
 * Validates user subscription status with comprehensive error handling and performance tracking
 */
export async function validateSubscriptionStatus(
  userId: string,
  request: NextRequest
): Promise<SubscriptionValidationResult> {
  const startTime = Date.now();
  const cacheKey = `subscription:${userId}`;

  // Check cache first
  const cached = subscriptionCache.get(cacheKey);
  if (cached) {
    const metric: PerformanceMetrics = {
      validationTime: Date.now() - startTime,
      cacheHit: true,
      errorCount: 0,
      source: 'cache',
      timestamp: Date.now(),
    };
    addPerformanceMetric(metric);

    // Update performance data
    cached.performance.validationTime = metric.validationTime;
    cached.performance.cacheHit = true;
    cached.performance.source = 'cache';

    return cached;
  }

  try {
    const supabase = createSubscriptionClient(request);

    // Get user subscription with plan details using the view
    const { data: subscription, error } = await supabase
      .from('user_subscriptions_view')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Subscription validation error:', {
        error: error.message,
        userId,
        code: error.code,
        timestamp: new Date().toISOString(),
      });

      const result: SubscriptionValidationResult = {
        hasAccess: false,
        status: null,
        subscription: null,
        message: 'Unable to verify subscription status. Please try again.',
        redirectTo: '/dashboard/subscription',
        performance: {
          validationTime: Date.now() - startTime,
          cacheHit: false,
          source: 'error',
        },
      };

      const metric: PerformanceMetrics = {
        validationTime: result.performance.validationTime,
        cacheHit: false,
        errorCount: 1,
        source: 'error',
        timestamp: Date.now(),
      };
      addPerformanceMetric(metric);

      // Cache error result for short period
      subscriptionCache.set(cacheKey, result);
      return result;
    }

    // No subscription found
    if (!subscription) {
      const result: SubscriptionValidationResult = {
        hasAccess: false,
        status: null,
        subscription: null,
        message: 'No subscription found. Upgrade to access premium features.',
        redirectTo: '/dashboard/subscription',
        performance: {
          validationTime: Date.now() - startTime,
          cacheHit: false,
          source: 'database',
        },
      };

      const metric: PerformanceMetrics = {
        validationTime: result.performance.validationTime,
        cacheHit: false,
        errorCount: 0,
        source: 'database',
        timestamp: Date.now(),
      };
      addPerformanceMetric(metric);

      subscriptionCache.set(cacheKey, result);
      return result;
    }

    // Validate subscription status and timing
    const now = new Date();
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null;
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end)
      : null;
    const gracePeriodEnd = currentPeriodEnd
      ? new Date(currentPeriodEnd.getTime() + 3 * 24 * 60 * 60 * 1000)
      : null;

    let result: SubscriptionValidationResult;

    // Check trial status
    const isTrialActive =
      trialEnd && trialEnd > now && subscription.status === 'trialing';

    if (subscription.status === 'active' || isTrialActive) {
      // Active subscription or trial
      const expiresAt = isTrialActive ? trialEnd! : currentPeriodEnd!;
      const isNearExpiry =
        expiresAt &&
        expiresAt.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

      result = {
        hasAccess: true,
        status: subscription.status as SubscriptionStatus,
        subscription: subscription as UserSubscription,
        message: isTrialActive
          ? `Trial active until ${expiresAt.toLocaleDateString()}`
          : isNearExpiry
            ? `Subscription expires on ${expiresAt.toLocaleDateString()}`
            : 'Subscription is active',
        expiresAt,
        trialActive: isTrialActive ?? undefined,
        performance: {
          validationTime: Date.now() - startTime,
          cacheHit: false,
          source: 'database',
        },
      };
    } else if (
      subscription.status === 'past_due' &&
      gracePeriodEnd &&
      gracePeriodEnd > now
    ) {
      // Grace period for past due
      result = {
        hasAccess: true,
        status: subscription.status as SubscriptionStatus,
        subscription: subscription as UserSubscription,
        message:
          'Payment overdue. Please update your payment method to avoid service interruption.',
        redirectTo: undefined,
        gracePeriod: true,
        expiresAt: gracePeriodEnd,
        performance: {
          validationTime: Date.now() - startTime,
          cacheHit: false,
          source: 'database',
        },
      };
    } else {
      // Expired, cancelled, or invalid
      result = {
        hasAccess: false,
        status: subscription.status as SubscriptionStatus,
        subscription: subscription as UserSubscription,
        message: getStatusMessage(subscription.status as SubscriptionStatus),
        redirectTo: '/dashboard/subscription',
        expiresAt: currentPeriodEnd ?? undefined,
        performance: {
          validationTime: Date.now() - startTime,
          cacheHit: false,
          source: 'database',
        },
      };
    }

    const metric: PerformanceMetrics = {
      validationTime: result.performance.validationTime,
      cacheHit: false,
      errorCount: 0,
      source: 'database',
      timestamp: Date.now(),
    };
    addPerformanceMetric(metric);

    // Cache the result
    subscriptionCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Subscription validation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const result: SubscriptionValidationResult = {
      hasAccess: false,
      status: null,
      subscription: null,
      message: 'Unable to verify subscription status. Please try again.',
      redirectTo: '/dashboard/subscription',
      performance: {
        validationTime: Date.now() - startTime,
        cacheHit: false,
        source: 'error',
      },
    };

    const metric: PerformanceMetrics = {
      validationTime: result.performance.validationTime,
      cacheHit: false,
      errorCount: 1,
      source: 'error',
      timestamp: Date.now(),
    };
    addPerformanceMetric(metric);

    // Cache error result for short period
    subscriptionCache.set(cacheKey, result);
    return result;
  }
}

/**
 * Get user-friendly message for subscription status
 */
function getStatusMessage(status: SubscriptionStatus): string {
  switch (status) {
    case 'canceled':
      return 'Your subscription has been cancelled. Reactivate to continue accessing premium features.';
    case 'past_due':
      return 'Your subscription payment is overdue. Please update your payment method.';
    case 'unpaid':
      return 'Your subscription is unpaid. Please resolve payment issues to continue.';
    case 'incomplete':
      return 'Your subscription setup is incomplete. Please complete the payment process.';
    case 'incomplete_expired':
      return 'Your subscription setup has expired. Please start the subscription process again.';
    default:
      return 'Your subscription is not active. Please upgrade to access premium features.';
  }
}

/**
 * Clear subscription cache for specific user or all users
 */
export function clearSubscriptionCache(userId?: string): void {
  subscriptionCache.clear(userId);
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return subscriptionCache.getStats();
}

/**
 * Get performance metrics for monitoring
 */
export function getPerformanceMetrics(limit?: number): PerformanceMetrics[] {
  const metrics = [...performanceMetrics].reverse(); // Most recent first
  return limit ? metrics.slice(0, limit) : metrics;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  totalValidations: number;
  averageTime: number;
  cacheHitRate: number;
  errorRate: number;
  recentMetrics: PerformanceMetrics[];
} {
  if (performanceMetrics.length === 0) {
    return {
      totalValidations: 0,
      averageTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      recentMetrics: [],
    };
  }

  const totalValidations = performanceMetrics.length;
  const averageTime =
    performanceMetrics.reduce((sum, m) => sum + m.validationTime, 0) /
    totalValidations;
  const cacheHits = performanceMetrics.filter((m) => m.cacheHit).length;
  const errors = performanceMetrics.reduce((sum, m) => sum + m.errorCount, 0);

  return {
    totalValidations,
    averageTime: Math.round(averageTime * 100) / 100,
    cacheHitRate: Math.round((cacheHits / totalValidations) * 10_000) / 100, // Percentage with 2 decimals
    errorRate: Math.round((errors / totalValidations) * 10_000) / 100,
    recentMetrics: getPerformanceMetrics(10),
  };
}

/**
 * Health check for subscription validation system
 */
export async function healthCheck(_request: NextRequest): Promise<{
  healthy: boolean;
  performanceSummary: ReturnType<typeof getPerformanceSummary>;
  cacheStats: ReturnType<typeof getCacheStats>;
  timestamp: number;
}> {
  const performanceSummary = getPerformanceSummary();
  const cacheStats = getCacheStats();

  // Consider system healthy if:
  // - Average response time < 200ms
  // - Error rate < 5%
  // - Cache hit rate > 60% (if we have enough data)
  const healthy =
    performanceSummary.totalValidations === 0 ||
    (performanceSummary.averageTime < 200 &&
      performanceSummary.errorRate < 5 &&
      (performanceSummary.totalValidations < 10 ||
        performanceSummary.cacheHitRate > 60));

  return {
    healthy,
    performanceSummary,
    cacheStats,
    timestamp: Date.now(),
  };
}
