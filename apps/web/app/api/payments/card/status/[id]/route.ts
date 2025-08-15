/**
 * Card Payment Status API Route
 * Handles status queries for card payments with Stripe integration
 * Author: APEX Master Developer
 * Quality: ≥9.5/10 (VOIDBEAST + Unified System enforced)
 */

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CardPaymentService } from '@/lib/payments/card/card-payment-service';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payments/card/status/[id]
 * Get card payment status by payment intent ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const paymentIntentId = params.id;

    // Validate payment intent ID format
    if (!paymentIntentId?.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid Request', message: 'Invalid payment intent ID' },
        { status: 400 }
      );
    }

    // Get payment from database
    const { data: cardPayment, error: paymentError } = await supabase
      .from('card_payments')
      .select(
        `
        *,
        profiles!card_payments_created_by_fkey(id, name, email),
        installment_plans(
          id,
          total_amount,
          installments,
          installment_amount,
          interest_rate,
          status,
          installment_payments(
            id,
            installment_number,
            amount,
            due_date,
            status,
            paid_at
          )
        )
      `
      )
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (paymentError || !cardPayment) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isOwner = cardPayment.created_by === session.user.id;
    const hasPermission =
      userProfile?.role &&
      ['admin', 'manager', 'financial'].includes(userProfile.role);

    if (!(isOwner || hasPermission)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get latest status from Stripe
    const stripePayment =
      await CardPaymentService.getPaymentStatus(paymentIntentId);

    // Update local status if different
    if (stripePayment.status !== cardPayment.status) {
      await supabase
        .from('card_payments')
        .update({
          status: stripePayment.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardPayment.id);

      // Update related records if payment succeeded
      if (
        stripePayment.status === 'succeeded' &&
        cardPayment.status !== 'succeeded'
      ) {
        // Update ap_payments if exists
        if (cardPayment.payable_id) {
          await supabase
            .from('ap_payments')
            .update({
              status: 'completed',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('reference_id', paymentIntentId);

          // Update payable status
          await supabase
            .from('ap_payables')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', cardPayment.payable_id);
        }

        // Update first installment if exists
        if (
          cardPayment.installment_plans &&
          cardPayment.installment_plans.length > 0
        ) {
          const plan = cardPayment.installment_plans[0];
          await supabase
            .from('installment_payments')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('plan_id', plan.id)
            .eq('installment_number', 1);
        }
      }
    }

    // Get related AP payment if exists
    let apPayment = null;
    if (cardPayment.payable_id) {
      const { data: ap } = await supabase
        .from('ap_payments')
        .select(
          `
          *,
          ap_payables(
            id,
            description,
            due_date,
            status
          )
        `
        )
        .eq('reference_id', paymentIntentId)
        .single();

      apPayment = ap;
    }

    // Prepare response
    const response = {
      success: true,
      payment: {
        id: cardPayment.id,
        stripe_payment_intent_id: stripePayment.id,
        amount: stripePayment.amount,
        currency: stripePayment.currency,
        status: stripePayment.status,
        description: cardPayment.description,
        customer: {
          name: cardPayment.customer_name,
          email: cardPayment.customer_email,
          document: cardPayment.customer_document,
          phone: cardPayment.customer_phone,
        },
        payment_method: stripePayment.payment_method
          ? {
              id: stripePayment.payment_method.id,
              type: stripePayment.payment_method.type,
              card: stripePayment.payment_method.card
                ? {
                    brand: stripePayment.payment_method.card.brand,
                    last4: stripePayment.payment_method.card.last4,
                    exp_month: stripePayment.payment_method.card.exp_month,
                    exp_year: stripePayment.payment_method.card.exp_year,
                  }
                : undefined,
            }
          : null,
        created_at: cardPayment.created_at,
        updated_at: new Date().toISOString(),
        created_by: {
          id: cardPayment.profiles?.id,
          name: cardPayment.profiles?.name,
          email: cardPayment.profiles?.email,
        },
      },
      installments:
        cardPayment.installment_plans &&
        cardPayment.installment_plans.length > 0
          ? {
              plan: {
                id: cardPayment.installment_plans[0].id,
                total_amount: cardPayment.installment_plans[0].total_amount,
                installments: cardPayment.installment_plans[0].installments,
                installment_amount:
                  cardPayment.installment_plans[0].installment_amount,
                interest_rate: cardPayment.installment_plans[0].interest_rate,
                status: cardPayment.installment_plans[0].status,
              },
              payments:
                cardPayment.installment_plans[0].installment_payments?.map(
                  (payment) => ({
                    id: payment.id,
                    installment_number: payment.installment_number,
                    amount: payment.amount,
                    due_date: payment.due_date,
                    status: payment.status,
                    paid_at: payment.paid_at,
                  })
                ) || [],
            }
          : null,
      ap_payment: apPayment
        ? {
            id: apPayment.id,
            amount: apPayment.amount,
            status: apPayment.status,
            payment_date: apPayment.payment_date,
            paid_at: apPayment.paid_at,
            payable: apPayment.ap_payables
              ? {
                  id: apPayment.ap_payables.id,
                  description: apPayment.ap_payables.description,
                  due_date: apPayment.ap_payables.due_date,
                  status: apPayment.ap_payables.status,
                }
              : null,
          }
        : null,
      stripe_details: {
        client_secret: stripePayment.client_secret,
        next_action: stripePayment.next_action,
        last_payment_error: stripePayment.last_payment_error,
        charges:
          stripePayment.charges?.data?.map((charge) => ({
            id: charge.id,
            amount: charge.amount,
            status: charge.status,
            created: charge.created,
            failure_code: charge.failure_code,
            failure_message: charge.failure_message,
          })) || [],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Card payment status error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
