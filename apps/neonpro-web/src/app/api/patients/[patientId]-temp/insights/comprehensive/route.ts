// Story 3.2: API Endpoint - Comprehensive Patient Insights
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";
import { PatientInsightRequest } from "@/lib/ai/patient-insights/types";

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedInsights = searchParams.get("insights")?.split(",") || [];
    const treatmentContext = searchParams.get("context") || undefined;

    // Create comprehensive insight request
    const insightRequest: PatientInsightRequest = {
      patientId: params.patientId,
      requestedInsights: requestedInsights.length > 0 ? (requestedInsights as any[]) : undefined,
      treatmentContext,
      timestamp: new Date(),
      requestId: `req_${Date.now()}_${params.patientId}`,
    };

    // Generate comprehensive insights
    const comprehensiveInsights =
      await patientInsights.generateComprehensiveInsights(insightRequest);

    return NextResponse.json({
      success: true,
      data: comprehensiveInsights,
    });
  } catch (error) {
    console.error("Comprehensive insights API error:", error);
    return NextResponse.json(
      { error: "Failed to generate comprehensive insights" },
      { status: 500 },
    );
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

    // Create detailed insight request from body
    const insightRequest: PatientInsightRequest = {
      patientId: params.patientId,
      requestedInsights: body.requestedInsights || [],
      treatmentContext: body.treatmentContext,
      treatmentId: body.treatmentId,
      customParameters: body.customParameters || {},
      feedbackData: body.feedbackData,
      timestamp: new Date(),
      requestId: body.requestId || `req_${Date.now()}_${params.patientId}`,
    };

    // Generate comprehensive insights with custom parameters
    const comprehensiveInsights =
      await patientInsights.generateComprehensiveInsights(insightRequest);

    return NextResponse.json({
      success: true,
      data: comprehensiveInsights,
      requestId: insightRequest.requestId,
    });
  } catch (error) {
    console.error("Comprehensive insights POST API error:", error);
    return NextResponse.json(
      { error: "Failed to generate comprehensive insights" },
      { status: 500 },
    );
  }
}
