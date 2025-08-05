// Alert Acknowledgment API
// Description: Dedicated endpoint for alert acknowledgment
// Author: Dev Agent
// Date: 2025-01-26

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Acknowledge the alert
    const { data: updatedAlert, error } = await supabase
      .from("kpi_alerts")
      .update({
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: "Alert acknowledged successfully",
    });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
