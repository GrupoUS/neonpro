"use client";

import type {
  AlertTriangle,
  Brain,
  Clock,
  DollarSign,
  Heart,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import type { useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PredictionResult {
  treatment: string;
  confidence: number;
  reasoning: string;
  expectedResults: string;
  duration: string;
  cost: string;
  riskLevel: "low" | "medium" | "high";
}

interface PatientProfile {
  age: number;
  skinType: string;
  concerns: string[];
  previousTreatments: string[];
  budget: string;
  timeAvailable: string;
}

const mockPredictions: PredictionResult[] = [
  {
    treatment: "Harmonização Facial com Ácido Hialurônico",
    confidence: 94,
    reasoning:
      "Baseado na idade da paciente (32 anos) e preocupações com volume facial, este tratamento é altamente recomendado.",
    expectedResults: "Rejuvenescimento facial, melhora do contorno e hidratação profunda",
    duration: "45-60 minutos",
    cost: "R$ 1.200 - R$ 2.000",
    riskLevel: "low",
  },
  {
    treatment: "Botox para Rugas de Expressão",
    confidence: 87,
    reasoning: "Paciente apresenta linhas de expressão moderadas na testa e região dos olhos.",
    expectedResults: "Redução significativa de rugas dinâmicas e prevenção de novas linhas",
    duration: "20-30 minutos",
    cost: "R$ 800 - R$ 1.500",
    riskLevel: "low",
  },
  {
    treatment: "Peeling Químico Médio",
    confidence: 76,
    reasoning: "Indicado para melhora da textura da pele e manchas solares identificadas.",
    expectedResults: "Pele mais uniforme, redução de manchas e melhora da textura",
    duration: "30-45 minutos",
    cost: "R$ 600 - R$ 1.200",
    riskLevel: "medium",
  },
];

export default function TreatmentPredictionDashboard() {
  const [patientData, setPatientData] = useState<Partial<PatientProfile>>({});
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simular análise de IA
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setPredictions(mockPredictions);
    setIsAnalyzing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <Heart className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Predição de Tratamentos</h2>
          <p className="text-muted-foreground">
            Sistema de IA para recomendação personalizada de tratamentos estéticos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            IA Avançada
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Tempo Real
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Análise do Paciente</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Paciente
              </CardTitle>
              <CardDescription>
                Insira os dados do paciente para análise e predição de tratamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 32"
                    value={patientData.age || ""}
                    onChange={(e) =>
                      setPatientData((prev) => ({ ...prev, age: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skinType">Tipo de Pele</Label>
                  <Select
                    onValueChange={(value) =>
                      setPatientData((prev) => ({ ...prev, skinType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oily">Oleosa</SelectItem>
                      <SelectItem value="dry">Seca</SelectItem>
                      <SelectItem value="mixed">Mista</SelectItem>
                      <SelectItem value="sensitive">Sensível</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento</Label>
                  <Select
                    onValueChange={(value) =>
                      setPatientData((prev) => ({ ...prev, budget: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Faixa de investimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">R$ 500 - R$ 1.000</SelectItem>
                      <SelectItem value="medium">R$ 1.000 - R$ 3.000</SelectItem>
                      <SelectItem value="high">R$ 3.000 - R$ 8.000</SelectItem>
                      <SelectItem value="premium">Acima de R$ 8.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concerns">Principais Preocupações</Label>
                <Input
                  id="concerns"
                  placeholder="Ex: rugas, flacidez, manchas, volume facial..."
                  onChange={(e) =>
                    setPatientData((prev) => ({
                      ...prev,
                      concerns: e.target.value.split(",").map((c) => c.trim()),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previous">Tratamentos Anteriores</Label>
                <Input
                  id="previous"
                  placeholder="Ex: botox, preenchimento, peeling..."
                  onChange={(e) =>
                    setPatientData((prev) => ({
                      ...prev,
                      previousTreatments: e.target.value.split(",").map((t) => t.trim()),
                    }))
                  }
                />
              </div>

              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full" size="lg">
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analisar e Predizer Tratamentos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma Predição Disponível</h3>
                <p className="text-muted-foreground text-center">
                  Preencha os dados do paciente na aba "Análise do Paciente" para gerar predições.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{prediction.treatment}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {prediction.confidence}% Confiança
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 ${getRiskColor(prediction.riskLevel)}`}
                          >
                            {getRiskIcon(prediction.riskLevel)}
                            Risco{" "}
                            {prediction.riskLevel === "low"
                              ? "Baixo"
                              : prediction.riskLevel === "medium"
                                ? "Médio"
                                : "Alto"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                        <div className="text-xs text-muted-foreground">Recomendação</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Justificativa da IA</Label>
                      <p className="text-sm text-muted-foreground mt-1">{prediction.reasoning}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Resultados Esperados
                        </Label>
                        <p className="text-muted-foreground mt-1">{prediction.expectedResults}</p>
                      </div>
                      <div>
                        <Label className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duração
                        </Label>
                        <p className="text-muted-foreground mt-1">{prediction.duration}</p>
                      </div>
                      <div>
                        <Label className="font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Investimento
                        </Label>
                        <p className="text-muted-foreground mt-1">{prediction.cost}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Confiança</Label>
                        <div className="mt-1">
                          <Progress value={prediction.confidence} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {prediction.confidence}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        Agendar Consulta
                      </Button>
                      <Button size="sm" variant="outline">
                        Mais Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        Compartilhar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800 mb-1">Padrão Identificado</div>
                  <p className="text-sm text-blue-700">
                    Pacientes com perfil similar têm 89% de satisfação com harmonização facial
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800 mb-1">Timing Ideal</div>
                  <p className="text-sm text-green-700">
                    Melhor período para iniciar tratamentos: próximas 2-4 semanas
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-800 mb-1">Combinação Sugerida</div>
                  <p className="text-sm text-orange-700">
                    Botox + Harmonização pode oferecer resultados 34% superiores
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Precisão da IA</span>
                  <span className="font-bold">94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfação dos Pacientes</span>
                  <span className="font-bold">96.8%</span>
                </div>
                <Progress value={96.8} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conversão</span>
                  <span className="font-bold">87.3%</span>
                </div>
                <Progress value={87.3} className="h-2" />

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <strong>1,247</strong> predições realizadas este mês
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>892</strong> tratamentos agendados
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
