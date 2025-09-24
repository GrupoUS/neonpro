// RateCounter service (Phase 1)
// Memory-only counters for fairness limits: 10/5m and 30/1h per user.

import { LRUCache } from 'lru-cache';

export interface RateCounterConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

export interface CounterKey {
  type: string;
  value: string;
}

export interface RateData {
  count: number;
  remaining: number;
  resetTime: Date;
  blocked: boolean;
}

interface Counters {
  c5: number;
  c60: number;
  t5: number;
  t60: number;
}

export class RateCounter {
  private config: RateCounterConfig;
  private store = new LRUCache<string, Counters>({
    max: 5000,
    ttl: 90 * 60 * 1000,
  }); // 90m TTL

  constructor(config: RateCounterConfig) {
    this.config = config;
  }

  private now(): number {
    return Date.now();
  }

  increment(key: string): void {
    const n = this.now();
    const prev = this.store.get(key) ?? { c5: 0, c60: 0, t5: n, t60: n };

    // decay 5m window
    if (n - prev.t5 > 5 * 60 * 1000) {
      prev.c5 = 0;
      prev.t5 = n;
    }
    // decay 60m window
    if (n - prev.t60 > 60 * 60 * 1000) {
      prev.c60 = 0;
      prev.t60 = n;
    }

    prev.c5 += 1;
    prev.c60 += 1;
    this.store.set(key, prev);
  }

  getCount(key: string): number {
    const { fiveMin } = this.get(key);
    return fiveMin;
  }

  isAllowed(key: string): boolean {
    const { fiveMin, oneHour } = this.get(key);
    return fiveMin < this.config.maxRequests && oneHour < this.config.maxRequests * 3;
  }

  getRateData(key: string): RateData {
    const { fiveMin } = this.get(key);
    const remaining = Math.max(0, this.config.maxRequests - fiveMin);
    const blocked = fiveMin >= this.config.maxRequests;
    const resetTime = new Date(this.now() + this.config.windowMs);

    return {
      count: fiveMin,
      remaining,
      resetTime,
      blocked,
    };
  }

  getGlobalStats(): { activeKeys: number; totalRequests: number } {
    const keys = Array.from(this.store.keys());
    let totalRequests = 0;

    for (const key of keys) {
      const counters = this.store.get(key);
      if (counters) {
        totalRequests += counters.c5; // Only count 5-minute window for stats
      }
    }

    return {
      activeKeys: keys.length,
      totalRequests,
    };
  }

  destroy(): void {
    this.store.clear();
  }

  touch(_userId: string) {
    const n = this.now();
    const prev = this.store.get(_userId) ?? { c5: 0, c60: 0, t5: n, t60: n };
    // decay 5m window
    if (n - prev.t5 > 5 * 60 * 1000) {
      prev.c5 = 0;
      prev.t5 = n;
    }
    // decay 60m window
    if (n - prev.t60 > 60 * 60 * 1000) {
      prev.c60 = 0;
      prev.t60 = n;
    }

    prev.c5 += 1;
    prev.c60 += 1;
    this.store.set(_userId, prev);
    return { fiveMin: prev.c5, oneHour: prev.c60 };
  }

  get(_userId: string) {
    const n = this.now();
    const v = this.store.get(_userId);
    if (!v) return { fiveMin: 0, oneHour: 0 };
    // apply decay on read
    const copy = { ...v };
    if (n - copy.t5 > 5 * 60 * 1000) {
      copy.c5 = 0;
      copy.t5 = n;
    }
    if (n - copy.t60 > 60 * 60 * 1000) {
      copy.c60 = 0;
      copy.t60 = n;
    }
    this.store.set(_userId, copy);
    return { fiveMin: copy.c5, oneHour: copy.c60 };
  }

  withinLimits(_userId: string, max5 = 10, max60 = 30) {
    const { fiveMin, oneHour } = this.get(_userId);
    return fiveMin < max5 && oneHour < max60;
  }
}

export function createRateCounter(config?: RateCounterConfig): RateCounter {
  const defaultConfig: RateCounterConfig = {
    windowMs: 60000,
    maxRequests: 10,
    keyGenerator: req => req.userId || 'anonymous',
  };

  return new RateCounter(config || defaultConfig);
}

export function getDefaultRateConfig(): RateCounterConfig {
  return {
    windowMs: 60000,
    maxRequests: 10,
    keyGenerator: req => req.userId || 'anonymous',
  };
}
