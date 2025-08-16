// WhatsApp Business API Webhook Handler
// Handles webhook events from Meta's WhatsApp Cloud API
// Used for message status updates and incoming messages

import { type NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/app/lib/services/whatsapp-service';
import { createClient } from '@/app/utils/supabase/server';

// Webhook verification (required by Meta)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe') {
      // Get the verify token from the database
      const supabase = await createClient();
      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('webhook_verify_token')
        .single();

      if (!config?.webhook_verify_token) {
        return NextResponse.json(
          { error: 'Webhook verify token not configured' },
          { status: 400 }
        );
      }

      if (token === config.webhook_verify_token) {
        return new NextResponse(challenge, { status: 200 });
      }
      return NextResponse.json(
        { error: 'Invalid verify token' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid verification request' },
      { status: 400 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook event handler
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify the webhook payload structure
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }

    if (!(payload.entry && Array.isArray(payload.entry))) {
      return NextResponse.json(
        { error: 'Invalid webhook entry' },
        { status: 400 }
      );
    }

    // Process the webhook payload
    await whatsAppService.handleWebhook(payload);

    // Log webhook event for debugging
    await logWebhookEvent(payload);
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    await logWebhookError(
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to log webhook events
async function logWebhookEvent(payload: any): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('whatsapp_webhook_logs').insert({
      event_type: 'webhook_received',
      payload,
      status: 'success',
      created_at: new Date().toISOString(),
    });

    if (error) {
    }
  } catch (_error) {}
}

// Helper function to log webhook errors
async function logWebhookError(errorMessage: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('whatsapp_webhook_logs').insert({
      event_type: 'webhook_error',
      payload: { error: errorMessage },
      status: 'error',
      created_at: new Date().toISOString(),
    });

    if (error) {
    }
  } catch (_error) {}
}
