/**
 * ANVISA Adverse Events API Route
 * Handles adverse event reporting, tracking, and ANVISA notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI, ANVISAAdverseEventSchema } from '@/lib/api/anvisa';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const pendingNotifications = searchParams.get('pending_notifications');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Handle different query types
    if (pendingNotifications === 'true') {
      const notifications =
        await anvisaAPI.getPendingANVISANotifications(clinicId);
      return NextResponse.json({
        success: true,
        data: notifications,
        meta: { type: 'pending_notifications', total: notifications.length },
      });
    }

    const events = await anvisaAPI.getAdverseEvents(clinicId);
    return NextResponse.json({
      success: true,
      data: events,
      meta: { total: events.length },
    });
  } catch (error) {
    console.error('Error in ANVISA adverse events GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adverse events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clinic_id, ...eventData } = body;

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Validate event data
    const validationResult = ANVISAAdverseEventSchema.safeParse(eventData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const event = await anvisaAPI.createAdverseEvent(
      clinic_id,
      validationResult.data
    );

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: 'Adverse event reported successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ANVISA adverse events POST:', error);
    return NextResponse.json(
      { error: 'Failed to create adverse event' },
      { status: 500 }
    );
  }
}
