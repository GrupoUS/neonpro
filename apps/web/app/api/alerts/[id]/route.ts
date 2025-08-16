// Story 10.2: Progress Tracking through Computer Vision - Individual Alert API
// API endpoint for individual alert operations

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';

const markActionTakenSchema = z.object({
  action_notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mark_read') {
      // Mark alert as read
      const alert = await progressTrackingService.markAlertRead(id);
      return NextResponse.json(alert);
    }
    if (action === 'mark_action_taken') {
      // Mark action as taken
      const body = await request.json();
      const { action_notes } = markActionTakenSchema.parse(body);

      const alert = await progressTrackingService.markAlertActionTaken(
        id,
        action_notes
      );
      return NextResponse.json(alert);
    }
    return NextResponse.json(
      { error: 'Invalid action. Use mark_read or mark_action_taken' },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
