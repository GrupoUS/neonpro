// Story 3.2: API Endpoint - Treatment Recommendations

import { createClient } from "@/app/utils/supabase/server";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const patientInsights = new PatientInsightsIntegration();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; }>; },
) {
  try {
    const supabase = await createClient();

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
    // const url = new URL(request.url);

    // Generate treatment guidance
    const treatmentRecommendations = await patientInsights.getTreatmentRecommendations(patientId);

    return NextResponse.json({
      success: true,
      data: treatmentRecommendations,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate treatment recommendations" },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; }>; },
) {
  try {
    const supabase = await createClient();

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
      includeRiskAssessment = true,
      outcomeData,
    } = body;

    // Generate comprehensive treatment recommendations
    const treatmentRecommendations = await patientInsights.getTreatmentRecommendations(patientId);

    const response: any = { treatmentRecommendations };

    if (includeRiskAssessment) {
      const riskAssessment = await patientInsights.getRiskAssessment(patientId);
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
  } catch {
    return NextResponse.json(
      {
        error: "Failed to generate comprehensive treatment recommendations",
      },
      { status: 500 },
    );
  }
}
