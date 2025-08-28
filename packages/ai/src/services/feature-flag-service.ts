// Feature Flag Service for AI Services
// Dynamic feature control, A/B testing, and gradual rollout management

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";
import type { AIServiceInput, AIServiceOutput } from "./enhanced-service-base";

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: FeatureFlagConditions;
  metadata: FeatureFlagMetadata;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagConditions {
  user_roles?: string[];
  user_ids?: string[];
  clinic_ids?: string[];
  time_restrictions?: TimeRestriction[];
  percentage_rollout?: number;
  environment?: string[];
  custom_conditions?: Record<string, unknown>;
}

export interface TimeRestriction {
  start_time: string; // ISO 8601 format
  end_time: string; // ISO 8601 format
  timezone?: string;
  days_of_week?: number[]; // 0-6, Sunday = 0
}

export interface FeatureFlagMetadata {
  category: string;
  owner: string;
  environment: string;
  priority: "low" | "medium" | "high" | "critical";
  rollout_strategy?: "immediate" | "gradual" | "scheduled" | "manual";
  rollout_percentage?: number;
  target_date?: string;
  dependencies?: string[];
  risk_level?: "low" | "medium" | "high";
}

export interface FeatureFlagContext {
  user_id?: string;
  user_roles?: string[];
  clinic_id?: string;
  environment?: string;
  request_ip?: string;
  user_agent?: string;
  custom_attributes?: Record<string, unknown>;
}

export interface FeatureFlagInput extends AIServiceInput {
  action: "check" | "list" | "create" | "update" | "delete" | "bulk_check";
  flag_name?: string;
  flag_names?: string[];
  context?: FeatureFlagContext;
  flag_data?: Partial<FeatureFlag>;
  filters?: {
    enabled?: boolean;
    category?: string;
    environment?: string;
    owner?: string;
  };
}

export interface FeatureFlagOutput extends AIServiceOutput {
  flag_enabled?: boolean;
  flag_details?: FeatureFlag;
  flags?: FeatureFlag[];
  bulk_results?: Record<string, boolean>;
  reason?: string;
  evaluation_metadata?: FeatureFlagEvaluationMetadata;
}

export interface FeatureFlagEvaluationMetadata {
  evaluated_at: string;
  evaluation_time_ms: number;
  conditions_checked: string[];
  matching_conditions: string[];
  rollout_bucket?: number;
  cache_hit?: boolean;
  override_applied?: boolean;
}

// Feature Flag Service Implementation
export class FeatureFlagService extends EnhancedAIService<
  FeatureFlagInput,
  FeatureFlagOutput
