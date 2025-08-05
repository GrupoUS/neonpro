import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { createClient } from "@/lib/supabase/server";

// Request validation schemas
const ListAlertsSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 10, 50))
    .optional(),
  alert_type: z
    .enum([
      "90_days_before",
      "30_days_before",
      "7_days_before",
      "expired",
      "training_due",
      "document_review",
    ])
    .optional(),
  status: z.enum(["pending", "sent", "acknowledged"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

const AcknowledgeAlertSchema = z.object({
  alert_id: z.string().uuid(),
  acknowledgment_note: z.string().optional(),
});

// GET /api/regulatory-documents/alerts - List compliance alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const {
      page = 1,
      limit = 10,
      alert_type,
      status,
      priority,
    } = ListAlertsSchema.parse(queryParams);

    // Get user profile for clinic access
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "User not associated with clinic" }, { status: 403 });
    }

    // Build query with filters
    let query = supabase
      .from("compliance_alerts")
      .select(`
        *,
        regulatory_documents!inner(
          id,
          document_type,
          document_category,
          authority,
          document_number,
          expiration_date,
          status,
          clinic_id
        )
      `)
      .eq("regulatory_documents.clinic_id", profile.clinic_id)
      .order("created_at", { ascending: false });

    // Apply role-based filtering
    if (profile.role !== "admin" && profile.role !== "manager") {
      // Non-admin users only see alerts for their department
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("department")
        .eq("id", user.id)
        .single();

      if (userProfile?.department) {
        query = query.eq("target_department", userProfile.department);
      }
    }

    // Apply filters
    if (alert_type) {
      query = query.eq("alert_type", alert_type);
    }

    if (status) {
      const statusFilter =
        status === "pending" ? "is.null" : status === "sent" ? "not.is.null" : "not.is.null";

      if (status === "pending") {
        query = query.is("sent_at", null);
      } else if (status === "sent") {
        query = query.not("sent_at", "is", null).is("acknowledged_at", null);
      } else if (status === "acknowledged") {
        query = query.not("acknowledged_at", "is", null);
      }
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error("Error fetching compliance alerts:", error);
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      alerts: alerts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/regulatory-documents/alerts - Acknowledge alert
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const { alert_id, acknowledgment_note } = AcknowledgeAlertSchema.parse(requestBody);

    // Update alert as acknowledged
    const { data: alert, error } = await supabase
      .from("compliance_alerts")
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id,
        acknowledgment_note,
      })
      .eq("id", alert_id)
      .select(`
        *,
        regulatory_documents!inner(document_type, document_category)
      `)
      .single();

    if (error) {
      console.error("Error acknowledging alert:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Alert not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Alert acknowledged successfully",
      alert,
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
