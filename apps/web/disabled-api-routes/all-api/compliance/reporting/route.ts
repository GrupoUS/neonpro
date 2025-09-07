/**
 * Automated Regulatory Reporting API
 * Handles ANVISA, CFM, and LGPD compliance report generation
 */

import { regulatoryReportingService } from "@/lib/services/regulatory-reporting";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportType, periodStart, periodEnd, autoSchedule } = await request.json();

    if (!(reportType || autoSchedule)) {
      return NextResponse.json(
        { error: "Report type or auto-schedule flag is required" },
        {
          status: 400,
        },
      );
    }

    let result;

    if (autoSchedule) {
      result = await regulatoryReportingService.scheduleAutomaticReports(
        user.id,
      );
    } else {
      switch (reportType) {
        case "anvisa_quarterly": {
          result = await regulatoryReportingService.generateANVISAReport(
            user.id,
            periodStart,
            periodEnd,
          );
          break;
        }
        case "cfm_annual": {
          result = await regulatoryReportingService.generateCFMReport(
            user.id,
            periodStart,
            periodEnd,
          );
          break;
        }
        case "lgpd_compliance": {
          result = await regulatoryReportingService.generateLGPDReport(
            user.id,
            periodStart,
            periodEnd,
          );
          break;
        }
        default: {
          return NextResponse.json(
            { error: "Invalid report type" },
            { status: 400 },
          );
        }
      }
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Ensure we have a report - type guard
    if (!("report" in result) || !result.report) {
      return NextResponse.json(
        { error: "Failed to generate report" },
        { status: 500 },
      );
    }

    await (supabase as any).from("system_metrics").insert({
      tenant_id: user.id,
      category: "compliance",
      metric_name: "regulatory_report_generated",
      metric_value: 1,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: autoSchedule ? { scheduled: true } : result.report,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType");
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

    let query = (supabase as any)
      .from("regulatory_reports")
      .select("*")
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (reportType) {
      query = query.eq("report_type", reportType);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
