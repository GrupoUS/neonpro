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

    // Fetch appointments for the clinic
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:patients(full_name, email),
        doctor:neonpro_profiles!appointments_doctor_id_fkey(full_name)
      `
      )
      .eq("clinic_id", profile.clinic_id)
      .order("appointment_date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });
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
    const {
      patient_id,
      doctor_id,
      appointment_date,
      duration_minutes = 60,
      treatment_type,
      notes,
    } = body;

    // Validate required fields
    if (!patient_id || !doctor_id || !appointment_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        clinic_id: profile.clinic_id,
        patient_id,
        doctor_id,
        appointment_date,
        duration_minutes,
        treatment_type,
        notes,
        status: "scheduled",
      })
      .select(
        `
        *,
        patient:patients(full_name, email),
        doctor:neonpro_profiles!appointments_doctor_id_fkey(full_name)
      `
      )
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return NextResponse.json(
        { error: "Failed to create appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
