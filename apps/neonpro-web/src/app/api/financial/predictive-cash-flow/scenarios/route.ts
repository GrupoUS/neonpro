/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW API - SCENARIOS ENDPOINT
 * =====================================================================================
 *
 * API for managing forecasting scenarios and scenario-based predictions.
 *
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * =====================================================================================
 */

import type { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import type { createForecastingScenarioSchema } from "@/lib/validations/predictive-cash-flow";

const getScenariosSchema = z.object({
  clinicId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);

    const validation = getScenariosSchema.safeParse({
      clinicId: searchParams.get("clinicId"),
    });

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { clinicId } = validation.data;

    const { data: scenarios, error } = await supabase
      .from("forecasting_scenarios")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 });
    }

    return NextResponse.json({ scenarios: scenarios || [] });
  } catch (error) {
    console.error("Error in GET /api/financial/predictive-cash-flow/scenarios:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    const validation = createForecastingScenarioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: scenario, error } = await supabase
      .from("forecasting_scenarios")
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create scenario" }, { status: 500 });
    }

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/financial/predictive-cash-flow/scenarios:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
