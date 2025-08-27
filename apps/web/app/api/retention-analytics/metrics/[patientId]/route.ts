// =====================================================================================
// PATIENT RETENTION METRICS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for patient-specific retention metrics
// =====================================================================================

import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const PatientMetricsParamsSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  clinicId: z.string().uuid("Invalid clinic ID format"),
});

const CalculateMetricsSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  clinicId: z.string().uuid("Invalid clinic ID format"),
});

// =====================================================================================
// GET PATIENT RETENTION METRICS
// =====================================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; }>; },
) {
  try {
    const resolvedParams = await params;
    // Extract clinic ID from query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    // Validate parameters
    const validation = PatientMetricsParamsSchema.safeParse({
      patientId: resolvedParams.patientId,
      clinicId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { patientId, clinicId: validatedClinicId } = validation.data;

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify clinic access (user must belong to the clinic)
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 403 },
      );
    }

    if (userProfile.clinic_id !== validatedClinicId) {
      return NextResponse.json(
        { error: "Access denied to clinic data" },
        { status: 403 },
      );
    }

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, clinic_id")
      .eq("id", patientId)
      .eq("clinic_id", validatedClinicId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found or does not belong to clinic" },
        {
          status: 404,
        },
      );
    }

    // Get retention metrics
    const retentionService = new RetentionAnalyticsService();
    const metrics = await retentionService.getPatientRetentionMetrics(
      patientId,
      validatedClinicId,
    );

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// CALCULATE PATIENT RETENTION METRICS
// =====================================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; }>; },
) {
  try {
    const resolvedParams = await params;
    // Parse request body
    const body = await request.json();

    // Validate request data
    const validation = CalculateMetricsSchema.safeParse({
      patientId: resolvedParams.patientId,
      clinicId: body.clinicId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { patientId, clinicId } = validation.data;

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify clinic access
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 403 },
      );
    }

    if (userProfile.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: "Access denied to clinic data" },
        { status: 403 },
      );
    }

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, clinic_id")
      .eq("id", patientId)
      .eq("clinic_id", clinicId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found or does not belong to clinic" },
        {
          status: 404,
        },
      );
    }

    // Check if user has permission to calculate metrics
    const allowedRoles = ["admin", "manager", "analyst"];
    if (!allowedRoles.includes(userProfile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to calculate metrics" },
        {
          status: 403,
        },
      );
    }

    // Calculate retention metrics
    const retentionService = new RetentionAnalyticsService();
    const metrics = await retentionService.calculatePatientRetentionMetrics(
      patientId,
      clinicId,
    );

    return NextResponse.json({
      success: true,
      data: metrics,
      message: "Retention metrics calculated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
