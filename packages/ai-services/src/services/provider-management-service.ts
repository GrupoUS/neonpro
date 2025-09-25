import { EventEmitter } from 'events';
import { logger } from '@neonpro/shared';
import { 
  IUnifiedAIProvider, 
  ProviderHealth, 
  ProviderStats, 
  ProviderConfig,
  HealthcareComplianceConfig,
  ProviderCapabilities
} from '../providers/base-ai-provider';
import { AIProviderFactory, ProviderFactoryConfig } from '../providers/provider-factory';

/**
 * Provider alert levels
 */
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Provider alert type
 */
export enum AlertType {
  HEALTH_FAILURE = 'health_failure',
  HIGH_LATENCY = 'high_latency',
  RATE_LIMIT = 'rate_limit',
  COST_THRESHOLD = 'cost_threshold',
  ERROR_SPIKE = 'error_spike',
  COMPLIANCE_VIOLATION = 'compliance_violation',
}

/**
 * Provider alert interface
 */
export interface ProviderAlert {
  id: string;
  provider: string;
  level: AlertLevel;
  type: AlertType;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: Date;
}

/**
 * Provider performance metrics
 */
export interface ProviderMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  costPerRequest: number;
  uptime: number;
  lastHealthCheck: Date;
}

/**
 * Provider management configuration
 */
export interface ProviderManagementConfig {
  healthCheckInterval: number;
  metricsRetentionDays: number;
  alertThresholds: {
    maxLatency: number;
    maxErrorRate: number;
    maxCostPerRequest: number;
    minUptime: number;
  };
  notifications: {
    enabled: boolean;
    webhook?: string;
    email?: string;
    slack?: string;
  };
  autoFailover: {
    enabled: boolean;
    maxRetries: number;
    cooldownPeriod: number;
  };
}

/**
 * Comprehensive provider management service
 * Handles health monitoring, metrics collection, alerting, and failover
 */
export class ProviderManagementService extends EventEmitter {
  private static instance: ProviderManagementService;
  private factory: AIProviderFactory;
  private config: ProviderManagementConfig;
  private healthStatus: Map<string, ProviderHealth> = new Map();
  private metrics: Map<string, ProviderMetrics> = new Map();
  private alerts: Map<string, ProviderAlert> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsCleanupInterval?: NodeJS.Timeout;

  private constructor(
    factory: AIProviderFactory,
    config: Partial<ProviderManagementConfig> = {}
  ) {
    super();
    this.factory = factory;
    this.config = this.mergeConfig(config);
    this.startMonitoring();
  }

  /**
   * Get singleton instance
   */
  static getInstance(
    factory?: AIProviderFactory,
    config?: Partial<ProviderManagementConfig>
  ): ProviderManagementService {
    if (!ProviderManagementService.instance) {
      if (!factory) {
        throw new Error('Factory is required for first initialization');
      }
      ProviderManagementService.instance = new ProviderManagementService(factory, config);
    }
    return ProviderManagementService.instance;
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config: Partial<ProviderManagementConfig>): ProviderManagementConfig {
    return {
      healthCheckInterval: config.healthCheckInterval || 30000, // 30 seconds
      metricsRetentionDays: config.metricsRetentionDays || 7,
      alertThresholds: {
        maxLatency: config.alertThresholds?.maxLatency || 5000, // 5 seconds
        maxErrorRate: config.alertThresholds?.maxErrorRate || 0.1, // 10%
        maxCostPerRequest: config.alertThresholds?.maxCostPerRequest || 0.01, // $0.01
        minUptime: config.alertThresholds?.minUptime || 0.95, // 95%
        ...config.alertThresholds,
      },
      notifications: {
        enabled: config.notifications?.enabled || false,
        webhook: config.notifications?.webhook,
        email: config.notifications?.email,
        slack: config.notifications?.slack,
      },
      autoFailover: {
        enabled: config.autoFailover?.enabled || true,
        maxRetries: config.autoFailover?.maxRetries || 3,
        cooldownPeriod: config.autoFailover?.cooldownPeriod || 60000, // 1 minute
        ...config.autoFailover,
      },
    };
  }

