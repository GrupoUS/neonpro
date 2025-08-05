// KPI Alerts Management API
// Description: API endpoints for KPI alert management and acknowledgment
// Author: Dev Agent
// Date: 2025-01-26

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

interface AlertFilters {
  alert_type?: string;
  is_acknowledged?: boolean;
  kpi_category?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}

const alertFiltersSchema = z.object({
  alert_type: z.enum(["critical", "warning", "info"]).optional(),
  is_acknowledged: z.boolean().optional(),
  kpi_category: z.string().optional(),
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(50),
  offset: z.number().int().min(0).default(0),
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
    const filters = {
      alert_type: searchParams.get("alert_type"),
      is_acknowledged:
        searchParams.get("is_acknowledged") === "true"
          ? true
          : searchParams.get("is_acknowledged") === "false"
            ? false
            : undefined,
      kpi_category: searchParams.get("kpi_category"),
      created_after: searchParams.get("created_after"),
      created_before: searchParams.get("created_before"),
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const validatedFilters = alertFiltersSchema.parse(filters);

    // Build query
    let query = supabase
      .from("kpi_alerts")
      .select(`
        *,
        financial_kpis(kpi_name, kpi_category)
      `)
      .order("created_at", { ascending: false })
      .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

    // Apply filters
    if (validatedFilters.alert_type) {
      query = query.eq("alert_type", validatedFilters.alert_type);
    }

    if (validatedFilters.is_acknowledged !== undefined) {
      query = query.eq("is_acknowledged", validatedFilters.is_acknowledged);
    }

    if (validatedFilters.kpi_category) {
      query = query.eq("financial_kpis.kpi_category", validatedFilters.kpi_category);
    }

    if (validatedFilters.created_after) {
      query = query.gte("created_at", validatedFilters.created_after);
    }

    if (validatedFilters.created_before) {
      query = query.lte("created_at", validatedFilters.created_before);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      throw new Error(`Database error: ${alertsError.message}`);
    }

    // Get total count for pagination
    let countQuery = supabase.from("kpi_alerts").select("*", { count: "exact", head: true });

    // Apply same filters to count query
    if (validatedFilters.alert_type) {
      countQuery = countQuery.eq("alert_type", validatedFilters.alert_type);
    }

    if (validatedFilters.is_acknowledged !== undefined) {
      countQuery = countQuery.eq("is_acknowledged", validatedFilters.is_acknowledged);
    }

    if (validatedFilters.created_after) {
      countQuery = countQuery.gte("created_at", validatedFilters.created_after);
    }

    if (validatedFilters.created_before) {
      countQuery = countQuery.lte("created_at", validatedFilters.created_before);
    }

    const { count } = await countQuery;

    // Format results
    const formattedAlerts =
      alerts?.map((alert) => ({
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
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedAlerts,
      pagination: {
        total: count || 0,
        limit: validatedFilters.limit,
        offset: validatedFilters.offset,
        has_more: (count || 0) > validatedFilters.offset + validatedFilters.limit,
      },
      filters: validatedFilters,
    });
  } catch (error) {
    console.error("Error retrieving alerts:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
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

    const alertSchema = z.object({
      kpi_id: z.string(),
      alert_type: z.enum(["critical", "warning", "info"]),
      alert_message: z.string(),
      threshold_value: z.number().optional(),
      current_value: z.number(),
      variance_percent: z.number().optional(),
      metadata: z.record(z.any()).optional(),
    });

    const validatedData = alertSchema.parse(body);

    // Create new alert
    const { data: newAlert, error: createError } = await supabase
      .from("kpi_alerts")
      .insert([
        {
          kpi_id: validatedData.kpi_id,
          alert_type: validatedData.alert_type,
          alert_message: validatedData.alert_message,
          threshold_value: validatedData.threshold_value,
          current_value: validatedData.current_value,
          variance_percent: validatedData.variance_percent,
          is_acknowledged: false,
          metadata: validatedData.metadata,
        },
      ])
      .select()
      .single();

    if (createError) {
      throw new Error(`Database error: ${createError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: "Alert created successfully",
    });
  } catch (error) {
    console.error("Error creating alert:", error);

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
