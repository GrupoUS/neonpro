import { createServerClient } from "@neonpro/database";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface NoShowPredictionRequest {
  patientId: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  patientData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
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

    const predictionRequest: NoShowPredictionRequest = await request.json();

    // Validate required fields
    if (!(predictionRequest.patientId && predictionRequest.appointmentId)) {
      return NextResponse.json(
        { error: "patientId and appointmentId are required" },
        {
          status: 400,
        },
      );
    }

    // In production, this would call actual ML model
    // Mock prediction based on patient ID
    const patientIdNum = Number.parseInt(
      predictionRequest.patientId.replaceAll(/\D/g, ""),
      10,
    );
    const riskScore = (patientIdNum % 100) / 100;

    const riskCategory: "low" | "medium" | "high" | "very_high" = riskScore < 0.3
      ? "low"
      : riskScore < 0.6
      ? "medium"
      : riskScore < 0.8
      ? "high"
      : "very_high";

    const prediction = {
      patientId: predictionRequest.patientId,
      appointmentId: predictionRequest.appointmentId,
      noShowProbability: riskScore,
      riskCategory,
      confidenceScore: 0.85 + Math.random() * 0.1,
      contributingFactors: [
        {
          factorName: "Histórico de Consultas",
          category: "historical" as const,
          importanceWeight: 0.4,
          impactDirection: "increases_risk" as const,
          description: "Baseado no histórico do paciente",
          confidence: 0.9,
        },
      ],
      recommendations: [
        {
          actionType: "reminder" as const,
          priority: riskCategory === "very_high"
            ? ("urgent" as const)
            : ("medium" as const),
          description: "Ligação de confirmação recomendada",
          estimatedImpact: 0.35,
          implementationCost: "low" as const,
          timingRecommendation: "24 horas antes",
          successProbability: 0.73,
        },
      ],
    };

    // Store prediction in database
    await supabase.from("no_show_predictions").insert({
      patient_id: predictionRequest.patientId,
      appointment_id: predictionRequest.appointmentId,
      no_show_probability: prediction.noShowProbability,
      risk_category: prediction.riskCategory,
      confidence_score: prediction.confidenceScore,
      contributing_factors: prediction.contributingFactors,
      recommendations: prediction.recommendations,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(prediction);
  } catch (error) {
    // console.error("Error creating prediction:", error);
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 },
    );
  }
}
