// Message Threads API Route
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// API endpoint for managing message threads and conversations

import { type NextRequest, NextResponse } from 'next/server';
import { communicationService } from '@/lib/services/communication-service';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id') || undefined;
    const includeArchived = searchParams.get('include_archived') === 'true';

    // Get message threads using communication service
    const threads = await communicationService.getMessageThreads(
      patientId,
      includeArchived
    );

    return NextResponse.json({
      success: true,
      data: {
        threads,
        total: threads.length,
      },
    });
  } catch (error) {
    console.error('Error in get threads API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { patient_id, subject, priority = 'normal' } = body;

    // Validate required fields
    if (!(patient_id && subject)) {
      return NextResponse.json(
        { error: 'Patient ID and subject are required' },
        { status: 400 }
      );
    }

    // Create new thread
    const { data: thread, error } = await supabase
      .from('communication_threads')
      .insert({
        patient_id,
        subject,
        status: 'active',
        priority,
        participants: [],
        tags: [],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error('Error in create thread API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
