/**
 * Database Health Check and Monitoring for NeonPro Healthcare
 * Implements comprehensive database connectivity validation
 * Healthcare compliance: LGPD + ANVISA + CFM monitoring requirements
 */

import { createAdminClient, createClient, getSupabaseConfig } from "./client";

// Health check result types
export interface DatabaseHealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  latency: number;
  checks: {
    connection: HealthCheckResult;
    authentication: HealthCheckResult;
    rls: HealthCheckResult;
    realtime: HealthCheckResult;
    storage: HealthCheckResult;
  };
  metadata: {
    supabaseUrl: string;
    region: string;
    version?: string;
  };
}

export interface HealthCheckResult {
  status: "pass" | "fail" | "warn";
  latency?: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Comprehensive database health check
 */
export async function performHealthCheck(): Promise<DatabaseHealthCheck> {
  const startTime = Date.now();
  const config = getSupabaseConfig();

  const healthCheck: DatabaseHealthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    latency: 0,
    checks: {
      connection: { status: "fail" },
      authentication: { status: "fail" },
      rls: { status: "fail" },
      realtime: { status: "fail" },
      storage: { status: "fail" },
    },
    metadata: {
      supabaseUrl: config.url,
      region: extractRegionFromUrl(config.url),
    },
  };

  try {
    // Test basic connection
    healthCheck.checks.connection = await testConnection();

    // Test authentication
    healthCheck.checks.authentication = await testAuthentication();

    // Test RLS policies
    healthCheck.checks.rls = await testRLSPolicies();

    // Test realtime functionality
    healthCheck.checks.realtime = await testRealtime();

    // Test storage access
    healthCheck.checks.storage = await testStorage();

    // Calculate overall status
    healthCheck.status = calculateOverallStatus(healthCheck.checks);
    healthCheck.latency = Date.now() - startTime;
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.latency = Date.now() - startTime;
    console.error("Health check failed:", error);
  }

  return healthCheck;
}

/**
 * Test basic database connection
 */
async function testConnection(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const client = createClient();
    const { data, error } = await client
      .from("health_check")
      .select("id")
      .limit(1);

    if (error) {
      return {
        status: "fail",
        latency: Date.now() - startTime,
        error: error.message,
      };
    }

    return {
      status: "pass",
      latency: Date.now() - startTime,
      details: { recordsFound: data?.length || 0 },
    };
  } catch (error) {
    return {
      status: "fail",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown connection error",
    };
  }
}

/**
 * Test authentication functionality
 */
async function testAuthentication(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const client = createClient();
    const { data: { session } } = await client.auth.getSession();

    return {
      status: "pass",
      latency: Date.now() - startTime,
      details: {
        hasSession: !!session,
        sessionValid: session?.expires_at
          ? new Date(session.expires_at * 1000) > new Date()
          : false,
      },
    };
  } catch (error) {
    return {
      status: "fail",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Authentication test failed",
    };
  }
}

/**
 * Test RLS policies functionality
 */
async function testRLSPolicies(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const adminClient = createAdminClient();

    // Test RLS is enabled on critical tables
    const { data: rlsStatus, error } = await (adminClient as any)
      .rpc("check_rls_enabled", { table_name: "patients" });

    if (error) {
      return {
        status: "warn",
        latency: Date.now() - startTime,
        error: `RLS check failed: ${error.message}`,
      };
    }

    return {
      status: "pass",
      latency: Date.now() - startTime,
      details: { rlsStatus },
    };
  } catch (error) {
    return {
      status: "warn",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "RLS test failed",
    };
  }
}

/**
 * Test realtime functionality
 */
async function testRealtime(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const client = createClient();

    // Test realtime connection
    const channel = client.channel("health-check");

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve({
          status: "warn",
          latency: Date.now() - startTime,
          error: "Realtime connection timeout",
        });
      }, 5000);

      channel
        .on("presence", { event: "sync" }, () => {
          clearTimeout(timeout);
          channel.unsubscribe();
          resolve({
            status: "pass",
            latency: Date.now() - startTime,
            details: { realtimeConnected: true },
          });
        })
        .subscribe();
    });
  } catch (error) {
    return {
      status: "fail",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Realtime test failed",
    };
  }
}

/**
 * Test storage functionality
 */
async function testStorage(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const client = createClient();

    // Test storage bucket access
    const { data: buckets, error } = await client.storage.listBuckets();

    if (error) {
      return {
        status: "warn",
        latency: Date.now() - startTime,
        error: `Storage test failed: ${error.message}`,
      };
    }

    return {
      status: "pass",
      latency: Date.now() - startTime,
      details: { bucketsCount: buckets?.length || 0 },
    };
  } catch (error) {
    return {
      status: "fail",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Storage test failed",
    };
  }
}

/**
 * Calculate overall health status based on individual checks
 */
function calculateOverallStatus(
  checks: DatabaseHealthCheck["checks"],
): "healthy" | "degraded" | "unhealthy" {
  const results = Object.values(checks);
  const failCount = results.filter(r => r.status === "fail").length;
  const warnCount = results.filter(r => r.status === "warn").length;

  if (failCount > 0) {
    return failCount >= 2 ? "unhealthy" : "degraded";
  }

  if (warnCount > 1) {
    return "degraded";
  }

  return "healthy";
}

/**
 * Extract region from Supabase URL
 */
function extractRegionFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const subdomain = urlObj.hostname.split(".")[0];
    // Extract region from subdomain pattern: projectid.supabase.co
    return subdomain && subdomain.includes("-") ? subdomain.split("-").pop() || "unknown" : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Quick connection test for API health endpoints
 */
export async function quickHealthCheck(): Promise<{ status: string; latency: number; }> {
  const startTime = Date.now();

  try {
    const client = createClient();
    await client.from("health_check").select("id").limit(1);

    return {
      status: "healthy",
      latency: Date.now() - startTime,
    };
  } catch {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
    };
  }
}
