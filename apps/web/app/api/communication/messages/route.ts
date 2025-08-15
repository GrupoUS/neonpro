// Send Message API Route
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// API endpoint for sending messages through the communication system

import { type NextRequest, NextResponse } from 'next/server';
import { communicationService } from '@/lib/services/communication-service';
import {
  MessageSchema,
  type SendMessageRequest,
} from '@/lib/types/communication';
import { createClient } from '@/utils/supabase/server';

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

    // Parse and validate request body
    const body = await request.json();

    // Validate required fields
    const validation = MessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Prepare send message request
    const sendRequest: SendMessageRequest = {
      thread_id: body.thread_id,
      patient_id: body.patient_id,
      type: body.type,
      channel: body.channel,
      subject: body.subject,
      content: body.content,
      priority: body.priority,
      template_id: body.template_id,
      template_variables: body.template_variables,
      scheduled_at: body.scheduled_at,
    };

    // Send message using communication service
    const result = await communicationService.sendMessage(sendRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send message',
          details: result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in send message API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

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

    const getRequest = {
      thread_id: searchParams.get('thread_id') || undefined,
      patient_id: searchParams.get('patient_id') || undefined,
      channel: (searchParams.get('channel') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      type: (searchParams.get('type') as any) || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      search: searchParams.get('search') || undefined,
      page: Number.parseInt(searchParams.get('page') || '1', 10),
      limit: Number.parseInt(searchParams.get('limit') || '50', 10),
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
    };

    // Get messages using communication service
    const result = await communicationService.getMessages(getRequest);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in get messages API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
