// Story 9.2: Personalized Treatment Recommendations - API Safety Route
// Safety profiles API endpoint

import type { NextRequest, NextResponse } from "next/server";
import type { createpersonalizedRecommendationsService } from "../../../lib/services/personalized-recommendations";
import type { updateSafetyProfileRequestSchema } from "../../../lib/validations/personalized-recommendations";
import type { UpdateSafetyProfileRequest } from "../../../types/personalized-recommendations";

// Get safety profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required", success: false },
        { status: 400 },
      );
    }

    const safetyProfile =
      await createpersonalizedRecommendationsService().getSafetyProfile(patientId);

    return NextResponse.json({
      safetyProfile,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching safety profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch safety profile", success: false },
      { status: 500 },
    );
  }
}

// Update safety profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = updateSafetyProfileRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid safety profile data",
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 },
      );
    }

    const { patient_id, ...updateData }: UpdateSafetyProfileRequest = validationResult.data;
    const safetyProfile = await createpersonalizedRecommendationsService().updateSafetyProfile(
      patient_id,
      updateData,
    );

    if (!safetyProfile) {
      return NextResponse.json(
        { error: "Safety profile not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({
      safetyProfile,
      success: true,
    });
  } catch (error) {
    console.error("Error updating safety profile:", error);
    return NextResponse.json(
      { error: "Failed to update safety profile", success: false },
      { status: 500 },
    );
  }
}
