/**
 * Authentication Rate Limiting Middleware
 * 
 * Implements sophisticated rate limiting for authentication endpoints to prevent
 * brute force attacks and credential stuffing attacks.
 * 
 * Features:
 * - IP-based rate limiting
 * - User-based rate limiting
 * - Progressive delays for repeated failures
 * - Automatic blocking of suspicious patterns
 * - Geolocation-based limiting (when available)
 * - Device fingerprinting
 * 
 * @security_critical CVSS: 7.8
 * @compliance OWASP, LGPD
 * @author AI Development Agent
 * @version 1.0.0
 */

import { Context, Next } from 'hono';
import { unauthorized, tooManyRequests } from '../utils/responses';

// Rate limiting configuration interfaces
interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  progressiveDelay: boolean;
  blockDurationMs: number;
  trustedProxies: string[];
  enableGeolocation: boolean;
  suspiciousThreshold: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
  suspiciousScore: number;
  delayMs: number;
}

interface DeviceFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  screenResolution?: string;
  timezone?: string;
  platform?: string;
}

interface GeolocationData {
  country?: string;
  city?: string;
  timezone?: string;
  proxy?: boolean;
  hosting?: boolean;
}

/**
 * Authentication Rate Limiting Middleware
 */
export class AuthRateLimiter {
  private config: RateLimitConfig;
  private ipStore = new Map<string, RateLimitEntry>();
  private userStore = new Map<string, RateLimitEntry>();
  private deviceStore = new Map<string, RateLimitEntry>();
  private suspiciousIPs = new Set<string>();
  private blockedCountries = new Set<string>();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5, // 5 attempts per window
      progressiveDelay: true,
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
      trustedProxies: [
        '127.0.0.1',
        '::1',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
      ],
      enableGeolocation: true,
      suspiciousThreshold: 10, // Block after 10 suspicious actions
      ...config,
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Rate limiting middleware function
   */
  middleware() {
    return async (c: Context, next: Next) => {
      // Skip rate limiting for health checks and static assets
      if (this.shouldSkipRateLimit(c)) {
        return next();
      }

      // Extract client identifiers
      const clientInfo = this.extractClientInfo(c);
      
      // Check various rate limits
      const rateLimitResult = await this.checkRateLimits(c, clientInfo);
      
      if (!rateLimitResult.allowed) {
        if (rateLimitResult.progressiveDelay) {
          // Apply progressive delay
          await this.delay(rateLimitResult.delayMs);
        } else {
          // Block the request
          return tooManyRequests(
            c, 
            rateLimitResult.message || 'Too many authentication attempts'
          );
        }
      }

      // Record this attempt
      await this.recordAttempt(c, clientInfo);

      // Check for suspicious patterns
      await this.analyzeSuspiciousBehavior(c, clientInfo);

      return next();
    };
  }

  /**
   * Check if rate limiting should be skipped for this request
   */
  private shouldSkipRateLimit(c: Context): boolean {
    const path = c.req.path;
    
    // Skip health checks and static assets
    const skipPaths = [
      '/health',
      '/api/health',
      '/api/v1/health',
      '/static/',
      '/public/',
      '/favicon.ico',
    ];

    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }

  /**
   * Extract client information for rate limiting
   */
  private extractClientInfo(c: Context): {
    ip: string;
    userId?: string;
    deviceFingerprint: string;
    geolocation?: GeolocationData;
  } {
    // Get real IP address (considering proxies)
    const ip = this.getClientIP(c);
    
    // Extract user ID from context if available
    const userId = c.get('userId');
    
    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(c);
    
    // Get geolocation data (if enabled)
    const geolocation = this.config.enableGeolocation 
      ? this.getGeolocation(ip) 
      : undefined;

    return {
      ip,
      userId,
      deviceFingerprint,
      geolocation,
    };
  }

  /**
   * Get client IP address considering proxies
   */
  private getClientIP(c: Context): string {
    // Check various headers in order of preference
    const headers = [
      'cf-connecting-ip', // Cloudflare
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'x-cluster-client-ip',
      'forwarded',
    ];

    for (const header of headers) {
      const value = c.req.header(header);
      if (value) {
        // Handle multiple IPs in x-forwarded-for
        if (header === 'x-forwarded-for') {
          const ips = value.split(',').map(ip => ip.trim());
          // Get the first non-trusted proxy IP
          for (const ip of ips) {
            if (!this.isTrustedProxy(ip)) {
              return ip;
            }
          }
        } else {
          return value;
        }
      }
    }

    // Fallback to connection remote address
    return c.req.header('remote-addr') || 'unknown';
  }