> {
  private readonly supabase: SupabaseClient;
  private readonly flagCache: Map<string, FeatureFlag> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_ENVIRONMENT = process.env.NODE_ENV || "development";

  constructor() {
    super("feature_flag_service");

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Initialize flag cache refresh
    this.startCacheRefreshInterval();
  }

  protected async executeCore(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    const startTime = performance.now();

    try {
      switch (input.action) {
        case "check": {
          return await this.checkFeatureFlag(input);
        }
        case "list": {
          return await this.listFeatureFlags(input);
        }
        case "create": {
          return await this.createFeatureFlag(input);
        }
        case "update": {
          return await this.updateFeatureFlag(input);
        }
        case "delete": {
          return await this.deleteFeatureFlag(input);
        }
        case "bulk_check": {
          return await this.bulkCheckFeatureFlags(input);
        }
        default: {
          throw new Error(`Unsupported action: ${input.action}`);
        }
      }
    } finally {
      const duration = performance.now() - startTime;
      await this.recordMetric("feature_flag_operation", {
        action: input.action,
        duration_ms: duration,
        cache_size: this.flagCache.size,
      });
    }
  }

  private async checkFeatureFlag(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    if (!input.flag_name) {
      throw new Error("flag_name is required for check action");
    }

    const evaluationStart = performance.now();
    const flag = await this.getFeatureFlag(input.flag_name);

    if (!flag) {
      return {
        success: true,
        flag_enabled: false,
        reason: "Flag not found",
        evaluation_metadata: {
          evaluated_at: new Date().toISOString(),
          evaluation_time_ms: performance.now() - evaluationStart,
          conditions_checked: [],
          matching_conditions: [],
          cache_hit: false,
        },
      };
    }

    const evaluation = await this.evaluateFeatureFlag(
      flag,
      input.context || {},
    );

    return {
      success: true,
      flag_enabled: evaluation.enabled,
      flag_details: flag,
      reason: evaluation.reason,
      evaluation_metadata: {
        evaluated_at: new Date().toISOString(),
        evaluation_time_ms: performance.now() - evaluationStart,
        conditions_checked: evaluation.conditionsChecked,
        matching_conditions: evaluation.matchingConditions,
        rollout_bucket: evaluation.rolloutBucket,
        cache_hit: evaluation.cacheHit,
      },
    };
  }

  private async bulkCheckFeatureFlags(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    if (!input.flag_names || input.flag_names.length === 0) {
      throw new Error("flag_names is required for bulk_check action");
    }

    const context = input.context || {};
    const results: Record<string, boolean> = {};

    const checkPromises = input.flag_names.map(async (flagName) => {
      const flag = await this.getFeatureFlag(flagName);
      if (!flag) {
        results[flagName] = false;
        return;
      }

      const evaluation = await this.evaluateFeatureFlag(flag, context);
      results[flagName] = evaluation.enabled;
    });

    await Promise.all(checkPromises);

    return {
      success: true,
      bulk_results: results,
    };
  }

  private async listFeatureFlags(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    let query = this.supabase
      .from("ai_feature_flags")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    // Apply filters
    if (input.filters) {
      if (input.filters.enabled !== undefined) {
        query = query.eq("enabled", input.filters.enabled);
      }

      if (input.filters.category) {
        query = query.contains("metadata", {
          category: input.filters.category,
        });
      }

      if (input.filters.environment) {
        query = query.contains("metadata", {
          environment: input.filters.environment,
        });
      }

      if (input.filters.owner) {
        query = query.contains("metadata", { owner: input.filters.owner });
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list feature flags: ${error.message}`);
    }

    return {
      success: true,
      flags: data || [],
    };
  }

  private async createFeatureFlag(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    if (!input.flag_data) {
      throw new Error("flag_data is required for create action");
    }

    const flagData = {
      ...input.flag_data,
      id: input.flag_data.id
        || `ff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        environment: this.DEFAULT_ENVIRONMENT,
        priority: "medium" as const,
        risk_level: "low" as const,
        ...input.flag_data.metadata,
      },
    };

    const { data, error } = await this.supabase
      .from("ai_feature_flags")
      .insert(flagData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feature flag: ${error.message}`);
    }

    // Update cache
    this.flagCache.set(data.name, data);
    this.cacheExpiry.set(data.name, Date.now() + this.CACHE_TTL_MS);

    await this.auditLog({
      action: "feature_flag_created",
      resource_type: "feature_flag",
      resource_id: data.id,
      details: {
        flag_name: data.name,
        enabled: data.enabled,
        category: data.metadata?.category,
      },
    });

    return {
      success: true,
      flag_details: data,
    };
  }

  private async updateFeatureFlag(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    if (!(input.flag_name && input.flag_data)) {
      throw new Error("flag_name and flag_data are required for update action");
    }

    const updateData = {
      ...input.flag_data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("ai_feature_flags")
      .update(updateData)
      .eq("name", input.flag_name)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }

    // Update cache
    this.flagCache.set(data.name, data);
    this.cacheExpiry.set(data.name, Date.now() + this.CACHE_TTL_MS);

    await this.auditLog({
      action: "feature_flag_updated",
      resource_type: "feature_flag",
      resource_id: data.id,
      details: {
        flag_name: data.name,
        enabled: data.enabled,
        changes: updateData,
      },
    });

    return {
      success: true,
      flag_details: data,
    };
  }

  private async deleteFeatureFlag(
    input: FeatureFlagInput,
  ): Promise<FeatureFlagOutput> {
    if (!input.flag_name) {
      throw new Error("flag_name is required for delete action");
    }

    const { error } = await this.supabase
      .from("ai_feature_flags")
      .delete()
      .eq("name", input.flag_name);

    if (error) {
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }

    // Remove from cache
    this.flagCache.delete(input.flag_name);
    this.cacheExpiry.delete(input.flag_name);

    await this.auditLog({
      action: "feature_flag_deleted",
      resource_type: "feature_flag",
      details: {
        flag_name: input.flag_name,
      },
    });

    return {
      success: true,
    };
  }

  private async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cached = this.flagCache.get(flagName);
    const cacheExpiry = this.cacheExpiry.get(flagName);

    if (cached && cacheExpiry && Date.now() < cacheExpiry) {
      return cached;
    }

    // Fetch from database
    const { data, error } = await this.supabase
      .from("ai_feature_flags")
      .select("*")
      .eq("name", flagName)
      .single();

    if (error || !data) {
      return;
    }

    // Update cache
    this.flagCache.set(flagName, data);
    this.cacheExpiry.set(flagName, Date.now() + this.CACHE_TTL_MS);

    return data;
  }

  private async evaluateFeatureFlag(
    flag: FeatureFlag,
    context: FeatureFlagContext,
  ): Promise<{
    enabled: boolean;
    reason: string;
    conditionsChecked: string[];
    matchingConditions: string[];
    rolloutBucket?: number;
    cacheHit?: boolean;
  }> {
    const conditionsChecked: string[] = [];
    const matchingConditions: string[] = [];

    // If flag is disabled, return false immediately
    if (!flag.enabled) {
      return {
        enabled: false,
        reason: "Flag is globally disabled",
        conditionsChecked: ["global_enabled"],
        matchingConditions: [],
      };
    }

    // Check environment conditions
    if (flag.conditions.environment && flag.conditions.environment.length > 0) {
      conditionsChecked.push("environment");
      const currentEnv = context.environment || this.DEFAULT_ENVIRONMENT;

      if (!flag.conditions.environment.includes(currentEnv)) {
        return {
          enabled: false,
          reason: `Environment '${currentEnv}' not in allowed environments`,
          conditionsChecked,
          matchingConditions,
        };
      }
      matchingConditions.push("environment");
    }

    // Check user role conditions
    if (flag.conditions.user_roles && flag.conditions.user_roles.length > 0) {
      conditionsChecked.push("user_roles");

      if (!context.user_roles || context.user_roles.length === 0) {
        return {
          enabled: false,
          reason: "User roles required but not provided",
          conditionsChecked,
          matchingConditions,
        };
      }

      const hasRequiredRole = flag.conditions.user_roles.some((role) =>
        context.user_roles?.includes(role)
      );

      if (!hasRequiredRole) {
        return {
          enabled: false,
          reason: "User does not have required role",
          conditionsChecked,
          matchingConditions,
        };
      }
      matchingConditions.push("user_roles");
    }

    // Check user ID whitelist
    if (flag.conditions.user_ids && flag.conditions.user_ids.length > 0) {
      conditionsChecked.push("user_ids");

      if (
        !(context.user_id && flag.conditions.user_ids.includes(context.user_id))
      ) {
        return {
          enabled: false,
          reason: "User ID not in whitelist",
          conditionsChecked,
          matchingConditions,
        };
      }
      matchingConditions.push("user_ids");
    }

    // Check clinic ID conditions
    if (flag.conditions.clinic_ids && flag.conditions.clinic_ids.length > 0) {
      conditionsChecked.push("clinic_ids");

      if (
        !(
          context.clinic_id
          && flag.conditions.clinic_ids.includes(context.clinic_id)
        )
      ) {
        return {
          enabled: false,
          reason: "Clinic ID not in allowed list",
          conditionsChecked,
          matchingConditions,
        };
      }
      matchingConditions.push("clinic_ids");
    }

    // Check time restrictions
    if (
      flag.conditions.time_restrictions
      && flag.conditions.time_restrictions.length > 0
    ) {
      conditionsChecked.push("time_restrictions");

      const now = new Date();
      const isTimeAllowed = flag.conditions.time_restrictions.some(
        (restriction) => {
          const startTime = new Date(restriction.start_time);
          const endTime = new Date(restriction.end_time);

          // Check if current time is within the time window
          if (now >= startTime && now <= endTime) {
            // If days of week are specified, check current day
            if (
              restriction.days_of_week
              && restriction.days_of_week.length > 0
            ) {
              return restriction.days_of_week.includes(now.getDay());
            }
            return true;
          }
          return false;
        },
      );

      if (!isTimeAllowed) {
        return {
          enabled: false,
          reason: "Current time is outside allowed time restrictions",
          conditionsChecked,
          matchingConditions,
        };
      }
      matchingConditions.push("time_restrictions");
    }

    // Check percentage rollout
    if (
      flag.conditions.percentage_rollout !== undefined
      && flag.conditions.percentage_rollout < 100
    ) {
      conditionsChecked.push("percentage_rollout");

      // Use user ID for consistent bucketing, fallback to random
      const bucketKey = context.user_id || Math.random().toString();
      const bucket = this.calculateRolloutBucket(bucketKey, flag.name);

      if (bucket > flag.conditions.percentage_rollout) {
        return {
          enabled: false,
          reason: `User not in rollout percentage (${flag.conditions.percentage_rollout}%)`,
          conditionsChecked,
          matchingConditions,
          rolloutBucket: bucket,
        };
      }
      matchingConditions.push("percentage_rollout");
    }

    // All conditions passed
    return {
      enabled: true,
      reason: "All conditions satisfied",
      conditionsChecked,
      matchingConditions,
      cacheHit: this.flagCache.has(flag.name),
    };
  }

  private calculateRolloutBucket(key: string, flagName: string): number {
    // Create a hash from user key and flag name for consistent bucketing
    const hash = this.simpleHash(key + flagName);
    return hash % 100;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.codePointAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private startCacheRefreshInterval(): void {
    setInterval(async () => {
      try {
        await this.refreshCache();
      } catch {}
    }, this.CACHE_TTL_MS);
  }

  private async refreshCache(): Promise<void> {
    const { data, error } = await this.supabase
      .from("ai_feature_flags")
      .select("*")
      .eq("enabled", true);

    if (error) {
      return;
    }

    // Update cache with fresh data
    this.flagCache.clear();
    this.cacheExpiry.clear();

    if (data) {
      const expiry = Date.now() + this.CACHE_TTL_MS;
      data.forEach((flag) => {
        this.flagCache.set(flag.name, flag);
        this.cacheExpiry.set(flag.name, expiry);
      });
    }

    await this.recordMetric("cache_refresh", {
      flags_cached: this.flagCache.size,
      timestamp: new Date().toISOString(),
    });
  }

  // Helper methods for common feature flag patterns
  public async isFeatureEnabled(
    flagName: string,
    context?: FeatureFlagContext,
  ): Promise<boolean> {
    const result = await this.execute({
      action: "check",
      flag_name: flagName,
      context,
    });

    return result.flag_enabled;
  }

  public async getEnabledFeatures(
    flagNames: string[],
    context?: FeatureFlagContext,
  ): Promise<string[]> {
    const result = await this.execute({
      action: "bulk_check",
      flag_names: flagNames,
      context,
    });

    if (!result.bulk_results) {
      return [];
    }

    return Object.entries(result.bulk_results)
      .filter(([_, enabled]) => enabled)
      .map(([flagName]) => flagName);
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();
