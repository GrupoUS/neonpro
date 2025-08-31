/**
 * Database Configuration for NeonPro API
 * Implements Supabase client for Hono.dev backend
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant isolation
 */

import { createAdminClient, createClient, getSupabaseConfig } from "@neonpro/database/client";
import { performHealthCheck, quickHealthCheck } from "@neonpro/database/health-check";
import { quickRLSCheck, validateRLSPolicies } from "@neonpro/database/rls-validator";
import type { Database } from "@neonpro/database/types";

// Database client instances
let clientInstance: ReturnType<typeof createClient> | null = null;
let adminInstance: ReturnType<typeof createAdminClient> | null = null;

/**
 * Get or create database client instance
 * Uses singleton pattern for performance
 */
export function getDatabase(): ReturnType<typeof createClient> {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/**
 * Get or create admin database client instance
 * WARNING: Use with extreme caution - bypasses RLS
 */
export function getAdminDatabase(): ReturnType<typeof createAdminClient> {
  if (!adminInstance) {
    adminInstance = createAdminClient();
  }
  return adminInstance;
}

/**
 * Database health check endpoint handler
 */
export async function handleHealthCheck(): Promise<{
  status: number;
  body: any;
}> {
  try {
    const healthResult = await performHealthCheck();

    const statusCode = healthResult.status === "healthy"
      ? 200
      : healthResult.status === "degraded"
      ? 206
      : 503;

    return {
      status: statusCode,
      body: {
        status: healthResult.status,
        timestamp: healthResult.timestamp,
        latency: healthResult.latency,
        checks: healthResult.checks,
        metadata: healthResult.metadata,
      },
    };
  } catch (error) {
    return {
      status: 503,
      body: {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
    };
  }
}

/**
 * Quick health check for load balancer probes
 */
export async function handleQuickHealthCheck(): Promise<{
  status: number;
  body: any;
}> {
  try {
    const result = await quickHealthCheck();

    return {
      status: result.status === "healthy" ? 200 : 503,
      body: {
        status: result.status,
        latency: result.latency,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 503,
      body: {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Quick health check failed",
      },
    };
  }
}

/**
 * RLS validation endpoint handler
 */
export async function handleRLSValidation(): Promise<{
  status: number;
  body: any;
}> {
  try {
    const validationResult = await validateRLSPolicies();

    const statusCode = validationResult.status === "compliant"
      ? 200
      : validationResult.status === "non_compliant"
      ? 400
      : 503;

    return {
      status: statusCode,
      body: validationResult,
    };
  } catch (error) {
    return {
      status: 503,
      body: {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "RLS validation failed",
      },
    };
  }
}

/**
 * Quick RLS check for monitoring
 */
export async function handleQuickRLSCheck(): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  try {
    const result = await quickRLSCheck();

    return {
      status: result.status === "secure" ? 200 : 503,
      body: {
        status: result.status,
        criticalTablesSecured: result.criticalTablesSecured,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 503,
      body: {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Quick RLS check failed",
      },
    };
  }
}

/**
 * Database configuration info endpoint
 */
export async function handleDatabaseInfo(): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  try {
    const config = getSupabaseConfig();

    return {
      status: 200,
      body: {
        url: config.url,
        region: extractRegionFromUrl(config.url),
        hasServiceRole: !!config.serviceRoleKey,
        hasJwtSecret: !!config.jwtSecret,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "Failed to get database info",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Test database connectivity with error handling
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const db = getDatabase();
    const { data: _data, error } = await db
      .from("health_check")
      .select("id")
      .limit(1);

    if (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error.message,
      };
    }

    return {
      connected: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}

/**
 * Validate environment configuration
 */
export function validateDatabaseEnvironment(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  try {
    const config = getSupabaseConfig();

    if (!config.url) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL is not set");
    }

    if (!config.anonKey) {
      issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
    }

    if (!config.serviceRoleKey) {
      issues.push("SUPABASE_SERVICE_ROLE_KEY is not set (required for admin operations)");
    }

    if (!config.jwtSecret) {
      issues.push("SUPABASE_JWT_SECRET is not set (recommended for JWT validation)");
    }

    // Validate URL format
    if (config.url) {
      try {
        new URL(config.url);
      } catch {
        issues.push("NEXT_PUBLIC_SUPABASE_URL has invalid format");
      }
    }
  } catch (error) {
    issues.push(
      `Configuration validation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Extract region from Supabase URL
 */
function extractRegionFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const subdomain = urlObj.hostname.split(".")[0];
    return subdomain.includes("-") ? subdomain.split("-").pop() || "unknown" : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Initialize database connections and validate configuration
 */
export async function initializeDatabase(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    // Validate environment
    const envValidation = validateDatabaseEnvironment();
    if (!envValidation.valid) {
      return {
        success: false,
        message: "Database environment validation failed",
        details: { issues: envValidation.issues },
      };
    }

    // Test connection
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.connected) {
      return {
        success: false,
        message: "Database connection failed",
        details: { error: connectionTest.error, latency: connectionTest.latency },
      };
    }

    // Quick RLS check
    const rlsCheck = await quickRLSCheck();

    return {
      success: true,
      message: "Database initialized successfully",
      details: {
        latency: connectionTest.latency,
        rlsStatus: rlsCheck.status,
        criticalTablesSecured: rlsCheck.criticalTablesSecured,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Database initialization failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

// Export types for API use
export type { Database } from "@neonpro/database/types";
