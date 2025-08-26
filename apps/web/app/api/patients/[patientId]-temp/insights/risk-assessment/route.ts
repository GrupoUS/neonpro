// Story 3.2: API Endpoint - Risk Assessment

import { createClient } from "@/app/utils/supabase/server";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const patientInsights = new PatientInsightsIntegration();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
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

    // Generate risk assessment
    const riskAssessment = await patientInsights.getRiskAssessment(patientId);

    return NextResponse.json({
      success: true,
      data: riskAssessment,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate risk assessment" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
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
    const { includeRecommendations = true } = body;

    // Generate comprehensive risk assessment
    const riskAssessment = await patientInsights.getRiskAssessment(patientId);

    let recommendations: any[] = [];
    if (includeRecommendations) {
      const treatmentGuidance =
        await patientInsights.getTreatmentRecommendations(patientId);
      recommendations = treatmentGuidance.recommendations || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        ...riskAssessment,
        recommendations,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate comprehensive risk assessment" },
      {
        status: 500,
      },
    );
  }
}
