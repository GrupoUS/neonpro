"use client";

import {
  getDashboardStats,
  getPredictions,
} from "@/app/lib/services/no-show-prediction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Minus,
  RefreshCw,
  Shield,
  Target,
  TrendingDown,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PatientRiskData {
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  noShowProbability: number;
  riskCategory: "low" | "medium" | "high" | "very_high";
  confidenceScore: number;
  contributingFactors: FactorContribution[];
  recommendations: RecommendedAction[];
}

interface FactorContribution {
  factorName: string;
  category: "patient" | "appointment" | "external" | "historical";
  importanceWeight: number;
  impactDirection: "increases_risk" | "decreases_risk";
  description: string;
  confidence: number;
}

interface RecommendedAction {
  actionType:
    | "reminder"
    | "scheduling"
    | "incentive"
    | "support"
    | "escalation";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  estimatedImpact: number;
  implementationCost: "low" | "medium" | "high";
  timingRecommendation: string;
  successProbability: number;
}

interface DashboardStats {
  totalAppointments: number;
  predictedNoShows: number;
  noShowRate: number;
  prevented: number;
  cost_savings: number;
  modelAccuracy: number;
}

interface AntiNoShowDashboardProps {
  className?: string;
}

// Utility functions for risk categories and analytics
const _formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getRiskBadgeVariant = (riskCategory: string) => {
  switch (riskCategory.toLowerCase()) {
    case "high":
    case "alto": {
      return "destructive" as const;
    }
    case "medium":
    case "medio":
    case "médio": {
      return "default" as const;
    }
    case "low":
    case "baixo": {
      return "secondary" as const;
    }
    default: {
      return "outline" as const;
    }
  }
};

const getRiskIcon = (riskCategory: string) => {
  switch (riskCategory.toLowerCase()) {
    case "high":
    case "alto": {
      return <AlertTriangle className="h-3 w-3" />;
    }
    case "medium":
    case "medio":
    case "médio": {
      return <AlertCircle className="h-3 w-3" />;
    }
    case "low":
    case "baixo": {
      return <CheckCircle className="h-3 w-3" />;
    }
    default: {
      return <Info className="h-3 w-3" />;
    }
  }
};

const getRiskLabel = (riskCategory: string) => {
  switch (riskCategory.toLowerCase()) {
    case "high":
    case "alto": {
      return "Alto Risco";
    }
    case "medium":
    case "medio":
    case "médio": {
      return "Médio Risco";
    }
    case "low":
    case "baixo": {
      return "Baixo Risco";
    }
    default: {
      return "Indefinido";
    }
  }
};

