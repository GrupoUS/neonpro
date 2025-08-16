/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flag Management System
 *
 * Provides safe rollout capability with gradual deployment, A/B testing,
 * and emergency rollback functionality for enhancement phases.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { createClient as createServerClient } from '@/app/utils/supabase/server';

export type FeatureFlag = {
  id: string;
  flag_name: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_audience?: Record<string, any>;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type FeatureFlagEvaluation = {
  flagName: string;
  isEnabled: boolean;
  reason:
    | 'enabled'
    | 'disabled'
    | 'percentage_rollout'
    | 'target_audience'
    | 'not_found';
  metadata?: Record<string, any>;
};

export type RolloutConfig = {
  percentage: number;
  targetAudience?: {
    userIds?: string[];
    clinicIds?: string[];
    userRoles?: string[];
    conditions?: Record<string, any>;
  };
};

class FeatureFlagManager {
  private readonly supabase = createClient();
  private readonly flagCache = new Map<string, FeatureFlag>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a feature flag is enabled for the current user
   */
  async isFeatureEnabled(
    flagName: string,
    userId?: string,
    context?: Record<string, any>
  ): Promise<FeatureFlagEvaluation> {
    try {
      // Check cache first
      const cachedFlag = this.getCachedFlag(flagName);
      let flag: FeatureFlag | null = cachedFlag;

      // Fetch from database if not cached or expired
      if (!flag) {
        const { data, error } = await this.supabase
          .from('feature_flags')
          .select('*')
          .eq('flag_name', flagName)
          .single();

        if (error || !data) {
          return {
            flagName,
            isEnabled: false,
            reason: 'not_found',
          };
        }

        flag = data;
        this.setCachedFlag(flagName, flag);
      }

      // Evaluate flag
      return this.evaluateFlag(flag, userId, context);
    } catch (_error) {
      return {
        flagName,
        isEnabled: false,
        reason: 'not_found',
      };
    }
  }

  /**
   * Evaluate flag based on rules and context
   */
  private evaluateFlag(
    flag: FeatureFlag,
    userId?: string,
    context?: Record<string, any>
  ): FeatureFlagEvaluation {
    // If flag is globally disabled
    if (!flag.is_enabled) {
      return {
        flagName: flag.flag_name,
        isEnabled: false,
        reason: 'disabled',
      };
    }

    // Check target audience rules
    if (flag.target_audience && userId) {
      const isTargeted = this.evaluateTargetAudience(
        flag.target_audience,
        userId,
        context
      );
      if (isTargeted !== null) {
        return {
          flagName: flag.flag_name,
          isEnabled: isTargeted,
          reason: 'target_audience',
          metadata: { target_audience: flag.target_audience },
        };
      }
    }

    // Check percentage rollout
    if (flag.rollout_percentage < 100) {
      const isInRollout = this.evaluatePercentageRollout(
        flag.flag_name,
        flag.rollout_percentage,
        userId
      );

      return {
        flagName: flag.flag_name,
        isEnabled: isInRollout,
        reason: 'percentage_rollout',
        metadata: { rollout_percentage: flag.rollout_percentage },
      };
    }

    // Flag is fully enabled
    return {
      flagName: flag.flag_name,
      isEnabled: true,
      reason: 'enabled',
    };
  }

  /**
   * Evaluate target audience rules
   */
  private evaluateTargetAudience(
    targetAudience: Record<string, any>,
    userId: string,
    context?: Record<string, any>
  ): boolean | null {
    // Check user ID targeting
    if (targetAudience.userIds && Array.isArray(targetAudience.userIds)) {
      return targetAudience.userIds.includes(userId);
    }

    // Check clinic ID targeting
    if (targetAudience.clinicIds && context?.clinicId) {
      return targetAudience.clinicIds.includes(context.clinicId);
    }

    // Check user role targeting
    if (targetAudience.userRoles && context?.userRole) {
      return targetAudience.userRoles.includes(context.userRole);
    }

    // Check custom conditions
    if (targetAudience.conditions && context) {
      for (const [key, value] of Object.entries(targetAudience.conditions)) {
        if (context[key] !== value) {
          return false;
        }
      }
      return true;
    }

    return null; // No targeting rules matched
  }

  /**
   * Evaluate percentage rollout using consistent hashing
   */
  private evaluatePercentageRollout(
    flagName: string,
    percentage: number,
    userId?: string
  ): boolean {
    if (percentage <= 0) {
      return false;
    }
    if (percentage >= 100) {
      return true;
    }

    // Use consistent hashing to determine if user is in rollout
    const hashInput = `${flagName}_${userId || 'anonymous'}`;
    const hash = this.simpleHash(hashInput);
    const bucket = hash % 100;

    return bucket < percentage;
  }

  /**
   * Simple hash function for consistent rollout
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create or update a feature flag
   */
  async upsertFeatureFlag(
    flagName: string,
    config: {
      isEnabled?: boolean;
      rolloutPercentage?: number;
      targetAudience?: Record<string, any>;
      description?: string;
    }
  ): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .upsert(
          {
            flag_name: flagName,
            is_enabled: config.isEnabled ?? false,
            rollout_percentage: config.rolloutPercentage ?? 0,
            target_audience: config.targetAudience,
            description: config.description,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'flag_name',
          }
        )
        .select()
        .single();

      if (error) {
        return null;
      }

      // Update cache
      this.setCachedFlag(flagName, data);

      return data;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Gradually increase rollout percentage
   */
  async gradualRollout(
    flagName: string,
    targetPercentage: number,
    incrementStep = 10,
    intervalMinutes = 15
  ): Promise<void> {
    const flag = await this.getFeatureFlag(flagName);
    if (!flag) {
      throw new Error(`Feature flag ${flagName} not found`);
    }

    const currentPercentage = flag.rollout_percentage;

    if (currentPercentage >= targetPercentage) {
      return;
    }

    const nextPercentage = Math.min(
      currentPercentage + incrementStep,
      targetPercentage
    );

    await this.updateFeatureFlagPercentage(flagName, nextPercentage);

    // Schedule next increment if not at target
    if (nextPercentage < targetPercentage) {
      setTimeout(
        () => {
          this.gradualRollout(
            flagName,
            targetPercentage,
            incrementStep,
            intervalMinutes
          );
        },
        intervalMinutes * 60 * 1000
      );
    }
  }

  /**
   * Emergency rollback - disable feature flag immediately
   */
  async emergencyRollback(
    flagName: string,
    _reason?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update({
          is_enabled: false,
          rollout_percentage: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('flag_name', flagName);

      if (error) {
        return false;
      }

      // Clear cache to force immediate re-fetch
      this.clearCachedFlag(flagName);

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name');

      if (error) {
        return [];
      }

      return data || [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get single feature flag
   */
  async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_name', flagName)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Update feature flag percentage
   */
  async updateFeatureFlagPercentage(
    flagName: string,
    percentage: number
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update({
          rollout_percentage: Math.max(0, Math.min(100, percentage)),
          updated_at: new Date().toISOString(),
        })
        .eq('flag_name', flagName);

      if (error) {
        return false;
      }

      // Clear cache to force re-fetch
      this.clearCachedFlag(flagName);

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Cache management methods
   */
  private getCachedFlag(flagName: string): FeatureFlag | null {
    const expiry = this.cacheExpiry.get(flagName);
    if (expiry && Date.now() > expiry) {
      this.clearCachedFlag(flagName);
      return null;
    }
    return this.flagCache.get(flagName) || null;
  }

  private setCachedFlag(flagName: string, flag: FeatureFlag): void {
    this.flagCache.set(flagName, flag);
    this.cacheExpiry.set(flagName, Date.now() + this.cacheTimeout);
  }

  private clearCachedFlag(flagName: string): void {
    this.flagCache.delete(flagName);
    this.cacheExpiry.delete(flagName);
  }

  /**
   * Clear all cached flags
   */
  clearCache(): void {
    this.flagCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();

//React Hook for feature flag usage
export function useFeatureFlag(
  flagName: string,
  context?: Record<string, any>
) {
  const [evaluation, setEvaluation] = useState<FeatureFlagEvaluation>({
    flagName,
    isEnabled: false,
    reason: 'not_found',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      setLoading(true);
      // Get user ID from context or auth
      const userId = context?.userId; // You might want to get this from auth context
      const result = await featureFlagManager.isFeatureEnabled(
        flagName,
        userId,
        context
      );
      setEvaluation(result);
      setLoading(false);
    };

    checkFlag();
  }, [flagName, context]);

  return {
    isEnabled: evaluation.isEnabled,
    evaluation,
    loading,
  };
}

// Server-side feature flag checking
export async function checkFeatureFlagServer(
  flagName: string,
  userId?: string,
  context?: Record<string, any>
): Promise<FeatureFlagEvaluation> {
  const supabase = createServerClient();
  const manager = new FeatureFlagManager();

  // Override the client instance for server-side usage
  (manager as any).supabase = supabase;

  return manager.isFeatureEnabled(flagName, userId, context);
}
