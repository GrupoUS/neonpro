/**
 * Readiness Probe Endpoint
 * Determines if the application is ready to receive traffic
 */

import { serverEnv } from "@/lib/env";
import { LogCategory, logger } from "@/lib/logger";
import { createAdminClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

async function GET() {
  const startTime = Date.now();

  try {
    // Check if application is ready to serve requests
    const checks = await Promise.all([
      checkEnvironmentReady(),
      checkDatabaseReady(),
      checkCriticalServices(),
    ]);

    const allReady = checks.every(check => check.ready);
    const failedChecks = checks.filter(check => !check.ready);

    if (!allReady) {
      logger.warn(LogCategory.SYSTEM, "Readiness probe failed", {
        metadata: {
          failedChecks: failedChecks.map(c => c.name),
          duration: Date.now() - startTime,
        },
      });

      return NextResponse.json({
        ready: false,
        timestamp: new Date().toISOString(),
        failed_checks: failedChecks.map(c => ({ name: c.name, reason: c.reason })),
      }, { status: 503 });
    }

    return NextResponse.json({
      ready: true,
      timestamp: new Date().toISOString(),
      checks: checks.map(c => c.name),
      duration: Date.now() - startTime,
    });
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      `Readiness probe error: ${error instanceof Error ? error.message : String(error)}`,
    );

    return NextResponse.json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: "Readiness check failed",
    }, { status: 503 });
  }
}

async function checkEnvironmentReady(): Promise<
  { ready: boolean; name: string; reason?: string; }
> {
  try {
    // Check critical environment variables
    const critical = [
      serverEnv.supabase.url,
      serverEnv.supabase.anonKey,
      process.env.NODE_ENV,
    ];

    if (critical.some(val => !val)) {
      return {
        ready: false,
        name: "environment",
        reason: "Missing critical environment variables",
      };
    }

    return { ready: true, name: "environment" };
  } catch (error) {
    return { ready: false, name: "environment", reason: "Environment validation failed" };
  }
}

async function checkDatabaseReady(): Promise<{ ready: boolean; name: string; reason?: string; }> {
  try {
    if (!serverEnv.supabase.serviceRoleKey) {
      // In development, we might not have service role key
      if (process.env.NODE_ENV === "development") {
        return { ready: true, name: "database" };
      }
      return { ready: false, name: "database", reason: "Service role key not configured" };
    }

    const supabase = createAdminClient();

    // Quick connectivity test
    const result = await Promise.race([
      supabase.from("pg_stat_activity").select("count(*)").limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
    ]);

    const { error } = result as any;
    if (error) {
      return {
        ready: false,
        name: "database",
        reason: `Database connection failed: ${error.message}`,
      };
    }

    return { ready: true, name: "database" };
  } catch (error) {
    return { ready: false, name: "database", reason: "Database readiness check failed" };
  }
}

async function checkCriticalServices(): Promise<
  { ready: boolean; name: string; reason?: string; }
> {
  try {
    // Check Supabase REST API
    const response = await Promise.race([
      fetch(`${serverEnv.supabase.url}/rest/v1/`, {
        method: "HEAD",
        headers: { "apikey": serverEnv.supabase.anonKey },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
    ]);

    if (!response.ok) {
      return {
        ready: false,
        name: "services",
        reason: `Supabase API not ready: ${response.status}`,
      };
    }

    return { ready: true, name: "services" };
  } catch (error) {
    return { ready: false, name: "services", reason: "Critical services not ready" };
  }
}

export { GET };
export const dynamic = "force-dynamic";
