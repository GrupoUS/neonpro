import { createServerClient } from "@neonpro/database";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface DashboardStats {
  totalAppointments: number;
  predictedNoShows: number;
  noShowRate: number;
  prevented: number;
  cost_savings: number;
  modelAccuracy: number;
}

// Mock stats generator based on time range
function generateMockStats(timeRange: string): DashboardStats {
  const baseStats = {
    "24h": {
      totalAppointments: 156,
      predictedNoShows: 23,
      prevented: 18,
      modelAccuracy: 87.3,
    },
    "7d": {
      totalAppointments: 1092,
      predictedNoShows: 161,
      prevented: 129,
      modelAccuracy: 89.1,
    },
    "30d": {
      totalAppointments: 4680,
      predictedNoShows: 687,
      prevented: 548,
      modelAccuracy: 91.2,
    },
  };

  const stats =
    baseStats[timeRange as keyof typeof baseStats] || baseStats["24h"];

  return {
    ...stats,
    noShowRate: Number(
      ((stats.predictedNoShows / stats.totalAppointments) * 100).toFixed(1),
    ),
    cost_savings: stats.prevented * 125, // Average cost per appointment R$125
  };
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options || {});
        });
      },
    });

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get time range from query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "24h";

    // Validate time range
    const validRanges = ["24h", "7d", "30d"];
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: "Invalid time range. Must be 24h, 7d, or 30d" },
        {
          status: 400,
        },
      );
    }

    // In production, this would query actual database metrics
    // For now, return mock statistics based on time range
    const stats = generateMockStats(timeRange);

    // Log stats request for analytics
    await supabase.from("no_show_prediction_logs").insert({
      user_id: session.user.id,
      action: "get_stats",
      time_range: timeRange,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(stats);
  } catch (_error) {
    // console.error("Error fetching no-show stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
