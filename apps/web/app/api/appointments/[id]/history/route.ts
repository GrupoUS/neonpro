// app/api/appointments/[id]/history/route.ts
// API route for appointment history and audit trail
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

import { type NextRequest, NextResponse } from 'next/server';
import type { AppointmentHistoryResponse } from '@/app/lib/types/appointments';
import { createClient } from '@/app/utils/supabase/server';

/**
 * GET /api/appointments/[id]/history
 * Fetch appointment history and audit trail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error_message: 'Authentication required' },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    // Fetch appointment history with user details
    const {
      data: history,
      error,
      count,
    } = await supabase
      .from('appointment_history')
      .select(
        `
        id,
        appointment_id,
        action,
        changed_fields,
        old_values,
        new_values,
        change_reason,
        changed_by,
        created_at,
        changed_by_user:profiles!appointment_history_changed_by_fkey(full_name)
      `,
        { count: 'exact' },
      )
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Transform data to include changed_by_name
    const transformedHistory = (history || []).map((entry) => ({
      ...entry,
      changed_by_name: entry.changed_by_user?.full_name || 'Unknown User',
    }));

    const response: AppointmentHistoryResponse = {
      success: true,
      data: transformedHistory,
      total_count: count || 0,
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { success: false, error_message: 'Internal server error' },
      { status: 500 },
    );
  }
}
