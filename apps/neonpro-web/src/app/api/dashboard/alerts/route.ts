import type { createAlertSchema, updateAlertSchema } from "@/app/lib/validations/dashboard";
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
    const alertId = url.searchParams.get("alert_id");
    const status = url.searchParams.get("status");

    let query = supabase.from("dashboard_alerts").select("*").eq("user_id", user.id);

    if (alertId) {
      query = query.eq("id", alertId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching dashboard alerts:", error);
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }

    if (alertId && data && data.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(alertId && data ? data[0] : data);
  } catch (error) {
    console.error("Dashboard alerts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const validatedData = createAlertSchema.parse(body);

    const { data, error } = await supabase
      .from("dashboard_alerts")
      .insert([
        {
          ...validatedData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating alert:", error);
      return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Dashboard alerts POST error:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateAlertSchema.parse(body);

    const url = new URL(request.url);
    const alertId = url.searchParams.get("alert_id") || body.id;

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_alerts")
      .update(validatedData)
      .eq("id", alertId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating alert:", error);
      return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard alerts PUT error:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const alertId = url.searchParams.get("alert_id");

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("dashboard_alerts")
      .delete()
      .eq("id", alertId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting alert:", error);
      return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
    }

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Dashboard alerts DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
