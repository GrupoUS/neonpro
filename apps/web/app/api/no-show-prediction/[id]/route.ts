// Story 11.2: Individual No-Show Prediction API Routes
// CRUD operations for specific predictions

import { noShowPredictionEngine } from "@/app/lib/services/no-show-prediction";
import { UpdatePredictionInputSchema } from "@/app/lib/validations/no-show-prediction";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prediction = await noShowPredictionEngine.getPrediction(id);

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 },
      );
    }

    // Get related data
    const [riskFactors, interventions] = await Promise.all([
      noShowPredictionEngine.getRiskFactorsByPatient(prediction.patient_id),
      noShowPredictionEngine.getRecommendedInterventions(prediction.id),
    ]);

    // Get appointment details
    const { data: appointment } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patients!inner(
          id,
          full_name,
          email,
          phone
        ),
        service_types!inner(
          id,
          name,
          duration_minutes,
          price
        ),
        professionals!inner(
          id,
          full_name,
          professional_title
        )
      `,
      )
      .eq("id", prediction.appointment_id)
      .single();

    return NextResponse.json({
      prediction,
      appointment,
      risk_factors: riskFactors,
      interventions,
      confidence_breakdown: prediction.factors_analyzed,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedInput = UpdatePredictionInputSchema.parse(body);

    // Check if prediction exists
    const existingPrediction = await noShowPredictionEngine.getPrediction(id);
    if (!existingPrediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 },
      );
    }

    // Update the prediction
    const updatedPrediction = await noShowPredictionEngine.updatePrediction(
      id,
      validatedInput,
    );

    // If actual outcome was provided, update model performance metrics
    if (validatedInput.actual_outcome && !existingPrediction.actual_outcome) {
      // This would trigger model performance recalculation
      // Implementation depends on specific requirements
    }

    // Get updated related data
    const [riskFactors, interventions] = await Promise.all([
      noShowPredictionEngine.getRiskFactorsByPatient(
        updatedPrediction.patient_id,
      ),
      noShowPredictionEngine.getRecommendedInterventions(updatedPrediction.id),
    ]);

    return NextResponse.json({
      prediction: updatedPrediction,
      risk_factors: riskFactors,
      interventions,
      message: "Prediction updated successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      { error: "Failed to update prediction" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if prediction exists
    const existingPrediction = await noShowPredictionEngine.getPrediction(id);
    if (!existingPrediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 },
      );
    }

    // Delete the prediction (cascade will handle related interventions)
    const { error } = await supabase
      .from("no_show_predictions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete prediction" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Prediction deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 },
    );
  }
}
