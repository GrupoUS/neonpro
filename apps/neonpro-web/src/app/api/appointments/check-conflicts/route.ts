import type { ConflictCheckResponse } from "@/app/lib/types/appointments";
import type { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ðŸš€ Edge Runtime para detecÃ§Ã£o instantÃ¢nea de conflitos
export const runtime = "edge";

/**
 * âš¡ Conflict Check API - Edge Runtime Optimized
 *
 * ðŸ“Š Critical performance: <50ms para detecÃ§Ã£o de conflitos
 * ðŸ” Real-time conflict detection sem latency
 * ðŸŒ Global edge deployment para agenda mundial
 * âš™ï¸ Smart conflict resolution com edge computing
 */

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { professional_id, start_time, end_time } = body;

    if (!professional_id || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
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

    // Check for conflicting appointments using the time range overlap
    const { data: conflicts, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        start_time,
        end_time,
        patients:patient_id (
          full_name
        ),
        professionals:professional_id (
          full_name
        )
      `,
      )
      .eq("clinic_id", profile.clinic_id)
      .eq("professional_id", professional_id)
      .not("status", "eq", "cancelled")
      .overlaps("time_range", `[${start_time},${end_time})`);

    if (error) {
      console.error("Error checking conflicts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const hasConflict = conflicts && conflicts.length > 0;
    const conflictingAppointments =
      conflicts?.map((appointment: any) => ({
        id: appointment.id,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        professional_name: appointment.professionals?.full_name || "Unknown",
        patient_name: appointment.patients?.full_name || "Unknown",
      })) || [];

    const response: ConflictCheckResponse = {
      has_conflict: hasConflict,
      conflicting_appointments: hasConflict ? conflictingAppointments : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
