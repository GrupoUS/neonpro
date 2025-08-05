// Executive Dashboard API - Alerts Management
// Story 7.1: Executive Dashboard Implementation
// GET/POST /api/executive-dashboard/alerts

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { executiveDashboardService } from "@/lib/services/executive-dashboard";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinic_id");
    const severity = searchParams.get("severity");

    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id parameter is required" }, { status: 400 });
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied to this clinic" }, { status: 403 });
    }

    // Get dashboard alerts
    const alerts = await executiveDashboardService.getDashboardAlerts(
      clinicId,
      severity || undefined,
    );

    return NextResponse.json({
      success: true,
      data: alerts,
      metadata: {
        clinic_id: clinicId,
        severity_filter: severity,
        count: alerts.length,
      },
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch alerts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
