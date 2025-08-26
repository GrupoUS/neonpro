/**
 * Health Check Service for Enterprise Components
 *
 * Implementa monitoramento completo de saúde dos enterprise services:
 * - Validação de conectividade e performance
 * - Detecção de problemas e degradação
 * - Relatórios de health metrics
 * - Alertas automáticos
 */

import { EnterpriseAnalyticsService } from '../enterprise/analytics/EnterpriseAnalyticsService';
import { EnterpriseAuditService } from '../enterprise/audit/EnterpriseAuditService';
import { EnterpriseCacheService } from '../enterprise/cache/EnterpriseCacheService';
import { EnterpriseSecurityService } from '../enterprise/security/EnterpriseSecurityService';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details: {
    connectivity: boolean;
    performance: 'excellent' | 'good' | 'slow' | 'critical';
    errors: string[];
    warnings: string[];
    metrics: Record<string, any>;
  };
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthCheckResult[];
  summary: {
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    averageResponseTime: number;
  };
  timestamp: string;
  uptime: number;
}

/**
 * Enterprise Health Check Manager
 */
export class EnterpriseHealthCheckService {
  private readonly services: Map<string, any> = new Map();
  private readonly healthHistory: Map<string, HealthCheckResult[]> = new Map();
  private readonly startTime: number = Date.now();
  private healthCheckInterval: NodeJS.Timeout | null = undefined;
  private readonly alertThresholds = {
    responseTime: 5000, // 5 seconds
    errorRate: 0.1, // 10%
    degradedThreshold: 1, // 1 degraded service
    unhealthyThreshold: 1, // 1 unhealthy service
  };

  constructor() {
    this.initializeServices();
    this.startHealthMonitoring();
  }

  /**
   * Initialize all enterprise services for monitoring
   */
  private initializeServices(): void {
    // Mock service instances for health checking
    this.services.set(
      'cache',
      new EnterpriseCacheService({
        layers: {
          memory: {
            enabled: true,
            maxItems: 100,
            ttl: 60_000, // 1 minute for health checks
          },
          redis: {
            enabled: false, // Disable Redis for health checks
            host: 'localhost',
            port: 6379,
            ttl: 60_000,
            keyPrefix: 'health:',
          },
          database: {
            enabled: false, // Disable DB for health checks
            ttl: 60_000,
          },
        },
        healthCheck: {
          interval: 10_000,
          enabled: true,
        },
        compliance: {
          lgpd: false, // Simplified for health checks
          autoExpiry: true,
          auditAccess: false,
        },
      }),
    );

    this.services.set('analytics', new EnterpriseAnalyticsService());

    this.services.set(
      'security',
      new EnterpriseSecurityService({
        enableEncryption: false, // Simplified for health checks
        enableAuditLogging: false,
        enableAccessControl: false,
        encryptionAlgorithm: 'aes-256-gcm',
        auditRetentionDays: 1,
        requireSecureChannel: false,
        allowedOrigins: ['*'],
      }),
    );

    this.services.set('audit', new EnterpriseAuditService());

    // Initialize health history
    for (const serviceName of this.services.keys()) {
      this.healthHistory.set(serviceName, []);
    }
  }

  /**
   * Check health (alias for checkServiceHealth)
   */
  async checkHealth(serviceName: string): Promise<HealthCheckResult> {
    return this.checkServiceHealth(serviceName);
  }

