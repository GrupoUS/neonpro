// Follow-up Analytics API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { createtreatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      period_type: (searchParams.get('period_type') as 'daily' | 'weekly' | 'monthly') || 'daily',
      protocol_id: searchParams.get('protocol_id') || undefined
    };

    const analytics = await createtreatmentFollowupService().getPerformanceAnalytics(filters);

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching follow-up analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch follow-up analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