  /**
   * Start health monitoring
   */
  private startMonitoring(): void {
    // Initial health check
    this.checkAllProvidersHealth();

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(
      () => this.checkAllProvidersHealth(),
      this.config.healthCheckInterval
    );

    // Set up metrics cleanup
    this.metricsCleanupInterval = setInterval(
      () => this.cleanupOldMetrics(),
      24 * 60 * 60 * 1000 // Daily
    );

    logger.info('Provider management service started', { config: this.config });
  }

  /**
   * Check health of all registered providers
   */
  private async checkAllProvidersHealth(): Promise<void> {
    const registry = this.factory.getRegistry();
    
    for (const providerInfo of registry) {
      try {
        await this.checkProviderHealth(providerInfo.name);
      } catch (error) {
        logger.error('Health check failed for provider', {
          provider: providerInfo.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Check health of a specific provider
   */
  private async checkProviderHealth(providerName: string): Promise<void> {
    try {
      const provider = this.factory.getProvider(providerName);
      if (!provider) {
        logger.warn('Provider not found for health check', { provider: providerName });
        return;
      }

      const health = await provider.healthCheck();
      const previousHealth = this.healthStatus.get(providerName);
      this.healthStatus.set(providerName, health);

      // Update metrics
      await this.updateMetrics(providerName, provider, health);

      // Check for health status changes
      if (previousHealth && previousHealth.isHealthy !== health.isHealthy) {
        if (health.isHealthy) {
          this.createAlert(
            providerName,
            AlertLevel.INFO,
            AlertType.HEALTH_FAILURE,
            `Provider ${providerName} is now healthy`,
            { status: 'recovered' }
          );
          this.resolveAlerts(providerName, AlertType.HEALTH_FAILURE);
        } else {
          this.createAlert(
            providerName,
            AlertLevel.ERROR,
            AlertType.HEALTH_FAILURE,
            `Provider ${providerName} is unhealthy: ${health.error}`,
            { status: 'failed' }
          );
        }
      }

      // Check for threshold violations
      this.checkThresholds(providerName, health);

      // Emit health status update
      this.emit('healthUpdate', { provider: providerName, health });

    } catch (error) {
      const health: ProviderHealth = {
        isHealthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      };
      
      this.healthStatus.set(providerName, health);
      
      this.createAlert(
        providerName,
        AlertLevel.ERROR,
        AlertType.HEALTH_FAILURE,
        `Health check failed for ${providerName}: ${health.error}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Update provider metrics
   */
  private async updateMetrics(
    providerName: string,
    provider: IUnifiedAIProvider,
    health: ProviderHealth
  ): Promise<void> {
    const stats = provider.getStats();
    const existingMetrics = this.metrics.get(providerName);
    
    const metrics: ProviderMetrics = {
      averageResponseTime: existingMetrics?.averageResponseTime || 0,
      p95ResponseTime: existingMetrics?.p95ResponseTime || 0,
      p99ResponseTime: existingMetrics?.p99ResponseTime || 0,
      errorRate: stats.errorRate,
      requestsPerMinute: this.calculateRequestsPerMinute(stats),
      costPerRequest: stats.totalRequests > 0 ? stats.totalCost / stats.totalRequests : 0,
      uptime: health.uptime || 0,
      lastHealthCheck: new Date(),
    };

    // Calculate rolling average for response time
    if (existingMetrics) {
      metrics.averageResponseTime = this.calculateRollingAverage(
        existingMetrics.averageResponseTime,
        health.responseTime,
        0.3 // Weight for new value
      );
    }

    this.metrics.set(providerName, metrics);
    this.emit('metricsUpdate', { provider: providerName, metrics });
  }

  /**
   * Calculate requests per minute
   */
  private calculateRequestsPerMinute(stats: ProviderStats): number {
    if (!stats.lastUsed) return 0;
    
    const timeSinceLastUse = Date.now() - stats.lastUsed.getTime();
    if (timeSinceLastUse > 60000) return 0; // No requests in the last minute
    
    return Math.min(stats.totalRequests, 60); // Cap at realistic values
  }

  /**
   * Calculate rolling average
   */
  private calculateRollingAverage(
    previous: number,
    current: number,
    weight: number
  ): number {
    return previous * (1 - weight) + current * weight;
  }

  /**
   * Check for threshold violations
   */
  private checkThresholds(providerName: string, health: ProviderHealth): void {
    const metrics = this.metrics.get(providerName);
    if (!metrics) return;

    const thresholds = this.config.alertThresholds;

    // High latency check
    if (health.responseTime > thresholds.maxLatency) {
      this.createAlert(
        providerName,
        AlertLevel.WARNING,
        AlertType.HIGH_LATENCY,
        `High latency detected: ${health.responseTime}ms > ${thresholds.maxLatency}ms`,
        { current: health.responseTime, threshold: thresholds.maxLatency }
      );
    }

    // High error rate check
    if (metrics.errorRate > thresholds.maxErrorRate) {
      this.createAlert(
        providerName,
        AlertLevel.WARNING,
        AlertType.ERROR_SPIKE,
        `High error rate detected: ${(metrics.errorRate * 100).toFixed(1)}% > ${(thresholds.maxErrorRate * 100).toFixed(1)}%`,
        { current: metrics.errorRate, threshold: thresholds.maxErrorRate }
      );
    }

    // High cost per request check
    if (metrics.costPerRequest > thresholds.maxCostPerRequest) {
      this.createAlert(
        providerName,
        AlertLevel.WARNING,
        AlertType.COST_THRESHOLD,
        `High cost per request detected: $${metrics.costPerRequest.toFixed(4)} > $${thresholds.maxCostPerRequest.toFixed(4)}`,
        { current: metrics.costPerRequest, threshold: thresholds.maxCostPerRequest }
      );
    }

    // Low uptime check
    if (metrics.uptime < thresholds.minUptime) {
      this.createAlert(
        providerName,
        AlertLevel.ERROR,
        AlertType.HEALTH_FAILURE,
        `Low uptime detected: ${(metrics.uptime * 100).toFixed(1)}% < ${(thresholds.minUptime * 100).toFixed(1)}%`,
        { current: metrics.uptime, threshold: thresholds.minUptime }
      );
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    provider: string,
    level: AlertLevel,
    type: AlertType,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const alert: ProviderAlert = {
      id: this.generateAlertId(),
      provider,
      level,
      type,
      message,
      timestamp: new Date(),
      metadata,
    };

    this.alerts.set(alert.id, alert);
    
    // Emit alert event
    this.emit('alert', alert);
    
    // Send notifications if enabled
    if (this.config.notifications.enabled) {
      this.sendNotification(alert);
    }

    logger.warn('Provider alert created', alert);
  }

  /**
   * Resolve alerts for a provider and type
   */
  private resolveAlerts(provider: string, type: AlertType): void {
    for (const [alertId, alert] of this.alerts) {
      if (alert.provider === provider && alert.type === type && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        this.alerts.set(alertId, alert);
        
        this.emit('alertResolved', alert);
        logger.info('Provider alert resolved', alert);
      }
    }
  }

  /**
   * Send notification for alert
   */
  private async sendNotification(alert: ProviderAlert): Promise<void> {
    // Implementation would depend on notification service
    // This is a placeholder for webhook, email, or Slack notifications
    logger.info('Alert notification would be sent', { alert });
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffDate = new Date(Date.now() - this.config.metricsRetentionDays * 24 * 60 * 60 * 1000);
    
    // Resolve old alerts
    for (const [alertId, alert] of this.alerts) {
      if (alert.timestamp < cutoffDate && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        this.alerts.set(alertId, alert);
      }
    }

    logger.info('Metrics cleanup completed', { 
      alertsProcessed: this.alerts.size,
      cutoffDate 
    });
  }

  /**
   * Execute operation with automatic failover
   */
  async executeWithFailover<T>(
    operation: (provider: IUnifiedAIProvider) => Promise<T>,
    preferredProvider?: string
  ): Promise<{ result: T; provider: string; failedOver: boolean }> {
    if (!this.config.autoFailover.enabled) {
      const provider = preferredProvider 
        ? this.factory.getProvider(preferredProvider)
        : await this.factory.getBestProvider();
      
      if (!provider) {
        throw new Error('No healthy providers available');
      }

      const result = await operation(provider);
      return { result, provider: provider.name, failedOver: false };
    }

    let lastError: Error;
    const attemptedProviders = new Set<string>();

    for (let attempt = 1; attempt <= this.config.autoFailover.maxRetries + 1; attempt++) {
      // Get available providers, excluding previously attempted ones
      const availableProviders = await this.factory.getAvailableProviders();
      const candidates = preferredProvider && attempt === 1
        ? availableProviders.filter(p => p.name === preferredProvider)
        : availableProviders.filter(p => !attemptedProviders.has(p.name));

      if (candidates.length === 0) {
        if (attempt === 1 && preferredProvider) {
          // Try to get any available provider if preferred is not available
          const anyProvider = availableProviders[0];
          if (anyProvider) {
            candidates.push(anyProvider);
          }
        } else {
          break;
        }
      }

      for (const provider of candidates) {
        attemptedProviders.add(provider.name);

        try {
          const health = this.healthStatus.get(provider.name);
          if (!health?.isHealthy) continue;

          const result = await operation(provider);
          const failedOver = attempt > 1 || provider.name !== preferredProvider;

          if (failedOver) {
            this.createAlert(
              provider.name,
              AlertLevel.INFO,
              AlertType.HEALTH_FAILURE,
              `Failover successful to ${provider.name}`,
              { from: preferredProvider, attempt }
            );
          }

          return { result, provider: provider.name, failedOver };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          this.createAlert(
            provider.name,
            AlertLevel.WARNING,
            AlertType.HEALTH_FAILURE,
            `Provider operation failed: ${lastError.message}`,
            { error: lastError.message, attempt }
          );

          logger.warn('Provider operation failed, trying next', {
            provider: provider.name,
            attempt,
            error: lastError.message,
          });
        }
      }

      if (attempt < this.config.autoFailover.maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.autoFailover.cooldownPeriod)
        );
      }
    }

    throw lastError || new Error('All providers failed after failover attempts');
  }

  /**
   * Get health status for all providers
   */
  getHealthStatus(): Map<string, ProviderHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Get metrics for all providers
   */
  getMetrics(): Map<string, ProviderMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ProviderAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): ProviderAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alerts for a specific provider
   */
  getProviderAlerts(providerName: string): ProviderAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.provider === providerName);
  }

  /**
   * Get provider summary
   */
  getProviderSummary(providerName: string): {
    health?: ProviderHealth;
    metrics?: ProviderMetrics;
    alerts: ProviderAlert[];
    capabilities?: ProviderCapabilities;
    config?: ProviderConfig;
  } {
    return {
      health: this.healthStatus.get(providerName),
      metrics: this.metrics.get(providerName),
      alerts: this.getProviderAlerts(providerName),
      capabilities: this.factory.getRegistry().find(r => r.name === providerName)?.capabilities,
      config: this.factory.getProviderConfig(providerName),
    };
  }

  /**
   * Get dashboard data
   */
  getDashboardData(): {
    providers: Array<{
      name: string;
      health?: ProviderHealth;
      metrics?: ProviderMetrics;
      alerts: ProviderAlert[];
      capabilities: ProviderCapabilities;
    }>;
    summary: {
      totalProviders: number;
      healthyProviders: number;
      totalAlerts: number;
      activeAlerts: number;
    };
  } {
    const registry = this.factory.getRegistry();
    const providers = registry.map(providerInfo => ({
      name: providerInfo.name,
      health: this.healthStatus.get(providerInfo.name),
      metrics: this.metrics.get(providerInfo.name),
      alerts: this.getProviderAlerts(providerInfo.name),
      capabilities: providerInfo.capabilities,
    }));

    const healthyProviders = providers.filter(p => p.health?.isHealthy).length;
    const activeAlerts = this.getActiveAlerts().length;

    return {
      providers,
      summary: {
        totalProviders: providers.length,
        healthyProviders,
        totalAlerts: this.alerts.size,
        activeAlerts,
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProviderManagementConfig>): void {
    this.config = this.mergeConfig(config);
    
    // Restart monitoring with new config
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsCleanupInterval) {
      clearInterval(this.metricsCleanupInterval);
    }
    
    this.startMonitoring();
    
    logger.info('Provider management service configuration updated', { config: this.config });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsCleanupInterval) {
      clearInterval(this.metricsCleanupInterval);
    }
    
    this.healthStatus.clear();
    this.metrics.clear();
    this.alerts.clear();
    this.removeAllListeners();
    
    ProviderManagementService.instance = null as any;
    
    logger.info('Provider management service destroyed');
  }
}