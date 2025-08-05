// Executive Dashboard API - Reports Management
// Story 7.1: Executive Dashboard Implementation
// GET/POST /api/executive-dashboard/reports

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
    const limit = parseInt(searchParams.get("limit") || "10");

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

    // Get dashboard reports
    const reports = await executiveDashboardService.getDashboardReports(clinicId, limit);

    return NextResponse.json({
      success: true,
      data: reports,
      metadata: {
        clinic_id: clinicId,
        limit,
        count: reports.length,
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reports",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const reportRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      "clinic_id",
      "report_name",
      "report_type",
      "period_type",
      "period_start",
      "period_end",
    ];
    for (const field of requiredFields) {
      if (!reportRequest[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("id")
      .eq("user_id", user.id)
      .eq("clinic_id", reportRequest.clinic_id)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied to this clinic" }, { status: 403 });
    }

    // Request report generation
    const report = await executiveDashboardService.requestReport(
      reportRequest.clinic_id,
      reportRequest.report_name,
      reportRequest.report_type,
      reportRequest.period_type,
      new Date(reportRequest.period_start),
      new Date(reportRequest.period_end),
      reportRequest.format || "pdf",
      reportRequest.parameters,
    );

    return NextResponse.json({
      success: true,
      data: report,
      message: "Report generation requested successfully",
    });
  } catch (error) {
    console.error("Report request API error:", error);
    return NextResponse.json(
      {
        error: "Failed to request report generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
