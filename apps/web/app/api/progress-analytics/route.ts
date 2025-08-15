// Story 10.2: Progress Tracking through Computer Vision - Analytics API
// API endpoint for progress tracking analytics and dashboard data

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';

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
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const patientId = searchParams.get('patient_id') || undefined;
    const treatmentType = searchParams.get('treatment_type') || undefined;

    switch (type) {
      case 'dashboard_stats': {
        const stats =
          await progressTrackingService.getProgressDashboardStats(patientId);
        return NextResponse.json(stats);
      }

      case 'trend_data': {
        if (!patientId) {
          return NextResponse.json(
            { error: 'patient_id is required for trend data' },
            { status: 400 }
          );
        }
        const trendData = await progressTrackingService.getProgressTrendData(
          patientId,
          treatmentType
        );
        return NextResponse.json(trendData);
      }

      case 'multi_session_analysis': {
        const analyses =
          await progressTrackingService.getMultiSessionAnalyses(patientId);
        return NextResponse.json(analyses);
      }

      default:
        return NextResponse.json(
          {
            error:
              'Invalid analytics type. Use: dashboard_stats, trend_data, or multi_session_analysis',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
