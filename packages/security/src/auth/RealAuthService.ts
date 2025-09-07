/**
 * Real Authentication Service
 *
 * Production-ready authentication service that integrates with existing
 * NeonPro database structure using SupabaseAuthAdapter
 */

import { performance } from "node:perf_hooks";
import type {
  AuthConfig,
  LoginCredentials,
  LoginResult,
  User,
} from "./supabase-adapter/SupabaseAuthAdapter";
import { SupabaseAuthAdapter } from "./supabase-adapter/SupabaseAuthAdapter";

// Mock services that will be replaced with real implementations
interface CacheService {
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  get(key: string): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface AnalyticsService {
  track(event: string, properties: unknown): Promise<void>;
  recordPerformance(operation: string, duration: number): Promise<void>;
}

interface SecurityService {
  checkRateLimit(key: string, limit: number, window: number): Promise<boolean>;
  clearRateLimit(key: string): Promise<void>;
  auditOperation(operation: unknown): Promise<void>;
}

interface AuditService {
  logOperation(operation: string, details: unknown): Promise<void>;
  log(event: string, details: unknown): Promise<void>;
}

// Simple in-memory implementations for MVP
class MockCacheService implements CacheService {
  private cache = new Map<string, { value: unknown; expires: number; }>();

  async set(key: string, value: unknown, ttl = 300_000): Promise<void> {
    this.cache.set(key, { value, expires: Date.now() + ttl });
  }

  async get(key: string): Promise<unknown> {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

class MockAnalyticsService implements AnalyticsService {
  async track(_event: string, _properties: unknown): Promise<void> {
    // // console.log(`Analytics: ${event}`, properties);
  }

  async recordPerformance(_operation: string, _duration: number): Promise<void> {
    // // console.log(`Performance: ${operation} took ${duration}ms`);
  }
}

class MockSecurityService implements SecurityService {
  private rateLimits = new Map<string, { count: number; window: number; }>();

  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const current = this.rateLimits.get(key);

    if (!current || now > current.window) {
      this.rateLimits.set(key, { count: 1, window: now + window });
      return false;
    }

    if (current.count >= limit) {
      return true; // Rate limited
    }

    current.count++;
    return false;
  }

  async clearRateLimit(key: string): Promise<void> {
    this.rateLimits.delete(key);
  }

  async auditOperation(_operation: unknown): Promise<void> {
    // // console.log("Security audit:", operation);
  }
}

class MockAuditService implements AuditService {
  async logOperation(_operation: string, _details: unknown): Promise<void> {
    // // console.log(`Audit: ${operation}`, details);
  }

  async log(_event: string, _details: unknown): Promise<void> {
    // // console.log(`Audit Log: ${event}`, details);
  }
}

export class RealAuthService {
  private adapter: SupabaseAuthAdapter;
  private cache: CacheService;
  private analytics: AnalyticsService;
  private security: SecurityService;
  private audit: AuditService;
  private config: AuthConfig;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    jwtSecret?: string,
    config?: Partial<AuthConfig>,
  ) {
    // Validate JWT secret in production
    const resolvedJwtSecret = jwtSecret || process.env.JWT_SECRET;

    if (!resolvedJwtSecret && process.env.NODE_ENV === "production") {
      throw new Error("JWT secret required in production");
    }

    // Use dev-only fallback in non-production environments
    const finalJwtSecret = resolvedJwtSecret || (() => {
      if (process.env.NODE_ENV !== "production") {
        // Using development JWT secret. Set JWT_SECRET for production deployments.
        return "dev-only-fallback-secret-key-not-for-production";
      }
      throw new Error("JWT secret is required");
    })();

    this.config = {
      serviceName: "NeonPro Authentication",
      version: "1.0.0",
      jwtSecret: finalJwtSecret,
      jwtExpiresIn: "1h",
      refreshTokenExpiresIn: "7d",
      maxLoginAttempts: 5,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      ...config,
    };

    this.adapter = new SupabaseAuthAdapter(supabaseUrl, supabaseKey, this.config);

    // Initialize mock services (will be replaced with real ones)
    this.cache = new MockCacheService();
    this.analytics = new MockAnalyticsService();
    this.security = new MockSecurityService();
    this.audit = new MockAuditService();
  }

