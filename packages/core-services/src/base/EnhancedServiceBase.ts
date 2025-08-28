/**
 * Enhanced Service Layer Pattern - Enterprise Foundation
 *
 * Fornece base unificada para todos os serviços com:
 * - Cache integrado multi-camadas
 * - Analytics e monitoramento automático
 * - Security e audit trail
 * - Fallback e recovery automático
 * - LGPD/ANVISA compliance automático
 */

import {
  EnterpriseAnalyticsService,
  EnterpriseAuditService,
  EnterpriseCacheService,
  EnterpriseSecurityService,
} from "../enterprise";
import { EnterpriseHealthCheckService } from "../health";
import type { AuditEvent, PerformanceMetrics, SecurityConfig, ServiceContext } from "../types";

// Core service interfaces
interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  getStats(): Promise<unknown>;
}

interface IAnalyticsService {
  track(event: string, properties: unknown): Promise<void>;
  recordPerformance(operation: string, duration: number): Promise<void>;
  recordError(error: Error, context: unknown): Promise<void>;
  getMetrics(period: string): Promise<PerformanceMetrics>;
}

interface ISecurityService {
  validateAccess(operation: string, context: ServiceContext): Promise<boolean>;
  auditOperation(event: AuditEvent): Promise<void>;
  encryptSensitiveData<T>(data: T): Promise<string>;
  decryptSensitiveData<T>(encrypted: string): Promise<T>;
  checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<boolean>;
  clearRateLimit(identifier: string): Promise<void>;
}

// Base service configuration
export interface ServiceConfig {
  serviceName: string;
  version: string;
  enableCache: boolean;
  enableAnalytics: boolean;
  enableSecurity: boolean;
  cacheOptions?: {
    defaultTTL: number;
    maxItems: number;
  };
  securityOptions?: SecurityConfig;
}

/**
 * Enhanced Service Base Class
 *
 * Classe abstrata que todos os serviços devem estender.
 * Fornece funcionalidades enterprise integradas.
 */
export abstract class EnhancedServiceBase {
  protected readonly config: ServiceConfig;
  protected readonly cache: ICacheService;
  protected readonly analytics: IAnalyticsService;
  protected readonly security: ISecurityService;
  protected readonly audit: EnterpriseAuditService;
  protected readonly healthCheck: EnterpriseHealthCheckService;

  // Internal services
  private readonly startTime: number;
  private readonly operationMetrics: Map<string, number[]> = new Map();

  // Enterprise service instances
  private readonly enterpriseCache: EnterpriseCacheService;
  private readonly enterpriseAnalytics: EnterpriseAnalyticsService;
  private readonly enterpriseSecurity: EnterpriseSecurityService;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.startTime = Date.now();

    // Initialize enterprise services
    this.enterpriseCache = new EnterpriseCacheService({
      layers: {
        memory: {
          enabled: true,
          maxItems: 1000,
          ttl: 300_000, // 5 minutes
        },
        redis: {
          enabled: true,
          host: process.env.REDIS_HOST || "localhost",
          port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
          ttl: 1_800_000, // 30 minutes
          keyPrefix: "neonpro:",
        },
        database: {
          enabled: true,
          ttl: 3_600_000, // 1 hour
        },
      },
      healthCheck: {
        interval: 30_000,
        enabled: true,
      },
      compliance: {
        lgpd: true,
        autoExpiry: true,
        auditAccess: true,
      },
    });

    this.enterpriseAnalytics = new EnterpriseAnalyticsService();

    this.enterpriseSecurity = new EnterpriseSecurityService({
      enableEncryption: true,
      enableAuditLogging: true,
      enableAccessControl: true,
      encryptionAlgorithm: "aes-256-gcm",
      auditRetentionDays: 2555, // 7 years for healthcare compliance
      requireSecureChannel: true,
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
    });

    this.audit = new EnterpriseAuditService();
    this.healthCheck = new EnterpriseHealthCheckService();

