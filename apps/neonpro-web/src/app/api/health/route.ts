import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health Check Endpoint for Vercel Deployment
 * Tests database connectivity and core system health
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Test database connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;

    const dbResponseTime = Date.now() - startTime;

    // Check environment variables
    const requiredEnvVars = [
      "DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: "connected",
        responseTime: `${dbResponseTime}ms`,
      },
      environment_variables: {
        status: missingEnvVars.length === 0 ? "complete" : "incomplete",
        missing: missingEnvVars,
      },
      healthcare: {
        lgpd_compliance: process.env.LGPD_COMPLIANCE === "true",
        anvisa_compliance: process.env.ANVISA_COMPLIANCE === "true",
        healthcare_mode: process.env.HEALTHCARE_MODE === "true",
      },
      version: process.env.npm_package_version || "1.0.0",
      deployment: {
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || "unknown",
        url: process.env.VERCEL_URL || "localhost",
      },
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    const errorData = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV || "development",
    };

    return NextResponse.json(errorData, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  }
}

export async function HEAD(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1 as health_check`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
