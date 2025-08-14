/**
 * Predictive Analytics Hooks for NeonPro Financial Intelligence
 * React hooks para integração com o Predictive Analytics Engine
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PredictiveAnalyticsEngine } from '../predictive-analytics';
import { 
  CashFlowPrediction,
  SeasonalTrend,
  RevenueForecast,
  DemandPrediction,
  PredictionAccuracy,
  PredictionModel,
  ModelTrainingData,
  ForecastPeriod
} from '../types/cash-flow';

// ====================================================================
// PREDICTIVE ANALYTICS HOOKS
// ====================================================================

/**
 * Hook para predições de cash flow
 */
export function useCashFlowPrediction(
  periodType: ForecastPeriod = 'monthly',
  daysAhead: number = 30,
  confidenceLevel: number = 0.85
) {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  const predictionQuery = useQuery({
    queryKey: ['cashFlowPrediction', periodType, daysAhead, confidenceLevel],
    queryFn: async (): Promise<CashFlowPrediction[]> => {
      const response = await engine.generateCashFlowPrediction(periodType, daysAhead, confidenceLevel);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  return {
    predictions: predictionQuery.data,
    isLoading: predictionQuery.isLoading,
    error: predictionQuery.error,
    refetch: predictionQuery.refetch,
  };
}

/**
 * Hook para análise de tendências sazonais
 */
export function useSeasonalTrends(years: number = 2) {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  const trendsQuery = useQuery({
    queryKey: ['seasonalTrends', years],
    queryFn: async (): Promise<SeasonalTrend[]> => {
      const response = await engine.analyzeSeasonalTrends(years);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    trends: trendsQuery.data,
    isLoading: trendsQuery.isLoading,
    error: trendsQuery.error,
    refetch: trendsQuery.refetch,
  };
}

/**
 * Hook para previsões de receita
 */
export function useRevenueForecast(daysAhead: number = 30) {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  const forecastQuery = useQuery({
    queryKey: ['revenueForecast', daysAhead],
    queryFn: async (): Promise<RevenueForecast[]> => {
      const response = await engine.generateRevenueForecast(daysAhead);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  return {
    forecast: forecastQuery.data,
    isLoading: forecastQuery.isLoading,
    error: forecastQuery.error,
    refetch: forecastQuery.refetch,
  };
}

/**
 * Hook para predição de demanda de tratamentos
 */
export function useTreatmentDemand(treatmentId?: string, daysAhead: number = 30) {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  const demandQuery = useQuery({
    queryKey: ['treatmentDemand', treatmentId, daysAhead],
    queryFn: async (): Promise<DemandPrediction[]> => {
      const response = await engine.predictTreatmentDemand(treatmentId, daysAhead);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  return {
    demand: demandQuery.data,
    isLoading: demandQuery.isLoading,
    error: demandQuery.error,
    refetch: demandQuery.refetch,
  };
}

/**
 * Hook para validação de precisão dos modelos
 */
export function usePredictionAccuracy(modelId: string, testPeriodDays: number = 30) {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  const accuracyQuery = useQuery({
    queryKey: ['predictionAccuracy', modelId, testPeriodDays],
    queryFn: async (): Promise<PredictionAccuracy> => {
      const response = await engine.validatePredictionAccuracy(modelId, testPeriodDays);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    accuracy: accuracyQuery.data,
    isLoading: accuracyQuery.isLoading,
    error: accuracyQuery.error,
    refetch: accuracyQuery.refetch,
  };
}

/**
 * Hook para treinamento de modelos
 */
export function useModelTraining() {
  const [engine] = useState(() => new PredictiveAnalyticsEngine());
  const queryClient = useQueryClient();

  const trainMutation = useMutation({
    mutationFn: async ({ modelId, trainingData }: { modelId: string; trainingData: ModelTrainingData[] }) => {
      const response = await engine.trainModel(modelId, trainingData);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['predictionAccuracy', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowPrediction'] });
      
      toast.success(`Modelo ${data.name} treinado com sucesso! Precisão: ${(data.accuracy * 100).toFixed(1)}%`);
    },
    onError: (error: Error) => {
      toast.error(`Erro no treinamento: ${error.message}`);
    }
  });

  return {
    trainModel: trainMutation.mutate,
    isTraining: trainMutation.isPending,
    trainingError: trainMutation.error,
  };
}

/**
 * Hook para análise de precisão em tempo real
 */
export function usePredictionMetrics() {
  const { predictions } = useCashFlowPrediction();
  const { forecast } = useRevenueForecast();
  const { trends } = useSeasonalTrends();

  const [metrics, setMetrics] = useState({
    totalPredictions: 0,
    averageConfidence: 0,
    highConfidencePredictions: 0,
    forecastAccuracy: 0,
    seasonalVariance: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    if (predictions && forecast && trends) {
      const totalPredictions = predictions.length;
      const averageConfidence = predictions.reduce((sum, p) => sum + p.confidence_level, 0) / totalPredictions;
      const highConfidencePredictions = predictions.filter(p => p.confidence_level >= 0.9).length;
      
      const forecastAccuracy = forecast.reduce((sum, f) => sum + f.confidence_level, 0) / forecast.length;
      
      const seasonalVariance = trends.reduce((sum, t) => sum + t.variance, 0) / trends.length;

      setMetrics({
        totalPredictions,
        averageConfidence,
        highConfidencePredictions,
        forecastAccuracy,
        seasonalVariance,
        lastUpdate: new Date()
      });
    }
  }, [predictions, forecast, trends]);

  return metrics;
}

/**
 * Hook para alertas de predições
 */
export function usePredictionAlerts() {
  const { predictions } = useCashFlowPrediction();
  const { forecast } = useRevenueForecast();
  
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    timestamp: Date;
    data: any;
  }>>([]);

  useEffect(() => {
    if (!predictions || !forecast) return;

    const newAlerts: typeof alerts = [];

    // Low confidence predictions alert
    const lowConfidencePredictions = predictions.filter(p => p.confidence_level < 0.7);
    if (lowConfidencePredictions.length > 0) {
      newAlerts.push({
        id: 'low-confidence-predictions',
        type: 'warning',
        message: `${lowConfidencePredictions.length} predições com baixa confiança (<70%)`,
        timestamp: new Date(),
        data: lowConfidencePredictions
      });
    }

    // Negative cash flow prediction alert
    const negativePredictions = predictions.filter(p => p.predicted_amount < 0);
    if (negativePredictions.length > 0) {
      newAlerts.push({
        id: 'negative-cash-flow-prediction',
        type: 'critical',
        message: `Previsto cash flow negativo em ${negativePredictions.length} dias`,
        timestamp: new Date(),
        data: negativePredictions
      });
    }

    // Low revenue forecast alert
    const totalForecastRevenue = forecast.reduce((sum, f) => sum + f.expected_revenue, 0);
    const avgDailyRevenue = totalForecastRevenue / forecast.length;
    
    if (avgDailyRevenue < 1000) { // Threshold can be configurable
      newAlerts.push({
        id: 'low-revenue-forecast',
        type: 'warning',
        message: `Previsão de receita baixa: R$ ${avgDailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia`,
        timestamp: new Date(),
        data: { avgDailyRevenue, totalForecastRevenue }
      });
    }

    // High variance in predictions alert
    const predictionVariance = predictions.reduce((sum, p) => {
      const range = p.upper_bound - p.lower_bound;
      return sum + range;
    }, 0) / predictions.length;

    if (predictionVariance > 5000) { // High uncertainty
      newAlerts.push({
        id: 'high-prediction-variance',
        type: 'info',
        message: `Alta incerteza nas predições (variância média: R$ ${predictionVariance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        timestamp: new Date(),
        data: { predictionVariance }
      });
    }

    setAlerts(newAlerts);
  }, [predictions, forecast]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    dismissAlert,
    hasAlerts: alerts.length > 0,
  };
}

/**
 * Hook para comparação de modelos
 */
export function useModelComparison(modelIds: string[]) {
  const [comparisons, setComparisons] = useState<PredictionAccuracy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const compareModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const engine = new PredictiveAnalyticsEngine();
      const results = await Promise.all(
        modelIds.map(modelId => 
          engine.validatePredictionAccuracy(modelId, 30)
            .then(response => response.success ? response.data : null)
        )
      );
      
      setComparisons(results.filter(result => result !== null) as PredictionAccuracy[]);
    } catch (error) {
      console.error('Model comparison failed:', error);
      toast.error('Erro na comparação de modelos');
    } finally {
      setIsLoading(false);
    }
  }, [modelIds]);

  useEffect(() => {
    if (modelIds.length > 0) {
      compareModels();
    }
  }, [modelIds, compareModels]);

  return {
    comparisons,
    isLoading,
    refetch: compareModels,
  };
}

/**
 * Hook para estatísticas de predição
 */
export function usePredictionStats() {
  const { predictions } = useCashFlowPrediction();
  const { forecast } = useRevenueForecast();
  const { trends } = useSeasonalTrends();

  const stats = {
    totalPredictions: predictions?.length || 0,
    averageConfidence: predictions ? 
      predictions.reduce((sum, p) => sum + p.confidence_level, 0) / predictions.length : 0,
    highConfidencePredictions: predictions ? 
      predictions.filter(p => p.confidence_level >= 0.9).length : 0,
    positiveOutlook: predictions ? 
      predictions.filter(p => p.predicted_amount > 0).length : 0,
    totalForecastRevenue: forecast ? 
      forecast.reduce((sum, f) => sum + f.expected_revenue, 0) : 0,
    seasonalTrends: trends?.length || 0,
    strongSeasonalTrends: trends ? 
      trends.filter(t => t.confidence > 0.8).length : 0,
  };

  return stats;
}

/**
 * Hook para configuração de predições
 */
export function usePredictionConfig() {
  const [config, setConfig] = useState({
    defaultDaysAhead: 30,
    defaultConfidenceLevel: 0.85,
    refreshInterval: 30, // minutes
    alertThresholds: {
      lowConfidence: 0.7,
      lowRevenue: 1000,
      highVariance: 5000
    }
  });

  const updateConfig = useCallback((newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Save to localStorage
    localStorage.setItem('neonpro-prediction-config', JSON.stringify({ ...config, ...newConfig }));
  }, [config]);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('neonpro-prediction-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load prediction config:', error);
      }
    }
  }, []);

  return {
    config,
    updateConfig,
  };
}