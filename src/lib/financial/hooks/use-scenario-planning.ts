/**
 * React Hooks for Scenario Planning & Financial Decision Support
 * Hooks para planejamento de cenários e suporte à decisão financeira
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScenarioPlanningEngine, FinancialDecisionSupport } from '../scenario-planning';
import { 
  FinancialScenario,
  ScenarioParameters,
  ScenarioResult,
  DecisionSupport,
  RiskAssessment 
} from '../types/cash-flow';

// ====================================================================
// SCENARIO PLANNING HOOKS
// ====================================================================

/**
 * Hook para gestão de cenários financeiros
 */
export const useScenarioPlanning = () => {
  const queryClient = useQueryClient();
  const scenarioEngine = new ScenarioPlanningEngine();
  
  // Estados locais
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  // Query para listar cenários do usuário
  const {
    data: scenarios = [],
    isLoading: isLoadingScenarios,
    error: scenariosError,
    refetch: refetchScenarios
  } = useQuery({
    queryKey: ['financial-scenarios'],
    queryFn: async () => {
      // Implementation would fetch from Supabase
      return [] as FinancialScenario[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation para criar novo cenário
  const createScenarioMutation = useMutation({
    mutationFn: async ({ parameters, userId }: { parameters: ScenarioParameters; userId: string }) => {
      const result = await scenarioEngine.createScenario(parameters, userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-scenarios'] });
    },
  });

  // Mutation para deletar cenário
  const deleteScenarioMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      // Implementation would delete from Supabase
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-scenarios'] });
      if (activeScenario && selectedScenarios.includes(activeScenario)) {
        setActiveScenario(null);
      }
      setSelectedScenarios(prev => prev.filter(id => id !== activeScenario));
    },
  });

  // Função para criar cenário
  const createScenario = useCallback(async (parameters: ScenarioParameters, userId: string) => {
    try {
      const result = await createScenarioMutation.mutateAsync({ parameters, userId });
      if (result) {
        setActiveScenario(result.id);
      }
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create scenario' 
      };
    }
  }, [createScenarioMutation]);

  // Função para deletar cenário
  const deleteScenario = useCallback(async (scenarioId: string) => {
    try {
      await deleteScenarioMutation.mutateAsync(scenarioId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete scenario' 
      };
    }
  }, [deleteScenarioMutation]);

  // Função para selecionar cenário ativo
  const selectScenario = useCallback((scenarioId: string) => {
    setActiveScenario(scenarioId);
  }, []);

  // Funções para modo de comparação
  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
    if (comparisonMode) {
      setSelectedScenarios([]);
    }
  }, [comparisonMode]);

  const toggleScenarioSelection = useCallback((scenarioId: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      }
      if (prev.length >= 4) { // Máximo 4 cenários para comparação
        return [...prev.slice(1), scenarioId];
      }
      return [...prev, scenarioId];
    });
  }, []);

  return {
    // Data
    scenarios,
    activeScenario,
    selectedScenarios,
    comparisonMode,
    
    // Loading states
    isLoadingScenarios,
    isCreatingScenario: createScenarioMutation.isPending,
    isDeletingScenario: deleteScenarioMutation.isPending,
    
    // Errors
    scenariosError,
    createError: createScenarioMutation.error,
    deleteError: deleteScenarioMutation.error,
    
    // Actions
    createScenario,
    deleteScenario,
    selectScenario,
    toggleComparisonMode,
    toggleScenarioSelection,
    refetchScenarios,
  };
};

/**
 * Hook para análise detalhada de cenário
 */
export const useScenarioAnalysis = (scenarioId: string | null) => {
  // Query para dados detalhados do cenário
  const {
    data: scenarioDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['scenario-details', scenarioId],
    queryFn: async () => {
      if (!scenarioId) return null;
      // Implementation would fetch detailed scenario data
      return null as FinancialScenario | null;
    },
    enabled: !!scenarioId,
    staleTime: 5 * 60 * 1000,
  });

  // Estados para análise
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'total_profit',
    'profit_margin',
    'revenue_volatility'
  ]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Função para alternar métricas selecionadas
  const toggleMetric = useCallback((metric: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  }, []);

  // Dados processados para visualização
  const chartData = scenarioDetails?.results ? 
    processChartData(scenarioDetails.results, selectedMetrics, timeRange) : 
    null;

  return {
    scenarioDetails,
    isLoadingDetails,
    detailsError,
    selectedMetrics,
    timeRange,
    chartType,
    chartData,
    toggleMetric,
    setTimeRange,
    setChartType,
  };
};

