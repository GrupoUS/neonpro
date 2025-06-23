'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, CreditCard, TrendingUp } from 'lucide-react';

const statsData = [
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

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
