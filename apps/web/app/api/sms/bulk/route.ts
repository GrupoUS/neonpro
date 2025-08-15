// SMS Bulk Send API for NeonPro
// Send bulk SMS messages with rate limiting and batch processing

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { smsService } from '@/app/lib/services/sms-service';
import { BulkSMSSchema } from '@/app/types/sms';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = BulkSMSSchema.parse(body);

    // Validate bulk sending limits
    if (validatedData.messages.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BULK_LIMIT_EXCEEDED',
            message: 'Maximum 1000 messages allowed per bulk request',
          },
        },
        { status: 400 }
      );
    }

    // Send bulk SMS messages
    const result = await smsService.sendBulkMessages({
      provider_id: validatedData.provider_id,
      messages: validatedData.messages,
      template_id: validatedData.template_id,
      scheduled_at: validatedData.scheduled_at,
      batch_size: validatedData.batch_size,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `bulk_${Date.now()}`,
          user_id: session.user.id,
          total_recipients: validatedData.messages.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('SMS bulk send error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle SMS service errors
    if (error && typeof error === 'object' && 'code' in error) {
      const statusCode = getStatusCodeForError(error.code as string);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message || 'SMS service error',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
          },
        },
        { status: statusCode }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Get bulk sending status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch_id');
    const timeframe = searchParams.get('timeframe') || '24h';

    if (batchId) {
      // Get specific batch status
      const { data, error } = await supabase
        .from('sms_bulk_batches')
        .select(`
          *,
          sms_messages(count)
        `)
        .eq('batch_id', batchId)
        .single();

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BATCH_NOT_FOUND',
              message: 'Bulk batch not found',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data,
          metadata: {
            timestamp: new Date().toISOString(),
            request_id: `batch_status_${Date.now()}`,
          },
        },
        { status: 200 }
      );
    }
    // Get bulk sending statistics
    const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 24;
    const startDate = new Date(
      Date.now() - hoursBack * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('sms_bulk_batches')
      .select(`
          *,
          sms_messages(
            status,
            cost,
            created_at
          )
        `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const stats = {
      total_batches: data?.length || 0,
      total_messages:
        data?.reduce(
          (sum, batch) => sum + (batch.sms_messages?.length || 0),
          0
        ) || 0,
      total_cost:
        data?.reduce(
          (sum, batch) =>
            sum +
            (batch.sms_messages?.reduce(
              (msgSum: number, msg: any) => msgSum + (msg.cost || 0),
              0
            ) || 0),
          0
        ) || 0,
      status_breakdown:
        data?.reduce(
          (acc, batch) => {
            batch.sms_messages?.forEach((msg: any) => {
              acc[msg.status] = (acc[msg.status] || 0) + 1;
            });
            return acc;
          },
          {} as Record<string, number>
        ) || {},
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          batches: data || [],
          statistics: stats,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `bulk_stats_${Date.now()}`,
          timeframe,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('SMS bulk status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch bulk SMS status',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Get appropriate HTTP status code for SMS error
 */
function getStatusCodeForError(errorCode: string): number {
  switch (errorCode) {
    case 'INVALID_PHONE':
    case 'INVALID_MESSAGE':
    case 'BULK_LIMIT_EXCEEDED':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'RATE_LIMIT':
      return 429;
    case 'INSUFFICIENT_BALANCE':
      return 402;
    case 'OPT_OUT':
    case 'BLACKLISTED':
      return 403;
    default:
      return 500;
  }
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST and GET methods are allowed',
      },
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST and GET methods are allowed',
      },
    },
    { status: 405 }
  );
}