  /**
   * Authenticate user with enterprise security features
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const startTime = performance.now();

    try {
      // Normalize email and extract IP for rate limiting
      const normalizedEmail = credentials.email.trim().toLowerCase();
      const clientIP = credentials.deviceInfo?.ip || "unknown";

      // Security: Dual rate limiting - per email and per IP
      const emailRateLimitKey = `login_attempts_email_${normalizedEmail}`;
      const ipRateLimitKey = `login_attempts_ip_${clientIP}`;
      const window = 15 * 60 * 1000; // 15 minutes

      const [isEmailRateLimited, isIPRateLimited] = await Promise.all([
        this.security.checkRateLimit(emailRateLimitKey, this.config.maxLoginAttempts, window),
        this.security.checkRateLimit(ipRateLimitKey, this.config.maxLoginAttempts, window),
      ]);

      if (isEmailRateLimited || isIPRateLimited) {
        await this.audit.logOperation("login_rate_limited", {
          email: normalizedEmail,
          ip: clientIP,
          emailRateLimited: isEmailRateLimited,
          ipRateLimited: isIPRateLimited,
        });

        return {
          success: false,
          error: "Too many login attempts. Please try again later.",
        };
      }

      // Delegate to adapter
      const result = await this.adapter.login(credentials);

      // Track analytics
      if (result.success && result.user) {
        await this.analytics.track("user_login", {
          userId: result.user.id,
          role: result.user.role,
          mfaEnabled: result.user.mfaEnabled,
        });

        // Clear both rate limits on successful login
        await Promise.all([
          this.security.clearRateLimit(emailRateLimitKey),
          this.security.clearRateLimit(ipRateLimitKey),
        ]);
      }

      // Record performance
      await this.analytics.recordPerformance(
        result.success ? "auth_login_success" : "auth_login_failure",
        performance.now() - startTime,
      );

      return result;
    } catch (error) {
      const normalizedEmail = credentials.email.trim().toLowerCase();
      const clientIP = credentials.deviceInfo?.ip || "unknown";

      await this.audit.logOperation("login_error", {
        email: normalizedEmail,
        ip: clientIP,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: "Authentication service error",
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<LoginResult> {
    const startTime = performance.now();

    try {
      const result = await this.adapter.register(userData);

      // Track analytics
      if (result.success) {
        await this.analytics.track("user_registered", {
          email: userData.email,
          role: userData.role || "patient",
        });
      }

      // Record performance
      await this.analytics.recordPerformance(
        result.success ? "auth_register_success" : "auth_register_failure",
        performance.now() - startTime,
      );

      return result;
    } catch (error) {
      await this.audit.logOperation("register_error", {
        email: userData.email,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: "Registration service error",
      };
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string): Promise<void> {
    try {
      await this.adapter.logout(sessionId);

      await this.analytics.track("user_logout", { sessionId });
    } catch (error) {
      await this.audit.logOperation("logout_error", {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    return this.adapter.getCurrentUser();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResult> {
    const startTime = performance.now();

    try {
      const result = await this.adapter.refreshToken(refreshToken);

      await this.analytics.recordPerformance(
        result.success ? "auth_refresh_success" : "auth_refresh_failure",
        performance.now() - startTime,
      );

      return result;
    } catch (error) {
      await this.audit.logOperation("refresh_token_error", {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: "Token refresh failed",
      };
    }
  }

  /**
   * Get service information
   */
  getServiceName(): string {
    return this.config.serviceName;
  }

  getServiceVersion(): string {
    return this.config.version;
  }

  /**
   * Replace mock services with real implementations
   */
  setCache(cache: CacheService): void {
    this.cache = cache;
  }

  setAnalytics(analytics: AnalyticsService): void {
    this.analytics = analytics;
  }

  setSecurity(security: SecurityService): void {
    this.security = security;
  }

  setAudit(audit: AuditService): void {
    this.audit = audit;
  }
}
