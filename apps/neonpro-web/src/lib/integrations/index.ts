/**
 * NeonPro - Third-party Integrations Framework
 * Main export file for the integrations system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

export {
  CacheFactory,
  MemoryIntegrationCache,
  RedisIntegrationCache,
  SupabaseIntegrationCache,
} from "./cache";
export { GoogleCalendarConnector, GoogleCalendarUtils } from "./connectors/google-calendar";
export { StripeConnector, StripeUtils } from "./connectors/stripe";
// Connectors
export { WhatsAppConnector, WhatsAppUtils } from "./connectors/whatsapp";
// Core Framework
export { NeonProIntegrationFramework } from "./framework";
export {
  MemoryIntegrationQueue,
  QueueFactory,
  SupabaseIntegrationQueue,
} from "./queue";
export { MemoryRateLimiter, SupabaseRateLimiter } from "./rate-limiter";
// Re-export commonly used types for convenience
export type {
  IntegrationCache,
  IntegrationConfig,
  IntegrationConnector,
  IntegrationManager,
  IntegrationQueue,
  IntegrationRequest,
  IntegrationResponse,
  RateLimiter,
  WebhookConfig,
  WebhookManager,
} from "./types";

// Types
export * from "./types";
export { NeonProWebhookManager, WebhookSignatureUtils } from "./webhook-manager";

/**
 * Integration Framework Factory
 * Provides easy setup for the complete integration system
 */
export class IntegrationFrameworkFactory {
  /**
   * Create a complete integration framework instance
   */
  static async create(
    config: {
      supabaseUrl?: string;
      supabaseKey?: string;
      redisUrl?: string;
      cacheType?: "memory" | "redis" | "supabase";
      queueType?: "memory" | "supabase";
      rateLimiterType?: "memory" | "supabase";
    } = {},
  ): Promise<NeonProIntegrationFramework> {
    const { cacheType = "memory", queueType = "memory", rateLimiterType = "memory" } = config;

    // Create cache instance
    const cache = CacheFactory.create(cacheType, {
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      redisUrl: config.redisUrl,
    });

    // Create queue instance
    const queue = QueueFactory.create(queueType, {
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
    });

    // Create rate limiter instance
    let rateLimiter;
    if (rateLimiterType === "supabase" && config.supabaseUrl && config.supabaseKey) {
      rateLimiter = new SupabaseRateLimiter(config.supabaseUrl, config.supabaseKey);
    } else {
      rateLimiter = new MemoryRateLimiter();
    }

    // Create webhook manager
    const webhookManager = new NeonProWebhookManager({
      queue,
      rateLimiter,
    });

    // Create and return framework instance
    return new NeonProIntegrationFramework({
      cache,
      queue,
      rateLimiter,
      webhookManager,
    });
  }

  /**
   * Create WhatsApp connector with default configuration
   */
  static createWhatsAppConnector(config: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken?: string;
    webhookUrl?: string;
  }) {
    return new WhatsAppConnector({
      id: "whatsapp-business",
      name: "WhatsApp Business",
      type: "messaging",
      enabled: true,
      credentials: {
        accessToken: config.accessToken,
        phoneNumberId: config.phoneNumberId,
        businessAccountId: config.businessAccountId,
        webhookVerifyToken: config.webhookVerifyToken || "",
      },
      endpoints: {
        baseUrl: "https://graph.facebook.com/v18.0",
        webhookUrl: config.webhookUrl,
      },
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerMinute: 600,
        requestsPerHour: 36000,
      },
    });
  }

  /**
   * Create Google Calendar connector with default configuration
   */
  static createGoogleCalendarConnector(config: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    calendarId: string;
    timeZone?: string;
    webhookUrl?: string;
  }) {
    return new GoogleCalendarConnector({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      calendarId: config.calendarId,
      timeZone: config.timeZone || "America/Sao_Paulo",
      webhookUrl: config.webhookUrl,
    });
  }

  /**
   * Create Stripe connector with default configuration
   */
  static createStripeConnector(config: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    currency?: string;
    country?: string;
    webhookUrl?: string;
  }) {
    return new StripeConnector({
      secretKey: config.secretKey,
      publishableKey: config.publishableKey,
      webhookSecret: config.webhookSecret,
      currency: config.currency || "BRL",
      country: config.country || "BR",
      webhookUrl: config.webhookUrl,
    });
  }
}

/**
 * Default export for easy framework access
 */
export default NeonProIntegrationFramework;
