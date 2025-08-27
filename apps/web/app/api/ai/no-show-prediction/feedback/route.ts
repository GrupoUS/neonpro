import { createServerClient } from "@neonpro/database";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface PredictionFeedback {
  appointmentId: string;
  actualOutcome: "attended" | "no_show" | "cancelled";
  feedbackNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options || {});
        });
      },
    });

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedback: PredictionFeedback = await request.json();

    // Validate required fields
    if (!(feedback.appointmentId && feedback.actualOutcome)) {
      return NextResponse.json(
        { error: "appointmentId and actualOutcome are required" },
        {
          status: 400,
        },
      );
    }

    // Validate actualOutcome
    const validOutcomes = ["attended", "no_show", "cancelled"];
    if (!validOutcomes.includes(feedback.actualOutcome)) {
      return NextResponse.json(
        { error: "actualOutcome must be attended, no_show, or cancelled" },
        {
          status: 400,
        },
      );
    }

    // Update prediction with actual outcome
    const { data: existingPrediction, error: fetchError } = await supabase
      .from("no_show_predictions")
      .select("*")
      .eq("appointment_id", feedback.appointmentId)
      .single();

    if (fetchError || !existingPrediction) {
      return NextResponse.json(
        { error: "Prediction not found for this appointment" },
        {
          status: 404,
        },
      );
    }

    // Update prediction with actual outcome
    const { error: updateError } = await supabase
      .from("no_show_predictions")
      .update({
        actual_outcome: feedback.actualOutcome,
        feedback_notes: feedback.feedbackNotes,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      })
      .eq("appointment_id", feedback.appointmentId);

    if (updateError) {
      // console.error("Error updating prediction:", updateError);
      return NextResponse.json(
        { error: "Failed to update prediction" },
        { status: 500 },
      );
    }

    // Calculate prediction accuracy for model training
    const wasCorrect = (feedback.actualOutcome === "no_show"
      && existingPrediction.no_show_probability > 0.5)
      || (feedback.actualOutcome === "attended"
        && existingPrediction.no_show_probability <= 0.5);

    // Log prediction feedback for model improvement
    await supabase.from("no_show_prediction_logs").insert({
      user_id: session.user.id,
      appointment_id: feedback.appointmentId,
      predicted_probability: existingPrediction.no_show_probability,
      actual_outcome: feedback.actualOutcome,
      prediction_correct: wasCorrect,
      action: "feedback",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Prediction feedback recorded successfully",
      predictionCorrect: wasCorrect,
    });
  } catch (error) {
    // console.error("Error processing prediction feedback:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 },
    );
  }
}
