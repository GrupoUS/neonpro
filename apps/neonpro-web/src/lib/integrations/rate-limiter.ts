/**
 * NeonPro - Integration Rate Limiter
 * Rate limiting implementation for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type { createClient } from "@supabase/supabase-js";
import type { RateLimitConfig, RateLimiter } from "./types";

/**
 * Redis-like rate limiter implementation using Supabase
 */
export class SupabaseRateLimiter implements RateLimiter {
  private supabase: any;
  private cache: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredEntries();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Check if request is within rate limits
   */
  async checkLimit(integrationId: string, endpoint: string): Promise<boolean> {
    try {
      const config = await this.getRateLimitConfig(integrationId);
      if (!config) {
        return true; // No limits configured
      }

      const now = Date.now();
      const key = `${integrationId}:${endpoint}`;

      // Check minute limit
      const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
      const minuteCount = await this.getCount(minuteKey);
      if (minuteCount >= config.requestsPerMinute) {
        return false;
      }

      // Check hour limit
      const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
      const hourCount = await this.getCount(hourKey);
      if (hourCount >= config.requestsPerHour) {
        return false;
      }

      // Check day limit
      const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
      const dayCount = await this.getCount(dayKey);
      if (dayCount >= config.requestsPerDay) {
        return false;
      }

      // Check burst limit
      const burstKey = `${key}:burst`;
      const burstEntry = this.cache.get(burstKey);
      if (burstEntry) {
        const timeDiff = now - burstEntry.timestamp;
        if (timeDiff < config.windowSize && burstEntry.count >= config.burstLimit) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return true; // Fail open
    }
  }

  /**
   * Increment request counter
   */
  async incrementCounter(integrationId: string, endpoint: string): Promise<void> {
    try {
      const config = await this.getRateLimitConfig(integrationId);
      if (!config) {
        return; // No limits configured
      }

      const now = Date.now();
      const key = `${integrationId}:${endpoint}`;

      // Increment minute counter
      const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
      await this.incrementCount(minuteKey, 60);

      // Increment hour counter
      const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
      await this.incrementCount(hourKey, 3600);

      // Increment day counter
      const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
      await this.incrementCount(dayKey, 86400);

      // Update burst counter
      const burstKey = `${key}:burst`;
      const burstEntry = this.cache.get(burstKey);
      if (burstEntry && now - burstEntry.timestamp < config.windowSize) {
        burstEntry.count++;
      } else {
        this.cache.set(burstKey, {
          count: 1,
          timestamp: now,
          expiresAt: now + config.windowSize,
        });
      }
    } catch (error) {
      console.error("Failed to increment counter:", error);
    }
  }

  /**
   * Get remaining requests for an integration/endpoint
   */
  async getRemainingRequests(integrationId: string, endpoint: string): Promise<number> {
    try {
      const config = await this.getRateLimitConfig(integrationId);
      if (!config) {
        return Infinity; // No limits configured
      }

      const now = Date.now();
      const key = `${integrationId}:${endpoint}`;

      // Check minute limit (most restrictive)
      const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
      const minuteCount = await this.getCount(minuteKey);
      const minuteRemaining = Math.max(0, config.requestsPerMinute - minuteCount);

      // Check hour limit
      const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
      const hourCount = await this.getCount(hourKey);
      const hourRemaining = Math.max(0, config.requestsPerHour - hourCount);

      // Check day limit
      const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
      const dayCount = await this.getCount(dayKey);
      const dayRemaining = Math.max(0, config.requestsPerDay - dayCount);

      // Return the most restrictive limit
      return Math.min(minuteRemaining, hourRemaining, dayRemaining);
    } catch (error) {
      console.error("Failed to get remaining requests:", error);
      return 0;
    }
  }

  /**
   * Reset all limits for an integration
   */
  async resetLimits(integrationId: string): Promise<void> {
    try {
      // Clear from database
      await this.supabase.from("rate_limit_counters").delete().like("key", `${integrationId}:%`);

      // Clear from cache
      for (const [key] of this.cache) {
        if (key.startsWith(`${integrationId}:`)) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.error("Failed to reset limits:", error);
    }
  }

  /**
   * Get usage statistics for an integration
   */
  async getUsageStats(integrationId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.supabase
        .from("rate_limit_counters")
        .select("key, count")
        .like("key", `${integrationId}:%`);

      if (error) {
        throw error;
      }

      const stats: Record<string, number> = {};
      for (const item of data || []) {
        const parts = item.key.split(":");
        if (parts.length >= 3) {
          const endpoint = parts[1];
          const period = parts[2];
          const statKey = `${endpoint}_${period}`;
          stats[statKey] = item.count;
        }
      }

      return stats;
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      return {};
    }
  }

  /**
   * Get rate limit configuration for an integration
   */
  private async getRateLimitConfig(integrationId: string): Promise<RateLimitConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from("integrations")
        .select("rate_limits")
        .eq("id", integrationId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.rate_limits;
    } catch (error) {
      console.error("Failed to get rate limit config:", error);
      return null;
    }
  }

  /**
   * Get count from database or cache
   */
  private async getCount(key: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.count;
      }

      // Check database
      const { data, error } = await this.supabase
        .from("rate_limit_counters")
        .select("count, expires_at")
        .eq("key", key)
        .single();