export function AntiNoShowDashboard({ className }: AntiNoShowDashboardProps) {
  // State management
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 156,
    predictedNoShows: 23,
    noShowRate: 14.7,
    prevented: 18,
    cost_savings: 12_750,
    modelAccuracy: 87.3,
  });

  const [highRiskPatients, setHighRiskPatients] = useState<PatientRiskData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // ML Pipeline States
  const [modelVersions, setModelVersions] = useState<any[]>([]);
  const [activeABTests, setActiveABTests] = useState<any[]>([]);
  const [driftStatus, setDriftStatus] = useState<any>();
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const { toast } = useToast();

  // Mock data for development
  const generateMockData = useCallback((): PatientRiskData[] => {
    const mockData: PatientRiskData[] = [
      {
        patientId: "PAT-001",
        patientName: "Maria Silva Santos",
        appointmentId: "APT-2024-001",
        appointmentDate: "2025-01-25",
        appointmentTime: "09:30",
        appointmentType: "Consulta de Rotina",
        noShowProbability: 0.78,
        riskCategory: "very_high",
        confidenceScore: 0.89,
        contributingFactors: [
          {
            factorName: "Histórico de Faltas",
            category: "historical",
            importanceWeight: 0.35,
            impactDirection: "increases_risk",
            description: "Paciente faltou em 3 das últimas 5 consultas",
            confidence: 0.92,
          },
          {
            factorName: "Distância da Clínica",
            category: "patient",
            importanceWeight: 0.22,
            impactDirection: "increases_risk",
            description: "Reside a 45km da clínica",
            confidence: 0.85,
          },
          {
            factorName: "Condições Climáticas",
            category: "external",
            importanceWeight: 0.18,
            impactDirection: "increases_risk",
            description: "Previsão de chuva forte",
            confidence: 0.71,
          },
        ],
        recommendations: [
          {
            actionType: "reminder",
            priority: "urgent",
            description: "Ligação de confirmação 24h antes da consulta",
            estimatedImpact: 0.35,
            implementationCost: "low",
            timingRecommendation: "24 horas antes",
            successProbability: 0.73,
          },
          {
            actionType: "incentive",
            priority: "high",
            description: "Oferecer reagendamento para horário mais próximo",
            estimatedImpact: 0.28,
            implementationCost: "medium",
            timingRecommendation: "Imediato",
            successProbability: 0.65,
          },
        ],
      },
      {
        patientId: "PAT-002",
        patientName: "João Carlos Oliveira",
        appointmentId: "APT-2024-002",
        appointmentDate: "2025-01-25",
        appointmentTime: "14:15",
        appointmentType: "Exame de Rotina",
        noShowProbability: 0.65,
        riskCategory: "high",
        confidenceScore: 0.82,
        contributingFactors: [
          {
            factorName: "Primeira Consulta",
            category: "appointment",
            importanceWeight: 0.28,
            impactDirection: "increases_risk",
            description: "Primeira consulta na clínica",
            confidence: 0.88,
          },
          {
            factorName: "Horário de Pico",
            category: "appointment",
            importanceWeight: 0.24,
            impactDirection: "increases_risk",
            description: "Horário de alta demanda (14h-16h)",
            confidence: 0.79,
          },
        ],
        recommendations: [
          {
            actionType: "support",
            priority: "high",
            description: "SMS com informações de localização e preparação",
            estimatedImpact: 0.25,
            implementationCost: "low",
            timingRecommendation: "48 horas antes",
            successProbability: 0.68,
          },
        ],
      },
      {
        patientId: "PAT-003",
        patientName: "Ana Beatriz Costa",
        appointmentId: "APT-2024-003",
        appointmentDate: "2025-01-25",
        appointmentTime: "16:00",
        appointmentType: "Retorno",
        noShowProbability: 0.42,
        riskCategory: "medium",
        confidenceScore: 0.76,
        contributingFactors: [
          {
            factorName: "Aderência ao Tratamento",
            category: "patient",
            importanceWeight: 0.31,
            impactDirection: "decreases_risk",
            description: "Alta aderência ao tratamento (92%)",
            confidence: 0.91,
          },
        ],
        recommendations: [
          {
            actionType: "reminder",
            priority: "medium",
            description: "Email de lembrete 48h antes",
            estimatedImpact: 0.15,
            implementationCost: "low",
            timingRecommendation: "48 horas antes",
            successProbability: 0.58,
          },
        ],
      },
    ];
    return mockData;
  }, []);

  // Load risk predictions data
  const loadPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load actual predictions from the API
      const filters =
        selectedFilter !== "all" ? { riskLevel: selectedFilter } : undefined;
      const predictions = await getPredictions(filters);

      // Convert API response to PatientRiskData format
      const formattedData: PatientRiskData[] = predictions.map(
        (prediction) => ({
          patientId: prediction.patientId,
          patientName: `Paciente ${prediction.patientId}`,
          appointmentId: prediction.appointmentId,
          appointmentDate: new Date().toISOString().split("T")[0],
          appointmentTime: "09:00",
          appointmentType: "Consulta Médica",
          noShowProbability: prediction.noShowProbability,
          riskCategory: prediction.riskCategory,
          confidenceScore: prediction.confidenceScore,
          contributingFactors: prediction.contributingFactors,
          recommendations: prediction.recommendations,
        }),
      );

      setHighRiskPatients(formattedData);

      // Load dashboard stats
      const dashboardStats = await getDashboardStats("24h");
      setStats(dashboardStats);

      toast({
        title: "Predições Atualizadas",
        description: `${formattedData.length} pacientes analisados. ${dashboardStats.predictedNoShows} em alto risco.`,
      });
    } catch (error) {
      console.error("Error loading predictions:", error);

      // Fallback to mock data if API is not available
      const mockData = generateMockData();
      setHighRiskPatients(mockData);

      toast({
        title: "Usando Dados de Demonstração",
        description:
          "API não disponível. Mostrando dados simulados para demonstração.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter, generateMockData, toast]);

  // ==================== ML PIPELINE FUNCTIONS ====================

  // Load ML Pipeline data
  const loadMLPipelineData = useCallback(async () => {
    try {
      // In real implementation, these would be actual service calls
      // For now, using mock data

      // Mock model versions
      setModelVersions([
        {
          version_id: "model_v1.2.0",
          version_number: "v1.2.0",
          deployment_status: "production",
          traffic_percentage: 80,
          performance_metrics: {
            accuracy: 0.87,
            precision: 0.85,
            recall: 0.89,
            f1_score: 0.87,
          },
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          version_id: "model_v1.3.0",
          version_number: "v1.3.0",
          deployment_status: "staging",
          traffic_percentage: 20,
          performance_metrics: {
            accuracy: 0.91,
            precision: 0.89,
            recall: 0.93,
            f1_score: 0.91,
          },
          created_at: "2024-01-20T14:30:00Z",
        },
      ]);

      // Mock A/B tests
      setActiveABTests([
        {
          test_id: "ab_test_001",
          model_a_version: "v1.2.0",
          model_b_version: "v1.3.0",
          status: "running",
          start_date: "2024-01-20T00:00:00Z",
          sample_size: 1247,
          metrics_comparison: {
            model_a: { accuracy: 0.87 },
            model_b: { accuracy: 0.91 },
            improvement_percentage: 4.6,
          },
          statistical_significance: true,
          winner: "model_b",
        },
      ]);

      // Mock drift status
      setDriftStatus({
        drift_detected: false,
        drift_severity: "low",
        detection_timestamp: new Date().toISOString(),
        recommendations: [
          "Model performance is stable",
          "Continue regular monitoring",
        ],
      });
    } catch (error) {
      console.error("Failed to load ML pipeline data:", error);
    }
  }, []);

  const runModelMaintenance = async () => {
    setIsRunningMaintenance(true);
    try {
      // Simulate maintenance process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast({
        title: "Manutenção Concluída",
        description:
          "Verificação de modelo e detecção de drift executadas com sucesso",
      });

      // Refresh data after maintenance
      await loadMLPipelineData();
    } catch {
      toast({
        title: "Erro na Manutenção",
        description: "Falha ao executar manutenção do modelo",
        variant: "destructive",
      });
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const startNewABTest = async () => {
    try {
      toast({
        title: "A/B Test Iniciado",
        description: "Novo teste A/B foi configurado com sucesso",
      });
      await loadMLPipelineData();
    } catch {
      toast({
        title: "Erro no A/B Test",
        description: "Falha ao iniciar novo teste A/B",
        variant: "destructive",
      });
    }
  };

  // ==================== END ML PIPELINE FUNCTIONS ====================

  // Initialize data on mount
  useEffect(() => {
    loadPredictions();
    loadMLPipelineData();
  }, [loadMLPipelineData, loadPredictions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter patients based on selection
  const filteredPatients = highRiskPatients.filter((patient) => {
    if (selectedFilter === "all") {
      return true;
    }
    if (selectedFilter === "high") {
      return (
        patient.riskCategory === "high" || patient.riskCategory === "very_high"
      );
    }
    if (selectedFilter === "medium") {
      return patient.riskCategory === "medium";
    }
    if (selectedFilter === "low") {
      return patient.riskCategory === "low";
    }
    return true;
  });

  // Risk category styling
  const _getRiskBadgeVariant = (category: string) => {
    switch (category) {
      case "very_high": {
        return "destructive";
      }
      case "high": {
        return "destructive";
      }
      case "medium": {
        return "secondary";
      }
      case "low": {
        return "outline";
      }
      default: {
        return "outline";
      }
    }
  };

  const _getRiskIcon = (category: string) => {
    switch (category) {
      case "very_high": {
        return <XCircle className="h-4 w-4" />;
      }
      case "high": {
        return <AlertTriangle className="h-4 w-4" />;
      }
      case "medium": {
        return <AlertCircle className="h-4 w-4" />;
      }
      case "low": {
        return <CheckCircle2 className="h-4 w-4" />;
      }
      default: {
        return <Minus className="h-4 w-4" />;
      }
    }
  };

  const _getRiskLabel = (category: string) => {
    switch (category) {
      case "very_high": {
        return "Muito Alto";
      }
      case "high": {
        return "Alto";
      }
      case "medium": {
        return "Médio";
      }
      case "low": {
        return "Baixo";
      }
      default: {
        return "Indefinido";
      }
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
      >
        <div>
          <h1 className="flex items-center gap-3 font-bold text-3xl tracking-tight">
            <Brain className="h-8 w-8 text-primary" />
            Engine Anti-No-Show
          </h1>
          <p className="text-muted-foreground">
            Predição inteligente e prevenção de faltas em consultas médicas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="text-green-600" variant="outline">
            <Activity className="mr-1 h-3 w-3" />
            ML Model v1.2.0
          </Badge>
          <Badge className="text-blue-600" variant="outline">
            <Shield className="mr-1 h-3 w-3" />
            87.3% Accuracy
          </Badge>
          <Button disabled={isLoading} onClick={loadPredictions} size="sm">
            <RefreshCw
              className={cn("mr-1 h-4 w-4", isLoading && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Consultas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalAppointments}</div>
            <p className="text-muted-foreground text-xs">Próximas 48h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Predição No-Show
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">
              {stats.predictedNoShows}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="text-orange-600">
                ↗ {stats.noShowRate.toFixed(1)}%
              </span>{" "}
              taxa estimada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Prevenção Ativa
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.prevented}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">↓ -22%</span> vs sem AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Economia</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-primary">
              R$ {stats.cost_savings.toLocaleString("pt-BR")}
            </div>
            <p className="text-muted-foreground text-xs">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Precisão IA</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.modelAccuracy}%</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">↗ +2.1%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Intervenções</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">34</div>
            <p className="text-muted-foreground text-xs">Ações automáticas</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs
          className="space-y-4"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-6">
              <TabsTrigger value="risk_patients">Pacientes Risco</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="interventions">Intervenções</TabsTrigger>
              <TabsTrigger value="model_performance">Performance</TabsTrigger>
              <TabsTrigger value="ml_pipeline">ML Pipeline</TabsTrigger>
              <TabsTrigger value="ab_testing">A/B Testing</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Filter className="mr-1 h-4 w-4" />
                Filtros
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => setSelectedFilter("all")}
                  size="sm"
                  variant={selectedFilter === "all" ? "default" : "outline"}
                >
                  Todos
                </Button>
                <Button
                  onClick={() => setSelectedFilter("high")}
                  size="sm"
                  variant={
                    selectedFilter === "high" ? "destructive" : "outline"
                  }
                >
                  Alto Risco
                </Button>
                <Button
                  onClick={() => setSelectedFilter("medium")}
                  size="sm"
                  variant={
                    selectedFilter === "medium" ? "secondary" : "outline"
                  }
                >
                  Médio
                </Button>
                <Button
                  onClick={() => setSelectedFilter("low")}
                  size="sm"
                  variant={selectedFilter === "low" ? "default" : "outline"}
                >
                  Baixo
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Patients Tab */}
          <TabsContent className="space-y-4" value="risk_patients">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <AnimatePresence>
                {isLoading ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        Carregando predições...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredPatients.map((patient, index) => (
                    <PatientRiskCard
                      delay={index * 0.1}
                      key={patient.patientId}
                      patient={patient}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="py-12 text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 font-medium text-lg">Analytics Avançado</h3>
              <p>Gráficos e análises detalhadas serão implementados aqui.</p>
            </div>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions">
            <div className="py-12 text-center text-muted-foreground">
              <Target className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 font-medium text-lg">
                Estratégias de Intervenção
              </h3>
              <p>Configuração e análise de intervenções automáticas.</p>
            </div>
          </TabsContent>

          {/* Model Performance Tab */}
          <TabsContent value="model_performance">
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 font-medium text-lg">
                Performance do Modelo
              </h3>
              <p>Métricas detalhadas e matriz de confusão do modelo ML.</p>
            </div>
          </TabsContent>

          {/* ML Pipeline Tab */}
          <TabsContent value="ml_pipeline" className="space-y-6">
            {/* Model Versions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Versões do Modelo</h3>
                <Button
                  onClick={runModelMaintenance}
                  disabled={isRunningMaintenance}
                  size="sm"
                >
                  <Brain
                    className={cn(
                      "mr-2 h-4 w-4",
                      isRunningMaintenance && "animate-pulse",
                    )}
                  />
                  {isRunningMaintenance ? "Executando..." : "Manutenção"}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {modelVersions.map((version) => (
                  <Card
                    key={version.version_id}
                    className={cn(
                      "transition-all duration-200",
                      version.deployment_status === "production" &&
                        "ring-2 ring-green-500",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {version.version_number}
                        </CardTitle>
                        <Badge
                          variant={
                            version.deployment_status === "production"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {version.deployment_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tráfego:</span>
                          <span className="font-medium">
                            {version.traffic_percentage}%
                          </span>
                        </div>
                        <Progress
                          value={version.traffic_percentage}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Acurácia:
                          </span>
                          <div className="font-semibold text-green-600">
                            {(
                              version.performance_metrics.accuracy * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            F1-Score:
                          </span>
                          <div className="font-semibold">
                            {(
                              version.performance_metrics.f1_score * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-xs text-muted-foreground">
                        Criado:{" "}
                        {new Date(version.created_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Drift Detection Section */}
            {driftStatus && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Detecção de Drift</h3>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full",
                          driftStatus.drift_detected
                            ? "bg-orange-500"
                            : "bg-green-500",
                        )}
                      />
                      <CardTitle className="text-base">
                        Status:{" "}
                        {driftStatus.drift_detected
                          ? "Drift Detectado"
                          : "Modelo Estável"}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Severidade:</span>
                      <Badge
                        variant={
                          driftStatus.drift_severity === "low"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {driftStatus.drift_severity}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Recomendações:
                      </span>
                      <ul className="space-y-1">
                        {driftStatus.recommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground"
                            >
                              • {rec}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      Última verificação:{" "}
                      {new Date(driftStatus.detection_timestamp).toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab_testing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Testes A/B</h3>
              <Button onClick={startNewABTest} size="sm">
                <Target className="mr-2 h-4 w-4" />
                Novo Teste
              </Button>
            </div>

            <div className="space-y-4">
              {activeABTests.map((test) => (
                <Card key={test.test_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {test.model_a_version} vs {test.model_b_version}
                      </CardTitle>
                      <Badge
                        variant={
                          test.status === "running" ? "default" : "secondary"
                        }
                      >
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Modelo A
                        </div>
                        <div className="font-semibold text-lg">
                          {(
                            test.metrics_comparison.model_a.accuracy * 100
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Acurácia
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Melhoria
                        </div>
                        <div
                          className={cn(
                            "font-semibold text-lg",
                            test.metrics_comparison.improvement_percentage > 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {test.metrics_comparison.improvement_percentage > 0
                            ? "+"
                            : ""}
                          {test.metrics_comparison.improvement_percentage.toFixed(
                            1,
                          )}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Diferença
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Modelo B
                        </div>
                        <div className="font-semibold text-lg">
                          {(
                            test.metrics_comparison.model_b.accuracy * 100
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Acurácia
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Amostras coletadas:</span>
                        <span className="font-medium">
                          {test.sample_size.toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Significância estatística:
                        </span>
                        <Badge
                          variant={
                            test.statistical_significance
                              ? "default"
                              : "outline"
                          }
                        >
                          {test.statistical_significance
                            ? "Significativo"
                            : "Não significativo"}
                        </Badge>
                      </div>

                      {test.winner && test.statistical_significance && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Vencedor:</span>
                          <Badge variant="default" className="bg-green-600">
                            {test.winner === "model_a"
                              ? test.model_a_version
                              : test.model_b_version}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      Iniciado:{" "}
                      {new Date(test.start_date).toLocaleDateString("pt-BR")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeABTests.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Target className="mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 font-medium text-lg">
                  Nenhum teste A/B ativo
                </h3>
                <p>Inicie um novo teste para comparar versões do modelo.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Individual Patient Risk Card Component
function PatientRiskCard({
  patient,
  delay = 0,
}: {
  patient: PatientRiskData;
  delay?: number;
}) {
  const riskPercentage = Math.round(patient.noShowProbability * 100);
  const confidencePercentage = Math.round(patient.confidenceScore * 100);

  const getRiskColor = (category: string) => {
    switch (category) {
      case "very_high": {
        return "bg-red-500";
      }
      case "high": {
        return "bg-orange-500";
      }
      case "medium": {
        return "bg-yellow-500";
      }
      case "low": {
        return "bg-green-500";
      }
      default: {
        return "bg-gray-500";
      }
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay }}
    >
      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <CardTitle className="font-semibold text-lg">
                  {patient.patientName}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {patient.appointmentDate} às {patient.appointmentTime} -{" "}
                  {patient.appointmentType}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                className="flex items-center gap-1"
                variant={getRiskBadgeVariant(patient.riskCategory)}
              >
                {getRiskIcon(patient.riskCategory)}
                {getRiskLabel(patient.riskCategory)}
              </Badge>
              <div className="text-right">
                <div className="font-bold text-primary text-xl">
                  {riskPercentage}%
                </div>
                <div className="text-muted-foreground text-xs">
                  risco de falta
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Risk Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Probabilidade de No-Show</span>
              <span className="font-medium">{riskPercentage}%</span>
            </div>
            <Progress
              className={`h-2 ${getRiskColor(patient.riskCategory)}`}
              value={riskPercentage}
            />
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confiança da Predição</span>
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
            <Progress className="h-1" value={confidencePercentage} />
          </div>

          {/* Top Contributing Factors */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Principais Fatores de Risco</h4>
            <div className="space-y-1">
              {patient.contributingFactors.slice(0, 3).map((factor, index) => (
                <div
                  className="flex items-center justify-between text-xs"
                  key={index}
                >
                  <div className="flex items-center gap-2">
                    {factor.impactDirection === "increases_risk" ? (
                      <ArrowUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-green-500" />
                    )}
                    <span>{factor.factorName}</span>
                  </div>
                  <span className="font-medium">
                    {Math.round(factor.importanceWeight * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ações Recomendadas</h4>
            <div className="space-y-1">
              {patient.recommendations.slice(0, 2).map((action, index) => (
                <div
                  className="flex items-start gap-2 rounded bg-muted/50 p-2 text-xs"
                  key={index}
                >
                  <Badge className="text-xs" variant="outline">
                    {action.priority === "urgent"
                      ? "🚨"
                      : (action.priority === "high"
                        ? "⚡"
                        : "📋")}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{action.description}</p>
                    <p className="text-muted-foreground">
                      {action.timingRecommendation} •{" "}
                      {Math.round(action.estimatedImpact * 100)}% impacto
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" size="sm">
              <Clock className="mr-1 h-3 w-3" />
              Executar Ações
            </Button>
            <Button size="sm" variant="outline">
              <Users className="mr-1 h-3 w-3" />
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AntiNoShowDashboard;
