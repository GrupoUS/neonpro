// =====================================================================================
// FOLLOW-UP ANALYTICS API ROUTES
// Epic 7.3: REST API endpoints for follow-up analytics and dashboard data
// GET /api/followups/analytics - Get analytics data
// GET /api/followups/analytics/dashboard - Get dashboard summary
// =====================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const clinicId = searchParams.get('clinic_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinic_id is required' }, { status: 400 });
    }

    // Fetch analytics
    const analytics = await treatmentFollowupService.getAnalytics(clinicId, dateFrom || undefined, dateTo || undefined);

    return NextResponse.json({
      data: analytics,
      clinic_id: clinicId,
      date_range: {
        from: dateFrom,
        to: dateTo
      }
    });

  } catch (error) {
    console.error('API error in GET /api/followups/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}