import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's clinic_id from profile
    const { data: profile, error: profileError } = await supabase
      .from("neonpro_profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .order("created_at", { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: patients, error } = await query;

    if (error) {
      console.error("Error fetching patients:", error);
      return NextResponse.json(
        { error: "Failed to fetch patients" },
        { status: 500 }
      );
    }

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's clinic_id from profile
    const { data: profile, error: profileError } = await supabase
      .from("neonpro_profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const body = await request.json();
    const { full_name, email, phone, date_of_birth, medical_history } = body;

    // Validate required fields
    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Check if patient with same email already exists in clinic
    if (email) {
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", profile.clinic_id)
        .eq("email", email)
        .single();

      if (existingPatient) {
        return NextResponse.json(
          { error: "Patient with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Create new patient
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        clinic_id: profile.clinic_id,
        full_name,
        email,
        phone,
        date_of_birth,
        medical_history,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating patient:", error);
      return NextResponse.json(
        { error: "Failed to create patient" },
        { status: 500 }
      );
    }

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
