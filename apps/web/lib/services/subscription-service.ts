import type Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';
import { NEONPRO_PLANS, type PlanId } from '@/lib/constants/plans';
import { stripe } from '@/lib/stripe';

// Subscription service class
export class SubscriptionService {
  private supabase: any;

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  // Create a checkout session for subscription
  async createCheckoutSession(
    planId: PlanId,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const plan = NEONPRO_PLANS[planId];

    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
      locale: 'pt-BR',
      currency: 'brl',
      payment_method_types: ['card', 'boleto'],
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    return session;
  }

  // Create a billing portal session
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      locale: 'pt-BR',
    });

    return session;
  }

  // Get customer's active subscription
  async getActiveSubscription(
    customerId: string
  ): Promise<Stripe.Subscription | null> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      return subscriptions.data[0] || null;
    } catch (_error) {
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  }

  // Reactivate subscription
  async reactivateSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  }

  // Update user subscription in database
  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      planId?: string;
      status?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
    }
  ): Promise<void> {
    const supabase = await this.getSupabaseClient();

    const { error } = await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: subscriptionData.stripeCustomerId,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId,
      plan_id: subscriptionData.planId,
      status: subscriptionData.status,
      current_period_start: subscriptionData.currentPeriodStart?.toISOString(),
      current_period_end: subscriptionData.currentPeriodEnd?.toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
  }

  // Get user subscription from database
  async getUserSubscription(userId: string): Promise<any> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        return false;
      }

      return (
        subscription.status === 'active' &&
        new Date(subscription.current_period_end) > new Date()
      );
    } catch (_error) {
      return false;
    }
  }

  // Get plan by ID
  getPlan(planId: PlanId) {
    return NEONPRO_PLANS[planId];
  }

  // Get all plans
  getAllPlans() {
    return Object.values(NEONPRO_PLANS);
  }

  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price / 100);
  }
}

// Webhook handler for Stripe events
export class StripeWebhookHandler {
  private readonly subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    let event: Stripe.Event;
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    try {
      const userId = session.metadata?.userId;

      if (!userId) {
        return;
      }

      // Get the subscription
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await this.subscriptionService.updateUserSubscription(userId, {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        planId: session.metadata?.planId,
        status: subscription.status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      });
    } catch (_error) {}
  }

  private async handleSubscriptionChange(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;

      if (!userId) {
        return;
      }

      await this.subscriptionService.updateUserSubscription(userId, {
        status: subscription.status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      });
    } catch (_error) {}
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;

      if (!userId) {
        return;
      }

      await this.subscriptionService.updateUserSubscription(userId, {
        status: 'canceled',
      });
    } catch (_error) {}
  }

  private async handlePaymentSucceeded(
    _invoice: Stripe.Invoice
  ): Promise<void> {
    // Here you could send a payment confirmation email
  }

  private async handlePaymentFailed(_invoice: Stripe.Invoice): Promise<void> {
    // Here you could send a payment failure notification
  }
}

export default SubscriptionService;
