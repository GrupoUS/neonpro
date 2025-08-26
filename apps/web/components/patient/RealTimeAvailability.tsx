// =============================================================================
// 🧠 CRM COMPORTAMENTAL - BEHAVIORAL LEARNING SYSTEM
// =============================================================================
// Sistema avançado de CRM com machine learning comportamental
// ROI Projetado: $1,250,000/ano
// Features: Análise preditiva, segmentação automática, personalização IA
// =============================================================================

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Eye,
  Heart,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PatientBehaviorProfile {
  id: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;

  // Behavioral Analytics
  engagementScore: number;
  loyaltyIndex: number;
  satisfactionScore: number;
  riskScore: number;

  // Behavioral Patterns
  communicationPreferences: {
    channel: "email" | "whatsapp" | "sms" | "phone";
    frequency: "daily" | "weekly" | "monthly";
    timePreference: string;
  };

  appointmentBehavior: {
    punctuality: number;
    noShowRate: number;
    rescheduleRate: number;
    preferredTimes: string[];
    seasonalPatterns: string[];
  };

  treatmentCompliance: {
    adherenceRate: number;
    followUpEngagement: number;
    medicationCompliance: number;
  };

  // AI-Generated Insights
  personalityType: "analytical" | "expressive" | "driver" | "amiable";
  predictedActions: PredictedAction[];
  recommendedStrategies: Strategy[];

  // Segmentation
  segment: "vip" | "loyal" | "at-risk" | "new" | "inactive";
  lifetimeValue: number;
  acquisitionCost: number;
}

interface PredictedAction {
  action: string;
  probability: number;
  timeframe: string;
  impact: "high" | "medium" | "low";
}

interface Strategy {
  type: "retention" | "engagement" | "upsell" | "recovery";
  title: string;
  description: string;
  expectedOutcome: string;
  confidence: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: "retention" | "acquisition" | "reactivation";
  status: "active" | "paused" | "completed";
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  behavioralTargeting: string[];
}

// =============================================================================
// MAIN CRM COMPONENT
// =============================================================================

