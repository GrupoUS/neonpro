"use client";

/**
 * PatientOutcomePrediction - AI-Powered Patient Outcome Forecasting
 *
 * Advanced machine learning component for predicting treatment outcomes,
 * recovery timelines, and success probabilities for Brazilian healthcare.
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  AlternativeTreatment,
  ComplicationPrediction,
  PatientOutcomePredictionProps,
  PredictiveIntelligence,
  RecoveryMilestone,
} from "@/types/analytics";
import {
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

// ====== MOCK PREDICTION DATA ======
const mockPredictionData: PredictiveIntelligence = {
  patientId: "patient-123",
  generatedAt: new Date(),
  predictions: {
    outcomeScore: 87, // 87% likelihood of successful treatment
    riskLevel: "medium",
    noShowProbability: 0.12, // 12% probability of no-show
    treatmentDuration: 21, // 21 days
    complications: [
      {
        type: "Inchaço leve",
        probability: 0.25,
        severity: "minor",
        timeframe: 3,
        preventionStrategies: [
          "Compressas frias",
          "Elevação da área",
          "Anti-inflamatórios",
        ],
        warningSignals: [
          "Vermelhidão excessiva",
          "Dor crescente",
          "Temperatura local",
        ],
      },
      {
        type: "Hiperpigmentação temporária",
        probability: 0.15,
        severity: "minor",
        timeframe: 14,
        preventionStrategies: [
          "Protetor solar FPS 50+",
          "Evitar exposição solar",
          "Hidratação",
        ],
        warningSignals: ["Escurecimento da pele", "Manchas irregulares"],
      },
      {
        type: "Reação alérgica",
        probability: 0.08,
        severity: "moderate",
        timeframe: 1,
        preventionStrategies: [
          "Teste de alergia prévio",
          "Anti-histamínicos",
          "Monitoramento",
        ],
        warningSignals: [
          "Coceira intensa",
          "Urticária",
          "Dificuldade respiratória",
        ],
      },
    ],
    recoveryTimeline: [
      {
        milestone: "Redução inicial do inchaço",
        expectedDay: 3,
        probability: 0.92,
        dependencies: ["Cuidados pós-procedimento", "Repouso adequado"],
        criticalFactors: ["Hidratação", "Compressas frias"],
      },
      {
        milestone: "Retorno às atividades normais",
        expectedDay: 7,
        probability: 0.85,
        dependencies: ["Ausência de complicações", "Seguimento das instruções"],
        criticalFactors: ["Evitar exercícios intensos", "Proteção solar"],
      },
      {
        milestone: "Resultado parcial visível",
        expectedDay: 14,
        probability: 0.78,
        dependencies: ["Cicatrização adequada", "Cuidados contínuos"],
        criticalFactors: ["Regeneração celular", "Resposta individual"],
      },
      {
        milestone: "Resultado final esperado",
        expectedDay: 21,
        probability: 0.87,
        dependencies: [
          "Todos os marcos anteriores",
          "Ausência de complicações",
        ],
        criticalFactors: ["Healing response", "Patient compliance"],
      },
    ],
  },
  recommendations: {
    optimalTreatment: {
      id: "treatment-opt-1",
      name: "Protocolo Otimizado Laser + Bioestimulação",
      description: "Combinação de laser fracionado com bioestimulação para maximizar resultados",
      steps: [],
      duration: 21,
      cost: 0,
      successProbability: 0.87,
    },
    preventiveMeasures: [
      {
        id: "prev-1",
        action: "Aplicar protetor solar FPS 50+ diariamente",
        priority: "high",
        timeframe: "21 dias",
        importance: 0.95,
      },
      {
        id: "prev-2",
        action: "Evitar exposição solar direta por 2 semanas",
        priority: "critical",
        timeframe: "14 dias",
        importance: 0.98,
      },
      {
        id: "prev-3",
        action: "Usar compressas frias 3x ao dia nos primeiros 5 dias",
        priority: "medium",
        timeframe: "5 dias",
        importance: 0.75,
      },
    ],
    followUpSchedule: {
      appointments: [
        {
          day: 3,
          type: "check-up",
          importance: "high",
          description: "Avaliação inicial pós-procedimento",
        },
        {
          day: 7,
          type: "follow-up",
          importance: "medium",
          description: "Verificação da cicatrização",
        },
        {
          day: 14,
          type: "assessment",
          importance: "high",
          description: "Análise dos resultados parciais",
        },
        {
          day: 21,
          type: "final",
          importance: "critical",
          description: "Avaliação final dos resultados",
        },
      ],
    },
    riskMitigation: [
      {
        risk: "Hiperpigmentação",
        strategy: "Uso rigoroso de protetor solar e evitar exposição UV",
        probability: 0.85,
        impact: "low",
      },
      {
        risk: "Inchaço prolongado",
        strategy: "Compressas frias regulares e elevação da área tratada",
        probability: 0.9,
        impact: "medium",
      },
    ],
    resourceAllocation: [
      {
        resource: "Tempo de consulta",
        recommended: "45 minutos",
        rationale: "Paciente requer explicações detalhadas devido ao perfil ansioso",
      },
      {
        resource: "Follow-up adicional",
        recommended: "1 consulta extra",
        rationale: "Histórico familiar de cicatrização lenta",
      },
    ],
  },
  confidence: 0.91,
  modelVersion: "neonpro-prediction-v2.1",
  trainingDataDate: new Date("2024-12-01"),
};

const alternativeTreatments: AlternativeTreatment[] = [
  {
    treatmentId: "alt-1",
    name: "Laser CO2 Fracionado",
    successProbability: 0.82,
    costDifference: -500,
    timeDifference: -3,
    riskProfile: { overallRisk: "low", complications: [] },
    suitabilityScore: 78,
  },
  {
    treatmentId: "alt-2",
    name: "Microagulhamento + Radiofrequência",
    successProbability: 0.79,
    costDifference: -800,
    timeDifference: 5,
    riskProfile: { overallRisk: "low", complications: [] },
    suitabilityScore: 85,
  },
  {
    treatmentId: "alt-3",
    name: "Peeling Químico Profundo",
    successProbability: 0.73,
    costDifference: -1200,
    timeDifference: -7,
    riskProfile: { overallRisk: "medium", complications: [] },
    suitabilityScore: 65,
  },
];

export default function PatientOutcomePrediction({
  patientId: _patientId,
  treatmentId: _treatmentId,
  predictionModels = ["neonpro-prediction-v2.1"],
  confidenceThreshold: _confidenceThreshold = 0.7,
  showAlternatives = true,
  interactiveCharts: _interactiveCharts = true,
}: PatientOutcomePredictionProps) {
  // ====== STATE MANAGEMENT ======
  const [prediction, setPrediction] = useState<PredictiveIntelligence>(mockPredictionData);
  const [selectedModel, setSelectedModel] = useState(predictionModels[0]);
  const [activeTab, setActiveTab] = useState("prediction");
  const [showDetails, setShowDetails] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ====== DATA HANDLERS ======
  const handleRefreshPrediction = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for fresh prediction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, fetch new prediction data
      setPrediction({
        ...prediction,
        generatedAt: new Date(),
        confidence: 0.88 + Math.random() * 0.1, // Simulate slight variation
      });
    } catch (error) {
      console.error("Failed to refresh prediction:", error);
    } finally {
      setRefreshing(false);
    }
  }, [prediction]);

  const toggleDetailsExpansion = useCallback((itemId: string) => {
    setShowDetails((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // ====== COMPUTED VALUES ======
  const outcomeCategory = useMemo(() => {
    const score = prediction.predictions.outcomeScore;
    if (score >= 85) {
      return {
        label: "Excelente",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    }
    if (score >= 75) {
      return { label: "Bom", color: "text-blue-600", bgColor: "bg-blue-50" };
    }
    if (score >= 60) {
      return {
        label: "Moderado",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    }
    return { label: "Baixo", color: "text-red-600", bgColor: "bg-red-50" };
  }, [prediction.predictions.outcomeScore]);

  const riskLevelConfig = useMemo(() => {
    const risk = prediction.predictions.riskLevel;
    switch (risk) {
      case "low":
        return {
          label: "Baixo",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: CheckCircle,
        };
      case "medium":
        return {
          label: "Médio",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: AlertTriangle,
        };
      case "high":
        return {
          label: "Alto",
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          icon: AlertTriangle,
        };
      case "critical":
        return {
          label: "Crítico",
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Médio",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: AlertTriangle,
        };
    }
  }, [prediction.predictions.riskLevel]);

  const highRiskComplications = useMemo(
    () =>
      prediction.predictions.complications.filter(
        (comp) =>
          comp.probability > 0.2
          || comp.severity === "severe"
          || comp.severity === "critical",
      ),
    [prediction.predictions.complications],
  );

  const confidenceLevel = useMemo(() => {
    const conf = prediction.confidence;
    if (conf >= 0.9) {
      return { label: "Muito Alta", color: "text-green-600" };
    }
    if (conf >= 0.8) {
      return { label: "Alta", color: "text-blue-600" };
    }
    if (conf >= 0.7) {
      return { label: "Moderada", color: "text-yellow-600" };
    }
    return { label: "Baixa", color: "text-red-600" };
  }, [prediction.confidence]);

  // ====== RENDER COMPONENTS ======
  const renderComplicationCard = (
    complication: ComplicationPrediction,
    index: number,
  ) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-full",
                complication.severity === "critical"
                  ? "bg-red-100 text-red-600"
                  : complication.severity === "severe"
                  ? "bg-orange-100 text-orange-600"
                  : complication.severity === "moderate"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600",
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{complication.type}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={complication.severity === "critical"
                    ? "destructive"
                    : complication.severity === "severe"
                    ? "destructive"
                    : complication.severity === "moderate"
                    ? "secondary"
                    : "outline"}
                >
                  {complication.severity === "critical"
                    ? "Crítico"
                    : complication.severity === "severe"
                    ? "Grave"
                    : complication.severity === "moderate"
                    ? "Moderado"
                    : "Leve"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {(complication.probability * 100).toFixed(0)}% probabilidade
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Dia {complication.timeframe}
            </div>
            <div className="text-xs text-muted-foreground">Esperado</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Progress value={complication.probability * 100} className="h-2" />

          <div className="space-y-2">
            <div>
              <div className="text-sm font-medium mb-1">
                Estratégias de Prevenção:
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {complication.preventionStrategies.map((strategy, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-medium mb-1 text-orange-600">
                Sinais de Alerta:
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {complication.warningSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <AlertTriangle className="h-3 w-3 mt-1 text-orange-500 flex-shrink-0" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRecoveryMilestone = (
    milestone: RecoveryMilestone,
    index: number,
  ) => (
    <div
      key={index}
      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
          {milestone.expectedDay}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Dia</div>
      </div>
      <div className="flex-1">
        <div className="font-medium">{milestone.milestone}</div>
        <div className="flex items-center space-x-3 mt-1">
          <Badge variant="outline">
            {(milestone.probability * 100).toFixed(0)}% probabilidade
          </Badge>
          <Progress
            value={milestone.probability * 100}
            className="h-1 flex-1 max-w-24"
          />
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Fatores críticos: {milestone.criticalFactors.join(", ")}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleDetailsExpansion(`milestone-${index}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderAlternativeTreatment = (treatment: AlternativeTreatment) => (
    <Card
      key={treatment.treatmentId}
      className="hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{treatment.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">
                {(treatment.successProbability * 100).toFixed(0)}% sucesso
              </Badge>
              <Badge
                variant={treatment.suitabilityScore >= 80 ? "default" : "secondary"}
              >
                {treatment.suitabilityScore}/100 adequação
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-sm font-medium",
                treatment.costDifference < 0
                  ? "text-green-600"
                  : "text-red-600",
              )}
            >
              {treatment.costDifference < 0 ? "-" : "+"}R$ {Math.abs(treatment.costDifference)}
            </div>
            <div className="text-xs text-muted-foreground">
              {treatment.timeDifference} dias diferença
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa de Sucesso</span>
            <Progress
              value={treatment.successProbability * 100}
              className="h-2 w-24"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Adequação ao Paciente</span>
            <Progress value={treatment.suitabilityScore} className="h-2 w-24" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risco:</span>
            <Badge
              variant={treatment.riskProfile.overallRisk === "low"
                ? "outline"
                : treatment.riskProfile.overallRisk === "medium"
                ? "secondary"
                : "destructive"}
            >
              {treatment.riskProfile.overallRisk === "low"
                ? "Baixo"
                : treatment.riskProfile.overallRisk === "medium"
                ? "Médio"
                : "Alto"}
            </Badge>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            Comparar Detalhadamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ====== MAIN RENDER ======
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Predição de Resultados
          </h2>
          <p className="text-muted-foreground">
            Análise preditiva baseada em IA para otimização de tratamentos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Modelo de IA" />
            </SelectTrigger>
            <SelectContent>
              {predictionModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPrediction}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Confidence and Model Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Modelo: {selectedModel}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Treinado em: {prediction.trainingDataDate.toLocaleDateString("pt-BR")}
            </div>
            <div className="text-sm text-muted-foreground">
              Gerado: {prediction.generatedAt.toLocaleTimeString("pt-BR")}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Confiança:{" "}
              <span className={cn("font-bold", confidenceLevel.color)}>
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <Badge
              className={cn(
                "text-white",
                confidenceLevel.color.replace("text-", "bg-"),
              )}
            >
              {confidenceLevel.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outcome Score */}
        <Card
          className={cn("relative overflow-hidden", outcomeCategory.bgColor)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Target className={cn("h-5 w-5", outcomeCategory.color)} />
              <span>Probabilidade de Sucesso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className={cn("text-4xl font-bold", outcomeCategory.color)}>
                {prediction.predictions.outcomeScore}%
              </div>
              <Badge
                className={cn(
                  "text-white",
                  outcomeCategory.color.replace("text-", "bg-"),
                )}
              >
                {outcomeCategory.label}
              </Badge>
            </div>
            <Progress
              value={prediction.predictions.outcomeScore}
              className="mt-4 h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card
          className={cn("relative overflow-hidden", riskLevelConfig.bgColor)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <riskLevelConfig.icon
                className={cn("h-5 w-5", riskLevelConfig.color)}
              />
              <span>Nível de Risco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className={cn("text-2xl font-bold", riskLevelConfig.color)}>
                {riskLevelConfig.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {highRiskComplications.length} complicações de atenção
              </div>
            </div>
            {highRiskComplications.length > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Monitorar sinais de: {highRiskComplications.map((c) => c.type).join(", ")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Treatment Duration */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Duração Esperada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">
                {prediction.predictions.treatmentDuration}
              </div>
              <div className="text-sm text-muted-foreground">dias</div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>No-Show Risk:</span>
                <span className="font-medium">
                  {(prediction.predictions.noShowProbability * 100).toFixed(0)}%
                </span>
              </div>
              <Progress
                value={prediction.predictions.noShowProbability * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Prediction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="prediction"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Predição</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Cronograma</span>
          </TabsTrigger>
          <TabsTrigger
            value="complications"
            className="flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Riscos</span>
          </TabsTrigger>
          {showAlternatives && (
            <TabsTrigger
              value="alternatives"
              className="flex items-center space-x-2"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Alternativas</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Prediction Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Fatores Preditivos Principais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Elementos que mais influenciam o resultado previsto
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      factor: "Histórico de tratamentos similares",
                      impact: 85,
                      positive: true,
                    },
                    {
                      factor: "Tipo de pele e resposta",
                      impact: 78,
                      positive: true,
                    },
                    { factor: "Idade do paciente", impact: 65, positive: true },
                    {
                      factor: "Compliance com instruções",
                      impact: 72,
                      positive: true,
                    },
                    {
                      factor: "Fatores de risco identificados",
                      impact: 45,
                      positive: false,
                    },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {item.factor}
                        </span>
                        <div className="flex items-center space-x-2">
                          {item.positive
                            ? <TrendingUp className="h-4 w-4 text-green-500" />
                            : <TrendingDown className="h-4 w-4 text-red-500" />}
                          <span className="text-sm font-medium">
                            {item.impact}%
                          </span>
                        </div>
                      </div>
                      <Progress value={item.impact} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ações sugeridas para otimizar resultados
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prediction.recommendations.preventiveMeasures.map(
                    (measure, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg"
                      >
                        <div
                          className={cn(
                            "p-1 rounded-full mt-1",
                            measure.priority === "critical"
                              ? "bg-red-100 text-red-600"
                              : measure.priority === "high"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600",
                          )}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {measure.action}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={measure.priority === "critical"
                                ? "destructive"
                                : measure.priority === "high"
                                ? "secondary"
                                : "outline"}
                              className="text-xs"
                            >
                              {measure.priority === "critical"
                                ? "Crítico"
                                : measure.priority === "high"
                                ? "Alto"
                                : "Médio"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {measure.timeframe}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Impacto: {(measure.importance * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Recuperação</CardTitle>
              <p className="text-sm text-muted-foreground">
                Marcos esperados durante o processo de recuperação
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.predictions.recoveryTimeline.map(
                  renderRecoveryMilestone,
                )}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Agendamento de Acompanhamento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consultas recomendadas para monitoramento
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediction.recommendations.followUpSchedule.appointments.map(
                  (apt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                          {apt.day}
                        </div>
                        <div>
                          <div className="font-medium">{apt.description}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {apt.type} • Importância: {apt.importance}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Agendar
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prediction.predictions.complications.map(renderComplicationCard)}
          </div>

          {/* Risk Mitigation Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Estratégias de Mitigação de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.recommendations.riskMitigation.map(
                  (strategy, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 border rounded-lg"
                    >
                      <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{strategy.risk}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {strategy.strategy}
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            {(strategy.probability * 100).toFixed(0)}% efetividade
                          </Badge>
                          <Badge
                            variant={strategy.impact === "low"
                              ? "outline"
                              : strategy.impact === "medium"
                              ? "secondary"
                              : "destructive"}
                          >
                            Impacto: {strategy.impact}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showAlternatives && (
          <TabsContent value="alternatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tratamentos Alternativos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Opções alternativas com análise comparativa baseada em IA
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {alternativeTreatments.map(renderAlternativeTreatment)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
