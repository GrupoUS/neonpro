import { createClient } from '@/app/utils/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Subscription plans for NeonPro
export const NEONPRO_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Para clínicas pequenas',
    price: 9900, // R$ 99.00 em centavos
    features: [
      'Até 500 pacientes',
      'Agendamento básico',
      'Controle financeiro simples',
      'Suporte por email'
    ],
    stripePriceId: 'price_starter_monthly', // Será criado no Stripe Dashboard
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    description: 'Para clínicas em crescimento',
    price: 19900, // R$ 199.00 em centavos
    features: [
      'Até 2.000 pacientes',
      'Agendamento avançado',
      'Controle financeiro completo',
      'Relatórios e analytics',
      'Suporte prioritário',
      'Integrações API'
    ],
    stripePriceId: 'price_professional_monthly',
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes clínicas',
    price: 39900, // R$ 399.00 em centavos
    features: [
      'Pacientes ilimitados',
      'Multi-clínicas',
      'Personalização completa',
      'Suporte 24/7',
      'Treinamento dedicado',
      'API completa'
    ],
    stripePriceId: 'price_enterprise_monthly',
  }
} as const;

export type PlanId = keyof typeof NEONPRO_PLANS;

// Subscription service class
export class SubscriptionService {
  private supabase: any;

  constructor() {
    // Initialize Supabase client when needed
  }

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

    try {
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
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create a billing portal session
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
        locale: 'pt-BR',
      });

      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  // Get customer's active subscription
  async getActiveSubscription(customerId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      return subscriptions.data[0] || null;
    } catch (error) {
      console.error('Error getting active subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
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
    try {
      const supabase = await this.getSupabaseClient();
      
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
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
    } catch (error) {
      console.error('Error updating user subscription:', error);
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
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) return false;
      
      return (
        subscription.status === 'active' &&
        new Date(subscription.current_period_end) > new Date()
      );
    } catch (error) {
      console.error('Error checking active subscription:', error);
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
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw err;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error('No userId in checkout session metadata');
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
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      });

      console.log(`Subscription created for user ${userId}`);
    } catch (error) {
      console.error('Error handling checkout completion:', error);
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;
      
      if (!userId) {
        console.error('No userId in subscription metadata');
        return;
      }

      await this.subscriptionService.updateUserSubscription(userId, {
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      });

      console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
    } catch (error) {
      console.error('Error handling subscription change:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;
      
      if (!userId) {
        console.error('No userId in subscription metadata');
        return;
      }

      await this.subscriptionService.updateUserSubscription(userId, {
        status: 'canceled',
      });

      console.log(`Subscription canceled for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription deletion:', error);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Payment succeeded for invoice ${invoice.id}`);
    // Here you could send a payment confirmation email
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Payment failed for invoice ${invoice.id}`);
    // Here you could send a payment failure notification
  }
}

export default SubscriptionService;
