"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Brain, Calendar, TrendingUp, Users } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "treatment" | "marketing" | "operation" | "finance";
  priority: "high" | "medium" | "low";
  impact: string;
  confidence: number;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Otimizar agendamentos para tarde",
    description: "Análise mostra 40% mais conversões em agendamentos para período da tarde",
    type: "operation",
    priority: "high",
    impact: "Aumento de 25% na receita",
    confidence: 87,
  },
  {
    id: "2",
    title: "Programa de fidelidade para clientes VIP",
    description: "Clientes com 5+ procedimentos têm 60% mais probabilidade de indicar",
    type: "marketing",
    priority: "medium",
    impact: "Redução de 15% no CAC",
    confidence: 92,
  },
  {
    id: "3",
    title: "Pacote promocional para janeiro",
    description: "Histórico mostra queda de 30% na demanda pós-festas",
    type: "finance",
    priority: "high",
    impact: "Manutenção do faturamento",
    confidence: 78,
  },
];

const typeColors = {
  treatment: "bg-blue-100 text-blue-800",
  marketing: "bg-green-100 text-green-800",
  operation: "bg-purple-100 text-purple-800",
  finance: "bg-orange-100 text-orange-800",
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-800",
};

export function PersonalizedRecommendationsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendações Ativas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Implementação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto Médio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23%</div>
            <p className="text-xs text-muted-foreground">Aumento na conversão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Análise</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 dias</div>
            <p className="text-xs text-muted-foreground">Análise semanal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recomendações Prioritárias</CardTitle>
          <CardDescription>Insights baseados em IA para otimizar sua clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <div key={rec.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <Badge className={typeColors[rec.type]}>
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </Badge>
                    <Badge className={priorityColors[rec.priority]}>
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-green-600">{rec.impact}</span>
                    <span className="text-muted-foreground">Confiança: {rec.confidence}%</span>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button size="sm">Implementar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalizedRecommendationsOverview;
