// API endpoint for retention dashboard summary
// Story 7.4: Advanced patient retention analytics with predictive modeling

import { NextRequest, NextResponse } from 'next/server';
import { RetentionService } from '../../../lib/services/retention';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');

    const dashboardSummary = await RetentionService.getDashboardSummary();

    return NextResponse.json({
      success: true,
      data: dashboardSummary
    });
  } catch (error) {
    console.error('Error in retention dashboard GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch retention dashboard summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

