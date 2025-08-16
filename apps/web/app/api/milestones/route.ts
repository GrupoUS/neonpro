// Story 10.2: Progress Tracking through Computer Vision - Milestones API
// API endpoint for managing progress milestones

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';
import {
  createProgressMilestoneRequestSchema,
  progressMilestoneFiltersSchema,
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
    const validatedData = createProgressMilestoneRequestSchema.parse(body);

    // Create progress milestone
    const milestone =
      await progressTrackingService.createProgressMilestone(validatedData);

    return NextResponse.json(milestone, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create progress milestone' },
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
      milestone_type: searchParams.get('milestone_type') || undefined,
      validation_status: searchParams.get('validation_status') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      alert_sent: searchParams.get('alert_sent') === 'true',
      min_achievement_score: searchParams.get('min_achievement_score')
        ? Number.parseFloat(searchParams.get('min_achievement_score')!)
        : undefined,
      page: searchParams.get('page')
        ? Number.parseInt(searchParams.get('page')!, 10)
        : 1,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : 20,
    };

    // Validate filters
    const validatedFilters = progressMilestoneFiltersSchema.parse(filters);

    // Get progress milestones
    const result =
      await progressTrackingService.getProgressMilestones(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch progress milestones' },
      { status: 500 },
    );
  }
}
