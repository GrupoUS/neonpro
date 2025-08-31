"use client";

import dynamic from "next/dynamic";
import { LoadingWithMessage } from "@/components/ui/loading-skeleton";
import { Suspense, useCallback, useState } from "react";

// Dynamic imports for Stripe
const StripeProvider = dynamic(
  () => import("../payments/stripe-provider").then((mod) => mod.StripeProvider),
  {
    loading: () => <LoadingWithMessage variant="payment" message="Carregando Stripe..." />,
    ssr: false, // Payment processing é client-side only
  }
);

const StripePaymentForm = dynamic(
  () => import("../payments/stripe-payment-form").then((mod) => mod.StripePaymentForm),
  {
    loading: () => <LoadingWithMessage variant="payment" message="Carregando formulário de pagamento..." />,
    ssr: false,
  }
);

const StripeSubscriptionManager = dynamic(
  () => import("../payments/stripe-subscription").then((mod) => mod.StripeSubscriptionManager),
  {
    loading: () => <LoadingWithMessage variant="payment" message="Carregando gerenciador de assinatura..." />,
    ssr: false,
  }
);

// Interfaces
interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface PaymentMethodData {
  type: "card" | "pix" | "boleto";
  card?: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  };
}

interface StripeProviderProps {
  publishableKey: string;
  children: React.ReactNode;
  appearance?: {
    theme?: "stripe" | "night" | "flat";
    variables?: Record<string, string>;
  };
}

interface StripePaymentFormProps {
  paymentIntent: PaymentIntent;
  onSuccess?: (paymentIntent: PaymentIntent) => void;
  onError?: (error: Error) => void;
  onProcessing?: (isProcessing: boolean) => void;
  allowedPaymentMethods?: ("card" | "pix" | "boleto")[];
  showBillingDetails?: boolean;
}

interface SubscriptionManagerProps {
  customerId?: string;
  priceId: string;
  onSubscriptionCreated?: (subscription: any) => void;
  onError?: (error: Error) => void;
}

// Dynamic Stripe Provider
export function DynamicStripeProvider(props: StripeProviderProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="payment" message="Inicializando pagamentos..." />}>
      <StripeProvider {...props} />
    </Suspense>
  );
}

// Dynamic Payment Form
export function DynamicStripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="payment" message="Carregando formulário..." />}>
      <StripePaymentForm {...props} />
    </Suspense>
  );
}

// Dynamic Subscription Manager
export function DynamicStripeSubscriptionManager(props: SubscriptionManagerProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="payment" message="Carregando assinaturas..." />}>
      <StripeSubscriptionManager {...props} />
    </Suspense>
  );
}

// Hook para payment processing com lazy loading
export function usePaymentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  // Initialize Stripe com lazy loading
  const initializeStripe = useCallback(async (publishableKey: string) => {
    try {
      // Lazy load Stripe
      const { loadStripe } = await import("@stripe/stripe-js");
      return await loadStripe(publishableKey);
    } catch (err) {
      const error = new Error(`Erro ao carregar Stripe: ${(err as Error).message}`);
      setError(error);
      throw error;
    }
  }, []);

  // Create payment intent
  const createPaymentIntent = useCallback(async (params: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate amount on client-side before API call
      if (!params.amount) {
        throw new Error('Valor do pagamento é obrigatório');
      }
      
      if (!Number.isFinite(params.amount)) {
        throw new Error('Valor do pagamento deve ser um número válido');
      }
      
      if (params.amount <= 0) {
        throw new Error('Valor do pagamento deve ser maior que zero');
      }
      
      if (params.amount > MAX_PAYMENT_AMOUNT) {
        throw new Error(`Valor do pagamento não pode exceder R$ ${(MAX_PAYMENT_AMOUNT / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'brl',
          description: params.description,
          metadata: params.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar intenção de pagamento');
      }

      const intent = await response.json();
      setPaymentIntent(intent);
      return intent;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async (stripe: any, elements: any, paymentIntent: PaymentIntent) => {
    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      return confirmedPaymentIntent;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Create subscription
  const createSubscription = useCallback(async (params: {
    customerId?: string;
    priceId: string;
    paymentMethodId?: string;
  }) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar assinatura');
      }

      const subscription = await response.json();
      return subscription;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    initializeStripe,
    createPaymentIntent,
    processPayment,
    createSubscription,
    isProcessing,
    error,
    paymentIntent,
  };
}

// Maximum payment amount in centavos (R$ 50.000,00)
const MAX_PAYMENT_AMOUNT = 5_000_000;

// Healthcare-specific payment configurations
export const HealthcarePaymentConfig = {
  // Brazilian payment methods for healthcare
  allowedMethods: ['card', 'pix', 'boleto'] as const,
  
  // Common healthcare services pricing (in centavos)
  servicePrices: {
    consultation: 15_000, // R$ 150.00
    procedure_basic: 30_000, // R$ 300.00
    procedure_advanced: 80_000, // R$ 800.00
    emergency: 50_000, // R$ 500.00
  },
  
  // Subscription plans for clinics
  subscriptionPlans: {
    basic: 'price_basic_monthly',
    professional: 'price_professional_monthly',
    enterprise: 'price_enterprise_monthly',
  },
  
  // Compliance configurations
  compliance: {
    requireBillingAddress: true,
    savePaymentMethods: false, // LGPD compliance - don't save by default
    enableReceipts: true,
    auditTrail: true,
  },
} as const;