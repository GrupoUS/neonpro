/**
 * Webhook & Event System Integration
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides the main integration point for the webhook and event system:
 * - Unified system initialization and configuration
 * - Event publishing with automatic webhook delivery
 * - Webhook management and monitoring
 * - Real-time event streaming
 * - Analytics and reporting
 * - Health monitoring and diagnostics
 */

import EventSystem from "./event-system";
import type {
  BaseEvent,
  EventAnalytics,
  EventDelivery,
  EventPriority,
  EventType,
  WebhookEndpoint,
  WebhookSystemConfig,
} from "./types";
import WebhookManager from "./webhook-manager";

interface WebhookEventSystemConfig {
  supabase: {
    url: string;
    key: string;
  };
  eventSystem: {
    enableRealtime: boolean;
    enablePersistence: boolean;
    queueConfig: {
      maxSize: number;
      processingConcurrency: number;
      batchSize: number;
      processingInterval: number;
    };
    retentionDays: number;
  };
  webhookManager: {
    defaultTimeout: number;
    maxRetries: number;
    retryDelayMs: number;
    maxConcurrentDeliveries: number;
    enableSignatureValidation: boolean;
    signatureSecret: string;
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      burstLimit: number;
    };
  };
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    alertThresholds: {
      failureRate: number;
      responseTime: number;
      queueDepth: number;
    };
  };
}

export class WebhookEventSystem {
  private eventSystem: EventSystem;
  private webhookManager: WebhookManager;
  private config: WebhookEventSystemConfig;
  private isInitialized: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private systemMetrics: {
    eventsPublished: number;
    webhooksDelivered: number;
    failedDeliveries: number;
    averageDeliveryTime: number;
    lastHealthCheck: Date;
  } = {
    eventsPublished: 0,
    webhooksDelivered: 0,
    failedDeliveries: 0,
    averageDeliveryTime: 0,
    lastHealthCheck: new Date(),
  };

  constructor(config: WebhookEventSystemConfig) {
    this.config = config;

    // Initialize event system
    this.eventSystem = new EventSystem({
      supabaseUrl: config.supabase.url,
      supabaseKey: config.supabase.key,
      enableRealtime: config.eventSystem.enableRealtime,
      enablePersistence: config.eventSystem.enablePersistence,
      queueConfig: config.eventSystem.queueConfig,
      retentionDays: config.eventSystem.retentionDays,
    });

    // Initialize webhook manager
    this.webhookManager = new WebhookManager({
      supabaseUrl: config.supabase.url,
      supabaseKey: config.supabase.key,
      defaultTimeout: config.webhookManager.defaultTimeout,
      maxRetries: config.webhookManager.maxRetries,
      retryDelayMs: config.webhookManager.retryDelayMs,
      maxConcurrentDeliveries: config.webhookManager.maxConcurrentDeliveries,
      enableSignatureValidation: config.webhookManager.enableSignatureValidation,
      signatureSecret: config.webhookManager.signatureSecret,
      rateLimiting: config.webhookManager.rateLimiting,
    });
  }

  /**
   * Initialize the complete webhook and event system
   */
  async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing Webhook & Event System...");

      // Initialize event system
      await this.eventSystem.initialize();

      // Initialize webhook manager
      await this.webhookManager.initialize();

      // Setup event-to-webhook integration
      this.setupEventWebhookIntegration();

      // Start health monitoring
      if (this.config.monitoring.enableHealthChecks) {
        this.startHealthMonitoring();
      }

