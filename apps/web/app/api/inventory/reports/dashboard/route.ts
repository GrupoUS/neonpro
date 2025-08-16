import { type NextRequest, NextResponse } from 'next/server';
import { inventoryReportsService } from '@/app/lib/services/inventory-reports-service';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dashboard statistics
    const stats = await inventoryReportsService.getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
