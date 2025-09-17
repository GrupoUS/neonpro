// RateCounter service (Phase 1)
// Memory-only counters for fairness limits: 10/5m and 30/1h per user.

import LRUCache from 'lru-cache';

interface Counters { c5: number; c60: number; t5: number; t60: number }

export class RateCounterService {
  private store = new LRUCache<string, Counters>({ max: 5000, ttl: 90 * 60 * 1000 }); // 90m TTL

  private now(): number { return Date.now(); }

  touch(userId: string) {
    const n = this.now();
    const prev = this.store.get(userId) ?? { c5: 0, c60: 0, t5: n, t60: n };
    // decay 5m window
    if (n - prev.t5 > 5 * 60 * 1000) { prev.c5 = 0; prev.t5 = n; }
    // decay 60m window
    if (n - prev.t60 > 60 * 60 * 1000) { prev.c60 = 0; prev.t60 = n; }

    prev.c5 += 1; prev.c60 += 1;
    this.store.set(userId, prev);
    return { fiveMin: prev.c5, oneHour: prev.c60 };
  }

  get(userId: string) {
    const n = this.now();
    const v = this.store.get(userId);
    if (!v) return { fiveMin: 0, oneHour: 0 };
    // apply decay on read
    const copy = { ...v };
    if (n - copy.t5 > 5 * 60 * 1000) { copy.c5 = 0; copy.t5 = n; }
    if (n - copy.t60 > 60 * 60 * 1000) { copy.c60 = 0; copy.t60 = n; }
    this.store.set(userId, copy);
    return { fiveMin: copy.c5, oneHour: copy.c60 };
  }

  withinLimits(userId: string, max5 = 10, max60 = 30) {
    const { fiveMin, oneHour } = this.get(userId);
    return fiveMin < max5 && oneHour < max60;
  }
}
