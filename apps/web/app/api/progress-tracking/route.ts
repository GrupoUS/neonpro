// Story 10.2: Progress Tracking through Computer Vision - Main API Endpoint
// API endpoint for managing progress tracking sessions

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';
import {
  createProgressTrackingSchema,
  progressTrackingFiltersSchema,
} from '@/app/lib/validations/progress-tracking';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createProgressTrackingSchema.parse(body);

    // Create progress tracking record
    const tracking =
      await progressTrackingService.createProgressTracking(validatedData);

    return NextResponse.json(tracking, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create progress tracking' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      patient_id: searchParams.get('patient_id') || undefined,
      tracking_type: searchParams.get('tracking_type') || undefined,
      treatment_type: searchParams.get('treatment_type') || undefined,
      treatment_area: searchParams.get('treatment_area') || undefined,
      validation_status: searchParams.get('validation_status') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      min_progress_score: searchParams.get('min_progress_score')
        ? Number.parseFloat(searchParams.get('min_progress_score')!)
        : undefined,
      max_progress_score: searchParams.get('max_progress_score')
        ? Number.parseFloat(searchParams.get('max_progress_score')!)
        : undefined,
      min_confidence: searchParams.get('min_confidence')
        ? Number.parseFloat(searchParams.get('min_confidence')!)
        : undefined,
      has_milestones: searchParams.get('has_milestones') === 'true',
      has_predictions: searchParams.get('has_predictions') === 'true',
      page: searchParams.get('page')
        ? Number.parseInt(searchParams.get('page')!, 10)
        : 1,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : 20,
    };

    // Validate filters
    const validatedFilters = progressTrackingFiltersSchema.parse(filters);

    // Get progress tracking records
    const result =
      await progressTrackingService.getProgressTrackings(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch progress trackings' },
      { status: 500 },
    );
  }
}
