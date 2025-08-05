/**
 * NeonPro - Third-party Integrations Framework
 * Core framework implementation
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type { createClient } from "@supabase/supabase-js";
import type {
  IntegrationConfig,
  IntegrationConnector,
  IntegrationManager,
  IntegrationRequest,
  IntegrationResponse,
  IntegrationHealth,
  IntegrationMetrics,
  IntegrationLog,
  SyncOperation,
  IntegrationEvent,
  IntegrationError,
  RateLimiter,
  WebhookManager,
  IntegrationCache,
  IntegrationQueue,
  IntegrationJob,
  QueueStats,
  IntegrationType,
  RetryPolicy,
  RateLimitConfig,
  IntegrationEndpoint,
  WebhookConfig,
} from "./types";

/**
 * Main Integration Framework Class
 * Manages all third-party integrations
 */
export class NeonProIntegrationFramework implements IntegrationManager {
  private connectors: Map<string, IntegrationConnector> = new Map();
  private integrations: Map<string, IntegrationConfig> = new Map();
  private rateLimiter: RateLimiter;
  private webhookManager: WebhookManager;
  private cache: IntegrationCache;
  private queue: IntegrationQueue;
  private supabase: any;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    rateLimiter: RateLimiter,
    webhookManager: WebhookManager,
    cache: IntegrationCache,
    queue: IntegrationQueue,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.rateLimiter = rateLimiter;
    this.webhookManager = webhookManager;
    this.cache = cache;
    this.queue = queue;
  }

  /**
   * Register a new integration connector
   */
  registerConnector(connector: IntegrationConnector): void {
    this.connectors.set(connector.id, connector);
    console.log(`Registered connector: ${connector.name} (${connector.type})`);
  }

  /**
   * Create a new integration
   */
  async createIntegration(config: IntegrationConfig): Promise<string> {
    try {
      // Validate configuration
      const connector = this.connectors.get(config.type);
      if (!connector) {
        throw new IntegrationFrameworkError(
          `Connector not found for type: ${config.type}`,
          "CONNECTOR_NOT_FOUND",
          config.id,
        );
      }

      // Validate config with connector
      const isValid = await connector.validateConfig(config);
      if (!isValid) {
        throw new IntegrationFrameworkError(
          "Invalid integration configuration",
          "INVALID_CONFIG",
          config.id,
        );
      }

      // Test authentication
      const authResult = await connector.authenticate(config.credentials);
      if (!authResult) {
        throw new IntegrationFrameworkError("Authentication failed", "AUTH_FAILED", config.id);
      }

      // Save to database
      const { data, error } = await this.supabase
        .from("integrations")
        .insert({
          id: config.id,
          name: config.name,
          type: config.type,
          version: config.version,
          enabled: config.enabled,
          settings: config.settings,
          credentials: await this.encryptCredentials(config.credentials),
          endpoints: config.endpoints,
          webhooks: config.webhooks,
          rate_limits: config.rateLimits,
          retry_policy: config.retryPolicy,
          monitoring: config.monitoring,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .select()
        .single();

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to save integration: ${error.message}`,
          "DATABASE_ERROR",
          config.id,
        );
      }

      // Cache the integration
      this.integrations.set(config.id, config);
      await this.cache.set(`integration:${config.id}`, config, 3600);

      // Log creation
      await this.logEvent({
        id: crypto.randomUUID(),
        integrationId: config.id,
        type: "integration_created",
        data: { name: config.name, type: config.type },
        source: "internal",
        timestamp: new Date(),
        processed: true,
        retryCount: 0,
        clinicId: config.settings.clinicId || "system",
      });

      return config.id;
    } catch (error) {
      console.error("Failed to create integration:", error);
      throw error;
    }
  }

  /**
   * Update an existing integration
   */
  async updateIntegration(id: string, updates: Partial<IntegrationConfig>): Promise<void> {
    try {
      const existing = await this.getIntegration(id);
      if (!existing) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };

      // Validate if connector type changed
      if (updates.type && updates.type !== existing.type) {
        const connector = this.connectors.get(updates.type);
        if (!connector) {
          throw new IntegrationFrameworkError(
            `Connector not found for type: ${updates.type}`,
            "CONNECTOR_NOT_FOUND",
            id,
          );
        }

        const isValid = await connector.validateConfig(updated);
        if (!isValid) {
          throw new IntegrationFrameworkError(
            "Invalid integration configuration",
            "INVALID_CONFIG",
            id,
          );
        }
      }

      // Update in database
      const { error } = await this.supabase
        .from("integrations")
        .update({
          name: updated.name,
          type: updated.type,
          version: updated.version,
          enabled: updated.enabled,
          settings: updated.settings,
          credentials: updates.credentials
            ? await this.encryptCredentials(updates.credentials)
            : undefined,
          endpoints: updated.endpoints,
          webhooks: updated.webhooks,
          rate_limits: updated.rateLimits,
          retry_policy: updated.retryPolicy,
          monitoring: updated.monitoring,
          updated_at: new Date(),
        })
        .eq("id", id);

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to update integration: ${error.message}`,
          "DATABASE_ERROR",
          id,
        );
      }

      // Update cache
      this.integrations.set(id, updated);
      await this.cache.set(`integration:${id}`, updated, 3600);

      // Log update
      await this.logEvent({
        id: crypto.randomUUID(),
        integrationId: id,
        type: "integration_updated",
        data: updates,
        source: "internal",
        timestamp: new Date(),
        processed: true,
        retryCount: 0,
        clinicId: updated.settings.clinicId || "system",
      });
    } catch (error) {
      console.error("Failed to update integration:", error);
      throw error;
    }
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(id: string): Promise<void> {
    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      // Delete from database
      const { error } = await this.supabase.from("integrations").delete().eq("id", id);

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to delete integration: ${error.message}`,
          "DATABASE_ERROR",
          id,
        );
      }

      // Remove from cache and memory
      this.integrations.delete(id);
      await this.cache.delete(`integration:${id}`);

      // Log deletion
      await this.logEvent({
        id: crypto.randomUUID(),
        integrationId: id,
        type: "integration_deleted",
        data: { name: integration.name, type: integration.type },
        source: "internal",
        timestamp: new Date(),
        processed: true,
        retryCount: 0,
        clinicId: integration.settings.clinicId || "system",
      });
    } catch (error) {
      console.error("Failed to delete integration:", error);
      throw error;
    }
  }

  /**
   * Get an integration by ID
   */
  async getIntegration(id: string): Promise<IntegrationConfig | null> {
    try {
      // Check cache first
      const cached = await this.cache.get<IntegrationConfig>(`integration:${id}`);
      if (cached) {
        return cached;
      }

      // Check memory
      if (this.integrations.has(id)) {
        return this.integrations.get(id)!;
      }

      // Load from database
      const { data, error } = await this.supabase
        .from("integrations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      const integration: IntegrationConfig = {
        id: data.id,
        name: data.name,
        type: data.type,
        version: data.version,
        enabled: data.enabled,
        settings: data.settings,
        credentials: await this.decryptCredentials(data.credentials),
        endpoints: data.endpoints,
        webhooks: data.webhooks,
        rateLimits: data.rate_limits,
        retryPolicy: data.retry_policy,
        monitoring: data.monitoring,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Cache and store in memory
      this.integrations.set(id, integration);
      await this.cache.set(`integration:${id}`, integration, 3600);

      return integration;
    } catch (error) {
      console.error("Failed to get integration:", error);
      return null;
    }
  }

  /**
   * List all integrations for a clinic
   */
  async listIntegrations(clinicId: string): Promise<IntegrationConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from("integrations")
        .select("*")
        .eq("settings->>clinicId", clinicId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to list integrations: ${error.message}`,
          "DATABASE_ERROR",
          "list",
        );
      }

      const integrations: IntegrationConfig[] = [];
      for (const item of data || []) {
        const integration: IntegrationConfig = {
          id: item.id,
          name: item.name,
          type: item.type,
          version: item.version,
          enabled: item.enabled,
          settings: item.settings,
          credentials: await this.decryptCredentials(item.credentials),
          endpoints: item.endpoints,
          webhooks: item.webhooks,
          rateLimits: item.rate_limits,
          retryPolicy: item.retry_policy,
          monitoring: item.monitoring,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        };
        integrations.push(integration);
      }

      return integrations;
    } catch (error) {
      console.error("Failed to list integrations:", error);
      throw error;
    }
  }

  /**
   * Test connection for an integration
   */
  async testConnection(id: string): Promise<IntegrationHealth> {
    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      const connector = this.connectors.get(integration.type);
      if (!connector) {
        throw new IntegrationFrameworkError(
          `Connector not found for type: ${integration.type}`,
          "CONNECTOR_NOT_FOUND",
          id,
        );
      }

      const health = await connector.getHealthStatus();

      // Log health check
      await this.logEvent({
        id: crypto.randomUUID(),
        integrationId: id,
        type: "health_check",
        data: health,
        source: "internal",
        timestamp: new Date(),
        processed: true,
        retryCount: 0,
        clinicId: integration.settings.clinicId || "system",
      });

      return health;
    } catch (error) {
      console.error("Failed to test connection:", error);
      throw error;
    }
  }

  /**
   * Execute a request through an integration
   */
  async executeRequest(id: string, endpoint: string, data?: any): Promise<IntegrationResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      if (!integration.enabled) {
        throw new IntegrationFrameworkError(
          `Integration is disabled: ${id}`,
          "INTEGRATION_DISABLED",
          id,
        );
      }

      const connector = this.connectors.get(integration.type);
      if (!connector) {
        throw new IntegrationFrameworkError(
          `Connector not found for type: ${integration.type}`,
          "CONNECTOR_NOT_FOUND",
          id,
        );
      }

      // Find endpoint configuration
      const endpointConfig = integration.endpoints.find((ep) => ep.name === endpoint);
      if (!endpointConfig) {
        throw new IntegrationFrameworkError(
          `Endpoint not found: ${endpoint}`,
          "ENDPOINT_NOT_FOUND",
          id,
        );
      }

      // Check rate limits
      const canProceed = await this.rateLimiter.checkLimit(id, endpoint);
      if (!canProceed) {
        throw new IntegrationFrameworkError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", id);
      }

      // Log request
      const request: IntegrationRequest = {
        id: requestId,
        integrationId: id,
        endpoint,
        method: endpointConfig.method,
        headers: endpointConfig.headers || {},
        body: data,
        timestamp: new Date(),
        clinicId: integration.settings.clinicId || "system",
      };

      await this.logRequest(request);

      // Execute request
      const response = await connector.request(endpointConfig, data);
      response.requestId = requestId;
      response.duration = Date.now() - startTime;

      // Increment rate limit counter
      await this.rateLimiter.incrementCounter(id, endpoint);

      // Log response
      await this.logResponse(response);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResponse: IntegrationResponse = {
        id: crypto.randomUUID(),
        requestId,
        status: "error",
        statusCode: error instanceof IntegrationFrameworkError ? 400 : 500,
        headers: {},
        error: error.message,
        duration,
        timestamp: new Date(),
      };

      await this.logResponse(errorResponse);
      throw error;
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(id: string, payload: any, headers: Record<string, string>): Promise<void> {
    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      const connector = this.connectors.get(integration.type);
      if (!connector) {
        throw new IntegrationFrameworkError(
          `Connector not found for type: ${integration.type}`,
          "CONNECTOR_NOT_FOUND",
          id,
        );
      }

      await connector.handleWebhook(payload, headers);

      // Log webhook
      await this.logEvent({
        id: crypto.randomUUID(),
        integrationId: id,
        type: "webhook_received",
        data: { payload, headers },
        source: "external",
        timestamp: new Date(),
        processed: true,
        retryCount: 0,
        clinicId: integration.settings.clinicId || "system",
      });
    } catch (error) {
      console.error("Failed to handle webhook:", error);
      throw error;
    }
  }

  /**
   * Start a sync operation
   */
  async startSync(id: string, operation: Partial<SyncOperation>): Promise<string> {
    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        throw new IntegrationFrameworkError(
          `Integration not found: ${id}`,
          "INTEGRATION_NOT_FOUND",
          id,
        );
      }

      const connector = this.connectors.get(integration.type);
      if (!connector) {
        throw new IntegrationFrameworkError(
          `Connector not found for type: ${integration.type}`,
          "CONNECTOR_NOT_FOUND",
          id,
        );
      }

      const syncOperation: SyncOperation = {
        id: crypto.randomUUID(),
        integrationId: id,
        type: operation.type || "sync",
        entity: operation.entity || "unknown",
        status: "pending",
        progress: 0,
        totalRecords: operation.totalRecords || 0,
        processedRecords: 0,
        errorRecords: 0,
        startedAt: new Date(),
        metadata: operation.metadata,
        clinicId: integration.settings.clinicId || "system",
      };

      // Save sync operation
      const { error } = await this.supabase
        .from("integration_sync_operations")
        .insert(syncOperation);

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to save sync operation: ${error.message}`,
          "DATABASE_ERROR",
          id,
        );
      }

      // Queue sync job
      await this.queue.enqueue({
        id: crypto.randomUUID(),
        type: "sync",
        integrationId: id,
        payload: syncOperation,
        priority: 1,
        attempts: 0,
        maxAttempts: 3,
        delay: 0,
        status: "pending",
        createdAt: new Date(),
      });

      return syncOperation.id;
    } catch (error) {
      console.error("Failed to start sync:", error);
      throw error;
    }
  }

  /**
   * Get metrics for an integration
   */
  async getMetrics(id: string, period: string): Promise<IntegrationMetrics> {
    try {
      // Implementation would query metrics from database
      // This is a simplified version
      const metrics: IntegrationMetrics = {
        integrationId: id,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 100,
        period: period as any,
        timestamp: new Date(),
      };

      return metrics;
    } catch (error) {
      console.error("Failed to get metrics:", error);
      throw error;
    }
  }

  /**
   * Get logs for an integration
   */
  async getLogs(id: string, filters?: any): Promise<IntegrationLog[]> {
    try {
      const { data, error } = await this.supabase
        .from("integration_logs")
        .select("*")
        .eq("integration_id", id)
        .order("timestamp", { ascending: false })
        .limit(filters?.limit || 100);

      if (error) {
        throw new IntegrationFrameworkError(
          `Failed to get logs: ${error.message}`,
          "DATABASE_ERROR",
          id,
        );
      }

      return data || [];
    } catch (error) {
      console.error("Failed to get logs:", error);
      throw error;
    }
  }

  // Private helper methods
  private async encryptCredentials(credentials: any): Promise<string> {
    // Implementation would use proper encryption
    return JSON.stringify(credentials);
  }

  private async decryptCredentials(encrypted: string): Promise<any> {
    // Implementation would use proper decryption
    return JSON.parse(encrypted);
  }

  private async logRequest(request: IntegrationRequest): Promise<void> {
    await this.supabase.from("integration_requests").insert(request);
  }

  private async logResponse(response: IntegrationResponse): Promise<void> {
    await this.supabase.from("integration_responses").insert(response);
  }

  private async logEvent(event: IntegrationEvent): Promise<void> {
    await this.supabase.from("integration_events").insert(event);
  }
}

/**
 * Custom error class for integration framework
 */
export class IntegrationFrameworkError extends Error implements IntegrationError {
  public code: string;
  public integrationId: string;
  public endpoint?: string;
  public statusCode?: number;
  public retryable: boolean;
  public metadata?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    integrationId: string,
    endpoint?: string,
    statusCode?: number,
    retryable: boolean = false,
    metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = "IntegrationFrameworkError";
    this.code = code;
    this.integrationId = integrationId;
    this.endpoint = endpoint;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.metadata = metadata;
  }
}
