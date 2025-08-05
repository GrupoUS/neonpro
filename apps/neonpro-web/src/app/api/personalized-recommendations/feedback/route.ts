// Story 9.2: Personalized Treatment Recommendations - API Feedback Route
// Recommendation feedback API endpoint

import type { NextRequest, NextResponse } from "next/server";
import type { createpersonalizedRecommendationsService } from "../../../lib/services/personalized-recommendations";
import type { createRecommendationFeedbackRequestSchema } from "../../../lib/validations/personalized-recommendations";
import type { CreateRecommendationFeedbackRequest } from "../../../types/personalized-recommendations";

// Get recommendation feedback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      recommendation_id: searchParams.get("recommendation_id") || undefined,
      provider_id: searchParams.get("provider_id") || undefined,
      feedback_type: searchParams.get("feedback_type") || undefined,
      adoption_status: searchParams.get("adoption_status") || undefined,
      limit: parseInt(searchParams.get("limit") || "10"),
      offset: parseInt(searchParams.get("offset") || "0"),
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
    };

    const feedback = await createpersonalizedRecommendationsService().getFeedback(query);

    return NextResponse.json({
      feedback,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching recommendation feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation feedback", success: false },
      { status: 500 },
    );
  }
}

// Create recommendation feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createRecommendationFeedbackRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid recommendation feedback data",
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 },
      );
    }

    const feedbackData: CreateRecommendationFeedbackRequest = validationResult.data;
    const feedback = await createpersonalizedRecommendationsService().createFeedback(feedbackData);

    return NextResponse.json(
      {
        feedback,
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating recommendation feedback:", error);
    return NextResponse.json(
      { error: "Failed to create recommendation feedback", success: false },
      { status: 500 },
    );
  }
}
