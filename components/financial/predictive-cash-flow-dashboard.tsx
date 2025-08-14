/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW DASHBOARD
 * =====================================================================================
 * 
 * Advanced UI for predictive cash flow analysis and scenario planning.
 * Real-time forecasting with interactive charts and scenario comparison.
 * 
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * 
 * Features:
 * - Real-time cash flow predictions
 * - Interactive forecasting charts
 * - Scenario planning and comparison
 * - Confidence interval visualization
 * - Model accuracy tracking
 * - Export and scheduling capabilities
 * =====================================================================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Calendar, BarChart3, Download, Settings, Plus, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type {
  CashFlowPrediction,
  ForecastingScenario,
  PredictionModel,
  PredictionPeriodType,
  ModelType,
  PredictionAccuracy,
} from '@/lib/types/predictive-cash-flow';

interface PredictiveCashFlowDashboardProps {
  clinicId: string;
}

export function PredictiveCashFlowDashboard({ clinicId }: PredictiveCashFlowDashboardProps) {
  // =====================================================================================
  // STATE MANAGEMENT
  // =====================================================================================

  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState<CashFlowPrediction[]>([]);
  const [scenarios, setScenarios] = useState<ForecastingScenario[]>([]);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<PredictionPeriodType>('monthly');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [forecastRange, setForecastRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months
  });

  // =====================================================================================
  // DATA LOADING
  // =====================================================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load predictions, scenarios, and models in parallel
      const [predictionsRes, scenariosRes, modelsRes] = await Promise.all([
        fetch(`/api/financial/predictive-cash-flow/predictions?clinicId=${clinicId}&limit=50`),
        fetch(`/api/financial/predictive-cash-flow/scenarios?clinicId=${clinicId}`),
        fetch(`/api/financial/predictive-cash-flow/models?active=true`),
      ]);

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData.predictions || []);
      }

      if (scenariosRes.ok) {
        const scenariosData = await scenariosRes.json();
        setScenarios(scenariosData.scenarios || []);
      }

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData.models || []);
        
        // Auto-select the best performing model
        const bestModel = modelsData.models?.find((m: PredictionModel) => m.is_production_ready) || modelsData.models?.[0];
        if (bestModel) {
          setSelectedModel(bestModel.id);
        }
      }

    } catch (error) {
      console.error('Error loading predictive data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados de previsão.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =====================================================================================
  // PREDICTION GENERATION
  // =====================================================================================

  const generatePrediction = async () => {
    if (!selectedModel) {
      toast({
        title: 'Modelo não selecionado',
        description: 'Selecione um modelo de previsão primeiro.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPredicting(true);

      const response = await fetch('/api/financial/predictive-cash-flow/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          modelId: selectedModel,
          periodType: selectedPeriod,
          startDate: forecastRange.startDate,
          endDate: forecastRange.endDate,
          scenarioId: selectedScenario || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prediction');
      }

      const result = await response.json();
      
      toast({
        title: 'Previsão gerada',
        description: `Previsão de fluxo de caixa gerada com ${result.prediction.confidence_score.toFixed(1)}% de confiança.`,
      });

      // Reload predictions
      await loadData();

    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: 'Erro na previsão',
        description: 'Não foi possível gerar a previsão de fluxo de caixa.',
        variant: 'destructive',
      });
    } finally {
      setPredicting(false);
    }
  };

  // =====================================================================================
  // CHART DATA PREPARATION
  // =====================================================================================

  const prepareChartData = () => {
    return predictions
      .filter(p => new Date(p.start_date) >= new Date(forecastRange.startDate))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .map(prediction => ({
        date: new Date(prediction.start_date).toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: '2-digit' 
        }),
        predicted: prediction.predicted_net_amount / 100, // Convert from cents
        inflow: prediction.predicted_inflow_amount / 100,
        outflow: -(prediction.predicted_outflow_amount / 100),
        confidence: prediction.confidence_score,
        confidenceLower: prediction.confidence_interval_lower / 100,
        confidenceUpper: prediction.confidence_interval_upper / 100,
      }));
  };

  const chartData = prepareChartData();

  // =====================================================================================
  // METRICS CALCULATION
  // =====================================================================================

  const calculateMetrics = () => {
    const recentPredictions = predictions.slice(0, 12); // Last 12 predictions
    
    if (recentPredictions.length === 0) {
      return {
        avgConfidence: 0,
        totalPredictedInflow: 0,
        totalPredictedOutflow: 0,
        totalPredictedNet: 0,
        trend: 'stable' as const,
        trendPercentage: 0,
      };
    }

    const avgConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence_score, 0) / recentPredictions.length;
    const totalPredictedInflow = recentPredictions.reduce((sum, p) => sum + p.predicted_inflow_amount, 0);
    const totalPredictedOutflow = recentPredictions.reduce((sum, p) => sum + p.predicted_outflow_amount, 0);
    const totalPredictedNet = recentPredictions.reduce((sum, p) => sum + p.predicted_net_amount, 0);

    // Calculate trend
    const firstHalf = recentPredictions.slice(recentPredictions.length / 2);
    const secondHalf = recentPredictions.slice(0, recentPredictions.length / 2);
    
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.predicted_net_amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.predicted_net_amount, 0) / secondHalf.length;
    
    const trendPercentage = firstAvg !== 0 ? ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
    const trend = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable';

    return {
      avgConfidence,
      totalPredictedInflow,
      totalPredictedOutflow,
      totalPredictedNet,
      trend,
      trendPercentage: Math.abs(trendPercentage),
    };
  };

  const metrics = calculateMetrics();

  // =====================================================================================
  // UI RENDERING
  // =====================================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados de previsão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise Preditiva de Fluxo de Caixa</h2>
          <p className="text-muted-foreground">
            Previsões inteligentes com IA e análise de cenários
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generatePrediction} disabled={predicting}>
            {predicting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Gerar Previsão
              </>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgConfidence.toFixed(1)}%</div>
            <Progress value={metrics.avgConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrada Prevista</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalPredictedInflow)}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 12 períodos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saída Prevista</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.totalPredictedOutflow)}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 12 períodos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Previsto</CardTitle>
            {metrics.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : metrics.trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Target className="h-4 w-4 text-blue-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.totalPredictedNet >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(metrics.totalPredictedNet)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Badge variant={metrics.trend === 'up' ? 'default' : metrics.trend === 'down' ? 'destructive' : 'secondary'}>
                {metrics.trend === 'up' ? '↗' : metrics.trend === 'down' ? '↘' : '→'} {metrics.trendPercentage.toFixed(1)}%
              </Badge>
              <span className="text-muted-foreground">tendência</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Previsão</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="accuracy">Precisão</TabsTrigger>
        </TabsList>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração da Previsão</CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar previsões de fluxo de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Modelo de IA</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.accuracy_rate?.toFixed(1)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period-select">Período</Label>
                  <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PredictionPeriodType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={forecastRange.startDate}
                    onChange={(e) => setForecastRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={forecastRange.endDate}
                    onChange={(e) => setForecastRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previsão de Fluxo de Caixa</CardTitle>
              <CardDescription>
                Visualização das previsões com intervalos de confiança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value * 100, true)} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value * 100),
                        name === 'predicted' ? 'Previsto' : 
                        name === 'inflow' ? 'Entrada' : 
                        name === 'outflow' ? 'Saída' : name
                      ]}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Legend />
                    
                    {/* Confidence interval */}
                    <Area
                      dataKey="confidenceUpper"
                      stroke="none"
                      fill="#60a5fa"
                      fillOpacity={0.1}
                      name="Intervalo Superior"
                    />
                    <Area
                      dataKey="confidenceLower"
                      stroke="none"
                      fill="#60a5fa"
                      fillOpacity={0.1}
                      name="Intervalo Inferior"
                    />
                    
                    {/* Cash flow bars */}
                    <Bar dataKey="inflow" fill="#10b981" name="Entrada" />
                    <Bar dataKey="outflow" fill="#ef4444" name="Saída" />
                    
                    {/* Prediction line */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                      name="Líquido Previsto"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previsões Recentes</CardTitle>
              <CardDescription>
                Histórico das últimas previsões geradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.slice(0, 5).map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(prediction.start_date).toLocaleDateString('pt-BR')} - {new Date(prediction.end_date).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge variant="outline">{prediction.period_type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Entrada: {formatCurrency(prediction.predicted_inflow_amount)} | 
                        Saída: {formatCurrency(prediction.predicted_outflow_amount)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`text-lg font-bold ${
                        prediction.predicted_net_amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(prediction.predicted_net_amount)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {prediction.confidence_score.toFixed(1)}% confiança
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {predictions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma previsão encontrada</p>
                    <p className="text-sm">Gere sua primeira previsão usando o botão acima</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise de Cenários</CardTitle>
              <CardDescription>
                Compare diferentes cenários de previsão financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade de cenários em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá criar e comparar diferentes cenários</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modelos de IA</CardTitle>
              <CardDescription>
                Gerencie e monitore os modelos de predição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{model.name}</h3>
                        <Badge variant={model.is_production_ready ? 'default' : 'secondary'}>
                          {model.is_production_ready ? 'Produção' : 'Desenvolvimento'}
                        </Badge>
                        {model.is_active && (
                          <Badge variant="outline">Ativo</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{model.accuracy_rate?.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Precisão</div>
                      </div>
                    </div>
                    
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div>Tipo: {model.model_type} | Algoritmo: {model.algorithm_type}</div>
                      <div>Versão: {model.version} | Última atualização: {new Date(model.last_trained).toLocaleDateString('pt-BR')}</div>
                      {model.description && <div>{model.description}</div>}
                    </div>
                    
                    <Progress value={model.accuracy_rate} className="mt-3" />
                  </div>
                ))}
                
                {models.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum modelo encontrado</p>
                    <p className="text-sm">Configure modelos de IA para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accuracy Tab */}
        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precisão dos Modelos</CardTitle>
              <CardDescription>
                Monitore a precisão e performance dos modelos de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dados de precisão em desenvolvimento</p>
                <p className="text-sm">Histórico de precisão será exibido após validações</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PredictiveCashFlowDashboard;