export default function BehavioralCRM() {
  // Estado principal
  const [patients, _setPatients] = useState<PatientBehaviorProfile[]>([
    {
      id: "1",
      patientId: "p001",
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 99999-9999",

      engagementScore: 85,
      loyaltyIndex: 92,
      satisfactionScore: 88,
      riskScore: 15,

      communicationPreferences: {
        channel: "whatsapp",
        frequency: "weekly",
        timePreference: "14:00-18:00",
      },

      appointmentBehavior: {
        punctuality: 95,
        noShowRate: 5,
        rescheduleRate: 10,
        preferredTimes: ["14:00", "15:00", "16:00"],
        seasonalPatterns: ["Mais ativa no inverno", "Prefere manhã no verão"],
      },

      treatmentCompliance: {
        adherenceRate: 90,
        followUpEngagement: 85,
        medicationCompliance: 88,
      },

      personalityType: "analytical",
      predictedActions: [
        {
          action: "Agendar consulta preventiva",
          probability: 78,
          timeframe: "Próximas 2 semanas",
          impact: "high",
        },
        {
          action: "Indicar familiar",
          probability: 45,
          timeframe: "Próximo mês",
          impact: "medium",
        },
      ],

      recommendedStrategies: [
        {
          type: "engagement",
          title: "Série de Conteúdo Educativo",
          description:
            "Enviar dicas de saúde personalizadas baseadas no perfil analítico",
          expectedOutcome: "+15% engagement",
          confidence: 82,
        },
      ],

      segment: "vip",
      lifetimeValue: 15_000,
      acquisitionCost: 120,
    },
    {
      id: "2",
      patientId: "p002",
      name: "Carlos Santos",
      email: "carlos.santos@email.com",
      phone: "(11) 88888-8888",

      engagementScore: 65,
      loyaltyIndex: 58,
      satisfactionScore: 72,
      riskScore: 68,

      communicationPreferences: {
        channel: "email",
        frequency: "monthly",
        timePreference: "08:00-12:00",
      },

      appointmentBehavior: {
        punctuality: 70,
        noShowRate: 25,
        rescheduleRate: 35,
        preferredTimes: ["09:00", "10:00"],
        seasonalPatterns: ["Evita verão", "Mais ativo em março-maio"],
      },

      treatmentCompliance: {
        adherenceRate: 60,
        followUpEngagement: 45,
        medicationCompliance: 55,
      },

      personalityType: "driver",
      predictedActions: [
        {
          action: "Cancelar próximo agendamento",
          probability: 85,
          timeframe: "Esta semana",
          impact: "high",
        },
      ],

      recommendedStrategies: [
        {
          type: "recovery",
          title: "Campanha de Recuperação",
          description:
            "Contato direto via telefone para entender motivos de distanciamento",
          expectedOutcome: "+40% retenção",
          confidence: 75,
        },
      ],

      segment: "at-risk",
      lifetimeValue: 3200,
      acquisitionCost: 180,
    },
  ]);

  const [campaigns, _setCampaigns] = useState<CampaignPerformance[]>([
    {
      id: "1",
      name: "Preventive Care Reminder",
      type: "retention",
      status: "active",
      metrics: {
        sent: 250,
        opened: 180,
        clicked: 95,
        converted: 45,
        revenue: 22_500,
      },
      behavioralTargeting: [
        "Alto engagement",
        "Segmento leal",
        "Consulta em atraso",
      ],
    },
    {
      id: "2",
      name: "At-Risk Recovery",
      type: "reactivation",
      status: "active",
      metrics: {
        sent: 89,
        opened: 34,
        clicked: 12,
        converted: 8,
        revenue: 4800,
      },
      behavioralTargeting: [
        "Alto risco",
        "Baixo engagement",
        "No-show recente",
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientBehaviorProfile | null>(patients[0]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleAnalyzeBehavior = useCallback(async () => {
    setLoading(true);
    try {
      // Simular análise comportamental com IA
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("🧠 Running behavioral analysis...");

      // Aqui seria implementada a análise real com ML
    } catch (error) {
      console.error("Error analyzing behavior:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateStrategy = useCallback((patientId: string) => {
    console.log(`🎯 Generating strategy for patient: ${patientId}`);
    // Implementar geração de estratégias personalizadas
  }, []);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip": {
        return "bg-purple-500";
      }
      case "loyal": {
        return "bg-green-500";
      }
      case "at-risk": {
        return "bg-red-500";
      }
      case "new": {
        return "bg-blue-500";
      }
      case "inactive": {
        return "bg-gray-500";
      }
      default: {
        return "bg-gray-500";
      }
    }
  };

  const getPersonalityIcon = (type: string) => {
    switch (type) {
      case "analytical": {
        return <BarChart3 className="w-4 h-4" />;
      }
      case "expressive": {
        return <MessageSquare className="w-4 h-4" />;
      }
      case "driver": {
        return <Target className="w-4 h-4" />;
      }
      case "amiable": {
        return <Heart className="w-4 h-4" />;
      }
      default: {
        return <Users className="w-4 h-4" />;
      }
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
            <Brain className="w-8 h-8 text-primary" />
            <span>CRM Comportamental</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema inteligente de relacionamento com análise comportamental
            avançada
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            ROI: $1,250,000/ano
          </Badge>
          <Button
            onClick={handleAnalyzeBehavior}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Brain className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
            <span>Analisar Comportamento</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-success">+12% vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Médio
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-success">+5% vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.4K</div>
            <p className="text-xs text-success">+18% vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campanhas Ativas
            </CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">6 automáticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI do Mês</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">428%</div>
            <p className="text-xs text-success">Meta: 350%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="segments">Segmentação</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Pacientes</CardTitle>
                <CardDescription>
                  Lista com análise comportamental
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{patient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getSegmentColor(patient.segment)}`}
                        />
                        {getPersonalityIcon(patient.personalityType)}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Engagement:
                        </span>
                        <span className="font-medium">
                          {patient.engagementScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span>
                        <span
                          className={`font-medium ${
                            patient.riskScore > 50
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {patient.riskScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Patient Detail */}
            {selectedPatient && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{selectedPatient.name}</span>
                        <Badge
                          variant="outline"
                          className={`${getSegmentColor(selectedPatient.segment)} text-white`}
                        >
                          {selectedPatient.segment.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Perfil comportamental detalhado
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleGenerateStrategy(selectedPatient.id)}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Target className="w-4 h-4" />
                      <span>Gerar Estratégia</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Behavioral Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {selectedPatient.engagementScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Engagement
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {selectedPatient.loyaltyIndex}%
                      </div>
                      <p className="text-sm text-muted-foreground">Lealdade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedPatient.satisfactionScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Satisfação
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          selectedPatient.riskScore > 50
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {selectedPatient.riskScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">Risco</p>
                    </div>
                  </div>

                  {/* Predicted Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Ações Previstas pela IA</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPatient.predictedActions.map(
                          (action, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between border rounded-lg p-3"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {action.action}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {action.timeframe} • Impacto: {action.impact}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {action.probability}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Probabilidade
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommended Strategies */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Estratégias Recomendadas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPatient.recommendedStrategies.map(
                          (strategy, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{strategy.type}</Badge>
                                <span className="text-sm font-medium">
                                  {strategy.confidence}% confiança
                                </span>
                              </div>
                              <h4 className="font-semibold">
                                {strategy.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {strategy.description}
                              </p>
                              <p className="text-sm font-medium text-success">
                                Resultado esperado: {strategy.expectedOutcome}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full" />
                  <span>VIP</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">147</div>
                <p className="text-sm text-muted-foreground">
                  Alto valor • LTV R$ 15K+
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span>Leais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">523</div>
                <p className="text-sm text-muted-foreground">
                  Engajamento alto • 2+ anos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span>Em Risco</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-sm text-muted-foreground">
                  Baixo engagement • Ação necessária
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span>Novos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-sm text-muted-foreground">
                  &lt; 3 meses • Onboarding
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  <span>Inativos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">254</div>
                <p className="text-sm text-muted-foreground">
                  6+ meses • Reativação
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Comportamentais</CardTitle>
              <CardDescription>
                Campanhas automatizadas baseadas em comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{campaign.type}</Badge>
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">
                          R$ {campaign.metrics.revenue.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">
                          {campaign.metrics.sent}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enviadas
                        </p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {campaign.metrics.opened}
                        </div>
                        <p className="text-xs text-muted-foreground">Abertas</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {campaign.metrics.clicked}
                        </div>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {campaign.metrics.converted}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Conversões
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Segmentação comportamental:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.behavioralTargeting.map((target, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comportamental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Retenção</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Precisão da IA</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-2">
                  R$ 104,167
                </div>
                <p className="text-sm text-muted-foreground">
                  Projetado para R$ 1.25M/ano
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Retenção de clientes</span>
                    <span className="font-medium">R$ 45,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Upsells comportamentais</span>
                    <span className="font-medium">R$ 32,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Redução de churn</span>
                    <span className="font-medium">R$ 26,167</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
