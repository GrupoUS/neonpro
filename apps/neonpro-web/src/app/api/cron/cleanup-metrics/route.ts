import { NextResponse } from "next/server";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";
import { intelligentErrorHandler } from "@/lib/error-handling/intelligent-error-handler";

/**
 * 🧹 Metrics Cleanup Cron Job
 * 
 * Runs daily at 2 AM to clean up old metrics and prevent memory bloat
 * Vercel cron job: "0 2 * * *"
 */

export async function GET() {
  try {
    console.log('🧹 Starting metrics cleanup...');

    // Clear old metrics from performance monitor
    const initialMetricsCount = performanceMonitor.getMetricsCount();
    performanceMonitor.clearMetrics();
    
    // Clear old error data from error handler
    intelligentErrorHandler.clearMetrics();

    console.log(`✅ Cleanup complete: ${initialMetricsCount} metrics cleaned`);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      metricsCleared: initialMetricsCount,
      message: 'Metrics cleanup completed successfully',
    });

  } catch (error) {
    console.error('❌ Metrics cleanup failed:', error);

    // Report the cleanup failure
    intelligentErrorHandler.captureError(error as Error, {
      route: '/api/cron/cleanup-metrics',
      severity: 'high',
      metadata: { cronJob: true },
    });

    return NextResponse.json({
      success: false,
      timestamp: Date.now(),
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
