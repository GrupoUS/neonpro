// NeonPro - Stripe Installments Webhook
// Story 6.1 - Task 3: Installment Management System
// Webhook handler for Stripe installment payment events

import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getInstallmentProcessor } from '@/lib/payments/installments/installment-processor';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/webhooks/stripe/installments
 * Handle Stripe webhook events for installment payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (_err) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Get installment processor
    const installmentProcessor = getInstallmentProcessor();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(
          event.data.object as Stripe.PaymentMethod
        );
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
    }

    // Use the installment processor's webhook handler
    await installmentProcessor.handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
    const installmentId = paymentIntent.metadata.installment_id;
    const _paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const _customerId = paymentIntent.metadata.customer_id;
    const _lateFee = Number.parseFloat(paymentIntent.metadata.late_fee || '0');

    if (!installmentId) {
      return;
    }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const installmentId = paymentIntent.metadata.installment_id;
    const _paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const _customerId = paymentIntent.metadata.customer_id;
    const _errorMessage =
      paymentIntent.last_payment_error?.message || 'Payment failed';

    if (!installmentId) {
      return;
    }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent
) {
    const installmentId = paymentIntent.metadata.installment_id;
    const _paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const _customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      return;
    }
}

/**
 * Handle payment intent that requires action
 */
async function handlePaymentIntentRequiresAction(
  paymentIntent: Stripe.PaymentIntent
) {
    const installmentId = paymentIntent.metadata.installment_id;
    const _paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const _customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      return;
    }
}

/**
 * Handle payment intent processing
 */
async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent
) {
    const installmentId = paymentIntent.metadata.installment_id;
    const _paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const _customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      return;
    }
}

/**
 * Handle payment method attached to customer
 */
async function handlePaymentMethodAttached(
  _paymentMethod: Stripe.PaymentMethod
) {
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
    if (customer.deleted) {
      return;
    }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const installmentId = invoice.metadata?.installment_id;
    const _paymentPlanId = invoice.metadata?.payment_plan_id;

    // If this invoice is related to an installment, handle accordingly
    if (installmentId) {
    }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const installmentId = invoice.metadata?.installment_id;
    const _paymentPlanId = invoice.metadata?.payment_plan_id;

    // If this invoice is related to an installment, handle accordingly
    if (installmentId) {
      // TODO: Implement retry logic or escalation
    }
}

// Export for testing
export {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handlePaymentIntentCanceled,
  handlePaymentIntentRequiresAction,
  handlePaymentIntentProcessing,
  handlePaymentMethodAttached,
  handleCustomerUpdated,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
};