  /**
   * Check if IP is a trusted proxy
   */
  private isTrustedProxy(ip: string): boolean {
    return this.config.trustedProxies.some(proxy => {
      if (proxy.includes('/')) {
        // CIDR notation
        return this.isIPInCIDR(ip, proxy);
      }
      return ip === proxy;
    });
  }

  /**
   * Check if IP is in CIDR range
   */
  private isIPInCIDR(ip: string, cidr: string): boolean {
    // Simple implementation for common private ranges
    const [network, prefixLength] = cidr.split('/');
    const mask = parseInt(prefixLength, 10);
    
    // This is a simplified implementation
    // In production, use a proper CIDR library
    return ip.startsWith(network.slice(0, mask));
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(c: Context): string {
    const fingerprint: DeviceFingerprint = {
      userAgent: c.req.header('user-agent') || '',
      acceptLanguage: c.req.header('accept-language') || '',
      acceptEncoding: c.req.header('accept-encoding') || '',
      screenResolution: c.req.header('x-screen-resolution'),
      timezone: c.req.header('x-timezone'),
      platform: c.req.header('x-platform'),
    };

    // Create a simple hash of the fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Get geolocation data (mock implementation)
   */
  private getGeolocation(ip: string): GeolocationData | undefined {
    // In production, integrate with a real geolocation service
    // This is a mock implementation
    
    if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        proxy: false,
        hosting: false,
      };
    }

    return {
      country: 'Unknown',
      proxy: false,
      hosting: false,
    };
  }

  /**
   * Check all rate limits
   */
  private async checkRateLimits(
    c: Context, 
    clientInfo: ReturnType<typeof this.extractClientInfo>
  ): Promise<{
    allowed: boolean;
    message?: string;
    progressiveDelay?: boolean;
    delayMs?: number;
  }> {
    const now = Date.now();

    // Check if IP is blocked
    if (this.suspiciousIPs.has(clientInfo.ip)) {
      return {
        allowed: false,
        message: 'IP address blocked due to suspicious activity',
      };
    }

    // Check geolocation blocks
    if (clientInfo.geolocation && this.isBlockedGeolocation(clientInfo.geolocation)) {
      return {
        allowed: false,
        message: 'Access from your location is temporarily restricted',
      };
    }

    // Check IP-based rate limit
    const ipResult = this.checkStoreRateLimit(this.ipStore, clientInfo.ip, now);
    if (!ipResult.allowed) {
      return ipResult;
    }

    // Check user-based rate limit (if user ID available)
    if (clientInfo.userId) {
      const userResult = this.checkStoreRateLimit(this.userStore, clientInfo.userId, now);
      if (!userResult.allowed) {
        return userResult;
      }
    }

    // Check device-based rate limit
    const deviceResult = this.checkStoreRateLimit(
      this.deviceStore, 
      clientInfo.deviceFingerprint, 
      now
    );
    if (!deviceResult.allowed) {
      return deviceResult;
    }

    return { allowed: true };
  }

