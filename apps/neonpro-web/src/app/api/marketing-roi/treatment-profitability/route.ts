/**
 * Treatment Profitability Analysis API Routes
 * /api/marketing-roi/treatment-profitability
 */

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { createmarketingROIService } from "@/app/lib/services/marketing-roi-service";
import type { TreatmentROIFiltersSchema } from "@/app/types/marketing-roi";
import type { createClient } from "@/lib/supabase/server";

// Utility functions
async function validateUserAndClinic(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const clinicId = request.nextUrl.searchParams.get("clinic_id");
  if (!clinicId) {
    return { error: NextResponse.json({ error: "clinic_id is required" }, { status: 400 }) };
  }

  const { data: userClinic, error: clinicError } = await supabase
    .from("user_clinics")
    .select("role")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (clinicError || !userClinic) {
    return { error: NextResponse.json({ error: "Access denied to clinic" }, { status: 403 }) };
  }

  return { user, clinicId, userRole: userClinic.role };
}

function getDateRangeParams(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get("start_date");
  const endDate = request.nextUrl.searchParams.get("end_date");

  return {
    start_date: startDate ? new Date(startDate) : undefined,
    end_date: endDate ? new Date(endDate) : undefined,
  };
}

/**
 * GET /api/marketing-roi/treatment-profitability
 * Get treatment profitability analysis
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) return validation.error;

    const { clinicId } = validation;
    const { start_date, end_date } = getDateRangeParams(request);

    // Parse treatment filters
    const treatmentIds = request.nextUrl.searchParams.getAll("treatment_ids");
    const minROI = request.nextUrl.searchParams.get("min_roi")
      ? parseFloat(request.nextUrl.searchParams.get("min_roi")!)
      : undefined;
    const minProcedures = request.nextUrl.searchParams.get("min_procedures")
      ? parseInt(request.nextUrl.searchParams.get("min_procedures")!)
      : undefined;
    const sortBy = request.nextUrl.searchParams.get("sort_by");
    const sortOrder = request.nextUrl.searchParams.get("sort_order");

    const filters = {
      treatment_ids: treatmentIds.length > 0 ? treatmentIds : undefined,
      min_roi: minROI,
      min_procedures: minProcedures,
      date_range: start_date && end_date ? { start: start_date, end: end_date } : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    // Validate filters
    const validatedFilters = TreatmentROIFiltersSchema.parse(filters);

    const profitabilityAnalysis =
      await createmarketingROIService().getTreatmentProfitabilityAnalysis(
        clinicId,
        validatedFilters,
      );

    return NextResponse.json(profitabilityAnalysis);
  } catch (error: any) {
    console.error("[Marketing ROI API] GET treatment profitability:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/marketing-roi/treatment-profitability/calculate
 * Calculate treatment ROI for specific treatment and period
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) return validation.error;

    const { clinicId } = validation;
    const body = await request.json();

    const { treatment_id, period_start, period_end } = body;

    if (!treatment_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: "treatment_id, period_start, and period_end are required" },
        { status: 400 },
      );
    }

    const treatmentROI = await createmarketingROIService().calculateTreatmentROI(
      clinicId,
      treatment_id,
      new Date(period_start),
      new Date(period_end),
    );

    return NextResponse.json(treatmentROI);
  } catch (error: any) {
    console.error("[Marketing ROI API] POST calculate treatment ROI:", error);

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}
