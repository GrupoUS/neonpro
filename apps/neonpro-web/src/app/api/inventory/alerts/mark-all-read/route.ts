// =====================================================================================
// NeonPro Mark All Alerts as Read API
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// =====================================================================================
// MARK ALL ALERTS AS READ
// =====================================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark all unread alerts as read
    const { data: alerts, error } = await supabase
      .from('inventory_alerts')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: user.id
      })
      .eq('is_read', false)
      .select('id');

    if (error) {
      console.error('Error marking all alerts as read:', error);
      return NextResponse.json({ error: 'Failed to mark alerts as read' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'All alerts marked as read',
      updated_count: alerts?.length || 0
    });

  } catch (error) {
    console.error('Error in mark-all-read API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
