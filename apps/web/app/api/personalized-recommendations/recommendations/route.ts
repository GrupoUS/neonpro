// Story 9.2: Personalized Treatment Recommendations - API Recommendations Route
// Treatment recommendations API endpoint

import { type NextRequest, NextResponse } from 'next/server';
import { personalizedRecommendationsService } from '../../../lib/services/personalized-recommendations';
import {
  approveRecommendationRequestSchema,
  createTreatmentRecommendationRequestSchema,
} from '../../../lib/validations/personalized-recommendations';
import type {
  ApproveRecommendationRequest,
  CreateTreatmentRecommendationRequest,
} from '../../../types/personalized-recommendations';

// Get treatment recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      patient_id: searchParams.get('patient_id') || undefined,
      provider_id: searchParams.get('provider_id') || undefined,
      status: searchParams.get('status') || undefined,
      recommendation_type: searchParams.get('recommendation_type') || undefined,
      limit: Number.parseInt(searchParams.get('limit') || '10', 10),
      offset: Number.parseInt(searchParams.get('offset') || '0', 10),
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const recommendations =
      await personalizedRecommendationsService.getRecommendations(query);

    return NextResponse.json({
      recommendations,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching treatment recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment recommendations', success: false },
      { status: 500 }
    );
  }
}

// Create treatment recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult =
      createTreatmentRecommendationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid treatment recommendation data',
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    const recommendationData: CreateTreatmentRecommendationRequest =
      validationResult.data;
    const recommendation =
      await personalizedRecommendationsService.createRecommendation(
        recommendationData
      );

    return NextResponse.json(
      {
        recommendation,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating treatment recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment recommendation', success: false },
      { status: 500 }
    );
  }
}

// Approve treatment recommendation
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = approveRecommendationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid recommendation approval data',
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    const approvalData: ApproveRecommendationRequest = validationResult.data;
    const recommendation =
      await personalizedRecommendationsService.approveRecommendation(
        approvalData.id,
        approvalData
      );

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Treatment recommendation not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      recommendation,
      success: true,
    });
  } catch (error) {
    console.error('Error approving treatment recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to approve treatment recommendation', success: false },
      { status: 500 }
    );
  }
}