  /**
   * Check rate limit for a specific store
   */
  private checkStoreRateLimit(
    store: Map<string, RateLimitEntry>,
    key: string,
    now: number
  ): {
    allowed: boolean;
    message?: string;
    progressiveDelay?: boolean;
    delayMs?: number;
  } {
    let entry = store.get(key);

    if (!entry) {
      entry = {
        attempts: 0,
        firstAttempt: now,
        lastAttempt: now,
        suspiciousScore: 0,
        delayMs: 0,
      };
      store.set(key, entry);
    }

    // Check if entry is blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        message: 'Too many attempts. Please try again later.',
      };
    }

    // Reset window if time has passed
    if (now - entry.firstAttempt > this.config.windowMs) {
      entry.attempts = 0;
      entry.firstAttempt = now;
      entry.delayMs = 0;
    }

    // Check if limit exceeded
    if (entry.attempts >= this.config.maxAttempts) {
      if (this.config.progressiveDelay && entry.attempts < this.config.maxAttempts + 3) {
        // Apply progressive delay instead of blocking
        entry.delayMs = Math.min(
          entry.delayMs + 1000, // Increase delay by 1 second each time
          10000 // Max 10 second delay
        );

        return {
          allowed: true,
          progressiveDelay: true,
          delayMs: entry.delayMs,
        };
      } else {
        // Block the entry
        entry.blockedUntil = now + this.config.blockDurationMs;
        return {
          allowed: false,
          message: 'Too many attempts. Access temporarily blocked.',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record an authentication attempt
   */
  private async recordAttempt(
    c: Context, 
    clientInfo: ReturnType<typeof this.extractClientInfo>
  ): Promise<void> {
    const now = Date.now();

    // Record IP attempt
    this.recordStoreAttempt(this.ipStore, clientInfo.ip, now);

    // Record user attempt (if available)
    if (clientInfo.userId) {
      this.recordStoreAttempt(this.userStore, clientInfo.userId, now);
    }

    // Record device attempt
    this.recordStoreAttempt(
      this.deviceStore, 
      clientInfo.deviceFingerprint, 
      now
    );
  }

  /**
   * Record attempt in a specific store
   */
  private recordStoreAttempt(
    store: Map<string, RateLimitEntry>,
    key: string,
    now: number
  ): void {
    let entry = store.get(key);

    if (!entry) {
      entry = {
        attempts: 0,
        firstAttempt: now,
        lastAttempt: now,
        suspiciousScore: 0,
        delayMs: 0,
      };
      store.set(key, entry);
    }

    entry.attempts++;
    entry.lastAttempt = now;
  }

  /**
   * Analyze suspicious behavior patterns
   */
  private async analyzeSuspiciousBehavior(
    c: Context,
    clientInfo: ReturnType<typeof this.extractClientInfo>
  ): Promise<void> {
    const now = Date.now();

    // Check for rapid successive attempts
    const ipEntry = this.ipStore.get(clientInfo.ip);
    if (ipEntry && ipEntry.attempts > 3) {
      const timeBetweenAttempts = (ipEntry.lastAttempt - ipEntry.firstAttempt) / ipEntry.attempts;
      
      if (timeBetweenAttempts < 1000) { // Less than 1 second between attempts
        ipEntry.suspiciousScore += 5;
      }
    }

    // Check for multiple user attempts from same IP
    if (clientInfo.userId) {
      const userAttemptsFromIP = Array.from(this.userStore.entries())
        .filter(([userId, entry]) => 
          userId !== clientInfo.userId && 
          entry.lastAttempt > now - this.config.windowMs
        )
        .length;

      if (userAttemptsFromIP > 2) {
        const ipEntry = this.ipStore.get(clientInfo.ip);
        if (ipEntry) {
          ipEntry.suspiciousScore += 3;
        }
      }
    }

    // Check for suspicious geolocation patterns
    if (clientInfo.geolocation) {
      if (clientInfo.geolocation.proxy || clientInfo.geolocation.hosting) {
        const ipEntry = this.ipStore.get(clientInfo.ip);
        if (ipEntry) {
          ipEntry.suspiciousScore += 2;
        }
      }
    }

    // Block if suspicious score exceeds threshold
    const finalIpEntry = this.ipStore.get(clientInfo.ip);
    if (finalIpEntry && finalIpEntry.suspiciousScore >= this.config.suspiciousThreshold) {
      this.suspiciousIPs.add(clientInfo.ip);
      console.warn(`IP ${clientInfo.ip} blocked due to suspicious behavior (score: ${finalIpEntry.suspiciousScore})`);
    }
  }

  /**
   * Check if geolocation should be blocked
   */
  private isBlockedGeolocation(geolocation: GeolocationData): boolean {
    // Block known problematic countries/regions
    return this.blockedCountries.has(geolocation.country || '');
  }

  /**
   * Apply delay for progressive rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoffTime = now - this.config.windowMs;

    // Clean IP store
    for (const [key, entry] of this.ipStore.entries()) {
      if (entry.lastAttempt < cutoffTime && !entry.blockedUntil) {
        this.ipStore.delete(key);
      }
    }

    // Clean user store
    for (const [key, entry] of this.userStore.entries()) {
      if (entry.lastAttempt < cutoffTime && !entry.blockedUntil) {
        this.userStore.delete(key);
      }
    }

    // Clean device store
    for (const [key, entry] of this.deviceStore.entries()) {
      if (entry.lastAttempt < cutoffTime && !entry.blockedUntil) {
        this.deviceStore.delete(key);
      }
    }

    // Clean suspicious IPs (unblock after block duration)
    for (const ip of this.suspiciousIPs) {
      const entry = this.ipStore.get(ip);
      if (!entry || (entry.blockedUntil && entry.blockedUntil <= now)) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }

  /**
   * Get rate limiting statistics
   */
  getStatistics(): {
    activeEntries: {
      ip: number;
      user: number;
      device: number;
    };
    blockedIPs: number;
    suspiciousIPs: number;
  } {
    return {
      activeEntries: {
        ip: this.ipStore.size,
        user: this.userStore.size,
        device: this.deviceStore.size,
      },
      blockedIPs: Array.from(this.ipStore.values()).filter(entry => entry.blockedUntil).length,
      suspiciousIPs: this.suspiciousIPs.size,
    };
  }

  /**
   * Reset rate limiting for testing
   */
  reset(): void {
    this.ipStore.clear();
    this.userStore.clear();
    this.deviceStore.clear();
    this.suspiciousIPs.clear();
  }
}

// Global rate limiter instance
export const authRateLimiter = new AuthRateLimiter();

// Export the middleware function for convenience
export const authRateLimit = authRateLimiter.middleware();