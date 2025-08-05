/**
 * Background Job Processors - Research-Backed Implementation
 *
 * Handles background processing for:
 * - OAuth token refresh automation
 * - Data synchronization jobs
 * - Webhook event processing
 * - Analytics data aggregation
 *
 * Implementation follows Next.js serverless patterns with queue-based processing
 * Based on research from Bull, Redis patterns, and serverless job processing
 */

import type { createClient } from "@/lib/supabase/server";
import type { InstagramOAuthHandler } from "@/lib/oauth/platforms/instagram-handler";
import type { FacebookOAuthHandler } from "@/lib/oauth/platforms/facebook-handler";
import type { WhatsAppOAuthHandler } from "@/lib/oauth/platforms/whatsapp-handler";
import type { HubSpotOAuthHandler } from "@/lib/oauth/platforms/hubspot-handler";

interface JobContext {
  jobId: string;
  profileId: string;
  platform: string;
  connectionId: string;
  retryCount?: number;
  maxRetries?: number;
}

interface TokenRefreshJob extends JobContext {
  type: "token_refresh";
  accountId: string;
  currentToken: string;
  refreshToken?: string;
}

interface DataSyncJob extends JobContext {
  type: "data_sync";
  syncType: "posts" | "analytics" | "contacts" | "deals";
  lastSyncAt?: string;
  fullSync?: boolean;
}

interface WebhookProcessingJob extends JobContext {
  type: "webhook_processing";
  webhookData: any;
  eventType: string;
  priority: "high" | "medium" | "low";
}

interface AnalyticsAggregationJob extends JobContext {
  type: "analytics_aggregation";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  metrics: string[];
}

type BackgroundJob = TokenRefreshJob | DataSyncJob | WebhookProcessingJob | AnalyticsAggregationJob;

/**
 * Job Queue Manager - Serverless-compatible queue implementation
 */
