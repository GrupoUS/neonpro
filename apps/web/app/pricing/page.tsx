"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@neonpro/ui";
import { Briefcase, Building2, Check, Shield, Star, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: "month" | "year";
  popular?: boolean;
  features: string[];
  maxUsers: number;
  storage: string;
  support: string;
  icon: React.ComponentType<any>;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para pequenas clínicas e consultórios",
    price: 99,
    billingPeriod: "month",
    features: [
      "Até 5 usuários",
      "Gestão de pacientes",
      "Agendamentos básicos",
      "Relatórios essenciais",
      "Suporte por email",
      "Backup diário",
      "LGPD compliance",
    ],
    maxUsers: 5,
    storage: "10 GB",
    support: "Email",
    icon: Users,
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Para clínicas em crescimento e equipes médicas",
    price: 199,
    billingPeriod: "month",
    popular: true,
    features: [
      "Até 15 usuários",
      "Gestão completa de pacientes",
      "Agendamentos avançados",
      "Relatórios detalhados",
      "Suporte prioritário",
      "Backup em tempo real",
      "LGPD compliance",
      "Integração com sistemas",
      "Controle financeiro",
      "Auditoria de dados",
    ],
    maxUsers: 15,
    storage: "100 GB",
    support: "Chat + Email",
    icon: Briefcase,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para hospitais e grandes organizações de saúde",
    price: 399,
    billingPeriod: "month",
    features: [
      "Usuários ilimitados",
      "Todas as funcionalidades",
      "Relatórios customizados",
      "Suporte 24/7",
      "Backup redundante",
      "LGPD compliance avançado",
      "API completa",
      "Integrações personalizadas",
      "Controle financeiro avançado",
      "Auditoria completa",
      "Treinamento dedicado",
      "Gerente de conta",
    ],
    maxUsers: 999,
    storage: "1 TB",
    support: "24/7 Dedicado",
    icon: Building2,
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    router.push(`/signup?plan=${planId}`);
  };

  const PlanIcon = ({ icon: Icon }: { icon: React.ComponentType<any>; }) => (
    <Icon className="h-8 w-8" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Planos e Preços
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Escolha o plano ideal para sua clínica ou organização de saúde. Todos os planos incluem
            compliance LGPD e segurança de dados.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card
              className={`relative ${plan.popular ? "scale-105 border-blue-500 shadow-lg" : ""}`}
              key={plan.id}
            >
              {plan.popular && (
                <div className="-top-3 -translate-x-1/2 absolute left-1/2 transform">
                  <Badge className="bg-blue-500 px-3 py-1 text-white">
                    <Star className="mr-1 h-3 w-3" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-fit rounded-full bg-blue-100 p-3">
                  <PlanIcon icon={plan.icon} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  <span className="font-bold text-4xl">R$ {plan.price}</span>
                  <span className="text-muted-foreground">
                    /{plan.billingPeriod === "month" ? "mês" : "ano"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  className="mb-6 w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.popular
                    ? (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Começar Agora
                      </>
                    )
                    : (
                      "Selecionar Plano"
                    )}
                </Button>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Usuários:</span>
                      <p className="font-medium">
                        {plan.maxUsers === 999
                          ? "Ilimitados"
                          : `Até ${plan.maxUsers}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <p className="font-medium">{plan.storage}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Suporte:</span>
                      <p className="font-medium">{plan.support}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-3 font-medium">Recursos inclusos:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li className="flex items-start" key={index}>
                          <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Comparação Detalhada</CardTitle>
            <CardDescription className="text-center">
              Veja todos os recursos disponíveis em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Recurso</th>
                    <th className="px-4 py-3 text-center">Básico</th>
                    <th className="px-4 py-3 text-center">Profissional</th>
                    <th className="px-4 py-3 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="px-4 py-3">Gestão de Pacientes</td>
                    <td className="px-4 py-3 text-center">
                      <Check className="mx-auto h-4 w-4 text-green-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="mx-auto h-4 w-4 text-green-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="mx-auto h-4 w-4 text-green-500" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Agendamentos</td>
                    <td className="px-4 py-3 text-center">Básico</td>
                    <td className="px-4 py-3 text-center">Avançado</td>
                    <td className="px-4 py-3 text-center">Completo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Relatórios</td>
                    <td className="px-4 py-3 text-center">Essenciais</td>
                    <td className="px-4 py-3 text-center">Detalhados</td>
                    <td className="px-4 py-3 text-center">Customizados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">API Access</td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3 text-center">Básico</td>
                    <td className="px-4 py-3 text-center">Completo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Suporte 24/7</td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3 text-center">
                      <Check className="mx-auto h-4 w-4 text-green-500" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Segurança e Compliance
            </CardTitle>
            <CardDescription>
              Todos os planos incluem as mais altas medidas de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-medium">Segurança de Dados</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Criptografia AES-256
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    SSL/TLS em todas as conexões
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Backup automatizado
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Autenticação de dois fatores
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-medium">Compliance</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    LGPD (Lei Geral de Proteção de Dados)
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    ISO 27001 certified
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    HIPAA compliance ready
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Auditoria de acesso completa
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="mb-4 font-bold text-2xl">Perguntas Frequentes</h2>
          <p className="mb-8 text-muted-foreground">
            Não encontrou o que procura? Entre em contato conosco.
          </p>
          <Button variant="outline">Falar com Vendas</Button>
        </div>
      </div>
    </div>
  );
}
