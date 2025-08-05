import { NextRequest, NextResponse } from 'next/server';
import { StripeWebhookHandler } from '@/lib/services/subscription-service';

// Disable body parser for webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Handle the webhook
    const webhookHandler = new StripeWebhookHandler();
    await webhookHandler.handleWebhook(body, signature);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        message: error.message 
      },
      { status: 400 }
    );
  }
}
