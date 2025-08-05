import type {
  createDashboardConfigSchema,
  updateDashboardConfigSchema,
} from "@/app/lib/validations/dashboard";
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
    const configId = url.searchParams.get("id");

    if (configId) {
      // Get specific dashboard config
      const { data, error } = await supabase
        .from("dashboard_configs")
        .select("*")
        .eq("id", configId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching dashboard config:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard config" }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: "Dashboard config not found" }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get all dashboard configs for user
      const { data, error } = await supabase
        .from("dashboard_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching dashboard configs:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard configs" }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error("Dashboard config GET error:", error);
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
    const validatedData = createDashboardConfigSchema.parse(body);

    const { data, error } = await supabase
      .from("dashboard_configs")
      .insert([
        {
          ...validatedData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating dashboard config:", error);
      return NextResponse.json({ error: "Failed to create dashboard config" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Dashboard config POST error:", error);
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
    const validatedData = updateDashboardConfigSchema.parse(body);
    const { id, ...updateFields } = validatedData;

    const { data, error } = await supabase
      .from("dashboard_configs")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating dashboard config:", error);
      return NextResponse.json({ error: "Failed to update dashboard config" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Dashboard config not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard config PUT error:", error);
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
    const configId = url.searchParams.get("id");

    if (!configId) {
      return NextResponse.json({ error: "Config ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("dashboard_configs")
      .delete()
      .eq("id", configId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting dashboard config:", error);
      return NextResponse.json({ error: "Failed to delete dashboard config" }, { status: 500 });
    }

    return NextResponse.json({ message: "Dashboard config deleted successfully" });
  } catch (error) {
    console.error("Dashboard config DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
