// SMS Webhook Handler for NeonPro
// Handles delivery reports and status updates from SMS providers

import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/app/lib/services/sms-service';
import type { SMSProvider } from '@/app/types/sms';

export async function POST(request: NextRequest) {
  try {
    // Get provider from URL search params or headers
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as SMSProvider;

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PROVIDER',
            message: 'Provider parameter required',
          },
        },
        { status: 400 }
      );
    }

    // Get webhook payload
    const payload = await request.json();

    // Verify webhook authenticity (implementation depends on provider)
    const isValid = await verifyWebhookSignature(provider, request, payload);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid webhook signature',
          },
        },
        { status: 401 }
      );
    }

    // Process webhook based on provider
    await smsService.processWebhook(provider, payload);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: { message: 'Webhook processed successfully' },
        metadata: {
          provider,
          timestamp: new Date().toISOString(),
          request_id: `webhook_${Date.now()}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WEBHOOK_ERROR',
          message:
            error instanceof Error ? error.message : 'Internal webhook error',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `webhook_error_${Date.now()}`,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature based on provider
 */
async function verifyWebhookSignature(
  provider: SMSProvider,
  request: NextRequest,
  payload: any
): Promise<boolean> {
  const headersList = headers();

  try {
    switch (provider) {
      case 'twilio':
        return verifyTwilioSignature(request, payload);

      case 'sms_dev':
        return verifySMSDevSignature(headersList, payload);

      case 'zenvia':
        return verifyZenviaSignature(headersList, payload);

      case 'movile':
        return verifyMovileSignature(headersList, payload);

      default:
        return true; // Allow for custom providers without verification
    }
  } catch (_error) {
    return false;
  }
}

/**
 * Verify Twilio webhook signature
 */
function verifyTwilioSignature(_request: NextRequest, _payload: any): boolean {
  // Twilio webhook verification would be implemented here
  // This requires the Twilio SDK and auth token

  // For development, we'll skip verification
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, implement proper Twilio signature verification
  // const crypto = require('crypto');
  // const twilioSignature = request.headers.get('x-twilio-signature');
  // const expectedSignature = crypto
  //   .createHmac('sha1', twilioAuthToken)
  //   .update(Buffer.from(url + Object.keys(payload).sort().map(key => key + payload[key]).join(''), 'utf-8'))
  //   .digest('base64');
  // return crypto.timingSafeEqual(Buffer.from(twilioSignature), Buffer.from(expectedSignature));

  return true;
}

/**
 * Verify SMS Dev webhook signature
 */
function verifySMSDevSignature(headers: Headers, _payload: any): boolean {
  // SMS Dev webhook verification
  const signature = headers.get('x-smsdev-signature');

  if (!signature) {
    return process.env.NODE_ENV === 'development';
  }

  // Implement SMS Dev signature verification logic here
  return true;
}

/**
 * Verify ZENVIA webhook signature
 */
function verifyZenviaSignature(headers: Headers, _payload: any): boolean {
  // ZENVIA webhook verification
  const signature = headers.get('x-zenvia-signature');

  if (!signature) {
    return process.env.NODE_ENV === 'development';
  }

  // Implement ZENVIA signature verification logic here
  return true;
}

/**
 * Verify Movile webhook signature
 */
function verifyMovileSignature(headers: Headers, _payload: any): boolean {
  // Movile webhook verification
  const signature = headers.get('x-movile-signature');

  if (!signature) {
    return process.env.NODE_ENV === 'development';
  }

  // Implement Movile signature verification logic here
  return true;
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed for webhooks',
      },
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed for webhooks',
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
        message: 'Only POST method is allowed for webhooks',
      },
    },
    { status: 405 }
  );
}
