/**
 * Scenario Planning Dashboard Component
 * Interface para planejamento de cenários financeiros
 */

"use client";

import React, { useState } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calculator,
  Target,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  Copy,
  Play,
} from "lucide-react";
import type {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { useToast } from "@/hooks/use-toast";
import type {
  useScenarioPlanning,
  useScenarioAnalysis,
  useScenarioComparison,
  useFinancialDecisionSupport,
  useRiskAssessment,
} from "../hooks/use-scenario-planning";
import type { ScenarioParameters } from "../types/cash-flow";

interface ScenarioPlannerProps {
  userId: string;
}

export function ScenarioPlanner({ userId }: ScenarioPlannerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scenarios");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    scenarios,
    activeScenario,
    selectedScenarios,
    comparisonMode,
    isLoadingScenarios,
    createScenario,
    deleteScenario,
    selectScenario,
    toggleComparisonMode,
    toggleScenarioSelection,
  } = useScenarioPlanning();

  const { scenarioDetails, isLoadingDetails } = useScenarioAnalysis(activeScenario);
  const { comparisonData } = useScenarioComparison(selectedScenarios);
  const { riskData, riskAlerts } = useRiskAssessment(activeScenario);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planejamento de Cenários</h2>
          <p className="text-muted-foreground">
            Analise diferentes cenários financeiros e tome decisões estratégicas informadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleComparisonMode}
            className={comparisonMode ? "bg-blue-50 border-blue-200" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {comparisonMode ? "Sair da Comparação" : "Comparar Cenários"}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cenário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateScenarioForm
                userId={userId}
                onSuccess={() => {
                  setShowCreateDialog(false);
                  toast({
                    title: "Cenário criado com sucesso",
                    description: "O novo cenário foi criado e está sendo processado.",
                  });
                }}
                onError={(error) => {
                  toast({
                    title: "Erro ao criar cenário",
                    description: error,
                    variant: "destructive",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded-md ${
                    alert.type === "danger"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="decisions">Suporte à Decisão</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenariosGrid
            scenarios={scenarios}
            activeScenario={activeScenario}
            selectedScenarios={selectedScenarios}
            comparisonMode={comparisonMode}
            isLoading={isLoadingScenarios}
            onSelectScenario={selectScenario}
            onToggleSelection={toggleScenarioSelection}
            onDeleteScenario={deleteScenario}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <ScenarioAnalysis
            scenario={scenarioDetails}
            isLoading={isLoadingDetails}
            riskData={riskData}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ScenarioComparison scenarios={selectedScenarios} comparisonData={comparisonData} />
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <DecisionSupport selectedScenarios={selectedScenarios} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ====================================================================
// SCENARIOS GRID COMPONENT
// ====================================================================

interface ScenariosGridProps {
  scenarios: any[];
  activeScenario: string | null;
  selectedScenarios: string[];
  comparisonMode: boolean;
  isLoading: boolean;
  onSelectScenario: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onDeleteScenario: (id: string) => void;
}

function ScenariosGrid({
  scenarios,
  activeScenario,
  selectedScenarios,
  comparisonMode,
  isLoading,
  onSelectScenario,
  onToggleSelection,
  onDeleteScenario,
}: ScenariosGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calculator className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro cenário financeiro para começar a análise
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Cenário
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          isActive={activeScenario === scenario.id}
          isSelected={selectedScenarios.includes(scenario.id)}
          comparisonMode={comparisonMode}
          onSelect={() => onSelectScenario(scenario.id)}
          onToggleSelection={() => onToggleSelection(scenario.id)}
          onDelete={() => onDeleteScenario(scenario.id)}
        />
      ))}
    </div>
  );
}

// ====================================================================
// SCENARIO CARD COMPONENT
// ====================================================================

interface ScenarioCardProps {
  scenario: any;
  isActive: boolean;
  isSelected: boolean;
  comparisonMode: boolean;
  onSelect: () => void;
  onToggleSelection: () => void;
  onDelete: () => void;
}

function ScenarioCard({
  scenario,
  isActive,
  isSelected,
  comparisonMode,
  onSelect,
  onToggleSelection,
  onDelete,
}: ScenarioCardProps) {
  const results = scenario.results;
  const riskLevel = results?.risk_assessment?.risk_level || "medium";

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle2 className="w-4 h-4" />;
      case "medium":
        return <AlertCircle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isActive ? "ring-2 ring-blue-500 bg-blue-50" : ""
      } ${isSelected ? "ring-2 ring-green-500" : ""} hover:shadow-md`}
      onClick={comparisonMode ? onToggleSelection : onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{scenario.name}</CardTitle>
            <CardDescription className="mt-1">{scenario.description}</CardDescription>
          </div>
          {comparisonMode && (
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? "bg-green-500 border-green-500" : "border-gray-300"
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        {results && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-green-50 rounded-md">
              <div className="text-sm text-muted-foreground">Lucro Total</div>
              <div className="font-semibold text-green-600">
                R$ {results.key_metrics?.total_profit?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm text-muted-foreground">Margem</div>
              <div className="font-semibold text-blue-600">
                {results.key_metrics?.profit_margin?.toFixed(1) || "0"}%
              </div>
            </div>
          </div>
        )}

        {/* Risk Badge */}
        <div className="flex justify-between items-center">
          <Badge className={`${getRiskColor(riskLevel)} border-0`}>
            {getRiskIcon(riskLevel)}
            <span className="ml-1 capitalize">
              Risco{" "}
              {riskLevel === "low"
                ? "Baixo"
                : riskLevel === "medium"
                  ? "Médio"
                  : riskLevel === "high"
                    ? "Alto"
                    : "Crítico"}
            </span>
          </Badge>

          {/* Confidence Level */}
          {results?.confidence_level && (
            <div className="text-sm text-muted-foreground">
              Confiança: {results.confidence_level}%
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!comparisonMode && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Analisar
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ====================================================================
// CREATE SCENARIO FORM
// ====================================================================

interface CreateScenarioFormProps {
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CreateScenarioForm({ userId, onSuccess, onError }: CreateScenarioFormProps) {
  const { createScenario } = useScenarioPlanning();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ScenarioParameters>>({
    name: "",
    description: "",
    projection_period: {
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    baseline_period: {
      start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createScenario(formData as ScenarioParameters, userId);
      if (result.success) {
        onSuccess();
      } else {
        onError(result.error || "Erro desconhecido");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Erro ao criar cenário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Criar Novo Cenário</DialogTitle>
        <DialogDescription>
          Configure os parâmetros para análise do novo cenário financeiro
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Nome do Cenário</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Expansão Q1 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o cenário que você deseja analisar..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.projection_period?.start_date || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projection_period: {
                      ...prev.projection_period!,
                      start_date: e.target.value,
                    },
                  }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="end-date">Data de Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.projection_period?.end_date || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projection_period: {
                      ...prev.projection_period!,
                      end_date: e.target.value,
                    },
                  }))
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onError("Cancelado")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Criando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Criar Cenário
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

// ====================================================================
// SCENARIO ANALYSIS COMPONENT
// ====================================================================

interface ScenarioAnalysisProps {
  scenario: any;
  isLoading: boolean;
  riskData: any;
}

function ScenarioAnalysis({ scenario, isLoading, riskData }: ScenarioAnalysisProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!scenario) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um cenário</h3>
          <p className="text-muted-foreground">
            Escolha um cenário na aba "Cenários" para ver a análise detalhada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {scenario.name}
            <Badge variant="secondary">Confiança: {scenario.results?.confidence_level || 0}%</Badge>
          </CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Lucro Total"
          value={`R$ ${scenario.results?.key_metrics?.total_profit?.toLocaleString() || "0"}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={scenario.results?.key_metrics?.revenue_growth_rate || 0}
          color="green"
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${scenario.results?.key_metrics?.profit_margin?.toFixed(1) || "0"}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend={0}
          color="blue"
        />
        <MetricCard
          title="Volatilidade"
          value={`${scenario.results?.key_metrics?.revenue_volatility?.toFixed(1) || "0"}%`}
          icon={<BarChart3 className="w-4 h-4" />}
          trend={0}
          color="yellow"
        />
        <MetricCard
          title="Score de Risco"
          value={`${riskData?.overall_risk_score?.toFixed(0) || "0"}`}
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={0}
          color="red"
        />
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scenario.results?.projected_cash_flow?.slice(0, 30) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString()}`, ""]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Receita"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      {riskData && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Probabilidade de Fluxo Negativo</Label>
                  <div className="flex items-center mt-2">
                    <Progress value={riskData.negative_flow_probability} className="flex-1 mr-3" />
                    <span className="text-sm font-medium">
                      {riskData.negative_flow_probability?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Risco de Volatilidade</Label>
                  <div className="flex items-center mt-2">
                    <Progress value={riskData.revenue_volatility_risk} className="flex-1 mr-3" />
                    <span className="text-sm font-medium">
                      {riskData.revenue_volatility_risk?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stress Test Results */}
              {riskData.stress_test_results && (
                <div>
                  <Label>Resultados do Teste de Stress</Label>
                  <div className="mt-2 space-y-2">
                    {riskData.stress_test_results.map((test: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{test.scenario_name}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Sobrevivência: {test.survival_probability?.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {test.negative_days} dias negativos
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {scenario.results?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scenario.results.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ====================================================================
// METRIC CARD COMPONENT
// ====================================================================

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  color: "green" | "blue" | "yellow" | "red";
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    yellow: "text-yellow-600 bg-yellow-100",
    red: "text-red-600 bg-red-100",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
        </div>
        {trend !== 0 && (
          <div className="mt-2 flex items-center">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ====================================================================
// PLACEHOLDER COMPONENTS
// ====================================================================

function ScenarioComparison({ scenarios, comparisonData }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Cenários</CardTitle>
        <CardDescription>Compare até 4 cenários lado a lado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            Selecione cenários na aba "Cenários" para comparar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionSupport({ selectedScenarios }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suporte à Decisão</CardTitle>
        <CardDescription>
          Análise inteligente para apoiar suas decisões estratégicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            Funcionalidade de suporte à decisão em desenvolvimento
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