      this.isInitialized = true;
      console.log("✅ Webhook & Event System initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Webhook & Event System:", error);
      throw new Error("System initialization failed");
    }
  }

  /**
   * Publish an event with automatic webhook delivery
   */
  async publishEvent(eventData: Omit<BaseEvent, "id" | "timestamp">): Promise<{
    eventId: string;
    deliveryIds: string[];
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      console.log(`📤 Publishing event: ${eventData.type}`);

      // Publish event to event system
      const eventId = await this.eventSystem.publishEvent(eventData);

      // Get the published event
      const event = await this.eventSystem.getEventById(eventId);
      if (!event) {
        throw new Error("Failed to retrieve published event");
      }

      // Deliver to webhooks
      const deliveryIds = await this.webhookManager.deliverEvent(event);

      // Update metrics
      this.systemMetrics.eventsPublished++;

      console.log(`✅ Event ${eventId} published with ${deliveryIds.length} webhook deliveries`);

      return {
        eventId,
        deliveryIds,
      };
    } catch (error) {
      console.error("❌ Failed to publish event:", error);
      throw new Error(`Event publishing failed: ${error.message}`);
    }
  }

  /**
   * Register a new webhook endpoint
   */
  async registerWebhook(
    webhookData: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      console.log(`🔗 Registering webhook: ${webhookData.name}`);

      const webhookId = await this.webhookManager.registerWebhook(webhookData);

      console.log(`✅ Webhook ${webhookId} registered successfully`);
      return webhookId;
    } catch (error) {
      console.error("❌ Failed to register webhook:", error);
      throw new Error(`Webhook registration failed: ${error.message}`);
    }
  }

  /**
   * Update an existing webhook endpoint
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookEndpoint>): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      await this.webhookManager.updateWebhook(webhookId, updates);
      console.log(`✅ Webhook ${webhookId} updated successfully`);
    } catch (error) {
      console.error("❌ Failed to update webhook:", error);
      throw new Error(`Webhook update failed: ${error.message}`);
    }
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      await this.webhookManager.deleteWebhook(webhookId);
      console.log(`✅ Webhook ${webhookId} deleted successfully`);
    } catch (error) {
      console.error("❌ Failed to delete webhook:", error);
      throw new Error(`Webhook deletion failed: ${error.message}`);
    }
  }

  /**
   * Get webhook endpoint by ID
   */
  getWebhook(webhookId: string): WebhookEndpoint | null {
    return this.webhookManager.getWebhook(webhookId);
  }

  /**
   * Get all webhooks for a clinic
   */
  getWebhooksByClinic(clinicId: string): WebhookEndpoint[] {
    return this.webhookManager.getWebhooksByClinic(clinicId);
  }

  /**
   * Test a webhook endpoint
   */
  async testWebhook(
    webhookId: string,
  ): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      const webhook = this.webhookManager.getWebhook(webhookId);
      if (!webhook) {
        throw new Error(`Webhook ${webhookId} not found`);
      }

      return await this.webhookManager.testWebhookEndpoint(webhook);
    } catch (error) {
      console.error("❌ Failed to test webhook:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get events by criteria
   */
  async getEvents(criteria?: {
    eventTypes?: EventType[];
    startDate?: Date;
    endDate?: Date;
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<BaseEvent[]> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      return await this.eventSystem.getEvents(criteria);
    } catch (error) {
      console.error("❌ Failed to get events:", error);
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<BaseEvent | null> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      return await this.eventSystem.getEventById(eventId);
    } catch (error) {
      console.error("❌ Failed to get event:", error);
      return null;
    }
  }

  /**
   * Get delivery history for a webhook
   */
  async getDeliveryHistory(webhookId: string, limit: number = 50): Promise<EventDelivery[]> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      return await this.webhookManager.getDeliveryHistory(webhookId, limit);
    } catch (error) {
      console.error("❌ Failed to get delivery history:", error);
      return [];
    }
  }

  /**
   * Get delivery statistics for a webhook
   */
  async getDeliveryStats(
    webhookId: string,
    days: number = 30,
  ): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
    successRate: number;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      return await this.webhookManager.getDeliveryStats(webhookId, days);
    } catch (error) {
      console.error("❌ Failed to get delivery stats:", error);
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageResponseTime: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Get comprehensive event analytics
   */
  async getEventAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: EventType[];
    clinicId?: string;
  }): Promise<EventAnalytics> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      return await this.eventSystem.getEventAnalytics(filters);
    } catch (error) {
      console.error("❌ Failed to get event analytics:", error);
      throw new Error(`Analytics generation failed: ${error.message}`);
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    eventSystem: {
      status: "healthy" | "unhealthy";
      queueDepth: number;
      processingRate: number;
    };
    webhookSystem: {
      status: "healthy" | "unhealthy";
      activeWebhooks: number;
      failureRate: number;
      averageResponseTime: number;
    };
    metrics: typeof this.systemMetrics;
    lastCheck: Date;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      // Get event system health
      const eventSystemHealth = await this.checkEventSystemHealth();

      // Get webhook system health
      const webhookSystemHealth = await this.checkWebhookSystemHealth();

      // Determine overall status
      let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

      if (eventSystemHealth.status === "unhealthy" || webhookSystemHealth.status === "unhealthy") {
        overallStatus = "unhealthy";
      } else if (
        webhookSystemHealth.failureRate > this.config.monitoring.alertThresholds.failureRate ||
        webhookSystemHealth.averageResponseTime >
          this.config.monitoring.alertThresholds.responseTime ||
        eventSystemHealth.queueDepth > this.config.monitoring.alertThresholds.queueDepth
      ) {
        overallStatus = "degraded";
      }

      return {
        status: overallStatus,
        eventSystem: eventSystemHealth,
        webhookSystem: webhookSystemHealth,
        metrics: this.systemMetrics,
        lastCheck: new Date(),
      };
    } catch (error) {
      console.error("❌ Failed to get system health:", error);
      return {
        status: "unhealthy",
        eventSystem: {
          status: "unhealthy",
          queueDepth: 0,
          processingRate: 0,
        },
        webhookSystem: {
          status: "unhealthy",
          activeWebhooks: 0,
          failureRate: 100,
          averageResponseTime: 0,
        },
        metrics: this.systemMetrics,
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Clean up old events and delivery records
   */
  async cleanup(): Promise<{
    eventsDeleted: number;
    deliveriesDeleted: number;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error("System not initialized");
      }

      console.log("🧹 Starting system cleanup...");

      // Clean up old events
      const eventsDeleted = await this.eventSystem.cleanupOldEvents();

      // Clean up old delivery records (placeholder - would be implemented in webhook manager)
      const deliveriesDeleted = 0; // await this.webhookManager.cleanupOldDeliveries()

      console.log(
        `✅ Cleanup completed: ${eventsDeleted} events, ${deliveriesDeleted} deliveries deleted`,
      );

      return {
        eventsDeleted,
        deliveriesDeleted,
      };
    } catch (error) {
      console.error("❌ Failed to cleanup system:", error);
      throw new Error(`System cleanup failed: ${error.message}`);
    }
  }

  /**
   * Stop the entire system
   */
  async stop(): Promise<void> {
    try {
      console.log("🛑 Stopping Webhook & Event System...");

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      // Stop webhook manager
      await this.webhookManager.stop();

      // Stop event system
      await this.eventSystem.stop();

      this.isInitialized = false;
      console.log("✅ Webhook & Event System stopped successfully");
    } catch (error) {
      console.error("❌ Failed to stop system:", error);
    }
  }

  // Private Methods

  private setupEventWebhookIntegration(): void {
    // This would set up automatic webhook delivery when events are published
    // For now, this is handled in the publishEvent method
    console.log("✅ Event-Webhook integration configured");
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.monitoring.healthCheckInterval,
    );

    console.log("✅ Health monitoring started");
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      this.systemMetrics.lastHealthCheck = health.lastCheck;

      // Log health status
      if (health.status === "unhealthy") {
        console.error("🚨 System health check: UNHEALTHY");
      } else if (health.status === "degraded") {
        console.warn("⚠️ System health check: DEGRADED");
      } else {
        console.log("✅ System health check: HEALTHY");
      }

      // Here you could implement alerting logic
      // e.g., send notifications when system is unhealthy
    } catch (error) {
      console.error("❌ Health check failed:", error);
    }
  }

  private async checkEventSystemHealth(): Promise<{
    status: "healthy" | "unhealthy";
    queueDepth: number;
    processingRate: number;
  }> {
    try {
      // This would check the event system's internal health
      // For now, return basic metrics
      return {
        status: "healthy",
        queueDepth: 0, // Would get from event system
        processingRate: 0, // Would calculate from metrics
      };
    } catch (_error) {
      return {
        status: "unhealthy",
        queueDepth: 0,
        processingRate: 0,
      };
    }
  }

  private async checkWebhookSystemHealth(): Promise<{
    status: "healthy" | "unhealthy";
    activeWebhooks: number;
    failureRate: number;
    averageResponseTime: number;
  }> {
    try {
      // This would check webhook system health
      // For now, return basic metrics
      return {
        status: "healthy",
        activeWebhooks: this.webhookManager.getWebhooksByClinic("").length, // Would get all active webhooks
        failureRate: 0, // Would calculate from recent deliveries
        averageResponseTime: this.systemMetrics.averageDeliveryTime,
      };
    } catch (_error) {
      return {
        status: "unhealthy",
        activeWebhooks: 0,
        failureRate: 100,
        averageResponseTime: 0,
      };
    }
  }
}