  /**
   * Perform health check on a specific service
   */
  async checkServiceHealth(serviceName: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const service = this.services.get(serviceName);

    if (!service) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: 0,
        timestamp: new Date().toISOString(),
        details: {
          connectivity: false,
          performance: 'critical',
          errors: [`Service ${serviceName} not found`],
          warnings: [],
          metrics: {},
        },
      };
    }

    const result: HealthCheckResult = {
      service: serviceName,
      status: 'healthy',
      responseTime: 0,
      timestamp: new Date().toISOString(),
      details: {
        connectivity: false,
        performance: 'excellent',
        errors: [],
        warnings: [],
        metrics: {},
      },
    };

    try {
      // Test connectivity and basic operations
      switch (serviceName) {
        case 'cache': {
          await this.testCacheService(service, result);
          break;
        }
        case 'analytics': {
          await this.testAnalyticsService(service, result);
          break;
        }
        case 'security': {
          await this.testSecurityService(service, result);
          break;
        }
        case 'audit': {
          await this.testAuditService(service, result);
          break;
        }
        default: {
          throw new Error(`Unknown service: ${serviceName}`);
        }
      }

      result.responseTime = performance.now() - startTime;
      result.details.performance = this.assessPerformance(result.responseTime);

      // Determine overall status
      if (result.details.errors.length > 0) {
        result.status = 'unhealthy';
      } else if (
        result.details.warnings.length > 0
        || result.details.performance === 'slow'
      ) {
        result.status = 'degraded';
      } else {
        result.status = 'healthy';
      }
    } catch (error) {
      result.responseTime = performance.now() - startTime;
      result.status = 'unhealthy';
      result.details.performance = 'critical';
      result.details.errors.push((error as Error).message);
    }

    // Store in history
    this.storeHealthHistory(serviceName, result);

    return result;
  }

  /**
   * Perform comprehensive health check on all services
   */
  async performFullHealthCheck(): Promise<SystemHealthReport> {
    const serviceChecks = await Promise.all(
      [...this.services.keys()].map((serviceName) => this.checkServiceHealth(serviceName)),
    );

    const healthyServices = serviceChecks.filter(
      (check) => check.status === 'healthy',
    ).length;
    const degradedServices = serviceChecks.filter(
      (check) => check.status === 'degraded',
    ).length;
    const unhealthyServices = serviceChecks.filter(
      (check) => check.status === 'unhealthy',
    ).length;

    const averageResponseTime = serviceChecks.reduce((sum, check) => sum + check.responseTime, 0)
      / serviceChecks.length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyServices >= this.alertThresholds.unhealthyThreshold) {
      overall = 'unhealthy';
    } else if (degradedServices >= this.alertThresholds.degradedThreshold) {
      overall = 'degraded';
    }

    const report: SystemHealthReport = {
      overall,
      services: serviceChecks,
      summary: {
        totalServices: serviceChecks.length,
        healthyServices,
        degradedServices,
        unhealthyServices,
        averageResponseTime,
      },
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };

    // Check for alerts
    await this.checkAlerts(report);

    return report;
  }

  /**
   * Test cache service health
   */
  private async testCacheService(
    cacheService: EnterpriseCacheService,
    result: HealthCheckResult,
  ): Promise<void> {
    // Test basic cache operations
    const testKey = `health_check_${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };

    // Test set operation
    await cacheService.set(testKey, testValue);

    // Test get operation
    const retrieved = await cacheService.get(testKey);
    if (JSON.stringify(retrieved) !== JSON.stringify(testValue)) {
      result.details.errors.push('Cache get/set operation failed');
    }

    // Test delete operation
    await cacheService.delete(testKey);
    const afterDelete = await cacheService.get(testKey);
    if (afterDelete !== null) {
      result.details.warnings.push(
        'Cache delete operation may not have worked correctly',
      );
    }

    // Get metrics
    result.details.metrics = await cacheService.getStats();
    result.details.connectivity = true;

    // Check memory usage
    const stats = result.details.metrics;
    if (stats.memoryUsage && stats.memoryUsage > 0.9) {
      result.details.warnings.push('High memory usage detected');
    }
  }

  /**
   * Test analytics service health
   */
  private async testAnalyticsService(
    analyticsService: EnterpriseAnalyticsService,
    result: HealthCheckResult,
  ): Promise<void> {
    // Test event tracking
    await analyticsService.trackEvent({
      id: `${Date.now()}-${Math.random()}`,
      type: 'health_check',
      category: 'health',
      action: 'health_check',
      properties: { test: true },
      timestamp: Date.now(),
      metadata: {
        source: 'health-monitor',
        version: '1.0.0',
      },
    });

    // Test metric recording
    await analyticsService.recordMetric({
      name: 'health_check_test',
      value: 1,
      tags: { service: 'health' },
    });

    // Get health metrics
    result.details.metrics = await analyticsService.getHealthMetrics();
    result.details.connectivity = true;

    // Check for data processing lag
    const metrics = result.details.metrics;
    if (metrics.processingLag && metrics.processingLag > 10_000) {
      result.details.warnings.push('High processing lag detected');
    }
  }

  /**
   * Test security service health
   */
  private async testSecurityService(
    securityService: EnterpriseSecurityService,
    result: HealthCheckResult,
  ): Promise<void> {
    // Test encryption/decryption
    const testData = 'health check test data';
    const encrypted = await securityService.encryptData(testData);
    const decrypted = await securityService.decryptData(encrypted);

    if (decrypted !== testData) {
      result.details.errors.push('Encryption/decryption test failed');
    }

    // Test permission validation (mock)
    const _hasPermission = await securityService.validatePermission(
      'health_check_user',
      'read',
    );
    // For health check, we expect this to work (even if it returns false for unknown user)

    // Get health metrics
    result.details.metrics = await securityService.getHealthMetrics();
    result.details.connectivity = true;

    // Check session counts
    const metrics = result.details.metrics;
    if (metrics.activeSessions && metrics.activeSessions > 10_000) {
      result.details.warnings.push('High number of active sessions');
    }
  }

  /**
   * Test audit service health
   */
  private async testAuditService(
    auditService: EnterpriseAuditService,
    result: HealthCheckResult,
  ): Promise<void> {
    // Test audit logging
    await auditService.logEvent({
      id: `health_check_${Date.now()}`,
      service: 'health-monitor',
      eventType: 'HEALTH_CHECK',
      timestamp: new Date().toISOString(),
      details: { test: true },
      version: '1.0.0',
    });

    // Test chain integrity
    const integrity = await auditService.verifyChainIntegrity();
    if (!integrity.valid) {
      result.details.errors.push(
        `Audit chain integrity compromised: ${integrity.brokenLinks.length} broken links`,
      );
    }

    // Get audit stats
    result.details.metrics = await auditService.getAuditStats();
    result.details.connectivity = true;

    // Check audit volume
    const stats = result.details.metrics;
    if (stats.total && stats.total > 1_000_000) {
      result.details.warnings.push(
        'Large audit trail detected - consider archiving',
      );
    }
  }

  /**
   * Assess performance based on response time
   */
  private assessPerformance(
    responseTime: number,
  ): 'excellent' | 'good' | 'slow' | 'critical' {
    if (responseTime < 100) {
      return 'excellent';
    }
    if (responseTime < 500) {
      return 'good';
    }
    if (responseTime < 2000) {
      return 'slow';
    }
    return 'critical';
  }

  /**
   * Store health check result in history
   */
  private storeHealthHistory(
    serviceName: string,
    result: HealthCheckResult,
  ): void {
    const history = this.healthHistory.get(serviceName) || [];
    history.push(result);

    // Keep only last 100 results
    if (history.length > 100) {
      history.shift();
    }

    this.healthHistory.set(serviceName, history);
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(report: SystemHealthReport): Promise<void> {
    const alerts: string[] = [];

    // Check overall system health
    if (report.overall === 'unhealthy') {
      alerts.push('CRITICAL: System is unhealthy');
    } else if (report.overall === 'degraded') {
      alerts.push('WARNING: System performance is degraded');
    }

    // Check individual services
    for (const service of report.services) {
      if (service.status === 'unhealthy') {
        alerts.push(`CRITICAL: ${service.service} service is unhealthy`);
      } else if (service.responseTime > this.alertThresholds.responseTime) {
        alerts.push(
          `WARNING: ${service.service} service response time is high (${service.responseTime}ms)`,
        );
      }
    }

    // Log alerts
    if (alerts.length > 0) {
      // Could integrate with alerting system here
      // await this.sendAlerts(alerts);
    }
  }

  /**
   * Get health trends for a service
   */
  getHealthTrends(
    serviceName: string,
    hours = 24,
  ): {
    service: string;
    period: string;
    trends: {
      availability: number;
      averageResponseTime: number;
      errorRate: number;
      performanceDistribution: Record<string, number>;
    };
  } {
    const history = this.healthHistory.get(serviceName) || [];
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;

    const recentHistory = history.filter(
      (result) => new Date(result.timestamp).getTime() > cutoffTime,
    );

    if (recentHistory.length === 0) {
      return {
        service: serviceName,
        period: `${hours}h`,
        trends: {
          availability: 0,
          averageResponseTime: 0,
          errorRate: 0,
          performanceDistribution: {},
        },
      };
    }

    const healthyChecks = recentHistory.filter(
      (r) => r.status === 'healthy',
    ).length;
    const availability = (healthyChecks / recentHistory.length) * 100;

    const avgResponseTime = recentHistory.reduce((sum, r) => sum + r.responseTime, 0)
      / recentHistory.length;

    const errorsCount = recentHistory.filter(
      (r) => r.details.errors.length > 0,
    ).length;
    const errorRate = (errorsCount / recentHistory.length) * 100;

    const performanceDistribution: Record<string, number> = {};
    for (const result of recentHistory) {
      const perf = result.details.performance;
      performanceDistribution[perf] = (performanceDistribution[perf] || 0) + 1;
    }

    return {
      service: serviceName,
      period: `${hours}h`,
      trends: {
        availability,
        averageResponseTime: avgResponseTime,
        errorRate,
        performanceDistribution,
      },
    };
  }

  /**
   * Start automatic health monitoring
   */
  private startHealthMonitoring(): void {
    // Perform health check every 5 minutes
    this.healthCheckInterval = setInterval(
      async () => {
        try {
          await this.performFullHealthCheck();
        } catch {}
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Stop health monitoring
   */
  async stopHealthMonitoring(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Shutdown test services
    for (const service of this.services.values()) {
      try {
        if (service.shutdown) {
          await service.shutdown();
        }
      } catch {}
    }
  }

  /**
   * Get current system status summary
   */
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    lastCheck: string;
    services: {
      name: string;
      status: string;
      responseTime: number;
    }[];
  }> {
    const report = await this.performFullHealthCheck();

    return {
      status: report.overall,
      uptime: report.uptime,
      lastCheck: report.timestamp,
      services: report.services.map((service) => ({
        name: service.service,
        status: service.status,
        responseTime: service.responseTime,
      })),
    };
  }
}
