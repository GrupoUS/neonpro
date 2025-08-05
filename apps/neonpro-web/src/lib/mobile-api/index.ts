/**
 * Mobile API System - Main Integration
 * Unified mobile API system with offline sync, push notifications, caching, and optimization
 */

import type { CacheManager } from "./cache-manager";
import type { MobileApiSystem } from "./mobile-api-system";
import type { OfflineSyncManager } from "./offline-sync";
import type { PushNotificationsManager } from "./push-notifications";
import type {
  CacheConfig,
  DeviceCapabilities,
  MobileApiConfig,
  MobileApiRequest,
  MobileApiResponse,
  MobileApiStats,
  NetworkCondition,
  NotificationStatus,
  OfflineSyncConfig,
  PerformanceMetrics,
  PushNotificationConfig,
  SyncStatus,
  SystemHealth,
} from "./types";
import type { MobileApiUtils } from "./utils";

/**
 * Unified Mobile API Manager
 * Orchestrates all mobile API functionality including caching, sync, notifications, and optimization
 */
export class UnifiedMobileApiManager {
  private apiSystem: MobileApiSystem;
  private cacheManager: CacheManager;
  private syncManager: OfflineSyncManager;
  private notificationsManager: PushNotificationsManager;
  private config: MobileApiConfig;
  private isInitialized = false;
  private healthStatus: SystemHealth;
  private performanceMetrics: PerformanceMetrics;
  private stats: MobileApiStats;

