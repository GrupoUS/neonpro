// Story 11.2: No-Show Prediction API Routes
// Main predictions endpoint with CRUD operations

import { NextRequest, NextResponse } from "next/server";
import { noShowPredictionEngine } from "@/app/lib/services/no-show-prediction";
import {
  CreatePredictionInputSchema,
  UpdatePredictionInputSchema,
  GetPredictionsQuerySchema,
} from "@/app/lib/validations/no-show-prediction";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Parse and validate query parameters
    const parsedQuery = GetPredictionsQuerySchema.parse({
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      risk_threshold: queryParams.risk_threshold
        ? parseFloat(queryParams.risk_threshold)
        : undefined,
      intervention_recommended: queryParams.intervention_recommended === "true",
    });

    // Build query based on parameters
    let query = supabase.from("no_show_predictions").select(`
        *,
        appointments!inner(
          id,
          start_time,
          status,
          patients!inner(
            id,
            full_name,
            email
          ),
          service_types!inner(
            id,
            name,
            duration_minutes
          )
        )
      `);

    // Apply filters
    if (parsedQuery.patient_id) {
      query = query.eq("patient_id", parsedQuery.patient_id);
    }

    if (parsedQuery.appointment_id) {
      query = query.eq("appointment_id", parsedQuery.appointment_id);
    }

    if (parsedQuery.risk_threshold !== undefined) {
      query = query.gte("risk_score", parsedQuery.risk_threshold);
    }

    if (parsedQuery.date_from) {
      query = query.gte("prediction_date", parsedQuery.date_from);
    }

    if (parsedQuery.date_to) {
      query = query.lte("prediction_date", parsedQuery.date_to);
    }

    if (parsedQuery.intervention_recommended !== undefined) {
      query = query.eq("intervention_recommended", parsedQuery.intervention_recommended);
    }

    if (parsedQuery.model_version) {
      query = query.eq("model_version", parsedQuery.model_version);
    }

    // Apply sorting
    query = query.order(parsedQuery.sort_by, { ascending: parsedQuery.sort_order === "asc" });

    // Apply pagination
    const offset = (parsedQuery.page - 1) * parsedQuery.limit;
    query = query.range(offset, offset + parsedQuery.limit - 1);

    const { data: predictions, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("no_show_predictions")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      predictions: predictions || [],
      pagination: {
        page: parsedQuery.page,
        limit: parsedQuery.limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / parsedQuery.limit),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedInput = CreatePredictionInputSchema.parse(body);

    // Check if prediction already exists for this appointment
    const existingPrediction = await noShowPredictionEngine.getPredictionsByAppointment(
      validatedInput.appointment_id,
    );

    if (existingPrediction.length > 0) {
      return NextResponse.json(
        { error: "Prediction already exists for this appointment" },
        { status: 409 },
      );
    }

    // Create the prediction
    const prediction = await noShowPredictionEngine.createPrediction(validatedInput);

    // Generate recommended interventions if needed
    let recommendedInterventions = [];
    if (prediction.intervention_recommended) {
      recommendedInterventions = await noShowPredictionEngine.getRecommendedInterventions(
        prediction.id,
      );
    }

    // Get related risk factors
    const riskFactors = await noShowPredictionEngine.getRiskFactorsByPatient(prediction.patient_id);

    return NextResponse.json(
      {
        prediction,
        recommended_interventions: recommendedInterventions,
        risk_factors: riskFactors,
        message: "Prediction created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to create prediction" }, { status: 500 });
  }
}
