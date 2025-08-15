import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

/**
 * Get Patient Medical Timeline
 * Retrieves chronological medical history for a patient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { id: patientId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const eventType = searchParams.get('event_type');

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!(userRole && ['admin', 'doctor', 'nurse'].includes(userRole.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('medical_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by event type if specified
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: timeline, error: timelineError } = await query;

    if (timelineError) {
      console.error('Error fetching medical timeline:', timelineError);
      return NextResponse.json(
        { error: 'Failed to fetch medical timeline' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('medical_timeline')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patientId);

    if (eventType) {
      countQuery = countQuery.eq('event_type', eventType);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      timeline,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
      message: 'Medical timeline retrieved successfully',
    });
  } catch (error) {
    console.error('Error in GET /api/patients/[id]/timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Add Timeline Event
 * Adds a new event to the patient's medical timeline
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { id: patientId } = await params;
    const body = await request.json();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!(userRole && ['admin', 'doctor', 'nurse'].includes(userRole.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const {
      event_type,
      event_date,
      description,
      event_details,
      outcome_score,
      notes,
      provider_id,
    } = body;

    // Validate required fields
    if (!(event_type && event_date && description)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timeline event
    const { data: newEvent, error: insertError } = await supabase
      .from('medical_timeline')
      .insert({
        patient_id: patientId,
        event_type,
        event_date,
        description,
        event_details: event_details || {},
        outcome_score,
        notes,
        provider_id,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding timeline event:', insertError);
      return NextResponse.json(
        { error: 'Failed to add timeline event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      event: newEvent,
      message: 'Timeline event added successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/patients/[id]/timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
