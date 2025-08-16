// =====================================================================================
// INDIVIDUAL FOLLOW-UP API ROUTES
// Epic 7.3: REST API endpoints for individual follow-up operations
// GET /api/followups/[id] - Get single follow-up
// PATCH /api/followups/[id] - Update follow-up
// DELETE /api/followups/[id] - Delete follow-up
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { createClient } from '@/app/utils/supabase/server';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 },
      );
    }

    // Fetch follow-up
    const followup = await treatmentFollowupService.getFollowupById(id);

    if (!followup) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: followup });
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 },
      );
    }

    // Parse request body
    const updates = await request.json();

    // Convert dates if present
    if (updates.scheduled_date) {
      updates.scheduled_date = new Date(updates.scheduled_date).toISOString();
    }
    if (updates.completed_date) {
      updates.completed_date = new Date(updates.completed_date).toISOString();
    }

    // Update follow-up
    const updatedFollowup = await treatmentFollowupService.updateFollowup(
      id,
      updates,
    );

    return NextResponse.json({
      data: updatedFollowup,
      message: 'Follow-up updated successfully',
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 },
      );
    }

    // Delete follow-up
    await treatmentFollowupService.deleteFollowup(id);

    return NextResponse.json({
      message: 'Follow-up deleted successfully',
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
