// WhatsApp Business API Webhook Handler
// Handles webhook events from Meta's WhatsApp Cloud API
// Used for message status updates and incoming messages

import { NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/app/lib/services/whatsapp-service';
import { createClient } from '@/lib/supabase/server';

// Webhook verification (required by Meta)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('WhatsApp webhook verification request:', { mode, token, challenge });

    if (mode === 'subscribe') {
      // Get the verify token from the database
      const supabase = await createClient();
      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('webhook_verify_token')
        .single();

      if (!config?.webhook_verify_token) {
        console.error('No webhook verify token configured');
        return NextResponse.json(
          { error: 'Webhook verify token not configured' },
          { status: 400 }
        );
      }

      if (token === config.webhook_verify_token) {
        console.log('Webhook verification successful');
        return new NextResponse(challenge, { status: 200 });
      } else {
        console.error('Invalid webhook verify token');
        return NextResponse.json(
          { error: 'Invalid verify token' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid verification request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
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
    console.log('WhatsApp webhook payload received:', JSON.stringify(payload, null, 2));

    // Verify the webhook payload structure
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      console.error('Invalid webhook object type:', payload.object);
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }

    if (!payload.entry || !Array.isArray(payload.entry)) {
      console.error('Invalid webhook entry structure');
      return NextResponse.json(
        { error: 'Invalid webhook entry' },
        { status: 400 }
      );
    }

    // Process the webhook payload
    await whatsAppService.handleWebhook(payload);

    // Log webhook event for debugging
    await logWebhookEvent(payload);

    console.log('Webhook processed successfully');
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log the error for debugging
    await logWebhookError(error instanceof Error ? error.message : 'Unknown error');
    
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
    
    const { error } = await supabase
      .from('whatsapp_webhook_logs')
      .insert({
        event_type: 'webhook_received',
        payload: payload,
        status: 'success',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    }
  } catch (error) {
    console.error('Database error logging webhook event:', error);
  }
}

// Helper function to log webhook errors
async function logWebhookError(errorMessage: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('whatsapp_webhook_logs')
      .insert({
        event_type: 'webhook_error',
        payload: { error: errorMessage },
        status: 'error',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging webhook error:', error);
    }
  } catch (error) {
    console.error('Database error logging webhook error:', error);
  }
}
