// =====================================================================================
// NeonPro Individual Alert Actions API
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// =====================================================================================
// MARK ALERT AS READ
// =====================================================================================

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alertId = params.id;

    // Verify alert exists and update
    const { data: alert, error } = await supabase
      .from('inventory_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: user.id,
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to mark alert as read' },
        { status: 500 },
      );
    }

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Alert marked as read',
      alert: {
        id: alert.id,
        is_read: alert.is_read,
        read_at: alert.read_at,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// =====================================================================================
// DELETE ALERT
// =====================================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alertId = params.id;

    // Verify alert exists and delete
    const { error } = await supabase
      .from('inventory_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Alert deleted successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
