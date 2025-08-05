"use client";
"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialInsights = FinancialInsights;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
function FinancialInsights(_a) {
  var insights = _a.insights,
    analytics = _a.analytics,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    _c = _a.timeframe,
    timeframe = _c === void 0 ? "month" : _c,
    _d = _a.className,
    className = _d === void 0 ? "" : _d;
  var _e = (0, react_1.useState)("overview"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedCategory = _f[0],
    setSelectedCategory = _f[1];
  // Mock data for demonstration
  var mockInsights = [
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
  var mockTrends = [
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
  var mockRecommendations = [
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
  var filteredInsights =
    selectedCategory === "all"
      ? mockInsights
      : mockInsights.filter(function (insight) {
          return insight.category === selectedCategory;
        });
  // Get priority color
  var getPriorityColor = function (priority) {
    var colors = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-orange-600 bg-orange-50 border-orange-200",
      critical: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[priority] || colors.medium;
  };
  // Get insight icon
  var getInsightIcon = function (type) {
    var icons = {
      opportunity: lucide_react_1.Lightbulb,
      risk: lucide_react_1.AlertTriangle,
      trend: lucide_react_1.TrendingUp,
      recommendation: lucide_react_1.Target,
      alert: lucide_react_1.Zap,
    };
    return icons[type] || lucide_react_1.Info;
  };
  // Get trend icon and color
  var getTrendDisplay = function (direction, change) {
    if (direction === "up") {
      return {
        icon: lucide_react_1.TrendingUp,
        color: "text-green-600",
        prefix: "+",
      };
    } else if (direction === "down") {
      return {
        icon: lucide_react_1.TrendingDown,
        color: "text-red-600",
        prefix: "",
      };
    } else {
      return {
        icon: lucide_react_1.Activity,
        color: "text-gray-600",
        prefix: "",
      };
    }
  };
  // Format percentage
  var formatPercentage = function (value) {
    return "".concat(value > 0 ? "+" : "").concat(value.toFixed(1), "%");
  };
  // Render loading state
  if (loading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {__spreadArray([], Array(6), true).map(function (_, i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardHeader>
                  <skeleton_1.Skeleton className="h-6 w-32" />
                  <skeleton_1.Skeleton className="h-4 w-48" />
                </card_1.CardHeader>
                <card_1.CardContent>
                  <skeleton_1.Skeleton className="h-20 w-full" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.Brain className="h-6 w-6" />
            Insights Financeiros
          </h2>
          <p className="text-muted-foreground">
            Análises inteligentes e recomendações baseadas em IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <badge_1.Badge variant="outline" className="flex items-center gap-1">
            <lucide_react_1.Zap className="h-3 w-3" />
            Atualizado em tempo real
          </badge_1.Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Lightbulb className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Oportunidades</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Riscos</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Tendências</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Recomendações</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="trends">Tendências</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="recommendations">Recomendações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview */}
        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <lucide_react_1.Zap className="h-5 w-5 text-red-600" />
              Alertas Críticos
            </h3>

            {mockInsights
              .filter(function (insight) {
                return insight.priority === "critical";
              })
              .map(function (insight) {
                var Icon = getInsightIcon(insight.type);
                return (
                  <alert_1.Alert key={insight.id} className="border-red-200 bg-red-50">
                    <Icon className="h-4 w-4 text-red-600" />
                    <alert_1.AlertTitle className="text-red-800">
                      {insight.title}
                    </alert_1.AlertTitle>
                    <alert_1.AlertDescription className="text-red-700">
                      {insight.description}
                      {insight.actionable && insight.actions && (
                        <div className="mt-2">
                          <strong>Ações recomendadas:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {insight.actions.slice(0, 2).map(function (action, index) {
                              return (
                                <li key={index} className="text-sm">
                                  {action}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                );
              })}
          </div>

          {/* Top Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Principais Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockInsights
                .filter(function (insight) {
                  return insight.priority !== "critical";
                })
                .slice(0, 4)
                .map(function (insight) {
                  var Icon = getInsightIcon(insight.type);
                  return (
                    <card_1.Card key={insight.id} className="hover:shadow-md transition-shadow">
                      <card_1.CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <card_1.CardTitle className="text-lg">{insight.title}</card_1.CardTitle>
                          </div>
                          <badge_1.Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </badge_1.Badge>
                        </div>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <p className="text-muted-foreground mb-4">{insight.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Impacto:</span>
                            <div className="flex items-center gap-2">
                              <progress_1.Progress value={insight.impact * 10} className="w-16" />
                              <span>{insight.impact}/10</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span>Confiança:</span>
                            <span>{insight.confidence}%</span>
                          </div>

                          {insight.actionable && (
                            <button_1.Button size="sm" className="w-full">
                              Ver Ações
                              <lucide_react_1.ArrowRight className="h-4 w-4 ml-2" />
                            </button_1.Button>
                          )}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
            </div>
          </div>
        </tabs_1.TabsContent>

        {/* Trends */}
        <tabs_1.TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTrends.map(function (trend) {
              var _a = getTrendDisplay(trend.direction, trend.change),
                TrendIcon = _a.icon,
                color = _a.color,
                prefix = _a.prefix;
              return (
                <card_1.Card key={trend.id}>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center justify-between">
                      <span>{trend.metric}</span>
                      <badge_1.Badge
                        variant={trend.significance === "high" ? "default" : "outline"}
                      >
                        {trend.significance}
                      </badge_1.Badge>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <TrendIcon className={"h-6 w-6 ".concat(color)} />
                        <div>
                          <div className={"text-2xl font-bold ".concat(color)}>
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
                          <progress_1.Progress value={trend.forecast.confidence} className="mt-2" />
                        </div>
                      )}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        {/* Recommendations */}
        <tabs_1.TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-6">
            {mockRecommendations.map(function (rec) {
              return (
                <card_1.Card key={rec.id}>
                  <card_1.CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <card_1.CardTitle className="flex items-center gap-2">
                          <lucide_react_1.Target className="h-5 w-5" />
                          {rec.title}
                        </card_1.CardTitle>
                        <card_1.CardDescription>{rec.description}</card_1.CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <badge_1.Badge variant="outline">{rec.category}</badge_1.Badge>
                        <badge_1.Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
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
                          {rec.steps.map(function (step, index) {
                            return <li key={index}>{step}</li>;
                          })}
                        </ol>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="font-medium text-green-800 mb-1">Resultado esperado:</div>
                        <div className="text-green-700 text-sm">{rec.expectedOutcome}</div>
                      </div>

                      <button_1.Button className="w-full">Implementar Recomendação</button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        {/* Alerts */}
        <tabs_1.TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {mockInsights
              .filter(function (insight) {
                return insight.type === "alert" || insight.priority === "critical";
              })
              .map(function (insight) {
                var Icon = getInsightIcon(insight.type);
                return (
                  <alert_1.Alert
                    key={insight.id}
                    className={"border-l-4 ".concat(
                      insight.priority === "critical"
                        ? "border-l-red-500 bg-red-50"
                        : insight.priority === "high"
                          ? "border-l-orange-500 bg-orange-50"
                          : "border-l-yellow-500 bg-yellow-50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <alert_1.AlertTitle>{insight.title}</alert_1.AlertTitle>
                    <alert_1.AlertDescription>
                      <div className="space-y-3">
                        <p>{insight.description}</p>

                        {insight.metrics && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(insight.metrics).map(function (_a) {
                              var key = _a[0],
                                value = _a[1];
                              return (
                                <div key={key}>
                                  <span className="font-medium">{key}: </span>
                                  <span>
                                    {typeof value === "number" ? value.toLocaleString() : value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {insight.actionable && insight.actions && (
                          <div>
                            <div className="font-medium mb-2">Ações recomendadas:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {insight.actions.map(function (action, index) {
                                return (
                                  <li key={index} className="text-sm">
                                    {action}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button_1.Button size="sm">Tomar Ação</button_1.Button>
                          <button_1.Button size="sm" variant="outline">
                            Marcar como Resolvido
                          </button_1.Button>
                        </div>
                      </div>
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                );
              })}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
exports.default = FinancialInsights;
