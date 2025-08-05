"use client";

import type { Elements } from "@stripe/react-stripe-js";
import type { loadStripe } from "@stripe/stripe-js";
import type React from "react";

// Inicializar Stripe (só uma vez)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

// Hook para usar Stripe de forma mais conveniente
export { useElements, useStripe } from "@stripe/react-stripe-js";