      if (error || !data) {
        return 0;
      }

      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt <= Date.now()) {
        // Expired, delete it
        await this.supabase.from("rate_limit_counters").delete().eq("key", key);
        return 0;
      }

      // Cache the result
      this.cache.set(key, {
        count: data.count,
        timestamp: Date.now(),
        expiresAt,
      });

      return data.count;
    } catch (error) {
      console.error("Failed to get count:", error);
      return 0;
    }
  }

  /**
   * Increment count in database and cache
   */
  private async incrementCount(key: string, ttlSeconds: number): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = new Date(now + ttlSeconds * 1000);

      // Try to increment existing record
      const { data: existing } = await this.supabase
        .from("rate_limit_counters")
        .select("count")
        .eq("key", key)
        .single();

      if (existing) {
        // Update existing
        await this.supabase
          .from("rate_limit_counters")
          .update({
            count: existing.count + 1,
            updated_at: new Date(),
          })
          .eq("key", key);

        // Update cache
        const cached = this.cache.get(key);
        if (cached) {
          cached.count++;
        }
      } else {
        // Create new
        await this.supabase.from("rate_limit_counters").insert({
          key,
          count: 1,
          expires_at: expiresAt,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Add to cache
        this.cache.set(key, {
          count: 1,
          timestamp: now,
          expiresAt: expiresAt.getTime(),
        });
      }
    } catch (error) {
      console.error("Failed to increment count:", error);
    }
  }

  /**
   * Clean up expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

/**
 * In-memory rate limiter for development/testing
 */
export class MemoryRateLimiter implements RateLimiter {
  private counters: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 1000);
  }

  /**
   * Set rate limit configuration for an integration
   */
  setConfig(integrationId: string, config: RateLimitConfig): void {
    this.configs.set(integrationId, config);
  }

  async checkLimit(integrationId: string, endpoint: string): Promise<boolean> {
    const config = this.configs.get(integrationId);
    if (!config) {
      return true;
    }

    const now = Date.now();
    const key = `${integrationId}:${endpoint}`;

    // Check minute limit
    const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
    if (this.getCount(minuteKey) >= config.requestsPerMinute) {
      return false;
    }

    // Check hour limit
    const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
    if (this.getCount(hourKey) >= config.requestsPerHour) {
      return false;
    }

    // Check day limit
    const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
    if (this.getCount(dayKey) >= config.requestsPerDay) {
      return false;
    }

    // Check burst limit
    const burstKey = `${key}:burst`;
    const burstEntry = this.counters.get(burstKey);
    if (burstEntry) {
      const timeDiff = now - burstEntry.timestamp;
      if (timeDiff < config.windowSize && burstEntry.count >= config.burstLimit) {
        return false;
      }
    }

    return true;
  }

  async incrementCounter(integrationId: string, endpoint: string): Promise<void> {
    const config = this.configs.get(integrationId);
    if (!config) {
      return;
    }

    const now = Date.now();
    const key = `${integrationId}:${endpoint}`;

    // Increment minute counter
    const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
    this.incrementCount(minuteKey, now + 60000);

    // Increment hour counter
    const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
    this.incrementCount(hourKey, now + 3600000);

    // Increment day counter
    const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
    this.incrementCount(dayKey, now + 86400000);

    // Update burst counter
    const burstKey = `${key}:burst`;
    const burstEntry = this.counters.get(burstKey);
    if (burstEntry && now - burstEntry.timestamp < config.windowSize) {
      burstEntry.count++;
    } else {
      this.counters.set(burstKey, {
        count: 1,
        timestamp: now,
        expiresAt: now + config.windowSize,
      });
    }
  }

  async getRemainingRequests(integrationId: string, endpoint: string): Promise<number> {
    const config = this.configs.get(integrationId);
    if (!config) {
      return Infinity;
    }

    const now = Date.now();
    const key = `${integrationId}:${endpoint}`;

    const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
    const minuteRemaining = Math.max(0, config.requestsPerMinute - this.getCount(minuteKey));

    const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
    const hourRemaining = Math.max(0, config.requestsPerHour - this.getCount(hourKey));

    const dayKey = `${key}:day:${Math.floor(now / 86400000)}`;
    const dayRemaining = Math.max(0, config.requestsPerDay - this.getCount(dayKey));

    return Math.min(minuteRemaining, hourRemaining, dayRemaining);
  }

  async resetLimits(integrationId: string): Promise<void> {
    for (const [key] of this.counters) {
      if (key.startsWith(`${integrationId}:`)) {
        this.counters.delete(key);
      }
    }
  }

  async getUsageStats(integrationId: string): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    for (const [key, entry] of this.counters) {
      if (key.startsWith(`${integrationId}:`) && entry.expiresAt > Date.now()) {
        const parts = key.split(":");
        if (parts.length >= 3) {
          const endpoint = parts[1];
          const period = parts[2];
          const statKey = `${endpoint}_${period}`;
          stats[statKey] = entry.count;
        }
      }
    }
    return stats;
  }

  private getCount(key: string): number {
    const entry = this.counters.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      return 0;
    }
    return entry.count;
  }

  private incrementCount(key: string, expiresAt: number): void {
    const existing = this.counters.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      existing.count++;
    } else {
      this.counters.set(key, {
        count: 1,
        timestamp: Date.now(),
        expiresAt,
      });
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.counters) {
      if (entry.expiresAt <= now) {
        this.counters.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.counters.clear();
    this.configs.clear();
  }
}

interface RateLimitEntry {
  count: number;
  timestamp: number;
  expiresAt: number;
}
