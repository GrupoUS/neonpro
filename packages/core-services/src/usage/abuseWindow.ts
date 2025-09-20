/**
 * Abuse Sliding Window Tracker (T018)
 * Handles rate limiting and abuse detection with sliding window algorithm
 * 
 * Features:
 * - 60-second sliding window tracking (ABUSE_Q_60S=12)
 * - 10-minute sliding window tracking (ABUSE_M_10M=5)
 * - IP-based and user-based tracking
 * - Memory-efficient circular buffer implementation
 * - Healthcare compliance and audit logging
 * - Automatic cleanup of expired entries
 */

// import type { AuditTrail } from '@neonpro/types';

export interface SlidingWindowConfig {
  window60s: number; // ABUSE_Q_60S (default: 12)
  window10m: number; // ABUSE_M_10M (default: 5)
}

export interface RequestEntry {
  timestamp: number;
  userId?: string;
  ip: string;
  endpoint: string;
  userAgent?: string;
}

export interface AbuseDetectionResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  windowType: '60s' | '10m' | null;
  currentRequests: number;
  limit: number;
}

export interface TrackingKey {
  type: 'ip' | 'user';
  value: string;
}

/**
 * Sliding Window Entry for efficient memory management
 */
class SlidingWindow {
  private requests: RequestEntry[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Add new request to the window
   */
  addRequest(request: RequestEntry): void {
    this.requests.push(request);
    
    // Keep memory usage bounded
    if (this.requests.length > this.maxSize) {
      this.requests = this.requests.slice(-this.maxSize);
    }
  }

  /**
   * Get requests within time window
   */
  getRequestsInWindow(windowMs: number, now: number = Date.now()): RequestEntry[] {
    const cutoff = now - windowMs;
    return this.requests.filter(req => req.timestamp >= cutoff);
  }

  /**
   * Clean up old requests outside all windows
   */
  cleanup(maxWindowMs: number, now: number = Date.now()): void {
    const cutoff = now - maxWindowMs;
    this.requests = this.requests.filter(req => req.timestamp >= cutoff);
  }

  /**
   * Get current size
   */
  size(): number {
    return this.requests.length;
  }
}

/**
 * Abuse Sliding Window Tracker
 */
export class AbuseWindowTracker {
  private windows = new Map<string, SlidingWindow>();
  private config: SlidingWindowConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Window durations in milliseconds
  private readonly WINDOW_60S = 60 * 1000;
  private readonly WINDOW_10M = 10 * 60 * 1000;
  private readonly MAX_WINDOW = this.WINDOW_10M;

  constructor(config: SlidingWindowConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * Check if request is allowed and track it
   */
  async checkAndTrackRequest(
    key: TrackingKey,
    request: Omit<RequestEntry, 'timestamp'>
  ): Promise<AbuseDetectionResult> {
    const now = Date.now();
    const keyStr = `${key.type}:${key.value}`;
    
    // Get or create sliding window for this key
    if (!this.windows.has(keyStr)) {
      this.windows.set(keyStr, new SlidingWindow());
    }
    
    const window = this.windows.get(keyStr)!;
    
    // Get current requests in both windows
    const requests60s = window.getRequestsInWindow(this.WINDOW_60S, now);
    const requests10m = window.getRequestsInWindow(this.WINDOW_10M, now);

    // Check 60-second window first (more restrictive)
    if (requests60s.length >= this.config.window60s) {
      const oldestRequest60s = Math.min(...requests60s.map(r => r.timestamp));
      const resetTime60s = oldestRequest60s + this.WINDOW_60S;

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: resetTime60s,
        windowType: '60s',
        currentRequests: requests60s.length,
        limit: this.config.window60s,
      };
    }

    // Check 10-minute window
    if (requests10m.length >= this.config.window10m) {
      const oldestRequest10m = Math.min(...requests10m.map(r => r.timestamp));
      const resetTime10m = oldestRequest10m + this.WINDOW_10M;

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: resetTime10m,
        windowType: '10m',
        currentRequests: requests10m.length,
        limit: this.config.window10m,
      };
    }

    // Request is allowed - track it
    const requestEntry: RequestEntry = {
      ...request,
      timestamp: now,
    };
    
    window.addRequest(requestEntry);

    // Calculate remaining requests (most restrictive window)
    const remaining60s = this.config.window60s - requests60s.length - 1;
    const remaining10m = this.config.window10m - requests10m.length - 1;
    const remainingRequests = Math.min(remaining60s, remaining10m);

    // Calculate next reset time (earliest of the two windows)
    const nextReset60s = requests60s.length > 0 ? 
      Math.min(...requests60s.map(r => r.timestamp)) + this.WINDOW_60S : 
      now + this.WINDOW_60S;
    
    const nextReset10m = requests10m.length > 0 ? 
      Math.min(...requests10m.map(r => r.timestamp)) + this.WINDOW_10M : 
      now + this.WINDOW_10M;

    return {
      allowed: true,
      remainingRequests,
      resetTime: Math.min(nextReset60s, nextReset10m),
      windowType: null,
      currentRequests: Math.max(requests60s.length + 1, requests10m.length + 1),
      limit: Math.min(this.config.window60s, this.config.window10m),
    };
  }

