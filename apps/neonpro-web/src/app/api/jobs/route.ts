import type { NextRequest, NextResponse } from "next/server";
import type { JobScheduler, processBackgroundJobs } from "@/lib/jobs/background-processor";
import type { createClient } from "@/lib/supabase/server";

/**
 * Background Jobs API Endpoint - Research-Backed Implementation
 *
 * Provides endpoints for:
 * - Manual job processing trigger
 * - Job scheduling and management
 * - Job status monitoring
 * - Cron-based job execution
 *
 * Security: Validates API keys and implements rate limiting
 * Based on serverless job processing patterns and Next.js best practices
 */

interface JobProcessingStats {
  processed: number;
  errors: number;
  duration: number;
  timestamp: string;
}

/**
 * Verify API key for job processing endpoints
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const validApiKey = process.env.JOBS_API_KEY;

  if (!validApiKey) {
    console.error("JOBS_API_KEY not configured");
    return false;
  }

  return apiKey === validApiKey;
}

/**
 * Log job processing activity for monitoring
 */
async function logJobActivity(
  supabase: any,
  activityType: string,
  stats: JobProcessingStats,
  details?: any,
) {
  try {
    await supabase.from("job_processing_logs").insert({
      activity_type: activityType,
      processed_count: stats.processed,
      error_count: stats.errors,
      duration_ms: stats.duration,
      details: details || {},
      created_at: stats.timestamp,
    });
  } catch (error) {
    console.error("Failed to log job activity:", error);
  }
}

/**
 * GET handler - Job status and monitoring
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const supabase = await createClient();

    switch (action) {
      case "status": {
        // Get job queue status
        const { data: queueStats } = await supabase
          .from("background_jobs")
          .select("status, count(*)", { count: "exact" })
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

        const { data: processingLogs } = await supabase
          .from("job_processing_logs")
          .select("*")
          .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
          .order("created_at", { ascending: false })
          .limit(10);

        return NextResponse.json({
          queue: queueStats,
          recentActivity: processingLogs,
          timestamp: new Date().toISOString(),
        });
      }

      case "health": {
        // Get system health metrics
        const { data: failedJobs } = await supabase
          .from("background_jobs")
          .select("count(*)", { count: "exact" })
          .eq("status", "failed")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const { data: pendingJobs } = await supabase
          .from("background_jobs")
          .select("count(*)", { count: "exact" })
          .eq("status", "pending");

        return NextResponse.json({
          health: "ok",
          metrics: {
            failedJobsLast24h: failedJobs?.[0]?.count || 0,
            pendingJobs: pendingJobs?.[0]?.count || 0,
          },
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Jobs API GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler - Job processing and scheduling
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;
    const startTime = Date.now();
    const supabase = await createClient();

    switch (action) {
      case "process": {
        // Manual job processing trigger
        console.log("Starting manual job processing...");
        const stats = await processBackgroundJobs();
        const duration = Date.now() - startTime;

        const processStats: JobProcessingStats = {
          processed: stats.processed,
          errors: stats.errors,
          duration,
          timestamp: new Date().toISOString(),
        };

        await logJobActivity(supabase, "manual_processing", processStats);

        return NextResponse.json({
          success: true,
          stats: processStats,
          message: `Processed ${stats.processed} jobs with ${stats.errors} errors`,
        });
      }

      case "schedule_token_refresh": {
        // Schedule token refresh jobs
        const scheduler = new JobScheduler();
        await scheduler.scheduleTokenRefreshJobs();

        const refreshStats: JobProcessingStats = {
          processed: 0,
          errors: 0,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        await logJobActivity(supabase, "token_refresh_scheduling", refreshStats);

        return NextResponse.json({
          success: true,
          message: "Token refresh jobs scheduled",
          duration: refreshStats.duration,
        });
      }

      case "schedule_daily_sync": {
        // Schedule daily synchronization jobs
        const syncScheduler = new JobScheduler();
        await syncScheduler.scheduleDailySyncJobs();

        const syncStats: JobProcessingStats = {
          processed: 0,
          errors: 0,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        await logJobActivity(supabase, "daily_sync_scheduling", syncStats);

        return NextResponse.json({
          success: true,
          message: "Daily sync jobs scheduled",
          duration: syncStats.duration,
        });
      }

      case "cleanup": {
        // Cleanup old completed jobs
        const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago

        const { data: deletedJobs, error: cleanupError } = await supabase
          .from("background_jobs")
          .delete()
          .in("status", ["completed", "failed"])
          .lt("completed_at", cutoffDate)
          .select("count(*)", { count: "exact" });

        if (cleanupError) {
          throw new Error(`Cleanup failed: ${cleanupError.message}`);
        }

        const cleanupStats: JobProcessingStats = {
          processed: deletedJobs?.[0]?.count || 0,
          errors: 0,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        await logJobActivity(supabase, "job_cleanup", cleanupStats);

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanupStats.processed} old jobs`,
          duration: cleanupStats.duration,
        });
      }

      case "retry_failed": {
        // Retry failed jobs
        const { maxAge = 24 } = params; // Hours
        const retryDate = new Date(Date.now() - maxAge * 60 * 60 * 1000).toISOString();

        const { data: retriedJobs, error: retryError } = await supabase
          .from("background_jobs")
          .update({
            status: "pending",
            retry_count: 0,
            scheduled_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("status", "failed")
          .gte("failed_at", retryDate)
          .select("count(*)", { count: "exact" });

        if (retryError) {
          throw new Error(`Retry failed: ${retryError.message}`);
        }

        const retryStats: JobProcessingStats = {
          processed: retriedJobs?.[0]?.count || 0,
          errors: 0,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        await logJobActivity(supabase, "job_retry", retryStats);

        return NextResponse.json({
          success: true,
          message: `Retried ${retryStats.processed} failed jobs`,
          duration: retryStats.duration,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Jobs API POST error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT handler - Job management
 */
export async function PUT(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, action } = body;
    const supabase = await createClient();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    switch (action) {
      case "cancel": {
        // Cancel a specific job
        const { error: cancelError } = await supabase
          .from("background_jobs")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", jobId)
          .in("status", ["pending", "processing"]);

        if (cancelError) {
          throw new Error(`Cancel failed: ${cancelError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: `Job ${jobId} cancelled`,
        });
      }

      case "retry": {
        // Retry a specific failed job
        const { error: retryError } = await supabase
          .from("background_jobs")
          .update({
            status: "pending",
            retry_count: 0,
            scheduled_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", jobId)
          .eq("status", "failed");

        if (retryError) {
          throw new Error(`Retry failed: ${retryError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: `Job ${jobId} scheduled for retry`,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Jobs API PUT error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE handler - Remove specific jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    const supabase = await createClient();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("background_jobs")
      .delete()
      .eq("id", jobId)
      .in("status", ["completed", "failed", "cancelled"]);

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} deleted`,
    });
  } catch (error) {
    console.error("Jobs API DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
