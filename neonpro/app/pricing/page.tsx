"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NEONPRO_PLANS } from "@/lib/constants/plans";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  };

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/subscription/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const plans = Object.entries(NEONPRO_PLANS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para sua Clínica
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todos os planos incluem suporte técnico e atualizações gratuitas.
            Comece sua avaliação gratuita de 14 dias hoje mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(([planId, plan], index) => (
            <Card
              key={planId}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                index === 1
                  ? "border-2 border-blue-500 scale-105"
                  : "border hover:border-blue-300"
              }`}
            >
              {index === 1 && (
                <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                  Mais Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    index === 1
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={() => handleSelectPlan(planId)}
                  disabled={loading !== null}
                >
                  {loading === planId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Começar Teste Grátis
                      <span className="ml-2 text-xs opacity-75">14 dias</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Por que escolher o NeonPro?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-900">100% Seguro</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Dados protegidos com criptografia de ponta
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900">Acesso Mobile</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Funciona perfeitamente em qualquer dispositivo
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-gray-900">Suporte 24/7</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Equipe especializada sempre disponível
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Dúvidas? Entre em contato conosco:{" "}
            <a
              href="mailto:suporte@neonpro.com"
              className="text-blue-600 hover:underline"
            >
              suporte@neonpro.com
            </a>{" "}
            ou{" "}
            <a
              href="tel:+551199999999"
              className="text-blue-600 hover:underline"
            >
              (11) 99999-9999
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
