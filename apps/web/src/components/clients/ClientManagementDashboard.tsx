/**
 * Enhanced Client Management Dashboard with AI Analytics
 *
 * Comprehensive dashboard for client management with AI-powered insights,
 * retention analytics, and intelligent workflow automation.
 */

import React, { useState, useEffect } from "react";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Brain,
  Target,
  BarChart3,
  UserPlus,
  /* Search, */
  Filter,
} from "lucide-react";
import { createClient } from "@/integrations/supabase/client";

// Types
interface ClientMetrics {
  totalClients: number;
  newClientsThisMonth: number;
  retentionRate: number;
  highRiskClients: number;
  averageSatisfaction: number;
}

interface RetentionAnalytics {
  clientId: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  factors: Array<{
    factor: string;
    impact: "positive" | "negative";
    weight: number;
    description: string;
  }>;
  recommendations: Array<{
    id: string;
    type: "communication" | "incentive" | "intervention" | "follow_up";
    priority: "low" | "medium" | "high";
    title: string;
    description: string;
    actionItems: string[];
    expectedImpact: string;
    timeline: string;
  }>;
}

interface ClientAction {
  id: string;
  clientId: string;
  type: "call" | "email" | "whatsapp" | "appointment" | "review";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  dueDate?: string;
  completed: boolean;
}

interface CommunicationStats {
  totalMessages: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  preferredChannel: "whatsapp" | "sms" | "email";
  lastCommunicationDate?: string;
}

