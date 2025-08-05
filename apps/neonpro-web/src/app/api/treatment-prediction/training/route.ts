// POST /api/treatment-prediction/training - Start model training
import type { TreatmentPredictionService } from "@/app/lib/services/treatment-prediction";
import type { TrainingRequest } from "@/app/types/treatment-prediction";
import type { createServerClient } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

// POST /api/treatment-prediction/training - Start model training
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role for training models
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions for model training" },
        { status: 403 },
      );
    }

    const body: TrainingRequest = await request.json();

    // Validate required fields
    if (!body.model_name || !body.algorithm_type) {
      return NextResponse.json(
        { error: "Missing required fields: model_name, algorithm_type" },
        { status: 400 },
      );
    }

    // Validate algorithm type
    const validAlgorithms = [
      "random_forest",
      "gradient_boosting",
      "neural_network",
      "logistic_regression",
    ];
    if (!validAlgorithms.includes(body.algorithm_type)) {
      return NextResponse.json(
        { error: "Invalid algorithm type. Must be one of: " + validAlgorithms.join(", ") },
        { status: 400 },
      );
    }

    const predictionService = new TreatmentPredictionService();
    const trainingResponse = await predictionService.startModelTraining(body);

    return NextResponse.json(
      {
        ...trainingResponse,
        message: "Model training started successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error starting model training:", error);
    return NextResponse.json({ error: "Failed to start model training" }, { status: 500 });
  }
}
