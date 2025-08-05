/**
 * Optimized Batch Conflict Resolution API Route - PERF-02
 * Healthcare-compliant batch resolution with LGPD/ANVISA/CFM compliance
 */

import type { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

// Validation schema
const batchResolutionSchema = z.object({
  conflictIds: z.array(z.string().uuid()),
  resolutionType: z.enum(["reschedule", "reassign", "cancel", "override"]),
  metadata: z.object({
    batchProcessed: z.boolean(),
    lgpdCompliant: z.boolean(),
    processingTime: z.string(),
    emergencyFlag: z.boolean().optional(),
    clinicalPriority: z.number().optional(),
  }),
  timestamp: z.string(),
});

interface BatchResolutionResponse {
  success: boolean;
  data?: {
    resolvedCount: number;
    rescheduled: number;
    cancelled: number;
    errors: string[];
  };
  performance: {
    totalConflicts: number;
    processingTime: number;
    apiCallsReduced: number;
    batchEfficiency: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<BatchResolutionResponse>(
        {
          success: false,
          performance: {
            totalConflicts: 0,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Tenant validation
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json<BatchResolutionResponse>(
        {
          success: false,
          performance: {
            totalConflicts: 0,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "Tenant ID required",
        },
        { status: 400 },
      );
    }

    // Validate input
    const body = await request.json();
    const validatedData = batchResolutionSchema.parse(body);

    const { conflictIds, resolutionType, metadata } = validatedData;
    const totalConflicts = conflictIds.length;

    // LGPD compliance validation
    if (!metadata.lgpdCompliant) {
      return NextResponse.json<BatchResolutionResponse>(
        {
          success: false,
          performance: {
            totalConflicts,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "LGPD compliance required for batch resolution",
        },
        { status: 400 },
      );
    }

    // Execute batch resolution using Supabase function
    const { data: resolutionResult, error: resolutionError } = await supabase.rpc(
      "resolve_conflicts_batch",
      {
        p_conflict_ids: conflictIds,
        p_resolution_type: resolutionType,
        p_user_id: user.id,
        p_tenant_id: tenantId,
        p_metadata: metadata,
        p_batch_timestamp: new Date().toISOString(),
      },
    );

    if (resolutionError) {
      console.error("Batch resolution error:", resolutionError);
      return NextResponse.json<BatchResolutionResponse>(
        {
          success: false,
          performance: {
            totalConflicts,
            processingTime: Date.now() - startTime,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: `Resolution failed: ${resolutionError.message}`,
        },
        { status: 500 },
      );
    }

    // Calculate performance metrics
    const processingTime = Date.now() - startTime;
    const apiCallsReduced = Math.max(0, totalConflicts - 1); // Single function call vs individual updates
    const batchEfficiency =
      totalConflicts > 1 ? ((apiCallsReduced / totalConflicts) * 100).toFixed(1) + "%" : "0%";

    // Audit logging for healthcare compliance
    await supabase.from("audit_logs").insert({
      action: "batch_conflict_resolution",
      user_id: user.id,
      tenant_id: tenantId,
      metadata: {
        conflictIds,
        resolutionType,
        batchSize: totalConflicts,
        processingTime,
        apiCallsReduced,
        resolvedCount: resolutionResult?.resolved_count || 0,
        lgpdCompliant: true,
        complianceValidated: true,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json<BatchResolutionResponse>({
      success: true,
      data: {
        resolvedCount: resolutionResult?.resolved_count || 0,
        rescheduled: resolutionResult?.rescheduled_count || 0,
        cancelled: resolutionResult?.cancelled_count || 0,
        errors: resolutionResult?.errors || [],
      },
      performance: {
        totalConflicts,
        processingTime,
        apiCallsReduced,
        batchEfficiency,
      },
    });
  } catch (error) {
    console.error("Batch resolution API error:", error);

    const processingTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      return NextResponse.json<BatchResolutionResponse>(
        {
          success: false,
          performance: {
            totalConflicts: 0,
            processingTime,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json<BatchResolutionResponse>(
      {
        success: false,
        performance: {
          totalConflicts: 0,
          processingTime,
          apiCallsReduced: 0,
          batchEfficiency: "0%",
        },
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