// Export types
export type {
  BaseEvent,
  WebhookEndpoint,
  EventDelivery,
  EventAnalytics,
  WebhookSystemConfig,
  EventType,
  EventPriority,
};

// Export individual components
export { EventSystem, WebhookManager };

// Export main system as default
export default WebhookEventSystem;

// Convenience function to create a configured system
export function createWebhookEventSystem(config: WebhookEventSystemConfig): WebhookEventSystem {
  return new WebhookEventSystem(config);
}

// Default configuration factory
export function createDefaultConfig(supabaseConfig: {
  url: string;
  key: string;
}): WebhookEventSystemConfig {
  return {
    supabase: supabaseConfig,
    eventSystem: {
      enableRealtime: true,
      enablePersistence: true,
      queueConfig: {
        maxSize: 10000,
        processingConcurrency: 10,
        batchSize: 50,
        processingInterval: 1000,
      },
      retentionDays: 90,
    },
    webhookManager: {
      defaultTimeout: 30000,
      maxRetries: 3,
      retryDelayMs: 5000,
      maxConcurrentDeliveries: 20,
      enableSignatureValidation: true,
      signatureSecret: process.env.WEBHOOK_SECRET || "default-secret",
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        burstLimit: 10,
      },
    },
    monitoring: {
      enableHealthChecks: true,
      healthCheckInterval: 60000, // 1 minute
      alertThresholds: {
        failureRate: 10, // 10%
        responseTime: 5000, // 5 seconds
        queueDepth: 1000, // 1000 events
      },
    },
  };
}
