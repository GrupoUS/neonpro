// Story 3.2: API Endpoint - Treatment Recommendations

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";

const patientInsights = new PatientInsightsIntegration();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;

    // Validate patient access
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get treatment context from query parameters
    const { searchParams } = new URL(request.url);
    const treatmentContext = searchParams.get("context") || undefined;

    // Generate treatment guidance
    const treatmentRecommendations = await patientInsights.generateTreatmentGuidance(
      patientId,
      treatmentContext,
    );

    return NextResponse.json({
      success: true,
      data: treatmentRecommendations,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to generate treatment recommendations" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    const body = await request.json();
    const {
      treatmentContext,
      includeAlternatives = true,
      includeRiskAssessment = true,
      outcomeData = null,
    } = body;

    // Generate comprehensive treatment recommendations
    const treatmentRecommendations = await patientInsights.generateTreatmentGuidance(
      patientId,
      treatmentContext,
    );

    const response: any = { treatmentRecommendations };

    if (includeRiskAssessment) {
      const riskAssessment = await patientInsights.generateQuickRiskAssessment(patientId);
      response.riskAssessment = riskAssessment;
    }

    // Process outcome data for learning if provided
    if (outcomeData?.treatmentId) {
      const learningInsights = await patientInsights.updatePatientOutcome(
        patientId,
        outcomeData.treatmentId,
        outcomeData,
      );
      response.learningInsights = learningInsights;
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to generate comprehensive treatment recommendations" },
      { status: 500 },
    );
  }
}
