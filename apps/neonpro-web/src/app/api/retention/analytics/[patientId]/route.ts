// API endpoint for patient retention analytics by patient ID
// Story 7.4: Advanced patient retention analytics with predictive modeling

import { NextRequest, NextResponse } from "next/server";
import { RetentionService } from "../../../../lib/services/retention";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient ID is required",
        },
        { status: 400 },
      );
    }

    const retentionAnalytics = await RetentionService.getRetentionAnalyticsByPatient(patientId);

    if (!retentionAnalytics) {
      return NextResponse.json(
        {
          success: false,
          error: "Retention analytics not found for this patient",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: retentionAnalytics,
    });
  } catch (error) {
    console.error("Error in retention analytics by patient GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch retention analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
