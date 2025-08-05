// =====================================================================================
// FOLLOW-UP DASHBOARD API ROUTE
// Epic 7.3: REST API endpoint for dashboard summary
// GET /api/followups/analytics/dashboard - Get dashboard summary data
// =====================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createtreatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

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

    if (!clinicId) {
      return NextResponse.json({ error: 'clinic_id is required' }, { status: 400 });
    }

    // Fetch dashboard summary
    const summary = await createtreatmentFollowupService().getDashboardSummary(clinicId);

    return NextResponse.json({
      data: summary,
      clinic_id: clinicId,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error in GET /api/followups/analytics/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
