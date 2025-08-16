// Follow-up Dashboard Stats API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

export async function GET(_request: NextRequest) {
  try {
    const stats = await treatmentFollowupService.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