  constructor(config: MobileApiConfig) {
    this.config = config;

    // Initialize subsystems
    this.apiSystem = new MobileApiSystem(config.api);
    this.cacheManager = new CacheManager(config.cache);
    this.syncManager = new OfflineSyncManager(config.offlineSync);
    this.notificationsManager = new PushNotificationsManager(config.pushNotifications);

    // Initialize health status
    this.healthStatus = {
      overall: "healthy",
      api: "healthy",
      cache: "healthy",
      sync: "healthy",
      notifications: "healthy",
      lastCheck: new Date(),
      uptime: 0,
      errors: [],
    };

    // Initialize performance metrics
    this.performanceMetrics = {
      operationId: "system",
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      memoryUsage: 0,
      networkLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
    };

    // Initialize stats
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      syncOperations: 0,
      notificationsSent: 0,
      averageResponseTime: 0,
      dataTransferred: 0,
      offlineOperations: 0,
    };
  }

  /**
   * Initialize the unified mobile API system
   */
  async initialize(): Promise<void> {
    try {
      console.log("Initializing Unified Mobile API System...");

      // Initialize subsystems in order
      await this.cacheManager.initialize();
      await this.apiSystem.initialize();
      await this.syncManager.initialize();
      await this.notificationsManager.initialize();

      // Setup cross-system integrations
      this.setupIntegrations();

      // Start monitoring and health checks
      this.startHealthMonitoring();
      this.startPerformanceMonitoring();

      this.isInitialized = true;
      console.log("Unified Mobile API System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Unified Mobile API System:", error);
      throw error;
    }
  }

  /**
   * Make an optimized API request
   */
  async request(request: MobileApiRequest): Promise<MobileApiResponse> {
    if (!this.isInitialized) {
      throw new Error("Mobile API system not initialized");
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // Detect network condition and optimize request
      const networkCondition = MobileApiUtils.NetworkUtils.detectNetworkCondition();
      const optimizedRequest = MobileApiUtils.NetworkUtils.optimizeRequest(
        request,
        networkCondition,
      );

      // Try cache first if enabled
      if (optimizedRequest.cache?.enabled) {
        const cachedResponse = await this.cacheManager.get(this.generateCacheKey(optimizedRequest));
        if (cachedResponse) {
          this.stats.cacheHits++;
          return cachedResponse;
        }
        this.stats.cacheMisses++;
      }

      // Make API request
      const response = await this.apiSystem.request(optimizedRequest);

      // Cache successful responses
      if (response.success && optimizedRequest.cache?.enabled) {
        await this.cacheManager.set(
          this.generateCacheKey(optimizedRequest),
          response,
          optimizedRequest.cache.ttl,
        );
      }

      // Queue for offline sync if needed
      if (this.shouldQueueForSync(optimizedRequest, response)) {
        await this.syncManager.queueOperation({
          id: `req_${Date.now()}`,
          type: "api_request",
          data: optimizedRequest,
          timestamp: new Date(),
          priority: "medium",
          retryCount: 0,
          maxRetries: 3,
        });
      }

      // Update stats
      this.stats.successfulRequests++;
      this.stats.averageResponseTime = this.calculateAverageResponseTime(Date.now() - startTime);
      this.stats.dataTransferred += this.calculateDataSize(response);

      return response;
    } catch (error) {
      this.stats.failedRequests++;

      // Try offline fallback
      if (this.config.offlineSync.enabled) {
        const offlineResponse = await this.syncManager.getOfflineData(request.endpoint);
        if (offlineResponse) {
          this.stats.offlineOperations++;
          return {
            success: true,
            data: offlineResponse,
            status: 200,
            headers: {},
            responseTime: Date.now() - startTime,
            fromCache: false,
            fromOffline: true,
          };
        }
      }

      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendNotification(deviceId: string, payload: any): Promise<boolean> {
    try {
      const result = await this.notificationsManager.sendNotification(deviceId, payload);
      if (result.success) {
        this.stats.notificationsSent++;
      }
      return result.success;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(registration: any): Promise<boolean> {
    try {
      return await this.notificationsManager.registerDevice(registration);
    } catch (error) {
      console.error("Failed to register device:", error);
      return false;
    }
  }

  /**
   * Force sync with server
   */
  async forceSync(): Promise<SyncStatus> {
    try {
      const status = await this.syncManager.forceSync();
      this.stats.syncOperations++;
      return status;
    } catch (error) {
      console.error("Force sync failed:", error);
      return {
        status: "error",
        lastSync: new Date(),
        pendingOperations: 0,
        conflictsResolved: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncManager.getStatus();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return this.cacheManager.getStats();
  }

  /**
   * Get notification analytics
   */
  getNotificationAnalytics(): any {
    return this.notificationsManager.getAnalytics();
  }

  /**
   * Get system health status
   */
  getHealthStatus(): SystemHealth {
    return { ...this.healthStatus };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get system statistics
   */
  getStats(): MobileApiStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Reset sync queue
   */
  async resetSyncQueue(): Promise<void> {
    await this.syncManager.clearQueue();
  }

  /**
   * Shutdown the system gracefully
   */
  async shutdown(): Promise<void> {
    try {
      console.log("Shutting down Unified Mobile API System...");

      // Stop monitoring
      this.stopHealthMonitoring();
      this.stopPerformanceMonitoring();

      // Shutdown subsystems
      await this.syncManager.shutdown();
      await this.cacheManager.shutdown();

      this.isInitialized = false;
      console.log("Unified Mobile API System shutdown complete");
    } catch (error) {
      console.error("Error during shutdown:", error);
    }
  }

  /**
   * Setup cross-system integrations
   */
  private setupIntegrations(): void {
    // Cache invalidation on sync
    this.syncManager.on("dataUpdated", async (data: any) => {
      await this.cacheManager.invalidatePattern(data.pattern);
    });

    // Notification on sync completion
    this.syncManager.on("syncCompleted", async (status: SyncStatus) => {
      if (this.config.pushNotifications.syncNotifications) {
        // Send sync completion notification
      }
    });

    // Performance monitoring integration
    this.apiSystem.on("requestCompleted", (metrics: any) => {
      this.updatePerformanceMetrics(metrics);
    });
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: MobileApiRequest): string {
    const keyData = {
      endpoint: request.endpoint,
      method: request.method,
      params: request.params,
      body: request.body,
    };
    return MobileApiUtils.SecurityUtils.generateHash(JSON.stringify(keyData));
  }

  /**
   * Check if request should be queued for sync
   */
  private shouldQueueForSync(request: MobileApiRequest, response: MobileApiResponse): boolean {
    // Queue write operations for sync
    const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    return writeMethods.includes(request.method) && response.success;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(currentTime: number): number {
    const totalRequests = this.stats.totalRequests;
    const currentAverage = this.stats.averageResponseTime;
    return (currentAverage * (totalRequests - 1) + currentTime) / totalRequests;
  }

  /**
   * Calculate data size
   */
  private calculateDataSize(response: MobileApiResponse): number {
    return JSON.stringify(response.data || {}).length;
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.checkSystemHealth();
    }, this.config.healthCheckInterval || 30000);
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    // Implementation would clear the interval
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, this.config.metricsInterval || 60000);
  }

  /**
   * Stop performance monitoring
   */
  private stopPerformanceMonitoring(): void {
    // Implementation would clear the interval
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<void> {
    try {
      const errors: string[] = [];

      // Check API system
      const apiHealth = await this.apiSystem.healthCheck();
      if (!apiHealth.healthy) {
        errors.push("API system unhealthy");
        this.healthStatus.api = "unhealthy";
      } else {
        this.healthStatus.api = "healthy";
      }

      // Check cache system
      const cacheHealth = await this.cacheManager.healthCheck();
      if (!cacheHealth.healthy) {
        errors.push("Cache system unhealthy");
        this.healthStatus.cache = "unhealthy";
      } else {
        this.healthStatus.cache = "healthy";
      }

      // Check sync system
      const syncHealth = await this.syncManager.healthCheck();
      if (!syncHealth.healthy) {
        errors.push("Sync system unhealthy");
        this.healthStatus.sync = "unhealthy";
      } else {
        this.healthStatus.sync = "healthy";
      }

      // Update overall health
      this.healthStatus.overall = errors.length === 0 ? "healthy" : "unhealthy";
      this.healthStatus.errors = errors;
      this.healthStatus.lastCheck = new Date();
      this.healthStatus.uptime = Date.now() - this.performanceMetrics.startTime;
    } catch (error) {
      console.error("Health check failed:", error);
      this.healthStatus.overall = "unhealthy";
      this.healthStatus.errors = ["Health check failed"];
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    try {
      // Update memory usage
      this.performanceMetrics.memoryUsage = MobileApiUtils.PerformanceUtils.getMemoryUsage();

      // Calculate cache hit rate
      const totalCacheRequests = this.stats.cacheHits + this.stats.cacheMisses;
      this.performanceMetrics.cacheHitRate = MobileApiUtils.PerformanceUtils.calculateCacheHitRate(
        this.stats.cacheHits,
        totalCacheRequests,
      );

      // Calculate error rate
      this.performanceMetrics.errorRate =
        this.stats.totalRequests > 0
          ? (this.stats.failedRequests / this.stats.totalRequests) * 100
          : 0;

      // Calculate throughput
      const duration = Date.now() - this.performanceMetrics.startTime;
      this.performanceMetrics.throughput = MobileApiUtils.PerformanceUtils.calculateThroughput(
        this.stats.totalRequests,
        duration,
      );
    } catch (error) {
      console.error("Performance metrics collection failed:", error);
    }
  }

  /**
   * Update performance metrics from subsystems
   */
  private updatePerformanceMetrics(metrics: any): void {
    if (metrics.networkLatency) {
      this.performanceMetrics.networkLatency = metrics.networkLatency;
    }
  }
}

/**
 * Create unified mobile API manager
 */
export function createMobileApiManager(config: MobileApiConfig): UnifiedMobileApiManager {
  return new UnifiedMobileApiManager(config);
}

/**
 * Default mobile API configuration
 */
export const defaultMobileApiConfig: Partial<MobileApiConfig> = {
  healthCheckInterval: 30000,
  metricsInterval: 60000,
  api: {
    baseUrl: "",
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    compression: {
      enabled: true,
      algorithm: "gzip",
      level: 6,
    },
    security: {
      encryptionKey: "",
      signatureValidation: true,
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      },
    },
  },
  cache: {
    enabled: true,
    strategy: "lru",
    maxSize: 100 * 1024 * 1024, // 100MB
    defaultTtl: 3600000, // 1 hour
    compression: {
      enabled: true,
      algorithm: "gzip",
      level: 6,
    },
  },
  offlineSync: {
    enabled: true,
    syncInterval: 300000, // 5 minutes
    maxRetries: 3,
    conflictResolution: "server-wins",
    batchSize: 50,
  },
  pushNotifications: {
    supabaseUrl: "",
    supabaseKey: "",
    fcmServerKey: "",
    apnsConfig: {},
    batchSize: 100,
    rateLimitDelay: 100,
    processingInterval: 5000,
    analyticsInterval: 60000,
    syncNotifications: true,
  },
};

export * from "./cache-manager";
export * from "./mobile-api-system";
export * from "./offline-sync";
export * from "./push-notifications";
// Export all types and utilities
export * from "./types";
export * from "./utils";

export default UnifiedMobileApiManager;
