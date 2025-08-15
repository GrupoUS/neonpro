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
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Use the installment processor's webhook handler
    await installmentProcessor.handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
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
  try {
    const installmentId = paymentIntent.metadata.installment_id;
    const paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const customerId = paymentIntent.metadata.customer_id;
    const lateFee = Number.parseFloat(paymentIntent.metadata.late_fee || '0');

    if (!installmentId) {
      console.warn(
        'Payment intent succeeded but no installment_id in metadata'
      );
      return;
    }

    console.log(`Payment succeeded for installment ${installmentId}`);

    // The installment processor will handle marking as paid
    // Additional business logic can be added here

    // Log the successful payment
    console.log({
      event: 'installment_payment_succeeded',
      installmentId,
      paymentPlanId,
      customerId,
      amount: paymentIntent.amount / 100, // Convert from cents
      lateFee,
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const installmentId = paymentIntent.metadata.installment_id;
    const paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const customerId = paymentIntent.metadata.customer_id;
    const errorMessage =
      paymentIntent.last_payment_error?.message || 'Payment failed';

    if (!installmentId) {
      console.warn('Payment intent failed but no installment_id in metadata');
      return;
    }

    console.log(
      `Payment failed for installment ${installmentId}: ${errorMessage}`
    );

    // Log the failed payment
    console.log({
      event: 'installment_payment_failed',
      installmentId,
      paymentPlanId,
      customerId,
      amount: paymentIntent.amount / 100,
      error: errorMessage,
      errorCode: paymentIntent.last_payment_error?.code,
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement retry logic or notification system
    // This could trigger:
    // - Automatic retry after a delay
    // - Customer notification
    // - Escalation to collections
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const installmentId = paymentIntent.metadata.installment_id;
    const paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      console.warn('Payment intent canceled but no installment_id in metadata');
      return;
    }

    console.log(`Payment canceled for installment ${installmentId}`);

    // Log the canceled payment
    console.log({
      event: 'installment_payment_canceled',
      installmentId,
      paymentPlanId,
      customerId,
      amount: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling payment intent canceled:', error);
    throw error;
  }
}

/**
 * Handle payment intent that requires action
 */
async function handlePaymentIntentRequiresAction(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const installmentId = paymentIntent.metadata.installment_id;
    const paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      console.warn(
        'Payment intent requires action but no installment_id in metadata'
      );
      return;
    }

    console.log(`Payment requires action for installment ${installmentId}`);

    // Log the action required
    console.log({
      event: 'installment_payment_requires_action',
      installmentId,
      paymentPlanId,
      customerId,
      amount: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      nextAction: paymentIntent.next_action?.type,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement customer notification for required action
    // This could trigger:
    // - Email with payment link
    // - SMS notification
    // - In-app notification
  } catch (error) {
    console.error('Error handling payment intent requires action:', error);
    throw error;
  }
}

/**
 * Handle payment intent processing
 */
async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const installmentId = paymentIntent.metadata.installment_id;
    const paymentPlanId = paymentIntent.metadata.payment_plan_id;
    const customerId = paymentIntent.metadata.customer_id;

    if (!installmentId) {
      console.warn(
        'Payment intent processing but no installment_id in metadata'
      );
      return;
    }

    console.log(`Payment processing for installment ${installmentId}`);

    // Log the processing status
    console.log({
      event: 'installment_payment_processing',
      installmentId,
      paymentPlanId,
      customerId,
      amount: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling payment intent processing:', error);
    throw error;
  }
}

/**
 * Handle payment method attached to customer
 */
async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod
) {
  try {
    console.log(
      `Payment method ${paymentMethod.id} attached to customer ${paymentMethod.customer}`
    );

    // Log the payment method attachment
    console.log({
      event: 'payment_method_attached',
      paymentMethodId: paymentMethod.id,
      customerId: paymentMethod.customer,
      type: paymentMethod.type,
      card: paymentMethod.card
        ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
          }
        : null,
      timestamp: new Date().toISOString(),
    });

    // TODO: Update customer payment methods in database if needed
  } catch (error) {
    console.error('Error handling payment method attached:', error);
    throw error;
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    if (customer.deleted) {
      console.log(`Customer ${customer.id} was deleted`);
      return;
    }

    console.log(`Customer ${customer.id} was updated`);

    // Log the customer update
    console.log({
      event: 'customer_updated',
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      timestamp: new Date().toISOString(),
    });

    // TODO: Sync customer data with local database if needed
  } catch (error) {
    console.error('Error handling customer updated:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const installmentId = invoice.metadata?.installment_id;
    const paymentPlanId = invoice.metadata?.payment_plan_id;

    console.log(`Invoice payment succeeded: ${invoice.id}`);

    // Log the invoice payment
    console.log({
      event: 'invoice_payment_succeeded',
      invoiceId: invoice.id,
      installmentId,
      paymentPlanId,
      customerId: invoice.customer,
      amount: invoice.amount_paid / 100,
      timestamp: new Date().toISOString(),
    });

    // If this invoice is related to an installment, handle accordingly
    if (installmentId) {
      // The payment intent handler will take care of marking as paid
      console.log(`Invoice payment for installment ${installmentId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const installmentId = invoice.metadata?.installment_id;
    const paymentPlanId = invoice.metadata?.payment_plan_id;

    console.log(`Invoice payment failed: ${invoice.id}`);

    // Log the invoice payment failure
    console.log({
      event: 'invoice_payment_failed',
      invoiceId: invoice.id,
      installmentId,
      paymentPlanId,
      customerId: invoice.customer,
      amount: invoice.amount_due / 100,
      timestamp: new Date().toISOString(),
    });

    // If this invoice is related to an installment, handle accordingly
    if (installmentId) {
      console.log(`Invoice payment failed for installment ${installmentId}`);
      // TODO: Implement retry logic or escalation
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
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