/**
 * Hook para comparação de cenários
 */
export const useScenarioComparison = (scenarioIds: string[]) => {
  // Query para dados de comparação
  const {
    data: comparisonData,
    isLoading: isLoadingComparison,
    error: comparisonError
  } = useQuery({
    queryKey: ['scenario-comparison', scenarioIds],
    queryFn: async () => {
      if (scenarioIds.length === 0) return null;
      // Implementation would fetch and process comparison data
      return null;
    },
    enabled: scenarioIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Estados para configuração da comparação
  const [comparisonMetrics, setComparisonMetrics] = useState<string[]>([
    'total_profit',
    'risk_score',
    'confidence_level'
  ]);
  const [visualizationType, setVisualizationType] = useState<'table' | 'chart' | 'radar'>('table');

  return {
    comparisonData,
    isLoadingComparison,
    comparisonError,
    comparisonMetrics,
    visualizationType,
    setComparisonMetrics,
    setVisualizationType,
  };
};

/**
 * Hook para suporte à decisão financeira
 */
export const useFinancialDecisionSupport = () => {
  const queryClient = useQueryClient();
  const decisionSupport = new FinancialDecisionSupport();
  
  // Estados para critérios de decisão
  const [decisionCriteria, setDecisionCriteria] = useState({
    risk_tolerance: 'medium' as 'low' | 'medium' | 'high',
    time_horizon: 'medium' as 'short' | 'medium' | 'long',
    priority: 'profit' as 'growth' | 'stability' | 'profit'
  });

  // Mutation para gerar análise de decisão
  const generateAnalysisMutation = useMutation({
    mutationFn: async (scenarioIds: string[]) => {
      const result = await decisionSupport.generateDecisionSupport(scenarioIds, decisionCriteria);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Função para gerar análise
  const generateAnalysis = useCallback(async (scenarioIds: string[]) => {
    try {
      const result = await generateAnalysisMutation.mutateAsync(scenarioIds);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate analysis' 
      };
    }
  }, [generateAnalysisMutation, decisionCriteria]);

  // Função para atualizar critérios
  const updateCriteria = useCallback((newCriteria: Partial<typeof decisionCriteria>) => {
    setDecisionCriteria(prev => ({ ...prev, ...newCriteria }));
  }, []);

  return {
    decisionCriteria,
    isGeneratingAnalysis: generateAnalysisMutation.isPending,
    analysisData: generateAnalysisMutation.data,
    analysisError: generateAnalysisMutation.error,
    generateAnalysis,
    updateCriteria,
  };
};

/**
 * Hook para otimização de cenários
 */
export const useScenarioOptimization = (scenarioId: string | null) => {
  const [optimizationOptions, setOptimizationOptions] = useState({
    target_metric: 'total_profit' as string,
    optimization_type: 'maximize' as 'maximize' | 'minimize' | 'target',
    target_value: 0,
    constraints: [] as Array<{ parameter: string; min?: number; max?: number; }>
  });

  // Mutation para executar otimização
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      if (!scenarioId) throw new Error('No scenario selected');
      // Implementation would run optimization algorithm
      return { optimized_parameters: {}, improvement_score: 15.5 };
    },
  });

  // Função para adicionar constraint
  const addConstraint = useCallback((constraint: { parameter: string; min?: number; max?: number; }) => {
    setOptimizationOptions(prev => ({
      ...prev,
      constraints: [...prev.constraints, constraint]
    }));
  }, []);

  // Função para remover constraint
  const removeConstraint = useCallback((index: number) => {
    setOptimizationOptions(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  }, []);

  // Função para executar otimização
  const runOptimization = useCallback(async () => {
    try {
      const result = await optimizeMutation.mutateAsync();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Optimization failed' 
      };
    }
  }, [optimizeMutation]);

  return {
    optimizationOptions,
    isOptimizing: optimizeMutation.isPending,
    optimizationResult: optimizeMutation.data,
    optimizationError: optimizeMutation.error,
    setOptimizationOptions,
    addConstraint,
    removeConstraint,
    runOptimization,
  };
};

/**
 * Hook para avaliação de riscos em tempo real
 */
export const useRiskAssessment = (scenarioId: string | null) => {
  const [riskThresholds, setRiskThresholds] = useState({
    revenue_volatility: 30,
    negative_flow_probability: 20,
    overall_risk_score: 50
  });

  // Query para dados de risco em tempo real
  const {
    data: riskData,
    isLoading: isLoadingRisk,
    error: riskError
  } = useQuery({
    queryKey: ['risk-assessment', scenarioId],
    queryFn: async () => {
      if (!scenarioId) return null;
      // Implementation would calculate real-time risk metrics
      return null as RiskAssessment | null;
    },
    enabled: !!scenarioId,
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time feel
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  // Calcula alertas de risco
  const riskAlerts = riskData ? calculateRiskAlerts(riskData, riskThresholds) : [];

  return {
    riskData,
    riskAlerts,
    riskThresholds,
    isLoadingRisk,
    riskError,
    setRiskThresholds,
  };
};

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

/**
 * Processa dados para visualização em gráficos
 */
function processChartData(
  scenarioResult: ScenarioResult,
  metrics: string[],
  timeRange: 'week' | 'month' | 'quarter'
) {
  if (!scenarioResult.projected_cash_flow) return null;

  const data = scenarioResult.projected_cash_flow;
  const groupedData = groupDataByTimeRange(data, timeRange);

  return {
    labels: groupedData.map(item => item.period),
    datasets: metrics.map(metric => ({
      label: formatMetricLabel(metric),
      data: groupedData.map(item => getMetricValue(item, metric)),
      borderColor: getMetricColor(metric),
      backgroundColor: getMetricColor(metric) + '20',
    }))
  };
}

/**
 * Agrupa dados por período de tempo
 */
function groupDataByTimeRange(
  data: Array<{ date: string; revenue: number; expenses: number; net_flow: number }>,
  timeRange: 'week' | 'month' | 'quarter'
) {
  // Implementation would group data by specified time range
  return [];
}

/**
 * Obtém valor da métrica para um item de dados
 */
function getMetricValue(item: any, metric: string): number {
  // Implementation would extract metric value
  return 0;
}

/**
 * Formata label da métrica para exibição
 */
function formatMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    'total_profit': 'Lucro Total',
    'profit_margin': 'Margem de Lucro (%)',
    'revenue_volatility': 'Volatilidade da Receita',
    'risk_score': 'Score de Risco'
  };
  return labels[metric] || metric;
}

/**
 * Obtém cor para métrica
 */
function getMetricColor(metric: string): string {
  const colors: Record<string, string> = {
    'total_profit': '#10B981',
    'profit_margin': '#3B82F6',
    'revenue_volatility': '#F59E0B',
    'risk_score': '#EF4444'
  };
  return colors[metric] || '#6B7280';
}

/**
 * Calcula alertas de risco baseados em thresholds
 */
function calculateRiskAlerts(riskData: RiskAssessment, thresholds: any) {
  const alerts = [];

  if (riskData.revenue_volatility_risk > thresholds.revenue_volatility) {
    alerts.push({
      type: 'warning',
      message: `Volatilidade de receita acima do limite (${riskData.revenue_volatility_risk.toFixed(1)}%)`
    });
  }

  if (riskData.negative_flow_probability > thresholds.negative_flow_probability) {
    alerts.push({
      type: 'danger',
      message: `Alta probabilidade de fluxo negativo (${riskData.negative_flow_probability.toFixed(1)}%)`
    });
  }

  if (riskData.overall_risk_score > thresholds.overall_risk_score) {
    alerts.push({
      type: 'danger',
      message: `Score de risco geral elevado (${riskData.overall_risk_score.toFixed(1)})`
    });
  }

  return alerts;
}