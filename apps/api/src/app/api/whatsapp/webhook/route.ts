/**
 * WhatsApp Webhook Handler
 *
 * Handles WhatsApp Business API webhooks for delivery status updates
 * and patient message responses with LGPD compliance.
 */

import { NextRequest } from 'next/server';
import { logger } from '@/utils/secure-logger';
import { createHealthcareResponse } from '../../../../middleware/edge-runtime';
import { whatsappReminderService } from '../../../../services/whatsapp-reminder-service';

// Configure for edge runtime
export const runtime = 'edge';

/**
 * Handle WhatsApp webhook verification (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verify webhook token
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('WhatsApp webhook verified successfully');
      return new Response(challenge, { status: 200 });
    } else {
      logger.error('WhatsApp webhook verification failed');
      return new Response('Verification failed', { status: 403 });
    }
  } catch (error) {
    logger.error('WhatsApp webhook verification error', error);
    return createHealthcareResponse(
      {
        error: 'Webhook verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        dataType: 'public',
      },
    );
  }
}

/**
 * Handle WhatsApp webhook notifications (POST)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const webhookData = await request.json();

    logger.info('WhatsApp webhook received', {
      webhookData: JSON.stringify(webhookData, null, 2)
    });

    // Process webhook data
    const result = await whatsappReminderService.handleWebhook(webhookData);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        success: result.success,
        processed: result.processed,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: result.success ? 200 : 500,
        dataType: 'public',
      },
    );
  } catch (error) {
    logger.error('WhatsApp webhook processing error', error);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        dataType: 'public',
      },
    );
  }
}

export async function OPTIONS() {
  return createHealthcareResponse(
    {},
    {
      status: 200,
      dataType: 'public',
    },
  );
}
