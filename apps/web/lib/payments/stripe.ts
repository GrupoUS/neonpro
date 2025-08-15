import { loadStripe, type Stripe as StripeInstance } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<StripeInstance | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd' as const,
  payment_method_types: ['card'] as const,
  billing_address_collection: 'auto' as const,
  shipping_address_collection: {
    allowed_countries: ['US', 'BR', 'CA', 'GB', 'AU'] as const,
  },
  automatic_tax: {
    enabled: false,
  },
} as const;

// Payment status types
export type PaymentStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action';

export type PaymentIntentData = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  client_secret: string | null;
  metadata: Record<string, string>;
  created: number;
};
