"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Download,
  Plus,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Alert, ForecastingModel, Prediction } from "@/app/types/predictive-analytics";
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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PredictiveAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [models, setModels] = useState<ForecastingModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [modelsRes, predictionsRes, alertsRes, accuracyRes, recommendationsRes] =
        await Promise.all([
          fetch("/api/predictive-analytics/models"),
          fetch("/api/predictive-analytics/predictions"),
          fetch("/api/predictive-analytics/alerts"),
          fetch("/api/predictive-analytics/accuracy/stats"),
          fetch("/api/predictive-analytics/recommendations"),
        ]);

      const [modelsData, predictionsData, alertsData, accuracyData, recommendationsData] =
        await Promise.all([
          modelsRes.json(),
          predictionsRes.json(),
          alertsRes.json(),
          accuracyRes.json(),
          recommendationsRes.json(),
        ]);

      setModels(modelsData.data || []);
      setPredictions(predictionsData.data || []);
      setAlerts(alertsData.data || []);
      setAccuracyStats(accuracyData);
      setRecommendations(recommendationsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "training":
        return "secondary";
      case "inactive":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Preditiva</h1>
          <p className="text-muted-foreground">
            Forecasting de demanda com IA para otimização de recursos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Modelo
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.filter((m) => m.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Total de modelos treinados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(accuracyStats.average_accuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Última avaliação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predições Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                predictions.filter(
                  (p) => new Date(p.prediction_date).toDateString() === new Date().toDateString(),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Geradas automaticamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Recomendações */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recomendações de Otimização
                </CardTitle>
                <CardDescription>Sugestões para melhorar a performance dos modelos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Ações sugeridas:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {rec.suggested_actions?.map((action: string, i: number) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modelos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Modelos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {models.slice(0, 5).map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(model.status)}>{model.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {model.accuracy_score
                          ? `${(model.accuracy_score * 100).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="training">Treinando</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Modelos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {models
              .filter(
                (model) =>
                  (statusFilter === "all" || model.status === statusFilter) &&
                  model.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>{model.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(model.status)}>{model.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p className="font-medium">{model.model_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precisão:</span>
                        <p className="font-medium">
                          {model.accuracy_score
                            ? `${(model.accuracy_score * 100).toFixed(1)}%`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última Atualização:</span>
                        <p className="font-medium">
                          {new Date(model.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Versão:</span>
                        <p className="font-medium">{model.version}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Métricas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predições Recentes</CardTitle>
              <CardDescription>Últimas predições geradas pelos modelos de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.slice(0, 10).map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">Predição #{prediction.id.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(prediction.prediction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{prediction.predicted_value}</p>
                      <p className="text-sm text-muted-foreground">
                        Confiança: {(prediction.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>Alertas de performance e qualidade dos modelos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getPriorityColor(alert.severity)}>{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Performance</CardTitle>
              <CardDescription>
                Análise detalhada da precisão e performance dos modelos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Estatísticas Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Precisão Média:</span>
                      <span className="font-medium">
                        {(accuracyStats.average_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Avaliações:</span>
                      <span className="font-medium">{accuracyStats.total_evaluations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Melhor Precisão:</span>
                      <span className="font-medium">
                        {(accuracyStats.best_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pior Precisão:</span>
                      <span className="font-medium">
                        {(accuracyStats.worst_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ações Disponíveis</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Relatório Completo
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Análise de Tendências
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Comparação de Modelos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