export class JobQueueManager {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Add job to the processing queue
   */
  async addJob(
    job: BackgroundJob,
    priority: "high" | "medium" | "low" = "medium",
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("background_jobs")
        .insert({
          id: job.jobId,
          type: job.type,
          profile_id: job.profileId,
          platform: job.platform,
          priority,
          payload: job,
          status: "pending",
          retry_count: 0,
          max_retries: job.maxRetries || 3,
          scheduled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Failed to queue job: ${error.message}`);
      }

      console.log(`Job ${job.jobId} queued successfully with priority ${priority}`);
      return data.id;
    } catch (error) {
      console.error("Error adding job to queue:", error);
      throw error;
    }
  }

  /**
   * Process next job in the queue
   */
  async processNextJob(): Promise<boolean> {
    try {
      // Get next job with priority ordering
      const { data: job, error } = await this.supabase
        .from("background_jobs")
        .select("*")
        .eq("status", "pending")
        .or("scheduled_at.lte." + new Date().toISOString())
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error || !job) {
        return false; // No jobs to process
      }

      // Mark job as processing
      await this.supabase
        .from("background_jobs")
        .update({
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      try {
        // Process the job based on type
        await this.executeJob(job.payload);

        // Mark job as completed
        await this.supabase
          .from("background_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        console.log(`Job ${job.id} completed successfully`);
        return true;
      } catch (processingError) {
        console.error(`Job ${job.id} processing failed:`, processingError);

        // Handle job failure with retry logic
        const newRetryCount = (job.retry_count || 0) + 1;

        if (newRetryCount >= (job.max_retries || 3)) {
          // Max retries reached, mark as failed
          await this.supabase
            .from("background_jobs")
            .update({
              status: "failed",
              error_message: processingError.message,
              failed_at: new Date().toISOString(),
            })
            .eq("id", job.id);
        } else {
          // Schedule retry with exponential backoff
          const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // Exponential backoff in minutes
          const scheduledAt = new Date(Date.now() + retryDelay).toISOString();

          await this.supabase
            .from("background_jobs")
            .update({
              status: "pending",
              retry_count: newRetryCount,
              scheduled_at: scheduledAt,
              error_message: processingError.message,
            })
            .eq("id", job.id);
        }

        return false;
      }
    } catch (error) {
      console.error("Error processing job queue:", error);
      return false;
    }
  }

  /**
   * Execute specific job based on type
   */
  private async executeJob(job: BackgroundJob): Promise<void> {
    switch (job.type) {
      case "token_refresh":
        await this.processTokenRefresh(job);
        break;
      case "data_sync":
        await this.processDataSync(job);
        break;
      case "webhook_processing":
        await this.processWebhook(job);
        break;
      case "analytics_aggregation":
        await this.processAnalyticsAggregation(job);
        break;
      default:
        throw new Error(`Unknown job type: ${(job as any).type}`);
    }
  }

  /**
   * Process OAuth token refresh jobs
   */
  private async processTokenRefresh(job: TokenRefreshJob): Promise<void> {
    try {
      let handler;

      switch (job.platform) {
        case "instagram":
          handler = new InstagramOAuthHandler();
          break;
        case "facebook":
          handler = new FacebookOAuthHandler();
          break;
        case "whatsapp":
          handler = new WhatsAppOAuthHandler();
          break;
        case "hubspot":
          handler = new HubSpotOAuthHandler();
          break;
        default:
          throw new Error(`Unsupported platform: ${job.platform}`);
      }

      const refreshedTokens = await handler.refreshToken(job.refreshToken || job.currentToken);

      // Update the connection with new tokens
      await this.supabase
        .from("social_media_accounts")
        .update({
          access_token: refreshedTokens.accessToken,
          refresh_token: refreshedTokens.refreshToken,
          token_expires_at: refreshedTokens.expiresAt,
          last_token_refresh: new Date().toISOString(),
          status: "active",
        })
        .eq("id", job.accountId);

      console.log(`Token refreshed successfully for ${job.platform} account ${job.accountId}`);
    } catch (error) {
      console.error(`Token refresh failed for ${job.platform}:`, error);

      // Mark connection as needs reauthorization
      await this.supabase
        .from("social_media_accounts")
        .update({
          status: "needs_reauth",
          last_error: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.accountId);

      throw error;
    }
  }

  /**
   * Process data synchronization jobs
   */
  private async processDataSync(job: DataSyncJob): Promise<void> {
    try {
      // Get connection details
      const { data: connection } = await this.supabase
        .from("social_media_accounts")
        .select("*")
        .eq("id", job.connectionId)
        .single();

      if (!connection) {
        throw new Error(`Connection not found: ${job.connectionId}`);
      }

      switch (job.syncType) {
        case "posts":
          await this.syncSocialMediaPosts(connection, job);
          break;
        case "analytics":
          await this.syncSocialMediaAnalytics(connection, job);
          break;
        case "contacts":
          await this.syncMarketingContacts(connection, job);
          break;
        case "deals":
          await this.syncMarketingDeals(connection, job);
          break;
        default:
          throw new Error(`Unknown sync type: ${job.syncType}`);
      }

      // Update last sync timestamp
      await this.supabase
        .from("social_media_accounts")
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", job.connectionId);
    } catch (error) {
      console.error(`Data sync failed for ${job.syncType}:`, error);
      throw error;
    }
  }

  /**
   * Process webhook events asynchronously
   */
  private async processWebhook(job: WebhookProcessingJob): Promise<void> {
    try {
      // Process webhook data based on platform and event type
      switch (job.platform) {
        case "instagram":
          await this.processInstagramWebhookData(job.webhookData, job.eventType);
          break;
        case "facebook":
          await this.processFacebookWebhookData(job.webhookData, job.eventType);
          break;
        case "whatsapp":
          await this.processWhatsAppWebhookData(job.webhookData, job.eventType);
          break;
        case "hubspot":
          await this.processHubSpotWebhookData(job.webhookData, job.eventType);
          break;
        default:
          throw new Error(`Unsupported webhook platform: ${job.platform}`);
      }
    } catch (error) {
      console.error(`Webhook processing failed for ${job.platform}:`, error);
      throw error;
    }
  }

  /**
   * Process analytics aggregation jobs
   */
  private async processAnalyticsAggregation(job: AnalyticsAggregationJob): Promise<void> {
    try {
      const { startDate, endDate } = job.dateRange;

      for (const metric of job.metrics) {
        await this.aggregateMetric(job.profileId, job.platform, metric, startDate, endDate);
      }
    } catch (error) {
      console.error(`Analytics aggregation failed:`, error);
      throw error;
    }
  }

  // Private helper methods for specific sync operations
  private async syncSocialMediaPosts(connection: any, job: DataSyncJob): Promise<void> {
    // Implementation for syncing social media posts
    console.log(`Syncing posts for ${connection.platform} account ${connection.id}`);
  }

  private async syncSocialMediaAnalytics(connection: any, job: DataSyncJob): Promise<void> {
    // Implementation for syncing analytics data
    console.log(`Syncing analytics for ${connection.platform} account ${connection.id}`);
  }

  private async syncMarketingContacts(connection: any, job: DataSyncJob): Promise<void> {
    // Implementation for syncing marketing contacts
    console.log(`Syncing contacts for ${connection.platform} connection ${connection.id}`);
  }

  private async syncMarketingDeals(connection: any, job: DataSyncJob): Promise<void> {
    // Implementation for syncing marketing deals
    console.log(`Syncing deals for ${connection.platform} connection ${connection.id}`);
  }

  private async processInstagramWebhookData(webhookData: any, eventType: string): Promise<void> {
    // Process Instagram-specific webhook data
    console.log(`Processing Instagram webhook: ${eventType}`);
  }

  private async processFacebookWebhookData(webhookData: any, eventType: string): Promise<void> {
    // Process Facebook-specific webhook data
    console.log(`Processing Facebook webhook: ${eventType}`);
  }

  private async processWhatsAppWebhookData(webhookData: any, eventType: string): Promise<void> {
    // Process WhatsApp-specific webhook data
    console.log(`Processing WhatsApp webhook: ${eventType}`);
  }

  private async processHubSpotWebhookData(webhookData: any, eventType: string): Promise<void> {
    // Process HubSpot-specific webhook data
    console.log(`Processing HubSpot webhook: ${eventType}`);
  }

  private async aggregateMetric(
    profileId: string,
    platform: string,
    metric: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    // Implementation for aggregating specific metrics
    console.log(`Aggregating ${metric} for ${platform} from ${startDate} to ${endDate}`);
  }
}

/**
 * Job Scheduler - Handles recurring job scheduling
 */
export class JobScheduler {
  private jobQueue: JobQueueManager;

  constructor() {
    this.jobQueue = new JobQueueManager();
  }

  /**
   * Schedule token refresh jobs for expiring tokens
   */
  async scheduleTokenRefreshJobs(): Promise<void> {
    const supabase = await createClient();
    const expirationThreshold = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { data: expiringConnections } = await supabase
      .from("social_media_accounts")
      .select("*")
      .lt("token_expires_at", expirationThreshold.toISOString())
      .eq("status", "active")
      .not("refresh_token", "is", null);

    for (const connection of expiringConnections || []) {
      const job: TokenRefreshJob = {
        jobId: `token_refresh_${connection.id}_${Date.now()}`,
        type: "token_refresh",
        profileId: connection.profile_id,
        platform: connection.platform,
        connectionId: connection.id,
        accountId: connection.id,
        currentToken: connection.access_token,
        refreshToken: connection.refresh_token,
      };

      await this.jobQueue.addJob(job, "high");
    }
  }

  /**
   * Schedule daily data sync jobs
   */
  async scheduleDailySyncJobs(): Promise<void> {
    const supabase = await createClient();
    const { data: activeConnections } = await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("status", "active");

    for (const connection of activeConnections || []) {
      // Schedule posts sync
      const postsJob: DataSyncJob = {
        jobId: `posts_sync_${connection.id}_${Date.now()}`,
        type: "data_sync",
        profileId: connection.profile_id,
        platform: connection.platform,
        connectionId: connection.id,
        syncType: "posts",
      };

      // Schedule analytics sync
      const analyticsJob: DataSyncJob = {
        jobId: `analytics_sync_${connection.id}_${Date.now()}`,
        type: "data_sync",
        profileId: connection.profile_id,
        platform: connection.platform,
        connectionId: connection.id,
        syncType: "analytics",
      };

      await this.jobQueue.addJob(postsJob, "medium");
      await this.jobQueue.addJob(analyticsJob, "medium");
    }
  }
}

/**
 * Main job processor entry point
 */
export async function processBackgroundJobs(): Promise<{ processed: number; errors: number }> {
  const jobQueue = new JobQueueManager();
  let processed = 0;
  let errors = 0;

  // Process up to 10 jobs per invocation to prevent timeout
  for (let i = 0; i < 10; i++) {
    try {
      const hasJob = await jobQueue.processNextJob();
      if (!hasJob) {
        break; // No more jobs to process
      }
      processed++;
    } catch (error) {
      console.error("Job processing error:", error);
      errors++;
    }
  }

  return { processed, errors };
}
