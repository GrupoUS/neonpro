/**
 * Optimized Batch Conflict Detection API Route - PERF-02
 * Healthcare-compliant batch processing with ≥50% API call reduction
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createServerClient } from "@supabase/ssr";
import type { z } from "zod";

// Validation schemas
const batchConflictCheckSchema = z.object({
  requests: z.array(
    z.object({
      id: z.string().uuid(),
      appointmentId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      professionalId: z.string().uuid().optional(),
      timeSlot: z.string().optional(),
    }),
  ),
  timestamp: z.string(),
  batchSize: z.number().max(50).optional(),
});

interface BatchConflictResponse {
  success: boolean;
  results: any[];
  performance: {
    totalRequests: number;
    processingTime: number;
    apiCallsReduced: number;
    batchEfficiency: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication and tenant validation
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
      return NextResponse.json<BatchConflictResponse>(
        {
          success: false,
          results: [],
          performance: {
            totalRequests: 0,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Tenant ID validation
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json<BatchConflictResponse>(
        {
          success: false,
          results: [],
          performance: {
            totalRequests: 0,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "Tenant ID required",
        },
        { status: 400 },
      );
    }

    // Input validation
    const body = await request.json();
    const validatedData = batchConflictCheckSchema.parse(body);

    const { requests } = validatedData;
    const totalRequests = requests.length;

    // Healthcare compliance check
    const lgpdConsent = request.headers.get("x-lgpd-consent");
    if (!lgpdConsent) {
      return NextResponse.json<BatchConflictResponse>(
        {
          success: false,
          results: [],
          performance: {
            totalRequests,
            processingTime: 0,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "LGPD consent required for batch operations",
        },
        { status: 400 },
      );
    }

    // Extract unique identifiers for batch processing
    const appointmentIds = requests.map((req) => req.appointmentId).filter(Boolean) as string[];

    const patientIds = requests.map((req) => req.patientId).filter(Boolean) as string[];

    const professionalIds = requests.map((req) => req.professionalId).filter(Boolean) as string[];

    // Single optimized query for all conflicts
    let conflictsQuery = supabase
      .from("schedule_conflicts")
      .select(`
        *,
        appointments!inner(
          id, start_time, end_time, status, patient_id, professional_id,
          patients!inner(id, name, email, lgpd_consent),
          professionals!inner(id, name, specialty, availability_status)
        ),
        conflict_resolutions(
          id, resolution_type, description, 
          impact_description, estimated_time_minutes, 
          compliance_impact, status
        )
      `)
      .eq("status", "active")
      .eq("tenant_id", tenantId);

    // Apply batch filters efficiently
    const conditions = [];
    if (appointmentIds.length > 0) {
      conditions.push(`appointment_id.in.(${appointmentIds.join(",")})`);
    }
    if (patientIds.length > 0) {
      conditions.push(`appointments.patient_id.in.(${patientIds.join(",")})`);
    }
    if (professionalIds.length > 0) {
      conditions.push(`appointments.professional_id.in.(${professionalIds.join(",")})`);
    }

    if (conditions.length > 0) {
      conflictsQuery = conflictsQuery.or(conditions.join(","));
    }

    const { data: conflicts, error: conflictsError } = await conflictsQuery;

    if (conflictsError) {
      console.error("Batch conflict query error:", conflictsError);
      return NextResponse.json<BatchConflictResponse>(
        {
          success: false,
          results: [],
          performance: {
            totalRequests,
            processingTime: Date.now() - startTime,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: "Database query failed",
        },
        { status: 500 },
      );
    }

    // Process results for each request
    const results = requests.map((request) => {
      const matchingConflicts = conflicts.filter((conflict) => {
        if (request.appointmentId && conflict.appointment_id === request.appointmentId) return true;
        if (request.patientId && conflict.appointments.patient_id === request.patientId)
          return true;
        if (
          request.professionalId &&
          conflict.appointments.professional_id === request.professionalId
        )
          return true;
        return false;
      });

      return {
        requestId: request.id,
        conflicts: matchingConflicts.map((conflict) => ({
          id: conflict.id,
          type: conflict.type,
          severity: conflict.severity,
          description: conflict.description,
          conflictTime: conflict.conflict_time,
          appointmentId: conflict.appointment_id,
          patientInfo: {
            id: conflict.appointments.patients.id,
            name: conflict.appointments.patients.name,
            lgpdConsent: conflict.appointments.patients.lgpd_consent,
          },
          professionalInfo: {
            id: conflict.appointments.professionals.id,
            name: conflict.appointments.professionals.name,
            specialty: conflict.appointments.professionals.specialty,
          },
          suggestedResolutions: conflict.conflict_resolutions.map((res: any) => ({
            id: res.id,
            type: res.resolution_type,
            description: res.description,
            impact: res.impact_description,
            estimatedTime: res.estimated_time_minutes,
            complianceImpact: res.compliance_impact,
          })),
          metadata: {
            lgpdConsent: conflict.lgpd_consent || false,
            clinicalPriority: conflict.clinical_priority || 0,
            emergencyFlag: conflict.emergency_flag || false,
          },
        })),
      };
    });

    // Calculate performance metrics
    const processingTime = Date.now() - startTime;
    const apiCallsReduced = Math.max(0, totalRequests - 1); // Single query vs individual queries
    const batchEfficiency =
      totalRequests > 1 ? ((apiCallsReduced / totalRequests) * 100).toFixed(1) + "%" : "0%";

    // Audit logging for healthcare compliance
    await supabase.from("audit_logs").insert({
      action: "batch_conflict_check",
      user_id: user.id,
      tenant_id: tenantId,
      metadata: {
        batchSize: totalRequests,
        processingTime,
        apiCallsReduced,
        conflictsFound: results.reduce((sum, r) => sum + r.conflicts.length, 0),
        lgpdCompliant: true,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json<BatchConflictResponse>({
      success: true,
      results,
      performance: {
        totalRequests,
        processingTime,
        apiCallsReduced,
        batchEfficiency,
      },
    });
  } catch (error) {
    console.error("Batch conflict check error:", error);

    const processingTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      return NextResponse.json<BatchConflictResponse>(
        {
          success: false,
          results: [],
          performance: {
            totalRequests: 0,
            processingTime,
            apiCallsReduced: 0,
            batchEfficiency: "0%",
          },
          error: `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json<BatchConflictResponse>(
      {
        success: false,
        results: [],
        performance: {
          totalRequests: 0,
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
