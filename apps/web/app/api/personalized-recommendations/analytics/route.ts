// Story 9.2: Personalized Treatment Recommendations - API Analytics Route
// Recommendation analytics API endpoint

import { type NextRequest, NextResponse } from 'next/server';
import { personalizedRecommendationsService } from '../../../lib/services/personalized-recommendations';
import { recordPerformanceRequestSchema } from '../../../lib/validations/personalized-recommendations';
import type { RecordPerformanceRequest } from '../../../types/personalized-recommendations';

// Get recommendation analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const _providerId = searchParams.get('provider_id');
    const _patientId = searchParams.get('patient_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const analytics =
      await personalizedRecommendationsService.getRecommendationAnalytics(
        startDate || undefined,
        endDate || undefined
      );

    return NextResponse.json({
      analytics,
      success: true,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendation analytics', success: false },
      { status: 500 }
    );
  }
}

// Record performance metric
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = recordPerformanceRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid performance data',
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    // The validated data is guaranteed to have all required fields by the schema
    const performance =
      await personalizedRecommendationsService.recordRecommendationPerformance(
        validationResult.data as RecordPerformanceRequest
      );

    return NextResponse.json(
      {
        performance,
        success: true,
      },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to record performance metric', success: false },
      { status: 500 }
    );
  }
}
