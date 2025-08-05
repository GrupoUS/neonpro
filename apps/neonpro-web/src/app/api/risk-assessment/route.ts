/**
 * Risk Assessment API Routes
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * Provides API endpoints for:
 * - Creating and managing risk assessments
 * - Automated risk scoring algorithms
 * - Human-in-the-loop medical validation
 * - Risk mitigation strategies
 * - Real-time alert management
 */

import type { NextRequest, NextResponse } from "next/server";
import type { RiskAssessmentService } from "@/app/lib/services/risk-assessment-automation";
import type { RiskAssessmentSchema } from "@/app/lib/validations/risk-assessment-automation";
import type { CreateRiskAssessmentRequest } from "@/app/types/risk-assessment-automation";

const riskAssessmentService = new RiskAssessmentService();

/**
 * GET /api/risk-assessment
 * Retrieve risk assessments with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const filters: any = {};
    if (patientId) filters.patientId = patientId;
    if (status) filters.status = status;
    if (riskLevel) filters.riskLevel = riskLevel;

    const assessments = await riskAssessmentService.getAllRiskAssessments(filters, limit, offset);

    return NextResponse.json({
      success: true,
      data: assessments,
      pagination: {
        limit,
        offset,
        total: assessments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching risk assessments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch risk assessments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/risk-assessment
 * Create new risk assessment with automated scoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RiskAssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const requestData: CreateRiskAssessmentRequest = validationResult.data;

    // Create risk assessment with automated scoring
    const assessment = await riskAssessmentService.createRiskAssessment(requestData);

    return NextResponse.json(
      {
        success: true,
        data: assessment,
        message: "Risk assessment created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating risk assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create risk assessment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
