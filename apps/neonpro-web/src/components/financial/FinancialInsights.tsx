"use client";

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Skeleton } from "@/components/ui/skeleton";
import type {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Zap,
  Brain,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
  Lightbulb,
  Star,
  Activity,
  PieChart,
  LineChart,
} from "lucide-react";

interface FinancialInsightsProps {
  insights?: any;
  analytics?: any;
  loading?: boolean;
  timeframe?: "week" | "month" | "quarter" | "year";
  className?: string;
}

interface Insight {
  id: string;
  type: "opportunity" | "risk" | "trend" | "recommendation" | "alert";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: number; // 1-10 scale
  confidence: number; // 0-100 percentage
  category: "revenue" | "expenses" | "efficiency" | "growth" | "risk";
  actionable: boolean;
  actions?: string[];
  metrics?: Record<string, any>;
  createdAt: string;
}

interface Trend {
  id: string;
  metric: string;
  direction: "up" | "down" | "stable";
  change: number;
  period: string;
  significance: "low" | "medium" | "high";
  forecast?: {
    nextPeriod: number;
    confidence: number;
  };
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  timeline: string;
  steps: string[];
  expectedOutcome: string;
}

export function FinancialInsights({
  insights,
  analytics,
  loading = false,
  timeframe = "month",
  className = "",
}: FinancialInsightsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "recommendations" | "alerts">(
    "overview",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock data for demonstration
  const mockInsights: Insight[] = [
    {
      id: "1",
      type: "opportunity",
      priority: "high",
      title: "Oportunidade de Crescimento em Ortodontia",
      description:
        "Análise mostra 35% de aumento na demanda por tratamentos ortodônticos. Considere expandir este serviço.",
      impact: 8,
      confidence: 87,
      category: "revenue",
      actionable: true,
      actions: [
        "Contratar ortodontista especializado",
        "Investir em equipamentos ortodônticos",
        "Criar campanha de marketing direcionada",
      ],
      metrics: {
        potentialRevenue: 45000,
        demandIncrease: 35,
        marketShare: 12,
      },
      createdAt: "2024-01-25T10:00:00Z",
    },
    {
      id: "2",
      type: "risk",
      priority: "medium",
      title: "Aumento nos Custos Operacionais",
      description:
        "Custos operacionais aumentaram 18% nos últimos 3 meses. Revisar fornecedores e processos.",
      impact: 6,
      confidence: 92,
      category: "expenses",
      actionable: true,
      actions: [
        "Renegociar contratos com fornecedores",
        "Otimizar processos operacionais",
        "Implementar controle de custos mais rigoroso",
      ],
      metrics: {
        costIncrease: 18,
        affectedCategories: ["materiais", "energia", "manutenção"],
      },
      createdAt: "2024-01-24T14:30:00Z",
    },
    {
      id: "3",
      type: "trend",
      priority: "medium",
      title: "Tendência de Crescimento na Satisfação",
      description:
        "Satisfação do paciente aumentou consistentemente, atingindo 4.7/5. Manter padrão de qualidade.",
      impact: 7,
      confidence: 95,
      category: "growth",
      actionable: false,
      metrics: {
        currentRating: 4.7,
        improvement: 0.3,
        period: "3 meses",
      },
      createdAt: "2024-01-23T09:15:00Z",
    },
    {
      id: "4",
      type: "alert",
      priority: "critical",
      title: "Queda na Taxa de Conversão",
      description:
        "Taxa de conversão de consultas para tratamentos caiu 22% este mês. Ação imediata necessária.",
      impact: 9,
      confidence: 88,
      category: "revenue",
      actionable: true,
      actions: [
        "Revisar processo de consulta",
        "Treinar equipe em técnicas de conversão",
        "Analisar feedback dos pacientes",
      ],
      metrics: {
        conversionRate: 68,
        previousRate: 87,
        decline: 22,
      },
      createdAt: "2024-01-25T16:45:00Z",
    },
  ];

  const mockTrends: Trend[] = [
    {
      id: "1",
      metric: "Receita Mensal",
      direction: "up",
      change: 12.5,
      period: "últimos 3 meses",
      significance: "high",
      forecast: {
        nextPeriod: 15.2,
        confidence: 85,
      },
    },
    {
      id: "2",
      metric: "Número de Pacientes",
      direction: "up",
      change: 8.3,
      period: "último mês",
      significance: "medium",
      forecast: {
        nextPeriod: 6.7,
        confidence: 78,
      },
    },
    {
      id: "3",
      metric: "Ticket Médio",
      direction: "down",
      change: -3.2,
      period: "últimas 2 semanas",
      significance: "low",
      forecast: {
        nextPeriod: -1.8,
        confidence: 65,
      },
    },
    {
      id: "4",
      metric: "Taxa de Cancelamento",
      direction: "stable",
      change: 0.5,
      period: "último trimestre",
      significance: "low",
    },
  ];

  const mockRecommendations: Recommendation[] = [
    {
      id: "1",
      title: "Implementar Sistema de Fidelidade",
      description: "Criar programa de pontos para incentivar retorno e indicações de pacientes.",
      category: "Retenção",
      priority: "high",
      effort: "medium",
      impact: "high",
      timeline: "2-3 meses",
      steps: [
        "Definir estrutura de pontos e recompensas",
        "Desenvolver sistema de tracking",
        "Criar campanha de lançamento",
        "Treinar equipe no novo programa",
      ],
      expectedOutcome: "Aumento de 25% na retenção de pacientes",
    },
    {
      id: "2",
      title: "Otimizar Agendamento Online",
      description: "Melhorar interface e processo de agendamento para reduzir abandono.",
      category: "Eficiência",
      priority: "medium",
      effort: "low",
      impact: "medium",
      timeline: "3-4 semanas",
      steps: [
        "Analisar pontos de abandono atual",
        "Redesenhar fluxo de agendamento",
        "Implementar confirmação automática",
        "Adicionar lembretes por WhatsApp",
      ],
      expectedOutcome: "Redução de 40% no abandono de agendamento",
    },
    {
      id: "3",
      title: "Expandir Horários de Atendimento",
      description: "Oferecer horários noturnos e fins de semana para aumentar capacidade.",
      category: "Crescimento",
      priority: "medium",
      effort: "high",
      impact: "high",
      timeline: "1-2 meses",
      steps: [
        "Pesquisar demanda por horários alternativos",
        "Contratar profissionais adicionais",
        "Ajustar infraestrutura e segurança",
        "Lançar novos horários gradualmente",
      ],
      expectedOutcome: "Aumento de 30% na capacidade de atendimento",
    },
  ];

  // Filter insights by category
  const filteredInsights =
    selectedCategory === "all"
      ? mockInsights
      : mockInsights.filter((insight) => insight.category === selectedCategory);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-orange-600 bg-orange-50 border-orange-200",
      critical: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Get insight icon
  const getInsightIcon = (type: string) => {
    const icons = {
      opportunity: Lightbulb,
      risk: AlertTriangle,
      trend: TrendingUp,
      recommendation: Target,
      alert: Zap,
    };
    return icons[type as keyof typeof icons] || Info;
  };

  // Get trend icon and color
  const getTrendDisplay = (direction: string, change: number) => {
    if (direction === "up") {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        prefix: "+",
      };
    } else if (direction === "down") {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        prefix: "",
      };
    } else {
      return {
        icon: Activity,
        color: "text-gray-600",
        prefix: "",
      };
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Insights Financeiros
          </h2>
          <p className="text-muted-foreground">
            Análises inteligentes e recomendações baseadas em IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Atualizado em tempo real
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Oportunidades</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Riscos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Tendências</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Recomendações</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              Alertas Críticos
            </h3>

            {mockInsights
              .filter((insight) => insight.priority === "critical")
              .map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <Alert key={insight.id} className="border-red-200 bg-red-50">
                    <Icon className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">{insight.title}</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {insight.description}
                      {insight.actionable && insight.actions && (
                        <div className="mt-2">
                          <strong>Ações recomendadas:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {insight.actions.slice(0, 2).map((action, index) => (
                              <li key={index} className="text-sm">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                );
              })}
          </div>

          {/* Top Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Principais Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockInsights
                .filter((insight) => insight.priority !== "critical")
                .slice(0, 4)
                .map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <Card key={insight.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                          </div>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{insight.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Impacto:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={insight.impact * 10} className="w-16" />
                              <span>{insight.impact}/10</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span>Confiança:</span>
                            <span>{insight.confidence}%</span>
                          </div>

                          {insight.actionable && (
                            <Button size="sm" className="w-full">
                              Ver Ações
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTrends.map((trend) => {
              const {
                icon: TrendIcon,
                color,
                prefix,
              } = getTrendDisplay(trend.direction, trend.change);
              return (
                <Card key={trend.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{trend.metric}</span>
                      <Badge variant={trend.significance === "high" ? "default" : "outline"}>
                        {trend.significance}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <TrendIcon className={`h-6 w-6 ${color}`} />
                        <div>
                          <div className={`text-2xl font-bold ${color}`}>
                            {prefix}
                            {Math.abs(trend.change).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">{trend.period}</div>
                        </div>
                      </div>

                      {trend.forecast && (
                        <div className="border-t pt-3">
                          <div className="text-sm font-medium mb-2">Previsão próximo período:</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {formatPercentage(trend.forecast.nextPeriod)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {trend.forecast.confidence}% confiança
                            </span>
                          </div>
                          <Progress value={trend.forecast.confidence} className="mt-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-6">
            {mockRecommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {rec.title}
                      </CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{rec.category}</Badge>
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Esforço</div>
                        <div className="text-muted-foreground">{rec.effort}</div>
                      </div>
                      <div>
                        <div className="font-medium">Impacto</div>
                        <div className="text-muted-foreground">{rec.impact}</div>
                      </div>
                      <div>
                        <div className="font-medium">Timeline</div>
                        <div className="text-muted-foreground">{rec.timeline}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-2">Passos de implementação:</div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {rec.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="font-medium text-green-800 mb-1">Resultado esperado:</div>
                      <div className="text-green-700 text-sm">{rec.expectedOutcome}</div>
                    </div>

                    <Button className="w-full">Implementar Recomendação</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {mockInsights
              .filter((insight) => insight.type === "alert" || insight.priority === "critical")
              .map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <Alert
                    key={insight.id}
                    className={`border-l-4 ${
                      insight.priority === "critical"
                        ? "border-l-red-500 bg-red-50"
                        : insight.priority === "high"
                          ? "border-l-orange-500 bg-orange-50"
                          : "border-l-yellow-500 bg-yellow-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <AlertTitle>{insight.title}</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-3">
                        <p>{insight.description}</p>

                        {insight.metrics && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(insight.metrics).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}: </span>
                                <span>
                                  {typeof value === "number" ? value.toLocaleString() : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {insight.actionable && insight.actions && (
                          <div>
                            <div className="font-medium mb-2">Ações recomendadas:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {insight.actions.map((action, index) => (
                                <li key={index} className="text-sm">
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm">Tomar Ação</Button>
                          <Button size="sm" variant="outline">
                            Marcar como Resolvido
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialInsights;
