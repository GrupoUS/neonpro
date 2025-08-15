// Story 9.2: Personalized Treatment Recommendations - API Profiles Route
// Recommendation profiles API endpoint

import { type NextRequest, NextResponse } from 'next/server';
import { personalizedRecommendationsService } from '../../../lib/services/personalized-recommendations';
import {
  createRecommendationProfileRequestSchema,
  updateRecommendationProfileRequestSchema,
} from '../../../lib/validations/personalized-recommendations';
import type {
  CreateRecommendationProfileRequest,
  UpdateRecommendationProfileRequest,
} from '../../../types/personalized-recommendations';

// Get recommendation profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      patient_id: searchParams.get('patient_id') || undefined,
      provider_id: searchParams.get('provider_id') || undefined,
      status: searchParams.get('status') || undefined,
      limit: Number.parseInt(searchParams.get('limit') || '10', 10),
      offset: Number.parseInt(searchParams.get('offset') || '0', 10),
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const profiles =
      await personalizedRecommendationsService.getProfiles(query);

    return NextResponse.json({
      profiles,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching recommendation profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendation profiles', success: false },
      { status: 500 }
    );
  }
}

// Create recommendation profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult =
      createRecommendationProfileRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid recommendation profile data',
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    const profileData: CreateRecommendationProfileRequest =
      validationResult.data;
    const profile =
      await personalizedRecommendationsService.createProfile(profileData);

    return NextResponse.json(
      {
        profile,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recommendation profile:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendation profile', success: false },
      { status: 500 }
    );
  }
}

// Update recommendation profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult =
      updateRecommendationProfileRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid recommendation profile update data',
          details: validationResult.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    const { id, ...updateData }: UpdateRecommendationProfileRequest =
      validationResult.data;
    const profile = await personalizedRecommendationsService.updateProfile(
      id,
      updateData
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Recommendation profile not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile,
      success: true,
    });
  } catch (error) {
    console.error('Error updating recommendation profile:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation profile', success: false },
      { status: 500 }
    );
  }
}
