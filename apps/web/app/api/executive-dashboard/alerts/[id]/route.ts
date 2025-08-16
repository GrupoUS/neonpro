// Executive Dashboard API - Alert Actions
// Story 7.1: Executive Dashboard Implementation
// PUT /api/executive-dashboard/alerts/[id]

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { executiveDashboardService } from '@/src/lib/services/executive-dashboard';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    const alertId = id;
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 },
      );
    }

    // Parse request body
    const { action } = await request.json();

    if (!(action && ['acknowledge', 'resolve'].includes(action))) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "acknowledge" or "resolve"' },
        { status: 400 },
      );
    }

    // First verify the alert exists and user has access
    const { data: alert } = await supabase
      .from('executive_dashboard_alerts')
      .select('clinic_id')
      .eq('id', alertId)
      .single();

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .eq('clinic_id', alert.clinic_id)
      .single();

    if (!professional) {
      return NextResponse.json(
        { error: 'Access denied to this clinic' },
        { status: 403 },
      );
    }

    // Perform the action
    let updatedAlert;
    if (action === 'acknowledge') {
      updatedAlert = await executiveDashboardService.acknowledgeAlert(alertId);
    } else if (action === 'resolve') {
      updatedAlert = await executiveDashboardService.resolveAlert(alertId);
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: `Alert ${action}d successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to ${(await request.json()).action} alert`,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
