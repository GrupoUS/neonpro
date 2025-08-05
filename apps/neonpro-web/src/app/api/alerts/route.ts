// Story 10.2: Progress Tracking through Computer Vision - Alerts API

// API endpoint for managing progress alerts

import { type NextRequest, NextResponse } from "next/server";

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

    const body = await request.json();

    // Validate request body
    const validatedData = createProgressAlertRequestSchema.parse(body);

    // Create progress alert
    const alert = await progressTrackingService.createProgressAlert(validatedData);

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    console.error("Error creating progress alert:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to create progress alert" }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      patient_id: searchParams.get("patient_id") || undefined,
      alert_type: searchParams.get("alert_type") || undefined,
      alert_priority: searchParams.get("alert_priority") || undefined,
      recipient_type: searchParams.get("recipient_type") || undefined,
      is_read: searchParams.get("is_read") === "true",
      action_required: searchParams.get("action_required") === "true",
      action_taken: searchParams.get("action_taken") === "true",
      expires_before: searchParams.get("expires_before") || undefined,
      expires_after: searchParams.get("expires_after") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    };

    // Validate filters
    const validatedFilters = progressAlertFiltersSchema.parse(filters);

    // Get progress alerts
    const result = await progressTrackingService.getProgressAlerts(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching progress alerts:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to fetch progress alerts" }, { status: 500 });
  }
}
