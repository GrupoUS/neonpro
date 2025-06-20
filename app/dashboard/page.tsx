
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/app-layout";
import { AuthProvider } from "@/contexts/auth-context";
import { Calendar, Users, CreditCard, TrendingUp } from "lucide-react";

const statsCards = [
  {
    title: "Agendamentos Hoje",
    value: "12",
    description: "+2 desde ontem",
    icon: Calendar,
    color: "text-blue-600",
  },
  {
    title: "Total de Clientes",
    value: "248",
    description: "+15 este mês",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Receita Mensal",
    value: "R$ 25.400",
    description: "+12% desde o mês passado",
    icon: CreditCard,
    color: "text-purple-600",
  },
  {
    title: "Taxa de Crescimento",
    value: "18%",
    description: "+3% desde o trimestre passado",
    icon: TrendingUp,
    color: "text-orange-600",
  },
];

function DashboardContent() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica de estética
          </p>
        </div>

        <div className="grid gap-4 m d:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
              <CardDescription>
                Últimos agendamentos da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maria Silva</p>
                    <p className="text-sm text-muted-foreground">
                      Limpeza de Pele - 14:00
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Hoje</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ana Costa</p>
                    <p className="text-sm text-muted-foreground">
                      Massagem Relaxante - 16:30
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Hoje</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Carla Santos</p>
                    <p className="text-sm text-muted-foreground">
                      Peeling Químico - 10:00
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Amanhã</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                Receitas e despesas do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receitas</span>
                  <span className="font-medium text-green-600">R$ 28.500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Despesas</span>
                  <span className="font-medium text-red-600">R$ 3.100</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lucro Líquido</span>
                  <span className="font-bold text-primary">R$ 25.400</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
