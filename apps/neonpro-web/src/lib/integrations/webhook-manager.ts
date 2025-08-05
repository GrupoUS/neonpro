/**
 * NeonPro - Webhook Manager
 * Webhook management system for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type {
  IntegrationJob,
  IntegrationLog,
  IntegrationQueue,
  RetryPolicy,
  WebhookConfig,
  WebhookManager,
} from "./types";

/**
 * Webhook Manager Implementation
 * Handles webhook registration, processing, and retry logic
 */
export class NeonProWebhookManager implements WebhookManager {
  private supabase: any;
  private queue: IntegrationQueue;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private retryJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string, queue: IntegrationQueue) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.queue = queue;
    this.loadWebhooks();
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(config: WebhookConfig): Promise<string> {
    try {
      // Validate webhook configuration
      this.validateWebhookConfig(config);

      // Save to database
      const { data, error } = await this.supabase
        .from("integration_webhooks")
        .insert({
          id: config.id,
          url: config.url,
          events: config.events,
          secret: config.secret ? this.hashSecret(config.secret) : null,
          active: config.active,
          retry_policy: config.retryPolicy,
          filters: config.filters,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to register webhook: ${error.message}`);
      }

      // Cache the webhook
      this.webhooks.set(config.id, config);

      // Log registration
      await this.logWebhookEvent(config.id, "webhook_registered", {
        url: config.url,
        events: config.events,
      });

      return config.id;
    } catch (error) {
      console.error("Failed to register webhook:", error);
      throw error;
    }
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<void> {
    try {
      const existing = await this.getWebhook(id);
      if (!existing) {
        throw new Error(`Webhook not found: ${id}`);
      }

      const updated = { ...existing, ...updates };
      this.validateWebhookConfig(updated);

      // Update in database
      const updateData: any = {
        updated_at: new Date(),
      };

      if (updates.url) updateData.url = updates.url;
      if (updates.events) updateData.events = updates.events;
      if (updates.secret) updateData.secret = this.hashSecret(updates.secret);
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.retryPolicy) updateData.retry_policy = updates.retryPolicy;
      if (updates.filters) updateData.filters = updates.filters;

      const { error } = await this.supabase
        .from("integration_webhooks")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to update webhook: ${error.message}`);
      }

      // Update cache
      this.webhooks.set(id, updated);

      // Log update
      await this.logWebhookEvent(id, "webhook_updated", updates);
    } catch (error) {
      console.error("Failed to update webhook:", error);
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    try {
      const webhook = await this.getWebhook(id);
      if (!webhook) {
        throw new Error(`Webhook not found: ${id}`);
      }

      // Delete from database
      const { error } = await this.supabase.from("integration_webhooks").delete().eq("id", id);

      if (error) {
        throw new Error(`Failed to delete webhook: ${error.message}`);
      }

      // Remove from cache
      this.webhooks.delete(id);

      // Cancel any pending retry jobs
      const retryJob = this.retryJobs.get(id);
      if (retryJob) {
        clearTimeout(retryJob);
        this.retryJobs.delete(id);
      }

      // Log deletion
      await this.logWebhookEvent(id, "webhook_deleted", {
        url: webhook.url,
      });
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      throw error;
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(id: string, payload: any, headers: Record<string, string>): Promise<void> {
    try {
      const webhook = await this.getWebhook(id);
      if (!webhook) {
        throw new Error(`Webhook not found: ${id}`);
      }

      if (!webhook.active) {
        throw new Error(`Webhook is inactive: ${id}`);
      }

      // Validate signature if secret is configured
      if (webhook.secret) {
        const signature = headers["x-webhook-signature"] || headers["x-hub-signature-256"];
        if (!signature || !this.validateSignature(payload, signature, webhook.secret)) {
          throw new Error("Invalid webhook signature");
        }
      }

      // Apply filters if configured
      if (webhook.filters && !this.applyFilters(payload, webhook.filters)) {
        await this.logWebhookEvent(id, "webhook_filtered", {
          reason: "Payload did not match filters",
        });
        return;
      }

      // Extract event type from payload
      const eventType = this.extractEventType(payload, headers);
      if (!webhook.events.includes(eventType) && !webhook.events.includes("*")) {
        await this.logWebhookEvent(id, "webhook_ignored", {
          eventType,
          reason: "Event type not subscribed",
        });
        return;
      }

      // Queue webhook processing job
      const job: IntegrationJob = {
        id: crypto.randomUUID(),
        type: "webhook",
        integrationId: id,
        payload: {
          webhookId: id,
          eventType,
          payload,
          headers,
          timestamp: new Date(),
        },
        priority: 2,
        attempts: 0,
        maxAttempts: webhook.retryPolicy.maxRetries + 1,
        delay: 0,
        status: "pending",
        createdAt: new Date(),
      };

      await this.queue.enqueue(job);

      // Log successful processing
      await this.logWebhookEvent(id, "webhook_processed", {
        eventType,
        jobId: job.id,
      });
    } catch (error) {
      console.error("Failed to process webhook:", error);

      // Log error
      await this.logWebhookEvent(id, "webhook_error", {
        error: error.message,
        payload: typeof payload === "object" ? JSON.stringify(payload) : payload,
      });

      throw error;
    }
  }

  /**
   * Validate webhook signature
   */
  validateSignature(payload: any, signature: string, secret: string): boolean {
    try {
      const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
      const expectedSignature = this.generateSignature(payloadString, secret);

      // Support different signature formats
      const cleanSignature = signature.replace(/^(sha256=|sha1=)/, "");
      const cleanExpected = expectedSignature.replace(/^(sha256=|sha1=)/, "");

      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, "hex"),
        Buffer.from(cleanExpected, "hex"),
      );
    } catch (error) {
      console.error("Signature validation error:", error);
      return false;
    }
  }

  /**
   * Retry failed webhook
   */
  async retryFailedWebhook(id: string): Promise<void> {
    try {
      const webhook = await this.getWebhook(id);
      if (!webhook) {
        throw new Error(`Webhook not found: ${id}`);
      }

      // Get failed webhook deliveries
      const { data: failedDeliveries, error } = await this.supabase
        .from("webhook_deliveries")
        .select("*")
        .eq("webhook_id", id)
        .eq("status", "failed")
        .lt("attempts", webhook.retryPolicy.maxRetries)
        .order("created_at", { ascending: true })
        .limit(10);

      if (error) {
        throw new Error(`Failed to get failed deliveries: ${error.message}`);
      }

      for (const delivery of failedDeliveries || []) {
        await this.scheduleRetry(delivery, webhook.retryPolicy);
      }

      await this.logWebhookEvent(id, "webhook_retry_scheduled", {
        count: failedDeliveries?.length || 0,
      });
    } catch (error) {
      console.error("Failed to retry webhook:", error);
      throw error;
    }
  }

  /**
   * Get webhook logs
   */
  async getWebhookLogs(id: string): Promise<IntegrationLog[]> {
    try {
      const { data, error } = await this.supabase
        .from("integration_logs")
        .select("*")
        .eq("integration_id", id)
        .like("message", "%webhook%")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to get webhook logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Failed to get webhook logs:", error);
      return [];
    }
  }

  // Private helper methods

  /**
   * Load webhooks from database
   */
  private async loadWebhooks(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("integration_webhooks")
        .select("*")
        .eq("active", true);

      if (error) {
        console.error("Failed to load webhooks:", error);
        return;
      }

      for (const item of data || []) {
        const webhook: WebhookConfig = {
          id: item.id,
          url: item.url,
          events: item.events,
          secret: item.secret,
          active: item.active,
          retryPolicy: item.retry_policy,
          filters: item.filters,
        };
        this.webhooks.set(item.id, webhook);
      }
    } catch (error) {
      console.error("Failed to load webhooks:", error);
    }
  }

  /**
   * Get webhook by ID
   */
  private async getWebhook(id: string): Promise<WebhookConfig | null> {
    // Check cache first
    if (this.webhooks.has(id)) {
      return this.webhooks.get(id)!;
    }

    // Load from database
    try {
      const { data, error } = await this.supabase
        .from("integration_webhooks")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      const webhook: WebhookConfig = {
        id: data.id,
        url: data.url,
        events: data.events,
        secret: data.secret,
        active: data.active,
        retryPolicy: data.retry_policy,
        filters: data.filters,
      };

      this.webhooks.set(id, webhook);
      return webhook;
    } catch (error) {
      console.error("Failed to get webhook:", error);
      return null;
    }
  }

  /**
   * Validate webhook configuration
   */
  private validateWebhookConfig(config: WebhookConfig): void {
    if (!config.id) {
      throw new Error("Webhook ID is required");
    }

    if (!config.url) {
      throw new Error("Webhook URL is required");
    }

    try {
      new URL(config.url);
    } catch {
      throw new Error("Invalid webhook URL");
    }

    if (!config.events || config.events.length === 0) {
      throw new Error("At least one event must be specified");
    }

    if (!config.retryPolicy) {
      throw new Error("Retry policy is required");
    }

    if (config.retryPolicy.maxRetries < 0 || config.retryPolicy.maxRetries > 10) {
      throw new Error("Max retries must be between 0 and 10");
    }
  }

  /**
   * Hash webhook secret
   */
  private hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex");
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string): string {
    return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Extract event type from payload
   */
  private extractEventType(payload: any, headers: Record<string, string>): string {
    // Try common event type fields
    if (payload.event_type) return payload.event_type;
    if (payload.type) return payload.type;
    if (payload.action) return payload.action;
    if (headers["x-event-type"]) return headers["x-event-type"];
    if (headers["x-github-event"]) return headers["x-github-event"];

    return "unknown";
  }

  /**
   * Apply filters to payload
   */
  private applyFilters(payload: any, filters: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(filters)) {
      const actualValue = this.getNestedValue(payload, key);

      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Schedule webhook retry
   */
  private async scheduleRetry(delivery: any, retryPolicy: RetryPolicy): Promise<void> {
    const delay = this.calculateRetryDelay(delivery.attempts, retryPolicy);

    const timeoutId = setTimeout(async () => {
      try {
        // Create retry job
        const job: IntegrationJob = {
          id: crypto.randomUUID(),
          type: "webhook",
          integrationId: delivery.webhook_id,
          payload: {
            webhookId: delivery.webhook_id,
            eventType: delivery.event_type,
            payload: delivery.payload,
            headers: delivery.headers,
            timestamp: new Date(),
            isRetry: true,
            originalDeliveryId: delivery.id,
          },
          priority: 1,
          attempts: delivery.attempts,
          maxAttempts: retryPolicy.maxRetries + 1,
          delay: 0,
          status: "pending",
          createdAt: new Date(),
        };

        await this.queue.enqueue(job);

        // Remove from retry jobs map
        this.retryJobs.delete(delivery.id);
      } catch (error) {
        console.error("Failed to schedule retry:", error);
      }
    }, delay);

    this.retryJobs.set(delivery.id, timeoutId);
  }

  /**
   * Calculate retry delay based on strategy
   */
  private calculateRetryDelay(attempts: number, retryPolicy: RetryPolicy): number {
    let delay = retryPolicy.initialDelay;

    switch (retryPolicy.backoffStrategy) {
      case "exponential":
        delay = retryPolicy.initialDelay * 2 ** attempts;
        break;
      case "linear":
        delay = retryPolicy.initialDelay * (attempts + 1);
        break;
      case "fixed":
      default:
        delay = retryPolicy.initialDelay;
        break;
    }

    return Math.min(delay, retryPolicy.maxDelay);
  }

  /**
   * Log webhook event
   */
  private async logWebhookEvent(
    webhookId: string,
    eventType: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const log: IntegrationLog = {
        id: crypto.randomUUID(),
        integrationId: webhookId,
        level: "info",
        message: `Webhook ${eventType}`,
        metadata,
        timestamp: new Date(),
        clinicId: "system",
      };

      await this.supabase.from("integration_logs").insert(log);
    } catch (error) {
      console.error("Failed to log webhook event:", error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Cancel all pending retry jobs
    for (const [id, timeoutId] of this.retryJobs) {
      clearTimeout(timeoutId);
    }
    this.retryJobs.clear();
    this.webhooks.clear();
  }
}

/**
 * Webhook signature utilities
 */
export class WebhookSignatureUtils {
  /**
   * Generate HMAC signature for webhook payload
   */
  static generateSignature(payload: string, secret: string, algorithm: string = "sha256"): string {
    return crypto.createHmac(algorithm, secret).update(payload).digest("hex");
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: string = "sha256",
  ): boolean {
    try {
      const expectedSignature = WebhookSignatureUtils.generateSignature(payload, secret, algorithm);
      const cleanSignature = signature.replace(/^(sha256=|sha1=)/, "");

      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate webhook secret
   */
  static generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
