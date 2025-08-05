// GET /api/treatment-prediction/analytics - Prediction analytics and reporting

import type { NextRequest, NextResponse } from "next/server";
import type { TreatmentPredictionService } from "@/app/lib/services/treatment-prediction";
import type { createServerClient } from "@/lib/supabase/server";

// GET /api/treatment-prediction/analytics - Get prediction analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate authentication
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission for analytics
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions for analytics" },
        { status: 403 },
      );
    }

    // Parse date parameters
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const predictionService = new TreatmentPredictionService();
    const analytics = await predictionService.getPredictionAnalytics(
      dateFrom || undefined,
      dateTo || undefined,
    );

    return NextResponse.json({
      analytics,
      date_range: {
        from: dateFrom,
        to: dateTo,
      },
    });
  } catch (error) {
    console.error("Error fetching prediction analytics:", error);
    return NextResponse.json({ error: "Failed to fetch prediction analytics" }, { status: 500 });
  }
}