export const ClientManagementDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    newClientsThisMonth: 0,
    retentionRate: 0,
    highRiskClients: 0,
    averageSatisfaction: 0,
  });

  const [retentionAnalytics, setRetentionAnalytics] = useState<
    RetentionAnalytics[]
  >([]);
  const [pendingActions, setPendingActions] = useState<ClientAction[]>([]);
  const [communicationStats, setCommunicationStats] =
    useState<CommunicationStats>({
      totalMessages: 0,
      responseRate: 0,
      averageResponseTime: 0,
      preferredChannel: "whatsapp",
    });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  const _supabase = createClient();

  // CopilotKit integration
  const { state: _state, setState } = useCoAgent({
    name: "clientAnalyticsAgent",
    initialState: {
      currentView: "overview",
      analyticsData: {},
      aiInsights: [],
      recommendations: [],
      processingStatus: "idle",
    },
  });

  const generateInsightsAction = useCopilotAction({
    name: "generateClientInsights",
    description: "Generate AI-powered insights from client data",
    parameters: [
      {
        name: "timeRange",
        type: "string",
        description: "Time range for analysis",
      },
      { name: "metrics", type: "object", description: "Current metrics data" },
    ],
    handler: async ({ timeRange: _timeRange, metrics: _metrics }) => {
      // AI insights generation would be handled by backend
      return { insights: [] };
    },
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      // Load metrics (simulated - would call backend services)
      const mockMetrics: ClientMetrics = {
        totalClients: 1247,
        newClientsThisMonth: 45,
        retentionRate: 87.3,
        highRiskClients: 23,
        averageSatisfaction: 4.2,
      };

      // Load retention analytics (simulated)
      const mockRetentionAnalytics: RetentionAnalytics[] = [
        {
          clientId: "client-1",
          riskLevel: "high",
          riskScore: 0.82,
          factors: [
            {
              factor: "appointment_history",
              impact: "negative",
              weight: 0.3,
              description: "Alta taxa de não comparecimento (40%)",
            },
            {
              factor: "communication_responsiveness",
              impact: "negative",
              weight: 0.25,
              description: "Baixa taxa de resposta a mensagens (15%)",
            },
            {
              factor: "payment_history",
              impact: "negative",
              weight: 0.2,
              description: "Pagamentos atrasados frequentes",
            },
          ],
          recommendations: [
            {
              id: "rec-1",
              type: "communication",
              priority: "high",
              title: "Contato Pessoal",
              description:
                "Entrar em contato via WhatsApp para entender razões dos não comparecimentos",
              actionItems: [
                "Ligar para cliente em 48 horas",
                "Oferecer re-agendamento com flexibilidade",
                "Verificar se há problemas com o tratamento",
              ],
              expectedImpact: "Redução de 30% no risco de churn",
              timeline: "2-3 dias",
            },
            {
              id: "rec-2",
              type: "incentive",
              priority: "medium",
              title: "Programa de Fidelidade",
              description: "Oferecer desconto especial na próxima sessão",
              actionItems: [
                "Preparar proposta de desconto",
                "Enviar proposta via email",
                "Acompanhar resposta",
              ],
              expectedImpact: "Aumento de 25% na retenção",
              timeline: "1 semana",
            },
          ],
        },
        {
          clientId: "client-2",
          riskLevel: "medium",
          riskScore: 0.55,
          factors: [
            {
              factor: "treatment_progress",
              impact: "positive",
              weight: 0.3,
              description: "Progresso excelente no tratamento",
            },
            {
              factor: "engagement",
              impact: "negative",
              weight: 0.2,
              description: "Engajamento reduzido nas últimas semanas",
            },
          ],
          recommendations: [
            {
              id: "rec-3",
              type: "follow_up",
              priority: "medium",
              title: "Follow-up de Progresso",
              description:
                "Agendar sessão de acompanhamento para discutir progresso",
              actionItems: [
                "Enviar mensagem de check-in",
                "Agendar consulta de acompanhamento",
                "Preparar relatório de progresso",
              ],
              expectedImpact: "Melhoria no engajamento",
              timeline: "3-5 dias",
            },
          ],
        },
      ];

      // Load pending actions (simulated)
      const mockPendingActions: ClientAction[] = [
        {
          id: "action-1",
          clientId: "client-1",
          type: "call",
          priority: "urgent",
          title: "Contato de Retenção",
          description:
            "Ligar para cliente de alto risco para entender situação",
          dueDate: "2024-01-15",
          completed: false,
        },
        {
          id: "action-2",
          clientId: "client-3",
          type: "whatsapp",
          priority: "high",
          title: "Confirmação de Agendamento",
          description: "Enviar lembrete de agendamento via WhatsApp",
          dueDate: "2024-01-14",
          completed: false,
        },
        {
          id: "action-3",
          clientId: "client-2",
          type: "email",
          priority: "medium",
          title: "Relatório de Progresso",
          description: "Enviar relatório mensal de progresso do tratamento",
          dueDate: "2024-01-16",
          completed: false,
        },
      ];

      // Load communication stats (simulated)
      const mockCommunicationStats: CommunicationStats = {
        totalMessages: 3421,
        responseRate: 73,
        averageResponseTime: 2.4,
        preferredChannel: "whatsapp",
        lastCommunicationDate: "2024-01-13T10:30:00Z",
      };

      setMetrics(mockMetrics);
      setRetentionAnalytics(mockRetentionAnalytics);
      setPendingActions(mockPendingActions);
      setCommunicationStats(mockCommunicationStats);

      // Update CopilotKit state
      setState({
        analyticsData: {
          metrics: mockMetrics,
          retentionAnalytics: mockRetentionAnalytics,
          timeRange: selectedTimeRange,
        },
        processingStatus: "completed",
      });

      // Generate AI insights
      await generateInsightsAction.execute({
        timeRange: selectedTimeRange,
        metrics: mockMetrics,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setState({
        processingStatus: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = async (actionId: string) => {
    setPendingActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, completed: true } : action,
      ),
    );
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Dashboard de Gestão de Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            Analytics e insights inteligentes powered by AI
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>

          <Button onClick={loadDashboardData} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold">
                  {metrics.totalClients.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +{metrics.newClientsThisMonth} este mês
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Retenção</p>
                <p className="text-2xl font-bold">{metrics.retentionRate}%</p>
                <p className="text-xs text-green-600">+2.3% vs mês anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes de Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.highRiskClients}
                </p>
                <p className="text-xs text-red-600">Requerem atenção</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação Média</p>
                <p className="text-2xl font-bold">
                  {metrics.averageSatisfaction}/5
                </p>
                <p className="text-xs text-green-600">Excelente</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Resposta</p>
                <p className="text-2xl font-bold">
                  {communicationStats.responseRate}%
                </p>
                <p className="text-xs text-blue-600">
                  {communicationStats.preferredChannel === "whatsapp"
                    ? "WhatsApp"
                    : "Email"}{" "}
                  preferido
                </p>
              </div>
              {getChannelIcon(communicationStats.preferredChannel)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="retention">Análise de Retenção</TabsTrigger>
          <TabsTrigger value="actions">Ações Pendentes</TabsTrigger>
          <TabsTrigger value="insights">Insights AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Retention Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Visão Geral de Retenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Taxa de Retenção Geral</span>
                      <span className="text-sm font-medium">
                        {metrics.retentionRate}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.retentionRate}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(
                          metrics.totalClients * (metrics.retentionRate / 100),
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Clientes Retidos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {metrics.totalClients -
                          Math.round(
                            metrics.totalClients *
                              (metrics.retentionRate / 100),
                          )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Clientes Perdidos
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Estatísticas de Comunicação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Total de Mensagens</span>
                      <span className="text-sm font-medium">
                        {communicationStats.totalMessages.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Taxa de Resposta</span>
                      <span className="text-sm font-medium">
                        {communicationStats.responseRate}%
                      </span>
                    </div>
                    <Progress
                      value={communicationStats.responseRate}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio de Resposta</span>
                    <span className="text-sm font-medium">
                      {communicationStats.averageResponseTime}h
                    </span>
                  </div>

                  {communicationStats.lastCommunicationDate && (
                    <div className="text-xs text-gray-500">
                      Última comunicação:{" "}
                      {new Date(
                        communicationStats.lastCommunicationDate,
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          {retentionAnalytics.map((analytics) => (
            <Card key={analytics.clientId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getRiskColor(analytics.riskLevel)}`}
                    />
                    Análise de Retenção - Cliente {analytics.clientId}
                  </div>
                  <Badge
                    variant={
                      analytics.riskLevel === "high"
                        ? "destructive"
                        : analytics.riskLevel === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    Risco{" "}
                    {analytics.riskLevel === "high"
                      ? "Alto"
                      : analytics.riskLevel === "medium"
                        ? "Médio"
                        : "Baixo"}{" "}
                    ({Math.round(analytics.riskScore * 100)}%)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Risk Factors */}
                  <div>
                    <h4 className="font-medium mb-2">Fatores de Risco</h4>
                    <div className="space-y-2">
                      {analytics.factors.map((factor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {factor.description}
                            </div>
                            <div className="text-xs text-gray-600">
                              Peso: {Math.round(factor.weight * 100)}%
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              factor.impact === "positive"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {factor.impact === "positive"
                              ? "Positivo"
                              : "Negativo"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-2">Recomendações AI</h4>
                    <div className="space-y-3">
                      {analytics.recommendations.map((rec) => (
                        <Alert key={rec.id}>
                          <Brain className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{rec.title}</div>
                                <div className="text-sm mt-1">
                                  {rec.description}
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                  <strong>Impacto esperado:</strong>{" "}
                                  {rec.expectedImpact}
                                </div>
                                <div className="text-xs text-gray-600">
                                  <strong>Prazo:</strong> {rec.timeline}
                                </div>
                              </div>
                              <div className="ml-4">
                                <Badge
                                  className={getPriorityColor(rec.priority)}
                                >
                                  {rec.priority === "high"
                                    ? "Alta"
                                    : rec.priority === "medium"
                                      ? "Média"
                                      : "Baixa"}
                                </Badge>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Ações Pendentes</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nova Ação
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {pendingActions.map((action) => (
              <Card
                key={action.id}
                className={action.completed ? "opacity-50" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={action.completed}
                        onChange={() => handleActionComplete(action.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-600">
                          {action.description}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="text-xs text-gray-500">
                            Cliente: {action.clientId}
                          </div>
                          {action.dueDate && (
                            <div className="text-xs text-gray-500">
                              Prazo:{" "}
                              {new Date(action.dueDate).toLocaleDateString(
                                "pt-BR",
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority === "urgent"
                          ? "Urgente"
                          : action.priority === "high"
                            ? "Alta"
                            : action.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                      </Badge>
                      <Badge variant="outline">
                        {action.type === "call"
                          ? "Ligação"
                          : action.type === "email"
                            ? "Email"
                            : action.type === "whatsapp"
                              ? "WhatsApp"
                              : action.type === "appointment"
                                ? "Agendamento"
                                : "Revisão"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Insights e Recomendações AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Insight Principal:</strong> Os dados indicam uma
                    oportunidade de melhoria de 15% na retenção através de
                    comunicação proativa com clientes de médio risco.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Oportunidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Personalização de comunicação pode aumentar
                          engajamento em 25%
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Programa de fidelidade pode reduzir churn em 18%
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Follow-ups automatizados podem melhorar satisfação em
                          12%
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Áreas de Atenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          23 clientes requerem atenção imediata
                        </li>
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          Taxa de resposta para SMS está abaixo do esperado
                        </li>
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          Tempo médio de resposta aumentou nas últimas semanas
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
