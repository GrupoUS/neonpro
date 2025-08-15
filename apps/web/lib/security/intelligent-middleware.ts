import { LRUCache } from 'lru-cache';

/**
 * 🛡️ NeonPro Intelligent Security Middleware
 *
 * Sistema adaptativo de segurança que aprende e protege automaticamente
 * contra ameaças sem impactar usuários legítimos
 */

interface SecurityEvent {
  ip: string;
  userAgent: string;
  route: string;
  method: string;
  timestamp: number;
  suspicious: boolean;
  reason?: string;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockUntil?: number;
}

// Cache para rate limiting (IP-based)
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10_000, // 10k IPs max
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

// Cache para detecção de comportamento suspeito
const securityCache = new LRUCache<string, SecurityEvent[]>({
  max: 5000,
  ttl: 15 * 60 * 1000, // 15 minutes TTL
});

// Cache para IPs conhecidos como seguros (whitelist dinâmica)
const _trustedIPsCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
}); /**
 * Rate limiting inteligente baseado em comportamento
 */
export class IntelligentRateLimit {
  private static getKey(ip: string, route: string): string {
    return `${ip}:${route}`;
  }

  /**
   * 🚦 Check if request should be rate limited
   */
  static checkRateLimit(
    ip: string,
    route: string,
    limits: {
      requests: number;
      windowMs: number;
      blockDurationMs?: number;
    }
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    reason?: string;
  } {
    const key = IntelligentRateLimit.getKey(ip, route);
    const now = Date.now();

    let entry = rateLimitCache.get(key);

    if (!entry) {
      entry = {
        count: 1,
        firstRequest: now,
        blocked: false,
      };
      rateLimitCache.set(key, entry);

      return {
        allowed: true,
        remaining: limits.requests - 1,
        resetTime: now + limits.windowMs,
      };
    }

    // Check if block period has expired
    if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
      entry.count = 1;
      entry.firstRequest = now;
      rateLimitCache.set(key, entry);
    }

    // If still blocked, deny
    if (entry.blocked && entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        reason: 'Rate limit exceeded, temporarily blocked',
      };
    }

    // Check if window has expired
    if (now - entry.firstRequest > limits.windowMs) {
      entry.count = 1;
      entry.firstRequest = now;
      rateLimitCache.set(key, entry);

      return {
        allowed: true,
        remaining: limits.requests - 1,
        resetTime: now + limits.windowMs,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > limits.requests) {
      entry.blocked = true;
      entry.blockUntil = now + (limits.blockDurationMs || 60_000); // Default 1 minute block
      rateLimitCache.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        reason: 'Rate limit exceeded',
      };
    }

    rateLimitCache.set(key, entry);

    return {
      allowed: true,
      remaining: limits.requests - entry.count,
      resetTime: entry.firstRequest + limits.windowMs,
    };
  }
}

/**
 * 🔍 Threat Detection System
 */
export class ThreatDetection {
  /**
   * 🤖 Analyze request for suspicious patterns
   */
  static analyzeSuspiciousActivity(
    ip: string,
    userAgent: string,
    route: string,
    _method: string
  ): { suspicious: boolean; reason?: string; riskScore: number } {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check for known bot patterns
    if (ThreatDetection.isBotUserAgent(userAgent)) {
      riskScore += 3;
      reasons.push('Bot user agent detected');
    }

    // Check for scanning behavior
    if (ThreatDetection.isScanningPattern(route)) {
      riskScore += 4;
      reasons.push('Route scanning detected');
    }

    // Check for suspicious request frequency
    const recentEvents = securityCache.get(ip) || [];
    const recentRequests = recentEvents.filter(
      (e) => Date.now() - e.timestamp < 10 * 1000 // last 10 seconds
    );

    if (recentRequests.length > 20) {
      riskScore += 5;
      reasons.push('High request frequency');
    }

    // Check for diverse route access (potential reconnaissance)
    const uniqueRoutes = new Set(recentEvents.map((e) => e.route));
    if (uniqueRoutes.size > 10) {
      riskScore += 3;
      reasons.push('Accessing many different routes');
    }

    return {
      suspicious: riskScore >= 5,
      reason: reasons.join(', '),
      riskScore,
    };
  }

  /**
   * 🤖 Check if user agent indicates bot
   */
  private static isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python-requests|go-http-client/i,
      /postman|insomnia|httpie/i,
    ];

    return botPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * 🔍 Check if route indicates scanning behavior
   */
  private static isScanningPattern(route: string): boolean {
    const scanningPatterns = [
      /\.(php|asp|jsp|cgi)$/i,
      /\/admin|\/wp-admin|\/phpmyadmin/i,
      /\.env|\.git|backup|config\./i,
      /\/api\/[^/]+\/[^/]+\/[^/]+/, // Deep API exploration
    ];

    return scanningPatterns.some((pattern) => pattern.test(route));
  }

  /**
   * 📝 Record security event
   */
  static recordEvent(event: SecurityEvent): void {
    const events = securityCache.get(event.ip) || [];
    events.push(event);

    // Keep only recent events to prevent memory bloat
    const recent = events.filter(
      (e) => Date.now() - e.timestamp < 15 * 60 * 1000
    );
    securityCache.set(event.ip, recent);
  }
}
