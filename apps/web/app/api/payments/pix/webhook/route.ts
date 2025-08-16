import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { pixIntegration } from '@/lib/payments/gateways/pix-integration';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/payments/pix/webhook
 * Handle PIX payment webhooks from payment provider
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('x-webhook-signature');

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);

    // Process the webhook through PIX integration
    const result = await pixIntegration.handleWebhook(webhookData);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 400 }
      );
    }

    // If payment was confirmed, update related records
    if (result.paymentStatus === 'paid' && result.paymentId) {
      await handlePaymentConfirmation(result.paymentId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) {
    return false;
  }

  const webhookSecret = process.env.PIX_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return false;
  }

  // Implement signature verification based on your PIX provider
  // This is a placeholder - replace with actual verification logic
  const crypto = require('node:crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Handle payment confirmation and update related records
 */
async function handlePaymentConfirmation(pixPaymentId: string) {
  const supabase = createClient();

  try {
    // Get the PIX payment details
    const { data: pixPayment } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('id', pixPaymentId)
      .single();

    if (!pixPayment) {
      return;
    }

    // Update main payment record if linked
    const { data: mainPayment } = await supabase
      .from('ap_payments')
      .select('*')
      .eq('pix_payment_id', pixPaymentId)
      .single();

    if (mainPayment) {
      await supabase
        .from('ap_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', mainPayment.id);

      // Update payable status if fully paid
      const { data: allPayments } = await supabase
        .from('ap_payments')
        .select('amount, status')
        .eq('payable_id', mainPayment.payable_id);

      if (allPayments) {
        const totalPaid = allPayments
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);

        const { data: payable } = await supabase
          .from('ap_payables')
          .select('amount')
          .eq('id', mainPayment.payable_id)
          .single();

        if (payable && totalPaid >= payable.amount) {
          await supabase
            .from('ap_payables')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
            })
            .eq('id', mainPayment.payable_id);
        }
      }
    }

    // Log the payment confirmation
    await supabase.from('audit_logs').insert({
      table_name: 'pix_payments',
      record_id: pixPaymentId,
      action: 'PAYMENT_CONFIRMED',
      old_values: { status: 'pending' },
      new_values: { status: 'paid' },
      user_id: null, // System action
    });
  } catch (_error) {}
}
