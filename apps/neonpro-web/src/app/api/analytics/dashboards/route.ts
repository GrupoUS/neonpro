// Dashboard Builder API
// Description: API endpoints for dashboard creation and management
// Author: Dev Agent
// Date: 2025-01-26

import { NextRequest, NextResponse } from "next/server";
import { DashboardBuilder } from "@/lib/analytics/dashboard-builder";
import { dashboardLayoutSchema, dashboardWidgetSchema } from "@/lib/validations/kpi-validations";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createDashboardSchema = z.object({
  dashboard_name: z.string().min(1).max(255),
  description: z.string().optional(),
  layout: dashboardLayoutSchema,
  widgets: z.array(dashboardWidgetSchema),
  filters: z.object({
    time_period: z.object({
      start_date: z.string(),
      end_date: z.string(),
      preset: z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
    }),
    service_types: z.array(z.string()).optional(),
    doctor_ids: z.array(z.string()).optional(),
    location_ids: z.array(z.string()).optional(),
    payment_methods: z.array(z.string()).optional(),
  }),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get("include_public") === "true";
    const isDefault = searchParams.get("is_default") === "true";

    // Get user's dashboards
    let query = supabase
      .from("dashboard_layouts")
      .select(`
        *,
        dashboard_widgets(*)
      `)
      .order("updated_at", { ascending: false });

    if (includePublic) {
      query = query.or(`created_by.eq.${user.id},is_public.eq.true`);
    } else {
      query = query.eq("created_by", user.id);
    }

    if (isDefault) {
      query = query.eq("is_default", true);
    }

    const { data: dashboards, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Format results
    const formattedDashboards =
      dashboards?.map((dashboard) => ({
        id: dashboard.id,
        dashboard_name: dashboard.dashboard_name,
        description: dashboard.description,
        layout: dashboard.layout,
        filters: dashboard.filters,
        is_default: dashboard.is_default,
        is_public: dashboard.is_public,
        created_by: dashboard.created_by,
        created_at: dashboard.created_at,
        updated_at: dashboard.updated_at,
        widgets: dashboard.dashboard_widgets || [],
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedDashboards,
      metadata: {
        total_dashboards: formattedDashboards.length,
        include_public: includePublic,
        user_id: user.id,
      },
    });
  } catch (error) {
    console.error("Error retrieving dashboards:", error);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    const validatedData = createDashboardSchema.parse(body);

    const dashboardBuilder = new DashboardBuilder();

    // Create dashboard
    const result = await dashboardBuilder.createDashboard({
      dashboard_name: validatedData.dashboard_name,
      description: validatedData.description,
      layout: validatedData.layout,
      filters: validatedData.filters,
      is_default: validatedData.is_default,
      is_public: validatedData.is_public,
      created_by: user.id,
    });

    // Add widgets
    if (validatedData.widgets.length > 0) {
      await Promise.all(
        validatedData.widgets.map((widget) =>
          dashboardBuilder.addWidget(result.id, {
            ...widget,
            position: widget.position || { x: 0, y: 0, w: 4, h: 4 },
          }),
        ),
      );
    }

    // Retrieve complete dashboard
    const { data: completeDashboard, error: fetchError } = await supabase
      .from("dashboard_layouts")
      .select(`
        *,
        dashboard_widgets(*)
      `)
      .eq("id", result.id)
      .single();

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: completeDashboard.id,
        dashboard_name: completeDashboard.dashboard_name,
        description: completeDashboard.description,
        layout: completeDashboard.layout,
        filters: completeDashboard.filters,
        is_default: completeDashboard.is_default,
        is_public: completeDashboard.is_public,
        created_by: completeDashboard.created_by,
        created_at: completeDashboard.created_at,
        updated_at: completeDashboard.updated_at,
        widgets: completeDashboard.dashboard_widgets || [],
      },
      message: "Dashboard created successfully",
    });
  } catch (error) {
    console.error("Error creating dashboard:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

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
