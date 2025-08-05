import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { createinventoryReportsService } from "@/app/lib/services/inventory-reports-service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get dashboard statistics
    const stats = await createinventoryReportsService().getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
