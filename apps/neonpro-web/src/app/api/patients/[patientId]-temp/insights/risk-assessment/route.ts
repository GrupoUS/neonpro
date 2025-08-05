// Story 3.2: API Endpoint - Risk Assessment

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";

const patientInsights = new PatientInsightsIntegration();

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate patient access
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", params.patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Generate risk assessment
    const riskAssessment = await patientInsights.generateQuickRiskAssessment(params.patientId);

    return NextResponse.json({
      success: true,
      data: riskAssessment,
    });
  } catch (error) {
    console.error("Risk assessment API error:", error);
    return NextResponse.json({ error: "Failed to generate risk assessment" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { includeRecommendations = true } = body;

    // Generate comprehensive risk assessment
    const riskAssessment = await patientInsights.generateQuickRiskAssessment(params.patientId);

    let recommendations = [];
    if (includeRecommendations) {
      const treatmentGuidance = await patientInsights.generateTreatmentGuidance(params.patientId);
      recommendations = treatmentGuidance.primaryRecommendations || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        ...riskAssessment,
        recommendations,
      },
    });
  } catch (error) {
    console.error("Risk assessment POST API error:", error);
    return NextResponse.json(
      { error: "Failed to generate comprehensive risk assessment" },
      { status: 500 },
    );
  }
}