    // Initialize integrated service interfaces
    this.cache = this.initializeCacheService();
    this.analytics = this.initializeAnalyticsService();
    this.security = this.initializeSecurityService();

    // Register service startup
    this.auditServiceLifecycle("SERVICE_STARTED", {
      service: config.serviceName,
      version: config.version,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Execute operation with full enterprise features
   */
  protected async executeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: ServiceContext,
    options?: {
      cacheKey?: string;
      cacheTTL?: number;
      requiresAuth?: boolean;
      sensitiveData?: boolean;
    },
  ): Promise<T> {
    const startTime = performance.now();
    const operationId = `${this.config.serviceName}.${operationName}.${Date.now()}`;

    try {
      // 1. Security validation
      if (options?.requiresAuth && context) {
        const hasAccess = await this.security.validateAccess(
          operationName,
          context,
        );
        if (!hasAccess) {
          throw new Error(`Access denied for operation: ${operationName}`);
        }
      }

      // 2. Cache lookup (if enabled)
      if (options?.cacheKey && this.config.enableCache) {
        const cached = await this.cache.get<T>(options.cacheKey);
        if (cached) {
          await this.recordOperationMetrics(
            operationName,
            performance.now() - startTime,
            true,
          );
          await this.auditOperation("CACHE_HIT", {
            operationName,
            cacheKey: options.cacheKey,
          });
          return cached;
        }
      }

      // 3. Execute operation with retry logic
      const result = await this.executeWithRetry(operation, operationName);

      // 4. Cache result (if configured)
      if (options?.cacheKey && this.config.enableCache && result) {
        await this.cache.set(options.cacheKey, result, options?.cacheTTL);
      }

      // 5. Record metrics and audit
      const duration = performance.now() - startTime;
      await this.recordOperationMetrics(operationName, duration, false);

      if (options?.sensitiveData) {
        await this.auditOperation("SENSITIVE_DATA_ACCESS", {
          operationName,
          operationId,
          duration,
          patientId: context?.patientId,
          userId: context?.userId,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Record error metrics
      await this.analytics.recordError(error as Error, {
        operationName,
        operationId,
        duration,
        context,
      });

      // Security audit for failed operations
      await this.auditOperation("OPERATION_FAILED", {
        operationName,
        operationId,
        error: (error as Error).message,
        context,
      });

      throw error;
    }
  }

  /**
   * Execute with retry and fallback logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = 2 ** (attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        await this.auditOperation("OPERATION_RETRY", {
          operationName,
          attempt,
          error: lastError.message,
        });
      }
    }

    throw lastError!;
  }

  /**
   * Healthcare-specific caching with LGPD compliance
   */
  protected async cacheHealthcareData<T>(
    key: string,
    data: T,
    patientConsent: boolean,
    ttl?: number,
  ): Promise<void> {
    if (!patientConsent) {
      await this.auditOperation("CACHE_DENIED_NO_CONSENT", {
        key,
        patientConsent,
      });
      return;
    }

    await this.cache.set(
      key,
      data,
      ttl || this.config.cacheOptions?.defaultTTL,
    );

    await this.auditOperation("HEALTHCARE_DATA_CACHED", {
      key: key.replace(/patient_\d+/, "patient_***"), // Mask patient ID in logs
      ttl,
      patientConsent,
    });
  }

  /**
   * Record performance metrics
   */
  private async recordOperationMetrics(
    operation: string,
    duration: number,
    fromCache: boolean,
  ): Promise<void> {
    if (!this.config.enableAnalytics) {
      return;
    }

    // Store in memory for aggregation
    if (!this.operationMetrics.has(operation)) {
      this.operationMetrics.set(operation, []);
    }
    this.operationMetrics.get(operation)?.push(duration);

    // Record in analytics service
    await this.analytics.recordPerformance(operation, duration);
    await this.analytics.track(`${this.config.serviceName}.${operation}`, {
      duration,
      fromCache,
      timestamp: Date.now(),
    });
  }

  /**
   * Audit operation with LGPD/ANVISA compliance
   */
  private async auditOperation(eventType: string, details: unknown): Promise<void> {
    const auditEvent: AuditEvent = {
      id: `${this.config.serviceName}_${Date.now()}_${Math.random()}`,
      service: this.config.serviceName,
      eventType,
      timestamp: new Date().toISOString(),
      details,
      version: this.config.version,
    };

    await this.audit.logEvent(auditEvent);
  }

  /**
   * Service lifecycle audit
   */
  private async auditServiceLifecycle(
    event: string,
    details: unknown,
  ): Promise<void> {
    await this.auditOperation("SERVICE_LIFECYCLE", {
      event,
      ...(details as Record<string, unknown>),
    });
  }

  /**
   * Get service health metrics
   */
  public async getHealthMetrics(): Promise<unknown> {
    const uptime = Date.now() - this.startTime;
    const cacheStats = await this.cache.getStats();
    const auditStats = await this.audit.getAuditStats();

    // Calculate operation averages
    const operationStats: Record<string, unknown> = {};
    for (const [operation, durations] of this.operationMetrics.entries()) {
      operationStats[operation] = {
        count: durations.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
      };
    }

    // Get enterprise service health
    const enterpriseHealth = {
      cache: await this.enterpriseCache.getHealthMetrics(),
      analytics: await this.enterpriseAnalytics.getHealthMetrics(),
      security: await this.enterpriseSecurity.getHealthMetrics(),
      audit: auditStats,
      overall: await this.healthCheck.getSystemStatus(),
    };

    return {
      service: this.config.serviceName,
      version: this.config.version,
      uptime,
      operationStats,
      cacheStats,
      enterpriseHealth,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Initialize cache service
   */
  private initializeCacheService(): ICacheService {
    const self = this;
    return {
      async get<T>(key: string): Promise<T | null> {
        return self.enterpriseCache.get<T>(key);
      },
      async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await self.enterpriseCache.set(key, value, ttl);
      },
      async delete(key: string): Promise<void> {
        await self.enterpriseCache.delete(key);
      },
      async invalidate(pattern: string): Promise<void> {
        // Use invalidatePatientData for now as a pattern-based invalidation
        if (pattern.includes("patient_")) {
          const patientId = pattern.replace("patient_", "");
          await self.enterpriseCache.invalidatePatientData(patientId);
        }
      },
      async getStats(): Promise<unknown> {
        return self.enterpriseCache.getStats();
      },
    };
  }

  /**
   * Initialize analytics service
   */
  private initializeAnalyticsService(): IAnalyticsService {
    const self = this;
    return {
      async track(event: string, properties: unknown): Promise<void> {
        await self.enterpriseAnalytics.trackEvent({
          id: `${Date.now()}-${Math.random()}`,
          type: event,
          category: "service",
          action: event,
          properties: properties as Record<string, unknown>,
          timestamp: Date.now(),
          metadata: {
            source: self.config.serviceName,
            version: self.config.version,
          },
        });
      },
      async recordPerformance(
        operation: string,
        duration: number,
      ): Promise<void> {
        await self.enterpriseAnalytics.recordMetric({
          name: `${operation}_duration`,
          value: duration,
          tags: { operation, service: self.config.serviceName },
        });
      },
      async recordError(error: Error, context: unknown): Promise<void> {
        await self.enterpriseAnalytics.trackEvent({
          id: `${Date.now()}-${Math.random()}`,
          type: "error",
          category: "service",
          action: "error",
          properties: {
            error: error.message,
            stack: error.stack,
            context,
          },
          timestamp: Date.now(),
          metadata: {
            source: self.config.serviceName,
            version: self.config.version,
          },
        });
      },
      async getMetrics(_period: string): Promise<PerformanceMetrics> {
        return self.enterpriseAnalytics.getHealthMetrics();
      },
    };
  }

  /**
   * Initialize security service
   */
  private initializeSecurityService(): ISecurityService {
    const self = this;
    return {
      async validateAccess(
        operation: string,
        context: ServiceContext,
      ): Promise<boolean> {
        if (!context.userId) {
          return false;
        }

        return self.enterpriseSecurity.validatePermission(
          context.userId,
          operation,
        );
      },
      async auditOperation(event: AuditEvent): Promise<void> {
        await self.audit.logEvent(event);
      },
      async encryptSensitiveData<T>(data: T): Promise<string> {
        return self.enterpriseSecurity.encryptData(JSON.stringify(data));
      },
      async decryptSensitiveData<T>(encrypted: string): Promise<T> {
        const decrypted = await self.enterpriseSecurity.decryptData(encrypted);
        return JSON.parse(decrypted);
      },
      async checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<boolean> {
        return self.enterpriseSecurity.checkRateLimit(identifier, limit, windowMs);
      },
      async clearRateLimit(identifier: string): Promise<void> {
        return self.enterpriseSecurity.clearRateLimit(identifier);
      },
    };
  }

  /**
   * Abstract methods that services must implement
   */
  abstract getServiceName(): string;
  abstract getServiceVersion(): string;

  /**
   * Optional: Service-specific initialization
   */
  protected async initialize?(): Promise<void>;

  /**
   * Optional: Service-specific cleanup
   */
  protected async cleanup?(): Promise<void>;

  /**
   * Enterprise service health validation
   */
  public async validateEnterpriseServices(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    services: Record<string, unknown>;
    errors: string[];
  }> {
    const results: Record<string, unknown> = {};
    const errors: string[] = [];

    try {
      // Test cache service
      const cacheHealth = await this.enterpriseCache.getHealthMetrics();
      results.cache = { status: "healthy", ...cacheHealth };
    } catch (error) {
      results.cache = { status: "unhealthy", error: (error as Error).message };
      errors.push(`Cache service error: ${(error as Error).message}`);
    }

    try {
      // Test analytics service
      const analyticsHealth = await this.enterpriseAnalytics.getHealthMetrics();
      results.analytics = { status: "healthy", ...analyticsHealth };
    } catch (error) {
      results.analytics = {
        status: "unhealthy",
        error: (error as Error).message,
      };
      errors.push(`Analytics service error: ${(error as Error).message}`);
    }

    try {
      // Test security service
      const securityHealth = await this.enterpriseSecurity.getHealthMetrics();
      results.security = { ...securityHealth, status: "healthy" };
    } catch (error) {
      results.security = {
        status: "unhealthy",
        error: (error as Error).message,
      };
      errors.push(`Security service error: ${(error as Error).message}`);
    }

    try {
      // Test audit service
      const auditStats = await this.audit.getAuditStats() as Record<string, unknown>;
      results.audit = { status: "healthy", ...auditStats };
    } catch (error) {
      results.audit = { status: "unhealthy", error: (error as Error).message };
      errors.push(`Audit service error: ${(error as Error).message}`);
    }

    const status = errors.length === 0
      ? "healthy"
      : errors.length <= 2
      ? "degraded"
      : "unhealthy";

    return { status, services: results, errors };
  }

  /**
   * Graceful shutdown of all enterprise services
   */
  public async shutdown(): Promise<void> {
    // Log shutdown start
    await this.auditServiceLifecycle("SERVICE_SHUTDOWN_STARTED", {
      service: this.config.serviceName,
      timestamp: new Date().toISOString(),
    });

    // Service-specific cleanup
    if (this.cleanup) {
      await this.cleanup();
    }

    // Shutdown enterprise services
    await Promise.all([
      this.enterpriseCache.shutdown(),
      this.enterpriseAnalytics.shutdown(),
      this.enterpriseSecurity.shutdown(),
      this.audit.shutdown(),
      this.healthCheck.stopHealthMonitoring(),
    ]);

    // Log shutdown complete
    await this.auditServiceLifecycle("SERVICE_SHUTDOWN_COMPLETED", {
      service: this.config.serviceName,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    });
  }
}