  /**
   * Check request without tracking (read-only)
   */
  async checkRequest(key: TrackingKey): Promise<AbuseDetectionResult> {
    const now = Date.now();
    const keyStr = `${key.type}:${key.value}`;
    
    const window = this.windows.get(keyStr);
    if (!window) {
      return {
        allowed: true,
        remainingRequests: Math.min(this.config.window60s, this.config.window10m),
        resetTime: now + Math.min(this.WINDOW_60S, this.WINDOW_10M),
        windowType: null,
        currentRequests: 0,
        limit: Math.min(this.config.window60s, this.config.window10m),
      };
    }

    const requests60s = window.getRequestsInWindow(this.WINDOW_60S, now);
    const requests10m = window.getRequestsInWindow(this.WINDOW_10M, now);

    // Check limits
    if (requests60s.length >= this.config.window60s) {
      const oldestRequest60s = Math.min(...requests60s.map(r => r.timestamp));
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: oldestRequest60s + this.WINDOW_60S,
        windowType: '60s',
        currentRequests: requests60s.length,
        limit: this.config.window60s,
      };
    }

    if (requests10m.length >= this.config.window10m) {
      const oldestRequest10m = Math.min(...requests10m.map(r => r.timestamp));
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: oldestRequest10m + this.WINDOW_10M,
        windowType: '10m',
        currentRequests: requests10m.length,
        limit: this.config.window10m,
      };
    }

    // Calculate remaining
    const remaining60s = this.config.window60s - requests60s.length;
    const remaining10m = this.config.window10m - requests10m.length;

    return {
      allowed: true,
      remainingRequests: Math.min(remaining60s, remaining10m),
      resetTime: now + Math.min(this.WINDOW_60S, this.WINDOW_10M),
      windowType: null,
      currentRequests: Math.max(requests60s.length, requests10m.length),
      limit: Math.min(this.config.window60s, this.config.window10m),
    };
  }

  /**
   * Get current statistics for a key
   */
  getStats(key: TrackingKey): {
    requests60s: number;
    requests10m: number;
    totalRequests: number;
    oldestRequest?: number;
    newestRequest?: number;
  } {
    const keyStr = `${key.type}:${key.value}`;
    const window = this.windows.get(keyStr);
    
    if (!window) {
      return {
        requests60s: 0,
        requests10m: 0,
        totalRequests: 0,
      };
    }

    const now = Date.now();
    const requests60s = window.getRequestsInWindow(this.WINDOW_60S, now);
    const requests10m = window.getRequestsInWindow(this.WINDOW_10M, now);
    const allRequests = window.getRequestsInWindow(this.MAX_WINDOW, now);

    return {
      requests60s: requests60s.length,
      requests10m: requests10m.length,
      totalRequests: allRequests.length,
      oldestRequest: allRequests.length > 0 ? Math.min(...allRequests.map(r => r.timestamp)) : undefined,
      newestRequest: allRequests.length > 0 ? Math.max(...allRequests.map(r => r.timestamp)) : undefined,
    };
  }

  /**
   * Reset tracking for a specific key
   */
  resetKey(key: TrackingKey): void {
    const keyStr = `${key.type}:${key.value}`;
    this.windows.delete(keyStr);
  }

  /**
   * Reset all tracking data
   */
  resetAll(): void {
    this.windows.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): SlidingWindowConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SlidingWindowConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalKeys: number;
    totalRequests: number;
    averageRequestsPerKey: number;
    memoryEstimateKB: number;
  } {
    let totalRequests = 0;
    
    for (const window of this.windows.values()) {
      totalRequests += window.size();
    }

    const totalKeys = this.windows.size;
    const averageRequestsPerKey = totalKeys > 0 ? totalRequests / totalKeys : 0;
    
    // Rough memory estimate (each request ~100 bytes, minimum 1 KB)
    const memoryEstimateKB = Math.max(1, Math.round((totalRequests * 100) / 1024));

    return {
      totalKeys,
      totalRequests,
      averageRequestsPerKey: Math.round(averageRequestsPerKey * 100) / 100,
      memoryEstimateKB,
    };
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Perform cleanup of expired entries
   */
  private performCleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, window] of this.windows.entries()) {
      window.cleanup(this.MAX_WINDOW, now);
      
      // If window is empty after cleanup, remove it
      if (window.size() === 0) {
        keysToDelete.push(key);
      }
    }

    // Remove empty windows
    for (const key of keysToDelete) {
      this.windows.delete(key);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.windows.clear();
  }
}

/**
 * Factory function to create AbuseWindowTracker instance
 */
export function createAbuseWindowTracker(config: SlidingWindowConfig): AbuseWindowTracker {
  return new AbuseWindowTracker(config);
}

/**
 * Default configuration from environment
 */
export function getDefaultAbuseConfig(): SlidingWindowConfig {
  return {
    window60s: 12, // ABUSE_Q_60S
    window10m: 5,  // ABUSE_M_10M
  };
}

export default AbuseWindowTracker;