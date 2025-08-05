// PUT/DELETE /api/treatment-prediction/models/[id] - Update/Delete specific model
import { TreatmentPredictionService } from "@/app/lib/services/treatment-prediction";
import { createServerClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

// PUT /api/treatment-prediction/models/[id] - Update model
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role for updating models
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const predictionService = new TreatmentPredictionService();

    const model = await predictionService.updateModel(params.id, body);

    return NextResponse.json({
      model,
      message: "Prediction model updated successfully",
    });
  } catch (error) {
    console.error("Error updating prediction model:", error);
    return NextResponse.json({ error: "Failed to update prediction model" }, { status: 500 });
  }
}

// DELETE /api/treatment-prediction/models/[id] - Delete model
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role for deleting models
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if model has associated predictions
    const { data: predictions } = await supabase
      .from("treatment_predictions")
      .select("id")
      .eq("model_id", params.id)
      .limit(1);

    if (predictions && predictions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete model with existing predictions. Archive it instead." },
        { status: 400 },
      );
    }

    // Delete model
    const { error } = await supabase.from("prediction_models").delete().eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({
      message: "Prediction model deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prediction model:", error);
    return NextResponse.json({ error: "Failed to delete prediction model" }, { status: 500 });
  }
}
