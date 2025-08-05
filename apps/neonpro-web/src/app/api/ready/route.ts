import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Readiness Check Endpoint for Vercel Deployment
 * More comprehensive check for production readiness
 */
export async function GET(request: NextRequest) {
  try {
    const checks = {
      database: false,
      prisma_client: false,
      healthcare_tables: false,
      environment: false,
      rls_policies: false,
    };

    let overallStatus = "ready";
    const issues: string[] = [];

    // 1. Database connectivity
    try {
      await prisma.$queryRaw`SELECT 1 as db_check`;
      checks.database = true;
    } catch (error) {
      issues.push("Database connection failed");
      overallStatus = "not_ready";
    }

    // 2. Prisma client
    try {
      const clientInfo = await prisma.$queryRaw`SELECT version() as db_version`;
      checks.prisma_client = true;
    } catch (error) {
      issues.push("Prisma client not properly configured");
      overallStatus = "not_ready";
    }

    // 3. Healthcare tables existence
    try {
      const tables = (await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('clinics', 'patients', 'appointments', 'medical_records', 'prescriptions', 'audit_logs')
      `) as any[];

      if (tables.length >= 6) {
        checks.healthcare_tables = true;
      } else {
        issues.push(`Missing healthcare tables. Found ${tables.length}/6 required tables`);
        overallStatus = "not_ready";
      }
    } catch (error) {
      issues.push("Unable to verify healthcare tables");
      overallStatus = "not_ready";
    }

    // 4. Environment variables
    const requiredEnvVars = [
      "DATABASE_URL",
      "DIRECT_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length === 0) {
      checks.environment = true;
    } else {
      issues.push(`Missing environment variables: ${missingEnvVars.join(", ")}`);
      overallStatus = "not_ready";
    }

    // 5. RLS Policies (basic check)
    try {
      const policies = (await prisma.$queryRaw`
        SELECT COUNT(*) as policy_count 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('clinics', 'patients', 'appointments', 'medical_records', 'prescriptions', 'audit_logs')
      `) as any[];

      if (policies[0]?.policy_count > 0) {
        checks.rls_policies = true;
      } else {
        issues.push("RLS policies not found - security may be compromised");
        // Don't fail readiness for this, but warn
      }
    } catch (error) {
      issues.push("Unable to verify RLS policies");
    }

    const readinessData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: checks,
      issues: issues,
      deployment_info: {
        environment: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION,
        healthcare_mode: process.env.HEALTHCARE_MODE === "true",
        lgpd_compliance: process.env.LGPD_COMPLIANCE === "true",
        anvisa_compliance: process.env.ANVISA_COMPLIANCE === "true",
      },
    };

    const statusCode = overallStatus === "ready" ? 200 : 503;

    return NextResponse.json(readinessData, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Readiness check failed:", error);

    return NextResponse.json(
      {
        status: "not_ready",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: false,
          prisma_client: false,
          healthcare_tables: false,
          environment: false,
          rls_policies: false,
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  }
}
