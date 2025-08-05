// Subscription plans for NeonPro
export const NEONPRO_PLANS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    description: "Para clínicas pequenas",
    price: 9900, // R$ 99.00 em centavos
    features: [
      "Até 500 pacientes",
      "Agendamento básico",
      "Controle financeiro simples",
      "Suporte por email",
    ],
    stripePriceId: "price_starter_monthly", // Será criado no Stripe Dashboard
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    description: "Para clínicas em crescimento",
    price: 19900, // R$ 199.00 em centavos
    features: [
      "Até 2.000 pacientes",
      "Agendamento avançado",
      "Controle financeiro completo",
      "Relatórios e analytics",
      "Suporte prioritário",
      "Integrações API",
    ],
    stripePriceId: "price_professional_monthly",
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    description: "Para grandes clínicas",
    price: 39900, // R$ 399.00 em centavos
    features: [
      "Pacientes ilimitados",
      "Multi-clínicas",
      "Personalização completa",
      "Suporte 24/7",
      "Treinamento dedicado",
      "API completa",
    ],
    stripePriceId: "price_enterprise_monthly",
  },
} as const;

export type PlanId = keyof typeof NEONPRO_PLANS;
