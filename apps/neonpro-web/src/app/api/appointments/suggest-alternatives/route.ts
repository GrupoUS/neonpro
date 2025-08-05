// =============================================

// NeonPro Alternative Time Slot Suggestion API
// Story 1.2: Task 5 - Alternative time slot suggestion system
// Route: /api/appointments/suggest-alternatives
// =============================================

import { type NextRequest, NextResponse } from "next/server";

// Validation schema for alternative slot suggestion request
const suggestAlternativesSchema = z.object({
  professional_id: z.string().uuid("Invalid professional ID"),
  service_type_id: z.string().uuid("Invalid service type ID"),
  preferred_start_time: z.string().datetime("Invalid preferred start time format"),
  duration_minutes: z.number().int().positive("Duration must be positive"),
  search_window_days: z.number().int().min(1).max(30).default(7),
  max_suggestions: z.number().int().min(1).max(10).default(5),
  preferred_times: z.array(z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)).optional(),
  exclude_appointment_id: z.string().uuid().optional(),
});

interface AlternativeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  score: number;
  reasons: string[];
  distance_from_preferred_minutes: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user profile to extract clinic_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json(
        {
          error: "Profile not found",
          details: "User profile or clinic not found",
        },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = suggestAlternativesSchema.parse(body);

    // Call the alternative slot suggestion stored procedure
    const { data: suggestionsResult, error: suggestionsError } = await supabase.rpc(
      "sp_suggest_alternative_slots",
      {
        p_clinic_id: profile.clinic_id,
        p_professional_id: validatedData.professional_id,
        p_service_type_id: validatedData.service_type_id,
        p_preferred_start_time: validatedData.preferred_start_time,
        p_duration_minutes: validatedData.duration_minutes,
        p_search_window_days: validatedData.search_window_days,
        p_max_suggestions: validatedData.max_suggestions,
        p_preferred_times: validatedData.preferred_times || null,
        p_exclude_appointment_id: validatedData.exclude_appointment_id || null,
      },
    );

    if (suggestionsError) {
      console.error("Alternative suggestions procedure error:", suggestionsError);
      return NextResponse.json(
        {
          error: "Suggestion generation failed",
          details: suggestionsError.message,
          code: "SUGGESTION_PROCEDURE_ERROR",
        },
        { status: 500 },
      );
    }

    // Parse the result (stored procedure returns jsonb)
    const result =
      typeof suggestionsResult === "string" ? JSON.parse(suggestionsResult) : suggestionsResult;

    // Enhance suggestions with client-friendly formatting
    const enhancedSuggestions = (result.suggestions || []).map((slot: any) => ({
      ...slot,
      formatted_start_time: new Date(slot.start_time).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      formatted_date: new Date(slot.start_time).toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      formatted_time: new Date(slot.start_time).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      is_same_day:
        new Date(slot.start_time).toDateString() ===
        new Date(validatedData.preferred_start_time).toDateString(),
      days_from_preferred: Math.ceil(
        (new Date(slot.start_time).getTime() -
          new Date(validatedData.preferred_start_time).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    }));

    // Sort suggestions by score (highest first)
    enhancedSuggestions.sort((a: any, b: any) => b.score - a.score);

    // Format response for frontend
    const response = {
      success: result.success || true,
      suggestions: enhancedSuggestions,
      search_criteria: {
        professional_id: validatedData.professional_id,
        service_type_id: validatedData.service_type_id,
        preferred_start_time: validatedData.preferred_start_time,
        duration_minutes: validatedData.duration_minutes,
        search_window_days: validatedData.search_window_days,
      },
      metadata: {
        total_suggestions: enhancedSuggestions.length,
        search_window_end: new Date(
          new Date(validatedData.preferred_start_time).getTime() +
            validatedData.search_window_days * 24 * 60 * 60 * 1000,
        ).toISOString(),
        generated_at: new Date().toISOString(),
      },
      performance: {
        generation_time_ms: Date.now() - startTime,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Alternative slots API error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: "Invalid request parameters",
          validation_errors: error.errors,
          code: "INVALID_REQUEST_PARAMETERS",
        },
        { status: 400 },
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid JSON",
          details: "Request body contains invalid JSON",
          code: "INVALID_JSON",
        },
        { status: 400 },
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred during alternative slot generation",
        code: "INTERNAL_SERVER_ERROR",
        performance: {
          generation_time_ms: Date.now() - startTime,
        },
      },
      { status: 500 },
    );
  }
}

// GET endpoint for quick alternative suggestions
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const professionalId = searchParams.get("professional_id");
    const serviceTypeId = searchParams.get("service_type_id");
    const preferredStartTime = searchParams.get("preferred_start_time");
    const durationMinutes = searchParams.get("duration_minutes");
    const maxSuggestions = searchParams.get("max_suggestions") || "5";

    // Validate required parameters
    if (!professionalId || !serviceTypeId || !preferredStartTime || !durationMinutes) {
      return NextResponse.json(
        {
          error: "Missing parameters",
          details:
            "professional_id, service_type_id, preferred_start_time, and duration_minutes are required",
        },
        { status: 400 },
      );
    }

    // Convert and validate data
    const queryData = {
      professional_id: professionalId,
      service_type_id: serviceTypeId,
      preferred_start_time: preferredStartTime,
      duration_minutes: parseInt(durationMinutes),
      max_suggestions: parseInt(maxSuggestions),
    };

    const validatedData = suggestAlternativesSchema.parse(queryData);

    // Call suggestion function
    const { data: suggestionsResult, error: suggestionsError } = await supabase.rpc(
      "sp_suggest_alternative_slots",
      {
        p_clinic_id: profile.clinic_id,
        p_professional_id: validatedData.professional_id,
        p_service_type_id: validatedData.service_type_id,
        p_preferred_start_time: validatedData.preferred_start_time,
        p_duration_minutes: validatedData.duration_minutes,
        p_search_window_days: 7, // Default search window
        p_max_suggestions: validatedData.max_suggestions,
        p_preferred_times: null,
        p_exclude_appointment_id: null,
      },
    );

    if (suggestionsError) {
      return NextResponse.json(
        {
          error: "Suggestion generation failed",
          details: suggestionsError.message,
        },
        { status: 500 },
      );
    }

    const result =
      typeof suggestionsResult === "string" ? JSON.parse(suggestionsResult) : suggestionsResult;

    return NextResponse.json({
      suggestions: result.suggestions || [],
      metadata: {
        total_suggestions: (result.suggestions || []).length,
        generated_at: new Date().toISOString(),
      },
      performance: {
        generation_time_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Alternative suggestions GET error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          validation_errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred",
        performance: {
          generation_time_ms: Date.now() - startTime,
        },
      },
      { status: 500 },
    );
  }
}
