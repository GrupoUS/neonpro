import type { DashboardService } from "@/app/lib/services/dashboard";
import type { createClient } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const metric = url.searchParams.get("metric");
    const period = url.searchParams.get("period") || "30d";

    const dashboardService = new DashboardService();

    if (!metric) {
      // Get all metrics
      const metrics = await dashboardService.getAllMetrics(period);
      return NextResponse.json(metrics);
    }

    // Get specific metric
    const metricData = await dashboardService.getMetricData(metric, period);
    return NextResponse.json(metricData);
  } catch (error) {
    console.error("Dashboard metrics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { metric, value, metadata } = body;

    if (!metric || value === undefined) {
      return NextResponse.json({ error: "Metric and value are required" }, { status: 400 });
    }

    const dashboardService = new DashboardService();
    const result = await dashboardService.recordMetric(user.id, metric, value, metadata);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Dashboard metrics POST error:", error);
    return NextResponse.json({ error: "Failed to record metric" }, { status: 500 });
  }
}
