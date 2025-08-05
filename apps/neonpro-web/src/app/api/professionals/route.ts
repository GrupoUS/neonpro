import type { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get clinic_id from user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 400 });
    }

    // Get professionals for this clinic
    const { data: professionals, error } = await supabase
      .from("professionals")
      .select(
        `
        id,
        full_name,
        specialization,
        phone,
        email,
        is_active
      `,
      )
      .eq("clinic_id", profile.clinic_id)
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
