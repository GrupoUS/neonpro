// Individual Alert Management API
// Description: API endpoints for individual alert acknowledgment and updates
// Author: Dev Agent
// Date: 2025-01-26

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
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

    const { data: alert, error } = await supabase
      .from("kpi_alerts")
      .select(`
        *,
        financial_kpis(kpi_name, kpi_category)
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: alert.id,
        kpi_id: alert.kpi_id,
        kpi_name: alert.financial_kpis?.kpi_name,
        kpi_category: alert.financial_kpis?.kpi_category,
        alert_type: alert.alert_type,
        alert_message: alert.alert_message,
        threshold_value: alert.threshold_value,
        current_value: alert.current_value,
        variance_percent: alert.variance_percent,
        is_acknowledged: alert.is_acknowledged,
        acknowledged_at: alert.acknowledged_at,
        acknowledged_by: alert.acknowledged_by,
        created_at: alert.created_at,
        metadata: alert.metadata,
      },
    });
  } catch (error) {
    console.error("Error retrieving alert:", error);
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { action, metadata } = body;

    let updateData: any = {};

    if (action === "acknowledge") {
      updateData = {
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id,
      };
    } else if (action === "unacknowledge") {
      updateData = {
        is_acknowledged: false,
        acknowledged_at: null,
        acknowledged_by: null,
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "acknowledge" or "unacknowledge"' },
        { status: 400 },
      );
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { data: updatedAlert, error } = await supabase
      .from("kpi_alerts")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        financial_kpis(kpi_name, kpi_category)
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAlert.id,
        kpi_id: updatedAlert.kpi_id,
        kpi_name: updatedAlert.financial_kpis?.kpi_name,
        kpi_category: updatedAlert.financial_kpis?.kpi_category,
        alert_type: updatedAlert.alert_type,
        alert_message: updatedAlert.alert_message,
        threshold_value: updatedAlert.threshold_value,
        current_value: updatedAlert.current_value,
        variance_percent: updatedAlert.variance_percent,
        is_acknowledged: updatedAlert.is_acknowledged,
        acknowledged_at: updatedAlert.acknowledged_at,
        acknowledged_by: updatedAlert.acknowledged_by,
        created_at: updatedAlert.created_at,
        metadata: updatedAlert.metadata,
      },
      message: `Alert ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating alert:", error);
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    const { error } = await supabase.from("kpi_alerts").delete().eq("id", params.id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
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
