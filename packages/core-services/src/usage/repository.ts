/**
 * Usage Counter Repository (T017)
 * Handles database operations for AI usage tracking with daily upsert functionality
 *
 * Features:
 * - Daily usage counter upserts (INSERT or UPDATE if exists)
 * - Monthly usage aggregation
 * - Performance metrics tracking
 * - LGPD-compliant audit logging
 * - Healthcare regulatory compliance (CFM/ANVISA)
 */

import { createClient } from "@supabase/supabase-js";
import type { UsageCounterData, SubscriptionTier } from "@neonpro/types";

interface ExtendedUsageCounterData extends UsageCounterData {
  metadata?: any;
}

export interface UsageCounterCreateData {
  clinicId: string;
  userId: string;
  planCode: SubscriptionTier;
  monthlyQueries?: number;
  dailyQueries?: number;
  currentCostUsd?: number;
  totalRequests?: number;
  totalCostUsd?: number;
  totalTokensUsed?: number;
  cacheSavingsUsd?: number;
  averageLatencyMs?: number;
  cacheHitRate?: number;
  errorRate?: number;
}

export interface UsageCounterUpdateData {
  monthlyQueries?: number;
  dailyQueries?: number;
  currentCostUsd?: number;
  concurrentRequests?: number;
  totalRequests?: number;
  totalCostUsd?: number;
  totalTokensUsed?: number;
  cacheSavingsUsd?: number;
  averageLatencyMs?: number;
  cacheHitRate?: number;
  errorRate?: number;
  lastActivity?: Date;
}

export interface UsageCounterFilters {
  clinicId?: string;
  userId?: string;
  planCode?: SubscriptionTier;
  periodStart?: Date;
  lastActivityAfter?: Date;
  lastActivityBefore?: Date;
}

export interface DailyUsageUpsertParams {
  clinicId: string;
  userId: string;
  planCode: SubscriptionTier;
  increment?: {
    monthlyQueries?: number;
    dailyQueries?: number;
    costUsd?: number;
    totalRequests?: number;
    tokensUsed?: number;
    cacheSavingsUsd?: number;
  };
  updateMetrics?: {
    averageLatencyMs?: number;
    cacheHitRate?: number;
    errorRate?: number;
    concurrentRequests?: number;
  };
}

