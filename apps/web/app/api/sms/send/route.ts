// SMS Send Message API for NeonPro
// Send individual SMS messages

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { smsService } from '@/app/lib/services/sms-service';
import { SendSMSSchema } from '@/app/types/sms';
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
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = SendSMSSchema.parse(body);

    // Send SMS message
    const result = await smsService.sendMessage({
      provider_id: validatedData.provider_id,
      to: validatedData.to,
      body: validatedData.body,
      template_id: validatedData.template_id,
      variables: validatedData.variables,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `send_${Date.now()}`,
          user_id: session.user.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
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
        { status: 400 },
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
        { status: statusCode },
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
      { status: 500 },
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
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    },
    { status: 405 },
  );
}
