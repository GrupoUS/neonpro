import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'brl',
  paymentMethods: ['card', 'pix'] as const,
  locale: 'pt-BR',
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
} as const;

// Payment method types for Brazil
export const BRAZIL_PAYMENT_METHODS = ['card', 'boleto', 'pix'] as const;

// Currency formatter for Brazil
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount / 100); // Stripe uses cents
};

// Convert amount to Stripe format (cents)
export const toStripeAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

// Convert Stripe amount to display format
export const fromStripeAmount = (amount: number): number => {
  return amount / 100;
};

export default stripe;
