"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
} from "@neonpro/ui";
import { Check, Star, Zap, Shield, Users, Briefcase, Building2 } from "lucide-react";

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

  const PlanIcon = ({ icon: Icon }: { icon: React.ComponentType<any> }) => (
    <Icon className="h-8 w-8" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Planos e Preços</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua clínica ou organização de saúde. Todos os planos incluem
            compliance LGPD e segurança de dados.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <PlanIcon icon={plan.icon} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-muted-foreground">
                    /{plan.billingPeriod === "month" ? "mês" : "ano"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular ? (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Começar Agora
                    </>
                  ) : (
                    "Selecionar Plano"
                  )}
                </Button>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Usuários:</span>
                      <p className="font-medium">
                        {plan.maxUsers === 999 ? "Ilimitados" : `Até ${plan.maxUsers}`}
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
                    <h4 className="font-medium mb-3">Recursos inclusos:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
                    <th className="text-left py-3 px-4">Recurso</th>
                    <th className="text-center py-3 px-4">Básico</th>
                    <th className="text-center py-3 px-4">Profissional</th>
                    <th className="text-center py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="py-3 px-4">Gestão de Pacientes</td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Agendamentos</td>
                    <td className="text-center py-3 px-4">Básico</td>
                    <td className="text-center py-3 px-4">Avançado</td>
                    <td className="text-center py-3 px-4">Completo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Relatórios</td>
                    <td className="text-center py-3 px-4">Essenciais</td>
                    <td className="text-center py-3 px-4">Detalhados</td>
                    <td className="text-center py-3 px-4">Customizados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">API Access</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">Básico</td>
                    <td className="text-center py-3 px-4">Completo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Suporte 24/7</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Segurança de Dados</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Criptografia AES-256
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    SSL/TLS em todas as conexões
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Backup automatizado
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Autenticação de dois fatores
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Compliance</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    LGPD (Lei Geral de Proteção de Dados)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    ISO 27001 certified
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    HIPAA compliance ready
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Auditoria de acesso completa
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
          <p className="text-muted-foreground mb-8">
            Não encontrou o que procura? Entre em contato conosco.
          </p>
          <Button variant="outline">Falar com Vendas</Button>
        </div>
      </div>
    </div>
  );
}
