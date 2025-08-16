import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { STRIPE_CONFIG, stripe } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = STRIPE_CONFIG.currency,
      invoiceId,
      patientId,
      metadata = {},
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 },
      );
    }

    // Validate user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        invoiceId: invoiceId || '',
        patientId: patientId || '',
        ...metadata,
      },
      description: `NeonPro Invoice Payment - ${invoiceId || 'N/A'}`,
    });

    // Update invoice status in database if invoiceId provided
    if (invoiceId) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          payment_intent_id: paymentIntent.id,
          status: 'pending_payment',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (updateError) {
        // Continue anyway - payment intent created successfully
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID required' },
        { status: 400 },
      );
    }

    // Validate user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify ownership through metadata
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to payment intent' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back from cents
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
