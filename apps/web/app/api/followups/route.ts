// =====================================================================================
// TREATMENT FOLLOW-UPS API ROUTES
// Epic 7.3: REST API endpoints for follow-up automation
// GET /api/followups - List follow-ups with filters
// POST /api/followups - Create new follow-up
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import type {
  CreateFollowupData,
  FollowupFilters,
} from '@/app/types/treatment-followups';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const filters: FollowupFilters = {};

    // Extract filters from query params
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',') as any[];
    }
    if (searchParams.get('followup_type')) {
      filters.followup_type = searchParams
        .get('followup_type')
        ?.split(',') as any[];
    }
    if (searchParams.get('communication_method')) {
      filters.communication_method = searchParams
        .get('communication_method')
        ?.split(',') as any[];
    }
    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority')?.split(',') as any[];
    }
    if (searchParams.get('clinic_id')) {
      filters.clinic_id = searchParams.get('clinic_id')!;
    }
    if (searchParams.get('patient_id')) {
      filters.patient_id = searchParams.get('patient_id')!;
    }
    if (searchParams.get('assigned_to')) {
      filters.assigned_to = searchParams.get('assigned_to')!;
    }
    if (searchParams.get('date_from')) {
      filters.date_from = searchParams.get('date_from')!;
    }
    if (searchParams.get('date_to')) {
      filters.date_to = searchParams.get('date_to')!;
    }
    if (searchParams.get('automated')) {
      filters.automated = searchParams.get('automated') === 'true';
    }
    if (searchParams.get('limit')) {
      filters.limit = Number.parseInt(searchParams.get('limit')!, 10);
    }
    if (searchParams.get('offset')) {
      filters.offset = Number.parseInt(searchParams.get('offset')!, 10);
    }

    // Fetch follow-ups
    const followups = await treatmentFollowupService.getFollowups(filters);

    return NextResponse.json({
      data: followups,
      count: followups.length,
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'clinic_id',
      'patient_id',
      'followup_type',
      'communication_method',
      'scheduled_date',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: `Field '${field}' is required`,
          },
          { status: 400 },
        );
      }
    }

    // Convert scheduled_date to Date object
    const followupData: CreateFollowupData = {
      ...body,
      scheduled_date: new Date(body.scheduled_date),
      created_by: session.user.id,
    };

    // Create follow-up
    const newFollowup =
      await treatmentFollowupService.createFollowup(followupData);

    return NextResponse.json(
      {
        data: newFollowup,
        message: 'Follow-up created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