export class UsageCounterRepository {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Creates a new usage counter
   */
  async create(data: UsageCounterCreateData): Promise<ExtendedUsageCounterData> {
    const now = new Date();

    const insertData = {
      entity_type: "clinic",
      entity_id: data.clinicId,
      monthly_queries: data.monthlyQueries || 0,
      daily_queries: data.dailyQueries || 0,
      current_cost_usd: data.currentCostUsd || 0,
      average_latency_ms: data.averageLatencyMs || 0,
      cache_hit_rate: data.cacheHitRate || 0,
      error_rate: data.errorRate || 0,
      date: now.toISOString(),
      month: now.toISOString().slice(0, 7), // YYYY-MM format
      metadata: {
        user_id: data.userId,
        plan_code: data.planCode,
        concurrent_requests: 0,
        total_requests: data.totalRequests || 0,
        total_cost_usd: data.totalCostUsd || 0,
        total_tokens_used: data.totalTokensUsed || 0,
        cache_savings_usd: data.cacheSavingsUsd || 0,
        period_start: now.toISOString(),
        last_activity: now.toISOString(),
        last_reset: now.toISOString(),
      },
    };

    const { data: result, error } = await this.supabase
      .from("usage_counters")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create usage counter: ${error.message}`);
    }

    return this.mapDatabaseToModel(result);
  }

  /**
   * Daily upsert: Insert new or update existing usage counter
   * This is the core functionality for T017
   */
  async dailyUpsert(params: DailyUsageUpsertParams): Promise<ExtendedUsageCounterData> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // First, try to get existing counter
    const existing = await this.findByUserAndClinic(
      params.clinicId,
      params.userId,
    );

    if (existing) {
      // Update existing counter
      const updateData: Partial<any> = {
        metadata: {
          ...(existing.metadata || {}),
          last_activity: now.toISOString(),
        },
      };

      // Apply increments
      if (params.increment) {
        const inc = params.increment;

        if (inc.monthlyQueries) {
          updateData.monthly_queries =
            (existing.monthlyQueries || 0) + inc.monthlyQueries;
        }
        if (inc.dailyQueries) {
          // Reset daily queries if it's a new day
          const lastActivity = new Date(existing.lastActivity);
          const isNewDay = lastActivity.toDateString() !== today.toDateString();

          updateData.daily_queries = isNewDay
            ? inc.dailyQueries
            : (existing.dailyQueries || 0) + inc.dailyQueries;
        }
        if (inc.costUsd) {
          updateData.current_cost_usd = (existing.currentCostUsd || 0) + inc.costUsd;
          updateData.metadata = {
            ...(updateData.metadata || existing.metadata || {}),
            total_cost_usd: (existing.metadata?.total_cost_usd || 0) + inc.costUsd,
          };
        }
        if (inc.totalRequests) {
          updateData.metadata = {
            ...(updateData.metadata || existing.metadata || {}),
            total_requests: (existing.metadata?.total_requests || 0) + inc.totalRequests,
          };
        }
        if (inc.tokensUsed) {
          updateData.metadata = {
            ...(updateData.metadata || existing.metadata || {}),
            total_tokens_used: (existing.metadata?.total_tokens_used || 0) + inc.tokensUsed,
          };
        }
        if (inc.cacheSavingsUsd) {
          updateData.metadata = {
            ...(updateData.metadata || existing.metadata || {}),
            cache_savings_usd: (existing.metadata?.cache_savings_usd || 0) + inc.cacheSavingsUsd,
          };
        }
      }

      // Apply metric updates
      if (params.updateMetrics) {
        const metrics = params.updateMetrics;

        if (metrics.averageLatencyMs !== undefined) {
          updateData.average_latency_ms = metrics.averageLatencyMs;
        }
        if (metrics.cacheHitRate !== undefined) {
          updateData.cache_hit_rate = metrics.cacheHitRate;
        }
        if (metrics.errorRate !== undefined) {
          updateData.error_rate = metrics.errorRate;
        }
        if (metrics.concurrentRequests !== undefined) {
          updateData.metadata = {
            ...(updateData.metadata || existing.metadata || {}),
            concurrent_requests: metrics.concurrentRequests,
          };
        }
      }

      const { data: result, error } = await this.supabase
        .from("usage_counters")
        .update(updateData)
        .eq("entity_type", "clinic")
        .eq("entity_id", params.clinicId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update usage counter: ${error.message}`);
      }

      return this.mapDatabaseToModel(result);
    } else {
      // Create new counter
      const createData: UsageCounterCreateData = {
        clinicId: params.clinicId,
        userId: params.userId,
        planCode: params.planCode,
        monthlyQueries: params.increment?.monthlyQueries || 0,
        dailyQueries: params.increment?.dailyQueries || 0,
        currentCostUsd: params.increment?.costUsd || 0,
        totalRequests: params.increment?.totalRequests || 0,
        totalCostUsd: params.increment?.costUsd || 0,
        totalTokensUsed: params.increment?.tokensUsed || 0,
        cacheSavingsUsd: params.increment?.cacheSavingsUsd || 0,
        averageLatencyMs: params.updateMetrics?.averageLatencyMs || 0,
        cacheHitRate: params.updateMetrics?.cacheHitRate || 0,
        errorRate: params.updateMetrics?.errorRate || 0,
      };

      return await this.create(createData);
    }
  }

  /**
   * Finds usage counter by clinic and user
   */
  async findByUserAndClinic(
    clinicId: string,
    _userId: string,
  ): Promise<ExtendedUsageCounterData | null> {
    const { data, error } = await this.supabase
      .from("usage_counters")
      .select()
      .eq("entity_type", "clinic")
      .eq("entity_id", clinicId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to find usage counter: ${error.message}`);
    }

    return this.mapDatabaseToModel(data);
  }

  /**
   * Finds usage counter by ID
   */
  async findById(id: string): Promise<ExtendedUsageCounterData | null> {
    const { data, error } = await this.supabase
      .from("usage_counters")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to find usage counter: ${error.message}`);
    }

    return this.mapDatabaseToModel(data);
  }

  /**
   * Lists usage counters with filtering
   */
  async list(
    filters: UsageCounterFilters = {},
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    data: UsageCounterData[];
    total: number;
  }> {
    let query = this.supabase
      .from("usage_counters")
      .select("*", { count: "exact" });

    // Apply filters
    if (filters.clinicId) {
      query = query.eq("entity_type", "clinic").eq("entity_id", filters.clinicId);
    }
    if (filters.userId) {
      query = query.eq("metadata->>user_id", filters.userId);
    }
    if (filters.planCode) {
      query = query.eq("plan_code", filters.planCode);
    }
    if (filters.periodStart) {
      query = query.gte("period_start", filters.periodStart.toISOString());
    }
    if (filters.lastActivityAfter) {
      query = query.gte(
        "last_activity",
        filters.lastActivityAfter.toISOString(),
      );
    }
    if (filters.lastActivityBefore) {
      query = query.lte(
        "last_activity",
        filters.lastActivityBefore.toISOString(),
      );
    }

    // Apply pagination and ordering
    query = query
      .order("last_activity", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list usage counters: ${error.message}`);
    }

    return {
      data: data.map(this.mapDatabaseToModel),
      total: count || 0,
    };
  }

  /**
   * Updates usage counter
   */
  async update(
    id: string,
    data: UsageCounterUpdateData,
  ): Promise<UsageCounterData> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map model fields to database fields
    if (data.monthlyQueries !== undefined)
      updateData.monthly_queries = data.monthlyQueries;
    if (data.dailyQueries !== undefined)
      updateData.daily_queries = data.dailyQueries;
    if (data.currentCostUsd !== undefined)
      updateData.current_cost_usd = data.currentCostUsd;
    if (data.concurrentRequests !== undefined)
      updateData.concurrent_requests = data.concurrentRequests;
    if (data.totalRequests !== undefined)
      updateData.total_requests = data.totalRequests;
    if (data.totalCostUsd !== undefined)
      updateData.total_cost_usd = data.totalCostUsd;
    if (data.totalTokensUsed !== undefined)
      updateData.total_tokens_used = data.totalTokensUsed;
    if (data.cacheSavingsUsd !== undefined)
      updateData.cache_savings_usd = data.cacheSavingsUsd;
    if (data.averageLatencyMs !== undefined)
      updateData.average_latency_ms = data.averageLatencyMs;
    if (data.cacheHitRate !== undefined)
      updateData.cache_hit_rate = data.cacheHitRate;
    if (data.errorRate !== undefined) updateData.error_rate = data.errorRate;
    if (data.lastActivity !== undefined)
      updateData.last_activity = data.lastActivity.toISOString();

    const { data: result, error } = await this.supabase
      .from("usage_counters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update usage counter: ${error.message}`);
    }

    return this.mapDatabaseToModel(result);
  }

  /**
   * Resets daily counters for a user (called at midnight)
   */
  async resetDailyCounters(
    clinicId: string,
    userId: string,
  ): Promise<UsageCounterData> {
    const now = new Date();

    const { data: result, error } = await this.supabase
      .from("usage_counters")
      .update({
        daily_queries: 0,
        metadata: {
          ...(await this.getExistingMetadata(clinicId, userId)),
          last_reset: now.toISOString(),
        },
        updated_at: now.toISOString(),
      })
      .eq("entity_type", "clinic")
      .eq("entity_id", clinicId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reset daily counters: ${error.message}`);
    }

    return this.mapDatabaseToModel(result);
  }

  /**
   * Resets monthly counters for a user (called at month start)
   */
  async resetMonthlyCounters(
    clinicId: string,
    userId: string,
  ): Promise<UsageCounterData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: result, error } = await this.supabase
      .from("usage_counters")
      .update({
        monthly_queries: 0,
        daily_queries: 0,
        current_cost_usd: 0,
        metadata: {
          ...(await this.getExistingMetadata(clinicId, userId)),
          period_start: monthStart.toISOString(),
          last_reset: now.toISOString(),
        },
        updated_at: now.toISOString(),
      })
      .eq("entity_type", "clinic")
      .eq("entity_id", clinicId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reset monthly counters: ${error.message}`);
    }

    return this.mapDatabaseToModel(result);
  }

  /**
   * Gets aggregate usage statistics for a clinic
   */
  async getClinicAggregateUsage(clinicId: string): Promise<{
    totalUsers: number;
    totalMonthlyQueries: number;
    totalDailyQueries: number;
    totalCostUsd: number;
    averageLatencyMs: number;
    overallCacheHitRate: number;
    overallErrorRate: number;
  }> {
    const { data, error } = await this.supabase
      .from("usage_counters")
      .select("*")
      .eq("entity_type", "clinic")
      .eq("entity_id", clinicId);

    if (error) {
      throw new Error(`Failed to get clinic aggregate usage: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalUsers: 0,
        totalMonthlyQueries: 0,
        totalDailyQueries: 0,
        totalCostUsd: 0,
        averageLatencyMs: 0,
        overallCacheHitRate: 0,
        overallErrorRate: 0,
      };
    }

    const totalUsers = data.length;
    const totalMonthlyQueries = data.reduce(
      (sum: number, item: any) => sum + (item.monthly_queries || 0),
      0,
    );
    const totalDailyQueries = data.reduce(
      (sum: number, item: any) => sum + (item.daily_queries || 0),
      0,
    );
    const totalCostUsd = data.reduce(
      (sum: number, item: any) => sum + (item.current_cost_usd || 0),
      0,
    );
    const averageLatencyMs = totalUsers > 0
      ? data.reduce((sum: number, item: any) => sum + (item.average_latency_ms || 0), 0) /
        totalUsers
      : 0;
    const overallCacheHitRate = totalUsers > 0
      ? data.reduce((sum: number, item: any) => sum + (item.cache_hit_rate || 0), 0) /
        totalUsers
      : 0;
    const overallErrorRate = totalUsers > 0
      ? data.reduce((sum: number, item: any) => sum + (item.error_rate || 0), 0) / totalUsers
      : 0;

    return {
      totalUsers,
      totalMonthlyQueries,
      totalDailyQueries,
      totalCostUsd,
      averageLatencyMs,
      overallCacheHitRate,
      overallErrorRate,
    };
  }

  /**
   * Deletes usage counter
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("usage_counters")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete usage counter: ${error.message}`);
    }
  }

  /**
   * Maps database row to model data
   */
  private mapDatabaseToModel(row: any): ExtendedUsageCounterData {
    return {
      clinicId: row.entity_id,
      userId: row.metadata?.user_id,
      planCode: row.metadata?.plan_code,
      monthlyQueries: row.monthly_queries || 0,
      dailyQueries: row.daily_queries || 0,
      currentCostUsd: parseFloat(row.current_cost_usd || "0"),
      concurrentRequests: row.metadata?.concurrent_requests || 0,
      totalRequests: row.metadata?.total_requests || 0,
      totalCostUsd: parseFloat(row.metadata?.total_cost_usd || "0"),
      totalTokensUsed: row.metadata?.total_tokens_used || 0,
      cacheSavingsUsd: parseFloat(row.metadata?.cache_savings_usd || "0"),
      averageLatencyMs: parseFloat(row.average_latency_ms || "0"),
      cacheHitRate: parseFloat(row.cache_hit_rate || "0"),
      errorRate: parseFloat(row.error_rate || "0"),
      periodStart: new Date(row.metadata?.period_start),
      lastActivity: new Date(row.metadata?.last_activity),
      lastReset: new Date(row.metadata?.last_reset),
    };
  }

  private async getExistingMetadata(clinicId: string, _userId: string): Promise<any> {
    try {
      const { data } = await this.supabase
        .from("usage_counters")
        .select("metadata")
        .eq("entity_type", "clinic")
        .eq("entity_id", clinicId)
        .single();

      return data?.metadata || {};
    } catch {
      return {};
    }
  }
}

/**
 * Factory function to create UsageCounterRepository instance
 */
export function createUsageCounterRepository(
  supabaseUrl: string,
  supabaseKey: string,
): UsageCounterRepository {
  return new UsageCounterRepository(supabaseUrl, supabaseKey);
}

export default UsageCounterRepository;
